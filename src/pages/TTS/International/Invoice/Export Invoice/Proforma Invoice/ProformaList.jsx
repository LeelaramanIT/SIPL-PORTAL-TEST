import { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import ExportTable from "./ExportTable";
import SearchBar from "../../../../../../components/SearchBar";
import Dropdown from "../../../../../../components/InputFields/DropDown";
import gsap from "gsap";
import DatePickerComponent from "../../../../../../components/DatePicker/DatePicker";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { DynamicDataTable } from "../../../../../../components/DynamicDataTable";
import { getListOfProformaInvoice, resetMaster } from "../../../../../../Redux/Slices/ProformaInvoice/ProformaInvoiceSlice";
import { getCurrencySymble } from "../../../../../../utils/currencies";
import Button from "../../../../../../components/InputFields/Button";

const ProformaList = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("all");
  const [startDate, setStartDate] = useState(new Date());
  const [mode, setMode] = useState('Proforma')

  const dispatch = useDispatch();

  const animateRef = useRef([]);

  useLayoutEffect(() => {
    gsap.fromTo(
      animateRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
  }, []);

  useEffect(() => {
    if (mode === 'Proforma') {
      dispatch(resetMaster())
      dispatch(getListOfProformaInvoice('EXPORT'));
    }
  }, [mode]);

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

  const tableData = useSelector((state) => state.proformaInvoice.listOfProformaInvoice);

  const { menus } = useSelector((state) => state.auth)
  console.log(tableData);


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



  const columns = [
    { header: "Customer", width: '1fr', accessor: "custFullName", align: 'center' },
    { header: "Order Ref No", width: '1fr', accessor: "orderRefNo", align: 'center' },
    { header: "Order Date", width: '1fr', accessor: "completedDate", align: 'center' },
    { header: "Desired Ship Date", width: '1fr', accessor: "desiredShipDate", align: 'center' },
    { header: "Qty", width: '1fr', accessor: "directional", align: 'center' },
    { header: "Total Weight", width: '1fr', accessor: "orderTotalWt", align: 'center' },
    {
      header: "Total Value",
      width: "1fr",
      accessor: "orderTotalValue",
      align: "center",
      render: (val, row) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {getCurrencySymble(row?.userCurrency)} {val || 0}
        </span>
      )
    },
    {
      header: "user Currency", width: '1fr', accessor: "userCurrency", align: 'center',
      render: (val) => <span className="font-bold text-blue-600 dark:text-blue-400">{val || 0}</span>
    },
    {
      header: "Open",
      width: "1fr",
      accessor: "orderTotalValue",
      align: "center",
      render: (val, row) => (
        <Button
        text="Open"
          className="bg-[var(--primary)] text-[var(--text)"
          onClick={() => navigate(`/TTS/International/Invoice/ProformaInvoice/Prepare`, {
            state: {
              data: row
            }
          })}
        >
        </Button>
      )
    }
  ];

  return (
    <div className="px-2 pt-3 max-w-full h-[calc(100vh-62px)] mx-auto flex flex-col ">
      <div className="bg-white pb-1 rounded-t-md">
        <h1 className="ml-2 text-xl font-bold  tracking-tight">
          {/* {invoiceDetails?.type} Invoice Details */}
          Proforma Invoice
        </h1>
        <p className="ml-2 text-sm text-slate-500 mt-1">
          View and Manage all Proforma Invoices
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

          </div>

          <div className="w-full rounded-sm bg-[var(--background)] gap-5 flex flex-col flex-grow overflow-hidden">
            <DynamicDataTable columns={columns} data={filteredData} headerClassName='bg-[var(--primary)]/60 text-[var(--text-color)] text-[10px] uppercase font-bold' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProformaList;
