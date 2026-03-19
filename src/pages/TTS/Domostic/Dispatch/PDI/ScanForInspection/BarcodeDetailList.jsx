import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DynamicDataTable } from "../../../../../../components/DynamicDataTable";
import { Button, Select, Space } from "antd";
import SearchBar from "../../../../../../components/SearchBar";
import { getBarcodeWise } from "../../../../../../Redux/Slices/PDIDispatchMaster/PDIScanForInspectionSlice";
// import { Button, Select, Space } from "antd";

const { Option } = Select;

const BarcodeDetailList = ({

}) => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("barcode");
  const { InspectionDetails, barcodeDetails, loadingBarcode } = useSelector(state => state.scanforinspection)
  const [localSearch, setLocalSearch] = useState(null)
  const [filters, setFilters] = useState({
    platform: "",
    tyreSize: "",
    rim: "",
    type: "",
    brand: "",
    sidewall: ""
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };



  const scanedQty = InspectionDetails?.items?.reduce((total, item) => total + item.scannedQty, 0)
  const totalQty = InspectionDetails?.items?.reduce((total, item) => total + item.totalItemQty, 0)
  const percentage = totalQty > 0 ? (scanedQty / totalQty) * 100 : 0;

  const getBarcodeWisedata = async () => {
    await dispatch(getBarcodeWise(InspectionDetails))
  }

  useEffect(() => {
    setFilters({
      platform: "",
      tyreSize: "",
      rim: "",
      type: "",
      brand: "",
      sidewall: ""
    })

    if (mode === "barcode" || mode === "assignQty") {
      getBarcodeWisedata()
    }
  }, [mode])

  console.log(barcodeDetails);

  const barcodeColumns = [
    { header: "PLATFORM", accessor: "platform", width: "0.8fr", align: "center" },
    { header: "TYRE SIZE", accessor: "tyreSize", width: "1.2fr", align: "left" },
    { header: "RIM", accessor: "rim", width: "0.5fr", align: "center" },
    { header: "TYPE", accessor: "type", width: "0.5fr", align: "center" },
    { header: "BRAND", accessor: "brand", width: "1fr", align: "left" },
    { header: "SIDEWALL", accessor: "sidewall", width: "1fr", align: "center" },
    { header: "PROCESSID", accessor: "processId", width: "1fr", align: "center" },
    { header: "STENCIL NO", accessor: "stencilNo", width: "1fr", align: "center" },
    { header: "GRADE", accessor: "grade", width: "1fr", align: "center" },
    { header: "METAL DETECTOR", accessor: "metalDetector", width: "1fr", align: "center" },
    { header: "ID GAUGE", accessor: "idGauge", width: "1fr", align: "center" },
    { header: "TREAD HARDNESS", accessor: "treadHardness", width: "1fr", align: "center" },
    { header: "BASE HARDNESS", accessor: "baseHardness", width: "1fr", align: "center" },
    { header: "CONCESSION TYPE", accessor: "concessionType", width: "1fr", align: "center" },
    { header: "RE-BRAND", accessor: "reBrand", width: "1fr", align: "center" },
    { header: "RE-SIDEWALL", accessor: "reSidewall", width: "1fr", align: "center" },
    { header: "BEAD TYPE", accessor: "beadType", width: "1fr", align: "center" },
    { header: "REMARKS", accessor: "remarks", width: "1fr", align: "center" },
  ]

  const assignColumns = [
    { header: "PLATFORM", accessor: "platform", width: "0.8fr", align: "center" },
    { header: "TYRE SIZE", accessor: "tyreSize", width: "1.2fr", align: "left" },
    { header: "RIM", accessor: "rim", width: "0.5fr", align: "center" },
    { header: "TYPE", accessor: "type", width: "0.5fr", align: "center" },
    { header: "BRAND", accessor: "brand", width: "1fr", align: "left" },
    { header: "SIDEWALL", accessor: "sidewall", width: "1fr", align: "center" },
    { header: "PROCESSID", accessor: "processId", width: "1fr", align: "center" },
    { header: "PLANT", accessor: "plant", width: "1fr", align: "center" },
    { header: "STENCIL NO", accessor: "stencilNo", width: "1fr", align: "center" },
    { header: "GRADE", accessor: "grade", width: "1fr", align: "center" },
    { header: "QTY", accessor: "qty", width: "1fr", align: "center" },
    { header: "LOCATION", accessor: "location", width: "1fr", align: "center" },
  ]

  const ItemsColumns = [
    { header: "PLATFORM", accessor: "config", width: "1fr", align: "center" },
    { header: "TYRE SIZE", accessor: "tyreSize", width: "1fr", align: "left" },
    { header: "RIM", accessor: "rimSize", width: "1fr", align: "center" },
    { header: "TYPE", accessor: "tyreType", width: "1fr", align: "center" },
    { header: "BRAND", accessor: "brand", width: "1fr", align: "left" },
    { header: "SIDEWALL", accessor: "sidewall", width: "1fr", align: "center" },
    { header: "PROCESSID", accessor: "processID", width: "1fr", align: "center" },
    // { header: "GRADE", accessor: "-", width: "1fr", align: "center" },
    // { header: "CONCESSION TYPE", accessor: "-", width: "1fr", align: "center" },
    // { header: "RE-BRAND", accessor: "-", width: "1fr", align: "center" },
    // { header: "RE-SIDEWALL", accessor: "-", width: "1fr", align: "center" },
    { header: "QTY", accessor: "orderQty", width: "1fr", align: "center" },
  ]

  const items = InspectionDetails?.items

  const processStencilList = barcodeDetails?.processStencilList
  const stencilList = barcodeDetails?.concessionSummaryList

  const filteredBarcodeList = processStencilList?.filter((item) => {
    return (
      (!filters.platform || item.platform === filters.platform) &&
      (!filters.tyreSize || item.tyreSize === filters.tyreSize) &&
      (!filters.rim || item.rim === filters.rim) &&
      (!filters.type || item.type === filters.type) &&
      (!filters.brand || item.brand === filters.brand) &&
      (!filters.sidewall || item.sidewall === filters.sidewall)
    );
  });
  
  const platforms = [...new Set(processStencilList?.map(i => i.platform))];
  const tyreSizes = [...new Set(processStencilList?.map(i => i.tyreSize))];
  const rims = [...new Set(processStencilList?.map(i => i.rim))];
  const types = [...new Set(processStencilList?.map(i => i.type))];
  const brands = [...new Set(processStencilList?.map(i => i.brand))];
  const sidewalls = [...new Set(processStencilList?.map(i => i.sidewall))];
  const grade = [...new Set(processStencilList?.map(i => i.grade))];

  useEffect(() => {
    setLocalSearch(null)
  },[])


  return (
    <div className="h-full flex flex-col dark:bg-gray-800 p-2 gap-4">

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-3 flex flex-col gap-4">

        {/* Customer + Workorder */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customer Name
            </p>
            <p className="text-lg font-semibold text-[var(--primary)] dark:text-white">
              {InspectionDetails?.custFullName || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Workorder
            </p>
            <p className="text-lg font-semibold text-[var(--primary)] dark:text-white">
              {InspectionDetails?.workOrderNo || "-"}
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 bg-[var(--primary)]/10 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--primary)]">Scan Progress</p>
              <p className="text-sm font-semibold">{scanedQty || 0} / {totalQty || 0} Units</p>
            </div>
            <div className="relative w-10 h-10">
              <div
                className="w-full h-full rounded-full"
                style={{ background: `conic-gradient(var(--primary) ${percentage}%, #e5e7eb ${percentage}%)` }}
              />
              <div className="absolute inset-1 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold">{Math.round(percentage)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Buttons */}
        <Space wrap>
          <Button
            type={mode === "barcode" ? "primary" : "default"}
            onClick={() => setMode("barcode")}
          >
            Barcode wise List
          </Button>

          <Button
            type={mode === "itemQty" ? "primary" : "default"}
            onClick={() => setMode("itemQty")}
          >
            Item Qty wise List
          </Button>

          <Button
            type={mode === "assignQty" ? "primary" : "default"}
            onClick={() => setMode("assignQty")}
          >
            Assign Qty wise List
          </Button>
          <SearchBar placeholder="Search" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)}/>
        </Space>

        {/* Filter Dropdowns */}
        {mode === "barcode" && (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

          <Select placeholder="Platform" style={{ width: "100%" }} onChange={(value) => handleFilterChange("platform", value)} getPopupContainer={(trigger) => trigger.parentNode}>
            {platforms?.map((item, index) => (
              <Option key={index} value={item}>
                {item}
              </Option>
            ))}
          </Select>

          <Select placeholder="Tyre Size" style={{ width: "100%" }} getPopupContainer={(trigger) => trigger.parentNode}>
            {tyreSizes?.map((item, index) => (
              <Option key={index} value={item}>
                {item}
              </Option>
            ))}
          </Select>

          <Select placeholder="Rim Size" style={{ width: "100%" }} getPopupContainer={(trigger) => trigger.parentNode}>
            {rims?.map((item, index) => (
              <Option key={index} value={item}>
                {item}
              </Option>
            ))}
          </Select>

          <Select placeholder="Tyre Type" style={{ width: "100%" }} getPopupContainer={(trigger) => trigger.parentNode}>
            {sidewalls?.map((item, index) => (
              <Option key={index} value={item}>
                {item}
              </Option>
            ))}
          </Select>

          <Select placeholder="Brand" style={{ width: "100%" }} getPopupContainer={(trigger) => trigger.parentNode}>
            {brands?.map((item, index) => (
              <Option key={index} value={item}>
                {item}
              </Option>
            ))}
          </Select>

          <Select placeholder="Sidewall" style={{ width: "100%" }} getPopupContainer={(trigger) => trigger.parentNode}>
            {sidewalls?.map((item, index) => (
              <Option key={index} value={item}>
                {item}
              </Option>
            ))}
          </Select>

        </div>)}
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto">
        <DynamicDataTable
          columns={mode === "barcode" ? barcodeColumns : mode === "assignQty" ? assignColumns : ItemsColumns}
          headerClassName='bg-[var(--primary)] text-white dark:bg-slate-950 shadow-sm'
          data={mode === "barcode" ? filteredBarcodeList : mode === "assignQty" ? stencilList : items}
          loading={mode === "barcode" ? loadingBarcode : false}
        />
      </div>

    </div>
  );
};

export default BarcodeDetailList;