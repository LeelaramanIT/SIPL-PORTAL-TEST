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

function ShippingSchemeSplit() {
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
    <div className="container my-4 p-4 bg-white rounded shadow">
      <h4 className="mb-4">📦 Scheme-wise Shipping Invoice Preparation</h4>
      {/* Header Form */}
      <form className="row g-3 mb-4" onSubmit={(e) => e.preventDefault()}>
        <div className="col-md-4">
          <label className="form-label" htmlFor="poNumber">PO Number</label>
          <input
            id="poNumber"
            type="text"
            className="form-control"
            value="PO/EXP/2025/0056"
            readOnly
            title="PO Number"
            placeholder="PO Number"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="dispatchDate">Dispatch Date</label>
          <input
            id="dispatchDate"
            type="date"
            className="form-control"
            value="2025-07-02"
            title="Dispatch Date"
            placeholder="Dispatch Date"
            readOnly
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="consignee">Consignee</label>
          <input
            id="consignee"
            type="text"
            className="form-control"
            value="ABC EXPORTS LTD, USA"
            readOnly
            title="Consignee"
            placeholder="Consignee"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="applyAllScheme">Apply Scheme to All Rows</label>
          <select
            className="form-select"
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
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Part No</th>
            <th>Description</th>
            <th>Total PO Qty</th>
            <th>Split Qty</th>
            <th>Remaining Qty</th>
            <th>Scheme</th>
            <th>Remarks</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id}>
              <td>{idx + 1}</td>
              <td>
                <input
                  className="form-control part-no"
                  value={row.partNo}
                  readOnly
                  title="Part Number"
                  placeholder="Part Number"
                />
              </td>
              <td>
                <input
                  className="form-control description"
                  value={row.description}
                  readOnly
                  title="Description"
                  placeholder="Description"
                />
              </td>
              <td>
                <input
                  className="form-control total-po"
                  value={row.totalQty}
                  readOnly
                  title="Total PO Quantity"
                  placeholder="Total PO Quantity"
                />
              </td>
              <td>
                <input
                  className="form-control split-qty"
                  type="number"
                  value={row.splitQty}
                  onChange={(e) => handleSplitQtyChange(idx, e.target.value)}
                  onBlur={validateQty}
                  title="Split Quantity"
                  placeholder="Split Quantity"
                />
              </td>
              <td>
                <input
                  className="form-control remaining-qty"
                  value={getRemainingQty(row)}
                  readOnly
                  title="Remaining Quantity"
                  placeholder="Remaining Quantity"
                />
              </td>
              <td>
                <select
                  className="form-select scheme-select"
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
              <td>
                <input
                  className="form-control"
                  value={row.remarks}
                  onChange={(e) => handleRemarksChange(idx, e.target.value)}
                  title="Remarks"
                  placeholder="Remarks"
                />
              </td>
              <td>
                <button
                  className="btn btn-sm btn-secondary me-1"
                  type="button"
                  onClick={() => splitRow(idx)}
                  title="Split Row"
                >
                  🔀 Split
                </button>
                <button
                  className="btn btn-sm btn-danger"
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
      {/* Buttons */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={addEmptyRow}
        >
          ➕ Add New Row
        </button>
        <div>
          <button
            className="btn btn-warning me-2"
            type="button"
            onClick={validateQty}
          >
            🧮 Validate Splits
          </button>
          <button className="btn btn-success me-2" type="button">
            💾 Save Assignments
          </button>
          <button className="btn btn-primary" type="button">
            🧾 Generate Invoices
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShippingSchemeSplit; 