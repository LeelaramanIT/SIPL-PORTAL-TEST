import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  RefreshCw,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  PackageOpen,
  MapPin,
  Truck,
  Factory,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { DynamicDataTable } from "../../../components/DynamicDataTable";
import { useLocation } from "react-router-dom";
import {
  DCAapproval,
  GetTransactionById,
} from "../../../Redux/Slices/Warehouse/WarehouseSlice";
import { useDispatch } from "react-redux";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --- HELPER COMPONENTS ---
const StatusBadge = ({ status }) => {
  const styles = {
    Prepared:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
    Pending:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
    "PENDING DC PREPARATION":
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm ${styles[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status === "Prepared" && <CheckCircle2 className="w-3 h-3 mr-1 flex-shrink-0" />}
      {(status.includes("Pending") || status.includes("PENDING")) && (
        <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
      )}
      <span className="truncate">{status}</span>
    </span>
  );
};

const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/30 shadow-sm md:shadow-none md:bg-transparent md:border-none md:p-0 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/80">
    {Icon && (
      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 md:hidden flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
    )}
    <div className="flex flex-col min-w-0 flex-1">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
        {Icon && <Icon className="w-3 h-3 hidden md:block flex-shrink-0" />}
        <span className="truncate">{label}</span>
      </div>
      <span
        className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate"
        title={value || "-"}
      >
        {value || "-"}
      </span>
    </div>
  </div>
);

export default function DCPreparationApproval() {
  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visibleRows, setVisibleRows] = useState(50);

  // Approval states
  const [approvalStatus, setApprovalStatus] = useState("Pending Approval");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const dispatch = useDispatch();

  // Get data from location
  const location = useLocation();
  const transferData = location?.state?.transferData || {
    id: "FAC19-SFG-20260521-000039",
    plant: "MMN",
    from: "SOLID TYRES Maraimal",
    to: "Finished Goods Wareh",
    createdDate: "2026-05-21T13:46:27.48",
    createdBy: "admin",
    rawStatus: "PENDING DC PREPARATION",
    vehicleNo: "TN01BJ3100",
  };

  // --- DATA FETCHING & GROUPING ---
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await dispatch(
        GetTransactionById(transferData?.tM_ID, transferData?.statusNo),
      );

      const rawApiData = res?.data?.data || [];

      const groupedDataMap = rawApiData.reduce((acc, curr) => {
        if (!acc[curr.processID]) {
          acc[curr.processID] = {
            processId: curr.processID,
            itemName: `
              ${curr.config || ""} |
              ${curr.tyreSize || ""} |
              ${curr.rimSize || ""} |
              ${curr.tyreType || ""} |
              ${curr.brand || ""} |
              ${curr.sideWall || ""}
            `
              .replace(/\s+/g, " ")
              .trim(),
            fwt: Number(curr.fwt) || 0,
            qty: 1,
            scannedQty: curr.whScannedQty ? 1 : 0,
            status: curr.statusNo === 47 ? "PENDING DC PREPARATION" : "Prepared",
            createdDate: curr.createdDate ? curr.createdDate.split("T")[0] : "-",
            barcodes: [curr.barcode],
          };
        } else {
          acc[curr.processID].qty += 1;
          acc[curr.processID].fwt += Number(curr.fwt) || 0;
          if (curr.whScannedQty) {
            acc[curr.processID].scannedQty += 1;
          }
          acc[curr.processID].barcodes.push(curr.barcode);
        }
        return acc;
      }, {});

      const formattedData = Object.values(groupedDataMap).map((item, index) => ({
        id: index + 1,
        processId: item.processId,
        itemName: item.itemName,
        fwt: item.fwt,
        barcode:
          item.barcodes.length > 1
            ? `Multiple (${item.barcodes.length})`
            : item.barcodes[0],
        qty: item.qty,
        scannedQty: item.scannedQty,
        status: item.status,
        createdDate: item.createdDate,
      }));

      setData(formattedData);
      setVisibleRows(50);
    } catch (error) {
      toast.error("Failed to load DC data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- FILTERING & DERIVED STATE ---
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase()),
      );
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const totalQuantity = useMemo(() => filteredData.reduce((acc, curr) => acc + curr.qty, 0), [filteredData]);
  const totalScanned = useMemo(() => filteredData.reduce((acc, curr) => acc + curr.scannedQty, 0), [filteredData]);
  const totalFWT = useMemo(() => filteredData.reduce((acc, curr) => acc + (Number(curr.fwt) || 0), 0), [filteredData]);

  const handleExport = async () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("DC Preparation Approval");
    const FONT_FAMILY = "Segoe UI";

    const setCellStyle = (
      cell,
      { bold = false, size = 9, color = "111827", align = "left", wrap = false } = {}
    ) => {
      cell.font = { name: FONT_FAMILY, bold, size, color: { argb: color } };
      cell.alignment = { horizontal: align, vertical: "middle", wrapText: wrap };
    };

    const estimateRowHeight = (text, baseHeight = 20, charsPerLine = 35, lineHeight = 16) => {
      const value = text === null || text === undefined ? "" : String(text);
      const lines = Math.max(1, Math.ceil(value.length / charsPerLine));
      return Math.max(baseHeight, lines * lineHeight);
    };

    worksheet.pageSetup = {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.35, right: 0.35, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    };

    worksheet.views = [{ showGridLines: true }];
    worksheet.pageSetup.printTitlesRow = "8:8";

    worksheet.columns = [
      { width: 7 }, { width: 18 }, { width: 34 }, { width: 10 },
      { width: 10 }, { width: 12 }, { width: 16 }, { width: 16 }
    ];

    worksheet.mergeCells("A2:G2");
    const titleCell = worksheet.getCell("A2");
    titleCell.value = "DC PREPARATION APPROVAL REPORT";
    titleCell.font = { name: FONT_FAMILY, bold: true, size: 14, color: { argb: "1E3A8A" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(2).height = 26;

    const details = [
      ["Transfer No", transferData?.id],
      ["Status", transferData?.rawStatus],
      ["Total Items", filteredData.length],
      ["Approval Status", approvalStatus],
      ["Plant", transferData?.plant],
      ["Vehicle No", transferData?.vehicleNo],
      ["Source (From)", transferData?.from],
      ["Destination (To)", transferData?.to],
      ["Created By", transferData?.createdBy],
      ["Created Date", formatDateTime(transferData?.createdDate)],
    ];

    const detailStartRow = 5;

    details.forEach(([label, value], index) => {
      const rowNumber = detailStartRow + Math.floor(index / 2);
      const row = worksheet.getRow(rowNumber);
      const startCol = index % 2 === 0 ? 1 : 5;

      const labelCell = row.getCell(startCol);
      const colonCell = row.getCell(startCol + 1);
      const valueCell = row.getCell(startCol + 2);

      labelCell.value = label;
      colonCell.value = ":";
      valueCell.value = value !== undefined && value !== null ? value : "-";

      const thinBorder = { style: "thin", color: { argb: "E5E7EB" } };
      const fieldBorders = { top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder };

      [labelCell, colonCell, valueCell].forEach((cell) => {
        cell.border = fieldBorders;
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      });

      labelCell.font = { name: FONT_FAMILY, size: 9, bold: true, color: { argb: "374151" } };
      labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F9FAFB" } };
      colonCell.font = { name: FONT_FAMILY, size: 9, color: { argb: "9CA3AF" } };
      colonCell.alignment = { horizontal: "center", vertical: "middle", wrapText: false };
      valueCell.font = { name: FONT_FAMILY, size: 9, color: { argb: "111827" } };
      valueCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF" } };
      valueCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };

      row.height = estimateRowHeight(`${label} ${value || ""}`, 19, 28, 16);
    });

    const sectionRow = detailStartRow + Math.ceil(details.length / 2) + 1;
    worksheet.mergeCells(`A${sectionRow}:G${sectionRow}`);
    const sectionCell = worksheet.getCell(`A${sectionRow}`);
    sectionCell.value = "LINE ITEM DETAILS";
    sectionCell.font = { name: FONT_FAMILY, bold: true, size: 10.5, color: { argb: "1E40AF" } };
    sectionCell.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(sectionRow).height = 20;

    const headerRowIndex = sectionRow + 1;
    const headers = ["S.No", "Process ID", "Item Name", "FWT", "Qty", "Scanned Qty", "Status", "Created Date"];
    const headerRow = worksheet.getRow(headerRowIndex);
    headerRow.height = 26;

    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { name: FONT_FAMILY, bold: true, size: 9.5, color: { argb: "FFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A8A" } };
      cell.alignment = { horizontal: index === 2 ? "left" : "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "4B5563" } },
        bottom: { style: "medium", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "4B5563" } },
      };
    });

    const dataStartRow = headerRowIndex + 1;
    let totalQty = 0;
    let totalScanned = 0;
    let totalFWT = 0;

    filteredData.forEach((item, index) => {
      const currentRowNumber = dataStartRow + index;
      const row = worksheet.getRow(currentRowNumber);

      const itemFWT = Number(item.fwt) || 0;
      const itemQty = Number(item.qty) || 0;
      const itemScanned = Number(item.scannedQty) || 0;
      
      totalFWT += itemFWT;
      totalQty += itemQty;
      totalScanned += itemScanned;

      const rowData = [
        index + 1,
        item.processId || "-",
        item.itemName || "-",
        item.fwt || 0,
        itemQty,
        itemScanned,
        item.status || "-",
        formatDateTime(item.createdDate) || "-",
      ];

      const rowTextForHeight = `${item.processId || ""} ${item.itemName || ""} ${item.status || ""} ${formatDateTime(item.createdDate) || ""}`;
      row.height = estimateRowHeight(rowTextForHeight, 20, 40, 16);

      rowData.forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;

        const isNumeric = colIndex === 3 || colIndex === 4 || colIndex === 5;
        const isLongText = colIndex === 1 || colIndex === 2 || colIndex === 5 || colIndex === 6;

        setCellStyle(cell, {
          size: 9,
          color: "1F2937",
          align: colIndex === 2 ? "left" : isNumeric ? "right" : "center",
          wrap: isLongText || colIndex === 2,
        });

        cell.border = {
          top: { style: "thin", color: { argb: "E5E7EB" } },
          left: { style: "thin", color: { argb: "E5E7EB" } },
          bottom: { style: "thin", color: { argb: "E5E7EB" } },
          right: { style: "thin", color: { argb: "E5E7EB" } },
        };

        if (index % 2 === 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F9FAFB" } };
        }

        if (isNumeric) {
          cell.numFormat = "#,##0";
        }

        if (colIndex === 4 && itemScanned < itemQty) {
          cell.font = { name: FONT_FAMILY, size: 9, bold: true, color: { argb: "B91C1C" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEF2F2" } };
        }
      });
    });

    const totalRowIndex = dataStartRow + filteredData.length;
    const totalRow = worksheet.getRow(totalRowIndex);
    totalRow.height = 22;

    totalRow.getCell(1).value = "TOTALS";
    totalRow.getCell(4).value = totalFWT;
    totalRow.getCell(5).value = totalQty;
    totalRow.getCell(6).value = totalScanned;

    totalRow.eachCell((cell, colNumber) => {
      cell.font = { name: FONT_FAMILY, bold: true, size: 9.5, color: { argb: "111827" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F3F4F6" } };
      cell.alignment = {
        horizontal: colNumber === 1 ? "left" : (colNumber === 4 || colNumber === 5 || colNumber === 6) ? "right" : "center",
        vertical: "middle",
        wrapText: true,
      };
      if (colNumber === 4 || colNumber === 5 || colNumber === 6) {
        cell.numFormat = "#,##0.##";
      }
      cell.border = {
        top: { style: "thin", color: { argb: "111827" } },
        bottom: { style: "double", color: { argb: "111827" } },
        left: { style: "thin", color: { argb: "E5E7EB" } },
        right: { style: "thin", color: { argb: "E5E7EB" } },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const datestamp = new Date().toISOString().slice(0, 10);

    saveAs(
      new Blob([buffer]),
      `DC_Preparation_${transferData?.id || "Report"}_${datestamp}.xlsx`
    );

    toast.success("Print-friendly Excel document exported!");
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await dispatch(DCAapproval(transferData?.tM_ID));
      setApprovalStatus("Approved");
      toast.success("DC Preparation Approved Successfully!");
      setIsModalOpen(false);
    } catch (error) {
      // toast.error("Failed to approve DC");
    } finally {
      setIsApproving(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- TABLE COLUMNS ---
  const columns = [
    { header: "S.No", accessor: "id", width: "70px", align: "center" },
    { header: "Process ID", accessor: "processId", width: "130px", align: "left" },
    { header: "Item Name", accessor: "itemName", width: "3.5fr", align: "left" },
    { header: "FWT", accessor: "fwt", width: "90px", align: "center" },
    {
      header: "Qty",
      accessor: "qty",
      width: "100px",
      align: "center",
      render: (val) => (
        <span className="font-semibold text-slate-700 dark:text-slate-200">{val}</span>
      ),
    },
    {
      header: "Scanned",
      accessor: "scannedQty",
      width: "100px",
      align: "center",
      render: (val, row) => (
        <span className={`font-semibold ${val < row.qty ? "text-red-500" : "text-emerald-600"}`}>
          {val}
        </span>
      ),
    },
    { header: "Created Date", accessor: "createdDate", width: "120px", align: "center" },
    { header: "Status", accessor: "status", width: "195px", align: "center" },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 overflow-hidden">
      <Toaster position="top-right" />

      {/* --- MAIN HEADER --- */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 shadow-sm z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0 transition-colors duration-200">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageOpen className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
            <span className="truncate">DC Preparation Approval</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs sm:text-sm">
            <span className="font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[180px] sm:max-w-none">
              {transferData?.id}
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
            <StatusBadge status={transferData?.rawStatus || "PENDING DC PREPARATION"} />
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 bg-slate-50 dark:bg-slate-900/50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-slate-100 sm:border-none dark:border-slate-700/40">
          <div className="flex flex-col items-start sm:items-end flex-1 sm:flex-none">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Items
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">
              {filteredData.length}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex flex-col items-start sm:items-end flex-1 sm:flex-none">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
              Approval Status
            </span>
            <div className="mt-0.5">
              <StatusBadge status={approvalStatus.includes("Approved") ? "Prepared" : "Pending"} />
            </div>
          </div>
        </div>
      </header>

      {/* --- TRANSFER DETAILS GRID --- */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 shadow-inner z-10 overflow-y-auto max-h-[22%] sm:max-h-none flex-shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          <InfoItem label="Plant" value={transferData?.plant} icon={Factory} />
          <InfoItem label="Source (From)" value={transferData?.from} icon={MapPin} />
          <InfoItem label="Destination (To)" value={transferData?.to} icon={MapPin} />
          <InfoItem label="Vehicle No" value={transferData?.vehicleNo} icon={Truck} />
          <InfoItem label="Created By" value={transferData?.createdBy} />
          <InfoItem label="Created Date" value={formatDateTime(transferData?.createdDate)} />
        </div>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="px-4 sm:px-6 py-4 bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center z-10 flex-shrink-0">
        <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-3">
          {/* Global Search */}
          <div className="relative w-full sm:w-64 lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-48 md:w-auto">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="Prepared">Prepared</option>
              <option value="PENDING DC PREPARATION">Pending</option>
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end sm:justify-start">
          <button
            onClick={loadData}
            className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* --- TABLE AREA --- */}
      <div className="flex-1 px-4 sm:px-6 pb-4 overflow-hidden flex flex-col min-h-0 w-full">
        <div className="flex-1 overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm custom-scrollbar">
          <DynamicDataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            visibleRows={visibleRows}
            onLoadMore={() => setVisibleRows((prev) => prev + 50)}
            rowClassName={(row) =>
              row.scannedQty < row.qty
                ? "bg-red-50/30 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
                : undefined
            }
            headerClassName="bg-[var(--primary)] text-slate-900 dark:text-white font-semibold"
          />
        </div>
      </div>

      {/* --- FOOTER ACTION BAR --- */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 px-4 sm:px-6 flex-shrink-0 transition-colors duration-200">
        {/* Metric Summary Blocks */}
        <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-6 bg-slate-50 dark:bg-slate-900/40 md:bg-transparent p-2.5 md:p-0 rounded-xl border border-slate-100 dark:border-slate-700/30 md:border-none text-center md:text-left shadow-inner md:shadow-none">
          <div className="flex flex-col md:flex-row md:items-baseline md:gap-1.5 min-w-0">
            <span className="text-[10px] md:text-xs uppercase md:normal-case font-medium text-slate-400 dark:text-slate-500 tracking-wider md:tracking-normal truncate">
              Total Qty
            </span>
            <strong className="text-sm md:text-base font-bold text-slate-800 dark:text-white mt-0.5 md:mt-0">
              {totalQuantity}
            </strong>
          </div>
          <div className="hidden md:block w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
          
          <div className="flex flex-col md:flex-row md:items-baseline md:gap-1.5 min-w-0">
            <span className="text-[10px] md:text-xs uppercase md:normal-case font-medium text-slate-400 dark:text-slate-500 tracking-wider md:tracking-normal truncate">
              Total FWT
            </span>
            <strong className="text-sm md:text-base font-bold text-slate-800 dark:text-white mt-0.5 md:mt-0">
              {totalFWT.toFixed(2)}
            </strong>
          </div>
          <div className="hidden md:block w-px h-4 bg-slate-200 dark:bg-slate-700"></div>

          <div className="flex flex-col md:flex-row md:items-baseline md:gap-1.5 min-w-0">
            <span className="text-[10px] md:text-xs uppercase md:normal-case font-medium text-slate-400 dark:text-slate-500 tracking-wider md:tracking-normal truncate">
              Scanned
            </span>
            <strong
              className={`text-sm md:text-base font-bold mt-0.5 md:mt-0 ${
                totalScanned < totalQuantity ? "text-red-500" : "text-emerald-600"
              }`}
            >
              {totalScanned}
            </strong>
          </div>
        </div>

        {/* Dynamic CTAs */}
        <div className="flex gap-3 items-center">
          <button className="flex-1 md:flex-none px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-all active:scale-[0.98]">
            Cancel
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={approvalStatus === "Approved" || loading || filteredData.length === 0}
            className="flex-[2] md:flex-none px-8 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {approvalStatus === "Approved" ? "Already Approved" : "Approve DC"}
          </button>
        </div>
      </footer>

      {/* --- CONFIRMATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 max-h-[90vh] flex flex-col scale-100 border border-slate-100 dark:border-slate-700">
            <div className="p-5 sm:p-6 overflow-y-auto">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <PackageOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5">
                Confirm Approval
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-5 leading-relaxed">
                Are you sure you want to approve DC Preparation for{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {transferData?.id}
                </span>
                ? Once approved, it will be pushed directly to dispatch lines.
              </p>

              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-100 dark:border-slate-700/60 space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate pl-4 max-w-[200px]">
                    {transferData?.to}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-500">Total Groups:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {filteredData.length}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-500">Total Quantity:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {totalQuantity}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex gap-3 justify-end items-center flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isApproving}
                className="px-4 py-2 rounded-lg font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
              >
                {isApproving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isApproving ? "Approving..." : "Yes, Approve"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}