import React from "react";

const Input = ({
  label = "Type here...",
  type = "text",
  name,
  id,
  placeholder = " ",
  className = "",
  ...rest // <-- Accept all other props, including from register(...)
}) => {
  return (
    <div className={`w-full max-w-full sm:max-w-sm min-w-[200px] ${className}`}>
      <div className="relative">
        <input
          type={type}
          inputMode={type}
          name={name}
          id={id || name}
          placeholder={placeholder}
          className="peer w-full bg-transparent 
            placeholder:text-slate-400 dark:placeholder:text-slate-500 
            text-slate-700 dark:text-slate-100 
            text-sm sm:text-base border border-slate-200 dark:border-slate-600 
            rounded-md px-3 py-2 sm:py-2.5 transition duration-300 ease 
            focus:outline-none 
            focus:border-slate-400 dark:focus:border-slate-300 
            hover:border-slate-300 dark:hover:border-slate-500 
            shadow-sm focus:shadow dark:focus:shadow-md"
          {...rest} // <-- Spread all props here (including register output)
        />
        <label
          htmlFor={id || name}
          className="absolute cursor-text 
            bg-white dark:bg-gray-800 px-1 /* <-- Updated this from dark:bg-gray-900 to match form */
            left-2.5 top-2.5 
            text-slate-400 dark:text-slate-500 
            text-xs sm:text-sm transition-all transform origin-left 
            peer-placeholder-shown:top-2.5 
            peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm 
            peer-placeholder-shown:text-slate-400 dark:peer-placeholder-shown:text-slate-500 
            peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-90 
            peer-focus:text-slate-400 dark:peer-focus:text-slate-300
            peer-[:not(:placeholder-shown)]:-top-2
            peer-[:not(:placeholder-shown)]:text-xs
            peer-[:not(:placeholder-shown)]:text-slate-400
            dark:peer-[:not(:placeholder-shown)]:text-slate-300
            peer-[:not(:placeholder-shown)]:scale-90"
        >
          {label}
        </label>
      </div>
    </div>
  );
};

export default Input;