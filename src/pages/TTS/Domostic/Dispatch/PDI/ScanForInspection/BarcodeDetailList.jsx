import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DynamicDataTable } from "../../../../../../components/DynamicDataTable";
import { Button, Select } from "antd";
import SearchBar from "../../../../../../components/SearchBar";
import { getBarcodeWise } from "../../../../../../Redux/Slices/PDIDispatchMaster/PDIScanForInspectionSlice";

const { Option } = Select;

const BarcodeDetailList = () => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("barcode");
  const { InspectionDetails, barcodeDetails, loadingBarcode } = useSelector(
    (state) => state.scanforinspection,
  );
  const [localSearch, setLocalSearch] = useState("");
  const [filters, setFilters] = useState({
    platform: "",
    tyreSize: "",
    rim: "",
    type: "",
    brand: "",
    sidewall: "",
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const scanedQty = InspectionDetails?.items?.reduce(
    (total, item) => total + item.scannedQty,
    0,
  );
  const totalQty = InspectionDetails?.items?.reduce(
    (total, item) => total + item.totalItemQty,
    0,
  );
  const percentage = totalQty > 0 ? (scanedQty / totalQty) * 100 : 0;

  const getBarcodeWisedata = async () => {
    await dispatch(getBarcodeWise(InspectionDetails));
  };

  useEffect(() => {
    setFilters({
      platform: "",
      tyreSize: "",
      rim: "",
      type: "",
      brand: "",
      sidewall: "",
    });
    if (mode === "barcode" || mode === "assignQty") {
      getBarcodeWisedata();
    }
  }, [mode]);

  useEffect(() => {
    setLocalSearch("");
  }, []);

  // --- Column Definitions ---
  const barcodeColumns = [
    {
      header: "PLATFORM",
      accessor: "platform",
      width: "0.8fr",
      align: "center",
    },
    {
      header: "TYRE SIZE",
      accessor: "tyreSize",
      width: "1.2fr",
      align: "left",
    },
    { header: "RIM", accessor: "rim", width: "0.5fr", align: "center" },
    { header: "TYPE", accessor: "type", width: "0.5fr", align: "center" },
    { header: "BRAND", accessor: "brand", width: "1fr", align: "left" },
    { header: "SIDEWALL", accessor: "sidewall", width: "1fr", align: "center" },
    {
      header: "PROCESSID",
      accessor: "processId",
      width: "1fr",
      align: "center",
    },
    {
      header: "STENCIL NO",
      accessor: "stencilNo",
      width: "1fr",
      align: "center",
    },
    { header: "GRADE", accessor: "grade", width: "1fr", align: "center" },
    {
      header: "METAL DETECTOR",
      accessor: "metalDetector",
      width: "1fr",
      align: "center",
    },
    { header: "ID GAUGE", accessor: "idGauge", width: "1fr", align: "center" },
    {
      header: "TREAD HARDNESS",
      accessor: "treadHardness",
      width: "1fr",
      align: "center",
    },
    {
      header: "BASE HARDNESS",
      accessor: "baseHardness",
      width: "1fr",
      align: "center",
    },
    {
      header: "CONCESSION TYPE",
      accessor: "concessionType",
      width: "1fr",
      align: "center",
    },
    { header: "RE-BRAND", accessor: "reBrand", width: "1fr", align: "center" },
    {
      header: "RE-SIDEWALL",
      accessor: "reSidewall",
      width: "1fr",
      align: "center",
    },
    {
      header: "BEAD TYPE",
      accessor: "beadType",
      width: "1fr",
      align: "center",
    },
    { header: "REMARKS", accessor: "remarks", width: "1fr", align: "center" },
  ];

  const assignColumns = [
    {
      header: "PLATFORM",
      accessor: "platform",
      width: "0.8fr",
      align: "center",
    },
    {
      header: "TYRE SIZE",
      accessor: "tyreSize",
      width: "1.2fr",
      align: "left",
    },
    { header: "RIM", accessor: "rim", width: "0.5fr", align: "center" },
    { header: "TYPE", accessor: "type", width: "0.5fr", align: "center" },
    { header: "BRAND", accessor: "brand", width: "1fr", align: "left" },
    { header: "SIDEWALL", accessor: "sidewall", width: "1fr", align: "center" },
    {
      header: "PROCESSID",
      accessor: "processId",
      width: "1fr",
      align: "center",
    },
    { header: "PLANT", accessor: "plant", width: "1fr", align: "center" },
    {
      header: "STENCIL NO",
      accessor: "stencilNo",
      width: "1fr",
      align: "center",
    },
    { header: "GRADE", accessor: "grade", width: "1fr", align: "center" },
    { header: "QTY", accessor: "qty", width: "1fr", align: "center" },
    { header: "LOCATION", accessor: "location", width: "1fr", align: "center" },
  ];

  const ItemsColumns = [
    { header: "PLATFORM", accessor: "config", width: "1fr", align: "center" },
    { header: "TYRE SIZE", accessor: "tyreSize", width: "1fr", align: "left" },
    { header: "RIM", accessor: "rimSize", width: "1fr", align: "center" },
    { header: "TYPE", accessor: "tyreType", width: "1fr", align: "center" },
    { header: "BRAND", accessor: "brand", width: "1fr", align: "left" },
    { header: "SIDEWALL", accessor: "sidewall", width: "1fr", align: "center" },
    {
      header: "PROCESSID",
      accessor: "processID",
      width: "1fr",
      align: "center",
    },
    { header: "QTY", accessor: "orderQty", width: "1fr", align: "center" },
  ];

  const processStencilList = barcodeDetails?.processStencilList;
  const stencilList = barcodeDetails?.concessionSummaryList;
  const items = InspectionDetails?.items;

  const platforms = [...new Set(processStencilList?.map((i) => i.platform))];
  const tyreSizes = [...new Set(processStencilList?.map((i) => i.tyreSize))];
  const rims = [...new Set(processStencilList?.map((i) => i.rim))];
  const types = [...new Set(processStencilList?.map((i) => i.type))];
  const brands = [...new Set(processStencilList?.map((i) => i.brand))];
  const sidewalls = [...new Set(processStencilList?.map((i) => i.sidewall))];

  const matchesSearch = (row, query) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    return Object.values(row || {}).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(q),
    );
  };

  const filteredData = useMemo(() => {
    const query = localSearch;
    if (mode === "barcode") {
      return (processStencilList || [])
        .filter(
          (item) =>
            (!filters.platform || item.platform === filters.platform) &&
            (!filters.tyreSize || item.tyreSize === filters.tyreSize) &&
            (!filters.rim || item.rim === filters.rim) &&
            (!filters.type || item.type === filters.type) &&
            (!filters.brand || item.brand === filters.brand) &&
            (!filters.sidewall || item.sidewall === filters.sidewall),
        )
        .filter((item) => matchesSearch(item, query));
    }
    if (mode === "assignQty")
      return (stencilList || []).filter((item) => matchesSearch(item, query));
    if (mode === "itemQty")
      return (items || []).filter((item) => matchesSearch(item, query));
    return [];
  }, [mode, processStencilList, stencilList, items, filters, localSearch]);

  const activeColumns =
    mode === "barcode"
      ? barcodeColumns
      : mode === "assignQty"
        ? assignColumns
        : ItemsColumns;

  return (
    <div className="flex flex-col dark:bg-gray-800 p-2 sm:p-3 gap-3 sm:gap-4 h-full overflow-hidden">
      {/* ── Header Card ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 rounded-lg shadow p-3 sm:p-4 flex flex-col gap-3">
        {/* ── Row 1 : Customer | Workorder | Scan Progress (always 3 columns) ── */}
        <div className="grid grid-cols-3 gap-2 items-center">
          {/* Customer Name */}
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
              Customer Name
            </p>
            <p className="text-[11px] sm:text-sm md:text-base font-semibold text-[var(--primary)] dark:text-white truncate">
              {InspectionDetails?.custFullName || "-"}
            </p>
          </div>

          {/* Workorder */}
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
              Workorder
            </p>
            <p className="text-[11px] sm:text-sm md:text-base font-semibold text-[var(--primary)] dark:text-white truncate">
              {InspectionDetails?.workOrderNo || "-"}
            </p>
          </div>

          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-[var(--primary)]/10 dark:bg-blue-900/20 px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-blue-100 dark:border-blue-800/30 w-fit">
              <div className="text-left min-w-0">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-[var(--primary)] whitespace-nowrap">
                  Scan Progress
                </p>
                <p className="text-[10px] sm:text-sm font-semibold whitespace-nowrap">
                  {scanedQty || 0} / {totalQty || 0} Units
                </p>
              </div>
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: `conic-gradient(var(--primary) ${percentage}%, #e5e7eb ${percentage}%)`,
                  }}
                />
                <div className="absolute inset-1 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-[8px] sm:text-[10px] font-bold">
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2 : Mode Buttons + SearchBar on SAME line for laptop ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Buttons — wrap on mobile, single row on sm+ */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 sm:flex-nowrap">
            {[
              { key: "barcode", label: "Barcode wise List" },
              { key: "itemQty", label: "Item Qty wise List" },
              { key: "assignQty", label: "Assign Qty wise List" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`
                  flex-1 sm:flex-none
                  px-2.5 py-1 sm:px-3 sm:py-1.5
                  text-[10px] sm:text-xs md:text-sm
                  font-medium rounded-md border
                  transition-all duration-150 whitespace-nowrap cursor-pointer
                  ${
                    mode === key
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>

          {/* SearchBar — full width on mobile, flex-1 on sm+ (fills remaining space beside buttons) */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <SearchBar
                placeholder="Search across all fields..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            {localSearch && (
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                {filteredData.length} result
                {filteredData.length !== 1 ? "s" : ""} found
              </span>
            )}
          </div>
        </div>

        {/* ── Row 3 : Filter Dropdowns (barcode mode only) ── */}
        {mode === "barcode" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {[
              { placeholder: "Platform", key: "platform", options: platforms },
              { placeholder: "Tyre Size", key: "tyreSize", options: tyreSizes },
              { placeholder: "Rim Size", key: "rim", options: rims },
              { placeholder: "Tyre Type", key: "type", options: types },
              { placeholder: "Brand", key: "brand", options: brands },
              { placeholder: "Sidewall", key: "sidewall", options: sidewalls },
            ].map(({ placeholder, key, options }) => (
              <Select
                key={key}
                placeholder={placeholder}
                size="small"
                style={{ width: "100%" }}
                value={filters[key] || undefined}
                onChange={(value) => handleFilterChange(key, value)}
                allowClear
                onClear={() => handleFilterChange(key, "")}
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {options?.map((item, index) => (
                  <Option key={index} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            ))}
          </div>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-lg">
        <DynamicDataTable
          columns={activeColumns}
          headerClassName="bg-[var(--primary)] text-white dark:bg-slate-950 shadow-sm"
          data={filteredData}
          loading={mode === "barcode" ? loadingBarcode : false}
        />
      </div>
    </div>
  );
};

export default BarcodeDetailList;
