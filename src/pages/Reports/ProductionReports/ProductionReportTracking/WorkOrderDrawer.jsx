import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { StatusChip, DelayedBadge, getStatusColor, formatDate, getProgress, isDelayed, fmt } from "./shared";

function Field({ label, value, mono }) {
  const display = value == null || value === "" ? "—" : value;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--tt)]">{label}</div>
      <div className={`mt-0.5 text-[13px] text-[var(--tp)] ${mono ? "font-mono" : ""}`}>{display}</div>
    </div>
  );
}

export default function WorkOrderDrawer({ row, onClose }) {
  return (
    <AnimatePresence>
      {row && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-[480px] max-w-full flex-col border-l border-[var(--border)] bg-[var(--card)]"
          >
            <header className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <div className="font-mono text-[16px] font-bold tracking-tight text-[var(--tp)]">
                  {row.hasWorkOrder ? row.workOrderNo : <span className="italic text-[var(--tt)]">No work order no.</span>}
                </div>
                <div className="mt-0.5 text-[12px] text-[var(--ts)]">{row.customerName}</div>
                <div className="mt-2.5 flex items-center">
                  <StatusChip status={row.status} />
                  {isDelayed(row) && <DelayedBadge />}
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ts)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--tp)]"
              >
                <X size={16} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ProgressBlock row={row} />

              <SectionTitle>Order</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Order Ref" value={row.orderRefNo} mono />
                <Field label="Plant" value={row.plant} />
                <Field label="Region" value={row.region} />
                <Field label="Process ID" value={row.processId} mono />
                <Field label="Order Date" value={formatDate(row.orderDate)} />
                <Field label="Due Date" value={formatDate(row.dueDate)} />
              </div>

              <SectionTitle>Ownership</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Lead" value={row.lead} />
                <Field label="Manager" value={row.manager} />
              </div>

              <SectionTitle>Product Specification</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Category" value={row.category} />
                <Field label="Config" value={row.config} />
                <Field label="Brand" value={row.brand} />
                <Field label="Sidewall" value={row.sideWall} />
                <Field label="Tyre Type" value={row.tyreType} />
                <Field label="Tyre Size" value={row.tyreSize} />
                <Field label="Rim" value={row.tyreRim ?? null} />
                <Field label="Finished Weight" value={row.finishedWt != null ? `${fmt(row.finishedWt)} kg` : null} />
              </div>

              <SectionTitle>Quantities</SectionTitle>
              <div className="grid grid-cols-3 gap-x-4 gap-y-4 rounded-xl border border-[var(--border)] bg-[var(--card-2)] p-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--tt)]">Ordered</div>
                  <div className="mt-0.5 font-mono text-[15px] font-semibold tabular-nums text-[var(--tp)]">{fmt(row.orderQty)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--tt)]">Produced</div>
                  <div className="mt-0.5 font-mono text-[15px] font-semibold tabular-nums text-[var(--tp)]">{fmt(row.producedQty)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--tt)]">Allocated</div>
                  <div className="mt-0.5 font-mono text-[15px] font-semibold tabular-nums text-[var(--tp)]">{fmt(row.allocatedQty)}</div>
                </div>
              </div>
            </div>

            <footer className="border-t border-[var(--border)] px-5 py-3 text-right">
              <button
                onClick={onClose}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-[13px] font-medium text-[var(--tp)] transition-colors hover:bg-[var(--hover)]"
              >
                Close
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="mb-3 mt-6 text-[10px] font-bold uppercase tracking-[0.11em] text-[var(--tt)]">{children}</h3>
  );
}

function ProgressBlock({ row }) {
  const percent = getProgress(row);
  const color = getStatusColor(row.status);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-2)] p-4">
      <div className="flex items-end justify-between">
        <span className="font-mono text-[32px] font-bold leading-none tabular-nums text-[var(--tp)]">{percent}%</span>
        <span className="font-mono text-[12px] tabular-nums text-[var(--ts)]">
          {fmt(row.producedQty)} / {fmt(row.orderQty)} units
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
