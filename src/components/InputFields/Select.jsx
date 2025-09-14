import React from "react";
import { ChevronDownIcon } from "lucide-react";

const Select = ({
  label = "Choose an option",
  name,
  id,
  icon = null,
  className = "",
  children,
  placeholder = " ",
  ...rest
}) => {
  return (
    <div className={`w-full max-w-full sm:max-w-sm min-w-[200px] ${className}`}>
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}

        <select
          name={name}
          id={id || name}
          defaultValue=""
          className={`peer w-full bg-white dark:bg-gray-800
            text-gray-900 dark:text-white text-sm sm:text-base
            border border-gray-300 dark:border-gray-600
            rounded-md px-2 sm:px-3 ${icon ? "pl-8 sm:pl-10" : ""} py-2 sm:py-2.5 pr-8 sm:pr-10
            transition duration-300 ease
            focus:outline-none 
            focus:border-[var(--color-background)] dark:focus:border-blue-400
            hover:border-gray-400 dark:hover:border-gray-500
            shadow-sm focus:shadow dark:focus:shadow-md
            appearance-none`}
          {...rest}
        >
          <option className="" value="" disabled hidden>
            {placeholder}
          </option>
          {children}
        </select>

        {/* Right Chevron Icon */}
        <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-200" />
        </div>

        {/* Floating Label */}
        <label
          htmlFor={id || name}
          className="absolute cursor-text
            bg-white dark:bg-gray-800 px-1
            left-2 sm:left-2.5 top-2.5
            text-gray-600 dark:text-gray-300
            text-xs sm:text-sm transition-all transform origin-left
            peer-placeholder-shown:top-2.5
            peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm
            peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-500
            peer-focus:-top-2 peer-focus:text-xs peer-focus:font-medium peer-focus:scale-90
            peer-focus:text-blue-500 dark:peer-focus:text-blue-400
            peer-[:not([value=''])]:-top-3 
            peer-[:not([value=''])]:text-xs sm:peer-[:not([value=''])]:text-sm
            peer-[:not([value=''])]:text-gray-700 dark:peer-[:not([value=''])]:text-gray-200
            peer-[:not([value=''])]:scale-90"
        >
          {label}
        </label>
      </div>
    </div>
  );
};

export default Select;
