import { IoMdNotificationsOutline } from "react-icons/io";
import { TbLogout } from "react-icons/tb";
import assets from "../assets/assets.js";
// import BreadCrumbs from "./BreadCrumbs";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle/DarkModeToggle.jsx";
import { logout, userLogout } from "../Redux/Slices/AuthSlice.jsx";
import { useDispatch, useSelector } from "react-redux";
import { persistor } from "../Redux/Store/app.jsx";
import CustomBreadcrumbs from "./StyledBreadcrumb.jsx";

const Navbar = () => {
  const navigate = useNavigate([]);
  const dispatch = useDispatch();
  const username = useSelector((state) => state.auth.username);
  const handleLogout = async ()=>{
    dispatch(logout())
    dispatch(userLogout(navigate));
    await persistor.purge();
  }
  return (
    <div className="h-[63px] flex  justify-between items-center px-4 duration-400 dark:bg-[#001529] select-none">
      {/* Left Side */}
      <CustomBreadcrumbs/>

      {/* Right Side */}
      <div className="flex items-center gap-3.5 ml-auto mr-3">
        {/* <ToggleButton/> */}
        <DarkModeToggle />
        <img
          className="w-10 h-10 rounded-full border-primary border cursor-pointer "
          src={assets.DefaultLogo}
          alt="UserLogo"
        />
        <p className="cursor-pointer text-primary dark:text-white">
          {username ? username : "User"}
        </p>
        <IoMdNotificationsOutline className="text-[1.5rem] cursor-pointer text-primary dark:text-white" />
        <TbLogout
          className="text-[1.5rem] cursor-pointer text-primary dark:text-white"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Navbar;
