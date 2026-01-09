import React, { useState, useEffect } from "react";

export default function ToggleSwitchWord({
  options = ["Export", "Domestic"],
  defaultValue = "Export",
  onChange = () => {},
  color = "bg-blue-500",
}) {
  const [selected, setSelected] = useState(defaultValue);
  const [activeIndex, setActiveIndex] = useState(
    options.indexOf(defaultValue) || 0
  );

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  const handleSelect = (option, index) => {
    setSelected(option);
    setActiveIndex(index);
  };

  const slideWidth = 100 / options.length; // Dynamic width based on number of options

  return (
    <div className="relative flex items-center bg-[var(--input)] rounded-full shadow-md border-[var(--hadow-card)] p-0.5 w-fit min-w-[220px]">
      {/* Sliding highlight */}
      <div
        className={`absolute top-1 bottom-1 left-1 rounded-full ${color} transition-all duration-300`}
        style={{
          width: `calc(${slideWidth}% - 8px)`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      ></div>

      {options.map((option, index) => (
        <button
          key={option}
          className={`flex-1 z-10 text-center font-semibold py-1 px-4 rounded-full transition-colors duration-300 ${
            selected === option ? "text-white" : "text-gray-500"
          }`}
          onClick={() => handleSelect(option, index)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
