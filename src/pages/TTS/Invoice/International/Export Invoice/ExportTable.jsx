import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const ExportTable = ({
  headers = [],
  data = [],
  itemsPerPage = 20,
  renderAction = null,
  rowClassName = () => "",
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const rowsRef = useRef([]);
  const paginationRef = useRef([]);
  const tableRef = useRef(null);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data?.slice(startIndex, endIndex);

  const handleNext = () => {
    if (endIndex < data?.length) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const animateRows = () => {
    const element = rowsRef.current.filter(Boolean);
    if (element.length > 0) {
      gsap.fromTo(
        element,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 }
      );
    }
  };

  const animatePagination = () => {
    if (paginationRef.current) {
      gsap.fromTo(
        paginationRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3 }
      );
    }
  };

  useEffect(() => {
    if (tableRef.current) tableRef.current.scrollTop = 0;
    animateRows();
    animatePagination();
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    animateRows();
  }, [data]);

  return (
    <div
      ref={tableRef}
      className="w-full h-[38rem] flex flex-col justify-between rounded-xs  bg-background overflow-y-auto custom-scrollbar text-primary dark:bg-gray-900 dark:text-gray-100 "
    >
      <table className="w-full table-fixed text-center">
        <thead>
          <tr>
            {headers.map((heading, index) => (
              <th
                key={index}
                className="py-4 px-3 text-center text-[13px] sticky top-0 bg-background z-10 text-black dark:bg-gray-500 "
              >
                {heading.label}
              </th>
            ))}
            {renderAction && (
              <th className="py-1 px-3 text-center sticky top-0 bg-background z-10 text-black dark:bg-gray-500 ">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {paginatedData.map((row, rowIndex) => {
            const isEven = rowIndex % 2 === 0;
            const baseBg = isEven
              ? "bg-white dark:bg-gray-800"
              : "bg-slate-200 dark:bg-gray-700";

            return (
              <tr
                key={rowIndex}
                ref={(el) => (rowsRef.current[rowIndex] = el)}
                className={`text-xs ${baseBg} ${rowClassName(row, rowIndex)}`}
              >
                {headers.map((heading, colIndex) => (
                  <td key={colIndex} className="py-2 px-3">
                    {row[heading.key] ?? "-"}
                  </td>
                ))}
                {renderAction && (
                  <td className="py-2 px-3">{renderAction(row, rowIndex)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div
        ref={paginationRef}
        className="w-full flex flex-col md:flex-row justify-between items-center px-5 bg-gray-200 dark:bg-gray-800 sticky bottom-0"
      >
        <span className="text-sm text-gray-700 dark:text-gray-300">
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
            className={`h-8 px-4 text-base font-medium text-white ${
              currentPage === 1
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-900 dark:bg-gray-500"
            } rounded-s`}
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={endIndex >= data.length}
            className={`h-8 px-4 text-base font-medium text-gray-300 ${
              endIndex >= data.length
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-900 dark:bg-gray-700"
            } rounded-e`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportTable;
