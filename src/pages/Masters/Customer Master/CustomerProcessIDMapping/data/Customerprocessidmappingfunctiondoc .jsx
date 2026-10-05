import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

// ============================================================================
// Customer Process ID Mapping — Functional Document
// Single-file React component. Mirrors the published docs-site artifact:
// sticky sidebar with scrollspy, styled code blocks, ASCII flow diagrams,
// tables, and stat cards. Tailwind for styling, Framer Motion only for the
// page's one load-in moment and the mobile sidebar slide.
// ============================================================================

const NAV = [
  { id: "s1", num: "01", label: "Overview" },
  { id: "s2", num: "02", label: "Architecture overview" },
  { id: "s3", num: "03", label: "Data flow & workflows" },
  { id: "s4", num: "04", label: "Redux slices & API" },
  { id: "s5", num: "05", label: "Component hierarchy" },
  { id: "s6", num: "06", label: "Business logic & rules" },
  { id: "s7", num: "07", label: "Table operations" },
  { id: "s8", num: "08", label: "Stats & metrics" },
  { id: "s9", num: "09", label: "Error handling" },
  { id: "s10", num: "10", label: "Performance" },
  { id: "s11", num: "11", label: "Data structures" },
  { id: "s12", num: "12", label: "User workflows" },
  { id: "s13", num: "13", label: "UI patterns" },
  { id: "s14", num: "14", label: "Testing scenarios" },
  { id: "s15", num: "15", label: "Future enhancements" },
  { id: "s16", num: "16", label: "Related files" },
];

// ---------------------------------------------------------------------------
// Small reusable presentation pieces — kept in this file since the content
// they wrap (code, ASCII diagrams, tables, flow lists) repeats constantly
// throughout the document and each is a couple of lines of markup.
// ---------------------------------------------------------------------------

const Code = ({ children }) => (
  <pre className="my-3.5 overflow-x-auto rounded-lg border border-slate-800 bg-[#12151A] p-4 text-[12.5px] leading-relaxed text-slate-200">
    <code className="font-mono whitespace-pre">{children}</code>
  </pre>
);

// Inline span helpers so code samples read with muted comments / teal
// strings / amber keywords, matching the published doc's highlighting.
const Cm = ({ children }) => <span className="text-slate-500">{children}</span>;
const St = ({ children }) => <span className="text-teal-300">{children}</span>;
const Ky = ({ children }) => <span className="text-amber-400">{children}</span>;

const Ascii = ({ children }) => (
  <pre className="my-3.5 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-[11.5px] leading-snug text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
    {children}
  </pre>
);

const Callout = ({ children }) => (
  <div className="my-4 rounded-md border border-slate-200 border-l-[3px] border-l-teal-600 bg-white p-3.5 text-[13.5px] text-slate-600 dark:border-slate-700 dark:border-l-teal-500 dark:bg-slate-800 dark:text-slate-300">
    {children}
  </div>
);

const Pill = ({ tone = "good", children }) => {
  const styles = {
    good: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warn: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11.5px] ${styles[tone]}`}>
      {children}
    </span>
  );
};

const FlowSteps = ({ steps }) => (
  <div className="my-4 flex flex-col">
    {steps.map((s, i) => (
      <div
        key={i}
        className={`flex gap-3.5 py-3 ${i < steps.length - 1 ? "border-b border-dashed border-slate-200 dark:border-slate-700" : ""}`}
      >
        <div className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-teal-50 font-mono text-[11px] text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          {i + 1}
        </div>
        <div>
          <p className="m-0 text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{s.title}</p>
          {s.body && <p className="m-0 text-[13.5px] text-slate-500 dark:text-slate-400">{s.body}</p>}
        </div>
      </div>
    ))}
  </div>
);

const FieldList = ({ rows }) => (
  <div className="flex flex-col">
    {rows.map(([k, v], i) => (
      <div
        key={i}
        className={`grid grid-cols-1 gap-1 py-2.5 text-[13.5px] sm:grid-cols-[180px_1fr] sm:gap-3.5 ${
          i < rows.length - 1 ? "border-b border-slate-200 dark:border-slate-700" : ""
        }`}
      >
        <div className="font-mono text-[12.5px] text-slate-800 dark:text-slate-100">{k}</div>
        <div className="text-slate-500 dark:text-slate-400">{v}</div>
      </div>
    ))}
  </div>
);

const DataTable = ({ head, rows }) => (
  <div className="my-3.5 overflow-x-auto">
    <table className="w-full border-collapse text-[13.5px]">
      <thead>
        <tr>
          {head.map((h, i) => (
            <th
              key={i}
              className="border-b border-slate-200 px-3 py-2 text-left text-[11.5px] font-semibold text-slate-400 dark:border-slate-700 dark:text-slate-500"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td
                key={j}
                className={`border-b border-slate-100 px-3 py-2.5 align-top dark:border-slate-800 ${
                  j === 0
                    ? "font-mono text-[12.5px] text-slate-800 dark:text-slate-100"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StatCard = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-800">
    <div className="mb-1 text-[11.5px] text-slate-400 dark:text-slate-500">{label}</div>
    <div className="font-mono text-xl font-semibold text-slate-900 dark:text-slate-100">{value}</div>
  </div>
);

const Section = ({ id, num, title, children }) => (
  <section id={id} className="scroll-mt-8 border-t border-slate-200 pt-12 first:border-t-0 first:pt-0 dark:border-slate-700">
    <div className="mb-2 flex items-baseline gap-3.5">
      <span className="shrink-0 rounded bg-teal-50 px-1.5 py-0.5 font-mono text-[12.5px] text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
        {num}
      </span>
      <h2 className="m-0 text-[22px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h2>
    </div>
    {children}
  </section>
);

const H3 = ({ children }) => (
  <h3 className="mb-2.5 mt-7 text-[16px] font-semibold text-slate-900 dark:text-slate-100">{children}</h3>
);
const H4 = ({ children }) => (
  <h4 className="mb-2 mt-5 text-[13.5px] font-semibold text-slate-500 dark:text-slate-400">{children}</h4>
);
const P = ({ children }) => (
  <p className="my-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>
);
const Mono = ({ children }) => (
  <span className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
    {children}
  </span>
);

// ============================================================================
// Main component
// ============================================================================

export default function CustomerProcessIDMappingFunctionDoc() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("s1");
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const navLinkClass = (id) =>
    `flex items-baseline gap-2.5 rounded-md px-3 py-[7px] text-[13px] leading-snug transition-colors ${
      activeId === id ? "bg-teal-500/15 text-teal-50" : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center gap-2.5 border-b border-slate-800 bg-slate-950 px-4 py-3 text-white lg:hidden">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10"
          aria-label="Open menu"
        >
          <Menu size={16} />
        </button>
        <span className="text-[13.5px] font-medium">Customer Process ID Mapping — Functional Document</span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ x: menuOpen ? 0 : undefined }}
          className={`fixed inset-y-0 left-0 z-50 w-[280px] -translate-x-full overflow-y-auto border-r border-slate-800 bg-slate-950 pb-10 pt-7 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-[288px] lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : ""
          }`}
        >
          <div className="mb-3.5 border-b border-slate-800 px-6 pb-5">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-700/50 bg-teal-500/10 px-2 py-0.5 font-mono text-[10.5px] text-teal-400">
              ● v2.0 — Functional Doc
            </span>
            <h1 className="mb-1.5 text-[16.5px] font-semibold leading-snug text-slate-50">
              Customer Process ID Mapping
            </h1>
            <p className="m-0 text-[12px] leading-relaxed text-slate-500">
              Full component flow &amp; architecture reference for the mapping module.
            </p>
          </div>
          <nav className="flex flex-col gap-0.5 px-3">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setMenuOpen(false)}
                className={navLinkClass(n.id)}
              >
                <span className="w-4 shrink-0 font-mono text-[10.5px] text-slate-500">{n.num}</span>
                {n.label}
              </a>
            ))}
          </nav>
        </motion.aside>

        {/* Backdrop for mobile sidebar */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-[800px] px-6 py-14 sm:px-8"
          >
            {/* Header */}
            <div className="mb-12">
              <div className="mb-3.5 font-mono text-[12px] text-teal-600 dark:text-teal-400">
                Functional document · Customer Master
              </div>
              <h1 className="mb-3.5 text-[32px] font-semibold leading-[1.18] tracking-tight text-slate-900 dark:text-slate-50">
                Customer Process ID Mapping
              </h1>
              <p className="mb-5 max-w-[64ch] text-[15.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                Links a customer's own item naming convention to your internal Process ID — per ship-to address —
                so barcode printing, order entry, and support all resolve to the same physical item regardless of
                whose vocabulary is in use.
              </p>
              <div className="flex flex-wrap gap-5 border-t border-slate-200 pt-4.5 dark:border-slate-700">
                <div>
                  <div className="mb-0.5 text-[12.5px] text-slate-400 dark:text-slate-500">Version</div>
                  <div className="font-mono text-[12.5px] text-slate-800 dark:text-slate-200">2.0</div>
                </div>
                <div>
                  <div className="mb-0.5 text-[12.5px] text-slate-400 dark:text-slate-500">Module</div>
                  <div className="font-mono text-[12.5px] text-slate-800 dark:text-slate-200">
                    Customer Process ID Mapping
                  </div>
                </div>
                <div>
                  <div className="mb-0.5 text-[12.5px] text-slate-400 dark:text-slate-500">Location</div>
                  <div className="font-mono text-[12.5px] text-slate-800 dark:text-slate-200">
                    src/pages/Masters/Customer Master/CustomerProcessIDMapping/
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              {/* 01 Overview */}
              <Section id="s1" num="01" title="Overview">
                <P>
                  The Customer Process ID Mapping module allows users to create, manage, and bulk-import mappings
                  between internal Process IDs and customer-specific item codes. A mapping links a customer's
                  internal naming convention to your organization's Process ID (for tyres, assemblies, or rims) at
                  specific ship-to addresses.
                </P>
                <H3>Business purpose</H3>
                <ul className="my-3 list-disc pl-5 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                  <li>Standardize communication between your organization and customers</li>
                  <li>Support multiple customers with different naming conventions</li>
                  <li>Enable barcode printing based on customer item codes</li>
                  <li>Track specifications (brand, tyre size, platform, etc.) per mapping</li>
                  <li>Bulk import via Excel for efficiency</li>
                </ul>
                <H3>Key stakeholders</H3>
                <FieldList
                  rows={[
                    ["Sales / Customer Service", "manage per-customer mappings"],
                    ["Operations", "print barcodes and ship items correctly labeled"],
                    ["Supply Chain", "track item variants across customers"],
                  ]}
                />
              </Section>

              {/* 02 Architecture */}
              <Section id="s2" num="02" title="Architecture overview">
                <H3>Component structure</H3>
                <Ascii>{`CustomerProcessIDMapping (Main Container)
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
└── ProtectedRoutes (Permission checks)`}</Ascii>

                <H3>State management architecture</H3>
                <Ascii>{`Redux Store (CIMMaster + CIMBarcode)
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
└── mappingDrawer: { open, mode, record }`}</Ascii>
              </Section>

              {/* 03 Data flow */}
              <Section id="s3" num="03" title="Complete data flow & workflows">
                <H3>3.1 Page load flow</H3>
                <FlowSteps
                  steps={[
                    { title: "Component mounts" },
                    {
                      title: "dispatch(getListOfCustomer())",
                      body: "GET /OrderProcess/customer-master → returns [{ custID, customerName, addresses[] }]",
                    },
                    { title: "setCustomerList(response)" },
                    { title: "Initial state set", body: "Empty mappings, no customer selected" },
                    { title: "Page ready", body: "Stats card shows total = 0, no data in table" },
                  ]}
                />

                <H4>Returned customer object structure</H4>
                <Code>
{`{
  custID: `}<St>"CUST-1001"</St>{`,
  customerName: `}<St>"XYZ Corp"</St>{`,
  customerCode: `}<St>"CUST-1001"</St>{`,
  addresses: [
    {
      id: `}<Ky>501</Ky>{`,
      addressType: `}<Ky>1</Ky>{`,      `}<Cm>// 1 = ship-to</Cm>{`
      addressName: `}<St>"Main Warehouse"</St>{`,
      city: `}<St>"New York"</St>{`,
      stateName: `}<St>"NY"</St>{`,
      country: `}<St>"USA"</St>{`,
      zipCode: `}<St>"10001"</St>{`,
      companyName: `}<St>"XYZ Distribution"</St>{`
    },
    { id: `}<Ky>502</Ky>{`, ... }
  ]
}`}
                </Code>

                <H3>3.2 Customer selection flow</H3>
                <Ascii>{`User Selects Customer
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
   └─ Update activeFields (only specs this customer has)`}</Ascii>

                <H4>Line items response</H4>
                <Code>
{`{
  tyre: [
    {
      processID: `}<St>"TYRE-18565R15"</St>{`,
      category: `}<St>"Summer"</St>{`,
      config: `}<St>"Tubeless"</St>{`,
      tyreSize: `}<St>"185/65 R15"</St>{`,
      tyreRim: `}<St>"15"</St>{`,
      tyreType: `}<St>"Radial"</St>{`,
      brand: `}<St>"XYZ"</St>{`,
      sidewall: `}<St>"Black"</St>{`,
      piD_Details: `}<St>"Summer Radial Tyre - 185/65R15"</St>{`
    }
  ],
  assemblyTyre: [
    {
      assY_PID: `}<St>"ASM-001"</St>{`,
      category: `}<St>"Summer"</St>{`,
      directional: `}<St>"LH"</St>{`,
      piD_Details: `}<St>"Left-Hand Assembly"</St>{`
    }
  ],
  rim: [...]
}`}
                </Code>

                <H3>3.3 Ship address selection flow</H3>
                <Ascii>{`User Selects One or More Ship Addresses
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
        ↓
Transform API response into table rows (apiMappings)
├─ Add composite ID: \`api-{id}-{shipid}\`
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
└─ Update MappingTable with all results`}</Ascii>

                <H3>3.4 Spec selection & Process ID resolution</H3>
                <Ascii>{`User Changes a Spec Field (e.g., Brand)
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

—

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
Display hint: "Process ID resolved — 1 exact match"`}</Ascii>

                <H3>3.5 Save mapping flow (create)</H3>
                <FlowSteps
                  steps={[
                    { title: 'User clicks "Save Mapping"' },
                    {
                      title: "Validation",
                      body: "Customer selected · at least 1 ship address · item type set · Process ID resolved · Customer Process ID non-empty",
                    },
                    {
                      title: "Duplicate check per selected ship address",
                      body: "If found → open Duplicate Items dialog, let user pick which ship addresses to skip",
                    },
                    {
                      title: "submitMapping(validShipIds)",
                      body: "Description auto-filled from matchedItem.piDetails — never user-entered",
                    },
                    { title: "dispatch(createCustomerItem(payload))", body: "POST /CustomerItemMaster/CreateCustomerItem" },
                    {
                      title: "On success",
                      body: "Toast, update local state, reset panel, refresh stats + table, close dialogs",
                    },
                  ]}
                />
                <Code>
{`{
  customerIDs: [
    {
      id: `}<Ky>0</Ky>{`,
      shipid: `}<Ky>501</Ky>{`,
      customerCode: `}<St>"CUST-1001"</St>{`,
      items: [
        {
          itemType: `}<St>"tyre"</St>{`,
          itemCode: `}<St>"TYRE-18565R15"</St>{`,
          customerItemCode: `}<St>"CUST-TYRE-001"</St>{`,
          isActive: `}<Ky>true</Ky>{`,
          description: `}<St>"Summer Radial Tyre - 185/65R15"</St>{`
        }
      ]
    },
    {
      id: `}<Ky>0</Ky>{`,
      shipid: `}<Ky>502</Ky>{`,
      customerCode: `}<St>"CUST-1001"</St>{`,
      items: [{ `}<Cm>same item</Cm>{` }]
    }
  ]
}`}
                </Code>

                <H3>3.6 Edit mapping flow</H3>
                <Ascii>{`User Clicks "Edit" on a Row
        ↓
openEdit(record)
├─ Close ViewDrawer
├─ setEditDialog({ open: true, record })
└─ setEditError("")
        ↓
EditCustomerItemDialog Opens
├─ Pre-fill form with record data
├─ Display current values
└─ Allow editing of: Customer Process ID · Item Code (if allowed) · Status · Remarks
        ↓
User Makes Changes & Clicks Save
        ↓
handleSaveEditedItem(payload)
├─ Validation: duplicate check (excludes current record ID)
│
└─ dispatch(updateCustomerItem(payload))
   └─ PUT /CustomerItemMaster/UpdateCustomerItem
        ↓
On Success: update in memory, increment revision, add to history,
            close dialog, toast, refresh table
On Error: display error inline in dialog, keep dialog open`}</Ascii>

                <H3>3.7 Toggle status flow (activate / deactivate)</H3>
                <Ascii>{`Single row → onToggleStatus(record)
  buildStatusPayload(record, isActive) → dispatch(updateCustomerItem(payload))
  PUT /CustomerItemMaster/UpdateCustomerItem
  → update local status, refresh stats, toast

Multiple rows selected → handleBulkEnable / handleBulkDisable(selectedRecords)
  Loop through each record → dispatch(updateCustomerItem(...)) per row
  Promise.allSettled() for parallel execution
  → count successes vs failures, summary toast, clear selection, refresh`}</Ascii>

                <H3>3.8 Export flows</H3>
                <FieldList
                  rows={[
                    ["Export visible data", <>handleExport() — filtered headers, CSV blob → <Mono>customer-process-mappings.csv</Mono></>],
                    ["Export duplicates", <>handleExportDuplicates() — mappings filtered to duplicateIds → <Mono>duplicate-customer-process-mappings.csv</Mono></>],
                    ["Export import errors", <>handleExportErrors() — rows with _valid = false + Error column → <Mono>{"{filename}"}-errors.xlsx</Mono></>],
                  ]}
                />
              </Section>

              {/* 04 Redux */}
              <Section id="s4" num="04" title="Redux slices & API integration">
                <H3>4.1 CustomerProcessIDSlice thunks</H3>

                <H4>A. getListOfCustomer()</H4>
                <Code>
{`export const getListOfCustomer = () => async (dispatch) => {
  dispatch(setLoading(`}<Ky>true</Ky>{`));
  try {
    const res = await api.get(`}<St>"/OrderProcess/customer-master"</St>{`);
    if (res.status === `}<Ky>200</Ky>{`) {
      return res.data.data;  `}<Cm>// [{"{"} custID, customerName, addresses[] {"}"}]</Cm>{`
    }
    throw new Error(`}<St>"Unexpected status: "</St>{` + res.status);
  } catch (error) {
    console.error(`}<St>"Customer list API error:"</St>{`, error);
  } finally {
    dispatch(setLoading(`}<Ky>false</Ky>{`));
  }
};
`}<Cm>// Called at page load, cached in component state</Cm>
                </Code>

                <H4>B. getListOfItems(custID)</H4>
                <Code>
{`export const getListOfItems = (custID) => async (dispatch) => {
  dispatch(setLoading(`}<Ky>true</Ky>{`));
  try {
    const res = await api.get(\`/OrderProcess/customer-LineItems/\${custID}\`);
    if (res.status === `}<Ky>200</Ky>{`) {
      return res.data.data;  `}<Cm>// {"{"} tyre: [], assemblyTyre: [], rim: [] {"}"}</Cm>{`
    }
    throw new Error(`}<St>"Unexpected status: "</St>{` + res.status);
  } catch (error) {
    console.error(`}<St>"Line items API error:"</St>{`, error);
    return { tyre: [], assemblyTyre: [], rim: [] };
  } finally {
    dispatch(setLoading(`}<Ky>false</Ky>{`));
  }
};
`}<Cm>// Called whenever customer changes</Cm>
                </Code>

                <H4>C. getCustomerItemsByCustomerAndShip({"{ customerCode, shipIds }"})</H4>
                <Code>
{`export const getCustomerItemsByCustomerAndShip = ({ customerCode, shipIds }) =>
  async (dispatch) => {
    dispatch(setLoading(`}<Ky>true</Ky>{`));
    try {
      `}<Cm>// Build query string manually due to backend requirements</Cm>{`
      const query = new URLSearchParams();
      query.append(`}<St>"customerCode"</St>{`, customerCode);
      (Array.isArray(shipIds) ? shipIds : [shipIds])
        .forEach((id) => query.append(`}<St>"shipID"</St>{`, id));

      const res = await api.get(
        \`/CustomerItemMaster/customer-ship?\${query.toString()}\`
      );

      if (res.status === `}<Ky>200</Ky>{`) {
        return res.data.data;  `}<Cm>// Array of existing mappings</Cm>{`
      }
      throw new Error(`}<St>"Unexpected status: "</St>{` + res.status);
    } catch (error) {
      console.error(`}<St>"Customer items API error:"</St>{`, error);
      return [];
    } finally {
      dispatch(setLoading(`}<Ky>false</Ky>{`));
    }
  };
`}<Cm>// Called when customer + shipAddress are selected</Cm>
                </Code>

                <H4>D. createCustomerItem(payload)</H4>
                <Code>
{`export const createCustomerItem = (payload) => async (dispatch) => {
  dispatch(setLoading(`}<Ky>true</Ky>{`));
  try {
    const res = await api.post(
      `}<St>"/CustomerItemMaster/CreateCustomerItem"</St>{`,
      payload
    );
    if (res.status === `}<Ky>200</Ky>{` || res.status === `}<Ky>201</Ky>{`) {
      return res.data.data;
    }
    throw new Error(`}<St>"Unexpected status: "</St>{` + res.status);
  } catch (error) {
    console.error(`}<St>"Create item API error:"</St>{`, error);
    throw error;  `}<Cm>// Caller handles the error</Cm>{`
  } finally {
    dispatch(setLoading(`}<Ky>false</Ky>{`));
  }
};`}
                </Code>

                <H4>E. updateCustomerItem(payload)</H4>
                <Code>
{`export const updateCustomerItem = (payload) => async (dispatch) => {
  dispatch(setLoading(`}<Ky>true</Ky>{`));
  try {
    const res = await api.put(
      `}<St>"/CustomerItemMaster/UpdateCustomerItem"</St>{`,
      payload
    );
    if (res.status === `}<Ky>200</Ky>{` || res.status === `}<Ky>201</Ky>{`) {
      return res.data.data;
    }
    throw new Error(`}<St>"Unexpected status: "</St>{` + res.status);
  } catch (error) {
    console.error(`}<St>"Update item API error:"</St>{`, error);
    throw error;
  } finally {
    dispatch(setLoading(`}<Ky>false</Ky>{`));
  }
};

`}<Cm>// Payload sent:</Cm>{`
{
  id: `}<Ky>123</Ky>{`,                    `}<Cm>// Record ID from DB</Cm>{`
  customerItemCode: `}<St>"CUST-ITEM-UPDATED"</St>{`,
  itemCode: `}<St>"TYRE-18565R15"</St>{`,
  isActive: `}<Ky>true</Ky>{`,
  modifiedBy: `}<St>"admin"</St>{`,
  modifiedDate: `}<St>"2024-01-21T10:00:00Z"</St>{`
}`}
                </Code>

                <H3>4.2 CIMMasterSlice (UI state)</H3>
                <Code>
{`const initialState = {
  mode: `}<St>"barcode-print"</St>{`,
  loading: `}<Ky>false</Ky>{`,
  search: `}<St>""</St>{`,
};

export const {
  setMode,      `}<Cm>// Switch between tabs/modes</Cm>{`
  setLoading,   `}<Cm>// Global loading state</Cm>{`
  setSearch     `}<Cm>// Table search input</Cm>{`
} = CIMMasterSlice.actions;`}
                </Code>

                <H3>4.3 CIMBarcodeSlice (barcode printing)</H3>
                <Code>
{`export const printSingleBarcode = (barcode) => async (dispatch) => {
  dispatch(setLoading(`}<Ky>true</Ky>{`));
  try {
    const res = await api.get(
      \`/CustomBarcode/GetMetcoBarcodeLable?barcode=\${barcode}\`
    );
    if (res.status === `}<Ky>200</Ky>{` && res.data.zplCode) {
      await printSingleBarcodeLabel(res.data.zplCode);
      return { success: `}<Ky>true</Ky>{`, data: res.data };
    }
    return { success: `}<Ky>false</Ky>{`, message: `}<St>"Invalid response"</St>{` };
  } catch (error) {
    console.error(`}<St>"Barcode API error:"</St>{`, error);
    return { success: `}<Ky>false</Ky>{`, message: error.message };
  } finally {
    dispatch(setLoading(`}<Ky>false</Ky>{`));
  }
};

export const getCusWorkOrder = (plant) => async (dispatch) => {
  `}<Cm>// Fetch work orders for a plant — used in barcode printing workflow</Cm>{`
};

export const getItemsByWorkOrder = (O_ID) => async (dispatch) => {
  `}<Cm>// Fetch items grouped by work order — populates barcode printing list</Cm>{`
};`}
                </Code>
              </Section>

              {/* 05 Component hierarchy */}
              <Section id="s5" num="05" title="Component hierarchy & responsibilities">
                <H3>5.1 CustomerProcessIDMapping (main container)</H3>
                <P>
                  Orchestrates the entire workflow, manages all local state, fetches API data via Redux dispatch,
                  handles duplicate detection, aggregates data into the <Mono>mappings</Mono> array, and renders the
                  layout structure.
                </P>
                <Code>
{`const customerProcessMaster = useMemo(
  () => buildProcessMaster(customerLineItems),
  [customerLineItems]
);  `}<Cm>// Normalized process items</Cm>{`

const activeFields = useMemo(
  () => SPEC_FIELDS.filter(...),
  [filteredProcessMaster, itemTypeFilter]
);  `}<Cm>// Visible spec dropdowns</Cm>{`

const mappings = useMemo(
  () => [...apiMappings, ...rawMappings],
  [customerData, selectedCustomerName, ...]
);  `}<Cm>// Combined API + local data</Cm>{`

const filteredData = useMemo(
  () => mappings.filter(row =>
    matches search && status && filters),
  [mappings, search, status, ...]
);  `}<Cm>// Table data after filters</Cm>{`

const duplicateIds = useMemo(
  () => findDuplicates(mappings),
  [mappings]
);  `}<Cm>// IDs of duplicate rows</Cm>
                </Code>

                <H3>5.2 ImportDialog</H3>
                <P>
                  File upload UI, Excel parsing &amp; header validation, calls the parent's <Mono>onValidate</Mono>{" "}
                  for deep validation, displays results, and confirms batch import.
                </P>
                <FieldList
                  rows={[
                    ["open", "boolean"],
                    ["onClose", "() => void"],
                    ["onValidate", "async (rawRows) => validatedRows — deep validation"],
                    ["onImport", "async (validRows) => void — bulk insert"],
                  ]}
                />

                <H3>5.3 MappingTable</H3>
                <P>
                  Renders data in columns, handles row selection checkboxes, shows the row context menu (View / Edit
                  / Toggle Status), highlights duplicate badges, and formats cell values.
                </P>
                <FieldList
                  rows={[
                    ["data", "array — rows to display"],
                    ["loading", "boolean"],
                    ["visible", "{ [key]: boolean } — visible columns"],
                    ["onView / onEdit", "(record) => void"],
                    ["onToggleStatus", "(record) => void"],
                    ["onBulkStatusChange", "(records, isActive) => void"],
                    ["duplicateIds", "Set<id> — rows with duplicates"],
                  ]}
                />
                <Code>
{`const selectedRecords = useMemo(
  () => data.filter(r => selectedRowKeys.includes(r.id)),
  [data, selectedRowKeys]
);  `}<Cm>// Records for bulk actions</Cm>{`

const runBulk = async (isActive) => {
  `}<Cm>// Parallel dispatch of updateCustomerItem for each selected</Cm>{`
  `}<Cm>// Use Promise.allSettled() to track success/failure</Cm>{`
};`}
                </Code>

                <H3>5.4 ViewDrawer</H3>
                <P>
                  Read-only mapping details — every field, timestamps, creator, an Edit button that opens
                  EditCustomerItemDialog, and revision history when available.
                </P>

                <H3>5.5 EditCustomerItemDialog</H3>
                <P>
                  Read-only display of key fields, editable Customer Process ID / Item Code / Remarks / Status,
                  validates changes against duplicate rules, submits via Redux.
                </P>
                <Code>
{`// Before submit, check if changes create a duplicate:
const otherMappings = mappings.filter(m => m.id !== record.id);
const isDuplicate = isDuplicateMapping(otherMappings, {
  customerCode: payload.customerCode,
  shipid: payload.shipid,
  itemCode: payload.itemCode,
  customerItemCode: payload.customerItemCode
});

if (isDuplicate) {
  setEditError(`}<St>"This mapping already exists."</St>{`);
  return;
}`}
                </Code>

                <H3>5.6 DuplicateItemsDialog</H3>
                <P>
                  Displays ship addresses with duplicates (same customer + Process ID), and offers the choice to
                  cancel or create the valid subset only — returning the filtered list of valid ship IDs.
                </P>

                <H3>5.7 HistoryDrawer</H3>
                <P>Displays the audit trail — revision history with timestamps, creator, and modifier info.</P>
                <Code>
{`record.history = [
  {
    date: `}<St>"2024-01-15T10:00:00Z"</St>{`,
    by: `}<St>"admin"</St>{`,
    action: `}<St>"Created mapping"</St>{`,
    status: `}<St>"Active"</St>{`
  },
  {
    date: `}<St>"2024-01-20T14:30:00Z"</St>{`,
    by: `}<St>"user@example.com"</St>{`,
    action: `}<St>"Updated mapping"</St>{`,
    status: `}<St>"Active"</St>{`
  }
]`}
                </Code>
              </Section>

              {/* 06 Business logic */}
              <Section id="s6" num="06" title="Business logic & validation rules">
                <H3>6.1 Spec cascading logic</H3>
                <P>
                  When the user selects a spec value, other unselected specs narrow to only the values that can
                  coexist with the selection.
                </P>
                <Code>
{`const specOptions = useMemo(() => {
  const out = {};
  activeFields.forEach((f) => {
    `}<Cm>// For each field, find all rows that match:</Cm>{`
    `}<Cm>// - All OTHER selected specs match this row</Cm>{`
    `}<Cm>// - Then extract unique values for THIS field</Cm>{`
    const pool = filteredProcessMaster.filter((row) =>
      activeFields.every((o) =>
        o.key === f.key ||                    `}<Cm>// Don't check self</Cm>{`
        !specs[o.key] ||                      `}<Cm>// Skip unselected fields</Cm>{`
        String(row[o.key]) === specs[o.key]   `}<Cm>// Else match</Cm>{`
      )
    );
    out[f.key] = [...new Set(pool.map((row) => row[f.key]))]
      .filter(Boolean)
      .sort();
  });
  return out;
}, [specs, activeFields, filteredProcessMaster]);`}
                </Code>
                <Callout>
                  User selects Brand = "XYZ" → the Tyre Size options narrow to only sizes that exist on XYZ-branded
                  tyres for this customer. Selecting a size next narrows Rim Size the same way.
                </Callout>

                <H3>6.2 Duplicate detection rules</H3>
                <P>
                  A mapping is a duplicate if another mapping exists with the same customer + ship address, and
                  either the same item code (<Mono>ourProcessId</Mono>) or the same customer item code (
                  <Mono>customerProcessId</Mono>). The customer item code is a 1:1 alias for one item at a ship
                  address — reusing it for a different item is a duplicate.
                </P>
                <Code>
{`export const isDuplicateMapping = (existingRecords, {
  customerCode, shipid, itemCode, customerItemCode
}) => {
  return (existingRecords || []).some((m) => {
    `}<Cm>// Filter on customer + ship first</Cm>{`
    if (norm(m.customerCode) !== norm(customerCode) ||
        Number(m.shipid) !== Number(shipid)) {
      return false;
    }
    `}<Cm>// Then check item code OR customer item code</Cm>{`
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
};`}
                </Code>

                <H3>6.3 Duplicate detection at load time</H3>
                <Code>
{`const duplicateIds = useMemo(() => {
  const seen = new Map();  `}<Cm>// Key: customer::ship::processId</Cm>{`
  const dupes = new Set();

  mappings.forEach((m) => {
    const key = \`\${norm(m.customer)}::\${m.shipid}::\${norm(m.ourProcessId)}\`;
    if (seen.has(key)) {
      `}<Cm>// Mark both the new AND existing as duplicates</Cm>{`
      dupes.add(seen.get(key).id);
      dupes.add(m.id);
    } else {
      seen.set(key, m);
    }
  });

  return dupes;
}, [mappings]);`}
                </Code>

                <H3>6.4 Item type validation (per customer)</H3>
                <P>Item Type must exist in the selected customer's process master — not a hardcoded global list.</P>
                <Code>
{`const allowedItemTypes = useMemo(() => {
  if (!customer) return [];
  `}<Cm>// Extract distinct itemTypes from process master</Cm>{`
  return [...new Set(
    customerProcessMaster
      .map(p => p.itemType)
      .filter(Boolean)
  )];
}, [customerProcessMaster, customer]);

`}<Cm>// Then validate:</Cm>{`
if (!allowedItemTypes.includes(selectedItemType)) {
  setError(\`Item Type '\${selectedItemType}' not allowed. Allowed: \${allowedItemTypes.join(`}<St>", "</St>{`)}\`);
}`}
                </Code>
              </Section>

              {/* 07 Table operations */}
              <Section id="s7" num="07" title="Table operations & filtering">
                <H3>7.1 Search filter</H3>
                <P>Full-text search across all visible fields in the table.</P>
                <Code>
{`const filteredData = useMemo(() => {
  const q = search.trim().toLowerCase();
  return mappings.filter((m) => {
    `}<Cm>// Combine all field values into one searchable string</Cm>{`
    const text = Object.values(m)
      .join(`}<St>" "</St>{`)
      .toLowerCase();
    return text.includes(q);
  });
}, [mappings, search]);`}
                </Code>
                <P>
                  Search <Mono>"XYZ"</Mono> matches rows where customer, brand, company, etc. contain "XYZ". Search{" "}
                  <Mono>"201"</Mono> matches rows with Process ID, Ship ID, revision, etc. containing "201".
                </P>

                <H3>7.2 Multi-filter stack</H3>
                <P>Filters are AND-ed together — all must match.</P>
                <Code>
{`const filteredData = useMemo(() => {
  const q = search.trim().toLowerCase();
  return mappings.filter((m) => {
    `}<Cm>// All filters must pass</Cm>{`
    if (showDuplicatesOnly && !duplicateIds.has(m.id))
      return false;
    if (q && !Object.values(m).join(`}<St>" "</St>{`).toLowerCase().includes(q))
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
}, [mappings, search, status, shipAddressFilter, companyNameFilter, customerFilter, showDuplicatesOnly, duplicateIds]);`}
                </Code>

                <H3>7.3 Column visibility toggle</H3>
                <P>Users choose which columns display via the column menu.</P>
                <Code>
{`const [visibleColumns, setVisibleColumns] = useState(() =>
  Object.fromEntries(BASE_COLUMNS.map((c) => [c.key, `}<Ky>true</Ky>{`]))
);

const BASE_COLUMNS = [
  { key: `}<St>"customer"</St>{`, title: `}<St>"Customer"</St>{`, width: `}<St>"170px"</St>{` },
  { key: `}<St>"shipAddress"</St>{`, title: `}<St>"Ship Address"</St>{`, width: `}<St>"220px"</St>{` },
  { key: `}<St>"customerProcessId"</St>{`, title: `}<St>"Customer Process ID"</St>{`, width: `}<St>"190px"</St>{` },
  { key: `}<St>"ourProcessId"</St>{`, title: `}<St>"Our Process ID"</St>{`, width: `}<St>"150px"</St>{` },
  { key: `}<St>"platform"</St>{`, title: `}<St>"Platform"</St>{`, width: `}<St>"100px"</St>{` },
  { key: `}<St>"brand"</St>{`, title: `}<St>"Brand"</St>{`, width: `}<St>"140px"</St>{` },
  `}<Cm>// ... more columns</Cm>{`
];`}
                </Code>
              </Section>

              {/* 08 Stats */}
              <Section id="s8" num="08" title="Stats & metrics">
                <H3>8.1 Stat card calculations</H3>
                <Code>
{`const stats = useMemo(() => {
  const total = mappings.length;
  const active = mappings.filter((m) => m.status === `}<St>"Active"</St>{`).length;
  const inactive = mappings.filter((m) => m.status === `}<St>"Inactive"</St>{`).length;
  const recentlyUpdated = mappings.filter((m) =>
    Date.now() - new Date(m.lastUpdated).getTime() < `}<Ky>7</Ky>{` * `}<Ky>86400000</Ky>{`  `}<Cm>// 7 days</Cm>{`
  ).length;

  return { total, active, inactive, recentlyUpdated };
}, [mappings]);`}
                </Code>

                <div className="my-4 grid grid-cols-2 gap-3">
                  <StatCard label="Total Mappings" value="42" />
                  <StatCard label="Active" value="38" />
                  <StatCard label="Inactive" value="4" />
                  <StatCard label="Recently Updated" value="12" />
                </div>

                <H3>8.2 Refresh on data change</H3>
                <P>
                  Stats recalculate automatically whenever <Mono>mappings</Mono> changes — a new mapping is created,
                  an existing one is edited, a batch is imported, status is toggled, or data is refreshed from the
                  API.
                </P>
              </Section>

              {/* 09 Error handling */}
              <Section id="s9" num="09" title="Error handling & recovery">
                <H3>9.1 API error handling</H3>
                <Code>
{`// Pattern used across all thunks:
try {
  const res = await api.get(...);
  if (res.status === `}<Ky>200</Ky>{`) {
    return res.data.data;
  }
  throw new Error(`}<St>"Unexpected status: "</St>{` + res.status);
} catch (error) {
  console.error(`}<St>"API Error:"</St>{`, error);
  `}<Cm>// Return default value or throw</Cm>{`
  return [];  `}<Cm>// or: throw error</Cm>{`
}`}
                </Code>

                <H3>9.2 Component-level error states</H3>
                <Code>
{`const [editError, setEditError] = useState(`}<St>""</St>{`);

const handleSaveEditedItem = async (payload) => {
  setEditError(`}<St>""</St>{`);  `}<Cm>// Clear previous error</Cm>{`
  `}<Cm>// ... validation ...</Cm>{`
  try {
    await dispatch(updateCustomerItem(payload));
    showSuccessToast();
  } catch (error) {
    setEditError(error.message || `}<St>"Update failed"</St>{`);  `}<Cm>// Display inline</Cm>{`
  }
};`}
                </Code>

                <H3>9.3 User-facing error messages</H3>
                <DataTable
                  head={["Error", "Scenario", "User action"]}
                  rows={[
                    ["Unsupported file type", "User uploads .docx instead of .xlsx", "Re-upload correct format"],
                    ["Missing required columns", "Excel headers don't match", "Download template, use correct headers"],
                    ["Customer Code is not available", "Excel row references invalid customer", "Enter valid customer code"],
                    ["This mapping already exists", "Duplicate customer + ship + item code", "Use unique customer item code"],
                    ["Import failed. Please check the file and try again.", "Server error during bulk insert", "Check file, retry"],
                    ["Disabled 9 of 10. 1 failed — please retry.", "Bulk status change partially failed", "Retry on the failed record"],
                  ]}
                />
              </Section>

              {/* 10 Performance */}
              <Section id="s10" num="10" title="Performance optimizations">
                <H3>10.1 Memoization strategy</H3>
                <P>
                  Every expensive calculation — <Mono>customerProcessMaster</Mono>, <Mono>activeFields</Mono>,{" "}
                  <Mono>mappings</Mono>, <Mono>filteredData</Mono>, <Mono>duplicateIds</Mono>, <Mono>stats</Mono> — is
                  wrapped in <Mono>useMemo</Mono> with tight dependency arrays. Spec dropdowns don't recompute unless
                  customer or specs change; table filtering doesn't throttle on every keystroke; duplicate detection
                  only runs when mappings actually change.
                </P>

                <H3>10.2 API call optimization — batch grouping</H3>
                <Code>
{`// Instead of:
// POST /CreateCustomerItem for each mapping (N calls)

// We do:
// POST /CreateCustomerItem once with all rows grouped:
{
  customerIDs: [
    {
      shipid: `}<Ky>501</Ky>{`,
      items: [item1, item2]  `}<Cm>// All items for this ship</Cm>{`
    },
    {
      shipid: `}<Ky>502</Ky>{`,
      items: [item3]
    }
  ]
}`}
                </Code>
                <Callout>Reduction: N rows → M (customer::shipId combinations) API calls.</Callout>

                <H3>10.3 Caching strategy</H3>
                <Code>
{`// Fetched Once at Page Load:
const [customerList, setCustomerList] = useState([]);

// Fetched When Customer Changes:
const [customerLineItems, setCustomerLineItems] = useState({});

// Fetched When Customer + Ship Address Change:
const [customerData, setCustomerData] = useState([]);`}
                </Code>
                <P>
                  Changing ship address doesn't re-fetch the customer list; changing customer clears stale line items
                  and customer data; scrolling or filtering never triggers a new API call.
                </P>
              </Section>

              {/* 11 Data structures */}
              <Section id="s11" num="11" title="Data structures">
                <H3>11.1 Mapping row structure</H3>
                <Code>
{`{
  `}<Cm>// Database fields</Cm>{`
  id: `}<Ky>123</Ky>{`,                              `}<Cm>// Unique record ID</Cm>{`
  customerItemID: `}<Ky>123</Ky>{`,                  `}<Cm>// For UpdateCustomerItem</Cm>{`

  `}<Cm>// Identifiers</Cm>{`
  customer: `}<St>"Apollo Tyres Ltd"</St>{`,         `}<Cm>// Customer name from list</Cm>{`
  customerID: `}<St>"CUST-1001"</St>{`,              `}<Cm>// Customer ID</Cm>{`
  customerCode: `}<St>"CUST-1001"</St>{`,
  shipid: `}<Ky>501</Ky>{`,                          `}<Cm>// Ship address ID</Cm>{`
  shipAddress: `}<St>"New York, NY, USA"</St>{`,     `}<Cm>// Formatted address</Cm>{`
  companyName: `}<St>"Apollo Distribution"</St>{`,   `}<Cm>// Company name at ship address</Cm>{`

  `}<Cm>// Mapping details</Cm>{`
  customerProcessId: `}<St>"CUST-TYRE-001"</St>{`,  `}<Cm>// Customer's item code</Cm>{`
  ourProcessId: `}<St>"TYRE-18565R15"</St>{`,       `}<Cm>// Internal Process ID</Cm>{`

  `}<Cm>// Specification fields (from line items)</Cm>{`
  category: `}<St>"Summer"</St>{`,
  platform: `}<St>"Tubeless"</St>{`,
  tyreSize: `}<St>"185/65 R15"</St>{`,
  rimSize: `}<St>"15"</St>{`,
  tyreType: `}<St>"Radial"</St>{`,
  brand: `}<St>"XYZ"</St>{`,
  sideWall: `}<St>"Black"</St>{`,
  directional: `}<St>"LH"</St>{`,                    `}<Cm>// For assemblies only</Cm>{`

  `}<Cm>// Meta</Cm>{`
  status: `}<St>"Active"</St>{` | `}<St>"Inactive"</St>{`,
  remarks: `}<St>""</St>{`,
  revision: `}<Ky>1</Ky>{`,

  `}<Cm>// Audit trail</Cm>{`
  createdBy: `}<St>"admin"</St>{`,
  createdDate: `}<St>"2024-01-15T10:00:00Z"</St>{`,
  updatedBy: `}<St>"admin"</St>{`,
  lastUpdated: `}<St>"2024-01-20T14:30:00Z"</St>{`,

  `}<Cm>// History (for HistoryDrawer)</Cm>{`
  history: [
    {
      date: `}<St>"2024-01-15T10:00:00Z"</St>{`,
      by: `}<St>"admin"</St>{`,
      action: `}<St>"Created mapping"</St>{`,
      status: `}<St>"Active"</St>{`
    }
  ]
}`}
                </Code>

                <H3>11.2 Process master row structure</H3>
                <Code>
{`{
  processId: `}<St>"TYRE-18565R15"</St>{`,
  itemType: `}<St>"tyre"</St>{`,              `}<Cm>// "tyre" | "assembly" | "rim"</Cm>{`
  category: `}<St>"Summer"</St>{`,
  platform: `}<St>"Tubeless"</St>{`,
  tyreSize: `}<St>"185/65 R15"</St>{`,
  rimSize: `}<St>"15"</St>{`,
  tyreType: `}<St>"Radial"</St>{`,
  brand: `}<St>"XYZ"</St>{`,
  sideWall: `}<St>"Black"</St>{`,
  directional: `}<St>""</St>{`,               `}<Cm>// For assembly only</Cm>{`
  piDetails: `}<St>"Summer Radial..."</St>{`  `}<Cm>// Description for barcode</Cm>{`
}`}
                </Code>

                <H3>11.3 Spec field structure</H3>
                <Code>
{`const SPEC_FIELDS = [
  { key: `}<St>"category"</St>{`, label: `}<St>"Category"</St>{`, icon: Settings },
  { key: `}<St>"platform"</St>{`, label: `}<St>"Platform"</St>{`, icon: Layers },
  { key: `}<St>"tyreSize"</St>{`, label: `}<St>"Tyre Size"</St>{`, icon: Maximize },
  { key: `}<St>"rimSize"</St>{`, label: `}<St>"Rim"</St>{`, icon: Disc },
  { key: `}<St>"tyreType"</St>{`, label: `}<St>"Type"</St>{`, icon: Type },
  { key: `}<St>"brand"</St>{`, label: `}<St>"Brand"</St>{`, icon: Tag },
  { key: `}<St>"sideWall"</St>{`, label: `}<St>"Sidewall"</St>{`, icon: FileText },
  { key: `}<St>"directional"</St>{`, label: `}<St>"Direction"</St>{`, icon: ArrowLeftRight },  `}<Cm>// Assembly only</Cm>{`
];`}
                </Code>
              </Section>

              {/* 12 User workflows */}
              <Section id="s12" num="12" title="User workflows & scenarios">
                <H3>12.1 Create new mapping (manual entry)</H3>
                <FlowSteps
                  steps={[
                    { title: "Select Customer from dropdown" },
                    { title: "Select 1+ Ship Addresses (multi-select)" },
                    { title: "Select Item Type (Tyre / Assembly / Rim)" },
                    { title: "Select spec values (Brand, Platform, Size, etc.)" },
                    { title: "Our Process ID auto-fills on an exact match" },
                    { title: "Enter the Customer Process ID (their naming convention)" },
                    { title: 'Click "Save Mapping"' },
                    { title: "If a duplicate is detected, choose to skip or create anyway" },
                    { title: "Mapping created — table updates, stats refresh" },
                  ]}
                />

                <H3>12.2 Create multiple mappings (same item, different ships)</H3>
                <P>
                  Select the customer, select multiple ship addresses (e.g. 501, 502, 503), select item type / specs
                  / Process ID, enter the Customer Process ID, and save — a single API call creates three mappings,
                  one per ship address, in one <Mono>customerIDs</Mono> array.
                </P>

                <H3>12.3 Bulk import from Excel</H3>
                <FlowSteps
                  steps={[
                    { title: 'Click "Import" then "Download Template"' },
                    { title: "Fill the template with Customer Code, Ship ID, Item Type, Item Code, Customer Item Code" },
                    { title: "Save and upload (drag-drop or click)" },
                    {
                      title:
                        "System validates format, headers, customer existence, ship ID ownership, item type, item code assignment, and duplicates — auto-fills description",
                    },
                    {
                      title: "Review results",
                      body: "Green rows ready, red rows show their error, with a valid/error summary",
                    },
                    { title: 'Click "Import {N} rows" (disabled with no valid rows)' },
                    { title: "Single API call creates all valid rows — table updates, dialog closes" },
                  ]}
                />

                <H3>12.4 Find & fix duplicates</H3>
                <P>
                  The duplicate count surfaces automatically (e.g. "Duplicates: 5"). Toggling "Show Duplicates"
                  filters the table to just those rows, so the user can edit, deactivate, or otherwise resolve each
                  one — the duplicate set recalculates after every fix.
                </P>

                <H3>12.5 Activate / deactivate items</H3>
                <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-1.5 text-[11.5px] text-slate-400 dark:text-slate-500">Single item</div>
                    <p className="m-0 text-[13px] text-slate-600 dark:text-slate-400">
                      Row menu → Deactivate → <Mono>updateCustomerItem({"{ id, isActive: false }"})</Mono> → row grays
                      out, Inactive count increases.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-1.5 text-[11.5px] text-slate-400 dark:text-slate-500">Bulk operation</div>
                    <p className="m-0 text-[13px] text-slate-600 dark:text-slate-400">
                      Select rows → "Deactivate {"{N}"} Items" → parallel calls via Promise.allSettled → summary
                      toast, e.g. "Deactivated 8 of 10. 2 failed."
                    </p>
                  </div>
                </div>
              </Section>

              {/* 13 UI patterns */}
              <Section id="s13" num="13" title="UI patterns & components">
                <H3>13.1 Stat cards</H3>
                <div className="my-4 grid grid-cols-2 gap-3">
                  <StatCard label="Total Mappings" value="42" />
                  <StatCard label="Active" value="38" />
                  <StatCard label="Inactive" value="4" />
                  <StatCard label="Recently Updated" value="12" />
                </div>
                <P>
                  Each card pairs an icon, label, and value on a tinted background (blue / green / slate / amber),
                  with a smooth entrance animation and a refresh on every data change.
                </P>

                <H3>13.2 Spec dropdown styling</H3>
                <Code>
{`const inputCls =
  `}<St>"w-full rounded-lg border border-slate-200 "</St>{` +
  `}<St>"dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 "</St>{` +
  `}<St>"px-2 py-1.5 text-[11px] text-slate-700 dark:text-slate-200 "</St>{` +
  `}<St>"outline-none transition-colors "</St>{` +
  `}<St>"hover:bg-white dark:hover:bg-slate-900 "</St>{` +
  `}<St>"focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15"</St>{`;`}
                </Code>
                <P>Compact 11px type, slate gray with dark-mode support, hover-to-white, focus ring in blue.</P>

                <H3>13.3 Action buttons</H3>
                <Code>
{`<motion.button
  whileTap={{ scale: `}<Ky>0.98</Ky>{` }}  `}<Cm>// Framer motion: tap feedback</Cm>{`
  onClick={handleAction}
  disabled={conditionsMet === `}<Ky>false</Ky>{`}
  className={`}<St>"flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"</St>{`}
>
  <Save size={`}<Ky>14</Ky>{`} /> Save Mapping
</motion.button>`}
                </Code>

                <H3>13.4 Status badge</H3>
                <Code>
{`const StatusBadge = ({ status }) => {
  const styles = {
    Active: `}<St>"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"</St>{`,
    Inactive: `}<St>"bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"</St>{`,
    Pending: `}<St>"bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"</St>{`,
  };

  return (
    <span className={\`rounded-full px-2 py-1 text-[11px] font-semibold uppercase \${styles[status]}\`}>
      {status}
    </span>
  );
};`}
                </Code>
                <p className="my-2 flex flex-wrap gap-2">
                  <Pill tone="good">● Active</Pill>
                  <Pill tone="neutral">● Inactive</Pill>
                  <Pill tone="warn">● Pending</Pill>
                </p>
              </Section>

              {/* 14 Testing */}
              <Section id="s14" num="14" title="Testing scenarios">
                <H3>14.1 Spec cascading test</H3>
                <P>
                  <strong>Scenario:</strong> user selects Brand = "XYZ".
                </P>
                <P>
                  <strong>Expected:</strong> Tyre Size shows only sizes available on XYZ tyres; Rim Size shows only
                  rims compatible with XYZ tyres; an empty dropdown if nothing matches.
                </P>

                <H3>14.2 Duplicate detection test</H3>
                <P>
                  <strong>Setup:</strong> CUST-1001 already has a mapping at Ship 501 for Process ID TYRE-18565R15,
                  Customer Item Code ACME-001.
                </P>

                <H4>Scenario 1 — same item, different customer item code</H4>
                <DataTable
                  head={["Field", "Value"]}
                  rows={[
                    ["Input", "Customer CUST-1001, Ship 501, Process ID TYRE-18565R15, Customer Item Code ACME-002"],
                    ["Expected", <><Pill tone="warn">✗ Rejected</Pill> — "Already exists" (same customer + ship + item code)</>],
                  ]}
                />

                <H4>Scenario 2 — different item code, same customer item code</H4>
                <DataTable
                  head={["Field", "Value"]}
                  rows={[
                    ["Input", "Customer CUST-1001, Ship 501, Process ID TYRE-27545R20, Customer Item Code ACME-001"],
                    ["Expected", <><Pill tone="warn">✗ Rejected</Pill> — "Already exists" (customer item code must be unique per ship address)</>],
                  ]}
                />

                <H4>Scenario 3 — different ship address</H4>
                <DataTable
                  head={["Field", "Value"]}
                  rows={[
                    ["Input", "Customer CUST-1001, Ship 502, Process ID TYRE-18565R15, Customer Item Code ACME-001"],
                    ["Expected", <><Pill tone="good">✓ Created</Pill> — different ship address, not a duplicate</>],
                  ]}
                />

                <H3>14.3 Bulk import validation test</H3>
                <DataTable
                  head={["Customer Code", "Ship ID", "Item Type", "Item Code", "Customer Item Code", "Result"]}
                  rows={[
                    ["CUST-1001", "501", "Tyre", "TYRE-123", "CUST-001", <Pill tone="good">✓ Valid</Pill>],
                    ["CUST-9999", "501", "Tyre", "TYRE-123", "CUST-002", <Pill tone="warn">Customer not available</Pill>],
                    ["CUST-1001", "999", "Tyre", "TYRE-123", "CUST-003", <Pill tone="warn">Ship ID not owned</Pill>],
                    ["CUST-1001", "501", "Kitchen", "TYRE-123", "CUST-004", <Pill tone="warn">Item type not allowed</Pill>],
                    ["CUST-1001", "501", "Tyre", "TYRE-999", "CUST-005", <Pill tone="warn">Item not assigned</Pill>],
                    ["CUST-1001", "501", "Tyre", "TYRE-123", "CUST-006", <Pill tone="good">✓ Valid</Pill>],
                    ["CUST-1001", "501", "Tyre", "TYRE-123", "CUST-006", <Pill tone="warn">Duplicate in file</Pill>],
                  ]}
                />
                <Callout>Summary: 2 valid, 5 with errors. Import button enabled, showing "Import 2 rows."</Callout>
              </Section>

              {/* 15 Future */}
              <Section id="s15" num="15" title="Future enhancements">
                <ul className="my-3 list-disc pl-5 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                  <li>Bulk delete functionality</li>
                  <li>Export to Salesforce / ERP direct integration</li>
                  <li>Change history timeline with diff view</li>
                  <li>Barcode label printer integration (ZPL code)</li>
                  <li>Real-time sync with other systems</li>
                  <li>Advanced filtering (date range, created by, etc.)</li>
                  <li>Custom column formulas (computed fields)</li>
                  <li>Multi-language support for error messages</li>
                  <li>Customer portal (read-only access for customers)</li>
                  <li>API versioning for backwards compatibility</li>
                </ul>
              </Section>

              {/* 16 Related files */}
              <Section id="s16" num="16" title="Related files & dependencies">
                <DataTable
                  head={["File", "Purpose"]}
                  rows={[
                    ["CustomerProcessIDMapping.jsx", "Main container, orchestration"],
                    ["helpers.js", "Normalization, duplicate detection, process master builder"],
                    ["CustomerProcessIDSlice.jsx", "Redux thunks for API calls"],
                    ["CIMMasterSlice.jsx", "UI state (mode, loading, search)"],
                    ["BarcodeSlice.jsx", "Barcode printing workflows"],
                    ["ImportDialog.jsx", "Excel upload & validation"],
                    ["MappingTable.jsx", "Data table rendering"],
                    ["MappingDrawer.jsx", "Manual creation form"],
                    ["ViewDrawer.jsx", "Read-only details"],
                    ["EditCustomerItemDialog.jsx", "Update mapping"],
                    ["HistoryDrawer.jsx", "Audit trail"],
                    ["DuplicateItemsDialog.jsx", "Conflict resolution"],
                    ["mockData.js", "Sample data for development"],
                    ["DynamicDataTable.jsx", "Reusable table component"],
                  ]}
                />
              </Section>
            </div>

            <footer className="mt-16 flex justify-between border-t border-slate-200 pt-6 text-[12.5px] text-slate-400 dark:border-slate-700 dark:text-slate-500">
              <span>Customer Process ID Mapping — Functional Document</span>
              <span>End of document</span>
            </footer>
          </motion.div>
        </main>
      </div>
    </div>
  );
}