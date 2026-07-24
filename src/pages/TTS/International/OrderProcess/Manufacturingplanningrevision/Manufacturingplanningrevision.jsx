import React, { useState, useMemo } from "react";
import { ConfigProvider, theme as antTheme, InputNumber, Input, Select, Modal, message, Tooltip } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch, Search, Sun, Moon, ChevronRight, Factory, AlertTriangle, Check,
  ShieldCheck, ClipboardList, CalendarClock, ArrowRight, History, UserCheck,
  TrendingUp, TrendingDown, Ban, Clock3, FileWarning, CircleDot,
} from "lucide-react";

/* ================================================================== */
/*  THEME — same token shape as WorkOrderPlanning's ./Shared           */
/*  If Sun-TWS already has ./Shared.js in the project, delete this     */
/*  block and import { THEMES, ThemeCtx, useT, Pill, SectionLabel,     */
/*  fmtDate, daysFromNow } from "./Shared" instead — the API matches.  */
/* ================================================================== */

const THEMES = {
  light: {
    mode: "light", bg: "#f4f5f7", haze: "radial-gradient(1200px 500px at 10% -10%, #eef1f6, transparent)",
    surface: "#ffffff", surfaceAlt: "#fafbfc", inset: "#f1f2f5",
    text: "#171a21", sub: "#565c68", faint: "#8b909c",
    border: "#e6e8ec", borderStrong: "#d6d9de",
    primary: "#2955ec", primarySoft: "#eef2fe", primaryBorder: "#c9d6fb", onPrimary: "#ffffff",
    success: "#1a8a5f", successSoft: "#e9f7f0",
    warn: "#b4680a", warnSoft: "#fdf2e2",
    danger: "#c23636", dangerSoft: "#fbebeb",
    shadow: "0 1px 2px rgba(20,22,30,0.05)", shadowLg: "0 12px 32px rgba(20,22,30,0.14)",
  },
  dark: {
    mode: "dark", bg: "#0f1116", haze: "radial-gradient(1200px 500px at 10% -10%, #171a24, transparent)",
    surface: "#171a22", surfaceAlt: "#1c1f28", inset: "#20232d",
    text: "#e9eaee", sub: "#a4a8b3", faint: "#6d7280",
    border: "#262a35", borderStrong: "#333846",
    primary: "#5c7cfa", primarySoft: "#1a2036", primaryBorder: "#2c3660", onPrimary: "#ffffff",
    success: "#33b087", successSoft: "#132a22",
    warn: "#e0a338", warnSoft: "#2c2415",
    danger: "#e46a6a", dangerSoft: "#2c1717",
    shadow: "0 1px 2px rgba(0,0,0,0.3)", shadowLg: "0 16px 40px rgba(0,0,0,0.5)",
  },
};

const ThemeCtx = React.createContext(THEMES.light);
const useT = () => React.useContext(ThemeCtx);

const TONE_KEYS = { neutral: null, primary: "primary", success: "success", warn: "warn", danger: "danger" };
function Pill({ tone = "neutral", icon: Icon, children }) {
  const t = useT();
  const key = TONE_KEYS[tone];
  const bg = key ? t[`${key}Soft`] ?? t.inset : t.inset;
  const color = key ? t[key] ?? t.sub : t.sub;
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold"
      style={{ background: bg, color }}>
      {Icon && <Icon size={10} />}{children}
    </span>
  );
}

function SectionLabel({ children, right }) {
  const t = useT();
  return (
    <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
      <div className="text-[11px] font-bold uppercase tracking-[0.07em]" style={{ color: t.faint }}>{children}</div>
      {right}
    </div>
  );
}

const fmtDate = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const daysFromNow = (d) => Math.round((d - new Date()) / 86400000);
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(v ?? 0, hi));

/* ================================================================== */
/*  DATA — mock revision data, same shape as PlannerWorkspace output.  */
/*  Replace with the API response (revision header + affected lines). */
/* ================================================================== */

const PLANTS = [
  { code: "MMN", name: "Maraimalai Nagar", capacity: 1500 },
  { code: "PDK", name: "Pudhupettai", capacity: 900 },
  { code: "SITL", name: "SITL Sri Lanka", capacity: 600 },
  { code: "SLTL", name: "SLTL Sri Lanka", capacity: 450 },
];
const PLANT_PLANNED = { MMN: 1180, PDK: 640, SITL: 210, SLTL: 90 };

const REVISION_HEADER = {
  id: "REV-00012", status: "waiting_approval", reason: "Customer quantity change",
  createdBy: "Kaju", createdOn: addDays(-2), submittedOn: addDays(-1),
};

const CUSTOMER_ORDERS = [
  { customer: "SUN-TWS AMERCIA INC", poCount: 3, pendingQty: 4200, priority: "High", delivery: addDays(12), status: "partial" },
  { customer: "INDUSTRIAL TYRE NETWORK LTD", poCount: 2, pendingQty: 2600, priority: "High", delivery: addDays(8), status: "open" },
  { customer: "TVH PARTS CO", poCount: 2, pendingQty: 1900, priority: "Routine", delivery: addDays(33), status: "planned" },
];

/* soId/line, processId/description, originalQty/revisedQty, originalPlant/revisedPlant, delivery */
const REVISION_LINES = [
  { key: "L1", soId: 1001, lineNo: 1, processId: "P-004331", description: "SRT | TL | 7.00-12 LUG | TANTOR", originalQty: 500, revisedQty: 650, originalPlant: "MMN", revisedPlant: "MMN", originalDelivery: addDays(20), revisedDelivery: addDays(20) },
  { key: "L2", soId: 1001, lineNo: 2, processId: "P-008741", description: "SRT | NP | 18X7-8 LUG | NUMAPRIME", originalQty: 300, revisedQty: 300, originalPlant: "MMN", revisedPlant: "PDK", originalDelivery: addDays(20), revisedDelivery: addDays(23) },
  { key: "L3", soId: 1032, lineNo: 1, processId: "P-008886", description: "SRT | NP | 6.00-9 LUG | NUMAPRIME", originalQty: 750, revisedQty: 500, originalPlant: "PDK", revisedPlant: "PDK", originalDelivery: addDays(40), revisedDelivery: addDays(40) },
  { key: "L4", soId: 1105, lineNo: 3, processId: "P-004335", description: "SRT | TL | 18X7-8 LUG | TANTOR", originalQty: 400, revisedQty: 400, originalPlant: "SITL", revisedPlant: "SLTL", originalDelivery: addDays(8), revisedDelivery: addDays(11) },
  { key: "L5", soId: 1105, lineNo: 4, processId: "00390R01", description: "00390R01 | 7.50-20 (Standalone Rim)", originalQty: 200, revisedQty: 0, originalPlant: "MMN", revisedPlant: "—", originalDelivery: addDays(8), revisedDelivery: null },
  { key: "L6", soId: 1130, lineNo: 1, processId: "P009664A", description: "SRT | TL | 10.00-20 LUG | TALON", originalQty: 600, revisedQty: 900, originalPlant: "PDK", revisedPlant: "PDK", originalDelivery: addDays(33), revisedDelivery: addDays(30) },
];

const REVISION_TIMELINE = [
  { rev: "REV-00010", label: "Created", date: addDays(-14), status: "released" },
  { rev: "REV-00011", label: "Plant reassigned", date: addDays(-6), status: "released" },
  { rev: "REV-00012", label: "Quantity increased", date: addDays(-2), status: "current" },
];

const CHANGE_LOG = [
  { time: "10:25 AM", text: "Qty changed on L1 (P-004331)", from: "500", to: "650" },
  { time: "10:31 AM", text: "Plant reassigned on L2 (P-008741)", from: "MMN", to: "PDK" },
  { time: "10:36 AM", text: "Delivery shifted on L4 (P-004335)", from: fmtDate(addDays(8)), to: fmtDate(addDays(11)) },
  { time: "10:41 AM", text: "L5 (00390R01) removed from revision", from: "200", to: "0" },
];

const APPROVAL_STEPS = [
  { role: "Planner", by: "Kaju", state: "done" },
  { role: "Production Manager", by: null, state: "current" },
  { role: "Factory Manager", by: null, state: "pending" },
  { role: "Released", by: null, state: "pending" },
];

const STATUS_META = {
  draft: { label: "Draft", tone: "neutral" },
  waiting_approval: { label: "Waiting Approval", tone: "warn" },
  approved: { label: "Approved", tone: "primary" },
  released: { label: "Released", tone: "success" },
  open: { label: "Not Assigned", tone: "primary" },
  partial: { label: "Partially Planned", tone: "warn" },
  planned: { label: "Planned", tone: "success" },
  current: { label: "In Progress", tone: "primary" },
};

/* ================================================================== */
/*  LEFT — CUSTOMER / ORDER LIST                                       */
/* ================================================================== */

function OrderRow({ o, active, onClick }) {
  const t = useT();
  const days = daysFromNow(o.delivery);
  const st = STATUS_META[o.status];
  return (
    <button onClick={onClick} className="w-full rounded-lg border p-3 text-left transition-colors"
      style={{ background: active ? t.primarySoft : t.surface, borderColor: active ? t.primaryBorder : t.border, boxShadow: active ? "none" : t.shadow }}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[12.5px] font-bold" style={{ color: t.text }}>{o.customer}</div>
          <div className="mt-0.5 text-[10.5px]" style={{ color: t.faint }}>{o.poCount} PO{o.poCount !== 1 ? "s" : ""} · {o.pendingQty.toLocaleString()} pending</div>
        </div>
        <Pill tone={st.tone}>{st.label}</Pill>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px]" style={{ color: t.faint }}>
        <span className="inline-flex items-center gap-1"><CalendarClock size={10} />{fmtDate(o.delivery)} · {days}d</span>
        {o.priority === "High" && <Pill tone="danger">High</Pill>}
      </div>
    </button>
  );
}

/* ================================================================== */
/*  CENTER — LINE ITEM REVISION (Original vs Revised)                 */
/* ================================================================== */

function DiffCell({ original, revised, format = (v) => v, isDelivery }) {
  const t = useT();
  const changed = isDelivery ? +original !== +revised : original !== revised;
  const removed = revised === 0 || revised === "—" || revised === null;
  if (!changed) return <span className="font-mono text-[12px]" style={{ color: t.sub }}>{format(revised)}</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-[11px] line-through" style={{ color: t.faint }}>{format(original)}</span>
      <ArrowRight size={10} style={{ color: t.faint }} />
      <span className="font-mono text-[12px] font-bold" style={{ color: removed ? t.danger : t.success }}>{format(revised)}</span>
    </span>
  );
}

function RevisionLineRow({ line }) {
  const t = useT();
  const diff = line.revisedQty - line.originalQty;
  const plantChanged = line.originalPlant !== line.revisedPlant;
  const removed = line.revisedQty === 0;
  return (
    <div className="rounded-lg border px-3 py-2.5" style={{ background: t.surfaceAlt, borderColor: removed ? t.dangerSoft : t.border }}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-[190px] flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11.5px] font-bold" style={{ color: t.text }}>{line.processId}</span>
            <span className="text-[10.5px]" style={{ color: t.sub }}>PO-{line.soId} · L{line.lineNo}</span>
            {removed && <Pill tone="danger" icon={Ban}>Removed</Pill>}
          </div>
          <div className="mt-0.5 truncate text-[10.5px]" style={{ color: t.faint }}>{line.description}</div>
        </div>

        <div className="w-[110px]">
          <div className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: t.faint }}>Quantity</div>
          <DiffCell original={line.originalQty} revised={line.revisedQty} format={(v) => v.toLocaleString()} />
        </div>

        <div className="w-[70px] text-right">
          <div className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: t.faint }}>Diff</div>
          <span className="inline-flex items-center gap-0.5 font-mono text-[12px] font-bold"
            style={{ color: diff > 0 ? t.success : diff < 0 ? t.danger : t.faint }}>
            {diff > 0 ? <TrendingUp size={11} /> : diff < 0 ? <TrendingDown size={11} /> : null}
            {diff > 0 ? "+" : ""}{diff.toLocaleString()}
          </span>
        </div>

        <div className="w-[130px]">
          <div className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: t.faint }}>Plant</div>
          {plantChanged
            ? <DiffCell original={line.originalPlant} revised={line.revisedPlant} />
            : <span className="font-mono text-[12px]" style={{ color: t.sub }}>{line.revisedPlant}</span>}
        </div>

        <div className="w-[140px]">
          <div className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: t.faint }}>Delivery</div>
          {line.revisedDelivery
            ? <DiffCell original={fmtDate(line.originalDelivery)} revised={fmtDate(line.revisedDelivery)} isDelivery={+line.originalDelivery !== +line.revisedDelivery} />
            : <span className="font-mono text-[11px]" style={{ color: t.faint }}>—</span>}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  RIGHT — PLANT CAPACITY / IMPACT / TIMELINE / APPROVAL              */
/* ================================================================== */

function PlantCapacityRow({ plant, revisedQty }) {
  const t = useT();
  const planned = PLANT_PLANNED[plant.code] || 0;
  const used = planned + revisedQty;
  const pct = Math.min(100, Math.round((used / plant.capacity) * 100));
  const over = used > plant.capacity;
  return (
    <div className="rounded-lg border p-2.5" style={{ borderColor: over ? t.danger : t.border, background: t.surfaceAlt }}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold" style={{ color: t.text }}>
          <Factory size={11} style={{ color: t.faint }} /> {plant.code}
        </span>
        <span className="font-mono text-[11px] font-bold" style={{ color: over ? t.danger : t.sub }}>{used.toLocaleString()} / {plant.capacity.toLocaleString()}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: t.inset }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? t.danger : pct > 85 ? t.warn : t.primary }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-[9.5px]" style={{ color: t.faint }}>
        <span>{plant.name}</span>
        {over
          ? <span className="inline-flex items-center gap-1 font-bold" style={{ color: t.danger }}><AlertTriangle size={9} /> Over capacity</span>
          : <span>{(plant.capacity - used).toLocaleString()} available</span>}
      </div>
    </div>
  );
}

function ImpactStat({ label, value, tone, icon: Icon }) {
  const t = useT();
  const color = tone === "success" ? t.success : tone === "warn" ? t.warn : tone === "danger" ? t.danger : t.text;
  return (
    <div className="rounded-lg py-2 text-center" style={{ background: t.surfaceAlt }}>
      <div className="flex items-center justify-center gap-1 font-mono text-[14px] font-bold" style={{ color }}>
        {Icon && <Icon size={12} />}{value}
      </div>
      <div className="mt-0.5 text-[8.5px] uppercase tracking-wide" style={{ color: t.faint }}>{label}</div>
    </div>
  );
}

function RevisionTimeline({ items }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-0">
      {items.map((it, i) => {
        const st = STATUS_META[it.status];
        return (
          <div key={it.rev} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
                style={{ borderColor: it.status === "current" ? t.primary : t.borderStrong, background: it.status === "current" ? t.primarySoft : t.surface }}>
                <CircleDot size={11} style={{ color: it.status === "current" ? t.primary : t.faint }} />
              </div>
              {i < items.length - 1 && <div className="w-px flex-1" style={{ background: t.border, minHeight: 22 }} />}
            </div>
            <div className="pb-4">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] font-bold" style={{ color: t.text }}>{it.rev}</span>
                <Pill tone={st.tone}>{st.label}</Pill>
              </div>
              <div className="text-[10.5px]" style={{ color: t.sub }}>{it.label}</div>
              <div className="text-[9.5px]" style={{ color: t.faint }}>{fmtDate(it.date)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChangeLogList({ items }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((c, i) => (
        <div key={i} className="rounded-lg border px-2.5 py-2" style={{ borderColor: t.border, background: t.surfaceAlt }}>
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-semibold" style={{ color: t.text }}>{c.text}</span>
            <span className="text-[9px]" style={{ color: t.faint }}>{c.time}</span>
          </div>
          <div className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[10px]" style={{ color: t.faint }}>
            <span className="line-through">{c.from}</span><ArrowRight size={9} /><span style={{ color: t.sub }}>{c.to}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ApprovalFlow({ steps }) {
  const t = useT();
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <React.Fragment key={s.role}>
          <Tooltip title={s.by ? `${s.role} · ${s.by}` : s.role}>
            <div className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: s.state === "done" ? t.success : s.state === "current" ? t.primary : t.borderStrong,
                  background: s.state === "done" ? t.successSoft : s.state === "current" ? t.primarySoft : t.surface,
                }}>
                {s.state === "done" ? <Check size={12} style={{ color: t.success }} /> : <UserCheck size={12} style={{ color: s.state === "current" ? t.primary : t.faint }} />}
              </div>
              <span className="max-w-[64px] truncate text-center text-[8.5px] font-semibold" style={{ color: s.state === "pending" ? t.faint : t.sub }}>{s.role}</span>
            </div>
          </Tooltip>
          {i < steps.length - 1 && <div className="mb-3.5 h-px flex-1" style={{ background: t.borderStrong }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  MAIN                                                               */
/* ================================================================== */

export default function ManufacturingPlanningRevision() {
  const [mode, setMode] = useState("light");
  const t = THEMES[mode];

  const [selectedCustomer, setSelectedCustomer] = useState(CUSTOMER_ORDERS[0].customer);
  const [search, setSearch] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const lines = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REVISION_LINES.filter((l) => !q || [l.processId, l.description, String(l.soId)].join(" ").toLowerCase().includes(q));
  }, [search]);

  const impact = useMemo(() => {
    const increased = REVISION_LINES.filter((l) => l.revisedQty > l.originalQty).reduce((a, l) => a + (l.revisedQty - l.originalQty), 0);
    const reduced = REVISION_LINES.filter((l) => l.revisedQty < l.originalQty).reduce((a, l) => a + (l.originalQty - l.revisedQty), 0);
    const plantChanges = REVISION_LINES.filter((l) => l.originalPlant !== l.revisedPlant && l.revisedQty > 0).length;
    const delayed = REVISION_LINES.filter((l) => l.revisedDelivery && +l.revisedDelivery > +l.originalDelivery).length;
    const removedLines = REVISION_LINES.filter((l) => l.revisedQty === 0).length;
    const customersAffected = new Set(REVISION_LINES.map((l) => l.soId)).size;
    return { increased, reduced, plantChanges, delayed, removedLines, customersAffected };
  }, []);

  const netByPlant = useMemo(() => {
    const m = {}; PLANTS.forEach((p) => (m[p.code] = 0));
    REVISION_LINES.forEach((l) => { if (l.revisedPlant !== "—") m[l.revisedPlant] = (m[l.revisedPlant] || 0) + l.revisedQty; });
    return m;
  }, []);

  const overCapacity = PLANTS.some((p) => (PLANT_PLANNED[p.code] || 0) + netByPlant[p.code] > p.capacity);
  const status = STATUS_META[REVISION_HEADER.status];

  const submitApproval = () => message.success("Revision submitted for approval");
  const approveStep = () => message.success("Approved · moved to next approver");
  const doReject = () => { setRejectOpen(false); message.error("Revision rejected · returned to planner"); };
  const doRelease = () => { setReleaseOpen(false); message.success(`${REVISION_HEADER.id} released to production`); };

  return (
    <ThemeCtx.Provider value={t}>
      <ConfigProvider theme={{
        algorithm: mode === "dark" ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: { colorPrimary: t.primary, colorBgContainer: t.surface, colorBorder: t.borderStrong, colorText: t.text, borderRadius: 8, fontFamily: "'Instrument Sans', sans-serif" },
      }}>
        <div className="flex h-screen w-full flex-col overflow-hidden"
          style={{ background: `${t.haze}, ${t.bg}`, fontFamily: "'Instrument Sans', sans-serif", color: t.text }}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
            .font-mono { font-family: 'IBM Plex Mono', monospace !important; }
            .scroll-y { overflow-y: auto; scrollbar-width: thin; }
            .scroll-y::-webkit-scrollbar { width: 6px; }
            .scroll-y::-webkit-scrollbar-thumb { background: ${t.borderStrong}; border-radius: 999px; }
          `}</style>

          {/* HEADER */}
          <header className="z-20 flex shrink-0 items-center justify-between border-b px-5 py-3"
            style={{ borderColor: t.border, background: t.surface, boxShadow: t.shadow }}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: t.primary }}>
                <GitBranch size={18} color={t.onPrimary} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[15.5px] font-bold leading-tight tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Manufacturing Planning Revision
                  </h1>
                  <Pill tone={status.tone}>{status.label}</Pill>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px]" style={{ color: t.faint }}>
                  <span className="font-mono font-bold" style={{ color: t.primary }}>{REVISION_HEADER.id}</span>
                  <span>·</span><span>{REVISION_HEADER.reason}</span>
                  <span>·</span><span>{REVISION_HEADER.createdBy}, {fmtDate(REVISION_HEADER.createdOn)}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setMode(mode === "light" ? "dark" : "light")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ borderColor: t.border, background: t.surfaceAlt, color: t.sub }}>
              {mode === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </header>

          {/* BODY */}
          <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
            <div className="grid h-full min-h-0 grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_minmax(0,1fr)_360px]">

              {/* LEFT — customer orders */}
              <aside className="flex min-h-0 flex-col">
                <SectionLabel>Customer Orders · {CUSTOMER_ORDERS.length}</SectionLabel>
                <div className="scroll-y flex min-h-0 flex-1 flex-col gap-2 pr-1">
                  {CUSTOMER_ORDERS.map((o) => (
                    <OrderRow key={o.customer} o={o} active={selectedCustomer === o.customer} onClick={() => setSelectedCustomer(o.customer)} />
                  ))}
                </div>
              </aside>

              {/* CENTER — line item revision */}
              <main className="flex min-h-0 flex-col">
                <Input allowClear size="middle" className="mb-3 shrink-0" prefix={<Search size={14} style={{ color: t.faint }} />}
                  placeholder="Search Process ID, description, PO..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <SectionLabel right={<span className="text-[10.5px] font-semibold" style={{ color: t.faint }}>Original → Revised</span>}>
                  Line Item Revisions · {lines.length}
                </SectionLabel>
                <div className="scroll-y min-h-0 flex-1 pr-1">
                  <div className="flex flex-col gap-2 pb-4">
                    {lines.map((l) => <RevisionLineRow key={l.key} line={l} />)}
                    {lines.length === 0 && (
                      <div className="rounded-xl border border-dashed p-8 text-center text-[12px]" style={{ borderColor: t.borderStrong, color: t.faint }}>
                        No line items match your search.
                      </div>
                    )}
                  </div>
                </div>
              </main>

              {/* RIGHT — capacity / impact / timeline / approval */}
              <aside className="scroll-y flex min-h-0 flex-col gap-3 pr-1">
                {/* Plant capacity */}
                <div className="rounded-xl border p-3.5" style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadow }}>
                  <SectionLabel>Plant Capacity</SectionLabel>
                  <div className="flex flex-col gap-2">
                    {PLANTS.map((p) => <PlantCapacityRow key={p.code} plant={p} revisedQty={netByPlant[p.code] || 0} />)}
                  </div>
                  {overCapacity && (
                    <div className="mt-2.5 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold" style={{ background: t.dangerSoft, color: t.danger }}>
                      <AlertTriangle size={12} /> One or more plants exceed capacity in this revision
                    </div>
                  )}
                </div>

                {/* Impact analysis */}
                <div className="rounded-xl border p-3.5" style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadow }}>
                  <SectionLabel>Impact Analysis</SectionLabel>
                  <div className="grid grid-cols-3 gap-2">
                    <ImpactStat label="Qty increased" value={`+${impact.increased.toLocaleString()}`} tone="success" icon={TrendingUp} />
                    <ImpactStat label="Qty reduced" value={`-${impact.reduced.toLocaleString()}`} tone="danger" icon={TrendingDown} />
                    <ImpactStat label="Plants changed" value={impact.plantChanges} />
                    <ImpactStat label="Delayed lines" value={impact.delayed} tone={impact.delayed ? "warn" : undefined} icon={Clock3} />
                    <ImpactStat label="Lines removed" value={impact.removedLines} tone={impact.removedLines ? "danger" : undefined} icon={Ban} />
                    <ImpactStat label="Customers" value={impact.customersAffected} />
                  </div>
                </div>

                {/* Approval workflow */}
                <div className="rounded-xl border p-3.5" style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadow }}>
                  <SectionLabel>Approval Workflow</SectionLabel>
                  <ApprovalFlow steps={APPROVAL_STEPS} />
                </div>

                {/* Revision timeline */}
                <div className="rounded-xl border p-3.5" style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadow }}>
                  <SectionLabel icon={History}>Revision Timeline</SectionLabel>
                  <RevisionTimeline items={REVISION_TIMELINE} />
                </div>

                {/* Change log */}
                <div className="rounded-xl border p-3.5" style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadow }}>
                  <SectionLabel>Change Log</SectionLabel>
                  <ChangeLogList items={CHANGE_LOG} />
                </div>
              </aside>
            </div>
          </div>

          {/* STICKY ACTION BAR */}
          <footer className="z-20 flex shrink-0 items-center justify-between border-t px-5 py-2.5" style={{ borderColor: t.border, background: t.surface }}>
            <div className="flex items-center gap-4 text-[11.5px]" style={{ color: t.sub }}>
              <span className="inline-flex items-center gap-1.5"><ClipboardList size={12} style={{ color: t.faint }} />{REVISION_LINES.length} lines in this revision</span>
              {overCapacity && (
                <span className="inline-flex items-center gap-1 font-bold" style={{ color: t.danger }}><FileWarning size={12} /> Capacity warning</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border px-3 py-1.5 text-[11.5px] font-bold" style={{ borderColor: t.border, color: t.sub }}
                onClick={() => message.info("Draft saved")}>Save Draft</button>
              <button className="rounded-lg border px-3 py-1.5 text-[11.5px] font-bold" style={{ borderColor: t.border, color: t.sub }}
                onClick={submitApproval}>Submit for Approval</button>
              <button className="rounded-lg border px-3 py-1.5 text-[11.5px] font-bold" style={{ borderColor: t.danger, color: t.danger }}
                onClick={() => setRejectOpen(true)}>Reject</button>
              <button className="rounded-lg px-3 py-1.5 text-[11.5px] font-bold" style={{ background: t.primary, color: t.onPrimary }}
                onClick={approveStep}>Approve</button>
              <button className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[11.5px] font-bold disabled:cursor-not-allowed disabled:opacity-45"
                style={{ background: t.success, color: mode === "light" ? "#fff" : "#06281a" }}
                disabled={overCapacity} onClick={() => setReleaseOpen(true)}>
                <ShieldCheck size={13} /> Release Revision
              </button>
            </div>
          </footer>

          {/* REJECT MODAL */}
          <Modal open={rejectOpen} onCancel={() => setRejectOpen(false)} onOk={doReject} okText="Reject Revision" okButtonProps={{ danger: true }} title="Reject this revision?">
            <p style={{ color: t.sub }}>This returns {REVISION_HEADER.id} to the planner as a draft. Add a reason for the rejection.</p>
            <Input.TextArea rows={3} placeholder="Reason for rejection" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </Modal>

          {/* RELEASE MODAL */}
          <Modal open={releaseOpen} onCancel={() => setReleaseOpen(false)} onOk={doRelease} okText="Release to Production" title="Release revision?">
            <p style={{ color: t.sub }}>
              This locks {REVISION_HEADER.id}, updates purchase order quantities, plant assignments and delivery
              dates, and pushes {impact.customersAffected} affected order{impact.customersAffected !== 1 ? "s" : ""} to production. This cannot be undone.
            </p>
          </Modal>
        </div>
      </ConfigProvider>
    </ThemeCtx.Provider>
  );
}