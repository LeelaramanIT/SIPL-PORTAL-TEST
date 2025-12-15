import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, Button } from "antd";
import { Tooltip } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { MdOutlineContactEmergency } from "react-icons/md";

const SettingsLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const menuItems = [
    {
      key: "/portal/customer-master/customer-list",
      icon: <UserOutlined />,
      label: <Link to="/portal/customer-master/customer-list">Customer List</Link>,
    },
    {
      key: "/portal/customer-master/customer-creation",
      icon: <HomeOutlined />,
      label: (
        <Link to="/portal/customer-master/customer-creation">
          Customer Creation
        </Link>
      ),
    },
    {
      key: "/Settings/Menuaccess",
      icon: <MdOutlineContactEmergency size={16} />, // <----- FIX
      label: <Link className="ml-2" to="/Settings/Menuaccess">Menu Access</Link>,
    },
  ];

  return (
    <div className="w-full h-[calc(100vh-63px)] bg-[var(--secondary)] flex flex-col">
      {/* Page Header */}
      <div className="mb-2 flex flex-col sm:flex-row sm:items-end justify-between px-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Settings
          </h1>
          <p className="text-sm text-[var(--foreground)]">
            Control and customize your application settings.
          </p>
        </div>
      </div>
      <div className="flex flex-1 gap-4 px-2 pb-1 overflow-hidden">

        {/* Sidebar */}
        <div
          className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-2"
          style={{ width: collapsed ? 80 : 260, transition: "0.3s" }}
        >
          {/* Toggle Button */}
          <div className="w-full flex justify-center mb-3">
            {collapsed ? (
              // WHEN COLLAPSED → icon only, but show tooltip on hover
              <Tooltip title="Show Menu" placement="right">
                <Button
                  type="default"
                  onClick={toggleCollapsed}
                  className="flex items-center justify-center"
                >
                  <MenuUnfoldOutlined />
                </Button>
              </Tooltip>
            ) : (
              // WHEN OPEN → show full button with label
              <Button
                type="default"
                onClick={toggleCollapsed}
                className="flex items-center gap-2"
              >
                <MenuFoldOutlined />
                <span>Hide Menu</span>
              </Button>
            )}

          </div>
          {/* Menu */}
          <div className="pl-1.5">
            <Menu
              mode="inline"
              theme="light"
              inlineCollapsed={collapsed}
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{
                height: "100%",
                border: "none",
                background: "transparent",
              }}
              className="!bg-transparent"
            />
          </div>
        </div>
        {/* Main Outlet */}
        <div className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-auto custom-scrollbar ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
