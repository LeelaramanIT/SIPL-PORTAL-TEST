import React from "react";
import { Drawer, Button } from "antd";
import StatusBadge from "./StatusBadge";

const Field = ({ label, value, full }) => (
  <div className={full ? "col-span-2" : ""}>
    <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
    <p className="mt-0.5 text-[12px] sm:text-[13px] font-medium text-slate-700 dark:text-slate-300 break-words">{value || "—"}</p>
  </div>
);

const ViewDrawer = ({ open, record, onClose, onEdit }) => {
  if (!record) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={typeof window !== "undefined" ? Math.min(520, window.innerWidth) : 520}
      closable={false}
      classNames={{
        header: "!px-3 !py-2.5 sm:!px-6 sm:!py-4 dark:!border-slate-700",
        body: "!p-3 sm:!p-6",
        footer: "!p-1 dark:!border-slate-700",
        content: "dark:!bg-slate-800",
      }}
      title={
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] sm:text-[15px] font-semibold text-slate-900 dark:text-slate-100 truncate">{record.customerProcessId}</p>
            <p className="text-[11px] sm:text-[12px] font-normal text-slate-500 dark:text-slate-400 truncate">{record.customer}</p>
          </div>
          <StatusBadge status={record.status} />
        </div>
      }
      footer={
        <div className="flex justify-end gap-2 sm:gap-3 p-1">
          <Button onClick={onClose} className="rounded-lg dark:!bg-slate-700 dark:!text-slate-100 dark:!border-slate-600">
            Close
          </Button>
          <Button type="primary" onClick={() => onEdit(record)} className="rounded-lg bg-blue-600">
            Edit
          </Button>
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        <section>
          <h4 className="mb-2 sm:mb-3 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Mapping</h4>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Field label="Customer" value={record.customer} />
            <Field label="Customer Process ID" value={record.customerProcessId} />
            <Field label="Our Process ID" value={record.ourProcessId} />
            <Field label="Platform" value={record.platform} />
          </div>
        </section>

        <div className="border-t border-slate-100 dark:border-slate-700" />

        <section>
          <h4 className="mb-2 sm:mb-3 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Tyre Specification</h4>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Field label="Brand" value={record.brand} />
            <Field label="Side Wall" value={record.sideWall} />
            <Field label="Tyre Size" value={record.tyreSize} />
            <Field label="Rim Size" value={record.rimSize} />
            <Field label="Tyre Type" value={record.tyreType} />
          </div>
        </section>

        <div className="border-t border-slate-100 dark:border-slate-700" />

        <section>
          <h4 className="mb-2 sm:mb-3 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Audit</h4>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Field label="Created By" value={record.createdBy} />
            <Field label="Created Date" value={new Date(record.createdDate).toLocaleDateString()} />
            <Field label="Modified By" value={record.updatedBy} />
            <Field label="Modified Date" value={new Date(record.lastUpdated).toLocaleDateString()} />
          </div>
        </section>

        {record.remarks && (
          <>
            <div className="border-t border-slate-100 dark:border-slate-700" />
            <section>
              <h4 className="mb-2 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Remarks</h4>
              <p className="text-[12px] sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{record.remarks}</p>
            </section>
          </>
        )}
      </div>
    </Drawer>
  );
};

export default ViewDrawer;
