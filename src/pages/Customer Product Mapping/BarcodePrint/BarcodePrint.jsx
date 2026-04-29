import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Barcode,
  User,
  ClipboardList,
  Filter,
  X,
  ChevronDown,
  Check,
  PackageX,
  Printer,
  QrCode,
  Loader
} from "lucide-react";
import { Select, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { printSingleBarcode } from "../../../Redux/Slices/Customer_Item_Management/BarcodeSlice.jsx/BarcodeSlice"; // Update path
import { customers, workOrders, itemsByWorkOrder } from "../data/mockData";

const emptyFilters = {
  platform: "",
  tyreSize: "",
  rimSize: "",
  brand: "",
  sidewall: "",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function TyreBarcodeGenerator() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.CIMBarcode);

  const [mode, setMode] = useState("bulk");
  const [customer, setCustomer] = useState(null);
  const [workOrder, setWorkOrder] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [bulkSelected, setBulkSelected] = useState([]);
  
  // Input mode states
  const [barcodeInput, setBarcodeInput] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [barcodeData, setBarcodeData] = useState(null);

  useEffect(() => {
    setCustomer(null);
    setWorkOrder(null);
    setFilters(emptyFilters);
    setBulkSelected([]);
    setBarcodeInput("");
    setQuantity(1);
    setBarcodeData(null);
  }, [mode]);

  useEffect(() => {
    setWorkOrder(null);
    setBulkSelected([]);
  }, [customer]);

  useEffect(() => {
    setFilters(emptyFilters);
    setBulkSelected([]);
  }, [workOrder]);

  const rawItems = useMemo(
    () => (workOrder ? itemsByWorkOrder[workOrder] || [] : []),
    [workOrder],
  );

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) =>
      Object.entries(filters).every(([k, v]) => !v || item[k] === v),
    );
  }, [rawItems, filters]);

  const availableWorkOrders = customer ? workOrders[customer] || [] : [];

  const handleBulkSelect = (id) => {
    setBulkSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Handle barcode scan in input mode
  const handleBarcodeScan = async (barcode) => {
    if (!barcode.trim()) return;

    try {
      // Dispatch the Redux thunk action
      const result = await dispatch(printSingleBarcode(barcode));
      
      if (result.statusCode === 200) {
        setBarcodeData(result);
        message.success(`Barcode ${barcode} scanned and printed successfully!`);
        // Auto-clear after successful print
        setTimeout(() => {
          setBarcodeInput("");
          setBarcodeData(null);
        }, 3000);
      }else{

      }
    } catch (error) {
      message.error(`Failed to process barcode: ${error.message}`);
      console.error("Barcode scan error:", error);
    }
  };

  // Trigger scan on Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && mode === "input" && barcodeInput.trim()) {
      handleBarcodeScan(barcodeInput);
    }
  };

  const handlePrint = () => {
    if (mode === "bulk") {
      const selectedItems = filteredItems.filter((i) =>
        bulkSelected.includes(i.id),
      );
      console.log("🖨️ Bulk Print:", selectedItems);
      alert(
        `Printing ${selectedItems.length} items (total ${selectedItems.reduce((s, i) => s + i.stock, 0)} barcodes)`,
      );
    }
  };

  const clearAll = () => {
    setCustomer(null);
    setWorkOrder(null);
    setFilters(emptyFilters);
    setBulkSelected([]);
    setBarcodeInput("");
    setQuantity(1);
    setBarcodeData(null);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <header className="shrink-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center shadow-sm"
              >
                <Barcode className="text-white dark:text-slate-900" size={20} />
              </motion.div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white">
                  Tyre Barcode System
                </h1>
                <p className="text-xs text-slate-500">
                  {mode === "input" ? "Single barcode scan & print" : "Bulk label generation & print"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ModeToggle mode={mode} onChange={setMode} />
              <button
                onClick={clearAll}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                title="Reset All"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Using calc() for height */}
      <main className="flex-1 min-h-0 overflow-hidden w-full">
        <div className="h-full max-w-screen-2xl mx-auto w-full p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="h-full flex flex-col gap-4 overflow-hidden"
            >
              {/* INPUT MODE - Side by Side Layout */}
              {mode === "input" && (
                <motion.div 
                  variants={itemVariants}
                  className="h-full grid grid-cols-5 gap-4 min-h-0"
                >
                  {/* LEFT COLUMN - Barcode Input (col-span-2) */}
                  <div className="col-span-2 flex flex-col gap-4 h-full overflow-hidden min-h-0">
                    {/* Input Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4 flex-shrink-0">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                          📱 Scan or Enter Barcode
                        </label>
                        <input
                          type="text"
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Press ENTER to scan..."
                          disabled={loading}
                          className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:text-white text-base font-medium transition-all disabled:opacity-50"
                          autoFocus
                        />
                        <p className="text-xs text-slate-400 mt-2.5">
                          No need to select customer. Just scan and print.
                        </p>
                      </div>

                      {/* Status Display */}
                      <motion.div 
                        animate={{ scale: loading ? 1.02 : 1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        {loading ? (
                          <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                        ) : barcodeData ? (
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : barcodeInput.trim() ? (
                          <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
                        ) : (
                          <Barcode className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {loading ? "Processing barcode..." : barcodeData ? "✅ Printed successfully" : barcodeInput.trim() ? "Ready to scan" : "Waiting for input"}
                          </p>
                          {barcodeData && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {barcodeData?.zplCode ? "Label generated & printing" : "Data retrieved"}
                            </p>
                          )}
                        </div>
                      </motion.div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Barcode</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                            {barcodeInput || "—"}
                          </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Quantity</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {quantity}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex-shrink-0">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        💡 Tip: Scan a barcode and press Enter to print instantly
                      </p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN - Preview (col-span-3) */}
                  <div className="col-span-3 flex flex-col h-full overflow-hidden min-h-0">
                    {barcodeInput.trim().length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full flex flex-col overflow-hidden"
                      >
                        <SingleBarcodePreview 
                          barcode={barcodeInput}
                          data={barcodeData}
                          loading={loading}
                        />
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <QrCode size={56} className="text-slate-300 dark:text-slate-700 mb-3" />
                        <p className="text-slate-600 dark:text-slate-400 font-medium text-center">
                          Preview will appear here
                        </p>
                        <p className="text-xs text-slate-400 mt-2 text-center px-4">
                          Scan a barcode to see the label preview
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* BULK MODE - Original Logic */}
              {mode === "bulk" && (
                <>
                  {/* Top Selectors */}
                  <motion.div 
                    variants={itemVariants} 
                    className="shrink-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <CustomerSelector
                        customers={customers}
                        value={customer}
                        onChange={setCustomer}
                      />
                      <WorkOrderSelector
                        workOrders={availableWorkOrders}
                        value={workOrder}
                        onChange={setWorkOrder}
                        disabled={!customer}
                      />
                    </div>
                  </motion.div>

                  {/* Bulk Mode Split View */}
                  {workOrder && (
                    <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
                      {/* Left Side: Filters & Table */}
                      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
                        <motion.div variants={itemVariants} className="shrink-0">
                          <Filters
                            items={rawItems}
                            filters={filters}
                            onChange={(k, v) =>
                              setFilters((f) => ({ ...f, [k]: v || "" }))
                            }
                            onClear={() => setFilters(emptyFilters)}
                          />
                        </motion.div>

                        <motion.div 
                          variants={itemVariants} 
                          className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
                        >
                          <ItemsTable
                            items={filteredItems}
                            selected={bulkSelected}
                            onSelect={handleBulkSelect}
                          />
                        </motion.div>
                      </div>

                      {/* Right Side: Preview */}
                      <motion.div 
                        variants={itemVariants} 
                        className="w-full lg:w-[340px] shrink-0 hidden lg:flex flex-col overflow-hidden"
                      >
                        <BulkPreview
                          items={filteredItems}
                          selected={bulkSelected}
                        />
                      </motion.div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!workOrder && (
                    <motion.div 
                      variants={itemVariants} 
                      className="flex-1 min-h-0 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800"
                    >
                      <Barcode size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                      <p className="text-slate-600 dark:text-slate-400 font-medium">
                        {!customer ? "Select a customer to begin" : "Select a work order"}
                      </p>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ============ Single Barcode Preview ============
const SingleBarcodePreview = ({ barcode, data, loading }) => {
  if (data?.statusCode === 200) {
    console.log(data?.statusCode !== 200);
  }
  const imageUrl = data?.zplCode
    ? `https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/?zpl=${encodeURIComponent(data.zplCode)}`
    : null;

  return (
    <motion.div
      className="w-full h-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl flex flex-col items-center justify-between overflow-hidden"
    >
      {/* Header */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        📋 Live Label Preview — 4" × 6"
      </p>

      {/* 🔥 LABEL CONTAINER */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0">
        
        {/* CONTROLLED SIZE BOX */}
        <div className="w-[220px] sm:w-[260px] md:w-[300px] aspect-[2/3] bg-white border rounded-lg shadow flex items-center justify-center overflow-hidden">
          
          {loading ? (
            <Loader className="animate-spin text-blue-500" />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="ZPL Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <p className="text-xs text-gray-400">No preview</p>
          )}

        </div>
      </div>

      {/* Footer Status */}
      <div className="text-xs">
        {loading ? (
          <span className="text-blue-600">Processing...</span>
        ) : data ? (
          <span className="text-green-600">Ready to print</span>
        ) : (
          <span className="text-slate-500">Enter barcode</span>
        )}
      </div>
    </motion.div>
  );
};
// ============ Bulk Preview ============
const BulkPreview = ({ items, selected }) => {
  const selectedItems = items.filter(i => selected.includes(i.id));

  if (selectedItems.length === 0) {
    return (
      <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
        Select items to preview
      </div>
    );
  }

  const item = selectedItems[0];

  return (
    <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-xl h-full flex flex-col sticky top-0 overflow-hidden">
      <div className="w-full flex items-center justify-between mb-4 shrink-0">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview</span>
        <span className="text-xs bg-slate-300 dark:bg-slate-700 px-2 py-1 rounded">4" x 6"</span>
      </div>

      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full aspect-[2/3] bg-white border border-slate-300 shadow-sm p-5 flex flex-col font-mono text-black rounded-lg flex-shrink-0"
      >
        <div className="text-center font-bold text-lg border-b-2 border-black pb-2 mb-3">
          Item Label
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1 text-[11px]">
          <div><span className="font-bold text-gray-600">SIZE:</span> {item.tyreSize}</div>
          <div><span className="font-bold text-gray-600">RIM:</span> {item.rimSize}</div>
          <div><span className="font-bold text-gray-600">PLATFORM:</span> {item.platform}</div>
          <div><span className="font-bold text-gray-600">BRAND:</span> {item.brand}</div>
        </div>
        <div className="mt-auto pt-2 border-t-2 border-black text-center text-xs">
          {item.id}
        </div>
      </motion.div>

      {selectedItems.length > 1 && (
        <div className="text-xs text-slate-500 mt-3 text-center shrink-0">
          {selectedItems.length} items selected
        </div>
      )}
    </div>
  );
};

// ============ Customer Selector ============
const CustomerSelector = ({ customers, value, onChange }) => {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <User size={14} /> Customer
      </label>
      <Select
        showSearch
        placeholder="Select a customer..."
        value={value}
        onChange={onChange}
        className="w-full"
        options={customers.map((c) => ({ value: c.id, label: c.name }))}
        optionFilterProp="label"
      />
    </div>
  );
};

// ============ Work Order Selector ============
const WorkOrderSelector = ({ workOrders, value, onChange, disabled }) => {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <ClipboardList size={14} /> Work Order
      </label>
      <Select
        showSearch
        placeholder={disabled ? "Select customer first" : "Select work order..."}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full"
        options={workOrders.map((w) => ({ value: w.id, label: w.name }))}
        optionFilterProp="label"
      />
    </div>
  );
};

// ============ Filters ============
const Filters = ({ items, filters, onChange, onClear }) => {
  const [open, setOpen] = useState(false);

  const uniq = (key) =>
    [...new Set(items.map((i) => i[key]))].map((v) => ({ value: v, label: v }));

  const fields = [
    { key: "platform", label: "Platform" },
    { key: "tyreSize", label: "Tyre Size" },
    { key: "rimSize", label: "Rim Size" },
    { key: "brand", label: "Brand" },
    { key: "sidewall", label: "Sidewall" },
  ];

  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            Filter View
          </span>
          {hasFilters && (
            <span className="text-[10px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-0.5 rounded-full font-medium ml-2">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
          <motion.div animate={{ rotate: open ? 180 : 0 }}>
            <ChevronDown size={16} className="text-slate-400" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    {f.label}
                  </label>
                  <Select
                    allowClear
                    placeholder={f.label}
                    value={filters[f.key] || undefined}
                    onChange={(v) => onChange(f.key, v)}
                    options={uniq(f.key)}
                    className="w-full"
                    size="small"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============ Items Table ============
const ItemsTable = ({ items, selected, onSelect }) => {
  const isSelected = (id) => selected.includes(id);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <PackageX size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-slate-500 text-sm">No items match your filters</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10">
          <tr>
            <th className="px-4 py-3 text-left w-12"></th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Size</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Rim</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Platform</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Brand</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Type</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Stock</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const active = isSelected(item.id);
            return (
              <tr
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-colors ${
                  active
                    ? "bg-slate-50 dark:bg-slate-800/50"
                    : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                }`}
              >
                <td className="px-4 py-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      active
                        ? "bg-slate-900 border-slate-900 dark:bg-white dark:border-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {active && <Check size={12} className="text-white dark:text-slate-900" strokeWidth={3} />}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{item.tyreSize}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.rimSize}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                    {item.platform}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.brand}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.sidewall}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">{item.stock}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ============ Mode Toggle ============
const ModeToggle = ({ mode, onChange }) => {
  const modes = [
    { key: "bulk", label: "Bulk" },
    { key: "input", label: "Quick Scan" },
  ];

  return (
    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
      {modes.map((m) => {
        const active = mode === m.key;
        return (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className={`relative px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              active ? "text-white dark:text-slate-900" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {active && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-slate-900 dark:bg-white rounded-md"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};