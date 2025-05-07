import React, { useState } from "react";

const TableComponent = ({ headers, data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Calculate paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // Pagination handlers
  const handleNext = () => {
    if (endIndex < data.length) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="w-full h-[35.5rem] flex flex-col justify-between rounded-sm bg-background overflow-y-auto">
      <table className="w-full table-fixed">
        <thead className="text-black bg-gray-200 sticky top-0 z-10">
          <tr>
            {headers.map((heading, index) => (
              <th key={index} className="py-2 px-4 text-left">
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {paginatedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`text-sm ${
                rowIndex % 2 === 0 ? "bg-slate-100" : "bg-white"
              }`}
            >
              {headers.map((header, colIndex) => (
                <td
                  key={colIndex}
                  className={`py-2 px-4 ${
                    header === "Status"
                      ? row[header.toLowerCase()] === "Active"
                        ? "text-green-500"
                        : "text-red-500"
                      : ""
                  }`}
                >
                  {row[header.toLowerCase().replace(/\s/g, "")] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center px-5 bg-gray-200 sticky bottom-0">
        <span className="text-sm text-gray-700">
          Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
          <span className="font-semibold">
            {Math.min(endIndex, data.length)}
          </span>{" "}
          of <span className="font-semibold">{data.length}</span> Entries
        </span>

        <div className="inline-flex p-2 gap-1">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`flex items-center justify-center p-2 text-base font-medium text-white ${
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
            className={`flex items-center justify-center p-2 text-base font-medium text-white ${
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
