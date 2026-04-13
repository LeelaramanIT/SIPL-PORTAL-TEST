import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

export function DynamicDataTable({
  columns = [],
  data = [],
  loading = false,
  visibleRows = 50,
  onLoadMore,
  rowClassName,
  headerClassName,
  cellClassName,
}) {
  const listRef = useRef(null);
  const gridTemplate = columns.map((col) => col.width || "1fr").join(" ");

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      onLoadMore?.();
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const SkeletonRow = () => (
    <div
      className="grid gap-4 px-4 py-3 items-center rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 animate-pulse"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {columns.map((_, idx) => (
        <div key={idx} className="h-3 bg-slate-200 dark:bg-slate-700 rounded shadow-sm" />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full min-h-[400px] border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 shadow-sm overflow-hidden">

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:flex flex-1 overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] lg:min-w-full flex flex-col h-full">
          {/* FIXED HEADER */}
          <div
            className={`${headerClassName} grid gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-700 backdrop-blur-md z-20 text-[0.7rem] font-bold uppercase tracking-wider sticky top-0 dark:bg-slate-800/80 dark:text-slate-50`}
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {columns.map((col, idx) => (
              <div
                key={idx}
                title={col.title || col.header}
                className={`whitespace-normal break-words leading-tight ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  }`}
              >
                {col.header}
              </div>
            ))}
          </div>

          {/* SCROLLABLE BODY */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-2 bg-slate-50/30 dark:bg-slate-900/20"
          >
            {loading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {data.slice(0, visibleRows).map((row, rowIndex) => (
                    <motion.div
                      key={row.productKey || rowIndex}
                      layout
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      whileHover={{ y: -1, scale: 1.001 }}
                      className={`grid gap-4 px-4 py-3 items-center rounded-lg border transition-all shadow-sm hover:shadow-md ${rowClassName ? rowClassName(row) : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900"
                        }`}
                      style={{ gridTemplateColumns: gridTemplate }}
                    >
                      {columns.map((col, colIndex) => {
                        const value = row[col.accessor];
                        return (
                          <div
                            key={colIndex}
                            className={`${cellClassName} text-[0.7rem] text-slate-700 dark:text-slate-300 font-medium break-all ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                              }`}
                          >
                            {col.render ? col.render(value, row) : value ?? "-"}
                          </div>
                        );
                      })}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {data.length === 0 && (
                  <div className="py-20 text-center text-slate-400 text-[0.8rem]">No records found.</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- MODERN MOBILE CARD VIEW --- */}
      <div
        onScroll={handleScroll}
        className="md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50"
      >
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {data.slice(0, visibleRows).map((row, rowIndex) => (
                <motion.div
                  key={row.productKey || rowIndex}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 shadow-sm active:scale-[0.98] transition-transform"
                >
                  {/* MOBILE HEADER: Uses the first column as the title */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                        {columns[0]?.header}
                      </span>
                      <div className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
                        {columns[0]?.render
                          ? columns[0].render(row[columns[0].accessor], row)
                          : row[columns[0].accessor] ?? "-"}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>

                  {/* MOBILE GRID: Remainder of the columns */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    {columns.slice(1).map((col, colIndex) => {
                      const value = row[col.accessor];
                      return (
                        <div key={colIndex} className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                            {col.header}
                          </span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {col.render ? col.render(value, row) : value ?? "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {data.length === 0 && (
              <div className="py-20 text-center text-slate-400 text-sm">No records found.</div>
            )}

            {/* LOAD MORE INDICATOR */}
            {visibleRows < data.length && (
              <div className="py-4 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                  Loading more...
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}