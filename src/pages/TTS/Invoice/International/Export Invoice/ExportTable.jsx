import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getExportInvoice } from "../../../../../Redux/Slices/InvoiceSlice";



const ExportTable = ({ headers, data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate()
  const dispatch = useDispatch()


  const itemsPerPage = 20;

  const rowsRef = useRef([]);
  const paginationRef = useRef([]);
  const tableRef = useRef(null); // Reference to the table container

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

  const animateRows = () => {
    const element = rowsRef.current.filter(Boolean);
    if (element.length > 0) {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.05,
        }
      );
    }
  };

  // Animation for pagination controls
  const animatePagination = () => {
    if (paginationRef.current) {
      gsap.fromTo(
        paginationRef.current,
        {
          opacity: 0,
          y: 10,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
        }
      );
    }
  };

  useEffect(() => {
    // Scroll the table to the top when the page changes
    if (tableRef.current) {
      tableRef.current.scrollTop = 0; // This scrolls the table to the top
    }
    animateRows();
    animatePagination();
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    animateRows();
  }, [data]);


  return (
    <div
      ref={tableRef} // Add ref to the table container
      className="w-full h-[35.5rem] flex flex-col justify-between rounded-sm bg-background overflow-y-auto custom-scrollbar text-primary"
    >
      <table className="w-full table-fixed">
        <thead>
          <tr>
            {headers?.map((heading, index) => (
              <th
                key={index}
                className="py-1 px-3 text-left text-[14px] sticky top-0 bg-background z-10 text-black"
              >
                {heading.label}
              </th>
            ))}
            <th className="py-1 px-3 text-left sticky top-0 bg-background z-10 text-black">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {paginatedData?.map((row, rowIndex) => (
            <tr
              ref={(el) => (rowsRef.current[rowIndex] = el)}
              key={rowIndex}
              className={`text-xs ${
                rowIndex % 2 === 0 ? "bg-white" : "bg-slate-200"
              }`}
            >
              {headers?.map((heading, colIndex) => (
                <td key={colIndex} className="py-2 px-3">
                  {row[heading.key] || "-"}
                </td>
              ))}
              <td className="py-4 px-3">
                {/* Button for each row */}
                <button
                  onClick={() => {navigate('Prepare');dispatch(getExportInvoice(row))}}// Replace this with your function
                  className="bg-slate-800 hover:bg-slate-600 text-white px-4 py-1 rounded"
                >
                  Action
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div
        ref={paginationRef}
        className="w-full flex flex-col md:flex-row justify-between items-center px-5 bg-gray-200 sticky bottom-0"
      >
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

export default ExportTable;
