import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ExportTable from "./ExportTable";
import SearchBar from "../../../../../components/SearchBar";
import Dropdown from "../../../../../components/InputFields/DropDown";
import gsap from "gsap";
import DatePickerComponent from "../../../../../components/DatePicker/DatePicker";
import TitleText from "../../../../..//components/TitleText";
import { useDispatch, useSelector } from "react-redux";
import {
  getExportInvoice,
  getExportInvoiceAll,
} from "../../../../../Redux/Slices/InvoiceSlice";
import Button from "../../../../../components/InputFields/Button";
import TableSkeleton from "./TableSkeleton";

const ExportInvoice = () => {
  const navigate = useNavigate();
  const {state} = useLocation()
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("all");
  const [startDate, setStartDate] = useState(new Date());

  const dispatch = useDispatch();

  const animateRef = useRef([]);

  const loading = useSelector((state) => state.invoice.exportInvoices.loading);

  useEffect(() => {
    gsap.fromTo(
      animateRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
  }, []);

  useEffect(() => {
    dispatch(getExportInvoiceAll());
  }, [dispatch]);

  const headers = [
    { label: "Customer", key: "custfullname" },
    { label: "Order Ref No", key: "orderRefNo" },
    { label: "Work Order", key: "workorderno" },
    { label: "Order Date", key: "completedDate" },
    { label: "Dispatched Date", key: "dispatchedDate" },
    { label: "RFD Date", key: "rfD_Date" },
    { label: "Shipment Type", key: "shipmentType" },
    { label: "Final Loading At", key: "containerLoadFrom" },
    { label: "Qty", key: "totalqty" },
    { label: "FWT", key: "totalwt" },
  ];

  const handleDropdownSelect = (item) => {
    setSelectedColumn(item.key || "all");
  };

  const tableData = useSelector((state) => state.invoice.exportInvoices.listOFInvoices);

  // console.log(tableData);
  


  // const tableData = useMemo(() => generateTableData(50), []);

  const filteredData = useMemo(() => {
    if (
      ["completedDate", "dispatchedDate", "rfD_Date"].includes(selectedColumn)
    ) {
      // if (!searchQuery.trim()) return tableData;
      return tableData.filter((row) => {
        const rowDate = new Date(row[selectedColumn]).toDateString();
        const selected = new Date(startDate).toDateString();
        return rowDate === selected;
      });
    }

    if (!searchQuery.trim()) return tableData;

    return tableData.filter((row) => {
      if (selectedColumn === "all") {
        return Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      const value = row[selectedColumn];
      return (
        value &&
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, tableData, selectedColumn, startDate]);


  const handleDateChange = (date) => {
    setStartDate(date);
  };

  const highlightMatch = (text, query) => {
    
    if (!query || typeof text !== "string" && typeof text !== "number") return text;
  
    // Escape special regex characters in the query string
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    const parts = String(text).split(regex);
  
    return parts.map((part, i) =>
      part.toString().toLowerCase().trim() === query.toString().toLowerCase().trim() ? (
        <span key={i} className="bg-[var(--color-primary-hover)] text-[var(--color-text)] font-semibold rounded px-1">
          {part}
        </span>
      ) : (
        part
      )
    );
  };
  
  

  return (
    <div className="px-6 pt-4 max-w-full mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-2">
        Export {state.type} Invoice
      </h1>

      <div className="bg-[#F4F4FE] shadow-md px-2 py-4 rounded-lg border border-[var(--color-secondary)] dark:border-gray-700 dark:bg-gray-900" >
        <div
          ref={animateRef}
          className="w-full py-1 px-2.5 rounded-2xl text-[var(--color-text)]"
        >
          <div className="flex flex-col md:flex-row w-full py-1 px-1 items-center gap-4 justify-between mb-4">
            <div className="w-[80%] flex justify-start items-center">
              <Dropdown
                label="Filter"
                items={[{ label: "All", key: "all" }, ...headers]} // Include "All" option
                onSelect={handleDropdownSelect}
              />
              {!["completedDate", "dispatchedDate", "rfD_Date"].includes(
                selectedColumn
              ) ? (
                <SearchBar
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onSearch={() => { }}
                />
              ) : (
                <DatePickerComponent
                  startDate={startDate}
                  handleDateChange={handleDateChange}
                />
              )}
            </div>

            <Button
              onClick={() => navigate("/Masters/UserMaster/UserCreate")}
              text={"+ Add Invoice"}
              className={
                "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text)]"
              }
            />
          </div>

          <div className="w-full h-[31.5rem] rounded-sm bg-[var(--color-background)] overflow-auto gap-5 flex flex-col">
            {loading ? (
              <TableSkeleton />
            ) : (
              <ExportTable
                headers={headers}
                data={filteredData}
                searchQuery={searchQuery}
                highlightMatch={highlightMatch}
                rowClassName={(row, index) => {
                  if (index === 0) return "rounded-l-xl";
                  if (index === row.length - 1) return "rounded-r-xl";
                  return "";
                }}
                renderAction={(row, index) => (
                  <button
                  
                    // onClick={() => handleAction(row)}
                    onClick={() => {
                      if(state.type === 'Customer'){
                        navigate(
                          "/TTS/International/Invoice/CustomerInvoice/Prepare",{
                            state:state
                          }
                        );
                        dispatch(getExportInvoice(row, index));
                      }
                      if(state.type === 'Custom'){
                        navigate(
                          "/TTS/International/Invoice/CustomInvoice/Prepare",{
                            state:state
                          }
                        );
                        dispatch(getExportInvoice(row, index));
                      }
                    }}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text)] px-4 py-1 rounded text-center"
                  >
                    Action
                  </button>
                )}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportInvoice;
