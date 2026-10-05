# Customer Process ID Mapping - Complete Functional Document
## Full Component Flow & Architecture

**Document Version:** 2.0  
**Date:** September 2026  
**Module:** Customer Process ID Mapping  
**File Location:** `src/pages/Masters/Customer Master/CustomerProcessIDMapping/`

---

## 1. Overview

The **Customer Process ID Mapping** module allows users to create, manage, and bulk-import mappings between internal Process IDs and customer-specific item codes. A mapping links a customer's internal naming convention to your organization's Process ID (for tyres, assemblies, or rims) at specific ship-to addresses.

### Business Purpose:
- **Standardize communication** between your organization and customers
- **Support multiple customers** with different naming conventions  
- **Enable barcode printing** based on customer item codes
- **Track specifications** (brand, tyre size, platform, etc.) per mapping
- **Bulk import** via Excel for efficiency

### Key Stakeholders:
- **Sales/Customer Service** — manage per-customer mappings
- **Operations** — print barcodes and ship items correctly labeled
- **Supply Chain** — track item variants across customers

---

## 2. Architecture Overview

### 2.1 Component Structure

```
CustomerProcessIDMapping (Main Container)
├── CPMHeader (Navigation & Title - in parent)
├── Stat Cards (Total, Active, Inactive, Recently Updated)
├── Specification & Mapping Panel
│   ├── Customer Selector
│   ├── Ship Address Selector (Multi-select)
│   ├── Item Type Selector (Tyre/Assembly/Rim)
│   ├── Spec Dropdowns (Brand, Platform, etc.)
│   ├── Our Process ID Input + Copy Button
│   ├── Customer Process ID Input
│   └── Action Buttons (Save Mapping, Reset)
│
├── Records Table Section
│   ├── Search Bar
│   ├── Filter Dropdowns (Status, Ship Address, Company, Customer)
│   ├── Show Duplicates Toggle
│   ├── Bulk Actions (Activate, Deactivate)
│   └── MappingTable
│       ├── Row selection checkboxes
│       ├── Column visualization
│       ├── Row menu (View, Edit, Toggle Status)
│       ├── Status badges
│       └── Duplicate indicators
│
├── MappingDrawer (Manual creation form)
├── ViewDrawer (Read-only details)
├── EditCustomerItemDialog (Update existing)
├── HistoryDrawer (Audit trail)
├── ImportDialog (Excel bulk upload)
├── DuplicateItemsDialog (Handle conflicts)
└── ProtectedRoutes (Permission checks)
```

### 2.2 State Management Architecture

```
Redux Store (CIMMaster + CIMBarcode)
├── CIMMasterSlice
│   ├── mode: "barcode-print" | other modes
│   ├── loading: boolean
│   └── search: string
│
└── CIMBarcodeSlice
    ├── mode: "barcode-print"
    ├── loading: boolean
    ├── search: string
    ├── custWorkOrder: array (work orders)
    └── itemsByWorkOrder: array (items per work order)

CustomerProcessIDSlice (Redux Thunks)
├── getListOfCustomer()
├── getListOfItems(custID)
├── getCustomerItemsByCustomerAndShip()
├── createCustomerItem(payload)
└── updateCustomerItem(payload)

Local Component State
├── rawMappings: array (all API-backed mappings)
├── customer: string (selected custID)
├── shipAddress: array (selected ship IDs)
├── customerLineItems: object (tyre/assembly/rim per customer)
├── itemTypeFilter: "tyre" | "assembly" | "rim"
├── specs: object (selected spec values)
├── processId: string (resolved Our Process ID)
├── customerProcessId: string (customer's item code)
├── search: string (table search)
├── status: string (filter)
├── viewDrawer: { open, record }
├── editDialog: { open, record }
├── importOpen: boolean
├── duplicateDialog: { open, duplicateRows, validShipIds }
└── mappingDrawer: { open, mode, record }
```

---

## 3. Complete Data Flow & Workflows

### 3.1 Page Load Flow

```
Component Mounts
        ↓
dispatch(getListOfCustomer())
├─ GET /OrderProcess/customer-master
└─ Returns: [{ custID, customerName, addresses[] }]
        ↓
setCustomerList(response)
        ↓
Set initial state (empty mappings, no customer selected)
        ↓
Page Ready (Stats card shows total=0, no data in table)
```

**Returned Customer Object Structure:**
```javascript
{
  custID: "CUST-1001",
  customerName: "XYZ Corp",
  customerCode: "CUST-1001",
  addresses: [
    {
      id: 501,
      addressType: 1,      // 1 = ship-to
      addressName: "Main Warehouse",
      city: "New York",
      stateName: "NY",
      country: "USA",
      zipCode: "10001",
      companyName: "XYZ Distribution"
    },
    { id: 502, ... }
  ]
}
```

### 3.2 Customer Selection Flow

```
User Selects Customer
        ↓
setCustomer(custID)
        ↓
Reset dependent state:
├─ shipAddress = [] (empty multi-select)
├─ customerData = [] (clear loaded items)
├─ specs = {} (empty spec selections)
├─ processId = ""
├─ itemTypeFilter = "tyre"
└─ customerLineItems = { tyre: [], assemblyTyre: [], rim: [] }
        ↓
useEffect([customer]) triggers
└─ Extract addresses from customerList
└─ setShipAddressList(customer.addresses)
        ↓
useEffect([customer]) triggers (customerProcessIDSlice)
├─ dispatch(getListOfItems(custID))
│  └─ GET /OrderProcess/customer-LineItems/{custID}
│     Returns: { tyre: [...], assemblyTyre: [...], rim: [...] }
│
└─ Normalize into customerProcessMaster
   ├─ Extract allowed itemTypes: ["tyre", "assembly", "rim"]
   ├─ Build process master for spec dropdowns
   └─ Update activeFields (only specs this customer has)
```

**Line Items Response:**
```javascript
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
      directional: "LH",
      piD_Details: "Left-Hand Assembly"
    }
  ],
  rim: [...]
}
```

### 3.3 Ship Address Selection Flow

```
User Selects One or More Ship Addresses
        ↓
setShipAddress([501, 502])
        ↓
useEffect([customer, shipAddress]) triggers
├─ If no shipAddress selected:
│   └─ setCustomerData([])
│   └─ Exit
│
└─ If shipAddress selected:
   ├─ dispatch(getCustomerItemsByCustomerAndShip({
   │    customerCode: customer,
   │    shipIds: [501, 502]
   │  }))
   │
   └─ GET /CustomerItemMaster/customer-ship?
       customerCode=CUST-1001&shipID=501&shipID=502
       
       Returns: [
         {
           id: 123,
           customerCode: "CUST-1001",
           shipid: 501,
           itemCode: "TYRE-18565R15",
           customerItemCode: "CUST-TYRE-001",
           isActive: true,
           category: "Summer",
           config: "Tubeless",
           tyreSize: "185/65 R15",
           ... spec fields ...
           createdBy: "admin",
           createdDate: "2024-01-15T10:00:00Z"
         }
       ]
        ↓
Transform API response into table rows (apiMappings)
├─ Add composite ID: `api-{id}-{shipid}`
├─ Format ship address from address component
├─ Fetch customer name from customerList
└─ Cross-ref itemType with customerProcessMaster
        ↓
Combine with local mock data (rawMappings)
        ↓
setRawMappings([...apiMappings, ...mockRows])
        ↓
Recalculate:
├─ stats (total, active, inactive, recently updated)
├─ duplicateIds (customer + ship + processId combos)
├─ filteredData (apply search + filters)
└─ Update MappingTable with all results
```

### 3.4 Spec Selection & Process ID Resolution Flow

```
User Changes a Spec Field (e.g., Brand)
        ↓
handleSpecChange(key, value)
├─ setSpecs({ ...specs, [key]: value })
├─ Drop any other spec selections that are no longer valid
│   (cascade logic — if user picks Brand="XYZ" and no
│    process has Brand="XYZ" + their other selections,
│    clear the incompatible selections)
└─ Clear processId
        ↓
useMemo(matchedRows) recalculates
├─ Filter customerProcessMaster:
│  WHERE all activeFields match selected specs
│
└─ Returns: matching process rows
        ↓
useMemo(specOptions) recalculates
├─ For each field, compute available values
│  given the other selections
│
└─ Update dropdowns (cascade narrowing)
        ↓
Display hint: "{N} processes match — narrow further"
        or "Process ID resolved — 1 exact match"

---

User Manually Types Process ID
        ↓
handleProcessIdInput(value)
├─ setProcessId(value.toUpperCase())
├─ Find matching row in filteredProcessMaster
│  WHERE processId == typed value
│
└─ If exact match:
   └─ Auto-fill all specs with matched row values
      (reverse lookup)
        ↓
Display hint: "Process ID resolved — 1 exact match"
```

### 3.5 Save Mapping Flow (Create)

```
User Clicks "Save Mapping" Button
        ↓
Validation:
├─ customer must be selected
├─ shipAddress must have at least 1 selection
├─ itemTypeFilter must be set ("tyre" or "assembly")
├─ processId must be resolved
└─ customerProcessId must be non-empty
        ↓
Check for duplicates (at each selected ship address):
├─ For each shipId in shipAddress:
│  └─ Does existing mapping exist?
│     WHERE customer + ship + processId match
│          OR customer + ship + customerItemCode match
│
└─ If duplicates found:
   └─ Open DuplicateItemsDialog
      (let user pick which ship addresses to skip)
        ↓
If no duplicates, proceed to submitMapping(validShipIds)
        ↓
Fetch matchedItem from customerProcessMaster:
├─ Description = matchedItem.piDetails
│  (auto-filled from line items, not user-entered)
└─ Build create payload:
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
          customerItemCode: "CUST-TYRE-001",
          isActive: true,
          description: "Summer Radial Tyre - 185/65R15"
        }
      ]
    },
    {
      id: 0,
      shipid: 502,
      customerCode: "CUST-1001",
      items: [{ same item }]
    }
  ]
}
        ↓
dispatch(createCustomerItem(payload))
├─ POST /CustomerItemMaster/CreateCustomerItem
├─ Status: 200 or 201 = success
└─ Status: 400+ = error
        ↓
On Success:
├─ Show toast: "Mapping created"
├─ Update local rawMappings + UI
├─ Reset specification panel
├─ Refresh stats + table
└─ Close any open dialogs
        ↓
On Error:
├─ Show error toast with message
├─ Keep panel open (user can retry)
└─ Log error
```

### 3.6 Edit Mapping Flow

```
User Clicks "Edit" on a Row
        ↓
openEdit(record)
├─ Close ViewDrawer
├─ setEditDialog({ open: true, record })
└─ setEditError("")
        ↓
EditCustomerItemDialog Opens
├─ Pre-fill form with record data
├─ Display current values
└─ Allow editing of:
   - Customer Process ID
   - Item Code (if allowed)
   - Status
   - Remarks
        ↓
User Makes Changes & Clicks Save
        ↓
handleSaveEditedItem(payload)
├─ Validation: duplicate check
│  (same as create, but exclude current record ID)
│
└─ dispatch(updateCustomerItem(payload))
   └─ PUT /CustomerItemMaster/UpdateCustomerItem
      Payload: {
        id: 123,
        customerItemCode: "CUST-ITEM-UPDATED",
        isActive: true,
        modifiedBy: "current user",
        modifiedDate: now
      }
        ↓
On Success:
├─ Update rawMappings in memory
├─ Increment revision number
├─ Add to history array
├─ Close EditCustomerItemDialog
├─ Show success toast
└─ Refresh table
        ↓
On Error:
├─ Display error inline in dialog
├─ Keep dialog open
└─ Show error message
```

### 3.7 Toggle Status Flow (Activate/Deactivate)

```
User Clicks "Activate" or "Deactivate" on a Row
        ↓
onToggleStatus(record)
├─ buildStatusPayload(record, isActive: boolean)
│  └─ Returns: { id, isActive, modifiedDate, ... }
│
└─ dispatch(updateCustomerItem(payload))
   └─ PUT /CustomerItemMaster/UpdateCustomerItem
        ↓
On Success:
├─ Update local record status
├─ Refresh stats
├─ Show toast: "Item activated/deactivated"
└─ Update table view
        ↓
User Selects Multiple Rows & Clicks "Activate/Deactivate"
        ↓
handleBulkEnable(selectedRecords) or handleBulkDisable(...)
├─ Loop through each selected record
├─ dispatch(updateCustomerItem(...)) for each
└─ Use Promise.allSettled() for parallel execution
        ↓
On Completion:
├─ Count successes vs failures
├─ Show summary toast
├─ Clear selection
└─ Refresh stats + table
```

### 3.8 Export Flows

```
EXPORT VISIBLE DATA (CSV):
User Clicks "Export"
        ↓
handleExport()
├─ Filter headers (only visible columns)
├─ Map filtered data to CSV format
├─ Create Blob
└─ Download: "customer-process-mappings.csv"

EXPORT DUPLICATES (CSV):
User Clicks "Export Duplicates"
        ↓
handleExportDuplicates()
├─ Filter mappings to duplicateIds only
├─ Build CSV from filtered set
└─ Download: "duplicate-customer-process-mappings.csv"

EXPORT BULK IMPORT ERRORS (XLSX):
User Clicks "Download Errors" in ImportDialog
        ↓
handleExportErrors()
├─ Filter rows with _valid = false
├─ Add Error column with _error message
└─ Download: "{originalfilename}-errors.xlsx"
```

---

## 4. Redux Slices & API Integration

### 4.1 CustomerProcessIDSlice Redux Thunks

#### A. getListOfCustomer()

```javascript
// Async Thunk
export const getListOfCustomer = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await api.get("/OrderProcess/customer-master");
    if (res.status === 200) {
      return res.data.data;  // [{ custID, customerName, addresses[] }]
    }
    throw new Error("Unexpected status: " + res.status);
  } catch (error) {
    console.error("Customer list API error:", error);
  } finally {
    dispatch(setLoading(false));
  }
};

// Called at page load, cached in component state
```

**Response Format:**
```javascript
{
  data: {
    data: [
      {
        custID: "CUST-1001",
        customerName: "Apollo Tyres Ltd",
        customerCode: "CUST-1001",
        addresses: [
          { id: 501, addressType: 1, city: "New York", ... },
          { id: 502, addressType: 1, city: "Los Angeles", ... }
        ]
      }
    ]
  }
}
```

#### B. getListOfItems(custID)

```javascript
// Async Thunk
export const getListOfItems = (custID) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await api.get(`/OrderProcess/customer-LineItems/${custID}`);
    if (res.status === 200) {
      return res.data.data;  // { tyre: [], assemblyTyre: [], rim: [] }
    }
    throw new Error("Unexpected status: " + res.status);
  } catch (error) {
    console.error("Line items API error:", error);
    return { tyre: [], assemblyTyre: [], rim: [] };
  } finally {
    dispatch(setLoading(false));
  }
};

// Called whenever customer changes
```

**Response Format:**
```javascript
{
  data: {
    data: {
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
          piD_Details: "Description for barcode"
        }
      ],
      assemblyTyre: [...],
      rim: [...]
    }
  }
}
```

#### C. getCustomerItemsByCustomerAndShip({ customerCode, shipIds })

```javascript
// Async Thunk
export const getCustomerItemsByCustomerAndShip = ({ customerCode, shipIds }) => 
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // Build query string manually due to backend requirements
      const query = new URLSearchParams();
      query.append("customerCode", customerCode);
      (Array.isArray(shipIds) ? shipIds : [shipIds])
        .forEach((id) => query.append("shipID", id));
      
      const res = await api.get(
        `/CustomerItemMaster/customer-ship?${query.toString()}`
      );
      
      if (res.status === 200) {
        return res.data.data;  // Array of existing mappings
      }
      throw new Error("Unexpected status: " + res.status);
    } catch (error) {
      console.error("Customer items API error:", error);
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  };

// Called when customer + shipAddress are selected
```

**Response Format:**
```javascript
{
  data: {
    data: [
      {
        id: 123,
        customerCode: "CUST-1001",
        shipid: 501,
        itemCode: "TYRE-18565R15",
        customerItemCode: "CUST-TYRE-001",
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
    ]
  }
}
```

#### D. createCustomerItem(payload)

```javascript
// Async Thunk
export const createCustomerItem = (payload) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await api.post(
      "/CustomerItemMaster/CreateCustomerItem",
      payload
    );
    
    if (res.status === 200 || res.status === 201) {
      return res.data.data;
    }
    throw new Error("Unexpected status: " + res.status);
  } catch (error) {
    console.error("Create item API error:", error);
    throw error;  // Caller handles the error
  } finally {
    dispatch(setLoading(false));
  }
};

// Payload sent:
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
          customerItemCode: "CUST-TYRE-001",
          isActive: true,
          description: "Summer Radial Tyre - 185/65R15"
        }
      ]
    }
  ]
}
```

#### E. updateCustomerItem(payload)

```javascript
// Async Thunk
export const updateCustomerItem = (payload) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await api.put(
      "/CustomerItemMaster/UpdateCustomerItem",
      payload
    );
    
    if (res.status === 200 || res.status === 201) {
      return res.data.data;
    }
    throw new Error("Unexpected status: " + res.status);
  } catch (error) {
    console.error("Update item API error:", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Payload sent:
{
  id: 123,                    // Record ID from DB
  customerItemCode: "CUST-ITEM-UPDATED",
  itemCode: "TYRE-18565R15",  // Can update
  isActive: true,
  modifiedBy: "admin",
  modifiedDate: "2024-01-21T10:00:00Z"
}
```

### 4.2 CIMMasterSlice (UI State)

```javascript
const initialState = {
  mode: "barcode-print",
  loading: false,
  search: "",
};

export const {
  setMode,      // Switch between tabs/modes
  setLoading,   // Global loading state
  setSearch     // Table search input
} = CIMMasterSlice.actions;
```

### 4.3 CIMBarcodeSlice (Barcode Printing)

```javascript
// Handles barcode printing workflows
export const printSingleBarcode = (barcode) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await api.get(
      `/CustomBarcode/GetMetcoBarcodeLable?barcode=${barcode}`
    );
    
    if (res.status === 200 && res.data.zplCode) {
      await printSingleBarcodeLabel(res.data.zplCode);
      return { success: true, data: res.data };
    }
    return { success: false, message: "Invalid response" };
  } catch (error) {
    console.error("Barcode API error:", error);
    return { success: false, message: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const getCusWorkOrder = (plant) => async (dispatch) => {
  // Fetch work orders for a plant
  // Used in barcode printing workflow
};

export const getItemsByWorkOrder = (O_ID) => async (dispatch) => {
  // Fetch items grouped by work order
  // Used to populate barcode printing list
};
```

---

## 5. Component Hierarchy & Responsibilities

### 5.1 CustomerProcessIDMapping (Main Container)

**Responsibilities:**
- Orchestrate entire workflow
- Manage all local state
- Fetch API data via Redux dispatch
- Handle duplicate detection
- Aggregate data into `mappings` array
- Render layout structure

**Key State:**
```javascript
const [rawMappings, setRawMappings] = useState(INITIAL_MAPPINGS);
const [customer, setCustomer] = useState(undefined);
const [shipAddress, setShipAddress] = useState([]);
const [specs, setSpecs] = useState(EMPTY_SPECS);
const [search, setSearch] = useState("");
const [status, setStatus] = useState(undefined);
// ... 30+ state variables
```

**Computed Values (useMemo):**
```javascript
const customerProcessMaster = useMemo(
  () => buildProcessMaster(customerLineItems),
  [customerLineItems]
);  // Normalized process items

const activeFields = useMemo(
  () => SPEC_FIELDS.filter(...),
  [filteredProcessMaster, itemTypeFilter]
);  // Visible spec dropdowns

const mappings = useMemo(
  () => [...apiMappings, ...rawMappings],
  [customerData, selectedCustomerName, ...]
);  // Combined API + local data

const filteredData = useMemo(
  () => mappings.filter(row => 
    matches search && status && filters),
  [mappings, search, status, ...]
);  // Table data after filters

const duplicateIds = useMemo(
  () => findDuplicates(mappings),
  [mappings]
);  // IDs of duplicate rows
```

### 5.2 ImportDialog

**Responsibilities:**
- File upload UI (drag-drop)
- Excel parsing & header validation
- Call parent's `onValidate` function (deep validation)
- Display validation results table
- Batch import confirmation

**Props:**
```javascript
{
  open: boolean,
  onClose: () => void,
  onValidate: async (rawRows) => validatedRows,  // Deep validation
  onImport: async (validRows) => void            // Bulk insert
}
```

**Key Functions:**
```javascript
const handleFile = (file) => {
  // 1. Check file type (.xlsx/.xls only)
  // 2. Parse with xlsx library
  // 3. Extract headers (case/whitespace insensitive)
  // 4. Validate headers present
  // 5. Call onValidate(rawRows) for deep validation
};

const handleImportClick = async () => {
  // 1. Filter rows with _valid === true
  // 2. dispatch(onImport(validRows))
  // 3. Close dialog on success
};

const handleExportErrors = () => {
  // Export rows with _valid === false
};
```

### 5.3 MappingTable

**Responsibilities:**
- Render data in columns
- Handle row selection checkboxes
- Show row context menu (View, Edit, Toggle Status)
- Highlight duplicate badges
- Format cell values (dates, status badges, etc.)

**Props:**
```javascript
{
  data: array,                              // Rows to display
  loading: boolean,                         // Loading state
  visible: { [key]: boolean },              // Visible columns
  onView: (record) => void,                 // View details
  onEdit: (record) => void,                 // Edit row
  onToggleStatus: (record) => void,         // Activate/deactivate
  onBulkStatusChange: (records, isActive) => void,
  duplicateIds: Set<id>                     // Rows with duplicates
}
```

**Key Features:**
```javascript
const allChecked = data.length > 0 && 
  selectedRowKeys.length === data.length;  // Select all

const someChecked = selectedRowKeys.length > 0 && 
  !allChecked;                             // Indeterminate

const selectedRecords = useMemo(
  () => data.filter(r => selectedRowKeys.includes(r.id)),
  [data, selectedRowKeys]
);  // Records for bulk actions

const runBulk = async (isActive) => {
  // Parallel dispatch of updateCustomerItem for each selected
  // Use Promise.allSettled() to track success/failure
};
```

### 5.4 ViewDrawer

**Responsibilities:**
- Display read-only mapping details
- Show all fields (specs, timestamps, creator)
- Provide Edit button (opens EditCustomerItemDialog)
- Show revision history (if available)

**Props:**
```javascript
{
  open: boolean,
  record: { id, customer, ourProcessId, ... },
  onClose: () => void,
  onEdit: (record) => void,
  onOpenHistory: (record) => void
}
```

### 5.5 EditCustomerItemDialog

**Responsibilities:**
- Read-only display of key fields
- Editable fields: Customer Process ID, Item Code, Remarks, Status
- Validate changes against duplicate rules
- Submit updates via Redux

**Props:**
```javascript
{
  open: boolean,
  record: { id, customerItemCode, itemCode, status },
  error: string,
  loading: boolean,
  onSave: (payload) => Promise<void>,
  onClose: () => void
}
```

**Duplicate Checking:**
```javascript
// Before submit, check if changes create a duplicate:
const otherMappings = mappings.filter(m => m.id !== record.id);
const isDuplicate = isDuplicateMapping(otherMappings, {
  customerCode: payload.customerCode,
  shipid: payload.shipid,
  itemCode: payload.itemCode,
  customerItemCode: payload.customerItemCode
});

if (isDuplicate) {
  setEditError("This mapping already exists.");
  return;
}
```

### 5.6 DuplicateItemsDialog

**Responsibilities:**
- Display ship addresses with duplicates (same customer + processId)
- Offer user choice:
  1. Cancel (don't create mapping)
  2. Create Valid Only (skip duplicates, create rest)
- Return filtered list of valid ship IDs

**Props:**
```javascript
{
  open: boolean,
  duplicateRows: [{ shipId, shipAddressLabel }],
  validShipIds: [501, 502],                // Non-duplicate ship IDs
  onConfirm: (shipIds) => void,            // Skip duplicates, create rest
  onCancel: () => void
}
```

### 5.7 HistoryDrawer

**Responsibilities:**
- Display audit trail of changes
- Show revision history with timestamps
- Show creator/modifier info

**Structure:**
```javascript
record.history = [
  {
    date: "2024-01-15T10:00:00Z",
    by: "admin",
    action: "Created mapping",
    status: "Active"
  },
  {
    date: "2024-01-20T14:30:00Z",
    by: "user@example.com",
    action: "Updated mapping",
    status: "Active"
  }
]
```

---

## 6. Business Logic & Validation Rules

### 6.1 Spec Cascading Logic

When user selects a spec value, other unselected specs are narrowed to only show values that can coexist with the selected value.

```javascript
const specOptions = useMemo(() => {
  const out = {};
  activeFields.forEach((f) => {
    // For each field, find all rows that match:
    // - All OTHER selected specs match this row
    // - Then extract unique values for THIS field
    const pool = filteredProcessMaster.filter((row) =>
      activeFields.every((o) => 
        o.key === f.key ||                    // Don't check self
        !specs[o.key] ||                      // Skip unselected fields
        String(row[o.key]) === specs[o.key]   // Else match
      )
    );
    out[f.key] = [...new Set(pool.map((row) => row[f.key]))]
      .filter(Boolean)
      .sort();
  });
  return out;
}, [specs, activeFields, filteredProcessMaster]);
```

**Example:**
```
User selects Brand = "XYZ"
  ↓
specOptions["tyreSize"] now shows only sizes that exist 
on "XYZ" branded tyres for this customer

User then selects Size = "185/65 R15"
  ↓
specOptions["rimSize"] now shows only rims that exist
on XYZ brand 185/65 R15 tyres
```

### 6.2 Duplicate Detection Rules

A mapping is considered a **duplicate** if another mapping exists with:
- **Same customer** + **same ship address** + **same item code** (ourProcessId)
  OR
- **Same customer** + **same ship address** + **same customer item code** (customerProcessId)

The customer item code is a 1:1 alias for ONE item at a specific ship address — reusing it for a different item = duplicate.

```javascript
export const isDuplicateMapping = (existingRecords, {
  customerCode, shipid, itemCode, customerItemCode
}) => {
  return (existingRecords || []).some((m) => {
    // Filter on customer + ship first
    if (norm(m.customerCode) !== norm(customerCode) ||
        Number(m.shipid) !== Number(shipid)) {
      return false;
    }
    
    // Then check item code OR customer item code
    if (itemCode && 
        norm(m.ourProcessId ?? m.itemCode) === norm(itemCode)) {
      return true;
    }
    if (customerItemCode && 
        norm(m.customerProcessId ?? m.customerItemCode) === norm(customerItemCode)) {
      return true;
    }
    return false;
  });
};
```

### 6.3 Duplicate Detection at Load Time

```javascript
const duplicateIds = useMemo(() => {
  const seen = new Map();  // Key: customer::ship::processId
  const dupes = new Set();
  
  mappings.forEach((m) => {
    const key = `${norm(m.customer)}::${m.shipid}::${norm(m.ourProcessId)}`;
    if (seen.has(key)) {
      // Mark both the new AND existing as duplicates
      dupes.add(seen.get(key).id);
      dupes.add(m.id);
    } else {
      seen.set(key, m);
    }
  });
  
  return dupes;
}, [mappings]);
```

### 6.4 Item Type Validation (Per Customer)

Item Type must exist in the selected customer's process master.

```javascript
const allowedItemTypes = useMemo(() => {
  if (!customer) return [];
  
  // Extract distinct itemTypes from process master
  return [...new Set(
    customerProcessMaster
      .map(p => p.itemType)
      .filter(Boolean)
  )];
}, [customerProcessMaster, customer]);

// Then validate:
if (!allowedItemTypes.includes(selectedItemType)) {
  setError(`Item Type '${selectedItemType}' not allowed. Allowed: ${allowedItemTypes.join(", ")}`);
}
```

---

## 7. Table Operations & Filtering

### 7.1 Search Filter

Full-text search across ALL visible fields in the table.

```javascript
const filteredData = useMemo(() => {
  const q = search.trim().toLowerCase();
  return mappings.filter((m) => {
    // Combine all field values into one searchable string
    const text = Object.values(m)
      .join(" ")
      .toLowerCase();
    
    return text.includes(q);
  });
}, [mappings, search]);
```

**Example:**
- Search: "XYZ" → Matches rows where customer, brand, company, etc. contain "XYZ"
- Search: "201" → Matches rows with Process ID, Ship ID, revision, etc. containing "201"

### 7.2 Multi-Filter Stack

Filters are **AND-ed together** (all must match):

```javascript
const filteredData = useMemo(() => {
  const q = search.trim().toLowerCase();
  return mappings.filter((m) => {
    // All filters must pass
    if (showDuplicatesOnly && !duplicateIds.has(m.id)) 
      return false;
    if (q && !Object.values(m).join(" ").toLowerCase().includes(q)) 
      return false;
    if (status && m.status !== status) 
      return false;
    if (shipAddressFilter && m.shipAddress !== shipAddressFilter) 
      return false;
    if (companyNameFilter && m.companyName !== companyNameFilter) 
      return false;
    if (customerFilter && m.customer !== customerFilter) 
      return false;
    
    return true;
  });
}, [mappings, search, status, shipAddressFilter, companyNameFilter, customerFilter, showDuplicatesOnly, duplicateIds]);
```

### 7.3 Column Visibility Toggle

User can choose which columns to display via column menu.

```javascript
const [visibleColumns, setVisibleColumns] = useState(() =>
  Object.fromEntries(BASE_COLUMNS.map((c) => [c.key, true]))
);

const BASE_COLUMNS = [
  { key: "customer", title: "Customer", width: "170px" },
  { key: "shipAddress", title: "Ship Address", width: "220px" },
  { key: "customerProcessId", title: "Customer Process ID", width: "190px" },
  { key: "ourProcessId", title: "Our Process ID", width: "150px" },
  { key: "platform", title: "Platform", width: "100px" },
  { key: "brand", title: "Brand", width: "140px" },
  // ... more columns
];

// In UI:
<MappingTable
  data={filteredData}
  visible={visibleColumns}
  onColumnToggle={(key) => setVisibleColumns(prev => ({
    ...prev,
    [key]: !prev[key]
  }))}
/>
```

---

## 8. Stats & Metrics

### 8.1 Stats Card Calculations

```javascript
const stats = useMemo(() => {
  const total = mappings.length;
  const active = mappings.filter((m) => m.status === "Active").length;
  const inactive = mappings.filter((m) => m.status === "Inactive").length;
  const recentlyUpdated = mappings.filter((m) =>
    Date.now() - new Date(m.lastUpdated).getTime() < 7 * 86400000  // 7 days
  ).length;
  
  return { total, active, inactive, recentlyUpdated };
}, [mappings]);
```

**Display:**
```
┌─────────────────────────────────────────────────────┐
│  Total Mappings:  42  │  Active:  38  │  Inactive:  4  │  Recently Updated:  12  │
└─────────────────────────────────────────────────────┘
```

### 8.2 Refresh Stats on Data Change

Stats automatically recalculate whenever `mappings` changes:
- User creates new mapping
- User edits existing mapping
- User imports batch
- User toggles status
- Data refreshed from API

---

## 9. Error Handling & Recovery

### 9.1 API Error Handling

```javascript
// Pattern used across all thunks:
try {
  const res = await api.get(...);
  if (res.status === 200) {
    return res.data.data;
  }
  throw new Error("Unexpected status: " + res.status);
} catch (error) {
  console.error("API Error:", error);
  // Return default value or throw
  return [];  // or: throw error
}
```

### 9.2 Component-Level Error States

```javascript
const [editError, setEditError] = useState("");

const handleSaveEditedItem = async (payload) => {
  setEditError("");  // Clear previous error
  
  // ... validation ...
  
  try {
    await dispatch(updateCustomerItem(payload));
    showSuccessToast();
  } catch (error) {
    setEditError(error.message || "Update failed");  // Display inline
  }
};
```

### 9.3 User-Friendly Error Messages

| Error | Scenario | User Action |
|---|---|---|
| "Unsupported file type" | User uploads .docx instead of .xlsx | Re-upload correct format |
| "Missing required columns" | Excel headers don't match | Download template, use correct headers |
| "Customer Code is not available" | Excel row references invalid customer | Enter valid customer code |
| "This mapping already exists" | Duplicate customer + ship + item code | Use unique customer item code |
| "Import failed. Please check the file and try again." | Server error during bulk insert | Check file, retry |
| "Disabled 9 of 10. 1 failed — please retry." | Bulk status change partially failed | Retry on failed record |

---

## 10. Performance Optimizations

### 10.1 Memoization Strategy

**Expensive calculations wrapped in useMemo:**
```javascript
const customerProcessMaster = useMemo(
  () => buildProcessMaster(customerLineItems),
  [customerLineItems]
);

const activeFields = useMemo(
  () => SPEC_FIELDS.filter(...),
  [filteredProcessMaster, itemTypeFilter]
);

const mappings = useMemo(
  () => [...apiMappings, ...rawMappings],
  [customerData, ...dependencies]
);

const filteredData = useMemo(
  () => mappings.filter(...),
  [mappings, search, filters]
);

const duplicateIds = useMemo(
  () => findDuplicates(mappings),
  [mappings]
);

const stats = useMemo(
  () => ({ total, active, inactive, recentlyUpdated }),
  [mappings]
);
```

**Benefits:**
- Prevents unnecessary re-renders
- Spec dropdowns don't re-compute unless customer or specs change
- Table filtering doesn't throttle on every keystroke
- Duplicate detection runs only when mappings change

### 10.2 API Call Optimization

**Batch Grouping:**
```javascript
// Instead of:
// POST /CreateCustomerItem for each mapping (N calls)

// We do:
// POST /CreateCustomerItem once with all rows grouped:
{
  customerIDs: [
    {
      shipid: 501,
      items: [item1, item2]  // All items for this ship
    },
    {
      shipid: 502,
      items: [item3]
    }
  ]
}
```

**Reduction:** N rows → M (customer::shipId combinations) API calls

### 10.3 Caching Strategy

```javascript
// Fetched Once at Page Load:
const [customerList, setCustomerList] = useState([]);

// Fetched When Customer Changes:
const [customerLineItems, setCustomerLineItems] = useState({});

// Fetched When Customer + Ship Address Change:
const [customerData, setCustomerData] = useState([]);
```

**Prevents redundant API calls:**
- Changing ship address doesn't re-fetch customer list
- Changing customer clears stale line items + customer data
- Scrolling/filtering doesn't trigger new API calls

---

## 11. Data Structures

### 11.1 Mapping Row Structure

```javascript
{
  // Database fields
  id: 123,                              // Unique record ID
  customerItemID: 123,                  // For UpdateCustomerItem
  
  // Identifiers
  customer: "Apollo Tyres Ltd",         // Customer name from list
  customerID: "CUST-1001",              // Customer ID
  customerCode: "CUST-1001",
  shipid: 501,                          // Ship address ID
  shipAddress: "New York, NY, USA",     // Formatted address
  companyName: "Apollo Distribution",   // Company name at ship address
  
  // Mapping details
  customerProcessId: "CUST-TYRE-001",  // Customer's item code
  ourProcessId: "TYRE-18565R15",       // Internal Process ID
  
  // Specification fields (from line items)
  category: "Summer",
  platform: "Tubeless",
  tyreSize: "185/65 R15",
  rimSize: "15",
  tyreType: "Radial",
  brand: "XYZ",
  sideWall: "Black",
  directional: "LH",                    // For assemblies only
  
  // Meta
  status: "Active" | "Inactive",
  remarks: "",
  revision: 1,
  
  // Audit trail
  createdBy: "admin",
  createdDate: "2024-01-15T10:00:00Z",
  updatedBy: "admin",
  lastUpdated: "2024-01-20T14:30:00Z",
  
  // History (for HistoryDrawer)
  history: [
    {
      date: "2024-01-15T10:00:00Z",
      by: "admin",
      action: "Created mapping",
      status: "Active"
    }
  ]
}
```

### 11.2 Process Master Row Structure

```javascript
{
  processId: "TYRE-18565R15",
  itemType: "tyre",              // "tyre" | "assembly" | "rim"
  category: "Summer",
  platform: "Tubeless",
  tyreSize: "185/65 R15",
  rimSize: "15",
  tyreType: "Radial",
  brand: "XYZ",
  sideWall: "Black",
  directional: "",               // For assembly only
  piDetails: "Summer Radial..."  // Description for barcode
}
```

### 11.3 Spec Field Structure

```javascript
const SPEC_FIELDS = [
  { key: "category", label: "Category", icon: Settings },
  { key: "platform", label: "Platform", icon: Layers },
  { key: "tyreSize", label: "Tyre Size", icon: Maximize },
  { key: "rimSize", label: "Rim", icon: Disc },
  { key: "tyreType", label: "Type", icon: Type },
  { key: "brand", label: "Brand", icon: Tag },
  { key: "sideWall", label: "Sidewall", icon: FileText },
  { key: "directional", label: "Direction", icon: ArrowLeftRight },  // Assembly only
];

// Resolved specs object:
const specs = {
  category: "Summer",
  platform: "Tubeless",
  tyreSize: "185/65 R15",
  rimSize: "15",
  tyreType: "Radial",
  brand: "XYZ",
  sideWall: "Black",
  directional: ""                // Empty if not applicable
};
```

---

## 12. User Workflows & Scenarios

### 12.1 Create New Mapping (Manual Entry)

```
1. Select Customer from dropdown
   ↓
2. Select 1+ Ship Addresses (multi-select)
   ↓
3. Select Item Type (Tyre/Assembly/Rim)
   ↓
4. Select Spec Values (Brand, Platform, Size, etc.)
   ↓
5. Our Process ID auto-fills (if exact match)
   ↓
6. Enter Customer Process ID (their naming convention)
   ↓
7. Click "Save Mapping"
   ↓
8. If duplicate detected → Choose skip or create anyway
   ↓
9. Mapping created, table updates with new row, stats refresh
```

### 12.2 Create Multiple Mappings (Same Item, Different Ships)

```
1. Select Customer
2. Select Multiple Ship Addresses (e.g., 501, 502, 503)
3. Select Item Type, Specs, Process ID
4. Enter Customer Process ID
5. Click "Save Mapping"
   ↓
   Creates 3 mappings:
   ├─ Customer + 501 + Item
   ├─ Customer + 502 + Item
   └─ Customer + 503 + Item
   
   (Single API call with 3 entries in customerIDs array)
```

### 12.3 Bulk Import from Excel

```
1. Click "Import" button
2. Click "Download Template" button
3. Fill template:
   | Customer Code | Ship ID | Item Type | Item Code | Customer Item Code |
   | CUST-1001     | 501     | Tyre      | TYRE-123  | ACME-001           |
   | CUST-1001     | 502     | Tyre      | TYRE-456  | ACME-002           |
4. Save Excel file
5. Drag-drop or click to upload
6. System validates:
   ├─ File format (.xlsx/.xls)
   ├─ Headers present
   ├─ Customer exists
   ├─ Ship ID belongs to customer
   ├─ Item Type allowed for customer
   ├─ Item Code assigned to customer
   ├─ No duplicates (backend or in-file)
   └─ Auto-fills Description
7. Review results:
   ├─ Green rows: ✓ Ready to import
   ├─ Red rows: ✗ Error message shown
   └─ Summary: "5 valid, 2 with errors"
8. Click "Import 5 rows" (disabled if no valid rows)
9. Single API call creates all 5
10. Table updates, ImportDialog closes
```

### 12.4 Find & Fix Duplicates

```
1. Many mappings loaded into table
2. System identifies:
   ├─ CUST-1001 + Ship 501 + TYRE-123 appears 3 times (rows 5, 12, 18)
   ├─ CUST-2002 + Ship 601 + RIM-456 appears 2 times (rows 27, 33)
   └─ Duplicate count shown: "Duplicates: 5"
3. Click "Show Duplicates" toggle button
   └─ Table filters to show only 5 duplicate rows
4. User can:
   ├─ Edit row 5 to use different Item Code
   ├─ Deactivate row 12
   ├─ Delete row 18 (if delete implemented)
   └─ After each fix, duplicate set recalculates
5. Once fixed, duplicates toggle shows "Duplicates: 0"
```

### 12.5 Activate/Deactivate Items

**Single Item:**
```
1. Hover over row
2. Click row menu (three dots)
3. Click "Deactivate"
4. API call: updateCustomerItem({ id, isActive: false })
5. Row status changes gray
6. Stats: "Inactive" count increases
```

**Bulk Operation:**
```
1. Select multiple rows (checkboxes)
2. Click "Deactivate {N} Items" button
3. Parallel API calls for each row (Promise.allSettled)
4. Show result toast: "Deactivated 8 of 10. 2 failed — please retry."
5. Refresh table, clear selection, update stats
```

---

## 13. UI Patterns & Components

### 13.1 Stat Cards

```
┌────────────────────────────────────────┐
│ 📊 Total Mappings: 42                  │
│ ✅ Active: 38                          │
│ ❌ Inactive: 4                         │
│ 🕐 Recently Updated: 12                │
└────────────────────────────────────────┘
```

Each card:
- Icon + Label + Value
- Background color (blue, green, slate, amber)
- Smooth entrance animation
- Updated on every data change

### 13.2 Spec Dropdown Styling

```javascript
const inputCls =
  "w-full rounded-lg border border-slate-200 " +
  "dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 " +
  "px-2 py-1.5 text-[11px] text-slate-700 dark:text-slate-200 " +
  "outline-none transition-colors " +
  "hover:bg-white dark:hover:bg-slate-900 " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15";
```

**Features:**
- 11px font (compact)
- Slate gray with dark mode support
- Hover → white background
- Focus → blue ring
- Smooth transitions

### 13.3 Action Buttons

```javascript
<motion.button
  whileTap={{ scale: 0.98 }}  // Framer motion: tap feedback
  onClick={handleAction}
  disabled={conditionsMet === false}
  className="flex items-center gap-1.5 rounded-lg 
             bg-[var(--primary)] px-4 py-2 text-[12px] 
             font-semibold text-white shadow-sm 
             transition-colors hover:bg-blue-700 
             disabled:cursor-not-allowed disabled:opacity-40"
>
  <Save size={14} /> Save Mapping
</motion.button>
```

**Features:**
- Tap feedback (slight scale down)
- Icon + label
- Blue primary color
- Disabled state (40% opacity)
- Hover feedback

### 13.4 Status Badge

```javascript
const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    Inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  };
  
  return (
    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase ${styles[status]}`}>
      {status}
    </span>
  );
};
```

**Status Colors:**
- 🟢 Active → Green
- ⚫ Inactive → Gray
- 🟡 Pending → Amber

---

## 14. Testing Scenarios

### 14.1 Spec Cascading Test

**Scenario:** User selects Brand = "XYZ"

**Expected:**
- TyreSize dropdown now shows only sizes available on XYZ tyres
- RimSize dropdown shows only rims compatible with XYZ tyres
- If no size matches, dropdown shows empty

### 14.2 Duplicate Detection Test

**Setup:**
- CUST-1001 already has mapping:
  - Ship: 501
  - Process ID: TYRE-18565R15
  - Customer Item Code: ACME-001

**Scenario 1:** Try to create same mapping again
```
Input:
- Customer: CUST-1001
- Ship: 501
- Process ID: TYRE-18565R15
- Customer Item Code: ACME-002  (different customer code)

Expected: ❌ Rejected — "Already exists"
(Reason: Same customer + ship + item code, even different customer item code)
```

**Scenario 2:** Try to create with different item code but same customer item code
```
Input:
- Customer: CUST-1001
- Ship: 501
- Process ID: TYRE-27545R20  (different)
- Customer Item Code: ACME-001  (same as existing)

Expected: ❌ Rejected — "Already exists"
(Reason: Customer item code must be unique at this ship address)
```

**Scenario 3:** Different ship address — no duplicate
```
Input:
- Customer: CUST-1001
- Ship: 502  (different)
- Process ID: TYRE-18565R15
- Customer Item Code: ACME-001

Expected: ✅ Created
(Reason: Different ship address, so not a duplicate)
```

### 14.3 Bulk Import Validation Test

**File Content:**
```
| Customer Code | Ship ID | Item Type | Item Code | Customer Item Code |
| CUST-1001     | 501     | Tyre      | TYRE-123  | CUST-001           |  ← Valid
| CUST-9999     | 501     | Tyre      | TYRE-123  | CUST-002           |  ← Invalid customer
| CUST-1001     | 999     | Tyre      | TYRE-123  | CUST-003           |  ← Invalid ship ID
| CUST-1001     | 501     | Kitchen   | TYRE-123  | CUST-004           |  ← Invalid item type
| CUST-1001     | 501     | Tyre      | TYRE-999  | CUST-005           |  ← Item not assigned
| CUST-1001     | 501     | Tyre      | TYRE-123  | CUST-006           |  ← Valid
| CUST-1001     | 501     | Tyre      | TYRE-123  | CUST-006           |  ← Duplicate in file
```

**Expected Results:**
```
Row 1: ✅ Valid
Row 2: ❌ "Customer Code is not available"
Row 3: ❌ "Ship ID doesn't belong to this Customer"
Row 4: ❌ "Item Type 'Kitchen' is not allowed"
Row 5: ❌ "Process ID 'TYRE-999' not assigned to customer"
Row 6: ✅ Valid
Row 7: ❌ "Customer Item Code duplicated within file" (both rows 6 & 7 marked)

Summary: 2 valid, 5 with errors
Import button: Enabled, shows "Import 2 rows"
```

---

## 15. Future Enhancements

- [ ] Bulk delete functionality
- [ ] Export to Salesforce/ERP direct integration
- [ ] Change history timeline with diff view
- [ ] Barcode label printer integration (ZPL code)
- [ ] Real-time sync with other systems
- [ ] Advanced filtering (date range, created by, etc.)
- [ ] Custom column formulas (computed fields)
- [ ] Multi-language support for error messages
- [ ] Customer portal (read-only access for customers)
- [ ] API versioning for backwards compatibility

---

## 16. Related Files & Dependencies

| File | Purpose |
|---|---|
| `CustomerProcessIDMapping.jsx` | Main container, orchestration |
| `helpers.js` | Normalization, duplicate detection, process master builder |
| `CustomerProcessIDSlice.jsx` | Redux thunks for API calls |
| `CIMMasterSlice.jsx` | UI state (mode, loading, search) |
| `BarcodeSlice.jsx` | Barcode printing workflows |
| `ImportDialog.jsx` | Excel upload & validation |
| `MappingTable.jsx` | Data table rendering |
| `MappingDrawer.jsx` | Manual creation form |
| `ViewDrawer.jsx` | Read-only details |
| `EditCustomerItemDialog.jsx` | Update mapping |
| `HistoryDrawer.jsx` | Audit trail |
| `DuplicateItemsDialog.jsx` | Conflict resolution |
| `mockData.js` | Sample data for development |
| `DynamicDataTable.jsx` | Reusable table component |

---

**End of Document**
