import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

function ClientDetailsSection({ invoiceDetails }) {
  const containerRef = useRef(null);
  const orderRefs = useRef([]);
  const shipRefs = useRef([]);
  orderRefs.current = [];
  shipRefs.current = [];

  const addToOrderRefs = (el) => {
    if (el) orderRefs.current.push(el);
  };
  const addToShipRefs = (el) => {
    if (el) shipRefs.current.push(el);
  };

  useLayoutEffect(() => {
    // Set the initial state of the elements to be animated
    if (!containerRef.current) return;
    gsap.set(containerRef.current, { opacity: 0, y: 50 });
    gsap.set(orderRefs.current, { opacity: 0, x: -40 });
    gsap.set(shipRefs.current, { opacity: 0, x: 40 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is visible, run the animations
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.to(containerRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.6,
            })
              .to(
                orderRefs.current,
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.6,
                  stagger: 0.2,
                },
                ">-0.3"
              ) // Start this animation 0.3s before the previous one ends
              .to(
                shipRefs.current,
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.6,
                  stagger: 0.2,
                },
                ">-0.5"
              ); // Start this animation 0.5s before the previous one ends
          } else {
            // Optional: Reset the state when it leaves the viewport
            gsap.set(containerRef.current, { opacity: 0, y: 50 });
            gsap.set(orderRefs.current, { opacity: 0, x: -40 });
            gsap.set(shipRefs.current, { opacity: 0, x: 40 });
          }
        });
      },
      {
        root: null, // Use the viewport as the root
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      // Cleanup the observer when the component unmounts
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []); // The empty dependency array ensures this effect runs once on mount.
  const getAvatarLabel = (name) => {
    if (!name) return "";

    const parts = name.trim().split(" ");
    const firstWord = parts[0];

    // RULE: If the first word is short (3 letters or less), use it as is (e.g., "ATC", "IBM", "MRF")
    if (firstWord.length <= 3) {
      return firstWord.toUpperCase();
    }

    // OTHERWISE: Take the first letter of the first 2 words (e.g., "Moiddeen Kaja" -> "MK")
    if (parts.length === 1) return firstWord.charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-md"
    >
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {invoiceDetails?.custfullname
                  ? invoiceDetails.custfullname
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                  : "?"}
              </span>
            </div>
            <div>
              <h2 className="md:text-2xl font-bold text-gray-900 dark:text-white">
                {invoiceDetails?.custfullname}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Primary Customer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--secondary)] dark:bg-[#1E2939] rounded-lg border border-[var(--primary)] dark:border-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              Order Ref #:{" "}
              <span className="text-green-900 dark:text-green-100">
                {invoiceDetails?.orderRefNo}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              Order Information
            </h3>
            {[
              {
                label: "Ordered Date",
                value: invoiceDetails?.completedDate,
                icon: "📅",
                color: "blue",
              },
              {
                label: "Desired Ship Date",
                value: invoiceDetails?.dispatchedDate,
                icon: "🚢",
                color: "green",
              },
              {
                label: "Bill To",
                value: (
                  <>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {invoiceDetails?.billingCompanyName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.billingAddress?.split("~").join(", ")}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.billingCity}
                    </div>
                    {invoiceDetails?.billingState && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {invoiceDetails?.billingState}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.billingCountry} -{" "}
                      {invoiceDetails?.billingZipcode}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                      Contact: {invoiceDetails?.billingContactName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Email: {invoiceDetails?.billingEmailId} - Phone:{" "}
                      {invoiceDetails?.billingMobile}
                    </div>
                  </>
                ),
                icon: "📍",
                color: "purple",
              },
              {
                label: "Special Instruction",
                value: invoiceDetails?.splIns || "Handle with care",
                icon: "⚠️",
                color: "orange",
              },
            ].map((item, i) => (
              <div
                key={i}
                ref={addToOrderRefs}
                className="relative p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-[var(--primary)]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gray-200 dark:bg-gray-700">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold dark:text-gray-400 uppercase tracking-wide mb-1">
                      {item.label}
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {item.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Shipping Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              Shipping Information
            </h3>
            {[
              invoiceDetails?.preCarriageBy === "AIR"
                ? {
                  label: "Delivery Method",
                  value: "Air Freight",
                  icon: "✈️",
                  color: "blue",
                }
                : invoiceDetails?.preCarriageBy === "SEA"
                  ? {
                    label: "Delivery Method",
                    value: "Sea Freight",
                    icon: "🚢",
                    color: "green",
                  }
                  : invoiceDetails?.preCarriageBy === "ROAD"
                    ? {
                      label: "Delivery Method",
                      value: "Road Freight",
                      icon: "🚚",
                      color: "orange",
                    }
                    : {
                      label: "Delivery Method",
                      value: "Please Add Delivery Method",
                      icon: "❗",
                      color: "red",
                    },
              {
                label: "Packing Method",
                value: "Wooden Crates",
                icon: "📦",
                color: "brown",
              },
              {
                label: "Ship To",
                value: (
                  <>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {invoiceDetails?.shippingCompanyName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.shippingAddress?.split("~").join(", ")}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.shippingCity}
                    </div>
                    {invoiceDetails?.shippingState && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {invoiceDetails?.shippingState}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.shippingCountry} -{" "}
                      {invoiceDetails?.shippingZipcode}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                      Contact: {invoiceDetails?.shippingContactName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Email: {invoiceDetails?.shippingEmailId} - Phone:{" "}
                      {invoiceDetails?.shippingMobile}
                    </div>
                  </>
                ),
                icon: "🏠",
                color: "green",
              },
              {
                label: "Special Notes",
                value:
                  invoiceDetails?.specialRequset || "Urgent delivery required",
                icon: "⚡",
                color: "yellow",
              },
            ].map((item, i) => (
              <div
                key={i}
                ref={addToShipRefs}
                className="relative p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-[var(--primary)]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gray-200 dark:bg-gray-700">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold dark:text-gray-400 uppercase tracking-wide mb-1">
                      {item.label}
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {item.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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