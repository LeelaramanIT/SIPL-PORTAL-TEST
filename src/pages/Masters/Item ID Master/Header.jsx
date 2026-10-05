import { motion, LayoutGroup } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Boxes, CircleDot, Combine, Disc3, Users } from "lucide-react";
import { hasAccess } from "../../../utils/menuAccess";

const allTabs = [
  {
    label: "Assembly Process ID",
    title: "Assembly Process",
    permissionKey: "Assembly Process ID Creation",
    URL: "/Masters/ItemIDMaster/AssemblyProcessIDCreation",
    icon: <Combine className="w-3.5 h-3.5" />,
  },
  {
    label: "Tyre Process ID",
    title: "Tyre Process",
    permissionKey: "Tyre Process ID Creation",
    URL: "/Masters/ItemIDMaster/TyreProcessIDCreation",
    icon: <CircleDot className="w-3.5 h-3.5" />,
  },
  {
    label: "RIM Process ID",
    title: "RIM Process",
    permissionKey: "RIM Process ID Creation",
    URL: "/Masters/ItemIDMaster/RIMProcessIDCreation",
    icon: <Disc3 className="w-3.5 h-3.5" />,
  },
  {
    label: "Customer Process ID",
    title: "Customer Process",
    permissionKey: "Customer Process ID Creation",
    URL: "/Masters/ItemIDMaster/CustomerProcessIDCreation",
    icon: <Users className="w-3.5 h-3.5" />,
  },
];

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const { Menus: menus, roles } = useSelector((state) => state.auth);
  const isAdmin = roles?.toLowerCase() === "admin";
  const permissions = (menus || []).map((m) => m.menuUrl);

  const activeTab = allTabs.find((tab) => tab.URL === location.pathname);

  const visibleTabs = allTabs.filter(
    (tab) => isAdmin || hasAccess(permissions, tab.URL),
  );

  return (
    <div className="px-5 pt-3 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 z-10">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Boxes className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Item ID Master
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
              {activeTab?.title}{" "}
              <span className="text-[var(--primary)] underline underline-offset-4 decoration-2">
                Registry
              </span>
            </p>
          </div>
        </div>

        {visibleTabs.length > 0 && (
          <LayoutGroup id="itemIdMasterTabs">
            <div className="flex items-center gap-6">
              {visibleTabs.map((tab) => {
                const isActive = location.pathname === tab.URL;
                return (
                  <button
                    key={tab.URL}
                    onClick={() => navigate(tab.URL)}
                    className={`group relative pb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-tight transition-colors duration-200 ${
                      isActive
                        ? "text-[var(--primary)] dark:text-blue-400"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    <motion.span
                      animate={{ scale: isActive ? 1.08 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="flex"
                    >
                      {tab.icon}
                    </motion.span>
                    {tab.label}

                    {!isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-slate-200 dark:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    )}

                    {isActive && (
                      <motion.span
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[var(--primary)] dark:bg-blue-400"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 36,
                          mass: 0.8,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        )}
      </div>
    </div>
  );
}

export default Header;