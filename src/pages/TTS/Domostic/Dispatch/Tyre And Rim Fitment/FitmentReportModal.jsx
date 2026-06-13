import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileSpreadsheet, User, Hash, Package, Calendar, Ship, Layers, List, Search } from "lucide-react";
import { formatDateTime } from "../../../../../utils/FormatDate";
import { getStencilWiseData } from "../../../../../Redux/Slices/PDIFitmentMaster/PDIFitmentSlice";
import { useDispatch, useSelector } from "react-redux";

const FitmentReportModal = ({
  open,
  onClose,
  FitmentDetails,
  items = [],
  onDownload,
  loading = false,
}) => {
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const listOfStencilWiseData = useSelector((state) => state.PDIFitment.listOfStencilWiseData);

  const [isStencilView, setIsStencilView] = useState(false);

  // ── NEW: per-view search terms ──
  const [woSearch, setWoSearch]           = useState("");
  const [stencilSearch, setStencilSearch] = useState("");

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, onClose]);

  useEffect(() => {
    dispatch(getStencilWiseData(FitmentDetails?.id));
  }, [FitmentDetails?.id]);

  // Reset view + search whenever modal closes/reopens
  useEffect(() => {
    if (!open) {
      setIsStencilView(false);
      setWoSearch("");
      setStencilSearch("");
    }
  }, [open]);

  // Clear search when switching views
  useEffect(() => {
    setWoSearch("");
    setStencilSearch("");
  }, [isStencilView]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const clean = (val) => String(val ?? "").trim();

  const totalQty   = items.reduce((acc, item) => acc + (item.itemQty   || 0), 0);
  const scannedQty = items.reduce((acc, item) => acc + (item.scannedQty || 0), 0);

  const detailRows = [
    { icon: <User size={13} />,     label: "Full Name",    value: clean(FitmentDetails?.customerName) },
    { icon: <Hash size={13} />,     label: "Order Ref No", value: clean(FitmentDetails?.orderRefNo) },
    { icon: <Package size={13} />,  label: "Work Order",   value: clean(FitmentDetails?.workorderno) },
    { icon: <Calendar size={13} />, label: "Order Date",   value: clean(formatDateTime(FitmentDetails?.orderDate)) },
    { icon: <Ship size={13} />,     label: "Ship Date",    value: clean(formatDateTime(FitmentDetails?.DesiredShipDate)) },
  ];

  const tableColumns = [
    { label: "Category",    key: "category" },
    { label: "Platform",    key: "config" },
    { label: "Tyre Size",   key: "tyreSize",   bold: true },
    { label: "Rim",         key: "rimSize" },
    { label: "Type",        key: "tyreType" },
    { label: "Brand",       key: "brand" },
    { label: "Sidewall",    key: "sideWall" },
    { label: "Process ID",  key: "processId" },
    { label: "EDC No",      key: "edcNo" },
    { label: "Directional", key: "directional" },
    { label: "Total Qty",   key: "itemQty",    numeric: true },
    { label: "Scanned Qty", key: "scannedQty", numeric: true, accent: true },
  ];

  const stencilColumns = [
    { label: "Stencil No",       key: "stencilNo",       bold: true },
    { label: "Process ID",       key: "processID" },
    { label: "Assembly Barcode", key: "assemblyBarcode" },
    { label: "Tyre Barcode",     key: "tyreBarcode" },
    { label: "Rim Barcode",      key: "rimBarcode" },
    { label: "Config",           key: "config" },
    { label: "Category",         key: "category" },
    { label: "Tyre Size",        key: "tyreSize" },
    { label: "Rim Size",         key: "rimSize" },
    { label: "Type",             key: "tyreType" },
    { label: "Brand",            key: "brand" },
    { label: "Side Wall",        key: "sideWall" },
    { label: "EDC No",           key: "edcNo" },
  ];

  const stencilData = listOfStencilWiseData ?? [];

  // ── NEW: filtered datasets ──
  const filteredItems = useMemo(() => {
    const term = woSearch.toLowerCase().trim();
    if (!term) return items;
    return items.filter((item) =>
      tableColumns.some((col) =>
        clean(item[col.key]).toLowerCase().includes(term)
      )
    );
  }, [woSearch, items]);

  const filteredStencil = useMemo(() => {
    const term = stencilSearch.toLowerCase().trim();
    if (!term) return stencilData;
    return stencilData.filter((item) =>
      stencilColumns.some((col) =>
        clean(item[col.key]).toLowerCase().includes(term)
      )
    );
  }, [stencilSearch, stencilData]);

  // Totals reflect filtered rows
  const filteredTotalQty   = filteredItems.reduce((acc, item) => acc + (item.itemQty   || 0), 0);
  const filteredScannedQty = filteredItems.reduce((acc, item) => acc + (item.scannedQty || 0), 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
          style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* ── MODAL HEADER ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[var(--primary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileSpreadsheet size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-none">
                    Fitment Workorder Report
                  </h2>
                  <p className="text-[10px] text-white/70 mt-0.5 uppercase tracking-widest">
                    Preview · {isStencilView ? filteredStencil.length : filteredItems.length} line items
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center bg-white/10 rounded-lg border border-white/20 p-0.5 gap-0.5">
                  <button
                    onClick={() => setIsStencilView(false)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                      !isStencilView
                        ? "bg-white text-[var(--primary)] shadow-sm"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <List size={11} />
                    <span className="hidden sm:inline">Work Order</span>
                  </button>
                  <button
                    onClick={() => setIsStencilView(true)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                      isStencilView
                        ? "bg-white text-[var(--primary)] shadow-sm"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Layers size={11} />
                    <span className="hidden sm:inline">Stencil Wise</span>
                  </button>
                </div>

                {onDownload && (
                  <button
                    onClick={onDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg border border-white/30 transition-all active:scale-95"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-all active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── SCROLLABLE BODY ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4 sm:p-6 space-y-5">

                {/* ── DOCUMENT TITLE BAR ── */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--primary)]/6 border border-[var(--primary)]/15">
                  <div className="flex items-center gap-3">
                    <div className="w-[70px] h-[32px] rounded-md bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                      <img
                        src="/SUN-TWS.png"
                        alt="Logo"
                        className="h-full w-full object-contain rounded-md"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <span className="hidden text-[9px] font-black text-[var(--primary)] tracking-widest" style={{ display: "none" }}>
                        LOGO
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-[var(--primary)]/60">Document</p>
                      <h3 className="text-sm sm:text-base font-black tracking-widest text-[var(--primary)] uppercase">
                        {isStencilView ? "Stencil Wise View" : "Fitment Workorder"}
                      </h3>
                    </div>
                  </div>
                  {!isStencilView && (
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Scan Progress</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {scannedQty} / {totalQty}
                        </span>
                        <div className="h-1.5 w-20 sm:w-28 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                            style={{ width: totalQty > 0 ? `${(scannedQty / totalQty) * 100}%` : "0%" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {isStencilView && (
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Total Stencils</p>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {stencilData.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── DETAILS SECTION ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {detailRows.map(({ icon, label, value }, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60"
                    >
                      <div className="mt-0.5 text-[var(--primary)] shrink-0">{icon}</div>
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 leading-none mb-1">{label}</p>
                        {loading ? (
                          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        ) : (
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {value || "—"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── TABLE SECTION ── */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">

                  {/* ── NEW: Table toolbar with search ── */}
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 shrink-0">
                      {isStencilView ? "Stencil Items" : "Line Items"}
                    </span>

                    <div className="relative flex-1 max-w-xs">
                      <Search
                        size={11}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={isStencilView ? stencilSearch : woSearch}
                        onChange={(e) =>
                          isStencilView
                            ? setStencilSearch(e.target.value)
                            : setWoSearch(e.target.value)
                        }
                        placeholder={`Search ${isStencilView ? "stencil" : "items"}…`}
                        className="w-full pl-7 pr-7 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/40 transition-all"
                      />
                      {(isStencilView ? stencilSearch : woSearch) && (
                        <button
                          onClick={() => isStencilView ? setStencilSearch("") : setWoSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>

                    <span className="ml-auto text-[10px] font-semibold text-[var(--primary)] bg-[var(--primary)]/8 px-2 py-0.5 rounded-full shrink-0">
                      {isStencilView ? filteredStencil.length : filteredItems.length} rows
                    </span>
                  </div>

                  {/* Horizontal scroll wrapper */}
                  <div className="overflow-x-auto">

                    {/* ── WORK ORDER VIEW ── */}
                    {!isStencilView && (
                      <table className="w-full text-xs min-w-[900px]">
                        <thead>
                          <tr className="bg-[var(--primary)]">
                            <th className="px-2 py-2.5 text-center font-bold text-white text-[10px] tracking-wide w-8 shrink-0">#</th>
                            {tableColumns.map((col) => (
                              <th key={col.key} className="px-3 py-2.5 text-center font-bold text-white text-[10px] uppercase tracking-wide whitespace-nowrap">
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                <td className="px-2 py-2.5">
                                  <div className="h-3 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
                                </td>
                                {tableColumns.map((col) => (
                                  <td key={col.key} className="px-3 py-2.5">
                                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : filteredItems.length === 0 ? (
                            <tr>
                              <td colSpan={tableColumns.length + 1} className="py-12 text-center text-slate-400 text-sm">
                                {woSearch ? `No results for "${woSearch}"` : "No items to display"}
                              </td>
                            </tr>
                          ) : (
                            filteredItems.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-2 py-2.5 text-center text-[10px] text-slate-400 font-medium">{idx + 1}</td>
                                {tableColumns.map((col) => (
                                  <td key={col.key} className="px-3 py-2.5 text-center whitespace-nowrap">
                                    {col.bold ? (
                                      <span className="font-bold text-[var(--primary)]">{clean(item[col.key]) || "—"}</span>
                                    ) : col.accent ? (
                                      <span className="font-bold text-[var(--primary)]">{item[col.key] ?? 0}</span>
                                    ) : col.numeric ? (
                                      <span className="font-semibold text-slate-700 dark:text-slate-200">{item[col.key] ?? 0}</span>
                                    ) : (
                                      <span className="text-slate-600 dark:text-slate-400">{clean(item[col.key]) || "—"}</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                        {filteredItems.length > 0 && (
                          <tfoot>
                            <tr className="bg-[var(--primary)]/6 dark:bg-blue-900/20 border-t-2 border-[var(--primary)]/20">
                              <td className="px-2 py-3 text-center" />
                              {tableColumns.map((col) => {
                                if (col.key === "category") return (
                                  <td key={col.key} className="px-3 py-3 text-center font-black text-[10px] uppercase tracking-widest text-[var(--primary)]">TOTAL</td>
                                );
                                if (col.key === "itemQty") return (
                                  <td key={col.key} className="px-3 py-3 text-center font-black text-sm text-[var(--primary)]">{filteredTotalQty}</td>
                                );
                                if (col.key === "scannedQty") return (
                                  <td key={col.key} className="px-3 py-3 text-center font-black text-sm text-[var(--primary)]">{filteredScannedQty}</td>
                                );
                                return <td key={col.key} className="px-3 py-3" />;
                              })}
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    )}

                    {/* ── STENCIL-WISE VIEW ── */}
                    {isStencilView && (
                      <table className="w-full text-xs min-w-[1100px]">
                        <thead>
                          <tr className="bg-[var(--primary)]">
                            <th className="px-2 py-2.5 text-center font-bold text-white text-[10px] tracking-wide w-8 shrink-0">#</th>
                            {stencilColumns.map((col) => (
                              <th key={col.key} className="px-3 py-2.5 text-center font-bold text-white text-[10px] uppercase tracking-wide whitespace-nowrap">
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                <td className="px-2 py-2.5">
                                  <div className="h-3 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
                                </td>
                                {stencilColumns.map((col) => (
                                  <td key={col.key} className="px-3 py-2.5">
                                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : filteredStencil.length === 0 ? (
                            <tr>
                              <td colSpan={stencilColumns.length + 1} className="py-12 text-center text-slate-400 text-sm">
                                {stencilSearch ? `No results for "${stencilSearch}"` : "No stencil data to display"}
                              </td>
                            </tr>
                          ) : (
                            filteredStencil.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-2 py-2.5 text-center text-[10px] text-slate-400 font-medium">{idx + 1}</td>
                                {stencilColumns.map((col) => (
                                  <td key={col.key} className="px-3 py-2.5 text-center whitespace-nowrap">
                                    {col.bold ? (
                                      <span className="font-bold text-[var(--primary)]">{clean(item[col.key]) || "—"}</span>
                                    ) : (
                                      <span className="text-slate-600 dark:text-slate-400">{clean(item[col.key]) || "—"}</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                        {filteredStencil.length > 0 && (
                          <tfoot>
                            <tr className="bg-[var(--primary)]/6 dark:bg-blue-900/20 border-t-2 border-[var(--primary)]/20">
                              <td className="px-2 py-3 text-center" />
                              <td className="px-3 py-3 text-center font-black text-[10px] uppercase tracking-widest text-[var(--primary)]">TOTAL</td>
                              <td colSpan={stencilColumns.length - 1} className="px-3 py-3 text-center font-black text-sm text-[var(--primary)]">
                                {filteredStencil.length} stencils
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    )}

                  </div>
                </div>
              </div>
            </div>

            {/* ── MODAL FOOTER ── */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
              <p className="text-[10px] text-slate-400">
                WO: <span className="font-bold">{FitmentDetails?.workorderno || "—"}</span>
                <span className="mx-2 text-slate-200 dark:text-slate-700">|</span>
                {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
              <div className="flex items-center gap-2">
                {onDownload && (
                  <button
                    onClick={onDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-lg transition-all active:scale-95 shadow-sm"
                  >
                    <Download size={12} />
                    Download Excel
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FitmentReportModal;