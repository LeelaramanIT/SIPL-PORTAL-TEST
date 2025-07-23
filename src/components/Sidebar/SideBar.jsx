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
import './SideBar.css'

const { Sider } = Layout;

const SideBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const collapsed = !useSelector((store) => store.global.open);
  const isDark = useSelector((state) => state.global.isDark);
  
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

  const isAdmin = role?.[0]?.RoleName === "Admin";

  
  

  const isMenuAllowed = (menuName) => {
    if (isAdmin) return true;    
    return menus?.some((menu) => menu.MenuName === menuName);
  };
  
   

  const hasMenuUrlPrefix = (prefix) => {
    if (isAdmin) return true;
    return menus?.some((menu) => menu.MenuUrl?.startsWith(prefix));
  };

  return (
    <Sider
      theme={isDark ? "dark" : "light"}
      
      collapsible
      collapsed={collapsed}
      onCollapse={() => dispatch(toggleSidebar())}
      width={240}
      style={{
        ...siderStyle,
        height: '100vh',
        overflow: 'auto',
      }}
      className="dark:bg-gray-900"
      trigger={null}
      
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between h-16 p-4 dark:bg-gray-900">
        {!collapsed && (
          <img
            src={assets.TVSLOGO}
            alt="Logo"
            className="h-full object-contain dark:invert"
          />
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={`text-xl text-primary ${
            collapsed ? "mx-auto" : "ml-auto"
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
        className="flex-1 dark:bg-gray-900 dark:text-white overflow-y-auto"
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
              <Menu.SubMenu key="TTS/Domestic" title="Domestic">
                {hasMenuUrlPrefix('TTS/Domestic/Invoice')&&(<Menu.SubMenu key="DomesticInvoice" title="Invoice">
                  {isMenuAllowed("CustomerInvoice") && (
                    <Menu.Item key="/TTS/Domestic/Invoice/Customer">
                      Customer
                    </Menu.Item>
                  )}
                  {isMenuAllowed("CustomInvoice") && (
                    <Menu.Item key="/TTS/Domestic/Invoice/Custom">
                      Custom
                    </Menu.Item>
                  )}
                </Menu.SubMenu>)}
              </Menu.SubMenu>
            )}

            {/* International Section */}
            {hasMenuUrlPrefix("TTS/International") && (
              <Menu.SubMenu key="International" title="International">
                <Menu.SubMenu key="InternationalInvoice" title="Invoice">
                  {isMenuAllowed("ExportInvoice") && (
                    <>
                    <Menu.Item key="/TTS/International/Invoice/CustomInvoice">
                      Custom Invoice
                    </Menu.Item>
                    <Menu.Item key="/TTS/International/Invoice/CustomerInvoice">
                      Customer Invoice
                      </Menu.Item>
                    </>
                  )}
                </Menu.SubMenu>
              </Menu.SubMenu>
            )}
            {<Menu.Item key='/TTS/Rim/RimOverView'>RIM</Menu.Item>}
          </Menu.SubMenu>
        )}
        {hasMenuUrlPrefix('/Master') && (<Menu.SubMenu key="Master" title="Masters" icon={<MdOutlineManageAccounts />}>
          {isMenuAllowed('userMaster') && (<Menu.Item key="/Master/Users">
            Users
          </Menu.Item>)}
          {(isMenuAllowed('userMasterCreate') && <Menu.Item key="/Master/Ureate">
            Cretae
          </Menu.Item>)}
        </Menu.SubMenu>)}

        {hasMenuUrlPrefix('/Pages') && (<Menu.SubMenu key="Pages" title="Pages" icon={<RiPagesLine />}>
          {isMenuAllowed('Calender') && (<Menu.Item key="/Pages/Calendar">
            Calender
          </Menu.Item>)}
        </Menu.SubMenu>)}
        {hasMenuUrlPrefix('/Reports') && (<Menu.SubMenu key="Reports" title="Reports" icon={<TbReportSearch />}>
          {isMenuAllowed('TTSReports') && (<Menu.Item key="/Reports/TTSReports">
            TTS Reports
          </Menu.Item>)}
        </Menu.SubMenu>)}

        {isMenuAllowed("Settings") && (
          <Menu.Item key="/Settings" icon={<IoSettingsOutline />}>
            Settings
          </Menu.Item>
        )}

      </Menu>

      {/* Theme Toggle */}
      <div className="p-2 mt-auto flex justify-center">
        <ThemeSwitcher />
      </div>
    </Sider>
  );
};

export default SideBar;
