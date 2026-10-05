import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from "lucide-react";

// Rows beyond this count switch to virtualized rendering automatically —
// keeps small/medium tables exactly as before (real DOM rows, full
// Framer Motion enter/exit) and only pays the virtualization cost when
// it's actually needed.
const VIRTUALIZE_THRESHOLD = 150;

export function DynamicDataTable({
  columns = [],
  data = [],
  loading = false,
  visibleRows = 50,
  onLoadMore,
  onRowClick,
  rowClassName,
  headerClassName,
  cellClassName,
  // Stable identity for keys/animation — defaults to old behavior for
  // callers that relied on `productKey`, but any table should pass its
  // own accessor (string field name) or a (row, index) => id function.
  rowKey = "productKey",
  // When there's no `onLoadMore` wired up (or pagination is off and the
  // dataset is just large), the table grows its own visible window as the
  // user scrolls instead of silently stalling at `visibleRows`.
  chunkSize = 50,
  // Estimated row height (px) used only in virtualized mode to compute
  // scroll math. Doesn't need to be exact — just close enough for large
  // enterprise tables (compact rows ~44-56px is typical).
  rowHeightEstimate = 52,
  // --- pagination props (all optional, default = old behavior) ---
  pagination = false,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  showSizeChanger = true,
}) {
  const listRef = useRef(null);
  const rootRef = useRef(null);

  const gridTemplate = columns.map((col) => col.width || "1fr").join(" ");

  const totalMinWidth = useMemo(() => {
    const parsed = columns.reduce((acc, col) => {
      if (!col.width) return acc + 150;
      const px = parseInt(col.width, 10);
      return acc + (isNaN(px) ? 150 : px);
    }, 0);
    return Math.max(parsed + columns.length * 16, 800);
  }, [columns]);

  const safeData = Array.isArray(data) ? data : [];

  const getRowKey = useCallback(
    (row, index) =>
      typeof rowKey === "function" ? rowKey(row, index) : row[rowKey] ?? index,
    [rowKey]
  );

  // --- pagination state (only used when pagination=true) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  // Internal growing window — replaces reliance on an external onLoadMore
  // actually updating a `visibleRows` prop. Resets whenever the dataset
  // or the starting visibleRows prop changes.
  const [loadedCount, setLoadedCount] = useState(visibleRows);
  useEffect(() => {
    setLoadedCount(visibleRows);
  }, [visibleRows, safeData.length]);

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

  // Non-paginated "window" of data actually available to render/scroll
  // through — grows on scroll via loadedCount instead of stalling at the
  // original static `visibleRows` slice.
  const windowedData = useMemo(() => {
    if (pagination) return pagedData;
    return safeData.slice(0, Math.min(loadedCount, safeData.length));
  }, [pagination, pagedData, safeData, loadedCount]);

  const shouldVirtualize = !pagination && windowedData.length > VIRTUALIZE_THRESHOLD;
  const disableAnimation = windowedData.length > 300 || shouldVirtualize;

  // --- virtualization (desktop table only — mobile card view assumes
  // smaller working sets, e.g. paginated or filtered lists) ---
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    setViewportHeight(node.clientHeight || 600);
  }, [shouldVirtualize]);

  const overscan = 8;
  const virtualRange = useMemo(() => {
    if (!shouldVirtualize) return { start: 0, end: windowedData.length };
    const visibleCount = Math.ceil(viewportHeight / rowHeightEstimate);
    const start = Math.max(0, Math.floor(scrollTop / rowHeightEstimate) - overscan);
    const end = Math.min(windowedData.length, start + visibleCount + overscan * 2);
    return { start, end };
  }, [shouldVirtualize, scrollTop, viewportHeight, rowHeightEstimate, windowedData.length]);

  const renderData = shouldVirtualize
    ? windowedData.slice(virtualRange.start, virtualRange.end)
    : windowedData;

  const handleScroll = (e) => {
    const { scrollTop: st, scrollHeight, clientHeight } = e.currentTarget;

    if (shouldVirtualize) setScrollTop(st);

    if (pagination) return;

    // Auto-grow the window before falling back to the external hook, so
    // scrolling never silently "does nothing" past the initial slice.
    if (scrollHeight - st - clientHeight < 200 && loadedCount < safeData.length) {
      setLoadedCount((n) => Math.min(n + chunkSize, safeData.length));
    }

    if (scrollHeight - st - clientHeight < 50) {
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
    exit: { opacity: 0, y: -8 },
  };

  const SkeletonRow = () => (
    <div
      className="grid gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 py-2 sm:py-3 items-center mb-2 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm animate-pulse"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {columns.map((_, idx) => (
        <div key={idx} className="h-3 bg-slate-200 dark:bg-slate-700 rounded shadow-sm" />
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[0.6rem] sm:text-[0.75rem] shrink-0">
        <div className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap order-3 sm:order-1 truncate">
          {totalRecords === 0
            ? "No records found"
            : `${startRecord.toLocaleString()}-${endRecord.toLocaleString()} of ${totalRecords.toLocaleString()}`}
          <span className="hidden sm:inline"> records</span>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 order-1 sm:order-2 shrink-0">
          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center min-w-[18px] min-h-[18px] md:min-w-0 md:min-h-0 sm:w-auto sm:h-auto shrink-0 sm:p-1.5 rounded sm:rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="First page"
          >
            <ChevronsLeft className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center gap-0 sm:gap-1 min-w-[18px] min-h-[18px] md:min-w-0 md:min-h-0 sm:w-auto sm:h-auto shrink-0 sm:px-2 sm:py-1.5 rounded sm:rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-semibold"
          >
            <ChevronLeft className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-0.5 sm:gap-1 mx-0 sm:mx-1">
            {getPageNumbers().map((p, idx) =>
              typeof p === "number" ? (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={`flex items-center justify-center min-w-[18px] min-h-[18px] md:min-w-0 md:min-h-0 sm:w-auto sm:h-auto text-[0.6rem] sm:text-[0.75rem] sm:px-2 sm:py-1.5 rounded sm:rounded-md font-semibold transition-colors shrink-0 ${
                    p === currentPage
                      ? "bg-blue-500 text-white shadow-sm"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span
                  key={p + idx}
                  className="flex items-center justify-center min-w-[18px] min-h-[18px] md:min-w-0 md:min-h-0 sm:w-auto sm:h-auto sm:px-1 text-[0.6rem] sm:text-[0.75rem] text-slate-400 select-none shrink-0"
                >
                  ...
                </span>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center gap-0 sm:gap-1 min-w-[18px] min-h-[18px] md:min-w-0 md:min-h-0 sm:w-auto sm:h-auto shrink-0 sm:px-2 sm:py-1.5 rounded sm:rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-semibold"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center min-w-[18px] min-h-[18px] md:min-w-0 md:min-h-0 sm:w-auto sm:h-auto shrink-0 sm:p-1.5 rounded sm:rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Last page"
          >
            <ChevronsRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {showSizeChanger && (
          <div className="flex items-center gap-1 sm:gap-2 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap order-2 sm:order-3">
            <span className="hidden sm:inline">Rows per page:</span>
            <span className="sm:hidden">Rows:</span>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {pageSizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleRowsPerPageChange(size)}
                  className={`flex items-center justify-center min-w-[18px] min-h-[18px] md:min-w-0 md:min-h-0 px-1 sm:px-2 sm:py-1 text-[0.6rem] sm:text-[0.75rem] rounded sm:rounded-md font-semibold transition-colors ${
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
            role="cell"
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

  const baseRowClasses = (row) => {
    const card =
      "rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 hover:-translate-y-0.1";
    const clickable = onRowClick ? "cursor-pointer" : "";
    return rowClassName ? `${rowClassName(row)} ${card} ${clickable}` : `${card} ${clickable}`;
  };

  // Rows above the virtualization threshold render as plain divs, keyed
  // by real identity, absolutely offset so the scroll container thinks
  // it holds the full dataset even though only a slice is mounted.
  const virtualTopOffset = shouldVirtualize ? virtualRange.start * rowHeightEstimate : 0;
  const virtualTotalHeight = shouldVirtualize ? windowedData.length * rowHeightEstimate : null;

  return (
    <div
      ref={rootRef}
      className="flex flex-col w-full h-full min-h-0 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 shadow-sm overflow-hidden"
    >
      {/* --- DESKTOP / TABLET TABLE VIEW --- */}
      <div className="hidden md:flex flex-1 flex-col min-h-0 overflow-hidden">
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 min-h-[380px] overflow-auto custom-scrollbar bg-slate-50/40 dark:bg-slate-900/20"
        >
          <div style={{ minWidth: totalMinWidth }} className="p-2 md:p-3">
            <div
              role="row"
              className={`${headerClassName || ""} grid gap-2 sm:gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 mb-2 rounded-xl border-b border-slate-200 dark:border-slate-700 z-20 text-[0.65rem] md:text-[0.7rem] font-bold uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-800 dark:text-slate-50 shadow-sm`}
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  role="columnheader"
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

            {loading ? (
              <div>
                {[...Array(10)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : (
              <>
                {shouldVirtualize ? (
                  // Virtualized: fixed-height spacer keeps scrollbar length
                  // correct; only the visible slice + overscan is mounted,
                  // shifted into place with a translateY offset.
                  <div style={{ position: "relative", height: virtualTotalHeight }}>
                    <div style={{ transform: `translateY(${virtualTopOffset}px)` }}>
                      {renderData.map((row, i) => (
                        <div
                          key={getRowKey(row, virtualRange.start + i)}
                          role="row"
                          onClick={() => onRowClick?.(row)}
                          className={`grid gap-2 sm:gap-3 md:gap-4 px-4 md:px-6 py-2 md:py-3 items-center mb-2 ${baseRowClasses(row)}`}
                          style={{ gridTemplateColumns: gridTemplate, minHeight: rowHeightEstimate }}
                        >
                          {renderRowCells(row)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : disableAnimation ? (
                  renderData.map((row, rowIndex) => (
                    <div
                      key={getRowKey(row, rowIndex)}
                      role="row"
                      onClick={() => onRowClick?.(row)}
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
                        key={getRowKey(row, rowIndex)}
                        role="row"
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        whileHover={{ y: -1 }}
                        onClick={() => onRowClick?.(row)}
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

        <PaginationBar />
      </div>

      {/* --- MOBILE / SMALL-SCREEN CARD VIEW --- */}
      <div className="md:hidden flex flex-col flex-1 min-h-0 overflow-hidden">
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50/50 dark:bg-slate-900/50"
        >
          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 sm:h-32 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {renderData.map((row, rowIndex) => (
                  <motion.div
                    key={getRowKey(row, rowIndex)}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={() => onRowClick?.(row)}
                    className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm active:scale-[0.98] transition-transform ${onRowClick ? "cursor-pointer" : ""}`}
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
                              {col.render ? col.render(value, row) : (value ?? "—")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {safeData.length === 0 && (
                <div className="py-16 sm:py-20 text-center text-slate-400 text-sm">No records found.</div>
              )}

              {!pagination && loadedCount < safeData.length && (
                <div className="py-3 sm:py-4 text-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    Loading more...
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <PaginationBar />
      </div>
    </div>
  );
}