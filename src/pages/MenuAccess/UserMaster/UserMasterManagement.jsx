import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Briefcase,
  Layers,
  MapPin,
  ShieldCheck,
  Plus,
  AlertCircle,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import {
  getUserMasterData,
  createDepartment,
  createDesignation,
  createDivision,
  createLocation,
  createRole,
  createMenu,
  fetchAllMenus,
} from "../../../Redux/Slices/Master/UserMaster.jsx/UserCreationSlice";
import { HiOutlineBars3 } from "react-icons/hi2";

// ============================================================================
// Tab configuration — one entry per master type.
// listKey   -> key inside userMasterData where existing records live
// nameKey   -> the field name that holds the display/create value
// action    -> thunk to dispatch on submit
// payloadKey-> exact field name the API expects in the POST body
// ============================================================================
const TABS = [
  {
    key: "department",
    label: "Department",
    icon: Building2,
    listKey: "departments",
    nameKey: "departementName",
    payloadKey: "departmentName",
    action: createDepartment,
    placeholder: "e.g. Information Technology",
  },
  {
    key: "designation",
    label: "Designation",
    icon: Briefcase,
    listKey: "designations",
    nameKey: "desiginationName",
    payloadKey: "designationName",
    action: createDesignation,
    placeholder: "e.g. Senior Executive",
  },
  {
    key: "division",
    label: "Division",
    icon: Layers,
    listKey: "divisions",
    nameKey: "divisionName",
    payloadKey: "divisionName",
    action: createDivision,
    placeholder: "e.g. Solid Tyre Division",
  },
  {
    key: "location",
    label: "Location",
    icon: MapPin,
    listKey: "locations",
    nameKey: "locationName",
    payloadKey: "locationName",
    action: createLocation,
    placeholder: "e.g. PDK",
  },
  {
    key: "role",
    label: "Role",
    icon: ShieldCheck,
    listKey: "roles",
    nameKey: "rolesname",
    payloadKey: "rolesname",
    action: createRole,
    idKey: "roleId",
    placeholder: "e.g. Admin",
  },
  {
    key: "menu",
    label: "Menu",
    icon: HiOutlineBars3,
    listKey: "menus",
    nameKey: "menuName",
    payloadKey: "menuName",
    action: createMenu,
    idKey: "id",
    placeholder: "e.g. User Master",
    // Menu creation needs menuUrl + departmentID in addition to the name, so it
    // renders its own form instead of the generic single-field one.
    custom: true,
  },
];

// ============================================================================
// Toast
// ============================================================================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`fixed top-3 right-3 left-3 sm:left-auto sm:top-4 sm:right-4 z-[100] flex items-center gap-2.5 rounded-lg px-4 py-2.5 shadow-lg text-white
        ${type === "success" ? "bg-emerald-600 dark:bg-emerald-500" : "bg-rose-600 dark:bg-rose-500"}`}
    >
      {type === "success" ? (
        <CheckCircle2 size={16} />
      ) : (
        <AlertCircle size={16} />
      )}
      <span className="text-[13px] font-medium">{message}</span>
    </motion.div>
  );
};

// ============================================================================
// Main
// ============================================================================
const UserMasterManagement = () => {
  const dispatch = useDispatch();
  const { loading, userMasterData } = useSelector((state) => state.UserMaster);

  const [activeKey, setActiveKey] = useState(TABS[0].key);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Menu tab only — extra fields the generic single-value form doesn't have
  const [menuUrl, setMenuUrl] = useState("");
  const [menuUrlError, setMenuUrlError] = useState("");
  const [menuDeptId, setMenuDeptId] = useState("");
  const [allMenus, setAllMenus] = useState([]);

  const loadMenus = async () => {
    const res = await dispatch(fetchAllMenus());
    setAllMenus(res?.data || res || []);
  };

  useEffect(() => {
    dispatch(getUserMasterData());
    loadMenus();
  }, [dispatch]);

  const activeTab = useMemo(
    () => TABS.find((t) => t.key === activeKey),
    [activeKey],
  );

  const master = userMasterData?.data ?? userMasterData ?? {};
  const items = useMemo(() => {
    if (activeTab.key === "menu") {
      return allMenus?.data || allMenus || [];
    }
    return master[activeTab.listKey] ?? [];
  }, [activeTab.key, master, allMenus]);

  const departmentOptions = master.departments ?? [];

  const handleTabChange = (key) => {
    setActiveKey(key);
    setValue("");
    setError("");
    setMenuUrl("");
    setMenuUrlError("");
    setMenuDeptId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError("This field is required");
      return;
    }
    if (trimmed.length < 2) {
      setError("Min 2 characters");
      return;
    }
    // Prevent obvious duplicates client-side (case-insensitive)
    const exists = items.some(
      (item) =>
        (item[activeTab.nameKey] || "").toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      setError("Already exists");
      return;
    }

    let payload = { [activeTab.payloadKey]: trimmed };

    if (activeTab.key === "menu") {
      const trimmedUrl = menuUrl.trim();
      if (!trimmedUrl) {
        setMenuUrlError("This field is required");
        return;
      }
      if (!trimmedUrl.startsWith("/")) {
        setMenuUrlError("Must start with /");
        return;
      }
      setMenuUrlError("");
      payload = {
        menuName: trimmed,
        menuUrl: trimmedUrl,
        departmentID: Number(menuDeptId) || 0,
      };
    }

    const res = await dispatch(activeTab.action(payload));

    if (res?.status === 200 || res?.status === 201) {
      setToast({
        message: `${activeTab.label} added successfully`,
        type: "success",
      });
      setValue("");
      setError("");
      setMenuUrl("");
      setMenuUrlError("");
      setMenuDeptId("");
      dispatch(getUserMasterData()); // refresh lists/dropdowns everywhere
      if (activeTab.key === "menu") loadMenus(); // menus live in separate state, not userMasterData
    } else if (res?.status === 409) {
      setToast({ message: `${activeTab.label} already exists`, type: "error" });
    } else {
      setToast({
        message: `Failed to add ${activeTab.label.toLowerCase()}`,
        type: "error",
      });
    }
  };

  return (
    <div className="relative h-full w-full bg-slate-100/60 dark:bg-slate-950 p-2 font-sans sm:p-5">
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-lg sm:rounded-xl border border-[var(--border)] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3 border-b border-[var(--border)] dark:border-slate-800 px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 dark:bg-blue-950 !text-[var(--primary)] dark:!text-[var(--primary)]">
            <Layers size={16} className="sm:hidden" />
            <Layers size={17} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] sm:text-[16px] font-semibold text-slate-900 dark:text-slate-50 truncate">
              Master Management
            </h2>
            <p className="mt-0.5 text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400 truncate">
              Maintain departments, designations, divisions, locations and
              roles.
            </p>
          </div>
        </div>

        {/* Body: tab rail + content */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* Tab rail */}
          <div className="flex sm:block shrink-0 gap-1.5 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 p-2 sm:w-[190px]">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = t.key === activeKey;
              return (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className={`relative flex shrink-0 sm:w-full items-center gap-2 sm:gap-2.5 rounded-lg px-3 py-2 sm:py-2.5 text-left text-[12px] sm:text-[13px] font-medium whitespace-nowrap transition-colors duration-150
                    ${
                      isActive
                        ? "bg-[var(--primary)]/10 dark:bg-blue-950 text-[var(--primary)] dark:text-[var(--primary)]"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="master-tab-indicator"
                      className="hidden sm:block absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[var(--primary)] dark:bg-[var(--primary)]"
                    />
                  )}
                  <Icon size={15} />
                  {t.label}
                  <span
                    className={`sm:ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold
    ${
      isActive
        ? "bg-[var(--primary)]/20 text-[var(--primary)]"
        : "bg-slate-100 text-slate-500"
    }`}
                  >
                    {t.key === "menu"
                      ? (allMenus?.data || allMenus || []).length
                      : (master[t.listKey] ?? []).length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Create form */}
                <form
                  onSubmit={handleSubmit}
                  className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3"
                >
                  <div className="w-full sm:flex-1 sm:min-w-[160px] sm:max-w-sm">
                    <label className="mb-1.5 block text-[12px] font-medium text-slate-600 dark:text-slate-400">
                      {activeTab.key === "menu"
                        ? "Menu Name"
                        : `${activeTab.label} Name`}
                      <span className="ml-0.5 text-rose-500 dark:text-rose-400">
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder={activeTab.placeholder}
                      className={`h-9 w-full rounded-md border border-[var(--border)] dark:border-slate-800 bg-white dark:bg-slate-800 px-3 text-[13px] text-slate-800 dark:text-slate-100 outline-none transition-colors duration-150
                        placeholder:text-[var(--primary)] dark:placeholder:text-slate-500
                        ${
                          error
                            ? "border-rose-400 dark:border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                            : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15"
                        }`}
                    />
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                            <AlertCircle size={11} />
                            <span>{error}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {activeTab.key === "menu" && (
                    <>
                      <div className="w-full sm:flex-1 sm:min-w-[160px] sm:max-w-sm">
                        <label className="mb-1.5 block text-[12px] font-medium text-slate-600 dark:text-slate-400">
                          Menu URL
                          <span className="ml-0.5 text-rose-500 dark:text-rose-400">
                            *
                          </span>
                        </label>
                        <input
                          type="text"
                          value={menuUrl}
                          onChange={(e) => {
                            setMenuUrl(e.target.value);
                            if (menuUrlError) setMenuUrlError("");
                          }}
                          placeholder="e.g. /UserMaster/user-list"
                          className={`h-9 w-full rounded-md border border-[var(--border)] dark:border-slate-800 bg-white dark:bg-slate-800 px-3 text-[13px] text-slate-800 dark:text-slate-100 outline-none transition-colors duration-150
                            placeholder:text-[var(--primary)] dark:placeholder:text-slate-500
                            ${
                              menuUrlError
                                ? "border-rose-400 dark:border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                                : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15"
                            }`}
                        />
                        <AnimatePresence>
                          {menuUrlError && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                                <AlertCircle size={11} />
                                <span>{menuUrlError}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="w-full sm:w-auto sm:min-w-[160px]">
                        <label className="mb-1.5 block text-[12px] font-medium text-slate-600 dark:text-slate-400">
                          Department
                        </label>
                        <select
                          value={menuDeptId}
                          onChange={(e) => setMenuDeptId(e.target.value)}
                          className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-[13px] text-slate-800 dark:text-slate-100 outline-none transition-colors duration-150
                            hover:border-slate-400 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15"
                        >
                          <option value="">None</option>
                          {departmentOptions.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.departementName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="flex h-9 w-full sm:w-auto items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] dark:bg-[var(--primary)] px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Plus size={14} />
                    )}
                    Add {activeTab.label}
                  </motion.button>
                </form>

                {/* Existing list */}
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Existing {activeTab.label}s ({items.length})
                  </p>

                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 py-8 sm:py-10 text-center px-3">
                      <Inbox
                        size={22}
                        className="text-slate-300 dark:text-slate-600"
                      />
                      <p className="text-[13px] text-slate-400 dark:text-slate-500">
                        No {activeTab.label.toLowerCase()}s added yet
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                      <table className="w-full min-w-[280px] text-left">
                        <thead className="bg-[var(--primary)]/10 dark:bg-slate-800/60">
                          <tr>
                            <th className="w-12 sm:w-14 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                              #
                            </th>
                            <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                              {activeTab.label} Name
                            </th>
                            {activeTab.key === "menu" && (
                              <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                URL
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, i) => (
                            <motion.tr
                              key={item[activeTab.idKey || "id"] ?? i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{
                                duration: 0.15,
                                delay: Math.min(i, 10) * 0.02,
                              }}
                              className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                            >
                              <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] text-slate-400 dark:text-slate-500">
                                {i + 1}
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-[13px] font-medium text-slate-700 dark:text-slate-200">
                                {item[activeTab.nameKey]}
                              </td>
                              {activeTab.key === "menu" && (
                                <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] font-mono text-slate-500 dark:text-slate-400">
                                  {item.menuUrl}
                                </td>
                              )}
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserMasterManagement;
