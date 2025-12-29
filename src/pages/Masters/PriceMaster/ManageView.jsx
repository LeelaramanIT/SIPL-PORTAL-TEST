import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import SearchBar from "../../../components/SearchBar";
import { CgArrowsExchange } from "react-icons/cg";
import { AiOutlineStop } from "react-icons/ai";
import { IoSaveOutline } from "react-icons/io5";
import ModernSelect from "../../../components/ModernSelect";
import { SlReload } from "react-icons/sl";
import axios from "axios";
import { getCurrencySymble } from "../../../utils/currencies";
import { FaFileDownload } from "react-icons/fa";
import toast from "react-hot-toast";
import DialogBox from "../../../components/DialogBox";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCustomer, setSelectedSheet, setSheetOptions, setItems, setLoading, resetAll } from "../../../Redux/Slices/PriceMasterSlice";
import { api } from "../../../utils/axios";
import { IoMdWarning } from "react-icons/io";
import InfoTooltip from "../../../components/InfoTooltip";

export default function ManageView({ }) {
  const [search, setSearch] = useState("");
  const [visibleRows, setVisibleRows] = useState(50);
  const [isOpen, setOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: "", message: "", onConfirm: () => { } });
  const dispatch = useDispatch();
  const [endDate, setEndDate] = useState("");
  const { selectedCustomer, selectedSheet, sheetOptions, items, loading } = useSelector((state) => state.priceMaster);
  const dateInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("active")

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setEndDate(newDate);
    // if (newDate) {
    //   handleSaveChanges()
    // }
  };
  const handleModeChange = (mode) => {
    setActiveTab(mode);
    setVisibleRows(50); // Reset visible rows to prevent blank spaces
  };
  const fetchData = async () => {
    try {
      const response = await api.get('/PriceSheet/price-sheet-ref-no');
      dispatch(setSheetOptions(response.data));
      if (response.data && response.data.length > 0 && !selectedSheet) {
        dispatch(setSelectedSheet(response.data[0].id.toString())); // Store as string for the select input
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  // --- API FETCHING ---
  useEffect(() => {
    fetchData();
  }, []);

  // Add this with your other useMemos
  const currentSheet = useMemo(() => {
    if (!sheetOptions || !Array.isArray(sheetOptions)) {
      return null;
    }

    // 2. Now it's safe to use .find()
    return sheetOptions?.find(sheet => sheet.id.toString() === selectedSheet);
  }, [sheetOptions, selectedSheet]);
  const moduleOn = currentSheet?.activeStatus;

  useEffect(() => {
    fetchSheetDetails();
  }, [currentSheet?.id]);

  const fetchSheetDetails = async () => {
    if (!currentSheet?.id) return;
    try {
      dispatch(setLoading(true));
      const response = await api.post(`/PriceSheet/price-sheet-line`, {
        id: Number(currentSheet.id),
        priceSheetRefNo: currentSheet.priceSheetRefNo
      }, { withCredentials: true });
      console.log(response);


      // 3. Optional: Add a check for valid data
      if (response.data && Array.isArray(response.data)) {
        const formattedData = response.data.map(row => ({
          custcode: row.custID,
          productKey: `${row.processID}~${row.custID}~${Math.random()}`, // Added random to ensure uniqueness
          customer: row.customerName || "Unknown",
          platform: row.config || row.platform,
          category: row.category,
          brand: row.brand,
          sidewall: row.sidewall,
          tyreType: row.tyreType,
          tyreSize: row.tyreSize,
          rimWidth: row.tyreRim || row.rimWidth,
          processID: row.processID,
          unitPrice: row.price,
          startDate: row.startDate ? formatDate(row.startDate) : "-",
          endDate: row.endDate ? formatDate(row.endDate) : "-",
          active: row.activeStatus === true || row.activeStatus === 1 || String(row.activeStatus).toLowerCase() === "true",
          userCurrency: row.userCurrency || "",
          updatedBy: row.updatedBy || "",
          updateDate: row.updateDate || "",
          createdBy: row.createdBy || "",
          createdDate: row.createdDate || "",
        }));

        dispatch(setItems(formattedData));
      }
    } catch (error) {
      console.error("Error loading Price Sheet data:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // --- RESIZABLE COLUMNS ---
  const [columns, setColumns] = useState([
    { name: "CustCode", width: 80, align: "left" },
    { name: "Customer", width: 200, align: "left" }, // Increased: Names need space
    { name: "Category", width: 80, align: "left" },
    { name: "Platform", width: 80, align: "left" },
    { name: "Brand", width: 120, align: "left" },    // Decreased: Brands usually fit here
    { name: "Sidewall", width: 90, align: "left" },
    { name: "Type", width: 120, align: "left" },     // Decreased: Types are usually short
    { name: "Tyre Size", width: 180, align: "left" }, // Decreased slightly
    { name: "Rim", width: 60, align: "left" },       // Decreased: "R18" is short
    { name: "Process ID", width: 110, align: "left" }, // Decreased
    { name: "Valid Dates", width: 160, align: "left" },
    { name: "Status", width: 90, align: "center" },
    { name: "Price", width: 100, align: "right" },
    { name: "Info", width: 70, align: "center" },    // Decreased & Centered (assuming icon)
  ]);

  const gridStyle = useMemo(() => ({
    gridTemplateColumns: columns.map(c => `${c.width}px`).join(" ")
  }), [columns]);

  const startResize = (index, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columns[index].width;

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(50, startWidth + delta);
      setColumns(prev => {
        const next = [...prev];
        next[index] = { ...next[index], width: newWidth };
        return next;
      });
    };

    const handleMouseUp = () => {
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const excelDateToJSDate = (serial) => {
    if (!serial) return null;
    const date = new Date(Math.floor(serial - 25569) * 86400 * 1000);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  const uniqueCustomers = [...new Set(items.map(item => item.customer))].sort();

  const filtered = items.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (item.processID || "").toLowerCase().includes(term) ||
      (item.tyreSize || "").toLowerCase().includes(term) ||
      (item.brand || "").toLowerCase().includes(term) ||
      (item.platform || "").toLowerCase().includes(term);
    const matchesCustomer = selectedCustomer === "All Customers" || item.customer === selectedCustomer;
    const matchesStatus = activeTab === "active" ? item.active : !item.active;
    return matchesSearch && matchesCustomer && matchesStatus;
  });

  const handleUpdate = (data, Type) => {
    if (Type === "Disable All") {
      const isFiltered = selectedCustomer !== "All Customers";
      const custCode = filtered.map(i => i.custcode);

      // Prepare the configuration
      const config = {
        title: isFiltered
          ? "Disable Pricing for Selected Customer"
          : "Disable Pricing for Entire Price Sheet",

        message: isFiltered ? (
          // OPTION 1: Single Customer Message
          <span className="text-slate-600 dark:text-slate-300">
            Disable all pricing for{" "}
            <span className="font-semibold text-[var(--primary)] dark:text-blue-400">
              {selectedCustomer}
            </span>
            ?
          </span>
        ) : (
          // OPTION 2: Entire Sheet Message
          <div className="text-slate-600 dark:text-slate-950">
            This action will disable all pricing entries for every customer in the price
            sheet{" "}
            <span className="font-semibold text-[var(--primary)] dark:text-blue-400">
              {currentSheet.priceSheetRefNo}
            </span>
            . Do you want to continue?
          </div>
        ),

        onConfirm: async () => {
          try {
            const payload = isFiltered
              ? {
                updateType: "CustCode",
                customerStatus: {
                  custCode: custCode[0],
                  priceRefNo: currentSheet.id,
                },
              }
              : { updateType: "PriceSheet", PriceRefNos: [currentSheet.id] };

            const res = await api.put("/PriceSheet/update-status-SINGLE", payload);

            if (res.status === 200) {
              toast.success("Price Sheet status updated successfully.");
              fetchSheetDetails();
              fetchData()
              setOpen(false);
            }
          } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update status.");
          }
        },
      };

      setDialogConfig(config);
      setOpen(true);
    }
    if (Type === "Disable Selected") {

    }
  };

  const downloadCurrentSheet = () => {
    const data = filtered.map(item => ({
      "CustCode": item.custcode,
      "ProcessID": item.processID,
      "UnitPrice": `${item.unitPrice.toLocaleString()}`,
      "CustomerName": item.customer,
      "Category": item.category,
      "Config": item.platform,
      "TyreSize": item.tyreSize,
      "TyreRim": item.rimWidth,
      "TyreType": item.tyreType,
      "Brand": item.brand,
      "Sidewall": item.sidewall,
      // "Incoterms": item.incoterms || "",
      "StartDate": item.startDate,
      "EndDate": item.endDate,
      "Status": item.active ? "Active" : "Inactive",
      "UserCurrency": item.userCurrency || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Price Sheet");
    XLSX.writeFile(workbook, "Price_Sheet_Template.xlsx");
    toast.success("Template downloaded!");
  };

  useEffect(() => {
    setVisibleRows(50);
  }, [search, selectedCustomer]);

  // --- FIXED SCROLL HANDLER ---
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Trigger when 100px from the bottom to make it feel smoother
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      setVisibleRows((prev) => Math.min(prev + 50, filtered.length));
    }
  };

  const handleReload = () => {
    dispatch(resetAll());
    fetchSheetDetails();
    fetchData()
    setEndDate("")
  };

  // 1. Add this function to handle individual status toggles
  const handleToggleStatus = async (item) => {
    if (!moduleOn || !item.active) {
      toast("Cannot modify inactive entries!", {
        icon: "⚠️",
        style: {
          border: "0.5px solid #F59E0B", // Amber border
          padding: "12px",
          color: "#92400E",            // Dark amber text
          background: "#FFFBEB",       // Light amber background
        },
      });
      return;
    }

    // 1. Calculate the new status immediately based on the clicked item
    const newStatus = !item.active;

    const payload = {
      updateType: "Line",
      lines: [{
        priceSheetRefNo: currentSheet.id,
        custCode: item.custcode,
        processId: item.processID
      }]
    };

    setDialogConfig({
      title: "Disable Pricing Entry",
      confirmText: "Disable Pricing",
      message: (
        <div className="text-slate-950 dark:text-slate-200">
          <span className="text-yellow-600 flex items-center gap-1 font-semibold">
            <IoMdWarning /> Warning
          </span>
          Disable pricing for process{" "}
          <span className="font-semibold text-red-600">{item.processID}</span>{" "}
          for customer{" "}
          <span className="font-semibold text-red-600">{item.custcode}</span>?
        </div>
      ),
      onConfirm: async () => {
        // 1. Define the logic as a Promise function
        const executeUpdate = async () => {
          const response = await api.put('/PriceSheet/update-status-SINGLE', payload);

          // Check custom validation if axios doesn't throw automatically on non-200
          if (response.status !== 200) {
            throw new Error("API returned error");
          }

          // 2. Perform State Updates (Redux + Local)
          const updatedList = items.map((row) =>
            row.productKey === item.productKey
              ? { ...row, active: newStatus }
              : row
          );
          dispatch(setItems(updatedList));
          setOpen(false);

          // 3. Return a string to be used in the success message
          return `Status updated for ${item.processID}`;
        };

        // 4. Pass that function to toast.promise
        toast.promise(
          executeUpdate(), // Call the function here
          {
            loading: 'Updating status...',
            success: (data) => <b>{data}</b>, // 'data' is the string returned above
            error: <b>Could not update status.</b>,
          }
        );
      },
    });

    setOpen(true);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString.split('T')[0].split('-').reverse().join('-');
  };

  const handleSaveChanges = async () => {
    if (!endDate) {
      toast.error("Please select an end date.");
      return;
    }
    const config = {
      title: "Update End Date",
      message: `Update end date to ${endDate} for all entries in sheet ${currentSheet.priceSheetRefNo}?`,
      onConfirm: async () => {
        try {
          const payload = { updateType: "PriceSheet", priceRefNos: [currentSheet.id], endDate: endDate };
          const res = await api.put('/PriceSheet/update-EndDate', payload);
          if (res.status === 200) {
            toast.success("End dates updated successfully.");
            fetchSheetDetails();
            fetchData();
            setEndDate("");
            setOpen(false);
          }
        } catch (error) {
          console.error("Update error:", error);
          toast.error("Failed to update end dates.");
        }
      }
    }
    setDialogConfig(config);
    setOpen(true);
  }
  // Assuming 'currentSheet' holds your JSON data
  const sheetDetailsContent = (
    <div className="w-[180px] text-left p-1">

      {/* 1. Header: Reference & Status */}
      <div className="flex items-center justify-between border-b border-slate-600 pb-2 mb-2">
        <span className="font-bold text-slate-100 text-sm">
          {currentSheet?.priceSheetRefNo || "No Ref"}
        </span>
        {/* Status Badge */}
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${currentSheet?.activeStatus
          ? "border-green-500 text-green-400 bg-green-500/10"
          : "border-red-500 text-red-400 bg-red-500/10"
          }`}>
          {currentSheet?.activeStatus ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      {/* 2. Body: Data Grid */}
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">

        {/* Start Date */}
        <span className="text-slate-300">Start:</span>
        <span className="text-slate-200 text-right font-mono">
          {formatDate(currentSheet?.startDate)}
        </span>

        {/* End Date */}
        <span className="text-slate-300">End:</span>
        <span className="text-slate-200 text-right font-mono">
          {formatDate(currentSheet?.endDate)}
        </span>

        {/* Separator */}
        <div className="col-span-2 border-t border-slate-700 my-1"></div>

        {/* Created By */}
        <span className="text-slate-300">Created:</span>
        <div className="text-right flex flex-col">
          <span className="text-slate-200">{currentSheet?.createdBy}</span>
          <span className="text-[10px] text-slate-300">
            {formatDate(currentSheet?.createdDate)}
          </span>
        </div>

        {/* Update Info (Only show if updated) */}
        {currentSheet?.updateBy && (
          <>
            <span className="text-slate-300">Updated:</span>
            <div className="text-right flex flex-col">
              <span className="text-slate-200">{currentSheet?.updateBy}</span>
              <span className="text-[10px] text-slate-300">
                {formatDate(currentSheet?.updatedDate)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 3. Footer: Warning Message */}
      <div className="mt-3 pt-2 border-t border-slate-600 text-[10px] text-amber-500 leading-tight">
        ⚠️<span className="">Warning:</span> This is the Master Price Sheet. Modifications directly affect system pricing. Do not edit unless strictly necessary.
      </div>
    </div>
  );

  const SheetDetailsContent = ({ sheet }) => {
    if (!sheet) return null;
    console.log(sheet);


    return (
      <div className="w-[180px] text-left p-1">

        {/* 1. Header: Generic Title & Status */}
        <div className="flex items-center justify-between border-b border-slate-600 pb-2 mb-2">
          <span className="font-bold text-slate-100 text-sm">Sheet Details</span>
          {/* Status Badge */}
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sheet.active
              ? "border-green-500 text-green-400 bg-green-500/10"
              : "border-red-500 text-red-400 bg-red-500/10"
              }`}
          >
            {sheet.active ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        {/* 2. Body: Data Grid */}
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">

          {/* Start Date */}
          <span className="text-slate-300">Start:</span>
          <span className="text-slate-200 text-right font-mono">
            {sheet?.startDate}
          </span>

          {/* End Date */}
          <span className="text-slate-300">End:</span>
          <span className="text-slate-200 text-right font-mono">
            {sheet?.endDate}
          </span>

          {/* Separator */}
          <div className="col-span-2 border-t border-slate-700 my-1"></div>

          {/* Created By */}
          <span className="text-slate-300">Created:</span>
          <div className="text-right flex flex-col">
            <span className="text-slate-200">{sheet.createdBy}</span>
            <span className="text-[10px] text-slate-300">
              {/* Handling lowercase 'createddate' from your JSON */}
              {formatDate(sheet.createddate) || "-"}
            </span>
          </div>

          {/* Update Info (Only show if updateDate exists) */}
          {sheet.updatedBy && (
            <>
              <span className="text-slate-300">Updated:</span>
              <div className="text-right flex flex-col">
                <span className="text-slate-200">{sheet.updatedBy}</span>
                <span className="text-[10px] text-slate-300">
                  {formatDate(sheet.updateDate) || "-"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* 3. Footer: Warning Message */}
        <div className="mt-3 pt-2 border-t border-slate-600 text-[10px] text-amber-500 leading-tight">
          ⚠️ <span className="font-bold">Warning:</span> This is the Master Price
          Sheet. Modifications directly affect system pricing. Do not edit unless
          strictly necessary.
        </div>
      </div>
    );
  };

  // 1. Define this helper function


  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col p-2"
    >
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row mb-4 px-3 items-center justify-between">
        <div className="flex gap-4 w-full md:w-auto flex-1">
          <div className="shrink-0 flex flex-col ">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
              Preview Data
            </h3>

            {/* ROW 1: Ref and Rows */}
            <div className="flex items-center gap-4 text-sm">

              {/* Ref Section */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-sm">Ref:</span>
                <span className="font-mono font-bold text-[var(--primary)] dark:text-blue-400 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                  {currentSheet ? currentSheet.priceSheetRefNo : "N/A"}
                </span>
              </div>

              {/* Rows Section */}
              <div className="flex items-center gap-2">
                | <span className="text-slate-500 dark:text-slate-400 font-sm">Rows:</span>
                <span className="font-bold text-[var(--primary)] dark:text-slate-200">
                  {filtered.length}
                </span>
              </div>
              {/* Info Section */}
              <div className="flex items-center gap-2">
                | <span className="text-slate-500 dark:text-slate-400 font-sm">Info:</span>
                <InfoTooltip
                  iconSize={18}
                  // Pass the JSX variable here, NOT a string
                  content={sheetDetailsContent}
                  className="text-amber-500 hover:text-amber-600"
                />
              </div>

            </div>

            {/* ROW 2: Validity and Info */}
            <div className="flex items-center gap-6 text-sm ">

              {/* Validity Section */}
              {currentSheet && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sm">Validity:</span>
                  <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-[var(--primary)]">{formatDate(currentSheet.startDate)}</span>
                    <span className="text-slate-400 font-light text-xs">to</span>
                    <span className="text-[var(--primary)]">{formatDate(currentSheet.endDate)}</span>
                  </div>
                </div>
              )}

            </div>
          </div>
          <ModernSelect value={currentSheet?.id} onChange={(e) => dispatch(setSelectedSheet(e.target.value))} label={'Price Sheet'} className="w-40">
            {Array.isArray(sheetOptions) && sheetOptions.map((sheet, index) => (
              <option className="text-black dark:text-slate-100 dark:bg-slate-800" key={index} value={sheet.id}>{sheet.priceSheetRefNo}</option>
            ))}
          </ModernSelect>
          <ModernSelect
            label={'Filter By Customer'}
            className="w-40"
            value={selectedCustomer}
            onChange={(e) => dispatch(setSelectedCustomer(e.target.value))}
          >
            <option className="text-black dark:text-slate-100 dark:bg-slate-800" value="All Customers">All Customers</option>
            {uniqueCustomers?.map((cust, idx) => (
              <option className="text-slate-700 dark:text-slate-300 dark:bg-slate-800" key={idx} value={cust}>{cust}</option>
            ))}
          </ModernSelect>
          <div className="relative flex-1 max-w-sm mt-4.5">
            <SearchBar placeholder="Search by Process ID or Tyre Size" onChange={(e) => setSearch(e.target.value)} value={search} />
          </div>
          
        </div>
        <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">
              Active Status
            </label>
            <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex items-center relative">
              {/* Sliding Background Animation */}
              <div
                className={`absolute h-[calc(100%-8px)] w-[calc(50%-4px)] top-1 rounded-md bg-white dark:bg-slate-600 shadow-sm transition-all duration-200 ease-in-out ${activeTab === "inactive" ? "left-[calc(50%+2px)]" : "left-1"
                  }`}
              ></div>

              <button
                type="button"
                onClick={() => handleModeChange("active")}
                className={`relative z-10 w-16 text-sm font-medium py-1.5 p-2 rounded-md transition-colors duration-200 ${activeTab === "active"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("inactive")}
                className={`relative z-10 w-1/2 text-sm font-medium py-1.5 p-2 rounded-md transition-colors duration-200 ${activeTab === "inactive"
                    ? "text-black bg-red-200 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
              >
                Inactive
              </button>
            </div>
          </div>
        <div className="flex gap-3">

          <button onClick={handleReload} className="flex items-center rounded bg-[var(--primary)] dark:bg-gray-700 py-1 mt-4.5 px-2.5 border border-transparent text-sm text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] dark:hover:bg-gray-600">
            <SlReload className="w-5 h-5 mr-2" /> Reload
          </button>
          {currentSheet?.activeStatus === true && <div className="relative inline-block">
            {/* 1. The Visible Button */}
            <button
              type="button"
              onClick={() => dateInputRef.current.showPicker()} // Opens the date picker
              className="flex items-center rounded bg-[var(--primary)] dark:bg-gray-700 py-1.5 mt-4 px-2.5 border border-transparent text-sm text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] dark:hover:bg-gray-600 cursor-pointer"
            >
              <CgArrowsExchange className="w-5 h-5 mr-2" />
              Change End Date
            </button>

            {/* 2. The Hidden Input */}
            <input
              type="date"
              ref={dateInputRef}
              onChange={handleDateChange}
              min={currentSheet?.endDate ? currentSheet?.endDate?.split('T')[0] : undefined}
              className="absolute opacity-0 pointer-events-none w-0 h-0 bottom-0 left-0" // Completely hidden
            />
          </div>}
          {currentSheet?.activeStatus === true && <button onClick={() => handleUpdate("data", "Disable All")} className="flex items-center rounded bg-[var(--primary)] dark:bg-gray-700 py-1 mt-4.5 px-2.5 border border-transparent text-sm text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] dark:hover:bg-gray-600">
            <AiOutlineStop className="w-5 h-5 mr-2" /> Disable All
          </button>}
          <button onClick={downloadCurrentSheet} className="flex items-center rounded bg-[var(--primary)] dark:bg-gray-700 py-1 mt-4.5 px-2.5 border border-transparent text-sm text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] dark:hover:bg-gray-600">
            <FaFileDownload className="w-5 h-5 mr-2" /> Download Sheet
          </button>
          {endDate && <button onClick={handleSaveChanges} className="flex items-center rounded bg-[var(--primary)] dark:bg-gray-700 py-1 mt-4.5 px-2.5 border border-transparent text-sm text-white transition-all shadow-sm hover:bg-[var(--primary-hover)] dark:hover:bg-gray-600">
            <IoSaveOutline className="w-5 h-5 mr-2" /> Save Changes
          </button>}
        </div>
      </div>

      {/* === DATA GRID TABLE === */}
      <div className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex flex-col overflow-hidden">
        {/* Horizontal Scroll Wrapper */}
        <div className="flex-1 overflow-x-auto custom-scrollbar flex flex-col">

          {/* --- STICKY HEADER --- */}
          <div
            style={gridStyle}
            className="grid gap-4 px-6 py-3 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 z-30 w-max"
          >
            {columns.map((col, index) => (
              <div key={index} className={`relative flex items-center ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                <span className="truncate">{col.name}</span>
                <div
                  onMouseDown={(e) => startResize(index, e)}
                  className="absolute right-[-16px] top-0 bottom-0 w-4 cursor-col-resize hover:bg-blue-400/30 transition-colors z-20 flex justify-center items-center group"
                >
                  <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-600 group-hover:bg-blue-400"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Body / Vertical Scroll */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-900/30 p-2 space-y-1"
            onScroll={handleScroll}
            style={{ minWidth: 'max-content' }}
          >
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-20">
                <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-[var(--primary)] rounded-full animate-spin mb-2"></div>
                <span className="text-xs">Loading Price Sheet...</span>
              </div>
            ) : (
              <>
                {filtered.slice(0, visibleRows).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={gridStyle}
                    className={`grid gap-4 px-4 py-4 items-center rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-blue-400/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors w-max ${!moduleOn ? "opacity-50 grayscale" : ""}`}
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={item.custcode}>{item.custcode}</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate" title={item.customer}>{item.customer}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{item.category}</span>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded w-fit truncate">{item.platform}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate" title={item.brand}>{item.brand}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{item.sidewall}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 truncate" title={item.tyreType}>{item.tyreType}</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={item.tyreSize}>{item.tyreSize}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{item.rimWidth}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate" title={item.processID}>{item.processID}</span>
                    <div className="flex flex-col text-xs text-slate-500 dark:text-slate-400 truncate">
                      <span>{item.startDate}</span>
                      <span className="text-slate-400 dark:text-slate-500">to {item.endDate}</span>
                    </div>
                    <div className="text-center flex flex-col items-center justify-center">
                      {/* 2. Visual Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1 transition-colors ${item.active ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                        }`}>
                        {item.active ? "ACTIVE" : "INACTIVE"}
                      </span>

                      {/* 3. The Toggle Switch */}
                      <button
                        onClick={() => handleToggleStatus(item)}
                        disabled={!moduleOn} // Disable toggle if the whole module is off
                        className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${!moduleOn ? "bg-slate-200 dark:bg-slate-600 cursor-not-allowed" : item.active ? "bg-green-600" : "bg-red-300 dark:bg-red-900"
                          }`}
                      >
                        <motion.div
                          animate={{ x: item.active ? 20 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="w-4 h-4 bg-white rounded-full shadow-sm absolute top-0.5"
                        />
                      </button>
                    </div>

                    <div className="text-right font-bold text-slate-700 dark:text-slate-200 truncate">
                      {getCurrencySymble(item.userCurrency)} {item.unitPrice ? `${Number(item.unitPrice).toLocaleString()}` : "-"}
                    </div>
                    <InfoTooltip className="text-amber-500 justify-center" content={<SheetDetailsContent sheet={item} />} />
                  </motion.div>
                ))}

                {filtered.length === 0 && (
                  <div className="text-center py-20 text-slate-400 dark:text-slate-500 min-w-full">No items match your search.</div>
                )}

                {visibleRows < filtered.length && (
                  <div className="py-4 text-center text-xs text-slate-400 italic min-w-full">
                    Loading more rows...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <DialogBox
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText="Confirm Disable"
        cancelText="Go Back"
        onConfirm={dialogConfig.onConfirm}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </motion.div>
  );
}