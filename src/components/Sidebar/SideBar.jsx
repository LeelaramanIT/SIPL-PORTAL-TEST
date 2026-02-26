import React, { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import {
  IoHome,
  IoSettingsOutline,
  IoPieChartSharp,
} from "react-icons/io5";
import {
  GoSidebarCollapse,
  GoSidebarExpand,
} from "react-icons/go";
import { RxDashboard } from "react-icons/rx";
import { MdOutlineManageAccounts } from "react-icons/md";
import { SiAwsorganizations, SiGoogledocs } from "react-icons/si";
import {
  BsFillClipboard2DataFill,
  BsGlobeCentralSouthAsia,
} from "react-icons/bs";
import {
  FaTasks,
  FaFolderOpen,
  FaHome,
  FaFileInvoiceDollar,
  FaTruck,
} from "react-icons/fa";
import { TfiBarChartAlt } from "react-icons/tfi";
import { VscCalendar, VscGraphLine } from "react-icons/vsc";
import { GiIndiaGate, GiCarWheel } from "react-icons/gi";
import { RiPagesLine, RiTeamFill } from "react-icons/ri";
import { LogoutOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../../Redux/Slices/GlobalSlice";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeSwitcher from "../ThemeSwitcher";
import assets from "../../assets/assets";
import "./SideBar.css";
import { logout, userLogout } from "../../Redux/Slices/AuthSlice";
import { MdOutlineContactEmergency } from "react-icons/md";
import { MdOutlinePriceChange } from "react-icons/md";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { FcInspection } from "react-icons/fc";

const { Sider } = Layout;

const SideBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { open: isSidebarOpen, isDark } = useSelector((s) => s.global);
  const auth = useSelector((s) => s.auth);

  // ✅ Create permissions array dynamically from menus
  const user = {
    ...auth,
    permissions: auth?.menus?.map((m) => m.MenuUrl) || [],
  };

  const collapsed = !isSidebarOpen;
  const [isMobile, setIsMobile] = useState(false);

  // --- Responsive ---
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const customIcon = (<img className="w-5 h-5" src={assets.CustomIcons} alt="Custom" />);

  // ✅ Define all possible menu items
  const menuItems = [
    { key: "/", icon: <IoHome />, label: "Home" },
    { key: "/Dashboard", icon: <RxDashboard />, label: "Dashboard" },
    {
      key: "TTS",
      icon: <SiAwsorganizations />,
      label: "TTS",
      children: [
        {
          key: "TTS/Domestic",
          icon: <GiIndiaGate />,
          label: "Domestic",
          children: [
            {
              key: "/TTS/Domestic/Dispatch",
              icon: <FaTruck />,
              label: "Dispatch",
              children: [
                {
                  key: "/TTS/Domestic/Dispatch/PDI/Inspection",
                  icon: <FcInspection />,
                  label: "PDI Inspection",
                  children: [
                    {
                      key: "/TTS/Domestic/Dispatch/PDI/Inspection/MMN/Domestic",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "MMN PDI Inspection",
                    },
                    {
                      key: "/TTS/Domestic/Dispatch/PDI/Inspection/PDK/Domestic",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "PDK PDI Inspection",
                    },
                    {
                      key: "/TTS/Domestic/Dispatch/PDI/Inspection/SITL/Domestic",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "SITL PDI Inspection",
                    },
                    {
                      key: "/TTS/Domestic/Dispatch/PDI/Inspection/SLTL/Domestic",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "SLTL PDI Inspection",
                    }
                  ]

                },
                {
                  key: "/TTS/Domestic/Dispatch/Substution",
                  icon: <FcInspection />,
                  label: "PPC Substitution",
                  children: [
                    {
                      key: "/TTS/Domestic/Dispatch/PPC/Substitution/MMN",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "MMN PPC Substitution",
                    },
                    {
                      key: "/TTS/Domestic/Dispatch/PPC/Substitution/PDK",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "PDK PPC Substitution",
                    },
                    {
                      key: "/TTS/Domestic/Dispatch/PPC/Substitution/SITL",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "SITL PPC Substitution",
                    },
                    {
                      key: "/TTS/Domestic/Dispatch/PPC/Substitution/SLTL",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "SLTL PPC Substitution",
                    }
                  ]
                },
              ],
            },
          ],
        },
        {
          key: "TTS/International",
          icon: <BsGlobeCentralSouthAsia />,
          label: "International",
          children: [
            {
              key: "InternationalInvoice",
              icon: <FaFileInvoiceDollar />,
              label: "Invoice",
              children: [
                {
                  key: "/TTS/International/Invoice/CustomerInvoice",
                  icon: <SiGoogledocs />,
                  label: "Customer",
                },
                {
                  key: "/TTS/International/Invoice/CustomInvoice",
                  icon: customIcon,
                  label: "Custom",
                },
              ],
            },
            {
              key: "/TTS/International/Dispatch",
              icon: <FaTruck />,
              label: "Dispatch",
              children: [
                {
                  key: "/TTS/International/Dispatch/PDI/Inspection",
                  icon: <FcInspection />,
                  label: "PDI Inspection",
                  children: [
                    {
                      key: "/TTS/International/Dispatch/PDI/Inspection/MMN/Export",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "MMN PDI Inspection",
                    },
                    {
                      key: "/TTS/International/Dispatch/PDI/Inspection/PDK/Export",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "PDK PDI Inspection",
                    },
                    {
                      key: "/TTS/International/Dispatch/PDI/Inspection/SITL/Export",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "SITL PDI Inspection",
                    },
                    {
                      key: "/TTS/International/Dispatch/PDI/Inspection/SLTL/Export",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "SLTL PDI Inspection",
                    }
                  ]

                },
                {
                  key: "/TTS/International/Dispatch/Substution",
                  icon: <FcInspection />,
                  label: "PPC Substitution",
                  children: [
                    {
                      key: "/TTS/International/Dispatch/PPC/Substitution/MMN",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "MMN PPC Substitution",
                    },
                    {
                      key: "/TTS/International/Dispatch/PPC/Substitution/PDK",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "PDK PPC Substitution",
                    },
                    {
                      key: "/TTS/International/Dispatch/PPC/Substitution/SITL",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "SITL PPC Substitution",
                    },
                    {
                      key: "/TTS/International/Dispatch/PPC/Substitution/SLTL",
                      icon: <MdOutlineQrCodeScanner />,
                      label: "SLTL PPC Substitution",
                    }
                  ]
                },
              ],
            },
          ],
        },
        {
          key: "/TTS/Rim/RimOverView",
          icon: <GiCarWheel />,
          label: "RIM Application",
        },
      ],
    },
    {
      key: "Masters",
      icon: <MdOutlineManageAccounts />,
      label: "Masters",
      children: [
        {
          key: "UserMaster",
          label: "User Master",
          children: [
            { key: "/Masters/UserMaster/AllUsers", label: "All Users" },
            { key: "/Masters/UserMaster/CreateUser", label: "Create User" },
          ],
        },
        {
          key: "/Masters/PriceMaster",
          label: "Price Master",
          icon: <MdOutlinePriceChange />,
        },
        {
          key: "/Masters/ItemIDMaster",
          label: "Item ID Master",
          icon: <MdOutlinePriceChange />,
        }
      ],
    },
    {
      key: "Pages",
      icon: <RiPagesLine />,
      label: "Pages",
      children: [
        { key: "/Pages/Calendar", icon: <VscCalendar />, label: "Calendar" },
      ],
    },
    {
      key: "Reports",
      icon: <TfiBarChartAlt />,
      label: "Reports",
      children: [
        {
          key: "TTSReports",
          icon: <BsFillClipboard2DataFill />,
          label: "TTS Reports",
          children: [
            {
              key: "/Reports/TTSReports/Production",
              icon: <IoPieChartSharp />,
              label: "Production Reports",
            },
            {
              key: "/Reports/TTSReports/Sale",
              icon: <VscGraphLine />,
              label: "Sale Reports",
            },
          ],
        },
      ],
    },
    {
      key: "Task-Management",
      icon: <FaTasks />,
      label: "Task Management",
      children: [
        { key: "/Task-Management/Home", icon: <FaHome />, label: "Home" },
        { key: "/Task-Management/Projects", icon: <FaFolderOpen />, label: "Projects" },
        { key: "/Task-Management/Team", icon: <RiTeamFill />, label: "Team" },
        { key: "/Task-Management/Reports", icon: <TfiBarChartAlt />, label: "Reports" },
      ],
    },
    { key: "/Settings", icon: <IoSettingsOutline />, label: "Settings" },
    { key: "/Settings/Menuaccess", icon: <MdOutlineContactEmergency />, label: "Menu Access" },
  ];

  function extractMenuData(items) {
    const result = [];

    const traverse = (menuList) => {
      menuList.forEach((item) => {
        // Only push if key starts with "/" (means it's a real route)
        if (typeof item.key === "string" && item.key.startsWith("/")) {
          result.push({
            menuName: item.label,
            menuUrl: item.key,
          });
        }

        // If this item has children → continue recursion
        if (item.children && Array.isArray(item.children)) {
          traverse(item.children);
        }
      });
    };

    traverse(items);
    return result;
  }
  const menuData = extractMenuData(menuItems);
  // console.log(menuData);
  // ✅ Filter based on user.permissions
  const filterMenu = (items) => {
    // 🟩 Admin with RoleID 1 — full access
    if (user?.roles?.toLowerCase() === "admin" && Number(user?.RoleID) === 1) {
      return items;
    }

    // 🟨 Normal users — filter based on permissions
    const allowed = [];
    for (const item of items) {
      if (item.children) {
        const allowedChildren = filterMenu(item.children);
        if (allowedChildren.length > 0) {
          allowed.push({ ...item, children: allowedChildren });
        }
      } else if (user?.permissions?.includes(item.key)) {
        allowed.push(item);
      }
    }
    return allowed;
  };

  const filteredMenu = user ? filterMenu(menuItems) : [];

  // ✅ Navigation handler
  // ✅ Navigation handler
  const handleClick = ({ key }) => {
    let state = null;

    // Determine state
    if (key === "/TTS/International/Invoice/CustomInvoice" || key === "/TTS/Domestic/Invoice/Custom") {
      state = { type: "Custom" };
    } else if (key === "/TTS/International/Invoice/CustomerInvoice" || key === "/TTS/Domestic/Invoice/Customer") {
      state = { type: "Customer" };
    }

    // 🚀 NAVIGATE IMMEDIATELY
    // Do not toggle sidebar here. 
    // This allows the page to change while the sidebar stays open.
    navigate(key, { state });
  };

  const handleLogout = async () => {
    localStorage.clear();
    navigate("/login");
    dispatch(userLogout(navigate));
    dispatch(logout())
    await persistor.purge();
  };

  // --- Sidebar UI (Unchanged) ---
  return (
    <>
      {isMobile && isSidebarOpen && (
  <div
    className="fixed inset-0 bg-opacity-40 z-40 lg:hidden"
    onClick={() => dispatch(toggleSidebar())}
  />
)}

      <Sider
        theme={isDark ? "dark" : "light"}
        collapsed={collapsed}
        width={240}
        collapsedWidth={isMobile ? 0 : 80}
        style={{
  height: "100vh",
  overflow: "auto",
  position: isMobile ? "fixed" : "relative",
  left: 0,
  top: 0,
  zIndex: isMobile ? 1000 : 10,
  transform: isMobile
    ? isSidebarOpen
      ? "translateX(0)"
      : "translateX(-100%)"
    : "none",
  transition: "transform 0.3s ease-in-out",
  display: "flex",
  flexDirection: "column",
}}
        className="dark:bg-gray-900 custom-scrollbar sidebar-transition"
        trigger={null}
      >
        {/* Logo & Toggle */}
        {/* Logo & Toggle Section */}
        <div
          className={`flex items-center h-16 p-1 dark:bg-gray-900 ${collapsed ? "justify-center" : "justify-between"}`}
          style={{ transition: "all 0.3s ease" }}
        >
          {/* Full Logo - Click to Close */}
          <div
            className={`transition-all duration-300 cursor-pointer ease-in-out ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"} overflow-hidden`}
            onClick={() => dispatch(toggleSidebar())} 
          >
            <img
              src={assets.TVSLOGO}
              alt="Full Logo"
              className="h-10 object-contain dark:invert"
            />
          </div>

          {/* Small Logo - Click to Open */}
          <div
            className={`transition-all duration-300 ease-in-out ${collapsed ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
          >
            <img
              src={assets.TVS}
              alt="Small Logo"
              className="h-10 w-10 object-contain dark:invert cursor-pointer"
              onClick={() => dispatch(toggleSidebar())} 
            />
          </div>
        </div>

        {/* Menu */}
        <div
          className="flex-1 overflow-y-auto dark:bg-gray-900 dark:text-white custom-scrollbar"
          style={{
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Menu
            theme={isDark ? "dark" : "light"}
            mode="inline"
            selectedKeys={[location.pathname]}
            items={filteredMenu}
            onClick={handleClick}
            inlineCollapsed={collapsed}
          />
        </div>

        {/* Logout */}
        <div
          className={`text-center cursor-pointer mb-2 transition-all duration-300 ${collapsed ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          onClick={handleLogout}
          style={{ color: isDark ? "#fff" : "#000" }}
        >
          <LogoutOutlined /> {!collapsed && "Logout"}
        </div>

        {/* Theme Toggle */}
        <div className="p-1 mt-auto flex justify-center">
          <ThemeSwitcher />
        </div>
      </Sider>

    </>
  );
};

export default SideBar;
