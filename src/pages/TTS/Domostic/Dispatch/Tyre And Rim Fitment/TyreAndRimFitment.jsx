import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { formatDateTime } from "../../../../../utils/FormatDate";
import { ArrowLeft, ClipboardList, Package, ScanLine } from "lucide-react";
import { DynamicDataTable } from "../../../../../components/DynamicDataTable";
import { motion } from "framer-motion";
import { AiOutlineCalendar, AiOutlineUser } from "react-icons/ai";
import { FaClipboardList, FaDownload } from "react-icons/fa";
import { FiPackage } from "react-icons/fi";
import SearchBar from "../../../../../components/SearchBar";
import toast from "react-hot-toast";
import {
  getFitmentDetails,
  PIDFitmentCheckBarcode,
  resetRimDetails,
  resetTyreDetails,
  SubmitFitmentInspection,
  verifyFitment,
  resetAll,
} from "../../../../../Redux/Slices/PDIFitmentMaster/PDIFitmentSlice";
import { FitmrntSlider } from "./FitmentSlider";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const TyreAndRimFitment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [localSearch, setLocalSearch] = useState("");
  const { FitmentDetails, scanSession } = useSelector(
    (state) => state.PDIFitment,
  );
  const { loading } = useSelector((state) => state.PDIDispatchMaster);
  const [scanInput, setScanInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const [viewMode, setViewMode] = useState("inventory");
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState("");
  const clean = (val) => String(val ?? "").trim();

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

const handleDownloadExcel = async () => {
  if (!items || items.length === 0) {
    toast.error("No data available to download");
    return;
  }

  const clean = (val) => String(val ?? "").trim();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Fitment Report");

  // 🔥 PAGE SETUP (A4 Landscape)
  worksheet.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
  };

  // 🔥 COLUMN WIDTH
  worksheet.columns = [
    { width: 18 }, { width: 18 }, { width: 20 }, { width: 10 },
    { width: 12 }, { width: 18 }, { width: 16 },
    { width: 14 }, { width: 14 }, { width: 14 },
    { width: 12 }, { width: 14 }
  ];

  // 🔥 LOAD LOGO (from public folder)
  const getBase64 = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });
  };

  const logoBase64 = await getBase64("/SUN-TWS.png"); // 👉 place logo in public folder

  const imageId = workbook.addImage({
    base64: logoBase64,
    extension: "png",
  });

  // 🔥 ADD LOGO
  worksheet.addImage(imageId, {
    tl: { col: 0, row: 0 },
    ext: { width: 140, height: 60 },
  });

  // 🔥 TITLE
  worksheet.mergeCells("A3:L3");
  const titleCell = worksheet.getCell("A3");
  titleCell.value = "FITMENT WORKORDER";
  titleCell.font = { bold: true, size: 18, color: { argb: "1F4E79" } };
  titleCell.alignment = { horizontal: "center" };

  // 🔥 DETAILS SECTION
  const details = [
    ["Full Name", clean(FitmentDetails?.customerName)],
    ["Order RefNo", clean(FitmentDetails?.orderRefNo)],
    ["Work Order", clean(FitmentDetails?.workorderno)],
    ["Order Date", clean(formatDateTime(FitmentDetails?.orderDate))],
    ["Ship Date", clean(formatDateTime(FitmentDetails?.DesiredShipDate))]
  ];

  let rowStart = 5;

  details.forEach(([label, value], i) => {
    const row = worksheet.getRow(rowStart + i);

    row.getCell(1).value = label;
    row.getCell(2).value = ":";
    row.getCell(3).value = value;

    row.getCell(1).font = { bold: true };
    row.getCell(1).alignment = { horizontal: "left" };
    row.getCell(3).alignment = { horizontal: "left" };
  });

  // 🔥 TABLE HEADER
  const headers = [
    "Category", "Platform", "Tyre Size", "Rim",
    "Type", "Brand", "Sidewall",
    "ProcessID", "EDC_NO", "Directional",
    "Total Qty", "Scanned Qty"
  ];

  const headerRowIndex = rowStart + details.length + 2;
  const headerRow = worksheet.getRow(headerRowIndex);

  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;

    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1F4E79" }
    };

    cell.alignment = { horizontal: "center" };

    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" }
    };
  });

  // 🔥 TABLE DATA
  let totalQty = 0;
  let scannedQty = 0;

  let dataRowStart = headerRowIndex + 1;

  items.forEach((item, idx) => {
    const row = worksheet.getRow(dataRowStart + idx);

    totalQty += item.itemQty || 0;
    scannedQty += item.scannedQty || 0;

    const rowData = [
      clean(item.category),
      clean(item.config),
      clean(item.tyreSize),
      clean(item.rimSize),
      clean(item.tyreType),
      clean(item.brand),
      clean(item.sideWall),
      clean(item.processId),
      clean(item.edcNo),
      clean(item.directional),
      item.itemQty || 0,
      item.scannedQty || 0,
    ];

    rowData.forEach((val, i) => {
      const cell = row.getCell(i + 1);
      cell.value = val;
      cell.alignment = { horizontal: "center" };

      // Only bottom border (clean look)
      cell.border = {
        bottom: { style: "thin" }
      };
    });
  });

  // 🔥 TOTAL ROW
  const totalRow = worksheet.getRow(dataRowStart + items.length);

  totalRow.getCell(1).value = "TOTAL";

  totalRow.getCell(11).value = totalQty;
  totalRow.getCell(12).value = scannedQty;

  totalRow.font = { bold: true };

  totalRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "EAF4FF" }
    };
    cell.alignment = { horizontal: "center" };
  });

  // 🔥 DOWNLOAD
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `Fitment_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [open]);

  const items = useMemo(() => {
  const rawItems = FitmentDetails?.items;

  // Handle all possible cases safely
  const safeItems = Array.isArray(rawItems)
    ? rawItems
    : Array.isArray(rawItems?.data)
    ? rawItems.data
    : [];

  const term = localSearch.toLowerCase();

  return safeItems.filter(
    (item) =>
      item.assY_PID?.toLowerCase()?.includes(term) ||
      item.brand?.toLowerCase()?.includes(term) ||
      item.config?.toLowerCase()?.includes(term) ||
      item.directional?.toLowerCase()?.includes(term) ||
      item.edcNo?.toLowerCase()?.includes(term) ||
      item.edcRimSize?.toLowerCase()?.includes(term) ||
      item.o_ID?.toString()?.includes(term) ||
      item.o_ItemID?.toString()?.includes(term) ||
      item.processId?.toLowerCase()?.includes(term) ||
      item.rimSize?.toLowerCase()?.includes(term) ||
      item.sideWall?.toLowerCase()?.includes(term) ||
      item.tyreSize?.toLowerCase()?.includes(term) ||
      item.tyreType?.toLowerCase()?.includes(term)
  );
}, [localSearch, FitmentDetails]);
  // console.log(FitmentDetails);

  useEffect(() => {
    if (location.state) {
      dispatch(getFitmentDetails(location.state));
    }
  }, [location.state, dispatch]);

  const handleResetTyre = () => {
    dispatch(resetTyreDetails());
  };

  const handleResetRim = () => {
    dispatch(resetRimDetails());
  };

  const handleScan = async (e) => {
    if (e.key !== "Enter" && e.key !== "Tab") return;

    const barcode = scanInput.trim();

    if (barcode.length !== 19) {
      toast.error("Invalid Barcode");
      setScanInput("");
      return;
    }

    // i want to validate for respective line items
const cleanedBarcode = clean(barcode);
const processID = cleanedBarcode.substring(0, 8);
    const isValid = FitmentDetails.items.some((v) =>
  clean(v.processId) === processID ||
  clean(v.edcNo) === processID
);
    if (!isValid) {
        toast.error('Please scan valid barcode')
        return
    }
    const O_ItemID = FitmentDetails.items.find((item) =>
  clean(item.processId) === processID ||
  clean(item.edcNo) === processID
)?.o_ItemID;

    const res = await dispatch(
  PIDFitmentCheckBarcode({
    barcode: cleanedBarcode,
    PID: processID,
    O_ID: FitmentDetails?.id,
    O_ItemID: O_ItemID || 0,
    plant: clean(FitmentDetails?.plant),
  })
);
    setViewMode("scan");
    setScanInput("");
    handleVerify();
    setMessage(res?.message);
    setIsValid(res?.status);
  };

  const handleVerify = async () => {
    if (scanSession?.tyre && scanSession?.rim) {
      const tyre = scanSession.tyre;
      const rim = scanSession.rim;

      const payload = {
        TyreSize: tyre.tyreSize,
        RimSize: tyre.rimSize,
        Processid: tyre.processID,
        O_ItemID: parseInt(tyre.o_ItemID, 10),
        O_ID: parseInt(tyre.o_ID, 10),
        EdcNo: rim.edcNo,
      };

      try {
        const res = await dispatch(verifyFitment(payload));

        console.log("verify response", res);

        setIsValid(res?.status);
        setMessage(res?.message);
      } catch (err) {
        console.error(err);
        setIsValid(false);
        toast.error("Verification failed");
      }
    }
  };
  console.log(FitmentDetails);

  const safeItems = Array.isArray(FitmentDetails?.items)
  ? FitmentDetails.items
  : [];
  console.log(safeItems);
  

  const scanedQty = safeItems?.reduce(
    (total, item) => total + item.scannedQty || 0,
    0,
  );
  const totalQty = safeItems?.reduce(
    (total, item) => total + item.itemQty || 0,
    0,
  );
  const percentage = totalQty > 0 ? (scanedQty / totalQty) * 100 : 0;

  const columns = [
    {
      header: "category ",
      accessor: "category",
      width: "0.8fr",
      align: "center",
    },
    { header: "PLATFORM", accessor: "config", width: "0.8fr", align: "center" },
    {
      header: "TYRE SIZE",
      accessor: "tyreSize",
      width: "1.2fr",
      align: "left",
      render: (val) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {val || ""}
        </span>
      ),
    },
    { header: "RIM", accessor: "rimSize", width: "0.5fr", align: "center" },
    { header: "TYPE", accessor: "tyreType", width: "0.5fr", align: "center" },
    { header: "BRAND", accessor: "brand", width: "1fr", align: "left" },
    { header: "sidewall", accessor: "sideWall", width: "1fr", align: "center" },
    {
      header: "ProcessID",
      accessor: "processId",
      width: "1fr",
      align: "center",
    },
    { header: "EDC_NO", accessor: "edcNo", width: "1fr", align: "center" },
    {
      header: "Directional",
      accessor: "directional",
      width: "1fr",
      align: "center",
    },
    { header: "TOTAL QTY", accessor: "itemQty", width: "1fr", align: "center" },
    {
      header: "SCANNED QTY",
      accessor: "scannedQty",
      width: "1fr",
      align: "center",
      render: (val) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {val || 0}
        </span>
      ),
    },
  ];

  const handleConfirmation = (payload) => {
    dispatch(SubmitFitmentInspection(payload, setViewMode));
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
              onClick={() => {
                navigate(-1);
                dispatch(resetAll());
              }}
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
                Fitment Portal
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
                    {FitmentDetails?.orderRefNo || "N/A"}
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
                <p className="text-sm font-semibold">
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
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Customer Card */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-[var(--primary)]/5">
                <h2 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm">
                  <AiOutlineUser className="text-[var(--primary)]" /> Customer
                  Details
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <DetailItem
                  loading={loading}
                  icon={<AiOutlineUser />}
                  label="Full Name"
                  value={FitmentDetails?.customerName}
                />
                <DetailItem
                  loading={loading}
                  icon={<FaClipboardList />}
                  label="Order RefNo"
                  value={FitmentDetails?.orderRefNo}
                />
                <DetailItem
                  loading={loading}
                  icon={<FiPackage />}
                  label="Work Order"
                  value={FitmentDetails?.workorderno}
                />
                <DetailItem
                  loading={loading}
                  icon={<AiOutlineCalendar />}
                  label="Order Date"
                  value={formatDateTime(FitmentDetails?.orderDate)}
                />
                <DetailItem
                  loading={loading}
                  icon={<AiOutlineCalendar />}
                  label="Ship Date"
                  value={formatDateTime(FitmentDetails?.DesiredShipDate)}
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
                  <div className="p-2 ml-1 bg-white/20 rounded-lg backdrop-blur-sm">
                    <ScanLine size={15} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold leading-none">
                      Quick Scan
                    </h2>
                    <span className="text-[10px] opacity-70 uppercase tracking-widest">
                      Capture Barcode & RIM Barcode
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    maxLength={19}
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value.trimStart())}
                    onKeyDown={handleScan}
                    placeholder="Scan barcode..."
                    className="w-full bg-black/20 border border-white/30 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  />
                </div>
                <p className="text-[10px] text-white/70 mt-3 flex items-center gap-1.5 italic">
                  {error ? (
                    <span className="text-red-200">{error}</span>
                  ) : (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      Ready for scanner input
                    </>
                  )}
                </p>
              </div>
            </motion.section>
          </div>

          {/* --- TABLE SECTION (Right) --- */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3 }}
            className="lg:col-span-9 flex flex-col"
          >
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-4">
              {/* Search and Title Area */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                {viewMode === "inventory" && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                      <Package size={20} />
                    </div>
                    <div>
                      <h2 className="text-md sm:text-lg font-bold flex items-center gap-2">
                        Items List
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--primary)]">
                          {items.length} Items
                        </span>
                      </h2>
                    </div>
                  </div>
                )}
                {/* Header */}
                {viewMode === "scan" && (
                  <div className="">
                    <h2 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-white">
                      Fitment Verification
                    </h2>

                    {isValid && (
                      <p className="text-[12px] text-slate-400 uppercase tracking-widest">
                        Tyre & Rim Matching Verification -{" "}
                        <span className="text-green-600 bold">{message}</span>
                      </p>
                    )}
                    {!isValid && (
                      <p className="text-[12px] text-slate-400 uppercase tracking-widest">
                        Tyre & Rim Matching Verification -{" "}
                        <span className="text-red-600 bold">{message}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Controls Wrapper */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
                  {viewMode === "inventory" && (
                    <div className="w-full sm:w-64">
                      <SearchBar
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full text-sm"
                      />
                    </div>
                  )}
                  {viewMode === "inventory" && (
                    <div className="w-full sm:w-24">
                      <button
                        className="flex items-center cursor-pointer rounded bg-[var(--primary)] dark:bg-gray-700 py-1 px-2.5 border border-transparent text-[0.7rem] text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] dark:hover:bg-gray-600"
                        type="button"
                        onClick={handleDownloadExcel}
                      >
                        <FaDownload className="w-5 h-5 mr-2" />
                        Download
                      </button>
                    </div>
                  )}
                  {/* View Toggle */}
                  <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("inventory")}
                      className={`px-3 py-1.5 rounded-lg text-xs ${
                        viewMode === "inventory"
                          ? "bg-[var(--primary)] text-white"
                          : "bg-white dark:bg-slate-900 text-slate-600"
                      }`}
                    >
                      Inventory
                    </button>

                    <button
                      onClick={() => setViewMode("scan")}
                      className={`px-3 py-2 rounded-lg text-xs ${
                        viewMode === "scan"
                          ? "bg-[var(--primary)] text-white"
                          : "bg-white dark:bg-slate-900 text-slate-600"
                      }`}
                    >
                      Scanned
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="h-[400px] lg:min-h-[calc(100vh-300px)] w-full">
                {viewMode === "inventory" && (
                  <DynamicDataTable
                    columns={columns}
                    data={items}
                    headerClassName="bg-[var(--primary)] text-white dark:bg-slate-950 shadow-sm"
                    loading={loading}
                  />
                )}

                {viewMode === "scan" && (
                  <FitmrntSlider
                    data={{
                      tyre: scanSession?.tyre,
                      rim: scanSession?.rim,
                    }}
                    onResetTyre={handleResetTyre}
                    onResetRim={handleResetRim}
                    onVerify={handleVerify}
                    isValid={isValid}
                    setIsValid={setIsValid}
                    onSubmit={handleConfirmation}
                    setMessage={setMessage}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
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

export default TyreAndRimFitment;
