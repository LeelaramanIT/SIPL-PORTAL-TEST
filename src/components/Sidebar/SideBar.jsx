import { Layout, Menu } from "antd";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { MdOutlineManageAccounts } from "react-icons/md";
import { IoHome, IoSettingsOutline } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { SiAwsorganizations } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../../Redux/Slices/GlobalSlice";
import { useNavigate } from "react-router-dom";
import assets from "../../assets/assets";
import ThemeSwitcher from "../ThemeSwitcher";
import { RiPagesLine } from "react-icons/ri";
import { TbReportSearch } from "react-icons/tb";
import { useState, useEffect } from "react";
import { FaTasks } from "react-icons/fa";
import { FaFolderOpen } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { RiTeamFill } from "react-icons/ri";
import { TfiBarChartAlt } from "react-icons/tfi";
import { VscCalendar } from "react-icons/vsc";
import { GiIndiaGate } from "react-icons/gi";
import { BsGlobeCentralSouthAsia } from "react-icons/bs";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { SiGoogledocs } from "react-icons/si";
import { GiCarWheel } from "react-icons/gi";
import { VscGraphLine } from "react-icons/vsc";
import './SideBar.css'

const { Sider } = Layout;

const SideBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const collapsed = !useSelector((store) => store.global.open);
  const isDark = useSelector((state) => state.global.isDark);
  const roleID = useSelector((state) => state.auth.roleID);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const menus = useSelector((store) => store.auth.menus);
  
  const role = useSelector((store) => store.auth.roles);

  const handleClick = ({ key }) => {
    let route = key;
    let state = {};
  
    if (key === '/TTS/International/Invoice/CustomerInvoice') {
      route = key;
      state = { type: 'Customer' };
    }
  
    if (key === '/TTS/International/Invoice/CustomInvoice') {
      route = key;
      state = { type: 'Custom' };
    }
  
    navigate(route, state.type ? { state } : undefined);
  };
  
  

  const siderStyle = {
    display: "flex",
    flexDirection: "column",
    ...(isDark === false && { backgroundColor: "var(--color-background)" }),
  };

  const isAdmin = role?.[0]?.RoleName === "Admin" || roleID === 1;

  const isMenuAllowed = (menuName) => {
    if (isAdmin) return true;    
    return menus?.some((menu) => menu.MenuName === menuName);
  };
  
   

  const hasMenuUrlPrefix = (prefix) => {
    if (isAdmin || roleID === 1) return true;
    return menus?.some((menu) => menu.MenuUrl?.startsWith(prefix));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
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
          height: '100vh',
          overflow: 'auto',
          ...(isMobile && !collapsed && {
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 50,
          }),
        }}
        className={`dark:bg-gray-900 ${isMobile ? 'lg:relative' : ''} custom-scrollbar`}
        trigger={null}
        breakpoint="lg"
        
      >
      {/* Logo & Toggle */}
      <div className={`flex items-center h-16 p-4 dark:bg-gray-900 custom-scrollbar ${
        collapsed ? "justify-center" : "justify-between"
      }`}>
        {!collapsed && (
          <img
            src={assets.TVSLOGO}
            alt="Logo"
            className="h-full object-contain dark:invert"
          />
        )}
        {collapsed && (
          <img
            src={assets.TVS}
            alt="Logo"
            className="h-14 w-14 object-contain dark:invert"
          />
        )}
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
        className="flex-1 dark:bg-gray-900 dark:text-white overflow-y-auto custom-scrollbar"
        style={{
          ...(isDark === false && {
            backgroundColor: "var(--color-background)",
          }),
        }}
      >
        <Menu.Item key="/" icon={<IoHome />}>
          Home
        </Menu.Item>
        {isMenuAllowed("Dashboard") && (
          <Menu.Item key="/Dashboard" icon={<RxDashboard />}>
            Dashboard
          </Menu.Item>
        )}
        {/* TTS Section */}
        {hasMenuUrlPrefix("TTS") && (
          <Menu.SubMenu key="TTS" icon={<SiAwsorganizations />} title="TTS">
            {/* Domestic Section */}
            {hasMenuUrlPrefix("TTS/Domestic") && (
              <Menu.SubMenu key="TTS/Domestic" title="Domestic" icon={<GiIndiaGate/>}>
                {hasMenuUrlPrefix('TTS/Domestic/Invoice')&&(<Menu.SubMenu key="DomesticInvoice" title="Invoice" icon={<FaFileInvoiceDollar/>}>
                  {isMenuAllowed("CustomerInvoice") && (
                    <Menu.Item key="/TTS/Domestic/Invoice/Customer" icon={<SiGoogledocs/>}>
                      Customer
                    </Menu.Item>
                  )}
                  {isMenuAllowed("CustomInvoice") && (
                    <Menu.Item key="/TTS/Domestic/Invoice/Custom" icon={<img className="w-5 h-5" src={assets.CustomIcons}/>}>
                      Custom
                    </Menu.Item>
                  )}
                </Menu.SubMenu>)}
              </Menu.SubMenu>
            )}

            {/* International Section */}
            {hasMenuUrlPrefix("TTS/International") && (
              <Menu.SubMenu key="International" title="International" icon={<BsGlobeCentralSouthAsia/>}>
                <Menu.SubMenu key="InternationalInvoice" title="Invoice" icon={<FaFileInvoiceDollar/>}>
                  {isMenuAllowed("ExportInvoice") && (
                    <>
                    <Menu.Item key="/TTS/International/Invoice/CustomerInvoice" icon={<SiGoogledocs/>}>
                      Customer
                      </Menu.Item>
                      <Menu.Item key="/TTS/International/Invoice/CustomInvoice" icon={<img className="w-5 h-5" src={assets.CustomIcons}/>}>
                      Custom
                    </Menu.Item>
                    </>
                  )}
                </Menu.SubMenu>
              </Menu.SubMenu>
            )}
            {<Menu.Item key='/TTS/Rim/RimOverView' icon={<GiCarWheel/>}>RIM Application</Menu.Item>}
          </Menu.SubMenu>
        )}
        {hasMenuUrlPrefix('/Masters') && (<Menu.SubMenu key="Masters" title="Masters" icon={<MdOutlineManageAccounts />}>
         <Menu.SubMenu key="UserMaster" title='User Master'>
         <Menu.Item key="/Masters/UserMaster/AllUsers">
          All Users
          </Menu.Item>
          <Menu.Item key="/Master/UserMaster/AllUsers">
          Create User
          </Menu.Item>
         </Menu.SubMenu>
        </Menu.SubMenu>)}

        {hasMenuUrlPrefix('/Pages') && (<Menu.SubMenu key="Pages" title="Pages" icon={<RiPagesLine />}>
          {isMenuAllowed('Calender') && (<Menu.Item key="/Pages/Calendar" icon={<VscCalendar/>}>
            Calender
          </Menu.Item>)}
        </Menu.SubMenu>)}
        {hasMenuUrlPrefix('/Reports') && (<Menu.SubMenu key="Reports" title="Reports" icon={<TfiBarChartAlt />}>
          {isMenuAllowed('TTSReports') && (<Menu.Item key="/Reports/TTSReports" icon={<VscGraphLine/>}>
            TTS Reports
          </Menu.Item>)}
        </Menu.SubMenu>)}
        {hasMenuUrlPrefix('/Task-Management') && (<Menu.SubMenu key="Task-Management" title="Task Management" icon={<FaTasks />}>
          {isMenuAllowed('Task-Home') && (<Menu.Item key="/Task-Management/Home" icon={<FaHome/>}>
            Home
          </Menu.Item>)}
          {isMenuAllowed('Task-Projects') && (<Menu.Item key="/Task-Management/Projects" icon={<FaFolderOpen/>}>
            Projects
          </Menu.Item>)}
          {isMenuAllowed('Task-Team') && (<Menu.Item key="/Task-Management/Team" icon={<RiTeamFill/>}>
            Team
          </Menu.Item>)}
          {isMenuAllowed('Task-Reports') && (<Menu.Item key="/Task-Management/Reports" icon={<TfiBarChartAlt/>}>
            Reports
          </Menu.Item>)}
        </Menu.SubMenu>)}

        {isMenuAllowed("Settings") && (
          <Menu.Item key="/Settings" icon={<IoSettingsOutline />}>
            Settings
          </Menu.Item>
        )}

      </Menu>

      {/* Theme Toggle */}
      <div className={`p-2 mt-auto flex ${
        collapsed ? "justify-center" : "justify-center"
      }`}>
        <ThemeSwitcher />
      </div>
    </Sider>
    </>
  );
};

export default SideBar;
