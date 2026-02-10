import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DialogBox from "../../../../../components/DialogBox";
import SearchBar from "../../../../../components/SearchBar";
import { setSearch } from "../../../../../Redux/Slices/PDIDispatchMaster/PDIScanForInspectionSlice";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaClipboardCheck, FaTruck, FaBarcode, FaThumbsUp, FaFileAlt, FaExchangeAlt } from "react-icons/fa"; // Import the icons you need


export default function PPCHeader({ mode, setMode, plant, sheetMode, setSheetMode }) {
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => { },
  });
  const dispatch = useDispatch()
  const [isOpen, setOpen] = useState(false);
  const reduxSearch = useSelector(state => state.scanforinspection?.search || "");
  const [localSearch, setLocalSearch] = useState(reduxSearch);
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
    }, 300); // wait 300ms after typing stops

    return () => clearTimeout(delayDebounce);
  }, [localSearch, dispatch]);

  const sheetOptionsByMode = {
    scanforinspection: ["tyres", "splitRims", "claims"],
    inspectionincomplite: ["tyres", "claims"],
    loadingcheck: ["tyres", "splitRims"],
    approvalforloading: ["tyres"],
  };
  const visibleSheetTabs = sheetOptionsByMode[mode] || [];

  useEffect(() => {
    if (!visibleSheetTabs.includes(sheetMode)) {
      setSheetMode(visibleSheetTabs[0] || "");
    }
  }, [mode]);

  const allTabs = [
  {
    id: "substitutiondetails",
    label: "Substitution Page",
    permissionKey: "PPC Substitution Details",
    icon: <FaExchangeAlt />
}
    // {
    //   id: "inspectionincomplite",
    //   label: "Inspection In Complete",
    //   permissionKey: "PDI Inspection Incomplete", // adjust to real menu name
    //   icon: <FaClipboardCheck />
    // },
    // {
    //   id: "loadingcheck",
    //   label: "Loading Check",
    //   permissionKey: "PDI Loading Check",
    //   icon: <FaTruck />
    // },
    // {
    //   id: "barcodedelete",
    //   label: "Barcode Delete",
    //   permissionKey: "PDI Barcode Delete",
    //   icon: <FaBarcode />
    // },
    // {
    //   id: "approvalforloading",
    //   label: "Approval For Loading",
    //   permissionKey: "PDI Approval For Loading",
    //   icon: <FaThumbsUp />
    // },
    // {
    //   id: "finalinspectionreport",
    //   label: "Final Inspection Report",
    //   permissionKey: "PDI Final Inspection Report",
    //   icon: <FaFileAlt />
    // },
  ];
  // Filter tabs user is allowed to see
  const visibleTabs = allTabs.filter(tab =>
    hasPermission(menus, tab.permissionKey)
  );

  return (
    <div className="px-6 border-b border-slate-100 bg-white dark:bg-slate-800 dark:border-slate-700 z-10 transition-colors duration-300">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {plant.plant} - DOMESTIC PPC SUBSTITUTION
          </h1>
          <p className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-1">
            Manage List Of Substitution Items
          </p>
        </div>

        {/* Module Switch Section */}
        {mode === "substitutiondetails" && (
          <div className="flex flex-col gap-1">
            {/* 1. TOP SECTION: Sheet Status (Toggle) */}
            <div className="flex items-center justify-between min-w-[140px]">
              <SearchBar
                placeholder="Search by Work Order No, Order Ref No or Customer Name"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>

            {mode === "substitutiondetails" && visibleSheetTabs.length > 0 && (
              <div className="bg-slate-200/80 dark:bg-slate-700 p-1 rounded-lg flex items-center relative">
                {/* Slider */}
                <div
                  className="absolute h-[calc(100%-8px)] top-1 rounded-md bg-white dark:bg-slate-600 shadow-sm transition-all duration-200 ease-in-out"
                  style={{
                    width: `${100 / visibleSheetTabs.length}%`,
                    left: `calc(${visibleSheetTabs.indexOf(sheetMode) * (100 / visibleSheetTabs.length)}% + 4px)`
                  }}
                />

                {visibleSheetTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSheetMode(tab)}
                    className={`relative z-10 flex-1 text-[0.8rem] font-medium py-1.5 rounded-md transition-colors duration-200
          ${sheetMode === tab
                        ? "text-[var(--primary)] dark:text-blue-400"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                  >
                    {tab === "tyres" && "Tyres"}
                    {tab === "splitRims" && "Split Rims"}
                    {tab === "claims" && "Claims"}
                  </button>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      {/* Navigation Tabs – only show allowed ones */}
      {visibleTabs.length > 0 && (
        <div className="flex gap-6 mt-2 border-b border-slate-100 dark:border-slate-700">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch(setMode(tab.id))}  // ← using internal id
              className={`pb-3 text-[0.7rem] font-medium relative cursor-pointer transition-colors ${mode === tab.id
                ? "text-[var(--primary)]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
            >
              <span className="flex items-center gap-2">
                {tab.icon} {/* Icon for the tab */}
                {tab.label}
              </span>
              {mode === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"
                />
              )}
            </button>
          ))}
        </div>
      )}
      <DialogBox
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText="Confirm Disable"
        cancelText="Go Back"
        onConfirm={dialogConfig.onConfirm}
      />
    </div>
  );
}
