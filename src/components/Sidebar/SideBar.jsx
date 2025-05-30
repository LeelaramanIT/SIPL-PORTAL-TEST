import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import assets from "../../assets/assets.js";
import { IoMdSettings } from "react-icons/io";
import { IoHome } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { FaUsers, FaUser } from "react-icons/fa";
import { GoOrganization } from "react-icons/go";
import SidebarItem from "./SidebarItem.jsx";
import { NavLink } from "react-router-dom";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { SiAwsorganizations } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar, toggleSection } from "../../Redux/Slices/GlobalSlice.jsx";
import { useCallback } from "react";

const SideBar = () => {
  const dispatch = useDispatch();
  const open = useSelector((store) => store.global.open);
  const sections = useSelector((store) => store.global.sections);
  const menus = useSelector((store)=> store.auth.menus)

  // Check if a menu item with a specific name exists
const isMenuAllowed = (menuName) =>
  menus.some(menu => menu.menuName === menuName);

// Check if any menu URL matches a pattern (e.g., starts with 'TTS/International')
const hasMenuUrlPrefix = (prefix) =>
  menus.some(menu => menu.menuUrl.startsWith(prefix));

  console.log(menus)
  
  return (
    <div
      className={`${
        open ? "w-52 max-w-[280px]" : "w-20"
      } bg-[#f7f2ef] text-black duration-300 flex flex-col overflow-y-auto custom-scrollbar min-h-screen dark:bg-gray-900`}
    >
      {/* Header */}
      <div className="w-full h-12 flex items-center px-4">
        {open && (
          <div className="flex items-center">
            <img className="h-14 w-full" src={assets.TVSLOGO} alt="TVS Logo" />
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={`text-2xl text-black ${open ? "ml-auto" : "m-auto"}`}
        >
          {open ? (
            <GoSidebarExpand className="text-primary dark:text-white" />
          ) : (
            <GoSidebarCollapse className="text-primary dark:text-white" />
          )}
        </button>
      </div>

      {/* Sidebar Items */}
      <div className="w-full h-full mt-5">
        <ul className="w-full h-full">
          <NavLink to={"/"}>
            <SidebarItem icon={IoHome} label="Home" />
          </NavLink>
          {isMenuAllowed("Dashboard") && (<NavLink to={"/Dashboard"}>
            <SidebarItem icon={RxDashboard} label="Dashboard" />
          </NavLink>)}

          {/* Masters */}
          {hasMenuUrlPrefix("Masters/") && (<div onClick={() => !open && dispatch(toggleSidebar())}>
            <SidebarItem
              icon={FaUsers}
              label="Masters"
              sectionKey="mastersOpen"
            >
              <SidebarItem
                icon={FaUser}
                label="User Master"
                sectionKey="userMasterOpen"
              >
                <NavLink to="/Masters/UserMaster/UserCreate">
                  <li className="cursor-pointer hover:bg-text-hover px-4 py-2 text-[0.9rem] text-primary">
                    User Create
                  </li>
                </NavLink>
              </SidebarItem>

              <SidebarItem
                icon={GoOrganization}
                label="Organization"
                sectionKey="organizationOpen"
              >
                <NavLink to="/Masters/Organization/OrganizationCreate">
                  <li className="cursor-pointer hover:bg-text-hover px-4 py-2 text-[0.9rem] text-primary">
                    Create Branch
                  </li>
                </NavLink>
              </SidebarItem>
            </SidebarItem>
          </div>)}

          {/* TTS Menu */}
          {hasMenuUrlPrefix('TTS/') && (<div onClick={() => !open && dispatch(toggleSidebar())}>
            <SidebarItem
              icon={SiAwsorganizations}
              label="TTS"
              sectionKey="TTSOpen"
            >
              {hasMenuUrlPrefix("Domestic/") && (<SidebarItem label="Domestic" sectionKey="domesticOpen">
                <SidebarItem
                  icon={LiaFileInvoiceDollarSolid}
                  label="Invoice"
                  sectionKey="DomesticInvoiceOpen"
                >
                  <NavLink to="/TTS/Domestic/Invoice/CustomerInvoice">
                    <li className="cursor-pointer hover:bg-text-hover p-1 text-[0.9rem] text-primary">
                      Customer
                    </li>
                  </NavLink>
                </SidebarItem>
              </SidebarItem>)}

              {hasMenuUrlPrefix("TTS/International/") && <SidebarItem label="International" sectionKey="internationalOpen">
                <SidebarItem
                  icon={LiaFileInvoiceDollarSolid}
                  label="Invoice"
                  sectionKey="InternationalInvoiceOpen"
                >
                  {isMenuAllowed("ExportInvoice") && (<NavLink to="/TTS/International/Invoice/Export">
                    <li className="cursor-pointer hover:bg-text-hover p-1 text-[0.9rem] text-primary">
                      Export
                    </li>
                  </NavLink>)}
                </SidebarItem>
              </SidebarItem>}

            </SidebarItem>
          </div>)}

          {isMenuAllowed("Settings") && (<NavLink to={"/Settings"}>
            <SidebarItem icon={IoMdSettings} label="Settings" />
          </NavLink>)}
        </ul>
      </div>
      {/* dark mode toggle */}
      <div className="flex justify-center items-center"></div>
    </div>
  );
};

export default SideBar;
