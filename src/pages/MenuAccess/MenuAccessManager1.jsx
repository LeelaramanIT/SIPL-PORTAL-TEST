import React, { useState, useCallback, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaUserShield, FaCog, FaCheckCircle, FaUsers, FaSearch, FaSave, FaBars, FaTimes, FaLayerGroup } from 'react-icons/fa';
import { Splitter, Spin, Empty } from "antd";
import {
  fetchAllMenus,
  fetchAllUsers,
  fetchUserMenus,
  saveUserMenus,
} from '../../pages/MenuAccess/Menuaccessapi'; // adjust path to wherever you place menuAccessApi.js

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

const MenuAccessManager1 = () => {
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

  // --- Initial load: users + master menu list -----------------------------
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data);
        if (data.length > 0) setSelectedUserId(data[0].id);
      } catch (err) {
        toast.error("Failed to load users.");
      } finally {
        setLoadingUsers(false);
      }
    })();

    (async () => {
      try {
        const data = await fetchAllMenus();
        setAllMenus(data || null);
      } catch (err) {
        toast.error("Failed to load menus.");
      } finally {
        setLoadingMenus(false);
      }
    })();
  }, []);

  // --- Load permissions whenever the selected user changes ----------------
  useEffect(() => {
    if (!selectedUserId) return;

    setLoadingPermissions(true);
    fetchUserMenus(selectedUserId)
      .then((data) => setUserPermissions(data.map((m) => m.menuId)))
      .catch(() => toast.error("Failed to load permissions for this user."))
      .finally(() => setLoadingPermissions(false));
  }, [selectedUserId]);

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

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const result = await saveUserMenus(selectedUser.id, userPermissions);
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

  // --- UI components -----------------------------------------------------

  const UserList = () => (
    <div className="flex flex-col h-full">
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-700 p-4 border-b flex items-center">
        <FaUsers className="mr-2 text-[var(--accent)]" /> Users
      </h2>
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {loadingUsers ? (
        <div className="flex-1 flex items-center justify-center">
          <Spin />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`p-4 cursor-pointer transition-colors duration-150 ${
                user.id === selectedUserId
                  ? 'bg-blue-100 border-l-4 border-blue-600 text-blue-800 font-semibold'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                setSelectedUserId(user.id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm md:text-base truncate">{user.name}</p>
                {user.roleID === 1 && (
                  <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-gray-500 truncate">{user.emailid}</p>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <p className="p-4 text-center text-sm text-gray-500">No users found.</p>
          )}
        </div>
      )}
    </div>
  );

  const PermissionsPanel = () => {
    const isAllChecked = allMenus.length > 0 && userPermissions.length === allMenus.length;
    const isAdmin = selectedUser?.roleID === 1;

    if (!selectedUser) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <Empty description="Please select a user to manage permissions." />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full p-4">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <FaUserShield className="mr-2 text-blue-600" />
          Access for: <span className="text-blue-600 ml-2">{selectedUser.name}</span>
        </h2>
        <p className="text-xs md:text-sm text-gray-500 mb-6">
          {isAdmin
            ? "This user is an Admin (RoleID 1) and already has full access to every menu regardless of these checkboxes."
            : "Check the menus this user should be able to access."}
        </p>

        {/* Header / Select All */}
        <div className="flex items-center justify-between border-b border-t border-gray-200 py-3 mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-700 flex items-center">
            <FaBars className="mr-2 text-gray-400 w-4 h-4" /> Menus
          </h3>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllChecked}
              onChange={toggleSelectAll}
              disabled={isAdmin}
              className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-xs md:text-sm">Select All</span>
          </label>
        </div>

        {/* Permission list grouped for display */}
        {loadingMenus || loadingPermissions ? (
          <div className="flex-1 flex items-center justify-center">
            <Spin tip="Loading permissions..." />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
            {groupedMenus.map((groupData) => {
              const GroupIcon = groupData.icon;
              return (
                <div key={groupData.group} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm md:text-base lg:text-lg font-bold text-gray-700 mb-3 pb-2 border-b flex items-center">
                    <GroupIcon className="mr-2 w-4 h-4 text-blue-500" />
                    {groupData.group}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {groupData.menus.map((menu) => {
                      const isChecked = isAdmin || userPermissions.includes(menu.id);
                      return (
                        <label
                          key={menu.id}
                          className={`flex items-center p-3 rounded-lg border transition-all duration-150 ${
                            isAdmin ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                          } ${
                            isChecked
                              ? 'bg-white border-green-300 shadow-sm'
                              : 'bg-white border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(menu.id)}
                            disabled={isAdmin}
                            className={`form-checkbox h-5 w-5 rounded-md focus:ring-blue-500
                              ${isChecked ? 'text-green-600 border-green-500' : 'text-blue-600 border-gray-300'}`}
                          />
                          <span
                            className={`ml-3 text-sm md:text-base font-medium ${
                              isChecked ? 'text-green-800' : 'text-gray-700'
                            }`}
                            title={menu.menuUrl}
                          >
                            {menu.menuName}
                          </span>
                          {isChecked && <FaCheckCircle className="ml-auto text-green-500 w-4 h-4" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSavePermissions}
            disabled={saving || isAdmin}
            className="flex items-center px-6 py-2 text-sm md:text-base text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            <FaSave className="mr-2 w-4 h-4" />
            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>
    );
  };

  // --- Main render ---------------------------------------------------------
  return (
    <div className="p-2 md:p-3 bg-[var(--background)] w-full font-sans">
      <header className="mb-2 flex items-center justify-between md:block">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-[var(--text)] flex items-center">
          <FaCog className="w-5 h-5 mr-3 text-[var(--foreground)]" />
          User Access Control
        </h1>
        <button
          className="md:hidden p-2 text-blue-600 rounded-lg hover:bg-blue-100"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaUsers className="w-5 h-5" />}
        </button>
      </header>

      <div className="h-[calc(100vh-12.3rem)] max-h-full border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block h-full">
          <Splitter style={{ height: "100%" }} className="bg-white">
            <Splitter.Panel defaultSize="15%" min="10%" max="30%">
              <div className="h-full border-r border-gray-200">
                <UserList />
              </div>
            </Splitter.Panel>
            <Splitter.Panel>
              <div className="h-full">
                <PermissionsPanel />
              </div>
            </Splitter.Panel>
          </Splitter>
        </div>

        {/* Mobile */}
        <div className="md:hidden relative h-full bg-white overflow-hidden">
          {isSidebarOpen ? (
            <div className="absolute inset-0 z-20 bg-white">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-3 bg-blue-100 text-blue-600 w-full"
              >
                <FaTimes />
              </button>
              <UserList />
            </div>
          ) : (
            <PermissionsPanel />
          )}
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MenuAccessManager1;