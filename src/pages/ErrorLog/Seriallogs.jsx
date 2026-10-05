import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LogAssistant from "./LogAssistant";
import {
  ConfigProvider,
  theme as antdTheme,
  Table,
  Select,
  DatePicker,
  Input,
  Button,
  Drawer,
  Tooltip,
  Empty,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { getSerialLogs } from "../../Redux/Slices/ErrorLog/ErrorLogSlice";
import { Sparkles } from "lucide-react";

const LEVELS = ["Verbose", "Debug", "Information", "Warning", "Error", "Fatal"];

const LEVEL_STYLE = {
  Error: {
    dot: "bg-red-500",
    chip: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800",
  },
  Fatal: {
    dot: "bg-red-600",
    chip: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800",
  },
  Warning: {
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800",
  },
  Information: {
    dot: "bg-blue-500",
    chip: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
  },
  Debug: {
    dot: "bg-slate-400",
    chip: "bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  },
  Verbose: {
    dot: "bg-slate-300",
    chip: "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
  },
};

const AUTO_REFRESH_OPTIONS = [
  { value: 0, label: "Auto refresh: Off" },
  { value: 15, label: "Every 15 seconds" },
  { value: 30, label: "Every 30 seconds" },
  { value: 60, label: "Every 1 minute" },
];

// How long to wait after the user stops typing before filtering the table,
// so fast typing doesn't re-scan the whole log list on every keystroke.
const SEARCH_DEBOUNCE_MS = 250;

// A colored strip along the top of each card, using the app's active theme
// color (see index.css --primary) instead of a fixed color.
const CARD_TOP_BORDER = "border-t-[3px] border-t-[var(--primary)]";

// Hoisted out of the component so this CSS string isn't rebuilt on every render.
const TABLE_STYLES = `
  .log-table .ant-table-thead > tr > th {
    background: #f8fafc;
    font-weight: 600;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }
  .log-table .ant-table-tbody > tr > td { border-bottom: 1px solid #f1f5f9; }
  .log-table .row-error > td { background: #fef2f2; }
  .log-table .ant-table-tbody > tr:hover > td { background: #f8fafc !important; }

  .dark .log-table .ant-table-thead > tr > th {
    background: #0f172a;
    color: #cbd5e1;
    border-bottom: 1px solid #1e293b;
  }
  .dark .log-table .ant-table-tbody > tr > td { border-bottom: 1px solid #1e293b; }
  .dark .log-table .row-error > td { background: rgba(127, 29, 29, 0.25); }
  .dark .log-table .ant-table-tbody > tr:hover > td { background: #1e293b !important; }
`;

const levelStyle = (level) => LEVEL_STYLE[level] || LEVEL_STYLE.Debug;

const formatTime = (value) => (value ? dayjs(value).format("DD MMM YYYY, HH:mm:ss") : "—");

const parseProperties = (xml) => {
  if (!xml) return [];
  try {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    return Array.from(doc.querySelectorAll("properties > property")).map((node) => ({
      key: node.getAttribute("key"),
      value: (node.textContent || "").trim() || "—",
    }));
  } catch {
    return [];
  }
};

// Waits for a value to stop changing for `delayMs` before returning the new value.
// Used to delay search-filtering until the user pauses typing.
const useDebouncedValue = (value, delayMs) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
};

const LevelBadge = ({ level }) => {
  const style = levelStyle(level);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {level || "Unknown"}
    </span>
  );
};

const StatCard = ({ label, value, dot, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: index * 0.04 }}
    className={`rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 ${CARD_TOP_BORDER}`}
  >
    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {label}
    </div>
    <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
      {value}
    </div>
  </motion.div>
);

const Field = ({ label, children }) => (
  <div>
    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
    <div className="mt-0.5 break-all text-sm text-slate-800 dark:text-slate-200">{children || "—"}</div>
  </div>
);

// The filter bar (Plant Code, Level, Date Range, Search) as its own component,
// so the main page component only has to wire up state, not lay out a form.
const LogFilters = ({
  plantCode,
  onPlantCodeChange,
  level,
  onLevelChange,
  range,
  onRangeChange,
  search,
  onSearchChange,
  onApply,
  onReset,
  hasFilters,
}) => (
  <div
    className={`rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 ${CARD_TOP_BORDER}`}
  >
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
      <div className="xl:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
          Plant Code
        </label>
        <Input
          value={plantCode}
          allowClear
          placeholder="All plants"
          onChange={(e) => onPlantCodeChange(e.target.value)}
          onPressEnter={onApply}
        />
      </div>
      <div className="xl:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
          Level
        </label>
        <Select
          value={level}
          onChange={onLevelChange}
          allowClear
          placeholder="All levels"
          className="w-full"
          options={LEVELS.map((item) => ({ value: item, label: item }))}
        />
      </div>
      <div className="xl:col-span-4">
        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
          Date Range
        </label>
        <DatePicker.RangePicker
          value={range}
          onChange={onRangeChange}
          showTime={{ format: "HH:mm" }}
          format="DD MMM YYYY HH:mm"
          className="w-full"
        />
      </div>
      <div className="xl:col-span-4">
        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
          Search
        </label>
        <div className="flex gap-2">
          <Input.Search
            value={search}
            allowClear
            placeholder="Message, request path, correlation ID"
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Button onClick={onApply} type="primary">
            Apply
          </Button>
          <Button onClick={onReset} disabled={!hasFilters}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// The "view one log entry" side panel. Pulled out of the main component since
// it's a self-contained view with its own derived state (parsed properties).
const LogDetailsDrawer = ({ log, onClose }) => {
  const properties = useMemo(() => parseProperties(log?.properties), [log]);

  return (
    <Drawer
      width={680}
      open={Boolean(log)}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900 dark:text-slate-100">Log #{log?.id}</span>
          <LevelBadge level={log?.level} />
        </div>
      }
    >
      {log && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Timestamp">{formatTime(log.timeStamp)}</Field>
            <Field label="Plant Code">{log.plantCode}</Field>
            <Field label="Request Path">
              <span className="font-mono text-xs">{log.requestPath}</span>
            </Field>
            <Field label="Correlation ID">
              <span className="font-mono text-xs">{log.correlationId}</span>
            </Field>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Message
            </div>
            <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-800 dark:text-slate-200">
              {log.message}
            </pre>
            {log.messageTemplate && (
              <p className="mt-2 break-all font-mono text-xs text-slate-500 dark:text-slate-400">
                {log.messageTemplate}
              </p>
            )}
          </div>

          {log.exception && (
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                Exception
              </div>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 font-mono text-xs leading-relaxed text-red-800 dark:text-red-300">
                {log.exception}
              </pre>
            </div>
          )}

          {properties.length > 0 && (
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Properties
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                {properties.map((property) => (
                  <div key={property.key} className="grid grid-cols-3 gap-3 px-3 py-2">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {property.key}
                    </div>
                    <div className="col-span-2 max-h-24 overflow-auto break-all font-mono text-xs text-slate-800 dark:text-slate-200">
                      {property.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </Drawer>
  );
};

export default function SerialLogs() {
  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.global.isDark);
  const { logs, loading, error } = useSelector((state) => state.errorLog);
  const [selected, setSelected] = useState(null);
  const [askOpen, setAskOpen] = useState(false);

  const [plantCode, setPlantCode] = useState("");
  const [level, setLevel] = useState();
  const [range, setRange] = useState(null);
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(0);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const fetchLogs = useCallback(() => {
    dispatch(
      getSerialLogs({
        plantCode: plantCode.trim(),
        level,
        fromDate: range?.[0]?.format("YYYY-MM-DDTHH:mm:ss"),
        toDate: range?.[1]?.format("YYYY-MM-DDTHH:mm:ss"),
      })
    );
  }, [dispatch, plantCode, level, range]);

  // Load once on mount.
  useEffect(() => {
    fetchLogs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-arm the auto-refresh timer whenever the interval or the active filters change.
  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = setInterval(fetchLogs, autoRefresh * 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchLogs]);

  const rows = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter((log) =>
      [log.message, log.requestPath, log.correlationId, log.plantCode, log.exception]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    );
  }, [logs, debouncedSearch]);

  const counts = useMemo(
    () =>
      rows.reduce(
        (acc, log) => {
          if (log.level === "Error" || log.level === "Fatal") acc.error += 1;
          else if (log.level === "Warning") acc.warning += 1;
          else acc.info += 1;
          return acc;
        },
        { error: 0, warning: 0, info: 0 }
      ),
    [rows]
  );

  const resetFilters = () => {
    setPlantCode("");
    setLevel(undefined);
    setRange(null);
    setSearch("");
  };

  const hasFilters = Boolean(plantCode || level || range || search);

  // Columns don't depend on any state that changes per render, so build the
  // array once instead of recreating it (and every cell's render function) on
  // every keystroke/re-render.
  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        width: 80,
        render: (id) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{id}</span>,
      },
      {
        title: "Timestamp",
        dataIndex: "timeStamp",
        width: 190,
        sorter: (a, b) => new Date(a.timeStamp) - new Date(b.timeStamp),
        defaultSortOrder: "descend",
        render: (value) => (
          <span className="whitespace-nowrap text-slate-700 dark:text-slate-300">{formatTime(value)}</span>
        ),
      },
      {
        title: "Level",
        dataIndex: "level",
        width: 130,
        render: (value) => <LevelBadge level={value} />,
      },
      {
        title: "Message",
        dataIndex: "message",
        width: 460,
        render: (value, record) => (
          <Tooltip title={value?.length > 160 ? `${value.slice(0, 400)}…` : value} placement="topLeft">
            <div className="truncate text-slate-800 dark:text-slate-200">{value}</div>
            {record.exception && (
              <div className="mt-0.5 truncate font-mono text-xs text-red-600 dark:text-red-400">
                {record.exception.split("\n")[0]}
              </div>
            )}
          </Tooltip>
        ),
      },
      {
        title: "Request Path",
        dataIndex: "requestPath",
        width: 240,
        render: (value) => (
          <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{value || "—"}</span>
        ),
      },
      {
        title: "Plant",
        dataIndex: "plantCode",
        width: 110,
        render: (value) => value || "—",
      },
      {
        title: "",
        key: "action",
        width: 80,
        fixed: "right",
        render: (_, record) => (
          <Button type="link" size="small" className="px-0" onClick={() => setSelected(record)}>
            Details
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <ConfigProvider theme={{ algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6">
        <style>{TABLE_STYLES}</style>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mx-auto max-w-[1600px] space-y-4"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Serial Logs
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Application events captured across plants and services.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={autoRefresh}
                onChange={setAutoRefresh}
                style={{ width: 150 }}
                options={AUTO_REFRESH_OPTIONS}
              />
              <Button onClick={() => setAskOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Ask
              </Button>
              <Button type="primary" icon={<ReloadOutlined />} loading={loading} onClick={fetchLogs}>
                Refresh
              </Button>
            </div>
          </div>

          <LogFilters
            plantCode={plantCode}
            onPlantCodeChange={setPlantCode}
            level={level}
            onLevelChange={setLevel}
            range={range}
            onRangeChange={setRange}
            search={search}
            onSearchChange={setSearch}
            onApply={fetchLogs}
            onReset={resetFilters}
            hasFilters={hasFilters}
          />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard index={0} label="Total records" value={rows.length} />
            <StatCard index={1} label="Errors" value={counts.error} dot="bg-red-500" />
            <StatCard index={2} label="Warnings" value={counts.warning} dot="bg-amber-500" />
            <StatCard index={3} label="Informational" value={counts.info} dot="bg-blue-500" />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div
            className={`overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${CARD_TOP_BORDER}`}
          >
            <Table
              className="log-table"
              size="small"
              rowKey="id"
              columns={columns}
              dataSource={rows}
              loading={loading}
              scroll={{ x: 1290, y: 520 }}
              onRow={(record) => ({
                onClick: () => setSelected(record),
                className: `cursor-pointer ${
                  record.level === "Error" || record.level === "Fatal" ? "row-error" : ""
                }`,
              })}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {hasFilters ? "No logs match the current filters." : "No logs recorded yet."}
                      </span>
                    }
                  />
                ),
              }}
              pagination={{
                defaultPageSize: 25,
                pageSizeOptions: [25, 50, 100, 200],
                showSizeChanger: true,
                size: "default",
                showTotal: (total, r) => `${r[0]}–${r[1]} of ${total} logs`,
              }}
            />
          </div>
        </motion.div>

        <LogDetailsDrawer log={selected} onClose={() => setSelected(null)} />
        <LogAssistant
          open={askOpen}
          onClose={() => setAskOpen(false)}
          logs={rows}
          scopeLabel={hasFilters ? "matching current filters" : "in the current log set"}
          onOpenLog={(id) => {
            setAskOpen(false);
            setSelected(logs.find((log) => log.id === id));
          }}
        />
      </div>
    </ConfigProvider>
  );
}
