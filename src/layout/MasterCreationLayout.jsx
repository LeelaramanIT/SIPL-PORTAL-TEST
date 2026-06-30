import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, Button, ConfigProvider } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  PlusCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { FcAbout } from "react-icons/fc";
import { LayoutGrid } from "lucide-react";

const MasterCreationLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
  key: "/Masters/Master-creation",
  icon: <LayoutGrid style={{ fontSize: "18px" }} />,
  label: <Link to="/Masters/Master-creation">Master Hub</Link>,
},
    {
      key: "/Masters/Master-creation/legal-entity",
      icon: <UserOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/Masters/Master-creation/legal-entity">Legal Entity Master</Link>,
    },
     {
      key: "/Masters/Master-creation/reports-Master",
      icon: <UserOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/Masters/Master-creation/reports-master">Reports Master</Link>,
    },
    {
      key: "/Masters/Usermaster",
      icon: <PlusCircleOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/Masters/Usermaster">User Creation</Link>,
    },
    // Uncomment once the route is wired up:
    // {
    //   key: "/Masters/MasterManagement",
    //   icon: <AppstoreOutlined style={{ fontSize: "18px" }} />,
    //   label: <Link to="/Masters/MasterManagement">Master Management</Link>,
    // },
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
            popupBg: "#1f2937",
            darkItemColor: "#ffffff",
          },
        },
      }}
    >
      {/* h-full instead of h-[calc(100vh-62px)]: lets the parent route/page own
          the height math (e.g. below a 62px Navbar) instead of hardcoding it here. */}
      <div className="flex h-full w-full bg-[var(--card)] p-3 gap-3 overflow-hidden font-sans">
        {/* --- Sidebar --- */}
        <aside
          className={`
            relative flex flex-col bg-[var(--background)]
            border border-[var(--border)] rounded-2xl shadow-sm
            transition-all duration-300 ease-in-out overflow-hidden
            ${collapsed ? "w-[70px]" : "w-[260px]"}
          `}
        >
          {/* Header & Toggle */}
          <div
            className={`flex items-center p-4 mb-2 ${collapsed ? "justify-center" : "justify-between"}`}
          >
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
                Management
              </span>
            )}
            <Button
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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

          {/* Footer / profile placeholder */}
          <div className="p-4 border-t border-[var(--border)] mt-auto">
            <div
              className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0" />
              {!collapsed && (
                <div className="text-sm font-medium truncate">Admin User</div>
              )}
            </div>
          </div>
        </aside>

        {/* --- Main Content Area ---
            min-h-0 is required on a flex child that needs to scroll internally;
            without it, the child refuses to shrink below its content height and
            the scroll container never actually clips. This is what was fighting
            against LegalEntityMaster's own min-h-screen + sticky header. */}
        <main className="flex-1 min-h-0 min-w-0 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <Outlet />
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default MasterCreationLayout;