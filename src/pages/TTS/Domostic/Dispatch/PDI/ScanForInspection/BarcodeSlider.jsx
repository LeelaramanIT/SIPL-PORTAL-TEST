import { AnimatePresence, motion } from "framer-motion";
import {
    Activity, CheckCircle2, ClipboardCheck, ScanLine,
    X, AlertCircle, MapPin, ShieldCheck, Beaker
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
            detector: null,
            beadType: null,
            idGauge: null,
            bestQuality: null,
            physicalBarcode: null,
            hardnessTread: "",
            hardnessBase: "",
            remarks: ""
        });
        onClose();
    };

    const handleUpdate = (field, value) => {
        setSelections(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const isFormValid = selections.detector && selections.beadType;

        if (!isFormValid) {
            toast.error("Please complete the required inspection points.");
            return;
        }

        const payload = {
            pid: data.pid,
            barcode: data.barcode,
            metalDetector: selections.detector === 'pass',
            o_ID: data.o_Id || 0,
            o_ItemID: data.o_ItemID || 0,
            substitutionStatus: data.substitutionStatus || false,
            idGauge: selections.idGauge === 'pass',
            earmarkStatus: data.earmarkStatus || false,
            concessionType: data.concessionType || "string",
            beadType: selections.beadType === 'pass' ? "YES" : "NO",
            qualityTest: selections.bestQuality === 'pass' ? "OK" : "NOT OK",
            physical: selections.physicalBarcode === 'pass' ? "YES" : "NO",
            remarks: selections.remarks || "string",
            pdiPlant: data.pdiPlant || "string",
            custcode: data.custcode || "string",
            workorderno: data.workorderno || "string",
            orderQty: data.orderQty || 0,
            orderrefno: data.orderrefno || "string",
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
                        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[999]"
                    />

                    {/* Sider Container */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white dark:bg-slate-950 shadow-2xl z-[1000] flex flex-col border-l border-slate-200 dark:border-slate-800"
                    >
                        {/* Top Status Bar */}
                        <div className={`h-1.5 shrink-0 w-full ${isAlreadyProcessed ? 'bg-amber-500' : 'bg-green-500'}`} />

                        {/* Header - Responsive Padding */}
                        <div className="p-5 sm:p-8 pb-4 flex justify-between items-start shrink-0">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20 shrink-0">
                                        <ScanLine size={18} />
                                    </div>
                                    <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-slate-400 uppercase truncate">
                                        {data.barcode}
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Quality Verification
                                </h2>
                                {data.infoMessage && (
                                    <p className={`text-[10px] sm:text-[11px] font-bold ${isAlreadyProcessed ? 'text-red-500' : 'text-green-500'} mt-1 uppercase tracking-tighter`}>
                                        {data.infoMessage}
                                    </p>
                                )}
                            </div>
                            
                            <motion.button
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={resetForm}
                                className="ml-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 shrink-0"
                            >
                                <X size={20} />
                            </motion.button>
                        </div>

                        {/* Content Area - Custom Scrollbar */}
                        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-4 space-y-8 custom-scrollbar">
                            
                            {/* Specs Section - Adaptive Grid */}
                            <section>
                                <SectionHeader icon={<ClipboardCheck size={16} />} title="Unit Specifications" />
                                <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 sm:gap-3 mt-5">
                                    <SpecTile label="Platform" value={data.config} />
                                    <SpecTile label="Brand" value={data.brand} />
                                    <SpecTile label="Sidewall" value={data.sidewall} />
                                    <SpecTile label="Type" value={data.tyreType} />
                                    <SpecTile label="Tyre Size" value={data.tyreSize} />
                                    <SpecTile label="Rim Size" value={data.rimSize} />
                                    <SpecTile label="Stencil No" value={data.stencilNo} highlight />
                                </div>
                            </section>

                            {/* Inspection Points */}
                            <section>
                                <SectionHeader icon={<ShieldCheck size={16} />} title="Inspection Points" />
                                <p className="text-[10px] text-slate-400 mb-4 mt-1 font-medium italic">Select verification status:</p>
                                <div className="space-y-3">
                                    <ModernRadioGroup name="detector" label="Detector Check" selectedValue={selections.detector} onChange={(val) => handleUpdate('detector', val)} />
                                    <ModernRadioGroup name="beadType" label="Bead Type" selectedValue={selections.beadType} onChange={(val) => handleUpdate('beadType', val)} />
                                    <ModernRadioGroup name="idGauge" label="ID Gauge Check" selectedValue={selections.idGauge} onChange={(val) => handleUpdate('idGauge', val)} />
                                    <ModernRadioGroup name="bestQuality" label="Quality Test (POB)" selectedValue={selections.bestQuality} onChange={(val) => handleUpdate('bestQuality', val)} />
                                    <ModernRadioGroup name="physicalBarcode" label="Physical Check" selectedValue={selections.physicalBarcode} onChange={(val) => handleUpdate('physicalBarcode', val)} />
                                </div>
                            </section>

                            {/* Measurement Section */}
                            <section className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 mb-24">
                                <div className="flex items-center gap-2 mb-6">
                                    <Beaker size={16} className="text-indigo-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tech Metrics</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <MetricInput label="Hardness Tread" value={selections.hardnessTread} onChange={(e) => handleUpdate('hardnessTread', e.target.value)} />
                                    <MetricInput label="Hardness Base" value={selections.hardnessBase} onChange={(e) => handleUpdate('hardnessBase', e.target.value)} />
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Inspector Remarks</label>
                                        <textarea
                                            value={selections.remarks}
                                            onChange={(e) => handleUpdate('remarks', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                                            placeholder="Enter quality notes..."
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Sticky Footer - Responsive Height */}
                        <div className="shrink-0 p-5 sm:p-8 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
                            <motion.button
                                whileHover={!isAlreadyProcessed ? { scale: 1.01 } : {}}
                                whileTap={!isAlreadyProcessed ? { scale: 0.98 } : {}}
                                onClick={handleSubmit}
                                disabled={isAlreadyProcessed}
                                className={`w-full py-4 sm:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all
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

/* --- Sub-Components (Unchanged logic, minor CSS tweaks) --- */

const ModernRadioGroup = ({ name, label, selectedValue, onChange }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight truncate">
                {label}
            </span>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl relative w-full sm:w-auto min-h-[36px]">
                {['pass', 'fail'].map((status) => (
                    <label key={status} className="flex-1 sm:flex-none cursor-pointer relative z-10">
                        <input
                            type="radio"
                            name={name}
                            className="peer hidden"
                            value={status}
                            checked={selectedValue === status}
                            onChange={() => onChange(status)}
                        />
                        <div className={`px-4 py-1.5 text-center rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${selectedValue === status ? "text-white" : "text-slate-400"}`}>
                            {status}
                        </div>
                    </label>
                ))}
                {selectedValue && (
                    <motion.div
                        layoutId={`pill-${name}`}
                        className={`absolute inset-y-1 rounded-lg z-0 ${selectedValue === "pass" ? "bg-emerald-500" : "bg-red-500"}`}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        style={{
                            width: "calc(50% - 4px)",
                            left: selectedValue === "pass" ? "4px" : "50%",
                        }}
                    />
                )}
            </div>
        </div>
    );
};

const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-3">
        <span className="text-indigo-600 dark:text-indigo-400 shrink-0">{icon}</span>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">{title}</h3>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
    </div>
);

const SpecTile = ({ label, value, highlight }) => (
    <div className={`p-2 rounded-lg border ${highlight ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-500/5 dark:border-indigo-500/20' : 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800'}`}>
        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">{label}</p>
        <p className="text-[11px] sm:text-[12px] font-black text-slate-800 dark:text-slate-200 truncate">{value || '—'}</p>
    </div>
);

const MetricInput = ({ label, value, onChange }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
        <input
            type="number"
            step="0.01"
            value={value}
            onChange={onChange}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="0.00"
        />
    </div>
);