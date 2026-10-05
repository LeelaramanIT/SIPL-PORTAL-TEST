# Invoice Module Technical Documentation

**Scope analyzed:** `src/pages/TTS/International/Invoice/Export Invoice/**` (the path supplied by the requester), plus every file this code actually depends on: `src/Redux/Slices/InvoiceSlice.jsx`, `src/Redux/Slices/ProformaInvoice/*.jsx`, `src/Redux/Store/app.jsx`, `src/utils/axios.jsx`, `src/utils/menuAccess.js`, `src/components/ProtectedRoutes/*`, `src/router/Router.jsx`, `src/components/Sidebar/SideBar.jsx`.

**Method:** Three independent code-reading passes (Customer/Custom Invoice files, Proforma Invoice files, Redux/API/permissions/backend) were performed against the actual source, file by file, with line-level citations. This document reports only what was found in code. Anything not directly observed is explicitly marked **Not found / Cannot be verified from available source code**.

**Analysis date:** 2026-08-18. Line numbers refer to the file state at that time and will drift as the code changes.

---

## 1. Executive Summary

The brief assumed four independent invoice workflows — Customer, Custom, Proforma, Draft. The code does not implement four independent workflows:

- **Customer Invoice** and **Custom Invoice** are two *separate, largely copy-pasted* implementations (different Prepare pages, different Redux state slots, different API endpoints, different PDF templates) that happen to share one list page (`ExportInvoicePage.jsx`) and one Redux slice (`InvoiceSlice.jsx`). They are not built on a shared abstraction — they are parallel code paths that evolved independently and have drifted (see §20/§31).
- **"Draft Invoice"** is **not a fourth invoice type**. It is a mode of the **Proforma Invoice** workflow, selected by a `"Draft"` vs `"PI"` string carried through the route param / router `state`, sharing 100% of its components (`ProformaList.jsx`, `ProformaPrepare.jsx`, `AdditionalDetailsForm.jsx`, `ProformaPDF.jsx`) with normal Proforma Invoice. Only the list-fetch and final-submit *endpoints* differ (`.../GettingDraftPIReadyOrders` vs `.../GettingPIReadyOrders`, `create_DraftPI` vs `create_PI`).
- There is **no conversion logic** anywhere in the codebase: Draft Proforma does not get "promoted" to a final Proforma, and Proforma Invoice does not convert into a Customer/Custom Invoice. Each is an independent create call.
- A separate, unrelated **"Domestic" Invoice module** exists at `src/pages/TTS/Domostic/Invoice/` (`CustomerInvoice.jsx`, `CustomInvoice.jsx`) — routed in `Router.jsx` but built with placeholder/dummy data, no Redux, no real API calls, and not reachable from the sidebar menu tree found. It is out of scope of the requested path and is documented only for context in §26.
- The repository is **frontend-only**. No backend source (controllers, services, SQL, stored procedures) exists anywhere in this repo — confirmed by exhaustive search (§17, §18). All backend/database sections of this document are therefore marked not verifiable, with the frontend-observable API contract documented instead.
- The **Customer Invoice submit flow is non-functional**: the `submitCustomerInvoice` thunk has a variable-hoisting bug that throws on every call, and its real API POST call is commented out (`InvoiceSlice.jsx` ~L1372, L1541-1555). Custom Invoice submission, by contrast, is fully wired end-to-end. This is the single most consequential functional finding in the module.

---

## 2. Invoice Module Overview

**Stack observed:** React + `react-router-dom` (route-driven pages), Redux Toolkit `createSlice` for state (but **no `createAsyncThunk`** anywhere — all async logic is hand-written thunk functions), `react-hook-form` for the "Additional Details" modals, `@react-pdf/renderer` for all PDF generation/preview (confirmed library; no jsPDF/html2pdf/react-to-print/html2canvas found anywhere in `src/`), `axios` via a single shared instance (`src/utils/axios.jsx`), `react-hot-toast` for notifications, Tailwind CSS for styling, Framer Motion / GSAP for animation.

**Persistence:** Redux state for `invoice` and `proformaInvoice` slices is persisted to `sessionStorage` (not `localStorage`) via `redux-persist`, encrypted with `redux-persist-transform-encrypt` (`src/Redux/Store/app.jsx` L66-78, L206-207, L236-237).

**Three real workflows under the analyzed path:**

| Workflow | Root files | Redux slice | Backend area |
|---|---|---|---|
| Customer Invoice | `Export Invoice/Customer Invoice/*` | `InvoiceSlice.jsx` → `state.invoice.exportInvoices.invoiceCustDetails` | `/Invoice/...Cust...` endpoints |
| Custom Invoice | `Export Invoice/*.jsx` (root) + `Export Invoice/SRILANKA_INVOICE/*` | `InvoiceSlice.jsx` → `state.invoice.exportInvoices.invoiceDetails` | `/Invoice/...` endpoints |
| Proforma Invoice (incl. Draft mode) | `Export Invoice/Proforma Invoice/*` | `ProformaInvoiceSlice.jsx` + `PIMasterSlice.jsx` → `state.proformaInvoice` | `/DraftPI/...` endpoints |

---

## 3. Invoice Types

### 3.1 Customer Invoice

- **Entry point / route:** `/TTS/International/Invoice/CustomerInvoice` → `ExportInvoicePage.jsx` (list, shared with Custom). `/TTS/International/Invoice/CustomerInvoice/Prepare` → `Customer Invoice/ExportCustPrepare.jsx` (`ExportCustInvoicePrepare`). PDF preview: `/TTS/International/Invoice/Customer/BillPDF` → `Customer Invoice/CustomerPDFViewer.jsx` (`InvoicePDF`).
- **How the list page knows it's "Customer" mode:** `react-router` navigation **state**, not a query/path param — `location.state.type === "Customer"` (`ExportInvoicePage.jsx` L24, L146-149). No fallback if `state` is missing (see §31 bug).
- **Redux slot:** `state.invoice.exportInvoices.invoiceCustDetails` (single flat object — **no scheme-splitting**, unlike Custom Invoice).
- **API calls:**
  - List: `GET /Invoice/GettingCustInvoiceReadyOrders` (`getExportInvoiceAll({type:"Customer"})`, `InvoiceSlice.jsx` L771-797).
  - Detail: `GET /Invoice/GettingSpecificCustOrders/{id}` (`getExportInvoice`, L740-768).
  - Submit: `submitCustomerInvoice` thunk builds a full payload but **the actual `POST /Invoice/CreatingCustomerInvoice` call is commented out** (L1541-1555) and the function throws before reaching it due to a use-before-declare bug on `data` (L1372 vs L1393). **Submission does not work.**
  - PDF upload: `uploadCustomerInvoicePDF` → `POST /PdfUpload/Invoice/upload?...InvoiceType=customer...` — defined but never dispatched from any reachable code path (only referenced inside the disabled portion of `submitCustomerInvoice`).
- **Validation:** No yup/zod. `AdditionalCustDetailsForm` (`Customer Invoice/AdditionalDetailsForm.jsx`) uses react-hook-form inline rules plus custom `validate` functions for packing quantities and a DB-max cap on charges when `isPrepared` is true (see §9, §13).
- **Business rules/calculations:** `totalQTY`, `grandTotal = Σ(basicprice+rimUnitPrice)*itemQty`, `totalFWT = Σ(finishedWt+rimfinishedwt)*itemQty` (`ExportCustPrepare.jsx` L107-134); no scheme split — the whole order is one invoice.
- **Customer/product/address:** Customer info, billing/shipping addresses come from the order record returned by `GettingSpecificCustOrders`; items come from `invoiceCustDetails.items` directly (read-only in Prepare — no split/edit UI for items).
- **Currency/tax:** `usercurrency` field drives `getCurrency()`/`getCurrencySymble()` display; GST/tax is **not computed** in this flow (no GST fields found in the Customer Export flow — contrast with Proforma, §3.3, which does have GST calculation).
- **Invoice numbering:** `invoiceNumber` sourced from the "Additional Details" form (editable unless `isPrepared`, in which case read-only) — **not auto-generated client-side**; presumed backend-generated once "prepared" (not verifiable — backend not in repo).
- **Save/Update logic:** "Additional Details" form writes to Redux only (`setExportCustAdditionalInvoice` → `setFinalCustomerData`); nothing is persisted to the backend until Submit, which (per above) is broken.
- **Delete/cancel:** **Not found / Cannot be verified from available source code** — no delete/cancel UI or thunk found for Customer Invoice.
- **Approval logic:** **Not found** — no approval step/UI found in the Customer flow itself; the closest concept is `isPrepared` (`AdditionalDetailsForm.jsx` L57-59: `Array.isArray(invoiceDetails?.otherChargesDetails) && length>0`), which switches fields to read-only, presumably because the invoice already exists server-side.
- **PDF:** Always two pages — `InvoiceCustomerPDF.jsx` (invoice, price-based) + `InvoiceCustomerPacking.jsx` (packing list, weight-based) — rendered together inside `CustomerPDFViewer.jsx`'s `<PDFViewer>`, always both regardless of `containerLoadFrom` (no Sri Lanka branching on the Customer side).
- **Status handling:** `invoiceDetails?.status === "PREPARED"` literal string is checked in the *Proforma* Additional Details form; for Customer Invoice the closest thing is the `isPrepared` derivation described above (not the literal string `"status"` field, but the presence of `otherChargesDetails`).
- **Permissions:** Gated only at the list-page toggle: `menuMap.Customer = "ExportCustomerInvoice"`, checked against `state.auth.Menus` (`ExportInvoicePage.jsx` L109-139). No further permission checks anywhere downstream (Prepare, Additional Details, PDF).

### 3.2 Custom Invoice

- **Entry point / route:** `/TTS/International/Invoice/CustomInvoice` → `ExportInvoicePage.jsx` (same shared list component, `state.type === "Custom"`). `/TTS/International/Invoice/CustomInvoice/Prepare` → `ExportPrepare.jsx` (`ExportInvoicePrepare`). PDF preview: `/TTS/International/Invoice/Export/BillPDF` → `PDFViewer.jsx` (`ExportInvoiceBillPDF`).
- **Redux slot:** `state.invoice.exportInvoices.invoiceDetails` — separate from Customer's `invoiceCustDetails`.
- **API calls:**
  - List: `GET /Invoice/GettingInvoiceReadyOrders`.
  - Detail: `GET /Invoice/GettingSpecificOrders/{id}`.
  - Submit: `POST /Invoice/CreatingInvoices` (`submitInvoice`, `InvoiceSlice.jsx` L804-1115) — **fully wired**: on success, dispatches `uploadCustomInvoicePDF()` then navigates back to the list with `toast.success`.
  - PDF upload: `POST /PdfUpload/Invoice/upload?...InvoiceType=custom...` (`uploadCustomInvoicePDF`, L1117-1176) — dispatched automatically after a successful submit.
- **Unique feature — Scheme Splitting:** Custom Invoice supports splitting a single order into multiple sub-invoices by tax/duty **scheme**. `invoiceType` state (`"Direct_Invoice"` | `"Scheme_Invoice"`) toggles whether the scheme UI is shown. Per item, users set a `splitQty` and a `scheme` (`Direct` | `Advance` | `Moowr` | `Import Invoice` | `DDB`) and click "Split" (`handleSplitItem`, `ExportPrepare.jsx` L255-334), which validates: split qty must be `>0` and `< originalItem.itemQty`, must be a whole number, and a non-`"Direct"` scheme must be selected. `splitInvoiceByScheme()` (`InvoiceSlice.jsx` L1566-1583) then groups items by scheme into N separate sub-invoice objects, each with its **own sequential invoice number** (`setFinalInvoiceData`, L113-317, increments `baseInvoiceNumber + index` per split).
- **Calculations:** Same tyre+rim formulas as Customer (`totalQTY`, `grandTotal=(basicprice+rimUnitPrice)*itemQty`, `totalFWT`), plus per-scheme: `unitPrice = grandTotal/totalwt` (guarded against divide-by-zero), `totalGrossWeight = totalwt + palletWeight(if isPallet) + woodenBoxWeight(if isWoodenBox)`, `finalGrandTotal = grandTotal + charges1+2+3 - totalDiscount`, `amountInWords` via `numberToWords()`.
- **"Combi" orders:** When `invoiceDetails.shipmentType === "COMBI"`, items are additionally grouped and totaled by `plant` (`combiOrders`, `ExportPrepare.jsx` L207-219, L719-768).
- **PDF template selection:** `PDFViewer.jsx` branches on `invoice.containerLoadFrom === "SITL" || "SLTL"` (Sri Lanka plants) → `SRILANKA_INVOICE/LankaCustomPDF.jsx` + `LamkaCustomPackingPDF.jsx`; otherwise → `InvoiceExportPDF.jsx` (single combined "INVOICE CUM PACKING LIST" page, title changes to "RE EXPORT INVOICE CUM PACKING LIST" when `licenceDetails.scheme === "Import Invoice"`).
- **Invoice numbering:** Computed client-side per scheme-split sub-invoice (`baseInvoiceNumber + index`) inside the Redux reducer, not by the backend at this stage — actual authoritative numbering scheme is **not verifiable** without backend source.
- **Delete/cancel/approval:** **Not found / Cannot be verified from available source code.**
- **Permissions:** `menuMap.Custom = "ExportCustomInvoice"`, same mechanism as Customer (§3.1).

### 3.3 Proforma Invoice (and Draft mode)

- **Entry point / route:** `/TTS/International/ProformaInvoice/List` → `PIMaster.jsx` (shell) → default-redirects to `/PI` → `/TTS/International/ProformaInvoice/List/:invoiceType` → `ProformaList.jsx`, where `:invoiceType` is `"PI"` (normal) or `"Draft"`. Prepare: `/TTS/International/ProformaInvoice/Prepare` → `ProformaPrepare.jsx` (used for **both** modes; the `Invoice/ProformaInvoice/Draft/Prepare` route pointing at the same component appears to be **dead/unreachable** — no `navigate()` call in the codebase targets it, `Router.jsx` L359-362). PDF preview: `/TTS/International/Invoice/ProformaInvoice/PDF` → `ProformaPDFViewer.jsx`.
- **How Draft vs PI is actually decided, end to end:**
  1. Tab click in `Header.jsx` (L31-46) navigates to `.../List/Draft` or `.../List/PI`.
  2. `ProformaList.jsx` reads `:invoiceType` via `useParams()` (L25) and does `invoiceType === "Draft" ? dispatch(getListOfProformaInvoice("export","DRAFT")) : dispatch(getListOfProformaInvoice("export","PI"))` (L49-56) — this decides which **list** endpoint is called.
  3. Clicking "Open" on a row navigates to `/TTS/International/ProformaInvoice/Prepare` (always this URL, never the `/Draft/Prepare` one) with router `state = { data: row, pathname, invoiceType }` (`ProformaList.jsx` L151-172).
  4. `ProformaPrepare.jsx` reads `state?.invoiceType` (L50) purely for UI label text ("Draft Proforma Invoice" vs "Proforma Invoice", confirm-dialog wording) and passes it straight into `submitProformaInvoice(invoiceType)`.
  5. `submitProformaInvoice` (`ProformaInvoiceSlice.jsx` L176-391) maps `invoiceType==="PI" ? "PROFORMA INVOICE" : "DRAFT PROFORMA"`, then picks the create endpoint: `POST /DraftPI/create_PI` vs `POST /DraftPI/create_DraftPI` (L370-384).
  - A **second, independent** Draft flag also exists: `proformaDetails?.isDraft`, an API/DB-sourced field read in `ProformaPrepare.jsx` (L315, L332-337) for page-title/"Verified By" text. This is **not guaranteed to agree** with the router-state `invoiceType` flag (see §20/§31 for the resulting inconsistency risk).
- **Conversion:** **No conversion code exists.** Draft is never "promoted" to a final Proforma — each submission is an independent `create_PI`/`create_DraftPI` POST with `draftPI_Id: 0` always (`ProformaInvoiceSlice.jsx` L278-284). There is also **no code anywhere connecting Proforma Invoice to Customer Invoice or Custom Invoice** — they are entirely separate Redux slices/workflows with no cross-reference.
- **Calculations (GST-aware, unique to this flow):** `subtotal = Σ(basicPrice+rimUnitPrice)*itemQty`; `taxable = subtotal + totalCharges - totalDiscounts`; GST resolved by a 3-way type selector (`gstCharges.type`: `IGST` | `CGST_SGST` | `BACKEND`) — `gstAmount = taxable>0 ? round2(taxable*gstPercent/100) : 0`; `grandTotalDDP = taxable + gstAmount`. This exact formula is independently re-implemented **four times** (`ProformaPrepare.jsx` subtotal only, `AdditionalDetailsForm.jsx` ×3 internally, `ProformaPDF.jsx` once more) with no shared utility — a duplication/drift risk (§31).
- **Master data dependency:** `getMasterData()` (`GET /DraftPI/GettingDraftPIMaster`) populates dropdown sources for transport modes, container types, packing methods, exporter addresses, exporter banks, incoterms, lead times — consumed throughout `AdditionalDetailsForm.jsx` and re-looked-up by ID during final submit.
- **Validation:** react-hook-form inline (`required`, `min`, `max` on GST %), a custom regex for percent-or-number "smart" charge/discount inputs (`/^(\d+(\.\d+)?)%$/`), and pallet/wooden-box quantity balancing validation. No yup/zod.
- **PDF:** `ProformaPDF.jsx` — single template used for both Draft and PI; the in-document title always reads "PROFORMA INVOICE" regardless of mode (only the surrounding viewer chrome/title differs, per `ProformaPDFViewer.jsx` L92: `state==="PI" ? "PREFORMA" : "DRAFT"`). Items grouped by `tyreType`, paginated 25/page.
- **Permissions:** Tab-level only, in `Header.jsx` (`hasPermission`, admin bypass else checks `auth.Menus` for a menu whose `menuName`/`menuUrl` matches the tab's full path, e.g. `/TTS/International/ProformaInvoice/List/Draft`). No permission checks on Prepare/Submit/PDF actions.
- **Status literal found:** `invoiceDetails?.status === "PREPARED"` (`AdditionalDetailsForm.jsx` L636) gates whether Additional Charges/Discounts are still freely editable versus capped at a DB-recorded maximum — this is the closest thing to a formal status field found in the Proforma flow, and it is a different concept from the Draft/PI mode flag.

### 3.4 "Draft Invoice"

As established in §3.3: **Draft Invoice is not a separate invoice type or module.** It is a mode of the Proforma Invoice workflow. There is no independent "Draft Invoice" component tree, Redux slice, form, or PDF template. Documenting it as items A-L from the original brief:

| Brief's requested item | Finding |
|---|---|
| How draft invoices are created | Same `ProformaPrepare.jsx` + `AdditionalDetailsForm.jsx` as normal Proforma; distinguished only by the `invoiceType` flag threaded through router state, ultimately selecting `POST /DraftPI/create_DraftPI` instead of `create_PI`. |
| Draft data structure | Identical shape to Proforma Invoice (`state.proformaInvoice.proformaDetails`/`finalData`); listed separately only in `state.proformaInvoice.listOfDraftProforma` vs `listOfProformaInvoice`. |
| Draft status | `status === "PREPARED"` is the only status-like field found, and it is not Draft-specific (applies to both modes). |
| Save/update workflow | Same as Proforma — `setAdditionalForm` writes to Redux client-side only; nothing persists until final Submit. |
| Editing workflow | Identical component (`ProformaPrepare.jsx`/`AdditionalDetailsForm.jsx`) for both modes; no Draft-specific fields or restrictions found. |
| Conversion from Draft to final invoice | **Does not exist** — confirmed no code performs this. |
| Validation before finalization | Same react-hook-form rules as Proforma; no Draft-specific extra validation found. |
| API calls | `GET /DraftPI/GettingDraftPIReadyOrders` (list), `GET /DraftPI/GettingDraftPIReadySpecificOrders` (detail — endpoint name used for both modes' detail fetch), `POST /DraftPI/create_DraftPI` (finalize). |
| Redux state | `state.proformaInvoice.listOfDraftProforma` (separate array from `listOfProformaInvoice`); otherwise same slice/fields as PI. |
| PDF/print behavior | Identical PDF template; only viewer chrome label differs ("DRAFT" vs "PREFORMA"). |
| Delete/cancel behavior | **Not found / Cannot be verified from available source code.** |
| Permissions | Same tab-level permission key (`"Draft Proforma Invoice"`) as any other Proforma tab; no separate Draft-specific permission logic. |
| Relationship with Customer/Custom/Proforma invoices | Draft is a mode of Proforma only; no relationship to Customer or Custom Invoice was found in code. |

---

## 4. Folder Structure

```text
src/pages/TTS/International/Invoice/Export Invoice/
├── ExportInvoicePage.jsx            # shared list page — Customer + Custom (toggle via router state)
├── ExportTable.jsx                  # generic paginated table (list page only)
├── TableSkeleton.jsx                # list-page loading skeleton
├── ExportPrepare.jsx                # Custom Invoice Prepare/create form (scheme-split UI) + inline duplicate ClientDetailsSection
├── AdditionalDetailsForm.jsx        # Custom Invoice "Additional Details" modal (react-hook-form)
├── PDFViewer.jsx                    # Custom Invoice PDF preview page (route: Invoice/Export/BillPDF); picks Lanka vs default template
├── InvoiceExportPDF.jsx             # Custom Invoice PDF template (non-Lanka, "INVOICE CUM PACKING LIST")
├── ShippingSchemeSplitTailwind.jsx  # standalone prototype page — not linked from production UI (dead/demo)
├── SampleSplit.jsx                  # standalone prototype page — not linked from production UI (dead/demo)
│
├── Customer Invoice/
│   ├── ExportCustPrepare.jsx        # Customer Invoice Prepare/create form (no split UI)
│   ├── ClientDetailsSection.jsx     # Customer-specific order/shipping info card (duplicate #2 of 3)
│   ├── AdditionalDetailsForm.jsx    # Customer Invoice "Additional Details" modal (isPrepared/DB-max logic)
│   ├── CustomerPDFViewer.jsx        # Customer Invoice PDF preview page (route: Invoice/Customer/BillPDF)
│   ├── InvoiceCustomerPDF.jsx       # Customer Invoice PDF template, page 1 (invoice/price)
│   └── InvoiceCustomerPacking.jsx   # Customer Invoice PDF template, page 2 (packing/weight)
│
├── Proforma Invoice/
│   ├── PIMaster.jsx                 # shell for ProformaInvoice/List route tree, tab-switch animation shell
│   ├── Header.jsx (PIHeader)        # tab bar (Draft vs PI), search box, permission gating for tabs
│   ├── ProformaList.jsx             # list table — data source switches on :invoiceType param (Draft/PI)
│   ├── ProformaPrepare.jsx          # Prepare/edit page — serves both Draft and PI
│   ├── AdditionalDetailsForm.jsx    # Proforma "Additional Details" modal — GST calc, charges/discounts
│   ├── ClientDetailsSection.jsx     # Proforma-specific order/shipping info card (duplicate #3 of 3)
│   ├── ProformaPDFViewer.jsx        # PDF preview wrapper (route: Invoice/ProformaInvoice/PDF)
│   └── ProformaPDF.jsx              # PDF template — used for both Draft and PI
│
└── SRILANKA_INVOICE/
    ├── LankaCustomPDF.jsx           # Custom Invoice PDF template variant for containerLoadFrom SITL/SLTL
    └── LamkaCustomPackingPDF.jsx    # packing-list counterpart (note filename typo "Lamka")
```

**Redux (outside the folder but exclusively serving it, plus one Domestic-module note):**

```text
src/Redux/Slices/InvoiceSlice.jsx                        # Customer + Custom Invoice state/thunks (1611 lines)
src/Redux/Slices/ProformaInvoice/ProformaInvoiceSlice.jsx # Proforma + Draft state/thunks
src/Redux/Slices/ProformaInvoice/PIMasterSlice.jsx        # tab-mode state — effectively dead (see §15)
src/Redux/Store/app.jsx                                   # registers both slices, session-storage persistence
```

**Shared infrastructure used by this module:**

```text
src/utils/axios.jsx           # shared axios instance + response interceptor (401/403/408/400/5xx handling)
src/config.js                 # BackendUrl = import.meta.env.VITE_BASE_URL
src/utils/menuAccess.js       # hasAccess() helper, used by SideBar.jsx for menu filtering
src/components/ProtectedRoutes/routePermissions.js   # route-path → required MenuName map (includes invoice routes)
src/components/ProtectedRoutes/ProtectedRoutes.jsx    # route guard component enforcing the above
src/utils/NumberToWords.jsx   # amount-in-words for PDFs
src/utils/currencies.js       # getCurrency / getCurrencySymble
src/utils/HSNCODE.js          # HSN_CODE lookup (imported by InvoiceSlice, not traced further)
```

**No dedicated hooks/, constants/, types/, or validation/ folders exist for this module** — logic is inline in components/slices. **No backend controllers/services/routes/SQL exist anywhere in this repository** (§17).

**Out-of-scope but router-adjacent (documented for completeness only):** `src/pages/TTS/Domostic/Invoice/CustomerInvoice.jsx` and `CustomInvoice.jsx` — placeholder pages with dummy generated data, no Redux, no API calls, no shared code with the International module (§26).

---

## 5. Architecture

```text
UI (React components, route-driven)
 │
 ├─ ExportInvoicePage.jsx ──────────┬─ Customer Invoice Prepare (ExportCustPrepare.jsx)
 │  (shared list, Customer/Custom)  └─ Custom Invoice Prepare (ExportPrepare.jsx)
 │
 └─ PIMaster.jsx → Header.jsx → ProformaList.jsx → ProformaPrepare.jsx
    (shared list+prepare, PI/Draft mode)
 ↓
State Management (Redux Toolkit createSlice; NO createAsyncThunk anywhere — manual thunks)
 ├─ invoice slice          → exportInvoices.{invoiceDetails | invoiceCustDetails, ...}
 └─ proformaInvoice slice  → proformaDetails / finalData / listOfProformaInvoice / listOfDraftProforma
    (+ PIMaster slice — present but not functionally wired to any UI control, §15)
 ↓
API Layer (single axios instance, src/utils/axios.jsx, baseURL = VITE_BASE_URL, cookie-based auth via withCredentials)
 ├─ /Invoice/...     (Customer + Custom Invoice)
 ├─ /PdfUpload/Invoice/upload  (PDF upload, both)
 └─ /DraftPI/...     (Proforma + Draft)
 ↓
Backend — NOT PRESENT IN THIS REPOSITORY (external system; contract inferred from the frontend calls only)
 ↓
Database — Not found / Cannot be verified from available source code
```

```text
Invoice Module (International, Export Invoice)
│
├── Customer Invoice
│   ├── Page: ExportInvoicePage.jsx (shared)
│   ├── Prepare: Customer Invoice/ExportCustPrepare.jsx
│   ├── Additional Details: Customer Invoice/AdditionalDetailsForm.jsx
│   ├── Redux: InvoiceSlice.jsx → invoiceCustDetails
│   └── PDF: CustomerPDFViewer.jsx → InvoiceCustomerPDF.jsx + InvoiceCustomerPacking.jsx
│
├── Custom Invoice
│   ├── Page: ExportInvoicePage.jsx (shared)
│   ├── Prepare: ExportPrepare.jsx (+ inline ClientDetailsSection)
│   ├── Additional Details: AdditionalDetailsForm.jsx (root)
│   ├── Redux: InvoiceSlice.jsx → invoiceDetails
│   └── PDF: PDFViewer.jsx → InvoiceExportPDF.jsx  |  SRILANKA_INVOICE/* (SITL/SLTL plants)
│
└── Proforma Invoice (incl. Draft mode)
    ├── Shell: PIMaster.jsx + Header.jsx (tab switch)
    ├── List: ProformaList.jsx (:invoiceType = PI | Draft)
    ├── Prepare: ProformaPrepare.jsx (shared by both modes)
    ├── Additional Details: Proforma Invoice/AdditionalDetailsForm.jsx (GST-aware)
    ├── Redux: ProformaInvoiceSlice.jsx → proformaDetails/finalData, listOfProformaInvoice/listOfDraftProforma
    └── PDF: ProformaPDFViewer.jsx → ProformaPDF.jsx (shared by both modes)
```

---

## 6. Routing

Source: `src/router/Router.jsx`, all nested under `TTS/International` → `<InvoiceLayout/>`.

| Path | Element | Notes |
|---|---|---|
| `Invoice/CustomerInvoice` | `ExportInvoicePage` (imported as `ExportInvoice`) | List, requires `state.type="Customer"` |
| `Invoice/CustomInvoice` | `ExportInvoicePage` (same component) | List, requires `state.type="Custom"` |
| `Invoice/CustomerInvoice/Prepare` | `ExportCustInvoicePrepare` | Customer Prepare form |
| `Invoice/CustomInvoice/Prepare` | `ExportInvoicePrepare` | Custom Prepare form |
| `Invoice/Export/BillPDF` | `ExportInvoiceBillPDF` (`PDFViewer.jsx`) | Custom Invoice PDF preview |
| `Invoice/Customer/BillPDF` | `InvoicePDF` (`CustomerPDFViewer.jsx`) | Customer Invoice PDF preview |
| `Invoice/Export/ShippingSchemeSplit` | `ShippingSchemeSplitTailwind` | Prototype/demo, unreachable from production UI |
| `Invoice/Export/Sample` | `SampleSplit` | Prototype/demo, unreachable from production UI |
| `ProformaInvoice/List` | `PIMaster` (index redirects to `PI`) | Shell |
| `ProformaInvoice/List/:invoiceType` | `ProformaList` | `:invoiceType` = `PI` \| `Draft` |
| `Invoice/ProformaInvoice/PDF` | `ProformaPDFViewer` | PDF preview, both modes |
| `ProformaInvoice/Prepare` | `ProformaPrepare` | **The only Prepare URL actually navigated to** |
| `Invoice/ProformaInvoice/Draft/Prepare` | `ProformaPrepare` (same component) | Registered but **unreachable** — no `navigate()` targets it anywhere in `src/` |

No path or query parameters are used to carry invoice type on any of these routes — all type disambiguation is via `react-router` `state` (Customer/Custom) or the `:invoiceType` dynamic segment (Draft/PI). This means **hard refresh or a bookmarked/shared URL loses the type context** for the Customer/Custom list page (§20 item 19) — the Proforma list page is safe from this because its type lives in the URL path itself.

---

## 7. Component Architecture

Key duplication finding: **`ClientDetailsSection` (the read-only order/shipping summary card) exists in three separate, independently-maintained implementations** — inline inside `ExportPrepare.jsx` (Custom), `Customer Invoice/ClientDetailsSection.jsx` (Customer), and `Proforma Invoice/ClientDetailsSection.jsx` (Proforma) — near-identical markup/logic, no shared component. Likewise `ExportTable.jsx`/`TableSkeleton.jsx` are reused only within the Customer/Custom pairing; Proforma has its own inline table rendering in `ProformaList.jsx`.

No shared "Invoice" component library, hook, or context exists across the three workflows — each is a self-contained vertical slice (page + form + Redux + PDF) that happens to sit in the same folder tree.

---

## 8. File-by-File Analysis

| File | Purpose | Key exports | Redux dependency | Used by |
|---|---|---|---|---|
| `ExportInvoicePage.jsx` | Shared Customer/Custom list page, type toggle, permission gate | default `ExportInvoicePage` | `getExportInvoice`, `getExportInvoiceAll`, `resetExportInvoiceDetails` | Router only |
| `ExportTable.jsx` | Generic paginated table (headers/data props) | default | none | `ExportInvoicePage.jsx` |
| `TableSkeleton.jsx` | List loading skeleton | default | none | `ExportInvoicePage.jsx` |
| `ExportPrepare.jsx` | Custom Invoice Prepare — scheme split, combi grouping, submit | default `ExportInvoicePrepare`, `ClientDetailsSection`, `ClientDetailsSkeleton` | `setFinalInvoiceData, setInvoiceType, setLocalItems, setSplitItems, setSplitResult, SetupdatedInvoiceDetails, submitInvoice, setShowSubmit` | Router |
| `Customer Invoice/ExportCustPrepare.jsx` | Customer Invoice Prepare — no split, direct submit | default `ExportCustInvoicePrepare` | `setFinalCustomerData, submitCustomerInvoice` (+ several dead imports, see §20.14) | Router |
| `Customer Invoice/ClientDetailsSection.jsx` | Customer order/shipping card | default, `ClientDetailsSkeleton` | none | `ExportCustPrepare.jsx` |
| `AdditionalDetailsForm.jsx` (root) | Custom "Additional Details" modal, scheme-grouped | default `AdditionalCustDetailsForm`(local naming — Custom variant) | `setExportAdditionalInvoice` | `ExportPrepare.jsx` |
| `Customer Invoice/AdditionalDetailsForm.jsx` | Customer "Additional Details" modal, `isPrepared` read-only/DB-max logic | default `AdditionalCustDetailsForm` | `resetCustomerAdditionalData, setExportCustAdditionalInvoice, setFinalCustomerData, setShowSubmit` | `ExportCustPrepare.jsx` |
| `PDFViewer.jsx` | Custom Invoice PDF preview, template routing (Lanka vs default), font registration | default `ExportInvoiceBillPDF` | `setPdfBlob` (`SetupdatedInvoiceDetails` imported unused) | Router |
| `Customer Invoice/CustomerPDFViewer.jsx` | Customer Invoice PDF preview | default `InvoicePDF` | `setPdfBlob` | Router |
| `InvoiceExportPDF.jsx` | Custom Invoice PDF template (non-Lanka) | default `InvoicePDF` | none (pure display) | `PDFViewer.jsx` |
| `Customer Invoice/InvoiceCustomerPDF.jsx` | Customer Invoice PDF template, page 1 | default | none | `CustomerPDFViewer.jsx` |
| `Customer Invoice/InvoiceCustomerPacking.jsx` | Customer Invoice PDF template, page 2 | default | none | `CustomerPDFViewer.jsx` |
| `SRILANKA_INVOICE/LankaCustomPDF.jsx` | Custom Invoice PDF template, Sri Lanka plants | default | none | `PDFViewer.jsx` |
| `SRILANKA_INVOICE/LamkaCustomPackingPDF.jsx` | Sri Lanka packing-list counterpart | default | none | `PDFViewer.jsx` |
| `ShippingSchemeSplitTailwind.jsx` | Prototype — hardcoded demo data | default | none | Router only (dead route) |
| `SampleSplit.jsx` | Prototype — hardcoded demo data | default | `setInvoiceType, setLocalItems, setSplitItems, setSplitResult, SetupdatedInvoiceDetails` | Router only (dead route) |
| `Proforma Invoice/PIMaster.jsx` | Shell for List route, tab-slide animation | default | `setMode` (imported, dead — never dispatched) | Router |
| `Proforma Invoice/Header.jsx` | Tab bar (Draft/PI), search, permission filter | `PIHeader` | none directly (dispatches a local `useState` setter incorrectly — bug, §20) | `PIMaster.jsx` |
| `Proforma Invoice/ProformaList.jsx` | List table, Draft/PI data source switch | default | `getListOfProformaInvoice, resetMaster` | Router |
| `Proforma Invoice/ProformaPrepare.jsx` | Prepare/edit page, both modes | default | `getProformaInvoiceDetails, resetProformaSubmit, setPartNumber, resetPartNumbers, setShowPartNumber, submitProformaInvoice` + cross-slice `setShowSubmit`/`setFinalCustomerData`/`submitCustomerInvoice` from `InvoiceSlice` (bug, §20) | Router |
| `Proforma Invoice/AdditionalDetailsForm.jsx` | GST-aware Additional Details modal | default `AdditionalCustDetailsForm` | `setAdditionalForm`, `getMasterData` | `ProformaPrepare.jsx` |
| `Proforma Invoice/ClientDetailsSection.jsx` | Proforma order/shipping card | default, `ClientDetailsSkeleton` | none | `ProformaPrepare.jsx` |
| `Proforma Invoice/ProformaPDFViewer.jsx` | PDF preview wrapper | default | reads `state.proformaInvoice.finalData` | Router |
| `Proforma Invoice/ProformaPDF.jsx` | PDF template, both modes | default | none (pure display) | `ProformaPDFViewer.jsx` |
| `Redux/Slices/InvoiceSlice.jsx` | Customer + Custom state/thunks | reducer + ~20 actions + 6 thunks | — | Entire Customer/Custom flow |
| `Redux/Slices/ProformaInvoice/ProformaInvoiceSlice.jsx` | Proforma + Draft state/thunks | reducer + ~12 actions + 4 thunks | — | Entire Proforma/Draft flow |
| `Redux/Slices/ProformaInvoice/PIMasterSlice.jsx` | Tab-mode state | reducer + 3 actions | — | `PIMaster.jsx` (effectively dead, §15) |

---

## 9. Complete Field Inventory (per form)

### 9.1 Customer Invoice — Additional Details form (`Customer Invoice/AdditionalDetailsForm.jsx`)

| Field | UI Label | Type | Required | Default/Source | Editable | Notes |
|---|---|---|---|---|---|---|
| `preCarriageBy` | Pre-Carriage By | select (SEA/AIR/ROAD) | No | saved or `invoiceDetails` | Yes | |
| `placeOfReceiptByPreCarrier` | Place of Receipt | select | No | same | Yes | |
| `vesselFlightNo` | Vessel/Flight No | text | No | same | Yes | |
| `billOfLadingNo` | Bill of Lading No | text | No | same | Yes | |
| `portOfLoading` / `portOfDischarge` | Port of Loading/Discharge | text | No | same | Yes | |
| `finalDestination` | Final Destination | text | No | same | Yes | |
| `countryOfFinalDestination` | Country of Final Destination | text | No | same | Yes | |
| `containerType` | Container Type | text | No | same | Yes | |
| `containerNo` | Container No | text | No | same | Yes | |
| `containerSEALNO` | Container Seal No | text | No | same | Yes | |
| `exportAuthorisedAddress` | Exporter Authorised Address | textarea (`~`-formatted) | No | same | Yes | |
| `countryOfOriginOfGoods` | Country of Origin | select (INDIA / SRI LANKA / both) | No | same | Yes | |
| `invoiceNumber` | Invoice Number | text | No | same | **Read-only when `isPrepared`** | |
| `otsNo` | OTS No | text | No | same | Yes | |
| `BuyersOrderNumber` | Buyer's Order Number | text | No | `invoiceDetails.orderRefNo` | Yes | |
| `notifyPartyName/Email/Phone/City/State/Country/Address` | Notify Party block | text | No | same | Yes | |
| `incoterm` | Incoterm | select (FOB/CIF/DDU/DDP/C&F/DAP/EXW) | No | same | Yes | |
| `placeOfIncoterm` | Place of Incoterm | text | No | same | Yes | |
| `ExchangeCurrency` | Exchange Currency | decimal | No | same | Yes | |
| `paymentTerms` | Payment Terms | textarea (HTML-decoded) | No | same | Yes | |
| `bankDetails` | Bank Details | textarea | No | same | Yes | |
| `additionalCharges[].rows[].{desc,value}` | Additional Charges (per scheme) | dynamic rows | No | `otherChargesDetails[].chargesType1-3/otherCharges1-3` | Yes, capped at `dbMaxTotal` if `isPrepared` | Calculated |
| `discountDetails[].rows[].{desc,value}` | Discounts (per scheme) | dynamic rows | No | `otherChargesDetails[].discount1-3/discountValue1-3` | Yes, hidden add/remove if `isPrepared` | Calculated |
| `${schemeKey}_isPallet` / `_palletCount` / `_numberOfTyres` / `_palletWeight` / `_palletDimension` | Pallet packing (per scheme) | bool/number/text | No | `additionalDetails` | Yes | Balance-validated against total qty |
| `${schemeKey}_isWoodenBox` / `_woodenBoxCount` / `_woodenBoxTyres` / `_woodenBoxWeight` / `_woodenBoxDimension` | Wooden-box packing (per scheme) | bool/number/text | No | `additionalDetails` | Yes | Balance-validated |
| `igstlut` | IGST/LUT | text | No | same | Yes | |
| `invoice_Details` | Invoice Details | textarea | No | same | Yes | |
| `rexNumber` | REX Number | textarea (mislabeled — should be text) | No | same | Yes | |

### 9.2 Custom Invoice — Additional Details form (`AdditionalDetailsForm.jsx`, root)

| Field | UI Label | Type | Required | Default/Source | Editable | Notes |
|---|---|---|---|---|---|---|
| `exporterAuthorizedAddress` | Exporter Address | select (5 hardcoded addresses) | No | — | Yes | |
| `vesselFlightNo`, `invoiceNumber`, `billOfLadingNo`, `containerNo`, `portOfLoading`, `portOfDischarge`, `containerType`, `containerSEALNO` | various | text | No | same | Yes | Conditionally shown only if `type==="Customer"` for Vessel/BL fields — dead in this Custom-only form (§20.15) |
| `countryOfOriginOfGoods` | Country of Origin | select | No | same | Yes | |
| `preCarriageBy` | Pre-Carriage By | select (SEA/AIR/ROAD) | **Yes** | same | Yes | |
| `incoterm` | Incoterm | select | **Yes** | same | Yes | |
| `placeOfIncoterm` | Place of Incoterm | text | **Yes** | same | Yes | |
| `placeOfReceiptByPreCarrier` | Place of Receipt | select | **Yes** | same | Yes | |
| `finalDestination` | Final Destination | text | **Yes** | `invoiceDetails.shippingCity` | Yes | |
| `countryOfDestination` | Country of Destination | text | No | same | Yes | |
| `otherCharges1-3` / `otherChargesValue1-3` | Global other charges | text/number | No | same | Yes | |
| `paymentTerms` | Payment Terms | textarea | **Yes** | same | Yes | |
| `REXNumber`, `IGSTLUT`, `otsNo`, `itcHsNo` | various | text | No | same | Yes | |
| `additionalCharges[]` / `discountDetails[]` | Per-scheme charges/discounts | dynamic rows | No | `invoiceFinalData` (client-computed split) | Yes | |
| `ExchangeCurrency` | Exchange Currency | text | **Yes, only if** `invoiceFinalData[0].usercurrency !== "INR"` | same | Yes | Currency-conditional requirement |
| `notifyParty*` | Notify Party block | text | No | same | Yes | |
| `BuyersOrderNumber` | Buyer's Order Number | text | No | same | Yes | |
| `${scheme}_number` / `_date` | Scheme License Number/Date | text/date | **Yes** (when scheme not Direct/Import/DDB) | same | Yes | |
| `${scheme}_isPallet` / `_palletCount` / `_numberOfTyres` / `_palletWeight` / `_palletDimension` | Pallet packing | bool/number/text | No | same | Yes | Balance-validated |
| `${scheme}_isWoodenBox` / `_woodenBoxCount` / `_woodenBoxTyres` / `_woodenBoxWeight` / `_woodenBoxDimension` | Wooden-box packing | bool/number/text | No | same | Yes | Balance-validated |
| `${scheme}_plantAddress`, `_InvoiceDiscription`, `_ImportedCountryOfOriginGoods`, `_ImportedREXNumber` | Scheme-specific detail fields | text | Conditionally **Yes** by scheme type | same | Yes | |

### 9.3 Proforma Invoice — Additional Details form (`Proforma Invoice/AdditionalDetailsForm.jsx`)

| Field | UI Label | Type | Required | Default/Source | Editable | Notes |
|---|---|---|---|---|---|---|
| `preCarriageBy` | Pre-Carriage By | select (`master.transportModes`) | **Yes** | saved or `invoiceDetails` | Yes | |
| `finalDestination` | Final Destination | text | **Yes** | same | Yes | |
| `containerType` | Container Type | select (`master.containerTypes`) | **Yes** | same | Yes | |
| `packingMethod` | Packing Method | select (`master.packingMethods`) | No | same | Yes | |
| `exportAuthorisedAddress` | Exporter Address | select w/ custom entry (`master.exporterAddresses`) | **Yes** | same | Yes | Drives `authorisedSignature` lookup |
| `BuyersOrderNumber` | Buyer's Order Number | text | **Yes** | `invoiceDetails.orderRefNo` | Yes | |
| `Date` | Order Date | date | **Yes** | same | Yes | |
| `EmailDate` | Email Date | date | **Yes** | same | Yes | |
| `revisionNumber` / `revisionDate` | Revision info | text/date | No | same | Yes | |
| `notifyPartyName/Email/Phone/City/State/Country/Address/Zipcode` | Notify Party | text | No | same | Yes | |
| `incoterm` | Incoterm | select (`master.incoterms`) | **Yes** | same | Yes | |
| `placeOfIncoterm` | Place of Incoterm | text | **Yes** | same | Yes | |
| `paymentTerms` | Payment Terms | textarea | **Yes** | same | Yes | |
| `custInstruction` | Remarks | textarea | No | same | Yes | |
| `bankDetails` | Bank Details | select (`master.exporterBanks`) | **Yes** | same | Yes | |
| `leadTime` | Lead Time | select (`master.leadtimemaster`, fallback hardcoded list) | **Yes** | same | Yes | |
| `validityDate` | Validity Date | date | **Yes** | same | Yes | |
| `additionalCharges[].rows[].{desc,value}` | Additional Charges | dynamic rows (desc from fixed 7-option list) | No | — | Yes, capped if `isPrepared` | Calculated |
| `discountDetails[].rows[].{desc,value}` | Discounts | dynamic rows (2-option list) | No | — | Yes, locked if `isPrepared` | Calculated |
| `gstCharges.type` | GST Mode | select (BACKEND/IGST/CGST_SGST) | No | `"BACKEND"` | Yes | |
| `gstCharges.igst` | IGST % | number (0-100) | **Yes if type=IGST** | — | Yes | |
| `gstCharges.cgst` / `sgst` | CGST/SGST % | number (0-100 each) | **Yes if type=CGST_SGST** | — | Yes | |
| `gstCharges.percentage`/`.amount` | (computed) | number | — | computed at submit | No | Calculated |
| `placeOfReceiptByPreCarrier`, `portOfLoading`, `portOfDischarge`, `countryOfFinalDestination`, `countryOfOriginOfGoods`, `ExchangeCurrency`, `igstlut`, `rexNumber`, `invoice_Details` | various | — | No | default only | **No rendered input — dead fields**, only carried through to submit payload if pre-populated | |

### 9.4 Line-item fields common to all three flows

Confirmed field names actually referenced across item tables/PDFs/calculations: `itemCode` (Product/SUN Part No), `partNumber`/`PartNumber` (Customer Part No, editable only in Proforma via `setPartNumber` when `showPartNumber`), `platforms`, `category`, `tyreSize`, `tyreRim`, `tyreType`, `brand`, `sidewall`, `hsnCode`, `itemQty` (Quantity), `basicprice`/`basicPrice` (Tyre unit price — casing differs by flow), `rimUnitPrice`, `finishedWt`, `rimfinishedwt`, `rimStatus`/`assyRimstatus` (bool — whether item includes rim assembly), `scheme` (Custom-only), `isScheme`/`isSplit` (Custom-only, local state), `edcNo`, `PONumber`, `o_ItemID`, `plant` (used for Combi grouping), `shipmentType` (order-level, drives Combi UI). No `warehouse`, `batch`, or `serial number` fields were found anywhere in this module.

---

## 10. API Documentation

All calls go through the shared `api` axios instance (`src/utils/axios.jsx`, `baseURL = import.meta.env.VITE_BASE_URL`, `withCredentials: true` — cookie/session-based auth; **no `Authorization: Bearer` header logic found anywhere**).

| Method | Endpoint | Purpose | Called from |
|---|---|---|---|
| GET | `/Invoice/GettingCustInvoiceReadyOrders` | List invoices ready to bill (Customer) | `getExportInvoiceAll`, `ExportInvoicePage.jsx` |
| GET | `/Invoice/GettingInvoiceReadyOrders` | List invoices ready to bill (Custom) | `getExportInvoiceAll`, `ExportInvoicePage.jsx` |
| GET | `/Invoice/GettingSpecificCustOrders/{id}` | Single order detail (Customer) | `getExportInvoice`, `ExportCustPrepare.jsx` |
| GET | `/Invoice/GettingSpecificOrders/{id}` | Single order detail (Custom) | `getExportInvoice`, `ExportPrepare.jsx` |
| POST | `/Invoice/CreatingInvoices` | Create Custom Invoice(s) — one payload entry per scheme split | `submitInvoice`, `ExportPrepare.jsx` submit |
| POST | `/Invoice/CreatingCustomerInvoice` | Create Customer Invoice | `submitCustomerInvoice` — **call is commented out; never actually fires** |
| POST | `/PdfUpload/Invoice/upload` (query: `invoiceNo, InvoiceType, OrderRefno, customerCode, year`) | Upload generated invoice PDF (multipart) | `uploadCustomInvoicePDF` (live), `uploadCustomerInvoicePDF` (unreachable) |
| GET | `/DraftPI/GettingDraftPIReadyOrders` (query `DocumentType`) | List Draft Proforma invoices | `getListOfProformaInvoice(...,"DRAFT")`, `ProformaList.jsx` |
| GET | `/DraftPI/GettingPIReadyOrders` (query `DocumentType`) | List normal Proforma invoices | `getListOfProformaInvoice`, `ProformaList.jsx` |
| GET | `/DraftPI/GettingDraftPIReadySpecificOrders` (query `o_id`) | Single Proforma/Draft detail | `getProformaInvoiceDetails`, `ProformaPrepare.jsx` — used for **both** modes despite the "Draft"-named endpoint |
| GET | `/DraftPI/GettingDraftPIMaster` | Master/reference data for dropdowns | `getMasterData`, Proforma `AdditionalDetailsForm.jsx` |
| POST | `/DraftPI/create_PI` | Finalize a normal Proforma Invoice | `submitProformaInvoice` when `invoiceType==="PI"` |
| POST | `/DraftPI/create_DraftPI` | Finalize a Draft Proforma Invoice | `submitProformaInvoice` when `invoiceType!=="PI"` |

**Payload trace example (Custom Invoice submit):** UI item row (`itemQty`, `basicprice`, `rimUnitPrice`, `scheme`, …) → local `localItems`/`splitItems` state → `splitInvoiceByScheme()` groups by scheme → `setFinalInvoiceData` reducer computes totals per split invoice → `FinalInvoiceDetails` in Redux → `submitInvoice(FinalInvoiceDetails, navigate)` thunk formats dates and ~70 fields per split invoice → `POST /Invoice/CreatingInvoices` body `{ finalInvoiceDetails: [...] }`.

**Response/DB field naming — not verifiable:** backend response field names are only knowable from what the frontend reads off `res.data` (documented per-field throughout §9); backend column names, stored procedures, and actual persistence behavior are **Not found / Cannot be verified from available source code** (§17).

---

## 11. Backend Flow

**Not found / Cannot be verified from available source code.** This repository contains no backend source: no `server/`, `controllers/`, `routes/` (outside `src/router`), `models/`, or `*.sql` files exist anywhere in the tree; `package.json` has no server framework dependency. All backend behavior described in this document (endpoint paths, expected payload/response shapes) is inferred solely from the frontend's axios calls and is a contract, not a verified implementation.

---

## 12. Database Mapping

**Not found / Cannot be verified from available source code.** No database schema, ORM models, or SQL is present in this repository.

---

## 13. Validation Rules

| Flow | Mechanism | Rules found |
|---|---|---|
| Custom Invoice — split | Imperative (`if` + toast) | `handleSplitItem`: split qty must be `>0`, `< originalItem.itemQty`, an integer, and a non-Direct scheme selected |
| Custom Invoice — Additional Details | react-hook-form inline | `preCarriageBy`, `incoterm`, `placeOfIncoterm`, `placeOfReceiptByPreCarrier`, `finalDestination`, `paymentTerms` required; `ExchangeCurrency` required only if non-INR; per-scheme license number/date required unless scheme is Direct/Import/DDB |
| Customer Invoice — Additional Details | react-hook-form inline + custom `validate` | `validateQty` blocks pallet/wooden tyre counts exceeding total qty or their combined sum exceeding total qty; per-charge-row `validate` enforces `current + otherTotal <= dbMaxTotal` when `isPrepared` |
| Proforma Invoice — Additional Details | react-hook-form inline + custom regex | Most logistics/financial fields required (see §9.3); GST % fields `min:0,max:100`; `SmartValueInput` percent-string regex `/^(\d+(\.\d+)?)%$/`; pallet/wooden balance validation (`validatePallet`/`validateWooden`) |
| All flows | — | **No yup/zod/Joi schema found anywhere in this module.** No backend validation is verifiable (§11). |

---

## 14. Conditional UI Logic

| Condition | UI behavior | Data/API behavior |
|---|---|---|
| `location.state.type` (Customer/Custom list) | Heading text, toggle default, table headers | Determines which `getExportInvoiceAll`/`getExportInvoice` branch fires |
| `invoiceType === "Scheme_Invoice"` (Custom Prepare) | Reveals scheme selector, per-item split UI, split-qty/scheme table columns | Enables `handleSplitItem`, changes what's dispatched to `setSplitResult` |
| `invoiceDetails?.shipmentType === "COMBI"` | Renders per-plant "Combi Orders" totals table | No API change, purely display grouping |
| `isPrepared` (`otherChargesDetails.length>0`, Customer Additional Details) | Invoice number/charges/discounts/packing fields become read-only; caps charge totals at DB max | No new API call, but constrains what can be submitted |
| `invoiceDetails?.status === "PREPARED"` (Proforma Additional Details) | Same read-only/capped-charges pattern as Customer's `isPrepared` | — |
| `containerLoadFrom` ∈ {SITL, SLTL} (Custom PDF) | Selects Sri Lanka PDF templates instead of default | — |
| `containerLoadFrom` ∈ {MMN, PDK} (all PDF templates) | Selects "Sundaram Industries" signatory/footer text instead of "Sundaram Lanka..." variant | — |
| `licenceDetails.scheme === "Import Invoice"` (Custom PDF) | Title becomes "RE EXPORT INVOICE CUM PACKING LIST" | — |
| `gstCharges.type` (Proforma) | Shows IGST field, or CGST+SGST fields, or read-only backend IGST/CGST/SGST info | Changes which fields are sent in the GST payload at submit |
| `showSubmmit && hasAdditionalForm` (Custom/Proforma) / `showSubmmit` alone (Customer) | Shows/hides the final Submit button | Gates whether `submitInvoice`/`submitCustomerInvoice`/`submitProformaInvoice` can be triggered by the user |
| `Menus.some(menu.menuName === requiredMenu)` (Customer/Custom toggle; Proforma tabs) | Blocks toggle/tab switch with a toast if the user lacks the permission | No API call attempted if blocked |
| `:invoiceType === "Draft"` (Proforma List) | No visible UI difference in table structure | Selects Draft vs PI list/detail/create endpoints |
| `showPartNumber` (Proforma items table) | Adds an editable "Part Number" input column | Dispatches `setPartNumber` on change |

---

## 15. Redux / State Management

### `InvoiceSlice.jsx` (`state.invoice`)

| State property | Initial value | Updated by | Used by | Purpose |
|---|---|---|---|---|
| `exportInvoices.invoiceType` | `"Direct_Invoice"` | `setInvoiceType` | `ExportPrepare.jsx` | Direct vs Scheme split mode (Custom) |
| `exportInvoices.listOFInvoices` | `[]` | `setExportInvoiceList` | `ExportInvoicePage.jsx` | List table data, both Customer & Custom |
| `exportInvoices.invoiceDetails` | `null` | `setExportInvoiceSalesDetails` | `ExportPrepare.jsx` | Custom Invoice order detail |
| `exportInvoices.invoiceCustDetails` | `[]` | `setExportCustInvoiceSalesDetails` | `ExportCustPrepare.jsx` | Customer Invoice order detail |
| `exportInvoices.additionalForm` | `null` | `setExportAdditionalInvoice` | `ExportPrepare.jsx` | Custom Additional Details data |
| `exportInvoices.additionalCustForm` | `null` | `setExportCustAdditionalInvoice` | `ExportCustPrepare.jsx` | Customer Additional Details data |
| `exportInvoices.finalCustomerData` | `null` | `setFinalCustomerData` | `ExportCustPrepare.jsx`, `CustomerPDFViewer.jsx`, **and `ProformaPrepare.jsx` imports it unused** | Merged Customer submit-ready data |
| `exportInvoices.FinalInvoiceDetails` | `[]` | `setFinalInvoiceData` | `ExportPrepare.jsx` submit | Per-scheme split Custom invoices, submit-ready |
| `exportInvoices.FinalInvoicePDFData` | `[]` | `SetupdatedInvoiceDetails` | `PDFViewer.jsx`, `InvoiceExportPDF.jsx`, Lanka templates | Fully-computed PDF-ready data (Custom) |
| `exportInvoices.localItems` / `splitItems` | `[]` | `setLocalItems` / `setSplitItems` | `ExportPrepare.jsx` | Working item buffers for split UI |
| `exportInvoices.FinalSplitResult` | `[]` | `setSplitResult` | `ExportPrepare.jsx` | Post-split item array |
| `exportInvoices.pdfBlob` | `[]` (holds a Blob once set) | `setPdfBlob` | PDF viewers, upload thunks | Generated PDF binary for upload/download |
| `exportInvoices.showSubmmit` | `false` | `setShowSubmit` | `ExportPrepare.jsx`, `ExportCustPrepare.jsx`, **and `ProformaPrepare.jsx` (cross-slice, bug)** | Gate for showing Submit button |
| `exportInvoices.loading` / `error` | `false` / `null` | `setExportInvoiceLoading` / `setExportInvoiceError` | list/prepare pages | Async status |
| `domesticInvoices.*` | `{listOfInvoices:[],loading:false,error:null}` | never | never | Declared, entirely unused — dead state |

### `ProformaInvoiceSlice.jsx` (`state.proformaInvoice`)

| State property | Initial value | Updated by | Used by | Purpose |
|---|---|---|---|---|
| `listOfProformaInvoice` | `[]` | `setListOfProformaInvoice`, cleared by `resetListOfDraftPI`/`resetMaster` | `ProformaList.jsx` | PI-mode list |
| `listOfDraftProforma` | `[]` | `setListOfDraftProforma`, cleared by `resetListOfDraftPI` | `ProformaList.jsx` | Draft-mode list |
| `loading` | `false` | `setLoading` | list fetch | Async status |
| `proformaDetails` | `{}` | `setProformaInvoiceDetails` (preserves user-entered `partNumber` across refetches) | `ProformaPrepare.jsx` | Raw DB detail record |
| `additionalForm` | `null` | `setAdditionalForm`, cleared by `resetProformaSubmit`/`handleResetToDatabase` | `ProformaPrepare.jsx` | Additional Details form output |
| `finalData` | `{}` | `setAdditionalForm` (merges `proformaDetails+additionalForm`) | `ProformaPDFViewer.jsx`, submit thunk | Submit/PDF-ready merged object |
| `submitLoading` / `submitSuccess` | `false` | `setSubmitLoading`, `setSubmitSuccess` | `ProformaPrepare.jsx` | Submit async status |
| `master` | `{}` | `setMaster` (from `getMasterData`) | `AdditionalDetailsForm.jsx` dropdowns, submit lookups | Reference/master data cache |
| `showPartNumber` | `false` | `setShowPartNumber` | `ProformaPrepare.jsx` items table | Toggles editable Part Number column |

### `PIMasterSlice.jsx` (`state.PIMaster`)

| State property | Initial value | Updated by | Used by | Purpose |
|---|---|---|---|---|
| `mode` | `"Draft Proforma Invoice"` | `setMode` — **never actually dispatched anywhere** | `PIMaster.jsx` animation direction only | Effectively dead — value never changes |
| `search` | `""` | `setSearch` — **never dispatched** | nothing found | Dead |
| `loading` | `false` | `setLoading` — never dispatched | nothing found | Dead |

**Store registration** (`src/Redux/Store/app.jsx`): `invoice` and `proformaInvoice` are both `persistReducer`-wrapped with `storage: storageSession` and an encryption transform (`VITE_REDUX_SECRET_KEY`). Full root-reducer key list: `global, invoice, proformaInvoice, auth, UserMaster, rimApplication, priceMaster, scanforinspection, PDIDispatchMaster, PPCMaster, PPCSubstitution, AssemblyProcessID, TyreProcessID, PDIFitmentMaster, PDIFitment, PIMaster, Project, CIMMaster, CIMBarcode, Sprint, warehouse, orderProcess, reportMaster, customerMaster, legalEntity`.

**Do different invoice types share Redux state?** Customer and Custom share the *same slice* but write to different top-level keys inside it (`invoiceCustDetails` vs `invoiceDetails`) — not truly shared, just co-located. Proforma and Draft share every state key in `ProformaInvoiceSlice` except the two separate list arrays. The Proforma Prepare page also incorrectly reads/writes two fields (`showSubmmit`, and unused `finalCustomerData`) that belong to `InvoiceSlice`, not `ProformaInvoiceSlice` (§20, cross-slice coupling bug).

---

## 16. Invoice Line Items

Confirmed fields (see §9.4 for the full list). **Add:** items are added to Custom Invoice only via the backend order payload (`invoiceDetails.items`) — there is no "add new line item" UI in any of the three flows; users only *split* (Custom) or annotate (`partNumber`, Proforma) existing items. **Remove:** no item-removal UI found in any flow. **Edit quantity/price:** not directly editable by the user in any Prepare screen — quantity/price come from the order and are only recomputed (never typed) except for the Custom split-quantity input, which creates a new sub-line via splitting rather than editing the original. **Duplicate items:** no de-duplication logic found. **Tax per line:** no per-line tax field found in any flow — GST (Proforma only) is computed at the invoice-total level, not per line.

---

## 17. Calculations

| Calculation | Formula | Where | Rounding |
|---|---|---|---|
| Total Qty | `Σ Number(item.itemQty)‖0` | All three flows | none |
| Grand/Total Price (tyre+rim) | `Σ (Number(basicprice/basicPrice)‖0 + Number(rimUnitPrice)‖0) * Number(itemQty)‖0` | Custom, Customer, Proforma — same formula, **4 independent implementations** | none at line level; `.toFixed()` at display |
| Total Weight | `Σ (Number(finishedWt)‖0 + Number(rimfinishedwt)‖0) * itemQty` | Custom, Customer, Proforma | `.toFixed(3/4)` in PDFs |
| Unit Price (Custom, per split invoice) | `grandTotal / totalwt` (guarded ÷0) | `setFinalInvoiceData`, `InvoiceSlice.jsx` | `.toFixed(5)` |
| Final Grand Total (Custom) | `grandTotal + charges1+charges2+charges3 - totalDiscount` | `setFinalInvoiceData` | — |
| Taxable Amount (Proforma) | `subtotal + totalCharges - totalDiscounts` | `ProformaPrepare.jsx`, `AdditionalDetailsForm.jsx` (×3), `ProformaPDF.jsx` — **4 independent copies** | — |
| GST Amount (Proforma) | `taxable > 0 ? round2(taxable * gstPercent/100) : 0`; `gstPercent` from IGST, or CGST+SGST, or backend-provided IGST/CGST+SGST depending on `gstCharges.type` | Same 4 locations | `round2` (2 decimals) |
| Grand Total DDP (Proforma) | `taxable + gstAmount` | Same locations | — |
| Total Gross Weight | `totalwt + palletWeight(if isPallet) + woodenBoxWeight(if isWoodenBox)` | `setFinalInvoiceData`/`SetupdatedInvoiceDetails` (Custom) | — |
| Total Gross Weight (Customer PDF) | `totalPalletWT + totalWoodenWT + totalWeight`, falls back to `data.grossWeight` if backend value present and `>0` | `InvoiceCustomerPacking.jsx` | `.toFixed(3)` |
| Total Loose Tyres | `max(0, totalQty - (palletTyres+woodenTyres))` | Both PDF calc paths | — |
| Amount in Words | `numberToWords(total, currency)` | `utils/NumberToWords.jsx`, used in all PDF templates | — |
| Round Off | **Not found** — no explicit round-off line item found in any flow (totals are decimal-formatted for display but not rounded to a "round off" adjustment field) | — | — |
| Outstanding/Paid/Balance amounts | **Not found / Cannot be verified from available source code** — no payment-tracking fields found anywhere in this module | — | — |

**Known calculation defects (see §31 for full list):** `InvoiceCustomerPDF.jsx`'s `totalPrice` formula computes `Number((item.basicprice + item.rimUnitPrice) * item.itemQty)` — if either operand is `undefined`, the whole expression is `NaN` and silently becomes `0` for that line (rather than treating the missing operand as 0), unlike the more defensive per-field `‖0` pattern used elsewhere.

---

## 18. Status Lifecycle

No formal single "invoice status" enum was found. The literal strings actually used as status-like flags are:

| Literal | Scope | Meaning |
|---|---|---|
| `"Direct_Invoice"` / `"Scheme_Invoice"` | Custom Invoice | Whether scheme-splitting UI is active |
| `"Direct"` / `"Advance"` / `"Moowr"` / `"Import Invoice"` / `"DDB"` | Custom Invoice | Duty/tax scheme per split sub-invoice |
| `"Custom"` / `"Customer"` | All (Export Invoice) | Which of the two parallel flows is active |
| `"PREPARED"` (`invoiceDetails?.status`) | Customer + Proforma Additional Details | Whether the invoice already exists server-side → read-only/capped fields |
| `"Draft"` / `"PI"` | Proforma | Which list/mode is active (router-carried, not a DB status) |
| `isDraft` (boolean, from API) | Proforma detail record | A second, independently-sourced Draft indicator used only for page-title text — may disagree with the `"Draft"/"PI"` router flag (§20) |
| `"PROFORMA INVOICE"` / `"DRAFT PROFORMA"` | Proforma submit payload | `piType` value sent to backend |

No `pending`/`approved`/`posted`/`cancelled`/`paid`/`unpaid` literals were found anywhere in this module. **Confirmed lifecycle we can state from the code:** an invoice record starts as *not-yet-prepared* → user fills Additional Details (locally, in Redux only) → Submit persists it → subsequent visits show it as `"PREPARED"`/`isPrepared` with certain fields locked. Anything beyond that (approval, posting, payment) is **Not found / Cannot be verified from available source code**.

---

## 19. Create Workflow

**Custom Invoice:** Open list (state.type="Custom") → `getExportInvoiceAll` → click row → `getExportInvoice` fetches order → `ExportPrepare.jsx` loads → user optionally splits items by scheme → fills Additional Details modal (`setExportAdditionalInvoice`) → `setFinalInvoiceData`/`SetupdatedInvoiceDetails` compute totals/PDF data → user clicks Preview PDF (`setShowSubmit(true)`) → reviews `PDFViewer.jsx` → back to Prepare, clicks Submit → `submitInvoice` → `POST /Invoice/CreatingInvoices` → on success, `uploadCustomInvoicePDF` (`POST /PdfUpload/Invoice/upload`) → toast success → navigate to list.

**Customer Invoice:** Same shape through Additional Details and PDF preview, but the final Submit → `submitCustomerInvoice` → **throws immediately due to a use-before-declare bug and never calls the (also-disabled) API** → user sees a generic failure toast. **This create workflow does not complete successfully today.**

**Proforma/Draft:** Tab select (Draft or PI) → `getListOfProformaInvoice` → click "Open" on a row → `getProformaInvoiceDetails` → `ProformaPrepare.jsx` loads → fills Additional Details modal (`setAdditionalForm`, purely local) → clicks Preview PDF (cross-slice `setShowSubmit(true)` from `InvoiceSlice`) → reviews `ProformaPDFViewer.jsx` → back, clicks "Finalize & Submit" → confirm dialog → `submitProformaInvoice(invoiceType)` → `POST /DraftPI/create_PI` or `create_DraftPI` depending on mode → on success, toast + navigate back.

---

## 20. View Workflow

All three flows "view" an existing record by clicking a list row's action button, which dispatches the detail-fetch thunk and navigates to the same Prepare component used for creation — **there is no separate read-only "View" page**; view and edit share the same UI, differentiated only by the `isPrepared`/`status==="PREPARED"` field-locking behavior described in §14.

---

## 21. Edit Workflow

Same component as Create/View. Editable-vs-locked fields are governed by `isPrepared` (Customer) / `status==="PREPARED"` (Proforma) — when true, invoice number, charge/discount totals (capped at DB max), and (Customer only) packing fields become read-only; other fields remain editable. Custom Invoice has no equivalent lock flag — the `isLocked` prop on its `SchemeRow` sub-component exists but is never passed a value, so nothing is ever actually locked in the Custom flow (§20 dead-code list, item repeated from research).

---

## 22. Delete / Cancel Workflow

**Not found / Cannot be verified from available source code.** No delete or cancel UI, button, or thunk was found anywhere in the Customer, Custom, or Proforma/Draft flows.

---

## 23. PDF / Print / Export

| Flow | Viewer route | Templates | Pagination | Notable fields |
|---|---|---|---|---|
| Custom (default) | `Invoice/Export/BillPDF` | `InvoiceExportPDF.jsx` (single combined page) | n/a (one invoice per page) | "CONFIDENTIAL" watermark; title varies by scheme; hardcoded fallback text for Ref Date/Other Reference (§31) |
| Custom (Sri Lanka: `containerLoadFrom` SITL/SLTL) | same route, template swapped | `LankaCustomPDF.jsx` + `LamkaCustomPackingPDF.jsx` (2 pages) | items chunked | Page-number footer (absent from other templates); "FOR SUNDARAM LANKA TYRES LIMITED" signatory (inconsistent with other templates, §31) |
| Customer | `Invoice/Customer/BillPDF` | `InvoiceCustomerPDF.jsx` + `InvoiceCustomerPacking.jsx` (always 2 pages) | `ITEMS_PER_PAGE=20` | "FOR SUNDARAM LANKA PRIVATE LIMITED" signatory (else-branch text differs from Custom's Lanka template) |
| Proforma (Draft or PI) | `Invoice/ProformaInvoice/PDF` | `ProformaPDF.jsx` (1 template, shared) | `ITEMS_PER_PAGE=25`, grouped by `tyreType` | Document body always says "PROFORMA INVOICE" even in Draft mode; GST row shown when applicable |

Common sections across templates: Exporter/company block, Buyer/Consignee, Ship To, Notify Party (conditional), logistics fields (pre-carriage, port, container), item table, subtotal/charges/discounts, grand total, amount in words, payment terms, bank details, declaration boilerplate, signatory block. **No QR code or barcode was found in any PDF template.** **No email/export-to-Excel/CSV functionality was found anywhere in this module** — the only "export" is the PDF blob download/upload flow.

---

## 24. Permissions and Roles

| Mechanism | File | Behavior |
|---|---|---|
| Route guard | `ProtectedRoutes.jsx` + `routePermissions.js` | Maps specific paths (`ExportCustomerInvoice`→`/TTS/International/Invoice/CustomerInvoice`, `ExportCustomInvoice`→`.../CustomInvoice`) to a required `MenuName`; `roleID===1` (admin) bypasses; else checks `state.auth.Menus` for a matching `MenuName`; unauthenticated → redirect to `/login`; unauthorized → `<ProtectedPage/>` |
| List-page toggle gate | `ExportInvoicePage.jsx` L109-139 | Ad-hoc local `hasAccess` (not the shared `menuAccess.js` helper) checks `Menus.some(menu.menuName === requiredMenu)` before allowing the Customer/Custom toggle to switch |
| Proforma tab gate | `Header.jsx` `hasPermission` | Admin bypass; else `auth.Menus` checked against each tab's `menuName` or `menuUrl` |
| Sidebar menu filtering | `SideBar.jsx` via `menuAccess.js`'s `hasAccess` | Admin (`roleID===1`) sees full menu; otherwise per-leaf filtering |

**No create/edit/delete/approve/print/export-specific permission keys exist** — only *which invoice type/tab a user can see* is gated; once inside a Prepare page, all actions (edit, submit, preview PDF) are available to anyone who reached it.

---

## 25. External Module Dependencies

| Dependency | Source | Used for |
|---|---|---|
| `auth.Menus` | `AuthSlice.jsx` (login response `data.menus`) | Permission gating throughout |
| `utils/currencies.js` | local util | `getCurrency`/`getCurrencySymble` display formatting |
| `utils/NumberToWords.jsx` | local util | Amount-in-words on all PDFs |
| `utils/HSNCODE.js` | local util | Imported by `InvoiceSlice.jsx` (not traced further — usage inside the slice not confirmed beyond the import) |
| Order/Sales data | `/Invoice/GettingSpecific...Orders` endpoints (external backend) | Source of customer, address, item, and shipment data for Customer/Custom invoices — **no Customer Master, Product Master, or other frontend "Master" module code is imported by this module**; all master-like data for Customer/Custom comes pre-joined from the order-detail API |
| Proforma master data | `/DraftPI/GettingDraftPIMaster` | Transport modes, container types, packing methods, exporter addresses/banks, incoterms, lead times |

No import of `src/pages/Masters/**` (Customer Master, Product Master, Legal Entity Master, etc.) was found anywhere in the analyzed Invoice files — all such data is consumed indirectly via the order/master API responses, not via shared frontend Master-data components.

---

## 26. Business Rules

### Confirmed (directly implemented in code)

- A split quantity in Custom Invoice must be greater than 0, less than the item's original quantity, a whole number, and paired with a non-`"Direct"` scheme (`ExportPrepare.jsx` `handleSplitItem`).
- Once an invoice is `"PREPARED"`/`isPrepared`, its invoice number and packing fields (Customer) become read-only, and additional charges cannot exceed the amount already recorded in the database (`dbMaxTotal`).
- Exchange Currency is required on the Custom Additional Details form only when the order's currency is not INR.
- A non-Direct scheme (other than Import Invoice/DDB) requires a License Number and License Date before the Additional Details form can be saved.
- The Customer/Custom toggle and the Proforma Draft/PI tabs are hidden or blocked if the user's menu permissions don't include the corresponding menu name.
- Submission of a Proforma Invoice always creates a brand-new record (`draftPI_Id: 0`) — there is no update-existing-draft path.

### Possible / Unclear (behavior appears intended but not conclusively verified)

- Whether `isPrepared`/`status==="PREPARED"` is meant to represent "already submitted to backend" specifically, versus some other backend workflow state, cannot be confirmed without backend/DB source.
- Whether `draftPI_Id: 0` always creating a new record is intentional (i.e., editing a Draft always produces a new backend row) or a latent bug is **not verifiable** without backend source — flagged here as a business-rule ambiguity worth confirming with whoever owns the `/DraftPI` backend.
- Whether Customer Invoice submission being non-functional (§3.1) is a known, in-progress feature (backend not yet built) or a regression is **not determinable from the frontend code alone**.

---

## 27. Error Handling

**Global (axios response interceptor, `src/utils/axios.jsx`):** `401` → toast "Session expired", clears storage, dispatches logout, redirects to `/login`. `403` → toast "no permission" only. `408` → same full logout sequence as 401. `400` → toast built from `error.response.data.errors` or `.message`. `500+` → generic "Server error" toast. All other statuses fall through unhandled by the interceptor.

**Per-module:** Both `InvoiceSlice` and `ProformaInvoiceSlice` thunks catch errors and either `toast.error(...)` (most Invoice thunks) or only `console.error`/`console.log` (most Proforma thunks — `getListOfProformaInvoice`, `getMasterData` show no user-facing error feedback at all). No retry logic, no timeout-specific handling beyond the interceptor's 408 case, found anywhere in this module.

---

## 28. Performance Analysis

- List pages (`ExportInvoicePage.jsx`, `ProformaList.jsx`) filter/search entirely client-side over already-fetched full lists — no server-side pagination/search params were found; `ProformaList.jsx` additionally implements a manual "load more" (`visibleRows`, default 50) on top of the full client-side dataset.
- Calculation logic (subtotal/GST/weight totals) is duplicated 3-4 times per concept across component and PDF files rather than memoized/shared once — same math re-runs independently in the Prepare page, the Additional Details form, and the PDF template.
- PDF generation is done fully client-side via `@react-pdf/renderer`, including a `pdf(...).toBlob()` call before every upload — no evidence of caching generated PDFs.
- `AdditionalDetailsForm.jsx` (root, Custom) has an unguarded `console.log(invoiceFinalData[0].usercurrency === "INR")` that runs on every render before data may exist — a correctness/perf-adjacent risk (crashes on empty array), not merely a stray log.
- No obvious `useEffect` infinite-loop or duplicate-fetch patterns were flagged by the research beyond the dead/no-op `PIMasterSlice` dispatch attempts.

---

## 29. Shared vs Invoice-Specific Logic

| Feature | Customer Invoice | Custom Invoice | Proforma Invoice | Draft (mode) |
|---|---|---|---|---|
| Shared Component | List page (`ExportInvoicePage.jsx`), `ExportTable`/`TableSkeleton` | same | own (`PIMaster`/`Header`/`ProformaList`) | 100% shared with Proforma |
| Shared Redux | `InvoiceSlice.jsx` (different keys) | same slice | `ProformaInvoiceSlice.jsx` | same slice as PI |
| Shared API | `/Invoice/*Cust*` (own endpoints) | `/Invoice/*` (own endpoints) | `/DraftPI/*` (own endpoints) | same endpoints family, different action (`create_DraftPI`) |
| Shared Calculation | Formula shared conceptually with Custom, re-implemented independently | same formula, own implementation | own GST-aware formula, duplicated 4× internally | identical to PI (same components) |
| Shared Validation | Own react-hook-form rules + DB-max cap | Own react-hook-form rules + scheme-conditional requirements | Own react-hook-form rules + GST range checks | identical to PI |
| Shared PDF | Own 2-page template pair | Own template(s), Lanka variant | Own single template | identical to PI (title text unaffected by mode) |
| Unique Fields | `isPrepared`/DB-max charge cap, no scheme concept | scheme splitting, Combi grouping, sequential per-split invoice numbers | GST type selector (IGST/CGST_SGST/BACKEND), master-data-driven dropdowns | none beyond the mode flag itself |
| Unique Workflow | Submit is broken (non-functional) | Full split → additional details → submit → auto-PDF-upload | Two create endpoints selected by mode flag; no conversion step | Reuses PI workflow entirely |

**Duplicated code, not shared:** `ClientDetailsSection` (3 copies), the subtotal/(basicprice+rimUnitPrice)*qty formula (4+ copies across flows), the GST taxable/amount formula (4 copies within Proforma alone), and the entire "Additional Details" modal pattern (3 independent ~1300-1900 line implementations with different field-naming conventions: `${scheme}_field` vs `${schemeName}_${index}_field`).

---

## 30. Complete Invoice Data Flow

```text
Order/Sales record (external backend, via /Invoice/GettingSpecific...Orders or /DraftPI/GettingDraftPIReadySpecificOrders)
   ↓
React state (useState locals: localItems/splitItems, searchQuery, etc.) + React Hook Form (Additional Details modals)
   ↓
Handler (handleSplitItem, onSubmit of Additional Details forms)
   ↓
Transformation (splitInvoiceByScheme, setFinalInvoiceData / SetupdatedInvoiceDetails / setAdditionalForm — per-flow reducers)
   ↓
Redux state (InvoiceSlice.exportInvoices.* or ProformaInvoiceSlice.*)
   ↓
API service (submitInvoice / submitCustomerInvoice[broken] / submitProformaInvoice — hand-written thunks, not createAsyncThunk)
   ↓
HTTP request (axios `api` instance, withCredentials, baseURL=VITE_BASE_URL)
   ↓
Backend controller/service/DB — NOT PRESENT IN THIS REPOSITORY (external system)
```

---

## 31. Technical Debt / Potential Issues

1. **Customer Invoice submission is non-functional.** `submitCustomerInvoice` (`InvoiceSlice.jsx`) references `data` before its `const data = {...}` declaration (~L1372 vs L1393), guaranteeing a `ReferenceError` on every call; separately, the real `POST /Invoice/CreatingCustomerInvoice` call and success handling are commented out (L1541-1555). **Impact: High** — the entire Customer Invoice create flow cannot complete.
2. **Cross-slice coupling bug in Proforma Prepare.** `ProformaPrepare.jsx` reads/writes `showSubmmit` and imports `setFinalCustomerData`/`submitCustomerInvoice` from `InvoiceSlice` (the unrelated Customer/Custom feature) instead of `ProformaInvoiceSlice`. The Proforma "can submit" gate is keyed off state belonging to a different feature, and that state is never cleaned up when leaving the Proforma page. **Impact: Medium–High** — stale cross-feature state could allow/deny Submit incorrectly depending on prior navigation.
3. **Search-box dispatch bug in Proforma `Header.jsx`.** `onChange={e => diapatch(setSearchQuery(e.target.value))}` dispatches the return value of a plain `useState` setter (`undefined`) to Redux instead of calling `setSearchQuery` directly or dispatching the slice's own unused `setSearch` action. **Impact: Medium** — likely throws or silently no-ops on every keystroke in the Proforma search box; needs live verification.
4. **`PIMasterSlice`'s `mode`/`setMode` wiring is entirely dead** — passed as an unused prop through two components, never dispatched, so the tab-slide "mode" never changes from its default. **Impact: Low** (cosmetic animation only).
5. **Company/signatory name inconsistency across PDF templates**: "FOR SUNDARAM LANKA PRIVATE LIMITED" (`InvoiceExportPDF.jsx`, `InvoiceCustomerPDF.jsx`, `InvoiceCustomerPacking.jsx`) vs "FOR SUNDARAM LANKA TYRES LIMITED" (`LankaCustomPDF.jsx`, `LamkaCustomPackingPDF.jsx`). **Impact: Medium** — legal/compliance-facing document text disagrees between templates for the same legal entity.
6. **Hardcoded stale placeholder values used as production fallbacks**: `"E MAIL DATE 29th AUG-24"`, `"SDF Form"` (`InvoiceExportPDF.jsx`), `"Handle with care"` / `"Urgent delivery required"` / `"Wooden Crates"` (all `ClientDetailsSection` copies), `"KAJA MOIDEEN"` avatar fallback and "Premium Account" label (Proforma `ClientDetailsSection.jsx`). **Impact: Low–Medium** — could leak into a real customer-facing PDF if the real field is ever empty.
7. **Broken fallback navigation**: `PDFViewer.jsx` redirects to `/TTS/International/Invoice/ExportInvoice` when `FinalInvoicePDFData` is missing — this route does not exist in `Router.jsx` (real routes are `Invoice/CustomInvoice`/`Invoice/CustomerInvoice`). **Impact: Low** — broken edge-case redirect.
8. **Rules-of-Hooks violation** in `CustomerPDFViewer.jsx` — a conditional early return occurs before a `useEffect` call. **Impact: Medium** — risk of React warning/crash under Strict Mode or with certain render-order changes.
9. **Unguarded array-index access** in `AdditionalDetailsForm.jsx` (root, Custom): `invoiceFinalData[0].usercurrency` without optional chaining (L44, L794) — throws if the array is empty on initial render. **Impact: Medium.**
10. **Duplicated ~4x GST/taxable-amount calculation logic** in the Proforma flow, and duplicated ~4x subtotal formula across all three flows — no shared calculation utility. **Impact: Medium** — real risk of the formulas drifting out of sync over time (already slightly different precedence order between `AdditionalDetailsForm.jsx`'s `onSubmit` and `ProformaPDF.jsx`'s main component).
11. **Three independent `ClientDetailsSection` implementations** (inline in `ExportPrepare.jsx`, `Customer Invoice/ClientDetailsSection.jsx`, `Proforma Invoice/ClientDetailsSection.jsx`) with near-identical markup. **Impact: Low–Medium** — maintenance burden, no functional bug per se.
12. **Dead imports and dead code**: `ExportCustPrepare.jsx` imports six Custom-only actions it never uses; `isSplitValid` in `ExportPrepare.jsx` is defined but never called; `setExportInvoiceCustlist`/`ListOfCustInvoice` reducer/field pair is written but never read; `authorizedSignatory`/`footer` computed fields in `SetupdatedInvoiceDetails` (with a "SUNDHARAM" typo) are never consumed by any PDF; `uploadCustomerInvoicePDF` thunk is unreachable from any live code path; large commented-out logic blocks remain in `ExportPrepare.jsx` (L825-862) and `ProformaPDFViewer.jsx` (L25-39). **Impact: Low** — maintainability/clarity debt, not functional bugs.
13. **No fallback when `location.state` is missing** on the Customer/Custom list page (`ExportInvoicePage.jsx`) — a hard refresh or bookmarked URL leaves `state.type` undefined and no invoices load, with the heading literally rendering "Export undefined Invoice". **Impact: Medium** — real UX break on refresh.
14. **`LankaCustomPDF.jsx` SHIP TO section** mixes fields from a nested object (`data.buyerIfOtherThanConsignee`) with top-level fields (`data.shippingContactName` etc.) that don't appear to exist in that shape based on how `SetupdatedInvoiceDetails` builds the data — likely renders blank. **Impact: Medium**, unverified without live data.
15. **Filename/identifier typo**: `LamkaCustomPackingPDF.jsx` ("Lamka" instead of "Lanka"). **Impact: Cosmetic.**
16. **No delete/cancel workflow found in any of the three flows** — if intended to exist, it is either not yet implemented or lives entirely on a backend not present in this repo. **Impact: Unknown**, flagged for product/backend-owner confirmation.
17. **Prototype/demo pages left routed in production** (`ShippingSchemeSplitTailwind.jsx`, `SampleSplit.jsx`) with hardcoded dummy data, reachable via direct URL even though not linked from any UI. **Impact: Low** — dead-code/surface-area cleanup candidate.

---

## 32. Master Field Inventory

This inventory consolidates the field-level tables from §9 into one list of every distinct field name encountered, avoiding re-printing per-scheme dynamic-key variants already fully enumerated in §9.

| # | Field | Invoice Type(s) | Location | Source | Notes |
|---|---|---|---|---|---|
| 1 | `invoiceNumber` | Customer, Custom | Additional Details form | user input / DB | Read-only once prepared |
| 2 | `orderRefNo` | All | order record | API | Also used as `BuyersOrderNumber` default |
| 3 | `custFullName` / `billingCompanyName` | All | order record | API | Customer display name |
| 4 | `billingAddress/City/Zipcode/Country/ContactName/EmailId/Mobile` | All | order record | API | Billing block |
| 5 | `shippingCompanyName/Address/City/State/Country/Zipcode/ContactName/EmailId/Mobile` | All | order record | API | Shipping block |
| 6 | `notifyPartyName/Email/Phone/City/State/Country/Address/Zipcode` | All | Additional Details form | user/API | Optional |
| 7 | `preCarriageBy` | All | Additional Details form | select | Required in Custom & Proforma |
| 8 | `placeOfReceiptByPreCarrier` | Customer, Custom | Additional Details form | select | Dead field in Proforma (no input rendered) |
| 9 | `vesselFlightNo` | Customer, Custom | Additional Details form | text | |
| 10 | `billOfLadingNo` | Customer, Custom | Additional Details form | text | |
| 11 | `portOfLoading` / `portOfDischarge` | Customer, Custom | Additional Details form | text | Dead in Proforma |
| 12 | `finalDestination` | All | Additional Details form | text | |
| 13 | `countryOfFinalDestination` / `countryOfDestination` | Customer, Custom | Additional Details form | text/select | |
| 14 | `containerType` | All | Additional Details form | select | |
| 15 | `containerNo` / `containerSEALNO` | Customer, Custom | Additional Details form | text | |
| 16 | `packingMethod` | Proforma | Additional Details form | select | |
| 17 | `exportAuthorisedAddress` / `exporterAuthorizedAddress` | All | Additional Details form | select | Naming differs by flow |
| 18 | `countryOfOriginOfGoods` | Customer, Custom | Additional Details form | select | |
| 19 | `otsNo` | Customer, Custom | Additional Details form | text | |
| 20 | `BuyersOrderNumber` | All | Additional Details form | text | Default from `orderRefNo` |
| 21 | `incoterm` | All | Additional Details form | select | Required in Custom & Proforma |
| 22 | `placeOfIncoterm` | All | Additional Details form | text | Required in Custom & Proforma |
| 23 | `ExchangeCurrency` | Customer, Custom | Additional Details form | text | Currency-conditional required in Custom |
| 24 | `paymentTerms` | All | Additional Details form | textarea | Required in Custom & Proforma |
| 25 | `bankDetails` | All | Additional Details form | textarea/select | Manual in Customer/Custom, master-driven select in Proforma |
| 26 | `additionalCharges[]` / `otherCharges1-3` | All | Additional Details form | dynamic rows / fixed slots | Calculated totals |
| 27 | `discountDetails[]` / `discount1-3` | All | Additional Details form | dynamic rows / fixed slots | Calculated totals |
| 28 | `${scheme/schemeKey}_isPallet/_palletCount/_numberOfTyres/_palletWeight/_palletDimension` | Customer, Custom | Additional Details form | user input | Balance-validated |
| 29 | `${scheme/schemeKey}_isWoodenBox/_woodenBoxCount/_woodenBoxTyres/_woodenBoxWeight/_woodenBoxDimension` | Customer, Custom | Additional Details form | user input | Balance-validated |
| 30 | `${scheme}_number` / `_date` (license) | Custom | Additional Details form | user input | Required by scheme |
| 31 | `igstlut` / `IGSTLUT` | Customer, Custom | Additional Details form | text | |
| 32 | `invoice_Details` | Customer, Custom | Additional Details form | textarea | |
| 33 | `rexNumber` / `REXNumber` | Customer, Custom | Additional Details form | text/textarea | |
| 34 | `gstCharges.type/igst/cgst/sgst/percentage/amount` | Proforma | Additional Details form | select/number | GST computation |
| 35 | `leadTime` | Proforma | Additional Details form | select | Required |
| 36 | `validityDate` | Proforma | Additional Details form | date | Required |
| 37 | `Date` / `EmailDate` | Proforma | Additional Details form | date | Required |
| 38 | `revisionNumber` / `revisionDate` | Proforma | Additional Details form | text/date | Optional |
| 39 | `custInstruction` | Proforma | Additional Details form | textarea | Remarks |
| 40 | `invoiceType` | Custom (`"Direct_Invoice"`/`"Scheme_Invoice"`), Proforma (`"PI"`/`"Draft"`) | Prepare page state / router state | user toggle / navigation | Different meaning per flow — see §18 |
| 41 | `scheme` | Custom | item-level, split UI | user selection | `Direct/Advance/Moowr/Import Invoice/DDB` |
| 42 | `splitQty` | Custom | split UI | user input | Validated |
| 43 | `status` | Proforma | order/DB record | API | Only confirmed literal: `"PREPARED"` |
| 44 | `isDraft` | Proforma | order/DB record | API | Independent of router `invoiceType` flag |
| 45 | `showPartNumber` / `partNumber` | Proforma | Redux / items table | user toggle+input | Editable line-item annotation |
| 46 | `itemCode`, `platforms`, `category`, `tyreSize`, `tyreRim`, `tyreType`, `brand`, `sidewall`, `hsnCode` | All | item record | API | Line item descriptors |
| 47 | `itemQty` | All | item record | API | Line item quantity |
| 48 | `basicprice`/`basicPrice`, `rimUnitPrice` | All | item record | API | Line item pricing |
| 49 | `finishedWt`, `rimfinishedwt` | All | item record | API | Line item weight |
| 50 | `rimStatus`/`assyRimstatus` | All | item record | API | Rim-assembly flag, drives description text |
| 51 | `plant`, `shipmentType` | Custom (Combi) | order record | API | Drives Combi grouping |
| 52 | `containerLoadFrom` | All PDFs | order record | API | Drives legal-entity text and Lanka template selection |
| 53 | `usercurrency`/`userCurrency` | All | order record | API | Currency display/formatting |
| 54 | `pdfBlob` | Customer, Custom | Redux (generated) | client-computed | PDF binary for upload/download |
| 55 | `amountInWords` | All | client-computed | `numberToWords()` | PDF display only |

Fields already fully enumerated per-scheme/per-flow in §9 (e.g., every dynamic `${schemeName}_${index}_...` variant in the Customer Additional Details form) are represented above by their canonical name rather than repeated per index/scheme to keep this table usable — §9 remains the authoritative exhaustive listing for those.

---

## 33. Invoice Type Comparison

See §29 for the full shared-vs-specific matrix and §3.1/§3.2/§3.3/§3.4 for the narrative per-type comparison, and §19-§20 (in this document, "Summary table" content from research) for the detailed Customer-vs-Custom differences table reproduced here:

| Aspect | Customer Invoice | Custom Invoice |
|---|---|---|
| List/landing page | `ExportInvoicePage.jsx` (shared) | same |
| Prepare page | `ExportCustPrepare.jsx` | `ExportPrepare.jsx` |
| Redux data slot | `invoiceCustDetails` | `invoiceDetails` |
| Fetch API | `GettingSpecificCustOrders/{id}` | `GettingSpecificOrders/{id}` |
| List API | `GettingCustInvoiceReadyOrders` | `GettingInvoiceReadyOrders` |
| Scheme splitting | None | Full split UI |
| Additional Details form | `isPrepared` read-only + DB-max cap + "Reset to DB" | HSN-by-scheme chips + currency-conditional required Exchange Rate |
| Final data reducer | `setFinalCustomerData` (simple merge) | `setFinalInvoiceData` + `SetupdatedInvoiceDetails` (heavy) |
| Submit thunk | `submitCustomerInvoice` — **broken** | `submitInvoice` — fully wired |
| PDF template(s) | Always 2 pages (Customer templates) | 1 page (default) or 2 pages (Sri Lanka) |
| Permission key | `ExportCustomerInvoice` | `ExportCustomInvoice` |

---

## 34. Summary

The requested "Invoice module" resolves to three real, independently-built workflows sharing a folder and, in two cases, a Redux slice: **Customer Invoice**, **Custom Invoice**, and **Proforma Invoice** (which internally has a **Draft mode**, not a fourth type). The three workflows do not share a common component library, calculation utility, or validation schema — each reimplements the same conceptual pieces (client details card, subtotal formula, additional-charges form) independently, which is the module's dominant maintainability risk (§29, §31). Functionally, the Custom Invoice and Proforma Invoice create flows are wired end-to-end to a backend that is not part of this repository; the Customer Invoice create flow is not functional as currently committed. No backend, database, or stored-procedure source exists in this repository, so all backend/DB sections of this document report the frontend-observed API contract only, not verified server behavior.

---

*This document was produced by direct source-code inspection (three research passes over the files listed at the top) with file:line evidence gathered during analysis. Line numbers are approximate anchors as of 2026-08-18 and will drift with future edits — always confirm against current source before relying on an exact line number.*
