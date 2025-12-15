import React, { useRef } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../src/components/Navbar";
import SideBar from "../components/Sidebar/SideBar";
import ScrollToTop from "../components/ScrollToTop";
import SupportChat from "../components/ChatBox/ChatBoxSupport";
import { useSelector } from "react-redux";
import { useAxiosInterceptors } from "../utils/axios";

const MainLayout = () => {
  const { isChatOpen } = useSelector((state) => state.global);
  const scrollRef = useRef(null);
  useAxiosInterceptors();
  return (
    <div className="w-full h-screen flex flex-col lg:flex-row bg-[var(--color-background)] dark:bg-gray-900">
    {isChatOpen && <SupportChat />}
      
      {/* <SideBar /> */}
      <SideBar />

      <div className="flex-1 flex flex-col ">
        <Navbar />

        <div ref={scrollRef} className="flex-1 h-[calc(100vh-63px)] layout-scroll overflow-auto rounded-none lg:rounded-2xl dark:bg-gray-800 custom-scrollbar">
          <Outlet />
        </div>
      </div>
      <ScrollToTop scrollContainerRef={scrollRef} />
    </div>
  );
};

export default MainLayout;
