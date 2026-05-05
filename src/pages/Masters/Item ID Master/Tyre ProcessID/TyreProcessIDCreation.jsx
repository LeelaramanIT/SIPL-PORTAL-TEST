import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { motion } from "framer-motion";
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

// ✅ Memoized InfoCell component to prevent re-renders
const InfoCell = memo(({ row }) => (
  
  <InfoTooltip
      content={
      <div className="min-w-[180px] space-y-2 text-left">
        <div className="text-[11px] font-semibold text-blue-400 border-b border-slate-600 pb-1">
          Process Info
        </div>
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
        <div className="border-t border-slate-600 my-1" />
        <div className="flex flex-wrap gap-1">
          {[
            { label: "MMN", value: row.plants.mmn },
            { label: "PDK", value: row.plants.pdk },
            { label: "SLTL", value: row.plants.sltl },
            { label: "SITL", value: row.plants.sitl },
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
));

InfoCell.displayName = "InfoCell";

// ✅ Memoized FilterSelect component
const FilterSelect = memo(({ label, name, value, options, onChange, icon }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold uppercase tracking-tight text-slate-400 flex items-center gap-1.5">
      {icon} {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 outline-none hover:bg-white transition-all"
    >
      <option value="">All...</option>
      {options?.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
));

FilterSelect.displayName = "FilterSelect";

const TyreProcessIDCreation = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [visibleRows, setVisibleRows] = useState(50); // ✅ Reduced initial load
  const { ProcessIDMaster, ProcessIDList } = useSelector(
    (state) => state.TyreProcessID
  );

  const initialFilters = useMemo(
    () => ({
      category: "",
      platform: "",
      tyreSize: "",
      tyreRim: "",
      tyreType: "",
      brand: "",
      sidewall: "",
      directional: "",
    }),
    []
  );

  const [filters, setFilters] = useState(initialFilters);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ✅ Single debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ✅ Load data only once
  useEffect(() => {
    dispatch(getProcessIDMaster());
    dispatch(getAllProcessIDDetailsList());
  }, [dispatch]);

  // ✅ Reset visible rows when filters change
  useEffect(() => {
    setVisibleRows(50);
  }, [filters, debouncedSearch]);

  // ✅ Define field icons once
  const fieldIcons = useMemo(
    () => ({
      category: <Settings className="w-3.5 h-3.5" />,
      platform: <Layers className="w-3.5 h-3.5" />,
      tyreSize: <Maximize className="w-3.5 h-3.5" />,
      tyreRim: <Disc className="w-3.5 h-3.5" />,
      tyreType: <Type className="w-3.5 h-3.5" />,
      brand: <Tag className="w-3.5 h-3.5" />,
      sidewall: <FileText className="w-3.5 h-3.5" />,
    }),
    []
  );

  // ✅ Memoized and sorted dropdown options
  const dropdownOptions = useMemo(() => {
    if (!ProcessIDMaster) return {};

    const sortList = (list) =>
      list ? [...new Set(list)].sort((a, b) => a.localeCompare(b)) : [];

    return {
      category: sortList(ProcessIDMaster.categoryLists),
      platform: sortList(ProcessIDMaster.configLists),
      tyreSize: sortList(ProcessIDMaster.tyreSizeLists),
      tyreRim: sortList(ProcessIDMaster.tyreRimLists),
      tyreType: sortList(ProcessIDMaster.tyreTypeLists),
      brand: sortList(ProcessIDMaster.brandLists),
      sidewall: sortList(ProcessIDMaster.sidewallLists),
      directional: sortList(ProcessIDMaster.directional),
    };
  }, [ProcessIDMaster]);

  // ✅ Optimized filtering logic - single pass through data
  const filteredData = useMemo(() => {
    if (!Array.isArray(ProcessIDList) || ProcessIDList.length === 0) return [];

    const lowerSearch = debouncedSearch.toLowerCase().trim();
    const hasFilters = Object.values(filters).some((v) => v);

    // If no search and no filters, return sorted original data
    if (!lowerSearch && !hasFilters) {
      return [...ProcessIDList].sort((a, b) =>
        (a.category ?? "").localeCompare(b.category ?? "")
      );
    }

    // Single-pass filter and sort
    const filtered = ProcessIDList.filter((item) => {
      // Apply filters
      if (hasFilters) {
        if (filters.category && item.category !== filters.category) return false;
        if (filters.platform && item.config !== filters.platform) return false;
        if (filters.tyreSize && item.tyreSize !== filters.tyreSize) return false;
        if (filters.tyreRim && item.rimSize !== filters.tyreRim) return false;
        if (filters.tyreType && item.tyreType !== filters.tyreType) return false;
        if (filters.brand && item.brand !== filters.brand) return false;
        if (filters.sidewall && item.sidewall !== filters.sidewall) return false;
        if (filters.directional && item.directional !== filters.directional)
          return false;
      }

      // Apply search (only on key fields)
      if (lowerSearch) {
        const searchableText = `${item.tyreSize || ""} ${item.processID || ""} ${item.brand || ""}`.toLowerCase();
        return searchableText.includes(lowerSearch);
      }

      return true;
    });

    // Sort once at the end
    return filtered.sort((a, b) =>
      (a.category ?? "").localeCompare(b.category ?? "")
    );
  }, [ProcessIDList, filters, debouncedSearch]);

  // ✅ Memoized column definitions
  const uploadColumns = useMemo(
    () => [
      { header: "Category", accessor: "category", width: "0.5fr" },
      { header: "Platform", accessor: "config", width: "0.5fr" },
      { header: "Tyre Size", accessor: "tyreSize", width: "1.2fr" },
      { header: "Rim", accessor: "tyreRim", width: "0.5fr" },
      { header: "Type", accessor: "tyreType", width: "0.5fr" },
      { header: "Brand", accessor: "brand", width: "0.9fr" },
      { header: "Sidewall", accessor: "sidewall", width: "0.9fr" },
      { header: "Process ID", accessor: "processID", width: "1fr" },
      { header: "Finished Wt", accessor: "finishedWt", width: "0.8fr" },
      {
        header: "Info",
        accessor: "info",
        width: "0.4fr",
        align: "center",
        render: (_, row) => <InfoCell row={row} />,
      },
    ],
    []
  );

  // ✅ Memoized handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleRows((prev) => Math.min(prev + 50, filteredData.length));
  }, [filteredData.length]);

  const handleDownloadExcel = useCallback(() => {
    if (!filteredData.length) {
      return toast.error("No data to download");
    }

    const excelData = filteredData.map((row) => {
      const obj = {};
      uploadColumns.forEach((col) => {
        if (col.accessor !== "info") {
          obj[col.header] = row[col.accessor] || "";
        }
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
    XLSX.writeFile(
      workbook,
      `Process_Records_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }, [filteredData, uploadColumns]);

  const handleReset = useCallback(() => {
    setFilters(initialFilters);
    setSearch("");
  }, [initialFilters]);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const filterFields = useMemo(
    () => [
      { name: "category", label: "Category" },
      { name: "platform", label: "Platform" },
      { name: "tyreSize", label: "Tyre Size" },
      { name: "tyreRim", label: "Tyre Rim" },
      { name: "tyreType", label: "Tyre Type" },
      { name: "brand", label: "Brand" },
      { name: "sidewall", label: "Sidewall" },
    ],
    []
  );

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
            {filterFields.map((field) => (
              <FilterSelect
                key={field.name}
                name={field.name}
                label={field.label}
                value={filters[field.name]}
                options={dropdownOptions[field.name]}
                onChange={handleChange}
                icon={fieldIcons[field.name]}
              />
            ))}
            <FilterSelect
              name="directional"
              label="Directional"
              value={filters.directional}
              options={dropdownOptions.directional}
              onChange={handleChange}
            />
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
              onClick={handleReset}
              className="flex items-center gap-1.5 px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCcw className="w-4 h-4" /> Reset
            </motion.button>
            <div className="ml-auto">
              <SearchBar
                placeholder="Search by Tyre Size / PID / Brand..."
                onChange={handleSearchChange}
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

export default memo(TyreProcessIDCreation);