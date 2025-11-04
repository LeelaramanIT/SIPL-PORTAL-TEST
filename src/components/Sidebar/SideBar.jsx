import { Layout, Menu } from "antd";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { MdOutlineManageAccounts } from "react-icons/md";
import { IoHome, IoSettingsOutline, IoPieChartSharp } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { SiAwsorganizations, SiGoogledocs } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../../Redux/Slices/GlobalSlice";
import { useNavigate } from "react-router-dom";
import assets from "../../assets/assets";
import ThemeSwitcher from "../ThemeSwitcher";
import { RiPagesLine, RiTeamFill } from "react-icons/ri";
import {
  BsFillClipboard2DataFill,
  BsGlobeCentralSouthAsia,
} from "react-icons/bs";
import { useState, useEffect } from "react";
import {
  FaTasks,
  FaFolderOpen,
  FaHome,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { TfiBarChartAlt } from "react-icons/tfi";
import { VscCalendar, VscGraphLine } from "react-icons/vsc";
import { GiIndiaGate, GiCarWheel } from "react-icons/gi";
import "./SideBar.css";

const { Sider } = Layout;

// Helper function to generate Ant Design Menu structure
const getMenuItems = (isMenuAllowed, hasMenuUrlPrefix, assets) => {
  const customIcon = (
    <img className="w-5 h-5" src={assets.CustomIcons} alt="Custom" />
  );
  const menuItems = [
    {
      key: "/",
      icon: <IoHome />,
      label: "Home",
    },
    isMenuAllowed("Dashboard") && {
      key: "/Dashboard",
      icon: <RxDashboard />,
      label: "Dashboard",
    },
    // TTS Section
    hasMenuUrlPrefix("TTS") && {
      key: "TTS",
      icon: <SiAwsorganizations />,
      label: "TTS",
      children: [
        // Domestic Section
        hasMenuUrlPrefix("TTS/Domestic") && {
          key: "TTS/Domestic",
          icon: <GiIndiaGate />,
          label: "Domestic",
          children: [
            hasMenuUrlPrefix("TTS/Domestic/Invoice") && {
              key: "DomesticInvoice",
              icon: <FaFileInvoiceDollar />,
              label: "Invoice",
              children: [
                isMenuAllowed("CustomerInvoice") && {
                  key: "/TTS/Domestic/Invoice/Customer",
                  icon: <SiGoogledocs />,
                  label: "Customer",
                },
                isMenuAllowed("CustomInvoice") && {
                  key: "/TTS/Domestic/Invoice/Custom",
                  icon: customIcon,
                  label: "Custom",
                },
              ].filter(Boolean),
            },
          ].filter(Boolean),
        },
        // International Section
        hasMenuUrlPrefix("TTS/International") && {
          key: "International",
          icon: <BsGlobeCentralSouthAsia />,
          label: "International",
          children: [
            {
              key: "InternationalInvoice",
              icon: <FaFileInvoiceDollar />,
              label: "Invoice",
              children: isMenuAllowed("ExportInvoice")
                ? [
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
                  ]
                : undefined, // Undefined if no children are allowed
            },
          ],
        },
        {
          key: "/TTS/Rim/RimOverView",
          icon: <GiCarWheel />,
          label: "RIM Application",
        },
      ].filter(Boolean),
    },
    // Masters Section
    hasMenuUrlPrefix("/Masters") && {
      key: "Masters",
      icon: <MdOutlineManageAccounts />,
      label: "Masters",
      children: [
        {
          key: "UserMaster",
          label: "User Master",
          children: [
            { key: "/Masters/UserMaster/AllUsers", label: "All Users" },
            { key: "/Master/UserMaster/AllUsers", label: "Create User" },
          ],
        },
      ],
    },
    // Pages Section
    hasMenuUrlPrefix("/Pages") && {
      key: "Pages",
      icon: <RiPagesLine />,
      label: "Pages",
      children: [
        isMenuAllowed("Calender") && {
          key: "/Pages/Calendar",
          icon: <VscCalendar />,
          label: "Calender",
        },
      ].filter(Boolean),
    },
    // Reports Section
    hasMenuUrlPrefix("/Reports") && {
      key: "Reports",
      icon: <TfiBarChartAlt />,
      label: "Reports",
      children: [
        {
          key: "TTSReports",
          icon: <BsFillClipboard2DataFill />,
          label: "TTSReports",
          children: [
            isMenuAllowed("Production") && {
              key: "/Reports/TTSReports/Production",
              icon: <IoPieChartSharp />,
              label: "Production Reports",
            },
            isMenuAllowed("Sale") && {
              key: "/Reports/TTSReports/Sale",
              icon: <VscGraphLine />,
              label: "Sale Reports",
            },
          ].filter(Boolean),
        },
      ],
    },
    // Task Management Section
    hasMenuUrlPrefix("/Task-Management") && {
      key: "Task-Management",
      icon: <FaTasks />,
      label: "Task Management",
      children: [
        isMenuAllowed("Task-Home") && {
          key: "/Task-Management/Home",
          icon: <FaHome />,
          label: "Home",
        },
        isMenuAllowed("Task-Projects") && {
          key: "/Task-Management/Projects",
          icon: <FaFolderOpen />,
          label: "Projects",
        },
        isMenuAllowed("Task-Team") && {
          key: "/Task-Management/Team",
          icon: <RiTeamFill />,
          label: "Team",
        },
        isMenuAllowed("Task-Reports") && {
          key: "/Task-Management/Reports",
          icon: <TfiBarChartAlt />,
          label: "Reports",
        },
      ].filter(Boolean),
    },
    // Settings
    isMenuAllowed("Settings") && {
      key: "/Settings",
      icon: <IoSettingsOutline />,
      label: "Settings",
    },
    isMenuAllowed("Settings/Menuaccess") && {
      key: "/Settings/Menuaccess",
      icon: <IoSettingsOutline />,
      label: "Menu Access",
    },
  ].filter(Boolean); // Filter out any false/null values

  return menuItems;
};

const SideBar = () => {
  // --- Hooks and State ---
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { open: isSidebarOpen, isDark } = useSelector((store) => store.global);
  const { roleID, roles, menus } = useSelector((store) => store.auth);
  const collapsed = !isSidebarOpen;
  const [isMobile, setIsMobile] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- Logic & Handlers ---
  const isAdmin = roles?.[0]?.RoleName === "Admin" || roleID === 1;

  const isMenuAllowed = (menuName) => {
    if (isAdmin) return true;
    return menus?.some((menu) => menu.MenuName === menuName);
  };

  const hasMenuUrlPrefix = (prefix) => {
    if (isAdmin) return true;
    return menus?.some((menu) => menu.MenuUrl?.startsWith(prefix));
  };

  const handleClick = ({ key }) => {
    let route = key;
    let state = {};

    // Special handling for dynamic routes (like International Invoice)
    if (key.includes("/TTS/International/Invoice/")) {
      state = { type: key.endsWith("CustomerInvoice") ? "Customer" : "Custom" };
    }

    // Special handling for domestic routes (optional, but consistent with the original logic)
    if (key.includes("/TTS/Domestic/Invoice/")) {
      state = { type: key.endsWith("/Customer") ? "Customer" : "Custom" };
    }

    navigate(route, state.type ? { state } : undefined);

    // Close sidebar on mobile after clicking a link
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  };

  // Generate Menu Items using the external helper function
  const menuItems = getMenuItems(isMenuAllowed, hasMenuUrlPrefix, assets);

  // --- Styles ---
  const siderStyle = {
    display: "flex",
    flexDirection: "column",
    ...(isDark === false && { backgroundColor: "var(--color-background)" }),
  };

  const menuStyle = {
    ...(isDark === false && {
      backgroundColor: "var(--color-background)",
    }),
  };

  return (
    <>
      {/* Mobile Overlay (Only visible when mobile and sidebar is open) */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <Sider
        theme={isDark ? "dark" : "light"}
        collapsible
        collapsed={collapsed}
        onCollapse={() => dispatch(toggleSidebar())}
        width={240}
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          ...siderStyle,
          height: "100vh",
          overflow: "auto",
          ...(isMobile &&
            isSidebarOpen && {
              position: "fixed",
              left: 0,
              top: 0,
              zIndex: 50,
            }),
        }}
        className={`dark:bg-gray-900 ${
          isMobile ? "lg:relative" : ""
        } custom-scrollbar`}
        trigger={null}
        breakpoint="lg"
      >
        {/* Logo & Toggle */}
        <div
          className={`flex items-center h-16 p-4 dark:bg-gray-900 custom-scrollbar ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {/* Main Logo */}
          {!collapsed && (
            <img
              src={assets.TVSLOGO}
              alt="Full Logo"
              className="h-full object-contain dark:invert"
            />
          )}
          {/* Collapsed Logo */}
          {collapsed && (
            <img
              src={assets.TVS}
              alt="Small Logo"
              className="h-14 w-14 object-contain dark:invert"
            />
          )}
          {/* Collapse Button */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className={`text-xl text-primary ${
              collapsed ? "absolute right-0" : "ml-auto"
            }`}
          >
            {collapsed ? (
              <GoSidebarExpand className="dark:text-white" />
            ) : (
              <GoSidebarCollapse className="dark:text-white" />
            )}
          </button>
        </div>

        {/* Menu */}
        <Menu
          theme={isDark ? "dark" : "light"}
          mode="inline"
          onClick={handleClick}
          items={menuItems} // Using the Ant Design 'items' prop now
          className="flex-1 dark:bg-gray-900 dark:text-white overflow-y-auto custom-scrollbar"
          style={menuStyle}
        />

        {/* Theme Toggle */}
        <div className={`p-2 mt-auto flex justify-center`}>
          <ThemeSwitcher />
        </div>
      </Sider>
    </>
  );
};

export default SideBar;
