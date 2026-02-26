import { IoMdNotificationsOutline } from "react-icons/io";

import { TbLogout } from "react-icons/tb";

import { HiMenuAlt3 } from "react-icons/hi";

import assets from "../assets/assets.js";

// import BreadCrumbs from "./BreadCrumbs";

import { useNavigate } from "react-router-dom";

import DarkModeToggle from "./DarkModeToggle/DarkModeToggle.jsx";

import { logout, userLogout } from "../Redux/Slices/AuthSlice.jsx";

import { useDispatch, useSelector } from "react-redux";

import { persistor } from "../Redux/Store/app.jsx";

import CustomBreadcrumbs from "./StyledBreadcrumb.jsx";

import { toggleSidebar } from "../Redux/Slices/GlobalSlice";

import { resetUploadState } from "../Redux/Slices/PriceMasterSlice.jsx";
const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const username = useSelector((state) => state.auth.username);
  
  // Get the current sidebar state
  const { open: isSidebarOpen } = useSelector((state) => state.global);

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(resetUploadState());
    await persistor.purge();
    dispatch(userLogout(navigate));
  };

  return (
    <div className="h-[62px] flex justify-between items-center px-2 sm:px-4 duration-400 dark:bg-[#001529] select-none shadow-sm">
      {/* Left Side */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        
        {/* FIX: Change this button logic */}
        <button
          onClick={() => {
           
            if (!isSidebarOpen) {
              dispatch(toggleSidebar());
            }
          }}
          className="lg:hidden p-2 text-[var(--text)] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <HiMenuAlt3 size={20} />
        </button>
        
        <div className="truncate">
          <CustomBreadcrumbs />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-3.5 ml-2">
        <DarkModeToggle />
        
        <div className="flex items-center gap-2 border-l pl-3 dark:border-gray-700">
          <img
            className="w-8 h-8 rounded-full border border-gray-300 object-cover"
            src={assets.DefaultLogo}
            alt="User Profile"
          />
          <p className="hidden md:block font-medium dark:text-white text-sm">
            {username || "User"}
          </p>
        </div>

        <div className="flex items-center gap-3 ml-2">
          <IoMdNotificationsOutline className="text-xl cursor-pointer text-gray-600 dark:text-white hover:text-primary" />
          <TbLogout
            className="text-xl cursor-pointer text-red-500"
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;