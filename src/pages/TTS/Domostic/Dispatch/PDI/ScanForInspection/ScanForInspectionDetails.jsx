import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCustomerDetails,
  getWorkorder,
  PDICheckBarcode,
  resetBarcodeDetails,
  SubmitInspection,
} from "../../../../../../Redux/Slices/PDIDispatchMaster/PDIScanForInspectionSlice";
import { formatDateTime } from "../../../../../../utils/FormatDate";
import { ArrowLeft, ClipboardList, Package, ScanLine } from "lucide-react";
import { DynamicDataTable } from "../../../../../../components/DynamicDataTable";
import { motion, AnimatePresence } from "framer-motion";
import {
  AiOutlineBarcode,
  AiOutlineCalendar,
  AiOutlineUser,
} from "react-icons/ai";
import { FaClipboardList, FaFileDownload, FaList } from "react-icons/fa";
import { FiPackage } from "react-icons/fi";
import SearchBar from "../../../../../../components/SearchBar";
import toast from "react-hot-toast";
import { VerificationSider } from "./BarcodeSlider";
import { SlReload } from "react-icons/sl";
import { BsUpcScan } from "react-icons/bs";
import { HiOutlineViewList } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import BarcodeDetailList from "./BarcodeDetailList";
import InfoTooltip from "../../../../../../components/InfoTooltip";
import { Tooltip } from "antd";
const ScanForInspectionDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [localSearch, setLocalSearch] = useState("");
  const { InspectionDetails, barcodeDetails } = useSelector(
    (state) => state.scanforinspection,
  );
  const { loading } = useSelector((state) => state.PDIDispatchMaster);
  const { user } = useSelector((state) => state.auth);
  const [scanInput, setScanInput] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };
  const handleCloseForm = () => {
    setShowDetailsForm(false);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [open]);

  const items = useMemo(() => {
    if (!InspectionDetails?.items) return [];
    const term = localSearch.toLowerCase();
    return InspectionDetails.items.filter(
      (item) =>
        item.tyreSize?.toLowerCase().includes(term) ||
        item.platform?.toLowerCase().includes(term) ||
        item.tyreType?.toLowerCase().includes(term) ||
        item.processID?.toLowerCase().includes(term) ||
        item.stencilNo?.toLowerCase().includes(term) ||
        item.o_ItemID?.toString().includes(term),
    );
  }, [localSearch, InspectionDetails]);

  useEffect(() => {
    if (location.state) {
      dispatch(getCustomerDetails(location.state.row));
    }
  }, [location.state, dispatch]);

  const handleScan = (e) => {
    if (e.key === "Enter" && scanInput.trim()) {
      if (isProcessingScan || open) {
        toast.error("Previous tyre verification pending");

        return;
      }
      if (scanInput.trim().length === 19 && scanInput.trim().startsWith("P")) {
        const trimmedBarcode = scanInput.trim();

        setScanInput("");

        const processID = trimmedBarcode.substring(0, 8);
        const stencilNo = trimmedBarcode.substring(8, 18);

        const matchedItem = InspectionDetails.items.find(
          (item) => item.processID === processID,
        );

        console.log(matchedItem);

        if (!matchedItem) {
          toast.error("No item found for this Order", {
            position: "top-center",
          });
          return;
        }

        // ✅ Prevent extra scanning
        if (matchedItem.scannedQty >= matchedItem.orderQty) {
          toast.error(
            `Scanning limit exceeded. Allowed Qty: ${matchedItem.orderQty}`,
            {
              position: "top-center",
            },
          );
          return;
        }

        const payload = {
          ...InspectionDetails,
          processID,
          stencilNo,
          barcode: trimmedBarcode,
          o_ItemID: matchedItem.o_ItemID,
        };
        setIsProcessingScan(true);
        dispatch(resetBarcodeDetails());
        dispatch(PDICheckBarcode(payload));
        setOpen(true);
      } else {
        setError(
          'Invalid Barcode. Length must be 19 characters and start with "P"',
        );

        setTimeout(() => setError(""), 2000);

        toast.error("Invalid Barcode.", {
          position: "top-center",
        });

        setScanInput("");
      }
    }
  };
  const successAudio = useMemo(() => new Audio("/sounds/ok.mp3"), []);

  const scanedQty = InspectionDetails?.items?.reduce(
    (total, item) => total + item.scannedQty,
    0,
  );
  const totalQty = InspectionDetails?.items?.reduce(
    (total, item) => total + item.totalItemQty,
    0,
  );
  const percentage = totalQty > 0 ? (scanedQty / totalQty) * 100 : 0;

  const columns = [
    { header: "PLATFORM", accessor: "config", width: "0.8fr", align: "center" },
    {
      header: "TYRE SIZE",
      accessor: "tyreSize",
      width: "1.2fr",
      align: "left",
    },
    { header: "RIM", accessor: "rimSize", width: "0.5fr", align: "center" },
    { header: "TYPE", accessor: "tyreType", width: "0.5fr", align: "center" },
    { header: "BRAND", accessor: "brand", width: "1fr", align: "left" },
    { header: "sidewall", accessor: "sidewall", width: "1fr", align: "center" },
    {
      header: "TOTAL QTY",
      accessor: "totalItemQty",
      width: "1fr",
      align: "center",
    },
    {
      header: "SCANNED QTY",
      accessor: "scannedQty",
      width: "1fr",
      align: "center",
      render: (val) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">
          <Tooltip title={val}>{val || 0}</Tooltip>
        </span>
      ),
    },
    {
      header: "SUB-QTY",
      accessor: "substitutionQty",
      width: "1fr",
      align: "center",
    },
    {
      header: "SUB-SCANNED QTY",
      accessor: "scannedCount",
      width: "1fr",
      align: "center",
    },
  ];

  const handleConfirmation = async (payload) => {
    const res = await dispatch(SubmitInspection(payload));
    if (res) {
      successAudio.currentTime = 0;
      successAudio.play();
      setOpen(false);
      setIsProcessingScan(false);
    }
    // setOpen(false);
  };

  const handleBarcodeOpen = () => {
    setShowDetailsForm(true);
  };
  const custtype =
    location.state.type === "International" ? "Export" : "Domestic";
  const handleBarcodeDownload = () => {
    dispatch(
      getWorkorder(
        InspectionDetails?.custCode,
        InspectionDetails?.orderRefNo,
        InspectionDetails?.plant,
        custtype,
      ),
    );
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-[1550px] mx-auto p-3 space-y-3">
        {/* --- HEADER SECTION --- */}
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 group"
            >
              <ArrowLeft
                size={20}
                className="text-slate-600 dark:text-slate-400 group-hover:text-blue-500"
              />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <ClipboardList className="text-[var(--primary)]" size={20} />
                Inspection Portal
              </h1>
              {loading ? (
                <div className="flex items-center gap-1.5 animate-pulse mt-1">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-24 bg-slate-300 dark:bg-slate-600 rounded" />
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Order Ref:{" "}
                  <span className="font-bold text-[var(--primary)]">
                    {InspectionDetails?.orderRefNo || "N/A"}
                  </span>
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <ScanProgressLoading />
          ) : (
            <div className="flex items-center justify-between sm:justify-end gap-6 bg-[var(--primary)]/10 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <div className="text-left sm:text-right">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--primary)]">
                  Scan Progress
                </p>
                <p className="smt:text-xs md:text-xl font-bold">
                  {scanedQty || 0} / {totalQty || 0} Units
                </p>
              </div>
              <div className="relative w-10 h-10">
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

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* --- SIDEBAR (Left) --- */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Customer Card */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-[var(--primary)]/5">
                <h2 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm">
                  <AiOutlineUser className="text-[var(--primary)]" /> Customer
                  Details
                </h2>
                <button
                  onClick={handleBarcodeDownload}
                  className="flex items-center justify-center whitespace-nowrap rounded bg-[var(--primary)] px-3 py-2 text-xs text-white hover:bg-[var(--primary)]/90 transition-all"
                >
                  <FaFileDownload className="w-3 h-3 mr-2" /> Download Work
                  Order
                </button>
              </div>
              <div className="p-4 space-y-4">
                <DetailItem
                  loading={loading}
                  icon={<AiOutlineUser />}
                  label="Full Name"
                  value={InspectionDetails?.custFullName}
                />
                <DetailItem
                  loading={loading}
                  icon={<FaClipboardList />}
                  label="Work Order"
                  value={InspectionDetails?.workOrderNo}
                />
                <DetailItem
                  loading={loading}
                  icon={<FiPackage />}
                  label="Order Quantity"
                  value={InspectionDetails?.itemQty}
                />
                <DetailItem
                  loading={loading}
                  icon={<AiOutlineCalendar />}
                  label="Order Date"
                  value={formatDateTime(InspectionDetails?.orderDate)}
                />
                <DetailItem
                  loading={loading}
                  icon={<AiOutlineCalendar />}
                  label="Ship Date"
                  value={formatDateTime(InspectionDetails?.desiredShipDate)}
                />
              </div>
            </motion.section>

            {/* Scan Input Card */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
              className="relative bg-[var(--primary)] rounded-xl shadow-lg p-5 text-white overflow-hidden group"
            >
              {/* Barcode Corner Brackets */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/60 rounded-tl" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/60 rounded-tr" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/60 rounded-bl" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/60 rounded-br" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <ScanLine size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold leading-none">
                      Quick Scan
                    </h2>
                    <span className="text-[10px] opacity-70 uppercase tracking-widest">
                      Capture Stencil
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    maxLength={19}
                    disabled={isProcessingScan || open}
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={handleScan}
                    placeholder="Scan barcode..."
                    className="w-full bg-black/20 border border-white/30 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  />
                </div>
                <div className="mt-3">
                  {error ? (
                    <span className="text-red-200 text-[10px]">{error}</span>
                  ) : isProcessingScan ? (
                    <span className="text-yellow-300 text-xs animate-pulse">
                      Waiting for verification...
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 italic text-[10px] text-white/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      Ready for scanner input
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          </div>

          {/* --- TABLE SECTION (Right) --- */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 flex flex-col"
          >
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-4">
              {/* Search and Title Area */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] dark:text-white">
                    <Package size={20} />
                  </div>
                  <div>
                    <h2 className="text-md sm:text-lg font-bold flex items-center gap-2">
                      Items List
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--primary)] dark:text-white">
                        {items.length} Items
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center">
                    <InfoTooltip
                      content={
                        <div className="flex flex-col gap-1 text-left min-w-[220px]">
                          <div className="flex items-center gap-2">
                            <span className="text-green-300">🟢</span>
                            <span className="font-medium">Green</span>
                            <span className="text-slate-300">
                              - Completed Scan
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-yellow-300">🟡</span>
                            <span className="font-medium">Yellow</span>
                            <span className="text-slate-300">
                              - Partially Scanned
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-gray-300">⚪</span>
                            <span className="font-medium">Gray</span>
                            <span className="text-slate-300">
                              - Pending Scan
                            </span>
                          </div>
                        </div>
                      }
                      className="text-[var(--primary)] dark:text-white"
                    />
                  </div>
                </div>

                {/* Controls Wrapper */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
                  <button
                    onClick={handleBarcodeOpen}
                    className="flex items-center justify-center whitespace-nowrap rounded bg-[var(--primary)] px-3 py-2 text-xs text-white hover:bg-[var(--primary)]/90 transition-all"
                  >
                    <HiOutlineViewList className="w-3 h-3 mr-2" /> View Barcode
                    List
                  </button>
                  <div className="w-full sm:w-64">
                    <SearchBar
                      onChange={(e) => setLocalSearch(e.target.value)}
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="h-[400px] lg:min-h-[calc(100vh-300px)] w-full">
                <DynamicDataTable
                  columns={columns}
                  data={items}
                  headerClassName="bg-[var(--primary)] text-white text-[0.8rem] dark:bg-slate-950 shadow-sm"
                  loading={loading}
                  cellClassName="text-[0.77rem] font-bold"
                  rowClassName={(row) => {
                    // FULLY SCANNED
                    if (row.scannedQty >= row.totalItemQty) {
                      return "bg-green-100 dark:bg-green-900/30 border-green-500";
                    }

                    // PARTIALLY SCANNED
                    if (row.scannedQty > 0) {
                      return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400";
                    }

                    // NOT SCANNED
                    return "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700";
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <VerificationSider
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setIsProcessingScan(false);
        }}
        data={barcodeDetails}
        onConfirm={handleConfirmation}
        loading={loading}
      />

      {/* Fix: Remove overflow-y-auto from modal wrapper, use flex-col + fixed height instead */}
      <AnimatePresence>
        {showDetailsForm && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm layout-scroll flex items-center justify-center"
          >
            <motion.div
              key="modal-content"
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              transition={{ duration: 0.1, ease: "easeIn" }}
              className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-11/12 h-[90vh] flex flex-col border border-gray-300 dark:border-gray-700"
            >
              {/* Fixed Modal Header */}
              <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                <h1 className="text-sm sm:text-lg md:text-xl font-bold flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <ClipboardList
                    className="text-[var(--primary)] flex-shrink-0"
                    size={16}
                    style={{
                      width: "clamp(14px, 2vw, 20px)",
                      height: "clamp(14px, 2vw, 20px)",
                    }}
                  />
                  <span className="truncate">Barcode List</span>
                </h1>
                <button
                  onClick={handleCloseForm}
                  className="
      flex items-center justify-center
      ml-2 flex-shrink-0
      w-7 h-7 sm:w-8 sm:h-8
      rounded-md
      text-gray-500 dark:text-gray-400
      hover:text-gray-900 dark:hover:text-white
      hover:bg-gray-100 dark:hover:bg-gray-700
      transition-all
    "
                >
                  <IoMdClose className="text-base sm:text-xl" />
                </button>
              </div>

              {/* Scrollable Content — BarcodeDetailList handles its own internal scroll */}
              <div className="flex-1 overflow-hidden">
                <BarcodeDetailList onClose={handleCloseForm} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailItem = ({ icon, label, value, loading = false }) => {
  if (loading)
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="flex-1 space-y-1">
          <div className="h-2 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-20 bg-slate-300 dark:bg-slate-600 rounded" />
        </div>
      </div>
    );
  return (
    <div className="flex items-center gap-3">
      <div className="text-slate-400">
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] uppercase tracking-tighter font-bold text-slate-400">
          {label}
        </p>
        <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
          {value || "—"}
        </p>
      </div>
    </div>
  );
};

const ScanProgressLoading = () => (
  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg animate-pulse">
    <div className="text-right space-y-1">
      <div className="h-2 w-12 bg-slate-200 rounded" />
      <div className="h-3 w-16 bg-slate-300 rounded" />
    </div>
    <div className="w-10 h-10 rounded-full bg-slate-200" />
  </div>
);

export default ScanForInspectionDetails;
