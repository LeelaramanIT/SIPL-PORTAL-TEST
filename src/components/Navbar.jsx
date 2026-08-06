import { IoMdNotificationsOutline } from "react-icons/io";
import { TbLogout } from "react-icons/tb";
import { HiMenuAlt3 } from "react-icons/hi";
import assets from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle/DarkModeToggle.jsx";
import { logout, userLogout } from "../Redux/Slices/AuthSlice.jsx";
import { useDispatch, useSelector } from "react-redux";
import { persistor } from "../Redux/Store/app.jsx";
import CustomBreadcrumbs from "./StyledBreadcrumb.jsx";
import { toggleSidebar } from "../Redux/Slices/GlobalSlice";
import { resetUploadState } from "../Redux/Slices/PriceMasterSlice.jsx";
import FullscreenComponent from "./FullscreenComponent/FullScreenComponent.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const username = useSelector((state) => state.auth.username);
  const { open: isSidebarOpen } = useSelector((state) => state.global);

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(resetUploadState());
    await persistor.purge();
    dispatch(userLogout(navigate));
  };

  return (
    <div className="h-[56px] sm:h-[62px] flex justify-between items-center px-2 sm:px-4 duration-400 bg-white dark:bg-[#001529] select-none shadow-sm border-b border-slate-100 dark:border-slate-800">
      {/* ── LEFT: Hamburger + Breadcrumbs ── */}
      <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0 overflow-hidden">
        {/* Hamburger — mobile/tablet only */}
        <button
          onClick={() => {
            if (!isSidebarOpen) dispatch(toggleSidebar());
          }}
          className="lg:hidden flex-shrink-0 p-1.5 text-[var(--primary)] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <HiMenuAlt3 size={20} />
        </button>
        {/* Breadcrumbs — horizontal scroll on mobile */}
        <div
  className="hidden sm:block min-w-0 flex-1"
  style={{
    overflowX: "auto",
    overflowY: "hidden",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
  }}
>
  <style>{`div::-webkit-scrollbar { display: none; }`}</style>
  <div className="min-w-max">
    <CustomBreadcrumbs />
  </div>
</div>
      </div>

      {/* ── RIGHT: Actions ── */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
        {/* Dark mode toggle */}
        <div className="flex-shrink-0">
          <FullscreenComponent />
        </div>
        <div className="flex-shrink-0">
          <DarkModeToggle />
        </div>

        {/* Divider + Avatar + Username */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-l border-slate-200 dark:border-gray-700 pl-2 sm:pl-3">
          <img
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 dark:border-gray-600 object-cover flex-shrink-0"
            src={assets.DefaultLogo}
            alt="User Profile"
          />
          {/* Username: hidden on mobile, visible md+ */}
          <p className="hidden md:block font-medium dark:text-white text-sm truncate max-w-[120px]">
            {username || "User"}
          </p>
        </div>

        {/* Notification + Logout */}
        <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-gray-700">
          <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <IoMdNotificationsOutline className="text-[18px] sm:text-xl text-gray-600 dark:text-white hover:text-primary" />
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <TbLogout className="text-[18px] sm:text-xl text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
