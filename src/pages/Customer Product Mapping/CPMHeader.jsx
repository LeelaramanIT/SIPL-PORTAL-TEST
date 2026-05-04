import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Truck,
  Barcode,
  ThumbsUp,
  FileText,
  ChevronDown,
} from "lucide-react";
import SearchBar from "../../components/SearchBar";
// import {
//   setInspectionType,
//   setSearch,
// } from "../../Redux/Slices/Customer_Item_Management/CIMMasterSlice";
import { useState, useRef, useEffect } from "react";
import { setSearch } from "../../Redux/Slices/Customer_Item_Management/CIMMasterSlice";
import { IoMdBarcode } from "react-icons/io";

function CPMHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { plant, custType } = useParams();
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { menus, roles } = useSelector((state) => state.auth);
  const { search, inspectionType } = useSelector(
    (state) => state.CIMMaster
  );

  const hasPermission = (menus, requiredMenuNameOrUrl) => {
    if (roles?.toLowerCase() === "admin") return true;
    if (!menus || !Array.isArray(menus)) return false;
    const normalized = requiredMenuNameOrUrl.toLowerCase().trim();
    return menus.some(
      (menu) =>
        menu.MenuName?.toLowerCase().trim() === normalized ||
        menu.MenuUrl?.toLowerCase().trim() === normalized
    );
  };

  const type = custType === "Domestic" ? "Domestic" : "International";
  const basePath = `/customer-item-management`;

  const allTabs = [
    {
      label: "Barcode Printing",
      permissionKey: "barcode-print",
      path: `${basePath}/barcode-print`,
      icon: <IoMdBarcode className="w-3.5 h-3.5 flex-shrink-0" />,
    }
  ];

  const visibleTabs = allTabs.filter((tab) => hasPermission(menus, tab.path));
  const activeTab = visibleTabs.find((tab) => location.pathname === tab.path);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMobileTabsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Shared Toggle ── */
  // const Toggle = () => (
  //   <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex items-center relative flex-shrink-0 w-44 sm:w-52">
  //     {/* <div
  //       className={`absolute top-1 bottom-1 rounded-md bg-white dark:bg-slate-600 shadow-sm transition-all duration-200 ease-in-out ${
  //         inspectionType === "INCOMPLETE"
  //           ? "left-[40%] w-[calc(60%-4px)]"
  //           : "left-1 w-[calc(40%-4px)]"
  //       }`}
  //     /> */}
  //     <button
  //       type="button"
  //       onClick={() => dispatch(setInspectionType("NEW"))}
  //       className={`relative z-10 w-[40%] text-center text-[0.65rem] sm:text-[0.75rem] font-semibold py-1.5 rounded-md whitespace-nowrap transition-colors ${
  //         inspectionType === "NEW"
  //           ? "text-[var(--primary)] dark:text-blue-400"
  //           : "text-slate-500 dark:text-slate-400"
  //       }`}
  //     >
  //       NEW
  //     </button>
  //     <button
  //       type="button"
  //       onClick={() => dispatch(setInspectionType("INCOMPLETE"))}
  //       className={`relative z-10 w-[60%] text-center text-[0.65rem] sm:text-[0.75rem] font-semibold py-1.5 rounded-md whitespace-nowrap transition-colors ${
  //         inspectionType === "INCOMPLETE"
  //           ? "text-[var(--primary)] dark:text-blue-400"
  //           : "text-slate-500 dark:text-slate-400"
  //       }`}
  //     >
  //       INCOMPLETE
  //     </button>
  //   </div>
  // );

  return (
    <div className="border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 transition-all bg">
      <div className="px-3 sm:px-5 pt-3 flex flex-col gap-2.5">

        {/* ── DESKTOP ROW (md+): Title — Toggle — SearchBar all in one line ── */}
        <div className="hidden md:flex items-center justify-between gap-3">
          {/* Title */}
          <div className="min-w-0 flex-shrink-0">
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            Customer Item Management
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
              Manage customer items, barcodes, and bulk uploads
            </p>
          </div>

          {/* Toggle + Search grouped right */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* <Toggle /> */}
            {/* <div className="w-64 xl:w-80">
              <SearchBar
                placeholder="Search..."
                className="text-xs py-1.5 w-full"
                onChange={(e) => dispatch(setSearch(e.target.value))}
                value={search}
              />
            </div> */}
          </div>
        </div>

        {/* ── MOBILE ROWS (< md) ── */}
        <div className="flex md:hidden items-start justify-between gap-2">
          {/* Title */}
          <div className="min-w-0">
            <h1 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {plant} — PDI Inspection
            </h1>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
              Dispatch Quality Control
            </p>
          </div>
          {/* Toggle only on mobile row 1 */}
          {/* <Toggle /> */}
        </div>

        {/* Mobile Row 2: SearchBar full width */}
        <div className="md:hidden">
          <SearchBar
            placeholder="Search..."
            className="text-xs py-1.5 w-full"
            onChange={(e) => dispatch(setSearch(e.target.value))}
            value={search}
          />
        </div>
      </div>

      {/* ── TABS ── */}
      {visibleTabs.length > 0 && (
        <>
          {/* Mobile: Dropdown */}
          <div className="md:hidden px-3 pt-2 pb-3" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMobileTabsOpen((prev) => !prev)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight min-w-0">
                {activeTab ? (
                  <>
                    <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">
                      {activeTab.icon}
                    </span>
                    <span className="truncate text-blue-600 dark:text-blue-400">
                      {activeTab.label}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400">Select Tab</span>
                )}
              </span>
              <motion.span
                animate={{ rotate: mobileTabsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </motion.span>
            </button>

            <AnimatePresence>
              {mobileTabsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden z-50 relative"
                >
                  {visibleTabs.map((tab, i) => {
                    const isActive = location.pathname === tab.path;
                    return (
                      <button
                        key={tab.path}
                        type="button"
                        onClick={() => {
                          navigate(tab.path);
                          setMobileTabsOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-tight transition-colors ${
                          i !== 0 ? "border-t border-slate-100 dark:border-slate-700" : ""
                        } ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop: Horizontal scrollable tabs */}
          <div className="hidden md:flex gap-5 px-5 mt-3 overflow-x-auto scrollbar-hide">
            {visibleTabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`pb-2 text-[11px] font-bold uppercase tracking-tight relative transition-all flex items-center gap-1.5 flex-shrink-0 ${
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
        </>
      )}
    </div>
  );
}

export default CPMHeader;