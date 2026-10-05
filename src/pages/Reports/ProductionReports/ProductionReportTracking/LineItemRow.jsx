import React from "react";
import { StatusChip, DelayedBadge, ProgressBar, formatDate, getProgress, isDelayed, HighlightText } from "./shared";

export const ROW_HEIGHT = 40;

// grid-template-columns shared by the header and every row so cells line up.
export const LINE_ITEM_GRID =
  "28px minmax(96px,110px) 76px 68px minmax(90px,104px) minmax(90px,104px) 64px minmax(110px,1fr) 48px minmax(88px,100px) 56px 128px 140px minmax(96px,110px)";

function Checkbox({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={(event) => event.stopPropagation()}
      className="h-3.5 w-3.5 cursor-pointer rounded-[3px] accent-[var(--accent)]"
    />
  );
}

function LineItemRow({ row, selected, onToggleRow, onOpenRow, style, search }) {
  return (
    <div
      role="row"
      style={{ ...style, gridTemplateColumns: LINE_ITEM_GRID }}
      onClick={() => onOpenRow(row)}
      className="grid cursor-pointer items-center gap-3 border-b border-[var(--border)] px-3 text-[12px] text-[var(--tp)] transition-colors hover:bg-[var(--hover)]"
    >
      <Checkbox checked={selected} onChange={() => onToggleRow(row.key)} />
      <span className="truncate font-mono text-[11px] text-[var(--tp)]">
        {row.hasWorkOrder ? <HighlightText text={row.workOrderNo} query={search} /> : <span className="italic text-[var(--tt)]">—</span>}
      </span>
      <span className="truncate text-[var(--ts)]">{row.config ? <HighlightText text={row.config} query={search} /> : "—"}</span>
      <span className="truncate text-[var(--ts)]">{row.category ? <HighlightText text={row.category} query={search} /> : "—"}</span>
      <span className="truncate text-[var(--ts)]">{row.brand ? <HighlightText text={row.brand} query={search} /> : "—"}</span>
      <span className="truncate text-[var(--ts)]">{row.sideWall ? <HighlightText text={row.sideWall} query={search} /> : "—"}</span>
      <span className="truncate text-[var(--ts)]">{row.tyreType ? <HighlightText text={row.tyreType} query={search} /> : "—"}</span>
      <span className="truncate text-[var(--ts)]">{row.tyreSize ? <HighlightText text={row.tyreSize} query={search} /> : "—"}</span>
      <span className="truncate text-[var(--ts)]">{row.tyreRim ?? "—"}</span>
      <span className="truncate font-mono text-[11px] text-[var(--ts)]">{row.processId ? <HighlightText text={row.processId} query={search} /> : "—"}</span>
      <span className="truncate text-[var(--ts)]">{row.plant ? <HighlightText text={row.plant} query={search} /> : "—"}</span>
      <span className="truncate">
        <StatusChip status={row.status} />
      </span>
      <ProgressBar compact percent={getProgress(row)} status={row.status} produced={row.producedQty} ordered={row.orderQty} />
      <span className="truncate whitespace-nowrap text-[11.5px] text-[var(--ts)]">
        {formatDate(row.dueDate)}
        {isDelayed(row) && <DelayedBadge />}
      </span>
    </div>
  );
}

export default React.memo(LineItemRow);
