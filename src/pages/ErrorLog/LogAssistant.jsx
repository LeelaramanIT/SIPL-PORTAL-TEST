import { useEffect, useMemo, useState } from "react";
import { Drawer, Button, Tooltip, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTION_GROUPS, QUESTIONS, answerQuestion, answerToText } from "./logInsights";

const TONE_STYLE = {
  critical: {
    chip: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800",
    bar: "bg-red-500",
  },
  warning: {
    chip: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800",
    bar: "bg-amber-500",
  },
  info: {
    chip: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
    bar: "bg-blue-500",
  },
  good: {
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800",
    bar: "bg-emerald-500",
  },
  neutral: {
    chip: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
    bar: "bg-slate-400",
  },
};

const toneStyle = (tone) => TONE_STYLE[tone] || TONE_STYLE.neutral;

const QuestionChip = ({ question, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(question.id)}
    className={`rounded-full border px-3 py-1.5 text-left text-xs transition-colors ${
      active
        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    }`}
  >
    {question.label}
  </button>
);

const AnswerStat = ({ stat }) => (
  <div className="rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
    <div className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-slate-100">{stat.value}</div>
  </div>
);

const AnswerItem = ({ item, index, onOpenLog }) => {
  const tone = toneStyle(item.tone);
  const clickable = Boolean(item.logId && onOpenLog);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.025 }}
      onClick={clickable ? () => onOpenLog(item.logId) : undefined}
      className={`flex gap-3 border-b border-slate-100 px-3 py-2.5 last:border-0 dark:border-slate-800 ${
        clickable ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60" : ""
      }`}
    >
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${tone.bar}`} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-slate-800 dark:text-slate-200" title={item.title}>
          {item.title}
        </div>
        {item.subtitle && (
          <div className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</div>
        )}
      </div>
      <span
        className={`h-fit shrink-0 rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone.chip}`}
      >
        {item.value}
      </span>
    </motion.div>
  );
};

/**
 * Predefined questions answered from the logs currently on screen.
 *
 * Answers are computed locally by logInsights.js — nothing is sent anywhere,
 * so figures always match the table and there is no per-question cost.
 */
export default function LogAssistant({ open, onClose, logs, scopeLabel, onOpenLog }) {
  const [questionId, setQuestionId] = useState(null);

  // Clear the previous answer when the panel is reopened, so a stale answer
  // from an older filter set is never shown next to new data.
  useEffect(() => {
    if (!open) setQuestionId(null);
  }, [open]);

  const question = useMemo(() => QUESTIONS.find((item) => item.id === questionId), [questionId]);
  const answer = useMemo(() => (questionId ? answerQuestion(questionId, logs) : null), [questionId, logs]);

  const copyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(answerToText(question.label, answer));
      message.success("Answer copied");
    } catch {
      message.error("Could not copy to clipboard");
    }
  };

  return (
    <Drawer
      width={620}
      open={open}
      onClose={onClose}
      title={
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">Ask about these logs</div>
          <div className="mt-0.5 text-xs font-normal text-slate-500 dark:text-slate-400">
            {logs.length} {logs.length === 1 ? "entry" : "entries"} {scopeLabel}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {QUESTION_GROUPS.map((group) => (
          <div key={group.category}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {group.category}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.questions.map((item) => (
                <QuestionChip
                  key={item.id}
                  question={item}
                  active={item.id === questionId}
                  onSelect={setQuestionId}
                />
              ))}
            </div>
          </div>
        ))}

        <AnimatePresence mode="wait">
          {answer && (
            <motion.div
              key={questionId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {question.label}
                  </div>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                    {answer.headline}
                  </p>
                </div>
                <Tooltip title="Copy as text">
                  <Button size="small" onClick={copyAnswer}>
                    Copy
                  </Button>
                </Tooltip>
              </div>

              {answer.stats?.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {answer.stats.map((stat) => (
                    <AnswerStat key={stat.label} stat={stat} />
                  ))}
                </div>
              )}

              {answer.items?.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
                  {answer.items.map((item, index) => (
                    <AnswerItem
                      key={`${item.title}-${index}`}
                      item={item}
                      index={index}
                      onOpenLog={onOpenLog}
                    />
                  ))}
                </div>
              )}

              {answer.note && (
                <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {answer.note}
                </p>
              )}

              {answer.items?.length > 0 && onOpenLog && (
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Select any row to open the full log entry.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!answer && (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Choose a question to see an answer calculated from the logs currently in view.
          </div>
        )}
      </div>
    </Drawer>
  );
}