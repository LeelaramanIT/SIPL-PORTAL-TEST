import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getSubstitutionDetails } from '../../../../../../Redux/Slices/PPCSubstitutionMaster/PPCSubstitutionSlice'
import { formatDateTime } from '../../../../../../utils/FormatDate'
import { ArrowLeft, ClipboardList, Search, CheckCircle2, Package, ScanLine } from 'lucide-react'
import { DynamicDataTable } from '../../../../../../components/DynamicDataTable'
import { motion, AnimatePresence } from 'framer-motion'
import { AiOutlineBarcode, AiOutlineCalendar, AiOutlineClockCircle, AiOutlineFileText, AiOutlineUser } from 'react-icons/ai'
import { FaClipboardList } from 'react-icons/fa'
import { FiPackage } from 'react-icons/fi'
import SearchBar from '../../../../../../components/SearchBar'

const SubstitutionDetails = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [localSearch, setLocalSearch] = useState("");
    const { SubstitutionDetails } = useSelector(state => state.PPCSubstitution)
    const [ scanInput, setScanInput ] = useState('')

    const fadeUp = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
    }

    const items = useMemo(() => {
        if (!SubstitutionDetails?.items) return []
        const term = localSearch.toLowerCase()
        return SubstitutionDetails.items.filter(item =>
            item.tyreSize?.toLowerCase().includes(term) ||
            item.platform?.toLowerCase().includes(term) ||
            item.tyreType?.toLowerCase().includes(term)
        )
    }, [localSearch, SubstitutionDetails])

    useEffect(() => {
        if (location.state) {
            dispatch(getSubstitutionDetails(location.state))
        }
    }, [location.state, dispatch])

    const handleScan = (e) => {
        if (e.key === 'Enter' && scanInput.trim()) {
            // Logic for scanning goes here
            setScanInput('')
        }
    }

    const columns = [
        { header: "Process ID", accessor: "processId", width: "2fr", align: "center", title: 'process ID' },
        { header: "PLATFORM", accessor: "config", width: "2fr", align: "center", title: 'PLATFORM' },
        { header: "TYRE SIZE", accessor: "tyreSize", width: "2fr", align: "center" },
        { header: "RIM", accessor: "tyreRim", width: "2fr", align: "center" },
        { header: "TYPE", accessor: "tyreType", width: "2fr", align: "center" },
        { header: "TOTAL QTY", accessor: "itemQty", width: "2fr", align: "center",
          render: (val) => <span className="font-bold text-[var(--primary))] dark:text-blue-400">{val || 0}</span>
         },
         { header: "SUBSTITUTION QTY", accessor: "substitutionQty", width: "2fr", align: "center",
          render: (val) => <span className="font-bold text-[var(--primary))] dark:text-blue-400">{val || 0}</span>
         },
    ]

    return (
        <div className="min-h-[calc(100vh-62px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <div className="max-w-[1550px] mx-auto p-3 sm:p-3 space-y-3">

                {/* --- HEADER SECTION --- */}
                <motion.header
                    variants={fadeUp} initial="hidden" animate="show"
                    className="flex  flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 group"
                        >
                            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400 group-hover:text-blue-500" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <ClipboardList className="text-[var(--primary)]" size={20} />
                                Inspection Portal
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Order Ref: <span className="font-bold text-[var(--primary)] dark:text-slate-200">{SubstitutionDetails?.orderRefNo || 'N/A'}</span></p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--primary)] dark:text-[var(--primary)]/400">Scan Progress</p>
                            <p className="text-sm font-semibold">45 / {SubstitutionDetails?.itemQty || 0} Units</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-[var(--primary)] dark:border-blue-[var(--primary)] border-t-transparent animate-spin-slow hidden sm:block" />
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* --- LEFT COLUMN: INFO & SCANNING --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Customer Card */}
                        <motion.section
                            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                <h2 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <AiOutlineUser className="text-[var(--primary)]" /> Customer Details
                                </h2>
                            </div>
                            <div className="p-5 space-y-4">
                                <DetailItem icon={<AiOutlineUser />} label="Full Name" value={SubstitutionDetails?.custfullname} />
                                <DetailItem icon={<FaClipboardList />} label="Work Order" value={SubstitutionDetails?.workOrderNo} />
                                <DetailItem icon={<FiPackage />} label="Order Quantity" value={SubstitutionDetails?.itemQty} />
                                <DetailItem icon={<AiOutlineCalendar />} label="desired ShipDate" value={formatDateTime(SubstitutionDetails?.desiredShipDate)} />
                            </div>
                        </motion.section>

                        {/* Scan Input Card */}
                        <motion.section
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            transition={{ delay: 0.2 }}
                            className="relative bg-[var(--primary)] rounded-xl shadow-lg p-6 text-white overflow-hidden group"
                        >
                            {/* --- Barcode Corner Brackets --- */}
                            {/* Top Left */}
                            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/60 rounded-tl-lg" />
                            {/* Top Right */}
                            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/60 rounded-tr-lg" />
                            {/* Bottom Left */}
                            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/60 rounded-bl-lg" />
                            {/* Bottom Right */}
                            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/60 rounded-br-lg" />

                            {/* --- Animated Scanning Laser Line --- */}
                            <motion.div
                                animate={{ top: ['10%', '90%', '10%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent shadow-[0_0_8px_rgba(248,113,113,0.8)] z-0 opacity-50"
                            />

                            <div className="relative z-10 px-3 py-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <ScanLine size={20} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <h2 className="text-md font-semibold leading-none">Quick Scan</h2>
                                        <span className="text-[10px] opacity-70 uppercase tracking-widest">Ready to Capture</span>
                                    </div>
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={scanInput}
                                        onChange={(e) => setScanInput(e.target.value)}
                                        onKeyDown={handleScan}
                                        placeholder="Align barcode and scan..."
                                        className="w-full bg-black/20 border border-white/30 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all backdrop-blur-md"
                                        autoFocus
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <kbd className="hidden sm:inline-block px-2 py-1 bg-white/20 rounded text-[10px] border border-white/30 font-sans opacity-80">
                                            ENTER
                                        </kbd>
                                    </div>
                                </div>

                                <p className="text-[11px] text-white/70 mt-3 flex items-center gap-1.5 italic">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    System online: Waiting for input
                                </p>
                            </div>
                        </motion.section>
                    </div>

                    {/* --- RIGHT COLUMN: DATA TABLE --- */}
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}
                        className="lg:col-span-8 space-y-2"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:py-6">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                                {/* Left Side: Title & Description */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                                            <Package size={22} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                                Items List
                                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                    <span className="text-xs font-bold text-[var(--primary)]">{items.length}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">OF</span>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{SubstitutionDetails?.itemQty || 0}</span>
                                                </div>
                                            </h2>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                Filter and verify individual SKU details
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Search Bar */}
                                <div className="relative w-full md:w-80 group">
                                    <div className="absolute -top-5 right-0 text-[10px] font-bold uppercase tracking-widest text-slate-400 group-focus-within:text-[var(--primary)] transition-colors">
                                        Quick Search
                                    </div>
                                    <div className="relative shadow-sm group-focus-within:shadow-md transition-shadow duration-300 rounded-xl">
                                        <SearchBar
                                            onChange={(e) => setLocalSearch(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                                <div className="h-[24rem]">
                                    <DynamicDataTable
                                        columns={columns}
                                        data={items}
                                        headerClassName='bg-[var(--primary)] text-white dark:bg-slate-950 shadow-md'
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

/** Helper Component for Details */
const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 group">
        <div className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{value || '—'}</p>
        </div>
    </div>
)



export default SubstitutionDetails

// import { motion, AnimatePresence } from 'framer-motion';
// import { X, CheckCircle2, ScanLine, AlertCircle } from 'lucide-react';

export const VerificationSider = ({ isOpen, onClose, item, onConfirm }) => {
    if (!item) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999]"
                    />

                    {/* Sliding Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-[1000] flex flex-col border-l border-slate-200 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                    <ScanLine className="text-[var(--primary)]" size={24} />
                                    Scan Verified
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review item details before processing</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Visual Indicator of the ID */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30 text-center">
                                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-widest">Process ID Detected</span>
                                <p className="text-3xl font-mono font-bold text-slate-800 dark:text-white mt-1 uppercase">
                                    {item.processId}
                                </p>
                            </div>

                            {/* Data Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                <InfoBlock label="Platform / Configuration" value={item.config} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoBlock label="Tyre Size" value={item.tyreSize} />
                                    <InfoBlock label="Rim" value={item.tyreRim} />
                                </div>
                                <InfoBlock label="Tyre Type" value={item.tyreType} />
                            </div>

                            {/* Safety Check */}
                            <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex gap-3">
                                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                <p className="text-xs text-amber-800 dark:text-amber-200">
                                    Ensure the physical barcode matches the digital record above before submitting.
                                </p>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <button 
                                onClick={onConfirm}
                                className="w-full bg-[var(--primary)] hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                <CheckCircle2 size={20} />
                                Submit Verification
                            </button>
                            <button 
                                onClick={onClose}
                                className="w-full mt-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
                            >
                                Cancel & Discard
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

/* Helper Sub-component */
const InfoBlock = ({ label, value }) => (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
        <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value || 'N/A'}</p>
    </div>
);
