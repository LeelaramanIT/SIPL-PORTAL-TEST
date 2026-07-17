  import React, { useState, useEffect, useMemo } from "react";
  import * as XLSX from "xlsx"; // Added SheetJS for native Excel generation
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
    Table,
    Space,
    Tag,
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
    Filter,
    Download,
    RefreshCw,
    Edit3,
    Copy,
    Trash2,
    ArrowLeft,
  } from "lucide-react";

  import { SectionHeader, MetricCard, COUNTRIES, CITIES, PRICE_UNITS } from "./Customermasterpage";
  import { useSelector, useDispatch } from "react-redux";
  import {
    getCustomers,
    getCustomerUsers,
    createCustomerUser,
    updateCustomerUser,
    deleteCustomerUser,
    createShipBillAddress,
  } from "../../../Redux/Slices/Master/CustomerMaster/CustomerMasterSlice";
  import { formatDateTime } from "../../../utils/FormatDate";
  import { DynamicDataTable } from "../../../components/DynamicDataTable";

  const { TextArea } = Input;

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

  // Domestic/Export classification must use ONLY custCode.
  const isDomesticCustomer = (custCode) =>
    String(custCode || "").trim().toUpperCase() === "DE0048";

  /* ------------------------------------------------------------------ */
  /* Motion Overlay & Popup Slider Animation Variants                 */
  /* ------------------------------------------------------------------ */
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.25 } }
  };

  const drawerVariants = {
    hidden: { x: "100%" },
    visible: { 
      x: 0, 
      transition: { type: "spring", damping: 28, stiffness: 220 } 
    },
    exit: { 
      x: "100%", 
      transition: { ease: "easeInOut", duration: 0.3 } 
    }
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
  function UserPreviewCard({ values }) {
    const userName = values.userName || values.userId || "";
    const isInactive = values.userStatus === false || values.status === "Disabled";
    const initials = userName ? userName.slice(0, 2).toUpperCase() : "—";

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
              <p className="cm-serif truncate text-[15px] font-medium">{userName || "New user"}</p>
              <p className="truncate text-[11.5px] text-white/50">{values.custFullName || values.customer || "Customer not linked"}</p>
            </div>
          </div>

          <div className="pt-3 space-y-1">
            <DataRow label="Customer Code" value={values.custCode} />
            <DataRow label="App User Name" value={values.appUserName || values.userId} />
            <DataRow label="Email" value={values.userMail || values.email} />
            <DataRow label="Mobile" value={values.userMobile} />
            <DataRow label="Currency" value={values.userCurrency || values.currency} />
            <DataRow label="Region" value={values.region} />
            <DataRow label="Customer Type" value={values.custType || values.category} />
            <DataRow label="Payment Mode" value={values.expPayMode || values.paymentMode} />
            <DataRow label="Payment Days" value={paymentDays} />
            <DataRow label="Hold Status" value={values.custHoldStatus === true ? "Hold" : values.custHoldStatus === false ? "Released" : "—"} />
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
  /* Component: Customer List Workspace                                 */
  /* ------------------------------------------------------------------ */
  function CustomerListTable({ dataSource, loading, onAction, onToggleStatus, onAddCustomer, onRefresh }) {
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

    useEffect(() => {
      let output = dataSource.filter((item) => {
        const matchCustomer = !searchText ||
          (item.custCode && item.custCode.toLowerCase().includes(searchText.toLowerCase())) ||
          (item.custFullName && item.custFullName.toLowerCase().includes(searchText.toLowerCase()));

        const matchUser = !searchUserId ||
          (item.userName && item.userName.toLowerCase().includes(searchUserId.toLowerCase())) ||
          (item.appUserName && item.appUserName.toLowerCase().includes(searchUserId.toLowerCase())) ||
          (item.userMail && item.userMail.toLowerCase().includes(searchUserId.toLowerCase())) ||
          (item.userMobile && item.userMobile.toLowerCase().includes(searchUserId.toLowerCase()));

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
      { header: "Customer ID", accessor: "id", width: "120px", align: "center" },
      { header: "Customer Code", accessor: "custCode", width: "120px", align: "left" },
      { header: "Customer Name", accessor: "custFullName", width: "200px", align: "left" },
      { header: "App User Name", accessor: "appUserName", width: "140px", align: "left" },
      { header: "User Name", accessor: "userName", width: "140px", align: "left" },
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
      { header: "Hold Status", accessor: "custHoldStatus", width: "110px", align: "left", render: (status) => {
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
      { header: "Created Date", accessor: "createdDate", width: "120px", align: "left", render: (date) => formatDateTime(date) },
      { header: "Last Login", accessor: "lastLogin", width: "120px", align: "left", render: (date) => formatDateTime(date) },
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

    // Implemented client-side analytical Excel exporter payload generation standard
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
          "User Name": item.userName || "—",
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
          "Hold Status Flag": item.custHoldStatus ? "Active Hold" : "Released Node",
          "System User Profile Status": item.userStatus ? "Active Enrolled" : "Disabled Reference",
          "Created Context Date": formatDateTime(item.createdDate),
          "Last System Access Timestamp": formatDateTime(item.lastLogin)
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportPayload);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Master Index");

        // Auto-fit dynamic row character layout margins for sheet aesthetics
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
  /* Main Module Component Layout Orchestrator Manager                  */
  /* ------------------------------------------------------------------ */
  export default function UserCreation({
    metrics = { totalUsers: 0, activeUsers: 0, disabledUsers: 0, deltaTotal: 3.1, deltaActive: 2.2, deltaDisabled: -1.4 },
  }) {
    const [form] = Form.useForm();
    const [viewMode, setViewMode] = useState("LIST"); // LIST | CREATE | EDIT | VIEW
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const dispatch = useDispatch();
    const customersData = useSelector((state) => state.customerMaster.listOfCustomerUsers || []);
    const loadingUsers = useSelector((state) => state.customerMaster.loadingUsers);
    const customersList = useSelector((state) => state.customerMaster.listOfCustomer || []);
    console.log(
  customersList.filter((customer) => customer.custcode === "DE0048")
);
    

    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    // Domestic / Export toggle — filters the Customer dropdown (customersList,
    // via c.custcode) and the main list table (customersData, via item.custCode).
    const [customerMode, setCustomerMode] = useState("domestic");

    const paymentMode = Form.useWatch("paymentMode", form);
    const lcTerm = Form.useWatch("lcTerm", form);
    const creditPeriod = Form.useWatch("creditPeriod", form);
    const formValues = Form.useWatch([], form) || {};

    const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState(null); // { target: 'record' | 'form', record, newStatus, newStatusLabel }
    const [statusChangeSaving, setStatusChangeSaving] = useState(false);

    // Declarative replacement for the window.confirm() previously used in
    // handleBackNavigation — holds nothing but a boolean flag since there's
    // only one action to run (leave the drawer) if the user confirms.
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

    useEffect(() => {
      dispatch(getCustomers());
      dispatch(getCustomerUsers());
    }, [dispatch]);

    const buildCustomerUserPayload = (values, selectedCustomer, viewMode, customersList) => {
    let finalCustCode;
    let finalCustFullName;

    if (viewMode === "EDIT") {
      // EDIT mode: custCode must NEVER change or be recalculated — always use
      // the original record's value, regardless of which fields were edited.
      finalCustCode = selectedCustomer?.custCode;
      finalCustFullName = values.customer || values.custFullName || "";
    } else {
      // CREATE mode: dropdown value is the Customer Master (customersList)
      // record id — same source as Customermasterpage.jsx's customerOptions.
      const selectedRecord = customersList.find((c) => c.id === values.customer);
      finalCustCode = selectedRecord ? selectedRecord.custcode : values.custCode || "";
      finalCustFullName = selectedRecord ? selectedRecord.custname : values.custFullName || "";
    }

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
      userPassword: values.password || "", // backend should ignore blank password on update
      userMail: values.email || values.userMail || "",
      userMobile: values.userMobile || "",
      userCurrency: values.userCurrency || "",
      userStatus: values.status === "Active" || values.userStatus === true,
      appUserName: values.appUserName || values.userId || values.userName || "",
      custFullName: finalCustFullName,
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

    if (viewMode === "EDIT") {
      payload.id = selectedCustomer?.id || 0;
    }

    return payload;
  };

    // Domestic/Export scoped Customer dropdown options — classification uses
    // ONLY custcode/custCode, matching the DE0048 business rule.
    // - CREATE mode: sourced from customersList (Customer Master) — same
    //   source and shape as Customermasterpage.jsx's customerOptions
    //   (value: c.id, label: "custcode - custname").
    // - EDIT/VIEW mode: restricted to customer-user records already present
    //   in the current (domestic/export scoped) table — i.e. you can only
    //   re-link the user to a customer that's already listed, not to any
    //   arbitrary Customer Master entry.
    const customerOptions = viewMode === "CREATE"
      ? customersList
          .filter((c) => c.custStatus === true)
          .filter((c) =>
            customerMode === "domestic"
              ? isDomesticCustomer(c.custcode)
              : !isDomesticCustomer(c.custcode)
          )
          .map((c) => ({
            value: c.id,
            label: `${c.custcode} - ${c.custname}`,
            custCode: c.custcode,
            custFullName: c.custname,
          }))
      : customersData
          .filter((item) => item.userStatus === true)
          .filter((item) =>
            customerMode === "domestic"
              ? isDomesticCustomer(item.custCode)
              : !isDomesticCustomer(item.custCode)
          )
          .map((item) => ({
            value: item.custFullName,
            label: `${item.custCode} - ${item.custFullName}`,
          }));

    // Domestic/Export scoped main list table data — classification uses
    // ONLY item.custCode, matching the DE0048 business rule.
    const filteredCustomersData = useMemo(
      () =>
        customersData.filter((item) =>
          customerMode === "domestic"
            ? isDomesticCustomer(item.custCode)
            : !isDomesticCustomer(item.custCode)
        ),
      [customersData, customerMode]
    );

    const uniqueCustTypes = [...new Set(customersData.map(item => item.custType).filter(Boolean))];
    const custTypeOptions = uniqueCustTypes.length > 0
      ? uniqueCustTypes.map(v => ({ value: v, label: v }))
      : ["Wholesale", "Retail", "Corporate", "Export", "OEM"].map(v => ({ value: v, label: v }));

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

    const handleValuesChange = (changedValues) => {
      setDirty(true);
      // CREATE mode: dropdown value is the customersList (Customer Master)
      // record id — resolve custCode via id.
      if (viewMode === "CREATE" && Object.prototype.hasOwnProperty.call(changedValues, "customer")) {
        const selectedRecord = customersList.find((c) => c.id === changedValues.customer);
        form.setFieldsValue({
          custCode: selectedRecord ? selectedRecord.custcode : undefined
        });
      } else if (viewMode !== "EDIT" && Object.prototype.hasOwnProperty.call(changedValues, "customer")) {
        // VIEW-mode fallback: dropdown is now sourced from customersData
        // (already-listed table records), value is custFullName.
        const selectedCust = customersData.find((item) => item.custFullName === changedValues.customer);
        form.setFieldsValue({
          custCode: selectedCust ? selectedCust.custCode : undefined
        });
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

    // Domestic / Export toggle — a customer selected in one mode must not remain
    // selected when switching to the other, so clear the dependent form fields.
    const handleCustomerModeChange = (value) => {
      setCustomerMode(value);
      form.setFieldsValue({ customer: undefined, custCode: undefined });
    };

    const handleFormSubmit = async (values) => {
    try {
      // Dispatch the payload directly to Redux middleware
      await dispatch(createShipBillAddress(values));
      
      message.success("Address created and synchronized successfully!");
      setIsModalVisible(false); // Close your address editor modal
      form.resetFields();       // Clear the active fields
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to sync address with backend.");
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

    const mapApiRecordToForm = (record) => {
      return {
        ...record,
        custCode: record.custCode,
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
    };

    const handleTableActionDispatch = (actionType, record) => {
      if (actionType === "VIEW" || actionType === "EDIT") {
        form.resetFields();
        form.setFieldsValue(mapApiRecordToForm(record));
        setSelectedCustomer(record);
        setDirty(false);
        setViewMode(actionType);
      } else if (actionType === "DUPLICATE") {
        form.resetFields();
        const mapped = mapApiRecordToForm(record);
        form.setFieldsValue({
          ...mapped,
          userId: `${record.userName}_copy`,
          customer: `${record.custFullName} (Copy)`,
          custCode: `${record.custCode}_copy`,
          id: 0
        });
        setSelectedCustomer(null);
        setDirty(true);
        setViewMode("CREATE");
        message.info("Copied base customer profile parameters into operational initialization states.");
      } else if (actionType === "DELETE") {
        Modal.confirm({
          title: "Delete operational entity record link?",
          content: `Are you certain you wish to completely drop user allocation mapping ${record.userName} attached to ${record.custFullName}? This structural pipeline instruction cannot be undone.`,
          okText: "Confirm Drop",
          okType: "danger",
          cancelText: "Retain Link",
          onOk: async () => {
            try {
              await dispatch(deleteCustomerUser(record.id));
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
    const handleDraftPreservation = async () => {
      try {
        const values = await form.validateFields();
        setSaving(true);
        message.success("Operational draft configuration saved locally inside master layout staging caches.");
        setDirty(false);
      } catch (err) {
        if (err?.errorFields) {
          message.error("Resolve mandatory layout target items prior to drafting configurations.");
        }
      } finally {
        setSaving(false);
      }
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
      const payload = { id: record.id, userStatus: newStatus };
      await dispatch(updateCustomerUser(payload));

      message.success(`User ${newStatus ? "activated" : "deactivated"} successfully.`);
      notification.success({
        message: newStatus ? "User Activated" : "User Deactivated",
        description: `${record.userName} is now ${newStatus ? "active" : "inactive"}.`,
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
    if (saving) return; // guard against duplicate submits
    setSaving(true);

    const payload = buildCustomerUserPayload(values, selectedCustomer, viewMode, customersList, customersData);

    try {
      if (viewMode === "CREATE") {
        await dispatch(createCustomerUser(payload));
        message.success("Customer User created successfully.");
        notification.success({
          message: "Customer User Created",
          description: `${payload.userName} has been created successfully.`,
          placement: "topRight",
        });
      } else if (viewMode === "EDIT") {
        console.log("ORIGINAL CUSTCODE:", selectedCustomer?.custCode);
        console.log("FORM CUSTCODE:", values.custCode);
        console.log("FINAL UPDATE PAYLOAD:", payload);
        await dispatch(updateCustomerUser(payload));
        message.success("Customer User updated successfully.");
        notification.success({
          message: "Customer User Updated",
          description: `${payload.userName} has been updated successfully.`,
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
        description: backendMessage || "Something went wrong while saving the customer user.",
        placement: "topRight",
      });
      message.error(backendMessage || "Failed to commit user configuration changes.");
    } finally {
      setSaving(false);
    }
  };
    const getFormTitle = () => {
      switch (viewMode) {
        case "CREATE": return "Create Customer User Profile";
        case "EDIT": return "Edit Master User Scope Settings";
        case "VIEW": return "View Customer User Configurations";
        default: return "";
      }
    };

    return (
      <div className="cm-scope cm-grain cm-sans min-h-screen w-full text-[var(--ink-700)] relative">
        {/* Underlying Dashboard Header & List Contents (Always visible underneath the overlay popup slider) */}
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div>
              <h1 className="cm-serif text-2xl font-semibold text-[var(--ink-950)]">Customer User Management</h1>
              <p className="text-sm text-[var(--ink-500)]">Manage customer users, system permissions, and financial layout routing configurations.</p>
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
              <MetricCard index={0} title="Total Dashboard Users" value={customersData.length} delta={metrics.deltaTotal} icon={Users} accent="copper" />
              <MetricCard index={1} title="Active Network Node Links" value={customersData.filter(c => c.userStatus === true).length} delta={metrics.deltaActive} icon={UserCheck} accent="moss" />
              <MetricCard index={2} title="Disabled System Profiles" value={customersData.filter(c => c.userStatus === false).length} delta={metrics.deltaDisabled} icon={UserX} accent="clay" />
            </div>

            <CustomerListTable  dataSource={filteredCustomersData} loading={loadingUsers} onAction={handleTableActionDispatch} onToggleStatus={handleToggleUserStatus} onAddCustomer={triggerAddFlow} onRefresh={() => dispatch(getCustomerUsers())} />
          </div>
        </div>

        {/* Slide-Over Drawer Popup and Blur Layer Overlay standard */}
        <AnimatePresence>
          {viewMode !== "LIST" && (
            <>
              {/* Background Blur Overlay Element */}
              <motion.div
                key="drawer-backdrop"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={handleBackNavigation}
                className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-[6px]"
              />

              {/* Right-to-Left Slide Flyout Panel Form Container */}
              <motion.div
                key="drawer-panel"
                variants={drawerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-y-0 right-0 z-50 h-full w-full max-w-4xl bg-[var(--background)] shadow-[-10px_0_30px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
              >
                {/* Drawer Dynamic Context Popup Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--canvas-raised)] px-6 py-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <button onClick={handleBackNavigation} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] hover:bg-[var(--ink-100)] transition-colors text-[var(--ink-700)]">
                      <ArrowLeft size={15} />
                    </button>
                    <div>
                      <h2 className="cm-serif text-lg font-semibold text-[var(--ink-950)]">{getFormTitle()}</h2>
                      <p className="text-xs text-[var(--ink-500)]">Configure financial routing and master validations constraints.</p>
                    </div>
                  </div>
                  <button onClick={handleBackNavigation} className="p-1.5 rounded-md hover:bg-[var(--ink-100)] text-[var(--ink-400)] hover:text-[var(--ink-700)] transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Scrollable Form Body Layout Area Wrapper */}
                <div className="flex-1 overflow-y-auto px-6 py-6 pb-28">
                  <Form form={form} layout="vertical" requiredMark={false} disabled={viewMode === "VIEW"} onValuesChange={handleValuesChange} onFinish={onFinish}>
                    <div className="space-y-6">
                      <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-  awhite p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                          <SectionHeader icon={UserPlus} title="Customer Information" accent="copper" index="01" />
                          <button type="button" onClick={() => setPreviewOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--ink-100)] px-3 py-1.5 cm-mono text-[10.5px] font-semibold text-[var(--ink-700)] transition-colors hover:bg-[var(--copper-100)] hover:text-[var(--copper-700)]">
                            <Eye size={12} /> Preview Profile
                          </button>
                        </div>

                        <Form.Item name="customer" label="Customer" rules={[{ required: true, message: "Customer link is mandatory" }]}>
                          <Select size="middle" showSearch allowClear placeholder="Choose target account node link" options={customerOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                        </Form.Item>

                        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                          <Form.Item name="userId" label="User ID" rules={[{ required: true, message: "System identifier user mapping reference mandatory" }]}>
                            <Input size="middle" placeholder="e.g. unique_node_id" />
                          </Form.Item>
                          <Form.Item name="password" label="Password" rules={[{ required: viewMode === "CREATE", message: "Password initialization code string required" }, { min: 8, message: "Requires minimum 8 characters code standard length" }]}>
                            <Input.Password size="middle" placeholder="Secure code structure allocation string" prefix={<KeyRound size={14} className="mr-1 text-[var(--ink-500)]" />} />
                          </Form.Item>
                        </div>

                        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                          <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Enter valid network email context protocol address syntax" }]}>
                            <Input size="middle" placeholder="name@company.com" prefix={<Mail size={14} className="mr-1 text-[var(--ink-500)]" />} />
                          </Form.Item>
                          <Form.Item name="currency" label="Price Unit">
                            <Select size="middle" showSearch allowClear placeholder="Select profile pricing scale matrix" options={PRICE_UNITS} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} suffixIcon={<DollarSign size={14} className="text-[var(--ink-500)]" />} />
                          </Form.Item>
                        </div>

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

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                          <SectionHeader icon={Users} title="Internal Corporate Matrix" accent="plum" index="02" />
                          <div className="space-y-1">
                            <Form.Item name="category" label="Customer Category" rules={[{ required: true, message: "Segment classification required" }]}>
                              <Select size="middle" placeholder="Choose tracking classification tier" options={custTypeOptions} />
                            </Form.Item>
                            <Form.Item name="supervisor" label="Assigned Supervisor" rules={[{ required: true, message: "Regional controller link checkpoint mandatory" }]}>
                              <Select size="middle" showSearch allowClear placeholder="Link supervision anchor instance" options={supervisorsOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                            </Form.Item>
                            <Form.Item name="lead" label="Team Leader" rules={[{ required: true, message: "Validation supervisor context key selection assignment required" }]}>
                              <Select size="middle" showSearch allowClear placeholder="Link tactical operations manager" options={leadsOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                            </Form.Item>
                            <Form.Item name="manager" label="Senior Business Manager" rules={[{ required: true, message: "Executive corporate tier supervisor node mandatory" }]}>
                              <Select size="middle" showSearch allowClear placeholder="Link core senior oversight node tracking signature" options={managersOptions} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                            </Form.Item>
                          </div>
                        </motion.div>

                        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                          <SectionHeader icon={MapPin} title="Logistics Warehouse Context" accent="clay" index="03" />
                          <div className="space-y-1">
                            <Form.Item name="country" label="Country" rules={[{ required: true, message: "Territory checkpoint mapping target index item key mandatory" }]}>
                              <Select size="middle" showSearch allowClear placeholder="Search registry territorial scopes..." options={COUNTRIES} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                            </Form.Item>
                            <Form.Item name="city" label="City" rules={[{ required: true, message: "Discharge urban zone node declaration target cell vital" }]}>
                              <Select size="middle" showSearch allowClear placeholder="Search urban terminal sector validation matrices..." options={CITIES} filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
                            </Form.Item>
                            <Form.Item name="region" label="Region">
                              <Select size="middle" allowClear placeholder="Select logistics macro sub-sector boundaries" options={regionOptions} />
                            </Form.Item>
                          </div>
                        </motion.div>
                      </div>

                      <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                        <SectionHeader icon={CreditCard} title="Commercial Settlement Channel Infrastructure" accent="moss" index="04" />
                        <Form.Item name="paymentMode" label="Primary Invoicing Clearing Loop Configuration Mechanism Channel Protocol" rules={[{ required: true, message: "Settlement route mechanism tracking loop asset validation target checkpoint needed" }]} className="!mb-4">
                          <PaymentModeSelector disabled={viewMode === "VIEW"} />
                        </Form.Item>

                        <AnimatePresence mode="wait">
                          {paymentMode && (
                            <motion.div key={paymentMode} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--ink-100)]/60 p-4 mt-2">
                                {paymentMode === "Advance" && (
                                  <Form.Item name="advanceType" label="Pre-shipment Allocation Balance Percentage Rule Scope Matrix" rules={[{ required: true, message: "Select advance protocol threshold scope type" }]} className="!mb-0 max-w-xs">
                                    <Segmented options={["Full", "Partial"]} block />
                                  </Form.Item>
                                )}

                                {paymentMode === "LC" && (
                                  <>
                                    <Form.Item name="lcTerm" label="Trade Finance Bank Counter-Guaranteed Usance Maturity Matrix Timeline Profiles" rules={[{ required: true, message: "Maturity date tier profile anchor verification tag missing" }]} className="!mb-0">
                                      <Radio.Group className="flex flex-wrap gap-2">
                                        {LC_TERMS.map((t) => <Radio.Button key={t} value={t} className="rounded-lg">{t}</Radio.Button>)}
                                      </Radio.Group>
                                    </Form.Item>
                                    <AnimatePresence>
                                      {lcTerm === "Other Days" && (
                                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-4">
                                          <Form.Item name="lcOtherDays" label="Explicit Variable Maturity Count Processing Offset Period Duration Grid Matrix" rules={[{ required: true, message: "Custom maturity threshold day integer entry checkpoint value mandatory" }, { type: "integer", min: 1, message: "Timeline tracking tracking offset sequence must follow whole integer limits specifications" }]} className="!mb-0 max-w-xs">
                                            <InputNumber size="middle" min={1} precision={0} placeholder="Enter specific sequence boundaries (Days)" className="w-full" />
                                          </Form.Item>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </>
                                )}

                                {paymentMode === "Payment Against Shipping Documents" && (
                                  <p className="flex items-center gap-2 text-[12px] text-[var(--ink-500)]"><Info size={14} className="shrink-0" /> Automatic commercial clearing system rule validation triggered. No additional custom sub-attribute parameters mapping fields are flagged as required configuration elements for this specific module index tracking branch.</p>
                                )}

                                {paymentMode === "Open Credit From Date Of BL" && (
                                  <>
                                    <Form.Item name="creditPeriod" label="Post-Discharge Open Account Aging Threshold Baseline Settings Profile Array" rules={[{ required: true, message: "Credit standard risk exposure exposure timeline aging profile value selection needed" }]} className="!mb-0">
                                      <Radio.Group className="flex flex-wrap gap-2">
                                        {CREDIT_PERIODS.map((t) => <Radio.Button key={t} value={t} className="rounded-lg">{t}</Radio.Button>)}
                                      </Radio.Group>
                                    </Form.Item>
                                    <AnimatePresence>
                                      {creditPeriod === "Other Days" && (
                                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-4">
                                          <Form.Item name="creditOtherDays" label="Explicit Variable Credit Limit Tracking Metric Day Duration Scope Bounds Settings" rules={[{ required: true, message: "Input custom clearing frame baseline tracking parameters variable metric layout field value" }, { type: "integer", min: 1, message: "Requires structural configuration sequence formatted strictly into tracking whole metrics positive integer arrays" }]} className="!mb-0 max-w-xs">
                                            <InputNumber size="middle" min={1} precision={0} placeholder="Define customized frame thresholds (Days)" className="w-full" />
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
                        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                          <SectionHeader icon={FileText} title="Legal Commercial Frame" accent="ochre" index="05" />
                          <Form.Item name="paymentTerms" className="!mb-0">
                            <TextArea rows={4} placeholder="Type legally binding business execution templates context structural parameters elements clauses fields syntax documentation rules..." />
                          </Form.Item>
                        </motion.div>
                        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
                          <SectionHeader icon={ClipboardList} title="Instructions Overlay Override" accent="copper" index="06" />
                          <Form.Item name="instructions" className="!mb-0">
                            <TextArea rows={4} placeholder="Type background analytical data processing metrics annotations notes, parsing pipeline routing override directives configurations structures..." />
                          </Form.Item>
                        </motion.div>
                      </div>
                    </div>

                    {/* Drawer Footer controls pinned to the bottom of the right slide out drawer element wrapper */}
                    <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--background)] px-6 py-4 flex items-center justify-between z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
                      <p className="flex items-center gap-1.5 cm-mono text-[10px] text-[var(--ink-500)] max-w-[200px] sm:max-w-xs truncate">
                        <Circle size={6} className={dirty ? "fill-[var(--copper-600)] text-[var(--copper-600)] animate-pulse" : "fill-[var(--moss-600)] text-[var(--moss-600)]"} />
                        {dirty ? "Detected unsaved edits in active session fields." : "State configurations synchronized with baseline reference targets structures caching indices."}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button size="middle" onClick={handleBackNavigation} disabled={saving}>Cancel</Button>
  {viewMode !== "VIEW" && (
    <>
      <Button size="middle" icon={<RotateCcw size={13} />} onClick={() => form.resetFields()} disabled={saving}>Reset</Button>
      {/* <Button size="middle" loading={saving} disabled={saving} onClick={handleDraftPreservation} className="hidden sm:inline-flex">Stash Draft</Button> */}
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

        {/* Side Independent Preview Modal */}
        <Modal open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={null} closable={false} centered width={380} styles={{ content: { padding: 0, background: "transparent", boxShadow: "none" }, mask: { background: "rgba(23,19,16,0.55)", backdropFilter: "blur(4px)" } }}>
          <div className="relative">
            <button type="button" onClick={() => setPreviewOpen(false)} className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"><X size={14} /></button>
            <UserPreviewCard values={formValues} />
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
            <strong>{pendingStatusChange?.record?.userName}</strong>?
            {pendingStatusChange?.target === "form" ? " This will be saved immediately." : ""}
          </p>
        </Modal>

        {/* Discard-unsaved-changes confirmation — replaces window.confirm() */}
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