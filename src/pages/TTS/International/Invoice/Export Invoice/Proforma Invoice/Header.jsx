import { motion } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, ClipboardCheck, Truck, Barcode, ThumbsUp, FileText } from "lucide-react";
import SearchBar from "../../../../../../components/SearchBar";


function PIHeader({searchQuery,setSearchQuery}) {
  const navigate = useNavigate();
  const location = useLocation();
  const diapatch = useDispatch();
  const { plant, custType } = useParams();

  const { Menus, roles } = useSelector(state => state.auth);


  const hasPermission = (menus, requiredMenuNameOrUrl) => {
    if (roles?.toLowerCase() === "admin") return true;
    if (!menus || !Array.isArray(menus)) return false;

    const normalized = requiredMenuNameOrUrl.toLowerCase().trim();

    return menus.some(menu =>
      menu.menuName?.toLowerCase().trim() === normalized ||
      menu.menuUrl?.toLowerCase().trim() === normalized
    );
  };
  // const type = custType === "Domestic" ? "Domestic" : "International";
  const basePath = `/TTS/International/ProformaInvoice/List`;

  const allTabs = [
    {
      label: "Draft Proforma Invoice",
      permissionKey: "Draft Proforma Invoice",
      path: `${basePath}/Draft`,
      icon: <Search className="w-3.5 h-3.5" />,
      type:'Draft'
    },
    {
      label: "Proforma Invoice",
      permissionKey: "Proforma Invoice",
      path: `${basePath}/PI`,
      icon: <ClipboardCheck className="w-3.5 h-3.5" />,
      type:'PI'
    },
    ];

  const visibleTabs = allTabs.filter(tab =>
    hasPermission(Menus, tab.path)
  );

  return (
    <div className="px-5 pt-3 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 transition-all">

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            PROFORMA INVOICE
          </h1>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Create And Manage Proforma Invoice
          </p>
        </div>

        <div className="max-w-xs">
          <SearchBar
            placeholder="Search..."
            className="text-xs py-1"
            onChange={e => {
              diapatch(setSearchQuery(e.target.value));
            }}
            value={searchQuery}
          />
        </div>
      </div>

      {/* Tabs */}
      {visibleTabs.length > 0 && (
        <div className="flex gap-5 mt-3">
          {visibleTabs.map(tab => {
            const isActive = location.pathname === tab.path;

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path, {
                  state: tab.path
                })}
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

export default PIHeader;