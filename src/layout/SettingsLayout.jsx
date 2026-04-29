import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, Button, Tooltip } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { MdOutlineContactEmergency } from "react-icons/md";

// ─── Collapsed-mode override styles ───────────────────────────────────────────
// Injected once so Ant Design's internal popup/tooltip layers
// respect your CSS variable theme instead of their hardcoded white.
const SIDEBAR_STYLE_ID = "settings-sidebar-ant-overrides";

if (typeof document !== "undefined" && !document.getElementById(SIDEBAR_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = SIDEBAR_STYLE_ID;
  style.textContent = `
    /* ── Collapsed menu item background fix ── */
    .settings-sidebar .ant-menu-inline-collapsed {
      background: transparent !important;
    }
    .settings-sidebar .ant-menu-item {
      background: transparent !important;
      color: var(--foreground) !important;
    }
    .settings-sidebar .ant-menu-item:hover {
      background: var(--secondary) !important;
      color: var(--foreground) !important;
    }
    .settings-sidebar .ant-menu-item-selected {
      background: var(--primary, #3b82f6) !important;
      color: #fff !important;
    }
    .settings-sidebar .ant-menu-item-selected .ant-menu-item-icon,
    .settings-sidebar .ant-menu-item-selected a {
      color: #fff !important;
    }

    /* ── Collapsed popup tooltip (the floating label on hover) ── */
    .ant-menu-inline-collapsed-tooltip .ant-tooltip-inner {
      background: var(--background) !important;
      color: var(--foreground) !important;
      border: 1px solid var(--border) !important;
      border-radius: 8px !important;
      font-size: 13px;
    }
    .ant-menu-inline-collapsed-tooltip .ant-tooltip-arrow-content,
    .ant-menu-inline-collapsed-tooltip .ant-tooltip-arrow::before {
      background: var(--background) !important;
    }

    /* ── Remove left padding bleed that misaligns icons when collapsed ── */
    .settings-sidebar .ant-menu-inline-collapsed > .ant-menu-item {
      padding-inline: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    /* ── Icon color inherits foreground ── */
    .settings-sidebar .ant-menu-item-icon,
    .settings-sidebar .ant-menu-item-icon svg {
      color: var(--foreground) !important;
      font-size: 16px !important;
    }
    .settings-sidebar .ant-menu-item-selected .ant-menu-item-icon,
    .settings-sidebar .ant-menu-item-selected .ant-menu-item-icon svg {
      color: #fff !important;
    }
  `;
  document.head.appendChild(style);
}

// ─── Menu item definitions ─────────────────────────────────────────────────────
const getMenuItems = () => [
  {
    key: "/Settings/user-list",
    icon: <UserOutlined />,
    label: <Link to="/Settings/user-list">User List</Link>,
  },
  {
    key: "/Settings/user-creation",
    icon: <HomeOutlined />,
    label: <Link to="/Settings/user-creation">User Creation</Link>,
  },
  {
    key: "/Settings/Menuaccess",
    icon: <MdOutlineContactEmergency size={16} />,
    // FIX: removed ml-2 — in collapsed mode the label is hidden,
    // so the margin was bleeding into the icon-only popup tooltip text
    label: <Link to="/Settings/Menuaccess">Menu Access</Link>,
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
const SettingsLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  const menuItems = getMenuItems();

  return (
    <div className="w-full h-[calc(100vh-62px)] bg-white flex flex-col">

      {/* ── Page Header ── */}
      <div className="mb-2 flex flex-col sm:flex-row sm:items-end justify-between px-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Settings
          </h1>
          <p className="text-sm text-[var(--foreground)] opacity-60">
            Control and customize your application settings.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 border border-[var(--border)] rounded-  gap-3 px-2 pb-2 overflow-hidden">

        {/* ── Sidebar ── */}
        <div
          className="
            settings-sidebar
            bg-[var(--background)]
            border border-[var(--border)]
            rounded-xl
            flex flex-col
            overflow-hidden
            transition-all duration-300 ease-in-out
            shrink-0
          "
          style={{ width: collapsed ? 64 : 240 }}
        >
          {/* Toggle button row */}
          <div
            className={`
              flex items-center border-b border-[var(--border)] p-2
              ${collapsed ? "justify-center" : "justify-between px-3"}
            `}
          >
            {!collapsed && (
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--foreground)] opacity-40 select-none">
                Navigation
              </span>
            )}

            <Tooltip
              title={collapsed ? "Expand menu" : ""}
              placement="right"
            >
              <Button
                type="text"
                size="small"
                onClick={toggleCollapsed}
                className="
                  !flex !items-center !justify-center
                  !text-[var(--foreground)]
                  hover:!bg-[var(--secondary)]
                  !rounded-lg
                  !w-8 !h-8
                  transition-colors duration-200
                "
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              />
            </Tooltip>
          </div>

          {/* Menu — key fix: NO padding wrapper around it when collapsed */}
          <div className={`flex-1 overflow-y-auto pt-2 ${collapsed ? "px-0" : "px-2"}`}>
            <Menu
              mode="inline"
              theme="light"
              inlineCollapsed={collapsed}
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{
                border: "none",
                background: "transparent",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-x overflow-auto custom-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;