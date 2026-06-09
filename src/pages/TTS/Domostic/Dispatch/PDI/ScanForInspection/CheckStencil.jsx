import { useEffect, useRef, useState } from "react";

// Replace this mock with the real API call.
// async function fetchWorkOrder(value) {
//   const res = await fetch(`/api/verify?value=${value}`);
//   if (!res.ok) return null;
//   return res.json();
// }

async function fetchWorkOrder(value) {
  await new Promise((resolve) => setTimeout(resolve, 900));

  const DB = {
    "BC-2024-00182|STN-4471-A": {
      workOrder: "WO-2024-09341",
      field: "Rear Assembly",
      config: "Standard-R",
      platform: "PLT-MNF-01",
      tyreSize: "205/55 R16",
      tyreType: "Radial",
      grade: "Premium",
    },
    "BC-2024-00095|STN-2209-B": {
      workOrder: "WO-2024-07812",
      field: "Front Left",
      config: "Performance-F",
      platform: "PLT-MNF-02",
      tyreSize: "245/40 R18",
      tyreType: "Semi-Slick",
      grade: "Sport",
    },
    "BC-2023-88871|STN-0012-C": {
      workOrder: "WO-2023-55430",
      field: "All-position",
      config: "Truck-T3",
      platform: "PLT-HVY-01",
      tyreSize: "11 R22.5",
      tyreType: "Bias-Ply",
      grade: "Commercial",
    },
  };

  const search = value.trim().toLowerCase();
  const match = Object.entries(DB).find(([key]) =>
    key.split("|").some((part) => part.toLowerCase() === search),
  );

  return match?.[1] ?? null;
}

const FIELDS = [
  { key: "workOrder", label: "Work order" },
  { key: "field", label: "Field" },
  { key: "config", label: "Config" },
  { key: "platform", label: "Platform" },
  { key: "tyreSize", label: "Tyre size" },
  { key: "tyreType", label: "Tyre type" },
  { key: "grade", label: "Grade" },
];

export default function BarcodeVerify() {
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

   useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const reset = () => {
    setSearchValue("");
    setStatus("idle");
    setResult(null);
  };

  const verify = async () => {
    if (!searchValue.trim()) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    const data = await fetchWorkOrder(searchValue.trim());

    if (data) {
      setResult(data);
      setStatus("found");
    } else {
      setResult(null);
      setStatus("notfound");
    }
  };

  const handleSearchKey = (e) => {
    if (e.key === "Enter") verify();
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            Barcode / stencil verification
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Scan or type to look up work order
          </p>
        </div>

        <div className="px-5 py-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3">
            <BarcodeIcon />
            <input
            ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setStatus("idle");
              }}
              onKeyDown={handleSearchKey}
              placeholder="Barcode or stencil number"
              autoComplete="off"
              className="flex-1 py-2.5 text-sm bg-transparent outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>

          {status === "error" && (
            <p className="text-xs text-red-500 -mt-1">
              Enter barcode or stencil number.
            </p>
          )}

          <button
            onClick={verify}
            disabled={status === "loading"}
            className="w-full py-2.5 mt-0.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900
              text-sm font-medium rounded-lg flex items-center justify-center gap-2
              hover:bg-neutral-700 dark:hover:bg-neutral-100
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {status === "loading" ? (
              <>
                <SpinnerIcon />
                Verifying...
              </>
            ) : (
              <>
                <CheckIcon />
                Verify
              </>
            )}
          </button>
        </div>

        {status === "found" && result && (
          <div className="border-t border-neutral-100 dark:border-neutral-800">
            <div className="px-5 pt-4 pb-2 flex items-center gap-2">
              <SuccessIcon />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                Assignment found
              </span>
            </div>

            <div className="px-5 pb-2">
              {FIELDS.map(({ key, label }, index) => (
                <div
                  key={key}
                  className={`flex items-center justify-between py-2.5 ${
                    index < FIELDS.length - 1
                      ? "border-b border-neutral-100 dark:border-neutral-800"
                      : ""
                  }`}
                >
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {label}
                  </span>
                  {key === "workOrder" ? (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {result[key]}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-neutral-900 dark:text-white">
                      {result[key]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="px-5 pb-4 pt-2">
              <ResetButton onClick={reset} label="Scan another" />
            </div>
          </div>
        )}

        {status === "notfound" && (
          <div className="border-t border-neutral-100 dark:border-neutral-800 px-5 py-4">
            <div className="flex items-center gap-2 mb-1.5">
              <ErrorIcon />
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                No assignment found
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              No work order is linked to this barcode or stencil number.
            </p>
            <ResetButton onClick={reset} label="Try again" />
          </div>
        )}
      </div>

      <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-2.5">
        Press Enter or click Verify
      </p>
    </div>
  );
}

function BarcodeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="text-neutral-400 shrink-0"
    >
      <path
        d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14"
        strokeLinecap="round"
      />
      <rect x="1" y="3" width="22" height="18" rx="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500 shrink-0">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500 shrink-0">
      <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ResetButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg
        text-xs font-medium text-neutral-500 dark:text-neutral-400
        hover:bg-neutral-50 dark:hover:bg-neutral-800
        flex items-center justify-center gap-1.5 transition-colors duration-150"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 4v6h6M23 20v-6h-6" />
        <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
      </svg>
      {label}
    </button>
  );
}
