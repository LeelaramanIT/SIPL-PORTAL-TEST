import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Layers, Maximize, Disc, Type, Tag,
  FileText, PlusCircle, Search, Copy, CheckCircle2, RefreshCcw
} from "lucide-react";
import { DynamicDataTable } from "../../../../components/DynamicDataTable";
import { getProcessIDByParameters, getProcessIDMaster } from "../../../../Redux/Slices/Master/PI_Master/AssemblyProcessIDSlice";
import { useDispatch, useSelector } from "react-redux";

const TyreProcessIDCreation = () => {
  const [filters, setFilters] = useState({
    category: "",
    platform: "",
    tyreSize: "",
    tyreRim: "",
    tyreType: "",
    brand: "",
    sidewall: ""
  });
  const [selectedRow, setSelectedRow] = useState(null);
  const dispatch = useDispatch();
  const { ProcessIDMaster } = useSelector((state) => state.AssemblyProcessID)


  useEffect(() => {
    dispatch(getProcessIDMaster())
  }, []);

  useEffect(() => {
    const fetchProcessID = async () => {


      // Only call API if all filters selected
      if (!filters.category) {
        setTableData([]);
        setProcessID("");
        return;
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
            Sidewall: filters.sidewall.trim().toUpperCase()
          })
        );

        console.log("API DATA:", data); // 🔥 check this

        if (Array.isArray(data)) {
          setTableData(data);

          if (data.length === 1) {
            setSelectedRow(data[0]);
            setProcessID(data[0].processID);
          } else {
            setSelectedRow(null);
            setProcessID("");
          }
        } else {
          setTableData([]);
        }

      } catch (error) {
        console.log(error);
      }
    };

    fetchProcessID();
  }, [filters]);

  const [processID, setProcessID] = useState("");
  const [tableData, setTableData] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const generateProcessID = () => {
    if (!Object.values(filters).every(Boolean)) {
      alert("Required fields missing.");
      return;
    }
    const generated = `${filters.category}-${filters.platform}-${filters.tyreSize.replace(/[^0-9]/g, "")}-${filters.tyreRim}-${filters.tyreType}-${filters.brand.slice(0, 3)}-${filters.sidewall.slice(0, 3)}`.toUpperCase();
    setProcessID(generated);
    setTableData([filters]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(processID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dropdownOptions = {
    category: ProcessIDMaster?.categoryLists,
    platform: ProcessIDMaster?.configLists,
    tyreSize: ProcessIDMaster?.tyreSizeLists,
    tyreRim: ProcessIDMaster?.tyreRimLists,
    tyreType: ProcessIDMaster?.tyreTypeLists,
    brand: ProcessIDMaster?.brandLists,
    sidewall: ProcessIDMaster?.sidewallLists
  };

  const fieldIcons = {
    category: <Settings className="w-3.5 h-3.5" />,
    platform: <Layers className="w-3.5 h-3.5" />,
    tyreSize: <Maximize className="w-3.5 h-3.5" />,
    tyreRim: <Disc className="w-3.5 h-3.5" />,
    tyreType: <Type className="w-3.5 h-3.5" />,
    brand: <Tag className="w-3.5 h-3.5" />,
    sidewall: <FileText className="w-3.5 h-3.5" />
  };

  const uploadColumns = [
    { header: "Category", accessor: "category" },
    { header: "Platform", accessor: "config" },
    { header: "Tyre Size", accessor: "tyreSize" },
    { header: "Rim", accessor: "tyreRim" },
    { header: "Type", accessor: "tyreType" },
    { header: "Brand", accessor: "brand" },
    { header: "Sidewall", accessor: "sidewall" },
    { header: "Process ID", accessor: "processID" }, // 🔥 important
  ];

  return (
    <div className="p-4 bg-slate-50 min-h-screen font-sans selection:bg-blue-100">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto space-y-4"
      >
        {/* categoryuration Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">

            {Object.keys(filters).map((field, index) => (
              <motion.div
                key={field}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-1"
              >
                <label className="text-[10px] font-bold uppercase tracking-tight text-slate-400 flex items-center gap-1.5 ml-1">
                  {fieldIcons[field]} {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <select
                  name={field}
                  value={filters[field]}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none cursor-pointer hover:bg-white"
                >
                  <option value="">Select...</option>
                  {dropdownOptions[field]?.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </motion.div>
            ))}

            {/* Compact ID Box */}
            <div className="md:col-span-2 lg:col-span-1 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-tight text-[var(--primary)] flex items-center gap-1.5 ml-1">
                <PlusCircle className="w-3.5 h-3.5" /> Output ID
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={processID}
                  readOnly
                  placeholder="Waiting for category..."
                  className="w-full bg-blue-50/30 border border-blue-100 rounded-lg px-3 py-1.5 text-xs text-[var(--primary)] font-mono font-bold placeholder:text-[var(--primary)]/300 placeholder:font-sans focus:outline-none"
                />
                {processID && (
                  <button
                    onClick={copyToClipboard}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 hover:bg-blue-100 rounded transition-colors text-[var(--primary)]"
                  >
                    {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Minimal Action Bar */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-50">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={generateProcessID}
              className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Generate
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => alert("Searching...")}
              className="flex items-center gap-1.5 px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Search className="w-4 h-4" /> Search
            </motion.button>
            <button
              onClick={() => { setFilters(Object.fromEntries(Object.keys(filters).map(k => [k, ""]))); setProcessID(""); }}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase"
            >
              <RefreshCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Dense Table Section */}
        <AnimatePresence mode="wait">
          {tableData && (
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
              <div className="p-0 text-xs h-[60vh] custom-scrollbar">
                <DynamicDataTable
                  columns={uploadColumns}
                  data={tableData}
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

export default TyreProcessIDCreation;