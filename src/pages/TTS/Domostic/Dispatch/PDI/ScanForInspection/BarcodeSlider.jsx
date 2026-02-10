import { AnimatePresence, motion } from "framer-motion";
import {
    Activity, CheckCircle2, ClipboardCheck, ScanLine,
    X, AlertCircle, MapPin, ShieldCheck, Beaker
} from "lucide-react";
import { useState } from "react";

export const VerificationSider = ({ isOpen = true, onClose, data, onConfirm }) => {
    const [selections, setSelections] = useState({
        detector: null,
        beadType: null,
        idGauge: null,
        bestQuality: null,
        physicalBarcode: null
    });

    if (!isOpen || !data) return <AnimatePresence />;
    
    const isAlreadyProcessed = data.scanDispatch;
    // const isPOB = data.config?.toUpperCase().includes("POB");

    const handlesubmit = () => {

    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[999]"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white dark:bg-slate-950 shadow-2xl z-[1000] flex flex-col border-l border-slate-200 dark:border-slate-800"
                    >
                        <div className={`h-1.5 w-full ${isAlreadyProcessed ? 'bg-amber-500' : 'bg-indigo-600'}`} />

                        {/* Header */}
                        <div className="p-8 pb-4 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                                        <ScanLine size={18} />
                                    </div>
                                    <span className="font-mono text-[1rem] font-bold tracking-widest text-slate-400 uppercase">
                                        {data.barcode}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Quality Verification
                                </h2>
                                {data.infoMessage && (
                                    <p className="text-[11px] font-bold text-indigo-500 mt-1 uppercase tracking-tighter">
                                        {data.infoMessage}
                                    </p>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400"
                            >
                                <X size={20} />
                            </motion.button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 custom-scrollbar pb-32">

                            {/* Specs Section */}
                            <section>
                                <SectionHeader icon={<ClipboardCheck size={16} />} title="Unit Specifications" />
                                <div className="grid grid-cols-3 gap-3 mt-5">
                                    <SpecTile label="Platform" value={data.config} />
                                    <SpecTile label="Brand" value={data.brand} />
                                    <SpecTile label="Tyre Size" value={data.tyreSize} />
                                    <SpecTile label="Stencil No" value={data.stencilNo} highlight />
                                </div>
                            </section>

                            {/* MODERN RADIO INSPECTION POINTS */}
                            <section>
                                <SectionHeader icon={<ShieldCheck size={16} />} title="Inspection Points" />
                                <p className="text-[10px] text-slate-400 mb-4 mt-1 font-medium italic">Select verification status for each point:</p>

                                <div className="space-y-2">
                                    <ModernRadioGroup name="detector" label="Detector Check" onChange={()=>{}} />
                                    <ModernRadioGroup name="beadType" label="Bead Type" />
                                    <ModernRadioGroup name="idGauge" label="ID Gauge Check" />

                                    {/* Conditional POB Row */}

                                    <ModernRadioGroup name="bestQuality" label="Best Quality Test" />
                                    {/* {isPOB && (
                                        <ModernRadioGroup name="bestQuality" label="Best Quality Test" />
                                    )} */}

                                    <ModernRadioGroup name="physicalBarcode" label="Physical Barcode Check" />
                                </div>
                            </section>

                            {/* Measurement Section */}
                            <section className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-6">
                                    <Beaker size={16} className="text-indigo-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tech Metrics</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <MetricInput label="Hardness Tread" />
                                    <MetricInput label="Hardness Base" />
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Inspector Remarks</label>
                                        <textarea className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]" placeholder="Enter quality notes..." />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
                            <motion.button
                                whileHover={!isAlreadyProcessed ? { scale: 1.02 } : {}}
                                whileTap={!isAlreadyProcessed ? { scale: 0.98 } : {}}
                                onClick={onConfirm}
                                disabled={isAlreadyProcessed}
                                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all
                                    ${isAlreadyProcessed
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                        : 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'}`}
                            >
                                <CheckCircle2 size={18} />
                                {isAlreadyProcessed ? 'Already Processed' : 'Complete Inspection'}
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

/* --- Modern UI Components --- */

const ModernRadioGroup = ({ name, label, selectedValue, onChange }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                {label}
            </span>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl relative">
                {/* Option: Pass */}
                <label className="cursor-pointer relative z-10">
                    <input 
                        type="radio" 
                        name={name} 
                        className="peer hidden" 
                        value="pass" 
                        onChange={() => onChange("pass")}
                        checked={selectedValue === "pass"}
                    />
                    <motion.div 
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                            selectedValue === "pass" ? "text-white" : "text-slate-400"
                        }`}
                    >
                        Pass
                    </motion.div>
                </label>

                {/* Option: Fail */}
                <label className="cursor-pointer relative z-10">
                    <input 
                        type="radio" 
                        name={name} 
                        className="peer hidden" 
                        value="fail" 
                        onChange={() => onChange("fail")}
                        checked={selectedValue === "fail"}
                    />
                    <motion.div 
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                            selectedValue === "fail" ? "text-white" : "text-slate-400"
                        }`}
                    >
                        Fail
                    </motion.div>
                </label>

                {/* The Sliding Pill Background */}
                {selectedValue && (
                    <motion.div
                        layoutId={`pill-${name}`} // Unique ID so pills don't jump between different rows
                        className={`absolute inset-y-1 rounded-lg z-0 ${
                            selectedValue === "pass" ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        style={{
                            width: "calc(50% - 4px)",
                            left: selectedValue === "pass" ? "4px" : "50%",
                        }}
                    />
                )}
            </div>
        </motion.div>
    );
};

const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-3">
        <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">{title}</h3>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
    </div>
);

const SpecTile = ({ label, value, highlight }) => (
    <div className={`p-2 rounded-lg border ${highlight ? 'bg-[var(--primary)]/20 border-indigo-100 dark:bg-indigo-500/5 dark:border-indigo-500/20' : 'bg-[var(--primary)]/10 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800'}`}>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-[12px] font-black text-slate-800 dark:text-slate-200 truncate">{value || '—'}</p>
    </div>
);

const MetricInput = ({ label }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
        <input type="number" step="0.01" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="0.00" />
    </div>
);