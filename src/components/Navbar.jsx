import React from 'react'
import { IoMdNotificationsOutline } from "react-icons/io";
import { TbLogout } from "react-icons/tb";
import assets from '../assets/assets.js';
import BreadCrumbs from './BreadCrumbs';
import { useNavigate } from 'react-router-dom';
import ToggleButton from './ToggleButton.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="h-[70px] flex justify-between items-center px-4">
      {/* Left Side */}
      <BreadCrumbs/>  

      {/* Right Side */}
      <div className='flex items-center gap-3.5 ml-auto mr-3'>
      <ToggleButton/>
        <img className='w-10 h-10 rounded-full border-primary border cursor-pointer' src={assets.DefaultLogo} alt='UserLogo'/>
        <p className='cursor-pointer text-primary'>USER NAME</p>
        <IoMdNotificationsOutline className="text-[1.5rem] cursor-pointer text-primary"/>
        <TbLogout className="text-[1.5rem] cursor-pointer text-primary" onClick={()=>navigate('/login')}/>
      </div>
    </div>
  )
}

export default Navbar
