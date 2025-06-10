import React from 'react';

const TitleText = ({ title, className = '', ref }) => {
  return (
    <div className={`w-full ${className}`}>
      <h1 className="text-[#1D293D] dark:text-white text-lg font-semibold bg-[var(--color-secondary)] dark:bg-gray-700 px-3 py-2 rounded-md shadow-sm">
        {title}
      </h1>
    </div>
  );
};

export default TitleText;
