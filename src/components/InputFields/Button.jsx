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
      className={`flex items-center justify-center gap-1 sm:gap-2 bg-[var(--color-primary)] ${className} text-white py-2 sm:py-1.5 px-3 sm:px-5 rounded-md hover:bg-[var(--color-primary-hover)] dark:bg-gray-700 dark:hover:bg-gray-600 transition duration-300 w-full sm:w-auto text-sm sm:text-base`}
    >
      {icon && <span className="text-sm sm:text-base">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;
