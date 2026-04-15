import React from "react";
import { Outlet } from "react-router-dom";
import assets from "../assets/assets";


const TaskLayout = () => {
  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#eef2f7] to-[#e2e8f0] dark:from-[#0f172a] dark:via-[#111827] dark:to-[#020617]"
    >
      <div className="flex-1 min-h-0 overflow-y-auto "
      style={{backgroundImage: `url(${assets.Geminisvg})`, backgroundSize: 'cover'}}
        >
        <Outlet />
      </div>
    </div>
  );
};

export default TaskLayout;
