import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from "lucide-react";

export function DynamicDataTable({
  columns = [],
  data = [],
  loading = false,
  visibleRows = 50,
  onLoadMore,
  rowClassName,
  headerClassName,
  cellClassName,
  // --- pagination props (all optional, default = old behavior) ---
  pagination = false,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  showSizeChanger = true,
}) {
  const listRef = useRef(null);
  const rootRef = useRef(null); // watches the table's own box for real resizes

  const gridTemplate = columns.map((col) => col.width || "1fr").join(" ");

  // Compute the minimum table width from explicit column widths.
  const totalMinWidth = useMemo(() => {
    const parsed = columns.reduce((acc, col) => {
      if (!col.width) return acc + 150;
      const px = parseInt(col.width, 10);
      return acc + (isNaN(px) ? 150 : px);
    }, 0);
    return Math.max(parsed + columns.length * 16, 800);
  }, [columns]);
  const safeData = Array.isArray(data) ? data : [];

  // --- pagination state (only used when pagination=true) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  // Forces a legitimate re-render whenever the table's actual container box
  // changes size (sidebar collapse/expand, viewport resize, orientation
  // change, etc). This is a normal state update, not a remount or a
  // dispatched DOM event — it just keeps the component honest about its
  // real current size so nothing (now or added later) can go stale.
  const [, forceReflow] = useState(0);
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      forceReflow((n) => n + 1);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (pagination) setCurrentPage(1);
  }, [safeData, pagination]);

  useEffect(() => {
    setRowsPerPage(pageSize);
  }, [pageSize]);

  const totalRecords = safeData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));

  useEffect(() => {
    if (pagination && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [pagination, currentPage, totalPages]);

  const pagedData = useMemo(() => {
    if (!pagination) return safeData;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return safeData.slice(start, end);
  }, [pagination, safeData, currentPage, rowsPerPage]);

  const renderData = pagination ? pagedData : safeData.slice(0, visibleRows);
  const disableAnimation = renderData.length > 300;

  const handleScroll = (e) => {
    if (pagination) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      onLoadMore?.();
    }
  };

  const goToPage = useCallback(
    (page) => {
      const clamped = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(clamped);
      listRef.current?.scrollTo?.({ top: 0, behavior: "smooth" });
    },
    [totalPages]
  );

  const handleRowsPerPageChange = (size) => {
    setRowsPerPage(size);
    setCurrentPage(1);
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 },
  };

  // Card-style skeleton row to match the restored card rows below.
  // Padding/gap scale with breakpoint just like the real rows so the
  // loading state doesn't visually "jump" once real data renders.
  const SkeletonRow = () => (
    <div
      className="grid gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 py-2 sm:py-3 items-center mb-2 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm animate-pulse"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {columns.map((_, idx) => (
        <div
          key={idx}
          className="h-3 bg-slate-200 dark:bg-slate-700 rounded shadow-sm"
        />
      ))}
    </div>
  );

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    pages.push(1);
    if (range[0] > 2) pages.push("ellipsis-start");
    pages.push(...range);
    if (range[range.length - 1] < totalPages - 1) pages.push("ellipsis-end");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const PaginationBar = () => {
    if (!pagination) return null;

    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[0.7rem] sm:text-[0.75rem] shrink-0">
        <div className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap order-3 sm:order-1">
          {totalRecords === 0
            ? "No records found"
            : `Showing ${startRecord.toLocaleString()}-${endRecord.toLocaleString()} of ${totalRecords.toLocaleString()} records`}
        </div>

        <div className="flex items-center gap-1 order-1 sm:order-2">
          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="p-2 sm:p-1.5 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="First page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-2 py-2 sm:py-1.5 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((p, idx) =>
              typeof p === "number" ? (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={`min-w-[30px] sm:min-w-[28px] px-2 py-2 sm:py-1.5 rounded-md font-semibold transition-colors ${
                    p === currentPage
                      ? "bg-blue-500 text-white shadow-sm"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span key={p + idx} className="px-1 text-slate-400 select-none">
                  ...
                </span>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-2 py-2 sm:py-1.5 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-semibold"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 sm:p-1.5 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Last page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {showSizeChanger && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap order-2 sm:order-3">
            <span className="hidden xs:inline">Rows per page:</span>
            <span className="xs:hidden">Rows:</span>
            <div className="flex items-center gap-1">
              {pageSizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleRowsPerPageChange(size)}
                  className={`px-2 py-1.5 sm:py-1 rounded-md font-semibold transition-colors ${
                    size === rowsPerPage
                      ? "bg-blue-500 text-white shadow-sm"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRowCells = (row) => (
    <>
      {columns.map((col, colIndex) => {
        const value = row[col.accessor];
        return (
          <div
            key={colIndex}
            className={`${cellClassName || ""} truncate text-[0.65rem] sm:text-[0.7rem] md:text-[0.75rem] text-slate-700 dark:text-slate-300 font-medium ${
              col.align === "right"
                ? "text-right"
                : col.align === "center"
                  ? "text-center"
                  : "text-left"
            }`}
          >
            {col.render ? col.render(value, row) : (value ?? "-")}
          </div>
        );
      })}
    </>
  );

  // --- RESTORED CARD LOOK ---
  // Rounded corners + border + shadow-sm (hover:shadow-md), same as the old
  // design. Spacing between rows comes ONLY from a vertical margin (mb-2) —
  // never from horizontal padding/margin — so every row stays exactly the
  // same width as the sticky header and the grid columns keep lining up.
  const baseRowClasses = (row) => {
    const card =
      "rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 hover:-translate-y-0.1";
    return rowClassName ? `${rowClassName(row)} ${card}` : card;
  };

  return (
    <div
      ref={rootRef}
      className="flex flex-col w-full h-full min-h-[400px] border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 shadow-sm overflow-hidden"
    >
      {/* --- DESKTOP / TABLET TABLE VIEW ---
          Single scroll container for BOTH axes so the sticky header always
          scrolls horizontally in lockstep with the body. Padding, gap, and
          font size all scale up gradually from tablet (md) through large
          monitors (lg/xl) instead of a single fixed size, while narrow
          content still relies on the horizontal scroll + minWidth. */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden">
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto custom-scrollbar bg-slate-50/40 dark:bg-slate-900/20"
        >
          <div style={{ minWidth: totalMinWidth }} className="p-2 md:p-3">
            {/* HEADER — sticky vertically, same horizontal padding/width as every row below it */}
            <div
              className={`${headerClassName || ""} grid gap-2 sm:gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 mb-2 rounded-xl border-b border-slate-200 dark:border-slate-700 z-20 text-[0.65rem] md:text-[0.7rem] font-bold uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-800 dark:text-slate-50 shadow-sm`}
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  title={col.title || col.header}
                  className={`whitespace-normal break-words leading-tight ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                >
                  {col.header}
                </div>
              ))}
            </div>

            {/* BODY — card rows, spaced with mb-2 (vertical only) */}
            {loading ? (
              <div>
                {[...Array(10)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : (
              <>
                {disableAnimation ? (
                  renderData.map((row, rowIndex) => (
                    <div
                      key={row.productKey || rowIndex}
                      className={`grid gap-2 sm:gap-3 md:gap-4 px-4 md:px-6 py-2 md:py-3 items-center mb-2 transition-all ${baseRowClasses(row)}`}
                      style={{ gridTemplateColumns: gridTemplate }}
                    >
                      {renderRowCells(row)}
                    </div>
                  ))
                ) : (
                  <AnimatePresence initial={false}>
                    {renderData.map((row, rowIndex) => (
                      <motion.div
                        key={row.productKey || rowIndex}
                        // No `layout` here: it was creating a stale FLIP
                        // transform on these CSS-Grid rows that only got
                        // cleared on a real re-render, so a row appeared
                        // "frozen" at its old width whenever an ancestor
                        // (e.g. the sidebar) resized without touching this
                        // component's own render cycle. The enter/exit
                        // animation below doesn't need `layout` at all.
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        whileHover={{ y: -1 }}
                        className={`grid gap-2 sm:gap-3 md:gap-4 px-4 py-2 md:py-3 items-center mb-2 transition-all ${baseRowClasses(row)}`}
                        style={{ gridTemplateColumns: gridTemplate }}
                      >
                        {renderRowCells(row)}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {safeData.length === 0 && (
                  <div className="py-16 md:py-20 text-center text-slate-400 text-[0.75rem] md:text-[0.8rem]">
                    No records found.
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* pagination bar (desktop/tablet) */}
        <PaginationBar />
      </div>

      {/* --- MOBILE / SMALL-SCREEN CARD VIEW ---
          Secondary-field grid drops to a single column on very small
          phones and expands to two columns from the sm breakpoint (small
          tablets / phablets) up, so text never gets squeezed on the
          smallest screens. Padding and type scale similarly. */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50/50 dark:bg-slate-900/50"
        >
          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 sm:h-32 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {renderData.map((row, rowIndex) => (
                  <motion.div
                    key={row.productKey || rowIndex}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    // No `layout` here either — these cards don't reorder
                    // in place, so there's nothing for FLIP to legitimately
                    // animate, only stale-transform risk to avoid.
                    className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                          {columns[0]?.header}
                        </span>
                        <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-tight truncate">
                          {columns[0]?.render
                            ? columns[0].render(row[columns[0].accessor], row)
                            : (row[columns[0].accessor] ?? "-")}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 shrink-0 ml-2" />
                    </div>

                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-2">
                      {columns.slice(1).map((col, colIndex) => {
                        const value = row[col.accessor];
                        return (
                          <div key={colIndex} className="flex flex-col min-w-0">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                              {col.header}
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                              {col.render
                                ? col.render(value, row)
                                : (value ?? "—")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {safeData.length === 0 && (
                <div className="py-16 sm:py-20 text-center text-slate-400 text-sm">
                  No records found.
                </div>
              )}

              {!pagination && visibleRows < safeData.length && (
                <div className="py-3 sm:py-4 text-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    Loading more...
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* pagination bar (mobile) */}
        <PaginationBar />
      </div>
    </div>
  );
}