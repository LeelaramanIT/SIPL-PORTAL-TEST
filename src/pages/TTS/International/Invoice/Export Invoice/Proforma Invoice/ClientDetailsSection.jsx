import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import InfoTooltip from "../../../../../../components/InfoTooltip";

const ClientDetailsSection = ({ invoiceDetails }) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Clean, executive entrance
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "expo.out",
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Professional Detail Component
  const Detail = ({ label, value, subValue, highlight = false }) => (
    <div className="group py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 dark:text-gray-500 uppercase mb-1.5">
        {label}
      </p>
      <p className={`text-sm font-semibold ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'}`}>
        {value || "—"}
      </p>
      {subValue && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
          {subValue}
        </p>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="w-full bg-white dark:bg-[#0B0F1A] p-1">
      <div className="mx-auto overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {/* Executive Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-8 py-3 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-full bg-[var(--primary)] dark:bg-white flex items-center justify-center text-[var(--text)] dark:text-gray-900 text-xl font-light shadow-2xl">
              {invoiceDetails?.custfullname?.charAt(0) | ("kaja moideen").charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight text-gray-900 dark:text-white">
                {invoiceDetails?.custfullname || 'KAJA MOIDEEN'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Premium Account</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 flex flex-col items-end">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Buyer Reference</span>
            <span className="text-2xl font-mono font-medium text-gray-900 dark:text-gray-200">
              #{invoiceDetails?.orderRefNo}
            </span>
          </div>
          
        </div>

        {/* Content Section */}
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-800">
          
          {/* Column 1: Core Logistics */}
          <div className="p-8">
            <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-6 uppercase tracking-widest border-b border-indigo-100 dark:border-indigo-900 pb-2 inline-block">
              Schedule & Meta
            </h3>
            <Detail label="Fulfillment Date" value={invoiceDetails?.completedDate} />
            <Detail label="Dispatch Window" value={invoiceDetails?.dispatchedDate} />
            <Detail label="Logistics Method" value={`${invoiceDetails?.preCarriageBy || 'Standard'} Freight`} highlight />
            <Detail label="Special Handling" value={invoiceDetails?.splIns || "Standard Protocol"} />
          </div>

          {/* Column 2: Billing & Origin */}
          <div className="p-8 bg-gray-50/30 dark:bg-gray-900/20">
            <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest border-b border-gray-200 dark:border-gray-700 pb-2 inline-block">
              Billing Origin
            </h3>
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{invoiceDetails?.billingCompanyName}</p>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed italic">
                {invoiceDetails?.billingAddress?.split("~").join(", ")}
              </p>
            </div>
            <Detail label="Financial Contact" value={invoiceDetails?.billingContactName} subValue={invoiceDetails?.billingEmailId} />
            <Detail label="Verified Phone" value={invoiceDetails?.billingMobile} />
          </div>

          {/* Column 3: Shipping Destination */}
          <div className="p-8">
            <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest border-b border-gray-200 dark:border-gray-700 pb-2 inline-block">
              Final Destination
            </h3>
            <div className="mb-6">
              <div className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase">
                Ship-To Entity
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{invoiceDetails?.shippingCompanyName}</p>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {invoiceDetails?.shippingAddress?.split("~").join(", ")}
              </p>
            </div>
            <Detail label="Receiver Info" value={invoiceDetails?.shippingContactName} subValue={invoiceDetails?.shippingEmailId} />
            <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-sm border-l-2 border-indigo-500">
               <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">Delivery Note</p>
               <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-snug">
                {invoiceDetails?.specialRequset || "No additional delivery requirements flagged."}
               </p>
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-4">
          <button className="text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors">
           <InfoTooltip/>
          </button>
          <button className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-widest transition-colors">
            Update Manifest
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsSection;

export function ClientDetailsSkeleton() {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-md">

      {/* Header Skeleton */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-600">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Avatar Circle */}
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0"></div>

            {/* Name and Title Lines */}
            <div className="space-y-2 w-full sm:w-48">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>

          {/* Right Badge Skeleton */}
          <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column Skeleton */}
          <div className="space-y-6">
            {/* Column Title */}
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>

            {/* Generate 4 skeleton cards to match the 4 items in your original list */}
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={`left-${i}`} />
            ))}
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            {/* Column Title */}
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>

            {/* Generate 4 skeleton cards */}
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={`right-${i}`} isAddress={i === 2} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper Sub-component for the individual cards
function SkeletonCard({ isAddress = false }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-start gap-3">
        {/* Icon Box */}
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 animate-pulse"></div>

        {/* Text Area */}
        <div className="flex-1 space-y-2 py-1">
          {/* Label */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>

          {/* Value */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>

          {/* If it's the address card (index 2 usually), add extra lines */}
          {isAddress && (
            <>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}