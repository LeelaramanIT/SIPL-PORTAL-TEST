import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import WorkOrderGroupRow, { WorkOrderGroupHeader } from "./WorkOrderGroupRow";
import { StatusChip, DelayedBadge, ProgressBar, formatDate, Checkbox, HighlightText, buildWorkOrders } from "./shared";

function groupCell(group, key) {
  if (key === "status") return <StatusChip status={group.status} />;
  if (key === "workOrderCount") {
    return (
      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-[4px] bg-[var(--accent-soft)] px-1.5 font-mono text-[11px] font-bold text-[var(--accent)]">
        {group.workOrderCount}
      </span>
    );
  }
  if (key === "progress") {
    return (
      <ProgressBar
        percent={group.progress}
        status={group.status}
        produced={group.producedQty}
        ordered={group.orderQty}
      />
    );
  }
  if (key === "dueDate") {
    return (
      <span className="whitespace-nowrap text-[var(--ts)]">
        {formatDate(group.dueDate)}
        {group.isDelayed && <DelayedBadge />}
      </span>
    );
  }
  if (key === "orderDate") return <span className="text-[var(--ts)]">{formatDate(group.orderDate)}</span>;
  const value = group.shared[key];
  return <span className="text-[var(--ts)]">{value == null || value === "" ? "—" : value}</span>;
}

function OrderGroupRow({
  group,
  columns,
  expanded,
  index,
  onToggleExpand,
  selectedIds,
  onToggleGroup,
  onToggleRow,
  onOpenRow,
  search,
}) {
  const childKeys = group.rows.map((row) => row.key);
  const selectedCount = childKeys.filter((key) => selectedIds.has(key)).length;
  const allSelected = selectedCount === childKeys.length;

  // The per-work-order aggregation (Map grouping + reduces + sort + Set) is real
  // cost, so it's computed here — lazily, only for an order the user actually
  // expands — instead of upfront for every order in the result set.
  const workOrders = useMemo(
    () => (expanded ? buildWorkOrders(group.rows) : null),
    [expanded, group.rows]
  );

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.3) }}
        onClick={() => onToggleExpand(group.orderRefNo)}
        className="group h-11 cursor-pointer border-b border-[var(--border)] bg-[var(--card)] transition-colors hover:bg-[var(--hover)]"
      >
        <td className="sticky left-0 z-10 w-[68px] bg-[var(--card)] px-3 transition-colors group-hover:bg-[var(--hover)]">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex text-[var(--tt)] group-hover:text-[var(--accent)]"
            >
              <ChevronRight size={14} />
            </motion.span>
            <Checkbox
              checked={allSelected}
              indeterminate={selectedCount > 0}
              onChange={() => onToggleGroup(childKeys, !allSelected)}
            />
          </div>
        </td>

        {columns.map((column, columnIndex) => (
          <td
            key={column.key}
            className={`px-3 text-[13px] text-[var(--tp)] ${
              columnIndex === 0
                ? "sticky left-[68px] z-10 bg-[var(--card)] transition-colors group-hover:bg-[var(--hover)]"
                : ""
            }`}
          >
            {column.key === "orderRefNo" ? (
              <span className="font-mono text-[12px] font-semibold text-[var(--accent)]">
                <HighlightText text={group.orderRefNo} query={search} />
              </span>
            ) : column.key === "customerName" ? (
              <div className="font-medium leading-tight"><HighlightText text={group.customerName} query={search} /></div>
            ) : (
              groupCell(group, column.key)
            )}
          </td>
        ))}
      </motion.tr>

      <tr>
        <td colSpan={columns.length + 1} className="p-0">
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden bg-[var(--card-2)]"
              >
                <div className="ml-[68px] border-b border-l border-[var(--border)]">
                  <WorkOrderGroupHeader count={group.workOrderCount} />
                  {workOrders?.map((workOrder) => (
                    <WorkOrderGroupRow
                      key={workOrder.workOrderNo}
                      workOrder={workOrder}
                      selectedIds={selectedIds}
                      onToggleGroup={onToggleGroup}
                      onToggleRow={onToggleRow}
                      onOpenRow={onOpenRow}
                      search={search}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </td>
      </tr>
    </>
  );
}

export default React.memo(OrderGroupRow);
