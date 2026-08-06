import React, { useEffect, useRef, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, Button, Tooltip, ConfigProvider, theme as antdTheme } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  UserOutlined,
  PlusCircleOutlined,
  UserAddOutlined,
  AppstoreOutlined,
  SettingOutlined,
  //   ShieldCheckOutlined,
} from "@ant-design/icons";
import { CgMenuGridR } from "react-icons/cg";
import { useSelector } from "react-redux";

const UserMasterLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuWrapperRef = useRef(null);

  const { open: isSidebarOpen, isDark } = useSelector((s) => s.global);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isMobile && mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, mobileOpen]);

  // Close the drawer automatically when leaving mobile width
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  // AntD's Menu also copies the item-level `title` onto the underlying <li>
  // as a raw HTML `title` attribute — that's what triggered the browser's
  // own native tooltip stacking on top of AntD's styled one. We keep
  // `title` on the item (required so AntD correctly hides the label text
  // once collapsed — without it the label overflowed the collapsed rail,
  // which is the pink cropped text you saw behind the tooltip). We just
  // continuously strip the DOM attribute so only AntD's own tooltip shows.
  useEffect(() => {
    const container = menuWrapperRef.current;
    if (!container) return;

    const stripNativeTitles = () => {
      container.querySelectorAll("[title]").forEach((el) => el.removeAttribute("title"));
    };

    stripNativeTitles();
    const observer = new MutationObserver(stripNativeTitles);
    observer.observe(container, { attributes: true, attributeFilter: ["title"], subtree: true });
    return () => observer.disconnect();
  }, [collapsed, isMobile]);

  const handleMenuSelect = () => {
    if (isMobile) setMobileOpen(false);
  };

  const menuConfig = [
    { key: "/UserMaster/user-list", to: "/UserMaster/user-list", icon: UserOutlined, text: "User List" },
    { key: "/UserMaster/user-creation", to: "/UserMaster/user-creation", icon: UserAddOutlined, text: "User Creation" },
    { key: "/UserMaster/Menuaccess", to: "/UserMaster/Menuaccess", icon: AppstoreOutlined, text: "Menu Access" },
    { key: "/UserMaster/UserMasterManagement", to: "/UserMaster/UserMasterManagement", icon: SettingOutlined, text: "Master Management" },
  ];

  const menuItems = menuConfig.map(({ key, to, icon: Icon, text }) => ({
    key,
    icon: <Icon style={{ fontSize: 18 }} />,
    label: <Link to={to}>{text}</Link>,
    title: text,
  }));

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#3b82f6", // Modern Blue
          borderRadius: 8,
        },
        components: {
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: "#3b82f6",
            itemSelectedColor: "#ffffff",
            itemHoverBg: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
            itemColor: isDark ? "#e2e8f0" : "#1f2937",
            itemHoverColor: isDark ? "#ffffff" : "#111827",
            popupBg: isDark ? "#0f172a" : "#ffffff",
            darkItemColor: "#ffffff",
          },
        },
      }}
    >
      <div className="flex h-[calc(100vh-62px)] w-full bg-[var(--card)] dark:bg-slate-950 p-2 sm:p-3 gap-2 sm:gap-3 overflow-hidden font-sans relative">
        {/* --- Mobile backdrop --- */}
        {isMobile && mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 md:hidden transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* --- Modern Sidebar --- */}
        <aside
          className={`
            flex flex-col bg-[var(--background)] dark:bg-slate-900
            border border-[var(--border)] dark:border-slate-800 rounded-xl md:rounded-2xl shadow-sm dark:shadow-none
            transition-all duration-300 ease-in-out overflow-hidden
            ${
              isMobile
                ? `fixed inset-y-2 left-2 z-50 w-[240px] ${
                    mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+8px)]"
                  }`
                : `relative ${collapsed ? "w-[70px]" : "w-[260px]"}`
            }
          `}
        >
          {/* Header & Toggle */}
          <div
            className={`flex items-center p-3 sm:p-4 mb-2 ${collapsed && !isMobile ? "justify-center" : "justify-between"}`}
          >
            {(!collapsed || isMobile) && (
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-slate-300">
                Management
              </span>
            )}
            <Button
              type="text"
              onClick={() =>
                isMobile ? setMobileOpen(false) : setCollapsed(!collapsed)
              }
              icon={
                isMobile ? (
                  <MenuFoldOutlined />
                ) : collapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              className="hover:!bg-blue-50 dark:hover:!bg-slate-800 !flex items-center justify-center text-gray-500 dark:!text-slate-400"
            />
          </div>

          {/* Menu Area */}
          <div ref={menuWrapperRef} className="flex-1 px-2 custom-scrollbar overflow-y-auto overflow-x-hidden">
            <Menu
              mode="inline"
              inlineCollapsed={!isMobile && collapsed}
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuSelect}
              style={{ border: "none" }}
              className="bg-transparent"
            />
          </div>

          {/* Optional Footer/Profile placeholder */}
          <div className="p-3 sm:p-4 border-t border-[var(--border)] dark:border-slate-800 mt-auto">
            <div
              className={`flex items-center gap-3 ${collapsed && !isMobile ? "justify-center" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <div className="text-xs sm:text-sm font-medium truncate dark:text-slate-200">
                  Admin User
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* --- Main Content Area --- */}
        <main className="flex-1 min-w-0 bg-[var(--card)] dark:bg-slate-900 border border-[var(--border)] dark:border-slate-800 rounded-lg shadow-sm dark:shadow-none overflow-hidden flex flex-col">
          {/* Mobile menu bar — opens the section sidebar */}
          <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] dark:border-slate-800 flex-shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-[var(--primary)] dark:text-slate-200 transition-colors"
            >
              <MenuOutlined className="text-base" />
            </button>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-300">
              Management
            </span>
          </div>
          <div className="flex-1 overflow-y-scroll custom-scrollbar dark:bg-slate-900">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Forces the collapsed-sidebar tooltip (AntD's own, driven by
          item.title) to white bg / black text, regardless of theme tokens. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ant-menu-inline-collapsed-tooltip .ant-tooltip-inner {
          color: #000000 !important;
          background-color: #ffffff !important;
        }
        .ant-menu-inline-collapsed-tooltip .ant-tooltip-arrow::before {
          background-color: #ffffff !important;
        }
      `,
        }}
      />
    </ConfigProvider>
  );
};

export default UserMasterLayout;