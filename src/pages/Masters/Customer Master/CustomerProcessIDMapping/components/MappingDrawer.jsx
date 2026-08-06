import React, { useEffect, useState } from "react";
import { Drawer, Select, Input, Button } from "antd";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import ProcessLookup from "./ProcessLookup";
import { CUSTOMERS } from "../data/mockData";

const EMPTY_FORM = {
  customer: "",
  customerProcessId: "",
  ourProcessId: "",
  platform: "",
  brand: "",
  sideWall: "",
  tyreSize: "",
  rimSize: "",
  tyreType: "",
  status: "Active",
  remarks: "",
};

// mode: "create" | "edit" | "clone"
const MappingDrawer = ({ open, mode, record, mappings, onClose, onSave, onOpenExisting }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [duplicate, setDuplicate] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      setForm(EMPTY_FORM);
    } else if (mode === "clone" && record) {
      setForm({ ...record, customerProcessId: "" }); // everything copies except the customer process ID
    } else if (record) {
      setForm({ ...record });
    }
    setErrors({});
    setDuplicate(null);
  }, [open, mode, record]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));

    if (field === "customerProcessId" || field === "customer") {
      const nextCustomer = field === "customer" ? value : form.customer;
      const nextCode = field === "customerProcessId" ? value : form.customerProcessId;
      checkDuplicate(nextCustomer, nextCode);
    }
  };

  const checkDuplicate = (customer, code) => {
    if (!customer || !code.trim()) {
      setDuplicate(null);
      return;
    }
    const existing = mappings.find(
      (m) =>
        m.customer === customer &&
        m.customerProcessId.toLowerCase() === code.trim().toLowerCase() &&
        m.id !== (mode === "edit" ? record?.id : undefined),
    );
    setDuplicate(existing || null);
  };

  const handleProcessSelect = (proc) => {
    setForm((prev) => ({
      ...prev,
      ourProcessId: proc.processId,
      platform: proc.platform,
      brand: proc.brand,
      sideWall: proc.sideWall,
      tyreSize: proc.tyreSize,
      rimSize: proc.rimSize,
      tyreType: proc.tyreType,
    }));
    if (errors.ourProcessId) setErrors((prev) => ({ ...prev, ourProcessId: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.customer) next.customer = "Customer is required";
    if (!form.customerProcessId.trim()) next.customerProcessId = "Customer Process ID is required";
    if (!form.ourProcessId) next.ourProcessId = "Our Process ID is required";
    return next;
  };

  const handleSave = () => {
    if (duplicate) return; // block save while a duplicate is active — user must resolve it first
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    onSave(form, mode);
  };

  const titles = { create: "New Mapping", edit: "Edit Mapping", clone: "Clone Mapping" };

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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] sm:text-[15px] font-semibold text-slate-900 dark:text-slate-100">{titles[mode] || "Mapping"}</p>
            <p className="text-[11px] sm:text-[12px] font-normal text-slate-500 dark:text-slate-400">
              Map a customer's process ID to our internal Process ID.
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2 sm:gap-3 p-1">
          <Button onClick={onClose} className="rounded-lg dark:!bg-slate-700 dark:!text-slate-100 dark:!border-slate-600">
            Cancel
          </Button>
          <Button type="primary" onClick={handleSave} disabled={!!duplicate} className="rounded-lg bg-blue-600">
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-5">
        <div>
          <label className="mb-1 sm:mb-1.5 block text-[11px] sm:text-[12px] font-medium text-slate-600 dark:text-slate-400">
            Customer <span className="text-rose-500">*</span>
          </label>
          <Select
            showSearch
            allowClear
            value={form.customer || undefined}
            placeholder="Select customer"
            options={CUSTOMERS.map((c) => ({ value: c, label: c }))}
            onChange={(v) => handleChange("customer", v || "")}
            status={errors.customer ? "error" : ""}
            className="w-full"
          />
          {errors.customer && <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">{errors.customer}</p>}
        </div>

        <div>
          <label className="mb-1 sm:mb-1.5 block text-[11px] sm:text-[12px] font-medium text-slate-600 dark:text-slate-400">
            Customer Process ID <span className="text-rose-500">*</span>
          </label>
          <Input
            value={form.customerProcessId}
            onChange={(e) => handleChange("customerProcessId", e.target.value)}
            placeholder="e.g. AP-45821"
            status={errors.customerProcessId || duplicate ? "error" : ""}
            className="h-9 dark:!bg-slate-800 dark:!text-slate-100 dark:!border-slate-600"
          />
          {errors.customerProcessId && (
            <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">{errors.customerProcessId}</p>
          )}

          {duplicate && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-2.5 sm:p-3"
            >
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-500 dark:text-rose-400" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-[12px] font-semibold text-rose-700 dark:text-rose-300">
                  Already mapped to {duplicate.ourProcessId}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400">
                  This customer already has a mapping for this Customer Process ID.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenExisting(duplicate)}
                  className="mt-1.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300 underline underline-offset-2 hover:text-rose-800 dark:hover:text-rose-200"
                >
                  Open Existing Mapping
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div>
          <label className="mb-1 sm:mb-1.5 block text-[11px] sm:text-[12px] font-medium text-slate-600 dark:text-slate-400">
            Our Process ID <span className="text-rose-500">*</span>
          </label>
          <ProcessLookup value={form.ourProcessId} onSelect={handleProcessSelect} error={errors.ourProcessId} />
        </div>

        {/* Auto-populated, read-only — the whole point is the user never types these */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-2.5 sm:p-3.5">
          {[
            ["Platform", form.platform],
            ["Brand", form.brand],
            ["Side Wall", form.sideWall],
            ["Tyre Size", form.tyreSize],
            ["Rim Size", form.rimSize],
            ["Tyre Type", form.tyreType],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
              <p className="mt-0.5 truncate text-[12px] sm:text-[13px] font-medium text-slate-700 dark:text-slate-300">{val || "—"}</p>
            </div>
          ))}
        </div>

        <div>
          <label className="mb-1 sm:mb-1.5 block text-[11px] sm:text-[12px] font-medium text-slate-600 dark:text-slate-400">Status</label>
          <Select
            value={form.status}
            onChange={(v) => handleChange("status", v)}
            className="w-full"
            options={[
              { value: "Active", label: "Active" },
              { value: "Pending", label: "Pending" },
              { value: "Inactive", label: "Inactive" },
            ]}
          />
        </div>

        <div>
          <label className="mb-1 sm:mb-1.5 block text-[11px] sm:text-[12px] font-medium text-slate-600 dark:text-slate-400">Remarks</label>
          <Input.TextArea
            value={form.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
            rows={3}
            placeholder="Optional notes about this mapping"
            className="dark:!bg-slate-800 dark:!text-slate-100 dark:!border-slate-600"
          />
        </div>
      </div>
    </Drawer>
  );
};

export default MappingDrawer;
