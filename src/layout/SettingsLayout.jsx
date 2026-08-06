import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ConfigProvider } from "antd";
import { MenuOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import { MdOutlineContactEmergency } from "react-icons/md";
import InnerSidebar from "../components/Sidebar/InnerSideBar";

// ─── Menu item definitions ─────────────────────────────────────────────────────
const getMenuItems = () => [
  {
    key: "/Settings/profile",
    icon: <UserOutlined />,
    label: <Link to="/Settings/profile">Profile</Link>,
  },
  // {
  //   key: "/Settings/user-list",
  //   icon: <UserOutlined />,
  //   label: <Link to="/Settings/user-list">User List</Link>,
  // },
  // {
  //   key: "/Settings/user-creation",
  //   icon: <HomeOutlined />,
  //   label: <Link to="/Settings/user-creation">User Creation</Link>,
  // },
  // {
  //   key: "/Settings/Menuaccess",
  //   icon: <MdOutlineContactEmergency size={16} />,
  //   label: <Link to="/Settings/Menuaccess">Menu Access</Link>,
  // },
];

// ─── Component ─────────────────────────────────────────────────────────────────
const SettingsLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const menuItems = getMenuItems();

  return (
    <ConfigProvider>
      <div className="w-full h-[calc(100vh-62px)] bg-white dark:bg-slate-950 flex flex-col">
        {/* ── Body ── */}
        <div className="relative flex flex-1 min-h-0 border border-[var(--border)] dark:border-slate-800 rounded-lg gap-2 sm:gap-3 px-2 pt-2 pb-2 overflow-hidden">
          {/* --- Mobile backdrop --- */}
          {isMobile && mobileOpen && (
            <div
              className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 md:hidden transition-opacity duration-300"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <InnerSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            menuItems={menuItems}
            isMobile={isMobile}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
            title="Settings"
          />

          {/* ── Main content ── */}
          <div className="flex-1 min-h-0 min-w-0 bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden flex flex-col">
            {/* Mobile menu bar — opens the section sidebar */}
            <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] dark:border-slate-800 flex-shrink-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-[var(--primary)] dark:text-slate-200 transition-colors"
              >
                <MenuOutlined className="text-base" />
              </button>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-300">
                Settings Navigation
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default SettingsLayout;
