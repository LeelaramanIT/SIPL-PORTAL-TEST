import React, { cloneElement, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as XLSX from "xlsx";

const ICONS = {
  entity: "\u{1F3E2}", order: "\u{1F4C4}", customer: "\u{1F464}", address: "\u{1F4CD}",
  plant: "\u{1F3ED}", item: "\u{1F4E6}", tag: "\u{1F3F7}", standard: "\u{1F4E6}",
  blanket: "\u{1F4CB}", stock: "\u{1F3ED}", trial: "\u{1F9EA}", transfer: "\u{1F504}",
  search: "\u{1F50D}", sheet: "\u{1F4CA}", pdf: "\u{1F4C4}", paste: "\u{1F4CB}",
  robot: "\u{1F916}", download: "\u{1F4E5}", truck: "\u{1F69A}", pay: "\u{1F4B3}",
  bank: "\u{1F3E6}", rocket: "\u{1F680}", save: "\u{1F4BE}", preview: "\u{1F441}",
};

const ENTITY_DATA = [
  { code: "ENT-001", name: "Sun Tws America", initials: "US", currency: "USD", location: "", tone: "gold" },
  { code: "ENT-002", name: "Sundaram Industries Pvt Ltd", initials: "IN", currency: "INR", location: "MMN & PDK", tone: "blue" },
  { code: "ENT-003", name: "Sundaram Lanka Tyres Ltd", initials: "SLTL", currency: "INR", location: "SLTL PLANT", tone: "green" },
  { code: "ENT-004", name: "Sun Industries Tyres Ltd", initials: "SITL", currency: "EUR", location: "SITL plant", tone: "purple" },
];

const CUSTOMER_DATA = [
  { code: "DE0061", name: "EASTMAN INDUSTRIES LIMITED", initials: "EI", city: "Singapore", terms: "Net 30", credit: "50,000", tone: "green" },
  { code: "OEM0202", name: "AGRIQUIP MACHINERY SDN BHD", initials: "AM", city: "Austin TX", terms: "Net 15", credit: "30,000", tone: "blue" },
  { code: "OEM0204", name: "AEROINDEC MEXICO", initials: "AM", city: "Amsterdam", terms: "Net 45", credit: "100,000", tone: "gold" },
  { code: "DE0209", name: "POLIVUL SAS", initials: "PS", city: "Seattle", terms: "COD", credit: "0", tone: "purple" },
];

const CATALOG = [
  { code: "WGT-PRO-01", name: "Widget Pro Black", uom: "EA", price: 49.99, stock: 245 },
  { code: "WGT-STD-02", name: "Widget Standard", uom: "EA", price: 29.99, stock: 580 },
  { code: "BLT-KIT-01", name: "Bolt Kit 50pcs", uom: "SET", price: 12.5, stock: 120 },
  { code: "CBL-USB-C3", name: "USB-C Cable 1m", uom: "EA", price: 8, stock: 1200 },
  { code: "MTR-ALU-1M", name: "Aluminium Rod 1m", uom: "M", price: 22, stock: 340 },
  { code: "SVC-INST-HR", name: "Installation Service", uom: "HR", price: 85, stock: 999 },
  { code: "PKG-BOX-SM", name: "Packaging Box Small", uom: "BOX", price: 2.5, stock: 3000 },
  { code: "RM-STEEL-KG", name: "Steel Raw Material", uom: "KG", price: 4.2, stock: 8000 },
];

const PLANTS = [
  { id: "PLT-01", name: "MMN", location: "Maraimalai Nagar Chennai, India", stock: "2,450", capacity: "5,000" },
  { id: "PLT-02", name: "PDK", location: "pudukkottai, India", stock: "980", capacity: "3,200" },
  { id: "PLT-03", name: "SITL", location: "SRILANKA", stock: "340", capacity: "1,500" },
  { id: "PLT-03", name: "SLTL", location: "SRILANKA", stock: "340", capacity: "1,500" },
];

const ORDER_TYPES = {
  std: {
    icon: ICONS.standard, name: "Standard Sales Order", tag: "Customer",
    description: "Regular customer order with external delivery",
    info: "Customer, shipping and billing address and payment terms required.",
    itemLabel: "Line Items", priceLabel: "Unit Price",
    steps: ["Entity", "Order Type", "Customer", "Ship/Bill/Pay", "Line Items", "Disc & Tax", "Review"],
    showCustomer: true, showAddress: true, showPlant: false, showDiscTax: true,
    flow: ["Customer required", "Ship & Bill address", "Single warehouse"], skips: [],
  },
  blk: {
    icon: ICONS.blanket, name: "Sales Agreement", tag: "Customer",
    description: "Long-term contract with scheduled releases",
    info: "Agreement order with customer, delivery addresses and a release schedule.",
    itemLabel: "Agreed Items", priceLabel: "Agreed Price",
    steps: ["Entity", "Order Type", "Customer", "Ship/Bill/Pay", "Line Items", "Disc & Tax", "Review"],
    showCustomer: true, showAddress: true, showPlant: false, showDiscTax: true,
    flow: ["Customer required", "Ship & Bill address", "Release schedule"], skips: [],
  },
  mts: {
    icon: ICONS.stock, name: "Make-to-Stock", tag: "Production",
    description: "Internal production order for stock replenishment",
    info: "Internal production order. Customer and delivery address are not applicable.",
    itemLabel: "Materials / BOM Items", priceLabel: "Cost Price",
    steps: ["Entity", "Order Type", "Plant / Production", "Line Items", "Review"],
    showCustomer: false, showAddress: false, showPlant: true, showDiscTax: false,
    flow: ["No customer", "No ship/bill", "Plant + BOM"], skips: ["Customer", "Ship/Bill/Pay", "Disc & Tax"],
  },
  tri: {
    icon: ICONS.trial, name: "Trial / Sample", tag: "Internal",
    description: "Internal plant trial - R&D, QC or process testing",
    info: "Trial is internal within the selected plant. No external customer or discount flow.",
    itemLabel: "Trial Materials", priceLabel: "Cost Price",
    steps: ["Entity", "Order Type", "Plant / Lab", "Line Items", "Review"],
    showCustomer: false, showAddress: false, showPlant: true, showDiscTax: false,
    flow: ["No customer", "No ship/bill", "Within plant only"], skips: ["Customer", "Ship/Bill/Pay", "Disc & Tax"],
  },
  ipt: {
    icon: ICONS.transfer, name: "Inter-Plant Transfer", tag: "Internal",
    description: "Material movement from one plant to another",
    info: "Select source and destination plants. No customer or external delivery.",
    itemLabel: "Transfer Items", priceLabel: "Transfer Value",
    steps: ["Entity", "Order Type", "From -> To Plant", "Line Items", "Review"],
    showCustomer: false, showAddress: false, showPlant: true, showDiscTax: false,
    flow: ["No customer", "No ship/bill", "From -> To plant"], skips: ["Customer", "Ship/Bill/Pay", "Disc & Tax"],
  },
};

const INITIAL_ITEMS = [
  { id: 1, code: "P-188713", customerPartNo: "0987654",  desc: "POB | 323X100WHEEL | 0 | P5N | NUMA | -", uom: "EA", qty: 10, price: 49.99, disc: 5, tax: 9 },
  { id: 2, code: "P-189566", customerPartNo: "0987652", desc: "APW |16X5 RIB EDC666 | 0 | MW4 | TOTALSOURCE | -", uom: "SET", qty: 25, price: 12.5, disc: 0, tax: 9 },
  { id: 3, code: "P-189344", customerPartNo: "0987653", desc: "TR-S | 406X125 TR-S EDC663 | 0 | MW5G | TOTALSOURCE | -", uom: "EA", qty: 50, price: 8, disc: 10, tax: 9 },
];

const ADDRESSES = [
  { id: "primary", type: "Primary Shipping", first: "123 Main Street, Suite 400", second: "San Francisco, CA 94105 - USA", isDefault: true },
  { id: "dock", type: "Warehouse Dock", first: "789 Industrial Blvd, Dock B", second: "Oakland, CA 94601 - USA" },
];
const PAYMENT_TERMS = [
  ["Net 30", "Due in 30 days"], ["Net 15", "Due in 15 days"], ["Net 45", "Due in 45 days"], ["Net 60", "Due in 60 days"],
  ["COD", "Cash on delivery"], ["Advance", "Pay before ship"], ["2/10 N30", "2% disc in 10d"], ["EOM", "End of month"],
];

const THEME = {
  std: { text: "text-blue-400", border: "border-blue-500/35", bg: "bg-blue-500/[.07]", selected: "border-blue-500 bg-blue-500/[.07]" },
  blk: { text: "text-purple-400", border: "border-purple-500/35", bg: "bg-purple-500/[.07]", selected: "border-purple-500 bg-purple-500/[.07]" },
  mts: { text: "text-amber-400", border: "border-amber-500/35", bg: "bg-amber-500/[.07]", selected: "border-amber-500 bg-amber-500/[.07]" },
  tri: { text: "text-cyan-400", border: "border-cyan-500/35", bg: "bg-cyan-500/[.07]", selected: "border-cyan-500 bg-cyan-500/[.07]" },
  ipt: { text: "text-emerald-400", border: "border-emerald-500/35", bg: "bg-emerald-500/[.07]", selected: "border-emerald-500 bg-emerald-500/[.07]" },
};
const AVATAR = {
  gold: "from-amber-500 to-orange-600", blue: "from-blue-500 to-indigo-500", green: "from-emerald-500 to-teal-600",
  purple: "from-purple-500 to-violet-700", orange: "from-orange-500 to-red-600",
};
const INPUT = "w-full min-h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal tracking-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 disabled:opacity-30 disabled:cursor-not-allowed read-only:bg-slate-100 read-only:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:read-only:bg-slate-800/45 dark:read-only:text-slate-400";
const PRIMARY = "rounded-lg border-0 bg-gradient-to-br from-amber-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90";
const MUTED = "rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white";
const rise = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2 } };

function cx(...names) {
  return names.filter(Boolean).join(" ");
}

function Field({ label, required, children, wide }) {
  return (
    <label className={cx("flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-slate-500 dark:text-slate-400", wide && "col-span-full")}>
      <span>{label}{required && <b className="text-red-400"> *</b>}</span>
      {cloneElement(children, { className: cx(INPUT, children.props.className) })}
    </label>
  );
}

function Grid({ columns = 3, className, children }) {
  const grids = { 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" };
  return <div className={cx("grid gap-3", grids[columns], className)}>{children}</div>;
}

function Divider({ children, tone = "text-slate-600", className }) {
  return <div className={cx("my-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em]", tone, className)}>{children}<span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" /></div>;
}

function Info({ tone = "blue", children }) {
  const styles = {
    blue: "border-blue-500/20 bg-blue-500/[.08]", amber: "border-amber-500/20 bg-amber-500/[.08]",
    green: "border-emerald-500/20 bg-emerald-500/[.08]", teal: "border-cyan-500/20 bg-cyan-500/[.08]",
  };
  return <div className={cx("mb-3 rounded-lg border px-3.5 py-3 text-xs leading-5 text-slate-600 dark:text-slate-300", styles[tone])}>{children}</div>;
}

const MotionSection = motion.section;

function Panel({ section, title, icon, badge, collapsed, onToggle, children }) {
  return (
    <MotionSection layout className="mb-3 overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111318] dark:shadow-none">
      <button type="button" onClick={() => onToggle(section)} className={cx("flex w-full items-center justify-between rounded-t-xl border-b border-slate-200 bg-slate-50 px-4.5 py-3 text-left text-slate-800 dark:border-slate-800 dark:bg-[#161820] dark:text-slate-100", collapsed && "rounded-xl border-b-0")}>
        <span className="flex items-center gap-2 text-xs font-semibold"><i className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 not-italic">{icon}</i>{title}</span>
        <span className="flex items-center gap-2">
          {badge && <em className="rounded-full border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold not-italic uppercase tracking-widest text-amber-400">{badge}</em>}
          <motion.strong animate={{ rotate: collapsed ? -90 : 0 }} className="text-slate-400 dark:text-slate-600">{"\u25BE"}</motion.strong>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && <motion.div {...rise} className="p-4.5">{children}</motion.div>}
      </AnimatePresence>
    </MotionSection>
  );
}

export default function OrderCopy() {
  const nextId = useRef(20);
  const toastTimer = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [entity, setEntity] = useState(ENTITY_DATA[0]);
  const [orderType, setOrderType] = useState(null);
  const [customer, setCustomer] = useState(CUSTOMER_DATA[0]);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [addressTab, setAddressTab] = useState("ship");
  const [shipAddress, setShipAddress] = useState("primary");
  const [billSynced, setBillSynced] = useState(true);
  const [paymentTerm, setPaymentTerm] = useState("Net 30");
  const [sourcePlant, setSourcePlant] = useState("PLT-01");
  const [destinationPlant, setDestinationPlant] = useState("PLT-02");
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [catalogRow, setCatalogRow] = useState(null);
  const [discountMode, setDiscountMode] = useState("pct");
  const [docDiscount, setDocDiscount] = useState(5);
  const [taxes, setTaxes] = useState([{ id: 1, name: "GST", code: "GST-9", rate: 9 }]);
  const [charges, setCharges] = useState([{ id: 1, name: "Freight", amount: 120, taxable: "Yes" }]);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [toast, setToast] = useState("");
  const [collapsed, setCollapsed] = useState({});

  const config = orderType ? ORDER_TYPES[orderType] : null;
  const theme = THEME[orderType || "std"];
  const isExternal = config ? config.showDiscTax : true;
  const showCustomer = config ? config.showCustomer : true;
  const showAddress = config ? config.showAddress : true;
  const showPlant = config ? config.showPlant : false;

  useEffect(() => {
    const dismissPopovers = (event) => {
      if (!event.target.closest("[data-customer-picker]")) setCustomerOpen(false);
      if (!event.target.closest("[data-catalog-cell]")) setCatalogRow(null);
    };
    document.addEventListener("mousedown", dismissPopovers);
    return () => {
      document.removeEventListener("mousedown", dismissPopovers);
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  const formatMoney = (number) => new Intl.NumberFormat("en-US", { style: "currency", currency: entity.currency }).format(Number(number) || 0);
  const totals = useMemo(() => {
    const gross = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const lineDiscount = isExternal ? items.reduce((sum, item) => sum + item.qty * item.price * item.disc / 100, 0) : 0;
    const net = gross - lineDiscount;
    const documentDiscount = !isExternal || discountMode === "none" ? 0 : discountMode === "pct" ? net * docDiscount / 100 : Math.min(net, docDiscount);
    const taxable = net - documentDiscount;
    const totalTax = isExternal ? taxes.reduce((sum, tax) => sum + taxable * tax.rate / 100, 0) : 0;
    const totalCharges = isExternal ? charges.reduce((sum, charge) => sum + charge.amount, 0) : 0;
    return { gross, lineDiscount, net, documentDiscount, taxable, totalTax, totalCharges, grand: taxable + totalTax + totalCharges };
  }, [items, isExternal, discountMode, docDiscount, taxes, charges]);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  };
  
  const togglePanel = (section) => setCollapsed((current) => ({ ...current, [section]: !current[section] }));
  const changeOrderType = (type) => { setOrderType(type); notify(`${ORDER_TYPES[type].icon} ${ORDER_TYPES[type].name} - form updated`); };
  const updateItem = (id, field, value) => setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: ["qty", "price", "disc", "tax"].includes(field) ? Number(value) || 0 : value } : item));
  const appendItem = (item) => setItems((current) => [...current, { id: nextId.current++, uom: "EA", qty: 1, price: 0, disc: 0, tax: 9, ...item }]);
  const chooseCatalogItem = (rowId, item) => {
    setItems((current) => current.map((row) => row.id === rowId ? { ...row, code: item.code, desc: item.name, uom: item.uom, price: item.price } : row));
    setCatalogRow(null);
    notify(`${ICONS.item} ${item.name} selected`);
  };
  
  const importPasted = () => {
    try {
      const rows = pasteText.trim().split(/\r?\n/).filter(Boolean);
      if (!rows.length) { notify("No pasted data found"); return;}
      const dataRows = rows.slice(1);
      const imported = dataRows.map((row) => {
        const columns = row.split(/\t|,/).map((value) => value.trim());
        return { id: nextId.current++,
          code: columns[0] || "",
          customerPartNo: columns[1] || "",
          desc: columns[2] || "",
          qty: Number(columns[3]) || 1,
          price: Number(columns[4]) || 0,
          disc: Number(columns[5]) || 0,
          tax: 0,
        };
      });
      if (imported.length) {
        setItems((current) => [...current, ...imported]);
        notify(`${ICONS.paste} ${imported.length} pasted item(s) imported`);
      }
      setPasteText("");
      setPasteOpen(false);  
    } catch (error) {
      console.error(error);
      notify("Paste import failed");
    }
  };
  
  const simulateDocumentImport = async (event, type) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      notify(`${ICONS.sheet} Reading ${file.name}...`);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      if (!jsonData.length) { notify("No data found in Excel"); return;}
      const importedItems = jsonData.map((row) => ({
        id: nextId.current++, code: row["Process ID"] || row["ProcessID"] || row["process id"] || "", customerPartNo: row["Customer Part No"] || row["CustomerPartNo"] || "",
        desc: row["Description"] || row["description"] || "",
        qty: Number(row["Qty"] || 1),price: Number(row["Unit Price"] || row["UnitPrice"] || 0 ), disc: Number( row["Disc%"] || row["Disc %"] || 0 ), tax: 0, }));
      setItems((current) => [...current, ...importedItems]);
      notify( `${ICONS.sheet} ${importedItems.length} item(s) imported`);
    } catch (error) { console.error(error); notify("Excel import failed");} event.target.value = "";
  };
  
  const downloadTemplate = () => {
    const csvData = "Process ID,Customer Part No,Description,Qty,Disc%\n" + "P-188713,P5N323X,323X100 WHEEL NUMA,10,5\n";
    const url = URL.createObjectURL( new Blob([csvData], { type: "text/csv" }) );
    const link = document.createElement("a"); link.href = url; link.download = "sales-order-items-template.csv"; link.click(); URL.revokeObjectURL(url);
    notify(`${ICONS.download} Import template downloaded`);
  };

  const source = PLANTS.find((plant) => plant.id === sourcePlant);
  const destination = PLANTS.find((plant) => plant.id === destinationPlant);
  const filteredCustomers = CUSTOMER_DATA.filter((candidate) => `${candidate.name} ${candidate.code}`.toLowerCase().includes(customerSearch.toLowerCase()));

  const canProceedToStep2 = Boolean(entity && orderType);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800 dark:bg-[#0c0e13] dark:text-slate-100">
      <main className="mx-auto max-w-[1400px] p-2 sm:p-4">
        <motion.div {...rise} className="mb-5 flex items-start justify-between gap-4">
          <div><h1 className="bg-gradient-to-br from-slate-900 to-slate-500 bg-clip-text font-serif text-3xl text-transparent dark:from-white dark:to-slate-400">New Sales Order</h1><p className="mt-1 text-[11px] text-slate-500">Step {currentStep} of 2 - {currentStep === 1 ? "Setup order details" : "Add items and finalize"}</p></div>
          <div className="flex">
            <div className="flex items-center gap-2">
              <code className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] text-amber-400">REF# SO-2026-0413</code>
              {currentStep === 2 && <button className={cx(MUTED, "hidden sm:block")} type="button" onClick={() => notify(`${ICONS.save} Draft saved - SO-2026-0413`)}>Save Draft</button>}
              <button className={PRIMARY} type="button" onClick={() => orderType ? notify(`${ICONS.rocket} Order submitted successfully!`) : notify("Please select an order type first")}>{currentStep === 1 ? "Submit" : "Submit"}</button>
            </div> 
          </div>
        </motion.div>

        {/* Step Indicator */}
        <motion.div layout className="mb-4 flex min-h-14 items-center overflow-x-auto rounded-xl border border-slate-200 bg-white px-5 py-2.5 shadow-sm dark:border-slate-800 dark:bg-[#111318] dark:shadow-none">
          {currentStep === 1 ? (
            <>
              {["Entity", "Order Type", "Customer", "Ship/Bill/Pay"].map((step, index) => (
                <React.Fragment key={step}>
                  <motion.div layout className={cx("flex shrink-0 items-center gap-2 text-[10px] font-semibold", "text-emerald-400")}>
                    <b className={cx("flex size-[22px] items-center justify-center rounded-full border bg-slate-100 dark:bg-[#161820]", "border-emerald-400 bg-emerald-400/15")}>{index + 1}</b>
                    {step}
                  </motion.div>
                  {index < 3 && <i className={cx("mx-2 h-px min-w-4 flex-1 bg-emerald-500/30 dark:bg-emerald-500/30 not-italic")} />}
                </React.Fragment>
              ))}
              <i className="mx-2 h-px min-w-4 flex-1 bg-slate-200 not-italic dark:bg-slate-800" />
              {["Line Items", "Disc & Tax"].map((step, index) => (
                <React.Fragment key={step}>
                  <motion.div layout className={cx("flex shrink-0 items-center gap-2 text-[10px] font-semibold", "text-slate-500")}>
                    <b className={cx("flex size-[22px] items-center justify-center rounded-full border bg-slate-100 dark:bg-[#161820]", "border-slate-300 dark:border-slate-700")}>{5 + index}</b>
                    {step}
                  </motion.div>
                  {index < 1 && <i className={cx("mx-2 h-px min-w-4 flex-1 bg-slate-200 not-italic dark:bg-slate-800")} />}
                </React.Fragment>
              ))}
            </>
          ) : (
            <>
              {["Entity", "Order Type", "Customer", "Ship/Bill/Pay"].map((step, index) => (
                <React.Fragment key={step}>
                  <motion.div layout className={cx("flex shrink-0 items-center gap-2 text-[10px] font-semibold", "text-emerald-400")}>
                    <b className={cx("flex size-[22px] items-center justify-center rounded-full border bg-slate-100 dark:bg-[#161820]", "border-emerald-400 bg-emerald-400/15")}>{"\u2713"}</b>
                    {step}
                  </motion.div>
                  {index < 3 && <i className={cx("mx-2 h-px min-w-4 flex-1 bg-emerald-500/30 dark:bg-emerald-500/30 not-italic")} />}
                </React.Fragment>
              ))}
              <i className="mx-2 h-px min-w-4 flex-1 bg-slate-200 not-italic dark:bg-slate-800" />
              {["Line Items", "Disc & Tax"].map((step, index) => (
                <React.Fragment key={step}>
                  <motion.div layout className={cx("flex shrink-0 items-center gap-2 text-[10px] font-semibold", index === 0 ? theme.text : "text-emerald-400")}>
                    <b className={cx("flex size-[22px] items-center justify-center rounded-full border bg-slate-100 dark:bg-[#161820]", index === 0 ? theme.border + " " + theme.bg : "border-emerald-400 bg-emerald-400/15")}>{index === 0 ? 5 : "\u2713"}</b>
                    {step}
                  </motion.div>
                  {index < 1 && <i className={cx("mx-2 h-px min-w-4 flex-1", index === 0 ? theme.border : "bg-slate-200 dark:bg-slate-800", "not-italic")} />}
                </React.Fragment>
              ))}
            </>
          )}
        </motion.div>

        <div className={cx("grid items-start gap-4", currentStep === 2 ? "lg:grid-cols-[minmax(0,1fr)_300px]" : "grid-cols-1")}>
          <div>
            {/* STEP 1: Entity, Order Type, Customer, Address/Plant */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div {...rise} key="step1">
                  <Panel section="entity" title="Company Entity" icon={ICONS.entity} badge="Step 1" collapsed={collapsed.entity} onToggle={togglePanel}>
                    <Info>Entity determines legal company, currency, tax rules and available warehouses/plants.</Info>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                      {ENTITY_DATA.map((item) => (
                        <motion.button whileHover={{ y: -2 }} key={item.code} type="button" className={cx("relative rounded-lg border bg-slate-50 p-3 text-left transition dark:bg-slate-800", entity.code === item.code ? "border-amber-400 bg-amber-500/[.05] dark:bg-amber-500/[.05]" : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600")} onClick={() => { setEntity(item); notify(`${ICONS.entity} Entity: ${item.name} (${item.currency})`); }}>
                          {entity.code === item.code && <Tick />}
                          <b className={cx("mb-2 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br text-xs text-white", AVATAR[item.tone])}>{item.initials}</b>
                          <strong className="block text-xs">{item.name}</strong><code className="block text-[9px] text-slate-500">{item.code}</code><small className="text-[10px] text-slate-600">{item.location}</small>
                        </motion.button>
                      ))}
                    </div>
                  </Panel>

                  <Panel section="type" title="Order Type" icon={ICONS.order} badge="Step 2 - Critical" collapsed={collapsed.type} onToggle={togglePanel}>
                    <Info tone="amber"><strong>Choose carefully.</strong> Order type determines which sections appear next.</Info>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                      {Object.entries(ORDER_TYPES).map(([id, type]) => (
                        <motion.button whileHover={{ y: -2 }} key={id} type="button" className={cx("relative min-h-[178px] rounded-xl border-2 border-slate-200 bg-slate-50 p-3 pt-7 text-left transition dark:border-slate-700 dark:bg-slate-800", orderType === id && THEME[id].selected)} onClick={() => changeOrderType(id)}>
                          <small className={cx("absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase", THEME[id].bg, THEME[id].text)}>{type.tag}</small>
                          {orderType === id && <Tick />}
                          <span className="mb-1.5 block text-xl">{type.icon}</span><strong className="mb-1 block text-[11px]">{type.name}</strong><p className="mb-2 min-h-7 text-[9px] leading-4 text-slate-500">{type.description}</p>
                          {type.flow.map((flow) => <em className={cx("block text-[9px] not-italic text-emerald-400", flow.startsWith("No ") && "text-slate-600 line-through")} key={flow}>{flow.startsWith("No ") ? "x" : "\u2713"} {flow}</em>)}
                        </motion.button>
                      ))}
                    </div>
                    <Divider>Order Details</Divider>
                    <Grid columns={4}>
                      <Field label="Order Date" required><input type="date" defaultValue="2026-05-22" /></Field>
                      <Field label="Desired Ship Date" required><input type="date" defaultValue="2026-06-05" /></Field>
                      {!["mts", "tri", "ipt"].includes(orderType) && (<>
                      <Field label="Lead Time"><select defaultValue="Above 1 Week"><option>Above 1 Week</option><option>Above 2 Week</option></select></Field>
                      <Field label="Validity Date"><input type="date" defaultValue="2026-06-30" /></Field>
                      {/* <Field label="Sales Rep"><select defaultValue="Michael Brown"><option>Karthick thilagar</option><option></option></select></Field> */}
                      <Field label="Email Reference #"><input placeholder="Email REF / Order ref" /></Field>
                      </>
                      )}
                    </Grid>
                    <AnimatePresence>{orderType === "blk" && <motion.div {...rise}><Divider>Agreement Details</Divider><Grid><Field label="Agreement Start"><input type="date" defaultValue="2026-06-01" /></Field><Field label="Agreement End"><input type="date" defaultValue="2026-12-31" /></Field><Field label="Release Frequency"><select><option>Monthly</option><option>Weekly</option><option>Quarterly</option></select></Field><Field label="Max Release Qty"><input type="number" placeholder="Total agreed qty" /></Field><Field label="Min Order Value"><input type="number" placeholder="Min per release" /></Field><Field label="Auto Release"><select><option>Manual</option><option>Auto on Date</option></select></Field></Grid></motion.div>}</AnimatePresence>
                  </Panel>

                  <AnimatePresence>
                    {showCustomer && <CustomerPanel key="customer" customer={customer} entity={entity} open={customerOpen} search={customerSearch} filtered={filteredCustomers} collapsed={collapsed.customer} onToggle={togglePanel} onOpen={() => setCustomerOpen((open) => !open)} onSearch={setCustomerSearch} onSelect={(entry) => { setCustomer(entry); setCustomerOpen(false); setCustomerSearch(""); notify(`${ICONS.customer} ${entry.name} loaded from master`); }} />}
                    {showAddress && <AddressPanel key="address" tab={addressTab} setTab={setAddressTab} shipAddress={shipAddress} setShipAddress={setShipAddress} billSynced={billSynced} setBillSynced={setBillSynced} paymentTerm={paymentTerm} setPaymentTerm={setPaymentTerm} entity={entity} notify={notify} collapsed={collapsed.address} onToggle={togglePanel} />}
                    {showPlant && <PlantPanel key="plant" type={orderType} sourcePlant={sourcePlant} destinationPlant={destinationPlant} setSourcePlant={setSourcePlant} setDestinationPlant={setDestinationPlant} notify={notify} collapsed={collapsed.plant} onToggle={togglePanel} />}
                  </AnimatePresence>

                  {/* Step 1 Action Button */}
                  <motion.div {...rise} className="mt-6 flex justify-end gap-2">
                    <button className={PRIMARY} type="button" onClick={() => {
                      if (canProceedToStep2) {
                        setCurrentStep(2);
                        notify(`${ICONS.save} Setup complete - proceeding to items`);
                      } else {
                        notify("Please complete Entity and Order Type");
                      }
                    }} disabled={!canProceedToStep2}>
                      {ICONS.save} Continue to Items →
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STEP 2: Items and Discount */}
            <AnimatePresence mode="wait">
              {currentStep === 2 && (
                <motion.div {...rise} key="step2">
                  <ItemsPanel config={config} items={items} isExternal={isExternal} catalogRow={catalogRow} setCatalogRow={setCatalogRow} updateItem={updateItem} chooseCatalogItem={chooseCatalogItem} appendItem={appendItem} setItems={setItems} formatMoney={formatMoney} simulateDocumentImport={simulateDocumentImport} setPasteOpen={setPasteOpen} downloadTemplate={downloadTemplate} notify={notify} collapsed={collapsed.items} onToggle={togglePanel} />

                  <AnimatePresence>
                    {isExternal && <DiscountPanel taxes={taxes} setTaxes={setTaxes} charges={charges} setCharges={setCharges} discountMode={discountMode} setDiscountMode={setDiscountMode} docDiscount={docDiscount} setDocDiscount={setDocDiscount} entity={entity} totals={totals} formatMoney={formatMoney} nextId={nextId} collapsed={collapsed.discount} onToggle={togglePanel} />}
                  </AnimatePresence>

                  {/* Step 2 Action Button */}
                  <motion.div {...rise} className="mt-6 flex justify-between gap-2">
                    <button className={MUTED} type="button" onClick={() => {
                      setCurrentStep(1);
                      notify("Back to setup");
                    }}>
                      ← Back to Setup
                    </button>
                    <button className={PRIMARY} type="button" onClick={() => orderType ? notify(`${ICONS.rocket} Order submitted successfully!`) : notify("Please select an order type first")}>
                      {ICONS.rocket} Submit Order
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {currentStep === 2 && <Sidebar config={config} theme={theme} entity={entity} customer={customer} showCustomer={showCustomer} showPlant={showPlant} source={source} destination={destination} orderType={orderType} isExternal={isExternal} items={items} totals={totals} formatMoney={formatMoney} notify={notify} />}
        </div>
      </main>

      <AnimatePresence>
        {pasteOpen && <PasteModal pasteText={pasteText} setPasteText={setPasteText} onClose={() => setPasteOpen(false)} onImport={importPasted} />}
        {toast && <motion.div key="toast" {...rise} className="fixed bottom-5 left-1/2 z-[999] -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-[#111318] dark:text-white">{toast}</motion.div>}
      </AnimatePresence>
    </div>
  );
}

function CustomerPanel({ customer, entity, open, search, filtered, collapsed, onToggle, onOpen, onSearch, onSelect }) {
  return (
    <motion.div {...rise}>
      <Panel section="customer" title="Customer" icon={ICONS.customer} badge="Step 3" collapsed={collapsed} onToggle={onToggle}>
        <Field label="Customer Master" required>
          <div data-customer-picker className="relative">
            <button type="button" className="flex w-full items-center gap-3 rounded-lg border border-emerald-500/30 bg-white p-3 text-left dark:bg-slate-800" onClick={onOpen}>
              <Avatar item={customer} /><span className="flex-1"><strong className="block text-xs text-slate-800 dark:text-slate-100">{customer.name}</strong><small className="normal-case tracking-normal text-slate-500">{customer.code} - {customer.terms} - Credit {entity.currency} {customer.credit}</small></span><em className="text-[10px] not-italic text-slate-500">Change &gt;</em>
            </button>
            <AnimatePresence>{open && <motion.div {...rise} className="absolute left-0 right-0 top-[calc(100%+5px)] z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
              <label className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">{ICONS.search}<input autoFocus value={search} placeholder="Search customer..." className="flex-1 bg-transparent text-xs text-slate-800 outline-none dark:text-white" onChange={(event) => onSearch(event.target.value)} /></label>
              {filtered.map((entry) => <button className="flex w-full items-center gap-2 border-b border-slate-200 px-3 py-2 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50" type="button" key={entry.code} onClick={() => onSelect(entry)}><Avatar item={entry} /><span className="flex-1"><strong className="block text-xs normal-case tracking-normal text-slate-800 dark:text-white">{entry.name}</strong><small className="normal-case tracking-normal text-slate-500">{entry.code} - {entry.city}</small></span><em className="text-[10px] not-italic text-emerald-500 dark:text-emerald-400">{entry.credit === "0" ? "COD" : `${entity.currency} ${entry.credit}`}</em></button>)}
            </motion.div>}</AnimatePresence>
          </div>
        </Field>
        <Grid className="mt-3"><Field label="Contact Person"><input defaultValue="MR. SANDEEP" /></Field><Field label="Email"><input type="email" defaultValue="addoindia@eastmanglobal.com" /></Field><Field label="Phone"><input placeholder="91 8288941400" /></Field><Field label="Customer PO #"><input placeholder="Their reference" /></Field><Field label="PO Date"><input type="date" /></Field>
        <Field label="Currency"><input value={entity.currency} readOnly /></Field>
        <Field label="Sales Rep"><select defaultValue="Michael Brown"><option>Karthick thilagar</option><option></option></select></Field>
        <Field label="User ID"><select defaultValue="kaja098"><option>leela003</option><option>harish098</option></select></Field>
        </Grid>
      </Panel>
    </motion.div>
  );
}

function AddressPanel({ tab, setTab, shipAddress, setShipAddress, billSynced, setBillSynced, paymentTerm, setPaymentTerm, entity, notify, collapsed, onToggle }) {
  return (
    <motion.div {...rise}>
      <Panel section="address" title="Ship / Bill / Payment" icon={ICONS.address} badge="Step 4" collapsed={collapsed} onToggle={onToggle}>
        <div className="mb-3 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-[#0c0e13]">
          {[["ship", `${ICONS.truck} Ship To`], ["bill", `${ICONS.pay} Bill To`], ["pay", `${ICONS.bank} Payment`]].map(([id, label]) => <button key={id} type="button" className={cx("flex-1 rounded-md py-2 text-xs font-semibold text-slate-500", tab === id && "bg-white text-slate-900 shadow dark:bg-[#111318] dark:text-white")} onClick={() => setTab(id)}>{label}</button>)}
        </div>
        <AnimatePresence mode="wait">
          {tab === "ship" && <motion.div key="ship" {...rise}>{ADDRESSES.map((address) => <Address key={address.id} selected={shipAddress === address.id} address={address} onClick={() => { setShipAddress(address.id); notify(`${ICONS.address} Address selected`); }} />)}<Divider>Agent Or notify address</Divider><Grid columns={2}><Field label="Street" wide><input placeholder="Street address" /></Field><Field label="City"><input placeholder="City" /></Field><Field label="State"><input placeholder="State" /></Field><Field label="ZIP"><input placeholder="ZIP" /></Field><Field label="Country"><select><option>United States</option><option>Singapore</option><option>India</option></select></Field></Grid></motion.div>}
          {tab === "bill" && 
          <motion.div key="bill" {...rise}>
            {<Address selected address={{ type: "Billing / Accounts", first: "456 Finance Avenue, Floor 8", second: "San Francisco, CA 94103 - USA", isDefault: true }} />}</motion.div>}
          
          {tab === "pay" && <motion.div key="pay" {...rise}><Divider className="mt-0">Payment Terms</Divider><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{PAYMENT_TERMS.map(([name, desc]) => <motion.button whileHover={{ y: -1 }} key={name} type="button" className={cx("rounded-lg border border-slate-200 bg-slate-50 p-2 text-center dark:border-slate-700 dark:bg-slate-800", paymentTerm === name && "border-purple-500 bg-purple-500/[.08]")} onClick={() => { setPaymentTerm(name); notify(`${ICONS.pay} Payment: ${name}`); }}>
          <strong className={cx("block text-xs", paymentTerm === name && "text-purple-500 dark:text-purple-400")}>{name}</strong>
          <small className="text-[9px] text-slate-500">{desc}</small></motion.button>)}</div><Grid columns={2} className="mt-3">
          <Field label="Bank Account"><select><option>Acme - DBS ****4521</option><option>Acme - OCBC ****8834</option></select></Field></Grid>
          <Grid className="mt-3">
          </Grid></motion.div>}
        </AnimatePresence>
      </Panel>
    </motion.div>
  );
}

function PlantPanel({ type, sourcePlant, destinationPlant, setSourcePlant, setDestinationPlant, notify, collapsed, onToggle }) {
  const title = type === "ipt" ? "From Plant -> To Plant" : type === "tri" ? "Plant & Lab (Internal)" : "Plant & Production";
  return (
    <motion.div {...rise}><Panel section="plant" title={title} icon={ICONS.plant} badge="Step 3" collapsed={collapsed} onToggle={onToggle}>
      {type === "mts" && <MakeToStock />}
      {type === "tri" && <TrialFields />}
      {type === "ipt" && <><Info tone="green">Select the source plant (From) and destination plant (To). Both must belong to the same entity.</Info><div className="grid gap-3 sm:grid-cols-2"><PlantChooser title="FROM - Source Plant" selected={sourcePlant} onChoose={(id) => { setSourcePlant(id); notify(`${ICONS.plant} Source plant selected`); }} type="source" /><PlantChooser title="TO - Destination Plant" selected={destinationPlant} onChoose={(id) => { setDestinationPlant(id); notify(`${ICONS.plant} Destination plant selected`); }} type="destination" /></div><Grid className="mt-3"><Field label="Transfer Type"><select><option>Standard Transfer</option><option>Urgent Transfer</option><option>Replenishment</option></select></Field><Field label="Transport Mode"><select><option>Road Freight</option><option>Air Freight</option><option>Rail</option><option>Sea</option></select></Field><Field label="Transfer Cost Center"><select><option>CC-LOGISTICS-01</option><option>CC-OPERATIONS-02</option></select></Field></Grid></>}
    </Panel></motion.div>
  );
}

function ItemsPanel({ config, items, isExternal, catalogRow, setCatalogRow, updateItem, chooseCatalogItem, appendItem, setItems, formatMoney, simulateDocumentImport, setPasteOpen, downloadTemplate, notify, collapsed, onToggle }) {
  const tool = "relative flex min-w-[90px] flex-col items-center gap-1 rounded-lg border bg-slate-50 px-3 py-2 text-sm transition hover:-translate-y-0.5 dark:bg-slate-800";
  const cell = "w-full rounded-md border border-transparent bg-transparent p-1.5 text-xs text-slate-800 outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-500 focus:bg-blue-500/[.06] dark:text-white dark:hover:border-slate-700 dark:hover:bg-slate-800";
  return (
    <Panel section="items" title={config?.itemLabel || "Line Items"} icon={ICONS.item} badge={`${items.length} items`} collapsed={collapsed} onToggle={onToggle}>
      <div className="mb-3 flex flex-wrap gap-2">
        <label className={cx(tool, "cursor-pointer border-emerald-500/25")}>{ICONS.sheet}<strong className="text-[10px] text-slate-700 dark:text-slate-300">Excel</strong><small className="text-[9px] text-slate-500">.xlsx</small><input className="hidden" type="file" accept=".xlsx,.xls" onChange={(event) => simulateDocumentImport(event, "Excel")} /></label>
        <label className={cx(tool, "cursor-pointer border-red-500/25")}>{ICONS.pdf}<strong className="text-[10px] text-slate-700 dark:text-slate-300">PDF</strong><small className="text-[9px] text-slate-500">PO / Doc</small><input className="hidden" type="file" accept=".pdf" onChange={(event) => simulateDocumentImport(event, "PDF")} /></label>
        <button type="button" className={cx(tool, "border-blue-500/25")} onClick={() => setPasteOpen(true)}>{ICONS.paste}<strong className="text-[10px] text-slate-700 dark:text-slate-300">Copy-Paste</strong><small className="text-[9px] text-slate-500">Spreadsheet</small></button>
        <button type="button" className={cx(tool, "border-cyan-500/25")} onClick={() => { appendItem({ code: "AI-001", desc: "AI Extracted Item", qty: 1, price: 45 }); notify(`${ICONS.robot} AI extraction complete`); }}><em className="absolute right-1 top-1 rounded-full bg-cyan-500/15 px-1 text-[7px] not-italic text-cyan-500 dark:text-cyan-400">AI</em>{ICONS.robot}<strong className="text-[10px] text-slate-700 dark:text-slate-300">AI Extract</strong><small className="text-[9px] text-slate-500">Read document</small></button>
        <button type="button" className={cx(tool, "border-purple-500/25")} onClick={downloadTemplate}>{ICONS.download}<strong className="text-[10px] text-slate-700 dark:text-slate-300">Template</strong><small className="text-[9px] text-slate-500">Download</small></button>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[890px] border-collapse text-xs"><thead><tr>{["#", "Process ID", "Customer Part No", "Description", "Qty", config?.priceLabel || "Unit Price", "Disc %", "Line Total", ""].map((head, index) => <th className={cx("border-b-2 border-slate-200 px-1.5 py-2 text-left text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:border-slate-800", index >= 4 && index <= 8 && "text-right")} key={head || "action"}>{head}</th>)}</tr></thead>
        <tbody>{items.map((item, index) => {
          const subtotal = item.qty * item.price; const discount = isExternal ? subtotal * item.disc / 100 : 0; const lineTax = isExternal ? (subtotal - discount) * item.tax / 100 : 0;
          const filteredCatalog = CATALOG.filter((entry) => `${entry.code} ${entry.name}`.toLowerCase().includes(item.code.toLowerCase()));
          return <motion.tr layout key={item.id} className="border-b border-slate-200/80 hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-white/[.015]"><td className="px-2 text-slate-400 dark:text-slate-600">{index + 1}</td><td data-catalog-cell className="relative p-1 w-[100px] min-w-[100px]"><input className={cell} value={item.code} placeholder="Search..." onFocus={() => setCatalogRow(item.id)} onChange={(event) => { updateItem(item.id, "code", event.target.value); setCatalogRow(item.id); }} /><AnimatePresence>{catalogRow === item.id && <motion.div {...rise} className="absolute left-0 top-full z-40 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">{filteredCatalog.map((entry) => <button className="flex w-full justify-between border-b border-slate-200 px-3 py-2 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/60" type="button" key={entry.code} onClick={() => chooseCatalogItem(item.id, entry)}><span><code className="block text-blue-500 dark:text-blue-400">{entry.code}</code><strong className="block text-[11px]">{entry.name}</strong><small className="text-slate-500">Stock: {entry.stock}</small></span><em className="not-italic text-emerald-500 dark:text-emerald-400">{formatMoney(entry.price)}</em></button>)}</motion.div>}</AnimatePresence></td>
          <td className="p-1 w-[110px] min-w-[100px]"><input className={cell} value={item.customerPartNo || ""} placeholder="Customer Part No" onChange={(event) => updateItem(item.id, "customerPartNo", event.target.value)} /></td>
          <td className="p-1 min-w-[350px] w-[350px]"><input className={cell} value={item.desc} placeholder="Description" onChange={(event) => updateItem(item.id, "desc", event.target.value)} /></td>
          {[["qty", item.qty, "w-[70px] min-w-[70px]"],["price", item.price, "w-[110px] min-w-[110px]"],["disc", item.disc, "w-[90px] min-w-[90px]"],].map(([field, value, width]) => (<td className={`p-1 ${width}`} key={field}><input className={cx(cell, "text-right")} type="number" disabled={!isExternal && field === "disc"} min="0" value={value} onChange={(event) => updateItem(item.id, field, event.target.value)} /></td>
))}<td className="whitespace-nowrap px-2 text-right font-mono font-bold text-amber-500 dark:text-amber-400">{formatMoney(subtotal - discount + lineTax)}</td><td><button className="px-2 text-lg text-slate-400 hover:text-red-400 dark:text-slate-600" type="button" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))}>{"\u00D7"}</button></td></motion.tr>; })}</tbody></table></div>
      <button className="mt-2 px-2 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300" type="button" onClick={() => { appendItem({ code: "", desc: "" }); notify("Line item added"); }}>+ Add Line Item</button>
    </Panel>
  );
}

function DiscountPanel({ taxes, setTaxes, charges, setCharges, discountMode, setDiscountMode, docDiscount, setDocDiscount, entity, totals, formatMoney, nextId, collapsed, onToggle }) {
  return <motion.div {...rise}><Panel section="discount" title="Document Discount & Tax" icon={ICONS.tag} badge="Applied after line items" collapsed={collapsed} onToggle={onToggle}><Divider className="mt-0">Document Discount</Divider><div className="mb-3 flex gap-1.5">{[["pct", "% Percentage"], ["flat", `${entity.currency} Flat Amount`], ["none", "No Discount"]].map(([id, label]) => <button className={cx("rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800", discountMode === id && "border-amber-400 bg-amber-500/[.08] text-amber-500 dark:text-amber-400")} type="button" key={id} onClick={() => setDiscountMode(id)}>{label}</button>)}</div><AnimatePresence>{discountMode !== "none" && <motion.div {...rise}><Grid><Field label="Discount Type"><select><option>Trade Discount</option><option>Cash Discount</option><option>Loyalty Discount</option></select></Field><Field label="Discount Value"><input type="number" value={docDiscount} onChange={(event) => setDocDiscount(Number(event.target.value) || 0)} /></Field><Field label="Approval / Reason"><input defaultValue="LOYAL2026" /></Field></Grid></motion.div>}</AnimatePresence><Divider>Tax Components</Divider><div className="space-y-2">{taxes.map((tax) => <motion.div layout key={tax.id} className="grid items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800 sm:grid-cols-[repeat(4,minmax(0,1fr))_auto]"><Field label="Tax Name"><input value={tax.name} onChange={(event) => setTaxes((current) => current.map((entry) => entry.id === tax.id ? { ...entry, name: event.target.value } : entry))} /></Field><Field label="Code"><select value={tax.code} onChange={(event) => setTaxes((current) => current.map((entry) => entry.id === tax.id ? { ...entry, code: event.target.value } : entry))}><option>GST-9</option><option>VAT-20</option><option>EXEMPT</option></select></Field><Field label="Rate %"><input type="number" value={tax.rate} onChange={(event) => setTaxes((current) => current.map((entry) => entry.id === tax.id ? { ...entry, rate: Number(event.target.value) || 0 } : entry))} /></Field><Field label="Amount"><input readOnly value={formatMoney(totals.taxable * tax.rate / 100)} /></Field><Remove onClick={() => setTaxes((current) => current.filter((entry) => entry.id !== tax.id))} /></motion.div>)}</div>
  <Divider>Additional Charges</Divider><div className="space-y-2">{charges.map((charge) => <motion.div layout key={charge.id} className="grid items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]"><Field label="Name"><input value={charge.name} onChange={(event) => setCharges((current) => current.map((entry) => entry.id === charge.id ? { ...entry, name: event.target.value } : entry))} /></Field><Field label="Amount"><input type="number" value={charge.amount} onChange={(event) => setCharges((current) => current.map((entry) => entry.id === charge.id ? { ...entry, amount: Number(event.target.value) || 0 } : entry))} /></Field><Field label="Taxable"><select value={charge.taxable} onChange={(event) => setCharges((current) => current.map((entry) => entry.id === charge.id ? { ...entry, taxable: event.target.value } : entry))}><option>Yes</option><option>No</option></select></Field><Remove onClick={() => setCharges((current) => current.filter((entry) => entry.id !== charge.id))} /></motion.div>)}</div><Add onClick={() => setCharges((current) => [...current, { id: nextId.current++, name: "Insurance", amount: 0, taxable: "Yes" }])}>Add Charge</Add><Calculation totals={totals} format={formatMoney} discountMode={discountMode} docDiscount={docDiscount} /></Panel></motion.div>;
}

function Sidebar({ config, theme, entity, customer, showCustomer, showPlant, source, destination, orderType, isExternal, items, totals, formatMoney, notify }) {
  return <aside className="lg:sticky lg:top-[68px]"><AnimatePresence>{config && <motion.div {...rise} className={cx("mb-2.5 grid grid-cols-[auto_1fr] items-center rounded-lg border px-3 py-2.5", theme.bg, theme.border, theme.text)}><span className="row-span-2 mr-2 text-lg">{config.icon}</span><strong className="text-xs">{config.name}</strong><small className="text-[10px] opacity-80">{config.showCustomer ? "External - Customer - Delivery" : "Internal - No customer - No delivery"}</small></motion.div>}</AnimatePresence><motion.div layout className={cx("mb-2.5 flex flex-col rounded-xl border p-4 text-center", theme.bg, theme.border, theme.text)}><small className="text-[10px] font-bold uppercase tracking-[.1em]">Grand Total</small><strong className="font-serif text-3xl font-normal">{formatMoney(totals.grand)}</strong><span className="font-mono text-[10px] text-slate-500">{entity.currency} - SO-2026-0413</span></motion.div><SummaryCard title={<span className="flex w-full justify-between">Order Summary <Draft /></span>}><Summary label="Order #" value="SO-2026-0413" accent /><Summary label="Entity" value={entity.name} /><Summary label="Order Type" value={config?.name || "- not selected -"} />{showCustomer && <Summary label="Customer" value={customer.name} green />}{showPlant && <Summary label="Plant" value={orderType === "ipt" ? `${source?.id} -> ${destination?.id}` : source?.name} amber />}<Summary label="Date" value="22 May 2026" /><Summary label="Items" value={`${items.length}`} blue />{isExternal && <Summary label="Subtotal" value={formatMoney(totals.gross)} />}{isExternal && <Summary label="Discounts" value={`-${formatMoney(totals.lineDiscount + totals.documentDiscount)}`} red />}{isExternal && <Summary label="Tax" value={`+${formatMoney(totals.totalTax)}`} />}<Summary label="Grand Total" value={formatMoney(totals.grand)} accent total /><div className="mt-3 flex flex-col gap-1.5 border-t border-slate-200 pt-3 dark:border-slate-800"><button className={PRIMARY} type="button" onClick={() => config ? notify(`${ICONS.rocket} Order submitted successfully!`) : notify("Please select an order type first")}>{ICONS.rocket} Submit Order</button><button className={MUTED} type="button" onClick={() => notify(`${ICONS.save} Draft saved - SO-2026-0413`)}>{ICONS.save} Save Draft</button><button className={MUTED} type="button" onClick={() => notify(`${ICONS.preview} Preview generated`)}>{ICONS.preview} Preview</button></div></SummaryCard><SummaryCard title="Checklist"><Checklist done label="Entity selected" /><Checklist done={Boolean(config)} label="Order type chosen" /><Checklist done={Boolean(config)} label={config?.showCustomer ? "Customer selected" : config?.showPlant ? "Plant set" : "Customer / Plant set"} /><Checklist done={Boolean(config?.showAddress)} na={Boolean(config && !config.showAddress)} label={config?.showAddress ? "Address set" : "Address not applicable"} /><Checklist done={items.length > 0} label="Line items added" /><Checklist done={Boolean(config?.showDiscTax)} na={Boolean(config && !config.showDiscTax)} label={config?.showDiscTax ? "Discount & Tax" : "Discount not applicable"} /></SummaryCard></aside>;
}

function PlantChooser({ title, selected, onChoose, type }) {
  const active = type === "source" ? "border-emerald-500 bg-emerald-500/[.05]" : "border-blue-500 bg-blue-500/[.05]";
  return <div><Divider className="mt-0" tone={type === "source" ? "text-emerald-500 dark:text-emerald-400" : "text-blue-500 dark:text-blue-400"}>{title}</Divider>{PLANTS.map((plant) => <motion.button whileHover={{ x: 2 }} type="button" className={cx("relative mb-2 flex w-full flex-col rounded-lg border border-slate-200 bg-slate-50 p-3 text-left dark:border-slate-700 dark:bg-slate-800", selected === plant.id && active)} key={plant.id} onClick={() => onChoose(plant.id)}>{selected === plant.id && <small className={cx("absolute right-2 top-2 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase", type === "source" ? "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400" : "bg-blue-500/15 text-blue-500 dark:text-blue-400")}>{type}</small>}<strong className="text-xs">{plant.name}</strong><code className="text-[10px] text-slate-500">{plant.id} - {plant.location}</code><span className="mt-1 text-[10px] text-emerald-500 dark:text-emerald-400">{type === "source" ? `Stock: ${plant.stock} units available` : `Capacity: ${plant.capacity} units`}</span></motion.button>)}</div>;
}

function MakeToStock() {
  return <><Info tone="amber">Select the production plant and warehouse where stock will be produced and stored.</Info><Grid columns={2}><Field label="Production Plant" required><select><option>PLT-01 - Main Production Chennai</option><option>PLT-02 - Assembly Singapore</option><option>PLT-03 - Pack & Ship Dubai</option></select></Field><Field label="Target Warehouse" required><select><option>WH-01 Main Store</option><option>WH-02 Secondary</option><option>WH-03 Export</option></select></Field></Grid><div className="mt-3 rounded-xl border border-amber-500/15 bg-amber-500/[.04] p-3.5"><Divider className="mt-0" tone="text-amber-400">Production Details</Divider><Grid><Field label="Production Order #"><input readOnly value="PRD-2026-0089" /></Field><Field label="BOM Version"><select><option>BOM-v2.1 (Current)</option><option>BOM-v2.0</option><option>BOM-v1.9</option></select></Field><Field label="Routing"><select><option>STD-ROUTE-01</option><option>FAST-ROUTE-02</option></select></Field><Field label="Planned Start"><input type="date" defaultValue="2026-05-25" /></Field><Field label="Planned Finish"><input type="date" defaultValue="2026-06-10" /></Field><Field label="Work Center"><select><option>WC-ASSEMBLY-01</option><option>WC-PACK-02</option></select></Field></Grid></div></>;
}

function TrialFields() {
  return <><Info tone="teal">Trial orders are internal only within the selected plant. No external customer or delivery is involved.</Info><Grid columns={2}><Field label="Plant" required><select><option>PLT-01 - Main Production Chennai</option><option>PLT-02 - Assembly Singapore</option><option>PLT-03 - Pack & Ship Dubai</option></select></Field><Field label="Department / Lab"><select><option>R&D Lab A</option><option>Quality Control</option><option>Process Engineering</option><option>Production Test Line</option></select></Field></Grid><div className="mt-3 rounded-xl border border-cyan-500/15 bg-cyan-500/[.04] p-3.5"><Divider className="mt-0" tone="text-cyan-400">Trial Details</Divider><Grid><Field label="Trial ID"><input readOnly value="TRL-2026-0044" /></Field><Field label="Trial Purpose"><select><option>R&D Testing</option><option>QC Verification</option><option>Process Validation</option><option>New Material Test</option></select></Field><Field label="Responsible Person"><select><option>Dr. Anand Kumar</option><option>Sarah Lee</option><option>Tom Wilson</option></select></Field><Field label="Trial Start Date"><input type="date" defaultValue="2026-05-25" /></Field><Field label="Trial End Date"><input type="date" defaultValue="2026-06-04" /></Field>
  <Field label="Trial Notes / Hypothesis" wide><textarea placeholder="Describe the trial objective, hypothesis or test parameters..." /></Field></Grid></div></>;
}

function Calculation({ totals, format, discountMode, docDiscount }) {
  return <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"><h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Calculation Breakdown</h4><Summary label="Gross Subtotal" value={format(totals.gross)} /><Summary label="Line Discounts" value={`-${format(totals.lineDiscount)}`} red /><Summary label="Net After Line Disc" value={format(totals.net)} /><Summary label={`Doc Discount ${discountMode === "pct" ? `(${docDiscount}%)` : "(Flat)"}`} value={`-${format(totals.documentDiscount)}`} red /><Summary label="Taxable Amount" value={format(totals.taxable)} /><Summary label="Tax" value={`+${format(totals.totalTax)}`} /><Summary label="Additional Charges" value={`+${format(totals.totalCharges)}`} /><Summary label="Grand Total" value={format(totals.grand)} accent total /></div>;
}

function PasteModal({ pasteText, setPasteText, onClose, onImport }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/45 p-4 backdrop-blur-md dark:bg-black/75"><motion.section initial={{ opacity: 0, scale: .96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: 10 }} className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#111318]"><header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-[#161820]"><strong>{ICONS.paste} Paste from Clipboard</strong><button className="text-xl text-slate-500 hover:text-slate-900 dark:hover:text-white" type="button" onClick={onClose}>{"\u00D7"}</button></header><div className="p-5"><p className="mb-3 rounded-lg border border-blue-500/15 bg-blue-500/[.06] p-3 text-xs leading-5 text-slate-600 dark:text-slate-400">Copy rows from <b>Excel / Google Sheets</b>.<br />Columns: <code className="text-blue-500 dark:text-blue-400">Process ID</code> - <code className="text-blue-500 dark:text-blue-400">Description</code> - <code className="text-blue-500 dark:text-blue-400">Qty</code> - <code className="text-blue-500 dark:text-blue-400">Unit Price</code> - <code className="text-blue-500 dark:text-blue-400">Disc%</code></p><textarea className={cx(INPUT, "min-h-28 font-mono")} value={pasteText} onChange={(event) => setPasteText(event.target.value)} placeholder={"WGT-PRO-01\tWidget Pro\t10\t49.99\t5"} /></div><footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800"><button className={MUTED} type="button" onClick={onClose}>Cancel</button><button className={PRIMARY} type="button" onClick={onImport}>Import -&gt;</button></footer></motion.section></motion.div>;
}

function Address({ selected, address, onClick }) {
  return <motion.button whileHover={{ x: 2 }} type="button" className={cx("relative mb-2 flex w-full items-start gap-3 rounded-lg border bg-slate-50 p-3 text-left dark:bg-slate-800", selected ? "border-blue-500 bg-blue-500/[.05]" : "border-slate-200 dark:border-slate-700")} onClick={onClick}><i className={cx("mt-0.5 size-4 rounded-full border-2 border-slate-300 not-italic dark:border-slate-600", selected && "border-blue-500 bg-blue-500")} /><span><small className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">{address.type}</small><strong className="block text-xs">{address.first}</strong><em className="text-[10px] not-italic text-slate-500 dark:text-slate-400">{address.second}</em></span>{address.isDefault && <b className="absolute right-2 top-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[8px] uppercase text-emerald-500 dark:text-emerald-400">Default</b>}</motion.button>;
}

function SummaryCard({ title, children }) {
  return <section className="mb-2.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111318] dark:shadow-none"><header className="flex border-b border-slate-200 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:border-slate-800">{title}</header><div className="p-4">{children}</div></section>;
}

function Summary({ label, value, accent, red, green, blue, amber, total }) {
  return <p className={cx("flex justify-between border-b border-slate-200/80 py-1.5 text-[11px] last:border-b-0 dark:border-slate-800/70", total && "mt-1 border-t border-slate-300 pt-2 text-xs font-bold dark:border-slate-700")}><span className="text-slate-500">{label}</span><strong className={cx("max-w-[160px] text-right font-mono font-medium text-slate-800 dark:text-white", accent && "text-amber-500 dark:text-amber-400", red && "text-red-500 dark:text-red-400", green && "text-emerald-500 dark:text-emerald-400", blue && "text-blue-500 dark:text-blue-400", amber && "text-amber-500 dark:text-amber-400")}>{value}</strong></p>;
}

function Checklist({ done, na, label }) {
  return <p className={cx("flex items-center gap-2 py-1.5 text-[11px] text-slate-500", done && "text-emerald-500 dark:text-emerald-400", na && "opacity-60")}><i className={cx("flex size-3.5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-[8px] not-italic dark:border-slate-700 dark:bg-slate-800", done && "border-transparent bg-emerald-500/20", na && "text-slate-500 dark:text-slate-600")}>{done ? "\u2713" : na ? "-" : ""}</i>{label}</p>;
}

function Avatar({ item }) {
  return <b className={cx("flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs text-white", AVATAR[item.tone])}>{item.initials}</b>;
}
function Tick() {
  return <b className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[9px] text-slate-950">{"\u2713"}</b>;
}
function Draft() {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-400"><i className="size-1.5 rounded-full bg-current" />Draft</span>;
}
function Remove({ onClick }) {
  return <button className="p-2 text-lg text-slate-600 hover:text-red-400" type="button" onClick={onClick}>{"\u00D7"}</button>;
}
function Add({ onClick, children }) {
  return <button className="mt-2 px-1 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300" type="button" onClick={onClick}>+ {children}</button>;
}