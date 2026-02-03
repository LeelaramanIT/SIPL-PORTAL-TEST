import { motion } from "framer-motion";
import { useState } from "react";
import DialogBox from "../../../../../components/DialogBox";

export default function PDIHeader({ mode='scanforinspection', setMode, currentSheet }) {
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [isOpen, setOpen] = useState(false);

  const moduleOn = Boolean(currentSheet?.activeStatus);

  const handleSheetStatus = () => {
    setDialogConfig({
      title: "Disable Full Sheet",
      message: (
        <>
          <span className="text-yellow-600 dark:text-yellow-400 flex items-center text-2xl font-semibold">
            {/* Warning Icon */}
            <IoMdWarning className="mr-2" />
            Warning:
          </span>{" "}
          This action will disable all pricing entries in the price sheet{" "}
          <span className="font-semibold text-red-600 dark:text-red-400">
            {currentSheet?.priceSheetRefNo}
          </span>
          . Do you want to continue?
        </>
      ),
      onConfirm: () => {
        setOpen(false); // Close dialog after confirming
      },
    });

    setOpen(true);
  };

  return (
    <div className="px-6 pt-2 border-b border-slate-100 bg-white dark:bg-slate-800 dark:border-slate-700 z-10 transition-colors duration-300">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            MMN - DOMESTIC PDI INSPECTION
          </h1>
          <p className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-1">
            Manage List Of PDI Inspection
          </p>
        </div>

        {/* Module Switch Section */}
        {mode === "scanforinspection" && (
          <div className="flex flex-col gap-1.5">
            {/* 1. TOP SECTION: Sheet Status (Toggle) */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 min-w-[140px]">
              <span className="text-[0.6rem] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-tight">
                Sheet Status
              </span>

              <button
                onClick={handleSheetStatus}
                disabled={currentSheet?.activeStatus === false}
                className={`relative w-9 h-5 rounded-full transition-colors duration-300
                ${moduleOn ? "bg-[var(--primary)]" : "bg-slate-300 dark:bg-slate-600"}
                disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <motion.div
                  layout
                  className="w-4 h-4 bg-white rounded-full shadow-sm absolute top-0.5 left-0.5"
                  animate={{ x: moduleOn ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* 2. BOTTOM SECTION: Active Status (Tabs) */}
            <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-700/50 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-600">
              <label className="text-[0.6rem] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                Sheet View
              </label>
              <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex items-center relative min-w-[140px]">
                <div
                  className={`absolute h-[calc(100%-8px)] w-[calc(50%-4px)] top-1 rounded-md bg-white dark:bg-slate-600 shadow-sm transition-all duration-200 ease-in-out`}
                ></div>

                <button
                  type="button"
                  className="relative z-10 w-1/2 text-[0.6rem] font-bold py-1 rounded-md transition-colors duration-200 text-slate-500 dark:text-slate-400"
                >
                  Active
                </button>
                <button
                  type="button"
                  className="relative z-10 w-1/2 text-[0.6rem] font-bold py-1 rounded-md transition-colors duration-200 text-slate-500 dark:text-slate-400"
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-6 mt-2 border-b border-slate-100 dark:border-slate-700">
        {[
          "scanforinspection",
          "inspectionincomplite",
          "loadingcheck",
          "barcodedelete",
          "approvalforloading",
          "finalinspectionreport",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setMode(tab)}
            className={`pb-3 text-[0.7rem] font-medium relative cursor-pointer transition-colors ${
              mode === tab
                ? "text-[var(--primary)]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {tab === "scanforinspection" && "Scan For Inspection"}
            {tab === "inspectionincomplite" && "Inspection In Complete"}
            {tab === "loadingcheck" && "Loading Check"}
            {tab === "barcodedelete" && "Barcode Delete"}
            {tab === "approvalforloading" && "Approval For Loading"}
            {tab === "finalinspectionreport" && "Final Inspection Report"}

            {mode === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"
              />
            )}
          </button>
        ))}
      </div>
      <DialogBox
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText="Confirm Disable"
        cancelText="Go Back"
        onConfirm={dialogConfig.onConfirm}
      />
    </div>
  );
}
