import React, { useEffect, useMemo, useState } from "react";

import { Select, Modal } from "antd";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import {
  RefreshCcw,
  Download,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Tag,
  FileText,
  Save,
  ChevronDown,
  LayoutTemplate,
  Search,
  Eye,
  Loader,
  Pencil,
  Power,
} from "lucide-react";
import { getBarcodeLayoutMasterData, getAllBarcodeConfigurations, createMultiConfiguration, modifyConfiguration } from "../../../../Redux/Slices/Master/PI_Master/CustomerLabellingSlice";

const LABELARY_TIMEOUT_MS = 10000;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Neutralise spreadsheet formula injection: a cell starting with = + - @ (or a
// tab / CR) would be executed by Excel, so it is prefixed with an apostrophe.
const csvCell = (value) => {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const STATUS_OPTIONS = ["Active", "Inactive"];

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const selectCls =
  "w-full [&_.ant-select-selector]:!h-[30px] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-placeholder]:!text-[11px]";

const Field = ({ label, icon: Icon, accent, children }) => (
  <div className="space-y-1">
    <label
      className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-tight ${
        accent || "text-slate-400 dark:text-slate-500"
      }`}
    >
      {Icon && <Icon className="h-3 w-3" />} {label}
    </label>
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, accent, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay }}
    whileHover={{ y: -2 }}
    className="group relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-2 sm:p-3 shadow-sm transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg"
  >
    <div
      className={`absolute inset-x-0 top-0 h-[2px] sm:h-[3px] ${accent} !bg-current opacity-85 transition-all duration-300 group-hover:h-[4px] group-hover:opacity-100`}
    />
    <div className="flex items-center gap-2 sm:gap-3">
      <div
        className={`flex h-7 w-7 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl ${accent} shadow-sm`}
      >
        <Icon size={14} className="sm:hidden" />
        <Icon size={20} className="hidden sm:block" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[9px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm sm:text-xl font-bold leading-tight text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  </motion.div>
);

const CustomerLabelling = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  // Active barcode / label configurations straight from the API.
  const [configs, setConfigs] = useState([]);
  const [loadError, setLoadError] = useState("");

  // Specification panel state
  const [panelOpen, setPanelOpen] = useState(true);
  // Master data (customers, brands, layout types, layout names) from one API.
  const [masterData, setMasterData] = useState({ brands: [], layoutNames: [], layoutTypes: [], customers: [] });
  const [customer, setCustomer] = useState(undefined); // single select
  const [brands, setBrands] = useState([]); // multi select
  const [labelType, setLabelType] = useState(undefined);
  const [layoutName, setLayoutName] = useState(undefined);

  // Records table filters
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState(undefined);
  const [brandFilter, setBrandFilter] = useState(undefined);
  const [labelTypeFilter, setLabelTypeFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);
  // Edit dialog: customer is read-only, the rest can be changed.
  const [editRow, setEditRow] = useState(null);
  const [editBrand, setEditBrand] = useState(undefined);
  const [editLayout, setEditLayout] = useState(undefined);
  const [editSaving, setEditSaving] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [previewRow, setPreviewRow] = useState(null); // row whose demo label is being shown
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  // Render the row's ZPL as an image via Labelary — same approach as the
  // Barcode Print page's label preview.
  useEffect(() => {
    const zpl = previewRow?.zplTemplate;
    setPreviewUrl(null);
    setPreviewError("");
    if (!zpl) return;

    // Label size from ^PW / ^LL (dots at 8dpmm), else default 4x6 at 6dpmm
    const pw = zpl.match(/\^PW(\d+)/)?.[1];
    const ll = zpl.match(/\^LL(\d+)/)?.[1];
    const path =
      pw && ll ? `8dpmm/labels/${(pw / 203.2).toFixed(2)}x${(ll / 203.2).toFixed(2)}` : "6dpmm/labels/4x6";

    let objectUrl = null;
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LABELARY_TIMEOUT_MS);
    setPreviewLoading(true);

    // POST instead of GET: ZPL with embedded graphics is too long for a URL
    fetch(`https://api.labelary.com/v1/printers/${path}/0/`, {
      method: "POST",
      headers: { Accept: "image/png", "Content-Type": "application/x-www-form-urlencoded" },
      body: zpl,
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Labelary ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch((error) => {
        console.error("Label preview error:", error);
        if (!cancelled) setPreviewError("Could not render the label preview (preview service unavailable).");
      })
      .finally(() => {
        clearTimeout(timer);
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [previewRow]);

  const fetchMasterData = async () => {
    try {
      const response = await dispatch(getBarcodeLayoutMasterData());
      setMasterData({
        brands: response?.brands || [],
        layoutNames: response?.layoutNames || [],
        layoutTypes: response?.layoutTypes || [],
        customers: response?.customers || [],
      });
      return true;
    } catch (error) {
      console.error("Failed to fetch layout master data:", error);
      setLoadError("Could not load dropdown data. Please refresh.");
      return false;
    }
  };

  useEffect(() => {
    fetchMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await dispatch(getAllBarcodeConfigurations());
      setConfigs(Array.isArray(response) ? response : []);
      return true;
    } catch (error) {
      console.error("Failed to fetch label configurations:", error);
      setConfigs([]);
      setLoadError("Could not load label mappings. Please refresh.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rows normalised to one shape (API sends `Labeltype`).
  const mappings = useMemo(
    () =>
      configs.map((c, i) => ({
        id: c.id ?? i,
        customerId: c.customerId,
        customerName: c.customerName || "",
        brand: c.brand || "",
        labelType: c.LayoutType ?? c.layoutType ?? c.layouttype ?? "",
        layoutName: c.layoutName || "",
        layoutId: c.layoutID ?? c.layoutId ?? null,
        zplTemplate: c.zplTemplate || "",
        status: c.isActive === false ? "Inactive" : "Active",
        createdBy: c.createdBy || "",
        createdDate: c.createdDate || c.createdOn || null,
        modifiedBy: c.modifiedBy || c.updatedBy || "",
        modifiedDate: c.modifiedDate || c.updatedDate || c.modifiedOn || null,
        lastUpdated: c.modifiedDate || c.updatedDate || c.createdDate || null,
      })),
    [configs],
  );

  const uniqueSorted = (key) =>
    [...new Set(mappings.map((m) => m[key]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
  // Master lists may be plain strings or { id, <name> } objects. `value` is the
  // id when one exists (kept for the POST payload, never shown), `label` is the
  // visible name.
  const toOptions = (list, nameKeys) =>
    (list || []).map((item) => {
      if (item && typeof item === "object") {
        const label = String(nameKeys.map((k) => item[k]).find((v) => v != null) ?? "");
        return { value: item.id ?? label, label };
      }
      return { value: item, label: String(item) };
    });
  const brandSelectOptions = useMemo(() => toOptions(masterData.brands, ["brand", "brandName", "name"]), [masterData.brands]);
  const labelTypeSelectOptions = useMemo(
    () => toOptions(masterData.layoutTypes, ["layoutType", "labelType", "name"]),
    [masterData.layoutTypes],
  );
  const layoutSelectOptions = useMemo(
    () => toOptions(masterData.layoutNames, ["layoutName", "name"]),
    [masterData.layoutNames],
  );
  const layoutLabelOf = (id) => layoutSelectOptions.find((o) => o.value === id)?.label ?? id;

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mappings.filter((m) => {
      if (q && !Object.values(m).join(" ").toLowerCase().includes(q)) return false;
      if (customerFilter && m.customerName !== customerFilter) return false;
      if (brandFilter && m.brand !== brandFilter) return false;
      if (labelTypeFilter && m.labelType !== labelTypeFilter) return false;
      if (statusFilter && m.status !== statusFilter) return false;
      return true;
    });
  }, [mappings, search, customerFilter, brandFilter, labelTypeFilter, statusFilter]);

  // Pagination — back to page 1 whenever the result set changes.
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pagedData = useMemo(
    () => filteredData.slice(pageStart, pageStart + pageSize),
    [filteredData, pageStart, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [search, customerFilter, brandFilter, labelTypeFilter, statusFilter, pageSize, configs]);

  const hint = !customer
    ? { tone: "idle", text: "Select a customer to begin" }
    : !brands.length
      ? { tone: "warn", text: "Select one or more brands" }
      : !labelType
        ? { tone: "warn", text: "Select the label type" }
        : !layoutName
          ? { tone: "warn", text: "Select the layout name" }
          : { tone: "ok", text: `Ready — ${brands.length} brand${brands.length === 1 ? "" : "s"} → ${labelType} / ${layoutLabelOf(layoutName)}` };
  const hintTone = {
    ok: "text-emerald-600 dark:text-emerald-400",
    warn: "text-amber-600 dark:text-amber-400",
    idle: "text-slate-400 dark:text-slate-500",
  }[hint.tone];

  const resetPanel = () => {
    setCustomer(undefined);
    setBrands([]);
    setLabelType(undefined);
    setLayoutName(undefined);
    setSearch("");
    setCustomerFilter(undefined);
    setBrandFilter(undefined);
    setLabelTypeFilter(undefined);
    setStatusFilter(undefined);
  };

  const [saving, setSaving] = useState(false);

  // POST /CustomerBarcode/CreateMultiConfiguration — one customer + layout,
  // many brands. Ids go in the payload; names (layoutType / brand) are text.
  const handleSave = async () => {
    if (saving) return;
    if (!customer) return toast.error("Select a customer.");
    if (!brands.length) return toast.error("Select at least one brand.");
    if (!labelType) return toast.error("Select the label type.");
    if (!layoutName) return toast.error("Select the layout name.");

    const labelOf = (opts, value) => opts.find((o) => o.value === value)?.label ?? String(value);
    const norm = (v) => String(v ?? "").trim().toLowerCase();
    const layoutLabel = String(layoutLabelOf(layoutName));
    const layoutTypeLabel = labelOf(labelTypeSelectOptions, labelType);

    // Skip brands already mapped for this customer + label type + layout.
    const alreadyMapped = new Set(
      mappings
        .filter(
          (m) =>
            Number(m.customerId) === Number(customer) &&
            norm(m.labelType) === norm(layoutTypeLabel) &&
            norm(m.layoutName) === norm(layoutLabel),
        )
        .map((m) => norm(m.brand)),
    );
    const selectedBrands = brands.map((b) => labelOf(brandSelectOptions, b));
    const newBrands = selectedBrands.filter((b) => !alreadyMapped.has(norm(b)));
    const duplicateBrands = selectedBrands.filter((b) => alreadyMapped.has(norm(b)));

    if (!newBrands.length) {
      return toast.error(`Already mapped: ${duplicateBrands.join(", ")}.`);
    }
    if (duplicateBrands.length) {
      toast(`Skipped already-mapped brand${duplicateBrands.length === 1 ? "" : "s"}: ${duplicateBrands.join(", ")}.`);
    }

    const payload = {
      customerId: Number(customer),
      layoutID: Number(layoutName),
      layoutType: layoutTypeLabel,
      brand: newBrands,
    };

    setSaving(true);
    try {
      const result = await dispatch(createMultiConfiguration(payload));
      toast.success(
        result?.message ||
          `Mapped ${payload.brand.length} brand${payload.brand.length === 1 ? "" : "s"} successfully.`,
      );
      resetPanel();
      await fetchConfigs();
    } catch (error) {
      console.error("Failed to save label mapping:", error);
      toast.error(error?.response?.data?.message || "Failed to save the mapping. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    // The row carries names; the dropdowns work with the master list values.
    const layoutOpt =
      layoutSelectOptions.find((o) => o.value === row.layoutId) ||
      layoutSelectOptions.find((o) => String(o.label).toLowerCase() === String(row.layoutName).toLowerCase());
    const brandOpt = brandSelectOptions.find(
      (o) => String(o.label).toLowerCase() === String(row.brand).toLowerCase(),
    );
    setEditBrand(brandOpt?.value);
    setEditLayout(layoutOpt?.value);
    setEditRow(row);
  };

  const closeEdit = () => setEditRow(null);

  const handleEditSave = async () => {
    if (editSaving || !editRow) return;
    if (!editBrand) return toast.error("Select a brand.");
    if (!editLayout) return toast.error("Select the layout name.");

    const labelOf = (opts, value) => opts.find((o) => o.value === value)?.label ?? String(value);
    const norm = (v) => String(v ?? "").trim().toLowerCase();
    const brandLabel = labelOf(brandSelectOptions, editBrand);
    const layoutLabel = String(labelOf(layoutSelectOptions, editLayout));

    // Another row of the same customer already has this exact combination.
    const clash = mappings.some(
      (m) =>
        m.id !== editRow.id &&
        Number(m.customerId) === Number(editRow.customerId) &&
        norm(m.brand) === norm(brandLabel) &&
        norm(m.layoutName) === norm(layoutLabel),
    );
    if (clash) return toast.error("This customer already has this brand and layout.");

    setEditSaving(true);
    try {
      const result = await dispatch(
        modifyConfiguration({
          id: editRow.id,
          // customer cannot be changed - sent empty
          customerId: null,
          custCode: "",
          // keep the current status while editing
          isActive: editRow.status === "Active",
          layout_ID: Number(editLayout),
          brand: brandLabel,
        }),
      );
      toast.success(result?.message || "Mapping updated.");
      closeEdit();
      await fetchConfigs();
    } catch (error) {
      console.error("Failed to update mapping:", error);
      toast.error(error?.response?.data?.message || "Failed to update the mapping. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  const [statusRow, setStatusRow] = useState(null);
  const handleToggleStatus = (row) => setStatusRow(row);

  const confirmToggleStatus = async () => {
    const row = statusRow;
    if (!row || statusBusyId === row.id) return;
    const makeActive = row.status !== "Active";
    setStatusBusyId(row.id);
    try {
      const result = await dispatch(
        // status only: every other field sent empty so it stays as it is
        modifyConfiguration({ id: row.id, customerId: null, custCode: "", isActive: makeActive, layout_ID: null, brand: null }),
      );
      toast.success(result?.message || (makeActive ? "Mapping activated." : "Mapping inactivated."));
      setStatusRow(null);
      await fetchConfigs();
    } catch (error) {
      console.error("Failed to change status:", error);
      toast.error(error?.response?.data?.message || "Failed to change the status. Please try again.");
    } finally {
      setStatusBusyId(null);
    }
  };

  const stats = useMemo(() => {
    const total = mappings.length;
    const active = mappings.filter((m) => m.status === "Active").length;
    const inactive = mappings.filter((m) => m.status === "Inactive").length;
    const recentlyUpdated = mappings.filter(
      (m) => Date.now() - new Date(m.lastUpdated).getTime() < 7 * 86400000,
    ).length;
    return { total, active, inactive, recentlyUpdated };
  }, [mappings]);

  // Reloads both the dropdown master data and the records table.
  const refresh = async () => {
    setLoadError("");
    setLoading(true);
    const results = await Promise.all([fetchMasterData(), fetchConfigs()]);
    setLoading(false);
    if (results.every(Boolean)) toast.success("Data refreshed.");
    else toast.error("Refresh failed. Please try again.");
  };

  // Exports the rows currently shown in the table (after search / filters) as CSV.
  const handleExport = () => {
    if (!filteredData.length) {
      toast("No records to export.");
      return;
    }
    const columns = [
      ["customerName", "Customer"],
      ["brand", "Brand"],
      ["labelType", "Label Type"],
      ["layoutName", "Layout Name"],
      ["status", "Status"],
      ["createdBy", "Created By"],
      ["createdDate", "Created On"],
      ["modifiedBy", "Last Updated By"],
      ["modifiedDate", "Last Updated On"],
    ];
    const csv = [
      columns.map(([, h]) => csvCell(h)).join(","),
      ...filteredData.map((m) =>
        columns.map(([k]) => csvCell(m[k])).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer-label-mappings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return <div className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden bg-slate-100/60 dark:bg-slate-900 p-1.5 font-sans sm:p-2">

<motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-2 sm:mb-2.5 shrink-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
      >
        <div className="min-w-0">
          <h1 className="truncate text-[13px] sm:text-[17px] font-semibold text-slate-900 dark:text-slate-100">
            Customer Label Mapping
          </h1>
          <p className="truncate text-[10px] sm:text-[12px] text-slate-500 dark:text-slate-400">
            Map each customer and brand to the correct tyre label type, Home Label or Private Label, so the right label prints automatically.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh data"
            disabled={loading}
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium text-[var(--primary)] dark:text-slate-200 transition-transform hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
          >
            <RefreshCcw size={13} aria-hidden="true" className={loading ? "animate-spin" : ""} /> <span className="hidden sm:inline">Refresh</span>
          </button>
          {/* <button
            onClick={() => window.open("https://claude.ai/code/artifact/8a11f52c-cc33-4a8c-9117-adbdbd94ccaa", "_blank", "noopener,noreferrer")}
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium text-[var(--primary)] dark:text-slate-200 transition-transform hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
          >
            <BookOpen size={13} /> <span className="hidden sm:inline">Documentation</span>
          </button> */}
          {/* <button
            onClick={() => setImportOpen(true)}
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium text-[var(--primary)] dark:text-slate-200 transition-transform hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
          >
            <UploadIcon size={13} /> <span className="hidden sm:inline">Import Excel</span>
          </button> */}
          <button
            type="button"
            onClick={handleExport}
            aria-label="Export records to CSV"
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium text-[var(--primary)] dark:text-slate-200 transition-transform hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
          >
            <Download size={13} aria-hidden="true" /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </motion.div>

      {loadError && (
        <div
          role="alert"
          className="mb-2 shrink-0 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-[12px] text-rose-700 dark:text-rose-300"
        >
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="mb-2 sm:mb-2.5 shrink-0 grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
        <StatCard label="Total Mappings" value={stats.total} icon={Layers} accent="bg-blue-50 text-blue-600" delay={0} />
        <StatCard label="Active" value={stats.active} icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" delay={0.05} />
        <StatCard label="Inactive" value={stats.inactive} icon={XCircle} accent="bg-slate-100 text-slate-500" delay={0.1} />
        <StatCard label="Recently Updated" value={stats.recentlyUpdated} icon={Clock} accent="bg-amber-50 text-amber-600" delay={0.15} />
      </div>

      {/* Specification panel — same look as Customer Process ID Mapping */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-2 sm:mb-2.5 shrink-0 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
      >
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          aria-expanded={panelOpen}
          aria-controls="label-spec-panel"
          className="flex w-full items-center justify-between px-3 py-2 sm:cursor-default"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Specification &amp; Mapping
          </span>
          <span className="flex items-center gap-2">
            <span role="status" aria-live="polite" className={`text-[11px] font-medium ${hintTone}`}>{hint.text}</span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform sm:hidden ${panelOpen ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        <div id="label-spec-panel" className={`${panelOpen ? "block" : "hidden"} sm:block border-t border-slate-100 dark:border-slate-700 p-3`}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-4">
            {/* Customer — single select */}
            <Field label="Customer" icon={Building2} accent="text-blue-600 dark:text-blue-400">
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                value={customer}
                onChange={(value) => {
                  setCustomer(value);
                  setBrands([]);
                }}
                placeholder="Select Customer"
                aria-label="Customer"
                options={masterData.customers.map((c) => ({
                  value: c.id,
                  label: c.id ? `${c.custFullName} - ${c.id}` : c.custFullName,
                }))}
                className={selectCls}
              />
            </Field>

            {/* Brand — multi select */}
            <Field label="Brand" icon={Tag} accent="text-blue-600 dark:text-blue-400">
              <Select
                showSearch
                allowClear
                mode="multiple"
                maxTagCount="responsive"
                optionFilterProp="label"
                value={brands}
                onChange={setBrands}
                disabled={!customer}
                placeholder="Select Brand"
                aria-label="Brand"
                options={brandSelectOptions}
                className={selectCls}
              />
            </Field>

            {/* Label Type */}
            <Field label="Label Type" icon={FileText} accent="text-blue-600 dark:text-blue-400">
              <Select
                allowClear
                value={labelType}
                onChange={setLabelType}
                placeholder="Select Label Type"
                aria-label="Label type"
                options={labelTypeSelectOptions}
                className={selectCls}
              />
            </Field>

            {/* Layout Name */}
            <Field label="Layout Name" icon={LayoutTemplate} accent="text-blue-600 dark:text-blue-400">
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                value={layoutName}
                onChange={setLayoutName}
                placeholder="Select Layout Name"
                aria-label="Layout name"
                options={layoutSelectOptions}
                className={selectCls}
              />
            </Field>
          </div>

          {/* Action bar */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSave}
              disabled={saving || !customer || !brands.length || !labelType || !layoutName}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save size={14} /> {saving ? "Saving…" : "Save Mapping"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={resetPanel}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <RefreshCcw size={14} /> Reset
            </motion.button>
            <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500">
              {filteredData.length} of {mappings.length} records
            </span>
          </div>
        </div>
      </motion.div>

      {/* Records */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-1 min-h-[380px] sm:min-h-[480px] flex-col overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
      >
        <div className="shrink-0 flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-700 p-2.5">
          <div className="relative min-w-[200px] flex-1">
            <Search size={14} aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              aria-label="Search label mappings"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across all columns…"
              className="h-8 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-8 pr-3 text-[13px] text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            />
          </div>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Customer"
            aria-label="Filter by customer"
            value={customerFilter}
            onChange={setCustomerFilter}
            options={uniqueSorted("customerName").map((n) => ({ value: n, label: n }))}
            className="w-[180px] [&_.ant-select-selector]:!h-8"
          />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Brand"
            aria-label="Filter by brand"
            value={brandFilter}
            onChange={setBrandFilter}
            options={uniqueSorted("brand").map((n) => ({ value: n, label: n }))}
            className="w-[150px] [&_.ant-select-selector]:!h-8"
          />
          <Select
            allowClear
            placeholder="Label Type"
            aria-label="Filter by label type"
            value={labelTypeFilter}
            onChange={setLabelTypeFilter}
            options={uniqueSorted("labelType").map((n) => ({ value: n, label: n }))}
            className="w-[150px] [&_.ant-select-selector]:!h-8"
          />
          <Select
            allowClear
            placeholder="Status"
            aria-label="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS.map((n) => ({ value: n, label: n }))}
            className="w-[130px] [&_.ant-select-selector]:!h-8"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse text-left text-[12px]" aria-label="Customer label mappings" aria-busy={loading}>
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/60">
              <tr className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {["#", "Customer", "Brand", "Label Type", "Layout Name", "Status", "Created", "Last Updated", "Demo", "Actions"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedData.map((m, i) => (
                <tr key={m.id} className="border-t border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                  <td className="px-3 py-2 text-slate-400">{pageStart + i + 1}</td>
                  <td className="px-3 py-2 font-medium">{m.customerName}</td>
                  <td className="px-3 py-2">{m.brand}</td>
                  <td className="px-3 py-2">{m.labelType}</td>
                  <td className="px-3 py-2 font-mono">{m.layoutName}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        m.status === "Active"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[11px] leading-tight">
                    <div className="font-medium">{m.createdBy || "-"}</div>
                    <div className="text-slate-400 dark:text-slate-500">{formatDateTime(m.createdDate)}</div>
                  </td>
                  <td className="px-3 py-2 text-[11px] leading-tight">
                    <div className="font-medium">{m.modifiedBy || "-"}</div>
                    <div className="text-slate-400 dark:text-slate-500">{formatDateTime(m.modifiedDate)}</div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setPreviewRow(m)}
                      aria-label={`View demo label for ${m.customerName} ${m.brand} ${m.layoutName}`}
                      className="flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-600 px-2 py-1 text-[11px] font-medium text-[var(--primary)] dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Eye size={12} aria-hidden="true" /> Demo
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(m)}
                        aria-label={`Edit mapping for ${m.customerName} ${m.brand}`}
                        className="flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-600 px-2 py-1 text-[11px] font-medium text-[var(--primary)] dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <Pencil size={12} aria-hidden="true" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(m)}
                        disabled={statusBusyId === m.id}
                        aria-label={`${m.status === "Active" ? "Inactivate" : "Activate"} mapping for ${m.customerName} ${m.brand}`}
                        className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          m.status === "Active"
                            ? "border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            : "border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        }`}
                      >
                        <Power size={12} aria-hidden="true" /> {m.status === "Active" ? "Inactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredData.length && (
                <tr>
                  <td colSpan={10} className="px-3 py-10 text-center text-[12px] text-slate-400 dark:text-slate-500">
                    {loading ? "Loading..." : "No label mappings found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <nav
          aria-label="Records pagination"
          className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400"
        >
          <span aria-live="polite">
            {filteredData.length
              ? `${pageStart + 1}-${Math.min(pageStart + pageSize, filteredData.length)} of ${filteredData.length}`
              : "0 records"}
          </span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1">
              Rows
              <Select
                size="small"
                value={pageSize}
                onChange={setPageSize}
                options={PAGE_SIZE_OPTIONS.map((n) => ({ value: n, label: n }))}
                aria-label="Rows per page"
                className="w-[70px]"
              />
            </label>
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="rounded-md border border-slate-200 dark:border-slate-600 px-2 py-1 font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="rounded-md border border-slate-200 dark:border-slate-600 px-2 py-1 font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </nav>
      </motion.div>

      {/* Edit mapping — customer is read-only */}
      <Modal
        open={!!editRow}
        onCancel={closeEdit}
        onOk={handleEditSave}
        okText={editSaving ? "Saving…" : "Save changes"}
        okButtonProps={{ loading: editSaving }}
        cancelButtonProps={{ disabled: editSaving }}
        title="Edit Label Mapping"
        width={460}
        destroyOnClose
      >
        <div className="space-y-3 pt-1">
          <Field label="Customer (cannot be changed)" icon={Building2}>
            <input
              value={editRow?.customerName || ""}
              disabled
              aria-label="Customer"
              className="w-full cursor-not-allowed rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 px-2 py-1.5 text-[12px] text-slate-500 dark:text-slate-400"
            />
          </Field>
          <Field label="Brand" icon={Tag}>
            <Select
              showSearch
              optionFilterProp="label"
              value={editBrand}
              onChange={setEditBrand}
              options={brandSelectOptions}
              placeholder="Select Brand"
              aria-label="Brand"
              className="w-full"
            />
          </Field>
          <Field label="Layout Name" icon={LayoutTemplate}>
            <Select
              showSearch
              optionFilterProp="label"
              value={editLayout}
              onChange={setEditLayout}
              options={layoutSelectOptions}
              placeholder="Select Layout Name"
              aria-label="Layout name"
              className="w-full"
            />
          </Field>
        </div>
      </Modal>

      {/* Activate / inactivate confirmation */}
      <Modal
        open={!!statusRow}
        onCancel={() => setStatusRow(null)}
        onOk={confirmToggleStatus}
        okText={statusRow?.status !== "Active" ? "Activate" : "Inactivate"}
        okButtonProps={{ danger: statusRow?.status === "Active", loading: statusBusyId === statusRow?.id }}
        title={statusRow?.status !== "Active" ? "Activate this mapping?" : "Inactivate this mapping?"}
        width={460}
      >
        {statusRow && `${statusRow.customerName} / ${statusRow.brand} / ${statusRow.labelType} / ${statusRow.layoutName}`}
      </Modal>

      {/* Demo label preview */}
      <Modal
        open={!!previewRow}
        onCancel={() => setPreviewRow(null)}
        footer={null}
        width={460}
        title={
          previewRow
            ? `Demo Label - ${previewRow.layoutName || "Layout"} (${previewRow.customerName} / ${previewRow.brand})`
            : ""
        }
      >
        <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-2">
          {!previewRow?.zplTemplate ? (
            <p className="text-xs text-slate-400">No ZPL template is configured for this layout.</p>
          ) : previewLoading ? (
            <Loader aria-label="Loading preview" role="status" className="animate-spin text-blue-500" />
          ) : previewUrl ? (
            <img src={previewUrl} alt={`Demo label for ${previewRow?.layoutName || "layout"}`} className="max-h-[70vh] w-full object-contain" />
          ) : (
            <p className="text-xs text-rose-500">{previewError || "No preview"}</p>
          )}
        </div>
      </Modal>
  </div>;
};

export default CustomerLabelling;
