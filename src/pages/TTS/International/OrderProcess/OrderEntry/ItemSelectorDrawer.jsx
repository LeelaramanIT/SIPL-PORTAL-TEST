import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getListOfItems } from "../../../../../Redux/Slices/OrderProcess/OrderProcessSlice";

// ─── constants ────────────────────────────────────────────────────────────────
const rise = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2 },
};

function cx(...names) {
    return names.filter(Boolean).join(" ");
}

const INPUT =
    "w-full min-h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal tracking-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600";

const PRIMARY =
    "rounded-lg border-0 bg-gradient-to-br from-amber-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90";

const MUTED =
    "rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white";

const PAGE_SIZE = 8;

const EMPTY_FILTERS = {
    search: "",
    itemType: "",
    processId: "",
    sidewall: "",
    brand: "",
    tyreSize: "",
    rimSize: "",
    edcNumber: "",
    assemblyProcessId: "",
};

// ─── Item type tab colours ────────────────────────────────────────────────────
const TYPE_STYLES = {
    ALL:      { bg: "bg-slate-500/10",    text: "text-slate-500",    border: "border-slate-400" },
    TYRE:     { bg: "bg-amber-500/10",    text: "text-amber-500",    border: "border-amber-400" },
    RIM:      { bg: "bg-blue-500/10",     text: "text-blue-500",     border: "border-blue-400"  },
    ASSEMBLY: { bg: "bg-emerald-500/10",  text: "text-emerald-500",  border: "border-emerald-400" },
};

// ─── Helper: map catalogue item → order line ──────────────────────────────────
function mapToOrderLine(item, nextIdRef) {
    return {
        id: nextIdRef.current++,
        code:            item.itemType === "ASSEMBLY"
            ? item.assemblyProcessId
            : item.itemType === "RIM"
            ? item.edcNumber
            : item.processId,
        customerPartNo:  "",
        desc:            item.description || "",
        qty:             1,
        price:           Number(item.price) || 0,
        disc:            0,
        tax:             9,
        // keep original data so the parent can use it if needed
        _raw:            item.originalData,
        _itemType:       item.itemType,
    };
}

// ─── Brand badge ──────────────────────────────────────────────────────────────
function BrandBadge({ brand }) {
    if (!brand || brand === "-") return <span className="text-[10px] text-slate-400">—</span>;
    const styles = {
        NUMA:        "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        EDC:         "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        TOTALSOURCE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    };
    return (
        <span className={cx("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase", styles[brand] || "bg-slate-500/10 text-slate-500")}>
            {brand}
        </span>
    );
}

// ─── Item type badge ──────────────────────────────────────────────────────────
function ItemTypeBadge({ type }) {
    const s = TYPE_STYLES[type] || TYPE_STYLES.ALL;
    return (
        <span className={cx("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase", s.bg, s.text, s.border)}>
            {type}
        </span>
    );
}

// ─── FilterChip ───────────────────────────────────────────────────────────────
function FilterChip({ label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cx(
                "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition",
                active
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-500 dark:text-blue-400"
                    : "border-slate-300 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            )}
        >
            {active && <span className="size-1.5 rounded-full bg-blue-500" />}
            {label}
        </button>
    );
}

// ─── Type Tab ─────────────────────────────────────────────────────────────────
function TypeTab({ label, active, count, onClick }) {
    const s = TYPE_STYLES[label] || TYPE_STYLES.ALL;
    return (
        <button
            type="button"
            onClick={onClick}
            className={cx(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition",
                active
                    ? cx(s.bg, s.text, s.border)
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            )}
        >
            {label}
            <em className={cx("rounded-full px-1.5 py-0.5 text-[8px] not-italic font-bold", active ? cx(s.bg, s.text) : "bg-slate-100 text-slate-400 dark:bg-slate-700")}>
                {count}
            </em>
        </button>
    );
}

// ─── Dash helper ─────────────────────────────────────────────────────────────
const dash = (v) => (!v || v === "-" ? <span className="text-[10px] text-slate-400">—</span> : v);

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export default function ItemSelectorDrawer({ open, onClose, onConfirm, nextId, notify, customer }) {
    const dispatch = useDispatch();

    const { listOfItems, loading: loadingItems } = useSelector(state => state.orderProcess);

    // ── Build unified catalogue from API response ────────────────────────────
    const catalogue = useMemo(() => {
        // Build price lookup from assemblyTyre: processID → price
        const asmPriceMap = {};
        (listOfItems?.data?.assemblyTyre || []).forEach(a => {
            if (a.processID && a.price != null) {
                asmPriceMap[a.processID] = Number(a.price) || 0;
            }
        });

        const tyreItems = (listOfItems?.data?.tyre || []).map((item, index) => ({
            id:               `TYRE-${index}-${item.processID}`,
            itemType:         "TYRE",
            processId:        item.processID  || "—",
            assemblyProcessId: "—",
            brand:            item.brand      || "—",
            sidewall:         item.sidewall   || "—",
            tyreSize:         item.tyreSize   || "—",
            rimSize:          item.tyreRim    || "—",
            tyreType:         item.tyreType   || "—",
            edcNumber:        "—",
            directional:      "—",
            description:      item.piD_Details || "",
            finishedWt:       item.finishedWt ?? "—",
            rimWt:            "—",
            price:            asmPriceMap[item.processID] ?? 0,
            uom:              "EA",
            originalData:     item,
        }));

        const rimItems = (listOfItems?.data?.rim || []).map((item, index) => ({
            id:               `RIM-${index}-${item.edcno}`,
            itemType:         "RIM",
            processId:        "—",
            assemblyProcessId: "—",
            brand:            "—",
            sidewall:         "—",
            tyreSize:         "—",
            rimSize:          "—",
            tyreType:         "—",
            edcNumber:        item.edcno      || "—",
            directional:      "—",
            description:      item.riM_Details || "",
            finishedWt:       "—",
            rimWt:            item.rimWt      ?? "—",
            price:            0,
            uom:              "EA",
            originalData:     item,
        }));

        const assemblyItems = (listOfItems?.data?.assemblyTyre || []).map((item, index) => ({
            id:               `ASM-${index}-${item.assY_PID}`,
            itemType:         "ASSEMBLY",
            processId:        item.processID  || "—",
            assemblyProcessId: item.assY_PID  || "—",
            brand:            item.brand      || "—",
            sidewall:         item.sidewall   || "—",
            tyreSize:         item.tyreSize   || "—",
            rimSize:          item.tyreRim    || "—",
            tyreType:         item.tyreType   || "—",
            edcNumber:        item.edcno      || "—",
            directional:      item.directional || "—",
            description:      item.piD_Details || "",
            finishedWt:       item.finishedWt ?? "—",
            rimWt:            item.rimWt      ?? "—",
            price:            Number(item.price) || 0,
            uom:              "EA",
            originalData:     item,
        }));

        return [...tyreItems, ...rimItems, ...assemblyItems];
    }, [listOfItems]);

    // ── State ────────────────────────────────────────────────────────────────
    const [filters,     setFilters]     = useState(EMPTY_FILTERS);
    const [activeType,  setActiveType]  = useState("ALL");
    const [activeChips, setActiveChips] = useState([]);
    const [selected,    setSelected]    = useState(new Set());
    const [page,        setPage]        = useState(1);
    const searchRef = useRef(null);

    // Fetch on open
    useEffect(() => {
        if (open) {
            dispatch(getListOfItems(customer?.custID));
            setSelected(new Set());
            setFilters(EMPTY_FILTERS);
            setActiveType("ALL");
            setPage(1);
            setQtys({});
            setTimeout(() => searchRef.current?.focus(), 120);
        }
    }, [open, dispatch]);

    // Derived options
    const sidewallOptions = useMemo(() => [...new Set(catalogue.map(i => i.sidewall).filter(v => v && v !== "—"))], [catalogue]);
    const brandOptions    = useMemo(() => [...new Set(catalogue.map(i => i.brand).filter(v => v && v !== "—"))],    [catalogue]);

    // Type counts
    const typeCounts = useMemo(() => ({
        ALL:      catalogue.length,
        TYRE:     catalogue.filter(i => i.itemType === "TYRE").length,
        RIM:      catalogue.filter(i => i.itemType === "RIM").length,
        ASSEMBLY: catalogue.filter(i => i.itemType === "ASSEMBLY").length,
    }), [catalogue]);

    // Filtered list
    const filtered = useMemo(() => {
        const q = filters.search.toLowerCase();
        return catalogue.filter(item => {
            if (activeType !== "ALL" && item.itemType !== activeType) return false;
            if (q && !`${item.processId} ${item.assemblyProcessId} ${item.description} ${item.edcNumber} ${item.tyreSize} ${item.rimSize}`.toLowerCase().includes(q)) return false;
            if (filters.processId        && !item.processId.toLowerCase().includes(filters.processId.toLowerCase()))               return false;
            if (filters.sidewall         && item.sidewall  !== filters.sidewall)                                                   return false;
            if (filters.brand            && item.brand     !== filters.brand)                                                      return false;
            if (filters.tyreSize         && !item.tyreSize.toLowerCase().includes(filters.tyreSize.toLowerCase()))                 return false;
            if (filters.rimSize          && !item.rimSize.toLowerCase().includes(filters.rimSize.toLowerCase()))                   return false;
            if (filters.edcNumber        && !item.edcNumber.toLowerCase().includes(filters.edcNumber.toLowerCase()))               return false;
            if (filters.assemblyProcessId && !item.assemblyProcessId.toLowerCase().includes(filters.assemblyProcessId.toLowerCase())) return false;
            return true;
        });
    }, [catalogue, filters, activeType]);

    // Pagination
    const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const setFilter   = (key, val) => { setFilters(prev => ({ ...prev, [key]: val })); setPage(1); };
    const clearFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };

    const toggleChip  = (key) => setActiveChips(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    const toggleRow   = (id)  => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const toggleAll   = () => {
        const ids = paginated.map(i => i.id);
        const allSel = ids.every(id => selected.has(id));
        setSelected(prev => { const n = new Set(prev); allSel ? ids.forEach(id => n.delete(id)) : ids.forEach(id => n.add(id)); return n; });
    };

    const handleConfirm = () => {
        const chosen     = catalogue.filter(i => selected.has(i.id));
        const orderLines = chosen.map(item => ({ ...mapToOrderLine(item, nextId), qty: qtys[item.id] ?? 1 }));
        onConfirm(orderLines);
        notify(`📦 ${orderLines.length} item(s) added to order`);
        onClose();
    };

    const filterChipDefs = [
        { key: "processId",         label: "Process ID"         },
        { key: "sidewall",           label: "Sidewall"           },
        { key: "brand",             label: "Brand"              },
        { key: "tyreSize",          label: "Tyre Size"          },
        { key: "rimSize",           label: "Rim Size"           },
        { key: "edcNumber",         label: "EDC Number"         },
        { key: "assemblyProcessId", label: "Assembly Process ID"},
    ];

    const hasActiveFilters = Object.values(filters).some(Boolean);
    const pageIds          = paginated.map(i => i.id);
    const allPageSelected  = pageIds.length > 0 && pageIds.every(id => selected.has(id));

    // ── Qty state per item id ────────────────────────────────────────────────
    const [qtys, setQtys] = useState({});
    const getQty = (id) => qtys[id] ?? 1;
    const setQty = (id, val) => {
        const n = Math.max(1, Number(val) || 1);
        setQtys(prev => ({ ...prev, [id]: n }));
    };

    // ── Single unified column set for all tabs ───────────────────────────────
    const activeCols = [
        {
            label: "Type",
            render: i => <ItemTypeBadge type={i.itemType} />,
        },
        {
            label: "Process ID",
            render: i => <code className="font-mono text-[12px] text-blue-500 dark:text-blue-400">{dash(i.processId)}</code>,
        },
        {
            label: "Assembly ID",
            render: i => <span className="text-[12px] text-slate-500">{dash(i.assemblyProcessId)}</span>,
        },
        {
            label: "EDC #",
            render: i => i.edcNumber && i.edcNumber !== "—"
                ? <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">{i.edcNumber}</code>
                : <span className="text-[10px] text-slate-400">—</span>,
        },
        {
            label: "Tyre Size",
            render: i => <span className="text-[11px] text-slate-600 dark:text-slate-400">{dash(i.tyreSize)}</span>,
        },
        {
            label: "Brand",
            render: i => <BrandBadge brand={i.brand} />,
        },
        {
            label: "Sidewall",
            render: i => <span className="text-[11px] text-slate-500">{dash(i.sidewall)}</span>,
        },
        {
            label: "Description",
            render: i => (
                <span className="block max-w-[250px] truncate text-[11px] text-slate-700 dark:text-slate-300" title={i.description}>
                    {i.description || "—"}
                </span>
            ),
        },
        {
            label: "Price",
            render: i => Number(i.price) > 0
                ? <span className="font-mono text-[11px] font-semibold text-amber-500 dark:text-amber-400">{Number(i.price).toFixed(2)}</span>
                : <span className="text-[10px] text-slate-400">—</span>,
        },
        {
            label: "Qty",
            render: i => (
                <input
                    type="number"
                    min="1"
                    value={getQty(i.id)}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setQty(i.id, e.target.value)}
                    className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-xs font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
            ),
        },
    ];

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm dark:bg-black/60"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.aside
                        key="drawer"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        className="fixed inset-y-0 right-0 z-[450] flex w-full max-w-[1000px] flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0c0e13]"
                    >
                        {/* ── Header ── */}
                        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5 dark:border-slate-800 dark:bg-[#111318]">
                            <div className="flex items-center gap-3">
                                <strong className="text-sm font-semibold text-slate-800 dark:text-white">Select Items</strong>
                                {loadingItems
                                    ? <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-blue-400">Loading…</span>
                                    : <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-800">{filtered.length} / {catalogue.length} items</span>
                                }
                            </div>
                            <div className="flex items-center gap-2">
                                {selected.size > 0 && (
                                    <motion.span {...rise} className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-500 dark:text-emerald-400">
                                        ✓ {selected.size} selected
                                    </motion.span>
                                )}
                                <button type="button" onClick={onClose} className={MUTED}>Cancel</button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={selected.size === 0}
                                    className={cx(PRIMARY, "disabled:opacity-40 disabled:cursor-not-allowed")}
                                >
                                    Add {selected.size > 0 ? `${selected.size} item${selected.size > 1 ? "s" : ""}` : "to order"} →
                                </button>
                            </div>
                        </header>

                        {/* ── Search bar ── */}
                        <div className="shrink-0 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
                            <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/15 dark:border-slate-700 dark:bg-slate-800">
                                <span className="text-slate-400">🔍</span>
                                <input
                                    ref={searchRef}
                                    value={filters.search}
                                    onChange={e => setFilter("search", e.target.value)}
                                    placeholder="Search — process ID, description, EDC number, tyre size…"
                                    className="flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                                />
                                {filters.search && (
                                    <button type="button" onClick={() => setFilter("search", "")} className="text-slate-400 hover:text-slate-600">✕</button>
                                )}
                            </div>
                        </div>

                        {/* ── Item type tabs ── */}
                        <div className="shrink-0 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
                            <div className="flex flex-wrap items-center gap-2">
                                {["ALL", "TYRE", "RIM", "ASSEMBLY"].map(t => (
                                    <TypeTab
                                        key={t}
                                        label={t}
                                        active={activeType === t}
                                        count={typeCounts[t] ?? 0}
                                        onClick={() => { setActiveType(t); setPage(1); }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* ── Filter chips row ── */}
                        <div className="shrink-0 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[.08em] text-slate-400">Filter by</span>
                                {filterChipDefs.map(chip => (
                                    <FilterChip
                                        key={chip.key}
                                        label={chip.label}
                                        active={activeChips.includes(chip.key)}
                                        onClick={() => toggleChip(chip.key)}
                                    />
                                ))}
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="ml-auto rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-500 transition hover:bg-red-500/20"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {activeChips.length > 0 && (
                                    <motion.div {...rise} className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                        {filterChipDefs.map(chip =>
                                            activeChips.includes(chip.key) ? (
                                                <label key={chip.key} className="flex flex-col gap-1 text-[9px] font-bold uppercase tracking-[.08em] text-slate-400">
                                                    {chip.label}
                                                    {chip.key === "sidewall" ? (
                                                        <select value={filters.sidewall} onChange={e => setFilter("sidewall", e.target.value)} className={INPUT}>
                                                            <option value="">All</option>
                                                            {sidewallOptions.map(opt => <option key={opt}>{opt}</option>)}
                                                        </select>
                                                    ) : chip.key === "brand" ? (
                                                        <select value={filters.brand} onChange={e => setFilter("brand", e.target.value)} className={INPUT}>
                                                            <option value="">All</option>
                                                            {brandOptions.map(opt => <option key={opt}>{opt}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            className={INPUT}
                                                            value={filters[chip.key]}
                                                            onChange={e => setFilter(chip.key, e.target.value)}
                                                            placeholder={`Search ${chip.label}…`}
                                                        />
                                                    )}
                                                </label>
                                            ) : null
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Table ── */}
                        <div className="min-h-0 flex-1 overflow-auto">
                            {loadingItems ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
                                    <span className="text-3xl">⏳</span>
                                    <p className="text-xs">Loading catalogue…</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
                                    <span className="text-3xl">🔍</span>
                                    <p className="text-xs">No items match your filters</p>
                                    <button type="button" onClick={clearFilters} className={MUTED}>Clear filters</button>
                                </div>
                            ) : (
                                <table className="w-full border-collapse text-xs">
                                    <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-[#111318]">
                                        <tr>
                                            <th className="border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
                                                <button
                                                    type="button"
                                                    onClick={toggleAll}
                                                    className={cx(
                                                        "flex size-4 items-center justify-center rounded border transition",
                                                        allPageSelected
                                                            ? "border-transparent bg-amber-400 text-slate-950"
                                                            : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                                                    )}
                                                >
                                                    {allPageSelected && <span className="text-[9px]">✓</span>}
                                                </button>
                                            </th>
                                            {activeCols.map(col => (
                                                <th key={col.label} className="border-b border-slate-200 px-2 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:border-slate-800 whitespace-nowrap">
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map(item => {
                                            const isSelected = selected.has(item.id);
                                            return (
                                                <motion.tr
                                                    layout
                                                    key={item.id}
                                                    onClick={() => toggleRow(item.id)}
                                                    className={cx(
                                                        "cursor-pointer border-b border-slate-200/80 transition dark:border-slate-800/70",
                                                        isSelected
                                                            ? "bg-amber-500/[.04] hover:bg-amber-500/[.07]"
                                                            : "hover:bg-slate-50 dark:hover:bg-white/[.015]"
                                                    )}
                                                >
                                                    <td className="px-3 py-2.5">
                                                        <div
                                                            className={cx(
                                                                "flex size-4 items-center justify-center rounded border transition",
                                                                isSelected
                                                                    ? "border-transparent bg-amber-400 text-slate-950"
                                                                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                                                            )}
                                                        >
                                                            {isSelected && <span className="text-[9px]">✓</span>}
                                                        </div>
                                                    </td>
                                                    {activeCols.map(col => (
                                                        <td key={col.label} className="px-2 py-2.5 whitespace-nowrap">
                                                            {col.render(item)}
                                                        </td>
                                                    ))}
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* ── Footer: pagination + summary ── */}
                        <footer className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-[#111318]">
                            <div className="flex items-center justify-between gap-4">
                                {/* Pagination */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[10px] text-slate-500 transition hover:border-slate-400 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800"
                                    >←</button>

                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPage(p)}
                                            className={cx(
                                                "rounded-md border px-2 py-1 text-[10px] font-semibold transition",
                                                p === currentPage
                                                    ? "border-amber-400 bg-amber-500/10 text-amber-500"
                                                    : "border-slate-300 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800"
                                            )}
                                        >{p}</button>
                                    ))}

                                    {totalPages > 7 && <span className="text-[10px] text-slate-400">… {totalPages}</span>}

                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[10px] text-slate-500 transition hover:border-slate-400 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800"
                                    >→</button>

                                    <span className="ml-2 text-[10px] text-slate-400">
                                        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                                    </span>
                                </div>

                                {/* CTA */}
                                <div className="flex items-center gap-2">
                                    {selected.size > 0 && (
                                        <span className="text-[10px] text-slate-400">{selected.size} item{selected.size > 1 ? "s" : ""} selected</span>
                                    )}
                                    <button type="button" onClick={onClose} className={MUTED}>Cancel</button>
                                    <button
                                        type="button"
                                        onClick={handleConfirm}
                                        disabled={selected.size === 0}
                                        className={cx(PRIMARY, "disabled:opacity-40 disabled:cursor-not-allowed")}
                                    >
                                        Add {selected.size > 0 ? `${selected.size} item${selected.size > 1 ? "s" : ""}` : "items"} to order →
                                    </button>
                                </div>
                            </div>
                        </footer>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}