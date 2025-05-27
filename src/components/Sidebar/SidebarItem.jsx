import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSection } from '../../Redux/Slices/GlobalSlice';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

const SidebarItem = ({ icon: Icon, label, sectionKey, children }) => {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.global.open);

  const key = sectionKey || label.replace(/\s+/g, '').toLowerCase(); // Fallback
  const isOpen = useSelector((state) => state.global.sections[key] || false);
  const hasChildren = !!children;

  const contentRef = useRef(null);

  const handleClick = () => {
    if (hasChildren && open) {
      dispatch(toggleSection(key));
    }
  };

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      if (isOpen) {
        gsap.to(el, {
          height: el.scrollHeight,
          opacity: 1,
          duration: 0.3,
          ease: 'power1.out',
          onComplete: () => {
            el.style.height = 'auto';
          },
        });
      } else {
        gsap.to(el, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power1.in',
        });
      }
    }
  }, [isOpen]);

  return (
    <>
      <li
        className={`w-full h-12 flex items-center px-4 ${
          open ? '' : 'justify-center'
        } cursor-pointer
        ${isOpen ? 'text-black dark:text-white' : 'text-primary dark:text-white'}
        hover:text-black dark:hover:text-white hover:bg-text-hover dark:hover:bg-gray-700
        text-[0.8rem]`}
        onClick={handleClick}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {open && <span className="ml-2">{label}</span>}
        {hasChildren && open && (
          <span className="ml-auto">
            {isOpen ? (
              <FaAngleUp className="w-3.5 h-3.5 text-black dark:text-white" />
            ) : (
              <FaAngleDown className="w-3.5 h-3.5 text-primary dark:text-white" />
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
