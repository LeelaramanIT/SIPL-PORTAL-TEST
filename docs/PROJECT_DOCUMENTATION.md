# SIPL Portal — Project Documentation

## 1. Project Overview

SIPL Portal (`sipl-portal`) is a React 19 single-page application built with Vite, serving as the internal operations portal for tyre manufacturing/dispatch operations — covering user administration, master data management, dispatch/inspection workflows (PDI/PPC), export and domestic invoicing, order processing, warehouse/rim stock transfer, and analytics reporting.

The frontend is a pure SPA with no backend code in this repository. It communicates with a separate REST API over HTTPS/HTTP via a single Axios instance (`src/utils/axios.jsx`), whose base URL is supplied by the `VITE_BASE_URL` environment variable. Session state is cookie-based (`withCredentials: true`); a global response interceptor handles 401 (session expiry → forced logout), 403 (permission denied), 408 (timeout → logout), 400 (validation errors), and 5xx (server errors), surfacing all of them via toast notifications.

Client-side state is managed with Redux Toolkit, with most slices persisted (encrypted) to `localStorage` or `sessionStorage` via `redux-persist`. Routing uses React Router v7's data router (`createBrowserRouter`), gated by a `ProtectedRoutes` wrapper. The UI is built primarily on Ant Design, with Tailwind CSS for utility styling and Framer Motion for animation.

## 2. Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Framework | React | ^19.0.0 |
| Build tool | Vite | ^6.2.0 |
| Routing | React Router DOM | ^7.3.0 |
| State management | Redux Toolkit | ^2.8.0 |
| State bindings | React Redux | ^9.2.0 |
| Persistence | Redux Persist (+ session-encrypt transform) | ^6.0.0 |
| HTTP client | Axios | ^1.9.0 |
| UI component library | Ant Design | ^5.29.3 |
| Secondary UI kit | MUI (Material) | ^7.2.0 |
| CSS | Tailwind CSS | ^4.0.15 |
| Animation | Framer Motion | ^12.18.1 |
| Animation (secondary) | GSAP | ^3.13.0 |
| Icons | Lucide React, React Icons, FontAwesome (CSS only) | ^0.508.0 / ^5.5.0 / ^6.7.2 |
| Charts | Recharts | ^3.8.1 |
| Calendar | FullCalendar (core + daygrid/timegrid/list/interaction/react) | ^6.1.18 |
| PDF generation | @react-pdf/renderer | ^4.3.0 |
| Excel import/export | xlsx, exceljs | ^0.18.5 / ^4.4.0 |
| File download | file-saver | ^2.0.5 |
| Forms | react-hook-form | ^7.54.2 |
| Barcode/label printing | react-zpl-renderer | ^1.6.0 |
| Toasts | react-hot-toast | ^2.5.2 |
| Date picking | react-datepicker | ^8.3.0 |
| Positioning primitives | @floating-ui/react | ^0.27.16 |
| Linting | ESLint (+ react-hooks, react-refresh plugins) | ^9.21.0 |
| PWA | vite-plugin-pwa | ^1.3.0 |

## 3. Folder Structure

```
src/
├── App.jsx              # Root component: Redux Provider, PersistGate, Toaster, theme class switching
├── main.jsx              # Vite entry point, mounts App, sets window.Buffer
├── config.js              # Exports BackendUrl from VITE_BASE_URL
├── index.css              # Global styles / theme CSS variables
├── router/               # React Router v7 route tree (Router.jsx)
├── Redux/
│   ├── Store/             # configureStore + combineReducers + persistReducer wiring (app.jsx)
│   └── Slices/            # One folder/file per feature domain (see Section 6)
├── layout/                # Route-level layout shells (MainLayout, InvoiceLayout, MasterLayout, etc.)
├── components/             # Shared/reusable components (Sidebar, Navbar, ProtectedRoutes, DatePicker, InputFields, ChatBox, ...)
├── pages/                 # Feature pages, one directory per module (see Section 4)
├── utils/                 # Cross-cutting helpers (axios instance, BarcodePrint, SystemUpdater)
└── assets/                # Static images
```

## 4. Modules

### Masters

#### User Master
- **Route path**: `/Masters/UserMaster/UserCreate`, `/Masters/UserMaster/AllUsers`
- **Purpose**: Create system users and browse the full user list.
- **Key files**: `pages/Masters/UserMaster/UserCreate.jsx`, `AllUsers.jsx`, `UserPrivilege.jsx`
- **Redux slice**: `UserMaster` (`Master/UserMaster.jsx/UserCreationSlice.jsx`) — state: `{ loading, users, userMasterData, menuAccessUsers, menuAccessAllMenus, menuAccessUserPermissions }`
- **API endpoints**: `GET /Master/GetAllMasterData`, `POST /CreateUser/createusers`, `GET /CreateUser/getuserdetails`, `POST /CreateUser/update-user-status`, `POST /CreateUser/reset-password`, `POST /Master/DepartmentMaster`, `POST /Master/createDESIGINATIONMaster`, `POST /Master/createDivisionMaster`, `POST /Master/createLocationMaster`, `POST /Master/createRole`, `POST /Master/createMenu`, `GET /MenuAccess/menus`, `GET /MenuAccess/menuaccessusers`, `GET /MenuAccess/{userId}`, `POST /MenuAccess/usermenus`
- **Notable features**: department/designation/division/location/role/menu master creation bundled into the same slice; menu-access permission assignment.

#### Price Master
- **Route path**: `/Masters/PriceMaster`
- **Purpose**: Upload and manage customer price sheets.
- **Key files**: `pages/Masters/PriceMaster/PriceMaster.jsx`, `Header.jsx`, `ManageView.jsx`, `UploadView.jsx`
- **Redux slice**: `priceMaster` (`PriceMasterSlice.jsx`) — pure UI-state slice (dates, category, sheet selection, upload progress); no API thunks — Excel parsing/upload logic lives in the page components.
- **API endpoints**: None dispatched from the slice; `UploadView.jsx`/`ManageView.jsx` perform Excel parsing via `xlsx`.
- **Notable features**: Excel (`.xlsx`) upload and parsing, sheet-based price management.

#### Item ID Master
- **Route path**: `/Masters/ItemIDMaster` (children: `AssemblyProcessIDCreation`, `TyreProcessIDCreation`, `RIMProcessIDCreation`, `CustomerProcessIDCreation`)
- **Purpose**: Generate and manage Process IDs for assembly, tyre, and rim EDC (Engineering Data Code) master records.
- **Key files**: `pages/Masters/Item ID Master/ItemIDMaster.jsx`, `Assembly ProcessID/AssemblyProcessIDCreation.jsx`, `Tyre ProcessID/TyreProcessIDCreation.jsx`, `RIM ProcessID/RIMProcessIDCreation.jsx`, `Header.jsx`
- **Redux slices**: `AssemblyProcessID` (`Master/PI_Master/AssemblyProcessIDSlice.jsx`), `TyreProcessID` (`Master/PI_Master/TyreProcessIDSlice.jsx`), plus `CustomerProcessIDSlice.jsx` (present but not wired into the store in `app.jsx`) — state: `{ mode, loading, search, ProcessIDMaster, generatedProcessID }`
- **API endpoints**: `GET EDC_Master/EDC_MasterList`, `GET /EDC_Master/GetAssyProcessIDByParameter`, `GET /EDC_Master/GetEDCNoByProcessID`, `GET /EDC_Master/GetAssyProcessID`, `POST /EDC_Master/SaveAssyPID`, `GET EDC_Master/FindByProcessID?processId={id}`, `GET /ProcessIDMaster/GetAllProcessIDMaster` (Tyre variant only)
- **Notable features**: Excel-based bulk creation (`xlsx`); `AssemblyProcessIDSlice` and `TyreProcessIDSlice` and `CustomerProcessIDSlice` are near-duplicate implementations (same shape, same endpoints).

#### Customer Master
- **Route path**: `/Masters/CustomerMaster` (children: `customer-home`, `Creation`, `Creation1`, `Creation2`, `ProcessIDMapping`)
- **Purpose**: Manage customer master records, customer users, shipping/billing addresses, and customer-to-process-ID mapping.
- **Key files**: `pages/Masters/Customer Master/CustomerMasterHome.jsx`, `Customermodule.jsx`, `CustomerModule1.jsx`, `CustomerrModule2.jsx`, `CustomerMasterUser.jsx`, `Usercreation.jsx`, `ShipBillAddress.jsx`, `CustomerMenuMaster.jsx`, `CustomerProcessIDMapping/CustomerProcessIDMapping.jsx`
- **Redux slice**: `customerMaster` (`Master/CustomerMaster/CustomerMasterSlice.jsx`) — state: `{ listOfCustomer, listOfUseres, listOfCustomerUsers, listOfShipBillAddress, loading*, error*, masterData: {customerTypes, countries, paymentTerms, gstRates}, loadingMasterData, masterDataError }`
- **API endpoints**: `GET/POST/PUT /CustomerMaster`, `GET /CustomerMaster/user-masters`, `GET /CustomerMaster/customer-user-details`, `POST /CustomerMaster/create-usermaster`, `POST /CustomerMaster/create-custom-user`, `PUT /CustomerMaster/update-user`, `DELETE /CustomerMaster/user-masters/{id}`, `GET/POST/PUT /CustomerMaster/ShipBillAddress-master`, `GET /CustomerMaster/master-data`, `GET /CustomerMaster/CustomerCodeGenerator?CustomerTypeID={id}`
- **Notable features**: Excel-based bulk user creation (`xlsx`); auto customer-code generation.

#### Master Management
- **Route path**: `/Masters/Master-creation` (children: `legal-entity`, `reports-master`)
- **Purpose**: Central hub for legal entity and report-type master configuration.
- **Key files**: `pages/Masters/MasterManagement/MasterCreationHome.jsx`, `LegalEntityMaster.jsx`, `Reportmastermanagement.jsx`, `MasterMenuCreation.jsx`
- **Redux slice**: `reportMaster` (`Master/ReportMasterCreation/ReportMasterCreationSlice.jsx`) — state: `{ reportTypes, reportNames, loading, error, success }`
- **API endpoints**: `GET /BulkReport/master-details`, `GET /BulkReport/report-details`, `POST /BulkReport/ReportName-create`, `PUT /BulkReport/ReportName-update/{typeId}`, `DELETE /BulkReport/ReportName-delete/{typeId}`, `POST /BulkReport/Type-create`, `PUT /BulkReport/Type-update/{reportId}`, `DELETE /BulkReport/Type-delete/{reportId}`, `POST /BulkReport/create-Reports`

### Transactions — Dispatch / TTS

#### PDI (Pre-Dispatch Inspection)
- **Route path**: `TTS/Domestic|International/Dispatch/PDI/Inspection/:plant/:custType` (children: `ScanForInspection`, `InspectionInComplete`, `LoadingCheck`, `BarcodeDelete`, `ApprovalForLoading`, `FinalInspectionReport`, `ApprovalForInspection`)
- **Purpose**: Scan and validate tyre barcodes during pre-dispatch inspection, track incomplete inspections, and approve loading.
- **Key files**: `pages/TTS/Domostic/Dispatch/PDI/PDIMaster.jsx`, `PDIHeader.jsx`, `ScanForInspection/PDIScanForInspection.jsx`, `ScanForInspection/ScanForInspectionDetails.jsx`, `Inspection In Complete/InspecttionInComplete.jsx`, `Loading Check/LoadingCheck.jsx`, `Barcode Delete/BarcodeDelete.jsx`, `Approval For Loading/ApprovalForLoading.jsx`, `Final Inspection Report/FinalInspectionReport.jsx`
- **Redux slices**: `PDIDispatchMaster` (`PDIDispatchMaster/PDIMaster.jsx`, UI-mode only), `scanforinspection` (`PDIDispatchMaster/PDIScanForInspectionSlice.jsx`) — state: `{ listOfInspectionData, search, InspectionDetails, barcodeDetails, loadingBarcode }`
- **API endpoints**: `GET /PdiInspection/GetListOfPdiInspectOrders:{plant}:{custType}`, `POST /PdiInspection/GetCustomer`, `POST /PdiInspection/BarcodeChecker`, `POST /PdiInspection/PDI_SaveItem`, `GET /PdiInspection/GetScannedBarcodeInfo:{PID}:scanned:{plant}`, `GET /PdfUpload/download-workorder`
- **Notable features**: barcode scanning workflow with validation and error handling (per recent commit history); ZPL label handling via `utils/BarcodePrint.js`.

#### PDC / PPC Substitution
- **Route path**: `Dispatch/PPC/Substitution/:plant/:custType`, `Dispatch/PPC/Substitution/Details`
- **Purpose**: Manage tyre substitutions in the dispatch process (swap approved SKUs against original work orders).
- **Key files**: `pages/TTS/Domostic/Dispatch/PDC/PPCMaster.jsx`, `PPCHeader.jsx`, `Substitution/SubstitutionDetails.jsx`, `Substitution/StencilDetailsSlider.jsx`
- **Redux slices**: `PPCMaster` (UI-mode only), `PPCSubstitution` (`PPCSubstitutionMaster/PPCSubstitutionSlice.jsx`) — state: `{ listOfSubstitutionData, search, SubstitutionDetails, custType, selectedData }`
- **API endpoints**: `GET /Substution/GettingSubstitutionReadyOrders` (params `Plant`, `CustType`), `GET /Substution/GettingSpecificSusbstitutionOrders/{id}`, plus a `POST` save endpoint
- **Notable features**: direct `react-zpl-renderer` usage for label printing; Excel export via `xlsx` in `StencilDetailsSlider.jsx`.

#### Tyre and Rim Fitment
- **Route path**: `Dispatch/PDI/RimAndTyreFitment/:plant/:custType` (child `List`), `.../Details`
- **Purpose**: Track and validate wheel-assembly fitment of tyres to rims before dispatch.
- **Key files**: `pages/TTS/Domostic/Dispatch/Tyre And Rim Fitment/FitmentMaster.jsx`, `FitmentList.jsx`, `TyreAndRimFitment.jsx`, `FitmentHeader.jsx`, `FitmentReportModal.jsx`, `FitmentSlider.jsx`
- **Redux slices**: `PDIFitmentMaster` (UI-mode only, `PDIFitmentMaster/PPCMaster.jsx`), `PDIFitment` (`PDIFitmentMaster/PDIFitmentSlice.jsx`) — state: `{ mode, loading, search, listOfFitmentData, listOfStencilWiseData, FitmentDetails, scanSession: {tyre, rim, status} }`
- **API endpoints**: `GET /WheelAssemblies/GetFitmentTyreList:{plant}:{custType}`, `GET /WheelAssemblies/GetSpecificAssemblyTyre/{id}`, `GET /WheelAssemblies/ScanBarcode:{barcode}:{O_ID}:{O_ItemID}:{PID}:{plant}`, `POST /WheelAssemblies/fitment-validation`, `GET /WheelAssemblies/GenerateAssemblyBarcode:...`, `POST /WheelAssemblies/SaveFitmentItem`, `GET /WheelAssemblies/GetRimFitment/{payload}`
- **Notable features**: barcode scan session tracking (tyre + rim pairing); Excel export via `exceljs`.

### Transactions — Invoicing

#### Domestic Invoice
- **Route path**: `TTS/Domestic/Invoice/Customer`, `Invoice/Custom`
- **Purpose**: Prepare and generate domestic customer/custom invoices.
- **Key files**: `pages/TTS/Domostic/Invoice/CustomerInvoice.jsx`, `CustomInvoice.jsx`
- **Redux slice**: `invoice` (`InvoiceSlice.jsx`, `domesticInvoices` branch) — state: `{ listOfInvoices, loading, error }`
- **API endpoints**: `GET /Invoice/GettingSpecificCustOrders/{id}`, `GET /Invoice/GettingCustInvoiceReadyOrders`

#### Export Invoice (International)
- **Route path**: `TTS/International/Invoice/CustomerInvoice`, `Invoice/CustomInvoice`, plus `.../Prepare`, `.../BillPDF`, `ShippingSchemeSplit`, `Sample`
- **Purpose**: Build export invoices (customer & custom), split shipments/samples, and render PDF invoices for international customers, including Sri Lanka-specific formats.
- **Key files**: `pages/TTS/International/Invoice/Export Invoice/ExportInvoicePage.jsx`, `ExportPrepare.jsx`, `ExportTable.jsx`, `InvoiceExportPDF.jsx`, `PDFViewer.jsx`, `AdditionalDetailsForm.jsx`, `ShippingSchemeSplitTailwind.jsx`, `SampleSplit.jsx`, `Customer Invoice/CustomerPDFViewer.jsx`, `Customer Invoice/InvoiceCustomerPDF.jsx`, `SRILANKA_INVOICE/LankaCustomPDF.jsx`
- **Redux slice**: `invoice` (`InvoiceSlice.jsx`, `exportInvoices` branch — largest slice in the codebase) — state includes `listOFInvoices, invoiceDetails, additionalForm, invoicePDF, FinalSplitResult, splitItems, pdfBlob, isPallateChecked, invoiceCustDetails, finalCustomerData`
- **API endpoints**: `GET /Invoice/GettingSpecificOrders/{id}`, `GET /Invoice/GettingInvoiceReadyOrders`, `POST /Invoice/CreatingInvoices`, `POST /PdfUpload/Invoice/upload` (custom + customer variants)
- **Notable features**: PDF generation via `@react-pdf/renderer` (11 files across this module); shipment/sample splitting logic.

#### Proforma Invoice
- **Route path**: `TTS/International/ProformaInvoice/List` (child `:invoiceType`), `.../Prepare`, `Invoice/ProformaInvoice/PDF`, `Invoice/ProformaInvoice/Draft/Prepare`
- **Purpose**: Draft and finalize proforma invoices ahead of export invoicing.
- **Key files**: `pages/TTS/International/Invoice/Export Invoice/Proforma Invoice/PIMaster.jsx`, `ProformaList.jsx`, `ProformaPrepare.jsx`, `ProformaPDF.jsx`, `ProformaPDFViewer.jsx`
- **Redux slices**: `PIMaster` (UI-mode only, `ProformaInvoice/PIMasterSlice.jsx`), `proformaInvoice` (`ProformaInvoice/ProformaInvoiceSlice.jsx`) — state: `{ listOfProformaInvoice, listOfDraftProforma, loading, proformaDetails, additionalForm, finalData, master, showPartNumber }`
- **API endpoints**: `GET /DraftPI/GettingDraftPIReadyOrders`, `GET /DraftPI/GettingPIReadyOrders`, `GET /DraftPI/GettingDraftPIReadySpecificOrders`, `POST /DraftPI/create_PI`, `POST /DraftPI/create_DraftPI`, `GET /DraftPI/GettingDraftPIMaster`
- **Notable features**: PDF rendering via `@react-pdf/renderer`.

#### Order Process
- **Route path**: `TTS/International/OrderProcess/OrderEntry`, `OrderProcess/OrderFulfillment`
- **Purpose**: Enter sales orders and assign plant/manufacturing planning for order fulfillment.
- **Key files**: `pages/TTS/International/OrderProcess/OrderEntry/SaleOrderEntry.jsx`, `PlantAssign/PlantAssign.jsx`, `Manufacturingplanningrevision/Manufacturingplanningrevision.jsx`, `PDFErrorBoundary.jsx`
- **Redux slice**: `orderProcess` (`OrderProcess/OrderProcessSlice.jsx`) — state: `{ listOfCustomer, loading, error, entityMaster, customerItems, listOfItems }`
- **API endpoints**: `GET /OrderProcess/customer-master`, `GET /OrderProcess/customer-LineItems/{payload}`, `POST /OrderProcess/save?TypeID={typeID}`
- **Notable features**: Excel import (`xlsx`) and PDF rendering (`@react-pdf/renderer`) in `SaleOrderEntry.jsx`.

### Transactions — Warehouse / Rim

#### Rim / Warehouse Stock Transfer
- **Route path**: `TTS/Warehouse/*` (`PendingTransfer`, `factory`, `warehouse`, `DCPreparationApproval`, `EDCNoWise`, `rimstock`)
- **Purpose**: Track rim/tyre stock transfers between factory and warehouse locations, approve delivery challans (DC), and view stock by EDC number.
- **Key files**: `pages/TTS/Rim/PendingTransferPage.jsx`, `TyreStockTransfer.jsx`, `TyreStockReceiveRedesign.jsx`, `DCPreparationApproval.jsx`, `RimAndEDCWiseData.jsx`, `RimStocks.jsx`, `RIMNavLink.jsx`
- **Redux slices**: `warehouse` (`Warehouse/WarehouseSlice.jsx`), `rimApplication` (`RimApplicationSlice.jsx`)
- **API endpoints**: `GET /FactoryWarehouse/GetFactoryWarehouseDetails`, `GET /FactoryWarehouse/GetFactoryRefNo`, `POST /FactoryWarehouse/GetProductionData`, `POST /FactoryWarehouse/v1/InsertTransaction`, `GET /FactoryWarehouse/Warehouse/Get-SpecAllTransList/{id}/{statusNo}`, `POST /FactoryWarehouse/UpdateLoadDone`, `GET /FactoryWarehouse/Warehouse/Get-TransactionDetails`, `POST /FactoryWarehouse/dca-approval/{id}`, `POST /FactoryWarehouse/Warehouse/UpdateBinLocation`, `GET /FactoryWarehouse/GetPhysicalLocations`, `POST /FactoryWarehouse/Warehouse/finish/{id}`
- **Notable features**: search-enabled transfer lists (per recent commits); Excel export (`exceljs`) in `DCPreparationApproval.jsx`.
- **TODO: confirm** — `RimApplicationSlice.jsx` calls a hardcoded `https://localhost:7174/api/RimStock/RimSize` endpoint directly with raw `axios` rather than the shared `api` instance; verify whether this is stale dev configuration.

#### Customer Product Mapping (Barcode Printing)
- **Route path**: `customer-item-management` (child `barcode-print`)
- **Purpose**: Generate and print tyre barcode labels mapped to customer/work-order data.
- **Key files**: `pages/Customer Product Mapping/CPMMaster.jsx`, `CPMHeader.jsx`, `BarcodePrint/BarcodePrint.jsx`
- **Redux slices**: `CIMMaster` (UI-mode only), `CIMBarcode` (`Customer_Item_Management/BarcodeSlice.jsx/BarcodeSlice.jsx`) — state: `{ mode, loading, search, custWorkOrder, itemsByWorkOrder }`
- **API endpoints**: `GET /CustomBarcode/GetMetcoBarcodeLable?barcode={barcode}`, `GET /CustomBarcode/GetWorkOrderDetails?Plant={plant}`, `GET /CustomBarcode/GetItemDetails?O_ID={O_ID}`
- **Notable features**: ZPL label rendering/printing via `utils/BarcodePrint.js` and `react-zpl-renderer`.

### Reports

#### CRM Reports
- **Route path**: `Reports/TTSReports/Sale/DomesticsReport`
- **Purpose**: Analytics dashboards covering sales trends, product/category/region/customer breakdowns, dispatch and freight analytics.
- **Key files**: `pages/Reports/CRMReports/CRMReports.jsx`, `components/` (10 chart components: `MonthlyTyreSizeChart.jsx`, `TyreTypeAnalytics.jsx`, `CRMPerformanceChart.jsx`, `DispatchAnalytics.jsx`, `FreightAnalytics.jsx`, `SalesTrendChart.jsx`, `RegionAnalytics.jsx`, `ProductAnalytics.jsx`, `CustomerAnalytics.jsx`, `CategoryAnalytics.jsx`), `filters/`, `hooks/useCRMDataset.js`, `utils/`
- **API endpoints**: Fetched via `useCRMDataset.js`, which points at `http://localhost:4000` / `VITE_BACKEND_URL` — a separate backend URL from the shared `VITE_BASE_URL` config.
- **Notable features**: charting via Recharts across all 10 sub-components.
- **TODO: confirm** — `useCRMDataset.js` hardcodes `'http://localhost:4000'` ahead of the env var in a `||` chain, so the env var is currently dead code; verify intended backend for this module.

#### SP (Special/Bulk) Reports
- **Route path**: `Reports/TTSReports/Sale/MasterReportGeneration`
- **Purpose**: Generate bulk/master reports based on report-type configuration.
- **Key files**: `pages/Reports/SP_Reports/MasterReportGenerationPage.jsx`
- **Notable features**: Excel export via `xlsx`.

#### Sale Reports
- **Route path**: `Reports/TTSReports/Sale/SaleRepost`, index redirect via `SaleReportRedirect.jsx`
- **Purpose**: Sales dashboards and reporting.
- **Key files**: `pages/Reports/SaleReports/SaleReports.jsx`, `SaleRepostMaster.jsx`, `SaleReportRedirect.jsx`, `SaleReportHeader.jsx`
- **Notable features**: Recharts-based visualizations.

#### Production Reports
- **Route path**: `Reports/TTSReports/Sale/ProductionRepost`
- **Purpose**: Production output dashboards.
- **Key files**: `pages/Reports/ProductionReports/Production.jsx`
- **Notable features**: Recharts-based visualizations.

#### Power BI Reports
- **Route path**: `Reports/TTSReports/Production`, `Reports/TTSReports/Sale/PowerBIReport`
- **Purpose**: Embedded Power BI report views.
- **Key files**: `pages/Reports/TTSPowerBIReports.jsx`

### Admin

#### Menu Access
- **Route path**: `UserMaster/menuaccess`
- **Purpose**: Assign menu-level access permissions per user/role.
- **Key files**: `pages/MenuAccess/MenuAccessManager1.JSX` (active; `MenuAccessManager.jsx` exists but its route is commented out in `router/Router.jsx`)
- **Redux slice**: Uses `UserMaster` slice's `menuAccessUsers`/`menuAccessAllMenus`/`menuAccessUserPermissions` state (see User Master above).
- **API endpoints**: `GET /MenuAccess/menus`, `GET /MenuAccess/menuaccessusers`, `GET /MenuAccess/{userId}`, `POST /MenuAccess/usermenus`

#### User Master (Admin variant)
- **Route path**: `UserMaster` (index → `user-list`), `user-creation`, `UserMasterManagement`
- **Purpose**: A second, separate user-list/creation/management surface distinct from `Masters/UserMaster` (duplicate module naming in the codebase).
- **Key files**: `pages/MenuAccess/UserMaster/UserList.jsx`, `UserCreation.jsx`, `UserMasterManagement.jsx`
- **TODO: confirm** — the relationship/overlap between this module and `Masters/UserMaster` (`UserCreate.jsx`/`AllUsers.jsx`) was not established from the code; they appear to be parallel, possibly redundant implementations.

#### Settings / User Profile
- **Route path**: `Settings` (index → `profile`), `Settings/profile`
- **Purpose**: User's own profile settings.
- **Key files**: `pages/Settings/UserProfile/UserProfile.jsx`

#### Task Management
- **Route path**: **Not currently mounted** — the entire `Task-Management` route block is commented out in `router/Router.jsx` (lines ~502–516).
- **Purpose** (per code, unmounted): project/sprint/task tracking with daily logs, team view, and reports.
- **Key files**: `pages/Task Managment/Home/TaskHomePage.jsx`, `Dashboard/TaskDashboard.jsx`, `Projects/Projects.jsx`, `Sprints/Sprints.jsx`, `Tasks/Tasks.jsx`, `DailyLog/DailyLog.jsx`, `Team/Team.jsx`, `Reports/Reports.jsx`, `Masters/Masters.jsx`
- **Redux slices**: `Project` (`Task_Master/Projects/ProjectSlice.jsx`), `Sprint` (`Task_Master/Sprint/SprintSlice.jsx`), plus `Task_Master/TaskSlice/TaskSlice.jsx` (not wired into the store)
- **API endpoints**: `POST /Project/create`, `POST /Project/module/create`, `GET /Project/all`, `GET /Project/{id}/modules`, `POST /Task/create`, `GET /api/Task/all` (inconsistent `/api` prefix vs. rest of codebase)
- **TODO: confirm** — whether this module is planned for re-enabling or is deprecated; it is fully built but not reachable via the router.

## 5. Packages Used & Why

| Package | Version | Category | Why it was chosen | Where it's used |
|---|---|---|---|---|
| react / react-dom | ^19.0.0 | Core framework | Base SPA framework for the entire application. | Entire `src/` tree |
| react-router-dom | ^7.3.0 | Routing | Nested, data-router route trees needed for deeply nested module hierarchies (e.g. PDI inspection sub-routes, Customer Master sub-modules). | `src/router/Router.jsx`, 64 files |
| @reduxjs/toolkit | ^2.8.0 | State management | `createAsyncThunk`/`createSlice` pattern used consistently across ~25 domain slices to manage server-derived state with loading/error tracking. | `src/Redux/Slices/*`, `src/Redux/Store/app.jsx` |
| react-redux | ^9.2.0 | State bindings | Connects Redux store to components via hooks (`useSelector`/`useDispatch`). | 84 files |
| redux-persist | ^6.0.0 | Persistence | Keeps user session, in-progress forms (invoices, PDI scans, order drafts) alive across reloads/tab closures — critical for shop-floor scanning workflows where a refresh shouldn't lose scan state. | `src/Redux/Store/app.jsx` |
| redux-persist-transform-encrypt | ^5.1.1 | Persistence security | Encrypts persisted Redux state (auth tokens, user data) at rest in browser storage rather than storing it in plaintext. | `src/Redux/Store/app.jsx` |
| axios | ^1.9.0 | HTTP client | Central `api` instance with response interceptors for session-expiry (401), permission (403), and validation (400) handling — needed for a portal with role-based menu access. | `src/utils/axios.jsx`, all slice thunk files |
| antd | ^5.29.3 | UI component library | Primary component library — provides the Table, Form, Select, DatePicker, Modal, Upload etc. used across nearly every data-entry and data-grid screen (65 files), avoiding building enterprise form/table controls from scratch. | 65 files across `pages/` |
| @ant-design/v5-patch-for-react-19 | ^1.0.3 | Compatibility shim | Antd v5 predates official React 19 support; this patch resolves compatibility issues between the two. | Imported once at app root context (29 files reference antd-adjacent code) |
| @mui/material | ^7.2.0 | Secondary UI kit | Used narrowly for specific components not covered by Antd. | `components/InputFields/DropDownMenu.jsx`, `pages/Calendar/Calendar.jsx` |
| tailwindcss / @tailwindcss/postcss | ^4.0.15 | CSS | Utility-first styling layered on top of Antd/MUI for custom layout, spacing, and theme classes (`theme-dark`, `theme-green`, etc.). | `src/index.css`, widespread `className` usage |
| framer-motion | ^12.18.1 | Animation | Page/element transition and micro-interaction animations — the most heavily used non-UI-kit dependency (80 files), indicating animation is a first-class UX concern in this portal. | 80 files |
| gsap | ^3.13.0 | Animation | Used for more complex/timeline-based animations beyond Framer Motion's declarative model. | 9 files |
| lucide-react | ^0.508.0 | Icons | Primary icon set for custom UI elements. | 57 files |
| react-icons | ^5.5.0 | Icons | Supplementary icon set (likely for icons not available in Lucide). | 40 files |
| @fortawesome/* | ^6.7.2 | Icons | FontAwesome CSS icon font, imported globally. | `src/App.jsx` (`fontawesome-free/css/all.min.css`) |
| react-hot-toast | ^2.5.2 | Notifications | Toast notifications for API responses (success/error), wired directly into the Axios interceptor for session/permission/validation errors. | 43 files, `src/utils/axios.jsx` |
| recharts | ^3.8.1 | Charts | Chart library for all analytics dashboards — CRM reports (10 chart components), Sale Reports, Production Reports, main Dashboard. | 13 files |
| @fullcalendar/* | ^6.1.18 | Calendar | Full calendar UI (day/time grid, list, interaction views) for the Calendar module. | `pages/Calendar/Calendar.jsx` |
| @react-pdf/renderer | ^4.3.0 | PDF generation | Generates export/customer/proforma invoice PDFs directly in-browser (11 files) — needed because invoices must be previewed and downloaded as formatted documents. | 11 files under `pages/TTS/International/` |
| xlsx | ^0.18.5 | Excel import/export | Bulk data import (price sheets, process ID creation, customer users) and export from tabular master data. | 10 files (Price Master, Item ID Master, Customer Master, Order Entry, SP Reports) |
| exceljs | ^4.4.0 | Excel export | Used specifically where more advanced Excel formatting/styling is needed than `xlsx` provides (e.g. styled export reports). | `TyreAndRimFitment.jsx`, `DCPreparationApproval.jsx`, `BarcodeDetailList.jsx` |
| file-saver | ^2.0.5 | File download | Triggers browser file-save dialogs for generated Excel/PDF exports. | 4 files |
| react-hook-form | ^7.54.2 | Forms | Form state/validation management for structured data-entry forms. | 4 files |
| react-zpl-renderer | ^1.6.0 | Barcode/label printing | Renders ZPL (Zebra Programming Language) barcode labels for tyre/product barcode printing on physical label printers — a hardware-integration requirement specific to the dispatch/warehouse workflow. | `PPCSubstitutionSlice.jsx`, `utils/BarcodePrint.js`, `BarcodePrint.jsx` |
| react-datepicker | ^8.3.0 | Date input | Supplementary date picker component outside of Antd's own DatePicker. | 1 file |
| @floating-ui/react | ^0.27.16 | Positioning | Handles tooltip/popover/dropdown positioning logic. | 1 file |
| buffer | ^6.0.3 | Polyfill | Provides a `Buffer` polyfill in the browser (`window.Buffer = Buffer` in `main.jsx`), likely required by a dependency expecting Node's Buffer API. | `src/main.jsx`, 5 files |
| vite-plugin-pwa | ^1.3.0 | PWA / build tooling | Adds PWA manifest/service-worker generation at build time. | `vite.config.js` |
| postcss | ^8.5.3 | Build tooling | Required by `@tailwindcss/postcss` for Tailwind's CSS processing pipeline. | Build config only |

### Unused / Candidate for Removal

No imports of these packages were found anywhere under `src/` (verified via recursive grep for the package name/import path):

| Package | Version | Category | Notes |
|---|---|---|---|
| jspdf | ^4.2.1 | PDF generation | No `jspdf` imports found; PDF generation is done via `@react-pdf/renderer` instead. |
| apexcharts / react-apexcharts | ^5.10.6 / ^2.1.0 | Charts | No imports found; charting is done via `recharts`. |
| chart.js / react-chartjs-2 | ^4.5.1 / ^5.3.1 | Charts | No imports found; charting is done via `recharts`. |
| @tanstack/react-table | ^8.21.3 | Tables | No imports found; tables are built with Antd's `Table` component. |
| @headlessui/react | ^2.2.4 | UI primitives | No imports found. |
| @radix-ui/react-select | ^2.2.5 | UI primitives | No imports found. |
| html2canvas | ^1.4.1 | Rendering | No imports found. |
| @emotion/react / @emotion/styled | ^11.14.0 / ^11.14.1 | CSS-in-JS | No imports found (likely a transitive MUI peer dependency declared directly rather than actually imported in app code). |
| xlsx-js-style | ^1.2.0 | Excel styling | No imports found; `xlsx` and `exceljs` are used instead. |

## 6. State Management

### Store structure

`src/Redux/Store/app.jsx` combines 24 reducers via `combineReducers`, most individually wrapped in `persistReducer` with per-slice persistence config (`localStorage` for auth/global/user-master/price-master-adjacent data, `sessionStorage` for most transactional/workflow slices). The root store uses `configureStore` with `thunk: true`, `immutableCheck: { warnAfter: 128 }`, and `serializableCheck: false`.

| Slice key | Owns |
|---|---|
| `global` | Sidebar open state, theme, dark mode, chat panel open state |
| `invoice` | Domestic + export invoice workflow state |
| `proformaInvoice` | Proforma invoice draft/final data |
| `auth` | Logged-in user, roles, menus, department/location, login state |
| `UserMaster` | User CRUD, department/designation/division/location/role/menu masters, menu-access permissions |
| `rimApplication` | Rim size lookup (not persisted) |
| `priceMaster` | Price sheet upload/manage UI state |
| `scanforinspection` | PDI barcode scan session and inspection details |
| `PDIDispatchMaster` | PDI UI mode/search state |
| `PPCMaster` | PDC/PPC UI mode/search state |
| `PPCSubstitution` | Substitution order list and details |
| `AssemblyProcessID` | Assembly process ID master/generation |
| `TyreProcessID` | Tyre process ID master/generation |
| `PDIFitmentMaster` | Fitment UI mode/search state |
| `PDIFitment` | Fitment list, details, scan session (tyre/rim) |
| `PIMaster` | Proforma invoice UI mode/search state |
| `Project` | Task management: projects, project master data |
| `CIMMaster` | Customer Item Management UI mode/search state |
| `CIMBarcode` | Barcode lookup, work order/items for barcode printing |
| `Sprint` | Task management: sprints, project master data |
| `warehouse` | Factory/warehouse transfer transactions, bin locations |
| `orderProcess` | Sales order customer/entity/item master and draft state |
| `reportMaster` | Report type/name master CRUD |
| `customerMaster` | Customer records, customer users, ship/bill addresses, master data (types/countries/payment terms/GST) |

**Not wired into the store** (slice files exist but are absent from `app.jsx`'s `combineReducers`): `CustomerProcessIDSlice.jsx`, `Task_Master/TaskSlice/TaskSlice.jsx`.

### Async thunk pattern

All data-fetching slices follow the same `createAsyncThunk` + three-case `extraReducers` (pending/fulfilled/rejected) pattern, using the shared `api` Axios instance from `src/utils/axios.jsx`. Example, from `AuthSlice.jsx`:

```js
export const userLogin = createAsyncThunk(
  "auth/userLogin",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/Auth/logins", credentials, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);
```

Loading/error state is tracked per slice (`loading`, `error` fields) and reset in the corresponding `extraReducers` `pending`/`rejected` cases. Several "UI-mode" slices (e.g. `PDIDispatchMaster/PDIMaster.jsx`, `PPCSubstitutionMaster/PPCMaster.jsx`, `PDIFitmentMaster/PPCMaster.jsx`, `ProformaInvoice/PIMasterSlice.jsx`, `Customer_Item_Management/CIMMasterSlice.jsx`) contain no thunks at all — they hold only local UI state (`mode`, `search`, `loading`) set via plain reducers.

## 7. Shared Components & Patterns

- **`components/ProtectedRoutes/ProtectedRoutes.jsx`** — route guard wrapping the entire authenticated route tree in `router/Router.jsx`; redirects unauthenticated users.
- **`layout/`** — route-level layout shells (`MainLayout`, `InvoiceLayout`, `MastarLayout`, `ReportsLayout`, `RimLayout`, `SettingsLayout`, `TaskLayout`, `UserMasterLayout`, `MasterCreationLayout`) composing `Sidebar`/`Navbar` with an `<Outlet />` for nested routes.
- **`components/Sidebar/` (`SideBar.jsx`, `InnerSideBar.jsx`)** and **`components/Navbar.jsx`** — primary app chrome, present across all authenticated layouts.
- **`components/DynamicDataTable.jsx`** — reusable data table wrapper (built on Antd `Table`), used across master/report modules to avoid re-implementing sorting/filtering/pagination per page.
- **`components/DatePicker/`** — shared date-picker wrapper standardizing date input across forms.
- **`components/InputFields/`** — shared form input components (including `DropDownMenu.jsx`, which uses MUI).
- **`components/DarkModeToggle/`** and **`ThemeSwitcher`** (`src/components/ThemeSwitcher`) — theme switching; `App.jsx` applies a `theme-{name}` class to `<html>` driven by `global.theme` in Redux, supporting `dark`, `green`, `orange`, `purple`, `red`, `pink`, `navi-blue` themes.
- **`utils/axios.jsx`** — single shared Axios instance + `useAxiosInterceptors` hook centralizing session/permission/validation/error handling and toast notifications, avoiding per-module error-handling duplication.
- **`utils/BarcodePrint.js`** — shared ZPL barcode/label generation and printing helper, reused by the PDC Substitution and Customer Product Mapping barcode-printing flows.
- **Animation convention**: Framer Motion is the default animation library (page transitions, list item enter/exit), with GSAP reserved for more complex timeline-based cases (9 files) — no evidence of the two being mixed within the same component.
- **Excel convention**: `xlsx` is used for straightforward import/parse/export; `exceljs` is reserved for exports requiring cell-level styling.
- **PDF convention**: All invoice/PDF generation goes through `@react-pdf/renderer` — `jspdf` is present in `package.json` but unused (see Section 5).

## 8. Setup & Run

### Install

```
npm install
```

### Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `VITE_BASE_URL` | Base URL for the backend REST API, consumed by `src/utils/axios.jsx` via `src/config.js`. |
| `VITE_REDUX_SECRET_KEY` | Secret key used by `redux-persist-transform-encrypt` to encrypt persisted Redux state. |
| `VITE_MODE` | Application mode flag (`dev`/`production`) referenced in `.env`; **TODO: confirm** — not observed being read via `import.meta.env.VITE_MODE` in the files inspected. |
| `VITE_BACKEND_URL` | Optional override for the CRM Reports dataset hook (`pages/Reports/CRMReports/hooks/useCRMDataset.js`); currently shadowed by a hardcoded `http://localhost:4000` fallback ahead of it — see Section 4, CRM Reports. |

Do not commit real credential values; use a local `.env` (already present in the repo working tree, untracked values should be verified before sharing).

### npm scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Start the Vite development server. |
| `build` | `vite build` | Production build. |
| `lint` | `eslint .` | Run ESLint across the project. |
| `preview` | `vite preview` | Preview the production build locally. |
| `tw:init` | `tailwindcss init -p` | (Re-)initialize Tailwind CSS config — not needed for normal development since config already exists. |
