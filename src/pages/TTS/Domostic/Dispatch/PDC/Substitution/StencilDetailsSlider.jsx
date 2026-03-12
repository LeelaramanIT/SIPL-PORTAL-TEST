import { AnimatePresence, motion } from "framer-motion";
import {
    X, ScanLine, FileText, Download,
    CheckCircle2, AlertCircle, Clock, Hash, User,
    Barcode
} from "lucide-react";
import { DynamicDataTable } from "../../../../../../components/DynamicDataTable";
import { useState } from "react";
import * as XLSX from 'xlsx';
import toast from "react-hot-toast";

export const StencilDetailsSlider = ({ isOpen = false, onClose, data = {} }) => {
    const [isExporting, setIsExporting] = useState(false);

    // Updated Columns with modern status rendering
    const columns = [
        {
            header: "Stencil Number",
            accessor: "stencilNo",
            width: "1fr",
            align: "center",
            render: (value) => (
                <div className="flex items-center justify-center gap-2">
                    <Hash size={12} className="text-indigo-400" />
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{value}</span>
                </div>
            )
        },
        {
            header: "Category",
            accessor: "category",
            width: "0.7fr",
            align: "center",
        },
        {
            header: "Config",
            accessor: "config",
            width: "0.5fr",
            align: "center",
        },
        {
            header: "Tyre Size",
            accessor: "tyreSize",
            width: "1fr",
            align: "center",
        },
        {
            header: "Rim",
            accessor: "tyreRim",
            width: "0.5fr",
            align: "center",
        },
        {
            header: "Brand",
            accessor: "brand",
            width: "1fr",
            align: "center",
        },
        {
            header: "Sidewall",
            accessor: "sidewall",
            width: "1fr",
            align: "center",
        },
        {
            header: "Process ID",
            accessor: "stencilProcessID",
            width: "1fr",
            align: "center",
        },
        {
            header: "Status",
            accessor: "substitutionstatus",
            width: "1.3fr",
            align: "center",
            render: (value) => <StatusBadge status={value} />
        },
    ];

    const stencilList = data?.substitutions || [];

    // --- Excel Download Logic ---
    const handleDownload = async () => {
        if (stencilList.length === 0) {
            toast.error("No data found to export");
            return;
        }

        setIsExporting(true);

        try {
            // Prepare the data for Excel
            const reportData = stencilList.map((item) => ({
                "Stencil Number": item.stencilNo,
                "Category": item.category,
                "Config": item.config,
                "Tyre Size": item.tyreSize,
                "Rim": item.tyreRim,
                "Brand": item.brand,
                "Sidewall": item.sidewall,
                "Process ID": item.stencilProcessID,
                "Status": String(item.substitutionstatus) === "true" ? "Verified" : "Waiting",
                "Customer": data?.customerName || "N/A",
                "Order Reference": data?.orderReference || "N/A",
                "Work Order": data?.workOrder || "N/A",
                // "Export Date": new Date().toLocaleString()
            }));

            // Create Worksheet
            const worksheet = XLSX.utils.json_to_sheet(reportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Stencil Details");

            // Buffer for a smoother feel
            await new Promise(resolve => setTimeout(resolve, 600));

            // Save File
            XLSX.writeFile(workbook, `Stencil_Report_${data.workOrder || 'Export'}.xlsx`);
            toast.success("Excel file generated!");
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Failed to export data");
        } finally {
            setIsExporting(false);
        }
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with stronger blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        // onClick={onClose}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[999]"
                    />

                    {/* Slider Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[1000px] bg-slate-50 dark:bg-[#0b1120] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-[1000] flex flex-col border-l border-slate-200 dark:border-slate-800"
                    >
                        {/* Modern Header Section */}
                        <div className="relative p-8 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {/* Changed icon to ScanLine for a 'substitution' feel */}
                                        <ScanLine size={24} className="text-[var(--primary)] dark:text-indigo-400" />

                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                                            Substitution <span className="text-[var(--primary)] dark:text-indigo-400">Log</span>
                                        </h2>
                                    </div>

                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] ml-1">
                                        Replacement & Verification
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ rotate: 90, scale: 1.1, backgroundColor: '#f1f5f9' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2.5 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 transition-colors"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            {/* Tracking Info Cards - Improved Visual Depth */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <InfoCard
                                    icon={<User size={14} />}
                                    label="Customer"
                                    value={data?.customerName}
                                    variant="indigo"
                                />
                                <InfoCard
                                    icon={<FileText size={14} />}
                                    label="Order Ref"
                                    value={data?.orderReference}
                                />
                                <InfoCard
                                    icon={<Hash size={14} />}
                                    label="Work Order"
                                    value={data?.workOrder}
                                />
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 px-8 pt-4 space-y-4 flex flex-col min-h-0"> {/* Added flex flex-col min-h-0 */}

                            {/* Table Actions */}
                            <div className="flex justify-between items-end px-1 flex-shrink-0"> {/* flex-shrink-0 keeps header fixed */}
                                <div className="space-y-1">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--primary)]">
                                        Inventory List
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-medium italic">
                                        Showing {stencilList.length} total entries
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDownload}
                                    disabled={isExporting}
                                    className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg 
                                        ${isExporting
                                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                            : 'bg-[var(--primary)] text-white shadow-indigo-500/20 hover:shadow-indigo-500/40'}`}
                                >
                                    {isExporting ? (
                                        <div className="h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Download size={14} />
                                    )}
                                    {isExporting ? 'Exporting...' : 'Export Excel'}
                                </motion.button>
                            </div>

                            {/* Modern Table Container - FIXED SCROLLING HERE */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex-1 min-h-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden"
                            >
                                <DynamicDataTable
                                    columns={columns}
                                    headerClassName="bg-[var(--primary)] text-[var(--text)] text-[10px] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800"
                                    data={stencilList}
                                    loading={false}
                                    visibleRows={stencilList.length} // Let the container handle the scroll
                                />
                            </motion.div>
                        </div>

                        {/* Minimal Footer */}
                        <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center opacity-50">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-800">System Verified</span>
                                <span className="text-[9px] font-bold text-slate-800">{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

/* --- Modern Sub-Components --- */

const InfoCard = ({ icon, label, value, variant = "default" }) => {
    const isIndigo = variant === "indigo";
    return (
        <div className={`p-4 rounded-2xl border transition-all ${isIndigo
            ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20"
            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
            }`}>
            <div className={`flex items-center gap-2 mb-2 ${isIndigo ? "text-[var(--primary)] dark:text-indigo-400" : "text-slate-400"}`}>
                {icon}
                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{label}</span>
            </div>
            <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {value || "—"}
            </p>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    // Map boolean true/false to specific styles
    const config = {
        true: {
            label: "Changed",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            text: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-100 dark:border-emerald-500/20",
            icon: <CheckCircle2 size={12} />
        },
        false: {
            label: "Waiting",
            bg: "bg-rose-50 dark:bg-rose-500/10",
            text: "text-rose-600 dark:text-rose-400",
            border: "border-rose-100 dark:border-rose-500/20",
            icon: <AlertCircle size={12} />
        }
    };

    // Convert potential string "true"/"false" or boolean true/false to a key
    const state = config[String(status)] || config.false;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm transition-all ${state.bg} ${state.text} ${state.border}`}
        >
            {state.icon}
            {state.label}
        </motion.div>
    );
};