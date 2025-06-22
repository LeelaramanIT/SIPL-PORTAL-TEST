import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../src/components/Navbar";
import SideBar from "../components/Sidebar/SideBar";

const MainLayout = () => {
  return (
    <div className="w-full h-screen flex bg-[var(--color-background)] dark:bg-gray-900">
      {/* <SideBar /> */}
      <SideBar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="flex-1 layout-scroll overflow-auto rounded-2xl bg-[#FFFFFF] dark:bg-gray-800 custom-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
