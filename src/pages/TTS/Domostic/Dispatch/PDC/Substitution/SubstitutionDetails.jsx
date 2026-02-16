import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getSubstitutionDetails, resetSelectedData, setSelectedData } from '../../../../../../Redux/Slices/PPCSubstitutionMaster/PPCSubstitutionSlice'
import { formatDateTime } from '../../../../../../utils/FormatDate'
import { ArrowLeft, ClipboardList, Search, CheckCircle2, Package, ScanLine } from 'lucide-react'
import { DynamicDataTable } from '../../../../../../components/DynamicDataTable'
import { motion, AnimatePresence } from 'framer-motion'
import { AiOutlineBarcode, AiOutlineCalendar, AiOutlineClockCircle, AiOutlineFileText, AiOutlineUser } from 'react-icons/ai'
import { FaClipboardList } from 'react-icons/fa'
import { FiPackage } from 'react-icons/fi'
import SearchBar from '../../../../../../components/SearchBar'
import toast from 'react-hot-toast'
import VerificationSider from './VerificationSider'


const SubstitutionDetails = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [localSearch, setLocalSearch] = useState("");
    const { SubstitutionDetails, selectedData } = useSelector(state => state.PPCSubstitution)
    const [scanInput, setScanInput] = useState('')
    const { loading } = useSelector(state => state.PPCMaster)
    const [open, setOpen] = useState(false)
    // const [selectedData, setSelectedData] = useState(null)


    const fadeUp = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
    }
    console.log(SubstitutionDetails);

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
        if (e.key === "Enter" && scanInput.trim()) {
            const scannedCode = scanInput.trim().toUpperCase()

            // Check if the input is exactly 19 characters long
            if (scannedCode.length !== 19) {
                toast.error("Barcode must be 19 characters long")
                setScanInput("")  // Clear the input if invalid
                return
            }

            let foundSubstitution = null
            let parentItem = null

            // Loop through items
            for (const item of SubstitutionDetails?.items || []) {
                const match = item.substitutions?.find(
                    sub => sub.barcode?.toUpperCase() === scannedCode
                )

                if (match) {
                    foundSubstitution = match
                    parentItem = item
                    break
                }
            }

            if (foundSubstitution) {
                console.log("Matched Substitution:", foundSubstitution)
                console.log("Parent Item:", parentItem)
                dispatch(resetSelectedData())
                dispatch(setSelectedData({
                    substitution: foundSubstitution,
                    original: parentItem,
                    orderDetails: SubstitutionDetails
                }))
                setOpen(true)
            } else {
                toast.error("Barcode not found in this order")
            }

            setScanInput("")
        }
    }



    const columns = [
        { header: "Process ID", accessor: "processID", width: "2fr", align: "center", title: 'process ID' },
        { header: "PLATFORM", accessor: "config", width: "2fr", align: "center", title: 'PLATFORM' },
        { header: "TYRE SIZE", accessor: "tyreSize", width: "2fr", align: "center" },
        { header: "RIM", accessor: "tyreRim", width: "2fr", align: "center" },
        { header: "TYPE", accessor: "tyreType", width: "2fr", align: "center" },
        {
            header: "TOTAL QTY", accessor: "totaqty", width: "2fr", align: "center",
            render: (val) => <span className="font-bold text-[var(--primary))] dark:text-blue-400">{val || 0}</span>
        },
        {
            header: "SUBSTITUTION QTY", accessor: "substitutionQty", width: "2fr", align: "center",
            render: (val) => <span className="font-bold text-[var(--primary))] dark:text-blue-400">{val || 0}</span>
        },
    ]

    const totalQty = SubstitutionDetails?.items.reduce((acc, item) => acc + (item.totaqty || 0), 0)
    const subQty = SubstitutionDetails?.items.reduce((acc, item) => acc + (item.substitutionQty || 0), 0)
    const percentage =
        totalQty > 0 ? (subQty / totalQty) * 100 : 0;



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
                                Substitution Portal
                            </h1>
                            {loading ? (
                                /* Skeleton Order Ref */
                                <div className="flex items-center gap-1.5 animate-pulse">
                                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="h-3 w-24 bg-slate-300 dark:bg-slate-600 rounded font-bold" />
                                </div>
                            ) : (
                                /* Actual UI */
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Order Ref: <span className="font-bold text-[var(--primary)] dark:text-slate-200">
                                        {SubstitutionDetails?.orderRefNo || 'N/A'}
                                    </span>
                                </p>
                            )}
                            {/* <p className="text-sm text-slate-500 dark:text-slate-400">Order Ref: <span className="font-bold text-[var(--primary)] dark:text-slate-200">{SubstitutionDetails?.orderRefNo || 'N/A'}</span></p> */}
                        </div>
                    </div>

                    {loading ? (
                        <ScanProgressLoading />
                    ) : (
                        <div className="flex items-center gap-3 bg-[var(--primary)]/10 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800/30">
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--primary)] dark:text-[var(--primary)]/400">Scan Progress</p>
                                <p className="text-sm font-semibold">{subQty || 0} / {totalQty || 0} Units</p>
                            </div>
                            <div className="relative w-10 h-10 hidden sm:block">
                                <div
                                    className="w-full h-full rounded-full"
                                    style={{
                                        background: `conic-gradient(var(--primary) ${percentage}%, #e5e7eb ${percentage}%)`,
                                    }}
                                />
                                <div className="absolute inset-1 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                                    <span className="text-[10px] font-bold">
                                        {Math.round(percentage)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

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
                                <DetailItem loading={loading} icon={<AiOutlineUser />} label="Full Name" value={SubstitutionDetails?.custfullname} />
                                <DetailItem loading={loading} icon={<FaClipboardList />} label="Order Ref No" value={SubstitutionDetails?.orderRefNo} />
                                <DetailItem loading={loading} icon={<FiPackage />} label="Order Quantity" value={SubstitutionDetails?.itemQty} />
                                <DetailItem loading={loading} icon={<AiOutlineCalendar />} label="desired ShipDate" value={formatDateTime(SubstitutionDetails?.desiredShipDate)} />
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
                                            {loading ? (
                                                /* Header Skeleton */
                                                <div className="flex items-center gap-3 animate-pulse">
                                                    {/* "Items List" Title Skeleton */}
                                                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-md" />

                                                    {/* Pill Badge Skeleton */}
                                                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                                        <div className="h-3 w-12 bg-slate-300 dark:bg-slate-600 rounded" />
                                                        <div className="h-2 w-4 bg-slate-200 dark:bg-slate-700 rounded" />
                                                        <div className="h-3 w-10 bg-slate-300 dark:bg-slate-600 rounded" />
                                                    </div>
                                                </div>
                                            ) : (<h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                                Items List
                                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                    <span className="text-xs font-bold text-[var(--primary)]">{items.length}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">OF</span>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{SubstitutionDetails?.itemQty || 0}</span>
                                                </div>
                                            </h2>)}
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
                                    <div className="relative transition-shadow duration-300">
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
                                        loading={loading}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <VerificationSider
                isOpen={open}
                setOpen={setOpen}
                onClose={() => setOpen(false)}
                item={selectedData}
                onConfirm={() => {
                    console.log("Confirmed:", selectedData)
                }}
            />

        </div>
    )
}

/** Helper Component for Details */
const DetailItem = ({ icon, label, value, loading = false }) => {
    if (loading) {
        return (
            <div className="flex items-center gap-3 animate-pulse">
                {/* Skeleton Icon */}
                <div className="w-[18px] h-[18px] bg-slate-200 dark:bg-slate-700 rounded-md" />

                <div className="flex-1 space-y-2">
                    {/* Skeleton Label */}
                    <div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                    {/* Skeleton Value */}
                    <div className="h-3 w-24 bg-slate-300 dark:bg-slate-600 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 group">
            <div className="text-slate-400 dark:text-slate-500 group-hover:text-[var(--primary)] transition-colors">
                {React.cloneElement(icon, { size: 18 })}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                    {label}
                </p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {value || '—'}
                </p>
            </div>
        </div>
    );
};
const ScanProgressLoading = () => (
    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800 animate-pulse">
        {/* Text Section Skeleton */}
        <div className="text-right space-y-2">
            {/* Label Line */}
            <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
            {/* Value Line */}
            <div className="h-3 w-20 bg-slate-300 dark:bg-slate-600 rounded ml-auto" />
        </div>

        {/* Spinner Skeleton (Hidden on mobile to match your original class) */}
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 hidden sm:block shadow-inner" />
    </div>
);


export default SubstitutionDetails


/* Helper Sub-component */
const InfoBlock = ({ label, value }) => (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
        <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value || 'N/A'}</p>
    </div>
);
