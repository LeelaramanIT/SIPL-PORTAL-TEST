import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSection } from '../Redux/Slices/GlobalSlice';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

const SidebarItem = ({ icon: Icon, label, children }) => {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.global.open);
  const isOpen = useSelector((state) => state.global.sections[label] || false);
  const hasChildren = !!children;

  const contentRef = useRef(null);

  const handleClick = () => {
    if (hasChildren && open) {
      dispatch(toggleSection(label));
    }
  };

  // Animate dropdown using GSAP
  useEffect(() => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        height: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0,
        duration: 0.3,
        ease: 'power1',
        display: isOpen ? 'block' : 'none',
      });
    }
  }, [isOpen]);

  return (
    <>
      <li
        className={`w-full h-12 flex items-center px-4 ${
          open ? '' : 'justify-center'
        } cursor-pointer ${
          isOpen ? 'text-black' : 'text-primary'
        } hover:text-black hover:bg-text-hover text-[0.8rem]`}
        onClick={handleClick}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {open && <span className="ml-2">{label}</span>}
        {hasChildren && open && (
          <span className="ml-auto">
            {isOpen ? (
              <FaAngleUp className="w-3.5 h-3.5" />
            ) : (
              <FaAngleDown className="w-3.5 h-3.5" />
            )}
          </span>
        )}
      </li>

      {open && hasChildren && (
        <ul
          ref={contentRef}
          className="pl-10 overflow-hidden"
          style={{ height: isOpen ? 'auto' : 0 }}
        >
          {children}
        </ul>
      )}
    </>
  );
};

export default SidebarItem;
