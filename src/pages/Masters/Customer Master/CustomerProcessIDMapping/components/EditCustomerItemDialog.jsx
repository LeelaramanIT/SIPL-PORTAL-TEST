import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Input, Select, Switch } from "antd";
import { AlertTriangle } from "lucide-react";
import { norm } from "../helpers";

// Edits an existing, real (API-backed) customer item mapping via
// /CustomerItemMaster/UpdateCustomerItem. Customer and Ship Address identify
// which mapping this is, so they're shown read-only — changing either would
// really mean creating a different mapping. Our Process ID CAN be changed
// here, though: it's looked up live against this customer's real item
// master (the same data source the manual creation flow uses), and Item
// Type / Description are re-derived from whatever it resolves to — neither
// is ever typed by hand, exactly like the creation flow.
const EditCustomerItemDialog = ({ open, record, customerProcessMaster, onClose, onSave, saving, error }) => {
  const [itemCodeInput, setItemCodeInput] = useState("");
  const [itemCodeSearch, setItemCodeSearch] = useState("");
  const [customerItemCode, setCustomerItemCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open || !record) return;
    setItemCodeInput(record.ourProcessId || "");
    setItemCodeSearch("");
    setCustomerItemCode(record.customerProcessId || "");
    setIsActive(record.status === "Active");
  }, [open, record]);

  const matchedItem = useMemo(() => {
    const code = itemCodeInput.trim();
    if (!code) return null;
    return (customerProcessMaster || []).find((p) => norm(p.processId) === norm(code)) || null;
  }, [itemCodeInput, customerProcessMaster]);

  // Every Process ID from this customer's real items, searchable by ID,
  // size, or brand. The record's current Process ID is included even if it
  // isn't in the currently loaded master (e.g. an older/discontinued item),
  // so editing never silently blanks out what's already selected.
  const itemCodeOptions = useMemo(() => {
    const opts = (customerProcessMaster || []).map((p) => ({
      value: p.processId,
      label: [p.processId, p.tyreSize, p.brand].filter(Boolean).join(" — "),
    }));
    if (record?.ourProcessId && !opts.some((o) => o.value === record.ourProcessId)) {
      opts.unshift({ value: record.ourProcessId, label: `${record.ourProcessId} (current)` });
    }
    return opts;
  }, [customerProcessMaster, record]);

  const itemCodeChanged = record && norm(itemCodeInput.trim()) !== norm(record.ourProcessId || "");
  const itemCodeInvalid = itemCodeInput.trim() && !matchedItem;

  if (!record) return null;

  const handleSave = () => {
    if (!customerItemCode.trim() || !matchedItem) return;
    onSave({
      customerItemID: record.customerItemID,
      customerCode: record.customerCode,
      shipid: record.shipid,
      itemCode: matchedItem.processId,
      customerItemCode: customerItemCode.trim().toUpperCase(),
      isActive,
      description: matchedItem.piDetails || "",
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Edit Customer Item"
      width={typeof window !== "undefined" ? Math.min(480, window.innerWidth - 32) : 480}
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
          <Button
            type="primary"
            loading={saving}
            disabled={!customerItemCode.trim() || !matchedItem}
            onClick={handleSave}
            className="rounded-lg bg-blue-600"
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
            <p className="text-[12px] sm:text-[13px] font-medium text-rose-700 dark:text-rose-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-2.5 sm:p-3.5">
          {[
            ["Customer", record.customer],
            ["Ship Address", record.shipAddress],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
              <p className="mt-0.5 truncate text-[12px] sm:text-[13px] font-medium text-slate-700 dark:text-slate-300">{val || "—"}</p>
            </div>
          ))}
        </div>

        <div>
          <label className="mb-1 sm:mb-1.5 block text-[11px] sm:text-[12px] font-medium text-slate-600 dark:text-slate-400">
            Our Process ID <span className="text-rose-500">*</span>
          </label>
          <Select
            showSearch
            allowClear
            optionFilterProp="label"
            placeholder="Search Process ID…"
            value={itemCodeInput || undefined}
            onChange={(value) => setItemCodeInput(value || "")}
            searchValue={itemCodeSearch}
            onSearch={(text) => setItemCodeSearch(text.slice(0, 8))}
            status={itemCodeInvalid ? "error" : ""}
            options={itemCodeOptions}
            className="w-full [&_.ant-select-selector]:!h-9"
          />
          {itemCodeInvalid && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              <AlertTriangle size={12} /> Not found for this customer.
            </p>
          )}
          {itemCodeChanged && matchedItem && (
            <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              This changes which item is mapped — checked for duplicates on save.
            </p>
          )}
        </div>

        {/* Item Type / Description — always derived from the resolved item above, never typed. */}
        <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-2.5 sm:p-3.5">
          <div>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Item Type</p>
            <p className="mt-0.5 truncate text-[12px] sm:text-[13px] font-medium text-slate-700 dark:text-slate-300 capitalize">
              {matchedItem?.itemType || "—"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Description</p>
            <p className="mt-0.5 text-[12px] sm:text-[13px] font-medium text-slate-700 dark:text-slate-300">
              {matchedItem?.piDetails || "—"}
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1 sm:mb-1.5 block text-[11px] sm:text-[12px] font-medium text-slate-600 dark:text-slate-400">
            Customer Item Code <span className="text-rose-500">*</span>
          </label>
          <Input
            value={customerItemCode}
            onChange={(e) => setCustomerItemCode(e.target.value.toUpperCase())}
            placeholder="e.g. AP-45821"
            className="h-9 font-mono dark:!bg-slate-800 dark:!text-slate-100 dark:!border-slate-600"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700 px-3 py-2.5">
          <div>
            <p className="text-[12px] sm:text-[13px] font-medium text-slate-700 dark:text-slate-300">Active</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">Inactive mappings are excluded from order processing.</p>
          </div>
          <Switch checked={isActive} onChange={setIsActive} />
        </div>
      </div>
    </Modal>
  );
};

export default EditCustomerItemDialog;
