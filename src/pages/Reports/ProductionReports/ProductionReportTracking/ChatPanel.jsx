import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Sparkles, X, Send, RotateCcw, Bot, User, AlertTriangle,
  Factory, Users, CalendarClock, PieChart as PieIcon,
} from "lucide-react";
import { getStatusColor, statusLabel, isDelayed, fmt, formatDate, StatusChip } from "./shared";

const SUGGESTED_PROMPTS = [
  { icon: AlertTriangle, text: "Which work orders are delayed?" },
  { icon: PieIcon, text: "Show status breakdown of all orders" },
  { icon: Factory, text: "Plant-wise production performance" },
  { icon: Users, text: "Top customers by order volume" },
  { icon: CalendarClock, text: "Delivery schedule for the next few weeks" },
];

const tooltipStyle = {
  contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, boxShadow: "var(--shadow-lift)" },
  labelStyle: { color: "var(--tp)", fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "var(--ts)" },
};
const axisProps = { tick: { fontSize: 10, fill: "var(--tt)" }, axisLine: false, tickLine: false };

function weekStart(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - weekday);
  return date.toISOString().slice(0, 10);
}

// Minimal inline markdown: **bold** and newlines. No external dep needed for this vocabulary.
function Markdown({ text }) {
  const lines = (text ?? "").split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        return (
          <p key={i} className={i > 0 ? "mt-1.5" : ""}>
            {parts.map((part, j) =>
              part.startsWith("**") ? (
                <strong key={j} className="font-semibold text-[var(--tp)]">{part.slice(2, -2)}</strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </p>
        );
      })}
    </>
  );
}

function MiniKpi({ label, value, tone }) {
  return (
    <div className="min-w-[104px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--tt)]">{label}</div>
      <div
        className="mt-0.5 font-mono text-[16px] font-bold tabular-nums"
        style={{ color: tone || "var(--tp)" }}
      >
        {value}
      </div>
    </div>
  );
}

function DonutChart({ data }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={42} outerRadius={62} paddingAngle={3} stroke="none">
            {data.map((entry) => <Cell key={entry.key} fill={entry.color} />)}
          </Pie>
          <Tooltip {...tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--ts)]">
        {data.map((entry) => (
          <span key={entry.key} className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
            {entry.name} <b className="text-[var(--tp)]">{entry.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function BarComparisonChart({ data, xKey }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--hover)" }} formatter={(v) => fmt(v)} />
        <Bar dataKey="ordered" name="Ordered" fill="var(--border)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="produced" name="Produced" fill="var(--accent)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipStyle} cursor={{ stroke: "var(--border)" }} formatter={(v) => fmt(v)}
          labelFormatter={(l) => `Week of ${l}`} />
        <Line type="monotone" dataKey="units" name="Units remaining" stroke="var(--accent)"
          strokeWidth={2} dot={{ r: 3, fill: "var(--accent)" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ChatTable({ columns, rows }) {
  if (!rows.length) return null;
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
      <div className="max-h-[220px] overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 bg-[var(--card-2)]">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap border-b border-[var(--border)] px-2.5 py-1.5 text-left font-semibold uppercase tracking-wide text-[var(--tt)]">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--hover)]">
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-2.5 py-1.5 text-[var(--ts)]">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Deterministic intent resolver: reuses the same rows + helpers the dashboard already
// computes from (no new API, no altered calculations), just re-presents them for chat.
function answerQuery(query, rows) {
  const q = query.toLowerCase();
  const total = rows.length;

  if (/delay|overdue|late/.test(q)) {
    const delayed = rows.filter(isDelayed).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return {
      intro: delayed.length
        ? `**${delayed.length}** of **${total}** line items are currently past their due date.`
        : `No line items are currently delayed — everything is on schedule.`,
      kpis: [
        { label: "Delayed", value: delayed.length, tone: "#E5484D" },
        { label: "Of Total", value: total ? `${Math.round((delayed.length / total) * 100)}%` : "0%" },
      ],
      table: delayed.length && {
        columns: [
          { key: "workOrderNo", label: "Work Order" },
          { key: "customerName", label: "Customer" },
          { key: "plant", label: "Plant" },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          { key: "dueDate", label: "Due", render: (r) => formatDate(r.dueDate) },
        ],
        rows: delayed.slice(0, 8),
      },
      insight: delayed.length
        ? `Prioritize the oldest overdue orders first — **${delayed[0].workOrderNo}** for ${delayed[0].customerName} has been overdue since ${formatDate(delayed[0].dueDate)}.`
        : `Keep monitoring due dates as new orders come in.`,
    };
  }

  if (/status|breakdown|stage|mix/.test(q)) {
    const counts = new Map();
    rows.forEach((r) => counts.set(r.status, (counts.get(r.status) || 0) + 1));
    const byStatus = Array.from(counts.entries())
      .map(([key, value]) => ({ key, name: statusLabel(key), color: getStatusColor(key), value }))
      .sort((a, b) => b.value - a.value);
    const top = byStatus[0];
    return {
      intro: `Here's the current status mix across **${total}** line items.`,
      kpis: byStatus.map((e) => ({ label: e.name, value: e.value })),
      chart: { kind: "donut", data: byStatus },
      insight: top ? `**${top.name}** is the largest group at ${top.value} line item${top.value > 1 ? "s" : ""} (${Math.round((top.value / total) * 100)}% of total).` : "",
    };
  }

  if (/plant|factory|facility/.test(q)) {
    const byPlant = new Map();
    rows.forEach((r) => {
      const cur = byPlant.get(r.plant) || { plant: r.plant, ordered: 0, produced: 0 };
      cur.ordered += r.orderQty; cur.produced += r.producedQty;
      byPlant.set(r.plant, cur);
    });
    const plants = Array.from(byPlant.values())
      .map((e) => ({ ...e, rate: e.ordered ? Math.round((e.produced / e.ordered) * 100) : 0 }))
      .sort((a, b) => b.ordered - a.ordered);
    const best = [...plants].sort((a, b) => b.rate - a.rate)[0];
    return {
      intro: `Production output across **${plants.length}** plants, ordered vs produced units.`,
      kpis: plants.map((p) => ({ label: p.plant, value: `${p.rate}%` })),
      chart: { kind: "bar", data: plants, xKey: "plant" },
      table: {
        columns: [
          { key: "plant", label: "Plant" },
          { key: "ordered", label: "Ordered", render: (r) => fmt(r.ordered) },
          { key: "produced", label: "Produced", render: (r) => fmt(r.produced) },
          { key: "rate", label: "Rate", render: (r) => `${r.rate}%` },
        ],
        rows: plants,
      },
      insight: best ? `**${best.plant}** has the highest completion rate at ${best.rate}%.` : "",
    };
  }

  if (/customer|client|top\s?buyer/.test(q)) {
    const byCustomer = new Map();
    rows.forEach((r) => {
      const cur = byCustomer.get(r.customerName) || { name: r.customerName, ordered: 0, produced: 0 };
      cur.ordered += r.orderQty; cur.produced += r.producedQty;
      byCustomer.set(r.customerName, cur);
    });
    const customers = Array.from(byCustomer.values()).sort((a, b) => b.ordered - a.ordered).slice(0, 6);
    return {
      intro: `Top **${customers.length}** customers by ordered volume.`,
      kpis: [
        { label: "Total Customers", value: byCustomer.size },
        { label: "Top Customer", value: customers[0]?.name.split(" ")[0] || "—" },
      ],
      table: {
        columns: [
          { key: "name", label: "Customer" },
          { key: "ordered", label: "Ordered", render: (r) => fmt(r.ordered) },
          { key: "produced", label: "Produced", render: (r) => fmt(r.produced) },
        ],
        rows: customers,
      },
      insight: customers[0] ? `**${customers[0].name}** leads with ${fmt(customers[0].ordered)} units ordered.` : "",
    };
  }

  if (/schedule|week|deliver|due|trend|upcoming/.test(q)) {
    const byWeek = new Map();
    rows.filter((r) => r.dueDate).forEach((r) => {
      const key = weekStart(r.dueDate);
      const cur = byWeek.get(key) || { week: key, units: 0, orders: 0, overdue: 0 };
      cur.units += r.orderQty - r.producedQty;
      cur.orders += 1;
      if (isDelayed(r)) cur.overdue += 1;
      byWeek.set(key, cur);
    });
    const weeks = Array.from(byWeek.values()).sort((a, b) => a.week.localeCompare(b.week))
      .map((e) => ({ ...e, label: e.week.slice(5).replace("-", "/") }));
    const peak = [...weeks].sort((a, b) => b.units - a.units)[0];
    return {
      intro: `Units still to be produced, grouped by due week, across **${weeks.length}** upcoming weeks.`,
      kpis: [
        { label: "Weeks Tracked", value: weeks.length },
        { label: "Peak Week", value: peak ? peak.label : "—" },
      ],
      chart: { kind: "line", data: weeks },
      insight: peak ? `Week of **${peak.label}** has the highest remaining volume at ${fmt(peak.units)} units across ${peak.orders} order${peak.orders > 1 ? "s" : ""}.` : "",
    };
  }

  return null;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[var(--tt)]"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-[var(--accent)] text-white" : "bg-[var(--accent-soft)] text-[var(--accent)]"
        }`}
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </span>

      <div className={`min-w-0 max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-[var(--accent)] text-white"
              : "rounded-tl-sm border border-[var(--border)] bg-[var(--card)] text-[var(--tp)]"
          }`}
          style={!isUser ? { boxShadow: "var(--shadow)" } : undefined}
        >
          {message.typing ? (
            <TypingIndicator />
          ) : message.error ? (
            <span className="text-[#E5484D]">{message.text}</span>
          ) : (
            <Markdown text={message.text} />
          )}
        </div>

        {!message.typing && message.kpis && (
          <div className="mt-2 flex w-full flex-wrap gap-2">
            {message.kpis.map((k, i) => (
              <MiniKpi key={i} {...k} />
            ))}
          </div>
        )}

        {!message.typing && message.chart && (
          <div className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-2.5" style={{ boxShadow: "var(--shadow)" }}>
            {message.chart.kind === "donut" && <DonutChart data={message.chart.data} />}
            {message.chart.kind === "bar" && <BarComparisonChart data={message.chart.data} xKey={message.chart.xKey} />}
            {message.chart.kind === "line" && <TrendChart data={message.chart.data} />}
          </div>
        )}

        {!message.typing && message.table && <ChatTable {...message.table} />}

        {!message.typing && message.insight && (
          <div className="mt-2 w-full rounded-lg border border-[var(--accent-soft)] bg-[var(--accent-soft)] px-3 py-2 text-[11.5px] text-[var(--tp)]">
            <span className="font-semibold text-[var(--accent)]">Insight — </span>
            <Markdown text={message.insight} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

let msgId = 0;
const nextId = () => `m${++msgId}`;

export default function ChatPanel({ open, onClose, rows }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send(text) {
    const query = (text ?? input).trim();
    if (!query) return;
    setInput("");

    const userMsg = { id: nextId(), role: "user", text: query };
    const typingMsg = { id: nextId(), role: "assistant", typing: true };
    setMessages((cur) => [...cur, userMsg, typingMsg]);

    setTimeout(() => {
      const result = answerQuery(query, rows);
      setMessages((cur) =>
        cur.map((m) =>
          m.id === typingMsg.id
            ? result
              ? {
                  id: m.id, role: "assistant", text: result.intro,
                  kpis: result.kpis, chart: result.chart, table: result.table, insight: result.insight,
                }
              : {
                  id: m.id, role: "assistant",
                  text: `I couldn't match that to a known report. Try asking about **delays**, **status**, **plants**, **customers**, or the **delivery schedule**.`,
                }
            : m
        )
      );
    }, 550 + Math.random() * 400);
  }

  function clearChat() {
    setMessages([]);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }} onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-[440px] max-w-full flex-col border-l border-[var(--border)] bg-[var(--bg)]"
          >
            <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Sparkles size={15} />
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-[var(--tp)]">Production Assistant</div>
                  <div className="text-[10.5px] text-[var(--tt)]">Ask about orders, plants, delays &amp; more</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearChat} title="Clear conversation"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ts)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--tp)]">
                  <RotateCcw size={14} />
                </button>
                <button onClick={onClose} title="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ts)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--tp)]">
                  <X size={16} />
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Sparkles size={20} />
                  </span>
                  <p className="text-[13px] font-medium text-[var(--tp)]">Ask about your production data</p>
                  <p className="mt-1 max-w-[280px] text-[11.5px] text-[var(--tt)]">
                    Get instant KPIs, charts and tables built from the same data as the dashboard.
                  </p>
                  <div className="mt-5 flex w-full flex-col gap-2">
                    {SUGGESTED_PROMPTS.map((p) => (
                      <button
                        key={p.text}
                        onClick={() => send(p.text)}
                        className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-left text-[12px] text-[var(--ts)] transition-colors hover:border-[var(--accent)] hover:text-[var(--tp)]"
                      >
                        <p.icon size={14} className="shrink-0 text-[var(--accent)]" />
                        {p.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((m) => <ChatBubble key={m.id} message={m} />)}
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border)] bg-[var(--card)] p-3">
              <div className="flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-2)] p-1.5 focus-within:border-[var(--accent)]">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about delays, plants, customers…"
                  className="h-8 flex-1 bg-transparent px-2 text-[12.5px] text-[var(--tp)] outline-none placeholder:text-[var(--tt)]"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition-opacity disabled:opacity-30"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
