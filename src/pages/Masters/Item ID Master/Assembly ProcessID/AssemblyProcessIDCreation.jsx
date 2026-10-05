import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Layers, Maximize, Disc, Type, Tag,
  FileText, PlusCircle, Download, Copy, CheckCircle2, RefreshCcw, ChevronDown
} from "lucide-react";
import { DynamicDataTable } from "../../../../components/DynamicDataTable";
import { getEDCNumbers, getProcessID, getProcessIDByParameters, getProcessIDByPID, getProcessIDMaster, saveAssyProcess } from "../../../../Redux/Slices/Master/PI_Master/AssemblyProcessIDSlice";
import { useDispatch, useSelector } from "react-redux";
import { IoDocumentTextOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';
import SearchBar from "../../../../components/SearchBar";

// Order drives the "next dropdown" cascade: changing a field clears every
// field that comes after it so a stale, now-invalid selection can't linger.
const FIELD_ORDER = [
  "category",
  "platform",
  "tyreSize",
  "tyreRim",
  "tyreType",
  "brand",
  "sidewall",
  "directional",
];

const INITIAL_FILTERS = {
  category: "",
  platform: "",
  tyreSize: "",
  tyreRim: "",
  tyreType: "",
  brand: "",
  sidewall: "",
  directional: "",
};

const AssemblyProcessIDCreation = () => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const initialFilters = INITIAL_FILTERS;
  const [edcOptions, setEdcOptions] = useState([]);
  const [edcNumber, setEdcNumber] = useState("");
  const [processID, setProcessID] = useState("");
  const [tableData, setTableData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();
  const { ProcessIDMaster } = useSelector((state) => state.AssemblyProcessID)
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  // The mount effect already fires the initial "Download" (get-all) call —
  // this skips the preview effect's own copy of that same call on its
  // first run, so clearing filters later still re-fires it correctly.
  const didInitialLoadRef = useRef(false);
  const isProcessIDSearchRef = useRef(false);

  const finalTableData = useMemo(() => {
  const filtered = tableData.filter((row) => {
    if (!search.trim()) return true;

    return Object.values(row).some((value) =>
      String(value).trim().toLowerCase().includes(search.trim().toLowerCase())
    );
  });

  return filtered.sort((a, b) =>
    (a.category ?? "").localeCompare(b.category ?? "")
  );
}, [tableData, search]);

  useEffect(() => {
    dispatch(getProcessIDMaster());
    // Auto-load the full record set on mount — same call the "Get All
    // Records" button already makes — so users see data immediately
    // instead of having to click it manually first.
    fetchProcessIDDetails("Download");
  }, []);

  useEffect(() => {
    const fetchEDC = async () => {
      if (!filters.tyreSize || !filters.tyreRim) {
        setEdcOptions([]);
        return;
      }

      try {
        const data = await dispatch(getEDCNumbers(filters));

        console.log("EDC DATA:", data?.edcno);

        if (Array.isArray(data?.edcno)) {
          setEdcOptions(data?.edcno);
        } else {
          setEdcOptions([]);
        }
      } catch (error) {
        console.log("EDC API ERROR:", error);
        setEdcOptions([]);
      }
    };

    fetchEDC();
  }, [filters.tyreSize, filters.tyreRim]);

  useEffect(() => {
  // If ProcessID was searched directly,
  // do not generate a new ProcessID from the filters.
  if (isProcessIDSearchRef.current) {
    return;
  }

  const requiredFields = [
    "category",
    "platform",
    "tyreSize",
    "tyreRim",
    "tyreType",
    "brand",
    "sidewall",
  ];

  const isReady = requiredFields.every(
    (key) => filters[key]?.trim() !== ""
  );

  if (!isReady) {
    setProcessID("");
    return;
  }

  const fetchProcessID = async () => {
    try {
      const data = await dispatch(getProcessID(filters));

      if (data) {
        setProcessID(data);
      }
    } catch (error) {
      console.log("ProcessID API Error:", error);
    }
  };

  const timer = setTimeout(() => {
    fetchProcessID();
  }, 300);

  return () => clearTimeout(timer);

}, [filters]);

  useEffect(() => {
    // Fire on any dropdown selection (at least one filter set), same as
    // fetchProcessIDDetails's own "select" gate below — debounced so
    // rapid changes (e.g. the cascade clearing several fields at once)
    // only trigger a single request instead of one per field.
    const hasFilters = Object.values(filters).some((value) => value.trim() !== "");

    if (!hasFilters) {
      if (!didInitialLoadRef.current) {
        // First run on mount — the dedicated mount effect already made
        // this exact "Download" call, so skip the duplicate here.
        didInitialLoadRef.current = true;
        return;
      }
      // Filters were cleared back to none (Reset, or unselecting the last
      // dropdown) — reload the full list instead of just blanking the
      // table with no request, so it matches what "Get All Records" shows.
      fetchProcessIDDetails("Download");
      return;
    }

    didInitialLoadRef.current = true;

    const timer = setTimeout(() => {
      fetchProcessIDDetails("select");
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, refreshKey, dispatch]);

  const fetchProcessIDDetails = async (type) => {

    if (type === "select") {
      const hasFilters = Object.values(filters).some(value => value.trim() !== "");
      if (!hasFilters) {
        setTableData([]);
        return;
      }
    }

    try {
      const data = await dispatch(
        getProcessIDByParameters({
          Category: filters.category.trim().toUpperCase(),
          config: filters.platform.trim().toUpperCase(),
          TyreSize: filters.tyreSize.trim().toUpperCase(),
          TyreType: filters.tyreType.trim().toUpperCase(),
          TyreRim: filters.tyreRim.trim().toUpperCase(),
          Brand: filters.brand.trim().toUpperCase(),
          Sidewall: filters.sidewall.trim().toUpperCase(),
          Directional: filters.directional.trim().toUpperCase()
        })
      );

      if (Array.isArray(data)) {
        setTableData(data);
      } else {
        setTableData([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    if (!processID || !edcNumber || !filters.directional) {
      toast.error("Please select EDC, Directional and ensure ProcessID is generated.");
      return;
    }

    const payload = {
      edcNo: edcNumber,
      processID: processID,
      directional: filters.directional
    };

    try {
      const response = await dispatch(saveAssyProcess(payload));
      if (response) {
        setRefreshKey(prevKey => prevKey + 1);
      }
    } catch (error) {
      console.log(error);
    }

  };

 const handleProcessIDSearch = async (value) => {
  const pid = value.trim().toUpperCase();

  setProcessID(pid);

  // Not a complete Process ID yet
  if (pid.length !== 8) {
    return;
  }

  try {
    // Enter ProcessID search mode
    isProcessIDSearchRef.current = true;

    const data = await dispatch(getProcessIDByPID(pid));

    if (!data) {
      toast.error("Process ID not found");
      return;
    }

    console.log("PROCESS ID SEARCH RESULT:", data);

    // Populate all filters from Process ID
    setFilters({
      category: data.category || "",
      platform: data.config || "",
      tyreSize: data.tyreSize || "",
      tyreRim: data.tyreRim || "",
      tyreType: data.tyreType || "",
      brand: data.brand || "",
      sidewall: data.sidewall || "",
      directional: data.directional || "",
    });

    // Keep the searched Process ID
    setProcessID(pid);

  } catch (error) {
    console.log("PID search error:", error);
    toast.error("Unable to find Process ID");
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;

  const trimmedValue = value.trimStart();

  // User is now using dropdown mode
  isProcessIDSearchRef.current = false;

  setFilters((prev) => {
    if (prev[name] === trimmedValue) {
      return prev;
    }

    // Dropdown selection means old ProcessID is no longer valid
    setProcessID("");

    return {
      ...prev,
      [name]: trimmedValue,
    };
  });

  // Changing tyre size/rim or anything before them
  // invalidates selected EDC.
  const changedIndex = FIELD_ORDER.indexOf(name);
  const tyreRimIndex = FIELD_ORDER.indexOf("tyreRim");

  if (
    changedIndex !== -1 &&
    changedIndex <= tyreRimIndex
  ) {
    setEdcNumber("");
  }
};
  const handleDownloadExcel = () => {
    if (finalTableData.length === 0) {
      alert("No data available to download.");
      return;
    }

    // 1. Prepare the data: Map tableData to use Header names as Keys
    const excelData = finalTableData.map((row) => {
      const formattedRow = {};
      uploadColumns.forEach((col) => {
        // Use the Header string as the column name in Excel
        formattedRow[col.header] = row[col.accessor] || "";
      });
      return formattedRow;
    });

    // 2. Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Process Records");

    // 3. Define Column Widths (Optional but makes it look professional)
    const columnWidths = uploadColumns.map(() => ({ wch: 20 }));
    worksheet['!cols'] = columnWidths;
    const fileName = `Assembly_Process_${new Date().toISOString().slice(0, 10)}.xlsx`;
    // 4. Trigger the download
    XLSX.writeFile(workbook, fileName);
  };


  const copyToClipboard = () => {
    navigator.clipboard.writeText(processID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const sortList = (list) =>
    list ? [...new Set(list.map((item) => item.trim()))].sort((a, b) => a.localeCompare(b)) : [];

  // Memoized so dropdown lists are only re-sorted when the master data
  // actually changes, instead of on every keystroke/filter change.
  const dropdownOptions = useMemo(() => ({
    category: sortList(ProcessIDMaster?.categoryLists),
    platform: sortList(ProcessIDMaster?.configLists),
    tyreSize: sortList(ProcessIDMaster?.tyreSizeLists),
    tyreRim: sortList(ProcessIDMaster?.tyreRimLists),
    tyreType: sortList(ProcessIDMaster?.tyreTypeLists),
    brand: sortList(ProcessIDMaster?.brandLists),
    sidewall: sortList(ProcessIDMaster?.sidewallLists),
    directional: sortList(ProcessIDMaster?.directional),
  }), [ProcessIDMaster]);


  // Static — memoized so these aren't rebuilt (and DynamicDataTable's
  // `columns`-keyed memo isn't invalidated) on every render/filter change.
  const fieldIcons = useMemo(() => ({
    category: <Settings className="w-3.5 h-3.5" />,
    platform: <Layers className="w-3.5 h-3.5" />,
    tyreSize: <Maximize className="w-3.5 h-3.5" />,
    tyreRim: <Disc className="w-3.5 h-3.5" />,
    tyreType: <Type className="w-3.5 h-3.5" />,
    brand: <Tag className="w-3.5 h-3.5" />,
    sidewall: <FileText className="w-3.5 h-3.5" />,
    directional: <FileText className="w-3.5 h-3.5" />
  }), []);

  const uploadColumns = useMemo(() => [
    { header: "Category", width: '0.5fr', accessor: "category", align:'center' },
    { header: "Platform", width: '0.5fr', accessor: "config", align:'center' },
    { header: "Tyre Size", width: '1.2fr', accessor: "tyreSize", align:'center' },
    { header: "Rim", width: '0.5fr', accessor: "rimSize", align:'center' },
    { header: "Type", width: '0.5fr', accessor: "tyreType", align:'center' },
    { header: "Brand", width: '0.9fr', accessor: "brand", align:'center' },
    { header: "Sidewall", width: '0.9fr', accessor: "sidewall", align:'center' },
    { header: "Process ID", width: '1fr', accessor: "ttspid", align:'center' },
    { header: "Directional", width: '1fr', accessor: "directional", align:'center' },
    { header: "assy TyreSize", width: '1.5fr', accessor: "assyTyreSize", align:'center' },
    { header: "assy Pid", width: '0.9fr', accessor: "assyPid", align:'center' },
    { header: "assy EdcNo", width: '0.6fr', accessor: "assyEdcNo", align:'center' },
  ], []);

  return (
    <div className="p-2 bg-slate-50 dark:bg-slate-900 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto space-y-2 flex-1 flex flex-col min-h-0"
      >
        {/* Filter & Create card — collapsible */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-[11px] font-bold uppercase text-[var(--primary)] dark:text-slate-400 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" /> Filter &amp; Create
            </span>
            <motion.span
              animate={{ rotate: isFilterOpen ? 0 : -90 }}
              transition={{ duration: 0.2 }}
              className="text-slate-400 dark:text-slate-500"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {isFilterOpen && (
              <motion.div
                key="filter-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">

            {/* 1 to 7: Standard Filters */}
            {["category", "platform", "tyreSize", "tyreRim", "tyreType", "brand", "sidewall"].map((field) => (
              <div key={field} className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-tight text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  {fieldIcons[field]} {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <select
                  name={field}
                  value={filters[field]}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 dark:text-slate-200 outline-none hover:bg-white dark:hover:bg-slate-900 transition-all"
                >
                  <option value="">Select...</option>
                  {dropdownOptions[field]?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}

            {/* 8. Output ID (Process ID) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-tight text-[var(--primary)] dark:text-blue-400 flex items-center gap-1.5">
                <PlusCircle className="w-3 h-3" /> Tyre ProcessID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={processID}
                  maxLength={8}
                  onChange={(e) => handleProcessIDSearch(e.target.value)}
                  placeholder="Enter ProcessID"
                  className="w-full bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg px-2 py-1.5 text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300 outline-none"
                />
                {processID && (
                  <button onClick={copyToClipboard} className="absolute right-1 top-1/2 -translate-y-1/2 p-1">
                    {copied ? <CheckCircle2 className="w-3 h-3 text-green-500 dark:text-green-400" /> : <Copy className="w-3 h-3 text-blue-400 dark:text-blue-300" />}
                  </button>
                )}
              </div>
            </div>

            {/* 9. Directional */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-tight text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                Directional
              </label>
              <select
                name="directional"
                value={filters.directional}
                onChange={handleChange}
                className="w-full bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 dark:text-slate-200 outline-none hover:bg-white dark:hover:bg-slate-900"
              >
                <option value="">Select...</option>
                {dropdownOptions.directional?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* 10. EDC Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-tight text-slate-400 dark:text-slate-500">
                EDC Number
              </label>
              <UiSelect
                name="edcNumber"
                value={edcNumber}
                onChange={(e) => setEdcNumber(e.target.value)}
                options={edcOptions}
                placeholder="EDC"
              />
            </div>

          </div>

          {/* Minimal Action Bar */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/60">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSave} // This is correct as it's a function reference
              className="flex items-center gap-1.5 px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-bold hover:bg-[var(--primary)] transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Create
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              // FIXED: Removed quotes and used an arrow function if it's a real function
              onClick={() => typeof handleDownloadExcel === 'function' && handleDownloadExcel()}
              className="flex items-center gap-1.5 px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" /> Download
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              // FIXED: Wrapped in arrow function to prevent immediate execution on render
              onClick={() => fetchProcessIDDetails("Download")}
              className="flex items-center gap-1.5 px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-bold hover:bg-[var(--primary)] transition-all shadow-sm"
            >
              <IoDocumentTextOutline className="w-4 h-4" /> Get All Records
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setFilters(initialFilters);
                setProcessID("");
                setEdcNumber("");
                setTableData([]);

                // Added to clear the table on reset
              }}
              className="flex items-center gap-1.5 px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <RefreshCcw className="w-4 h-4" /> Reset
            </motion.button>
            <div className="">
              <SearchBar placeholder="Search by Tyre Size" onChange={(e) => setSearch(e.target.value)} value={search} />
            </div>
          </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dense Table Section */}
        <AnimatePresence mode="wait">
          {finalTableData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              <div className="px-4 py-2 bg-[var(--primary)] dark:bg-slate-950 flex justify-between items-center rounded-t-xl shrink-0">
                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Active Record Preview {tableData.length}</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-500 text-white rounded uppercase">Live</span>
              </div>
              <div className="p-0 text-xs flex-1 flex flex-col min-h-0">
                <DynamicDataTable
                  columns={uploadColumns}
                  data={finalTableData}
                  rowKey={(row, index) => `${row.ttspid || row.assyPid || "row"}-${index}`}
                  pagination
                  pageSize={50}
                  headerClassName='bg-slate-100 dark:bg-slate-900/60 text-[10px] uppercase font-bold'
                  // headerClassName="!bg-[var(--primary)] !text-white"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AssemblyProcessIDCreation;

const UiSelect = ({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select..."
}) => {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none cursor-pointer hover:bg-white dark:hover:bg-slate-900"
    >
      <option value="">{placeholder}</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};
