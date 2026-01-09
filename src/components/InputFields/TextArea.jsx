import React from "react";

const TextArea = ({
  label = "Type here...",
  name,
  id,
  placeholder = "Enter text...",
  className = "",
  rows = 4,
  icon: Icon, // Added Icon prop
  required = false,
  ...rest
}) => {
  return (
    <div className={`w-full max-w-full sm:max-w-2xl min-w-[200px] ${className}`}>
      <div className="relative">
        <label
          htmlFor={id || name}
          /* Added flex and items-center to align icon with text */
          className="absolute -top-2 left-2 sm:left-2.5 bg-white dark:bg-gray-900 px-1 
            text-xs text-slate-500 dark:text-slate-300 z-10 flex items-center gap-1"
        >
          {label}
          {Icon && <Icon className="text-slate-400" size={12} />}
          {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          name={name}
          id={id || name}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-transparent
            text-slate-700 dark:text-slate-100
            text-sm sm:text-base border border-slate-200 dark:border-slate-600
            rounded-md px-2 sm:px-3 pt-4 sm:pt-5 pb-2 transition duration-300 ease
            focus:outline-none
            focus:border-slate-400 dark:focus:border-slate-300
            hover:border-slate-300 dark:hover:border-slate-500
            shadow-sm focus:shadow dark:focus:shadow-md
            resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          {...rest}
        />
      </div>
    </div>
  );
};

export default TextArea;