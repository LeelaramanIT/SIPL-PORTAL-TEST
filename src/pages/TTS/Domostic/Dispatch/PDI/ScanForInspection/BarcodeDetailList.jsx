import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DynamicDataTable } from "../../../../../../components/DynamicDataTable";
import { Select } from "antd";
import SearchBar from "../../../../../../components/SearchBar";
import { getBarcodeWise } from "../../../../../../Redux/Slices/PDIDispatchMaster/PDIScanForInspectionSlice";
import { IoFilterSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const { Option } = Select;

/* ─── mode config ─────────────────────────────────────────────────────── */
const MODES = [
  { key: "barcode", label: "Barcode Wise" },
  { key: "itemQty", label: "Item Qty Wise" },
  { key: "assignQty", label: "Assign Qty Wise" },
];

/* ─── column sets ─────────────────────────────────────────────────────── */
const barcodeColumns = [
  { header: "PLATFORM", accessor: "platform", width: "0.8fr", align: "center" },
  { header: "TYRE SIZE", accessor: "tyreSize", width: "1.2fr", align: "left" },
  { header: "RIM", accessor: "rim", width: "0.5fr", align: "center" },
  { header: "TYPE", accessor: "type", width: "0.5fr", align: "center" },
  { header: "BRAND", accessor: "brand", width: "1fr", align: "left" },
  { header: "SIDEWALL", accessor: "sidewall", width: "1fr", align: "center" },
  { header: "PROCESSID", accessor: "processId", width: "1fr", align: "center" },
  {
    header: "STENCIL NO",
    accessor: "stencilNo",
    width: "1fr",
    align: "center",
  },
  { header: "GRADE", accessor: "grade", width: "1fr", align: "center" },
  {
    header: "METAL DETECTOR",
    accessor: "metalDetector",
    width: "1fr",
    align: "center",
  },
  { header: "ID GAUGE", accessor: "idGauge", width: "1fr", align: "center" },
  {
    header: "TREAD HARDNESS",
    accessor: "treadHardness",
    width: "1fr",
    align: "center",
  },
  {
    header: "BASE HARDNESS",
    accessor: "baseHardness",
    width: "1fr",
    align: "center",
  },
  // {
  //   header: "CONCESSION TYPE",
  //   accessor: "concessionType",
  //   width: "1fr",
  //   align: "center",
  // },
  // { header: "RE-BRAND", accessor: "reBrand", width: "1fr", align: "center" },
  // {
  //   header: "RE-SIDEWALL",
  //   accessor: "reSidewall",
  //   width: "1fr",
  //   align: "center",
  // },
  { header: "BEAD TYPE", accessor: "beadType", width: "1fr", align: "center" },
  { header: "REMARKS", accessor: "remarks", width: "1fr", align: "center" },
];

const assignColumns = [
  { header: "PLATFORM", accessor: "platform", width: "0.8fr", align: "center" },
  { header: "TYRE SIZE", accessor: "tyreSize", width: "1.2fr", align: "left" },
  { header: "RIM", accessor: "rim", width: "0.5fr", align: "center" },
  { header: "TYPE", accessor: "type", width: "0.5fr", align: "center" },
  { header: "BRAND", accessor: "brand", width: "1fr", align: "left" },
  { header: "SIDEWALL", accessor: "sidewall", width: "1fr", align: "center" },
  { header: "PROCESSID", accessor: "processId", width: "1fr", align: "center" },
  { header: "PLANT", accessor: "plant", width: "1fr", align: "center" },
  {
    header: "STENCIL NO",
    accessor: "stencilNo",
    width: "1fr",
    align: "center",
  },
  { header: "GRADE", accessor: "grade", width: "1fr", align: "center" },
  { header: "QTY", accessor: "qty", width: "1fr", align: "center" },
  { header: "LOCATION", accessor: "location", width: "1fr", align: "center" },
];

const itemsColumns = [
  { header: "PLATFORM", accessor: "config", width: "1fr", align: "center" },
  { header: "TYRE SIZE", accessor: "tyreSize", width: "1fr", align: "left" },
  { header: "RIM", accessor: "rimSize", width: "1fr", align: "center" },
  { header: "TYPE", accessor: "tyreType", width: "1fr", align: "center" },
  { header: "BRAND", accessor: "brand", width: "1fr", align: "left" },
  { header: "SIDEWALL", accessor: "sidewall", width: "1fr", align: "center" },
  { header: "PROCESSID", accessor: "processID", width: "1fr", align: "center" },
  { header: "QTY", accessor: "orderQty", width: "1fr", align: "center" },
];

/* ════════════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════════════ */
const BarcodeDetailList = () => {
  const dispatch = useDispatch();

  const [mode, setMode] = useState("barcode");
  const [localSearch, setLocalSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    platform: "",
    tyreSize: "",
    rim: "",
    type: "",
    brand: "",
    sidewall: "",
  });

  const { InspectionDetails, barcodeDetails, loadingBarcode } = useSelector(
    (s) => s.scanforinspection,
  );

  const handleFilterChange = (key, value) =>
    setFilters((p) => ({ ...p, [key]: value }));

  const clearFilters = () =>
    setFilters({
      platform: "",
      tyreSize: "",
      rim: "",
      type: "",
      brand: "",
      sidewall: "",
    });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  /* scan progress */
  const scanedQty =
    InspectionDetails?.items?.reduce((t, i) => t + i.scannedQty, 0) ?? 0;
  const totalQty =
    InspectionDetails?.items?.reduce((t, i) => t + i.totalItemQty, 0) ?? 0;
  const percentage = totalQty > 0 ? (scanedQty / totalQty) * 100 : 0;

  /* fetch */
  useEffect(() => {
    clearFilters();
    if (mode === "barcode" || mode === "assignQty")
      dispatch(getBarcodeWise(InspectionDetails));
  }, [mode]);

  useEffect(() => {
    setLocalSearch("");
  }, []);

  /* source data */
  const processStencilList = barcodeDetails?.processStencilList ?? [];
  const stencilList = barcodeDetails?.concessionSummaryList ?? [];
  const items = InspectionDetails?.items ?? [];

  /* unique filter options */
  const uniq = (key) => [
    ...new Set(processStencilList.map((i) => i[key]).filter(Boolean)),
  ];
  const filterOptions = {
    platform: uniq("platform"),
    tyreSize: uniq("tyreSize"),
    rim: uniq("rim"),
    type: uniq("type"),
    brand: uniq("brand"),
    sidewall: uniq("sidewall"),
  };

  /* filtered data */
  const matchesSearch = (row, q) => {
    if (!q) return true;
    const t = q.toLowerCase().trim();
    return Object.values(row ?? {}).some((v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(t),
    );
  };

  const filteredData = useMemo(() => {
    const q = localSearch;
    if (mode === "barcode")
      return processStencilList
        .filter((item) =>
          Object.entries(filters).every(([k, v]) => !v || item[k] === v),
        )
        .filter((item) => matchesSearch(item, q));
    if (mode === "assignQty")
      return stencilList.filter((i) => matchesSearch(i, q));
    if (mode === "itemQty") return items.filter((i) => matchesSearch(i, q));
    return [];
  }, [mode, processStencilList, stencilList, items, filters, localSearch]);

  const activeColumns =
    mode === "barcode"
      ? barcodeColumns
      : mode === "assignQty"
        ? assignColumns
        : itemsColumns;

  /* ─── render ─────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-gray-800/50">
      {/* ══════════════════════ CONTROL PANEL ═══════════════════════════ */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
        {/* ── TOP STRIP ───────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between gap-2 sm:gap-4
                        px-3 sm:px-5 pt-3 pb-2.5 sm:pt-4 sm:pb-3
                        border-b border-dashed border-slate-100 dark:border-gray-700/60"
        >
          {/* Customer + Work Order */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 min-w-0 flex-1">
            <Stat label="Customer" value={InspectionDetails?.custFullName} />
            <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <Stat label="Work Order" value={InspectionDetails?.workOrderNo} />
          </div>

          {/* Progress ring */}
          <div
            className="flex-shrink-0 flex items-center gap-2 sm:gap-3 max-w-[120px] sm:max-w-none
                          bg-[var(--primary)]/8 dark:bg-blue-900/20
                          border border-[var(--primary)]/20 dark:border-blue-800/40
                          rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2"
          >
            <div className="hidden sm:flex flex-col items-end leading-none gap-0.5">
              <span className="text-[9px] uppercase tracking-widest font-bold text-[var(--primary)]">
                Scan Progress
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                {scanedQty} / {totalQty}
                <span className="font-normal text-slate-400 text-[10px] ml-1">
                  units
                </span>
              </span>
            </div>
            <RingSVG percentage={percentage} />
          </div>
        </div>

        {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 space-y-2.5">
          {/* Row A: mode tabs + row count */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
            {MODES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`
                  flex-shrink-0 px-2.5 sm:px-3.5 py-1.5
                  text-[10px] sm:text-[11px] font-semibold
                  rounded-lg border transition-all duration-150 whitespace-nowrap
                  ${
                    mode === key
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                      : "bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-gray-700 hover:border-[var(--primary)]/50 hover:text-[var(--primary)]"
                  }
                `}
              >
                {label}
              </button>
            ))}
            <span
              className="ml-auto flex-shrink-0 text-[10px] font-medium
                             text-slate-400 dark:text-slate-500 whitespace-nowrap tabular-nums pr-0.5"
            >
              {filteredData.length} row{filteredData.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Row B: search + filter button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <SearchBar
                placeholder="Search across all fields…"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            {mode === "barcode" && (
              <button
                onClick={() => setShowFilters((p) => !p)}
                className={`
                  flex-shrink-0 inline-flex items-center gap-1.5
                  px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-lg border
                  text-[10px] sm:text-[11px] font-semibold
                  transition-all duration-150 whitespace-nowrap
                  ${
                    showFilters || activeFilterCount > 0
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                      : "bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-gray-700 hover:border-[var(--primary)]/50 hover:text-[var(--primary)]"
                  }
                `}
              >
                <IoFilterSharp size={12} />
                <span className="hidden xs:inline">Filter</span>
                {activeFilterCount > 0 && (
                  <span
                    className="inline-flex items-center justify-center
                                   h-4 min-w-[16px] px-1 rounded-full
                                   bg-white/30 text-white text-[9px] font-bold"
                  >
                    {activeFilterCount}
                  </span>
                )}
                {showFilters ? (
                  <FiChevronUp size={11} />
                ) : (
                  <FiChevronDown size={11} />
                )}
              </button>
            )}
          </div>

          {/* Active filter pills — shown when panel is collapsed */}
          {mode === "barcode" && !showFilters && activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {Object.entries(filters)
                .filter(([, v]) => v)
                .map(([key, val]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full
                               bg-[var(--primary)]/10 border border-[var(--primary)]/20
                               text-[var(--primary)] text-[10px] font-medium"
                  >
                    {val}
                    <button
                      onClick={() => handleFilterChange(key, "")}
                      className="flex items-center justify-center w-3.5 h-3.5 rounded-full
                                 hover:bg-red-100 hover:text-red-500 transition-colors"
                    >
                      <IoMdClose size={9} />
                    </button>
                  </span>
                ))}
              <button
                onClick={clearFilters}
                className="text-[10px] text-red-400 hover:text-red-600
                           font-semibold underline underline-offset-2 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── FILTER PANEL (collapsible) ───────────────────────────────── */}
        {mode === "barcode" && showFilters && (
          <div
            className="px-3 sm:px-5 pb-3 sm:pb-4 pt-2.5 sm:pt-3
                          border-t border-dashed border-slate-100 dark:border-gray-700/60"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[9px] sm:text-[10px] uppercase tracking-widest
                               font-bold text-slate-400 dark:text-slate-500"
              >
                Filter by attribute
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-[10px]
                             text-red-500 hover:text-red-600 font-semibold transition-colors"
                >
                  <IoMdClose size={11} /> Clear all
                </button>
              )}
            </div>
            {/* 2 cols mobile → 3 md → 6 xl */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
              {[
                {
                  label: "Platform",
                  key: "platform",
                  opts: filterOptions.platform,
                },
                {
                  label: "Tyre Size",
                  key: "tyreSize",
                  opts: filterOptions.tyreSize,
                },
                { label: "Rim Size", key: "rim", opts: filterOptions.rim },
                { label: "Tyre Type", key: "type", opts: filterOptions.type },
                { label: "Brand", key: "brand", opts: filterOptions.brand },
                {
                  label: "Sidewall",
                  key: "sidewall",
                  opts: filterOptions.sidewall,
                },
              ].map(({ label, key, opts }) => (
                <div key={key} className="flex flex-col gap-1 min-w-0">
                  <label
                    className="text-[9px] uppercase tracking-wider font-bold
                                    text-slate-400 dark:text-slate-500 pl-0.5 truncate"
                  >
                    {label}
                  </label>
                  <Select
                    placeholder={`All`}
                    size="small"
                    style={{ width: "100%" }}
                    value={filters[key] || undefined}
                    onChange={(val) => handleFilterChange(key, val ?? "")}
                    allowClear
                    onClear={() => handleFilterChange(key, "")}
                    getPopupContainer={(t) => t.parentNode}
                  >
                    {opts.map((item, idx) => (
                      <Option key={idx} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════ TABLE ════════════════════════════════ */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="w-full min-w-[480px] sm:min-w-[640px] md:min-w-full h-full">
          <DynamicDataTable
            columns={activeColumns}
            headerClassName="bg-[var(--primary)] text-white dark:bg-slate-950 shadow-sm"
            data={filteredData}
            loading={mode === "barcode" ? loadingBarcode : false}
          />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════════ */

/** Two-line stat: tiny label over bold value */
const Stat = ({ label, value }) => (
  <div className="min-w-0">
    <p
      className="text-[8px] sm:text-[9px] uppercase tracking-widest font-bold
                  text-slate-400 dark:text-slate-500 mb-0.5 leading-none truncate"
    >
      {label}
    </p>
    <p
      className="text-[11px] sm:text-sm font-bold text-slate-800 dark:text-slate-100
  break-words sm:truncate max-w-[140px] sm:max-w-[220px] md:max-w-[320px]"
    >
      {value || "—"}
    </p>
  </div>
);

/** SVG-based progress ring (crisp at any size, no conic-gradient quirks) */
const RingSVG = ({ percentage }) => (
  <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
      <circle
        cx="18"
        cy="18"
        r="15.5"
        fill="none"
        strokeWidth="3"
        stroke="currentColor"
        className="text-slate-200 dark:text-slate-700"
      />
      <circle
        cx="18"
        cy="18"
        r="15.5"
        fill="none"
        strokeWidth="3"
        stroke="var(--primary)"
        strokeLinecap="round"
        strokeDasharray={`${percentage} 100`}
        pathLength="100"
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <span
        className="text-[8px] sm:text-[9px] font-bold
                       text-slate-700 dark:text-white tabular-nums"
      >
        {Math.round(percentage)}%
      </span>
    </div>
  </div>
);

export default BarcodeDetailList;
