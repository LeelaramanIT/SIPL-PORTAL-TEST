import React, { useState } from "react";
import { Modal, Button, Upload } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";

// Excel header text (case/whitespace-insensitive on read) → internal field name.
const HEADER_MAP = {
  "customer code": "customerCode",
  "ship id": "shipId",
  "item type": "itemType",
  "item code": "itemCode",
  "customer item code": "customerItemCode",
};
const REQUIRED_HEADERS = ["Customer Code", "Ship ID", "Item Type", "Item Code", "Customer Item Code"];

const downloadTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    REQUIRED_HEADERS,
    ["CUST-1001", 501, "Tyre", "TYRE-18565R15", "CUST-TYRE-001"],
    ["CUST-1001", 502, "Tyre", "TYRE-18565R15", "CUST-TYRE-002"],
  ]);
  ws["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Import Template");
  XLSX.writeFile(wb, "customer-item-mapping-template.xlsx");
};

const ImportDialog = ({ open, onClose, onValidate, onImport }) => {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [templateError, setTemplateError] = useState("");

  const handleFile = (file) => {
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    if (!isExcel) {
      setTemplateError("Unsupported file type. Please upload a .xlsx or .xls file.");
      return false;
    }

    setFileName(file.name);
    setTemplateError("");
    setRows([]);

    (async () => {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!sheetRows.length) {
        setTemplateError("This Excel file has no data rows.");
        return;
      }

      // Header lookup is whitespace/case-insensitive, so "ship id", "Ship Id",
      // " Ship ID " all resolve to the same column.
      const actualHeaders = Object.keys(sheetRows[0]);
      const normalizedActual = new Set(actualHeaders.map((h) => h.trim().toLowerCase()));
      const missingHeaders = REQUIRED_HEADERS.filter((h) => !normalizedActual.has(h.toLowerCase()));
      if (missingHeaders.length) {
        setTemplateError(`Invalid Excel template. Missing required columns: ${missingHeaders.join(", ")}.`);
        return;
      }

      const headerLookup = {};
      actualHeaders.forEach((h) => {
        const field = HEADER_MAP[h.trim().toLowerCase()];
        if (field) headerLookup[field] = h;
      });

      const rawRows = sheetRows
        // Ignore completely empty rows (e.g. trailing blank rows in the sheet).
        .filter((r) => Object.values(r).some((v) => String(v ?? "").trim() !== ""))
        .map((r) => ({
          customerCode: String(r[headerLookup.customerCode] ?? "").trim(),
          shipId: String(r[headerLookup.shipId] ?? "").trim(),
          itemType: String(r[headerLookup.itemType] ?? "").trim(),
          itemCode: String(r[headerLookup.itemCode] ?? "").trim(),
          customerItemCode: String(r[headerLookup.customerItemCode] ?? "").trim(),
        }));

      if (!rawRows.length) {
        setTemplateError("This Excel file has no data rows.");
        return;
      }

      setValidating(true);
      try {
        // Deep validation (customer/ship-address existence, item lookup,
        // description auto-fill, duplicate checks) lives in the parent —
        // it owns the Redux dispatch/API calls this needs.
        const validated = await onValidate(rawRows);
        setRows(validated);
      } catch (error) {
        console.error("Excel validation failed:", error);
        setTemplateError("Could not validate the file. Please try again.");
      } finally {
        setValidating(false);
      }
    })();

    return false; // prevent AntD auto-upload
  };

  const validCount = rows.filter((r) => r._valid).length;

  const handleImportClick = async () => {
    setImporting(true);
    try {
      await onImport(rows.filter((r) => r._valid));
      setRows([]);
      setFileName("");
      onClose();
    } catch (error) {
      // onImport already surfaces an error toast — keep the dialog open so
      // the user can retry without re-uploading the file.
    } finally {
      setImporting(false);
    }
  };

  const errorCount = rows.length - validCount;

const handleExportErrors = () => {
  const errorRows = rows.filter((r) => !r._valid);
  if (!errorRows.length) return;

  const ws = XLSX.utils.aoa_to_sheet([
    [...REQUIRED_HEADERS, "Error"],
    ...errorRows.map((r) => [r.customerCode, r.shipId, r.itemType, r.itemCode, r.customerItemCode, r._error]),
  ]);
  ws["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 40 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Import Errors");
  XLSX.writeFile(wb, `${fileName.replace(/\.(xlsx|xls)$/i, "")}-errors.xlsx`);
};

  const handleClose = () => {
    setRows([]);
    setFileName("");
    setTemplateError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Import Mappings"
      width={typeof window !== "undefined" ? Math.min(720, window.innerWidth - 32) : 720}
      classNames={{
        body: "!px-3 !py-2 sm:!px-6 sm:!py-4",
        content: "dark:!bg-slate-800",
        header: "dark:!bg-slate-800 dark:[&_.ant-modal-title]:!text-slate-100",
      }}
      footer={
        <div className="flex justify-end gap-2 sm:gap-3">
          <Button onClick={handleClose} className="rounded-lg dark:!bg-slate-700 dark:!text-slate-100 dark:!border-slate-600">
            Cancel
          </Button>
          <Button
            type="primary"
            disabled={validCount === 0}
            loading={importing}
            onClick={handleImportClick}
            className="rounded-lg bg-blue-600"
          >
            Import {validCount > 0 ? `${validCount} row${validCount === 1 ? "" : "s"}` : ""}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 sm:space-y-4 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-2.5 sm:p-3.5">
          <div>
            <p className="text-[12px] sm:text-[13px] font-medium text-slate-700 dark:text-slate-300">1. Download the template</p>
            <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400">
              Fill it in, then upload it below. Description is filled in automatically — don't add it.
            </p>
          </div>
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate} className="rounded-lg self-start sm:self-auto dark:!bg-slate-700 dark:!text-slate-100 dark:!border-slate-600">
            Template
          </Button>
        </div>

        <Upload.Dragger accept=".xlsx,.xls" showUploadList={false} beforeUpload={handleFile} className="!bg-white dark:!bg-slate-900/40 dark:!border-slate-700">
          <p className="text-[12px] sm:text-[13px] font-medium text-slate-700 dark:text-slate-300">
            <UploadOutlined className="mr-1.5" />
            {validating ? "Validating…" : "Click or drag a .xlsx / .xls file to upload"}
          </p>
          {fileName && <p className="mt-1 text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400">{fileName}</p>}
        </Upload.Dragger>

        {templateError && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
            <p className="text-[12px] sm:text-[13px] text-rose-700 dark:text-rose-400">{templateError}</p>
          </div>
        )}

        {rows.length > 0 && (
          <div>
            {/* <div className="mb-2 flex items-center gap-3 sm:gap-4 text-[11px] sm:text-[12px]">
              <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={13} /> {validCount} valid
              </span>
              <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                <AlertTriangle size={13} /> {rows.length - validCount} with errors
              </span>
            </div> */}
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-[12px]">
  <div className="flex items-center gap-3 sm:gap-4">
    <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
      <CheckCircle2 size={13} /> {validCount} valid
    </span>
    <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
      <AlertTriangle size={13} /> {errorCount} with errors
    </span>
  </div>
  {errorCount > 0 && (
    <Button
      size="small"
      icon={<DownloadOutlined />}
      onClick={handleExportErrors}
      className="rounded-lg dark:!bg-slate-700 dark:!text-slate-100 dark:!border-slate-600"
    >
      Download Errors
    </Button>
  )}
</div>
            <div className="max-h-64 overflow-x-auto overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[640px] text-left text-[11px] sm:text-[12px]">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Customer Code</th>
                    <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Ship ID</th>
                    <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Item Type</th>
                    <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Item Code</th>
                    <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Customer Item Code</th>
                    <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-t border-slate-100 dark:border-slate-700 ${!row._valid ? "bg-rose-50/60 dark:bg-rose-900/20" : ""}`}>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.customerCode}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.shipId}</td>
                      <td className="px-3 py-2 uppercase text-slate-700 dark:text-slate-300">{row.itemType}</td>
                      <td className="px-3 py-2 font-mono font-semibold text-slate-800 dark:text-slate-100">{row.itemCode}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.customerItemCode}</td>
                      <td className="px-3 py-2">
                        {row._valid ? (
                          <span className="text-emerald-700 dark:text-emerald-400">OK</span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400">{row._error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportDialog;
