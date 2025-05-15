import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExportTable from "./ExportTable";
import SearchBar from "../../../../../components/SearchBar";
import Dropdown from "../../../../../components/DropDown";
import gsap from "gsap";

const ExportInvoice = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("all");
  const [startDate, setStartDate] = useState(new Date(0));

  const animateRef = useRef([]);

useEffect(() => {
  gsap.fromTo(
    animateRef.current,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5 }
  );
}, []);


  //   const animateRows = () => {
  //   if (animateRef.current.length > 0) {
  //     gsap.fromTo(
  //       animateRef.current,
  //       {
  //         opacity: 0,
  //         y: 20,
  //       },
  //       {
  //         opacity: 1,
  //         y: 0,
  //         duration: 0.3,
  //         stagger: 0.05,
  //       }
  //     );
  //   }
  // };

  const headers = [
    { label: "Customer", key: "customer" },
    { label: "Order Ref No", key: "orderRefNo" },
    { label: "Work Order", key: "workOrder" },
    { label: "Order Date", key: "orderDate" },
    { label: "Customer Dispatched Date", key: "customerDispatchedDate" },
    { label: "PPC RFD Date", key: "ppcRfdDate" },
    { label: "Shipment Type", key: "shipmentType" },
    { label: "Final Loading At", key: "finalLoadingAt" },
    { label: "Qty", key: "qty" },
    { label: "FWT", key: "fwt" },
  ];

  const generateTableData = (num) => {
    const shipmentTypes = ["Air", "Sea", "Road"];
    const loadingLocations = ["Factory A", "Factory B", "Warehouse"];

    return Array.from({ length: num }, (_, index) => ({
      customer: `Customer ${index + 1}`,
      orderRefNo: `REF${1000 + index}`,
      workOrder: `WO-${2000 + index}`,
      orderDate: new Date().toISOString().split("T")[0],
      customerDispatchedDate: new Date(Date.now() + 86400000 * index)
        .toISOString()
        .split("T")[0],
      ppcRfdDate: new Date(Date.now() + 86400000 * (index + 2))
        .toISOString()
        .split("T")[0],
      shipmentType:
        shipmentTypes[Math.floor(Math.random() * shipmentTypes.length)],
      finalLoadingAt:
        loadingLocations[Math.floor(Math.random() * loadingLocations.length)],
      qty: Math.floor(Math.random() * 1000) + 1,
      fwt: `${(Math.random() * 100).toFixed(2)} kg`,
    }));
  };

  const handleDropdownSelect = (item) => {
    setSelectedColumn(item.key || "all"); // make sure this sets the `key`
  };

  const tableData = useMemo(() => generateTableData(50), []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return tableData;

    return tableData.filter((row) => {
      if (selectedColumn === "all") {
        return Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      const value = row[selectedColumn];
      return (
        value && String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, tableData, selectedColumn]);
  const handleDateChange = (date) =>{
    setStartDate(date);
  }

  return (
    <div ref={animateRef} className="w-full py-1 px-2.5 rounded-2xl">
      <div className="flex flex-col md:flex-row w-full py-3 px-3 items-center gap-4 justify-between">
        <div className="w-[80%] flex justify-start items-center">
          <Dropdown
            label="Filter"
            items={[{ label: "All", key: "all" }, ...headers]} // Include "All" option
            onSelect={handleDropdownSelect}
          />
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={() => {}}
          />
        </div>

        <button
          onClick={() => navigate("/Masters/UserMaster/UserCreate")}
          className="bg-slate-800 text-white py-1.5 px-5 rounded-md hover:bg-slate-700 transition duration-300 w-full md:w-auto"
        >
          + Add Invoice
        </button>
      </div>

      <div className="w-full h-[35.5rem] rounded-sm bg-background overflow-auto flex flex-col">
      <ExportTable headers={headers} data={filteredData}/>
      </div>
    </div>
  );
};

export default ExportInvoice;
