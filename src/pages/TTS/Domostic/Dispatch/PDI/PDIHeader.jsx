import { motion } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  ClipboardCheck,
  Truck,
  Barcode,
  ThumbsUp,
  FileText,
} from "lucide-react";
import SearchBar from "../../../../../components/SearchBar";
import {
  setInspectionType,
  setSearch,
} from "../../../../../Redux/Slices/PDIDispatchMaster/PDIMaster";
import { useState } from "react";

function PDIHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const diapatch = useDispatch();
  const { plant, custType } = useParams();
  const [mode, setMode] = useState("NEW");

  const { menus, roles } = useSelector((state) => state.auth);

  const { search, inspectionType } = useSelector(
    (state) => state.PDIDispatchMaster,
  );

  const hasPermission = (menus, requiredMenuNameOrUrl) => {
    if (roles?.toLowerCase() === "admin") return true;
    if (!menus || !Array.isArray(menus)) return false;

    const normalized = requiredMenuNameOrUrl.toLowerCase().trim();

    return menus.some(
      (menu) =>
        menu.MenuName?.toLowerCase().trim() === normalized ||
        menu.MenuUrl?.toLowerCase().trim() === normalized,
    );
  };
  const type = custType === "Domestic" ? "Domestic" : "International";
  const basePath = `/TTS/${type}/Dispatch/PDI/Inspection/${plant}/${custType}`;

  const dispatch = useDispatch();

  const allTabs = [
    {
      label: "Scan For Inspection",
      permissionKey: "PDI Scan For Inspection",
      path: `${basePath}/ScanForInspection`,
      icon: <Search className="w-3.5 h-3.5" />,
    },
    {
      label: "Loading Check",
      permissionKey: "PDI Loading Check",
      path: `${basePath}/LoadingCheck`,
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    {
      label: "Barcode Delete",
      permissionKey: "PDI Barcode Delete",
      path: `${basePath}/BarcodeDelete`,
      icon: <Barcode className="w-3.5 h-3.5" />,
    },
    {
      label: "Approval For Loading",
      permissionKey: "PDI Approval For Loading",
      path: `${basePath}/ApprovalForLoading`,
      icon: <ThumbsUp className="w-3.5 h-3.5" />,
    },
    {
      label: "Final Inspection Report",
      permissionKey: "PDI Final Inspection Report",
      path: `${basePath}/FinalInspectionReport`,
      icon: <FileText className="w-3.5 h-3.5" />,
    },
  ];

  const visibleTabs = allTabs.filter((tab) => hasPermission(menus, tab.path));

  return (
    <div className="px-5 pt-3 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 transition-all">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* LEFT SIDE */}
        <div>
          <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {plant} - PDI Inspection
          </h1>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Dispatch Quality Control
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-xl">
          <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex items-center relative w-full">
            {/* Sliding Background */}
            <div
              className={`absolute top-1 bottom-1 rounded-md bg-white dark:bg-slate-600 shadow-sm transition-all duration-200 ease-in-out ${
                inspectionType === "INCOMPLETE" ? "left-[40%]  w-[calc(60%-4px)]" : "left-1 w-[calc(40%-4px)]"
              }`}
            ></div>

            {/* NEW */}
            <button
              type="button"
              onClick={() => dispatch(setInspectionType("NEW"))}
              className={`relative z-10 w-[40%] text-center text-[0.75rem] sm:text-[0.8rem] font-medium py-1.5 rounded-md whitespace-nowrap ${
                inspectionType === "NEW"
                  ? "text-[var(--primary)] dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              NEW
            </button>

            {/* INCOMPLETE */}
            <button
              type="button"
              onClick={() => dispatch(setInspectionType("INCOMPLETE"))}
              className={`relative z-10 w-[60%] text-center text-[0.75rem] sm:text-[0.8rem] font-medium py-1.5 rounded-md whitespace-nowrap ${
                inspectionType === "INCOMPLETE"
                  ? "text-[var(--primary)] dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              INCOMPLETE
            </button>
          </div>

          {/* SEARCH */}
          <div className="w-full sm:w-2xl">
            <SearchBar
              placeholder="Search..."
              className="text-xs py-1 w-full"
              onChange={(e) => dispatch(setSearch(e.target.value))}
              value={search}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      {visibleTabs.length > 0 && (
        <div className="flex gap-5 mt-3">
          {visibleTabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`pb-2 text-[11px] font-bold uppercase tracking-tight relative transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {tab.icon}
                {tab.label}

                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PDIHeader;
