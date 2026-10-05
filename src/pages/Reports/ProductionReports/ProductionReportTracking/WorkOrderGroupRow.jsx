import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import LineItemsList from "./LineItemsList";
import { StatusChip, DelayedBadge, ProgressBar, formatDate, Checkbox, fmt, HighlightText } from "./shared";

// Expand state lives locally per work order (not lifted to the parent) so opening
// one work order never re-renders the rest of the order's work-order list.
function WorkOrderGroupRow({ workOrder, selectedIds, onToggleGroup, onToggleRow, onOpenRow, search }) {
  const [expanded, setExpanded] = useState(false);

  const childKeys = workOrder.rows.map((row) => row.key);
  const selectedCount = childKeys.filter((key) => selectedIds.has(key)).length;
  const allSelected = selectedCount === childKeys.length;
  const itemCount = workOrder.rows.length;

  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <div
        onClick={() => setExpanded((current) => !current)}
        className="flex cursor-pointer flex-wrap items-center gap-3 bg-[var(--card)] py-2 pl-3 pr-3 transition-colors hover:bg-[var(--hover)]"
      >
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex text-[var(--tt)]"
        >
          <ChevronRight size={13} />
        </motion.span>

        <Checkbox
          checked={allSelected}
          indeterminate={selectedCount > 0}
          onChange={() => onToggleGroup(childKeys, !allSelected)}
        />

        <span className={`font-mono text-[12px] font-semibold ${workOrder.hasWorkOrder ? "text-[var(--tp)]" : "italic text-[var(--tt)]"}`}>
          {workOrder.hasWorkOrder ? <HighlightText text={workOrder.workOrderNo} query={search} /> : "No work order no."}
        </span>

        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-[4px] bg-[var(--accent-soft)] px-1.5 font-mono text-[10px] font-bold text-[var(--accent)]">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </span>

        <StatusChip status={workOrder.status} />

        <ProgressBar compact percent={workOrder.progress} status={workOrder.status}
          produced={workOrder.producedQty} ordered={workOrder.orderQty} />

        <span className="text-[11px] text-[var(--ts)]">{workOrder.plant}</span>

        <span className="ml-auto whitespace-nowrap text-[11px] text-[var(--ts)]">
          {formatDate(workOrder.dueDate)}
          {workOrder.isDelayed && <DelayedBadge />}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden bg-[var(--bg)]"
          >
            <LineItemsList
              rows={workOrder.rows}
              selectedIds={selectedIds}
              onToggleRow={onToggleRow}
              onOpenRow={onOpenRow}
              search={search}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default React.memo(WorkOrderGroupRow);

export function WorkOrderGroupHeader({ count }) {
  return (
    <div className="flex items-center gap-4 border-b border-[var(--border)] bg-[var(--card-2)] px-3 py-1.5 text-[10.5px] text-[var(--ts)]">
      <span>
        Work Orders <b className="text-[var(--tp)]">{fmt(count)}</b>
      </span>
    </div>
  );
}
