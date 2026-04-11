import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import InfoTooltip from "../../../../../../components/InfoTooltip";

// ─── Reusable Detail Row ──────────────────────────────────────────────────────
const DetailRow = ({ label, value, subValue, highlight = false }) => {
  const formattedValue =
    typeof value === "string" && /\d+\./.test(value)
      ? value.split(/(?=\d+\.)/).filter(Boolean)
      : value;

  return (
    <div className="py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <p className="text-[11px] font-extrabold tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase mb-1">
        {label}
      </p>
      <div
        className={`text-[13px] font-medium leading-relaxed ${
          highlight
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-gray-800 dark:text-gray-100"
        }`}
      >
        {Array.isArray(formattedValue)
          ? formattedValue.map((item, i) => (
              <p key={i} className="mb-0.5">
                {item.trim()}
              </p>
            ))
          : formattedValue || <span className="text-gray-300 dark:text-gray-600">—</span>}
      </div>
      {subValue && (
        <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 font-normal">
          {subValue}
        </p>
      )}
    </div>
  );
};

// ─── Column Header ────────────────────────────────────────────────────────────
const ColumnHeader = ({ title, accent = false }) => (
  <div className="mb-6 pb-3 border-b border-gray-100 dark:border-white/5">
    <p
      className={`text-[12px] font-black tracking-[0.25em] uppercase ${
        accent
          ? "text-indigo-500 dark:text-indigo-400"
          : "text-gray-400 dark:text-gray-500"
      }`}
    >
      {title}
    </p>
  </div>
);

// ─── Address Block ────────────────────────────────────────────────────────────
const AddressBlock = ({ company, address, city, state, country, zip, tag }) => {
  const cityLine = [
    city?.split("~").join(", ").toUpperCase(),
    state?.split("~").join(", ").toUpperCase(),
    country?.split("~").join(", ").toUpperCase(),
    zip?.split("~").join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mb-5">
      {tag && (
        <span className="inline-block mb-2 px-2 py-0.5 rounded-sm bg-gray-100 dark:bg-white/5 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {tag}
        </span>
      )}
      {company && (
        <p className="text-[14px] font-semibold text-gray-900 dark:text-white leading-snug">
          {company}
        </p>
      )}
      {address && (
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          {address.split("~").join(", ")}
        </p>
      )}
      {cityLine && (
        <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
          {cityLine}
        </p>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ClientDetailsSection = ({ invoiceDetails, additional }) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current?.children,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.09, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const initial = invoiceDetails?.custFullName?.trim()?.charAt(0)?.toUpperCase() ?? "K";
  const fullName = invoiceDetails?.custFullName || "KAJA MOIDEEN";

  return (
    <div ref={containerRef} className="w-full bg-white dark:bg-[#090D18] p-1">
      <div className="mx-auto overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.06] shadow-[0_2px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.4)]">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-8 py-5 bg-gray-50/70 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-[var(--primary,#6366f1)] dark:bg-indigo-500 flex items-center justify-center text-white text-lg font-semibold shadow-lg shadow-indigo-500/20">
                {initial}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#090D18]" />
            </div>
            {/* Name */}
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {fullName}
              </h2>
              <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 dark:text-gray-500 uppercase mt-0.5">
                Premium Account
              </p>
            </div>
          </div>

          {/* Buyer Ref */}
          {additional?.buyerRefNo && (
            <div className="flex flex-col items-start md:items-end gap-0.5">
              <p className="text-[9px] font-black tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase">
                Buyer Reference
              </p>
              <p className="text-xl font-mono font-medium text-gray-800 dark:text-gray-200 tabular-nums">
                {additional.buyerRefNo}
              </p>
            </div>
          )}
        </div>

        {/* ── Content Grid ──────────────────────────────────────── */}
        <div
          ref={contentRef}
          className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-white/[0.05]"
        >
          {/* Column 1 — Schedule & Meta */}
          <div className="p-8">
            <ColumnHeader title="Schedule & Meta" accent />
            <DetailRow label="Order Date" value={invoiceDetails?.completedDate} />
            <DetailRow label="Desired Ship Date" value={invoiceDetails?.desiredShipDate} />
            <DetailRow
              label="Logistics Method"
              value={invoiceDetails?.preCarriageBy}
              highlight
            />
            <DetailRow label="Special Handling" value={invoiceDetails?.splIns} />
            <DetailRow
              label="Currency"
              value={invoiceDetails?.userCurrency}
              highlight
            />
          </div>

          {/* Column 2 — Billing Origin */}
          <div className="p-8 bg-gray-50/40 dark:bg-white/[0.01]">
            <ColumnHeader title="Billing Origin" />
            <AddressBlock
             tag="Bill-To Entity"
              company={invoiceDetails?.billingCompanyName}
              address={invoiceDetails?.billingAddress}
              city={invoiceDetails?.billingCity}
              country={invoiceDetails?.billingCountry}
              zip={invoiceDetails?.billingZipcode}
            />
            {(invoiceDetails?.billingContactName || invoiceDetails?.billingEmailId) && (
              <DetailRow
                label="Financial Contact"
                value={invoiceDetails?.billingContactName || "—"}
                subValue={invoiceDetails?.billingEmailId}
              />
            )}
            {invoiceDetails?.billingMobile && (
              <DetailRow label="Verified Phone" value={invoiceDetails.billingMobile} />
            )}
            <DetailRow
              label="Payment Terms"
              value={invoiceDetails?.paymentTerms?.split("~~").join("\n") || "Standard Protocol"}
            />
          </div>

          {/* Column 3 — Shipping Destination */}
          <div className="p-8">
            <ColumnHeader title="Final Destination" />
            <AddressBlock
              tag="Ship-To Entity"
              company={invoiceDetails?.shippingCompanyName}
              address={invoiceDetails?.shippingAddress}
              city={invoiceDetails?.shippingCity}
              state={invoiceDetails?.shippingState}
              country={invoiceDetails?.shippingCountry}
              zip={invoiceDetails?.shippingZipcode}
            />
            {invoiceDetails?.shippingContactName && (
              <DetailRow
                label="Receiver Info"
                value={invoiceDetails.shippingContactName}
                subValue={invoiceDetails?.shippingEmailId}
              />
            )}
            {invoiceDetails?.shippingMobile && (
              <DetailRow label="Verified Phone" value={invoiceDetails.shippingMobile} />
            )}
            {invoiceDetails?.custInstruction?.trim() && (
              <div className="mt-5 p-4 rounded-lg bg-indigo-50/60 dark:bg-indigo-500/[0.06] border-l-2 border-indigo-400 dark:border-indigo-500">
                <p className="text-[9px] font-black tracking-[0.18em] text-indigo-600 dark:text-indigo-400 uppercase mb-1">
                  Delivery Note
                </p>
                <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  {invoiceDetails.custInstruction}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="px-8 py-4 bg-gray-50/80 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
          <button className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 uppercase tracking-widest transition-colors duration-150">
            <InfoTooltip />
          </button>
          <button className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-widest transition-colors duration-150 underline-offset-2 hover:underline">
            Update Manifest
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsSection;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function ClientDetailsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#090D18] shadow-[0_2px_24px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-8 py-5 border-b border-gray-100 dark:border-white/[0.05]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/5 animate-pulse flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-100 dark:bg-white/[0.03] rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-20 bg-gray-100 dark:bg-white/[0.03] rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-white/[0.05]">
        {[5, 6, 5].map((rows, col) => (
          <div key={col} className={`p-8 ${col === 1 ? "bg-gray-50/40 dark:bg-white/[0.01]" : ""}`}>
            <div className="h-2.5 w-28 bg-gray-200 dark:bg-white/5 rounded animate-pulse mb-6" />
            <div className="space-y-4">
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="space-y-1.5 py-2 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                  <div className="h-2 w-20 bg-gray-100 dark:bg-white/[0.03] rounded animate-pulse" />
                  <div className={`h-3.5 bg-gray-200 dark:bg-white/5 rounded animate-pulse ${i % 3 === 0 ? "w-3/4" : "w-full"}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-between">
        <div className="h-3 w-16 bg-gray-100 dark:bg-white/[0.03] rounded animate-pulse" />
        <div className="h-3 w-28 bg-gray-100 dark:bg-white/[0.03] rounded animate-pulse" />
      </div>
    </div>
  );
}