import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../src/components/Navbar";
import SideBar from "../../src/components/SideBar";


const MainLayout = () => {

  return (
    <div className="w-full h-screen flex bg-[#F7F2EF]">
      <SideBar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="w-full h-full rounded-2xl bg-[#FFFFFF]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
