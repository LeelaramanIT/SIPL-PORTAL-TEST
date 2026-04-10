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
import SearchBar from "../../../components/SearchBar";
import {
  setInspectionType,
  setSearch,
} from "../../../Redux/Slices/PDIDispatchMaster/PDIMaster";
import { useState } from "react";

function SaleReportHeader() {
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

  const basePath = `/Reports/TTSReports/Sale`;

  const dispatch = useDispatch();

  const allTabs = [
    {
      label: "PowerBI Report",
      permissionKey: "PowerBIReport",
      path: `${basePath}/PowerBIReport`,
      icon: <Search className="w-3.5 h-3.5" />,
    },
    {
      label: "SaleOrder Report",
      permissionKey: "SaleRepost",
      path: `${basePath}/SaleRepost`,
      icon: <Search className="w-3.5 h-3.5" />,
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
            Sales Analytics
          </h1>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Detailed insights into your sales data
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-xl">

          {/* SEARCH */}
          <div className="w-full sm:w-2xs">
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

export default SaleReportHeader;
