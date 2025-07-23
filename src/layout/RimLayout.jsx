import React from "react";
import { Outlet } from "react-router-dom";
import RIMNavLink from "../pages/TTS/Rim/RIMNavLink";

const RimLayout = () => {

  return (
    <div className="w-full bg-[#ECECEC] dark:bg-gray-900 h-full p-2 flex flex-col justify-center shadow-2xl">
      <div className="w-full h-fit bg-white dark:bg-gray-800 shadow-2xl rounded-md">
        <div className="w-full flex flex-col">
          <RIMNavLink/>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default RimLayout;
