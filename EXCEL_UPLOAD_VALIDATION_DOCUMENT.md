# Excel Upload Validation - Functional Document
## Customer Process ID Mapping Module

**Document Version:** 1.0  
**Date:** September 2026  
**Module:** Customer Process ID Mapping  
**File Location:** `src/pages/Masters/Customer Master/CustomerProcessIDMapping/`

---

## 1. Overview

The Excel Upload feature allows bulk import of Customer-Process ID mappings. The system validates each row through a multi-stage validation process before imported data is sent to the backend API.

### Key Components:
- **ImportDialog.jsx** - Handles file upload, template download, and displays validation results
- **CustomerProcessIDMapping.jsx** - Parent component orchestrating validation and API calls
- **helpers.js** - Contains shared validation logic and normalization functions
- **CustomerProcessIDSlice.jsx** - Redux async thunks for API communication

---

## 2. Validation Flow - High-Level Architecture

```
User Upload Excel File
        ↓
File Type Validation (.xlsx/.xls)
        ↓
Header Mapping & Normalization
        ↓
Empty Row Filtering
        ↓
Deep Validation (handleValidateImportRows)
  ├─ Step 1: Customer Code Validation
  ├─ Step 2: Item Type Validation (per customer)
  ├─ Step 3: Item Code Validation
  ├─ Step 4: Description Auto-fill
  ├─ Step 5: Backend Duplicate Check
  └─ Step 6: In-File Duplicate Check
        ↓
Display Validated Results in Table
        ↓
User Selects Valid Rows → Import
        ↓
Bulk API Call (createCustomerItem)
        ↓
Success/Error Response
```

---

## 3. Detailed Validation Steps

### 3.1 File Upload & Template Validation (ImportDialog.jsx)

#### A. File Type Check
```javascript
const isExcel = /\.(xlsx|xls)$/i.test(file.name);
if (!isExcel) {
  setTemplateError("Unsupported file type. Please upload a .xlsx or .xls file.");
  return false;
}
```

**Validation Rule:** Only `.xlsx` and `.xls` files are accepted.

#### B. Header Validation

**Required Headers (Case & Whitespace Insensitive):**
```javascript
const REQUIRED_HEADERS = [
  "Customer Code",
  "Ship ID", 
  "Item Type", 
  "Item Code", 
  "Customer Item Code"
];

const HEADER_MAP = {
  "customer code": "customerCode",
  "ship id": "shipId",
  "item type": "itemType",
  "item code": "itemCode",
  "customer item code": "customerItemCode",
};
```

**Validation Logic:**
- Header names are normalized to lowercase and trimmed
- Missing required headers are detected and reported
- Returns: `"Invalid Excel template. Missing required columns: X, Y, Z."`

#### C. Data Row Extraction & Trimming

```javascript
const rawRows = sheetRows
  .filter((r) => Object.values(r).some((v) => String(v ?? "").trim() !== ""))
  .map((r) => ({
    customerCode: String(r[headerLookup.customerCode] ?? "").trim(),
    shipId: String(r[headerLookup.shipId] ?? "").trim(),
    itemType: String(r[headerLookup.itemType] ?? "").trim(),
    itemCode: String(r[headerLookup.itemCode] ?? "").trim(),
    customerItemCode: String(r[headerLookup.customerItemCode] ?? "").trim(),
  }));
```

**Processing:**
- Completely empty rows are filtered out
- All cell values are trimmed of whitespace
- All values are converted to strings for consistency

---

### 3.2 Deep Validation (handleValidateImportRows)

Deep validation happens **only after** file-level validation passes. This function validates each row against dynamic business rules fetched from the backend.

#### A. Customer Data Fetching & Caching

```javascript
const byCustomer = new Map();
// Group rows by customer code
rawRows.forEach((row) => {
  const key = norm(row.customerCode); // normalize to lowercase
  if (!byCustomer.has(key)) byCustomer.set(key, []);
  byCustomer.get(key).push(row);
});

// For each distinct customer, fetch data ONCE
for (const [key, rowsForCustomer] of byCustomer.entries()) {
  const customerRecord = customerList.find((c) => 
    norm(c.custID) === key || norm(c.customerCode) === key
  );
  
  // Fetch line items (tyre, assemblyTyre, rim)
  const lineItemsRes = await dispatch(getListOfItems(customerRecord.custID));
  
  // Fetch existing customer items for duplicate checking
  if (shipIdsForCustomer.length) {
    const existing = await dispatch(
      getCustomerItemsByCustomerAndShip({ 
        customerCode: customerRecord.custID, 
        shipIds: shipIdsForCustomer 
      })
    );
    existingByCustomer.set(key, existing || []);
  }
}
```

**Performance Optimization:**
- Each customer's data is fetched **only once**, regardless of how many rows reference it
- Data is cached in Maps: `processMasterByCustomer`, `allowedItemTypesByCustomer`, `existingByCustomer`

#### B. Validation Steps (Per Row)

**STEP 1: Customer Code Validation**
```javascript
// Validation Rules:
✓ Customer Code is not empty
✓ Customer Code exists in the allowed customer list
✓ Matched using either custID or customerCode field (case-insensitive)

// Error Messages:
✗ "Missing Customer Code"
✗ "Customer Code is not available in the allowed customer list."
```

**STEP 2: Ship ID Validation**
```javascript
// Validation Rules:
✓ Ship ID is not empty
✓ Ship ID is a valid number
✓ Ship ID belongs to the selected customer
✓ Ship ID has addressType = 1 (ship-to address)

// Error Messages:
✗ "Ship ID must be a number"
✗ "Ship ID doesn't belong to this Customer"
```

**STEP 3: Item Type Validation**
```javascript
// Get allowed item types for this customer (dynamic, not global)
const allowedItemTypes = allowedItemTypesByCustomer.get(key) || [];
// Allowed values are: "tyre", "assembly", "rim"
// These are extracted from the customer's actual line items

// Validation Rules:
✓ Item Type is not empty
✓ Item Type matches one of the customer's available types
✓ Case-insensitive comparison

// Error Message:
✗ "Item Type 'XXX' is not allowed for customer CUST-1001. 
   Allowed Item Types: Tyre, Assembly, Rim."
```

**STEP 4: Item Code Validation**
```javascript
// Validation Rules:
✓ Item Code is not empty
✓ Item Code (Process ID) exists in customer's process master
✓ Item Code matches the specified Item Type

const master = processMasterByCustomer.get(key) || [];
const matchedItem = master.find((p) => 
  norm(pidOf(p)) === norm(row.itemCode) && 
  p.itemType === itemType
);

// Error Message:
✗ "Process ID 'TYRE-18565R15' is not assigned to this customer"
```

**STEP 5: Customer Item Code Validation**
```javascript
// Validation Rules:
✓ Customer Item Code is not empty

// Error Message:
✗ "Missing Customer Item Code"
```

**STEP 6: Backend Duplicate Check**
```javascript
// Fetches existing mappings for this customer + ship ID
// Checks if either:
//   1. Item Code already exists at this ship address, OR
//   2. Customer Item Code already exists at this ship address

// A Customer Item Code is a 1:1 alias for ONE item at a ship address
// Reusing it for different items = duplicate

const itemExistsInBackend = existingRecords.some(
  (m) => norm(m.customerCode) === norm(customerRecord.custID) && 
         Number(m.shipid) === shipIdNum && 
         norm(m.ourProcessId ?? m.itemCode) === norm(row.itemCode)
);

const cicExistsInBackend = existingRecords.some(
  (m) => norm(m.customerCode) === norm(customerRecord.custID) && 
         Number(m.shipid) === shipIdNum && 
         norm(m.customerProcessId ?? m.customerItemCode) === norm(row.customerItemCode)
);

// Error Message:
✗ "Already exists"
```

**STEP 7: In-File Duplicate Check**
```javascript
// Pre-count duplicates before validation
// If TWO rows in the file share the same:
//   - Customer Code + Ship ID + Item Code, OR
//   - Customer Code + Ship ID + Customer Item Code
// Both rows are flagged as invalid

// Pre-counting logic:
const itemKeyCounts = new Map();
const cicKeyCounts = new Map();
rawRows.forEach((r) => {
  const k = norm(r.customerCode);
  const shipNum = Number(r.shipId);
  const itemK = `${k}::${shipNum}::item::${norm(r.itemCode)}`;
  const cicK = `${k}::${shipNum}::cic::${norm(r.customerItemCode)}`;
  itemKeyCounts.set(itemK, (itemKeyCounts.get(itemK) || 0) + 1);
  cicKeyCounts.set(cicK, (cicKeyCounts.get(cicK) || 0) + 1);
});

// Why pre-count? Because if row #1 and #3 both have "CUST-ITEM-001",
// you want BOTH flagged as errors, not just row #3.
// Otherwise row #1 appears "valid" just because it came first.

// Error Messages:
✗ "Item Code duplicated within this file for this Ship ID"
✗ "Customer Item Code duplicated within this file for this Ship ID"
```

**STEP 8: Description Auto-fill**
```javascript
// Once a row passes all validations, fill in description from process master
const matchedItem = master.find(...); // from step 4
return {
  ...row,
  _valid: true,
  description: matchedItem.piDetails || "",
};
```

---

## 4. API Calls & Redux Thunks

### 4.1 API Endpoints

#### A. Get List of Customers
```javascript
// Redux Thunk: getListOfCustomer()
// API Endpoint: GET /OrderProcess/customer-master
// Response: { data: { data: [...customers] } }

// Returned Fields:
{
  custID: "CUST-1001",
  customerName: "XYZ Corp",
  customerCode: "CUST-1001",
  addresses: [
    {
      id: 501,
      addressType: 1,      // 1 = ship-to, others = billing/etc
      addressName: "Main Warehouse",
      city: "New York",
      country: "USA",
      companyName: "XYZ Corp"
    }
  ]
}
```

#### B. Get Customer's Line Items (Process Master)
```javascript
// Redux Thunk: getListOfItems(custID)
// API Endpoint: GET /OrderProcess/customer-LineItems/{custID}
// Response: { data: { data: { tyre: [], assemblyTyre: [], rim: [] } } }

// Structure:
{
  tyre: [
    {
      processID: "TYRE-18565R15",
      category: "Summer",
      config: "Tubeless",
      tyreSize: "185/65 R15",
      tyreRim: "15",
      tyreType: "Radial",
      brand: "XYZ",
      sidewall: "Black",
      piD_Details: "Summer Radial Tyre - 185/65R15"
    }
  ],
  assemblyTyre: [
    {
      assY_PID: "ASM-001",
      category: "Summer",
      config: "Tubeless",
      tyreSize: "185/65 R15",
      tyreRim: "15",
      tyreType: "Radial",
      brand: "XYZ",
      directional: "LH",
      piD_Details: "Left-Hand Assembly"
    }
  ],
  rim: [...]
}
```

#### C. Get Customer Items for Ship Addresses
```javascript
// Redux Thunk: getCustomerItemsByCustomerAndShip({ customerCode, shipIds })
// API Endpoint: GET /CustomerItemMaster/customer-ship?customerCode=CUST-1001&shipID=501&shipID=502
// Response: { data: { data: [...mappings] } }

// Returned Mapping Fields:
{
  id: 123,
  customerCode: "CUST-1001",
  shipid: 501,
  itemCode: "TYRE-18565R15",
  customerItemCode: "CUST-ITEM-001",
  isActive: true,
  category: "Summer",
  config: "Tubeless",
  tyreSize: "185/65 R15",
  tyreRim: "15",
  tyreType: "Radial",
  brand: "XYZ",
  sideWall: "Black",
  createdBy: "admin",
  createdDate: "2024-01-15T10:00:00Z",
  modifiedBy: "admin",
  modifiedDate: "2024-01-20T14:30:00Z"
}
```

#### D. Create Customer Item (Bulk Import)
```javascript
// Redux Thunk: createCustomerItem(payload)
// API Endpoint: POST /CustomerItemMaster/CreateCustomerItem
// Payload Structure:
{
  customerIDs: [
    {
      id: 0,
      shipid: 501,
      customerCode: "CUST-1001",
      items: [
        {
          itemType: "tyre",
          itemCode: "TYRE-18565R15",
          customerItemCode: "CUST-ITEM-001",
          isActive: true,
          description: "Summer Radial Tyre - 185/65R15"
        },
        {
          itemType: "tyre",
          itemCode: "TYRE-27545R20",
          customerItemCode: "CUST-ITEM-002",
          isActive: true,
          description: "Commercial Tyre - 275/45R20"
        }
      ]
    }
  ]
}

// Response: { data: { data: {...} } }
// Status: 200 or 201
```

### 4.2 API Call Sequence for Validation

```
1. getListOfCustomer()
   └─ Called once at page load, cached in component state

2. For each distinct customer in uploaded file:
   ├─ getListOfItems(custID)
   │  └─ Returns allowed item types and process master
   │
   └─ getCustomerItemsByCustomerAndShip({ customerCode, shipIds })
      └─ Returns existing mappings for duplicate checking

3. User clicks Import:
   └─ createCustomerItem(payload)
      └─ Batches rows by customer::shipid, creates in one call
```

---

## 5. Excel Template

### 5.1 Template Format

| Customer Code | Ship ID | Item Type | Item Code | Customer Item Code |
|---|---|---|---|---|
| CUST-1001 | 501 | Tyre | TYRE-18565R15 | CUST-TYRE-001 |
| CUST-1001 | 502 | Tyre | TYRE-18565R15 | CUST-TYRE-002 |
| CUST-1001 | 501 | Assembly | ASM-001 | CUST-ASM-001 |

### 5.2 Template Download

```javascript
// ImportDialog.jsx - downloadTemplate()
const downloadTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    REQUIRED_HEADERS,
    ["CUST-1001", 501, "Tyre", "TYRE-18565R15", "CUST-TYRE-001"],
    ["CUST-1001", 502, "Tyre", "TYRE-18565R15", "CUST-TYRE-002"],
  ]);
  // Column widths: [16, 10, 12, 18, 20]
  XLSX.writeFile(wb, "customer-item-mapping-template.xlsx");
};
```

---

## 6. Validation Result Display

### 6.1 Result Table in ImportDialog

```javascript
// Rows table shows:
- Customer Code
- Ship ID
- Item Type
- Item Code
- Customer Item Code
- Status ("OK" or error message)

// Color coding:
✓ Valid rows: Green background with "OK" status
✗ Invalid rows: Red background with error message
```

### 6.2 Success/Error Summary

```javascript
// Counts displayed:
- "{validCount} valid"
- "{errorCount} with errors"

// Actions available:
- Import {validCount} rows  [ Import button - disabled if validCount = 0 ]
- Download Errors           [ Download error report as Excel ]
```

### 6.3 Error Export

```javascript
// handleExportErrors() - Users can export failed rows
// File: customer-item-mapping-template-errors.xlsx
// Contains: Failed rows + their error messages in Error column
```

---

## 7. Import Process

### 7.1 Bulk Insert Logic

```javascript
const handleImport = async (importedRows) => {
  // Group by customer + ship address
  const groups = new Map();
  importedRows.forEach((row) => {
    const key = `${row.customerCode}::${row.shipId}`;
    if (!groups.has(key)) {
      groups.set(key, {
        id: 0,
        shipid: Number(row.shipId),
        customerCode: String(row.customerCode),
        items: []
      });
    }
    groups.get(key).items.push({
      itemType: row.itemType,
      itemCode: row.itemCode,
      customerItemCode: row.customerItemCode,
      isActive: true,
      description: row.description || ""
    });
  });

  try {
    await dispatch(createCustomerItem({ customerIDs: Array.from(groups.values()) }));
    
    // Refresh currently viewed customer data
    if (customer && shipAddress.length) {
      const refreshed = await dispatch(
        getCustomerItemsByCustomerAndShip({ 
          customerCode: customer, 
          shipIds: shipAddress 
        })
      );
      setCustomerData(refreshed || []);
    }
  } catch (error) {
    throw error;
  }
};
```

**Key Features:**
- Rows are **grouped by customer + ship address**
- **Single API call** handles all valid rows
- **Auto-refresh** loads newly imported data into the table
- **Transaction-like behavior**: All rows for a customer/ship combo succeed or fail together

---

## 8. Helper Functions

### 8.1 Normalization (norm)

```javascript
// helpers.js
export const norm = (v) => String(v ?? "").trim().toLowerCase();

// Purpose: Consistent comparison (case & whitespace insensitive)
// Used in: Customer Code, Item Code, and Customer Item Code comparisons
```

### 8.2 Process Master Builder (buildProcessMaster)

```javascript
export const buildProcessMaster = (lineItems) => {
  const normalize = (item, pid, itemType) => ({
    category: item.category || "",
    platform: item.config || "",
    tyreSize: item.tyreSize || "",
    rimSize: item.tyreRim || "",
    tyreType: item.tyreType || "",
    brand: item.brand || "",
    sideWall: item.sidewall || "",
    directional: item.directional || "",
    piDetails: item.piD_Details || "",
    processId: pid || "",
    itemType,
  });
  
  const tyres = (lineItems?.tyre || []).map((item) => 
    normalize(item, item.processID, "tyre")
  );
  const assemblies = (lineItems?.assemblyTyre || []).map((item) => 
    normalize(item, item.assY_PID, "assembly")
  );
  const rims = (lineItems?.rim || []).map((item) => 
    normalize(item, item.edcno, "rim")
  );
  
  return [...tyres, ...assemblies, ...rims].filter((row) => row.processId);
};

// Purpose: Normalize API response into flat row shape for spec dropdowns
// Used in: Both manual creation UI AND Excel validation
```

### 8.3 Duplicate Detection (isDuplicateMapping)

```javascript
export const isDuplicateMapping = (
  existingRecords, 
  { customerCode, shipid, itemCode, customerItemCode }
) => 
  (existingRecords || []).some((m) => {
    if (norm(m.customerCode) !== norm(customerCode) || 
        Number(m.shipid) !== Number(shipid)) return false;
    if (itemCode && norm(m.ourProcessId ?? m.itemCode) === norm(itemCode)) 
      return true;
    if (customerItemCode && norm(m.customerProcessId ?? m.customerItemCode) === norm(customerItemCode)) 
      return true;
    return false;
  });

// Purpose: Check if a mapping already exists
// Rule: For same customer + ship address:
//       Either Item Code is already mapped, OR
//       Customer Item Code is already used (for any item)
```

---

## 9. Error Codes & Messages

### 9.1 File-Level Errors

| Error | Cause | Resolution |
|---|---|---|
| "Unsupported file type. Please upload a .xlsx or .xls file." | Wrong file extension | Upload .xlsx or .xls file |
| "This Excel file has no data rows." | Empty sheet | Add data rows to Excel |
| "Invalid Excel template. Missing required columns: X, Y, Z." | Missing headers | Download template and use correct column names |

### 9.2 Row-Level Validation Errors

| Error | Step | Cause | Resolution |
|---|---|---|---|
| "Missing Customer Code" | 1 | Cell is empty | Enter customer code |
| "Customer Code is not available in the allowed customer list." | 1 | Customer doesn't exist in system | Use valid customer code |
| "Ship ID must be a number" | 2 | Non-numeric value | Use numeric Ship ID |
| "Ship ID doesn't belong to this Customer" | 2 | Ship address not configured for customer | Assign ship address to customer first |
| "Item Type 'XXX' is not allowed for customer CUST-1001. Allowed Item Types: Tyre, Assembly, Rim." | 3 | Customer has no items of this type | Customer must have items of selected type |
| "Process ID 'TYRE-18565R15' is not assigned to this customer" | 4 | Item code not in customer's master | Assign item code to customer in Process Master |
| "Missing Item Code" | 4 | Cell is empty | Enter valid item code |
| "Missing Customer Item Code" | 5 | Cell is empty | Enter customer item code |
| "Already exists" | 6 | Duplicate in backend | Remove duplicate or use unique customer item code |
| "Item Code duplicated within this file for this Ship ID" | 7 | Duplicate within uploaded file | Remove duplicate row |
| "Customer Item Code duplicated within this file for this Ship ID" | 7 | Duplicate within uploaded file | Remove duplicate row or change customer item code |

---

## 10. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER ACTIONS                                 │
├─────────────────────────────────────────────────────────────────┤
│ 1. Click "Import" → Opens ImportDialog                           │
│ 2. Click "Template" → Downloads Excel template                   │
│ 3. Fill Excel → Save                                             │
│ 4. Drag/Upload Excel → File validation + header check            │
│ 5. Review results table → Click "Import" or "Download Errors"    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 FRONTEND VALIDATION                              │
├─────────────────────────────────────────────────────────────────┤
│ ImportDialog.handleFile()                                        │
│  ├─ Check file type (.xlsx/.xls)                                │
│  ├─ Parse Excel with XLSX library                               │
│  ├─ Extract headers (case/whitespace insensitive)               │
│  ├─ Validate required columns present                            │
│  ├─ Filter empty rows                                            │
│  └─ Call onValidate(rawRows) → handleValidateImportRows()       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND DATA FETCHING                               │
├─────────────────────────────────────────────────────────────────┤
│ For each distinct customer in file:                              │
│  ├─ dispatch(getListOfItems(custID))                            │
│  │   └─ GET /OrderProcess/customer-LineItems/{custID}           │
│  │       ↳ Returns: tyre[], assemblyTyre[], rim[]               │
│  │                                                               │
│  └─ dispatch(getCustomerItemsByCustomerAndShip({...}))          │
│      └─ GET /CustomerItemMaster/customer-ship?...              │
│          ↳ Returns: existing mappings for duplicate check       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              DEEP ROW VALIDATION                                 │
├─────────────────────────────────────────────────────────────────┤
│ For each row:                                                    │
│  ├─ Step 1: Validate Customer Code                              │
│  ├─ Step 2: Validate Ship ID (number + belongs to customer)    │
│  ├─ Step 3: Validate Item Type (dynamic per customer)           │
│  ├─ Step 4: Validate Item Code (exists in customer's master)   │
│  ├─ Step 5: Validate Customer Item Code (not empty)             │
│  ├─ Step 6: Check backend duplicates                            │
│  ├─ Step 7: Check in-file duplicates                            │
│  └─ Step 8: Auto-fill Description (if valid)                    │
│                                                                  │
│  Result: { ...row, _valid: true/false, _error: "msg" }         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│             RESULTS DISPLAY IN DIALOG                            │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Valid rows: green background + "OK" status                    │
│ ✗ Invalid rows: red background + error message                  │
│                                                                  │
│ Summary:                                                         │
│  - {validCount} valid                                            │
│  - {errorCount} with errors                                      │
│                                                                  │
│ Actions:                                                         │
│  - [Import validCount rows] button                               │
│  - [Download Errors] button (if errors exist)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│              USER CLICKS IMPORT                                  │
├──────────────────────────────────────────────────────────────────┤
│ handleImport(validRows)                                          │
│  ├─ Group rows by customerCode::shipId                          │
│  └─ Call dispatch(createCustomerItem(payload))                  │
│      └─ POST /CustomerItemMaster/CreateCustomerItem             │
│                                                                  │
│          Payload: {                                             │
│            customerIDs: [{                                      │
│              id: 0,                                             │
│              shipid: 501,                                       │
│              customerCode: "CUST-1001",                         │
│              items: [                                           │
│                { itemType, itemCode, customerItemCode,          │
│                  isActive: true, description }                  │
│              ]                                                  │
│            }]                                                   │
│          }                                                       │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│              RESPONSE & REFRESH                                  │
├──────────────────────────────────────────────────────────────────┤
│ On Success (200/201):                                            │
│  ├─ Show toast: "Imported N rows."                              │
│  ├─ Close ImportDialog                                          │
│  ├─ Refresh current customer's data:                            │
│  │   dispatch(getCustomerItemsByCustomerAndShip({...}))        │
│  └─ Update MappingTable with newly imported rows                │
│                                                                  │
│ On Error:                                                        │
│  ├─ Show error toast                                            │
│  └─ Keep dialog open (user can fix and retry)                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. Testing Scenarios

### 11.1 Valid Import
**Setup:**
- Customer: CUST-1001 (exists in system)
- Ship Address: 501 (belongs to CUST-1001)
- Item Type: Tyre (available for CUST-1001)
- Item Code: TYRE-18565R15 (assigned to CUST-1001)
- Customer Item Code: CUST-TYRE-001 (not already used)

**Expected:** ✓ Row marked as valid, imports successfully

### 11.2 Invalid Customer Code
**Input:** CUST-9999 (doesn't exist)
**Expected Error:** "Customer Code is not available in the allowed customer list."

### 11.3 Item Type Not Allowed for Customer
**Setup:**
- CUST-1001 has Tyre + Rim items, but NO Assembly
**Input:** Item Type = "Assembly"
**Expected Error:** "Item Type 'Assembly' is not allowed for customer CUST-1001. Allowed Item Types: Tyre, Rim."

### 11.4 Item Code Not Assigned to Customer
**Setup:**
- TYRE-27545R20 is not in CUST-1001's master list
**Input:** Item Code = TYRE-27545R20
**Expected Error:** "Process ID 'TYRE-27545R20' is not assigned to this customer"

### 11.5 Backend Duplicate (Item Code)
**Setup:**
- CUST-TYRE-001 already maps TYRE-18565R15 at Ship 501
**Input:** New row with same Customer + Ship + Item Code
**Expected Error:** "Already exists"

### 11.6 Backend Duplicate (Customer Item Code)
**Setup:**
- CUST-TYRE-001 already used at Ship 501 (for any item)
**Input:** New row with same Customer + Ship + Customer Item Code (different Item Code)
**Expected Error:** "Already exists"

### 11.7 In-File Duplicate (Item Code)
**Setup:**
- Two rows in same file:
  - Row 1: CUST-1001, Ship 501, TYRE-18565R15, CUST-ITEM-001
  - Row 2: CUST-1001, Ship 501, TYRE-18565R15, CUST-ITEM-002
**Expected Errors:** Both rows marked as "Item Code duplicated within this file for this Ship ID"

### 11.8 In-File Duplicate (Customer Item Code)
**Setup:**
- Two rows in same file:
  - Row 1: CUST-1001, Ship 501, TYRE-18565R15, CUST-ITEM-001
  - Row 2: CUST-1001, Ship 501, TYRE-27545R20, CUST-ITEM-001
**Expected Errors:** Both rows marked as "Customer Item Code duplicated within this file for this Ship ID"

---

## 12. Performance Considerations

### 12.1 Caching Strategy
- **Customer list**: Fetched once at page load, reused for all validations
- **Line items per customer**: Fetched once during validation, cached for all rows referencing that customer
- **Existing mappings**: Fetched once per customer::shipId combination

### 12.2 Batch Grouping
- Rows are **grouped by customer::shipId** before import
- Single API call handles multiple customers/ship addresses
- Reduces API calls from N (rows) to M (customer::shipId combinations)

### 12.3 Scalability
- **Supported:** 100+ rows in single file (tested)
- **Bottleneck:** API call count = distinct customers + distinct customer::shipId combos
- **Optimization:** Parallel API fetches could be added for multiple customers

---

## 13. Error Handling & Recovery

### 13.1 File Upload Errors
```javascript
// Caught in ImportDialog.handleFile()
try {
  buffer = await file.arrayBuffer();
  workbook = XLSX.read(buffer, { type: "array" });
} catch (error) {
  setTemplateError("Could not read the file. Please try again.");
}
```

### 13.2 Validation Errors
```javascript
// Caught in handleValidateImportRows()
try {
  const validated = await onValidate(rawRows);
  setRows(validated);
} catch (error) {
  setTemplateError("Could not validate the file. Please try again.");
}
```

### 13.3 Import Errors
```javascript
// Caught in handleImport()
try {
  await dispatch(createCustomerItem(payload));
  message.success(`Imported ${validCount} rows.`);
  onClose();
} catch (error) {
  message.error("Import failed. Please check the file and try again.");
  // Dialog stays open, user can retry without re-uploading
}
```

---

## 14. Key Design Decisions

| Decision | Rationale |
|---|---|
| **Pre-count in-file duplicates** | Both duplicate rows should be flagged, not just the 2nd one |
| **Normalize all comparisons** | Case/whitespace differences shouldn't break matching |
| **Fetch line items per customer** | Item Type validation must be dynamic, based on what customer actually has |
| **Group rows by customer::shipId** | Single bulk API call handles multiple customers efficiently |
| **Check backend duplicates AFTER customer/item/type validation** | Don't waste API calls validating rows that will fail anyway |
| **Auto-fill Description** | Reduces manual data entry in Excel template |
| **Download errors button** | Users can fix specific issues and re-upload instead of fixing the entire file |
| **Keep dialog open on import error** | User doesn't have to re-upload if first attempt fails |

---

## 15. Related Components & Files

| File | Purpose |
|---|---|
| `ImportDialog.jsx` | File upload UI, header validation, results display |
| `CustomerProcessIDMapping.jsx` | Orchestration, deep validation, API calls |
| `helpers.js` | Normalization, duplicate detection, process master building |
| `CustomerProcessIDSlice.jsx` | Redux async thunks for API calls |
| `MappingTable.jsx` | Displays imported/existing mappings |
| `MappingDrawer.jsx` | Manual creation form |
| `EditCustomerItemDialog.jsx` | Edit existing mapping |

---

## 16. Future Enhancements

- [ ] Parallel API fetches for multiple customers (performance)
- [ ] Drag-and-drop column mapping (UX for varied templates)
- [ ] Custom validation rules per customer (whitelist specific items)
- [ ] Import progress indicator for large files (>1000 rows)
- [ ] Webhook/async processing for very large imports
- [ ] Multi-language error messages
- [ ] Schema versioning for backwards compatibility

---

**End of Document**
