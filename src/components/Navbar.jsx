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
  const navigate = useNavigate([]);
  const dispatch = useDispatch();
  const username = useSelector((state) => state.auth.username);
  const handleLogout = async ()=>{
    dispatch(logout())
    dispatch(resetUploadState())
    dispatch(userLogout(navigate))
    await persistor.purge()
  }
  return (
    <div className="h-[62px] flex justify-between items-center px-2 sm:px-4 duration-400 dark:bg-[#001529] select-none">
      {/* Left Side */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="lg:hidden p-2 text-[var(--text)] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <HiMenuAlt3 size={20} />
        </button>
        <CustomBreadcrumbs/>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1 sm:gap-3.5 ml-2 sm:ml-auto mr-1 sm:mr-3">
        <DarkModeToggle className=""/>
        <img
          className="w-8 h-8 sm:w-8 sm:h-8 rounded-full border-[var(--border)] border cursor-pointer"
          src={assets.DefaultLogo}
          alt="UserLogo"
        />
        <p className="hidden sm:block cursor-pointer text-[var(--primary)] hover:text-[var(--primary-hover)] dark:text-white text-sm sm:text-sm">
          {username ? username : "User"}
        </p>
        <IoMdNotificationsOutline className="text-[1rem] sm:text-[1.2rem] cursor-pointer text-primary dark:text-white" />
        <TbLogout
          className="text-[1rem] sm:text-[1.2rem] cursor-pointer text-primary dark:text-white"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Navbar;
