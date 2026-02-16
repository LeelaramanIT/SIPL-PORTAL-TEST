import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ScanLine, ArrowDown, Info } from "lucide-react";
import { insertUpdateSubstitution } from "../../../../../../Redux/Slices/PPCSubstitutionMaster/PPCSubstitutionSlice";
import { useDispatch } from "react-redux";

const VerificationSider = ({ isOpen,setOpen, onClose, item, onConfirm }) => {
    if (!item) return null;
    const dispatch = useDispatch();

    const substitution = item?.substitution;
    const original = item?.original;
    const orderDetails = item?.orderDetails;

    // console.log(substitution);

    // LOGIC: Remove first 9 characters from scanned barcode
    const scannedBarcode = substitution?.barcode || "";
    const barcodeSuffix = scannedBarcode.substring(8);

    // LOGIC: Replace with original Process ID
    const targetProcessID = original?.processID || "";
    const reconstructedBarcode = `${targetProcessID}${barcodeSuffix}`;
    const handleConfirmation = () => {
        if (!substitution || !original) return;

        const payload = {
            o_Id: orderDetails.id, 
            productionId: substitution.prodId,
            oItemId: substitution.o_ItemID,
            oldBarcode: substitution.barcode,
            newBarcode: reconstructedBarcode, // confirm logic
            stencilNo: substitution.stencilNo,
            oldProcessId: substitution.stencilProcessID,
            newProcessId: original.processID,
            substitutedBy: 1,
            plant: substitution.plant
        }
        console.log(payload);

        dispatch(insertUpdateSubstitution(payload))
        setOpen(false)
    }


    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* BACKDROP - Soft Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[999]"
                    />

                    {/* PANEL */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 text-slate-900 z-[1000] shadow-2xl flex flex-col"
                    >
                        {/* HEADER - Minimalist & Clean */}
                        <div className="px-8 pt-8 pb-6 bg-white border-b border-slate-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="p-2 bg-indigo-50 rounded-lg">
                                            <ScanLine className="text-[var(--primary)] w-5 h-5" />
                                        </div>
                                        <h2 className="text-xl font-bold tracking-tight text-slate-800">
                                            Verification Portal
                                        </h2>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        orderRefNo: <span className="font-mono font-bold text-[var(--primary)] dark:text-[var(--primary)]/400">{orderDetails?.orderRefNo}</span>
                                    </p>
                                    {substitution?.substitutionstatus && (
                                        <p className="text-sm text-white bg-red-500/90 p-1 text-center rounded w-full">
                                            Already substituted
                                        </p>
                                    )}


                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 space-y-6">

                            {/* SCANNED ITEM - The "Incoming" data */}
                            <div className="relative">
                                <SectionLabel label="Current Scanned Input" color="text-rose-600" />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white border-2 border-rose-100 rounded-2xl p-6 shadow-sm ring-4 ring-rose-500/5"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            Detected Barcode
                                        </div>
                                        <span className="font-mono font-bold text-rose-600 tracking-tighter text-lg">
                                            {substitution?.barcode}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-y-3">
                                        <DataRow label="Platform" value={substitution?.config} />
                                        <DataRow label="Category" value={substitution?.category} />
                                        <DataRow label="Brand" value={substitution?.brand} />
                                        <DataRow label="Sidewall" value={substitution?.sidewall} />
                                        <DataRow label="Tyre Size" value={substitution?.tyreSize} />
                                        <DataRow label="Tyre Type" value={substitution?.tyreType} />
                                        <DataRow label="ProcessID" value={substitution?.stencilProcessID} />
                                        <DataRow label="Stencil No" value={substitution?.stencilNo} highlight />
                                    </div>
                                </motion.div>
                            </div>

                            {/* DIRECTIONAL INDICATOR */}
                            <div className="flex items-center gap-4 py-2">
                                <div className="h-[1px] flex-1 bg-slate-200"></div>
                                <div className="p-2 bg-white border border-slate-200 rounded-full shadow-sm text-[var(--primary)]">
                                    <ArrowDown size={16} className="" />
                                </div>
                                <div className="h-[1px] flex-1 bg-slate-200"></div>
                            </div>

                            {/* TARGET ITEM - The "Approved" state */}
                            <div>
                                <SectionLabel label="Target System Match" color="text-emerald-600" />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-2xs"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="px-3 py-1 bg-[var(--primary)]/10 text-green-900 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            Detected Barcode
                                        </div>
                                        <span className="font-mono font-bold tracking-tighter text-lg">
                                            {reconstructedBarcode}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-y-3">
                                        <DataRow label="Platform" value={original?.config} />
                                        <DataRow label="Category" value={original?.category} />
                                        <DataRow label="Brand" value={original?.brand} />
                                        <DataRow label="Sidewall" value={original?.sidewall} />
                                        <DataRow label="Tyre Size" value={original?.tyreSize} />
                                        <DataRow label="Tyre Type" value={original?.tyreType} />
                                        <DataRow label="Process ID" value={original?.processID} />
                                        <DataRow label="Stencil No" value={substitution?.stencilNo} highlight />
                                    </div>
                                </motion.div>
                            </div>

                            {/* INFO ALERT */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
                                <Info className="text-blue-500 shrink-0" size={18} />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Verify that the physical stencil matches the digital record before proceeding with the inventory update.
                                </p>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="p-8 bg-white border-t border-slate-200">
                            <button
                                onClick={handleConfirmation}
                                className={`w-full ${substitution?.substitutionstatus ? "bg-[var(--primary))]/50" : "bg-[var(--primary))] hover:bg-[var(--primary)]/80"}  active:scale-[0.98] transition-all text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-slate-200`}
                                disabled={substitution?.substitutionstatus}
                            >
                                <CheckCircle2 size={19} />
                                Confirm Verification
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full mt-4 text-sm font-medium text-slate-500 hover:text-rose-500 transition-colors"
                            >
                                Discard & Re-scan
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const SectionLabel = ({ label, color }) => (
    <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${color} mb-3 block ml-1`}>
        {label}
    </span>
);

const DataRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center group">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tight">{label}</span>
        <span className={`text-sm font-semibold ${highlight ? 'text-indigo-600' : 'text-slate-700'}`}>
            {value || "—"}
        </span>
    </div>
);

export default VerificationSider;