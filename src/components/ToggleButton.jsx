import React, { useState } from 'react';

const ToggleButton = ({ onClick,isChecked,setIsChecked }) => {
  
  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    if (onClick) onClick(newValue);
  };

  return (
    <div onClick={handleToggle} className="inline-flex items-center cursor-pointer">
      <div
        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${
          isChecked ? 'bg-green-500' : 'bg-red-500'
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isChecked ? 'translate-x-5' : ''
          }`}
        />
      </div>
    </div>
  );
};

export default ToggleButton;
