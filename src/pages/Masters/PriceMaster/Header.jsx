import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../utils/axios";
import DialogBox from "../../../components/DialogBox";
import { useDispatch } from "react-redux";
import { updateGlobalSheetStatus } from "../../../Redux/Slices/PriceMasterSlice";
import { IoMdWarning } from "react-icons/io";

export default function Header({ mode, setMode, setModuleOn, currentSheet }) {
  const [dialogConfig, setDialogConfig] = useState({ title: "", message: "", onConfirm: () => { } });
  const [isOpen, setOpen] = useState(false);
  const dispatch = useDispatch();

  const moduleOn = Boolean(currentSheet?.activeStatus);

  const handleSheetStatus = () => {
    // Hard lock: inactive sheet cannot be changed
    if (moduleOn === false) return;

    const payload = {
      updateType: "PriceSheet",
      PriceRefNos: [currentSheet.id],
    };

    setDialogConfig({
      title: "Disable Full Sheet",
      message: (
        <>
          {/* Updated text colors for Dark Mode visibility (yellow-600 -> dark:text-yellow-400) */}
          <span className="text-yellow-600 dark:text-yellow-400 flex items-center text-2xl font-semibold">
            <IoMdWarning className="mr-2" />Warning:
          </span>{" "}
          This action will disable all pricing entries in the price sheet{" "}
          <span className="font-semibold text-red-600 dark:text-red-400">
            {currentSheet.priceSheetRefNo}
          </span>
          . Do you want to continue?
        </>
      ),

      onConfirm: async () => {
        try {
          const res = await api.put("/PriceSheet/update-status-SINGLE", payload);
          if (res.status === 200) {
            dispatch(updateGlobalSheetStatus({
              id: currentSheet.id,
              status: false
            }));
            toast.success("Sheet disabled successfully");
            setOpen(false); // ✅ CLOSE dialog
          }
        } catch (error) {
          console.error("Failed to update status:", error);
          toast.error("Could not update sheet status");
        }
      },
    });

    setOpen(true);
  };


  return (
    // Added dark:bg-slate-800 and dark:border-slate-700
    <div className="px-6 py-3 border-b border-slate-100 bg-white dark:bg-slate-800 dark:border-slate-700 z-10 transition-colors duration-300">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          {/* Added dark:text-slate-100 */}
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Price Sheet Management
          </h1>
          {/* Added dark:text-slate-400 */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage global pricing and bulk uploads
          </p>
        </div>

        {/* Module Switch */}
        {mode === "manage" && (
          // Added dark:bg-slate-700 and dark:border-slate-600
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-600">
            {/* Added dark:text-slate-300 */}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
              Sheet Status
            </span>
            <button
              onClick={handleSheetStatus}
              disabled={currentSheet?.activeStatus === false}
              // Added dark:bg-slate-600 for the inactive state
              className={`relative w-12 h-6 rounded-full transition-colors duration-300
                ${moduleOn ? "bg-[var(--primary)]" : "bg-slate-300 dark:bg-slate-600"}
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <motion.div
                layout
                className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 left-0.5"
                animate={{ x: moduleOn ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>

          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      {/* Added dark:border-slate-700 */}
      <div className="flex gap-6 mt-4 border-b border-slate-100 dark:border-slate-700">
        {["manage", "upload",].map((tab) => (
          <button
            key={tab}
            onClick={() => setMode(tab)}
            // Added dark:text-slate-400 and dark:hover:text-slate-200
            className={`pb-3 text-xs font-medium relative cursor-pointer transition-colors ${mode === tab
                ? "text-[var(--primary)]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`} 
          >
            {tab === "manage" ? "Manage Existing" : "New Price Upload"}
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