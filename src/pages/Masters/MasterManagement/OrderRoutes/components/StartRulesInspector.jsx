import React, { useState } from "react";
import { billAddressesFor, emptyRules, exportAddressesFor, shipAddressesFor } from "../data/ruleOptions";
import { FieldHeader, InspectorShell, inputClass } from "./InspectorShell";

const toId = (v) => (v === "" ? null : Number(v));

const SingleSelect = ({ id, value, onChange, options, anyLabel = "Any", disabled }) => (
  <select id={id} value={value ?? ""} onChange={(e) => onChange(toId(e.target.value))} disabled={disabled} className={`${inputClass} disabled:opacity-50`}>
    <option value="">{anyLabel}</option>
    {options.map((o) => (
      <option key={o.id} value={o.id}>
        {o.label}
      </option>
    ))}
  </select>
);

// Right panel for Start Rules. One value per rule, as POST
// WorkFlow/create-workflow expects; "Any" is sent as 0.
const StartRulesInspector = ({ routeName, rules, options, onChange, onClose }) => {
  const [customerQuery, setCustomerQuery] = useState("");

  const customer = options.customers.find((c) => c.id === rules.customerId);
  const exportAddresses = exportAddressesFor(options, rules.entityId);
  const shipAddresses = shipAddressesFor(options, rules.customerId);
  const billAddresses = billAddressesFor(options, rules.customerId);
  // Changing the entity / customer keeps an address only if it still applies.
  const keepIf = (list, id) => (id != null && list.some((a) => a.id === id) ? id : null);
  const q = customerQuery.trim().toLowerCase();
  const customers = options.customers.filter((c) => !q || `${c.name} ${c.code}`.toLowerCase().includes(q)).slice(0, 200);

  const set = (patch) => onChange((r) => Object.assign(r, patch));
  const pickCustomer = (id) =>
    set({
      customerId: id,
      shipId: keepIf(shipAddressesFor(options, id), rules.shipId),
      billId: keepIf(billAddressesFor(options, id), rules.billId),
    });

  return (
    <InspectorShell
      eyebrow="Start"
      title="Start Rules"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={() => onChange((r) => Object.assign(r, emptyRules()))}
            className="rounded-md px-2.5 py-1.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Clear all rules
          </button>
          <span className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-[13px] font-semibold hover:border-indigo-500 dark:border-slate-700"
          >
            Done
          </button>
        </>
      }
    >
      <p className="m-0 text-[13px] text-slate-500 dark:text-slate-400">
        Choose which new orders follow “{routeName}”. Leave a rule on <b>Any</b> to accept every value. The order must match all rules you set.
      </p>

      <p className="m-0 -mb-1.5 mt-1 border-b border-slate-200 pb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:border-slate-800">
        Entity & export address
      </p>
      <div className="flex flex-col gap-1.5">
        <FieldHeader title="Entity" hint="Legal entity that books the order." onClear={() => set({ entityId: null })} />
        <SingleSelect
          id="rule-entity"
          value={rules.entityId}
          onChange={(v) => set({ entityId: v, exportAddressId: keepIf(exportAddressesFor(options, v), rules.exportAddressId) })}
          options={options.entities.map((e) => ({ id: e.id, label: `${e.code ? `${e.code} · ` : ""}${e.name}${e.meta ? ` (${e.meta})` : ""}` }))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldHeader title="Export authorised address" hint="Registered address the export is authorised from." onClear={() => set({ exportAddressId: null })} />
        <SingleSelect
          id="rule-export-address"
          value={rules.exportAddressId}
          onChange={(v) => set({ exportAddressId: v })}
          disabled={!exportAddresses.length}
          anyLabel={exportAddresses.length ? "Any" : "No export addresses loaded"}
          options={exportAddresses.map((a) => ({ id: a.id, label: a.label }))}
        />
      </div>

      <p className="m-0 -mb-1.5 mt-1 border-b border-slate-200 pb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:border-slate-800">
        Order
      </p>
      <div className="flex flex-col gap-1.5">
        <FieldHeader title="Order type" onClear={() => set({ orderTypeId: null })} />
        <SingleSelect
          id="rule-order-type"
          value={rules.orderTypeId}
          onChange={(v) => set({ orderTypeId: v })}
          options={options.orderTypes.map((t) => ({ id: t.id, label: t.name }))}
        />
      </div>

      <p className="m-0 -mb-1.5 mt-1 border-b border-slate-200 pb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:border-slate-800">
        Customer, ship-to & bill-to
      </p>
      <div className="flex flex-col gap-1.5">
        <FieldHeader
          title="Customer"
          count={customer ? customer.name : "Any"}
          onClear={() => set({ customerId: null })}
        />
        <input
          type="search"
          value={customerQuery}
          onChange={(e) => setCustomerQuery(e.target.value)}
          placeholder={`Search ${options.customers.length} customers by name or code`}
          className={inputClass}
        />
        <div role="radiogroup" aria-label="Customer" className="custom-scrollbar max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <label className="flex cursor-pointer items-center gap-2.5 border-b border-slate-100 px-2.5 py-1.5 text-[13px] hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
            <input type="radio" name="rule-customer" checked={rules.customerId == null} onChange={() => pickCustomer(null)} className="accent-indigo-600" />
            Any customer
          </label>
          {customers.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2.5 border-b border-slate-100 px-2.5 py-1.5 text-[13px] last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <input
                type="radio"
                name="rule-customer"
                checked={rules.customerId === c.id}
                onChange={() => pickCustomer(c.id)}
                className="accent-indigo-600"
              />
              <span className="min-w-0 truncate">{c.name}</span>
              <small className="ml-auto whitespace-nowrap font-mono text-[11px] text-slate-400">{c.code}</small>
            </label>
          ))}
          {options.customers.length === 0 && (
            <p className="m-2 text-[12px] text-slate-500">Customer list not loaded. Check WorkFlow/workflow-details.</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5">
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-slate-500">Ship-to address</span>
          <SingleSelect
            id="rule-ship"
            value={rules.shipId}
            disabled={!shipAddresses.length}
            anyLabel={shipAddresses.length ? "Any" : "No ship-to addresses loaded"}
            onChange={(v) => {
              // Pre-fill the bill-to address linked to this ship-to address.
              const linked = shipAddresses.find((a) => a.id === v)?.billId;
              set({ shipId: v, ...(v != null && linked ? { billId: linked } : {}) });
            }}
            options={shipAddresses.map((a) => ({ id: a.id, label: a.label }))}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-slate-500">Bill-to address</span>
          <SingleSelect
            id="rule-bill"
            value={rules.billId}
            disabled={!billAddresses.length}
            anyLabel={billAddresses.length ? "Any" : "No bill-to addresses loaded"}
            onChange={(v) => set({ billId: v })}
            options={billAddresses.map((a) => ({ id: a.id, label: a.label }))}
          />
        </label>
      </div>
    </InspectorShell>
  );
};

export default StartRulesInspector;
