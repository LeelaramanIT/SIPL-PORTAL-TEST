import React from "react";
import { ChevronDownIcon } from "lucide-react"; // You can replace this with your icon

const Select = ({
  label = "Choose an option",
  name,
  id,
  className = "",
  children,
  placeholder = " ",
  ...rest
}) => {
  return (
    <div className={`w-full max-w-sm min-w-[200px] ${className}`}>
      <div className="relative">
        <select
          name={name}
          id={id || name}
          defaultValue=""
          className="peer w-full bg-transparent
            text-slate-700 dark:text-slate-100
            text-sm border border-slate-200 dark:border-slate-600
            rounded-md px-3 py-2 pr-10 transition duration-300 ease
            focus:outline-none 
            focus:border-slate-400 dark:focus:border-slate-300
            hover:border-slate-300 dark:hover:border-slate-500
            shadow-sm focus:shadow dark:focus:shadow-md
            appearance-none" // removes default native arrow
          {...rest}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {children}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon className="w-4 h-4 text-slate-400" />
        </div>

        <label
          htmlFor={id || name}
          className="absolute cursor-text
            bg-white dark:bg-gray-900 px-1
            left-2.5 top-2.5
            text-slate-400 dark:text-slate-500
            text-sm transition-all transform origin-left
            peer-placeholder-shown:top-2.5
            peer-placeholder-shown:text-sm
            peer-placeholder-shown:text-slate-400 dark:peer-placeholder-shown:text-slate-500
            peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-90
            peer-focus:text-slate-400 dark:peer-focus:text-slate-300
            peer-[:not([value=''])]:-top-3 
            peer-[:not([value=''])]:text-
            peer-[:not([value=''])]:text-slate-400
            dark:peer-[:not([value=''])]:text-slate-300
            peer-[:not([value=''])]:scale-90"
        >
          {label}
        </label>
      </div>
    </div>
  );
};

export default Select;
