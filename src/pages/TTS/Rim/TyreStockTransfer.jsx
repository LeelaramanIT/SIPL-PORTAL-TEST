import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  memo,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, message } from "antd";
// import "antd/dist/reset.css";

import {
  ScanOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  BarcodeOutlined,
  CarOutlined,
  ClearOutlined,
  SendOutlined,
  RadarChartOutlined,
  ClockCircleOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  GetFactoryRefNo,
  scanFactoryBarcode,
  setScannedTyres,
  InsertTransaction,
  UpdateLoadDone,
  GetTransactionById,
  setFactoryRefNo,
  GetFactoryWarehouseDetails,
} from "../../../Redux/Slices/Warehouse/WarehouseSlice";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getStatusColor = (status) => {
  switch (status) {
    case "success":   return "#10b981";
    case "scanning":  return "#3b82f6";
    case "duplicate": return "#ef4444";
    default:          return "#6b7280";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "success":   return "✓ Ready";
    case "scanning":  return "◈ Scanning";
    case "duplicate": return "⚠ Duplicate";
    default:          return "● Ready";
  }
};

// ─── useResponsive ───────────────────────────────────────────────────────────

const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1200,
        isDesktop: width >= 1200,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenSize;
};

// ─── Primitive Tailwind UI pieces ────────────────────────────────────────────

const Tag = ({ color = "default", children, className = "", style = {} }) => {
  const colorMap = {
    blue:   "bg-blue-100 text-blue-700 border-blue-200",
    cyan:   "bg-cyan-100 text-cyan-700 border-cyan-200",
    green:  "bg-emerald-100 text-emerald-700 border-emerald-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    gold:   "bg-yellow-100 text-yellow-700 border-yellow-200",
    default:"bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorMap[color] || colorMap.default} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
};

const Badge = ({ color = "#3b82f6", text }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
    {text}
  </span>
);

const Divider = () => <hr className="my-3 border-slate-200" />;

const Progress = ({ percent = 0 }) => (
  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
    <div
      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all"
      style={{ width: `${Math.min(percent, 100)}%` }}
    />
  </div>
);

// ─── Tailwind Button ──────────────────────────────────────────────────────────

const TwButton = ({
  children, onClick, type = "default", block = false, disabled = false,
  loading = false, size = "md", icon = null, className = "", style = {},
  htmlType,
}) => {
  const baseClass = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all focus:outline-none";

  const sizeMap = {
    sm:  "text-xs px-3 h-8",
    md:  "text-sm px-4 h-9",
    lg:  "text-sm px-5 h-11",
    xl:  "text-base px-6 h-12",
  };

  const typeMap = {
    primary: disabled
      ? "bg-slate-300 text-white cursor-not-allowed"
      : "bg-gradient-to-br from-blue-500 to-blue-800 text-white hover:opacity-90 active:scale-95",
    danger:  "bg-red-500 text-white hover:bg-red-600 active:scale-95",
    text:    "bg-transparent text-slate-600 hover:bg-slate-100",
    default: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95",
  };

  return (
    <button
      type={htmlType || "button"}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${sizeMap[size]} ${typeMap[type]} ${block ? "w-full" : ""} ${className}`}
      style={style}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      ) : icon}
      {children}
    </button>
  );
};

// ─── Tailwind Input ───────────────────────────────────────────────────────────

const TwInput = React.forwardRef(({
  value, onChange, onPressEnter, placeholder, prefix, suffix,
  maxLength, className = "", style = {}, size = "md",
}, ref) => {
  const sizeMap = { sm: "h-8 text-xs", md: "h-10 text-sm", lg: "h-12 text-base" };
  return (
    <div className={`relative flex items-center border border-slate-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition ${sizeMap[size]}`} style={style}>
      {prefix && <span className="pl-3 pr-1 text-slate-400 flex-shrink-0">{prefix}</span>}
      <input
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        onKeyDown={(e) => e.key === "Enter" && onPressEnter?.()}
        className={`flex-1 h-full bg-transparent outline-none px-2 font-mono font-medium text-slate-800 placeholder-slate-400 ${className}`}
      />
      {suffix && <span className="pr-3 pl-1 flex-shrink-0">{suffix}</span>}
    </div>
  );
});

// ─── Custom Table ─────────────────────────────────────────────────────────────

const TwTable = ({ columns, dataSource, loading, size = "md", scroll, className = "", rowClassName }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Loading...
      </div>
    );
  }

  const cellPad = size === "small" ? "px-3 py-1.5" : "px-4 py-3";

  return (
    <div
      className={`overflow-auto ${className}`}
      style={scroll?.y ? { maxHeight: scroll.y, overflowY: "auto" } : {}}
    >
      <table className="w-full text-sm border-collapse" style={scroll?.x ? { minWidth: scroll.x } : {}}>
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`${cellPad} text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap`}
                style={{
                  width: col.width,
                  textAlign: col.align || "left",
                  ...(col.fixed === "right" ? { position: "sticky", right: 0, background: "#f8fafc", boxShadow: "-2px 0 4px rgba(0,0,0,0.05)" } : {}),
                  ...(col.fixed === "left"  ? { position: "sticky", left: 0,  background: "#f8fafc", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" } : {}),
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource?.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-400 text-sm">
                No items scanned yet
              </td>
            </tr>
          ) : (
            dataSource?.map((row, rIdx) => (
              <tr
                key={row.key ?? rIdx}
                className={`border-b border-slate-100 hover:bg-blue-50/40 transition ${rowClassName?.(row, rIdx) || ""}`}
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={cIdx}
                    className={`${cellPad} text-slate-700`}
                    style={{
                      textAlign: col.align || "left",
                      ...(col.fixed === "right" ? { position: "sticky", right: 0, background: "white", boxShadow: "-2px 0 4px rgba(0,0,0,0.05)" } : {}),
                      ...(col.fixed === "left"  ? { position: "sticky", left: 0,  background: "white", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" } : {}),
                    }}
                  >
                    {col.render ? col.render(row[col.dataIndex], row, rIdx) : row[col.dataIndex]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// ─── Custom Modal ─────────────────────────────────────────────────────────────

const TwModal = ({ open, onCancel, children, width = 450, centered = true }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(2px)" }}
        onClick={(e) => e.target === e.currentTarget && onCancel?.()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: "100%", maxWidth: width }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Custom Drawer ────────────────────────────────────────────────────────────

const TwDrawer = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(15,23,42,0.4)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-semibold text-slate-800 text-base">{title}</span>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition p-1 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Scan Status Bar ──────────────────────────────────────────────────────────

const ScanStatusBar = ({ scanStatus, compact = false }) => {
  const bgMap = {
    scanning:  "bg-blue-50 border-blue-400",
    success:   "bg-emerald-50 border-emerald-400",
    duplicate: "bg-red-50 border-red-400",
    ready:     "bg-slate-100 border-slate-300",
  };

  return (
    <motion.div
      animate={{
        boxShadow:
          scanStatus === "scanning"  ? "0 0 14px rgba(59,130,246,0.4)" :
          scanStatus === "success"   ? "0 0 14px rgba(16,185,129,0.3)" :
          "0 0 0px rgba(0,0,0,0)",
      }}
      className={`flex items-center gap-2 rounded-lg border px-3 ${compact ? "py-1.5" : "py-2"} ${bgMap[scanStatus] || bgMap.ready}`}
    >
      <motion.span
        animate={scanStatus === "scanning" ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ display: "inline-flex" }}
      >
        <RadarChartOutlined style={{ color: getStatusColor(scanStatus), fontSize: compact ? 12 : 14 }} />
      </motion.span>
      <span className="font-semibold text-xs" style={{ color: getStatusColor(scanStatus) }}>
        {getStatusLabel(scanStatus)}
      </span>
    </motion.div>
  );
};

// ─── ResponsiveHeader ─────────────────────────────────────────────────────────

const ResponsiveHeader = memo(({
  isMobile, isTablet, isDesktop,
  scannedTyresCount, completionPercentage, setMobileDrawerOpen,
  transferPlan, setTransferPlan,
  transferFrom, setTransferFrom,
  transferTo, setTransferTo,
  state, isTransactionLocked,
}) => {
  const isReceive     = state?.type === "RECEIVE";
  const isExistingMode = state?.mode === "EXISTING";
  const pageTitle     = isReceive ? "Stock Receive"        : "Stock Transfer";
  const subTitle      = isReceive ? "📥 Warehouse Receiving" : "📤 Factory → Warehouse";

  const { LocationDetails } = useSelector((s) => s.auth);
  const { factoryRefNo, factoryWarehouseDetails } = useSelector((s) => s.warehouse);
  const dispatch = useDispatch();

  useEffect(() => {
    if (LocationDetails?.length > 0 && !transferPlan) {
      setTransferPlan(LocationDetails[0].locationName);
    }
  }, [LocationDetails, transferPlan]);

  const selectedPlantDetails = factoryWarehouseDetails?.find((item) => item.plant === transferPlan);

  const selectW = isDesktop ? 220 : isTablet ? 170 : "100%";

  const SelectGroup = () => (
    <>
      <Select
        size="small"
        placeholder="Select Plan"
        style={{ width: selectW, fontSize: isDesktop ? 14 : 13 }}
        value={transferPlan}
        onChange={setTransferPlan}
        disabled={isTransactionLocked || isExistingMode}
        options={factoryWarehouseDetails?.map((item) => ({
          value: item.plant,
          label: `${item.plant} - ${item.factoryDetails}`,
        }))}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ minWidth: selectW, maxWidth: 300 }}
      />
      <Select
        size="small"
        placeholder="From Location"
        style={{ width: selectW, fontSize: isDesktop ? 14 : 13 }}
        value={transferFrom}
        onChange={setTransferFrom}
        disabled={isTransactionLocked || isExistingMode}
        options={selectedPlantDetails ? [{ value: selectedPlantDetails.factoryDetails, label: selectedPlantDetails.factoryDetails }] : []}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ minWidth: selectW, maxWidth: 300 }}
      />
      <Select
        size="small"
        placeholder="To Location"
        style={{ width: selectW, fontSize: isDesktop ? 14 : 13 }}
        value={transferTo}
        onChange={setTransferTo}
        disabled={isTransactionLocked || isExistingMode}
        options={selectedPlantDetails?.warehouses?.map((w) => ({ value: w, label: w })) || []}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ minWidth: selectW, maxWidth: 300 }}
      />
    </>
  );

  return (
    <header className="bg-gradient-to-br from-white to-slate-100 border-b border-slate-200 shadow-sm sticky top-0 z-[100]"
      style={{ minHeight: isMobile ? "auto" : 80 }}>
      <div className={`flex items-center justify-between flex-nowrap gap-3 ${isMobile ? "px-4 py-3" : isTablet ? "px-5 py-3" : "px-7 py-3"}`}>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 min-w-0">
          <h1 className={`font-bold text-slate-900 leading-tight m-0 whitespace-nowrap ${isMobile ? "text-[15px]" : isTablet ? "text-[17px]" : "text-[19px]"}`}>
            {pageTitle}
          </h1>
          <p className={`text-slate-500 font-medium uppercase tracking-wide m-0 whitespace-nowrap ${isMobile ? "text-[10px]" : isTablet ? "text-[11px]" : "text-[12px]"}`}>
            {subTitle}
          </p>
        </motion.div>

        {/* Desktop / Tablet selects */}
        {!isMobile && (
          <div className="flex-1 flex items-center gap-3 min-w-0 overflow-x-auto">
            <SelectGroup />
          </div>
        )}

        {/* REF number */}
        {!isMobile && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex-shrink-0">
            <div className="bg-gradient-to-br from-blue-500 to-blue-800 px-4 py-2 rounded-lg text-white text-center min-w-[80px]">
              <span className="block text-[10px] text-blue-100 font-semibold leading-tight tracking-wide">REF #</span>
              <span className={`font-bold font-mono text-white leading-tight block whitespace-nowrap ${isDesktop ? "text-[18px]" : "text-[14px]"}`}>
                {factoryRefNo}
              </span>
            </div>
          </motion.div>
        )}

        {/* Mobile menu button */}
        {isMobile && (
          <button onClick={() => setMobileDrawerOpen(true)} className="text-slate-600 p-1 flex-shrink-0">
            <MenuOutlined style={{ fontSize: 20 }} />
          </button>
        )}
      </div>

      {/* Mobile selects row */}
      {isMobile && (
        <div className="flex gap-1.5 px-4 pb-3 w-full">
          <div className="flex-1 min-w-0">
            <Select
              size="small" placeholder="Plant"
              disabled={isTransactionLocked}
              style={{ width: "100%", fontSize: 11 }}
              value={transferPlan} onChange={setTransferPlan}
              options={factoryWarehouseDetails?.map((item) => ({ value: item.plant, label: `${item.plant} - ${item.factoryDetails}` }))}
              dropdownMatchSelectWidth={false} dropdownStyle={{ minWidth: 120 }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <Select
              size="small" placeholder="From"
              disabled={isTransactionLocked}
              style={{ width: "100%", fontSize: 11 }}
              value={transferFrom} onChange={setTransferFrom}
              options={selectedPlantDetails ? [{ value: selectedPlantDetails.factoryDetails, label: selectedPlantDetails.factoryDetails }] : []}
              dropdownMatchSelectWidth={false} dropdownStyle={{ minWidth: 120 }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <Select
              size="small" placeholder="To"
              disabled={isTransactionLocked}
              style={{ width: "100%", fontSize: 11 }}
              value={transferTo} onChange={setTransferTo}
              options={selectedPlantDetails?.warehouses?.map((w) => ({ value: w, label: w })) || []}
              dropdownMatchSelectWidth={false} dropdownStyle={{ minWidth: 120 }}
            />
          </div>
        </div>
      )}
    </header>
  );
});

// ─── Preview Card (Tyre Details) ─────────────────────────────────────────────

const PreviewCard = ({ previewTyre, setPreviewTyre, saveTyre, addLoading, isDesktop, isTablet }) => (
  <motion.div
    key="preview"
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="flex flex-col flex-1 min-h-0"
  >
    <div className="flex flex-col flex-1 rounded-xl border-2 border-blue-500 bg-gradient-to-br from-slate-50 to-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-800">
        <span className={`font-semibold text-white ${isDesktop ? "text-base" : "text-xs"}`}>Item Details</span>
        <Tag color="gold">Pending</Tag>
      </div>

      {/* Descriptions */}
      <div className="flex-1 overflow-y-auto">
        {[
          { label: "Barcode",    value: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">{previewTyre.barcode}</code> },
          { label: "Process ID", value: <strong>{previewTyre.processID}</strong> },
          { label: "Brand",      value: <Badge color="#3b82f6" text={<strong>{previewTyre.brand}</strong>} /> },
          { label: "Sidewall",   value: <Badge color="#3b82f6" text={<strong>{previewTyre.sidewall}</strong>} /> },
          { label: "Tyre Size",  value: <strong>{previewTyre.tyreSize}</strong> },
          { label: "Rim Size",   value: <strong>{previewTyre.rimSize}</strong> },
          { label: "Tyre Type",  value: <Tag color="cyan">{previewTyre.tyreType}</Tag> },
          { label: "Grade",      value: <Tag color={previewTyre.grade === "A" ? "green" : "orange"}>{previewTyre.grade}</Tag> },
          { label: "Stencil No", value: <span className="text-slate-500 text-sm">{previewTyre.stencilNo}</span> },
        ].map(({ label, value }, i) => (
          <div key={i} className="flex border-b border-slate-100 last:border-b-0">
            <div className={`bg-slate-50 font-semibold text-slate-700 border-r border-slate-100 flex-shrink-0 flex items-center ${isDesktop ? "w-28 px-4 py-3 text-sm" : "w-24 px-3 py-2 text-xs"}`}>
              {label}
            </div>
            <div className={`flex-1 flex items-center text-slate-800 ${isDesktop ? "px-4 py-3 text-sm" : "px-3 py-2 text-xs"}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className={`border-t border-slate-200 flex gap-2 ${isDesktop ? "px-6 py-4" : "px-3 py-2"}`}>
        <TwButton block onClick={() => setPreviewTyre(null)} size={isDesktop ? "lg" : "sm"} className="flex-1">
          Discard
        </TwButton>
        <TwButton type="primary" block onClick={saveTyre} loading={addLoading} size={isDesktop ? "lg" : "sm"}
          className="flex-1"
          style={{ background: "linear-gradient(135deg,#10b981 0%,#059669 100%)", border: "none" }}>
          Add
        </TwButton>
      </div>
    </div>
  </motion.div>
);

// ─── ResponsiveContent ────────────────────────────────────────────────────────

const ResponsiveContent = memo(({
  isMobile, isTablet, isDesktop,
  scanStatus, barcodeInput, setBarcodeInput, handleScan, isScanning,
  lastScannedTime, inputRef, previewTyre, setPreviewTyre, saveTyre,
  scannedTyres, setShowConfirmModal, columns,
  transferPlan, transferFrom, transferTo,
  groupedTyres, tableLoading, addLoading,
}) => {
  const isSelectionMissing = !transferPlan || !transferFrom || !transferTo;

  // ── Mobile layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <main className="flex-1 p-2 overflow-hidden flex flex-col">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col gap-3 h-full">

          {/* Scanner Card */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-sm p-3">
            <div className="mb-2.5">
              <ScanStatusBar scanStatus={scanStatus} compact />
            </div>
            <TwInput
              ref={inputRef}
              value={barcodeInput}
              placeholder="Scan or enter..."
              prefix={<BarcodeOutlined style={{ color: "#64748b" }} />}
              onPressEnter={handleScan}
              onChange={(e) => setBarcodeInput(e.target.value)}
              size="md"
              className="mb-2.5 font-mono"
            />
            <TwButton type="primary" block onClick={handleScan} loading={isScanning} disabled={isSelectionMissing}
              size="lg"
              style={isSelectionMissing ? { background: "#cbd5e1" } : { background: "linear-gradient(135deg,#3b82f6 0%,#1e40af 100%)", border: "none" }}>
              Scan
            </TwButton>
            {lastScannedTime && (
              <p className="text-slate-400 text-[11px] mt-2 flex items-center gap-1">
                <ClockCircleOutlined /> {lastScannedTime.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Preview */}
          <AnimatePresence>
            {previewTyre && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                <div className="rounded-xl border-2 border-blue-500 bg-gradient-to-br from-slate-50 to-white shadow-xl overflow-hidden">
                  <div className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-800 flex justify-between items-center">
                    <span className="text-white font-semibold text-xs">Details</span>
                    <Tag color="gold" className="text-[10px]">Pending</Tag>
                  </div>
                  <div className="p-3 space-y-2">
                    {[
                      { label: "Brand",    value: previewTyre.brand },
                      { label: "Size",     value: previewTyre.size },
                      { label: "Category", value: previewTyre.category },
                    ].map(({ label, value }, i) => (
                      <div key={i}>
                        <span className="text-slate-400 text-[10px]">{label}</span>
                        <strong className="block text-sm text-slate-800">{value}</strong>
                      </div>
                    ))}
                    <div className="flex gap-1.5 mt-3">
                      <TwButton block onClick={() => setPreviewTyre(null)} size="sm" className="flex-1">Discard</TwButton>
                      <TwButton type="primary" block onClick={saveTyre} loading={addLoading} size="sm" className="flex-1"
                        style={{ background: "linear-gradient(135deg,#10b981 0%,#059669 100%)", border: "none" }}>
                        Add
                      </TwButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          {scannedTyres.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 flex flex-col flex-[2] overflow-hidden">
              <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">Items ({scannedTyres.length})</span>
              </div>
              <div className="flex-1 overflow-auto">
                <TwTable
                  className="responsive-transfer-table"
                  loading={tableLoading}
                  columns={columns}
                  dataSource={(Array.isArray(scannedTyres) ? scannedTyres : []).map((t, i) => ({ ...t, key: i }))}
                  size="small"
                  scroll={{ x: 1060 }}
                />
              </div>
            </div>
          )}

          {/* Submit bar */}
          {scannedTyres.length > 0 && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl px-3 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white/60 text-[10px] block">READY</span>
                  <strong className="text-white text-base">{scannedTyres.length} items</strong>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <TwButton type="primary" icon={<SendOutlined />} onClick={() => setShowConfirmModal(true)}
                    size="md"
                    style={{ background: "#10b981", border: "none" }}>
                    Submit
                  </TwButton>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    );
  }

  // ── Desktop / Tablet layout ────────────────────────────────────────────────
  return (
    <main className={`flex-1 flex overflow-hidden min-h-0 ${isTablet ? "p-4" : "p-6 px-8"}`}>
      <div className={`flex gap-${isTablet ? "3" : "6"} w-full min-h-0`}>

        {/* Left column */}
        <div className={`flex flex-col gap-${isTablet ? "3" : "5"} min-h-0 ${isTablet ? "w-[42%]" : "w-[33%]"}`}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className={`bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-sm ${isTablet ? "p-2" : "p-3"}`}>
              <div className="mb-3">
                <ScanStatusBar scanStatus={scanStatus} compact={isTablet} />
              </div>
              <div className="mb-3">
                <TwInput
                  ref={inputRef}
                  value={barcodeInput}
                  placeholder="Scan barcode..."
                  prefix={<BarcodeOutlined style={{ color: "#64748b" }} />}
                  onPressEnter={handleScan}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  size={isDesktop ? "md" : "sm"}
                  style={{ fontFamily: "monospace", fontSize: isDesktop ? 16 : 12, fontWeight: 500 }}
                  suffix={isScanning ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                      <ScanOutlined style={{ color: "#3b82f6", fontSize: isDesktop ? 18 : 12 }} />
                    </motion.span>
                  ) : null}
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TwButton type="primary" block onClick={handleScan} loading={isScanning} disabled={isSelectionMissing}
                  size={isDesktop ? "xl" : "md"}
                  style={isSelectionMissing
                    ? { background: "#cbd5e1", border: "none" }
                    : { background: "linear-gradient(135deg,#3b82f6 0%,#1e40af 100%)", border: "none" }}>
                  Manual Scan
                </TwButton>
              </motion.div>
              {lastScannedTime && (
                <p className="text-slate-400 text-[11px] mt-2.5 flex items-center gap-1">
                  <ClockCircleOutlined /> {lastScannedTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </motion.div>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              {previewTyre ? (
                <PreviewCard
                  previewTyre={previewTyre}
                  setPreviewTyre={setPreviewTyre}
                  saveTyre={saveTyre}
                  addLoading={addLoading}
                  isDesktop={isDesktop}
                  isTablet={isTablet}
                />
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
                  <div className="h-full border-2 border-dashed border-slate-300 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-slate-300 text-4xl mb-2">⬡</div>
                      <p className="text-slate-400 text-xs">Ready to scan</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right column */}
        <div className="flex-1 flex flex-col min-h-0">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="flex-1 flex flex-col min-h-0">
            <div className={`flex flex-col flex-1 min-h-0 rounded-${isTablet ? "xl" : "2xl"} border border-slate-200 shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50`}>

              {/* Table header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-2.5 flex items-center justify-between rounded-t-xl flex-shrink-0">
                <div>
                  <h2 className={`text-white font-bold m-0 ${isDesktop ? "text-[18px]" : "text-sm"}`}>Transfer List</h2>
                  <p className="text-white/60 text-[11px] mt-0.5 m-0">
                    {scannedTyres.length} item{scannedTyres.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-white/60 text-[10px] block mb-0.5">TOTAL</span>
                  <strong className={`text-white ${isDesktop ? "text-[22px]" : "text-base"}`}>{scannedTyres.length}</strong>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <TwTable
                  className="responsive-transfer-table"
                  loading={tableLoading}
                  columns={columns}
                  dataSource={groupedTyres.map((item, i) => ({ ...item, key: i }))}
                  size={isDesktop ? "md" : "small"}
                  scroll={
                    isDesktop
                      ? { y: "calc(100vh - 320px)" }
                      : { x: 1060, y: `calc(100vh - ${isTablet ? "260px" : "280px"})` }
                  }
                  rowClassName={(_, index) => (index === 0 ? "row-highlight" : "")}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
});

// ─── ResponsiveFooter ─────────────────────────────────────────────────────────

const ResponsiveFooter = memo(({
  isMobile, isTablet, isDesktop,
  scannedTyresCount, setScannedTyres, setShowConfirmModal,
}) => {
  const dispatch = useDispatch();
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className={`bg-gradient-to-br from-white to-slate-100 border-t border-slate-200 shadow-[0_-1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3
        ${isMobile ? "flex-col px-2 py-2 min-h-auto" : `flex-row ${isTablet ? "px-3 py-2.5" : "px-8 py-2.5"} min-h-[60px]`}`}
    >
      <div className={`flex items-center gap-2 ${isMobile ? "text-[11px]" : isDesktop ? "text-[15px]" : "text-xs"}`}>
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: scannedTyresCount > 0 ? "linear-gradient(135deg,#3b82f6,#1e40af)" : "#cbd5e1" }}
        />
        <strong className="text-slate-700">
          {scannedTyresCount > 0 ? "Ready for Transfer" : "Awaiting Items"}
        </strong>
      </div>

      <div className={`flex gap-2 ${isMobile ? "w-full" : ""}`}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={isMobile ? "flex-1 flex" : "flex"}>
          {/* Clear button (commented out same as original) */}
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={isMobile ? "flex-1 flex" : "flex"}>
          <TwButton
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setShowConfirmModal(true)}
            disabled={scannedTyresCount === 0}
            size={isDesktop ? "md" : "sm"}
            block={isMobile}
            style={scannedTyresCount > 0
              ? { background: "linear-gradient(135deg,#10b981 0%,#059669 100%)", border: "none", minWidth: isMobile ? "auto" : isDesktop ? 180 : 140 }
              : { minWidth: isMobile ? "auto" : isDesktop ? 180 : 140 }}>
            {isMobile ? "Submit" : `Submit (${scannedTyresCount})`}
          </TwButton>
        </motion.div>
      </div>
    </motion.footer>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TyreStockTransferRedesign() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [previewTyre, setPreviewTyre]             = useState(null);
  const [barcodeInput, setBarcodeInput]           = useState("");
  const [isScanning, setIsScanning]               = useState(false);
  const [showConfirmModal, setShowConfirmModal]   = useState(false);
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [scanStatus, setScanStatus]               = useState("ready");
  const [lastScannedTime, setLastScannedTime]     = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen]   = useState(false);
  const [transferPlan, setTransferPlan]           = useState(null);
  const [transferFrom, setTransferFrom]           = useState(null);
  const [transferTo, setTransferTo]               = useState(null);
  const [isTransactionLocked, setIsTransactionLocked] = useState(false);
  const [activeTransactionId, setActiveTransactionId] = useState(null);
  const [isRestoring, setIsRestoring]             = useState(true);
  const [tableLoading, setTableLoading]           = useState(false);
  const [addLoading, setAddLoading]               = useState(false);

  const { state }           = useLocation();
  const { LocationDetails } = useSelector((s) => s.auth);
  const { factoryRefNo }    = useSelector((s) => s.warehouse);
  const scannedTyres        = useSelector((s) =>
    Array.isArray(s.warehouse.scannedTyres) ? s.warehouse.scannedTyres : []
  );

  const [vehicleForm, setVehicleForm] = useState({ vehicleNumber: "" });
  const [vehicleError, setVehicleError] = useState("");

  const dispatch    = useDispatch();
  const transferData = state?.transferData;
  const inputRef    = useRef(null);

  console.log("transferData", transferData);
  console.log("scannedTyres", scannedTyres);

  useEffect(() => { dispatch(GetFactoryWarehouseDetails()); }, []);

  useEffect(() => {
    if (state?.mode === "EXISTING" && transferData) {
      setIsTransactionLocked(true);
      setActiveTransactionId(transferData.tM_ID);
      setTransferFrom(transferData.from);
      setTransferTo(transferData.to);
      dispatch(setFactoryRefNo(transferData.id));
      if (transferData.plant) setTransferPlan(transferData.plant);
      dispatch(GetTransactionById(transferData.tM_ID, transferData.statusNo)).then((res) => {
        dispatch(setScannedTyres(res?.data?.data || []));
      });
    }
  }, [state]);

  useEffect(() => {
    if (LocationDetails?.length > 0 && !transferPlan) {
      setTransferPlan(LocationDetails[0].locationName);
    }
  }, [LocationDetails, transferPlan]);

  useEffect(() => {
    if (transferPlan && !activeTransactionId && isRestoring === false) {
      dispatch(GetFactoryRefNo(transferPlan));
    }
  }, [transferPlan, activeTransactionId, isRestoring]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (state?.mode !== "EXISTING") {
      dispatch(setScannedTyres([]));
      sessionStorage.removeItem("activeFactoryTransfer");
      setActiveTransactionId(null);
      setIsTransactionLocked(false);
    }
  }, []);

  const handleScan = useCallback(async () => {
    if (!transferPlan || !transferFrom || !transferTo) {
      message.warning("⚠ Please select Plan, From, and To locations first");
      return;
    }
    if (!barcodeInput.trim()) { message.error("Please scan a barcode"); return; }
    if (Array.isArray(scannedTyres) && scannedTyres.some((t) => t.barcode === barcodeInput)) {
      setScanStatus("duplicate");
      message.warning("Barcode already scanned");
      setBarcodeInput("");
      return;
    }

    setScanStatus("scanning");
    setIsScanning(true);
    setTableLoading(true);

    try {
      const payload = { barcode: barcodeInput, stencilNo: barcodeInput.slice(8, -1), plant: transferPlan };
      const res  = await dispatch(scanFactoryBarcode(payload));
      const data = res.data?.data;
      if (!data) { message.error("No data found"); return; }

      setPreviewTyre({
        id: data.id, barcode: data.barcode, config: data.config,
        tyreSize: data.tyresize, rimSize: data.rimsize, tyreType: data.tyretype,
        brand: data.brand, sidewall: data.sidewall, processID: data.processID,
        stencilNo: data.stencilno, grade: data.grade,
      });

      setScanStatus("success");
      setLastScannedTime(new Date());
      setBarcodeInput("");
      setTimeout(() => setScanStatus("ready"), 1500);
    } catch (err) {
      message.error(err?.response?.data?.message || "Scan failed");
      setScanStatus("ready");
    } finally {
      setIsScanning(false);
      setTableLoading(false);
    }
  }, [barcodeInput, scannedTyres, transferPlan]);

  const saveTyre = useCallback(async () => {
    if (!previewTyre) return;
    try {
      setAddLoading(true);
      setTableLoading(true);

      const payload = {
        dcno: factoryRefNo, usename: "ADMIN", plant: transferPlan,
        pwD_ID: previewTyre.id, barcode: previewTyre.barcode,
        processID: previewTyre.processID, stencilNo: previewTyre.stencilNo,
        grade: previewTyre.grade, factoryUser: "ADMIN",
        send: transferFrom, recevie: transferTo,
        config: previewTyre.config, tyreSize: previewTyre.tyreSize,
        rimSize: previewTyre.rimSize, tyreType: previewTyre.tyreType,
        brand: previewTyre.brand, sidewall: previewTyre.sidewall,
      };

      const res  = await dispatch(InsertTransaction(payload));
      const data = res?.data?.data;
      let currentTransactionId = activeTransactionId;

      if (!activeTransactionId && data?.tM_ID) {
        currentTransactionId = data.tM_ID;
        setActiveTransactionId(data.tM_ID);
        setIsTransactionLocked(true);
      }

      const updated = await dispatch(GetTransactionById(currentTransactionId, transferData?.statusNo || 46));
      dispatch(setScannedTyres(updated?.data?.data || []));
      setPreviewTyre(null);
      message.success("✓ Tyre added successfully");
      inputRef.current?.focus();
    } catch (err) {
      setScanStatus("duplicate");
      message.error(err?.response?.data?.message || "Add failed");
      setTimeout(() => setScanStatus("ready"), 2000);
    } finally {
      setAddLoading(false);
      setTableLoading(false);
    }
  }, [previewTyre, transferPlan, transferFrom, transferTo, factoryRefNo, activeTransactionId]);

  const deleteTyre = useCallback((index) => {
    dispatch(setScannedTyres(scannedTyres.filter((_, i) => i !== index)));
    message.info("Tyre removed");
  }, [scannedTyres]);

  const groupedTyres = useMemo(() => {
    const grouped = {};
    console.log("------------------------------", scannedTyres);
    scannedTyres.forEach((item) => {
      const key = item.processID;
      if (!grouped[key]) {
        grouped[key] = {
          config: item.config, barcode: item.barcode, stencilNo: item.stencilNo,
          grade: item.grade, sideWall: item.sideWall, processID: item.processID,
          brand: item.brand, tyreSize: item.tyreSize, rimSize: item.rimSize,
          tyreType: item.tyreType, qty: 1,
        };
      } else {
        grouped[key].qty += 1;
      }
    });
    return Object.values(grouped);
  }, [scannedTyres]);

  const columns = useMemo(() => {
    const tw = { fontSize: isDesktop ? 14 : 11, wordBreak: "break-word", lineHeight: 1.35 };
    return [
      { title: "Platform",   dataIndex: "config",    width: 140, render: (t) => <strong style={tw}>{t}</strong> },
      { title: "Brand",      dataIndex: "brand",     width: 100, render: (t) => <Tag color="blue" style={{ fontSize: isDesktop ? 13 : 10 }}>{t}</Tag> },
      { title: "SideWall",   dataIndex: "sideWall",  width: 100, render: (t) => <Tag color="blue" style={{ fontSize: isDesktop ? 13 : 10 }}>{t}</Tag> },
      { title: "Tyre Size",  dataIndex: "tyreSize",  width: 140, render: (t) => <span style={tw}>{t}</span> },
      { title: "Rim Size",   dataIndex: "rimSize",   width: 100, render: (t) => <span style={tw}>{t}</span> },
      { title: "Tyre Type",  dataIndex: "tyreType",  width: 120, render: (t) => <Tag color="cyan" style={{ fontSize: isDesktop ? 13 : 10 }}>{t}</Tag> },
      { title: "Process ID", dataIndex: "processID", width: 140, render: (t) => <strong style={tw}>{t}</strong> },
      { title: "Grade",      dataIndex: "grade",     width: 80,  render: (t) => <Tag color={t === "A" ? "green" : "orange"} style={{ fontSize: isDesktop ? 13 : 10 }}>{t}</Tag> },
      {
        title: "Qty", dataIndex: "qty", width: isDesktop ? 100 : 70,
        fixed: isDesktop ? undefined : "right", align: "center",
        render: (t) => <Tag color="green">{t || 1}</Tag>,
      },
    ];
  }, [isDesktop]);

  const completionPercentage = Math.min(
    ((scannedTyres.length || 0) / Math.max(scannedTyres.length || 1, 10)) * 100,
    100,
  );

  const restoreTransaction = async () => {
    try {
      setIsRestoring(true);
      const saved = sessionStorage.getItem("activeFactoryTransfer");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      dispatch(setFactoryRefNo(parsed.refNo));
      const res  = await dispatch(GetTransactionById(parsed.transactionId));
      const data = res?.data?.data;
      if (!data) {
        sessionStorage.removeItem("activeFactoryTransfer");
        dispatch(GetFactoryRefNo(transferPlan));
        return;
      }
      setActiveTransactionId(data.id);
      setTransferPlan(parsed.plant);
      setTransferFrom(parsed.from);
      setTransferTo(parsed.to);
      setIsTransactionLocked(true);
      dispatch(setScannedTyres(Array.isArray(data?.items) ? data.items : []));
    } catch (err) {
      console.log(err);
    } finally {
      setIsRestoring(false);
    }
  };

  useEffect(() => { restoreTransaction(); }, []);

  const handleConfirmSubmit = async () => {
    if (!vehicleForm.vehicleNumber.trim()) {
      setVehicleError("Required");
      return;
    }
    setVehicleError("");
    try {
      setIsSubmitting(true);
      const payload = { id: scannedTyres?.[0]?.tM_ID || 0, vehicleNo: vehicleForm.vehicleNumber };
      const res = await dispatch(UpdateLoadDone(payload));
      message.success(res?.data?.message || "✓ Load completed successfully");
      dispatch(setScannedTyres([]));
      sessionStorage.removeItem("activeFactoryTransfer");
      setActiveTransactionId(null);
      setIsTransactionLocked(false);
      dispatch(GetFactoryRefNo(transferPlan));
      message.info("Cleared");
      setVehicleForm({ vehicleNumber: "" });
      setShowConfirmModal(false);
    } catch (err) {
      message.error(err?.message || err?.data?.message || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ResponsiveHeader
        isMobile={isMobile} isTablet={isTablet} isDesktop={isDesktop}
        scannedTyresCount={scannedTyres.length}
        completionPercentage={completionPercentage}
        setMobileDrawerOpen={setMobileDrawerOpen}
        transferPlan={transferPlan} setTransferPlan={setTransferPlan}
        transferFrom={transferFrom} setTransferFrom={setTransferFrom}
        transferTo={transferTo} setTransferTo={setTransferTo}
        state={state} isTransactionLocked={isTransactionLocked}
      />

      <ResponsiveContent
        isMobile={isMobile} isTablet={isTablet} isDesktop={isDesktop}
        scanStatus={scanStatus}
        barcodeInput={barcodeInput} setBarcodeInput={setBarcodeInput}
        handleScan={handleScan} isScanning={isScanning}
        lastScannedTime={lastScannedTime} inputRef={inputRef}
        previewTyre={previewTyre} setPreviewTyre={setPreviewTyre}
        saveTyre={saveTyre}
        scannedTyres={scannedTyres} setShowConfirmModal={setShowConfirmModal}
        columns={columns}
        transferPlan={transferPlan} transferFrom={transferFrom} transferTo={transferTo}
        groupedTyres={groupedTyres} tableLoading={tableLoading} addLoading={addLoading}
      />

      <ResponsiveFooter
        isMobile={isMobile} isTablet={isTablet} isDesktop={isDesktop}
        scannedTyresCount={scannedTyres.length}
        setScannedTyres={setScannedTyres} setShowConfirmModal={setShowConfirmModal}
      />

      {/* Mobile Drawer */}
      <TwDrawer title="Transfer Details" open={isMobile && mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)}>
        <div className="space-y-1">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Reference Number</p>
            <code className="block mt-1 text-sm bg-slate-100 px-2 py-1 rounded">{factoryRefNo}</code>
          </div>
          <Divider />
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Progress</p>
            <Progress percent={completionPercentage} />
            <p className="text-xs mt-2 text-slate-600">{scannedTyres.length} of 10 items scanned</p>
          </div>
          <Divider />
          <TwButton type="primary" block
            onClick={() => { setShowConfirmModal(true); setMobileDrawerOpen(false); }}
            disabled={scannedTyres.length === 0}
            size="lg"
            style={{ background: "linear-gradient(135deg,#10b981 0%,#059669 100%)", border: "none" }}>
            Submit Transfer
          </TwButton>
        </div>
      </TwDrawer>

      {/* Confirm Modal */}
      <TwModal open={showConfirmModal} onCancel={() => setShowConfirmModal(false)}
        width={isMobile ? "95vw" : isTablet ? 400 : 450} centered>
        {/* Modal header */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 py-8 text-center">
          <CheckCircleOutlined style={{ fontSize: 36, color: "white", display: "block", marginBottom: 10 }} />
          <h3 className={`text-white font-bold m-0 ${isMobile ? "text-lg" : "text-xl"}`}>Finalize Transfer</h3>
          <p className="text-emerald-100 text-sm mt-1.5 m-0">{scannedTyres.length} items ready</p>
        </div>

        {/* Modal body */}
        <div className={isMobile ? "p-4" : "p-6"}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Vehicle Number <span className="text-red-500">*</span>
            </label>
            <TwInput
              value={vehicleForm.vehicleNumber}
              onChange={(e) => { setVehicleForm({ vehicleNumber: e.target.value }); setVehicleError(""); }}
              placeholder="e.g., TN-01-AB-1234"
              prefix={<CarOutlined style={{ color: "#64748b" }} />}
              size={isMobile ? "md" : "lg"}
            />
            {vehicleError && <p className="text-red-500 text-xs mt-1">{vehicleError}</p>}
          </div>

          <TwButton type="primary" block onClick={handleConfirmSubmit} loading={isSubmitting}
            size={isMobile ? "lg" : "xl"}
            style={{ background: "linear-gradient(135deg,#10b981 0%,#059669 100%)", border: "none", marginBottom: 8 }}>
            Confirm & Dispatch
          </TwButton>
          <TwButton block onClick={() => setShowConfirmModal(false)} size={isMobile ? "md" : "lg"}>
            Cancel
          </TwButton>
        </div>
      </TwModal>

      <style>{`
        .row-highlight {
          background: linear-gradient(90deg,rgba(59,130,246,0.08) 0%,transparent 100%) !important;
          animation: slideInTable 0.4s ease-out;
        }
        @keyframes slideInTable {
          from { opacity:0; transform:translateX(-20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .responsive-transfer-table tbody tr:hover td { background: rgba(59,130,246,0.04) !important; }
        @media (max-width:768px) {
          .responsive-transfer-table { overflow-x:auto; }
          .responsive-transfer-table td, .responsive-transfer-table th {
            white-space:normal !important; word-break:break-word !important; vertical-align:top !important;
          }
        }
        @media (hover:none) and (pointer:coarse) {
          button, input { min-height:36px; }
        }
      `}</style>
    </div>
  );
}