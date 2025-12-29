import React from "react";
import { FaAngleDown } from "react-icons/fa6";

const ModernSelect = ({ label, children, className = "w-40", ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          {...props}
          className="
            w-full appearance-none 
            text-sm font-medium 
            py-2.5 pl-4 pr-10 
            rounded-xl shadow-sm 
            transition-all cursor-pointer
            focus:outline-none focus:ring-2 
            
            /* Light Mode Select Body */
            bg-white 
            text-slate-700
            border border-slate-200 
            hover:border-slate-300 
            focus:ring-blue-500/20 
            focus:border-blue-500

            /* Dark Mode Select Body */
            dark:bg-slate-900 
            dark:text-slate-200
            dark:border-slate-700 
            dark:hover:border-slate-600
            dark:focus:ring-blue-500/40
            dark:focus:border-blue-500

            /* FIX FOR OPTIONS: 
              These lines force the dropdown list to respect the theme.
            */
            [&>option]:bg-white 
            [&>option]:text-slate-700
            dark:[&>option]:bg-slate-900 
            dark:[&>option]:text-slate-200
          "
        >
          {children}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-500">
          <FaAngleDown className="h-4 w-4 fill-current" />
        </div>
      </div>
    </div>
  );
};

export default ModernSelect;