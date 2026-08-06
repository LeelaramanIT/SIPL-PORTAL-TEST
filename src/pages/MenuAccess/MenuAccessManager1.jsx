import React, { useState, useCallback, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserShield, FaCog, FaCheckCircle, FaUsers, FaSearch, FaSave, FaBars, FaTimes, FaLayerGroup, FaPlus } from 'react-icons/fa';
import { Splitter, Spin, Empty } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAllMenus,
  fetchAllUsers,
  fetchUserMenus,
  saveUserMenus,
  createMenu,
  getUserMasterData,
} from '../../Redux/Slices/Master/UserMaster.jsx/UserCreationSlice';

// --- Display-only grouping config -----------------------------------------
// Menus from the DB are matched into these groups by URL pattern, not by
// exact name. Anything that doesn't match a pattern below falls into
// "Other", so new DB menus never silently disappear from the UI.
const MENU_GROUP_CONFIG = [
  {
    group: "Sales & Orders",
    icon: FaLayerGroup,
    match: (m) => /OrderProcess|Invoice|Proforma/i.test(m.menuUrl),
  },
  {
    group: "Warehouse & Dispatch",
    icon: FaUsers,
    match: (m) => /Warehouse|Dispatch|PDI|Substitution|RimAndTyreFitment/i.test(m.menuUrl),
  },
  {
    group: "Reports",
    icon: FaSave,
    match: (m) => /Reports/i.test(m.menuUrl),
  },
  {
    group: "Masters & Settings",
    icon: FaCog,
    match: (m) => /Masters|Settings|UserMaster/i.test(m.menuUrl),
  },
];

const groupMenus = (menus) => {
  if (!Array.isArray(menus)) return [];
  const groups = MENU_GROUP_CONFIG.map((g) => ({ ...g, menus: [] }));
  const other = { group: "Other", icon: FaBars, menus: [] };

  menus.forEach((menu) => {
    const target = groups.find((g) => g.match(menu));
    (target ? target.menus : other.menus).push(menu);
  });

  return [...groups.filter((g) => g.menus.length > 0), ...(other.menus.length ? [other] : [])];
};

// --- Small presentational helpers ------------------------------------------
const AVATAR_COLORS = [
  "from-blue-500 to-blue-600",
  "from-violet-500 to-violet-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-cyan-500 to-cyan-600",
];
const getAvatarColor = (id) => AVATAR_COLORS[(Number(id) || 0) % AVATAR_COLORS.length];

const SkeletonLine = ({ w = "70%" }) => (
  <div className="h-3.5 bg-slate-100 rounded animate-pulse" style={{ width: w }} />
);

// ============================================================================
// Memoized presentational components
//
// These are declared at module scope (not inside MenuAccessManager1) so their
// function identity — and therefore their DOM nodes and scroll position — is
// stable across parent re-renders. Each leaf item is wrapped in React.memo
// with primitive/stable props so toggling one checkbox only re-renders that
// one item instead of the whole list.
// ============================================================================

const UserRow = React.memo(function UserRow({ user, isActive, index, onSelect }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index, 10) * 0.02 }}
      onClick={() => onSelect(user.id)}
      className={`group w-full flex items-center gap-2.5 sm:gap-3 px-2 sm:px-2.5 py-2 sm:py-2.5 mb-1 rounded-lg text-left transition-colors duration-150
        ${isActive ? "bg-blue-50" : "hover:bg-slate-50"}`}
    >
      <div
        className={`relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(user.id)} flex items-center justify-center text-[11px] sm:text-[12px] font-bold text-white shadow-sm`}
      >
        {user.name?.charAt(0).toUpperCase()}
        {isActive && (
          <motion.span
            layoutId="user-active-ring"
            className="absolute -inset-0.5 rounded-full ring-2 ring-blue-500"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={`text-[12px] sm:text-[13px] truncate ${isActive ? "font-semibold text-blue-700" : "font-medium text-slate-700"}`}>
            {user.name}
          </p>
          {user.roleID === 1 && (
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
              Admin
            </span>
          )}
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{user.emailid}</p>
      </div>
    </motion.button>
  );
});

const UserListPanel = React.memo(function UserListPanel({
  filteredUsers,
  selectedUserId,
  searchTerm,
  onSearchChange,
  onSelectUser,
  loadingUsers,
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-3 sm:px-4 py-2.5 sm:py-4 border-b border-slate-100">
        <h2 className="text-[13px] sm:text-[15px] font-semibold text-slate-800 flex items-center gap-2">
          <FaUsers className="text-blue-600 w-3 h-3 sm:w-3.5 sm:h-3.5" /> Users
          <span className="ml-auto text-[10px] sm:text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full">
            {filteredUsers.length}
          </span>
        </h2>
      </div>

      <div className="p-2 sm:p-3 border-b border-slate-100">
        <div className="relative">
          <FaSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-[12px] sm:text-[13px] bg-slate-50 border border-slate-200 rounded-lg outline-none
              placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all duration-150"
          />
        </div>
      </div>

      {loadingUsers ? (
        <div className="flex-1 p-2 sm:p-3 space-y-2.5 sm:space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 sm:gap-3 px-1 py-1.5 sm:py-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <SkeletonLine w="70%" />
                <SkeletonLine w="45%" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-1.5 px-1.5 sm:px-2 custom-scrollbar">
          <AnimatePresence initial={false}>
            {filteredUsers.map((user, i) => (
              <UserRow
                key={user.id}
                user={user}
                index={i}
                isActive={user.id === selectedUserId}
                onSelect={onSelectUser}
              />
            ))}
          </AnimatePresence>
          {filteredUsers.length === 0 && (
            <p className="p-6 text-center text-[13px] text-slate-400">No users found.</p>
          )}
        </div>
      )}
    </div>
  );
});

const MenuItem = React.memo(function MenuItem({ menu, isChecked, isAdmin, onToggle }) {
  return (
    <label
      title={menu.menuUrl}
      className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg border text-[12px] sm:text-[13px] font-medium transition-all duration-150
        ${isAdmin ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
        ${isChecked
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
        }`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => onToggle(menu.id)}
        disabled={isAdmin}
        className={`w-4 h-4 rounded shrink-0 cursor-pointer disabled:cursor-not-allowed
          ${isChecked ? "accent-emerald-600" : "accent-blue-600"}`}
      />
      <span className="truncate flex-1">{menu.menuName}</span>
      {isChecked && <FaCheckCircle className="text-emerald-500 w-3.5 h-3.5 shrink-0" />}
    </label>
  );
});

const MenuGroupCard = React.memo(function MenuGroupCard({ groupData, isAdmin, userPermissionsSet, onToggle, index }) {
  const GroupIcon = groupData.icon;
  const groupSelected = isAdmin
    ? groupData.menus.length
    : groupData.menus.reduce((count, m) => count + (userPermissionsSet.has(m.id) ? 1 : 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden"
    >
      <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-b border-slate-200">
        <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600">
          <GroupIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
        <h4 className="text-[12px] sm:text-[13px] font-semibold text-slate-700 flex-1 truncate">{groupData.group}</h4>
        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 shrink-0">
          {groupSelected}/{groupData.menus.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 sm:p-3.5">
        {groupData.menus.map((menu) => (
          <MenuItem
            key={menu.id}
            menu={menu}
            isChecked={isAdmin || userPermissionsSet.has(menu.id)}
            isAdmin={isAdmin}
            onToggle={onToggle}
          />
        ))}
      </div>
    </motion.div>
  );
});

const PermissionsPanel = React.memo(function PermissionsPanel({
  selectedUser,
  totalMenus,
  userPermissionsSet,
  groupedMenus,
  loadingMenus,
  loadingPermissions,
  saving,
  onToggleSelectAll,
  onTogglePermission,
  onSavePermissions,
}) {
  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 bg-white">
        <Empty description="Select a user to manage permissions" />
      </div>
    );
  }

  const isAdmin = selectedUser.roleID === 1;
  const selectedCount = isAdmin ? totalMenus : userPermissionsSet.size;
  const isAllChecked = totalMenus > 0 && selectedCount === totalMenus;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Profile header */}
      <div className="shrink-0 px-3 sm:px-5 pt-3 sm:pt-5 pb-3 sm:pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-full bg-gradient-to-br ${getAvatarColor(selectedUser.id)} flex items-center justify-center text-[12px] sm:text-[14px] font-bold text-white shadow-sm ring-2 ring-white`}
          >
            {selectedUser.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] sm:text-[16px] font-semibold text-slate-900 truncate flex items-center gap-2">
              {selectedUser.name}
              {isAdmin && (
                <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              )}
            </h2>
            <p className="text-[11px] sm:text-[12px] text-slate-400 truncate">{selectedUser.emailid}</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-600 shrink-0">
            <FaCheckCircle className="text-emerald-500 w-3 h-3" />
            {selectedCount}/{totalMenus} menus
          </div>
        </div>

        {isAdmin && (
          <div className="mt-2.5 sm:mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-2.5 sm:px-3 py-2">
            <FaUserShield className="text-amber-500 w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 shrink-0" />
            <p className="text-[11px] sm:text-[12px] text-amber-800 leading-relaxed">
              This user is an Admin and already has full access to every menu, regardless of these checkboxes.
            </p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100">
        <h3 className="text-[12px] sm:text-[13px] font-semibold text-slate-700 flex items-center gap-2">
          <FaBars className="text-slate-400 w-3 h-3" /> Menu Access
        </h3>
        <label className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-medium text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAllChecked}
            onChange={onToggleSelectAll}
            disabled={isAdmin}
            className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
          />
          Select All
        </label>
      </div>

      {/* Groups */}
      {loadingMenus || loadingPermissions ? (
        <div className="flex-1 p-3 sm:p-5 space-y-3 sm:space-y-5">
          {[...Array(3)].map((_, gi) => (
            <div key={gi} className="rounded-xl border border-slate-200 p-3 sm:p-4 space-y-2.5 sm:space-y-3">
              <SkeletonLine w="30%" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 sm:h-11 rounded-lg bg-slate-50 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-5 space-y-3 sm:space-y-4 custom-scrollbar">
          {groupedMenus.map((groupData, gi) => (
            <MenuGroupCard
              key={groupData.group}
              groupData={groupData}
              isAdmin={isAdmin}
              userPermissionsSet={userPermissionsSet}
              onToggle={onTogglePermission}
              index={gi}
            />
          ))}
        </div>
      )}

      {/* Save button */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-5 py-2.5 sm:py-3.5 border-t border-slate-100 bg-slate-50/60">
        <p className="hidden sm:block text-[12px] text-slate-400">
          Changes apply only after saving.
        </p>
        <motion.button
          onClick={onSavePermissions}
          disabled={saving || isAdmin}
          whileTap={{ scale: 0.97 }}
          className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 sm:px-5 py-2 text-[12px] sm:text-[13px] font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-150 disabled:opacity-50"
        >
          {saving ? (
            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <FaSave className="w-3.5 h-3.5" />
          )}
          {saving ? "Saving..." : "Save Permissions"}
        </motion.button>
      </div>
    </div>
  );
});

const MenuAccessManager1 = () => {
  const dispatch = useDispatch();
  const { userMasterData } = useSelector((state) => state.UserMaster);
  const [users, setUsers] = useState([]);
  const [allMenus, setAllMenus] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]); // menuIds for selectedUser
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Add Menu form state --------------------------------------------------
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuUrl, setNewMenuUrl] = useState('');
  const [newMenuDeptId, setNewMenuDeptId] = useState('');
  const [menuNameError, setMenuNameError] = useState('');
  const [menuUrlError, setMenuUrlError] = useState('');
  const [creatingMenu, setCreatingMenu] = useState(false);

  const departmentOptions = useMemo(() => {
    const master = userMasterData?.data ?? userMasterData ?? {};
    return master.departments ?? [];
  }, [userMasterData]);

  // --- Initial load: users + master menu list -----------------------------
  const loadMenus = useCallback(async () => {
    setLoadingMenus(true);
    try {
      const data = await dispatch(fetchAllMenus());
      setAllMenus(data || []);
    } catch (err) {
      toast.error("Failed to load menus.");
    } finally {
      setLoadingMenus(false);
    }
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      try {
        const data = await dispatch(fetchAllUsers());
        setUsers(data);
        if (data.length > 0) setSelectedUserId(data[0].id);
      } catch (err) {
        toast.error("Failed to load users.");
      } finally {
        setLoadingUsers(false);
      }
    })();

    loadMenus();
    dispatch(getUserMasterData()); // for the department dropdown in "Add Menu"
  }, [dispatch, loadMenus]);

  const resetAddMenuForm = () => {
    setNewMenuName('');
    setNewMenuUrl('');
    setNewMenuDeptId('');
    setMenuNameError('');
    setMenuUrlError('');
  };

  const handleAddMenu = async (e) => {
    e.preventDefault();
    const trimmedName = newMenuName.trim();
    const trimmedUrl = newMenuUrl.trim();

    let hasError = false;
    if (!trimmedName) {
      setMenuNameError("This field is required");
      hasError = true;
    } else {
      setMenuNameError('');
    }
    if (!trimmedUrl) {
      setMenuUrlError("This field is required");
      hasError = true;
    } else if (!trimmedUrl.startsWith('/')) {
      setMenuUrlError("Must start with /");
      hasError = true;
    } else {
      setMenuUrlError('');
    }
    if (hasError) return;

    setCreatingMenu(true);
    try {
      const res = await dispatch(
        createMenu({
          menuName: trimmedName,
          menuUrl: trimmedUrl,
          departmentID: Number(newMenuDeptId) || 0,
        }),
      );

      if (res?.status === 200 || res?.status === 201) {
        toast.success("Menu created successfully");
        resetAddMenuForm();
        setShowAddMenu(false);
        loadMenus(); // refresh the permissions grid with the new menu
      } else if (res?.status === 409) {
        toast.error("Menu already exists");
      } else {
        toast.error("Failed to create menu");
      }
    } finally {
      setCreatingMenu(false);
    }
  };

  // --- Load permissions whenever the selected user changes ----------------
  useEffect(() => {
    if (!selectedUserId) return;

    setLoadingPermissions(true);
    dispatch(fetchUserMenus(selectedUserId))
      .then((data) => setUserPermissions(data.map((m) => m.menuId)))
      .catch(() => toast.error("Failed to load permissions for this user."))
      .finally(() => setLoadingPermissions(false));
  }, [selectedUserId, dispatch]);

  const selectedUser = useMemo(() => {
    if (!Array.isArray(users)) return null;
    return users.find(u => u.id === selectedUserId);
  }, [users, selectedUserId]);

  const groupedMenus = useMemo(() => groupMenus(allMenus), [allMenus]);

  // --- Permission handlers --------------------------------------------------
  const togglePermission = useCallback((menuId) => {
    setUserPermissions((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setUserPermissions((prev) =>
      prev.length === allMenus.length ? [] : allMenus.map((m) => m.id)
    );
  }, [allMenus]);

  const handleSelectUser = useCallback((userId) => {
    setSelectedUserId(userId);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const result = await dispatch(saveUserMenus(selectedUser.id, userPermissions));
      if (result.success) {
        toast.success(`Permissions saved for ${selectedUser.name}!`, { duration: 2500 });
      } else {
        toast.error(result.message || "Save failed.");
      }
    } catch (err) {
      toast.error("Failed to save permissions. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // --- Filtered user list -----------------------------------------------
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    const lower = searchTerm.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(lower) ||
      (user.emailid || "").toLowerCase().includes(lower)
    );
  }, [users, searchTerm]);

  // Set gives O(1) membership checks, and is the only piece of data that
  // actually needs to change identity when a checkbox is toggled — every
  // other prop passed down to UserListPanel/PermissionsPanel stays stable,
  // which is what lets React.memo skip re-rendering unrelated menu items.
  const userPermissionsSet = useMemo(() => new Set(userPermissions), [userPermissions]);

  // --- Main render ---------------------------------------------------------
  return (
    <div className="h-full w-full bg-slate-100/60 p-2 font-sans sm:p-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="mb-2 sm:mb-3 flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <FaCog className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[14px] sm:text-[16px] font-semibold text-slate-900 truncate">User Access Control</h1>
            <p className="text-[12px] text-slate-500 hidden sm:block">
              Manage which menus each user can access.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddMenu((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-150"
          >
            <FaPlus className="w-3 h-3" />
            <span className="hidden sm:inline">Add Menu</span>
          </motion.button>
          <button
            className="md:hidden p-2 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <FaTimes className="w-4 h-4" /> : <FaUsers className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      {/* Add Menu form */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleAddMenu}
              className="mb-2 sm:mb-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="w-full sm:flex-1 sm:min-w-[160px] sm:max-w-xs">
                <label className="mb-1.5 block text-[12px] font-medium text-slate-600">
                  Menu Name<span className="ml-0.5 text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMenuName}
                  onChange={(e) => {
                    setNewMenuName(e.target.value);
                    if (menuNameError) setMenuNameError('');
                  }}
                  placeholder="e.g. User Master"
                  className={`h-9 w-full rounded-md border bg-white px-3 text-[13px] text-slate-800 outline-none transition-colors duration-150
                    placeholder:text-slate-400
                    ${
                      menuNameError
                        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                        : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                    }`}
                />
                {menuNameError && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
                    <FaUserShield className="w-2.5 h-2.5" />
                    <span>{menuNameError}</span>
                  </div>
                )}
              </div>

              <div className="w-full sm:flex-1 sm:min-w-[160px] sm:max-w-xs">
                <label className="mb-1.5 block text-[12px] font-medium text-slate-600">
                  Menu URL<span className="ml-0.5 text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMenuUrl}
                  onChange={(e) => {
                    setNewMenuUrl(e.target.value);
                    if (menuUrlError) setMenuUrlError('');
                  }}
                  placeholder="e.g. /UserMaster/user-list"
                  className={`h-9 w-full rounded-md border bg-white px-3 text-[13px] text-slate-800 outline-none transition-colors duration-150
                    placeholder:text-slate-400
                    ${
                      menuUrlError
                        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                        : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                    }`}
                />
                {menuUrlError && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
                    <FaUserShield className="w-2.5 h-2.5" />
                    <span>{menuUrlError}</span>
                  </div>
                )}
              </div>

              <div className="w-full sm:w-auto sm:min-w-[160px]">
                <label className="mb-1.5 block text-[12px] font-medium text-slate-600">
                  Department
                </label>
                <select
                  value={newMenuDeptId}
                  onChange={(e) => setNewMenuDeptId(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-800 outline-none transition-colors duration-150
                    hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                >
                  <option value="">None</option>
                  {departmentOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.departementName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex w-full sm:w-auto items-center gap-2">
                <motion.button
                  type="submit"
                  disabled={creatingMenu}
                  whileTap={{ scale: 0.97 }}
                  className="flex h-9 flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {creatingMenu ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <FaPlus className="w-3 h-3" />
                  )}
                  Create
                </motion.button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    resetAddMenuForm();
                  }}
                  className="flex h-9 flex-1 sm:flex-none items-center justify-center rounded-md border border-slate-300 px-4 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-9.5rem)] max-h-full border border-slate-200 rounded-lg sm:rounded-xl shadow-sm bg-white overflow-hidden"
      >
        {/* Desktop */}
        <div className="hidden md:block h-full">
          <Splitter style={{ height: "100%" }} className="bg-white">
            <Splitter.Panel defaultSize="18%" min="14%" max="32%">
              <div className="h-full border-r border-slate-100">
                <UserListPanel
                  filteredUsers={filteredUsers}
                  selectedUserId={selectedUserId}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onSelectUser={handleSelectUser}
                  loadingUsers={loadingUsers}
                />
              </div>
            </Splitter.Panel>
            <Splitter.Panel>
              <div className="h-full">
                <PermissionsPanel
                  selectedUser={selectedUser}
                  totalMenus={allMenus.length}
                  userPermissionsSet={userPermissionsSet}
                  groupedMenus={groupedMenus}
                  loadingMenus={loadingMenus}
                  loadingPermissions={loadingPermissions}
                  saving={saving}
                  onToggleSelectAll={toggleSelectAll}
                  onTogglePermission={togglePermission}
                  onSavePermissions={handleSavePermissions}
                />
              </div>
            </Splitter.Panel>
          </Splitter>
        </div>

        {/* Mobile */}
        <div className="md:hidden relative h-full bg-white overflow-hidden">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div
                key="user-list"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-20 bg-white"
              >
                <UserListPanel
                  filteredUsers={filteredUsers}
                  selectedUserId={selectedUserId}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onSelectUser={handleSelectUser}
                  loadingUsers={loadingUsers}
                />
              </motion.div>
            ) : (
              <motion.div
                key="permissions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <PermissionsPanel
                  selectedUser={selectedUser}
                  totalMenus={allMenus.length}
                  userPermissionsSet={userPermissionsSet}
                  groupedMenus={groupedMenus}
                  loadingMenus={loadingMenus}
                  loadingPermissions={loadingPermissions}
                  saving={saving}
                  onToggleSelectAll={toggleSelectAll}
                  onTogglePermission={togglePermission}
                  onSavePermissions={handleSavePermissions}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default MenuAccessManager1;