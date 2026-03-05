import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Layers, Maximize, Disc, Type, Tag,
  FileText, PlusCircle, Download, Copy, CheckCircle2, RefreshCcw
} from "lucide-react";
import { DynamicDataTable } from "../../../../components/DynamicDataTable";
import { getEDCNumbers, getProcessID, getProcessIDByParameters, getProcessIDByPID, getProcessIDMaster, saveAssyProcess } from "../../../../Redux/Slices/Master/PI_Master/AssemblyProcessIDSlice";
import { useDispatch, useSelector } from "react-redux";
import { IoDocumentTextOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';
import SearchBar from "../../../../components/SearchBar";

const AssemblyProcessIDCreation = () => {
  const [filters, setFilters] = useState({
    category: "",
    platform: "",
    tyreSize: "",
    tyreRim: "",
    tyreType: "",
    brand: "",
    sidewall: "",
    directional: '',
  });
  const initialFilters = {
    category: "",
    platform: "",
    tyreSize: "",
    tyreRim: "",
    tyreType: "",
    brand: "",
    sidewall: "",
    directional: ""
  };
  const [edcOptions, setEdcOptions] = useState([]);
  const [edcNumber, setEdcNumber] = useState("");
  const [processID, setProcessID] = useState("");
  const [tableData, setTableData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();
  const { ProcessIDMaster } = useSelector((state) => state.AssemblyProcessID)
  const [search, setSearch] = useState("");

  const finalTableData = useMemo(() => {
    const filtered = tableData.filter((row) => {
      if (!search.trim()) return true;

      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      );
    });

    return filtered.sort((a, b) =>
      (a.category ?? "").localeCompare(b.category ?? "")
    );
  }, [tableData, search]);

  useEffect(() => {
    dispatch(getProcessIDMaster())
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
    const fetchProcessID = async () => {
      try {
        const data = await dispatch(getProcessID(filters))
        setProcessID(data);
      } catch (error) {
        console.log("ProcessID API Error:", error);
      }
    };

    const requiredFields = [
      "category",
      "platform",
      "tyreSize",
      "tyreRim",
      "tyreType",
      "brand",
      "sidewall"
    ];

    const isReady = requiredFields.every(
      (key) => filters[key]?.trim() !== ""
    );

    if (isReady) {
      const timer = setTimeout(() => {
        fetchProcessID();
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setProcessID("");
    }

  }, [filters]);

  useEffect(() => {
    fetchProcessIDDetails("select");
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
    setProcessID(value);

    if (value.length !== 8) return;

    try {
      const data = await dispatch(getProcessIDByPID(value));

      if (data) {
        setFilters({
          category: data.category || "",
          platform: data.config || "",
          tyreSize: data.tyreSize || "",
          tyreRim: data.tyreRim || "",
          tyreType: data.tyreType || "",
          brand: data.brand || "",
          sidewall: data.sidewall || "",
          directional: ""
        });
      }

    } catch (error) {
      console.log("PID search error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      if (prev[name] !== value) {
        setProcessID("");
      }

      return {
        ...prev,
        [name]: value
      };
    });
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
  const sortList = (list) => list?.slice().sort((a, b) => a.localeCompare(b));

  const dropdownOptions = {
    category: sortList(ProcessIDMaster?.categoryLists),
    platform: sortList(ProcessIDMaster?.configLists),
    tyreSize: sortList(ProcessIDMaster?.tyreSizeLists),
    tyreRim: sortList(ProcessIDMaster?.tyreRimLists),
    tyreType: sortList(ProcessIDMaster?.tyreTypeLists),
    brand: sortList(ProcessIDMaster?.brandLists),
    sidewall: sortList(ProcessIDMaster?.sidewallLists),
    directional: sortList(ProcessIDMaster?.directional)
  };


  const fieldIcons = {
    category: <Settings className="w-3.5 h-3.5" />,
    platform: <Layers className="w-3.5 h-3.5" />,
    tyreSize: <Maximize className="w-3.5 h-3.5" />,
    tyreRim: <Disc className="w-3.5 h-3.5" />,
    tyreType: <Type className="w-3.5 h-3.5" />,
    brand: <Tag className="w-3.5 h-3.5" />,
    sidewall: <FileText className="w-3.5 h-3.5" />,
    directional: <FileText className="w-3.5 h-3.5" />
  };

  const uploadColumns = [
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
  ];

  return (
    <div className="p-2 bg-slate-50 h-[calc(100vh-62px)] font-sans selection:bg-blue-100">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto space-y-2"
      >
        {/* categoryuration Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">

            {/* 1 to 7: Standard Filters */}
            {["category", "platform", "tyreSize", "tyreRim", "tyreType", "brand", "sidewall"].map((field) => (
              <div key={field} className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-tight text-slate-400 flex items-center gap-1.5">
                  {fieldIcons[field]} {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <select
                  name={field}
                  value={filters[field]}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 outline-none hover:bg-white transition-all"
                >
                  <option value="">Select...</option>
                  {dropdownOptions[field]?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}

            {/* 8. Output ID (Process ID) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-tight text-blue-600 flex items-center gap-1.5">
                <PlusCircle className="w-3 h-3" /> Tyre ProcessID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={processID}
                  maxLength={8}
                  onChange={(e) => handleProcessIDSearch(e.target.value)}
                  placeholder="Enter ProcessID"
                  className="w-full bg-blue-50/50 border border-blue-100 rounded-lg px-2 py-1.5 text-[11px] font-mono font-bold text-blue-700 outline-none"
                />
                {processID && (
                  <button onClick={copyToClipboard} className="absolute right-1 top-1/2 -translate-y-1/2 p-1">
                    {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-blue-400" />}
                  </button>
                )}
              </div>
            </div>

            {/* 9. Directional */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-tight text-slate-400 flex items-center gap-1.5">
                Directional
              </label>
              <select
                name="directional"
                value={filters.directional}
                onChange={handleChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 outline-none hover:bg-white"
              >
                <option value="">Select...</option>
                {dropdownOptions.directional?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* 10. EDC Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
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
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-50">
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
              className="flex items-center gap-1.5 px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
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
                setTableData([]);

                // Added to clear the table on reset
              }}
              className="flex items-center gap-1.5 px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCcw className="w-4 h-4" /> Reset
            </motion.button>
            <div className="">
              <SearchBar placeholder="Search by Tyre Size" onChange={(e) => setSearch(e.target.value)} value={search} />
            </div>
          </div>
        </div>

        {/* Dense Table Section */}
        <AnimatePresence mode="wait">
          {finalTableData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200"
            >
              <div className="px-4 py-2 bg-slate-900 flex justify-between items-center rounded-t-xl">
                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Active Record Preview {tableData.length}</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-500 text-white rounded uppercase">Live</span>
              </div>
              <div className="p-0 text-xs h-[45vh] overflow-y-auto custom-scrollbar">
                <DynamicDataTable
                  columns={uploadColumns}
                  data={finalTableData}
                  headerClassName='bg-slate-100 text-[var(--text-color)] text-[10px] uppercase font-bold'
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
      className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none cursor-pointer hover:bg-white"
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
