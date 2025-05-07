import React from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSection } from '../store/sidebarSlice';

const SidebarItem = ({ icon: Icon, label, children }) => {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.sidebar.open);
  const isOpen = useSelector((state) => state.sidebar.sections[label] || false);
  const hasChildren = !!children;

  const handleClick = () => {
    if (hasChildren && open) {
      dispatch(toggleSection(label));
    }
  };

  return (
    <>
      <li
        className={`w-full h-12 flex items-center px-4 ${open ? "" : "justify-center"} cursor-pointer ${
          isOpen ? "text-black" : "text-primary"
        } hover:text-black hover:bg-text-hover text-[0.8rem]`}
        onClick={handleClick}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {open && <span className="ml-2">{label}</span>}
        {hasChildren && open && (
          <span className="ml-auto">
            {isOpen ? <FaAngleUp className="w-3.5 h-3.5" /> : <FaAngleDown className="w-3.5 h-3.5" />}
          </span>
        )}
      </li>

      {open && isOpen && hasChildren && <ul className="pl-10">{children}</ul>}
    </>
  );
};

export default SidebarItem;

