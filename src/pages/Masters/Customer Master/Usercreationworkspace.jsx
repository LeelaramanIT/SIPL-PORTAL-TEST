import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Form,
  Input,
  Select,
  Radio,
  InputNumber,
  Segmented,
  Button,
  Modal,
  message,
  notification,
  Switch,
  Tooltip,
  Empty,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  KeyRound,
  Mail,
  DollarSign,
  MapPin,
  Users,
  UserCheck,
  UserX,
  CreditCard,
  FileText,
  ClipboardList,
  Save,
  RotateCcw,
  Circle,
  ShieldCheck,
  ShieldOff,
  Wallet,
  Landmark,
  Package,
  CalendarClock,
  CheckCircle2,
  Info,
  Search,
  Download,
  RefreshCw,
  Copy,
  Trash2,
  MousePointerClick,
  Sparkles,
  Filter,
  X,
} from "lucide-react";

import { SectionHeader, COUNTRIES, CITIES, PRICE_UNITS } from "./Customermasterpage";
import { useSelector, useDispatch } from "react-redux";
import {
  getCustomers,
  getCustomerUsers,
  createCustomerUser,
  updateCustomerUser,
  deleteCustomerUser,
} from "../../../Redux/Slices/Master/CustomerMaster/CustomerMasterSlice";
import { formatDateTime } from "../../../utils/FormatDate";

const { TextArea } = Input;

/* ------------------------------------------------------------------ */
/* Static config — unchanged from the previous implementation          */
/* ------------------------------------------------------------------ */
const PAYMENT_MODE_OPTIONS = [
  { value: "Advance", title: "Advance", helper: "Full or partial payment received before dispatch.", icon: Wallet, accent: "copper" },
  { value: "LC", title: "Letter of Credit (LC)", helper: "Bank-guaranteed payment terms for trade finance.", icon: Landmark, accent: "plum" },
  { value: "Payment Against Shipping Documents", title: "Against Shipping Documents", helper: "Settled on presentation of shipping documents.", icon: Package, accent: "moss" },
  { value: "Open Credit From Date Of BL", title: "Open Credit From Date of BL", helper: "Credit period starts from the Bill of Lading date.", icon: CalendarClock, accent: "clay" },
];

const CARD_ACCENTS = {
  copper: { border: "border-[var(--copper-500)]", bg: "bg-[var(--copper-50)]", chip: "bg-[var(--copper-100)] text-[var(--copper-700)]" },
  plum: { border: "border-[var(--plum-600)]", bg: "bg-[var(--plum-100)]/50", chip: "bg-[var(--plum-100)] text-[var(--plum-600)]" },
  moss: { border: "border-[var(--moss-600)]", bg: "bg-[var(--moss-100)]/50", chip: "bg-[var(--moss-100)] text-[var(--moss-600)]" },
  clay: { border: "border-[var(--clay-600)]", bg: "bg-[var(--clay-100)]/50", chip: "bg-[var(--clay-100)] text-[var(--clay-600)]" },
};

const LC_TERMS = ["At Sight", "30 Days", "60 Days", "90 Days", "120 Days", "150 Days", "Other Days"];
const CREDIT_PERIODS = ["30 Days", "60 Days", "90 Days", "120 Days", "150 Days", "Other Days"];

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.28, ease: "easeOut" } }),
};

/* ------------------------------------------------------------------ */
/* Payload / mapping helpers — logic ported 1:1 from UserCreation.jsx  */
/* ------------------------------------------------------------------ */
function buildCustomerUserPayload(values, selectedRecord, customersList) {
  const selectedCust = customersList.find(
    (c) => c.custname === (values.customer || values.custFullName)
  );
  const finalCustCode = selectedCust ? selectedCust.custcode : values.custCode || selectedRecord?.custCode || "";

  let expPayTime = "";
  let paymentDays = 0;

  if (values.paymentMode === "Advance") {
    expPayTime = values.advanceType || "";
  } else if (values.paymentMode === "LC") {
    expPayTime = values.lcTerm || "";
    paymentDays = values.lcTerm === "Other Days" ? values.lcOtherDays || 0 : 0;
  } else if (values.paymentMode === "Open Credit From Date Of BL") {
    expPayTime = values.creditPeriod || "";
    paymentDays = values.creditPeriod === "Other Days" ? values.creditOtherDays || 0 : 0;
  }

  const payload = {
    custCode: finalCustCode,
    payTermsID: values.payTermsID || 0,
    userName: values.userId || values.userName || "",
    userPassword: values.password || "",
    userMail: values.email || values.userMail || "",
    userMobile: values.userMobile || "",
    userCurrency: values.currency || values.userCurrency || "",
    userStatus: values.status === "Active" || values.userStatus === true,
    appUserName: values.appUserName || values.userId || values.userName || "",
    custFullName: values.customer || values.custFullName || "",
    paymentTerms: values.paymentTerms || "",
    exciseDuty: values.exciseDuty || 0,
    cstPer: values.cstPer || 0,
    vatPer1: values.vatPer1 || 0,
    vatPer2: values.vatPer2 || 0,
    tinNo: values.tinNo || "",
    cstNo: values.cstNo || "",
    custInstruction: values.instructions || values.custInstruction || "",
    eccNo: values.eccNo || "",
    eccDetails: values.eccDetails || "",
    creditNote: values.creditNote !== undefined ? values.creditNote : true,
    custCategory: values.category || values.custCategory || "",
    lead: values.lead || "",
    supervisor: values.supervisor || "",
    manager: values.manager || "",
    expPayMode: values.paymentMode || values.expPayMode || "",
    expPayTime,
    paymentDays,
    region: values.region || "",
    custHoldStatus: values.custHoldStatus !== undefined ? values.custHoldStatus : true,
    custType: values.category || values.custType || "",
    city: values.city || "",
    country: values.country || "",
    specialDesc: values.specialDesc || "",
    salesLimit: values.salesLimit || 0,
    tcsTax: values.tcsTax || 0,
    iT_REMARKS: values.iT_REMARKS || "",
  };

  if (selectedRecord?.id) {
    payload.id = selectedRecord.id;
  }

  return payload;
}

function mapApiRecordToForm(record) {
  return {
    ...record,
    customer: record.custFullName,
    userId: record.userName,
    email: record.userMail,
    currency: record.userCurrency,
    status: record.userStatus ? "Active" : "Disabled",
    category: record.custType,
    instructions: record.custInstruction,
    paymentMode: record.expPayMode,
    advanceType: record.expPayMode === "Advance" ? record.expPayTime : undefined,
    lcTerm: record.expPayMode === "LC" ? record.expPayTime : undefined,
    lcOtherDays: record.expPayMode === "LC" && record.expPayTime === "Other Days" ? record.paymentDays : undefined,
    creditPeriod: record.expPayMode === "Open Credit From Date Of BL" ? record.expPayTime : undefined,
    creditOtherDays: record.expPayMode === "Open Credit From Date Of BL" && record.expPayTime === "Other Days" ? record.paymentDays : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Left rail — one row per customer-user, click to load into panel     */
/* ------------------------------------------------------------------ */
function CustomerUserRail({ dataSource, loading, selectedId, onSelect, onNew, onRefresh }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return dataSource.filter((item) => {
      const matchesText =
        !needle ||
        [item.custFullName, item.custCode, item.userName, item.appUserName, item.userMail, item.userMobile, item.region, item.custType]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(needle));
      const matchesStatus =
        statusFilter === "All" || (statusFilter === "Active" ? item.userStatus : !item.userStatus);
      return matchesText && matchesStatus;
    });
  }, [dataSource, q, statusFilter]);

  return (
    <div className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--canvas-raised)]">
      {/* Search + quick actions */}
      <div className="shrink-0 space-y-2 border-b border-[var(--border)] p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-400)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, code, user, email, mobile…"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] py-1.5 pl-8 pr-2 text-[12.5px] text-[var(--ink-950)] outline-none transition-colors focus:border-[var(--copper-500)]"
            />
          </div>
          <Tooltip title="Filters">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${showFilters ? "border-[var(--copper-500)] bg-[var(--copper-100)] text-[var(--copper-700)]" : "border-[var(--border)] text-[var(--ink-500)] hover:bg-[var(--ink-100)]"}`}
            >
              <Filter size={14} />
            </button>
          </Tooltip>
          <Tooltip title="Refresh">
            <button onClick={onRefresh} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--ink-500)] transition-colors hover:bg-[var(--ink-100)]">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </Tooltip>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <Segmented
                block
                size="small"
                value={statusFilter}
                onChange={setStatusFilter}
                options={["All", "Active", "Inactive"]}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="primary"
          block
          icon={<UserPlus size={14} />}
          onClick={onNew}
          className="!bg-[var(--ink-950)] hover:!bg-[var(--ink-800)] border-none text-white font-medium"
        >
          New User
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && !loading && (
          <div className="flex h-full items-center justify-center p-6 text-center text-[12px] text-[var(--ink-400)]">
            No matching customer users.
          </div>
        )}
        {filtered.map((item, i) => {
          const active = selectedId === item.id;
          return (
            <motion.button
              key={item.id}
              custom={i}
              variants={fadeIn}
              initial="hidden"
              animate="show"
              onClick={() => onSelect(item)}
              className={`block w-full border-b border-[var(--border)] px-3 py-2.5 text-left transition-colors ${
                active ? "bg-[var(--copper-100)]/70" : "hover:bg-[var(--ink-100)]/70"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="cm-serif truncate text-[13px] font-medium text-[var(--ink-950)]">{item.custFullName || "Unnamed customer"}</p>
                <Circle size={6} className={item.userStatus ? "fill-[var(--moss-600)] text-[var(--moss-600)]" : "fill-[var(--clay-600)] text-[var(--clay-600)]"} />
              </div>
              <p className="truncate text-[11px] text-[var(--ink-500)]">
                {item.custCode} · {item.userName || "no user id"}
              </p>
              <p className="truncate text-[10.5px] text-[var(--ink-400)]">{item.userMail || "—"}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sticky summary strip at the top of the right panel                  */
/* ------------------------------------------------------------------ */
function SummaryStrip({ values, isNew, dirty, lastUpdated }) {
  const items = [
    { label: "Customer", value: values.customer || values.custFullName || (isNew ? "New user" : "—") },
    { label: "Status", value: values.status || "Active" },
    { label: "Region", value: values.region || "—" },
    { label: "Currency", value: values.currency || values.userCurrency || "—" },
    { label: "Payment", value: PAYMENT_MODE_OPTIONS.find((o) => o.value === values.paymentMode)?.title || values.paymentMode || "—" },
    { label: "Updated", value: isNew ? "Not saved" : lastUpdated ? formatDateTime(lastUpdated) : "—" },
  ];
  return (
    <div className="sticky top-0 z-10 grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-[var(--border)] bg-[var(--background)]/95 px-5 py-3 backdrop-blur-md sm:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <p className="cm-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-400)]">{it.label}</p>
          <p className="truncate text-[12px] font-medium text-[var(--ink-950)]">{it.value}</p>
        </div>
      ))}
      {dirty && (
        <span className="col-span-full mt-1 flex items-center gap-1.5 text-[10.5px] font-medium text-[var(--copper-600)]">
          <Circle size={6} className="fill-[var(--copper-600)] text-[var(--copper-600)]" />
          Unsaved changes
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state — shown when nothing is selected and not creating       */
/* ------------------------------------------------------------------ */
function WorkspaceEmptyState({ onNew }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--copper-100)] text-[var(--copper-600)]">
        <MousePointerClick size={22} />
      </div>
      <div>
        <p className="cm-serif text-[15px] font-medium text-[var(--ink-950)]">Select a customer to view or edit their user</p>
        <p className="mt-1 max-w-xs text-[12px] text-[var(--ink-500)]">
          Pick a record from the list on the left, or start a fresh profile.
        </p>
      </div>
      <Button type="primary" icon={<Sparkles size={14} />} onClick={onNew} className="!bg-[var(--ink-950)] hover:!bg-[var(--ink-800)] border-none text-white mt-1">
        Create New User
      </Button>
    </div>
  );
}

function PaymentModeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PAYMENT_MODE_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        const a = CARD_ACCENTS[opt.accent];
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange?.(opt.value)}
            aria-pressed={selected}
            className={`group relative flex items-start gap-3 rounded-xl border border-[var(--border)] p-4 text-left transition-all duration-200 ${
              selected ? `${a.border} ${a.bg} shadow-[var(--shadow-card)]` : "border-[var(--ink-200)] bg-[var(--canvas-raised)] hover:border-[var(--ink-300)] hover:-translate-y-0.5"
            }`}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.chip}`}><Icon size={16} /></div>
            <div className="min-w-0 pr-4">
              <p className="cm-serif text-[13.5px] font-medium leading-tight text-[var(--ink-950)]">{opt.title}</p>
              <p className="mt-1 text-[11px] leading-snug text-[var(--ink-500)]">{opt.helper}</p>
            </div>
            {selected && <CheckCircle2 size={16} className="absolute right-3 top-3 text-[var(--copper-600)]" />}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Right panel — the always-mounted form (create OR edit OR blank)     */
/* ------------------------------------------------------------------ */
function DetailPanel({
  form,
  isNew,
  selectedRecord,
  dirty,
  saving,
  onValuesChange,
  onFinish,
  onReset,
  onCancel,
  onDelete,
  onStatusToggle,
  customerOptions,
  custTypeOptions,
  regionOptions,
  supervisorsOptions,
  leadsOptions,
  managersOptions,
}) {
  const paymentMode = Form.useWatch("paymentMode", form);
  const lcTerm = Form.useWatch("lcTerm", form);
  const creditPeriod = Form.useWatch("creditPeriod", form);
  const status = Form.useWatch("status", form);
  const formValues = Form.useWatch([], form) || {};

  return (
    <div className="flex h-full flex-col">
      <SummaryStrip values={formValues} isNew={isNew} dirty={dirty} lastUpdated={selectedRecord?.lastLogin || selectedRecord?.createdDate} />

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
        <Form form={form} layout="vertical" requiredMark={false} onValuesChange={onValuesChange} onFinish={onFinish}>
          <div className="space-y-5">
            <motion.div variants={fadeIn} custom={0} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
              <SectionHeader icon={UserPlus} title="Customer Information" accent="copper" index="01" />

              <Form.Item name="customer" label="Customer" rules={[{ required: true, message: "Customer link is required" }]}>
                <Select size="middle" showSearch allowClear placeholder="Choose a customer" options={customerOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>

              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <Form.Item name="userId" label="User ID" rules={[{ required: true, message: "User ID is required" }]}>
                  <Input size="middle" placeholder="e.g. unique_user_id" />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: isNew, message: "Password is required" },
                    { min: 8, message: "Minimum 8 characters" },
                  ]}
                >
                  <Input.Password size="middle" placeholder={isNew ? "Set a password" : "Leave blank to keep current"} prefix={<KeyRound size={14} className="mr-1 text-[var(--ink-500)]" />} />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Enter a valid email" }]}>
                  <Input size="middle" placeholder="name@company.com" prefix={<Mail size={14} className="mr-1 text-[var(--ink-500)]" />} />
                </Form.Item>
                <Form.Item name="currency" label="Price Unit">
                  <Select size="middle" showSearch allowClear placeholder="Select currency" options={PRICE_UNITS} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} suffixIcon={<DollarSign size={14} className="text-[var(--ink-500)]" />} />
                </Form.Item>
              </div>

              <Form.Item name="status" label="Profile Status" initialValue="Active" className="!mb-0">
                <div className="flex items-center gap-2.5">
                  <Switch
                    checked={status === "Active"}
                    disabled={isNew}
                    onChange={(checked) => onStatusToggle(checked)}
                  />
                  <span className={`flex items-center gap-1.5 text-[12.5px] font-medium ${status === "Active" ? "text-[var(--moss-700)]" : "text-[var(--clay-700)]"}`}>
                    {status === "Active" ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                    {status === "Active" ? "Active" : "Inactive"}
                  </span>
                  {isNew && <span className="text-[11px] text-[var(--ink-400)]">(available after first save)</span>}
                </div>
              </Form.Item>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <motion.div variants={fadeIn} custom={1} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                <SectionHeader icon={Users} title="Sales Hierarchy" accent="plum" index="02" />
                <div className="space-y-1">
                  <Form.Item name="category" label="Customer Category" rules={[{ required: true, message: "Required" }]}>
                    <Select size="middle" placeholder="Select category" options={custTypeOptions} />
                  </Form.Item>
                  <Form.Item name="supervisor" label="Assigned Supervisor" rules={[{ required: true, message: "Required" }]}>
                    <Select size="middle" showSearch allowClear placeholder="Select supervisor" options={supervisorsOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                  </Form.Item>
                  <Form.Item name="lead" label="Team Leader" rules={[{ required: true, message: "Required" }]}>
                    <Select size="middle" showSearch allowClear placeholder="Select team leader" options={leadsOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                  </Form.Item>
                  <Form.Item name="manager" label="Senior Business Manager" rules={[{ required: true, message: "Required" }]}>
                    <Select size="middle" showSearch allowClear placeholder="Select manager" options={managersOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                  </Form.Item>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} custom={2} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                <SectionHeader icon={MapPin} title="Region & Logistics" accent="clay" index="03" />
                <div className="space-y-1">
                  <Form.Item name="country" label="Country" rules={[{ required: true, message: "Required" }]}>
                    <Select size="middle" showSearch allowClear placeholder="Select country" options={COUNTRIES} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                  </Form.Item>
                  <Form.Item name="city" label="City" rules={[{ required: true, message: "Required" }]}>
                    <Select size="middle" showSearch allowClear placeholder="Select city" options={CITIES} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                  </Form.Item>
                  <Form.Item name="region" label="Region">
                    <Select size="middle" allowClear placeholder="Select region" options={regionOptions} />
                  </Form.Item>
                </div>
              </motion.div>
            </div>

            <motion.div variants={fadeIn} custom={3} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
              <SectionHeader icon={CreditCard} title="Commercial Information" accent="moss" index="04" />
              <Form.Item name="paymentMode" label="Payment Mode" rules={[{ required: true, message: "Required" }]} className="!mb-4">
                <PaymentModeSelector />
              </Form.Item>

              <AnimatePresence mode="wait">
                {paymentMode && (
                  <motion.div key={paymentMode} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="mt-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--ink-100)]/60 p-4">
                      {paymentMode === "Advance" && (
                        <Form.Item name="advanceType" label="Advance Type" rules={[{ required: true, message: "Required" }]} className="!mb-0 max-w-xs">
                          <Segmented options={["Full", "Partial"]} block />
                        </Form.Item>
                      )}

                      {paymentMode === "LC" && (
                        <>
                          <Form.Item name="lcTerm" label="LC Term" rules={[{ required: true, message: "Required" }]} className="!mb-0">
                            <Radio.Group className="flex flex-wrap gap-2">
                              {LC_TERMS.map((t) => <Radio.Button key={t} value={t} className="rounded-lg">{t}</Radio.Button>)}
                            </Radio.Group>
                          </Form.Item>
                          <AnimatePresence>
                            {lcTerm === "Other Days" && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-4">
                                <Form.Item name="lcOtherDays" label="Custom Days" rules={[{ required: true, message: "Required" }, { type: "integer", min: 1, message: "Must be a positive integer" }]} className="!mb-0 max-w-xs">
                                  <InputNumber size="middle" min={1} precision={0} placeholder="Days" className="w-full" />
                                </Form.Item>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}

                      {paymentMode === "Payment Against Shipping Documents" && (
                        <p className="flex items-center gap-2 text-[12px] text-[var(--ink-500)]">
                          <Info size={14} className="shrink-0" /> No additional fields required for this payment mode.
                        </p>
                      )}

                      {paymentMode === "Open Credit From Date Of BL" && (
                        <>
                          <Form.Item name="creditPeriod" label="Credit Period" rules={[{ required: true, message: "Required" }]} className="!mb-0">
                            <Radio.Group className="flex flex-wrap gap-2">
                              {CREDIT_PERIODS.map((t) => <Radio.Button key={t} value={t} className="rounded-lg">{t}</Radio.Button>)}
                            </Radio.Group>
                          </Form.Item>
                          <AnimatePresence>
                            {creditPeriod === "Other Days" && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-4">
                                <Form.Item name="creditOtherDays" label="Custom Days" rules={[{ required: true, message: "Required" }, { type: "integer", min: 1, message: "Must be a positive integer" }]} className="!mb-0 max-w-xs">
                                  <InputNumber size="middle" min={1} precision={0} placeholder="Days" className="w-full" />
                                </Form.Item>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <motion.div variants={fadeIn} custom={4} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                <SectionHeader icon={FileText} title="Payment Terms" accent="ochre" index="05" />
                <Form.Item name="paymentTerms" className="!mb-0">
                  <TextArea rows={4} placeholder="Legal / commercial payment terms text…" />
                </Form.Item>
              </motion.div>
              <motion.div variants={fadeIn} custom={5} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                <SectionHeader icon={ClipboardList} title="Additional Instructions" accent="copper" index="06" />
                <Form.Item name="instructions" className="!mb-0">
                  <TextArea rows={4} placeholder="Special notes or handling instructions…" />
                </Form.Item>
              </motion.div>
            </div>
          </div>
        </Form>
      </div>

      {/* Bottom action bar — only visible when there's something to act on */}
      <AnimatePresence>
        {(dirty || isNew) && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--background)] px-5 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
          >
            <p className="flex items-center gap-1.5 cm-mono text-[10.5px] text-[var(--ink-500)]">
              <Circle size={6} className="fill-[var(--copper-600)] text-[var(--copper-600)] animate-pulse" />
              {isNew ? "New profile — not yet saved" : "Unsaved changes"}
            </p>
            <div className="flex items-center gap-2">
              {!isNew && (
                <Tooltip title="Delete this user">
                  <Button danger size="middle" icon={<Trash2 size={13} />} onClick={onDelete} disabled={saving} />
                </Tooltip>
              )}
              <Button size="middle" onClick={onCancel} disabled={saving}>Cancel</Button>
              <Button size="middle" icon={<RotateCcw size={13} />} onClick={onReset} disabled={saving}>Reset</Button>
              <Button
                type="primary"
                size="middle"
                onClick={() => form.submit()}
                loading={saving}
                disabled={saving}
                icon={<Save size={14} />}
                className="!bg-[var(--ink-950)] hover:!bg-[var(--ink-800)] border-none text-white font-medium min-w-[110px]"
              >
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component — one workspace, no view-mode switching               */
/* ------------------------------------------------------------------ */
export default function UserCreationWorkspace() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const customersData = useSelector((state) => state.customerMaster.listOfCustomerUsers || []);
  const loadingUsers = useSelector((state) => state.customerMaster.loadingUsers);
  const customersList = useSelector((state) => state.customerMaster.listOfCustomer || []);

  // selectedRecord === null && !isNew  -> empty state
  // isNew === true                      -> blank create form
  // selectedRecord set                  -> editing that record
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null); // boolean (true = activate)
  const [statusSaving, setStatusSaving] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(getCustomers());
    dispatch(getCustomerUsers());
  }, [dispatch]);

  const customerOptions = customersList.map((c) => ({
    value: c.custname,
    label: `${c.custcode} - ${c.custname}`,
    custcode: c.custcode,
  }));

  const uniqueCustTypes = [...new Set(customersData.map((item) => item.custType).filter(Boolean))];
  const custTypeOptions = uniqueCustTypes.length
    ? uniqueCustTypes.map((v) => ({ value: v, label: v }))
    : ["Wholesale", "Retail", "Corporate", "Export", "OEM"].map((v) => ({ value: v, label: v }));

  const uniqueRegions = [...new Set(customersData.map((item) => item.region).filter(Boolean))];
  const regionOptions = uniqueRegions.length
    ? uniqueRegions.map((v) => ({ value: v, label: v }))
    : ["North", "South", "East", "West", "Central"].map((v) => ({ value: v, label: v }));

  const uniqueSupervisors = [...new Set(customersData.map((item) => item.supervisor).filter(Boolean))];
  const supervisorsOptions = uniqueSupervisors.length
    ? uniqueSupervisors.map((v) => ({ value: v, label: v }))
    : ["R. Kumar", "S. Priya", "A. Raghavan"].map((v) => ({ value: v, label: v }));

  const uniqueLeads = [...new Set(customersData.map((item) => item.lead).filter(Boolean))];
  const leadsOptions = uniqueLeads.length
    ? uniqueLeads.map((v) => ({ value: v, label: v }))
    : ["N. Sharma", "V. Iyer", "K. Balaji"].map((v) => ({ value: v, label: v }));

  const uniqueManagers = [...new Set(customersData.map((item) => item.manager).filter(Boolean))];
  const managersOptions = uniqueManagers.length
    ? uniqueManagers.map((v) => ({ value: v, label: v }))
    : ["M. Ganesan", "P. Lakshmi", "T. Venkat"].map((v) => ({ value: v, label: v }));

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: customersData.length,
      active: customersData.filter((c) => c.userStatus === true).length,
      inactive: customersData.filter((c) => c.userStatus === false).length,
      today: customersData.filter((c) => c.createdDate && new Date(c.createdDate).toDateString() === today).length,
    };
  }, [customersData]);

  const guardNavigation = useCallback(
    (proceed) => {
      if (dirty && !window.confirm("You have unsaved changes. Discard them?")) return;
      proceed();
    },
    [dirty]
  );

  const handleSelectCustomerUser = (record) => {
    guardNavigation(() => {
      form.resetFields();
      form.setFieldsValue(mapApiRecordToForm(record));
      setSelectedRecord(record);
      setIsNew(false);
      setDirty(false);
    });
  };

  const handleNewUser = () => {
    guardNavigation(() => {
      form.resetFields();
      form.setFieldsValue({ status: "Active" });
      setSelectedRecord(null);
      setIsNew(true);
      setDirty(false);
    });
  };

  const handleValuesChange = (changedValues) => {
    setDirty(true);
    if (Object.prototype.hasOwnProperty.call(changedValues, "customer")) {
      const selectedCust = customersList.find((c) => c.custname === changedValues.customer);
      form.setFieldsValue({ custCode: selectedCust ? selectedCust.custcode : undefined });
    }
    if (Object.prototype.hasOwnProperty.call(changedValues, "paymentMode")) {
      form.setFieldsValue({ advanceType: undefined, lcTerm: undefined, lcOtherDays: undefined, creditPeriod: undefined, creditOtherDays: undefined });
    }
    if (Object.prototype.hasOwnProperty.call(changedValues, "lcTerm") && changedValues.lcTerm !== "Other Days") {
      form.setFieldsValue({ lcOtherDays: undefined });
    }
    if (Object.prototype.hasOwnProperty.call(changedValues, "creditPeriod") && changedValues.creditPeriod !== "Other Days") {
      form.setFieldsValue({ creditOtherDays: undefined });
    }
  };

  const handleReset = () => {
    if (selectedRecord) {
      form.setFieldsValue(mapApiRecordToForm(selectedRecord));
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "Active" });
    }
    setDirty(false);
  };

  const handleCancel = () => {
    guardNavigation(() => {
      form.resetFields();
      setSelectedRecord(null);
      setIsNew(false);
      setDirty(false);
    });
  };

  const handleStatusToggle = (checked) => {
    if (isNew) return; // status only meaningful once the record exists
    setPendingStatus(checked);
    setStatusConfirmOpen(true);
  };

  const executeStatusChange = async () => {
    if (!selectedRecord) return;
    setStatusSaving(true);
    try {
      await dispatch(updateCustomerUser({ id: selectedRecord.id, userStatus: pendingStatus }));
      message.success(`User ${pendingStatus ? "activated" : "deactivated"} successfully.`);
      notification.success({
        message: pendingStatus ? "User Activated" : "User Deactivated",
        description: `${selectedRecord.userName} is now ${pendingStatus ? "active" : "inactive"}.`,
        placement: "topRight",
      });
      form.setFieldsValue({ status: pendingStatus ? "Active" : "Disabled" });
      setSelectedRecord((prev) => (prev ? { ...prev, userStatus: pendingStatus } : prev));
      dispatch(getCustomerUsers());
      setStatusConfirmOpen(false);
      setPendingStatus(null);
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      notification.error({ message: "Operation Failed", description: backendMessage || "Failed to update user status.", placement: "topRight" });
      message.error(backendMessage || "Failed to update user status.");
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDelete = () => setDeleteConfirmOpen(true);

  const executeDelete = async () => {
    if (!selectedRecord) return;
    setDeleting(true);
    try {
      await dispatch(deleteCustomerUser(selectedRecord.id));
      message.success("Customer user deleted.");
      dispatch(getCustomerUsers());
      form.resetFields();
      setSelectedRecord(null);
      setIsNew(false);
      setDirty(false);
      setDeleteConfirmOpen(false);
    } catch (err) {
      console.error("Delete failed:", err);
      message.error("Failed to delete the user.");
    } finally {
      setDeleting(false);
    }
  };

  const onFinish = async (values) => {
    if (saving) return;
    setSaving(true);
    const payload = buildCustomerUserPayload(values, selectedRecord, customersList);

    try {
      if (isNew) {
        await dispatch(createCustomerUser(payload));
        message.success("Customer user created successfully.");
        notification.success({ message: "Customer User Created", description: `${payload.userName} has been created successfully.`, placement: "topRight" });
      } else {
        await dispatch(updateCustomerUser(payload));
        message.success("Customer user updated successfully.");
        notification.success({ message: "Customer User Updated", description: `${payload.userName} has been updated successfully.`, placement: "topRight" });
      }

      const refreshed = await dispatch(getCustomerUsers());
      setDirty(false);

      // Keep the record selected after save (per the "stay on record" UX goal)
      const list = refreshed?.payload || [];
      const match = list.find?.((c) => c.userName === payload.userName && c.custFullName === payload.custFullName);
      if (match) {
        setSelectedRecord(match);
        setIsNew(false);
        form.setFieldsValue(mapApiRecordToForm(match));
      } else if (isNew) {
        // Fallback: couldn't identify the freshly created row, just clear to empty state
        form.resetFields();
        setSelectedRecord(null);
        setIsNew(false);
      }
    } catch (err) {
      console.error("Save failed:", err);
      const backendMessage = err?.response?.data?.message;
      notification.error({ message: "Operation Failed", description: backendMessage || "Something went wrong while saving the customer user.", placement: "topRight" });
      message.error(backendMessage || "Failed to save the customer user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cm-scope cm-grain cm-sans flex h-screen w-full flex-col text-[var(--ink-700)]">
      {/* Header */}
      <header className="z-30 shrink-0 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="cm-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-400)]">Master &gt; Customers</p>
            <h1 className="cm-serif text-2xl font-semibold text-[var(--ink-950)]">Customer User Management</h1>
          </div>
          <Button icon={<Download size={13} />} onClick={() => message.info("Exporting records…")}>Export</Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 px-6 pb-4 sm:grid-cols-4">
          {[
            { label: "Total Users", value: stats.total, icon: Users, accent: "copper" },
            { label: "Active Users", value: stats.active, icon: UserCheck, accent: "moss" },
            { label: "Inactive Users", value: stats.inactive, icon: UserX, accent: "clay" },
            { label: "Created Today", value: stats.today, icon: Sparkles, accent: "plum" },
          ].map((s) => {
            const a = CARD_ACCENTS[s.accent];
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 shadow-sm">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${a.chip}`}><Icon size={14} /></div>
                <div className="min-w-0">
                  <p className="cm-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-400)]">{s.label}</p>
                  <p className="cm-serif text-[17px] font-semibold leading-none text-[var(--ink-950)]">{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </header>

      {/* Workspace: left rail (35%) + right detail panel (65%) */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[35%_65%]">
        <CustomerUserRail
          dataSource={customersData}
          loading={loadingUsers}
          selectedId={selectedRecord?.id}
          onSelect={handleSelectCustomerUser}
          onNew={handleNewUser}
          onRefresh={() => dispatch(getCustomerUsers())}
        />

        <div className="relative min-h-0 bg-[var(--background)]">
          {selectedRecord || isNew ? (
            <DetailPanel
              form={form}
              isNew={isNew}
              selectedRecord={selectedRecord}
              dirty={dirty}
              saving={saving}
              onValuesChange={handleValuesChange}
              onFinish={onFinish}
              onReset={handleReset}
              onCancel={handleCancel}
              onDelete={handleDelete}
              onStatusToggle={handleStatusToggle}
              customerOptions={customerOptions}
              custTypeOptions={custTypeOptions}
              regionOptions={regionOptions}
              supervisorsOptions={supervisorsOptions}
              leadsOptions={leadsOptions}
              managersOptions={managersOptions}
            />
          ) : (
            <WorkspaceEmptyState onNew={handleNewUser} />
          )}
        </div>
      </div>

      {/* Status confirm modal */}
      <Modal
        open={statusConfirmOpen}
        title={pendingStatus ? "Activate User" : "Deactivate User"}
        onCancel={() => { setStatusConfirmOpen(false); setPendingStatus(null); }}
        onOk={executeStatusChange}
        confirmLoading={statusSaving}
        okText={pendingStatus ? "Activate" : "Deactivate"}
        okType={pendingStatus ? "primary" : "danger"}
        cancelText="Cancel"
        width="90%"
        style={{ maxWidth: 420 }}
      >
        <p className="text-sm sm:text-base">
          Are you sure you want to {pendingStatus ? "activate" : "deactivate"} <strong>{selectedRecord?.userName}</strong>? This will be saved immediately.
        </p>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={deleteConfirmOpen}
        title="Delete customer user?"
        onCancel={() => setDeleteConfirmOpen(false)}
        onOk={executeDelete}
        confirmLoading={deleting}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        width="90%"
        style={{ maxWidth: 420 }}
      >
        <p className="text-sm sm:text-base">
          Are you sure you want to permanently delete <strong>{selectedRecord?.userName}</strong>, linked to{" "}
          <strong>{selectedRecord?.custFullName}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}