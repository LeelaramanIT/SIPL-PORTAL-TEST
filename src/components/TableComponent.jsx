import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { highlightMatch } from "../utils/highlightMatch";

const TableComponent = ({ headers, data, className, renderCell, highlightQuery = '' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  console.log(highlightQuery);
  

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data?.slice(startIndex, endIndex);

  const rowsRef = useRef([]);

  useEffect(() => {
    const validRows = rowsRef.current.filter(Boolean); // filter out nulls
    if (validRows.length) {
      gsap.fromTo(
        validRows,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.05,
        }
      );
    }
  }, [currentPage, paginatedData]);
  

  const handleNext = () => {
    if (endIndex < data.length) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  return (
    <div className={`${className} overflow-x-auto`}>
      <div className="min-w-full">
        <table className="w-full table-fixed min-w-[600px]">
          <thead className="bg-gray-200 text-black dark:bg-gray-800 dark:text-white sticky top-0 z-10">
            <tr>
              {headers?.map((heading, index) => (
                <th
                  key={index}
                  className={`py-2 px-2 sm:px-4 text-left text-xs sm:text-sm ${
                    heading === "Status" || heading === "View" ? "w-20 sm:w-28" : ""
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData?.map((row, rowIndex) => (
              <tr
                ref={(el) => (rowsRef.current[rowIndex] = el)}
                key={rowIndex}
                className={`text-xs sm:text-sm ${
                  rowIndex % 2 === 0
                    ? "bg-white dark:bg-gray-700"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {headers?.map((header, colIndex) => {
                  const key = header.toLowerCase().replace(/\s/g, "");
                  const isStatus = header === "Status";
                  const isActive = row[key] === "Active";
                  const value = String(row[key] ?? "-");
                  return (
                    <td
                      key={colIndex}
                      className={`py-2 px-2 sm:px-4 ${
                        renderCell
                          ? "dark:text-white"
                          : isStatus
                          ? isActive
                            ? "text-green-500 dark:text-green-300"
                            : "text-red-500 dark:text-red-300"
                          : "dark:text-white"
                      }`}
                    >
                      {renderCell
                        ? renderCell({
                            row,
                            header,
                            data,
                            rowIndex,
                            colIndex,
                            defaultValue: value,
                          })
                        : highlightMatch(value, highlightQuery)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center px-2 sm:px-5 bg-gray-200 dark:bg-gray-800 text-black dark:text-white sticky bottom-0 py-2 gap-2 sm:gap-0">
        <span className="text-xs sm:text-sm text-center sm:text-left">
          Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
          <span className="font-semibold">
            {Math.min(endIndex, data.length)}
          </span>{" "}
          of <span className="font-semibold">{data.length}</span> Entries
        </span>

        <div className="inline-flex px-2 gap-1">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`flex items-center justify-center p-1 text-xs sm:text-base font-medium text-white ${
              currentPage === 1
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-900"
            } rounded-s`}
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={endIndex >= data.length}
            className={`flex items-center justify-center p-1 text-xs sm:text-base font-medium text-white ${
              endIndex >= data.length
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-900"
            } rounded-e`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
