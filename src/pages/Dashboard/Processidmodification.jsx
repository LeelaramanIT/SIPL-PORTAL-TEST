import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ConfigProvider, theme as antdTheme, Card, Input, Button, Select, Table, Modal,
  Drawer, Alert, Tag, Tooltip, Descriptions, Skeleton, Empty, Typography, Divider,
  notification, message,
} from "antd";
import {
  SearchOutlined, BarcodeOutlined, HistoryOutlined, MoonOutlined, SunOutlined,
  SwapRightOutlined, ArrowDownOutlined, CheckCircleFilled, ClockCircleOutlined,
  CloseCircleOutlined, DatabaseOutlined, SafetyCertificateOutlined, ReloadOutlined,
  ExclamationCircleOutlined, FormOutlined, ThunderboltOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence, animate } from "framer-motion";

const { Text, Title } = Typography;

/* ------------------------------ Mock master data ------------------------------ */

const FIELD_ORDER = ["category", "platform", "brand", "sidewall", "type", "tyreSize", "rim"];
const FIELD_LABELS = {
  category: "Category", platform: "Platform", brand: "Brand", sidewall: "Sidewall",
  type: "Type", tyreSize: "Tyre Size", rim: "Rim",
};

const P = (processId, description, category, platform, brand, sidewall, type, tyreSize, rim, lastUpdated) =>
  ({ processId, description, category, platform, brand, sidewall, type, tyreSize, rim, status: "Active", lastUpdated });

const PROCESS_MASTER = [
  P("PRC-1001", "PCR Radial 195/65 R15 ApexGrip TL", "PCR", "P1 Radial", "ApexGrip", "Black", "Tubeless", "195/65 R15", "15", "2026-07-18"),
  P("PRC-1002", "PCR Radial 205/55 R16 ApexGrip TL", "PCR", "P1 Radial", "ApexGrip", "Black", "Tubeless", "205/55 R16", "16", "2026-07-20"),
  P("PRC-1003", "PCR Radial 205/55 R16 ApexGrip OWL", "PCR", "P1 Radial", "ApexGrip", "Outline White Letter", "Tubeless", "205/55 R16", "16", "2026-07-15"),
  P("PRC-1004", "PCR Radial 215/60 R17 ApexGrip TL", "PCR", "P1 Radial", "ApexGrip", "Black", "Tubeless", "215/60 R17", "17", "2026-07-21"),
  P("PRC-1005", "PCR Radial 195/65 R15 RoadMax TL", "PCR", "P1 Radial", "RoadMax", "Black", "Tubeless", "195/65 R15", "15", "2026-07-12"),
  P("PRC-1006", "PCR Radial 205/55 R16 RoadMax TL", "PCR", "P1 Radial", "RoadMax", "Black", "Tubeless", "205/55 R16", "16", "2026-07-19"),
  P("PRC-1007", "PCR Radial 215/60 R17 RoadMax OWL", "PCR", "P1 Radial", "RoadMax", "Outline White Letter", "Tubeless", "215/60 R17", "17", "2026-07-22"),
  P("PRC-1101", "PCR Sport 225/45 R18 ApexGrip TL", "PCR", "P2 Sport", "ApexGrip", "Black", "Tubeless", "225/45 R18", "18", "2026-07-17"),
  P("PRC-1102", "PCR Sport 245/40 R19 ApexGrip TL", "PCR", "P2 Sport", "ApexGrip", "Black", "Tubeless", "245/40 R19", "19", "2026-07-23"),
  P("PRC-1103", "PCR Sport 225/45 R18 RoadMax TL", "PCR", "P2 Sport", "RoadMax", "Black", "Tubeless", "225/45 R18", "18", "2026-07-16"),
  P("PRC-2001", "TBR All Steel 295/80 R22.5 TerraKing TL", "TBR", "T1 All Steel", "TerraKing", "Black", "Tubeless", "295/80 R22.5", "22.5", "2026-07-21"),
  P("PRC-2002", "TBR All Steel 315/80 R22.5 TerraKing TL", "TBR", "T1 All Steel", "TerraKing", "Black", "Tubeless", "315/80 R22.5", "22.5", "2026-07-14"),
  P("PRC-2003", "TBR All Steel 10.00 R20 TerraKing TT", "TBR", "T1 All Steel", "TerraKing", "Black", "Tube Type", "10.00 R20", "20", "2026-07-10"),
  P("PRC-2004", "TBR All Steel 10.00 R20 RoadMax TT", "TBR", "T1 All Steel", "RoadMax", "Black", "Tube Type", "10.00 R20", "20", "2026-07-11"),
];

const BARCODES = {
  TY24070001: { processId: "PRC-1002", status: "In Stock", manufacturingDate: "2026-07-22", plant: "Plant 2 - Chennai", machine: "CURING-08", shift: "B", batchNumber: "B-2607-114", createdBy: "operator.ravi" },
  TY24070002: { processId: "PRC-1004", status: "Dispatched", manufacturingDate: "2026-07-18", plant: "Plant 2 - Chennai", machine: "CURING-03", shift: "A", batchNumber: "B-2607-098", createdBy: "operator.suresh" },
  TY24070003: { processId: "PRC-1005", status: "Invoiced", manufacturingDate: "2026-07-16", plant: "Plant 1 - Madurai", machine: "CURING-11", shift: "C", batchNumber: "B-2607-072", createdBy: "operator.kumar" },
  TY24070004: { processId: "PRC-1101", status: "Locked", manufacturingDate: "2026-07-21", plant: "Plant 2 - Chennai", machine: "CURING-05", shift: "A", batchNumber: "B-2607-109", createdBy: "operator.ravi" },
  TY24070005: { processId: "PRC-2001", status: "Inspection Completed", manufacturingDate: "2026-07-20", plant: "Plant 3 - Hosur", machine: "CURING-21", shift: "B", batchNumber: "B-2607-101", createdBy: "operator.anand" },
  TY24070006: { processId: "PRC-1006", status: "QC Approved", manufacturingDate: "2026-07-23", plant: "Plant 2 - Chennai", machine: "CURING-08", shift: "A", batchNumber: "B-2607-121", createdBy: "operator.suresh" },
};

const BLOCKED_STATUS = {
  Dispatched: "This tyre has already been dispatched. Process ID modification is not permitted.",
  Invoiced: "This tyre has already been invoiced. Process ID modification is not permitted.",
  Locked: "This barcode is locked by another transaction. Please try again later or contact the administrator.",
  "Inspection Completed": "Inspection has been completed for this tyre. Process ID modification is not permitted.",
};

const INITIAL_AUDIT = [
  { key: 1, barcode: "TY24060412", oldProcessId: "PRC-1001", newProcessId: "PRC-1005", changedBy: "supervisor.mani", changedDate: "2026-07-23 14:32", plant: "Plant 2 - Chennai", machine: "CURING-04", ip: "192.168.4.18", reason: "Wrong mould selected during size changeover on curing press.", status: "Approved" },
  { key: 2, barcode: "TY24060287", oldProcessId: "PRC-1103", newProcessId: "PRC-1101", changedBy: "kaju", changedDate: "2026-07-23 10:05", plant: "Plant 2 - Chennai", machine: "CURING-09", ip: "192.168.4.21", reason: "Incorrect brand component loaded at tyre building machine.", status: "Approved" },
  { key: 3, barcode: "TY24060190", oldProcessId: "PRC-2002", newProcessId: "PRC-2001", changedBy: "supervisor.mani", changedDate: "2026-07-22 18:44", plant: "Plant 3 - Hosur", machine: "CURING-19", ip: "192.168.7.09", reason: "Production setup mistake — wrong size scheduled on the press.", status: "Pending Approval" },
];

/* --------------------------------- Mock API --------------------------------- */

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const mockApi = {
  // GET /api/process-modification/barcode/{barcode}
  async getBarcode(barcode) {
    await delay(900);
    const rec = BARCODES[barcode];
    if (!rec) throw new Error("Barcode not found. Please verify the barcode and try again.");
    const spec = PROCESS_MASTER.find((p) => p.processId === rec.processId);
    return { barcode, ...spec, ...rec };
  },
  // POST /api/process/search
  async searchProcess(body) {
    await delay(700);
    return PROCESS_MASTER.filter((p) => FIELD_ORDER.every((f) => p[f] === body[f]));
  },
  // POST /api/process-modification/update
  async update() {
    await delay(1200);
    return { success: true };
  },
};

/* --------------------------------- Helpers ---------------------------------- */

const uniq = (arr) => [...new Set(arr)];

const STATUS_COLOR = {
  "In Stock": "blue", Dispatched: "volcano", Invoiced: "red", Locked: "orange",
  "Inspection Completed": "purple", "QC Approved": "gold", Active: "green",
  Approved: "green", "Pending Approval": "gold", Rejected: "red",
};
const StatusTag = ({ value }) => <Tag color={STATUS_COLOR[value] || "default"} className="!rounded-full !px-3 !font-medium">{value}</Tag>;

const AnimatedStat = ({ value }) => {
  const ref = useRef(null);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.1, ease: "easeOut",
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString(); },
    });
    return () => controls.stop();
  }, [value]);
  return <span ref={ref}>0</span>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

const GLASS = "rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70";

const SectionHeader = ({ icon, title, subtitle, extra }) => (
  <div className="mb-5 flex items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20">
        {icon}
      </div>
      <div>
        <div className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">{title}</div>
        {subtitle && <div className="text-[13px] text-slate-500 dark:text-slate-400">{subtitle}</div>}
      </div>
    </div>
    {extra}
  </div>
);

/* ------------------------------ Main component ------------------------------- */

const EMPTY_SPEC = { category: null, platform: null, brand: null, sidewall: null, type: null, tyreSize: null, rim: null };

export default function ProcessIdModification() {
  const [dark, setDark] = useState(false);

  const [barcodeInput, setBarcodeInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [tyre, setTyre] = useState(null);

  const [spec, setSpec] = useState(EMPTY_SPEC);
  const [processLoading, setProcessLoading] = useState(false);
  const [processResults, setProcessResults] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);

  const [reason, setReason] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [auditOpen, setAuditOpen] = useState(false);
  const [audit, setAudit] = useState(INITIAL_AUDIT);
  const [kpi, setKpi] = useState({ today: 14, pending: 3, approved: 11, rejected: 2, total: 1284 });

  const [notify, notifyCtx] = notification.useNotification();
  const [msg, msgCtx] = message.useMessage();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const blockedReason = tyre ? BLOCKED_STATUS[tyre.status] : null;
  const needsSupervisor = tyre?.status === "QC Approved";
  const modifiable = tyre && !blockedReason;
  const specComplete = FIELD_ORDER.every((f) => spec[f]);
  const changedFields = tyre && selectedProcess ? FIELD_ORDER.filter((f) => tyre[f] !== selectedProcess[f]) : [];
  const reasonValid = reason.trim().length >= 20;
  const canSubmit = modifiable && selectedProcess && selectedProcess.processId !== tyre.processId && reasonValid;

  const resetFlow = useCallback(() => {
    setSpec(EMPTY_SPEC);
    setProcessResults(null);
    setSelectedProcess(null);
    setReason("");
  }, []);

  /* Step 1 — barcode search */
  const handleSearch = async () => {
    const barcode = barcodeInput.trim().toUpperCase();
    if (!barcode) { msg.warning("Please scan or enter a barcode."); return; }
    setSearching(true);
    setSearchError(null);
    setTyre(null);
    resetFlow();
    try {
      const data = await mockApi.getBarcode(barcode);
      setTyre(data);
      setSpec(Object.fromEntries(FIELD_ORDER.map((f) => [f, data[f]])));
    } catch (e) {
      setSearchError(e.message);
    } finally {
      setSearching(false);
    }
  };

  /* Step 3 — dependent dropdowns */
  const optionsFor = (field) => {
    const idx = FIELD_ORDER.indexOf(field);
    const above = FIELD_ORDER.slice(0, idx);
    return uniq(
      PROCESS_MASTER
        .filter((p) => above.every((f) => p[f] === spec[f]))
        .map((p) => p[field])
    ).map((v) => ({ value: v, label: v }));
  };

  const handleSpecChange = (field, value) => {
    const idx = FIELD_ORDER.indexOf(field);
    setSpec((prev) => {
      const next = { ...prev, [field]: value };
      FIELD_ORDER.slice(idx + 1).forEach((f) => { next[f] = null; });
      return next;
    });
    setSelectedProcess(null);
    setProcessResults(null);
  };

  /* Step 4 — auto search matching processes */
  useEffect(() => {
    if (!modifiable || !specComplete) { setProcessResults(null); return; }
    let cancelled = false;
    setProcessLoading(true);
    mockApi.searchProcess(spec).then((res) => {
      if (cancelled) return;
      setProcessResults(res);
      setProcessLoading(false);
      setSelectedProcess((prev) => (prev && res.some((r) => r.processId === prev.processId) ? prev : null));
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, modifiable, specComplete]);

  /* Step 8 — confirm */
  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await mockApi.update({ barcode: tyre.barcode, oldProcessId: tyre.processId, newProcessId: selectedProcess.processId, reason: reason.trim() });
      const now = new Date();
      const stamp = now.toISOString().slice(0, 16).replace("T", " ");
      setAudit((prev) => [{
        key: Date.now(), barcode: tyre.barcode, oldProcessId: tyre.processId, newProcessId: selectedProcess.processId,
        changedBy: "kaju", changedDate: stamp, plant: tyre.plant, machine: tyre.machine, ip: "192.168.4.21",
        reason: reason.trim(), status: needsSupervisor ? "Pending Approval" : "Approved",
      }, ...prev]);
      setKpi((k) => ({
        ...k, today: k.today + 1, total: k.total + 1,
        pending: needsSupervisor ? k.pending + 1 : k.pending,
        approved: needsSupervisor ? k.approved : k.approved + 1,
      }));
      setPreviewOpen(false);
      notify.success({
        message: "Process ID Modified Successfully",
        description: needsSupervisor
          ? `${tyre.barcode} reassigned from ${tyre.processId} to ${selectedProcess.processId}. Sent for supervisor approval.`
          : `${tyre.barcode} reassigned from ${tyre.processId} to ${selectedProcess.processId}.`,
        placement: "bottomRight",
      });
      setTyre(null);
      setBarcodeInput("");
      resetFlow();
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------ Table configs ------------------------------ */

  const processColumns = [
    { title: "Process ID", dataIndex: "processId", fixed: "left", width: 130,
      render: (v) => <span className="font-semibold text-blue-600 dark:text-blue-400">{v}</span> },
    { title: "Description", dataIndex: "description", width: 280, ellipsis: true },
    { title: "Category", dataIndex: "category", width: 100 },
    { title: "Platform", dataIndex: "platform", width: 120 },
    { title: "Brand", dataIndex: "brand", width: 110 },
    { title: "Type", dataIndex: "type", width: 110 },
    { title: "Tyre Size", dataIndex: "tyreSize", width: 130 },
    { title: "Status", dataIndex: "status", width: 100, render: (v) => <StatusTag value={v} /> },
    { title: "Last Updated", dataIndex: "lastUpdated", width: 120 },
  ];

  const auditColumns = [
    { title: "Barcode", dataIndex: "barcode", width: 120, render: (v) => <span className="font-medium">{v}</span> },
    { title: "Old → New", key: "change", width: 200,
      render: (_, r) => (
        <span className="flex items-center gap-1.5">
          <Tag className="!m-0">{r.oldProcessId}</Tag>
          <SwapRightOutlined className="text-slate-400" />
          <Tag color="blue" className="!m-0">{r.newProcessId}</Tag>
        </span>
      ) },
    { title: "Changed By", dataIndex: "changedBy", width: 130 },
    { title: "Date", dataIndex: "changedDate", width: 140 },
    { title: "Plant / Machine", key: "pm", width: 180, render: (_, r) => <span className="text-slate-500 dark:text-slate-400">{r.plant} · {r.machine}</span> },
    { title: "IP", dataIndex: "ip", width: 110 },
    { title: "Status", dataIndex: "status", width: 140, render: (v) => <StatusTag value={v} /> },
    { title: "Reason", dataIndex: "reason", ellipsis: true },
  ];

  const KPIS = [
    { label: "Today's Modifications", value: kpi.today, icon: <ThunderboltOutlined />, accent: "from-blue-500 to-indigo-500" },
    { label: "Pending Approval", value: kpi.pending, icon: <ClockCircleOutlined />, accent: "from-amber-400 to-orange-500" },
    { label: "Approved Today", value: kpi.approved, icon: <CheckCircleFilled />, accent: "from-emerald-400 to-green-600" },
    { label: "Rejected", value: kpi.rejected, icon: <CloseCircleOutlined />, accent: "from-rose-400 to-red-600" },
    { label: "Total Modifications", value: kpi.total, icon: <DatabaseOutlined />, accent: "from-slate-400 to-slate-600" },
  ];

  /* --------------------------------- Render ---------------------------------- */

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: "#2563EB", borderRadius: 10, fontFamily: "inherit" },
        components: { Card: { borderRadiusLG: 16 }, Table: { headerBg: dark ? "#1e293b" : "#f1f5f9" } },
      }}
    >
      {notifyCtx}{msgCtx}
      <div className={dark ? "dark" : ""}>
        <div className="min-h-screen bg-gradient-to-b from-slate-100 via-[#F8FAFC] to-slate-100 pb-32 text-slate-800 transition-colors duration-300 dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#0B1120] dark:text-slate-100">

          {/* Header */}
          <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/60">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-lg text-white shadow-lg shadow-blue-600/25">
                  <BarcodeOutlined />
                </div>
                <div>
                  <div className="text-[16px] font-semibold leading-tight">Process ID Modification</div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400">Production · Tyre Traceability & Correction</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button icon={<HistoryOutlined />} onClick={() => setAuditOpen(true)}>Audit History</Button>
                <Tooltip title={dark ? "Light mode" : "Dark mode"}>
                  <Button shape="circle" icon={dark ? <SunOutlined /> : <MoonOutlined />} onClick={() => setDark(!dark)} />
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1400px] space-y-6 px-6 pt-6">

            {/* KPI dashboard */}
            <motion.div
              initial="hidden" animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5"
            >
              {KPIS.map((k) => (
                <motion.div key={k.label} variants={fadeUp} whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`${GLASS} relative overflow-hidden p-5`}>
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${k.accent}`} />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{k.label}</span>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-sm text-white ${k.accent}`}>{k.icon}</span>
                  </div>
                  <div className="mt-2 text-[28px] font-bold tabular-nums tracking-tight">
                    <AnimatedStat value={k.value} />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Step 1 — Barcode search */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className={`${GLASS} p-6`}>
              <SectionHeader
                icon={<BarcodeOutlined />}
                title="Scan Tyre Barcode"
                subtitle="Scan or type the tyre barcode, then search to load current process details"
              />
              <div className="flex max-w-2xl gap-3">
                <Input
                  size="large"
                  prefix={<BarcodeOutlined className="text-slate-400" />}
                  placeholder="e.g. TY24070001"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onPressEnter={handleSearch}
                  allowClear
                  className="!rounded-xl"
                />
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="primary" size="large" icon={<SearchOutlined />} loading={searching}
                    onClick={handleSearch} className="!rounded-xl !px-7 !shadow-lg !shadow-blue-600/25">
                    Search
                  </Button>
                </motion.div>
              </div>
              <div className="mt-3 text-[12px] text-slate-400 dark:text-slate-500">
                Demo barcodes: TY24070001 (OK) · TY24070002 (Dispatched) · TY24070004 (Locked) · TY24070006 (QC Approved)
              </div>
              <AnimatePresence>
                {searchError && (
                  <motion.div variants={fadeUp} initial="hidden" animate="show" exit="exit" className="mt-4">
                    <Alert type="error" showIcon message="Barcode not found" description={searchError} className="!rounded-xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Loading skeleton */}
            {searching && (
              <div className={`${GLASS} p-6`}>
                <Skeleton active paragraph={{ rows: 5 }} />
              </div>
            )}

            {/* Empty state */}
            {!tyre && !searching && !searchError && (
              <motion.div variants={fadeUp} initial="hidden" animate="show"
                className={`${GLASS} flex flex-col items-center justify-center px-6 py-16 text-center`}>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-500 dark:bg-blue-500/10">
                  <BarcodeOutlined />
                </div>
                <div className="text-[15px] font-semibold">No tyre loaded</div>
                <div className="mt-1 max-w-sm text-[13px] text-slate-500 dark:text-slate-400">
                  Scan a tyre barcode above to view its current process assignment and begin a correction.
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {tyre && (
                <motion.div key={tyre.barcode} initial="hidden" animate="show" exit="exit"
                  variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">

                  {/* Blocked / supervisor alerts */}
                  {blockedReason && (
                    <motion.div variants={fadeUp}>
                      <Alert type="error" showIcon icon={<ExclamationCircleOutlined />}
                        message={`Modification not allowed — ${tyre.status}`}
                        description={blockedReason} className="!rounded-xl" />
                    </motion.div>
                  )}
                  {needsSupervisor && (
                    <motion.div variants={fadeUp}>
                      <Alert type="warning" showIcon icon={<SafetyCertificateOutlined />}
                        message="Supervisor approval required"
                        description="This tyre is QC Approved. The modification will be routed to a supervisor for approval before it takes effect."
                        className="!rounded-xl" />
                    </motion.div>
                  )}

                  {/* Step 2 — Current tyre info */}
                  <motion.div variants={fadeUp} className={`${GLASS} p-6`}>
                    <SectionHeader
                      icon={<DatabaseOutlined />}
                      title="Current Tyre Information"
                      subtitle="Read-only snapshot of the scanned tyre"
                      extra={<StatusTag value={tyre.status} />}
                    />
                    <Descriptions
                      bordered size="middle" column={{ xs: 1, sm: 2, lg: 4 }}
                      className="[&_.ant-descriptions-item-label]:!font-medium"
                      items={[
                        { key: "barcode", label: "Barcode", children: <span className="font-semibold">{tyre.barcode}</span> },
                        { key: "pid", label: "Current Process ID", children: <Tag color="blue" className="!m-0 !font-semibold">{tyre.processId}</Tag> },
                        { key: "category", label: "Category", children: tyre.category },
                        { key: "platform", label: "Platform", children: tyre.platform },
                        { key: "brand", label: "Brand", children: tyre.brand },
                        { key: "sidewall", label: "Sidewall", children: tyre.sidewall },
                        { key: "type", label: "Type", children: tyre.type },
                        { key: "tyreSize", label: "Tyre Size", children: tyre.tyreSize },
                        { key: "rim", label: "Rim", children: tyre.rim },
                        { key: "mfg", label: "Manufacturing Date", children: tyre.manufacturingDate },
                        { key: "plant", label: "Plant", children: tyre.plant },
                        { key: "machine", label: "Machine", children: tyre.machine },
                        { key: "shift", label: "Shift", children: `Shift ${tyre.shift}` },
                        { key: "batch", label: "Batch Number", children: tyre.batchNumber },
                        { key: "createdBy", label: "Created By", children: tyre.createdBy },
                        { key: "status", label: "Status", children: <StatusTag value={tyre.status} /> },
                      ]}
                    />
                  </motion.div>

                  {modifiable && (
                    <>
                      {/* Step 3 — Modify Process */}
                      <motion.div variants={fadeUp} className={`${GLASS} p-6`}>
                        <SectionHeader
                          icon={<FormOutlined />}
                          title="Modify Process"
                          subtitle="Select the correct specification — each field filters the next"
                          extra={
                            <Button size="small" icon={<ReloadOutlined />}
                              onClick={() => setSpec(Object.fromEntries(FIELD_ORDER.map((f) => [f, tyre[f]])))}>
                              Reset to current
                            </Button>
                          }
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {FIELD_ORDER.map((field, idx) => {
                            const disabled = idx > 0 && !spec[FIELD_ORDER[idx - 1]];
                            const changed = tyre[field] !== spec[field] && spec[field];
                            return (
                              <div key={field}>
                                <div className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-300">
                                  {FIELD_LABELS[field]}
                                  {changed && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                                </div>
                                <Select
                                  className="w-full"
                                  size="large"
                                  placeholder={disabled ? `Select ${FIELD_LABELS[FIELD_ORDER[idx - 1]]} first` : `Select ${FIELD_LABELS[field]}`}
                                  value={spec[field]}
                                  options={optionsFor(field)}
                                  onChange={(v) => handleSpecChange(field, v)}
                                  disabled={disabled}
                                  showSearch
                                />
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>

                      {/* Step 4 — Matching Process IDs */}
                      <AnimatePresence>
                        {(processLoading || processResults) && (
                          <motion.div variants={fadeUp} initial="hidden" animate="show" exit="exit" className={`${GLASS} p-6`}>
                            <SectionHeader
                              icon={<SearchOutlined />}
                              title="Matching Process IDs"
                              subtitle="Select the correct Process ID for this tyre"
                              extra={processResults && <Tag color="blue" className="!rounded-full">{processResults.length} match{processResults.length !== 1 ? "es" : ""}</Tag>}
                            />
                            <Table
                              rowKey="processId"
                              size="middle"
                              loading={processLoading}
                              columns={processColumns}
                              dataSource={processResults || []}
                              pagination={false}
                              scroll={{ x: 1200 }}
                              locale={{ emptyText: <Empty description="No matching Process IDs for this specification" /> }}
                              rowSelection={{
                                type: "radio",
                                selectedRowKeys: selectedProcess ? [selectedProcess.processId] : [],
                                onChange: (_, rows) => setSelectedProcess(rows[0] || null),
                                getCheckboxProps: (r) => ({ disabled: r.processId === tyre.processId }),
                              }}
                              onRow={(r) => ({
                                onClick: () => {
                                  if (r.processId === tyre.processId) { msg.error("This is the tyre's current Process ID — select a different one."); return; }
                                  setSelectedProcess(r);
                                },
                                className: `cursor-pointer transition-colors ${r.processId === tyre.processId ? "opacity-45" : ""} ${selectedProcess?.processId === r.processId ? "!bg-blue-50 dark:!bg-blue-500/10" : ""}`,
                              })}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Step 5 — Comparison */}
                      <AnimatePresence>
                        {selectedProcess && (
                          <motion.div variants={fadeUp} initial="hidden" animate="show" exit="exit" className={`${GLASS} p-6`}>
                            <SectionHeader
                              icon={<SwapRightOutlined />}
                              title="Specification Comparison"
                              subtitle="Review the changes before proceeding"
                            />
                            <div className="mb-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/40 sm:flex-row sm:justify-center sm:gap-6">
                              <div className="text-center">
                                <div className="text-[12px] uppercase tracking-wide text-slate-400">Old Process ID</div>
                                <div className="mt-1 rounded-xl bg-slate-200/80 px-5 py-2 text-[16px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">{tyre.processId}</div>
                              </div>
                              <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                                className="text-2xl text-blue-500">
                                <SwapRightOutlined className="hidden sm:block" />
                                <ArrowDownOutlined className="sm:hidden" />
                              </motion.div>
                              <div className="text-center">
                                <div className="text-[12px] uppercase tracking-wide text-blue-500">New Process ID</div>
                                <div className="mt-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-[16px] font-bold text-white shadow-lg shadow-blue-600/25">{selectedProcess.processId}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                              {FIELD_ORDER.map((f, i) => {
                                const isChanged = tyre[f] !== selectedProcess[f];
                                return (
                                  <motion.div key={f}
                                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className={`rounded-xl border p-3.5 ${isChanged
                                      ? "border-emerald-300 bg-emerald-50/80 dark:border-emerald-600/50 dark:bg-emerald-500/10"
                                      : "border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-800/40"}`}>
                                    <div className="flex items-center justify-between text-[12px] font-medium text-slate-500 dark:text-slate-400">
                                      {FIELD_LABELS[f]}
                                      {isChanged
                                        ? <Tag color="green" className="!m-0 !rounded-full !text-[10px] !leading-4">Changed</Tag>
                                        : <Tag className="!m-0 !rounded-full !text-[10px] !leading-4">Same</Tag>}
                                    </div>
                                    <div className={`mt-1.5 text-[13px] ${isChanged ? "text-slate-400 line-through" : "font-medium"}`}>{tyre[f]}</div>
                                    {isChanged && <div className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">{selectedProcess[f]}</div>}
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Step 6 — Reason */}
                      <AnimatePresence>
                        {selectedProcess && (
                          <motion.div variants={fadeUp} initial="hidden" animate="show" exit="exit" className={`${GLASS} p-6`}>
                            <SectionHeader
                              icon={<FormOutlined />}
                              title="Reason for Modification"
                              subtitle="Mandatory — minimum 20 characters. This is stored permanently in the audit log."
                            />
                            <Input.TextArea
                              rows={3}
                              maxLength={500}
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder="e.g. Wrong mould selected during size changeover on curing press CURING-08…"
                              className="!rounded-xl"
                              status={reason && !reasonValid ? "warning" : ""}
                            />
                            <div className="mt-2 flex items-center justify-between text-[12px]">
                              <span className={reasonValid ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
                                {reasonValid ? <><CheckCircleFilled /> Reason accepted</> : `${Math.max(0, 20 - reason.trim().length)} more characters required`}
                              </span>
                              <span className="text-slate-400">{reason.length}/500</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {["Wrong mould selected", "Wrong component loaded", "Production setup mistake", "Incorrect tyre specification"].map((s) => (
                                <Tag key={s} onClick={() => setReason(`${s} — `)}
                                  className="!cursor-pointer !rounded-full !border-dashed !px-3 !py-0.5 hover:!border-blue-400 hover:!text-blue-500">
                                  {s}
                                </Tag>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky action footer */}
          <AnimatePresence>
            {modifiable && (
              <motion.div
                initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80"
              >
                <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-3.5">
                  <div className="flex items-center gap-2 text-[13px]">
                    <Tag className="!m-0">{tyre.processId}</Tag>
                    <SwapRightOutlined className="text-slate-400" />
                    {selectedProcess
                      ? <Tag color="blue" className="!m-0 !font-semibold">{selectedProcess.processId}</Tag>
                      : <span className="text-slate-400">Select a Process ID</span>}
                    {selectedProcess && <span className="ml-2 hidden text-slate-400 sm:inline">{changedFields.length} field{changedFields.length !== 1 ? "s" : ""} will change</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => { setTyre(null); setBarcodeInput(""); setSearchError(null); resetFlow(); }}>Cancel</Button>
                    <Tooltip title={!canSubmit ? (!selectedProcess ? "Select a new Process ID" : !reasonValid ? "Enter a reason (min 20 characters)" : "") : ""}>
                      <motion.div whileHover={canSubmit ? { scale: 1.03 } : {}} whileTap={canSubmit ? { scale: 0.97 } : {}}>
                        <Button type="primary" size="large" disabled={!canSubmit} onClick={() => setPreviewOpen(true)}
                          className="!rounded-xl !px-6 !shadow-lg !shadow-blue-600/25">
                          Preview & Modify
                        </Button>
                      </motion.div>
                    </Tooltip>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 7 — Preview modal */}
          <Modal
            open={previewOpen}
            onCancel={() => !submitting && setPreviewOpen(false)}
            title={<span className="text-[16px] font-semibold">Confirm Process Modification</span>}
            width={640}
            centered
            footer={[
              <Button key="cancel" disabled={submitting} onClick={() => setPreviewOpen(false)}>Cancel</Button>,
              <Button key="confirm" type="primary" loading={submitting} onClick={handleConfirm} className="!shadow-lg !shadow-blue-600/25">
                Confirm Modification
              </Button>,
            ]}
          >
            {tyre && selectedProcess && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <div className="text-center">
                    <div className="text-[11px] uppercase tracking-wide text-slate-400">Current Process</div>
                    <div className="mt-1 rounded-lg bg-slate-200/80 px-4 py-1.5 font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">{tyre.processId}</div>
                  </div>
                  <SwapRightOutlined className="text-xl text-blue-500" />
                  <div className="text-center">
                    <div className="text-[11px] uppercase tracking-wide text-blue-500">New Process</div>
                    <div className="mt-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 font-bold text-white">{selectedProcess.processId}</div>
                  </div>
                </div>
                <Descriptions bordered size="small" column={1}
                  items={[
                    { key: "b", label: "Barcode", children: <span className="font-semibold">{tyre.barcode}</span> },
                    { key: "cf", label: "Changed Fields", children:
                        changedFields.length
                          ? <div className="flex flex-wrap gap-1.5">{changedFields.map((f) => (
                              <Tag key={f} color="green" className="!m-0">{FIELD_LABELS[f]}: {tyre[f]} → {selectedProcess[f]}</Tag>
                            ))}</div>
                          : <Text type="secondary">No specification changes</Text> },
                    { key: "r", label: "Reason", children: reason.trim() },
                  ]}
                />
                {needsSupervisor && (
                  <Alert type="warning" showIcon message="This modification will be sent for supervisor approval." className="!rounded-xl" />
                )}
                <Alert type="info" showIcon message="This action is recorded in the audit history and cannot be undone." className="!rounded-xl" />
              </div>
            )}
          </Modal>

          {/* Audit history drawer */}
          <Drawer
            open={auditOpen}
            onClose={() => setAuditOpen(false)}
            width={Math.min(1100, typeof window !== "undefined" ? window.innerWidth - 48 : 1100)}
            title={
              <div className="flex items-center gap-2">
                <HistoryOutlined className="text-blue-500" />
                <span>Modification Audit History</span>
                <Tag color="blue" className="!rounded-full">{audit.length} records</Tag>
              </div>
            }
          >
            <Table
              rowKey="key"
              size="middle"
              columns={auditColumns}
              dataSource={audit}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              scroll={{ x: 1250 }}
            />
          </Drawer>
        </div>
      </div>
    </ConfigProvider>
  );
}