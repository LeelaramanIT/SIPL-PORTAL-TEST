import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Barcode,
    Disc,
    CheckCircle2,
    RotateCcw,
    ChevronRight,
    Info
} from "lucide-react";
import { getAssyDetails } from "../../../../../Redux/Slices/PDIFitmentMaster/PDIFitmentSlice";
import { useDispatch, useSelector } from "react-redux";

export const FitmrntSlider = ({
    data = {},
    onSubmit,
    onResetTyre,
    onResetRim,
    isValid,
    onVerify,
    setIsValid
}) => {
    const { tyre, rim } = data;
    const [direction, setDirection] = useState("");
    const [barcode, setBarcode] = useState('');
    const [error, setError] = useState('');
    const [isAllow, setIsAllow] = useState(true);
    const { FitmentDetails } = useSelector(state => state.PDIFitment)

    useEffect(() => {
        if (tyre && rim) {
            onVerify();
        }
    }, [tyre, rim]);

    const isComplete = !!(tyre && rim);
    const dispatch = useDispatch();

    useEffect(() => {

        if (!tyre || !rim) return;

        if (isValid && direction) {
            getAssemblyBarcode()
        }

    }, [isValid, direction]);

    const getAssemblyBarcode = async () => {

        const payload = {
            ProcessID: tyre.processID,
            EdcNo: rim.edcNo,
            Direction: direction,
            StencilGrade: tyre?.barcode?.substring(8, 19) || "",
        }
        // console.log(payload, "from..... ass");

        const data = await dispatch(getAssyDetails(payload))
        if (data.status) {
            setBarcode(data.assemblyBarcode)
            setIsAllow(true)
            setError('')
        } else {
            setError(data.message)
            setIsAllow(false)
            setBarcode('')
        }
    }

    // console.log(tyre,rim,FitmentDetails);
    const handleConfirmation = () => {
        onSubmit({
            o_ID: FitmentDetails?.id,
            tyreBarcode: tyre?.barcode,
            rimBarcode: rim?.rimBarcode,
            assemblyBarcode: barcode,
            o_ItemID: rim?.o_ItemID || 0,
            edcNo: rim?.edcNo,
            machineId: 0,
            operatorId: 0,
            pressPressure: 0,
            temperature: 0,
            plant: FitmentDetails?.plant,
            status: "string",
            stencilNo: tyre?.barcode.substring(8, 18),
            processID: tyre?.processID,
            custCode: FitmentDetails?.custCode,
            workorderno: FitmentDetails?.workorderno,
            dispatchQty: FitmentDetails?.assemblyQty,
            rimPlant: FitmentDetails?.plant,
            inspectedby: "string"
        })
    }

    return (
        <div className="flex flex-col h-[100dvh] sm:h-full w-full overflow-hidden bg-slate-50 dark:bg-[#020617] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl">

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

                    {/* Tyre Section */}
                    <SectionCard
                        title="Tyre Specifications"
                        icon={<Barcode size={15} />}
                        onReset={onResetTyre}
                        isActive={!!tyre}
                    >
                        <AnimatePresence mode="wait">
                            {tyre ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="grid grid-cols-1 gap-y-3"
                                >
                                    <DetailGrid label="Barcode" value={tyre.barcode} highlight />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailGrid label="Size" value={tyre.tyreSize} />
                                        <DetailGrid label="Rim Req." value={tyre.rimSize} />
                                    </div>
                                    <DetailGrid label="Brand" value={tyre.brand} />
                                    <DetailGrid label="Type" value={tyre.tyreType} />
                                    <DetailGrid label="Sidewall" value={tyre.sidewall} />
                                </motion.div>
                            ) : (
                                <EmptyPlaceholder label="Awaiting Tyre Scan..." icon={<Barcode size={32} />} />
                            )}
                        </AnimatePresence>
                    </SectionCard>

                    {/* Rim Section */}
                    <SectionCard
                        title="Rim Specifications"
                        icon={<Disc size={15} />}
                        onReset={onResetRim}
                        isActive={!!rim}
                    >
                        <AnimatePresence mode="wait">
                            {rim ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="grid grid-cols-1 gap-y-3"
                                >
                                    <DetailGrid label="EDC No" value={rim.edcNo} highlight />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailGrid label="Type" value={rim.rimType} />
                                        <DetailGrid label="Color" value={rim.paintingColor} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800">
                                        <MiniStat label="Holes" value={rim.noOfMH} />
                                        <MiniStat label="PCD" value={rim.mHpcd} />
                                        <MiniStat label="Offset" value={rim.discOffSet} />
                                    </div>
                                    <DetailGrid label="Bore Dia" value={rim.boredia} />
                                    <DetailGrid label="Weight" value={rim.rimWt} />
                                </motion.div>
                            ) : (
                                <EmptyPlaceholder label="Awaiting Rim Scan..." icon={<Disc size={32} />} />
                            )}
                        </AnimatePresence>
                    </SectionCard>

                </div>
            </div>

            {/* Sticky Footer Action */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

                            {/* Direction Dropdown */}
                            <div className="flex flex-col">
                                <label className="text-xs font-bold text-slate-500 mb-1">
                                    Direction
                                </label>

                                <select
                                    value={direction}
                                    onChange={(e) => setDirection(e.target.value)}
                                    className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[var(--primary)]"
                                >
                                    <option value="">Select Direction</option>
                                    <option value="ND">NON-DIRECTIONAL</option>
                                    <option value="LH">LH</option>
                                    <option value="RH">RH</option>
                                </select>
                            </div>

                            {/* Barcode Direction Info */}
                            <div className="flex flex-col items-center justify-center">
                                <label className="text-xs font-bold text-slate-500 mb-1">
                                    Assembly Barcode
                                </label>

                                <span className={`text-sm font-bold  ${error ? 'text-red-500' : 'text-[var(--primary)]'} bg-[var(--primary)]/10 px-3 py-1 rounded-md`}>
                                    {barcode || error || "Please Select Direction"}
                                </span>
                            </div>

                            {/* Generate Button */}
                            <div className="flex justify-end">
                                <button onClick={handleConfirmation} disabled={!isValid || !direction || !isAllow}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold transition-all ${isValid && direction && isAllow ? "bg-indigo-600 hover:bg-indigo-500" : "bg-red-400 cursor-not-allowed"} shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-[0.98] `} >
                                    <CheckCircle2 size={18} /> Generate Assembly Barcode </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ---------- Sub-Components (Clean & Modular) ---------- */

const SectionCard = ({ title, icon, children, onReset, isActive }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100 font-bold">
                <span className="p-2 rounded-lg bg-[var(--primary)]/10 dark:bg-slate-800 text-[var(--primary)]">
                    {icon}
                </span>
                {title}
            </div>
            {isActive && (
                <button
                    onClick={onReset}
                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                    title="Reset Section"
                >
                    <RotateCcw size={16} />
                </button>
            )}
        </div>
        {children}
    </div>
);

const DetailGrid = ({ label, value, highlight = false }) => (
    <div className={`flex items-center justify-between p-2 rounded-lg ${highlight ? 'bg-[var(--primary)]/10 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/20' : ''}`}>
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            {label}
        </span>
        <span className={`text-sm font-semibold font-mono ${highlight ? 'text-[var(--primary)] dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
            {value || "—"}
        </span>
    </div>
);

const MiniStat = ({ label, value }) => (
    <div className="text-center">
        <div className="text-[10px] uppercase text-slate-400 mb-0.5">{label}</div>
        <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{value || "—"}</div>
    </div>
);

const EmptyPlaceholder = ({ label, icon }) => (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
        <div className="text-slate-200 dark:text-slate-700 mb-3">
            {icon}
        </div>
        <p className="text-sm text-slate-400 font-medium italic">{label}</p>
    </div>
);