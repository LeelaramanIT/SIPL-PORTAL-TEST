import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Layers,
  Maximize,
  Disc,
  Type,
  Tag,
  FileText,
  Download,
  RefreshCcw,
  Search,
} from "lucide-react";
import { DynamicDataTable } from "../../../../components/DynamicDataTable";
import {
  getProcessIDMaster,
  getAllProcessIDDetailsList,
} from "../../../../Redux/Slices/Master/PI_Master/TyreProcessIDSlice";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import SearchBar from "../../../../components/SearchBar";
import InfoTooltip from "../../../../components/InfoTooltip";
import { Select } from "antd";
const { Option } = Select;

const TyreProcessIDCreation = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [visibleRows, setVisibleRows] = useState(100);
  const { ProcessIDMaster, ProcessIDList } = useSelector(
    (state) => state.TyreProcessID,
  );
  const handleLoadMore = () => {
    setVisibleRows((prev) => Math.min(prev + 100, filteredData.length));
  };
  const initialFilters = {
    category: "",
    platform: "",
    tyreSize: "",
    tyreRim: "",
    tyreType: "",
    brand: "",
    sidewall: "",
    directional: "",
  };

  const [filters, setFilters] = useState(initialFilters);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // delay

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(getProcessIDMaster());
    dispatch(getAllProcessIDDetailsList());
  }, [dispatch]);

  useEffect(() => {
    setVisibleRows(100);
  }, [filters, search]);
  console.log(ProcessIDList);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // delay

    return () => clearTimeout(timer);
  }, [search]);
  const sortedData = useMemo(() => {
    if (!Array.isArray(ProcessIDList)) return [];

    return [...ProcessIDList].sort((a, b) =>
      (a.category ?? "").localeCompare(b.category ?? ""),
    );
  }, [ProcessIDList]);

  // 2. Logic: Filter the loaded table data based on Dropdowns + Search Bar
  const filteredData = useMemo(() => {
    if (!Array.isArray(ProcessIDList)) return [];

    const lowerSearch = debouncedSearch.toLowerCase();
    // ✅ ADD THIS HERE
    if (!lowerSearch && Object.values(filters).every((v) => !v)) {
      return sortedData;
    }

    return sortedData.filter((item) => {
      // Dropdown filtering
      if (
        (filters.category && item.category !== filters.category) ||
        (filters.platform && item.config !== filters.platform) ||
        (filters.tyreSize && item.tyreSize !== filters.tyreSize) ||
        (filters.tyreRim && item.rimSize !== filters.tyreRim) ||
        (filters.tyreType && item.tyreType !== filters.tyreType) ||
        (filters.brand && item.brand !== filters.brand) ||
        (filters.sidewall && item.sidewall !== filters.sidewall) ||
        (filters.directional && item.directional !== filters.directional)
      ) {
        return false;
      }

      // Search optimization (only key fields instead of Object.values)
      if (lowerSearch) {
        return (
          item.tyreSize?.toLowerCase().includes(lowerSearch) ||
          item.processID?.toLowerCase().includes(lowerSearch) ||
          item.brand?.toLowerCase().includes(lowerSearch)
        );
      }

      return true;
    });
  }, [ProcessIDList, filters, debouncedSearch]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDownloadExcel = useCallback(() => {
    if (!filteredData.length) {
      return toast.error("No data to download");
    }

    const excelData = filteredData.map((row) => {
      const obj = {};
      uploadColumns.forEach(
        (col) => (obj[col.header] = row[col.accessor] || ""),
      );
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Records");

    XLSX.writeFile(
      workbook,
      `Process_Records_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  }, [filteredData]);

  const sortList = (list) => list?.slice().sort((a, b) => a.localeCompare(b));

  const dropdownOptions = useMemo(() => {
    const sortList = (list) => list?.slice().sort((a, b) => a.localeCompare(b));

    return {
      category: sortList(ProcessIDMaster?.categoryLists),
      platform: sortList(ProcessIDMaster?.configLists),
      tyreSize: sortList(ProcessIDMaster?.tyreSizeLists),
      tyreRim: sortList(ProcessIDMaster?.tyreRimLists),
      tyreType: sortList(ProcessIDMaster?.tyreTypeLists),
      brand: sortList(ProcessIDMaster?.brandLists),
      sidewall: sortList(ProcessIDMaster?.sidewallLists),
      directional: sortList(ProcessIDMaster?.directional),
    };
  }, [ProcessIDMaster]);

  const fieldIcons = {
    category: <Settings className="w-3.5 h-3.5" />,
    platform: <Layers className="w-3.5 h-3.5" />,
    tyreSize: <Maximize className="w-3.5 h-3.5" />,
    tyreRim: <Disc className="w-3.5 h-3.5" />,
    tyreType: <Type className="w-3.5 h-3.5" />,
    brand: <Tag className="w-3.5 h-3.5" />,
    sidewall: <FileText className="w-3.5 h-3.5" />,
  };

  const uploadColumns = [
    { header: "Category", accessor: "category", width: "0.5fr" },
    { header: "Platform", accessor: "config", width: "0.5fr" },
    { header: "Tyre Size", accessor: "tyreSize", width: "1.2fr" },
    { header: "Rim", accessor: "tyreRim", width: "0.5fr" }, // ✅ fixed
    { header: "Type", accessor: "tyreType", width: "0.5fr" },
    { header: "Brand", accessor: "brand", width: "0.9fr" },
    { header: "Sidewall", accessor: "sidewall", width: "0.9fr" },
    { header: "Process ID", accessor: "processID", width: "1fr" }, // ✅ fixed
    { header: "Finished Wt", accessor: "finishedWt", width: "0.8fr" }, // ✅ added
    // ✅ NEW COLUMN
    {
      header: "Info",
      accessor: "info",
      width: "0.4fr",
      align: "center",
      render: (_, row) => (
  <InfoTooltip
    content={
      <div className="min-w-[180px] space-y-2 text-left">
        {/* Header */}
        <div className="text-[11px] font-semibold text-blue-400 border-b border-slate-600 pb-1">
          Process Info
        </div>

        {/* Info Grid */}
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between gap-2">
            <span className="text-slate-400">Created By</span>
            <span className="font-medium text-white">
              {row.createdBy || "-"}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-slate-400">Date</span>
            <span className="font-medium text-white">
              {row.createDate?.split("T")[0] || "-"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-600 my-1" />

        {/* Status Badges */}
        <div className="flex flex-wrap gap-1">
          {[
            { label: "MMN", value: row.mmn },
            { label: "PDK", value: row.pdk },
            { label: "SLTL", value: row.sltl },
            { label: "SITL", value: row.sitl },
          ].map((item) => (
            <span
              key={item.label}
              className={`px-2 py-[2px] rounded text-[10px] font-semibold tracking-wide ${
                item.value
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    }
  />
)
    },
  ];

  return (
    <div className="p-2 bg-slate-50 h-[calc(100vh-62px)] font-sans">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2"
      >
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8 gap-2">
            {[
              "category",
              "platform",
              "tyreSize",
              "tyreRim",
              "tyreType",
              "brand",
              "sidewall",
            ].map((field) => (
              <div key={field} className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-tight text-slate-400 flex items-center gap-1.5">
                  {fieldIcons[field]} {field.replace(/([A-Z])/g, " $1")}
                </label>
                <select
                  name={field}
                  value={filters[field]}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 outline-none hover:bg-white transition-all"
                >
                  <option value="">All...</option>
                  {dropdownOptions[field]?.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">
                Directional
              </label>
              <select
                name="directional"
                value={filters.directional}
                onChange={handleChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px]"
              >
                <option value="">All...</option>
                {dropdownOptions.directional?.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-50 items-center">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadExcel}
              className="flex items-center gap-1.5 px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" /> Download
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setFilters(initialFilters);
                setSearch("");
              }}
              className="flex items-center gap-1.5 px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCcw className="w-4 h-4" /> Reset
            </motion.button>

            <div className="ml-auto">
              <SearchBar
                placeholder="Search by Tyre Size / PID..."
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-2 bg-slate-900 flex justify-between items-center rounded-t-xl">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">
              Process Master Records ({filteredData.length})
            </h3>
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-500 text-white rounded uppercase">
              Live
            </span>
          </div>
          <div className="p-0 text-xs h-[55vh] overflow-y-auto custom-scrollbar">
            <DynamicDataTable
              columns={uploadColumns}
              data={filteredData}
              visibleRows={visibleRows}
              onLoadMore={handleLoadMore}
              loading={isLoading}
              headerClassName="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TyreProcessIDCreation;
