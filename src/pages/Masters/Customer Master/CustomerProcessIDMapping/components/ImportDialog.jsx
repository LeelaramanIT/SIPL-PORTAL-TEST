import React, { useState } from "react";
import { Modal, Button, Upload } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { PROCESS_MASTER } from "../data/mockData";

// NOTE: this parses plain CSV client-side to avoid an extra dependency in
// this scaffold. For real .xlsx workbooks, install `xlsx` (SheetJS) and
// swap `parseCsv` for `XLSX.read(...)` — the rest of the flow (preview,
// validation, commit) stays identical.
const parseCsv = (text) => {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((h) => h.trim());
  return lines
    .filter(Boolean)
    .map((line) => {
      const cells = line.split(",").map((c) => c.trim());
      return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
    });
};

const TEMPLATE_HEADERS = ["customer", "customerProcessId", "ourProcessId", "status", "remarks"];

const downloadTemplate = () => {
  const csv = [TEMPLATE_HEADERS.join(","), "Apollo Tyres,AP-99999,P124,Active,"].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customer-process-mapping-template.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const ImportDialog = ({ open, onClose, mappings, onImport }) => {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleFile = (file) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCsv(String(e.target.result));
      const validated = parsed.map((row) => {
        const processExists = PROCESS_MASTER.some((p) => p.processId === row.ourProcessId);
        const isDuplicate = mappings.some(
          (m) =>
            m.customer === row.customer &&
            m.customerProcessId.toLowerCase() === (row.customerProcessId || "").toLowerCase(),
        );
        const missing = !row.customer || !row.customerProcessId || !row.ourProcessId;
        return {
          ...row,
          _valid: !missing && processExists && !isDuplicate,
          _error: missing
            ? "Missing required field"
            : !processExists
            ? "Unknown Our Process ID"
            : isDuplicate
            ? "Duplicate mapping"
            : null,
        };
      });
      setRows(validated);
    };
    reader.readAsText(file);
    return false; // prevent AntD auto-upload
  };

  const validCount = rows.filter((r) => r._valid).length;

  const handleImport = () => {
    onImport(rows.filter((r) => r._valid));
    setRows([]);
    setFileName("");
    onClose();
  };

  const handleClose = () => {
    setRows([]);
    setFileName("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Import Mappings"
      width={typeof window !== "undefined" ? Math.min(640, window.innerWidth - 32) : 640}
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
            onClick={handleImport}
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
            <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400">Fill it in, then upload it below.</p>
          </div>
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate} className="rounded-lg self-start sm:self-auto dark:!bg-slate-700 dark:!text-slate-100 dark:!border-slate-600">
            Template
          </Button>
        </div>

        <Upload.Dragger accept=".csv" showUploadList={false} beforeUpload={handleFile} className="!bg-white dark:!bg-slate-900/40 dark:!border-slate-700">
          <p className="text-[12px] sm:text-[13px] font-medium text-slate-700 dark:text-slate-300">
            <UploadOutlined className="mr-1.5" />
            Click or drag a CSV file to upload
          </p>
          {fileName && <p className="mt-1 text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400">{fileName}</p>}
        </Upload.Dragger>

        {rows.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-3 sm:gap-4 text-[11px] sm:text-[12px]">
              <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={13} /> {validCount} valid
              </span>
              <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                <AlertTriangle size={13} /> {rows.length - validCount} with errors
              </span>
            </div>
            <div className="max-h-56 overflow-x-auto overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[480px] text-left text-[11px] sm:text-[12px]">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Customer</th>
                    <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Customer Process ID</th>
                    <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Our Process ID</th>
                    <th className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-t border-slate-100 dark:border-slate-700 ${!row._valid ? "bg-rose-50/60 dark:bg-rose-900/20" : ""}`}>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.customer}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.customerProcessId}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.ourProcessId}</td>
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
