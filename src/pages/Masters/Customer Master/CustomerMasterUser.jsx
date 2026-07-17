import React, { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
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
  Space,
  Tooltip,
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
  Eye,
  X,
  Wallet,
  Landmark,
  Package,
  CalendarClock,
  CheckCircle2,
  Info,
  Search,
  Download,
  RefreshCw,
  Edit3,
  Copy,
  Trash2,
  ArrowLeft,
  Building2,
  Phone,
  Smartphone,
  Globe,
  Anchor,
} from "lucide-react";

// NOTE: CHANNELS and PRICE_BASIS are declared in Customermasterpage.jsx
// but are not currently exported (only SectionHeader, MetricCard,
// PRICE_UNITS are). Add `export` in front of those two consts in
// Customermasterpage.jsx so this file can import them instead of
// duplicating the option lists.
// CUSTOMER_TYPES, COUNTRIES and CITIES are no longer imported from here —
// those now come from the `/CustomerMaster/master-data` API (see
// masterData.customerTypes / masterData.countries below).
import {
  SectionHeader,
  MetricCard,
  PRICE_UNITS,
  CHANNELS,
  PRICE_BASIS,
} from "./Customermasterpage";
import { useSelector, useDispatch } from "react-redux";
import {
  getCustomerUsers,
  getCustomerMasterData,
  getGeneratedCustomerCode,
  createCustomerWithUser,
  updateCustomerWithUser,
  deleteCustomerUser,
} from "../../../Redux/Slices/Master/CustomerMaster/CustomerMasterSlice";
import { DynamicDataTable } from "../../../components/DynamicDataTable";

const { TextArea } = Input;

/* ------------------------------------------------------------------ */
/* Static option lists (kept local since these fields have no combined */
/* payload key on the "customer" side other than custType/channel/etc.)*/
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

// Domestic/Export classification: the GET
// /CustomerMaster/customer-user-details response is grouped by
// cust_Type (data: [{ cust_Type, customers: [...] }]). The Redux thunk
// (getCustomerUsers) normalizes this into a flat listOfCustomerUsers
// array, stamping each record with its parent group's cust_Type — that
// is the source of truth for Domestic/Export, not custType, custCategory,
// region, or the custCode heuristic.

/* ------------------------------------------------------------------ */
/* Motion variants (unchanged from UserCreation.jsx)                  */
/* ------------------------------------------------------------------ */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring", damping: 28, stiffness: 220 } },
  exit: { x: "100%", transition: { ease: "easeInOut", duration: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: "easeOut" },
  }),
};

/* ------------------------------------------------------------------ */
/* Subcomponents: Preview Card & Payment Selector                     */
/* ------------------------------------------------------------------ */
function CustomerUserPreviewCard({ values }) {
  const displayName = values.custFullName || values.custName || "";
  const isInactive = values.status === "Disabled";
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : "—";

  let paymentDays = values.paymentDays;
  if (paymentDays === undefined || paymentDays === null) {
    if (values.paymentMode === "LC") {
      paymentDays = values.lcTerm === "Other Days" ? values.lcOtherDays : values.lcTerm;
    } else if (values.paymentMode === "Open Credit From Date Of BL") {
      paymentDays = values.creditPeriod === "Other Days" ? values.creditOtherDays : values.creditPeriod;
    }
  }

  const DataRow = ({ label, value }) => (
    <div className="flex items-center justify-between border-b border-white/10 py-1.5 text-[11px]">
      <span className="text-white/50">{label}</span>
      <span className="font-medium text-white text-right pl-4">{value !== undefined && value !== null && value !== "" ? String(value) : "—"}</span>
    </div>
  );

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] bg-[var(--ink-950)] p-5 text-white shadow-[var(--shadow-raised)] max-h-[85vh] overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "repeating-linear-gradient(135deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)" }} />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <p className="cm-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[var(--copper-100)]">Profile Details</p>
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 cm-mono text-[9.5px] font-semibold ${isInactive ? "bg-[var(--clay-600)]/30 text-[var(--clay-100)]" : "bg-[var(--moss-600)]/30 text-[var(--moss-100)]"}`}>
            {isInactive ? <ShieldOff size={10} /> : <ShieldCheck size={10} />}
            {isInactive ? "Inactive" : "Active"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 cm-serif text-[15px] font-semibold">{initials}</div>
          <div className="min-w-0">
            <p className="cm-serif truncate text-[15px] font-medium">{displayName || "New customer"}</p>
            <p className="truncate text-[11.5px] text-white/50">{values.userName ? `User: ${values.userName}` : "No user linked yet"}</p>
          </div>
        </div>

        <div className="pt-3 space-y-1">
          <DataRow label="Customer Code" value={values.custCode} />
          <DataRow label="Customer Name" value={values.custName} />
          <DataRow label="Contact Person" value={values.contactName} />
          <DataRow label="Company Email" value={values.email} />
          <DataRow label="User ID" value={values.userName} />
          <DataRow label="User Email" value={values.userMail} />
          <DataRow label="User Mobile" value={values.userMobile} />
          <DataRow label="Currency" value={values.userCurrency} />
          <DataRow label="Region" value={values.region} />
          <DataRow label="Customer Type" value={values.custType} />
          <DataRow label="Payment Mode" value={values.paymentMode} />
          <DataRow label="Payment Days" value={paymentDays} />
        </div>
      </div>
    </div>
  );
}

function PaymentModeSelector({ value, onChange, disabled }) {
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
            disabled={disabled}
            onClick={() => !disabled && onChange?.(opt.value)}
            aria-pressed={selected}
            className={`group relative flex items-start gap-3 rounded-xl border border-[var(--border)] p-4 text-left transition-all duration-200 ${disabled ? "opacity-75 cursor-not-allowed" : ""} ${
              selected
                ? `${a.border} ${a.bg} shadow-[var(--shadow-card)]`
                : "border-[var(--ink-200)] bg-[var(--canvas-raised)] hover:border-[var(--ink-300)] hover:-translate-y-0.5"
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
/* Component: Combined Customer + User List Workspace                 */
/* ------------------------------------------------------------------ */
function CombinedListTable({ dataSource, loading, onAction, onToggleStatus, onAddCustomer, onRefresh }) {
  const [searchText, setSearchText] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [filteredData, setFilteredData] = useState(dataSource);

  const uniqueCategories = [...new Set(dataSource.map(item => item.custType).filter(Boolean))].sort();
  const uniqueRegions = [...new Set(dataSource.map(item => item.region).filter(Boolean))].sort();
  const uniquePaymentModes = [...new Set(dataSource.map(item => item.expPayMode).filter(Boolean))].sort();

  // Safe, single-place normalization for case-insensitive text search —
  // avoids repeated `.toLowerCase()` calls and null/undefined crashes.
  const norm = (val) => (val === undefined || val === null ? "" : String(val).toLowerCase());

  useEffect(() => {
    const searchTextNorm = norm(searchText);
    const searchUserIdNorm = norm(searchUserId);

    let output = dataSource.filter((item) => {
      const matchCustomer = !searchTextNorm ||
        norm(item.custCode).includes(searchTextNorm) ||
        norm(item.custName).includes(searchTextNorm) ||
        norm(item.custFullName).includes(searchTextNorm);

      const matchUser = !searchUserIdNorm ||
        norm(item.username).includes(searchUserIdNorm) ||
        norm(item.appUserName).includes(searchUserIdNorm) ||
        norm(item.userMail).includes(searchUserIdNorm) ||
        norm(item.userMobile).includes(searchUserIdNorm) ||
        norm(item.userID).includes(searchUserIdNorm);

      const itemStatus = item.userStatus ? "Active" : "Inactive";
      const matchStatus = statusFilter === "All" || itemStatus === statusFilter;
      const matchCategory = categoryFilter === "All" || item.custType === categoryFilter;
      const matchPayment = paymentFilter === "All" || item.expPayMode === paymentFilter;
      const matchRegion = regionFilter === "All" || item.region === regionFilter;

      return matchCustomer && matchUser && matchStatus && matchCategory && matchPayment && matchRegion;
    });
    setFilteredData(output);
  }, [searchText, searchUserId, statusFilter, categoryFilter, paymentFilter, regionFilter, dataSource]);

  const [visibleRows, setVisibleRows] = useState(50);

  useEffect(() => {
    setVisibleRows(50);
  }, [searchText, searchUserId, statusFilter, categoryFilter, paymentFilter, regionFilter]);

  const columns = [
    { header: "Customer ID", accessor: "userID", width: "120px", align: "center" },
    { header: "Customer Code", accessor: "custCode", width: "120px", align: "left" },
    { header: "Customer Name", accessor: "custFullName", width: "200px", align: "left" },
    { header: "App User Name", accessor: "appUserName", width: "140px", align: "left" },
    { header: "User Name", accessor: "username", width: "140px", align: "left" },
    { header: "Email", accessor: "userMail", width: "180px", align: "left" },
    { header: "Mobile", accessor: "userMobile", width: "120px", align: "left" },
    { header: "Currency", accessor: "userCurrency", width: "90px", align: "left" },
    { header: "Region", accessor: "region", width: "100px", align: "left" },
    { header: "Customer Type", accessor: "custType", width: "120px", align: "left" },
    { header: "Payment Mode", accessor: "expPayMode", width: "180px", align: "left", render: (mode) => {
        const found = PAYMENT_MODE_OPTIONS.find(o => o.value === mode);
        return found ? found.title : mode;
      }
    },
    { header: "Payment Days", accessor: "paymentDays", width: "110px", align: "left" },
    { header: "Lead", accessor: "lead", width: "120px", align: "left" },
    { header: "Supervisor", accessor: "supervisor", width: "120px", align: "left" },
    { header: "Manager", accessor: "manager", width: "120px", align: "left" },
    { header: "User Status", accessor: "userStatus", width: "110px", align: "left", render: (status) => {
        const text = status ? "Active" : "Inactive";
        const isTrue = !!status;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${isTrue ? "bg-[var(--moss-100)] text-[var(--moss-700)]" : "bg-[var(--clay-100)] text-[var(--clay-700)]"}`}>
            <Circle size={5} className={isTrue ? "fill-[var(--moss-600)]" : "fill-[var(--clay-600)]"} />
            {text}
          </span>
        );
      }
    },
    { header: "Actions", accessor: "id", width: "160px", align: "center", render: (_, record) => (
      <Space size="middle" className="actions-cell">
        <Tooltip title="View Only"><button onClick={() => onAction("VIEW", record)} className="text-[var(--ink-500)] hover:text-[var(--ink-950)] transition-colors"><Eye size={15} /></button></Tooltip>
        <Tooltip title="Edit Profile"><button onClick={() => onAction("EDIT", record)} className="text-[var(--ink-500)] hover:text-[var(--copper-600)] transition-colors"><Edit3 size={15} /></button></Tooltip>
        <Tooltip title="Duplicate Structural Copy"><button onClick={() => onAction("DUPLICATE", record)} className="text-[var(--ink-500)] hover:text-blue-600 transition-colors"><Copy size={15} /></button></Tooltip>
        <Tooltip title={record.userStatus ? "Deactivate User" : "Activate User"}>
          <button
            onClick={() => onToggleStatus(record)}
            className={record.userStatus ? "text-[var(--moss-600)] hover:text-[var(--clay-600)] transition-colors" : "text-[var(--clay-600)] hover:text-[var(--moss-600)] transition-colors"}
          >
            {record.userStatus ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
          </button>
        </Tooltip>
        <Tooltip title="Delete Account"><button onClick={() => onAction("DELETE", record)} className="text-[var(--ink-500)] hover:text-[var(--clay-600)] transition-colors"><Trash2 size={15} /></button></Tooltip>
      </Space>
    )
  }
  ];

  const exportToExcelPlaceholder = () => {
    if (!filteredData || filteredData.length === 0) {
      message.warning("No operational records available in the current scoped workspace to export.");
      return;
    }

    try {
      const exportPayload = filteredData.map((item) => ({
        "CustID": item.id || "—",
        "Customer Code": item.custCode || "—",
        "Customer Name": item.custFullName || "—",
        "App User Name": item.appUserName || "—",
        "User Name": item.username || "—",
        "Email Address": item.userMail || "—",
        "Mobile Number": item.userMobile || "—",
        "Currency Node": item.userCurrency || "—",
        "Region Scope": item.region || "—",
        "Customer Category": item.custType || "—",
        "Payment Loop Mechanism": PAYMENT_MODE_OPTIONS.find(o => o.value === item.expPayMode)?.title || item.expPayMode || "—",
        "Maturity Limit Days": item.paymentDays || 0,
        "Account Lead": item.lead || "—",
        "Assigned Supervisor": item.supervisor || "—",
        "Senior Manager": item.manager || "—",
        "System User Profile Status": item.userStatus ? "Active Enrolled" : "Disabled Reference",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportPayload);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Master Index");

      const columnWidths = Object.keys(exportPayload[0] || {}).map((key) => {
        const maxCharLen = Math.max(
          key.length,
          ...exportPayload.map((row) => String(row[key] || "").length)
        );
        return { wch: maxCharLen + 4 };
      });
      worksheet["!cols"] = columnWidths;

      XLSX.writeFile(workbook, `Customer_User_Profiles_Matrix_${new Date().toISOString().slice(0, 10)}.xlsx`);
      message.success("Synchronized dataset successfully compiled and dropped into workspace Excel download stream.");
    } catch (err) {
      console.error("Spreadsheet pipeline fault:", err);
      message.error("Failed to compile layout elements into a valid Excel binary array structure.");
    }
  };

  const forceRefreshPayload = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      message.success("Synchronized table state with master reference arrays.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-card)] space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-[11px] font-medium text-[var(--ink-500)] mb-1.5 uppercase tracking-wider">Search Customer</label>
            <Input placeholder="Type customer name..." value={searchText} onChange={(e) => setSearchText(e.target.value)} prefix={<Search size={14} className="text-[var(--ink-400)] mr-1" />} size="middle" allowClear />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[var(--ink-500)] mb-1.5 uppercase tracking-wider">Search User ID</label>
            <Input placeholder="Search user ID fields..." value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} prefix={<UserPlus size={14} className="text-[var(--ink-400)] mr-1" />} size="middle" allowClear />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[var(--ink-500)] mb-1.5 uppercase tracking-wider">Status Parameter</label>
            <Select value={statusFilter} onChange={setStatusFilter} className="w-full" size="middle">
              <Select.Option value="All">All Status Profiles</Select.Option>
              <Select.Option value="Active">Active Managed IDs</Select.Option>
              <Select.Option value="Inactive">Disabled Profiles</Select.Option>
            </Select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[var(--ink-500)] mb-1.5 uppercase tracking-wider">Category Scope</label>
            <Select value={categoryFilter} onChange={setCategoryFilter} className="w-full" size="middle">
              <Select.Option value="All">All Categories Scope</Select.Option>
              {uniqueCategories.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--ink-100)]">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-72">
              <Select value={paymentFilter} onChange={setPaymentFilter} placeholder="Filter by Payment Configuration" className="w-full" size="middle">
                <Select.Option value="All">All Payment Profiles</Select.Option>
                {uniquePaymentModes.map(p => {
                  const found = PAYMENT_MODE_OPTIONS.find(o => o.value === p);
                  return <Select.Option key={p} value={p}>{found ? found.title : p}</Select.Option>;
                })}
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={regionFilter} onChange={setRegionFilter} placeholder="Filter by Region" className="w-full" size="middle">
                <Select.Option value="All">All Regions</Select.Option>
                {uniqueRegions.map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={forceRefreshPayload} icon={<RefreshCw size={13} />} size="middle" loading={loading}>Refresh</Button>
            <Button onClick={exportToExcelPlaceholder} icon={<Download size={13} />} size="middle" className="!bg-[var(--primary)]/15 hover:!bg-[var(--ink-800)] border-none !text-[var(--primary)]">Export</Button>
            <Button type="primary" icon={<UserPlus size={14} />} onClick={onAddCustomer} size="middle" className="!bg-[var(--primary)] hover:!bg-[var(--ink-800)] border-none text-white">Add Customer</Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-[var(--background)] overflow-hidden shadow-[var(--shadow-card)] h-[600px]">
        <DynamicDataTable
          columns={columns}
          data={filteredData}
          loading={loading}
          pagination={true}
          visibleRows={visibleRows}
          onLoadMore={() => setVisibleRows(prev => prev + 50)}
          headerClassName="!bg-[var(--primary)] !text-white"
          rowClassName={(row) =>
            "!border !bg-[var(--background)] dark:!bg-[var(--canvas-raised)] !border-[var(--border)] rounded-xl shadow-sm hover:shadow-md hover:!border-[var(--primary)] text-[var(--ink-700)] transition-all duration-200"
          }
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Module: Combined Customer + Customer User Master               */
/* ------------------------------------------------------------------ */
export default function CustomerUserMaster({
  metrics = { deltaTotal: 3.1, deltaActive: 2.2, deltaDisabled: -1.4 },
}) {
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState("LIST"); // LIST | CREATE | EDIT | VIEW
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  console.log("Selected Customer ",selectedCustomer);
  

  const dispatch = useDispatch();
  const customersData = useSelector((state) => state.customerMaster.listOfCustomerUsers || []);
  const loadingUsers = useSelector((state) => state.customerMaster.loadingUsers);
  const masterData = useSelector((state) => state.customerMaster.masterData) || {};

  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Domestic / Export toggle — filters the normalized listOfCustomerUsers
  // by the record's cust_Type (see filteredCustomersData below). CREATE
  // mode no longer needs a Customer Master dropdown, since one submit now
  // creates the customer + user together.
  const [customerMode, setCustomerMode] = useState("domestic");

  const paymentMode = Form.useWatch("paymentMode", form);
  const lcTerm = Form.useWatch("lcTerm", form);
  const creditPeriod = Form.useWatch("creditPeriod", form);
  const selectedCountry = Form.useWatch("country", form);
  const selectedCity = Form.useWatch("city", form);
  const formValues = Form.useWatch([], form) || {};

  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [statusChangeSaving, setStatusChangeSaving] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  // Guards the country/city/zip dependent-dropdown clearing logic in
  // handleValuesChange from firing while an existing record's values are
  // being loaded into the form (VIEW/EDIT/DUPLICATE) — see
  // handleTableActionDispatch below.
  const loadingRecordRef = useRef(false);

  useEffect(() => {
    dispatch(getCustomerUsers());
    dispatch(getCustomerMasterData());
  }, [dispatch]);

  /**
   * Builds the single combined payload expected by
   * POST /api/CustomerMaster/create-custom-user (and its update
   * counterpart). This is the create/update DTO contract, which is
   * separate from the GET /customer-user-details response shape — the
   * GET response uses `username`, the form field is `userName`, and the
   * write payload's `userName` key matches the create/update contract.
   * `appUserName` is a distinct field the form has no input for, so it is
   * preserved from the existing record on edit instead of being guessed
   * from the user-entered `userName`.
   */
  const buildCombinedPayload = (values, viewMode, selectedCustomer) => {
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

    const isActive = values.status === "Active";

    // Master-data id of the selected Payment Terms option (see note above).
    const selectedPaymentTerm = (masterData.paymentTerms || []).find(
      (item) => item.paymentTermName === values.paymentTerms
    );

    return {
      // --- Customer Master fields ---
      // custFullName is the source of truth; custName always mirrors it
      // in the payload, even though both are hidden/synced in the form.
      custCode: values.custCode || "",
      custName: values.custFullName || "",
      custType: values.custType || "",
      add1: values.add1 || "",
      add2: values.add2 || "",
      add3: values.add3 || "",
      city: values.city || "",
      country: values.country || "",
      zipCode: values.zipCode || "",
      phoneNo: values.phoneNo || "",
      contactName: values.contactName || "",
      mobile: values.mobile || "",
      email: values.email || "",
      channel: values.channel || "",
      priceBasis: values.priceBasis || "",
      priceUnit: values.priceUnit || "",
      specialInstruction: values.specialInstruction || "",
      webAddress: values.webAddress || "",
      custStatus: isActive ? 1 : 0,

      // --- Customer User fields ---
      // appUserName has no form input — preserve the existing record's
      // value on edit rather than assuming it equals the login userName.
      id: selectedCustomer?.userID || 0,
      appUserName: selectedCustomer?.appUserName || "",
      userName: values.userName || "",
      userPassword: values.userPassword || "",
      userMail: values.userMail || "",
      userMobile: values.userMobile || "",
      userCurrency: values.userCurrency || values.priceUnit || "",
      // Backend expects userStatus as bool? — send a real boolean, not 1/0.
      userStatus: isActive,
      custFullName: values.custFullName || "",
      paymentTerms: values.paymentTerms || "",
      custInstruction: values.custInstruction || "",
      custCategory: values.custCategory || "",
      lead: values.lead || "",
      supervisor: values.supervisor || "",
      manager: values.manager || "",
      expPayMode: values.paymentMode || "",
      expPayTime,
      paymentDays,
      region: values.region || "",

      // --- No corresponding UI in either original form (see note above) ---
      exciseDuty: 0,
      cstPer: 0,
      vatPer1: 0,
      vatPer2: 0,
      tinNo: "",
      cstNo: "",
      eccNo: "",
      eccDetails: "",
      creditNote: true,
      custHoldStatus: true,
      specialDesc: "",
      salesLimit: 0,
      tcsTax: 0,
      iT_REMARKS: "",

      paymentID: selectedPaymentTerm?.id ?? 0,
    };
  };

  const uniqueRegions = [...new Set(customersData.map(item => item.region).filter(Boolean))];
  const regionOptions = uniqueRegions.length > 0
    ? uniqueRegions.map(v => ({ value: v, label: v }))
    : ["North", "South", "East", "West", "Central"].map(v => ({ value: v, label: v }));

  const uniqueSupervisors = [...new Set(customersData.map(item => item.supervisor).filter(Boolean))];
  const supervisorsOptions = uniqueSupervisors.length > 0
    ? uniqueSupervisors.map(v => ({ value: v, label: v }))
    : ["R. Kumar", "S. Priya", "A. Raghavan"].map(v => ({ value: v, label: v }));

  const uniqueLeads = [...new Set(customersData.map(item => item.lead).filter(Boolean))];
  const leadsOptions = uniqueLeads.length > 0
    ? uniqueLeads.map(v => ({ value: v, label: v }))
    : ["N. Sharma", "V. Iyer", "K. Balaji"].map(v => ({ value: v, label: v }));

  const uniqueManagers = [...new Set(customersData.map(item => item.manager).filter(Boolean))];
  const managersOptions = uniqueManagers.length > 0
    ? uniqueManagers.map(v => ({ value: v, label: v }))
    : ["M. Ganesan", "P. Lakshmi", "T. Venkat"].map(v => ({ value: v, label: v }));

  const uniqueCustCategories = [...new Set(customersData.map(item => item.custCategory).filter(Boolean))];
  const custCategoryOptions = uniqueCustCategories.length > 0
    ? uniqueCustCategories.map(v => ({ value: v, label: v }))
    : ["Wholesale", "Retail", "Corporate", "Export", "OEM"].map(v => ({ value: v, label: v }));

  // --- Master data driven options (/CustomerMaster/master-data) ---
  const customerTypeOptions = (masterData.customerTypes || []).map((item) => ({
    value: item.customerTypeName,
    label: item.customerTypeName,
  }));

  const countryOptions = (masterData.countries || []).map((item) => ({
    value: item.countryName,
    label: item.countryName,
  }));

  const selectedCountryData = (masterData.countries || []).find(
    (item) => item.countryName === selectedCountry
  );
  const cityOptions = (selectedCountryData?.cityHubs || []).map((city) => ({
    value: city.cityHubName,
    label: city.cityHubName,
  }));

  const selectedCityData = (selectedCountryData?.cityHubs || []).find(
    (item) => item.cityHubName === selectedCity
  );
  const zipCodeOptions = (selectedCityData?.zipCodes || []).map((zip) => ({
    value: zip.zipCode,
    label: `${zip.zipCode} - ${zip.areaName}`,
  }));

  const paymentTermOptions = (masterData.paymentTerms || []).map((item) => ({
    value: item.paymentTermName,
    label: item.paymentTermName,
  }));

  // Reserved for future use — not wired into any form field yet per
  // current scope (requirement: keep available in Redux for later).
  // eslint-disable-next-line no-unused-vars
  const gstRateOptions = (masterData.gstRates || []).map((item) => ({
    value: item.gstRateId,
    label: `${item.gstName} (${item.gstCode})`,
    data: item,
  }));

  // Safe normalization for cust_Type comparison — handles null/undefined,
  // case differences, and stray whitespace from the API.
  const normalizeCustType = (value) =>
    value === undefined || value === null ? "" : String(value).trim().toUpperCase();

  const filteredCustomersData = useMemo(() => {
    const targetType = customerMode === "domestic" ? "DOMESTIC" : "EXPORT";
    return customersData.filter((item) => normalizeCustType(item.cust_Type) === targetType);
  }, [customersData, customerMode]);

  const handleValuesChange = (changedValues) => {
    setDirty(true);
    // custFullName is the source of truth for the customer's name —
    // custName (hidden from the UI) always mirrors it.
    if (Object.prototype.hasOwnProperty.call(changedValues, "custFullName")) {
      form.setFieldsValue({ custName: changedValues.custFullName });
    }
    // Country -> City -> Zip Code dependency (master-data driven). Skipped
    // while an existing record is being loaded into the form so VIEW/EDIT
    // don't get their City/Zip Code wiped out on open.
    if (
      Object.prototype.hasOwnProperty.call(changedValues, "country") &&
      !loadingRecordRef.current
    ) {
      form.setFieldsValue({ city: undefined, zipCode: undefined });
    }
    if (
      Object.prototype.hasOwnProperty.call(changedValues, "city") &&
      !loadingRecordRef.current
    ) {
      form.setFieldsValue({ zipCode: undefined });
    }
    if (Object.prototype.hasOwnProperty.call(changedValues, "paymentMode")) {
      form.setFieldsValue({
        advanceType: undefined,
        lcTerm: undefined,
        lcOtherDays: undefined,
        creditPeriod: undefined,
        creditOtherDays: undefined,
      });
    }
    if (Object.prototype.hasOwnProperty.call(changedValues, "lcTerm") && changedValues.lcTerm !== "Other Days") {
      form.setFieldsValue({ lcOtherDays: undefined });
    }
    if (Object.prototype.hasOwnProperty.call(changedValues, "creditPeriod") && changedValues.creditPeriod !== "Other Days") {
      form.setFieldsValue({ creditOtherDays: undefined });
    }
  };

  const handleCustomerModeChange = (value) => {
    setCustomerMode(value);
  };

  // Fires only on a real user selection in the Customer Type Select (Ant
  // Design/RC-Field-Form does not call a field's own onChange for
  // programmatic form.setFieldsValue() calls), so this never runs during
  // VIEW/EDIT/DUPLICATE's initial record load — only when someone
  // actually picks a Customer Type while creating a new record.
  const handleCustomerTypeChange = async (value) => {
    if (viewMode !== "CREATE") return;

    if (customerMode === "domestic") {
      form.setFieldsValue({ custCode: "DE0048" });
      return;
    }

    const selectedType = (masterData.customerTypes || []).find(
      (item) => item.customerTypeName === value
    );
    if (!selectedType) return;

    try {
      const result = await dispatch(
        getGeneratedCustomerCode(selectedType.customerTypeId)
      );
      const generatedCode = result?.data?.data;
      if (generatedCode) {
        form.setFieldsValue({ custCode: generatedCode });
      }
    } catch (err) {
      console.error("Failed to generate customer code:", err);
      message.error("Failed to generate customer code.");
    }
  };

  const executeBackNavigation = () => {
    form.resetFields();
    setDirty(false);
    setSelectedCustomer(null);
    setViewMode("LIST");
  };

  const handleBackNavigation = () => {
    if (dirty) {
      setLeaveConfirmOpen(true);
      return;
    }
    executeBackNavigation();
  };

  const triggerAddFlow = () => {
    form.resetFields();
    setDirty(false);
    setSelectedCustomer(null);
    setViewMode("CREATE");
  };

  // The GET /CustomerMaster/customer-user-details response is already a
  // flat, fully-merged customer + user record — map each form field to
  // its exact API field, keeping customer fields and user fields separate
  // (no cross-field fallbacks that would blur distinct DB columns).
  const mapApiRecordToForm = (record) => ({
    custCode: record.custCode,
    // custFullName is the source of truth — custName always mirrors it.
    custName: record.custFullName,
    custFullName: record.custFullName,
    custType: record.custType,
    custCategory: record.custCategory,
    add1: record.add1,
    add2: record.add2,
    add3: record.add3,
    city: record.city,
    country: record.country,
    zipCode: record.zipCode,
    phoneNo: record.phoneNo,
    contactName: record.contactName,
    mobile: record.mobile,
    email: record.email,
    channel: record.channel,
    priceBasis: record.priceBasis,
    priceUnit: record.priceUnit,
    specialInstruction: record.specialInstruction,
    webAddress: record.webAddress,
    userName: record.username,
    userPassword: "",
    userMail: record.userMail,
    userMobile: record.userMobile,
    userCurrency: record.userCurrency,
    status: record.userStatus ? "Active" : "Disabled",
    paymentTerms: record.paymentTerms,
    custInstruction: record.custInstruction,
    lead: record.lead,
    supervisor: record.supervisor,
    manager: record.manager,
    region: record.region,
    paymentMode: record.expPayMode,
    advanceType: record.expPayMode === "Advance" ? record.expPayTime : undefined,
    lcTerm: record.expPayMode === "LC" ? record.expPayTime : undefined,
    lcOtherDays: record.expPayMode === "LC" && record.expPayTime === "Other Days" ? record.paymentDays : undefined,
    creditPeriod: record.expPayMode === "Open Credit From Date Of BL" ? record.expPayTime : undefined,
    creditOtherDays: record.expPayMode === "Open Credit From Date Of BL" && record.expPayTime === "Other Days" ? record.paymentDays : undefined,
  });

  const handleTableActionDispatch = (actionType, record) => {
    if (actionType === "VIEW" || actionType === "EDIT") {
      form.resetFields();
      loadingRecordRef.current = true;
      form.setFieldsValue(mapApiRecordToForm(record));
      loadingRecordRef.current = false;
      setSelectedCustomer(record);
      setDirty(false);
      setViewMode(actionType);
    } else if (actionType === "DUPLICATE") {
      // Customer codes are generated by backend business rules and user
      // logins must be unique, so neither can be safely guessed here —
      // both are cleared and left for the user/backend to (re)assign.
      // Database identifiers (id/userID) are dropped by starting a fresh
      // CREATE flow with no selectedCustomer.
      form.resetFields();
      const mapped = mapApiRecordToForm(record);
      loadingRecordRef.current = true;
      form.setFieldsValue({
        ...mapped,
        custCode: "",
        userName: "",
        userPassword: "",
        custName: `${mapped.custName} (Copy)`,
        custFullName: `${mapped.custFullName} (Copy)`,
      });
      loadingRecordRef.current = false;
      setSelectedCustomer(null);
      setDirty(true);
      setViewMode("CREATE");
      message.info("Copied base customer profile parameters. Enter a new Customer Code and User ID before saving.");
    } else if (actionType === "DELETE") {
      Modal.confirm({
        title: "Delete operational entity record link?",
        content: `Are you certain you wish to completely drop user allocation mapping ${record.username} attached to ${record.custFullName}? This structural pipeline instruction cannot be undone.`,
        okText: "Confirm Drop",
        okType: "danger",
        cancelText: "Retain Link",
        onOk: async () => {
          try {
            await dispatch(deleteCustomerUser(record.userID));
            message.success("Deleted client mapping authorization node mapping reference target.");
            dispatch(getCustomerUsers());
          } catch (err) {
            console.error("Delete failed:", err);
            message.error("Failed to delete the user.");
          }
        }
      });
    }
  };

  const handleStatusRadioChange = (newStatusLabel) => {
    const newStatus = newStatusLabel === "Active";
    if (!selectedCustomer || selectedCustomer.userStatus === newStatus) return;

    setPendingStatusChange({
      target: "form",
      record: selectedCustomer,
      newStatus,
      newStatusLabel,
    });
    setStatusConfirmOpen(true);
  };

  const handleToggleUserStatus = (record) => {
    const newStatus = !record.userStatus;

    setPendingStatusChange({
      target: "table",
      record,
      newStatus,
      newStatusLabel: newStatus ? "Active" : "Disabled",
    });
    setStatusConfirmOpen(true);
  };

  const executeStatusChange = async () => {
    if (!pendingStatusChange) return;
    const { target, record, newStatus, newStatusLabel } = pendingStatusChange;

    setStatusChangeSaving(true);
    try {
      const payload = buildCombinedPayload(
        { ...mapApiRecordToForm(record), status: newStatusLabel },
        "EDIT",
        record
      );
      await dispatch(updateCustomerWithUser(payload));

      message.success(`User ${newStatus ? "activated" : "deactivated"} successfully.`);
      notification.success({
        message: newStatus ? "User Activated" : "User Deactivated",
        description: `${record.username} is now ${newStatus ? "active" : "inactive"}.`,
        placement: "topRight",
      });

      if (target === "form") {
        form.setFieldsValue({ status: newStatusLabel });
        setSelectedCustomer((prev) => (prev ? { ...prev, userStatus: newStatus } : prev));
      }

      dispatch(getCustomerUsers());
      setStatusConfirmOpen(false);
      setPendingStatusChange(null);
    } catch (err) {
      console.error("Status toggle failed:", err);
      const backendMessage = err?.response?.data?.message;
      notification.error({
        message: "Operation Failed",
        description: backendMessage || "Failed to update user status.",
        placement: "topRight",
      });
      message.error(backendMessage || "Failed to update user status.");
    } finally {
      setStatusChangeSaving(false);
    }
  };

  const onFinish = async (values) => {
    if (saving) return;
    setSaving(true);

    const payload = buildCombinedPayload(values, viewMode, selectedCustomer);

    try {
      if (viewMode === "CREATE") {
        await dispatch(createCustomerWithUser(payload));
        message.success("Customer & User created successfully.");
        notification.success({
          message: "Customer & User Created",
          description: `${payload.custName} / ${payload.userName} has been created successfully.`,
          placement: "topRight",
        });
      } else if (viewMode === "EDIT") {
        await dispatch(updateCustomerWithUser(payload));
        message.success("Customer & User updated successfully.");
        notification.success({
          message: "Customer & User Updated",
          description: `${payload.custName} / ${payload.userName} has been updated successfully.`,
          placement: "topRight",
        });
      }

      dispatch(getCustomerUsers());
      form.resetFields();
      setDirty(false);
      setSelectedCustomer(null);
      setViewMode("LIST");
    } catch (err) {
      console.error("Save failed:", err);
      const backendMessage = err?.response?.data?.message;
      notification.error({
        message: "Operation Failed",
        description: backendMessage || "Something went wrong while saving the customer/user.",
        placement: "topRight",
      });
      message.error(backendMessage || "Failed to commit configuration changes.");
    } finally {
      setSaving(false);
    }
  };

  const getFormTitle = () => {
    switch (viewMode) {
      case "CREATE": return "Create Customer + User Profile";
      case "EDIT": return "Edit Customer + User Profile";
      case "VIEW": return "View Customer + User Profile";
      default: return "";
    }
  };

  return (
    <div className="cm-scope cm-grain cm-sans min-h-screen w-full text-[var(--ink-700)] relative">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="cm-serif text-2xl font-semibold text-[var(--ink-950)]">Customer & User Management</h1>
            <p className="text-sm text-[var(--ink-500)]">Create and manage customer master records together with their linked system user in a single profile.</p>
          </div>
          <Segmented
            value={customerMode}
            onChange={handleCustomerModeChange}
            options={[
              { label: "Domestic", value: "domestic" },
              { label: "Export", value: "export" },
            ]}
            size="middle"
          />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pb-32 pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard index={0} title="Total Profiles" value={filteredCustomersData.length} delta={metrics.deltaTotal} icon={Users} accent="copper" />
            <MetricCard index={1} title="Active Profiles" value={filteredCustomersData.filter(c => c.userStatus === true).length} delta={metrics.deltaActive} icon={UserCheck} accent="moss" />
            <MetricCard index={2} title="Disabled Profiles" value={filteredCustomersData.filter(c => c.userStatus === false).length} delta={metrics.deltaDisabled} icon={UserX} accent="clay" />
          </div>

          <CombinedListTable dataSource={filteredCustomersData} loading={loadingUsers} onAction={handleTableActionDispatch} onToggleStatus={handleToggleUserStatus} onAddCustomer={triggerAddFlow} onRefresh={() => dispatch(getCustomerUsers())} />
        </div>
      </div>

      <AnimatePresence>
        {viewMode !== "LIST" && (
          <>
            <motion.div
              key="drawer-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleBackNavigation}
              className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-[6px]"
            />

            <motion.div
              key="drawer-panel"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 right-0 z-50 h-full w-full max-w-4xl bg-[var(--background)] shadow-[-10px_0_30px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--canvas-raised)] px-6 py-4 shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={handleBackNavigation} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] hover:bg-[var(--ink-100)] transition-colors text-[var(--ink-700)]">
                    <ArrowLeft size={15} />
                  </button>
                  <div>
                    <h2 className="cm-serif text-lg font-semibold text-[var(--ink-950)]">{getFormTitle()}</h2>
                    <p className="text-xs text-[var(--ink-500)]">Configure customer master, contact, address, and system user details together.</p>
                  </div>
                </div>
                <button onClick={handleBackNavigation} className="p-1.5 rounded-md hover:bg-[var(--ink-100)] text-[var(--ink-400)] hover:text-[var(--ink-700)] transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 pb-28">
                <Form form={form} layout="vertical" requiredMark={false} disabled={viewMode === "VIEW"} onValuesChange={handleValuesChange} onFinish={onFinish}>
                  <div className="space-y-6">
                    {/* Section 01 — Identity */}
                    <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                      <div className="mb-5 flex items-center justify-between">
                        <SectionHeader icon={Building2} title="Customer & User Identity" accent="copper" index="01" />
                        <button type="button" onClick={() => setPreviewOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--ink-100)] px-3 py-1.5 cm-mono text-[10.5px] font-semibold text-[var(--ink-700)] transition-colors hover:bg-[var(--copper-100)] hover:text-[var(--copper-700)]">
                          <Eye size={12} /> Preview Profile
                        </button>
                      </div>

                      {/* custCode and custName stay in form state/payload but are hidden from
                          the UI — custCode is still auto-generated/preserved, and custName is
                          always kept equal to custFullName (see handleValuesChange). */}
                      <Form.Item name="custCode" hidden>
                        <Input />
                      </Form.Item>
                      <Form.Item name="custName" hidden>
                        <Input />
                      </Form.Item>
                      <Form.Item name="custFullName" label="Customer Full Name" rules={[{ required: true, message: "Full name is mandatory" }]}>
                        <Input size="middle" placeholder="Full legal / display name" />
                      </Form.Item>

                      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                        <Form.Item name="custType" label="Internal Customer Type" rules={[{ required: true, message: "Customer type is mandatory" }]}>
                          <Select size="middle" placeholder="Choose classification" options={customerTypeOptions} onChange={handleCustomerTypeChange} />
                        </Form.Item>
                        <Form.Item name="custCategory" label="Customer Category" rules={[{ required: true, message: "Customer category is mandatory" }]}>
                          <Select size="middle" placeholder="Choose tracking category" options={custCategoryOptions} />
                        </Form.Item>
                      </div>

                      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                        <Form.Item name="userName" label="User ID" rules={[{ required: true, message: "User ID is mandatory" }]}>
                          <Input size="middle" placeholder="e.g. unique_node_id" />
                        </Form.Item>
                        <Form.Item name="userPassword" label="Password" rules={[{ required: viewMode === "CREATE", message: "Password is required" }, { min: 8, message: "Minimum 8 characters" }]}>
                          <Input.Password size="middle" placeholder="Leave blank to keep existing password" prefix={<KeyRound size={14} className="mr-1 text-[var(--ink-500)]" />} />
                        </Form.Item>
                      </div>

                      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                        <Form.Item name="userMail" label="User Email" rules={[{ type: "email", message: "Enter a valid email address" }]}>
                          <Input size="middle" placeholder="name@company.com" prefix={<Mail size={14} className="mr-1 text-[var(--ink-500)]" />} />
                        </Form.Item>
                        <Form.Item name="userMobile" label="User Mobile" rules={[{ pattern: /^$|^[0-9+ ]{10,15}$/, message: "Invalid mobile number" }]}>
                          <Input size="middle" placeholder="Mobile number" prefix={<Smartphone size={14} className="mr-1 text-[var(--ink-500)]" />} />
                        </Form.Item>
                      </div>

                      {/* <Form.Item name="userCurrency" label="User Price Unit">
                        <Select size="middle" showSearch allowClear placeholder="Select currency" options={PRICE_UNITS} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} suffixIcon={<DollarSign size={14} className="text-[var(--ink-500)]" />} />
                      </Form.Item> */}

                      <Form.Item name="status" label="Profile Status" initialValue="Active" className="!mb-0">
                        <Radio.Group optionType="button" buttonStyle="solid" className="inline-flex">
                          <Radio.Button
                            value="Active"
                            className="!px-4 !h-9"
                            onClick={(e) => {
                              if (viewMode === "EDIT" && selectedCustomer && form.getFieldValue("status") !== "Active") {
                                e.preventDefault();
                                handleStatusRadioChange("Active");
                              }
                            }}
                          >
                            <span className="flex items-center gap-1.5 text-xs"><ShieldCheck size={13} /> Active</span>
                          </Radio.Button>
                          <Radio.Button
                            value="Disabled"
                            className="!px-4 !h-9"
                            onClick={(e) => {
                              if (viewMode === "EDIT" && selectedCustomer && form.getFieldValue("status") !== "Disabled") {
                                e.preventDefault();
                                handleStatusRadioChange("Disabled");
                              }
                            }}
                          >
                            <span className="flex items-center gap-1.5 text-xs"><ShieldOff size={13} /> Inactive</span>
                          </Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                    </motion.div>

                    {/* Section 02 — Internal Assignment + Business Configuration */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                        <SectionHeader icon={Users} title="Internal Assignment" accent="plum" index="02" />
                        <div className="space-y-1">
                          <Form.Item name="supervisor" label="Assigned Supervisor" rules={[{ required: true, message: "Supervisor is mandatory" }]}>
                            <Select size="middle" showSearch allowClear placeholder="Link supervisor" options={supervisorsOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                          </Form.Item>
                          <Form.Item name="lead" label="Team Leader" rules={[{ required: true, message: "Lead is mandatory" }]}>
                            <Select size="middle" showSearch allowClear placeholder="Link team lead" options={leadsOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                          </Form.Item>
                          <Form.Item name="manager" label="Senior Business Manager" rules={[{ required: true, message: "Manager is mandatory" }]}>
                            <Select size="middle" showSearch allowClear placeholder="Link manager" options={managersOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                          </Form.Item>
                          <Form.Item name="region" label="Region" className="!mb-0">
                            <Select size="middle" allowClear placeholder="Select region" options={regionOptions} />
                          </Form.Item>
                        </div>
                      </motion.div>

                      <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                        <SectionHeader icon={Package} title="Business Configuration" accent="ochre" index="03" />
                        <div className="space-y-1">
                          <Form.Item name="channel" label="Channel" rules={[{ required: true, message: "Channel is mandatory" }]}>
                            <Select size="middle" placeholder="Select channel" options={CHANNELS} />
                          </Form.Item>
                          <Form.Item name="priceBasis" label="Incoterms" rules={[{ required: true, message: "Price basis is mandatory" }]}>
                            <Select size="middle" placeholder="Select basis" options={PRICE_BASIS} />
                          </Form.Item>
                          <Form.Item name="priceUnit" label="Price Unit" rules={[{ required: true, message: "Price unit is mandatory" }]} className="!mb-0">
                            <Select size="middle" placeholder="Select unit" options={PRICE_UNITS} />
                          </Form.Item>
                        </div>
                      </motion.div>
                    </div>

                    {/* Section 04 — Contact + Address */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                        <SectionHeader icon={Phone} title="Contact Details" accent="moss" index="04" />
                        <div className="space-y-1">
                          <Form.Item name="contactName" label="Contact Person">
                            <Input size="middle" placeholder="Full name" prefix={<Users size={14} className="mr-1 text-[var(--ink-500)]" />} />
                          </Form.Item>
                          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                            <Form.Item name="phoneNo" label="Phone Desk" rules={[{ pattern: /^[0-9+ ]*$/, message: "Digits only" }]}>
                              <Input size="middle" placeholder="Landline" prefix={<Phone size={14} className="mr-1 text-[var(--ink-500)]" />} />
                            </Form.Item>
                            <Form.Item name="mobile" label="Company Mobile" rules={[{ pattern: /^$|^[0-9+ ]{10,15}$/, message: "Invalid" }]}>
                              <Input size="middle" placeholder="Mobile" prefix={<Smartphone size={14} className="mr-1 text-[var(--ink-500)]" />} />
                            </Form.Item>
                          </div>
                          <Form.Item name="email" label="Company Email" rules={[{ type: "email", message: "Enter valid email" }]}>
                            <Input size="middle" placeholder="name@company.com" prefix={<Mail size={14} className="mr-1 text-[var(--ink-500)]" />} />
                          </Form.Item>
                          <Form.Item name="webAddress" label="Website URL" className="!mb-0">
                            <Input size="middle" placeholder="www.company.com" prefix={<Globe size={14} className="mr-1 text-[var(--ink-500)]" />} />
                          </Form.Item>
                        </div>
                      </motion.div>

                      <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                        <SectionHeader icon={MapPin} title="Address Details" accent="clay" index="05" />
                        <div className="space-y-1">
                          <Form.Item name="add1" label="Address Line 1" rules={[{ required: true, message: "Address line 1 is mandatory" }]}>
                            <Input size="middle" placeholder="Street, building" />
                          </Form.Item>
                          <Form.Item name="add2" label="Address Line 2">
                            <Input size="middle" placeholder="Area, landmark" />
                          </Form.Item>
                          <Form.Item name="add3" label="Address Line 3">
                            <Input size="middle" placeholder="Suite, floor" />
                          </Form.Item>
                          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                            <Form.Item name="country" label="Country" rules={[{ required: true, message: "Country is mandatory" }]}>
                              <Select size="middle" showSearch allowClear placeholder="Search country..." options={countryOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                            </Form.Item>
                            <Form.Item name="city" label="City" rules={[{ required: true, message: "City is mandatory" }]}>
                              <Select size="middle" showSearch allowClear placeholder="Search city..." options={cityOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                            </Form.Item>
                          </div>
                          <Form.Item name="zipCode" label="Zip Code" className="!mb-0">
                            <Select size="middle" showSearch allowClear placeholder="Select zip code" options={zipCodeOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                          </Form.Item>
                        </div>
                      </motion.div>
                    </div>

                    {/* Section 06 — Settlement */}
                    <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                      <SectionHeader icon={CreditCard} title="Commercial Settlement Channel" accent="moss" index="06" />
                      <Form.Item name="paymentMode" label="Payment Mode" rules={[{ required: true, message: "Payment mode is mandatory" }]} className="!mb-4">
                        <PaymentModeSelector disabled={viewMode === "VIEW"} />
                      </Form.Item>

                      <AnimatePresence mode="wait">
                        {paymentMode && (
                          <motion.div key={paymentMode} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--ink-100)]/60 p-4 mt-2">
                              {paymentMode === "Advance" && (
                                <Form.Item name="advanceType" label="Advance Type" rules={[{ required: true, message: "Select advance type" }]} className="!mb-0 max-w-xs">
                                  <Segmented options={["Full", "Partial"]} block />
                                </Form.Item>
                              )}

                              {paymentMode === "LC" && (
                                <>
                                  <Form.Item name="lcTerm" label="LC Term" rules={[{ required: true, message: "Select LC term" }]} className="!mb-0">
                                    <Radio.Group className="flex flex-wrap gap-2">
                                      {LC_TERMS.map((t) => <Radio.Button key={t} value={t} className="rounded-lg">{t}</Radio.Button>)}
                                    </Radio.Group>
                                  </Form.Item>
                                  <AnimatePresence>
                                    {lcTerm === "Other Days" && (
                                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-4">
                                        <Form.Item name="lcOtherDays" label="Custom LC Days" rules={[{ required: true, message: "Enter number of days" }, { type: "integer", min: 1, message: "Must be a positive whole number" }]} className="!mb-0 max-w-xs">
                                          <InputNumber size="middle" min={1} precision={0} placeholder="Days" className="w-full" />
                                        </Form.Item>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </>
                              )}

                              {paymentMode === "Payment Against Shipping Documents" && (
                                <p className="flex items-center gap-2 text-[12px] text-[var(--ink-500)]"><Info size={14} className="shrink-0" /> No additional fields required for this payment mode.</p>
                              )}

                              {paymentMode === "Open Credit From Date Of BL" && (
                                <>
                                  <Form.Item name="creditPeriod" label="Credit Period" rules={[{ required: true, message: "Select credit period" }]} className="!mb-0">
                                    <Radio.Group className="flex flex-wrap gap-2">
                                      {CREDIT_PERIODS.map((t) => <Radio.Button key={t} value={t} className="rounded-lg">{t}</Radio.Button>)}
                                    </Radio.Group>
                                  </Form.Item>
                                  <AnimatePresence>
                                    {creditPeriod === "Other Days" && (
                                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-4">
                                        <Form.Item name="creditOtherDays" label="Custom Credit Days" rules={[{ required: true, message: "Enter number of days" }, { type: "integer", min: 1, message: "Must be a positive whole number" }]} className="!mb-0 max-w-xs">
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

                    {/* Section 07 — Legal & Instructions */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <motion.div variants={fadeUp} custom={6} initial="hidden" animate="show" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                        <SectionHeader icon={FileText} title="Payment Terms" accent="ochre" index="07" />
                        <Form.Item name="paymentTerms" className="!mb-0">
                          <Select
                            size="middle"
                            showSearch
                            allowClear
                            placeholder="Select payment terms"
                            options={paymentTermOptions}
                            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                          />
                        </Form.Item>
                      </motion.div>
                      <motion.div variants={fadeUp} custom={7} initial="hidden" animate="show" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                        <SectionHeader icon={ClipboardList} title="Customer Special Instructions" accent="copper" index="08" />
                        <Form.Item name="specialInstruction" className="!mb-0">
                          <TextArea rows={4} placeholder="Fulfillment requirements, operational directives..." />
                        </Form.Item>
                      </motion.div>
                    </div>

                    <motion.div variants={fadeUp} custom={8} initial="hidden" animate="show" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                      <SectionHeader icon={ClipboardList} title="User Instructions (Internal)" accent="plum" index="09" />
                      <Form.Item name="custInstruction" className="!mb-0">
                        <TextArea rows={3} placeholder="User-level processing notes, routing overrides..." />
                      </Form.Item>
                    </motion.div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--background)] px-6 py-4 flex items-center justify-between z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
                    <p className="flex items-center gap-1.5 cm-mono text-[10px] text-[var(--ink-500)] max-w-[200px] sm:max-w-xs truncate">
                      <Circle size={6} className={dirty ? "fill-[var(--copper-600)] text-[var(--copper-600)] animate-pulse" : "fill-[var(--moss-600)] text-[var(--moss-600)]"} />
                      {dirty ? "Detected unsaved edits in active session fields." : "State configurations synchronized with baseline reference targets."}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="middle" onClick={handleBackNavigation} disabled={saving}>Cancel</Button>
                      {viewMode !== "VIEW" && (
                        <>
                          <Button size="middle" icon={<RotateCcw size={13} />} onClick={() => form.resetFields()} disabled={saving}>Reset</Button>
                          <Button type="primary" size="middle" htmlType="submit" loading={saving} disabled={saving} icon={<Save size={14} />} className="!bg-[var(--primary)] hover:!bg-[var(--primary)]/60 border-none text-white font-medium min-w-[120px]">
                            Commit Changes
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={null} closable={false} centered width={380} styles={{ content: { padding: 0, background: "transparent", boxShadow: "none" }, mask: { background: "rgba(23,19,16,0.55)", backdropFilter: "blur(4px)" } }}>
        <div className="relative">
          <button type="button" onClick={() => setPreviewOpen(false)} className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"><X size={14} /></button>
          <CustomerUserPreviewCard values={formValues} />
        </div>
      </Modal>

      <Modal
        open={statusConfirmOpen}
        title={pendingStatusChange?.newStatus ? "Activate User" : "Deactivate User"}
        onCancel={() => {
          setStatusConfirmOpen(false);
          setPendingStatusChange(null);
        }}
        onOk={executeStatusChange}
        confirmLoading={statusChangeSaving}
        okText={pendingStatusChange?.newStatus ? "Activate" : "Deactivate"}
        okType={pendingStatusChange?.newStatus ? "primary" : "danger"}
        cancelText="Cancel"
        width="90%"
        style={{ maxWidth: 420 }}
      >
        <p className="text-sm sm:text-base">
          Are you sure you want to {pendingStatusChange?.newStatus ? "activate" : "deactivate"}{" "}
          <strong>{pendingStatusChange?.record?.username}</strong>?
          {pendingStatusChange?.target === "form" ? " This will be saved immediately." : ""}
        </p>
      </Modal>

      <Modal
        open={leaveConfirmOpen}
        title="Unsaved Changes"
        onCancel={() => setLeaveConfirmOpen(false)}
        onOk={() => {
          executeBackNavigation();
          setLeaveConfirmOpen(false);
        }}
        okText="Discard"
        okType="danger"
        cancelText="Keep Editing"
        width="90%"
        style={{ maxWidth: 420 }}
      >
        <p className="text-sm sm:text-base">
          You have unsaved changes. Discard structural fields and return to listing?
        </p>
      </Modal>
    </div>
  );
}