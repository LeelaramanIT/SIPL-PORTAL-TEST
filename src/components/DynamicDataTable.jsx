import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  // --- SKELETON ROW HELPER ---
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
    <div className={`flex flex-col w-full h-full min-h-[400px] overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm`}>
      {/* --- FIXED HEADER --- */}
      <div
        className={`${headerClassName} grid gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-700 backdrop-blur-md z-20 text-[0.7rem] font-bold uppercase tracking-wider sticky top-0`}
        style={{
          gridTemplateColumns: gridTemplate,
          width: "100%",
        }}
      >
        {columns.map((col, idx) => (
          <div
            key={idx}
            title={col.title || col.header}
            className={`truncate cursor-help ${
              col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
            }`}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* --- SCROLLABLE BODY --- */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="overflow-y-auto overflow-x-hidden flex-1 p-2 space-y-2 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/20"
      >
        {loading ? (
          /* --- INITIAL LOADING SKELETON --- */
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
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
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileHover={{ y: -1, scale: 1.002 }}
                  className={`grid gap-4 px-4 py-3 items-center rounded-lg border transition-all shadow-sm hover:shadow-md ${
                    rowClassName
                      ? rowClassName(row)
                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900"
                  }`}
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {columns.map((col, colIndex) => {
                    const value = row[col.accessor];
                    return (
                      <div
                        key={colIndex}
                        title={typeof value === "string" || typeof value === "number" ? value : ""}
                        className={`text-[0.8rem] text-slate-700 dark:text-slate-300 font-medium truncate ${
                          col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
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

            {/* --- LOAD MORE SKELETON --- */}
            {visibleRows < data.length && (
              <div className="space-y-2 mt-2">
                <SkeletonRow />
                <div className="py-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    Loading more records...
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}