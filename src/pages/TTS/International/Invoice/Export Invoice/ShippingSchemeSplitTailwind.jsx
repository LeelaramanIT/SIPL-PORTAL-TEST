import React, { useState, useEffect } from "react";

const initialPOItems = [
  { partNo: "TY001", description: "Truck Tyre 24x12", qty: 109 },
  { partNo: "TY002", description: "Scooter Tyre", qty: 20 },
];

const schemeOptions = [
  "Advance License",
  "Duty Drawback",
  "Mowr",
];

function ShippingSchemeSplitTailwind() {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [applyAllScheme, setApplyAllScheme] = useState("");

  useEffect(() => {
    // Load initial PO items on mount
    const initialRows = initialPOItems.map((item, idx) => ({
      id: idx + 1,
      partNo: item.partNo,
      description: item.description,
      totalQty: item.qty,
      splitQty: item.qty,
      scheme: "",
      remarks: "",
    }));
    setRows(initialRows);
    setRowCount(initialRows.length);
  }, []);

  // Helper to get total split qty for each partNo
  const getPartTotals = (rowsList) => {
    const partTotals = {};
    rowsList.forEach((row) => {
      if (!row.partNo) return;
      if (!partTotals[row.partNo]) partTotals[row.partNo] = 0;
      partTotals[row.partNo] += parseFloat(row.splitQty || 0);
    });
    return partTotals;
  };

  // Validate split quantities
  const validateQty = () => {
    const partTotals = getPartTotals(rows);
    let valid = true;
    initialPOItems.forEach((item) => {
      const total = partTotals[item.partNo] || 0;
      if (total > item.qty) {
        window.alert(
          `❌ Split quantity for ${item.partNo} exceeds PO quantity (${total} > ${item.qty})`
        );
        valid = false;
      }
    });
    return valid;
  };

  // Update splitQty for a row
  const handleSplitQtyChange = (idx, value) => {
    const newRows = [...rows];
    newRows[idx].splitQty = value;
    setRows(newRows);
  };

  // Update scheme for a row
  const handleSchemeChange = (idx, value) => {
    const newRows = [...rows];
    newRows[idx].scheme = value;
    setRows(newRows);
  };

  // Update remarks for a row
  const handleRemarksChange = (idx, value) => {
    const newRows = [...rows];
    newRows[idx].remarks = value;
    setRows(newRows);
  };

  // Add a new empty row
  const addEmptyRow = () => {
    setRows([
      ...rows,
      {
        id: rowCount + 1,
        partNo: "",
        description: "",
        totalQty: "",
        splitQty: "",
        scheme: "",
        remarks: "",
      },
    ]);
    setRowCount(rowCount + 1);
  };

  // Split a row (duplicate with splitQty 0)
  const splitRow = (idx) => {
    const row = rows[idx];
    const newRow = {
      ...row,
      id: rowCount + 1,
      splitQty: 0,
      scheme: "",
      remarks: "",
    };
    const newRows = [...rows];
    newRows.splice(idx + 1, 0, newRow);
    setRows(newRows);
    setRowCount(rowCount + 1);
  };

  // Remove a row
  const removeRow = (idx) => {
    const newRows = rows.filter((_, i) => i !== idx);
    setRows(newRows);
    setRowCount(newRows.length);
  };

  // Apply scheme to all rows
  const handleApplyAllScheme = (e) => {
    const scheme = e.target.value;
    setApplyAllScheme(scheme);
    setRows(rows.map((row) => ({ ...row, scheme })));
  };

  // Calculate remaining qty for each row
  const partTotals = getPartTotals(rows);
  const getRemainingQty = (row) => {
    const poItem = initialPOItems.find((p) => p.partNo === row.partNo);
    if (!poItem) return "";
    // For each row, remaining = total PO - total split for that partNo
    return poItem.qty - partTotals[row.partNo];
  };

  return (
    <div className="max-w-6xl mx-auto my-6 p-4 bg-white rounded-xl shadow-lg">
      <h4 className="mb-6 text-2xl font-semibold text-center text-gray-800">📦 Scheme-wise Shipping Invoice Preparation</h4>
      {/* Header Form */}
      <form className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" onSubmit={e => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="poNumber">PO Number</label>
          <input
            id="poNumber"
            type="text"
            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value="PO/EXP/2025/0056"
            readOnly
            title="PO Number"
            placeholder="PO Number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dispatchDate">Dispatch Date</label>
          <input
            id="dispatchDate"
            type="date"
            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value="2025-07-02"
            title="Dispatch Date"
            placeholder="Dispatch Date"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="consignee">Consignee</label>
          <input
            id="consignee"
            type="text"
            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value="ABC EXPORTS LTD, USA"
            readOnly
            title="Consignee"
            placeholder="Consignee"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="applyAllScheme">Apply Scheme to All Rows</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="applyAllScheme"
            value={applyAllScheme}
            onChange={handleApplyAllScheme}
            title="Apply Scheme to All Rows"
          >
            <option value="">-- Select Scheme --</option>
            {schemeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </form>
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-3 font-semibold text-gray-700 text-center">#</th>
              <th className="px-2 py-3 font-semibold text-gray-700 text-center">Part No</th>
              <th className="px-2 py-3 font-semibold text-gray-700 text-center">Description</th>
              <th className="px-2 py-3 font-semibold text-gray-700 text-center">Total PO Qty</th>
              <th className="px-2 py-3 font-semibold text-gray-700 text-center">Split Qty</th>
              <th className="px-2 py-3 font-semibold text-gray-700 text-center">Remaining Qty</th>
              <th className="px-2 py-3 font-semibold text-gray-700 text-center">Scheme</th>
              <th className="px-2 py-3 font-semibold text-gray-700 text-center">Remarks</th>
              <th className="px-2 py-3 font-semibold text-gray-700 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="even:bg-gray-50 hover:bg-blue-50 transition-colors">
                <td className="px-2 py-2 text-center">{idx + 1}</td>
                <td className="px-2 py-2">
                  <input
                    className="w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={row.partNo}
                    readOnly
                    title="Part Number"
                    placeholder="Part Number"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    className="w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={row.description}
                    readOnly
                    title="Description"
                    placeholder="Description"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    className="w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={row.totalQty}
                    readOnly
                    title="Total PO Quantity"
                    placeholder="Total PO Quantity"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    className="w-full rounded border border-gray-300 px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    type="number"
                    value={row.splitQty}
                    onChange={(e) => handleSplitQtyChange(idx, e.target.value)}
                    onBlur={validateQty}
                    title="Split Quantity"
                    placeholder="Split Quantity"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    className="w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={getRemainingQty(row)}
                    readOnly
                    title="Remaining Quantity"
                    placeholder="Remaining Quantity"
                  />
                </td>
                <td className="px-2 py-2">
                  <select
                    className="w-full rounded border border-gray-300 px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={row.scheme}
                    onChange={(e) => handleSchemeChange(idx, e.target.value)}
                    title="Scheme"
                  >
                    <option value="">-- Select --</option>
                    {schemeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <input
                    className="w-full rounded border border-gray-300 px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={row.remarks}
                    onChange={(e) => handleRemarksChange(idx, e.target.value)}
                    title="Remarks"
                    placeholder="Remarks"
                  />
                </td>
                <td className="px-2 py-2 flex flex-col md:flex-row gap-2 justify-center items-center">
                  <button
                    className="inline-flex items-center justify-center rounded bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 text-xs font-semibold transition-colors"
                    type="button"
                    onClick={() => splitRow(idx)}
                    title="Split Row"
                  >
                    🔀 Split
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 text-xs font-semibold transition-colors"
                    type="button"
                    onClick={() => removeRow(idx)}
                    title="Remove Row"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-6 mt-4">
        <button
          className="w-full md:w-auto rounded bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 px-4 py-2 font-semibold shadow-sm transition-colors"
          type="button"
          onClick={addEmptyRow}
        >
          ➕ Add New Row
        </button>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto md:ml-auto">
          <button
            className="w-full md:w-auto rounded bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 font-semibold shadow-sm transition-colors"
            type="button"
            onClick={validateQty}
          >
            🧮 Validate Splits
          </button>
          <button
            className="w-full md:w-auto rounded bg-green-500 hover:bg-green-600 text-white px-4 py-2 font-semibold shadow-sm transition-colors"
            type="button"
          >
            💾 Save Assignments
          </button>
          <button
            className="w-full md:w-auto rounded bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold shadow-sm transition-colors"
            type="button"
          >
            🧾 Generate Invoices
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShippingSchemeSplitTailwind; 