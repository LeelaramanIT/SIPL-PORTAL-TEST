import React from "react";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import assets from "../assets/assets.js";
import { IoMdSettings } from "react-icons/io";
import { IoHome } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { FaUsers, FaUser } from "react-icons/fa";
import { GoOrganization } from "react-icons/go";
import SidebarItem from "./SidebarItem";
import { NavLink } from "react-router-dom";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { SiAwsorganizations } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../Redux/Slices/GlobalSlice.jsx";

const SideBar = () => {

 const dispatch = useDispatch();
 const open = useSelector((store)=>store.global.open);
 const sections = useSelector((store)=>store.global.sections)

  const toggleSection = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div
      className={`${
        open ? "w-52 max-w-[280px]" : "w-20"
      } bg-[#f7f2ef] text-black duration-300 flex flex-col overflow-y-auto custom-scrollbar min-h-screen`}
    >
      {/* Header */}
      <div className="w-full h-12 flex items-center px-4">
        {open && (
          <div className="flex items-center">
            <img className="h-14 w-full" src={assets.TVSLOGO} alt="TVS Logo" />
            {/* <h1 className="text-xl lg:text-3xl font-bold text-primary">SIPL</h1> */}
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={`text-2xl text-black ${open ? "ml-auto" : "m-auto"}`}
        >
          {open ? (
            <GoSidebarExpand className="text-primary" />
          ) : (
            <GoSidebarCollapse className="text-primary" />
          )}
        </button>
      </div>

      {/* Sidebar Items */}
      <div className="w-full h-full mt-5">
        <ul className="w-full h-full">
          <NavLink to={"/"}>
            <SidebarItem icon={IoHome} label="Home" />
          </NavLink>
          <NavLink to={"/dashboard"}>
            <SidebarItem icon={RxDashboard} label="Dashboard" />
          </NavLink>

          {/* Masters */}
          <div onClick={()=>{!open ? dispatch(toggleSidebar()) : ''}}><SidebarItem
            icon={FaUsers}
            label="Masters"
            isOpen={sections.mastersOpen}
            setIsOpen={() => dispatch(toggleSection("mastersOpen"))}
          >
            <SidebarItem
              icon={FaUser}
              label="User Master"
              isOpen={sections.userMasterOpen}
              setIsOpen={() => dispatch(toggleSection("userMasterOpen"))}
            >
              <NavLink to={"/Masters/UserMaster/UserCreate"}>
                <li className="cursor-pointer hover:bg-text-hover px-4 py-2 text-[0.9rem] text-primary">
                  User Create
                </li>
              </NavLink>
              <NavLink to={"/Masters/UserMaster/UserUpdate"}>
                <li className="cursor-pointer hover:bg-text-hover px-4 py-2 text-[0.9rem] text-primary">
                  User Update
                </li>
              </NavLink>
              <NavLink to={"/Masters/UserMaster/ViewUsers"}>
                <li className="cursor-pointer hover:bg-text-hover px-4 py-2 text-[0.9rem] text-primary">
                  View Users
                </li>
              </NavLink>
            </SidebarItem>

            <SidebarItem
              icon={GoOrganization}
              label="Organization"
              isOpen={sections.organizationOpen}
              setIsOpen={() => dispatch(toggleSection("organizationOpen"))}
            >
              <NavLink to={"/Masters/Organization/OrganizationCreate"}>
                <li className="cursor-pointer hover:bg-text-hover px-4 py-2 text-[0.9rem] text-primary">
                  Create Branch
                </li>
              </NavLink>
              <NavLink to={"/Masters/Organization/OrganizationUpdate"}>
                <li className="cursor-pointer hover:bg-text-hover px-4 py-2 text-[0.9rem] text-primary">
                  Update Branch
                </li>
              </NavLink>
              <NavLink to={"/Masters/Organization/OrganizationView"}>
                <li className="cursor-pointer hover:bg-text-hover px-4 py-2 text-[0.9rem] text-primary">
                  View Branch
                </li>
              </NavLink>
            </SidebarItem>
          </SidebarItem></div>

          {/*TTS Menu  */}
          <div onClick={()=>{!open ? dispatch(toggleSidebar()) : ''}}><SidebarItem
            icon={SiAwsorganizations}
            label="TTS"
            isOpen={sections.TTSOpen}
            setIsOpen={() => dispatch(toggleSection("TTSOpen"))}
          >
            <SidebarItem
              icon={LiaFileInvoiceDollarSolid}
              label="Invoice"
              isOpen={sections.invoiceOpen}
              setIsOpen={() => dispatch(toggleSection("invoiceOpen"))}
            >
              {/* Domestic Dropdown */}
              <SidebarItem
                label="Domestic"
                isOpen={sections.domesticOpen}
                setIsOpen={() => dispatch(toggleSection("domesticOpen"))}
              >
                <NavLink to="/TTS/Invoice/Domestic/CustomerInvoice">
                  <li className="cursor-pointer hover:bg-text-hover p-1 text-[0.9rem] text-primary">
                    Customer
                  </li>
                </NavLink>
                <NavLink to="/TTS/Invoice/Domestic/CustomInvoice">
                  <li className="cursor-pointer hover:bg-text-hover p-1 text-[0.9rem] text-primary">
                    Custom
                  </li>
                </NavLink>
              </SidebarItem>

              {/* International (optional placeholder) */}
              <SidebarItem
                label="International"
                isOpen={sections.domesticOpen}
                setIsOpen={() => dispatch(toggleSection("domesticOpen"))}
              >
                <NavLink to="/TTS/Invoice/International/Export">
                  <li className="cursor-pointer hover:bg-text-hover p-1 text-[0.9rem] text-primary -ml-1">
                    Export
                  </li>
                </NavLink>
              </SidebarItem>
            </SidebarItem>

          </SidebarItem></div>

          <NavLink to={"/Settings"}>
            <SidebarItem icon={IoMdSettings} label="Settings" />
          </NavLink>
        </ul>
      </div>
      {/* dark mode toggle */}
      <div className="flex justify-center items-center"></div>
    </div>
  );
};

export default SideBar;
