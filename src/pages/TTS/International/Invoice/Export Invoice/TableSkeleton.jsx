import React from 'react'
const TableSkeleton = () => {
    const rows = Array.from({ length: 11 }); // Number of skeleton rows
    const columns = Array.from({ length: 11 }); // Adjust based on expected column count
  
    return (
      <div className="w-full h-[38rem] flex flex-col justify-between rounded-xs bg-[var(--color-background)] overflow-y-auto custom-scrollbar text-[var(--color-text)]">
        <table className="w-full table-fixed text-center">
          <thead>
            <tr>
              {columns.map((_, index) => (
                <th
                  key={index}
                  className="py-4 px-3 text-center text-[13px] sticky top-0 bg-[var(--color-background)] z-10 text-[var(--color-text)]"
                >
                  <div className="h-5 min-h-[20px] bg-[var(--color-secondary)] rounded w-3/4 mx-auto animate-pulse"></div>
                </th>
              ))}
              <th className="py-4 px-3 text-center sticky top-0 bg-[var(--color-background)] z-10 text-[var(--color-text)]">
              <div className="h-5 min-h-[20px] bg-[var(--color-secondary)] rounded animate-pulse"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className={`text-xs ${
                  rowIndex % 2 === 0
                    ? "bg-[var(--color-background)]"
                    : "bg-[var(--color-secondary)]"
                }`}
              >
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="py-4 px-3">
                    <div className="h-4 bg-[var(--color-secondary)] rounded animate-pulse"></div>
                  </td>
                ))}
                <td className="py-2 px-3">
                <div className="h-5 min-h-[20px] w-12 bg-[var(--color-secondary)] rounded mx-auto animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Pagination Skeleton */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center px-5 bg-[var(--color-secondary)] sticky bottom-0 py-3">
          <div className="h-4 w-48 bg-[var(--color-background)] rounded animate-pulse mb-2 md:mb-0"></div>
          <div className="inline-flex gap-2">
            <div className="h-8 w-16 bg-[var(--color-background)] rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-[var(--color-background)] rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default TableSkeleton;
  