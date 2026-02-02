import { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
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
  resetExportInvoiceDetails,
} from "../../../../../Redux/Slices/InvoiceSlice";
import Button from "../../../../../components/InputFields/Button";
import TableSkeleton from "./TableSkeleton";
import { generateTableData } from "../../../../../utils/DummyJSON";
import { highlightMatch } from "../../../../../utils/highlightMatch";
import ToggleSwitchWord from "../../../../../components/WordToggleButton";
import toast from "react-hot-toast";

const ExportInvoice = () => {
  const navigate = useNavigate();
  const { state } = useLocation()
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("all");
  const [startDate, setStartDate] = useState(new Date());

  const dispatch = useDispatch();

  const animateRef = useRef([]);

  const loading = useSelector((state) => state.invoice.exportInvoices.loading);

  useLayoutEffect(() => {
    gsap.fromTo(
      animateRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
  }, []);

  useEffect(() => {
    if (state) {
    dispatch(resetExportInvoiceDetails())
    dispatch(getExportInvoiceAll(state));
    }
  }, [state]);

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

  const {menus} = useSelector((state)=> state.auth)

  // const tableData = useMemo(() => generateTableData(5), []);

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

const handleToggle = (value) => {
  console.log("Selected:", value);

  // Example user menu permissions (replace with actual data)
  const userMenus = [
    { MenuName: "ExportCustomerInvoicePrepare", MenuUrl: "TTS/International/Invoice/CustomInvoice" },
    { MenuName: "ExportCustomInvoicePrepare", MenuUrl: "TTS/International/Invoice/CustomInvoice" },
  ];

  // Map toggle options to the required MenuName
  const menuMap = {
    Customer: "ExportCustomerInvoicePrepare",
    Custom: "ExportCustomInvoicePrepare",
  };

  const requiredMenu = menuMap[value];
  const hasAccess = userMenus.some((menu) => menu.MenuName === requiredMenu);

  if (!hasAccess) {
    toast.error(`You don’t have access to ${value} invoices.`);
    return; // ⛔ stop navigation
  }

  // ✅ If access is allowed → navigate
  const type = value === "Custom" ? "Custom" : "Customer";
  navigate("/TTS/International/Invoice/CustomInvoice", { state: { type } });
};

  return (
    <div className="px-2 pt-3 max-w-full h-[calc(100vh-62px)] mx-auto flex flex-col ">
      <div className="bg-white pb-1 rounded-t-md">
          <h1 className="ml-2 text-xl font-bold  tracking-tight">
            {/* {invoiceDetails?.type} Invoice Details */}
             Export {state?.type} Invoice
          </h1>
          <p className="ml-2 text-sm text-slate-500 mt-1">
            View and Manage all Export {state?.type} Invoices
          </p>
        </div>

      <div className="bg-white shadow-md px-2 py-2 rounded-b-lg border border-[var(--secondary)] dark:border-gray-700 dark:bg-gray-900 flex flex-col flex-grow" >
        <div
          ref={animateRef}
          className="w-full py-1 px-2.5 rounded-2xl text-[var(--text)] flex flex-col h-full"
        >
          <div className="flex flex-col md:flex-row w-full py-1 px-0.5 items-center gap-4 justify-between mb-2">
            <div className="w-[80%] flex justify-start items-center">
              <Dropdown
                label="Filter"
                items={[{ label: "All", key: "all" }, ...headers]} // Include "All" option
                onSelect={handleDropdownSelect}
              />
              {!["completedDate", "dispatchedDate", "rfD_Date"].includes(
                selectedColumn
              ) ? (<div className="">
                <SearchBar
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onSearch={() => { }}
                />
                </div>
              ) : (
                <DatePickerComponent
                  startDate={startDate}
                  handleDateChange={handleDateChange}
                />
              )}
            </div>

            <ToggleSwitchWord options={["Custom","Customer"]}
              defaultValue={state?.type}
              color="bg-[var(--primary)]"
              onChange={handleToggle}
            />
          </div>

          <div className="w-full rounded-sm bg-[var(--background)] gap-5 flex flex-col flex-grow overflow-hidden">
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
                      if (state.type === 'Customer') {
                        navigate(
                          "/TTS/International/Invoice/CustomerInvoice/Prepare", {
                          state: state
                        }
                        );
                        dispatch(getExportInvoice({ ...row, ...state }));
                      }
                      if (state.type === 'Custom') {
                        navigate(
                          "/TTS/International/Invoice/CustomInvoice/Prepare", {
                          state: state
                        }
                        );
                        dispatch(getExportInvoice({ ...row, ...state }));
                      }
                    }}
                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text)] px-4 py-1 rounded text-center"
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
