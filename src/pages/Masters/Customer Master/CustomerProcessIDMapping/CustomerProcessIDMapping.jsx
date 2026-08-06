import React, { useMemo, useState } from "react";
import { Select, Input, DatePicker, Dropdown, Checkbox, Drawer } from "antd";
import { motion } from "framer-motion";
import {
  Plus,
  Download,
  Upload as UploadIcon,
  RefreshCcw,
  Search,
  X,
  SlidersHorizontal,
  Filter,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { SettingOutlined } from "@ant-design/icons";
import MappingTable, { BASE_COLUMNS } from "./components/MappingTable";
import MappingDrawer from "./components/MappingDrawer";
import ViewDrawer from "./components/ViewDrawer";
import HistoryDrawer from "./components/HistoryDrawer";
import ImportDialog from "./components/ImportDialog";
import { CUSTOMERS, INITIAL_MAPPINGS, PROCESS_MASTER, enrichMapping } from "./data/mockData";

const { RangePicker } = DatePicker;

// ============================================================================
// Statistics cards
// ============================================================================
const StatCard = ({ label, value, icon: Icon, accent, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay }}
    whileHover={{ y: -2 }}
    className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-2 sm:p-3 shadow-sm transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg"
  >
    {/* Modern Top Accent Border: Uses !bg-current to grab the vibrant text color from your accent prop */}
    <div className={`absolute inset-x-0 top-0 h-[2px] sm:h-[3px] ${accent} !bg-current opacity-85 transition-all duration-300 group-hover:h-[4px] group-hover:opacity-100`} />

    <div className="flex items-center gap-2 sm:gap-3">
      {/* Removed the hardcoded 'text-white' from your original so your text-blue-600 actually colors the icon properly */}
      <div
        className={`flex h-7 w-7 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl ${accent} shadow-sm`}
      >
        <Icon size={14} className="sm:hidden" />
        <Icon size={20} className="hidden sm:block" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[9px] sm:text-xs font-semibold sm:font-medium uppercase tracking-wide sm:tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 sm:mt-1 text-sm sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {value}
        </p>
      </div>
    </div>
  </motion.div>
);

const EMPTY_FILTERS = {
  search: "",
  customer: undefined,
  platform: undefined,
  tyreSize: undefined,
  brand: undefined,
  status: undefined,
  dateRange: null,
};

const CustomerProcessIDMapping = () => {
  const [rawMappings, setRawMappings] = useState(INITIAL_MAPPINGS);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [mappingDrawer, setMappingDrawer] = useState({ open: false, mode: "create", record: null });
  const [viewDrawer, setViewDrawer] = useState({ open: false, record: null });
  const [historyDrawer, setHistoryDrawer] = useState({ open: false, record: null });
  const [importOpen, setImportOpen] = useState(false);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() =>
    Object.fromEntries(BASE_COLUMNS.map((c) => [c.key, true])),
  );

  const mappings = useMemo(() => rawMappings.map(enrichMapping), [rawMappings]);

  // Filter option lists derived from the Process Master, so they always
  // reflect real specs rather than a hardcoded list going stale.
  const platformOptions = useMemo(() => [...new Set(PROCESS_MASTER.map((p) => p.platform))], []);
  const tyreSizeOptions = useMemo(() => [...new Set(PROCESS_MASTER.map((p) => p.tyreSize))], []);
  const brandOptions = useMemo(() => [...new Set(PROCESS_MASTER.map((p) => p.brand))], []);

  const filteredData = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return mappings.filter((m) => {
      if (q) {
        const haystack = Object.values(m).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.customer && m.customer !== filters.customer) return false;
      if (filters.platform && m.platform !== filters.platform) return false;
      if (filters.tyreSize && m.tyreSize !== filters.tyreSize) return false;
      if (filters.brand && m.brand !== filters.brand) return false;
      if (filters.status && m.status !== filters.status) return false;
      if (filters.dateRange) {
        const [start, end] = filters.dateRange;
        const updated = new Date(m.lastUpdated).getTime();
        if (updated < start.startOf("day").valueOf() || updated > end.endOf("day").valueOf()) return false;
      }
      return true;
    });
  }, [mappings, filters]);

  const stats = useMemo(() => {
    const total = mappings.length;
    const active = mappings.filter((m) => m.status === "Active").length;
    const inactive = mappings.filter((m) => m.status === "Inactive").length;
    const recentlyUpdated = mappings.filter(
      (m) => Date.now() - new Date(m.lastUpdated).getTime() < 7 * 86400000,
    ).length;
    return { total, active, inactive, recentlyUpdated };
  }, [mappings]);

  const clearFilters = () => setFilters(EMPTY_FILTERS);
  const hasActiveFilters =
    filters.customer || filters.platform || filters.tyreSize || filters.brand || filters.status || filters.dateRange;
  // Count of active filters (search included) — drives the mobile Filter button's badge.
  const filterCount = [
    filters.search.trim(),
    filters.customer,
    filters.platform,
    filters.tyreSize,
    filters.brand,
    filters.status,
    filters.dateRange,
  ].filter(Boolean).length;

  const applyMobileFilters = () => setMobileFilterOpen(false);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500); // stand-in for a real refetch
  };

  // --- Drawer orchestration -------------------------------------------------
  const openCreate = () => setMappingDrawer({ open: true, mode: "create", record: null });
  const openEdit = (record) => {
    setViewDrawer({ open: false, record: null });
    setMappingDrawer({ open: true, mode: "edit", record });
  };
  const openClone = (record) => setMappingDrawer({ open: true, mode: "clone", record });
  const openView = (record) => setViewDrawer({ open: true, record });
  const openHistory = (record) => setHistoryDrawer({ open: true, record });
  const closeMappingDrawer = () => setMappingDrawer((d) => ({ ...d, open: false }));

  const handleOpenExisting = (existing) => {
    closeMappingDrawer();
    setTimeout(() => openEdit(enrichMapping(existing)), 150);
  };

  const handleToggleStatus = (record) => {
    setRawMappings((prev) =>
      prev.map((m) =>
        m.id === record.id
          ? {
              ...m,
              status: m.status === "Active" ? "Inactive" : "Active",
              lastUpdated: new Date().toISOString(),
              history: [
                ...m.history,
                {
                  date: new Date().toISOString(),
                  by: "Current User",
                  action: m.status === "Active" ? "Deactivated mapping" : "Activated mapping",
                  status: m.status === "Active" ? "Inactive" : "Active",
                },
              ],
            }
          : m,
      ),
    );
  };

  const handleSaveMapping = (form, mode) => {
    if (mode === "edit") {
      setRawMappings((prev) =>
        prev.map((m) =>
          m.id === form.id
            ? {
                ...m,
                ...form,
                revision: m.revision + 1,
                updatedBy: "Current User",
                lastUpdated: new Date().toISOString(),
                history: [
                  ...m.history,
                  { date: new Date().toISOString(), by: "Current User", action: "Updated mapping", status: form.status },
                ],
              }
            : m,
        ),
      );
    } else {
      const newRecord = {
        id: Math.max(0, ...rawMappings.map((m) => m.id)) + 1,
        customer: form.customer,
        customerProcessId: form.customerProcessId,
        ourProcessId: form.ourProcessId,
        status: form.status,
        remarks: form.remarks,
        revision: 1,
        createdBy: "Current User",
        createdDate: new Date().toISOString(),
        updatedBy: "Current User",
        lastUpdated: new Date().toISOString(),
        history: [{ date: new Date().toISOString(), by: "Current User", action: "Created mapping", status: form.status }],
      };
      setRawMappings((prev) => [newRecord, ...prev]);
    }
    closeMappingDrawer();
  };

  const handleImport = (importedRows) => {
    const startId = Math.max(0, ...rawMappings.map((m) => m.id)) + 1;
    const newRecords = importedRows.map((row, i) => ({
      id: startId + i,
      customer: row.customer,
      customerProcessId: row.customerProcessId,
      ourProcessId: row.ourProcessId,
      status: row.status || "Active",
      remarks: row.remarks || "",
      revision: 1,
      createdBy: "Current User",
      createdDate: new Date().toISOString(),
      updatedBy: "Current User",
      lastUpdated: new Date().toISOString(),
      history: [{ date: new Date().toISOString(), by: "Current User", action: "Imported mapping", status: row.status || "Active" }],
    }));
    setRawMappings((prev) => [...newRecords, ...prev]);
  };

  const handleExport = () => {
    const headers = ["customer", "customerProcessId", "ourProcessId", "platform", "brand", "sideWall", "tyreSize", "rimSize", "tyreType", "status", "lastUpdated"];
    const csv = [
      headers.join(","),
      ...filteredData.map((m) => headers.map((h) => `"${String(m[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer-process-mappings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden bg-slate-100/60 dark:bg-slate-900 p-2 font-sans sm:p-3">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-2 sm:mb-2.5 shrink-0 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <h1 className="text-[13px] sm:text-[17px] font-semibold text-slate-900 dark:text-slate-100 truncate">Customer Process ID Mapping</h1>
          <p className="text-[10px] sm:text-[12px] text-slate-500 dark:text-slate-400 truncate">
            Manage Customer Process IDs and map them with Internal Process IDs.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          <button
            onClick={refresh}
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium text-[var(--primary)] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-transform"
          >
            <RefreshCcw size={13} className="sm:hidden" /><RefreshCcw size={13} className="hidden sm:block" /> <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--border))] dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium text-[var(--primary)] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-transform"
          >
            <UploadIcon size={13} className="sm:hidden" /><UploadIcon size={13} className="hidden sm:block" /> <span className="hidden sm:inline">Import Excel</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium text-[var(--primary)] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-transform"
          >
            <Download size={13} className="sm:hidden" /><Download size={13} className="hidden sm:block" /> <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg bg-[var(--primary)] px-1.5 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-transform"
          >
            <Plus size={14} /> <span className="hidden sm:inline">New Mapping</span>
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mb-2 sm:mb-2.5 shrink-0 grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
        <StatCard label="Total Mappings" value={stats.total} icon={Layers} accent="bg-blue-50 text-blue-600" delay={0} />
        <StatCard label="Active" value={stats.active} icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" delay={0.05} />
        <StatCard label="Inactive" value={stats.inactive} icon={XCircle} accent="bg-slate-100 text-slate-500" delay={0.1} />
        <StatCard label="Recently Updated" value={stats.recentlyUpdated} icon={Clock} accent="bg-amber-50 text-amber-600" delay={0.15} />
      </div>

      {/* Content card — flex-1 fills whatever height is left over in the
          surrounding layout, with min-h-[560px] as a floor so the table
          always shows a useful number of rows even when that leftover space
          is small. The page root uses overflow-y-auto (not hidden) so that
          if the floor pushes this card taller than the viewport, the page
          scrolls instead of clipping the table's pagination bar. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-1 min-h-[380px] sm:min-h-[560px] flex-col overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
      >
        {/* Search + filters */}
        <div className="shrink-0 border-b border-slate-100 dark:border-slate-700">
          {/* Desktop / tablet filter bar (sm and up) — unchanged */}
          <div className="hidden sm:block p-2.5">
            <div className="flex flex-row flex-wrap items-center gap-2.5">
              <div className="relative min-w-[220px] flex-1">
                <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  placeholder="Search across all columns…"
                  className="h-8 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-8 pr-3 text-[13px] outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Select
                  allowClear
                  placeholder="Customer"
                  value={filters.customer}
                  onChange={(v) => setFilters((f) => ({ ...f, customer: v }))}
                  options={CUSTOMERS.map((c) => ({ value: c, label: c }))}
                  className="w-[160px]"
                />
                <Select
                  allowClear
                  placeholder="Status"
                  value={filters.status}
                  onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                  options={["Active", "Inactive", "Pending"].map((s) => ({ value: s, label: s }))}
                  className="w-[130px]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setAdvancedOpen((o) => !o)}
                  className={`flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-[12px] font-medium transition-colors
                    ${advancedOpen ? "border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                >
                  <SlidersHorizontal size={13} /> Advanced
                </button>

                <Dropdown
                  open={colMenuOpen}
                  onOpenChange={setColMenuOpen}
                  trigger={["click"]}
                  placement="bottomRight"
                  getPopupContainer={() => document.body}
                  dropdownRender={() => (
                    <div className="w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-lg">
                      <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Show columns
                      </p>
                      <div className="max-h-64 overflow-y-auto pr-1">
                        {BASE_COLUMNS.map((c) => (
                          <label
                            key={c.key}
                            className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <Checkbox
                              checked={visibleColumns[c.key]}
                              onChange={(e) =>
                                setVisibleColumns((prev) => ({ ...prev, [c.key]: e.target.checked }))
                              }
                            />
                            {c.title}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                >
                  <button className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <SettingOutlined /> Columns
                  </button>
                </Dropdown>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 whitespace-nowrap"
                  >
                    <X size={12} /> Clear Filters
                  </button>
                )}
              </div>
            </div>

            {advancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.2 }}
                className="mt-2.5 flex flex-wrap items-center gap-2.5 overflow-hidden"
              >
                <Select
                  allowClear
                  placeholder="Platform"
                  value={filters.platform}
                  onChange={(v) => setFilters((f) => ({ ...f, platform: v }))}
                  options={platformOptions.map((p) => ({ value: p, label: p }))}
                  className="w-[140px]"
                />
                <Select
                  allowClear
                  placeholder="Tyre Size"
                  value={filters.tyreSize}
                  onChange={(v) => setFilters((f) => ({ ...f, tyreSize: v }))}
                  options={tyreSizeOptions.map((s) => ({ value: s, label: s }))}
                  className="w-[160px]"
                />
                <Select
                  allowClear
                  placeholder="Brand"
                  value={filters.brand}
                  onChange={(v) => setFilters((f) => ({ ...f, brand: v }))}
                  options={brandOptions.map((b) => ({ value: b, label: b }))}
                  className="w-[150px]"
                />
                <RangePicker
                  value={filters.dateRange}
                  onChange={(v) => setFilters((f) => ({ ...f, dateRange: v }))}
                  placeholder={["Updated from", "Updated to"]}
                />
              </motion.div>
            )}
          </div>

          {/* Mobile filter trigger (below sm) — a single compact button replaces
              the whole inline bar, keeping the list area as tall as possible.
              Tapping it opens the bottom sheet with every search/filter control. */}
          <div className="flex sm:hidden items-center gap-2 p-2">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 active:scale-95 transition-transform"
            >
              <Filter size={14} className="text-slate-500 dark:text-slate-400 shrink-0" />
              Filters
              {filterCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                  {filterCount}
                </span>
              )}
              <span className="ml-auto truncate text-[11px] font-normal text-slate-400 dark:text-slate-500">
                {filteredData.length} results
              </span>
            </button>
          </div>
        </div>

        {/* Mobile filter bottom sheet — hosts search, all filters (basic +
            advanced) and column visibility together so the trigger above is
            the single entry point on mobile. Selections apply live to the
            same `filters` state the desktop bar uses; Apply just dismisses
            the sheet once the user is happy with the result count. */}
        <Drawer
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          placement="bottom"
          closable={false}
          height="auto"
          className="sm:!hidden"
          classNames={{ content: "dark:!bg-slate-800" }}
          styles={{
            body: { padding: 0 },
            content: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
            wrapper: { maxHeight: "88vh" },
          }}
        >
          <div className="flex max-h-[88vh] flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3">
              <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Filters</p>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-400">Search</label>
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    placeholder="Search across all columns…"
                    className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-8 pr-3 text-[13px] outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-400">Customer</label>
                  <Select
                    allowClear
                    placeholder="Any"
                    value={filters.customer}
                    onChange={(v) => setFilters((f) => ({ ...f, customer: v }))}
                    options={CUSTOMERS.map((c) => ({ value: c, label: c }))}
                    className="w-full [&_.ant-select-selector]:!h-9"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-400">Status</label>
                  <Select
                    allowClear
                    placeholder="Any"
                    value={filters.status}
                    onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                    options={["Active", "Inactive", "Pending"].map((s) => ({ value: s, label: s }))}
                    className="w-full [&_.ant-select-selector]:!h-9"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-400">Platform</label>
                  <Select
                    allowClear
                    placeholder="Any"
                    value={filters.platform}
                    onChange={(v) => setFilters((f) => ({ ...f, platform: v }))}
                    options={platformOptions.map((p) => ({ value: p, label: p }))}
                    className="w-full [&_.ant-select-selector]:!h-9"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-400">Tyre Size</label>
                  <Select
                    allowClear
                    placeholder="Any"
                    value={filters.tyreSize}
                    onChange={(v) => setFilters((f) => ({ ...f, tyreSize: v }))}
                    options={tyreSizeOptions.map((s) => ({ value: s, label: s }))}
                    className="w-full [&_.ant-select-selector]:!h-9"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-400">Brand</label>
                  <Select
                    allowClear
                    placeholder="Any"
                    value={filters.brand}
                    onChange={(v) => setFilters((f) => ({ ...f, brand: v }))}
                    options={brandOptions.map((b) => ({ value: b, label: b }))}
                    className="w-full [&_.ant-select-selector]:!h-9"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-400">Updated Between</label>
                  <RangePicker
                    value={filters.dateRange}
                    onChange={(v) => setFilters((f) => ({ ...f, dateRange: v }))}
                    placeholder={["From", "To"]}
                    className="w-full !h-9"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Visible Columns</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {BASE_COLUMNS.map((c) => (
                    <label key={c.key} className="flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-300">
                      <Checkbox
                        checked={visibleColumns[c.key]}
                        onChange={(e) =>
                          setVisibleColumns((prev) => ({ ...prev, [c.key]: e.target.checked }))
                        }
                      />
                      {c.title}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 dark:border-slate-700 px-4 py-3">
              <button
                type="button"
                onClick={clearFilters}
                disabled={filterCount === 0}
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 py-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={applyMobileFilters}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </Drawer>

        {/* Table — fills the rest of the card (see min-h-0 on its own root
            in MappingTable.jsx) and handles its own internal scrolling
            instead of overflowing the card */}
        <MappingTable
          data={filteredData}
          loading={loading}
          visible={visibleColumns}
          onView={openView}
          onEdit={openEdit}
          onClone={openClone}
          onHistory={openHistory}
          onToggleStatus={handleToggleStatus}
        />
      </motion.div>

      {/* Drawers */}
      <MappingDrawer
        open={mappingDrawer.open}
        mode={mappingDrawer.mode}
        record={mappingDrawer.record}
        mappings={mappings}
        onClose={closeMappingDrawer}
        onSave={handleSaveMapping}
        onOpenExisting={handleOpenExisting}
      />
      <ViewDrawer
        open={viewDrawer.open}
        record={viewDrawer.record}
        onClose={() => setViewDrawer({ open: false, record: null })}
        onEdit={openEdit}
      />
      <HistoryDrawer
        open={historyDrawer.open}
        record={historyDrawer.record}
        onClose={() => setHistoryDrawer({ open: false, record: null })}
      />
      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        mappings={mappings}
        onImport={handleImport}
      />
    </div>
  );
};

export default CustomerProcessIDMapping;
