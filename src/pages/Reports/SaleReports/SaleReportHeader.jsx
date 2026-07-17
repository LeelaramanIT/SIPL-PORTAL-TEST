import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  ClipboardCheck,
  Truck,
  Barcode,
  ThumbsUp,
  FileText,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import SearchBar from "../../../components/SearchBar";
import {
  setInspectionType,
  setSearch,
} from "../../../Redux/Slices/PDIDispatchMaster/PDIMaster";
import { useState } from "react";

function SaleReportHeader({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const diapatch = useDispatch();
  const { plant, custType } = useParams();
  
  // State to manage open/close details
  const [isOpen, setIsOpen] = useState(true);

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
      path: `${basePath}/PowerBIReport`,
      icon: <Search className="w-3.5 h-3.5" />,
    },
    {
      label: "Sale Order Report",
      path: `${basePath}/SaleRepost`,
      icon: <Search className="w-3.5 h-3.5" />,
    },
    {
      label: "Production Report",
      path: `${basePath}/ProductionRepost`,
      icon: <Search className="w-3.5 h-3.5" />,
    },
    {
      label: "Domestics Report",
      path: `${basePath}/DomesticsReport`,
      icon: <Search className="w-3.5 h-3.5" />,
    },
    {
      label: "Master Report Generate",
      path: `${basePath}/MasterReportGeneration`,
      icon: <Search className="w-3.5 h-3.5" />,
    },
  ];

  const visibleTabs = allTabs.filter((tab) => hasPermission(menus, tab.path));
  console.log(mode);

  const pageConfig = {
    "/Reports/TTSReports/Sale/PowerBIReport": {
      title: "Power BI Analytics",
      subtitle: "Interactive business intelligence and analytics",
      mode: "PowerBI",
    },
    "/Reports/TTSReports/Sale/SaleRepost": {
      title: "Sales Dashboard",
      subtitle: "Monitor and analyze sales performance",
      mode: "SaleOrder",
    },
    "/Reports/TTSReports/Sale/ProductionRepost": {
      title: "Production Dashboard",
      subtitle: "Track production metrics and operational status",
      mode: "SaleOrder",
    },
    "/Reports/TTSReports/Sale/MasterReportGeneration": {
      title: "Master Report Generation",
      subtitle: "Generate and manage consolidated reports",
      mode: "SaleOrder",
    },
  };

  const currentPage =
    pageConfig[location.pathname] || {
      title: "Sales Reports",
      subtitle: "Report Management",
      mode: "SaleOrder",
    };

  return (
    <div className="px-5 pt-3 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 transition-all">
      
      {/* HEADER CONTROLLER (Open/Close Toggle Row) */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between cursor-pointer pb-2 hover:opacity-80 transition-opacity"
      >
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 select-none">
          Report Filter Options
        </span>
        <button 
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 focus:outline-none"
        >
          {isOpen ? (
            <>
              <span>Collapse Pane</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>Expand Pane</span>
              <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      {/* COLLAPSIBLE AREA */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Title / Info Sections */}
            {mode === 'PowerBI' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
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
            )}

            {mode === 'SaleOrder' && (
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Activity size={16} style={{ color: "#fff" }} />
                    </div>
                    <h1
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "var(--tp)",
                        margin: 0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {currentPage.title}
                    </h1>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--ts)", margin: 0 }}>
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "#10b98118", border: "1px solid #10b98130" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}>Live Data</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Layout (Always visible outside the collapsible pane for quick navigation) */}
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