import React, { useMemo, useState } from "react";
import LineItemRow, { ROW_HEIGHT, LINE_ITEM_GRID } from "./LineItemRow";
import { fmt } from "./shared";

// Above this count we window the rows instead of mounting every DOM node.
const VIRTUALIZE_THRESHOLD = 20;
const MAX_VIEWPORT_HEIGHT = 420;
const OVERSCAN = 6;

const COLUMN_LABELS = [
  "", "Work Order", "Config", "Category", "Brand", "Sidewall", "Tyre Type", "Tyre Size", "Rim", "Process ID",
  "Plant", "Status", "Progress", "Due Date",
];

function ListHeader() {
  return (
    <div
      role="row"
      style={{ gridTemplateColumns: LINE_ITEM_GRID }}
      className="sticky top-0 z-10 grid items-center gap-3 border-b border-[var(--border)] bg-[var(--card-2)] px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--tt)]"
    >
      {COLUMN_LABELS.map((label, index) => (
        <span key={index} className="truncate">{label}</span>
      ))}
    </div>
  );
}

// Fixed-height windowing: only the rows in view (+ overscan) are mounted.
// Rows above/below are represented by two spacer divs so scrollbar size stays correct.
function VirtualizedRows({ rows, selectedIds, onToggleRow, onOpenRow, search }) {
  const [scrollTop, setScrollTop] = useState(0);
  const viewportHeight = Math.min(rows.length * ROW_HEIGHT, MAX_VIEWPORT_HEIGHT);

  const { startIndex, endIndex } = useMemo(() => {
    const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT);
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const end = Math.min(rows.length, start + visibleCount + OVERSCAN * 2);
    return { startIndex: start, endIndex: end };
  }, [scrollTop, viewportHeight, rows.length]);

  const visibleRows = rows.slice(startIndex, endIndex);

  return (
    <div
      className="overflow-y-auto overflow-x-hidden"
      style={{ height: viewportHeight }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: rows.length * ROW_HEIGHT, position: "relative" }}>
        {visibleRows.map((row, i) => (
          <LineItemRow
            key={row.key}
            row={row}
            selected={selectedIds.has(row.key)}
            onToggleRow={onToggleRow}
            onOpenRow={onOpenRow}
            search={search}
            style={{ position: "absolute", top: (startIndex + i) * ROW_HEIGHT, left: 0, right: 0, height: ROW_HEIGHT }}
          />
        ))}
      </div>
    </div>
  );
}

function PlainRows({ rows, selectedIds, onToggleRow, onOpenRow, search }) {
  const viewportHeight = Math.min(rows.length * ROW_HEIGHT, MAX_VIEWPORT_HEIGHT);
  return (
    <div className="overflow-y-auto" style={{ maxHeight: viewportHeight }}>
      {rows.map((row) => (
        <LineItemRow
          key={row.key}
          row={row}
          selected={selectedIds.has(row.key)}
          onToggleRow={onToggleRow}
          onOpenRow={onOpenRow}
          search={search}
          style={{ height: ROW_HEIGHT }}
        />
      ))}
    </div>
  );
}

function LineItemsList({ rows, selectedIds, onToggleRow, onOpenRow, search }) {
  const totalQty = useMemo(() => rows.reduce((sum, row) => sum + row.orderQty, 0), [rows]);
  const shouldVirtualize = rows.length > VIRTUALIZE_THRESHOLD;

  return (
    <div className="ml-[68px] border-b border-l border-[var(--border)]">
      <div className="flex items-center gap-4 border-b border-[var(--border)] bg-[var(--card-2)] px-3 py-1.5 text-[10.5px] text-[var(--ts)]">
        <span>
          Line Items <b className="text-[var(--tp)]">{fmt(rows.length)}</b>
        </span>
        <span>
          Total Qty <b className="text-[var(--tp)]">{fmt(totalQty)}</b>
        </span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 1280 }}>
          <ListHeader />
          {shouldVirtualize ? (
            <VirtualizedRows rows={rows} selectedIds={selectedIds} onToggleRow={onToggleRow} onOpenRow={onOpenRow} search={search} />
          ) : (
            <PlainRows rows={rows} selectedIds={selectedIds} onToggleRow={onToggleRow} onOpenRow={onOpenRow} search={search} />
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(LineItemsList);
