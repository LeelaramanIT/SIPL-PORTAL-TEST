import React from "react";

const Button = ({
  onClick,
  text,
  icon,
  className,
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 bg-slate-800 ${className} text-white py-1.5 px-5 rounded-md hover:bg-slate-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition duration-300 w-full md:w-auto`}
    >
      {icon && <span>{icon}</span>}
      {text}
    </button>
  );
};

export default Button;
