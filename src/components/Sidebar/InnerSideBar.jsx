import React, { useEffect, useRef } from "react";
import { Menu, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const InnerSidebar = ({
  collapsed,
  setCollapsed,
  menuItems,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
  title = "Master Management",
}) => {
  const location = useLocation();
  const {username} = useSelector((state)=> state.auth)
  const menuWrapperRef = useRef(null);

  // AntD copies an item's `title` onto the underlying <li> as a raw HTML
  // `title` attribute, which stacks the browser's native tooltip on top of
  // AntD's own styled one. Strip it so only AntD's tooltip shows.
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
    if (isMobile) onMobileClose?.();
  };

  return (
    <aside
      className={`
      flex flex-col bg-[var(--background)] dark:bg-slate-900
      border border-[var(--border)] dark:border-slate-800
      rounded-xl md:rounded-2xl shadow-sm dark:shadow-none
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
      <div
        className={`flex items-center p-3 sm:p-4 mb-2 ${
          collapsed && !isMobile
            ? "justify-center"
            : "justify-between"
        }`}
      >
        {(!collapsed || isMobile) && (
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-300 truncate">
            {title}
          </span>
        )}

        <Button
          type="text"
          icon={
            isMobile
              ? <MenuFoldOutlined />
              : collapsed
                ? <MenuUnfoldOutlined />
                : <MenuFoldOutlined />
          }
          onClick={() =>
            isMobile ? onMobileClose?.() : setCollapsed(!collapsed)
          }
          className="hover:!bg-blue-50 dark:hover:!bg-slate-800 !flex items-center justify-center text-gray-500 dark:!text-slate-400"
        />
      </div>

      <div ref={menuWrapperRef} className="flex-1 px-2 custom-scrollbar overflow-y-auto overflow-x-hidden">
        <Menu
          mode="inline"
          inlineCollapsed={!isMobile && collapsed}
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuSelect}
          style={{ border: "none" ,}}
          className="bg-transparent"
        />
      </div>

      {/* <div className="p-4 mt-auto border-t">
        {(username || "").toUpperCase()} USER
      </div> */}
    </aside>
  );
};

export default InnerSidebar;
