import React from "react";
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
}) => {
  const location = useLocation();
  const {username} = useSelector((state)=> state.auth)

  return (
    <aside
      className={`
      relative flex flex-col bg-[var(--background)]
      border border-[var(--border)]
      rounded-2xl shadow-sm
      transition-all duration-300
      ${collapsed ? "w-[70px]" : "w-[260px]"}
    `}
    >
      <div
        className={`flex items-center p-4 mb-2 ${
          collapsed
            ? "justify-center"
            : "justify-between"
        }`}
      >
        {!collapsed && (
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Master Management
          </span>
        )}

        <Button
          type="text"
          icon={
            collapsed
              ? <MenuUnfoldOutlined />
              : <MenuFoldOutlined />
          }
          onClick={() =>
            setCollapsed(!collapsed)
          }
        />
      </div>

      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ border: "none" ,}}
      />

      {/* <div className="p-4 mt-auto border-t">
        {(username || "").toUpperCase()} USER
      </div> */}
    </aside>
  );
};

export default InnerSidebar;