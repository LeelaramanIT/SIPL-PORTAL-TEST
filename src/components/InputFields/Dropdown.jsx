import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function Dropdown({ label = "All", items = [], onSelect }) {
const [isOpen, setIsOpen] = useState(false);
const [selected, setSelected] = useState(label);
const dropdownRef = useRef();

const toggleDropdown = () => setIsOpen((prev) => !prev);

useEffect(() => {
const handleClickOutside = (event) => {
if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
setIsOpen(false);
}
};
document.addEventListener("mousedown", handleClickOutside);
return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

const handleSelect = (item) => {
setSelected(item.label);
onSelect?.(item);
setIsOpen(false);
};

return (
<div className="flex relative min-w-[10%] bg-[var(--primary)] dark:bg-gray-600 rounded-md text-[var(--text)]" ref={dropdownRef} >
<button onClick={toggleDropdown} className="w-full bg-transparent text-white dark:text-gray-300 text-xs sm:text-sm border border-slate-200 dark:border-gray-500 rounded-md pl-2 sm:pl-3 pr-1 sm:pr-2 py-1.5 sm:py-2 transition duration-300 ease-in-out focus:outline-none focus:border-slate-400 dark:focus:border-gray-400 hover:border-slate-300 dark:hover:border-gray-400 shadow-sm focus:shadow flex justify-between items-center" >
{selected}
<ChevronDown
className={`w-3 h-3 sm:w-4 sm:h-4 text-[var(--text)] transition-transform ${ isOpen ? "rotate-180" : "rotate-0" } text-slate-500 dark:text-gray-300`}
/>
</button>
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full mt-1 left-0 min-w-[10rem] sm:min-w-[12rem] bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-md shadow-sm z-50"
      >
        <div className="py-1 max-h-48 sm:max-h-60 overflow-y-auto">
          {items?.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {item.label}
            </button>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
);
}