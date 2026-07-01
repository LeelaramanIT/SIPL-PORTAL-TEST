import { useState, useMemo, useDeferredValue, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import SearchBar from "../../../components/SearchBar";
import { MdOutlineCancel, MdOutlineSaveAlt } from "react-icons/md";
import { SlCloudUpload, SlReload } from "react-icons/sl";
import { FaDownload } from "react-icons/fa";
import InfoTooltip from "../../../components/InfoTooltip";
import { useRef } from "react";
import ModernSelect from "../../../components/ModernSelect";
import { api } from "../../../utils/axios";
import { IoChevronDown } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "antd";
import {
  setCategory,
  setErrorFilter,
  setExcelData,
  setSelectedUpdateCustomer,
  setExcelFileName,
  setPriceSheetRef,
  setSearch,
  setSheetMode,
  setGeneratedId,
  setExistingSheets,
  setDates,
  // setRemark,
} from "../../../Redux/Slices/PriceMasterSlice";
import { IoMdWarning } from "react-icons/io";
export default function UploadView() {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visibleRows, setVisibleRows] = useState(50);
  const listRef = useRef(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const dispatch = useDispatch();
  const {
    category = "Tyre",
    excelJson = [],
    selectedUpdateCustomer = "All Customers",
    errorFilter = "All",
    excelFileName = "",
    priceSheetRef,
    search,
    sheetMode,
    generatedId,
    existingSheets,
    startDate,
    endDate,
    // remark = "",
  } = useSelector((state) => state.priceMaster || {});
  const deferredSearch = useDeferredValue(search);

  const fetchNextSheetID = async () => {
    const res = await api.get("/PriceSheet/New-price-sheet-ref-no");
    if (res.status === 200) {
      const newId = res.data.pricesheetNo;
      dispatch(setGeneratedId(newId));
      dispatch(setPriceSheetRef(res.data.pricesheetNo));
    }
  };

  // Add this right after duplicateCount definition
  const errorCount = useMemo(
    () => excelJson.filter((i) => i.validationError).length,
    [excelJson],
  );
  const { Option } = Select;
  useEffect(() => {
    if (sheetMode === "new" && !generatedId) {
      fetchNextSheetID();
    }
    if (!startDate) {
      const today = new Date().toISOString().split("T")[0];
      dispatch(setDates({ start: today }));
    }
  }, [sheetMode]);

  // 2. FUNCTION TO FETCH EXISTING SHEETS
  const fetchExistingSheets = async () => {
    setIsLoadingList(true);
    try {
      // REPLACE with your actual endpoint to get all PriceSheet Refs
      const res = await api.get("/PriceSheet/price-sheet-ref-no");
      console.log("res", res.data);

      if (res.status === 200 && Array.isArray(res.data)) {
        dispatch(setExistingSheets(res.data));
      }
    } catch (error) {
      console.error("Error fetching sheets", error);
      toast.error("Could not load existing sheets");
    } finally {
      setIsLoadingList(false);
    }
  };

  const parseUnitPrice = (value) => {
    // convert to proper number
    if (value === null || value === undefined) return 0;

    // Remove commas and currency symbols
    const cleaned = String(value).replace(/,/g, "").replace(/[₹$]/g, "").trim();

    const number = parseFloat(cleaned);

    return isNaN(number) ? 0 : number;
  };

  const handleModeChange = async (mode) => {
  dispatch(setSheetMode(mode));

  if (mode === "new") {
    // dispatch(setRemark(""));

    // Reset dates for new sheet
    const today = new Date().toISOString().split("T")[0];

    dispatch(
      setDates({
        start: today,
        end: "",
      })
    );

    if (!generatedId) {
      await fetchNextSheetID();
    }

    dispatch(setPriceSheetRef(generatedId));
  }

  if (mode === "existing") {
    dispatch(setPriceSheetRef(""));
    fetchExistingSheets();
  }
};

  useEffect(() => {
    setVisibleRows(50);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [deferredSearch, errorFilter]);

  useEffect(() => {
    const init = async () => {
      if (sheetMode === "new" && !priceSheetRef) {
        const res = await api.get("/PriceSheet/New-price-sheet-ref-no");
        if (res.status === 200) {
          dispatch(setGeneratedId(res.data.pricesheetNo));
          dispatch(setPriceSheetRef(res.data.pricesheetNo));
        }
      }
    };

    init();

    if (!startDate) {
      const today = new Date().toISOString().split("T")[0];
      dispatch(setDates({ start: today }));
    }
  }, []);

  const duplicateCount = useMemo(
    () => excelJson.filter((i) => i.isDuplicate).length,
    [excelJson],
  );

  const downloadPriceTemplate = () => {
    const data = [
      {
        CustCode: 1608,
        ProcessID: "P-009926",
        UnitPrice: 41.57,
        CustomerName: "ATC TIRES PRIVATE LIMITED",
        Category: "POB",
        Config: "SAT",
        TyreSize: "16X5X10½ SAT",
        TyreRim: 0,
        TyreType: "D1",
        Brand: "GALAXYYMBSDS",
        Sidewall: "D",
        FinishedWt: 15.37,
        Incoterms: "FOB",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Price Sheet");
    XLSX.writeFile(workbook, "Price_Sheet_Template.xlsx");
    toast.success("Template downloaded!");
  };

  const downloadErrorExcelFile = () => {
    const errorData = excelJson
      .filter((i) => i.validationError)
      .map((i) => ({
        CustCode: i.custCode,
        CustomerName: i.customerName,
        Category: i.category,
        Config: i.config,
        Brand: i.brand,
        Sidewall: i.sidewall,
        TyreType: i.tyreType,
        TyreSize: i.tyreSize,
        TyreRim: i.rimWidth,
        FinishedWt: i.finishedWt,
        "Process ID": i.processID,
        Incoterms: i.incoterms,
        "Start Date": i.startDate,
        "End Date": i.endDate,
        Status: i.active ? "Active" : "Inactive",
        UnitPrice: `₹${i.unitPrice.toLocaleString()}`,
        Error: i.validationError,
      }));
    const worksheet = XLSX.utils.json_to_sheet(errorData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Error Price Sheet");
    XLSX.writeFile(
      workbook,
      `Error_Price_Sheet ${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    toast.success("Error File downloaded!");
  };
  const isSheetExpired = () => {
    if (!endDate) return false;
    return new Date(endDate) < new Date().setHours(0, 0, 0, 0);
  };
  const handleExcelUpload = (e) => {
    if (isSheetExpired()) {
      toast.error(
        `Price Sheet expired on ${endDate}. Please update end date before upload.`,
      );
      e.target.value = null;
      return;
    }
    const file = e.target.files[0];
    if (!file || !startDate || !endDate) {
      toast.error("Please select dates first.");
      return;
    }
    if (!priceSheetRef) {
      toast.error("Price Sheet Ref ID is not set. Please try again later.");
      e.target.value = null; // Reset file input
      return;
    }
    dispatch(setExcelFileName(file.name));
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          raw: false,
        });
        const cleanString = (value) => String(value || "").trim();
        let formattedJson = rawJson.map((row) => ({
          productKey: `${row["ProcessID"]}~${row["TyreSize"]}~${Math.random()}`,
          custCode: cleanString(
            row["CustCode"] ||
            row["CUSTCODE"] ||
            row["custcode"] ||
            row["Customer Code"] ||
            row["customer code"] ||
            row["customerCode"]),
          processID: cleanString(
            row["ProcessID"] ||
            row["PROCESSID"] ||
            row["processID"] ||
            row["Process Id"] ||
            row["process Id"] ||
            row["processid"]
          ),
          unitPrice: parseUnitPrice(
            row["UnitPrice"] ?? row["unitprice"] ?? row["unitPrice"],
          ),
          customerName:
            row["CustomerName"] ||
            row["CUSTOMERNAME"] ||
            row["customername"] ||
            row["Customer Name"] ||
            row["customer name"] ||
            row["customerName"],
          category:
            row["Category"] ||
            row["CATEGORY"] ||
            row["category"] ||
            row["Category Name"] ||
            row["category name"] ||
            row["categoryName"],
          config:
            row["Config"] ||
            row["CONFIG"] ||
            row["config"] ||
            row["Config Name"] ||
            row["config name"] ||
            row["configName"],
          tyreSize:
            row["TyreSize"] ||
            row["TYRESIZE"] ||
            row["tyresize"] ||
            row["Tyre Size"] ||
            row["tyre size"] ||
            row["tyreSize"],
          rimWidth:
            row["TyreRim"] ||
            row["TYRERIM"] ||
            row["tyrerim"] ||
            row["Tyre Rim"] ||
            row["tyre rim"] ||
            row["tyreRim"],
          tyreType:
            row["TyreType"] ||
            row["TYRETYPE"] ||
            row["tyretype"] ||
            row["Tyre Type"] ||
            row["tyre type"] ||
            row["tyreType"],
          brand:
            row["Brand"] ||
            row["BRAND"] ||
            row["brand"] ||
            row["Brand Name"] ||
            row["brand name"] ||
            row["brandName"],
          sidewall:
            row["Sidewall"] ||
            row["SIDEWALL"] ||
            row["sidewall"] ||
            row["Side Wall"] ||
            row["side wall"] ||
            row["sideWall"],
          finishedWt:
            row["FinishedWt"] ||
            row["FINISHEDWT"] ||
            row["finishedwt"] ||
            row["Finished Wt"] ||
            row["finished wt"] ||
            row["finishedWt"],
          incoterms:
            row["Incoterms"] ||
            row["INCOTERMS"] ||
            row["incoterms"] ||
            row["Inco terms"] ||
            row["inco terms"] ||
            row["incoTerms"],
          startDate: startDate,
          endDate: endDate,
          active: true,
          platform: row["Config"] ||
            row["CONFIG"] ||
            row["config"] ||
            row["platform"] ||
            row["Platform"] || ["PLATFORM"],
          isDuplicate: false,
        }));

        // Duplicate Logic
        const occurrenceMap = new Map();
        formattedJson.forEach((item) => {
          const uniqueKey =
            `${item.custCode}-${item.processID}-${item.unitPrice}`.toLowerCase();
          occurrenceMap.set(uniqueKey, (occurrenceMap.get(uniqueKey) || 0) + 1);
        });
        formattedJson = formattedJson.map((item) => {
          const uniqueKey =
            `${item.custCode}-${item.processID}-${item.unitPrice}`.toLowerCase();
          return { ...item, isDuplicate: occurrenceMap.get(uniqueKey) > 1 };
        });

        if (formattedJson.some((i) => i.isDuplicate)) {
          toast.error("Duplicate rows found! Please fix before uploading.");
        }
        const errorMap = await handleVeryfication(formattedJson);
        formattedJson = formattedJson.map((item) => {
          const key = `${item.custCode}-${item.processID}`;
          return { ...item, validationError: errorMap.get(key) || null };
        });

        await dispatch(setExcelData(formattedJson));
        dispatch(setErrorFilter("All"));
        dispatch(setSelectedUpdateCustomer("All Customers"));
        dispatch(setSearch(""));
        setIsProcessing(false);
        setVisibleRows(50);
      } catch (error) {
        console.error("Error parsing file", error);
        toast.error("Failed to parse Excel file");
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleVeryfication = async (data) => {
    setIsProcessing(true);
    const groupedData = data.reduce((acc, item) => {
      const custID = item.custCode;
      if (!acc[custID]) {
        acc[custID] = {
          custId: custID,
          priceSheetLines: [],
        };
      }
      acc[custID].priceSheetLines.push({
        processId: item.processID,
        price: item.unitPrice,
        startDate: startDate,
        endDate: endDate,
      });
      return acc;
    }, {});
    console.log(groupedData);
    const payload = Object.values(groupedData);
    try {
      const res = await api.post("/PriceSheet/Validate-PriceSheet", payload);
      if (res.status === 200 && Array.isArray(res.data)) {
        const errorMap = new Map();
        res.data.forEach((err) => {
          const key = `${err.custcode}-${err.processID}`;
          errorMap.set(key, err.message);
        });
        if (res.data.length > 0) {
          toast.error(
            `Found ${res.data.length} validation issues from server.`,
          );
        }
        return errorMap;
      }
      console.log(res.data);
      return new Map();
    } catch (error) {
      console.error("Verification error:", error);
      return new Map();
    }
  };

  const handleConfirmUpload = async () => {
    console.log(priceSheetRef);
    if (!priceSheetRef || priceSheetRef.trim() === "") {
      toast.error("Price Sheet Reference is missing!");
      return;
    }
    if (duplicateCount > 0) {
      toast.error(`Cannot upload. Found ${duplicateCount} duplicate rows.`);
      return;
    }
    if (errorCount > 0) {
      toast.error(`Cannot upload. Please resolve all errors first.`);
      return;
    }
    setIsUploading(true);
    console.log(existingSheets);
    const payload = {
      priceSheetRefNo: priceSheetRef,
      type: category,
      startDate,
      endDate,
      // remark: remark?.trim() || null,
      priceDetails: excelJson
        .filter((item) => !item.isDuplicate) // optional, if needed
        .map((item) => ({
          processID: item.processID,
          custID: item.custCode,
          unitPrice: parseUnitPrice(item.unitPrice) || 0,
          endDate,
          startDate,
          itemType: category,
        })),
    };

    if (payload.priceDetails.length === 0) {
      toast.error("No data to upload.");
      setIsUploading(false);
      return;
    }
    try {
      const res = await api.post("/PriceSheet/save", payload);
      console.log(res.data);

      if (res.status === 200) {
        toast.success(`Sheet ${priceSheetRef} uploaded successfully!`, {
          duration: 9000,
        });
        setIsUploading(false);
        dispatch(setExcelData([]));
        dispatch(setExcelFileName(""));
        dispatch(setSearch(""));
        dispatch(setErrorFilter("All"));
        dispatch(setSelectedUpdateCustomer("All Customers"));
        // dispatch(setRemark(""));
        // setPriceSheetRef("PS-" + Math.floor(100000 + Math.random() * 900000));
      }
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error(error);
      setIsUploading(false);
    }
    // Simulate API call
  };

  const handleCancel = () => {
    dispatch(setExcelData([]));
    dispatch(setExcelFileName(""));
    dispatch(setSearch(""));
    dispatch(setErrorFilter("All"));
    dispatch(setSelectedUpdateCustomer("All Customers"));
  };
  const filtered = useMemo(() => {
    let data = excelJson;

    // 1. Handle Customer Filtering
    if (selectedUpdateCustomer !== "All Customers") {
      data = data.filter(
        (item) => item.customerName === selectedUpdateCustomer,
      );
    }

    // 2. Handle Error Filtering
    if (errorFilter !== "All") {
      data = data.filter((item) => item.validationError === errorFilter);
    }

    // 3. Handle Search
    if (!deferredSearch.trim()) return data;
    const term = deferredSearch.toLowerCase();
    return data.filter((item) => {
      const searchableString = `
      ${item.processID ?? ""} 
      ${item.tyreSize ?? ""} 
      ${item.customerName ?? ""} 
      ${item.custCode ?? ""}
    `.toLowerCase();
      return searchableString.includes(term);
    });

    // ADD selectedUpdateCustomerto this dependency array!
  }, [excelJson, deferredSearch, errorFilter, selectedUpdateCustomer]);
  const uniqueCustomers = useMemo(() => {
    const customers = excelJson
      .map((item) => item.customerName)
      .filter(Boolean);
    return [...new Set(customers)].sort();
  }, [excelJson]);

  // --- ADD THIS NEW BLOCK ---
  const uniqueErrors = useMemo(() => {
    // Get all validationError strings that are not null/empty
    const errors = excelJson
      .map((item) => item.validationError)
      .filter(Boolean);
    // Return unique sorted errors
    return [...new Set(errors)].sort();
  }, [excelJson]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setVisibleRows((prev) => Math.min(prev + 50, filtered.length));
    }
  };
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const handleReload = async () => {
    if (!excelJson || excelJson.length === 0) return;
    setIsProcessing(true);

    try {
      const errorMap = await handleVeryfication(excelJson);

      // SAFETY CHECK: If validation completely failed (empty map returned but likely due to error),
      // you might not want to wipe existing errors.
      // Ideally, handleVeryfication should return null on failure, not empty map.

      const updatedJson = excelJson.map((item) => {
        const key = `${item.custCode}-${item.processID}`;
        // If the map has an entry, use it. Otherwise, assume valid (null).
        return {
          ...item,
          validationError: errorMap.get(key) || null,
        };
      });

      dispatch(setExcelData(updatedJson));

      // 2. BETTER FEEDBACK LOGIC
      const totalErrors = updatedJson.filter((i) => i.validationError).length;

      // Calculate errors that are currently HIDDEN by the search filter
      const visibleKeys = new Set(filtered.map((i) => i.productKey)); // 'filtered' comes from your useMemo
      const hiddenErrors = updatedJson.filter(
        (i) => i.validationError && !visibleKeys.has(i.productKey),
      ).length;

      if (totalErrors === 0) {
        toast.success("Re-verification complete. No errors found!");
      } else {
        // Show detailed toast
        if (hiddenErrors > 0) {
          toast.error(
            `Found ${totalErrors} errors (${hiddenErrors} are hidden by your search filter!)`,
            { duration: 5000 },
          );
        } else {
          toast.error(`Re-verification complete. Found ${totalErrors} errors.`);
        }
      }
    } catch (error) {
      console.error("Reload error:", error);
      toast.error("Failed to reload validation.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-3 relative">
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400"
          >
            <div className="relative w-32 h-16 mb-4">
              <svg
                viewBox="0 0 100 50"
                className="w-full h-full fill-none"
                style={{ stroke: "var(--primary, #2563eb)" }}
              >
                {/* Pure Mathematical Infinity Path */}
                {/* The 'd' attribute below defines a perfect smooth figure-eight loop */}
                <path
                  id="infinity-path"
                  d="M31.6,15.5C21,15.5,12.5,24,12.5,34.5S21,53.5,31.6,53.5c6.2,0,11.7-3,15.1-7.5L66.7,21.5c3.4-4.5,8.9-7.5,15.1-7.5,10.6,0,19.1,8.5,19.1,19.1S92.4,52.4,81.8,52.4c-6.2,0-11.7-3-15.1-7.5L31.6,15.5Z"
                  transform="scale(0.8) translate(12, 5)"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <motion.path
                  d="M31.6,15.5C21,15.5,12.5,24,12.5,34.5S21,53.5,31.6,53.5c6.2,0,11.7-3,15.1-7.5L66.7,21.5c3.4-4.5,8.9-7.5,15.1-7.5,10.6,0,19.1,8.5,19.1,19.1S92.4,52.4,81.8,52.4c-6.2,0-11.7-3-15.1-7.5L31.6,15.5Z"
                  transform="scale(0.8) translate(12, 5)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{
                    pathLength: [0.1, 0.4, 0.1],
                    pathOffset: [0, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </svg>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Processing Data
            </p>
          </motion.div>
        ) : excelJson.length === 0 ? (
          /* === UPLOAD BOX STATE === */
          <motion.div
            key="upload-box"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-2xl w-full text-center">
              {/* Icon & Title */}
              <div className="mb-3 mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-[var(--primary)] rounded-full flex items-center justify-center">
                <SlCloudUpload className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 hover:text-[var(--primary)]">
                Upload New Price Sheet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4 text-[0.7rem] hover:text-[var(--primary)]">
                Fill in the details below and attach your file.
              </p>

              {/* === NEW INPUTS GRID === */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-left">
                {/* 1. Mode Toggle */}
                <div className="flex flex-col gap-2">
                  <label className="block text-[0.7rem] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">
                    Sheet Configuration
                  </label>
                  <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex items-center relative">
                    {/* Sliding Background Animation */}
                    <div
                      className={`absolute h-[calc(100%-8px)] w-[calc(50%-4px)] top-1 rounded-md bg-white dark:bg-slate-600 shadow-sm transition-all duration-200 ease-in-out ${sheetMode === "existing" ? "left-[calc(50%+2px)]" : "left-1"}`}
                    ></div>

                    <button
                      type="button"
                      onClick={() => handleModeChange("new")}
                      className={`relative z-10 w-1/2 text-[0.8rem] font-medium py-1.5 rounded-md transition-colors duration-200 ${sheetMode === "new" ? "text-[var(--primary)] dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                    >
                      New Sheet
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange("existing")}
                      className={`relative z-10 w-1/2 text-[0.8rem] font-medium py-1.5 rounded-md transition-colors duration-200 ${sheetMode === "existing" ? "text-[var(--primary)] dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                    >
                      Existing
                    </button>
                  </div>
                </div>

                {/* 2. Dynamic Input (Input vs Select) */}
                <div>
                  <label className="block text-[0.7rem] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    Ref ID <span className="text-red-600 text-[0.7rem]">*</span>
                  </label>

                  <div className="relative">
                    {sheetMode === "new" ? (
                      /* --- OPTION A: READ ONLY INPUT --- */
                      <>
                        <input
                          type="text"
                          value={priceSheetRef}
                          readOnly
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[0.7rem] font-mono rounded-lg px-3 py-2 cursor-lock outline-none"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800 uppercase tracking-wider">
                          Auto
                        </div>
                      </>
                    ) : (
                      /* --- OPTION B: SELECT DROPDOWN --- */
                      <div className="relative">
                        <Select
                          value={priceSheetRef || undefined}
                          onChange={(value) => {
                            dispatch(setPriceSheetRef(value));

                            const selectedSheet = existingSheets.find(
                              (s) => s.priceSheetRefNo === value,
                            );
                            // console.log(selectedSheet);
                            

                            if (selectedSheet) {
                              const start = selectedSheet.startDate
                                ? selectedSheet.startDate.split("T")[0]
                                : "";
                              const end = selectedSheet.endDate
                                ? selectedSheet.endDate.split("T")[0]
                                : "";

                              dispatch(setDates({ start, end }));
                              // Set existing remark
                              // dispatch(setRemark(selectedSheet.remarks || ""));
                            }
                          }}
                          loading={isLoadingList}
                          disabled={isLoadingList}
                          placeholder={
                            isLoadingList
                              ? "Loading refs..."
                              : "-- Select Sheet --"
                          }
                          className="w-full custom-ant-select"
                          popupClassName="custom-ant-dropdown"
                          size="middle"
                        >
                          {existingSheets
                            .filter((sheet) => sheet.activeStatus === true)
                            .map((sheet) => (
                              <Option
                                key={sheet.id}
                                value={sheet.priceSheetRefNo}
                              >
                                {sheet.priceSheetRefNo}
                              </Option>
                            ))}
                        </Select>

                        {/* Loading Spinner or Arrow Icon */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          {isLoadingList ? (
                            <svg
                              className="animate-spin h-4 w-4 text-[var(--primary)]"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <svg
                              className="fill-current h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-[0.7rem] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    Start Date{" "}
                    <span className="text-red-600 text-[0.7rem]">*</span>
                  </label>
                  <input
                    type="date"
                    min={getTodayString()}
                    value={startDate || ""}
                    onChange={(e) =>
                      dispatch(setDates({ start: e.target.value }))
                    }
                    readOnly={sheetMode === "existing"} // Lock if existing
                    className={`w-full text-[0.8rem] rounded-lg px-3 py-2 transition-shadow outline-none border
    ${sheetMode === "existing"
                        ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-[var(--primary)]"
                      }`}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-[0.7rem] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    End Date{" "}
                    <span className="text-red-600 text-[0.7rem]">*</span>
                  </label>
                  <input
                    type="date"
                    min={startDate}
                    value={endDate || ""}
                    onChange={(e) =>
                      dispatch(setDates({ end: e.target.value }))
                    }
                    readOnly={sheetMode === "existing"} // Lock if existing
                    className={`w-full text-[0.8rem] rounded-lg px-3 py-2 transition-shadow outline-none border
    ${sheetMode === "existing"
                        ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-[var(--primary)]"
                      }`}
                  />
                </div>
                {/* Category Select */}
                <div>
                  <label className="block text-[0.7rem] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    Select Tyre or Rim{" "}
                    <span className="text-red-600 text-[0.7rem]">*</span>
                  </label>
                  <div className="relative">
                    <Select
                      value={category}
                      onChange={(value) => dispatch(setCategory(value))}
                      defaultValue="Tyre"
                      className="w-full custom-ant-select"
                      popupClassName="custom-ant-dropdown"
                      size="middle"
                    >
                      <Option value="Tyre">Tyre</Option>
                      <Option value="Rim">Rim</Option>
                      <Option value="Rim">Assembly</Option>
                    </Select>

                    {/* Custom Arrow Icon */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <IoChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                {/* <div>
                  <label className="block text-[0.7rem] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={remark}
                    onChange={(e) => dispatch(setRemark(e.target.value))}
                    placeholder="Optional notes for this sheet"
                    maxLength={250}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-[0.8rem] rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div> */}
              </div>

              {/* File Upload Area */}
              <input
                type="file"
                accept=".xlsx,.xls"
                id="excelUpload"
                onChange={handleExcelUpload}
                className="hidden"
              />
              <div
                onClick={() => {
                  if (isSheetExpired()) {
                    toast.custom((t) => (
                      <div
                        className={`${t.visible ? "animate-enter" : "animate-leave"
                          } max-w-md w-full bg-white dark:bg-slate-900 shadow-xl rounded-xl pointer-events-auto flex border border-red-200 dark:border-red-800 overflow-hidden`}
                      >
                        {/* Left Accent */}
                        <div className="w-1.5 bg-gradient-to-b from-red-500 to-orange-500" />

                        {/* Content */}
                        <div className="flex-1 px-4 py-2">
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <IoMdWarning className="text-red-600 dark:text-red-400 text-xl" />
                            </div>

                            {/* Text */}
                            <div className="flex-1">
                              <p className="text-[0.8rem] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                Price Sheet Expired
                              </p>

                              <p className="mt-1 text-[0.72rem] text-slate-600 dark:text-slate-300 leading-relaxed">
                                Validity ended on{" "}
                                <span className="font-semibold text-red-600 dark:text-red-400">
                                  {endDate}
                                </span>
                                . Please update the end date before uploading.
                              </p>
                            </div>

                            {/* Close */}
                            <button
                              onClick={() => toast.dismiss(t.id)}
                              className="text-slate-400 hover:text-red-500 transition"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ));
                    return;
                  }

                  document.getElementById("excelUpload").click();
                }}
                className={`md:col-span-2 border-1 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition
                 ${isSheetExpired()
                    ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10 cursor-not-allowed opacity-70"
                    : "border-[var(--accent)] hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  }`}
              >
                <span className="text-[0.7rem] font-medium text-slate-600 dark:text-slate-300 group-hover:text-[var(--primary)] transition-colors">
                  Click to browse or drag Excel file here
                </span>
                <span className="text-[0.7rem] text-slate-400 dark:text-slate-500 mt-1">
                  (Only .xlsx and .xls files allowed)
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center mt-6">
                <button
                  className="flex items-center cursor-pointer rounded bg-[var(--primary)] dark:bg-gray-700 py-1 px-2.5 border border-transparent text-[0.7rem] text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] dark:hover:bg-gray-600"
                  type="button"
                  onClick={downloadPriceTemplate}
                >
                  <FaDownload className="w-5 h-5 mr-2" />
                  Download Template
                </button>
                <InfoTooltip content="⚠️ Please verify your file. You are responsible for any data uploaded by mistake." />
              </div>
            </div>
          </motion.div>
        ) : (
          /* === PREVIEW TABLE STATE (Unchanged) === */
          <motion.div
            key="preview-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col h-full relative"
          >
            {/* ... (Existing Preview Table Code) ... */}
            {isUploading && (
              <div className="absolute inset-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <div className="bg-white dark:bg-slate-800 p-4 shadow-xl rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Uploading Sheet{" "}
                    <span className="font-mono text-blue-600">
                      {priceSheetRef}
                    </span>
                    ...
                  </span>
                </div>
              </div>
            )}

            {duplicateCount > 0 && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 flex items-center gap-3 text-red-700 dark:text-red-300">
                <span className="text-[0.7rem] font-medium">
                  Found <strong>{duplicateCount} duplicate rows</strong>. Please
                  fix and re-upload.
                </span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-3 text-red-700">
                <span className="text-[0.7rem] font-medium">
                  Found <strong>{errorFilter} Error rows</strong>. Please fix
                  and re-upload.
                </span>
              </div>
            )}
            {/* {remark && (
              <div className="mb- bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 flex items-center gap-3 text-red-700 dark:text-red-300">
                <span className="text-[0.7rem] font-medium">
                  <strong>Remarks: {remark}</strong>
                </span>
              </div>
            )} */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-3 mb-1">
              <div className="shrink-0">
                <h3 className="text-md font-bold text-slate-700 dark:text-slate-200">
                  Preview Data
                </h3>
                <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                  File Name:{" "}
                  <span className="font-mono font-semibold text-[var(--primary))]">
                    {excelFileName}
                  </span>{" "}
                  <br />
                  <span>
                    {" "}
                    {sheetMode.charAt(0).toUpperCase() + sheetMode.slice(1)}
                  </span>{" "}
                  Ref ID:{" "}
                  <span className="font-mono font-semibold text-[var(--primary))]">
                    {priceSheetRef}
                  </span>{" "}
                  | Rows:{" "}
                  <span className="font-semibold">{filtered.length}</span>
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                <div className="flex gap-3 w-full md:w-auto justify-end">
                  <div className="md:w-auto mt-auto">
                    <SearchBar
                      value={search}
                      onChange={(e) => dispatch(setSearch(e.target.value))}
                      onSearch={() => { }}
                    />
                  </div>
                  <div className="mt-auto">
                    <ModernSelect
                      label="Filter By Customer"
                      className="w-40"
                      value={selectedUpdateCustomer}
                      onChange={(value) =>
                        dispatch(setSelectedUpdateCustomer(value))
                      }
                      options={[
                        { label: "All Customers", value: "All Customers" },
                        ...uniqueCustomers.map((cust) => ({
                          label: cust,
                          value: cust,
                        })),
                      ]}
                    />
                  </div>
                  {excelJson.some((i) => i.validationError) && (
                    <div className="flex gap-2">
                      <div className="mt-auto">
                        <ModernSelect
                          label="Filter By Error"
                          className="w-40 flex flex-col"
                          value={errorFilter}
                          onChange={(value) => dispatch(setErrorFilter(value))}
                          options={[
                            { label: "Show All", value: "All" },
                            ...uniqueErrors.map((err) => ({
                              label: err,
                              value: err,
                            })),
                          ]}
                        />
                      </div>
                      <button
                        className="flex items-center cursor-pointer rounded bg-[var(--primary)] dark:bg-gray-700 py-1.5 mt-auto px-2.5 border border-transparent text-[0.7rem] text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] dark:hover:bg-gray-600"
                        type="button"
                        onClick={downloadErrorExcelFile}
                      >
                        <FaDownload className="w-4 h-4 mr-2" />
                        Download Error File
                      </button>
                    </div>
                  )}
                  <div className="flex p-0.5 gap-2 ">
                    <button
                      className="flex items-center cursor-pointer rounded bg-[var(--primary)] dark:bg-gray-700 py-1.5 mt-auto  px-2.5 border border-transparent text-[0.7rem] text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] dark:hover:bg-gray-600"
                      type="button"
                      onClick={handleCancel}
                    >
                      <MdOutlineCancel className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleReload}
                      className="flex items-center cursor-pointer rounded bg-[var(--primary)] dark:bg-gray-700 py-1.5 mt-auto  px-2.5 border border-transparent text-[0.7rem] text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] dark:hover:bg-gray-600"
                    >
                      <SlReload className="w-4 h-4 mr-2" /> Reload
                    </button>
                    <button
                      className={`flex items-center rounded bg-[var(--primary)] dark:bg-gray-700 py-1.5 mt-auto px-2.5 border border-transparent text-[0.7rem] text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] cursor-pointer dark:hover:bg-gray-600 
    ${duplicateCount > 0 || errorCount > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      type="button"
                      onClick={handleConfirmUpload}
                      disabled={
                        isUploading || duplicateCount > 0 || errorCount > 0
                      }
                    >
                      <MdOutlineSaveAlt className="w-4 h-4 mr-2" />
                      Confirm & Save
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex flex-col">
              {/* ... (Existing Table Header & Body) ... */}
              <div className="grid grid-cols-[0.6fr_1.5fr_0.7fr_0.7fr_1fr_0.6fr_0.6fr_1.2fr_0.4fr_0.9fr_1.2fr_0.7fr_0.8fr] gap-4 px-6 py-3 bg-slate-100/80 dark:bg-slate-700/80 border-b border-slate-200 dark:border-slate-600 text-[0.7rem] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                <div>CustCode</div>
                <div>CustomerName</div>
                <div>Category</div>
                <div>Platform</div>
                <div>Brand</div>
                <div>Sidewall</div>
                <div>Type</div>
                <div>Size</div>
                <div>Rim</div>
                <div>Process ID</div>
                <div>Valid Dates</div>
                <div className="text-center">Status</div>
                <div className="text-right">Price</div>
              </div>

              <div
                ref={listRef}
                className="overflow-y-auto flex-1 p-1 space-y-1 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/30"
                onScroll={handleScroll}
              >
                {filtered.slice(0, visibleRows).map((item, idx) => (
                  <div
                    key={item.productKey}
                    className={`grid grid-cols-[0.6fr_1.5fr_0.7fr_0.7fr_1fr_0.6fr_0.6fr_1.2fr_0.4fr_0.9fr_1.2fr_0.7fr_0.8fr] gap-4 px-4 py-2 items-center rounded-lg border transition-colors ${item.isDuplicate || item.validationError ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/30"}`}
                  >
                    <span
                      className={`text-[0.7rem] font-mono ${item.isDuplicate || item.validationError ? "text-red-600 dark:text-red-400 font-bold" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {item.custCode}
                    </span>
                    <span className="text-[0.7rem] text-slate-600 dark:text-slate-300 truncate">
                      {item.customerName}
                    </span>
                    <span className="text-[0.7rem] text-slate-600 dark:text-slate-300 truncate">
                      {item.category}
                    </span>
                    <span className="font-mono text-[0.7rem] text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded w-fit truncate">
                      {item.config}
                    </span>
                    <span className="text-[0.7rem] text-slate-600 dark:text-slate-300 truncate">
                      {item.brand}
                    </span>
                    <span className="text-[0.7rem] text-slate-600 dark:text-slate-500 truncate">
                      {item.sidewall}
                    </span>
                    <span className="text-[0.7rem] text-slate-600 dark:text-slate-400 truncate">
                      {item.tyreType}
                    </span>
                    <span className="text-[0.7rem] font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.tyreSize}
                    </span>
                    <span className="text-[0.7rem] text-slate-600 dark:text-slate-300">
                      {item.rimWidth}
                    </span>
                    <span
                      className={`text-[0.7rem] truncate ${item.isDuplicate || item.validationError ? "text-red-600 dark:text-red-400 font-bold" : "font-semibold text-slate-700 dark:text-slate-200"}`}
                    >
                      {item.processID}
                    </span>
                    <div className="flex flex-col font-bold text-[0.7rem] text-slate-500 dark:text-slate-400">
                      <span>{item.startDate}</span>
                      <span className="text-slate-400 dark:text-slate-500">
                        to {item.endDate}
                      </span>
                    </div>
                    <div className="text-center">
                      {item.validationError ? (
                        // Show Error State
                        <div className="flex flex-col items-center">
                          <span className="px-2 py-0.5 rounded-full text-[0.5rem] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            INVALID
                          </span>
                          <span className="text-[0.6rem] text-red-500 mt-1 font-medium leading-tight">
                            {item.validationError}
                          </span>
                        </div>
                      ) : (
                        // Show Normal State
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.active ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"}`}
                        >
                          {item.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-right text-[0.8rem] font-bold ${item.isDuplicate || item.validationError ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"}`}
                    >
                      {item.unitPrice.toLocaleString()}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="py-20 text-center text-slate-400 text-[0.7rem]">
                    No matching records found.
                  </div>
                )}
                {visibleRows < filtered.length && (
                  <div className="py-4 text-center text-[0.7rem] text-slate-400 italic">
                    Loading more rows...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx>{`
        .btn-primary {
          @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm shadow-blue-500/30 text-[0.7rem];
        }
        .btn-secondary {
          @apply bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition text-[0.7rem];
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>  
  );
}