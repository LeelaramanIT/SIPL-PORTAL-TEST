import { AnimatePresence, motion } from "framer-motion";

import {
  CheckCircle2,
  ClipboardCheck,
  ScanLine,
  X,
  ShieldCheck,
  Beaker,
} from "lucide-react";

import React, { useState } from "react";


export const VerificationSider = ({
  isOpen = true,
  onClose,
  data,
  onConfirm,
}) => {
  const [selections, setSelections] = useState({
    detector: null,
    beadType: null,
    idGauge: null,
    bestQuality: null,
    physicalBarcode: null,
    hardnessTread: "",
    hardnessBase: "",
    remarks: "",
  });

  if (!isOpen || !data) return null;

  const isAlreadyProcessed = !data.scanStatus;

  const resetForm = () => {
    setSelections({
      detector: null,
      beadType: null,
      idGauge: null,
      bestQuality: null,
      physicalBarcode: null,
      hardnessTread: "",
      hardnessBase: "",
      remarks: "",
    });
    onClose();
  };

  const grade = data?.barcode?.slice(-1) || "";

  const handleUpdate = (field, value) => {
    setSelections((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      pid: data.pid,
      barcode: data.barcode,
      metalDetector: selections.detector === "ok",
      o_ID: data.o_Id || 0,
      o_ItemID: data.o_ItemID || 0,
      substitutionStatus: data.substitutionStatus || false,
      idGauge: selections.idGauge === "ok",
      earmarkStatus: data.earmarkStatus || false,
      concessionType: data.concessionType || "",
      beadType: selections.beadType === "ok" ? "YES" : "NO",
      qualityTest: selections.bestQuality === "ok" ? "OK" : "NOT OK",
      physical: selections.physicalBarcode === "ok" ? "YES" : "NO",
      remarks: selections.remarks || "",
      pdiPlant: data.pdiPlant || "",
      custcode: data.custcode || "",
      workorderno: data.workorderno || "",
      orderQty: data.orderQty || 0,
      orderrefno: data.orderrefno || "",
      treadHard: selections.hardnessTread || 0,
      baseHard: selections.hardnessBase || 0,
    };
    onConfirm(payload);
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // onClick={resetForm}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[999]"
          />

          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="pointer-events-auto w-full 
                         sm:max-w-2xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[1350px] 3xl:max-w-[1800px]
                         bg-white dark:bg-slate-900  
                         sm:rounded-3xl rounded-t-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] 
                         border border-slate-200 dark:border-slate-800 
                         flex flex-col max-h-[100vh] sm:max-h-[90vh] overflow-hidden"
            >
              {/* Top Accent */}
              <div
                className={`h-2 w-full shrink-0 ${isAlreadyProcessed ? "bg-amber-500" : "bg-indigo-600"}`}
              />

              {/* Header: Optimized for small screens and wide screens */}
              <div className="flex items-center justify-between px-4 py-4 sm:px-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                  <div className="hidden xs:flex p-2 bg-indigo-600 rounded-lg text-white">
                    <ScanLine size={24} />
                  </div>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Title Group */}
                    <div className="min-w-0 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] sm:text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-tighter sm:tracking-normal truncate mb-0.5">
                          {data.barcode}
                        </p>

                        {/* Container for Title and Status Message */}
                        <div className="flex items-center gap-3">
                          <h2 className="text-sm sm:text-xl lg:text-2xl 3xl:text-4xl font-black text-slate-900 dark:text-white uppercase truncate">
                            Quality Verification
                          </h2>

                          {/* Status Message - Now on the RIGHT of the title */}
                          {data.infoMessage && (
                            <div
                              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[9px] sm:text-[11px] 3xl:text-xl font-black uppercase tracking-widest border shrink-0 
              ${
                isAlreadyProcessed
                  ? "bg-red-50 border-red-100 text-red-500 shadow-sm shadow-red-500/10"
                  : "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm shadow-emerald-500/10"
              }`}
                            >
                              {data.infoMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetForm}
                  className="ml-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-8 lg:space-y-3 custom-scrollbar">
                {/* 1. Unit Specs: Grid scales from 2 to 8 columns */}
                <section>
                  <SectionHeader
                    icon={<ClipboardCheck size={18} />}
                    title="Unit Specifications"
                  />
                  <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-2">
                    <SpecTile label="Platform" value={data.config} />
                    <SpecTile label="Brand" value={data.brand} />
                    <SpecTile label="Sidewall" value={data.sidewall} />
                    <SpecTile label="Type" value={data.tyreType} />
                    <SpecTile label="Size" value={data.tyreSize} />
                    <SpecTile label="Rim" value={data.rimSize} />
                    <SpecTile
                      label="Stencil"
                      value={data.stencilNo}
                      highlight
                    />
                    <SpecTile label="Grade" value={grade} />
                  </div>
                </section>

                {/* 2. Main Controls: 1 col on mobile, 2 col on Desktop, 3 col on TV */}
                {/* 2. Main Controls: 4-column base grid to support 3:1 ratio */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 xl:gap-12">
                  {/* Inspection Points: Takes 3 out of 4 columns (75% width) */}
                  <div className="lg:col-span-3 space-y-6">
                    <SectionHeader
                      icon={<ShieldCheck size={18} />}
                      title="Inspection Points"
                    />

                    {/* Internal Grid: Optimized to show 3 items per row on very wide screens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-2 gap-3 sm:gap-4">
                      <ModernRadioGroup
                        name="detector"
                        label="Detector Check"
                        selectedValue={selections.detector}
                        onChange={(val) => handleUpdate("detector", val)}
                      />
                      <ModernRadioGroup
                        name="beadType"
                        label="Bead Type"
                        selectedValue={selections.beadType}
                        onChange={(val) => handleUpdate("beadType", val)}
                      />
                      <ModernRadioGroup
                        name="idGauge"
                        label="ID Gauge Check"
                        selectedValue={selections.idGauge}
                        onChange={(val) => handleUpdate("idGauge", val)}
                      />
                      <ModernRadioGroup
                        name="bestQuality"
                        label="Quality Test (POB)"
                        selectedValue={selections.bestQuality}
                        onChange={(val) => handleUpdate("bestQuality", val)}
                      />
                      <ModernRadioGroup
                        name="physicalBarcode"
                        label="Physical Check"
                        selectedValue={selections.physicalBarcode}
                        onChange={(val) => handleUpdate("physicalBarcode", val)}
                      />
                    </div>
                  </div>

                  {/* Metrics & Remarks: Takes 1 out of 4 columns (25% width) */}
                  <div className="lg:col-span-1 space-y-2">
                    <div className="space-y-6">
                      <SectionHeader
                        icon={<Beaker size={18} />}
                        title="Tech Metrics"
                      />
                      {/* Stacked vertically for the narrow sidebar feel */}
                      <div className="flex flex-col-2 gap-2">
                        <MetricInput
                          label="Hardness Tread"
                          value={selections.hardnessTread}
                          onChange={(e) =>
                            handleUpdate("hardnessTread", e.target.value)
                          }
                        />
                        <MetricInput
                          label="Hardness Base"
                          value={selections.hardnessBase}
                          onChange={(e) =>
                            handleUpdate("hardnessBase", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Remarks
                      </label>
                      <textarea
                        value={selections.remarks}
                        onChange={(e) =>
                          handleUpdate("remarks", e.target.value)
                        }
                        /* min-h ensures the box looks good even if the column is narrow */
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm lg:text-base min-h-[10px] lg:min-h-[20px] focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none transition-all"
                        placeholder="Observations..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: Fluid button sizes */}
              <div className="p-2 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex flex-col sm:flex-row gap-4 max-w-5xl mx-auto">
                  <motion.button
                    whileHover={!isAlreadyProcessed ? { scale: 1.01 } : {}}
                    whileTap={!isAlreadyProcessed ? { scale: 0.98 } : {}}
                    onClick={handleSubmit}
                    disabled={isAlreadyProcessed}
                    className={`flex-[2] py-3 rounded-2xl font-black text-xs sm:text-sm lg:text-base uppercase tracking-widest flex items-center justify-center gap-3 transition-all
                      ${isAlreadyProcessed ? "bg-slate-100 text-slate-400" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"}`}
                  >
                    <CheckCircle2 />{" "}
                    {isAlreadyProcessed ? "Processed" : "Complete Inspection"}
                  </motion.button>
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

/* --- Responsive Sub-components --- */

const ModernRadioGroup = ({ name, label, selectedValue, onChange }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 transition-all">
    {/* Label: Optimized for Laptop (text-sm) and scaled for TV (3xl) */}
    <span
      className="
      text-[11px]           /* Small Mobile */
      sm:text-xs            /* Mobile */
      lg:text-sm            /* Laptop (Standard readable size) */
      xl:text-base          /* PC Monitor */
      3xl:text-2xl          /* TV Screen */
      font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight truncate max-w-full
    "
    >
      {label}
    </span>

    {/* Controls Wrapper */}
    <div
      className="
      flex bg-slate-200/50 dark:bg-slate-950 p-1 rounded-xl relative shrink-0 
      w-full                /* Mobile takes full width */
      sm:w-[160px]          /* Tablet */
      lg:w-[180px]          /* Laptop */
      xl:w-[220px]          /* PC Monitor */
      3xl:w-[380px]          /* TV Screen */
    "
    >
      {["ok", "not ok"].map((status) => (
        <label
          key={status}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              selectedValue === status ? onChange(null) : onChange(status);
            }
          }}
          className="flex-1 cursor-pointer relative z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
        >
          <input
            type="radio"
            name={name}
            className="peer hidden"
            checked={selectedValue === status}
            onClick={() =>
              selectedValue === status ? onChange(null) : onChange(status)
            }
            readOnly
          />
          <div
            className={`
              py-1.5 sm:py-2 3xl:py-4 text-center rounded-lg font-black uppercase tracking-widest transition-all duration-200
              text-[9px]          /* Mobile */
              lg:text-[10px]      /* Laptop (keeps it sleek but visible) */
              xl:text-xs          /* PC */
              3xl:text-xl         /* TV */
              ${
                selectedValue === status
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }
            `}
          >
            {status}
          </div>
        </label>
      ))}

      <AnimatePresence>
        {selectedValue && (
          <motion.div
            layoutId={`pill-${name}`}
            className={`absolute inset-y-1 rounded-lg z-0 ${
              selectedValue === "ok" ? "bg-emerald-500" : "bg-red-500"
            }`}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            style={{
              width: "calc(50% - 4px)",
              left: selectedValue === "ok" ? "4px" : "50%",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  </div>
);

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3 sm:gap-5 mb-2 sm:mb-3">
    <span className="text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 p-2 sm:p-3 3xl:p-5 rounded-xl">
      {/* Dynamic sizing for the icon */}
      {React.cloneElement(icon, {
        className: "w-4 h-4 sm:w-5 sm:h-5 3xl:w-8 3xl:h-8",
      })}
    </span>
    <h3 className="text-[10px] sm:text-xs 3xl:text-xl font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
      {title}
    </h3>
    <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800" />
  </div>
);

const SpecTile = ({ label, value, highlight }) => (
  <div
    className={`p-1 sm:p-2 3xl:p-8 rounded-2xl border flex flex-col justify-center items-center text-center transition-all ${
      highlight
        ? "bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20 ring-1 ring-indigo-200 dark:ring-indigo-500/30"
        : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-sm"
    }`}
  >
    <p className="text-[8px] sm:text-[10px] 3xl:text-sm font-bold text-slate-500 uppercase tracking-[0.15em] mb-1 sm:mb-2">
      {label}
    </p>
    <p className="text-xs sm:text-sm lg:text-base 3xl:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight break-all">
      {value || "—"}
    </p>
  </div>
);

const MetricInput = ({ label, value, onChange }) => (
  <div className="space-y-2 sm:space-y-3">
    <label className="text-[10px] 3xl:text-sm font-black text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <input
        type="number"
        step="0.01"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl 
                   px-4 py-1 sm:py-2 3xl:py-8
                   text-sm sm:text-base 3xl:text-3xl font-bold 
                   focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all 
                   group-hover:border-slate-300 dark:group-hover:border-slate-700"
        placeholder="0.00"
      />
    </div>
  </div>
);
