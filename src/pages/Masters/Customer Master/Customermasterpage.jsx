import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Progress, message, Modal } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  User,
  Building2,
  Phone,
  Smartphone,
  Mail,
  Globe,
  MapPin,
  Package,
  Save,
  RotateCcw,
  FileText,
  Anchor,
  Users,
  UserCheck,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Circle,
  Eye,
  Search,
  Printer
} from "lucide-react";

import { useDispatch } from "react-redux";
import { createCustomer, getCustomers, updateCustomer } from "../../../Redux/Slices/Master/CustomerMaster/CustomerMasterSlice";

const { TextArea } = Input;

/* ------------------------------------------------------------------ */
/* Static option lists & Mock Data                                    */
/* ------------------------------------------------------------------ */
export const CUSTOMER_TYPES = ["Dealer", "Distributor", "OEM", "Exporter", "Retailer"].map((v) => ({ value: v, label: v }));
export const COUNTRIES = [
  "India", "United States", "United Kingdom", "United Arab Emirates",
  "Singapore", "Germany", "Sri Lanka", "Bangladesh", "Nepal",
  "Australia", "Canada", "Malaysia", "South Africa", "Kenya", "Nigeria",
].map((v) => ({ value: v, label: v }));
export const CITIES = [
  "Chennai", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Kolkata",
  "Pune", "Coimbatore", "Ahmedabad", "Kochi", "Dubai", "Colombo",
  "Dhaka", "Kathmandu", "Singapore City", "London", "New York",
].map((v) => ({ value: v, label: v }));
export const CHANNELS = ["Direct", "Agent"].map((v) => ({ value: v, label: v }));
export const PRICE_UNITS = ["INR", "USD", "EUR"].map((v) => ({ value: v, label: v }));
export const PRICE_BASIS = ["FOB", "CIF", "EXW", "CNF"].map((v) => ({ value: v, label: v }));
export const LEAD_SOURCES = ["Website", "Sales Team", "Referral", "Advertisement", "Walk-in"].map((v) => ({ value: v, label: v }));

export const URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/;

export const REQUIRED_KEYS = [
  "customerName",
  "customerType",
  "channel",
  "priceUnit",
  "priceBasis",
  "address1",
  "country",
  "city",
];

const getErrorMessage = (error, fallback = "Failed to save customer.") => {
  if (error?.response?.status === 409) {
    return (
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      "Customer already exists."
    );
  }

  const responseData = error?.response?.data ?? error?.data ?? error;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (Array.isArray(responseData) && responseData.length) {
    return responseData.filter(Boolean).join(", ");
  }

  if (responseData?.errors) {
    const validationMessage = Object.values(responseData.errors)
      .flat()
      .filter(Boolean)
      .join("\n");

    if (validationMessage) {
      return validationMessage;
    }
  }

  return (
    responseData?.detail ||
    responseData?.message ||
    responseData?.title ||
    error?.message ||
    fallback
  );
};

const ensureSuccessfulResponse = (response, fallbackMessage) => {
  const body = response?.data ?? response;

  if (
    body?.success === false ||
    body?.status === false ||
    body?.ok === false ||
    body?.isSuccess === false
  ) {
    throw new Error(getErrorMessage({ response: { data: body } }, fallbackMessage));
  }

  return body;
};

/* ------------------------------------------------------------------ */
/* Motion presets                                                     */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ------------------------------------------------------------------ */
/* Section header — numbered                                          */
/* ------------------------------------------------------------------ */
const ACCENTS = {
  copper: { bar: "bg-[var(--primary)]", chip: "bg-[var(--primary)]/10 text-[var(--primary)]" },
  moss: { bar: "bg-[var(--accent)]", chip: "bg-[var(--accent)]/10 text-[var(--accent)]" },
  ochre: { bar: "bg-[var(--destructive)]", chip: "bg-[var(--destructive)]/10 text-[var(--destructive)]" },
  plum: { bar: "bg-[var(--accent)]", chip: "bg-[var(--accent)]/10 text-[var(--accent)]" },
  clay: { bar: "bg-[var(--primary)]", chip: "bg-[var(--primary)]/10 text-[var(--primary)]" },
};

export function SectionHeader({ icon: Icon, title, accent = "copper", index }) {
  const a = ACCENTS[accent] || ACCENTS.copper;
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className={`h-6 w-[3px] rounded-full ${a.bar}`} />
      {index && (
        <span className="font-[family-name:var(--font-secondary)] text-[10px] font-semibold tracking-widest text-[var(--foreground)] opacity-40">
          {index}
        </span>
      )}
      <div className={`flex h-7 w-7 items-center justify-center rounded-full ${a.chip}`}>
        <Icon size={13} strokeWidth={2.2} />
      </div>
      <h2 className="font-[family-name:var(--font-primary)] text-[15px] font-medium text-[var(--foreground)]">{title}</h2>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Metric card                                                        */
/* ------------------------------------------------------------------ */
export function MetricCard({ title, value, delta, icon: Icon, accent, index }) {
  const a = ACCENTS[accent] || ACCENTS.copper;
  const positive = delta >= 0;
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="group relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span className={`absolute left-0 top-0 h-full w-[3px] ${a.bar}`} />
      <div className="flex items-start justify-between pl-2">
        <div>
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] opacity-60">
            {title}
          </p>
          <p className="font-[family-name:var(--font-primary)] mt-1 text-[26px] font-semibold leading-none text-[var(--foreground)]">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${a.chip}`}>
          <Icon size={16} />
        </div>
      </div>
      {typeof delta === "number" && (
        <div className="mt-3 flex items-center gap-1 pl-2 font-[family-name:var(--font-secondary)] text-[10.5px] font-medium">
          {positive ? (
            <ArrowUpRight size={12} className="text-emerald-600" />
          ) : (
            <ArrowDownRight size={12} className="text-[var(--destructive)]" />
          )}
          <span className={positive ? "text-emerald-600" : "text-[var(--destructive)]"}>
            {Math.abs(delta)}%
          </span>
          <span className="text-[var(--foreground)] opacity-60">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Live Expanded Customer Profile View & Printable Panel              */
/* ------------------------------------------------------------------ */
function DetailedCustomerProfile({ values }) {
  const name = values.customerName?.trim() || "New Customer Assignment";
  const initials = values.customerName
    ? values.customerName
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("")
    : "—";

  const DataRow = ({ label, value }) => (
    <div className="flex items-center justify-between border-b border-[var(--border)] py-2 text-xs">
      <span className="font-[family-name:var(--font-secondary)] text-[11px] text-[var(--foreground)] opacity-50">{label}</span>
      <span className="font-medium text-[var(--foreground)] text-right pl-4">{value || "—"}</span>
    </div>
  );

  return (
    <div id="printable-customer-preview" className="bg-[var(--background)] text-[var(--foreground)]">
      {/* Visual Header Banner */}
      <div className="relative overflow-hidden bg-[var(--primary)] p-6 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)",
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 font-[family-name:var(--font-primary)] text-xl font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-secondary)] text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">Master Record Overview</p>
            <h2 className="font-[family-name:var(--font-primary)] truncate text-xl font-semibold leading-tight text-white">{name}</h2>
            <p className="truncate text-xs text-white/60">
              {[values.city, values.country].filter(Boolean).join(", ") || "Location Unassigned"}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Details Layout */}
      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto print:max-h-none print:overflow-visible">
        {/* Section 1 & 2 Group */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h4 className="font-[family-name:var(--font-secondary)] text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mb-2">01. Basic Matrix</h4>
            <DataRow label="Customer Name" value={values.customerName} />
            <DataRow label="Customer Type" value={values.customerType} />
            <DataRow label="Category Status" value={values.category} />
          </div>
          <div>
            <h4 className="font-[family-name:var(--font-secondary)] text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider mb-2">02. Commercial parameters</h4>
            <DataRow label="Distribution Channel" value={values.channel} />
            <DataRow label="Primary Lead Source" value={values.leadSource} />
            <DataRow label="Price Booking Currency" value={values.priceUnit} />
            <DataRow label="Commercial Price Basis" value={values.priceBasis} />
          </div>
        </div>

        {/* Section 3 Contact */}
        <div>
          <h4 className="font-[family-name:var(--font-secondary)] text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider mb-2">03. Associated Contact Record</h4>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            <DataRow label="Key Contact Person" value={values.contactPerson} />
            <DataRow label="Corporate Telephone" value={values.phone} />
            <DataRow label="Mobile Line" value={values.mobile} />
            <DataRow label="Corporate Email" value={values.email} />
            <div className="sm:col-span-2">
              <DataRow label="Web URL Domain" value={values.website} />
            </div>
          </div>
        </div>

        {/* Section 4 Address */}
        <div>
          <h4 className="font-[family-name:var(--font-secondary)] text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mb-2">04. Logistics & Address Routing</h4>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <DataRow label="Address Line 1" value={values.address1} />
              <DataRow label="Address Line 2" value={values.address2} />
              <DataRow label="Address Line 3" value={values.address3} />
            </div>
            <DataRow label="Geographic City" value={values.city} />
            <DataRow label="Geographic Country" value={values.country} />
            <DataRow label="Postal Zip Code" value={values.zipCode} />
            <DataRow label="Destination Terminal Port" value={values.port} />
          </div>
        </div>

        {/* Special Instructions */}
        {values.instructions && (
          <div className="rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 p-3">
            <h4 className="font-[family-name:var(--font-secondary)] text-[10px] font-bold text-[var(--destructive)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText size={12} /> 05. Special Fulfillment Directives
            </h4>
            <p className="text-xs text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
              {values.instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable "card" shell so every panel behaves identically           */
/* ------------------------------------------------------------------ */
function FormCard({ children, className = "", index = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="show"
      className={`flex h-full flex-col rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */
export default function CustomerMasterPage({
  metrics = { total: 1240, active: 1150, prospects: 90, deltaTotal: 4.2, deltaActive: 2.8, deltaProspects: -1.5 },
  onSaveCustomer,
  onSaveDraft,
}) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // UI States
  const [customerMode, setCustomerMode] = useState("NEW"); // NEW | EXISTING
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Declarative replacement for window.confirm() — holds the pending action
  // (mode change or cancel) so the shared confirmation Modal below can run
  // it only if the user confirms.
  const [pendingDiscardAction, setPendingDiscardAction] = useState(null); // { message, onConfirm }

  const customers = useSelector(
    (state) => state.customerMaster.listOfCustomer // change according to your slice
  );
  const username = useSelector(
    (state) => state.auth.username
  );

  const dispatch = useDispatch();

  // Fetch the customer list on mount so metrics/search always have data,
  // instead of relying on some other screen having already dispatched it.
  useEffect(() => {
    // dispatch(getCustomers());
  }, [dispatch]);

  // Guarded default so a first-render/undefined `customers` array
  // (e.g. before the API call resolves) never crashes the metric cards.
  const customerMetrics = (customers ?? []).reduce(
    (acc, customer) => {
      acc.total++;

      if (customer.custStatus) {
        acc.active++;
      } else {
        acc.prospect++;
      }

      return acc;
    },
    {
      total: 0,
      active: 0,
      prospect: 0,
    }
  );

  // console.log(customers);
  const customerOptions = customers?.map((item) => ({
    value: item.id,
    label: `${item.custcode} - ${item.custname}`,
    data: item,
  }));

  // Single source of truth for mapping a backend customer record onto the
  // form's field shape. Used both when selecting an existing customer and
  // when "Reset" needs to restore the last-loaded record.
  const mapCustomerToFormValues = (customer) => ({
    customerName: customer.custname?.trim(),
    customerType: customer.custtype,
    category: customer.custStatus ? "Existing" : "Prospect",

    address1: customer.add1,
    address2: customer.add2,
    address3: customer.add3,

    city: customer.city,
    country: customer.country?.replace(/\s+\d+$/, ""),

    zipCode: customer.zipcode,

    phone: customer.phoneno,
    contactPerson: customer.contactname,
    mobile: customer.mobile,
    email: customer.email,

    channel: customer.channel,

    priceBasis: customer.pricebasis,
    priceUnit: customer.priceUnit?.split(" ")[0],

    instructions: customer.specialInstruction,
    website: customer.webAddress,
  });

  const handleCustomerSelect = (id) => {
    const customer = (customers ?? []).find((c) => c.id === id);

    if (!customer) return;
    setSelectedCustomer(customer);
    form.setFieldsValue(mapCustomerToFormValues(customer));
    setDirty(false);
  };

  const values = Form.useWatch([], form) || {};

  const completed = REQUIRED_KEYS.filter((k) => {
    const v = values[k];
    return v !== undefined && v !== null && String(v).trim() !== "";
  }).length;
  const percent = Math.round((completed / REQUIRED_KEYS.length) * 100);

  const handleValuesChange = () => setDirty(true);

  const applyModeChange = (mode) => {
    setCustomerMode(mode);
    form.resetFields();
    // Critical: without this, switching from an EXISTING customer to "New
    // Customer" kept the old customer's id/custcode in state, and the new
    // record's payload silently reused that custcode — causing the backend
    // to reject it as a duplicate.
    setSelectedCustomer(null);
    setDirty(false);
  };

  const handleModeChange = (mode) => {
    if (dirty) {
      setPendingDiscardAction({
        message: "You have unsaved changes. Change mode and discard them?",
        onConfirm: () => applyModeChange(mode),
      });
      return;
    }
    applyModeChange(mode);
  };

  const applyCancel = () => {
    form.resetFields();
    setSelectedCustomer(null);
    setDirty(false);
  };

  const handleCancel = () => {
    if (dirty) {
      setPendingDiscardAction({
        message: "You have unsaved changes. Discard them and leave?",
        onConfirm: applyCancel,
      });
      return;
    }
    applyCancel();
  };

  const handleReset = () => {
    // Reset should restore the last-loaded customer's values (if editing),
    // not wipe them to blank — otherwise "Reset" during an edit behaves
    // like abandoning the record entirely.
    if (customerMode === "EXISTING" && selectedCustomer) {
      form.setFieldsValue(mapCustomerToFormValues(selectedCustomer));
    } else {
      form.resetFields();
    }
    setDirty(false);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=850,height=900");

    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Master Sheet - ${values.customerName || "Draft Record"}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1c1917; background-color: #fff; }
            .header-block { border-bottom: 2px solid #b85c22; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 24px; font-weight: 700; margin: 0; color: #1c1917; letter-spacing: -0.02em; }
            .subtitle { font-size: 11px; color: #78716c; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 4px; }
            .timestamp { font-size: 10px; color: #a8a29e; font-family: monospace; }
            .grid-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
            .data-box { border: 1px solid #e7e5e4; padding: 16px; border-radius: 6px; background: #fafaf9; page-break-inside: avoid; }
            .box-title { font-size: 11px; font-weight: 700; color: #b85c22; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px; margin: 0 0 12px 0; }
            .row-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #f5f5f4; font-size: 12px; }
            .row-item:last-child { border-bottom: none; }
            .label { color: #78716c; font-weight: 500; }
            .value { color: #1c1917; font-weight: 600; text-align: right; }
            .span-full { grid-column: span 2; }
            .instructions-content { font-size: 12px; line-height: 1.5; color: #292524; background: #fff; border: 1px solid #e7e5e4; padding: 12px; border-radius: 4px; margin-top: 6px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-block">
            <div>
              <h1 class="title">${values.customerName || "UNASSIGNED MASTER RECORD"}</h1>
              <p class="subtitle">ERP Customer Master System Data Summary</p>
            </div>
            <div class="timestamp">Printed: ${new Date().toLocaleString()}</div>
          </div>

          <div class="grid-container">
            <div class="data-box">
              <h3 class="box-title">01. Profile & Identity Matrix</h3>
              <div class="row-item"><span class="label">Customer Designation:</span><span class="value">${values.customerName || "—"}</span></div>
              <div class="row-item"><span class="label">Customer Classification:</span><span class="value">${values.customerType || "—"}</span></div>
              <div class="row-item"><span class="label">Lifecycle Status:</span><span class="value">${values.category || "—"}</span></div>
            </div>

            <div class="data-box">
              <h3 class="box-title">02. Operations & Pricing Config</h3>
              <div class="row-item"><span class="label">Deployment Channel:</span><span class="value">${values.channel || "—"}</span></div>
              <div class="row-item"><span class="label">Lead Origin Source:</span><span class="value">${values.leadSource || "—"}</span></div>
              <div class="row-item"><span class="label">Currency Ledger Code:</span><span class="value">${values.priceUnit || "—"}</span></div>
              <div class="row-item"><span class="label">Commercial Basis:</span><span class="value">${values.priceBasis || "—"}</span></div>
            </div>

            <div class="data-box span-full">
              <h3 class="box-title">03. Associated Contact Record</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px;">
                <div>
                  <div class="row-item"><span class="label">Contact Personnel:</span><span class="value">${values.contactPerson || "—"}</span></div>
                  <div class="row-item"><span class="label">Telephone Line:</span><span class="value">${values.phone || "—"}</span></div>
                </div>
                <div>
                  <div class="row-item"><span class="label">Mobile Endpoint:</span><span class="value">${values.mobile || "—"}</span></div>
                  <div class="row-item"><span class="label">Secure Email Address:</span><span class="value">${values.email || "—"}</span></div>
                </div>
              </div>
              <div class="row-item" style="margin-top: 4px;"><span class="label">Web URL Domain:</span><span class="value">${values.website || "—"}</span></div>
            </div>

            <div class="data-box span-full">
              <h3 class="box-title">04. Logistics & Spatial Routing Address</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px;">
                <div>
                  <div class="row-item"><span class="label">Routing Address Line 1:</span><span class="value">${values.address1 || "—"}</span></div>
                  <div class="row-item"><span class="label">Routing Address Line 2:</span><span class="value">${values.address2 || "—"}</span></div>
                  <div class="row-item"><span class="label">Routing Address Line 3:</span><span class="value">${values.address3 || "—"}</span></div>
                </div>
                <div>
                  <div class="row-item"><span class="label">City Location:</span><span class="value">${values.city || "—"}</span></div>
                  <div class="row-item"><span class="label">Country Origin:</span><span class="value">${values.country || "—"}</span></div>
                  <div class="row-item"><span class="label">Zip Code Index:</span><span class="value">${values.zipCode || "—"}</span></div>
                  <div class="row-item"><span class="label">Fulfillment Transit Port:</span><span class="value">${values.port || "—"}</span></div>
                </div>
              </div>
            </div>

            ${values.instructions ? `
            <div class="data-box span-full">
              <h3 class="box-title">05. Special Fulfillment Directives</h3>
              <div class="instructions-content">${values.instructions.replace(/\n/g, "<br/>")}</div>
            </div>
            ` : ""}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleSaveDraft = async () => {
    try {
      const draftValues = await form.validateFields();
      setSaving(true);
      if (onSaveDraft) await onSaveDraft(draftValues);
      message.success("Draft master record compiled securely.");
    } catch (err) {
      if (err?.errorFields) {
        message.error("Rectify foundational validation parameters before generating data file drafts.");
      }
    } finally {
      setSaving(false);
    }
  };

  const onFinish = async (values) => {
    // Guard: in EXISTING mode, don't hit the API at all if nothing changed.
    // The submit button is also disabled in this state (see JSX below),
    // but this protects against Enter-key submits or stale UI state.
    if (customerMode === "EXISTING" && !dirty) {
      message.info("No changes to update.");
      return;
    }

    const payload = {
      // id/custcode must only ever come from the currently selected
      // customer, and selectedCustomer is now guaranteed to be null
      // whenever we're in NEW mode (cleared on every mode switch) —
      // so a fresh customer never inherits a previous record's code.
      id: customerMode === "EXISTING" ? selectedCustomer?.id || 0 : 0,
      custcode: customerMode === "EXISTING" ? selectedCustomer?.custcode || "" : "KAJA123",
      custname: values.customerName,
      custtype: values.customerType,
      add1: values.address1,
      add2: values.address2,
      add3: values.address3,
      city: values.city,
      country: values.country,
      zipcode: values.zipCode,
      phoneno: values.phone,
      contactname: values.contactPerson,
      mobile: values.mobile,
      email: values.email,
      channel: values.channel,
      pricebasis: values.priceBasis,
      priceUnit: values.priceUnit,
      specialInstruction: values.instructions,
      userName: "admin",
      custStatus: values.category === "Existing",
      webAddress: values.website,
    };

    try {
      setSaving(true);

      if (customerMode === "NEW") {
        const res = ensureSuccessfulResponse(
          await dispatch(createCustomer(payload)),
          "Customer creation failed."
        );
        toast.success(res?.message || "Customer created successfully.");

        // Only the create flow should return to a blank slate.
        form.resetFields();
        setSelectedCustomer(null);
      } else {
        const res = ensureSuccessfulResponse(
          await dispatch(updateCustomer(payload)),
          "Customer update failed."
        );
        toast.success(res?.message || "Customer updated successfully.");

        // Stay on the same record in EXISTING mode. Merge whatever the
        // API returns (in case it recalculates/normalizes anything) into
        // selectedCustomer so subsequent edits still reference the right
        // id/custcode, but leave the form values exactly as submitted —
        // no reset, no mode change.
        setSelectedCustomer((prev) => ({ ...prev, ...(res?.data || {}) }));
      }

      setDirty(false);
      // dispatch(getCustomers());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full text-xs ">
      {/* ---------------- Header Layout ---------------- */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/90 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-primary)] text-[24px] font-semibold text-[var(--foreground)]">
              Customer Master
            </h1>
            <p className="mt-1 text-[13px] text-[var(--foreground)] opacity-60">
              Manage customer master information, business details, address details and customer configurations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type={customerMode === "EXISTING" ? "primary" : "default"}
              shape="round"
              onClick={() => handleModeChange("EXISTING")}
              className="text-xs"
            >
              + Existing Customer
            </Button>
            <Button
              type={customerMode === "NEW" ? "primary" : "default"}
              shape="round"
              onClick={() => handleModeChange("NEW")}
              className="text-xs"
            >
              + New Customer
            </Button>
            <div className="mx-1 h-6 w-[1px] bg-[var(--border)]" />
            <Button
              icon={<Eye size={14} />}
              shape="round"
              onClick={() => setPreviewOpen(true)}
              className="text-xs"
            >
              Preview Record
            </Button>
          </div>
        </div>
      </header>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ category: "Existing" }}
        onValuesChange={handleValuesChange}
        onFinish={onFinish}
        onFinishFailed={() => message.error("Ensure all required profile sections are completed accurately.")}
      >
        <main className="mx-auto max-w-7xl space-y-5 px-5 pb-28 pt-5">
          {/* ---------------- Metrics Segment ---------------- */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard index={0} title="Total Customers" value={customerMetrics.total} delta={metrics.deltaTotal} icon={Users} accent="copper" />
            <MetricCard index={1} title="Active Customers" value={customerMetrics.active} delta={metrics.deltaActive} icon={UserCheck} accent="moss" />
            <MetricCard index={2} title="Prospect Customers" value={customerMetrics.prospect} delta={metrics.deltaProspects} icon={UserPlus} accent="ochre" />
          </div>

          {/* ---------------- Search Dropdown Configuration ---------------- */}
          <AnimatePresence mode="wait">
            {customerMode === "EXISTING" && (
              <motion.div
                key="search-bar"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--primary)]/5 p-4 shadow-sm">
                  <Search size={20} className="text-[var(--primary)]" />
                  <div className="flex-1">
                    <p className="mb-1 text-sm font-semibold text-[var(--primary)]">Search Customer File Index</p>
                    <Select
                      showSearch
                      className="w-full max-w-md"
                      placeholder="Input client registration parameters or ID index..."
                      options={customerOptions}
                      onChange={handleCustomerSelect}
                      filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/*
            ---------------- Row 1: the three "lighter" panels ----------------
            Basic / Business / Contact carry a similar amount of content,
            so grouping them 3-up with items-stretch keeps every card in
            the row the same height regardless of exact field count.
          */}
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {/* Basic Information */}
            <FormCard index={2}>
              <SectionHeader icon={User} title="Basic Information" accent="copper" index="01" />
              <div className="grid flex-1 grid-cols-1 content-start gap-3 sm:grid-cols-2">
                <Form.Item name="customerName" label="Customer Name" rules={[{ required: true, message: "Required" }]} className="mb-3 sm:col-span-2">
                  <Input size="middle" placeholder="e.g. Sundaram Tyres" prefix={<Building2 size={12} className="mr-0.5 text-[var(--foreground)] opacity-60" />} />
                </Form.Item>
                <Form.Item name="customerType" label="Customer Type" rules={[{ required: true, message: "Required" }]} className="!mb-0">
                  <Select size="middle" placeholder="Select type" options={CUSTOMER_TYPES} />
                </Form.Item>
                <Form.Item name="category" label="Category Status" className="!mb-0">
                  <Select size="middle" options={[{ value: "Existing", label: "Existing Customer" }, { value: "Prospect", label: "Prospect Customer" }]} />
                </Form.Item>
              </div>
            </FormCard>

            {/* Business Details */}
            <FormCard index={3}>
              <SectionHeader icon={Package} title="Business Information" accent="plum" index="02" />
              <div className="grid flex-1 grid-cols-1 content-start gap-3 sm:grid-cols-2">
                <Form.Item name="channel" label="Channel Distribution" rules={[{ required: true, message: "Required" }]} className="!mb-0">
                  <Select size="middle" placeholder="Select channel" options={CHANNELS} />
                </Form.Item>
                <Form.Item name="leadSource" label="Lead Source" className="!mb-0">
                  <Select size="middle" placeholder="Select source" options={LEAD_SOURCES} />
                </Form.Item>
                <Form.Item name="priceUnit" label="Price Unit Currency" rules={[{ required: true, message: "Required" }]} className="!mb-0">
                  <Select size="middle" placeholder="Select unit" options={PRICE_UNITS} />
                </Form.Item>
                <Form.Item name="priceBasis" label="Price Basis Rule" rules={[{ required: true, message: "Required" }]} className="!mb-0">
                  <Select size="middle" placeholder="Select basis" options={PRICE_BASIS} />
                </Form.Item>
              </div>
            </FormCard>

            {/* Contact Details */}
            <FormCard index={4} className="lg:col-span-2 xl:col-span-1">
              <SectionHeader icon={Phone} title="Contact Details" accent="moss" index="03" />
              <div className="flex-1">
                <Form.Item name="contactPerson" label="Contact Person" className="mb-3">
                  <Input size="middle" placeholder="Full name" prefix={<User size={12} className="mr-0.5 text-[var(--foreground)] opacity-60" />} />
                </Form.Item>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Form.Item name="phone" label="Phone Desk" rules={[{ pattern: /^[0-9+ ]*$/, message: "Digits only" }]} className="!mb-0">
                    <Input size="middle" placeholder="Landline" prefix={<Phone size={12} className="mr-0.5 text-[var(--foreground)] opacity-60" />} />
                  </Form.Item>
                  <Form.Item name="mobile" label="Mobile Line" rules={[{ pattern: /^$|^[0-9+ ]{10,15}$/, message: "Invalid" }]} className="!mb-0">
                    <Input size="middle" placeholder="Mobile device contact" prefix={<Smartphone size={12} className="mr-0.5 text-[var(--foreground)] opacity-60" />} />
                  </Form.Item>
                  <Form.Item name="email" label="Secure Email" rules={[{ type: "email", message: "Invalid" }]} className="!mb-0 sm:col-span-2">
                    <Input size="middle" placeholder="name@company.com" prefix={<Mail size={12} className="mr-0.5 text-[var(--foreground)] opacity-60" />} />
                  </Form.Item>
                  <Form.Item name="website" label="Website URL" rules={[{ pattern: URL_PATTERN, message: "Invalid URL structure" }]} className="!mb-0 sm:col-span-2">
                    <Input size="middle" placeholder="www.company.com" prefix={<Globe size={12} className="mr-0.5 text-[var(--foreground)] opacity-60" />} />
                  </Form.Item>
                </div>
              </div>
            </FormCard>
          </div>

          {/*
            ---------------- Row 2: Address Details, full width ----------------
            This card has the most fields, so instead of squeezing it into a
            half-width column (which forced it to be tall and narrow), it gets
            the full row and spreads its fields horizontally.
          */}
          <FormCard index={5}>
            <SectionHeader icon={MapPin} title="Address Details" accent="clay" index="04" />
            <div className="grid flex-1 grid-cols-1 content-start gap-3 lg:grid-cols-3">
              <Form.Item name="address1" label="Address Line 1" rules={[{ required: true, message: "Required" }]} className="mb-3 lg:col-span-3">
                <Input size="middle" placeholder="Street, warehouse block, building location" />
              </Form.Item>
              <Form.Item name="address2" label="Address Line 2 (Optional)" className="mb-3 lg:col-span-1">
                <Input size="middle" placeholder="Area boundary, landmark indicators" />
              </Form.Item>
              <Form.Item name="address3" label="Address Line 3 (Optional)" className="mb-3 lg:col-span-2">
                <Input size="middle" placeholder="Suite, floor, or sub-routing markers" />
              </Form.Item>

              <Form.Item name="country" label="Country Origin" rules={[{ required: true, message: "Required" }]} className="!mb-0">
                <Select size="middle" showSearch allowClear placeholder="Country..." options={COUNTRIES} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
              <Form.Item name="city" label="City Hub" rules={[{ required: true, message: "Required" }]} className="!mb-0">
                <Select size="middle" showSearch allowClear placeholder="City..." options={CITIES} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
              <div className="grid grid-cols-2 gap-3">
                <Form.Item name="zipCode" label="Zip Code Index" rules={[{ pattern: /^[0-9A-Za-z\- ]*$/, message: "Invalid characters" }]} className="!mb-0">
                  <Input size="middle" placeholder="Postal reference ID" />
                </Form.Item>
                <Form.Item name="port" label="Transit Sea/Air Port" className="!mb-0">
                  <Input size="middle" placeholder="Port terminal identifier" prefix={<Anchor size={12} className="mr-0.5 text-[var(--foreground)] opacity-60" />} />
                </Form.Item>
              </div>
            </div>
          </FormCard>

          {/* Special Instructions Field */}
          <FormCard index={6}>
            <SectionHeader icon={FileText} title="Special Instructions" accent="ochre" index="05" />
            <Form.Item name="instructions" className="!mb-0 flex-1">
              <TextArea rows={3} placeholder="Enter unique routing requirements, operational directives, or payment execution constraints..." className="text-xs" />
            </Form.Item>
          </FormCard>
        </main>

        {/* ---------------- Footer Sticky Action Ribbon ---------------- */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/95 shadow-[0_-8px_24px_-12px_rgba(23,19,16,0.15)] backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Progress type="circle" percent={percent} size={30} strokeColor="var(--primary)" trailColor="var(--border)" />
              <p className="flex items-center gap-1.5 text-center font-[family-name:var(--font-secondary)] text-[10.5px] text-[var(--foreground)] opacity-60 sm:text-left">
                <Circle size={6} className={dirty ? "fill-[var(--destructive)] text-[var(--destructive)]" : "fill-emerald-600 text-emerald-600"} />
                {dirty ? "Unsaved workspace modifications pending" : "System record configuration synchronized"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <Button danger size="middle" onClick={handleCancel} className="w-full text-xs sm:w-auto">
                Cancel
              </Button>
              <Button size="middle" icon={<RotateCcw size={12} />} onClick={handleReset} className="w-full text-xs sm:w-auto">
                Reset
              </Button>
              {customerMode === "NEW" && (
                <Button size="middle" loading={saving} onClick={handleSaveDraft} className="col-span-2 w-full text-xs sm:col-span-1 sm:w-auto">
                  Save Draft
                </Button>
              )}
              <Button
                type="primary"
                size="middle"
                htmlType="submit"
                loading={saving}
                disabled={customerMode === "EXISTING" && !dirty}
                icon={<Save size={12} />}
                className="col-span-2 w-full text-xs sm:col-span-1 sm:w-auto sm:min-w-[140px]"
              >
                {customerMode === "NEW" ? "Create Record" : "Update Master"}
              </Button>
            </div>
          </div>
        </div>
      </Form>

      {/* ---------------- Live Detailed Record Modal with Dedicated Print Trigger ---------------- */}
      <Modal
        title={null}
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] p-3 bg-[var(--background)]">
            <Button size="middle" onClick={() => setPreviewOpen(false)}>
              Close Window
            </Button>
            <Button
              type="primary"
              size="middle"
              icon={<Printer size={13} />}
              onClick={handlePrint}
              style={{ backgroundColor: "var(--primary)", borderColor: "var(--primary)" }}
            >
              Print Master Sheet
            </Button>
          </div>
        }
        width={720}
        centered
        className="customer-profile-preview-modal"
        bodyStyle={{ padding: 0 }}
        closeIcon={<div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40"><span className="text-lg leading-none">&times;</span></div>}
      >
        <DetailedCustomerProfile values={values} />
      </Modal>

      {/* ---------------- Shared "Discard unsaved changes?" Confirmation Modal ---------------- */}
      <Modal
        open={!!pendingDiscardAction}
        title="Unsaved Changes"
        onCancel={() => setPendingDiscardAction(null)}
        onOk={() => {
          pendingDiscardAction?.onConfirm?.();
          setPendingDiscardAction(null);
        }}
        okText="Discard"
        okType="danger"
        cancelText="Keep Editing"
        width="90%"
        style={{ maxWidth: 420 }}
      >
        <p className="text-sm sm:text-base">{pendingDiscardAction?.message}</p>
      </Modal>
    </div>
  );
}