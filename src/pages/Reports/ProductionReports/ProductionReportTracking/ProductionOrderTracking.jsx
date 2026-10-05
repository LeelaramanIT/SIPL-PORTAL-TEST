import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { ConfigProvider, Select, Dropdown, Popover, Tooltip, Checkbox, Modal, theme as antdTheme } from "antd";
import {
  Search, Download, RefreshCw, Columns3, HelpCircle, X, Printer, Boxes, Sparkles, BarChart3, SlidersHorizontal,
} from "lucide-react";
import OrderGroupRow from "./OrderGroupRow";
import {
  TODAY, buildTheme, groupStatus, getProgress, isDelayed, formatDate, statusLabel,
} from "./shared";
import SummaryPanel from "./SummaryPanel";
import WorkOrderDrawer from "./WorkOrderDrawer";
import ChatPanel from "./ChatPanel";
import { getProductionReport } from "../../../../Redux/Slices/Report/ProductionReportSlice";
import "./background.css";

// Wraps a control with an antd Tooltip explaining what it does — the tooltip
// only fires when hint mode is switched on, so it stays out of the way for
// users who already know the page and don't want hover popups on every control.
function Hint({ active, text, children }) {
  return <Tooltip title={active ? text : undefined}>{children}</Tooltip>;
}

// Maps the ERP's raw field names (orderStatus, customer, itemQty, desiredShipDate,
// ...) onto the canonical shape every child component consumes. `id` repeats across
// line items that belong to the same order header, so it can't be used as a React
// key or a selection identity on its own — `key` combines id + processId + array
// position into something that is actually unique per row.
function normalize(row, index) {
  const rawWorkOrderNo = typeof row.workOrderNo === "string" ? row.workOrderNo.trim() : "";
  const rawStatus = typeof row.orderStatus === "string" ? row.orderStatus.trim() : "";

  return {
    key: `${row.id ?? "r"}-${row.processId ?? "p"}-${index}`,
    id: row.id,
    customerName: row.customer || "Unknown Customer",
    // A per-row fallback (not a shared literal) — otherwise every row missing an
    // order ref would silently merge into one fake order in buildGroups, summing
    // unrelated quantities together under whichever row's customer happened to
    // be first.
    orderRefNo: row.orderRefNo || `NO-REF-${row.id ?? "r"}-${row.processId ?? "p"}-${index}`,
    workOrderNo: rawWorkOrderNo || "UNASSIGNED",
    hasWorkOrder: Boolean(rawWorkOrderNo),
    status: rawStatus || "UNSPECIFIED",
    processId: row.processId || "",
    category: (row.category || "").trim() || "Uncategorized",
    config: (row.config || "").trim(),
    tyreSize: (row.tyreSize || "").trim(),
    tyreRim: typeof row.tyreRim === "number" ? row.tyreRim : null,
    tyreType: (row.tyreType || "").trim(),
    brand: (row.brand || "").trim(),
    sideWall: (row.sideWall || "").trim(),
    finishedWt: typeof row.finishedWt === "number" ? row.finishedWt : 0,
    orderQty: typeof row.itemQty === "number" ? row.itemQty : 0,
    producedQty: typeof row.producedQty === "number" ? row.producedQty : 0,
    allocatedQty: typeof row.allocatedQty === "number" ? row.allocatedQty : 0,
    region: (row.region || "").trim(),
    lead: (row.lead || "").trim(),
    manager: (row.manager || "").trim(),
    plant: (row.plant || "").trim() || "Unassigned",
    orderDate: row.orderedDate ? row.orderedDate.slice(0, 10) : "",
    dueDate: row.desiredShipDate ? row.desiredShipDate.slice(0, 10) : "",
  };
}

// Category/Config/Brand/Sidewall/Tyre Type/Tyre Size/Rim/Process ID are
// deliberately NOT here — they're product-spec fields shown per line item in
// the Line Items table (LineItemRow.jsx) instead of at the order-group level,
// so they're not offered in the main Columns dropdown. They stay fully
// available in normalize()/rawRows for filtering, search, export, and the
// per-line-item detail drawer — only their appearance as a main-table column
// is removed.
const ALL_COLUMNS = [
  { key: "orderRefNo", label: "Order Ref", locked: true },
  { key: "customerName", label: "Customer", locked: true },
  { key: "status", label: "Status", byDefault: true },
  { key: "workOrderCount", label: "WOs", byDefault: true },
  { key: "progress", label: "Progress", byDefault: true },
  { key: "dueDate", label: "Due Date", byDefault: true },
  { key: "plant", label: "Plant", byDefault: true },
  { key: "region", label: "Region" },
  { key: "lead", label: "Lead" },
  { key: "manager", label: "Manager" },
  { key: "orderDate", label: "Order Date" },
];

const DEFAULT_COLUMNS = ALL_COLUMNS.filter((column) => column.locked || column.byDefault).map((c) => c.key);
const SEARCH_FIELDS = [
  "orderRefNo", "workOrderNo", "customerName",
  "processId", "tyreType", "tyreSize", "plant", "region", "lead", "manager",
];
const SORTABLE = ["orderRefNo", "customerName", "dueDate", "progress"];
const EMPTY_FILTERS = {
  plant: null, status: null, category: null, tyreType: null, region: null,
  tyreSize: null, tyreRim: null, processId: null, brand: null, progress: null,
};
// Human-readable labels for every filter key — used by the active-filter chips
// and the advanced filter popover, so camelCase keys like "tyreSize"/"processId"
// never leak into the UI as raw text.
const FILTER_LABELS = {
  plant: "Plant", status: "Status", category: "Category", tyreType: "Tyre Type", region: "Region",
  tyreSize: "Tyre Size", tyreRim: "Rim", processId: "Process ID", brand: "Brand", progress: "Progress",
};
// Filters surfaced in the "Advanced Filters" popover — less commonly used dimensions
// than the main toolbar's Plant/Status/Category/Tyre Type/Region selects.
const ADVANCED_FILTER_KEYS = ["tyreSize", "tyreRim", "processId", "brand"];

const PROGRESS_LABELS = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  FULLY_PRODUCED: "Fully Produced",
};

// A large result set can mean hundreds to low thousands of order groups —
// mounting every matching row at once (each with its own entrance animation
// and progress bar) is the single biggest render cost after data arrives, so
// the table renders a page at a time instead.
const ORDERS_PAGE_SIZE = 75;

function progressBucket(row) {
  if (row.producedQty <= 0) return "NOT_STARTED";
  if (row.orderQty > 0 && row.producedQty >= row.orderQty) return "FULLY_PRODUCED";
  return "IN_PROGRESS";
}

// Single source of truth for "does this row match the active filters" — used both
// to filter the table and (with a dimension excluded) to compute each filter's own
// dropdown options, so a filter never offers a value that would produce zero rows
// given the OTHER filters already selected. Excluding a filter from its own check
// still lets that filter be changed/broadened freely.
function matchesFilters(row, filters, exclude) {
  if (exclude !== "plant" && filters.plant && row.plant !== filters.plant) return false;
  if (exclude !== "category" && filters.category && row.category !== filters.category) return false;
  if (exclude !== "tyreType" && filters.tyreType && row.tyreType !== filters.tyreType) return false;
  if (exclude !== "region" && filters.region && row.region !== filters.region) return false;
  if (exclude !== "tyreSize" && filters.tyreSize && row.tyreSize !== filters.tyreSize) return false;
  if (exclude !== "tyreRim" && filters.tyreRim && row.tyreRim !== filters.tyreRim) return false;
  if (exclude !== "processId" && filters.processId && row.processId !== filters.processId) return false;
  if (exclude !== "brand" && filters.brand && row.brand !== filters.brand) return false;
  if (exclude !== "progress" && filters.progress && progressBucket(row) !== filters.progress) return false;
  if (exclude !== "status") {
    if (filters.status === "DELAYED" && !isDelayed(row)) return false;
    if (filters.status && filters.status !== "DELAYED" && row.status !== filters.status) return false;
  }
  return true;
}

// Columns that groupCell (OrderGroupRow.jsx) always special-cases and never
// reads from group.shared — computing them here would be wasted work.
const SHARED_COLUMN_SKIP = new Set(["workOrderCount", "progress", "dueDate", "orderDate"]);

function buildGroups(rows) {
  const byOrderRef = new Map();

  rows.forEach((row) => {
    if (!byOrderRef.has(row.orderRefNo)) byOrderRef.set(row.orderRefNo, []);
    byOrderRef.get(row.orderRefNo).push(row);
  });

  return Array.from(byOrderRef.entries()).map(([orderRefNo, groupRows]) => {
    const orderQty = groupRows.reduce((sum, row) => sum + row.orderQty, 0);
    const producedQty = groupRows.reduce((sum, row) => sum + row.producedQty, 0);
    const dueDates = groupRows.map((row) => row.dueDate).filter(Boolean).sort();
    const orderDates = groupRows.map((row) => row.orderDate).filter(Boolean).sort();

    // Early-exit equality scan instead of building a Set per column: most groups
    // are small (many are single-row), so this is usually zero or a few
    // comparisons instead of always mapping + hashing every row for every column.
    const shared = {};
    ALL_COLUMNS.forEach((column) => {
      if (SHARED_COLUMN_SKIP.has(column.key)) return;
      const first = groupRows[0][column.key];
      let allSame = true;
      for (let i = 1; i < groupRows.length; i += 1) {
        if (groupRows[i][column.key] !== first) {
          allSame = false;
          break;
        }
      }
      shared[column.key] = allSame ? first : "Multiple";
    });

    return {
      orderRefNo,
      customerName: groupRows[0].customerName,
      rows: groupRows,
      // Full per-work-order aggregation (buildWorkOrders) is deliberately NOT
      // computed here for every order — it's real cost (Map grouping, reduces,
      // a sort, a Set) and is only ever needed once a user expands a specific
      // order. OrderGroupRow computes it lazily. workOrderCount is the one thing
      // the collapsed row actually needs, and is cheap.
      workOrderCount: new Set(groupRows.map((row) => row.workOrderNo)).size,
      status: groupStatus(groupRows.map((row) => row.status)),
      orderQty,
      producedQty,
      progress: orderQty ? Math.round((producedQty / orderQty) * 100) : 0,
      dueDate: dueDates[0] || "",
      orderDate: orderDates[0] || "",
      isDelayed: groupRows.some(isDelayed),
      shared,
    };
  });
}

function toCsv(rows, columns) {
  const escape = (value) => {
    const text = value == null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const header = ["Work Order", ...columns.map((column) => column.label)];
  const body = rows.map((row) => [
    row.workOrderNo,
    ...columns.map((column) => {
      if (column.key === "status") return statusLabel(row.status);
      if (column.key === "progress") return `${getProgress(row)}%`;
      if (column.key === "workOrderCount") return 1;
      return row[column.key] ?? "";
    }),
  ]);

  return [header, ...body].map((line) => line.map(escape).join(",")).join("\n");
}

function downloadCsv(rows, columns, filename) {
  const blob = new Blob([toCsv(rows, columns)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function SkeletonRows({ colCount }) {
  return (
    <tbody>
      {Array.from({ length: 8 }).map((_, index) => (
        <tr key={index} className="h-11 border-b border-[var(--border)]">
          <td colSpan={colCount} className="px-4">
            <div className="h-3 animate-pulse rounded-full bg-[var(--border)]" style={{ width: `${95 - index * 6}%` }} />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

// forwardRef so wrapping this in an antd Tooltip (see Hint) can attach a ref to
// the underlying button — without it Tooltip can't measure/position the popup
// and the hover tooltip silently never appears.
const IconButton = React.forwardRef(function IconButton({ onClick, title, children }, ref) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--ts)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--tp)]"
    >
      {children}
    </button>
  );
});

export default function ProductionOrderTracking() {
  const dispatch = useDispatch();
  const { productionReport, loading, error } = useSelector((state) => state.productionReport);
  const dark = useSelector((state) => state.global.isDark);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState({ key: "dueDate", direction: "asc" });
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [visibleOrderCount, setVisibleOrderCount] = useState(ORDERS_PAGE_SIZE);
  const [drawerRow, setDrawerRow] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const searchRef = useRef(null);

  // productionReport holds the raw API rows; normalize() maps them to the
  // canonical shape every child component consumes. Recomputed only when the
  // underlying report data actually changes, not on every filter/search keystroke.
  const rawRows = useMemo(
    () => (Array.isArray(productionReport) ? productionReport.map(normalize) : []),
    [productionReport]
  );

  const loadData = useCallback(() => {
    dispatch(getProductionReport());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced so typing a search term doesn't re-run the full filter/group/sort
  // pipeline (596+ orders, each rebuilding its shared-column summary) on every
  // keystroke — only once the user pauses. The input itself stays instant since
  // it's bound to the un-debounced `search` state.
  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Faceted: each filter's options come from rows matching every OTHER active
  // filter (itself excluded), so e.g. selecting a Plant narrows which Categories/
  // Tyre Types/Regions are offered to only those that actually exist for that plant.
  // One pass over rawRows fills all 9 facets' Sets, instead of 9 separate
  // filter+map+Set+sort passes (each re-walking the full array on its own).
  const filterOptions = useMemo(() => {
    const dimensions = ["plant", "category", "tyreType", "region", "status", "tyreSize", "tyreRim", "processId", "brand"];
    const sets = Object.fromEntries(dimensions.map((key) => [key, new Set()]));

    rawRows.forEach((row) => {
      dimensions.forEach((key) => {
        if (matchesFilters(row, filters, key)) sets[key].add(row[key]);
      });
    });

    return Object.fromEntries(
      dimensions.map((key) => [key, Array.from(sets[key]).filter(Boolean).sort()])
    );
  }, [rawRows, filters]);

  const filteredRows = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return rawRows.filter((row) => {
      if (!matchesFilters(row, filters, null)) return false;
      if (!term) return true;
      return SEARCH_FIELDS.some((field) => String(row[field] ?? "").toLowerCase().includes(term));
    });
  }, [rawRows, debouncedSearch, filters]);

  // Split from sorting so clicking a sort header doesn't re-run the whole
  // group/aggregate pipeline (buildGroups) — it only needs to re-sort the
  // groups that are already built.
  const groups = useMemo(() => buildGroups(filteredRows), [filteredRows]);

  const groupedOrders = useMemo(() => {
    const direction = sort.direction === "asc" ? 1 : -1;

    return [...groups].sort((a, b) => {
      const left = sort.key === "progress" ? a.progress : a[sort.key] ?? a.shared[sort.key];
      const right = sort.key === "progress" ? b.progress : b[sort.key] ?? b.shared[sort.key];
      if (left === right) return a.orderRefNo.localeCompare(b.orderRefNo);
      return left > right ? direction : -direction;
    });
  }, [groups, sort]);

  // Single pass over filteredRows instead of five separate .filter() traversals.
  const kpis = useMemo(() => {
    let notStarted = 0;
    let inProgress = 0;
    let fullyProduced = 0;
    let delayed = 0;

    filteredRows.forEach((row) => {
      const bucket = progressBucket(row);
      if (bucket === "NOT_STARTED") notStarted += 1;
      else if (bucket === "IN_PROGRESS") inProgress += 1;
      else fullyProduced += 1;
      if (isDelayed(row)) delayed += 1;
    });

    return { total: filteredRows.length, notStarted, inProgress, fullyProduced, delayed };
  }, [filteredRows]);

  // A new result set (or a re-sort) should start from the top of the page instead
  // of leaving the user 8 pages deep into a list that just changed underneath them.
  useEffect(() => {
    setVisibleOrderCount(ORDERS_PAGE_SIZE);
  }, [groups, sort]);

  const visibleOrders = groupedOrders.slice(0, visibleOrderCount);
  const hasMoreOrders = groupedOrders.length > visibleOrderCount;

  const isNarrowed = Boolean(debouncedSearch.trim()) || Object.values(filters).some(Boolean);

  // Auto-expand every currently-matching order group when the search term or a
  // filter changes, so newly-matched work orders are visible without an extra
  // click. Replaces expandedIds outright (a group that stops matching collapses).
  //
  // groupedOrders/isNarrowed are intentionally left out of the dependency array:
  // both are derived synchronously from debouncedSearch/filters (already listed),
  // so they are always fresh here. Adding them would also re-run this effect on
  // sort changes, which would incorrectly re-expand groups the user just collapsed.
  useEffect(() => {
    if (!isNarrowed) return;
    setExpandedIds(new Set(groupedOrders.map((group) => group.orderRefNo)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters]);

  // Memoized so the array reference only changes when visibleColumns actually
  // does — otherwise every OrderGroupRow (one per order, hundreds of them) would
  // see a "new" columns prop on every render and React.memo could never skip them.
  const columns = useMemo(
    () => ALL_COLUMNS.filter((column) => visibleColumns.includes(column.key)),
    [visibleColumns]
  );
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const advancedFilterCount = ADVANCED_FILTER_KEYS.filter((key) => filters[key]).length;
  const selectedRows = useMemo(
    () => filteredRows.filter((row) => selectedIds.has(row.key)),
    [filteredRows, selectedIds]
  );

  // Single pass per dependency change instead of the header/footer calling a
  // Set-constructing function inline in JSX (which reran on every render, not
  // just when the underlying rows actually changed).
  const rawStats = useMemo(() => {
    const workOrders = new Set();
    const orders = new Set();
    const plants = new Set();
    rawRows.forEach((row) => {
      workOrders.add(row.workOrderNo);
      orders.add(row.orderRefNo);
      plants.add(row.plant);
    });
    return { workOrders: workOrders.size, orders: orders.size, plants: plants.size };
  }, [rawRows]);

  const filteredWorkOrderCount = useMemo(() => {
    const workOrders = new Set();
    filteredRows.forEach((row) => workOrders.add(row.workOrderNo));
    return workOrders.size;
  }, [filteredRows]);

  const toggleExpand = useCallback((orderRefNo) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      next.has(orderRefNo) ? next.delete(orderRefNo) : next.add(orderRefNo);
      return next;
    });
  }, []);

  const toggleRow = useCallback((key) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const toggleGroup = useCallback((keys, shouldSelect) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      keys.forEach((key) => (shouldSelect ? next.add(key) : next.delete(key)));
      return next;
    });
  }, []);

  function applySort(key) {
    if (!SORTABLE.includes(key)) return;
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  }

  function selectStatus(status) {
    setFilters((current) => ({ ...current, status: current.status === status ? null : status }));
  }

  function selectProgress(bucket) {
    setFilters((current) => ({ ...current, progress: current.progress === bucket ? null : bucket }));
  }

  const columnMenu = {
    style: { maxHeight: 320, overflowY: "auto" },
    items: ALL_COLUMNS.map((column) => ({
      key: column.key,
      label: (
        // Stops the click from bubbling to antd's Menu item handler, which would
        // otherwise treat every checkbox click as a "selection" and auto-close the
        // dropdown after the first one — blocking multi-select.
        <div onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={visibleColumns.includes(column.key)}
            disabled={column.locked}
            onChange={(event) =>
              setVisibleColumns((current) =>
                event.target.checked ? [...current, column.key] : current.filter((key) => key !== column.key)
              )
            }
          >
            <span className="text-[13px]">{column.label}</span>
          </Checkbox>
        </div>
      ),
    })),
  };

  const selectStyle = { width: 132 };

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: dark ? "#4DA3F5" : "#0F6CBD", borderRadius: 8, fontSize: 13 },
      }}
    >
      <div
        style={{
          ...buildTheme(dark),
          background: "var(--bg)",
          color: "var(--tp)",
          fontFamily: "'Archivo', ui-sans-serif, system-ui, sans-serif",
        }}
        className="po-app min-h-screen"
      >
        <div className="po-grid min-h-screen">
          <div className="mx-auto max-w-[1560px] px-4 py-6 sm:px-6">
            <div className="po-hero mb-5 rounded-2xl">
              <span className="po-hero__blob po-hero__blob--a" aria-hidden="true" />
              <span className="po-hero__blob po-hero__blob--b" aria-hidden="true" />

              <motion.header
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap items-start justify-between gap-4 px-1 py-1"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--accent)]"
                    style={{ boxShadow: "var(--shadow)" }}
                  >
                    <Boxes size={19} />
                  </span>
                  <div>
                    <h1 className="text-[19px] font-bold leading-tight tracking-tight text-[var(--tp)]">
                      Production Order Tracking
                    </h1>
                    <p className="mt-0.5 text-[12px] text-[var(--ts)]">
                      {rawRows.length} line items · {rawStats.workOrders} work orders ·{" "}
                      {rawStats.orders} orders · {rawStats.plants} plants · as of {formatDate(TODAY)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="mr-1 flex items-center gap-2 rounded-full border border-[#1DA97C40] bg-[#1DA97C14] px-3 py-1.5 text-[11px] font-semibold text-[#1DA97C]">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-[#1DA97C]"
                      animate={{ opacity: [1, 0.25, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    Live
                  </span>
                  <Popover
                    trigger="click"
                    placement="bottomRight"
                    open={showHints}
                    onOpenChange={setShowHints}
                    content={
                      <div className="w-[280px] text-[12px] text-[var(--tp)]">
                        <p className="mb-2 font-semibold">How to use this page</p>
                        <ul className="flex flex-col gap-1.5 text-[var(--ts)]">
                          <li>🔍 Search matches order ref, work order, customer, process ID, tyre type or size (⌘K to focus)</li>
                          <li>🧭 Plant / Status / Category / Tyre Type / Region narrow the table; Advanced adds more filters</li>
                          <li>📂 Click an order row to expand its work orders and line items</li>
                          <li>↕️ Click a column header to sort by it</li>
                          <li>☑️ Select rows to export or print just those line items</li>
                          <li>⬇️ Export CSV downloads everything currently filtered</li>
                          <li>📊 Summary opens KPI charts; Ask AI lets you query the data in plain language</li>
                        </ul>
                        <p className="mt-2 text-[var(--tt)]">Hover any control while this is open for a quick reminder.</p>
                      </div>
                    }
                  >
                    <IconButton title="How to use this page">
                      <HelpCircle size={15} color={showHints ? "var(--accent)" : undefined} />
                    </IconButton>
                  </Popover>
                  <Hint active={showHints} text="Reload the latest production data">
                    <IconButton onClick={loadData} title="Refresh">
                      <motion.span animate={loading ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }} className="flex">
                        <RefreshCw size={15} />
                      </motion.span>
                    </IconButton>
                  </Hint>
                  <Hint active={showHints} text="Download the currently filtered orders as a CSV file">
                    <button
                      onClick={() => downloadCsv(filteredRows, columns, "production-orders.csv")}
                      className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      <Download size={14} /> Export CSV
                    </button>
                  </Hint>
                  <Hint active={showHints} text="Open KPI charts and a status/progress breakdown for the filtered orders">
                    <button
                      onClick={() => setSummaryOpen(true)}
                      className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-[13px] font-semibold text-[var(--tp)] transition-colors hover:bg-[var(--hover)]"
                    >
                      <BarChart3 size={14} /> Summary
                    </button>
                  </Hint>
                  <Hint active={showHints} text="Ask questions about this data in natural language">
                    <button
                      onClick={() => setChatOpen(true)}
                      className="flex items-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3.5 py-2 text-[13px] font-semibold text-[var(--accent)] transition-opacity hover:opacity-90"
                    >
                      <Sparkles size={14} /> Ask AI
                    </button>
                  </Hint>
                </div>
              </motion.header>
            </div>

            {activeFilterCount > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium text-[var(--tt)]">Active filters:</span>
                {Object.entries(filters)
                  .filter(([, value]) => Boolean(value))
                  .map(([key, value]) => (
                    <span
                      key={key}
                      className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] py-1 pl-3 pr-1.5 text-[11px] font-medium text-[var(--tp)]"
                    >
                      <span className="text-[var(--tt)]">{FILTER_LABELS[key] ?? key}:</span>
                      {key === "status"
                        ? value === "DELAYED" ? "Delayed" : statusLabel(value)
                        : key === "progress"
                        ? PROGRESS_LABELS[value] ?? value
                        : value}
                      <button
                        onClick={() => setFilters((c) => ({ ...c, [key]: null }))}
                        className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--tt)] hover:bg-[var(--hover)] hover:text-[var(--tp)]"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-[11px] font-medium text-[var(--accent)] hover:underline"
                >
                  Reset all
                </button>
              </div>
            )}

            <div
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
              style={{ boxShadow: "var(--shadow)" }}
            >
              <AnimatePresence mode="wait">
                {selectedRows.length > 0 ? (
                  <motion.div
                    key="bulk"
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex h-[60px] items-center gap-3 border-b border-[var(--border)] bg-[var(--accent-soft)] px-4"
                  >
                    <span className="text-[13px] font-semibold text-[var(--tp)]">
                      {selectedRows.length} line item{selectedRows.length > 1 ? "s" : ""} selected
                    </span>
                    <button
                      onClick={() => downloadCsv(selectedRows, columns, "production-orders-selected.csv")}
                      className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[12px] font-medium hover:bg-[var(--hover)]"
                    >
                      <Download size={13} /> Export selected
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[12px] font-medium hover:bg-[var(--hover)]"
                    >
                      <Printer size={13} /> Print job cards
                    </button>
                    <button
                      onClick={() => setSelectedIds(new Set())}
                      className="ml-auto flex items-center gap-1 text-[12px] font-medium text-[var(--accent)] hover:underline"
                    >
                      <X size={13} /> Clear
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="toolbar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex min-h-[60px] flex-wrap items-center gap-2 border-b border-[var(--border)] px-4 py-2.5"
                  >
                    <Hint active={showHints} text="Search by order ref, work order, customer, process ID, tyre type or size (⌘K)">
                      <div className="relative">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tt)]" />
                        <input
                          ref={searchRef}
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search order, work order, customer, process ID, type, size…"
                          className="h-9 w-full sm:w-[330px] rounded-lg border border-[var(--border)] bg-[var(--card-2)] pl-9 pr-16 text-[13px] text-[var(--tp)] outline-none transition-colors placeholder:text-[var(--tt)] focus:border-[var(--accent)]"
                        />
                        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--tt)]">
                          ⌘K
                        </kbd>
                      </div>
                    </Hint>

                    <Hint active={showHints} text="Filter orders by plant">
                      <Select allowClear size="middle" style={selectStyle} placeholder="Plant" value={filters.plant}
                        onChange={(value) => setFilters((c) => ({ ...c, plant: value ?? null }))}
                        options={filterOptions.plant.map((value) => ({ value, label: value }))} />
                    </Hint>
                    <Hint active={showHints} text="Filter by status, or pick Delayed for orders past their ship date">
                      <Select allowClear showSearch size="middle" style={{ width: 220 }} placeholder="Status" value={filters.status}
                        onChange={(value) => setFilters((c) => ({ ...c, status: value ?? null }))}
                        optionFilterProp="label"
                        options={[
                          ...filterOptions.status.map((value) => ({ value, label: statusLabel(value) })),
                          { value: "DELAYED", label: "Delayed" },
                        ]} />
                    </Hint>
                    <Hint active={showHints} text="Filter orders by category">
                      <Select allowClear size="middle" style={selectStyle} placeholder="Category" value={filters.category}
                        onChange={(value) => setFilters((c) => ({ ...c, category: value ?? null }))}
                        options={filterOptions.category.map((value) => ({ value, label: value }))} />
                    </Hint>
                    <Hint active={showHints} text="Filter orders by tyre type">
                      <Select allowClear size="middle" style={{ width: 132 }} placeholder="Tyre Type" value={filters.tyreType}
                        onChange={(value) => setFilters((c) => ({ ...c, tyreType: value ?? null }))}
                        options={filterOptions.tyreType.map((value) => ({ value, label: value }))} />
                    </Hint>
                    <Hint active={showHints} text="Filter orders by region">
                      <Select allowClear size="middle" style={{ width: 132 }} placeholder="Region" value={filters.region}
                        onChange={(value) => setFilters((c) => ({ ...c, region: value ?? null }))}
                        options={filterOptions.region.map((value) => ({ value, label: value }))} />
                    </Hint>

                    <Popover
                      trigger="click"
                      placement="bottomLeft"
                      content={
                        <div className="flex w-[240px] flex-col gap-3 p-1">
                          {ADVANCED_FILTER_KEYS.map((key) => (
                            <div key={key} className="flex flex-col gap-1">
                              <span className="text-[11px] font-medium text-[var(--ts)]">{FILTER_LABELS[key]}</span>
                              <Select
                                allowClear
                                showSearch
                                size="middle"
                                placeholder={`Any ${FILTER_LABELS[key]}`}
                                value={filters[key]}
                                onChange={(value) => setFilters((c) => ({ ...c, [key]: value ?? null }))}
                                options={filterOptions[key].map((value) => ({ value, label: String(value) }))}
                              />
                            </div>
                          ))}
                          {advancedFilterCount > 0 && (
                            <button
                              onClick={() =>
                                setFilters((c) => {
                                  const next = { ...c };
                                  ADVANCED_FILTER_KEYS.forEach((key) => { next[key] = null; });
                                  return next;
                                })
                              }
                              className="self-start text-[11px] font-medium text-[var(--accent)] hover:underline"
                            >
                              Clear advanced filters
                            </button>
                          )}
                        </div>
                      }
                    >
                      <button
                        title={showHints ? "More filters: tyre size, rim, process ID, brand" : undefined}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                          advancedFilterCount > 0
                            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "border-[var(--border)] text-[var(--ts)] hover:bg-[var(--hover)] hover:text-[var(--tp)]"
                        }`}
                      >
                        <SlidersHorizontal size={13} /> Advanced{advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ""}
                      </button>
                    </Popover>

                    {activeFilterCount > 0 && (
                      <button onClick={() => setFilters(EMPTY_FILTERS)}
                        className="text-[12px] font-medium text-[var(--accent)] hover:underline">
                        Clear all ({activeFilterCount})
                      </button>
                    )}

                    <Dropdown menu={columnMenu} trigger={["click"]} placement="bottomRight">
                      <button
                        title={showHints ? "Choose which columns are shown in the table" : undefined}
                        className="ml-auto flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-[12px] font-medium text-[var(--ts)] hover:bg-[var(--hover)] hover:text-[var(--tp)]"
                      >
                        <Columns3 size={13} /> Columns
                      </button>
                    </Dropdown>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="flex items-center justify-between border-b border-[#E5484D40] bg-[#E5484D14] px-4 py-2.5 text-[12px] text-[#E5484D]">
                  <span>Could not load production orders: {error}</span>
                  <button onClick={loadData} className="font-semibold underline">Retry</button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-20">
                    <tr className="h-10 bg-[var(--card-2)] text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ts)]">
                      <th className="sticky left-0 z-10 w-[68px] border-b border-[var(--border)] bg-[var(--card-2)] px-3" />
                      {columns.map((column, index) => (
                        <th
                          key={column.key}
                          onClick={() => applySort(column.key)}
                          className={`whitespace-nowrap border-b border-[var(--border)] px-3 ${
                            SORTABLE.includes(column.key) ? "cursor-pointer hover:text-[var(--accent)]" : ""
                          } ${index === 0 ? "sticky left-[68px] z-10 bg-[var(--card-2)]" : ""}`}
                          style={sort.key === column.key ? { color: "var(--accent)" } : undefined}
                        >
                          {column.label}
                          {sort.key === column.key && (
                            <span className="ml-1">{sort.direction === "asc" ? "↑" : "↓"}</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {loading ? (
                    <SkeletonRows colCount={columns.length + 1} />
                  ) : (
                    <tbody>
                      {visibleOrders.map((group, index) => (
                        <OrderGroupRow
                          key={group.orderRefNo}
                          index={index}
                          group={group}
                          columns={columns}
                          expanded={expandedIds.has(group.orderRefNo)}
                          onToggleExpand={toggleExpand}
                          selectedIds={selectedIds}
                          onToggleGroup={toggleGroup}
                          onToggleRow={toggleRow}
                          onOpenRow={setDrawerRow}
                          search={debouncedSearch}
                        />
                      ))}
                    </tbody>
                  )}
                </table>

                {!loading && groupedOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Boxes size={24} />
                    </span>
                    {rawRows.length === 0 ? (
                      <p className="text-[14px] font-medium text-[var(--tp)]">No production orders yet</p>
                    ) : (
                      <>
                        <p className="text-[14px] font-medium text-[var(--tp)]">No orders match these filters</p>
                        <button
                          onClick={() => {
                            setFilters(EMPTY_FILTERS);
                            setSearch("");
                            setDebouncedSearch("");
                          }}
                          className="mt-2 text-[13px] font-medium text-[var(--accent)] hover:underline"
                        >
                          Clear all filters
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!loading && hasMoreOrders && (
                  <div className="flex justify-center border-t border-[var(--border)] py-3">
                    <button
                      onClick={() => setVisibleOrderCount((count) => count + ORDERS_PAGE_SIZE)}
                      className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[12px] font-medium text-[var(--tp)] transition-colors hover:bg-[var(--hover)]"
                    >
                      Load {Math.min(ORDERS_PAGE_SIZE, groupedOrders.length - visibleOrderCount)} more
                      ({groupedOrders.length - visibleOrderCount} remaining)
                    </button>
                  </div>
                )}
              </div>

              {!loading && groupedOrders.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-[var(--border)] px-4 py-2.5 text-[11px] text-[var(--tt)] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {hasMoreOrders
                      ? `Showing ${visibleOrders.length} of ${groupedOrders.length} orders`
                      : `${groupedOrders.length} orders`}
                    {" "}· {filteredWorkOrderCount} work orders · {filteredRows.length} line items shown
                  </span>
                  <span>Click any work order row for full detail</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <WorkOrderDrawer row={drawerRow} onClose={() => setDrawerRow(null)} />
        <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} rows={rawRows} />

        <Modal
          title="Summary"
          open={summaryOpen}
          onCancel={() => setSummaryOpen(false)}
          footer={null}
          width={1350}
          centered
          styles={{ body: { maxHeight: "78vh", overflowY: "auto" } }}
        >
          {summaryOpen && (
            <SummaryPanel
              rows={filteredRows}
              kpis={kpis}
              statusFilter={filters.status}
              onSelectStatus={selectStatus}
              progressFilter={filters.progress}
              onSelectProgress={selectProgress}
            />
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
}
