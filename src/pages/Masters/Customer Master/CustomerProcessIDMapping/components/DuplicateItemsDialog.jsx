import React from "react";
import { Modal, Button } from "antd";
import { AlertTriangle } from "lucide-react";

// Shown when saving a mapping would recreate an item that already exists for
// one or more of the selected ship addresses. Lets the user create only the
// ship addresses that are actually new, instead of blocking the save outright
// or silently skipping the duplicates without explanation.
const DuplicateItemsDialog = ({
  open,
  onClose,
  duplicateRows,
  validCount,
  customer,
  itemType,
  itemCode,
  onCreateValidOnly,
  submitting,
}) => {
  const allDuplicate = validCount === 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Duplicate Items Found"
      width={typeof window !== "undefined" ? Math.min(600, window.innerWidth - 32) : 600}
      classNames={{
        body: "!px-3 !py-2 sm:!px-6 sm:!py-4",
        content: "dark:!bg-slate-800",
        header: "dark:!bg-slate-800 dark:[&_.ant-modal-title]:!text-slate-100",
      }}
      footer={
        <div className="flex justify-end gap-2 sm:gap-3">
          <Button onClick={onClose} className="rounded-lg dark:!bg-slate-700 dark:!text-slate-100 dark:!border-slate-600">
            Cancel
          </Button>
          {!allDuplicate && (
            <Button
              type="primary"
              loading={submitting}
              onClick={onCreateValidOnly}
              className="rounded-lg bg-blue-600"
            >
              Create Valid Items Only ({validCount})
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-3 py-2">
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-[12px] sm:text-[13px] text-amber-800 dark:text-amber-300">
            The following customer item mappings already exist and cannot be created again.
          </p>
        </div>

        <div className="max-h-64 overflow-x-auto overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[560px] text-left text-[11px] sm:text-[12px]">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Customer</th>
                <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Shipping Address</th>
                <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Ship ID</th>
                <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Item Type</th>
                <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Item Code</th>
                <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {duplicateRows.map((row) => (
                <tr
                  key={row.shipId}
                  className="border-t border-slate-100 dark:border-slate-700 bg-rose-50/60 dark:bg-rose-900/20"
                >
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{customer}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.shipAddressLabel}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.shipId}</td>
                  <td className="px-3 py-2 uppercase text-slate-700 dark:text-slate-300">{itemType}</td>
                  <td className="px-3 py-2 font-mono font-semibold text-slate-800 dark:text-slate-100">{itemCode}</td>
                  <td className="px-3 py-2 font-medium text-rose-600 dark:text-rose-400">Already Exists</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[12px] sm:text-[13px] font-medium text-slate-600 dark:text-slate-300">
          {allDuplicate
            ? "All selected items already exist. No new items were created."
            : `${validCount} valid shipping address${validCount === 1 ? " is" : "es are"} available to create.`}
        </p>
      </div>
    </Modal>
  );
};

export default DuplicateItemsDialog;
