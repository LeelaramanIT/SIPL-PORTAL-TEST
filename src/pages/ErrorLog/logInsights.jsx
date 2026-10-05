import dayjs from "dayjs";

/**
 * Answers predefined questions about a set of Serilog entries.
 *
 * Every answer is computed locally from the logs already loaded in Redux —
 * there is no network call and no language model, so the numbers are always
 * exactly what is in the table the user is looking at.
 *
 * Each question returns:
 *   {
 *     headline: string,                                   // one-line conclusion
 *     stats?:  [{ label, value, tone }],                  // small tiles
 *     items?:  [{ title, subtitle, value, tone, logId }], // ranked list
 *     note?:   string,                                    // caveat or next step
 *   }
 */

// Serilog request line: HTTP "GET" "/api/SerialLog/GetLogs" responded 200 in 514.1430 ms
const HTTP_LINE = /HTTP "(\w+)" "([^"]+)" responded (\d{3}) in ([\d.]+) ms/;

const ERROR_LEVELS = ["Error", "Fatal"];

const TONE = {
  critical: "critical",
  warning: "warning",
  info: "info",
  neutral: "neutral",
  good: "good",
};

const isError = (log) => ERROR_LEVELS.includes(log.level);

const formatMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`);

const percent = (part, total) => (total ? `${Math.round((part / total) * 100)}%` : "0%");

const timeOf = (log) => dayjs(log.timeStamp);

// Groups items by a key and returns the largest buckets first.
const rank = (items, keyFn, limit = 6) => {
  const buckets = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (key == null) return;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count += 1;
      bucket.entries.push(item);
    } else {
      buckets.set(key, { key, count: 1, entries: [item] });
    }
  });
  return Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// First meaningful line of a .NET exception, without the stack trace.
const exceptionSummary = (exception) => {
  const firstLine = String(exception).split("\n")[0].trim();
  return firstLine.length > 180 ? `${firstLine.slice(0, 180)}…` : firstLine;
};

const groupKey = (log) => log.messageTemplate || log.message;

const statusTone = (status) => {
  if (status >= 500) return TONE.critical;
  if (status === 401 || status === 403) return TONE.warning;
  if (status >= 400) return TONE.warning;
  return TONE.good;
};

/**
 * Extracts every HTTP request from the log set once, so the performance and
 * traffic questions don't each have to re-scan and re-parse the messages.
 */
export const parseRequests = (logs) =>
  logs.reduce((requests, log) => {
    const match = HTTP_LINE.exec(log.message || "");
    if (match) {
      requests.push({
        logId: log.id,
        method: match[1],
        path: match[2],
        status: Number(match[3]),
        elapsed: Number(match[4]),
        timeStamp: log.timeStamp,
      });
    }
    return requests;
  }, []);

const emptyAnswer = (headline, note) => ({ headline, note });

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

const overview = ({ logs, requests }) => {
  if (!logs.length) return emptyAnswer("There are no logs in the current view.");

  const errors = logs.filter(isError);
  const warnings = logs.filter((log) => log.level === "Warning");
  const failed = requests.filter((request) => request.status >= 400);
  const times = logs.map(timeOf).sort((a, b) => a - b);
  const span = `${times[0].format("DD MMM HH:mm")} → ${times[times.length - 1].format("DD MMM HH:mm")}`;

  const headline = errors.length
    ? `${errors.length} error${errors.length === 1 ? "" : "s"} across ${logs.length} log entries.`
    : `No errors across ${logs.length} log entries.`;

  return {
    headline,
    stats: [
      { label: "Errors", value: errors.length, tone: errors.length ? TONE.critical : TONE.good },
      { label: "Warnings", value: warnings.length, tone: warnings.length ? TONE.warning : TONE.good },
      { label: "Requests", value: requests.length, tone: TONE.neutral },
      {
        label: "Failed requests",
        value: requests.length ? percent(failed.length, requests.length) : "—",
        tone: failed.length ? TONE.warning : TONE.good,
      },
    ],
    items: errors.slice(0, 5).map((log) => ({
      title: exceptionSummary(log.exception || log.message),
      subtitle: log.requestPath || "No request path",
      value: timeOf(log).format("HH:mm:ss"),
      tone: TONE.critical,
      logId: log.id,
    })),
    note: `Covering ${span}.`,
  };
};

const recentActivity = ({ logs }) => {
  if (!logs.length) return emptyAnswer("There are no logs in the current view.");

  const recent = [...logs].sort((a, b) => timeOf(b) - timeOf(a)).slice(0, 10);

  return {
    headline: `Most recent entry: ${timeOf(recent[0]).format("DD MMM YYYY, HH:mm:ss")}.`,
    items: recent.map((log) => ({
      title: log.message,
      subtitle: log.requestPath || log.level,
      value: timeOf(log).format("HH:mm:ss"),
      tone: isError(log) ? TONE.critical : log.level === "Warning" ? TONE.warning : TONE.neutral,
      logId: log.id,
    })),
  };
};

const noisiestMessages = ({ logs }) => {
  if (!logs.length) return emptyAnswer("There are no logs in the current view.");

  const ranked = rank(logs, groupKey, 6);
  const top = ranked[0];

  return {
    headline: `The most repeated entry accounts for ${percent(top.count, logs.length)} of this log set.`,
    items: ranked.map((bucket) => ({
      title: bucket.entries[0].message,
      subtitle: `${bucket.entries[0].level} · ${percent(bucket.count, logs.length)} of all entries`,
      value: `${bucket.count}×`,
      tone: isError(bucket.entries[0]) ? TONE.critical : TONE.neutral,
      logId: bucket.entries[0].id,
    })),
    note: "High-volume repeats are usually configuration noise. Silencing them makes real problems easier to see.",
  };
};

const errorBreakdown = ({ logs }) => {
  const errors = logs.filter(isError);
  if (!errors.length) return emptyAnswer("No errors were logged in the current view.");

  const ranked = rank(errors, groupKey, 8);

  return {
    headline: `${errors.length} error${errors.length === 1 ? "" : "s"} across ${ranked.length} distinct cause${
      ranked.length === 1 ? "" : "s"
    }.`,
    items: ranked.map((bucket) => {
      const sample = bucket.entries[0];
      return {
        title: sample.exception ? exceptionSummary(sample.exception) : sample.message,
        subtitle: `${sample.requestPath || "No request path"} · last seen ${timeOf(
          bucket.entries[bucket.entries.length - 1]
        ).format("DD MMM HH:mm")}`,
        value: `${bucket.count}×`,
        tone: TONE.critical,
        logId: sample.id,
      };
    }),
  };
};

const exceptionBreakdown = ({ logs }) => {
  const thrown = logs.filter((log) => log.exception);
  if (!thrown.length) return emptyAnswer("No exceptions were recorded in the current view.");

  const ranked = rank(thrown, (log) => exceptionSummary(log.exception), 8);

  return {
    headline: `${thrown.length} log entr${thrown.length === 1 ? "y carries" : "ies carry"} a stack trace, from ${
      ranked.length
    } distinct exception${ranked.length === 1 ? "" : "s"}.`,
    items: ranked.map((bucket) => ({
      title: bucket.key,
      subtitle: `${bucket.entries[0].requestPath || "No request path"} · ${bucket.entries[0].level}`,
      value: `${bucket.count}×`,
      tone: TONE.critical,
      logId: bucket.entries[0].id,
    })),
    note: "Retry policies log the same exception once per attempt, so a single failure can appear several times here.",
  };
};

const failingEndpoints = ({ requests }) => {
  const failed = requests.filter((request) => request.status >= 400);
  if (!failed.length) {
    return emptyAnswer(
      requests.length
        ? `All ${requests.length} requests in this view returned a success status.`
        : "No HTTP requests were found in the current view."
    );
  }

  const ranked = rank(failed, (request) => request.path, 8);

  return {
    headline: `${failed.length} of ${requests.length} requests failed (${percent(
      failed.length,
      requests.length
    )}).`,
    items: ranked.map((bucket) => {
      const statuses = rank(bucket.entries, (request) => request.status, 4)
        .map((status) => `${status.key}×${status.count}`)
        .join(", ");
      return {
        title: bucket.key,
        subtitle: `Status ${statuses}`,
        value: `${bucket.count}×`,
        tone: statusTone(Math.max(...bucket.entries.map((request) => request.status))),
        logId: bucket.entries[0].logId,
      };
    }),
  };
};

const authFailures = ({ requests }) => {
  const denied = requests.filter((request) => request.status === 401 || request.status === 403);
  if (!denied.length) return emptyAnswer("No authentication or authorization failures in the current view.");

  const logins = requests.filter((request) => /\/api\/Auth\//i.test(request.path)).length;
  const ranked = rank(denied, (request) => request.path, 6);

  return {
    headline: `${denied.length} request${denied.length === 1 ? " was" : "s were"} rejected as unauthenticated or forbidden.`,
    items: ranked.map((bucket) => ({
      title: bucket.key,
      subtitle: `${bucket.entries[0].status === 403 ? "Forbidden" : "Unauthorized"} · first at ${dayjs(
        bucket.entries[0].timeStamp
      ).format("DD MMM HH:mm")}`,
      value: `${bucket.count}×`,
      tone: TONE.warning,
      logId: bucket.entries[0].logId,
    })),
    note: `${logins} authentication call${logins === 1 ? "" : "s"} were made in the same window. Repeated 401s usually mean an expired or missing bearer token.`,
  };
};

const affectedPlants = ({ logs }) => {
  const tagged = logs.filter((log) => log.plantCode);
  if (!tagged.length) return emptyAnswer("No log entries in this view carry a plant code.");

  const ranked = rank(tagged, (log) => log.plantCode, 8);

  return {
    headline: `${ranked.length} plant code${ranked.length === 1 ? "" : "s"} appear in this log set.`,
    items: ranked.map((bucket) => {
      const errors = bucket.entries.filter(isError).length;
      return {
        title: bucket.key,
        subtitle: `${errors} error${errors === 1 ? "" : "s"} of ${bucket.count} entries`,
        value: `${bucket.count}×`,
        tone: errors ? TONE.critical : TONE.neutral,
        logId: bucket.entries[0].id,
      };
    }),
    note: 'A plant code of "UNKNOWN" means the request completed without a resolved plant context.',
  };
};

const errorTimeline = ({ logs }) => {
  const problems = logs.filter((log) => isError(log) || log.level === "Warning");
  if (!problems.length) return emptyAnswer("No errors or warnings to plot in the current view.");

  // Bucket by hour. The key is an ISO timestamp so it can be re-parsed by
  // dayjs without needing the customParseFormat plugin.
  const ranked = rank(problems, (log) => timeOf(log).startOf("hour").toISOString(), 8);
  const peak = ranked[0];

  return {
    headline: `The busiest hour for problems was ${dayjs(peak.key).format("DD MMM, HH:00")} with ${
      peak.count
    } entries.`,
    items: ranked.map((bucket) => {
      const errors = bucket.entries.filter(isError).length;
      return {
        title: dayjs(bucket.key).format("DD MMM YYYY, HH:00"),
        subtitle: `${errors} error${errors === 1 ? "" : "s"} · ${bucket.count - errors} warning${
          bucket.count - errors === 1 ? "" : "s"
        }`,
        value: `${bucket.count}×`,
        tone: errors ? TONE.critical : TONE.warning,
        logId: bucket.entries[0].id,
      };
    }),
  };
};

const slowestRequests = ({ requests }) => {
  if (!requests.length) return emptyAnswer("No HTTP requests were found in the current view.");

  const slowest = [...requests].sort((a, b) => b.elapsed - a.elapsed).slice(0, 8);
  const average = requests.reduce((sum, request) => sum + request.elapsed, 0) / requests.length;

  return {
    headline: `Slowest request took ${formatMs(slowest[0].elapsed)}; the average is ${formatMs(average)}.`,
    items: slowest.map((request) => ({
      title: `${request.method} ${request.path}`,
      subtitle: `Status ${request.status} · ${dayjs(request.timeStamp).format("DD MMM HH:mm:ss")}`,
      value: formatMs(request.elapsed),
      tone: request.elapsed > 5000 ? TONE.critical : request.elapsed > 1000 ? TONE.warning : TONE.neutral,
      logId: request.logId,
    })),
    note: "The first call after an application restart is slow by nature — it pays the cost of building the EF model and warming the connection pool.",
  };
};

const busiestEndpoints = ({ requests }) => {
  if (!requests.length) return emptyAnswer("No HTTP requests were found in the current view.");

  const ranked = rank(requests, (request) => request.path, 8);

  return {
    headline: `${requests.length} requests across ${
      new Set(requests.map((request) => request.path)).size
    } endpoints.`,
    items: ranked.map((bucket) => {
      const average =
        bucket.entries.reduce((sum, request) => sum + request.elapsed, 0) / bucket.entries.length;
      const failures = bucket.entries.filter((request) => request.status >= 400).length;
      return {
        title: bucket.key,
        subtitle: `Average ${formatMs(average)}${failures ? ` · ${failures} failed` : ""}`,
        value: `${bucket.count}×`,
        tone: failures ? TONE.warning : TONE.neutral,
        logId: bucket.entries[0].logId,
      };
    }),
  };
};

/* ------------------------------------------------------------------ */
/* Question catalogue                                                  */
/* ------------------------------------------------------------------ */

export const QUESTION_GROUPS = [
  {
    category: "Overview",
    questions: [
      { id: "overview", label: "How healthy is the system right now?", run: overview },
      { id: "recent", label: "What happened most recently?", run: recentActivity },
      { id: "noisiest", label: "What is flooding the logs?", run: noisiestMessages },
    ],
  },
  {
    category: "Errors & failures",
    questions: [
      { id: "errors", label: "What errors occurred, and why?", run: errorBreakdown },
      { id: "exceptions", label: "Which exceptions are being thrown?", run: exceptionBreakdown },
      { id: "failing", label: "Which endpoints are failing?", run: failingEndpoints },
      { id: "auth", label: "Are there authentication failures?", run: authFailures },
      { id: "timeline", label: "When did problems spike?", run: errorTimeline },
      { id: "plants", label: "Which plants are affected?", run: affectedPlants },
    ],
  },
  {
    category: "Performance",
    questions: [
      { id: "slowest", label: "Which requests are slowest?", run: slowestRequests },
      { id: "busiest", label: "Which endpoints get the most traffic?", run: busiestEndpoints },
    ],
  },
];

export const QUESTIONS = QUESTION_GROUPS.flatMap((group) => group.questions);

/**
 * Runs one question against a log set. `logs` should be the rows currently
 * visible to the user so the answer matches what is on screen.
 */
export const answerQuestion = (questionId, logs) => {
  const question = QUESTIONS.find((item) => item.id === questionId);
  if (!question) return null;

  const safeLogs = Array.isArray(logs) ? logs : [];
  try {
    return question.run({ logs: safeLogs, requests: parseRequests(safeLogs) });
  } catch {
    return emptyAnswer("That answer could not be calculated from the current log set.");
  }
};

/** Plain-text version of an answer, for copying into a ticket or chat. */
export const answerToText = (question, answer) => {
  if (!answer) return "";
  const lines = [question, "", answer.headline];
  if (answer.stats?.length) {
    lines.push("", answer.stats.map((stat) => `${stat.label}: ${stat.value}`).join("  |  "));
  }
  if (answer.items?.length) {
    lines.push("");
    answer.items.forEach((item) => {
      lines.push(`- ${item.value}  ${item.title}`);
      if (item.subtitle) lines.push(`    ${item.subtitle}`);
    });
  }
  if (answer.note) lines.push("", answer.note);
  return lines.join("\n");
};