import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
// Swapped to Lucide for a cleaner, consistent look
import { Settings2, Disc, CircleDot, Search as SearchIcon } from "lucide-react"; 
import DialogBox from "../../../components/DialogBox";
import SearchBar from "../../../components/SearchBar";
import { setSearch } from "../../../Redux/Slices/PriceMasterSlice";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const { menus, roles } = useSelector(state => state.auth);

  const hasPermission = (menus, requiredMenuNameOrUrl) => {
    if (roles?.toLowerCase() === "admin") return true;
    if (!menus || !Array.isArray(menus)) return false;

    const normalized = requiredMenuNameOrUrl.toLowerCase().trim();

    return menus.some(menu =>
      menu.MenuName?.toLowerCase().trim() === normalized ||
      menu.MenuUrl?.toLowerCase().trim() === normalized
    );
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(setSearch(localSearch));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [localSearch, dispatch]);

  const allTabs = [
    {
      label: "Assembly Process ID",
      permissionKey: "Assembly Process ID Creation",
      URL: "/Masters/ItemIDMaster/AssemblyProcessIDCreation",
      icon: <Settings2 className="w-3.5 h-3.5" />
    },
    {
      label: "Tyre Process ID",
      permissionKey: "Tyre Process ID Creation",
      URL: "/Masters/ItemIDMaster/TyreProcessIDCreation",
      icon: <CircleDot className="w-3.5 h-3.5" />
    },
    {
      label: "RIM Process ID",
      permissionKey: "RIM Process ID Creation",
      URL: "/Masters/ItemIDMaster/RIMProcessIDCreation",
      icon: <Disc className="w-3.5 h-3.5" />
    }
  ];

  const visibleTabs = allTabs.filter(tab =>
    hasPermission(menus, tab.permissionKey)
  );

  return (
    <div className="px-5 pt-3 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 z-10 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Compact Title Section */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Settings2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Item ID Master
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
              Manufacturing Registry
            </p>
          </div>
        </div>

        {/* Dense Search Bar */}
        <div className="flex-1 max-w-xs">
          <div className="relative group">
            <SearchBar
              placeholder="Quick search..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              // Note: Ensure your SearchBar component accepts a className or 
              // is styled internally to be small (approx py-1 text-xs)
              className="text-xs py-1" 
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Dense version */}
      {visibleTabs.length > 0 && (
        <div className="flex gap-5 mt-3">
          {visibleTabs.map((tab) => {
            const isActive = location.pathname === tab.URL;

            return (  
              <button
                key={tab.URL}
                onClick={() => navigate(tab.URL)}
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

      <DialogBox
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        title=""
        message=""
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={() => {}}
      />
    </div>
  );
}

export default Header;