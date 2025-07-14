import React, { useRef } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../src/components/Navbar";
import SideBar from "../components/Sidebar/SideBar";
import ScrollToTop from "../components/ScrollToTop";

const MainLayout = () => {
  const scrollRef = useRef(null);
  return (
    <div className="w-full h-screen flex bg-[var(--color-background)] dark:bg-gray-900">
      <ScrollToTop scrollContainerRef={scrollRef} />
      {/* <SideBar /> */}
      <SideBar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div ref={scrollRef} className="flex-1 layout-scroll overflow-auto rounded-2xl dark:bg-gray-800 custom-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
