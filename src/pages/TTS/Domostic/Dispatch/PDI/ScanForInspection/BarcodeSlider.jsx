import { AnimatePresence, motion } from "framer-motion";
import {
    CheckCircle2, ClipboardCheck, ScanLine,
    X, ShieldCheck, Beaker
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export const VerificationSider = ({ isOpen = true, onClose, data, onConfirm }) => {
    const [selections, setSelections] = useState({
        detector: null,
        beadType: null,
        idGauge: null,
        bestQuality: null,
        physicalBarcode: null,
        hardnessTread: "",
        hardnessBase: "",
        remarks: ""
    });

    if (!isOpen || !data) return null;

    const isAlreadyProcessed = !data.scanStatus;

    const resetForm = () => {
        setSelections({
            detector: null, beadType: null, idGauge: null,
            bestQuality: null, physicalBarcode: null,
            hardnessTread: "", hardnessBase: "", remarks: ""
        });
        onClose();
    };

    const gread = data?.barcode?.slice(-1) || '';

    const handleUpdate = (field, value) => {
        setSelections(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // if (!selections.detector || !selections.beadType) {
        //     toast.error("Please complete the required inspection points.");
        //     return;
        // }
        const payload = {
            pid: data.pid,
            barcode: data.barcode,
            metalDetector: selections.detector === 'pass',
            o_ID: data.o_Id || 0,
            o_ItemID: data.o_ItemID || 0,
            substitutionStatus: data.substitutionStatus || false,
            idGauge: selections.idGauge === 'pass',
            earmarkStatus: data.earmarkStatus || false,
            concessionType: data.concessionType || "",
            beadType: selections.beadType === 'pass' ? "YES" : "NO",
            qualityTest: selections.bestQuality === 'pass' ? "OK" : "NOT OK",
            physical: selections.physicalBarcode === 'pass' ? "YES" : "NO",
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
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={resetForm}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999]"
                    />

                    {/* Modal Wrapper */}
                    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: "100%" }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: "100%" }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="pointer-events-auto w-full sm:max-w-2xl lg:max-w-5xl bg-white dark:bg-slate-900 sm:rounded-2xl rounded-t-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[95vh] overflow-hidden"
                        >
                            {/* Top status bar */}
                            <div className={`h-1.5 w-full shrink-0 ${isAlreadyProcessed ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                            {/* Mobile drag handle */}
                            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                                <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 bg-indigo-600 rounded-lg text-white shrink-0">
                                        <ScanLine size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase truncate">
                                            {data.barcode}
                                        </p>
                                        <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                                            Quality Verification
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    onClick={resetForm}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Body Content */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                <div className="p-5 space-y-6">
                                    
                                    {/* Info message visible on all devices if exists */}
                                    {data.infoMessage && (
                                        <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-tight text-center ${isAlreadyProcessed ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                            {data.infoMessage}
                                        </div>
                                    )}

                                    {/* Specs Section */}
                                    <div>
                                        <SectionHeader icon={<ClipboardCheck size={14} />} title="Unit Specifications" />
                                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-3">
                                            <SpecTile label="Platform" value={data.config} />
                                            <SpecTile label="Brand" value={data.brand} />
                                            <SpecTile label="Sidewall" value={data.sidewall} />
                                            <SpecTile label="Type" value={data.tyreType} />
                                            <SpecTile label="Size" value={data.tyreSize} />
                                            <SpecTile label="Rim" value={data.rimSize} />
                                            <SpecTile label="Stencil" value={data.stencilNo} highlight />
                                            <SpecTile label="Gread" value={gread} />
                                        </div>
                                    </div>

                                    {/* Main Form Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Inspection Points */}
                                        <div className="space-y-3">
                                            <SectionHeader icon={<ShieldCheck size={14} />} title="Inspection Points" />
                                            <div className="space-y-2 mt-2">
                                                <ModernRadioGroup name="detector" label="Detector Check" selectedValue={selections.detector} onChange={(val) => handleUpdate('detector', val)} />
                                                <ModernRadioGroup name="beadType" label="Bead Type" selectedValue={selections.beadType} onChange={(val) => handleUpdate('beadType', val)} />
                                                <ModernRadioGroup name="idGauge" label="ID Gauge Check" selectedValue={selections.idGauge} onChange={(val) => handleUpdate('idGauge', val)} />
                                                <ModernRadioGroup name="bestQuality" label="Quality Test (POB)" selectedValue={selections.bestQuality} onChange={(val) => handleUpdate('bestQuality', val)} />
                                                <ModernRadioGroup name="physicalBarcode" label="Physical Check" selectedValue={selections.physicalBarcode} onChange={(val) => handleUpdate('physicalBarcode', val)} />
                                            </div>
                                        </div>

                                        {/* Metrics + Remarks */}
                                        <div className="space-y-4">
                                            <div>
                                                <SectionHeader icon={<Beaker size={14} />} title="Tech Metrics" />
                                                <div className="grid grid-cols-2 gap-3 mt-3">
                                                    <MetricInput label="Hardness Tread" value={selections.hardnessTread} onChange={(e) => handleUpdate('hardnessTread', e.target.value)} />
                                                    <MetricInput label="Hardness Base" value={selections.hardnessBase} onChange={(e) => handleUpdate('hardnessBase', e.target.value)} />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                    Inspector Remarks
                                                </label>
                                                <textarea
                                                    value={selections.remarks}
                                                    onChange={(e) => handleUpdate('remarks', e.target.value)}
                                                    rows={3}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
                                                    placeholder="Enter quality notes..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer - Fixed at bottom */}
                            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <motion.button
                                        whileTap={!isAlreadyProcessed ? { scale: 0.98 } : {}}
                                        onClick={handleSubmit}
                                        disabled={isAlreadyProcessed}
                                        className={`flex-[2] py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all
                                            ${isAlreadyProcessed
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                                : 'bg-indigo-600 text-white shadow-indigo-500/25 hover:bg-indigo-700'}`}
                                    >
                                        <CheckCircle2 size={18} />
                                        {isAlreadyProcessed ? 'Already Processed' : 'Complete Inspection'}
                                    </motion.button>
                                    <button
                                        onClick={resetForm}
                                        className="flex-1 py-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {/* Added spacing for iOS home indicator */}
                                <div className="h-safe-area-inset-bottom mt-2 sm:hidden" />
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

/* --- Refined Sub-components --- */

const ModernRadioGroup = ({ name, label, selectedValue, onChange }) => (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight truncate flex-1">
            {label}
        </span>
        <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl relative shrink-0 min-w-[120px]">
            {['pass', 'fail'].map((status) => (
                <label key={status} className="flex-1 cursor-pointer relative z-10">
                    <input
                        type="radio"
                        name={name}
                        className="peer hidden"
                        value={status}
                        checked={selectedValue === status}
                        // Change: Logic to toggle null if already selected
                        onClick={() => {
                            if (selectedValue === status) {
                                onChange(null);
                            } else {
                                onChange(status);
                            }
                        }}
                        readOnly // Use onClick instead of onChange for better toggle control
                    />
                    <div className={`py-2 text-center rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${selectedValue === status ? "text-white" : "text-slate-500"}`}>
                        {status}
                    </div>
                </label>
            ))}
            
            {/* Animated Background Pill */}
            <AnimatePresence>
                {selectedValue && (
                    <motion.div
                        layoutId={`pill-${name}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`absolute inset-y-1 rounded-lg z-0 ${selectedValue === "pass" ? "bg-emerald-500" : "bg-red-500"}`}
                        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                        style={{
                            width: "calc(50% - 4px)",
                            left: selectedValue === "pass" ? "4px" : "50%",
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    </div>
);

const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-2 mb-3">
        <span className="text-indigo-500">{icon}</span>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
);

const SpecTile = ({ label, value, highlight }) => (
    <div className={`p-2.5 rounded-xl border flex flex-col justify-center items-center text-center ${highlight
        ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20'
        : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800'}`}>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 leading-tight">{value || '—'}</p>
    </div>
);

const MetricInput = ({ label, value, onChange }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type="number"
            step="0.01"
            inputMode="decimal"
            value={value}
            onChange={onChange}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="0.00"
        />
    </div>
);