import React, { useState } from 'react';

const ToggleButton = ({ onClick }) => {
  const [isChecked, setIsChecked] = useState(true); // Initial state, true or false based on need

  const handleToggle = () => {
    setIsChecked(!isChecked); // Toggle the state
    onClick(); // Call parent onClick if necessary
  };

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked} // Dynamically control checked state
        onChange={handleToggle} // Handle toggle change
        className="sr-only peer"
      />
      <div className="relative w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-1 peer-focus:ring-lightblue-300 dark:peer-focus:ring-lightblue-600 dark:bg-gray-500 peer-checked:bg-lightgreen-400 dark:peer-checked:bg-lightgreen-600">
        <div
          className={`after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
            isChecked ? 'after:translate-x-full' : ''
          }`}
        ></div>
      </div>    
    </label>
  );
};

export default ToggleButton;
