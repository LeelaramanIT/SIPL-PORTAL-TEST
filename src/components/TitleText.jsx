import React from 'react';

const TitleText = ({ title, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <h1 className="text-[var(--color-primary)] dark:text-white text-lg font-semibold bg-[var(--color-thered)] dark:bg-gray-700 px-3 py-2 rounded-md shadow-md">
        {title}
      </h1>
    </div>
  );
};

export default TitleText;
