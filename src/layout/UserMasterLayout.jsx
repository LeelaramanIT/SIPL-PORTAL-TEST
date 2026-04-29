import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, Button, Tooltip, ConfigProvider } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  PlusCircleOutlined,
//   ShieldCheckOutlined,
} from "@ant-design/icons";

const UserMasterLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: "/UserMaster/user-list",
      icon: <UserOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/UserMaster/user-list">User List</Link>,
    },
    {
      key: "/UserMaster/user-creation",
      icon: <PlusCircleOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/UserMaster/user-creation">User Creation</Link>,
    },
    {
      key: "/UserMaster/Menuaccess",
    //   icon: <ShieldCheckOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/UserMaster/Menuaccess">Menu Access</Link>,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#3b82f6", // Modern Blue
          borderRadius: 8,
        },
        components: {
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: "#3b82f6",
            itemSelectedColor: "#ffffff",
            itemHoverBg: "rgba(0, 0, 0, 0.04)",
            itemColor: "var(--foreground)",
          },
        },
      }}
    >
    <div className="flex h-[calc(100vh-62px)] w-full bg-[var(--card)] p-3 gap-3 overflow-hidden font-sans">
        
        {/* --- Modern Sidebar --- */}
        <aside
          className={`
            relative flex flex-col bg-[var(--background)] 
            border border-[var(--border)] rounded-2xl shadow-sm
            transition-all duration-300 ease-in-out overflow-hidden
            ${collapsed ? "w-[70px]" : "w-[260px]"}
          `}
        >
          {/* Header & Toggle */}
          <div className={`flex items-center p-4 mb-2 ${collapsed ? "justify-center" : "justify-between"}`}>
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
                Management
              </span>
            )}
            <Button
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              className="hover:!bg-blue-50 !flex items-center justify-center text-gray-500"
            />
          </div>

          {/* Menu Area */}
          <div className="flex-1 px-2 custom-scrollbar overflow-y-auto overflow-x-hidden">
            <Menu
              mode="inline"
              inlineCollapsed={collapsed}
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{ border: "none" }}
              className="bg-transparent"
            />
          </div>

          {/* Optional Footer/Profile placeholder */}
          <div className="p-4 border-t border-[var(--border)] mt-auto">
             <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0" />
                {!collapsed && <div className="text-sm font-medium truncate">Admin User</div>}
             </div>
          </div>
        </aside>

        {/* --- Main Content Area --- */}
        <main className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-scroll custom-scrollbar">
            <Outlet />
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default UserMasterLayout;