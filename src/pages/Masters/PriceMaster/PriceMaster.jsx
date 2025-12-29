import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import ManageView from "./ManageView";
import UploadView from "./UploadView";
import { setMode, setModuleOn } from "../../../Redux/Slices/PriceMasterSlice";
import { useDispatch, useSelector } from "react-redux";

export default function PriceSheetManagement() {

  const { mode, moduleOn, sheetOptions, selectedSheet } = useSelector((state) => state.priceMaster);
  const dispatch = useDispatch();

  // Add this with your other useMemos
  const currentSheet = useMemo(() => {
    // 1. If it's not an array (null, undefined, or object), return null immediately
    if (!Array.isArray(sheetOptions)) return null;

    // 2. Safe to use .find()
    return sheetOptions.find(sheet => sheet.id.toString() === selectedSheet);
  }, [sheetOptions, selectedSheet]);

  return (
    // Added dark:bg-slate-900 and dark:text-slate-200
    <div className="bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 p-2 min-h-[93vh] custom-scrollbar transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        // Added dark:bg-slate-800 and dark:border-slate-700
        className="max-w-full mx-auto rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[91.3vh]"
      >
        {/* === HEADER SECTION === */}
        <Header
          mode={mode}
          setMode={(mode) => dispatch(setMode(mode))}
          moduleOn={moduleOn}
          setModuleOn={(module) => dispatch(setModuleOn(module))}
          currentSheet={currentSheet}
        />

        {/* === CONTENT AREA === */}
        {/* Added dark:bg-slate-900/50 */}
        <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/50">
          <AnimatePresence mode="wait">

            {mode === "manage" && (
              <ManageView key="manage" moduleOn={moduleOn} />
            )}

            {mode === "upload" && (
              <UploadView key="upload" />
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}