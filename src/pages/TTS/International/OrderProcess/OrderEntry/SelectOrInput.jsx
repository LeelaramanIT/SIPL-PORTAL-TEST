import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── helpers ────────────────────────────────────────────────────────────────
function cx(...names) {
  return names.filter(Boolean).join(" ");
}

const INPUT =
  "w-full min-h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal tracking-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 disabled:opacity-30 disabled:cursor-not-allowed read-only:bg-slate-100 read-only:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:read-only:bg-slate-800/45 dark:read-only:text-slate-400";

const rise = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
  transition: { duration: 0.15 },
};

// ─── SelectOrInput ───────────────────────────────────────────────────────────
/**
 * A hybrid select + free-text input.
 *
 * Props:
 *   value        string              current value
 *   onChange     (val: string) => void
 *   options      string[]            predefined option labels
 *   placeholder  string              placeholder for the search / input
 *   allowCustom  bool                (default true) show "+ Add New" option
 *   disabled     bool
 *   required     bool                (forwarded to native input, cosmetic)
 */
export function SelectOrInput({
  value = "",
  onChange,
  options = [],
  placeholder = "Select or type…",
  allowCustom = true,
  disabled = false,
}) {
  // Is the field in "custom input" mode?
  const [inputMode, setInputMode] = useState(false);
  // Is the dropdown open?
  const [open, setOpen] = useState(false);
  // The search query typed inside the dropdown
  const [query, setQuery]     = useState("");

  const containerRef = useRef(null);
  const inputRef     = useRef(null);
  const queryRef     = useRef(null);

  // When switching to input mode, focus the text field
  useEffect(() => {
    if (inputMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputMode]);

  // When opening the dropdown, focus the search box
  useEffect(() => {
    if (open && queryRef.current) {
      queryRef.current.focus();
    }
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filtered options by query
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const selectOption = (opt) => {
    onChange(opt);
    setOpen(false);
    setQuery("");
    setInputMode(false);
  };

  const activateCustom = () => {
    setOpen(false);
    setQuery("");
    setInputMode(true);
    // clear only if the current value is one of the predefined options
    // so the user can see it and edit it
  };

  const cancelCustom = () => {
    setInputMode(false);
    // if the current value is still a known option keep it, otherwise clear
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {inputMode ? (
          /* ── Custom text input mode ── */
          <motion.div key="input" {...rise} className="flex items-center gap-1">
            <input
              ref={inputRef}
              className={cx(INPUT, "flex-1 pr-1")}
              value={value}
              placeholder={placeholder}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
            />
            <button
              type="button"
              title="Back to list"
              onClick={cancelCustom}
              className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[10px] font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                <path d="M7.5 3L4.5 6l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              List
            </button>
          </motion.div>
        ) : (
          /* ── Select / dropdown trigger mode ── */
          <motion.div key="select" {...rise}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setOpen((o) => !o)}
              className={cx(
                INPUT,
                "flex cursor-pointer items-center justify-between gap-2 text-left",
                !value && "text-slate-400 dark:text-slate-600",
                open && "border-amber-400 ring-2 ring-amber-500/15"
              )}
            >
              <span className="flex-1 truncate text-xs">
                {value || placeholder}
              </span>
              <motion.svg
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="shrink-0 text-slate-400"
              >
                <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </button>

            {/* ── Dropdown panel ── */}
            <AnimatePresence>
              {open && (
                <motion.div
                  {...rise}
                  className="absolute left-0 right-0 top-[calc(100%+4px)] z-[200] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
                >
                  {/* Search box */}
                  {options.length > 5 && (
                    <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
                      <input
                        ref={queryRef}
                        className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                        placeholder="Search…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Options list */}
                  <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
                    {filtered.length === 0 && query && (
                      <li className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500">
                        No matches
                      </li>
                    )}
                    {filtered.map((opt) => (
                      <li key={opt} role="option" aria-selected={value === opt}>
                        <button
                          type="button"
                          onClick={() => selectOption(opt)}
                          className={cx(
                            "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition",
                            value === opt
                              ? "bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400"
                              : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50"
                          )}
                        >
                          {value === opt && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
                              <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          <span className={value === opt ? "" : "ml-[18px]"}>{opt}</span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* + Add New footer */}
                  {allowCustom && (
                    <div className="border-t border-slate-100 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={activateCustom}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-blue-500 transition hover:bg-blue-500/[.06] dark:text-blue-400 dark:hover:bg-blue-500/[.08]"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                          <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        Add New
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MasterDataField ─────────────────────────────────────────────────────────
/**
 * A labelled wrapper around SelectOrInput, matching the Field/Grid system used
 * in the parent form.
 *
 * Props:
 *   label        string
 *   required     bool
 *   wide         bool      spans full grid width (col-span-full)
 *   value        string
 *   onChange     (val) => void
 *   options      string[]
 *   placeholder  string
 *   allowCustom  bool
 */
export function MasterDataField({
  label,
  required,
  wide,
  value,
  onChange,
  options = [],
  placeholder,
  allowCustom = true,
}) {
  return (
    <label
      className={cx(
        "flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-slate-500 dark:text-slate-400",
        wide && "col-span-full"
      )}
    >
      <span>
        {label}
        {required && <b className="text-red-400"> *</b>}
      </span>
      <SelectOrInput
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder || `Select ${label}…`}
        allowCustom={allowCustom}
      />
    </label>
  );
}

// ─── Master option lists ─────────────────────────────────────────────────────
// Centralised so they're easy to swap for API-driven data later.

export const CARRIAGE_OPTIONS     = ["BY ROAD", "BY AIR", "BY SEA", "BY RAIL"];
export const CONTAINER_OPTIONS    = ["20 FT", "40 FT", "40 HC", "LCL", "OPEN TOP"];
export const PACKING_OPTIONS      = ["WOODEN BOX", "PALLET", "LOOSE PACKING","WOODEN BOX AND PALLET",'PALLET AND LOOSE PACKING','LOOSE PACKING AND WOODEN BOX'];
export const INCOTERM_OPTIONS     = ["FOB", "CIF", "EXW", "DDP", "DAP", "CFR", "FCA", "CPT", "CIP", ''];
export const LEAD_TIME_OPTIONS    = ["1 WEEK", "2 WEEKS", "3 WEEKS", "1 MONTH", "6 WEEKS", "2 MONTHS", "3 MONTHS", "4 MONTHS", "5 MONTHS"];
export const DESTINATION_OPTIONS = [
  "SINGAPORE",
  "DUBAI",
  "ROTTERDAM",
  "LOS ANGELES",
  "NEW YORK",
  "HAMBURG",
  "SHANGHAI",
  "JAKARTA",
  "MUMBAI",
  "COLOMBO",
];

export const PLACE_INCOTERM_OPTIONS = [
  "SINGAPORE PORT",
  "DUBAI PORT (JEBEL ALI)",
  "PORT OF ROTTERDAM",
  "LOS ANGELES PORT",
  "PORT OF HAMBURG",
  "CHENNAI PORT",
  "COLOMBO PORT",
];

export const CHARGES_TYPE_OPTIONS = [
  "SINGAPORE PORT",
  "DUBAI PORT (JEBEL ALI)",
  "PORT OF ROTTERDAM",
  "LOS ANGELES PORT",
  "PORT OF HAMBURG",
  "CHENNAI PORT",
  "COLOMBO PORT",
];

// ─── Updated LogisticsPanel ──────────────────────────────────────────────────
const rise2 = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2 } };

/**
 * Drop-in replacement for the LogisticsPanel component.
 * All master-data-backed fields now use MasterDataField (SelectOrInput under
 * the hood) so users can pick from the list OR type a custom value inline.
 */
export function LogisticsPanel({ logistics, setLogistics, collapsed, onToggle }) {
  const update = (field, value) =>
    setLogistics((prev) => ({ ...prev, [field]: value }));

  // ── sub-components used inside ──────────────────────────────────────────
  // (Copied from parent file; kept local so this file is self-contained.)
  const MUTED_DIVIDER = ({ children }) => (
    <div className="my-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-slate-600">
      {children}
      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
    </div>
  );

  return (
    <motion.div {...rise2}>
      {/*
        NOTE: Panel, Grid, Field, Divider, INFO etc. are provided by the parent
        file (SaleOrderEntry.jsx). This component is intended to be pasted back
        into that file and use those shared primitives directly.

        For standalone preview the structure below mirrors the parent's Panel.
      */}
      <section className="mb-3 overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111318] dark:shadow-none">
        {/* Panel header */}
        <button
          type="button"
          onClick={() => onToggle("logistics")}
          className={cx(
            "flex w-full items-center justify-between rounded-t-xl border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-800 dark:border-slate-800 dark:bg-[#161820] dark:text-slate-100",
            collapsed && "rounded-xl border-b-0"
          )}
        >
          <span className="flex items-center gap-2 text-xs font-semibold">
            <i className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 not-italic">
              🚚
            </i>
            Logistics &amp; Financial Details
          </span>
          <span className="flex items-center gap-2">
            <em className="rounded-full border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold not-italic uppercase tracking-widest text-amber-400">
              Before Discount
            </em>
            <motion.strong
              animate={{ rotate: collapsed ? -90 : 0 }}
              className="text-slate-400 dark:text-slate-600"
            >
              ▾
            </motion.strong>
          </span>
        </button>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div {...rise2} className="p-4">

              {/* ── Logistics Details ───────────────────────────────── */}
              <MUTED_DIVIDER>Logistics Details</MUTED_DIVIDER>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <MasterDataField
                  label="Pre-Carriage By"
                  required
                  value={logistics.preCarriageBy}
                  onChange={(v) => update("preCarriageBy", v)}
                  options={CARRIAGE_OPTIONS}
                  placeholder="Select or enter…"
                />

                <MasterDataField
                  label="Final Destination"
                  required
                  value={logistics.finalDestination}
                  onChange={(v) => update("finalDestination", v)}
                  options={DESTINATION_OPTIONS}
                  placeholder="City / Port…"
                />

                <MasterDataField
                  label="Container Type"
                  required
                  value={logistics.containerType}
                  onChange={(v) => update("containerType", v)}
                  options={CONTAINER_OPTIONS}
                />

                <MasterDataField
                  label="Packing Method"
                  required
                  value={logistics.packingMethod}
                  onChange={(v) => update("packingMethod", v)}
                  options={PACKING_OPTIONS}
                />
              </div>

              {/* ── Financials ──────────────────────────────────────── */}
              <MUTED_DIVIDER>Financials</MUTED_DIVIDER>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                <MasterDataField
                  label="Incoterm"
                  value={logistics.incoterm}
                  onChange={(v) => update("incoterm", v)}
                  options={INCOTERM_OPTIONS}
                />

                <MasterDataField
                  label="Place of Incoterm"
                  required
                  value={logistics.placeOfIncoterm}
                  onChange={(v) => update("placeOfIncoterm", v)}
                  options={PLACE_INCOTERM_OPTIONS}
                  placeholder="Port / City…"
                />

                <MasterDataField
                  label="Lead Time"
                  required
                  value={logistics.leadTime}
                  onChange={(v) => update("leadTime", v)}
                  options={LEAD_TIME_OPTIONS}
                />

                {/* Validity Date stays as a native date picker — no master data */}
                <label className="flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-slate-500 dark:text-slate-400">
                  <span>
                    Validity Date <b className="text-red-400">*</b>
                  </span>
                  <input
                    type="date"
                    value={logistics.validityDate}
                    onChange={(e) => update("validityDate", e.target.value)}
                    className="w-full min-h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                {/* Remarks spans full width */}
                <label className="col-span-full flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-slate-500 dark:text-slate-400">
                  <span>Remarks</span>
                  <textarea
                    rows={3}
                    value={logistics.remarks}
                    onChange={(e) => update("remarks", e.target.value)}
                    placeholder="Enter remarks…"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
                  />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}