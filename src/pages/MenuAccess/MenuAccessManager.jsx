import React, { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast'; // Using react-hot-toast as requested
import { FaUserShield, FaCog, FaCheckCircle, FaUsers, FaSearch, FaSave, FaBars, FaTimes, FaLayerGroup } from 'react-icons/fa';

// --- Structured Data & Configuration ---

// 1. Define Menus Grouped by Category/Department
const MENU_GROUPS = [
  {
    group: "Core Functions",
    icon: FaLayerGroup,
    menus: ["Dashboard", "Reports", "Notifications"]
  },
  {
    group: "Human Resources",
    icon: FaUsers,
    menus: ["HR", "Payroll Access"]
  },
  {
    group: "Financial Systems",
    icon: FaSave,
    menus: ["Finance", "Billing & Invoicing"]
  },
  {
    group: "Project & System",
    icon: FaCog,
    menus: ["Projects", "Settings", "System Configuration"]
  },
];

// 2. Derive the flat list of all menus from the groups
const ALL_MENUS = MENU_GROUPS.flatMap(group => group.menus);

// Initial mock user data, ensuring permissions match the new ALL_MENUS structure
const initialUserData = [
  { id: 1, name: "Alice Johnson", email: "alice@corp.com", permissions: ["Dashboard", "HR", "Reports", "Payroll Access"] },
  { id: 2, name: "Bob Smith", email: "bob@corp.com", permissions: ["Finance", "Projects", "Billing & Invoicing"] },
  { id: 3, name: "Charlie Brown", email: "charlie@corp.com", permissions: ["Dashboard", "Projects", "Settings", "System Configuration"] },
  { id: 4, name: "Diana Prince", email: "diana@corp.com", permissions: [] },
  { id: 5, name: "Ethan Hunt", email: "ethan@corp.com", permissions: ALL_MENUS }, // Full Access
];


/**
 * MenuAccessManager Component
 * Manages menu permissions for individual users, grouping menus for clarity.
 */
const MenuAccessManager = () => {
  const [users, setUsers] = useState(initialUserData);
  const [selectedUserId, setSelectedUserId] = useState(initialUserData[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Find the currently selected user object
  const selectedUser = useMemo(() => 
    users.find(u => u.id === selectedUserId)
  , [users, selectedUserId]);

  // --- Permission Handlers ---

  const togglePermission = useCallback((menu) => {
    if (!selectedUser) return;
    const currentPermissions = selectedUser.permissions;
    const hasAccess = currentPermissions.includes(menu);

    const newPermissions = hasAccess
      ? currentPermissions.filter(m => m !== menu)
      : [...currentPermissions, menu];

    setUsers(prevUsers => prevUsers.map(u => 
      u.id === selectedUserId ? { ...u, permissions: newPermissions } : u
    ));
  }, [selectedUser, selectedUserId]);

  const toggleSelectAll = useCallback(() => {
    if (!selectedUser) return;

    const currentCount = selectedUser.permissions.length;
    const grantAll = currentCount !== ALL_MENUS.length;

    const newPermissions = grantAll ? [...ALL_MENUS] : [];

    setUsers(prevUsers => prevUsers.map(u => 
      u.id === selectedUserId ? { ...u, permissions: newPermissions } : u
    ));
  }, [selectedUser, selectedUserId]);

  const handleSavePermissions = () => {
    if (!selectedUser) return;
    
    // Simulate API call delay
    setTimeout(() => {
      // Use react-hot-toast directly
      toast.success(`Permissions saved for ${selectedUser.name}!`, { duration: 2500 });
      console.log(`Saved permissions for User ID ${selectedUser.id}:`, selectedUser.permissions);
    }, 500);
  };

  // --- Filtered List ---
  const filteredUsers = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowerSearchTerm) || 
      user.email.toLowerCase().includes(lowerSearchTerm)
    );
  }, [users, searchTerm]);

  // --- UI Components ---

  const UserList = () => (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-700 p-4 border-b border-gray-200 flex items-center">
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
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            className={`p-4 cursor-pointer transition-colors duration-150 ${
              user.id === selectedUserId
                ? 'bg-blue-100 border-l-4 border-blue-600 text-blue-800 font-semibold'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => {
                setSelectedUserId(user.id);
                if(window.innerWidth < 768) setIsSidebarOpen(false);
            }}
          >
            <p className="text-sm truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <p className="p-4 text-center text-sm text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  );

  const PermissionsPanel = () => {
    const isAllChecked = selectedUser && selectedUser.permissions.length === ALL_MENUS.length;

    if (!selectedUser) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Please select a user to manage permissions.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <FaUserShield className="mr-2 text-blue-600" /> 
          Access for: <span className="text-blue-600 ml-2">{selectedUser.name}</span>
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Check the departments/menus this user should be able to access.
        </p>

        {/* Header/Select All */}
        <div className="flex items-center justify-between border-b border-t border-gray-200 py-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
             <FaBars className="mr-2 text-gray-400 w-4 h-4" /> Departments / Menus
          </h3>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllChecked}
              onChange={toggleSelectAll}
              className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span>Select All</span>
          </label>
        </div>
        
        {/* Permission List Grouped by Department/Category */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {MENU_GROUPS.map(groupData => {
            const GroupIcon = groupData.icon; // Get the associated icon component

            return (
              <div key={groupData.group} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {/* Group Heading */}
                <h4 className="text-base font-bold text-gray-700 mb-3 pb-2 border-b border-gray-200 flex items-center">
                    <GroupIcon className="mr-2 w-4 h-4 text-blue-500" />
                    {groupData.group}
                </h4>

                {/* Menus in Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {groupData.menus.map(menu => {
                    const isChecked = selectedUser.permissions.includes(menu);
                    return (
                      <label 
                        key={menu} 
                        className={`flex items-center p-3 rounded-lg border transition-all duration-150 cursor-pointer 
                          ${isChecked ? 'bg-white border-green-300 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-100'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(menu)}
                          className={`form-checkbox h-5 w-5 rounded-md focus:ring-blue-500 
                            ${isChecked ? 'text-green-600 border-green-500' : 'text-blue-600 border-gray-300'}`}
                        />
                        <span className={`ml-3 text-base font-medium ${isChecked ? 'text-green-800' : 'text-gray-700'}`}>
                          {menu}
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

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSavePermissions}
            className="flex items-center px-6 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            <FaSave className="mr-2 w-4 h-4" />
            Save Permissions
          </button>
        </div>
      </div>
    );
  };

  // --- Main Render Structure ---
  return (
    <div className="p-2 md:p-3 bg-[var(--background)] w-full font-sans">
      <header className="mb-2 flex items-center justify-between md:block">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text)] flex items-center">
          <FaCog className="w-5 h-5 mr-3 text-[var(--foreground)]" />
          User Access Control
        </h1>
        {/* Mobile Sidebar Toggle Button */}
        <button 
            className="md:hidden p-2 text-blue-600 rounded-lg hover:bg-blue-100"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
            {isSidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaUsers className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex flex-col md:flex-row h-[calc(100vh-10rem)] max-h-[800px] border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden">
        
        {/* Users List Panel (Sidebar) */}
        <div className={`
            md:w-1/3 w-full bg-white border-r border-gray-200 
            absolute md:static z-20 transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            h-full md:h-auto overflow-hidden
        `}>
          <UserList />
        </div>

        {/* Permissions Panel (Main Content) */}
        <div className={`md:flex-1 w-full bg-white transition-opacity duration-300 ease-in-out ${isSidebarOpen && 'hidden md:block'}`}>
          <PermissionsPanel />
        </div>

      </div>
      
      {/* Optional: Overlay for mobile view when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-30 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MenuAccessManager;