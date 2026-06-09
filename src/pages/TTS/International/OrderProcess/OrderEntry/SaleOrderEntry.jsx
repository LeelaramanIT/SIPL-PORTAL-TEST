import React, { cloneElement, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import { getListOfCustomer, getListOfItems } from "../../../../../Redux/Slices/OrderProcess/OrderProcessSlice";
import ItemSelectorDrawer from "./ItemSelectorDrawer";
import ExistingOrdersModal, { ExistingOrdersButton } from "./ExistingOrdersModal";
import { Document, PDFViewer } from "@react-pdf/renderer";
import ProformaPDF from "./ProformaPDF";
import { getMasterData } from "../../../../../Redux/Slices/ProformaInvoice/ProformaInvoiceSlice";
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
  { code: "ENT-004", name: "Sun Industries Tyres Ltd", initials: "SITL", currency: "EUR", location: "SITL PLANT", tone: "purple" },
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
  { id: 1, code: "P-188713", customerPartNo: "0987654", desc: "POB | 323X100WHEEL | 0 | P5N | NUMA | -", uom: "EA", qty: 10, price: 49.99, disc: 5, tax: 9 },
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
const PRIMARY = "rounded-lg border-0 bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90";
const MUTED = "rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white";
const rise = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2 } };

function cx(...names) {
  return names.filter(Boolean).join(" ");
}

function normalizeNumericInput(value) {
  const cleaned = String(value ?? "")
    .replace(/[^\d.]/g, "")
    .replace(/(\..*)\./g, "$1");

  if (cleaned === "") return "";

  const [whole, decimal] = cleaned.split(".");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "") || "0";

  return decimal === undefined ? normalizedWhole : `${normalizedWhole}.${decimal}`;
}

function inputValueOrZero(value) {
  return value === "" || value === null || value === undefined ? "0" : value;
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

export default function SaleOrderEntry() {
  const nextId = useRef(20);
  const toastTimer = useRef(null);
  const [entity, setEntity] = useState([]);
  const [currency, setCurrency] = useState(null)
  const [orderType, setOrderType] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [addressTab, setAddressTab] = useState("bill");
  const [shipAddress, setShipAddress] = useState("primary");
  const [billSynced, setBillSynced] = useState(true);
  const [paymentTerm, setPaymentTerm] = useState("Net 30");
  const [billAddress, setBillAddress] = useState(null);
  const [customerAddresses, setCustomerAddresses] = useState({ ship: [], bill: [] });
  const [sourcePlant, setSourcePlant] = useState("PLT-01");
  const [destinationPlant, setDestinationPlant] = useState("PLT-02");
  const [items, setItems] = useState([]);
  const [catalogRow, setCatalogRow] = useState(null);
  const [discountMode, setDiscountMode] = useState("pct");
  const [docDiscount, setDocDiscount] = useState(0);
  const [taxes, setTaxes] = useState([{ id: 1, name: "GST", code: "GST-9", rate: 9 }]);
  const [charges, setCharges] = useState([{ id: 1, name: "Freight", amount: 0, taxable: "Yes" }]);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [toast, setToast] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [logistics, setLogistics] = useState({ preCarriageBy: "", finalDestination: "", containerType: "", packingMethod: "", incoterm: "", placeOfIncoterm: "", leadTime: "", validityDate: "", paymentTerms: "", remarks: "", });
  const { loading, listOfCustomer, error, entityMaster , listOfItems } = useSelector((state) => state.orderProcess);
  const { master } = useSelector((state) => state.proformaInvoice);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [orderDate, setOrderDate] = useState("2026-05-22");
  const [desiredShipDate, setDesiredShipDate] = useState("2026-06-05");
  const [customerPo, setCustomerPo] = useState("");
  const [emailRef, setEmailRef] = useState("");
  const [notifyParty, setNotifyParty] = useState({
    name: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });
  console.log(master);
  
  const config = orderType ? ORDER_TYPES[orderType] : null;
  const theme = THEME[orderType || "std"];
  const isExternal = config ? config.showDiscTax : true;
  const showCustomer = config ? config.showCustomer : true;
  const showAddress = config ? config.showAddress : true;
  const showPlant = config ? config.showPlant : false;
  const steps = config?.steps || ORDER_TYPES.std.steps;
  const dispatch = useDispatch();

  useEffect(() => {
    const dismissPopovers = (event) => {
      if (!event.target.closest("[data-customer-picker]")) setCustomerOpen(false);
      if (!event.target.closest("[data-catalog-cell]") && !event.target.closest("[data-catalog-outside]")) setCatalogRow(null);
    };
    document.addEventListener("mousedown", dismissPopovers);
    return () => {
      document.removeEventListener("mousedown", dismissPopovers);
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  const catalogueMap = useMemo(() => {
  const map = {};

  (listOfItems?.data?.tyre || []).forEach(item => {
    if (!item.processID) return;
    const pidStr = String(item.processID).trim().toLowerCase();
    map[pidStr] = {
      type:        "TYRE",
      code:        String(item.processID),
      desc:        item.piD_Details || "",
      price:       0,                          // tyre price resolved below via assembly
      _raw:        item,
    };
  });

  // Assembly prices also update the tyre entry price
  (listOfItems?.data?.assemblyTyre || []).forEach(item => {
    // Assembly keyed by assY_PID
    if (item.assY_PID) {
      const assyPidStr = String(item.assY_PID).trim().toLowerCase();
      map[assyPidStr] = {
        type:        "ASSEMBLY",
        code:        String(item.assY_PID),
        desc:        item.piD_Details || "",
        price:       Number(item.price) || 0,
        _raw:        item,
      };
    }
    // Also patch tyre entry price using processID match
    if (item.processID) {
      const pidStr = String(item.processID).trim().toLowerCase();
      if (map[pidStr]) {
        map[pidStr].price = Number(item.price) || 0;
      }
    }
    // Also key by processID so user can type processID and get assembly data
    if (item.processID) {
      const pidStr = String(item.processID).trim().toLowerCase();
      // Only set if not already set by a cleaner tyre entry
      if (!map[pidStr] || map[pidStr].type === "TYRE") {
        // Keep TYRE entry but upgrade the price
        if (map[pidStr]) {
          map[pidStr].price = Number(item.price) || 0;
        }
      }
    }
  });

  (listOfItems?.data?.rim || []).forEach(item => {
    if (!item.edcno) return;
    const edcStr = String(item.edcno).trim().toLowerCase();
    map[edcStr] = {
      type:        "RIM",
      code:        String(item.edcno),
      desc:        item.riM_Details || "",
      price:       0,
      _raw:        item,
    };
  });

  return map;
}, [listOfItems]);

const resolveImportCode = (rawCode) => {
  if (!rawCode) return { valid: false, message: "Item code missing" };

  const key = rawCode.trim().toLowerCase();
  const entry = catalogueMap[key];

  if (!entry) {
    return {
      valid: false,
      message: "Item not assigned to this customer",
    };
  }

  return { valid: true, entry };
};

  useEffect(() => {
    dispatch(getListOfCustomer())
    dispatch(getMasterData())
  }, [dispatch])

  useEffect(() => {
  if (customer?.custID) {
    dispatch(getListOfItems(customer?.custID));
  }
}, [customer?.custID, dispatch]);

  console.log(entityMaster);

  const mappedEntities = (entityMaster || []).map((item) => ({
    ...item,
    id: item.entityID,
    code: item.entityCode,
    initials: item.entityShortName,
    name: item.entityName,
    currency: item.currencyCode,
    country: item.countryCode,
    taxRegion: item.taxRegion,
    // optional UI fields
    tone: "blue",
    location: item.countryCode,
  }));
  useEffect(() => {
    if (mappedEntities.length > 0 && !entity) {
      setEntity(mappedEntities[0]);
    }
  }, [mappedEntities, entity]);

  // ✅ ADD THIS ENTIRE useEffect BELOW:
  useEffect(() => {
    if (customer?.addresses?.length > 0) {

      const billAddresses = customer.addresses
        .filter(addr => Number(addr.addressType) === 2 || addr.addressType === "BILL_TO");

      const shipAddresses = customer.addresses
        .filter(addr => Number(addr.addressType) === 1 || addr.addressType === "SHIP_TO" || addr.addressType === "DELIVERY")
        .map(ship => {

          // Find matching bill address using billID
          const mappedBill = billAddresses.find(
            bill => bill.id === ship.billID
          );

          return {
            id: ship.id,
            type: "Shipping Address",

            first: ship.addressName || "",

            second: [
              ship.city,
              ship.stateName,
              ship.zipCode,
              ship.country
            ]
              .filter(Boolean)
              .join(", "),

            mobile: ship.mobile || "",

            billID: ship.billID,

            linkedBillAddress: mappedBill || null,

            original: ship
          };
        });

      const formattedBills = billAddresses.map(bill => ({
        id: bill.id,
        type: "Billing Address",

        first: bill.addressName || "",

        second: [
          bill.city,
          bill.stateName,
          bill.zipCode,
          bill.country
        ]
          .filter(Boolean)
          .join(", "),

        mobile: bill.mobile || "",

        original: bill
      }));

      setCustomerAddresses({
        ship: shipAddresses,
        bill: formattedBills
      });

      // Auto select first ship
      if (shipAddresses.length > 0) {
        setShipAddress(shipAddresses[0].id);

        // Auto map corresponding bill
        if (shipAddresses[0].linkedBillAddress) {
          setBillAddress(
            shipAddresses[0].linkedBillAddress.id
          );
        }
      }

    } else {

      setCustomerAddresses({
        ship: [],
        bill: []
      });

      setShipAddress(null);
      setBillAddress(null);
    }

  }, [customer]);

  const currencyCode = customer?.currency || "USD";

  const formatMoney = (number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(Number(number) || 0);
  const totals = useMemo(() => {
    const gross = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const lineDiscount = isExternal ? items.reduce((sum, item) => sum + item.qty * item.price * item.disc / 100, 0) : 0;
    const net = gross - lineDiscount;
    const docDiscountValue = Number(docDiscount) || 0;
    const documentDiscount = !isExternal || discountMode === "none" ? 0 : discountMode === "pct" ? net * docDiscountValue / 100 : Math.min(net, docDiscountValue);
    const taxable = net - documentDiscount;
    const totalTax = isExternal ? taxes.reduce((sum, tax) => sum + taxable * (Number(tax.rate) || 0) / 100, 0) : 0;
    const totalCharges = isExternal ? charges.reduce((sum, charge) => sum + (Number(charge.amount) || 0), 0) : 0;
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
    setItems((current) => current.map((row) => row.id === rowId ? { ...row, code: item.code, desc: item.name, uom: item.uom || "EA", price: item.price, _itemType: item._itemType || row._itemType, isInvalid: false, errorMessage: "" } : row));
    setCatalogRow(null);
    notify(`${ICONS.item} ${item.name || item.code} selected`);
  };

  const allowedItems = useMemo(() => {
  const tyre =
    listOfItems?.data?.tyre?.map((item) => ({
      key: item.processID,
      type: "TYRE",
    })) || [];

  const rim =
    listOfItems?.data?.rim?.map((item) => ({
      key: item.edcno,
      type: "RIM",
    })) || [];

  const assembly =
    listOfItems?.data?.assemblyTyre?.map((item) => ({
      key: item.assY_PID,
      type: "ASSEMBLY",
    })) || [];

  return [...tyre, ...rim, ...assembly];
}, [listOfItems]);

const validateImportedItem = (code) => {
  if (!code) {
    return {
      valid: false,
      message: "Item code missing",
    };
  }

  const found = allowedItems.find(
    (item) => item.key?.toLowerCase() === code.toLowerCase()
  );

  if (!found) {
    return {
      valid: false,
      message: "No this item assign for this customer",
    };
  }

  return {
    valid: true,
    type: found.type,
  };
};

const importPasted = () => {
  try {
    const rows = pasteText.trim().split(/\r?\n/).filter(Boolean);
    if (!rows.length) { notify("No pasted data found"); return; }

    // Detect header row — skip if first column looks like a label
    const firstCell = rows[0].split(/\t|,/)[0].trim().toLowerCase();
    const hasHeader = firstCell === "processid" || firstCell === "process id" || firstCell === "id";
    const dataRows  = hasHeader ? rows.slice(1) : rows;

    const results   = { added: [], invalid: [] };

    dataRows.forEach((row, i) => {
      const cols    = row.split(/\t|,/).map(c => c.trim());
      const rawCode = cols[0] || "";
      const rawQty  = Math.max(1, Number(cols[1]) || 1);

      const resolved = resolveImportCode(rawCode);

      if (!resolved.valid) {
        results.invalid.push({ row: i + (hasHeader ? 2 : 1), code: rawCode, reason: resolved.message });
results.added.push({
  id:           nextId.current++,
  code:         rawCode,
  customerPartNo: "",
  desc:         "—",
  qty:          rawQty,
  price:        0,
  disc:         0,
  tax:          0,
  isInvalid:    true,
  errorMessage: resolved.message,
});
        return;
      }

      // Use DB data — ignore any other columns from paste
      const { entry } = resolved;
      results.added.push({
        id:            nextId.current++,
        code:          entry.code,
        customerPartNo: "",
        desc:          entry.desc,
        qty:           rawQty,
        price:         entry.price,
        disc:          0,
        tax:           9,
        _itemType:     entry.type,
        _raw:          entry._raw,
      });
    });
      setItems(prev => [...prev, ...results.added]);
    setPasteText("");
setPasteOpen(false);

    // Build notification message
    if (results.invalid.length === 0) {
      notify(`📋 ${results.added.length} item(s) imported successfully`);
    } else {
      const errLines = results.invalid
        .map(e => `Row ${e.row}: "${e.code}" — ${e.reason}`)
        .join("\n");
      notify(
        `📋 ${results.added.length} imported, ${results.invalid.length} rejected:\n${errLines}`
      );
      // Also surface a more visible alert so errors aren't missed in toast
      console.warn("Import errors:\n" + errLines);
    }

  } catch (err) {
    console.error(err);
    notify("Paste import failed");
  }
};
  const simulateDocumentImport = async (event, type) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    notify(`${ICONS.sheet} Reading ${file.name}…`);
    const data      = await file.arrayBuffer();
    const workbook  = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData  = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData.length) { notify("No data found in Excel file"); return; }

    const results = { added: [], invalid: [] };

    jsonData.forEach((row, i) => {
      // Accept any of these column names for the ID
    const rawCode = (
  row["Process ID"]     ||
  row["processID"]      ||
  row["ProcessID"]      ||
  row["process id"]     ||
  row["assemblyProcessID"] ||
  row["Assembly PID"]   ||
  row["EDC No"]         ||
  row["edcno"]          ||
  ""
).toString().trim();

const customerPartNo = (
  row["Customer Part No"] ||
  row["customerPartNo"]   ||
  row["customer part no"] ||
  ""
).toString().trim();

const rawQty = Math.max(1, Number(row["Qty"] || row["qty"] || row["QTY"] || 1) || 1);

      const resolved = resolveImportCode(rawCode);

      if (!resolved.valid) {
        results.invalid.push({ row: i + 2, code: rawCode, reason: resolved.message });
results.added.push({
  id:             nextId.current++,
  code:           rawCode,
  customerPartNo: customerPartNo || "",
  desc:           `—`,
  qty:            rawQty,
  price:          0,
  disc:           0,
  tax:            0,
  isInvalid:      true,
  errorMessage:   resolved.message,
});
        return;
      }

      // ALL values come from DB — Excel qty is the only thing we trust
      const { entry } = resolved;
      results.added.push({
        id:            nextId.current++,
        code:          entry.code,
        customerPartNo: customerPartNo,
        desc:          entry.desc,       // ← from DB, not Excel
        qty:           rawQty,           // ← only qty from Excel
        price:         entry.price,      // ← from DB
        disc:          0,
        tax:           9,
        _itemType:     entry.type,
        _raw:          entry._raw,
      });
    });

    
      setItems(prev => [...prev, ...results.added]);
    

    if (results.invalid.length === 0) {
      notify(`${ICONS.sheet} ${results.added.length} item(s) imported`);
    } else {
      notify(
        `${ICONS.sheet} ${results.added.length} imported, ${results.invalid.length} rejected — check console`
      );
      console.warn(
        "Excel import errors:\n" +
        results.invalid.map(e => `Row ${e.row}: "${e.code}" — ${e.reason}`).join("\n")
      );
    }

  } catch (err) {
    console.error(err);
    notify("Excel import failed");
  }

  event.target.value = "";
};
  const downloadTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ["processID", ,"discription","qty"],
    ["P-001338",  ,"POB",10   ],
    ["00501R02",  ,"SRT",5    ],
    ["P001338A",  ,"NUMA",2    ],
  ]);

  // Column widths
  ws["!cols"] = [{ wch: 20 }, { wch: 8 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Import Template");
  XLSX.writeFile(wb, "sales-order-import-template.xlsx");
  notify(`${ICONS.download} Excel template downloaded`);
};

  const source = PLANTS.find((plant) => plant.id === sourcePlant);
  const destination = PLANTS.find((plant) => plant.id === destinationPlant);
  // const filteredCustomers = CUSTOMER_DATA.filter((candidate) => `${candidate.name} ${candidate.code}`.toLowerCase().includes(customerSearch.toLowerCase()));
  const mappedCustomers = (listOfCustomer || []).map((customer) => {
    const billAddress = customer.addresses?.find(
      (addr) => Number(addr.addressType) === 2 || addr.addressType === "BILL_TO"
    );

    return {
      custID: customer.custID,
      code: customer.customerCode,
      name: customer.customerName,
      username: customer.username,
      initials: customer.customerName?.slice(0, 2)?.toUpperCase() || "CU",
      tone: "blue",
      custMobile: customer.custMobile,
      email: customer.userMail,
      currency: customer.currency,
      terms: customer.paymentTerms,
      credit: customer.salesLimit || 0,
      lead: customer?.lead || "",
      city: billAddress?.city || "",
      phone: billAddress?.mobile || "",

      billAddress,
      addresses: customer.addresses || [],
    };
  });
  useEffect(() => {
    if (mappedCustomers.length > 0 && !customer) {
      setCustomer(mappedCustomers[0]);
    }
  }, [mappedCustomers, customer]);

  const filteredCustomers = mappedCustomers.filter((candidate) =>
    `${candidate.name} ${candidate.code}`
      .toLowerCase()
      .includes(customerSearch.toLowerCase())
  );

  // Helper to map UI form states to the data structure expected by ProformaPDF
  const mapFormToPDFData = () => {
    const activeShipAddress = customerAddresses.ship.find(addr => addr.id === shipAddress);
    const activeBillAddress = customerAddresses.bill.find(addr => addr.id === billAddress);

    // Dynamic GST Charges derived from taxes array
    const gstItem = taxes.find(t => t.name.toUpperCase().includes("GST") || t.name.toUpperCase().includes("TAX"));
    const gstRate = gstItem ? gstItem.rate : 0;
    const gstCharges = {
      percentage: gstRate,
      type: gstItem?.name?.toUpperCase() === "IGST" ? "IGST" : "CGST_SGST",
      cgst: gstRate / 2,
      sgst: gstRate / 2,
      igst: gstRate,
    };

    // Mapping items
    const mappedItems = items.map((item, index) => {
      // If added via catalog selection or imported, item._raw contains database fields.
      // If manually typed, we fallback to the UI-entered item values.
      return {
        srNo: index + 1,
        partNumber: item.customerPartNo || item.partNumber || "",
        itemCode: item.code || item.itemCode || "",
        PONumber: item.PONumber || customerPo || "",
        category: item._raw?.category || item.category || "",
        tyreSize: item._raw?.tyreSize || item.tyreSize || "",
        tyreRim: item._raw?.tyreRim || item.tyreRim || "",
        brand: item._raw?.brand || item.brand || "",
        sidewall: item._raw?.sidewall || item.sidewall || "",
        tyreType: item._raw?.tyreType || item.tyreType || "",
        assyRimstatus: item._raw?.assyRimstatus || item._itemType === "ASSEMBLY" || false,
        edcNo: item._raw?.edcNo || item._raw?.edcno || item.edcNo || "",
        color: item._raw?.color || item.color || "",
        des: item._raw?.des || item.des || "",
        itemQty: Number(item.qty || 0),
        finishedWt: Number(item._raw?.finishedWt || item._raw?.finishedwt || item.finishedWt || 0),
        rimfinishedwt: Number(item._raw?.rimWt || item._raw?.rimfinishedwt || item.rimfinishedwt || 0),
        basicPrice: Number(item.price || 0),
        rimUnitPrice: Number(item.rimUnitPrice || 0),
      };
    });

    // Mapping additional charges
    const mappedCharges = [
      {
        total: charges.reduce((sum, c) => sum + Number(c.amount || 0), 0),
        rows: charges.map(c => ({
          desc: c.name || "Charge",
          value: Number(c.amount || 0),
        })),
      }
    ];

    // Mapping discounts
    const mappedDiscounts = [
      {
        total: totals.lineDiscount + totals.documentDiscount,
        rows: [
          ...(totals.lineDiscount > 0 ? [{ desc: "Line Discount", value: totals.lineDiscount }] : []),
          ...(totals.documentDiscount > 0 ? [{ desc: discountMode === "pct" ? `Doc Discount (${docDiscount}%)` : "Doc Discount (Flat)", value: totals.documentDiscount }] : []),
        ],
      }
    ];

    // Selected plant
    const source = PLANTS.find((plant) => plant.id === sourcePlant);

    return {
      // ── Exporter / Entity details ──────────────────────────────────────────
      // Spreading item in mappedEntities preserves fields like exporterAddressFormatted
      exportAuthorisedAddress: entity?.exporterAddressFormatted || entity?.exportAuthorisedAddress || entity?.exporterAuthorizedAddress || entity?.entityAddress || entity?.address || "SUNDARAM INDUSTRIES PRIVATE LIMITED\nMMN & PDK PLANT",
      plantAddress: source?.location || "",
      authorisedSignature: entity?.entityName || "",
      custFullName: customer?.name || "",

      // ── Billing Address ──────────────────────────────────────────────────────
      billingCompanyName: customer?.name || "",
      billingAddress: activeBillAddress?.first || "",
      billingCity: activeBillAddress?.original?.city || "",
      billingState: activeBillAddress?.original?.stateName || "",
      billingCountry: activeBillAddress?.original?.country || "",
      billingZipcode: activeBillAddress?.original?.zipCode || "",
      billingContactName: activeBillAddress?.original?.contactName || customer?.name || "",
      billingEmailId: activeBillAddress?.original?.emailId || customer?.email || "",
      billingMobile: activeBillAddress?.original?.mobile || customer?.phone || "",

      // ── Shipping Address ─────────────────────────────────────────────────────
      shippingCompanyName: customer?.name || "",
      shippingAddress: activeShipAddress?.first || "",
      shippingCity: activeShipAddress?.original?.city || "",
      shippingState: activeShipAddress?.original?.stateName || "",
      shippingCountry: activeShipAddress?.original?.country || "",
      shippingZipcode: activeShipAddress?.original?.zipCode || "",
      shippingContactName: activeShipAddress?.original?.contactName || "",
      shippingEmailId: activeShipAddress?.original?.emailId || "",
      shippingMobile: activeShipAddress?.original?.mobile || "",

      // ── Notify Party ─────────────────────────────────────────────────────────
      notifyPartyName: notifyParty.name || "",
      notifyPartyAddress: notifyParty.street || "",
      notifyPartyCity: notifyParty.city || "",
      notifyPartyState: notifyParty.state || "",
      notifyPartyZipcode: notifyParty.zip || "",
      notifyPartyCountry: notifyParty.country || "",
      notifyPartyEmail: notifyParty.email || "",
      notifyPartyPhone: notifyParty.phone || "",

      // ── Carriage / Logistics ─────────────────────────────────────────────────
      preCarriageBy: logistics.preCarriageBy || "",
      packingMethod: logistics.packingMethod || "",
      containerType: logistics.containerType || "",
      leadTime: logistics.leadTime || "",
      incoterm: logistics.incoterm || "",
      placeOfIncoterm: logistics.placeOfIncoterm || "",
      validityDate: logistics.validityDate || "",

      // ── References & Date ────────────────────────────────────────────────────
      BuyersOrderNumber: customerPo || "",
      Date: orderDate || "",
      EmailDate: emailRef || "",
      orderRefNo: "SO-2026-0413", // display reference code
      paymentTerms: logistics.paymentTerms || paymentTerm || customer?.terms || "",
      bankDetails: entity?.bankDetails || entity?.bankAddressFormatted || "",
      userCurrency: customer?.currency || entity?.currency || "USD",

      // ── Items, Charges, Discounts, Taxes ─────────────────────────────────────
      items: mappedItems,
      gstCharges,
      additionalCharges: mappedCharges,
      discountDetails: mappedDiscounts,
      custInstruction: logistics.remarks || "", // mapped dynamic remarks

      // ── Fields not available in UI (documented per instructions) ────────────
      // revisionNumber: No revision number input field exists in the form UI.
      // revisionDate: No revision date input field exists in the form UI.
      // containerNo: No container number input field exists in the form UI.
    };
  };


  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800 dark:bg-[#0c0e13] dark:text-slate-100">
      <main className="mx-auto max-w-[1400px] p-2 sm:p-4">
        <motion.div {...rise} className="mb-5 flex items-start justify-between gap-4">
          <div><h1 className="bg-gradient-to-br from-slate-900 to-slate-500 bg-clip-text font-serif text-3xl text-transparent dark:from-white dark:to-slate-400">New Sales Order</h1><p className="mt-1 text-[11px] text-slate-500">{config?.info || "Select entity and order type - form adapts to your selection"}</p></div>
          <div className="flex">
            <div className="flex items-center gap-2">
               <ExistingOrdersButton onClick={() => setOrdersOpen(true)} />
              <code className="rounded-lg border border-[var(--border)] bg-[var(--primary)]/5 px-2 py-1.5 text-[14px] text-[var(--primary)]">REF# SO-2026-0413</code>
              <button className={cx(MUTED, "hidden sm:block")} type="button" onClick={() => notify(`${ICONS.save} Draft saved - SO-2026-0413`)}>Save Draft</button>
              <button className={PRIMARY} type="button" onClick={() => orderType ? notify(`${ICONS.rocket} Order submitted successfully!`) : notify("Please select an order type first")}>Submit</button>
            </div>
            {/* <Draft /> */}
          </div>
        </motion.div>

        <motion.div layout className="mb-4 flex min-h-14 items-center overflow-x-auto rounded-xl border border-slate-200 bg-white px-5 py-2.5 shadow-sm dark:border-slate-800 dark:bg-[#111318] dark:shadow-none">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <motion.div layout className={cx("flex shrink-0 items-center gap-2 text-[10px] font-semibold", index < 2 ? "text-emerald-400" : index === 2 ? theme.text : "text-slate-500")}>
                <b className={cx("flex size-[22px] items-center justify-center rounded-full border bg-slate-100 dark:bg-[#161820]", index < 2 ? "border-emerald-400 bg-emerald-400/15" : index === 2 ? theme.border + " " + theme.bg : "border-slate-300 dark:border-slate-700")}>{index < 2 ? "\u2713" : index + 1}</b>
                {step}
              </motion.div>
              {index < steps.length - 1 && <i className={cx("mx-2 h-px min-w-4 flex-1 bg-slate-200 not-italic dark:bg-slate-800", index < 2 && "bg-emerald-500/30 dark:bg-emerald-500/30")} />}
            </React.Fragment>
          ))}
        </motion.div>

        {/* <AnimatePresence mode="wait">
            {config && (
              <motion.div key={orderType} {...rise} className={cx("mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3", theme.border, theme.bg)}>
                <span className="text-xl">{config.icon}</span><div className="flex-1"><strong className="text-xs">{config.name}</strong><p className="text-[10px] text-slate-400">{config.description}</p></div>
                <div className="flex flex-wrap gap-1.5">{config.skips.map((skip) => <span className={cx("rounded-full border px-2 py-1 text-[9px] font-bold uppercase", theme.border, theme.text)} key={skip}>{skip} - N/A</span>)}</div>
              </motion.div>
            )}
          </AnimatePresence> */}

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <Panel section="entity" title="Company Entity" icon={ICONS.entity} badge="Step 1" collapsed={collapsed.entity} onToggle={togglePanel}>
              <Info>Entity determines legal company, currency, tax rules and available warehouses/plants.</Info>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {mappedEntities.map((item) => (
                  <motion.button
                    whileHover={{ y: -2 }}
                    key={item.code}
                    type="button"
                    className={cx(
                      "relative rounded-lg border bg-slate-50 p-3 text-left transition dark:bg-slate-800",
                      entity?.code === item.code
                        ? "border-amber-400 bg-amber-500/[.05] dark:bg-amber-500/[.05]"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                    )}
                    onClick={() => {
                      setEntity(item);
                      notify(
                        `${ICONS.entity} Entity: ${item.name} (${item.currency})`
                      );
                    }}
                  >
                    {entity?.code === item.code && <Tick />}

                    <b
                      className={cx(
                        "mb-2 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br text-xs text-white",
                        AVATAR[item.tone]
                      )}
                    >
                      {item.initials}
                    </b>

                    <strong className="block text-xs">{item.name}</strong>

                    <code className="block text-[9px] text-slate-500">
                      {item.code}
                    </code>

                    <small className="text-[10px] text-slate-600">
                      {item.location}
                    </small>
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
                <Field label="Order Date" required>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </Field>
                <Field label="Desired Ship Date" required>
                  <input
                    type="date"
                    value={desiredShipDate}
                    onChange={(e) => setDesiredShipDate(e.target.value)}
                  />
                </Field>
                {!["mts", "tri", "ipt"].includes(orderType) && (
                  <>
                    <Field label="Customer PO #">
                      <input
                        placeholder="Their reference"
                        value={customerPo}
                        onChange={(e) => setCustomerPo(e.target.value)}
                      />
                    </Field>
                    <Field label="Email Reference #">
                      <input
                        placeholder="Email REF / Order ref"
                        value={emailRef}
                        onChange={(e) => setEmailRef(e.target.value)}
                      />
                    </Field>
                  </>
                )}
              </Grid>
              <AnimatePresence>{orderType === "blk" && <motion.div {...rise}><Divider>Agreement Details</Divider><Grid><Field label="Agreement Start"><input type="date" defaultValue="2026-06-01" /></Field><Field label="Agreement End"><input type="date" defaultValue="2026-12-31" /></Field><Field label="Release Frequency"><select><option>Monthly</option><option>Weekly</option><option>Quarterly</option></select></Field><Field label="Max Release Qty"><input type="number" placeholder="Total agreed qty" /></Field><Field label="Min Order Value"><input type="number" placeholder="Min per release" /></Field><Field label="Auto Release"><select><option>Manual</option><option>Auto on Date</option></select></Field></Grid></motion.div>}</AnimatePresence>
            </Panel>

            <AnimatePresence>
              {showCustomer && <CustomerPanel key="customer" customer={customer} entity={entity} open={customerOpen} search={customerSearch} filtered={filteredCustomers} collapsed={collapsed.customer} onToggle={togglePanel} onOpen={() => setCustomerOpen((open) => !open)} onSearch={setCustomerSearch} onSelect={(entry) => { setCustomer(entry); setCustomerOpen(false); setCustomerSearch(""); notify(`${ICONS.customer} ${entry.name} loaded from master`); }} />}
              {/* {showAddress && <AddressPanel key="address" tab={addressTab} setTab={setAddressTab} shipAddress={shipAddress} setShipAddress={setShipAddress} billSynced={billSynced} setBillSynced={setBillSynced} paymentTerm={paymentTerm} setPaymentTerm={setPaymentTerm} entity={entity} notify={notify} collapsed={collapsed.address} onToggle={togglePanel} />} */}
              {showAddress && <AddressPanel
                key="address"
                tab={addressTab}
                setTab={setAddressTab}
                shipAddress={shipAddress}
                setShipAddress={setShipAddress}
                billAddress={billAddress}
                setBillAddress={setBillAddress}
                customerAddresses={customerAddresses}
                paymentTerm={paymentTerm}
                setPaymentTerm={setPaymentTerm}
                entity={entity}
                notify={notify}
                collapsed={collapsed.address}
                onToggle={togglePanel}
                notifyParty={notifyParty}
                setNotifyParty={setNotifyParty}
              />}
              {showPlant && <PlantPanel key="plant" type={orderType} sourcePlant={sourcePlant} destinationPlant={destinationPlant} setSourcePlant={setSourcePlant} setDestinationPlant={setDestinationPlant} notify={notify} collapsed={collapsed.plant} onToggle={togglePanel} />}
            </AnimatePresence>

            <ItemsPanel config={config} items={items} isExternal={isExternal} catalogRow={catalogRow} setCatalogRow={setCatalogRow} updateItem={updateItem} chooseCatalogItem={chooseCatalogItem} appendItem={appendItem} setItems={setItems} formatMoney={formatMoney} simulateDocumentImport={simulateDocumentImport} setPasteOpen={setPasteOpen} downloadTemplate={downloadTemplate} notify={notify} collapsed={collapsed.items} onToggle={togglePanel} onOpenSelector={() => setSelectorOpen(true)} catalogueMap={catalogueMap} />
            <AnimatePresence>
              {/* {isExternal && <DiscountPanel taxes={taxes} setTaxes={setTaxes} charges={charges} setCharges={setCharges} discountMode={discountMode} setDiscountMode={setDiscountMode} docDiscount={docDiscount} setDocDiscount={setDocDiscount} entity={entity} totals={totals} formatMoney={formatMoney} nextId={nextId} collapsed={collapsed.discount} onToggle={togglePanel} />} */}
              {isExternal && (
                <> 
                   <DiscountPanel taxes={taxes} setTaxes={setTaxes} charges={charges} setCharges={setCharges} discountMode={discountMode} setDiscountMode={setDiscountMode} docDiscount={docDiscount} setDocDiscount={setDocDiscount} entity={entity} totals={totals} formatMoney={formatMoney} nextId={nextId} collapsed={collapsed.discount} onToggle={togglePanel} />
                   <LogisticsPanel logistics={logistics} setLogistics={setLogistics} collapsed={collapsed.logistics} onToggle={togglePanel} />
              </>)}
            </AnimatePresence>
          </div>

          <Sidebar config={config} theme={theme} entity={entity} customer={customer} showCustomer={showCustomer} showPlant={showPlant} source={source} destination={destination} orderType={orderType} isExternal={isExternal} items={items} totals={totals} formatMoney={formatMoney} notify={notify} onPreview={() => setPreviewOpen(true)} />
        </div>
        <ItemSelectorDrawer
          open={selectorOpen}
          onClose={() => setSelectorOpen(false)}
          onConfirm={(lines) => setItems(prev => [...prev, ...lines])}
          nextId={nextId}
          notify={notify}
          customer={customer}
        />
      </main>

      <AnimatePresence>
        {pasteOpen && <PasteModal pasteText={pasteText} setPasteText={setPasteText} onClose={() => setPasteOpen(false)} onImport={importPasted} />}
        {toast && <motion.div key="toast" {...rise} className="fixed bottom-5 left-1/2 z-[999] -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-[#111318] dark:text-white">{toast}</motion.div>}
        <ExistingOrdersModal
          open={ordersOpen}
          onClose={() => setOrdersOpen(false)}
          onOpen={() => setOrdersOpen(false)}   // "New Order" button inside modal just closes it
        />
        {previewOpen && (
          <PDFPreviewModal
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            data={mapFormToPDFData()}
          />
        )}
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
              {customer && <Avatar item={customer} />}<span className="flex-1"><strong className="block text-xs text-slate-800 dark:text-slate-100">{customer?.name}</strong><small className="normal-case tracking-normal text-slate-500">{customer?.code} - {customer?.terms} - Credit {customer?.currency} {customer?.credit}</small></span><em className="text-[10px] not-italic text-slate-500">Change &gt;</em>
            </button>
            <AnimatePresence>{open && <motion.div {...rise} className="absolute left-0 right-0 top-[calc(100%+5px)] z-30 max-h-[350px] overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
              <label className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">{ICONS.search}<input autoFocus value={search} placeholder="Search customer..." className="flex-1 bg-transparent text-xs text-slate-800 outline-none dark:text-white" onChange={(event) => onSearch(event.target.value)} /></label>
              {filtered.map((entry) => <button className="flex w-full items-center gap-2 border-b border-slate-200 px-3 py-2 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50" type="button" key={entry.code} onClick={() => onSelect(entry)}><Avatar item={entry} /><span className="flex-1"><strong className="block text-xs normal-case tracking-normal text-slate-800 dark:text-white">{entry.name}</strong><small className="normal-case tracking-normal text-slate-500">{entry.code} - {entry.city}</small></span><em className="text-[10px] not-italic text-emerald-500 dark:text-emerald-400">{entry.credit === "0" ? "COD" : `${entry.currency} ${entry.credit}`}</em></button>)}
            </motion.div>}</AnimatePresence>
          </div>
        </Field>
        <Grid className="mt-3"><Field label="scot User ID"><input value={customer?.username || ""} readOnly /></Field><Field label="Email"><input type="email" value={customer?.email || ""} readOnly /></Field><Field label="Phone"><input value={customer?.custMobile} /></Field> <Field label="Sales Rep"><input value={customer?.lead || ""} readOnly /></Field><Field label="PO Date"><input type="date" /></Field>
          {/* <Field label="Tax Reg #"><input placeholder="GST/VAT number" /></Field> */}<Field label="Currency"><input value={customer?.currency} readOnly /></Field>
        </Grid>
      </Panel>
    </motion.div>
  );
}

function AddressPanel({
  tab, setTab,
  shipAddress, setShipAddress,
  billAddress, setBillAddress,
  paymentTerm, setPaymentTerm,
  entity, notify,
  collapsed, onToggle,
  customerAddresses = { ship: [], bill: [] },
  notifyParty,
  setNotifyParty
}) {
  return (
    <motion.div {...rise}>
      <Panel section="address" title="Ship / Bill / Payment" icon={ICONS.address} badge="Step 4" collapsed={collapsed} onToggle={onToggle}>
        <div className="mb-3 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-[#0c0e13]">
          {[["bill", `${ICONS.pay} Bill To`], ["ship", `${ICONS.truck} Ship To`], ["pay", `${ICONS.bank} Payment`]].map(([id, label]) => <button key={id} type="button" className={cx("flex-1 rounded-md py-2 text-xs font-semibold text-slate-500", tab === id && "bg-white text-slate-900 shadow dark:bg-[#111318] dark:text-white")} onClick={() => setTab(id)}>{label}</button>)}
        </div>
        <AnimatePresence mode="wait">
          {tab === "ship" && <motion.div key="ship" {...rise}>
            {customerAddresses?.ship?.length > 0
              ? customerAddresses.ship
                .filter((address) => !billAddress || Number(address.billID) === Number(billAddress))
                .map((address) => (
                  <Address
                    key={address.id}
                    selected={shipAddress === address.id}
                    address={address}
                    onClick={() => {
                      setShipAddress(address.id);
                      if (address.linkedBillAddress) {
                        setBillAddress(address.linkedBillAddress.id);
                      }
                      notify(`${ICONS.address} Address selected`);
                    }}
                  />
                ))
              : ADDRESSES.map((address) => (
                <Address
                  key={address.id}
                  selected={shipAddress === address.id}
                  address={address}
                  onClick={() => {
                    setShipAddress(address.id);
                    // Auto map bill address
                    if (address.linkedBillAddress) {
                      setBillAddress(address.linkedBillAddress.id);
                    }
                    notify(`${ICONS.address} Address selected`);
                  }}
                />
              ))
            }<Divider>Agent Or notify address</Divider>
            <Grid columns={3}>
              <Field label="Name">
                <input
                  placeholder="Enter name"
                  value={notifyParty?.name || ""}
                  onChange={(e) => setNotifyParty(prev => ({ ...prev, name: e.target.value }))}
                />
              </Field>
              <Field label="Phone">
                <input
                  placeholder="Phone"
                  value={notifyParty?.phone || ""}
                  onChange={(e) => setNotifyParty(prev => ({ ...prev, phone: e.target.value }))}
                />
              </Field>
              <Field label="Email">
                <input
                  placeholder="Email"
                  value={notifyParty?.email || ""}
                  onChange={(e) => setNotifyParty(prev => ({ ...prev, email: e.target.value }))}
                />
              </Field>
              <Field label="Street" wide>
                <input
                  placeholder="Street address"
                  value={notifyParty?.street || ""}
                  onChange={(e) => setNotifyParty(prev => ({ ...prev, street: e.target.value }))}
                />
              </Field>
              <Field label="City">
                <input
                  placeholder="City"
                  value={notifyParty?.city || ""}
                  onChange={(e) => setNotifyParty(prev => ({ ...prev, city: e.target.value }))}
                />
              </Field>
              <Field label="State">
                <input
                  placeholder="State"
                  value={notifyParty?.state || ""}
                  onChange={(e) => setNotifyParty(prev => ({ ...prev, state: e.target.value }))}
                />
              </Field>
              <Field label="ZIP">
                <input
                  placeholder="ZIP"
                  value={notifyParty?.zip || ""}
                  onChange={(e) => setNotifyParty(prev => ({ ...prev, zip: e.target.value }))}
                />
              </Field>
              <Field label="Country">
                <select
                  value={notifyParty?.country || "United States"}
                  onChange={(e) => setNotifyParty(prev => ({ ...prev, country: e.target.value }))}
                >
                  <option value="United States">United States</option>
                  <option value="Singapore">Singapore</option>
                  <option value="India">India</option>
                </select>
              </Field>
            </Grid>
          </motion.div>}
          {tab === "bill" &&
            <motion.div key="bill" {...rise}>
              {customerAddresses?.bill?.length > 0
                ? customerAddresses.bill
                  .map((address) => (
                    <Address
                      key={address.id}
                      selected={billAddress === address.id}
                      address={address}
                      onClick={() => {
                        setBillAddress(address.id);
                        // Auto-select first matching shipping address
                        const matchingShips = customerAddresses?.ship?.filter(
                          (ship) => Number(ship.billID) === Number(address.id)
                        );
                        if (matchingShips && matchingShips.length > 0) {
                          setShipAddress(matchingShips[0].id);
                        } else {
                          setShipAddress(null);
                        }
                        notify(`${ICONS.address} Billing address selected`);
                      }}
                    />
                  ))
                : <Address
                  selected={billAddress === "default-bill"}
                  address={{
                    type: "Billing / Accounts",
                    first: "456 Finance Avenue, Floor 8",
                    second: "San Francisco, CA 94103 - USA",
                    isDefault: true
                  }}
                  onClick={() => { setBillAddress("default-bill"); }}
                />
              }

            </motion.div>}

          {tab === "pay" && <motion.div key="pay" {...rise}><Divider className="mt-0">Payment Terms</Divider><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{PAYMENT_TERMS.map(([name, desc]) => <motion.button whileHover={{ y: -1 }} key={name} type="button" className={cx("rounded-lg border border-slate-200 bg-slate-50 p-2 text-center dark:border-slate-700 dark:bg-slate-800", paymentTerm === name && "border-purple-500 bg-purple-500/[.08]")} onClick={() => { setPaymentTerm(name); notify(`${ICONS.pay} Payment: ${name}`); }}>
            <strong className={cx("block text-xs", paymentTerm === name && "text-purple-500 dark:text-purple-400")}>{name}</strong>
            <small className="text-[9px] text-slate-500">{desc}</small></motion.button>)}</div><Grid columns={2} className="mt-3">
              {/* <Field label="Payment Method"><select><option>Bank Transfer</option><option>Cheque</option><option>Credit Card</option></select></Field> */}
              <Field label="Bank Account"><select><option>Acme - DBS ****4521</option><option>Acme - OCBC ****8834</option></select></Field>
              </Grid>
            <Grid className="mt-3">
              {/* <Field label="Credit Limit"><input readOnly value={`${entity.currency} 50,000.00`} /></Field> */}
              {/* <Field label="Outstanding"><input readOnly value={`${entity.currency} 12,450.00`} /></Field> */}
              {/* <Field label="Available Credit"><input readOnly value={`${entity.currency} 37,550.00`} /></Field> */}
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

function ItemsPanel({
  config, items, isExternal,
  catalogRow, setCatalogRow,
  updateItem, chooseCatalogItem,
  appendItem, setItems,
  formatMoney,
  simulateDocumentImport,
  setPasteOpen, downloadTemplate,
  notify, collapsed, onToggle,
  onOpenSelector,
  catalogueMap = {},           // ← ADD THIS
}) {
  const tool =
    "relative flex min-w-[90px] flex-col items-center gap-1 rounded-lg border bg-slate-50 px-3 py-2 text-sm transition hover:-translate-y-0.5 dark:bg-slate-800";
  const cell =
    "w-full rounded-md border border-transparent bg-transparent p-1.5 text-xs text-slate-800 outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-500 focus:bg-blue-500/[.06] dark:text-white dark:hover:border-slate-700 dark:hover:bg-slate-800";

  // Type badge colours (matches drawer)
  const TYPE_PILL = {
    TYRE:     "bg-amber-500/10 text-amber-500 border-amber-400/40",
    RIM:      "bg-blue-500/10 text-blue-500 border-blue-400/40",
    ASSEMBLY: "bg-emerald-500/10 text-emerald-500 border-emerald-400/40",
  };

  // ── Search & filter state ────────────────────────────────────────────────
  const [lineSearch,   setLineSearch]   = useState("");
  const [activeType,   setActiveType]   = useState("ALL");
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const [selectedOnly, setSelectedOnly] = useState(false);

  const TYPE_STYLES = {
    ALL:      { bg: "bg-slate-500/10",   text: "text-slate-500",   border: "border-slate-400/50"  },
    TYRE:     { bg: "bg-amber-500/10",   text: "text-amber-500",   border: "border-amber-400/50"  },
    RIM:      { bg: "bg-blue-500/10",    text: "text-blue-500",    border: "border-blue-400/50"   },
    ASSEMBLY: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-400/50"},
    ITEM:     { bg: "bg-slate-500/10",   text: "text-slate-400",   border: "border-slate-300/50"  },
  };

  const typeCounts = useMemo(() => {
    const counts = { ALL: items.length, TYRE: 0, RIM: 0, ASSEMBLY: 0, ITEM: 0 };
    items.forEach(i => {
      const t = i._itemType || "ITEM";
      if (counts[t] !== undefined) counts[t]++;
    });
    return counts;
  }, [items]);

  const displayedItems = useMemo(() => {
    const q = lineSearch.toLowerCase();
    return items.filter(item => {
      if (selectedOnly && !selectedRows.has(item.id)) return false;
      if (activeType !== "ALL" && (item._itemType || "ITEM") !== activeType) return false;
      if (!q) return true;
      return `${item.code} ${item.desc} ${item.customerPartNo || item.customerPartNumber || item.custPartNo || ""}`.toLowerCase().includes(q);
    });
  }, [items, lineSearch, activeType, selectedOnly, selectedRows]);

  const hasCustomerPartNo = useMemo(
    () => items.some((item) => String(item.customerPartNo || item.customerPartNumber || item.custPartNo || "").trim()),
    [items]
  );
  const displayedIds = useMemo(() => displayedItems.map((item) => item.id), [displayedItems]);
  const selectedCount = selectedRows.size;
  const allDisplayedSelected = displayedIds.length > 0 && displayedIds.every((id) => selectedRows.has(id));
  const someDisplayedSelected = displayedIds.some((id) => selectedRows.has(id));

  useEffect(() => {
    const itemIds = new Set(items.map((item) => item.id));
    setSelectedRows((current) => {
      const next = new Set([...current].filter((id) => itemIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [items]);

  const toggleRowSelection = (id) => {
    setSelectedRows((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAllDisplayed = () => {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (allDisplayedSelected) {
        displayedIds.forEach((id) => next.delete(id));
      } else {
        displayedIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const deleteSelectedRows = () => {
    setItems((current) => current.filter((row) => !selectedRows.has(row.id)));
    setSelectedRows(new Set());
    setSelectedOnly(false);
  };

  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const activeItem = useMemo(() => items.find(i => i.id === catalogRow), [items, catalogRow]);
  const activeItemSearchTerm = activeItem ? (activeItem.code || "").toLowerCase() : "";
  const filteredCatalogOutside = useMemo(() => {
    if (!activeItem) return [];
    return Object.values(catalogueMap)
      .filter((entry) => {
        const code = String(entry?.code || "").toLowerCase();
        const desc = String(entry?.desc || "").toLowerCase();
        return !activeItemSearchTerm || code.includes(activeItemSearchTerm) || desc.includes(activeItemSearchTerm);
      })
      .slice(0, 10);
  }, [catalogueMap, activeItem, activeItemSearchTerm]);

  return (
    <Panel
      section="items"
      title={config?.itemLabel || "Line Items"}
      icon={ICONS.item}
      badge={`${items.length} items`}
      collapsed={collapsed}
      onToggle={onToggle}
    >
      {/* ── Toolbar ── */}
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={cx(tool, "border-amber-500/25")} onClick={onOpenSelector}>
          📦
          <strong className="text-[10px] text-slate-700 dark:text-slate-300">Add Items</strong>
          <small className="text-[9px] text-slate-500">From catalogue</small>
        </button>
        <label className={cx(tool, "cursor-pointer border-emerald-500/25")}>
          {ICONS.sheet}
          <strong className="text-[10px] text-slate-700 dark:text-slate-300">Excel</strong>
          <small className="text-[9px] text-slate-500">.xlsx</small>
          <input className="hidden" type="file" accept=".xlsx,.xls" onChange={(e) => simulateDocumentImport(e, "Excel")} />
        </label>
        {/* <label className={cx(tool, "cursor-pointer border-red-500/25")}>
          {ICONS.pdf}
          <strong className="text-[10px] text-slate-700 dark:text-slate-300">PDF</strong>
          <small className="text-[9px] text-slate-500">PO / Doc</small>
          <input className="hidden" type="file" accept=".pdf" onChange={(e) => simulateDocumentImport(e, "PDF")} />
        </label> */}
        <button type="button" className={cx(tool, "border-blue-500/25")} onClick={() => setPasteOpen(true)}>
          {ICONS.paste}
          <strong className="text-[10px] text-slate-700 dark:text-slate-300">Copy-Paste</strong>
          <small className="text-[9px] text-slate-500">Spreadsheet</small>
        </button>
        {/* <button
          type="button"
          className={cx(tool, "border-cyan-500/25")}
          onClick={() => { appendItem({ code: "AI-001", desc: "AI Extracted Item", qty: 1, price: 45 }); notify(`${ICONS.robot} AI extraction complete`); }}
        >
          <em className="absolute right-1 top-1 rounded-full bg-cyan-500/15 px-1 text-[7px] not-italic text-cyan-500 dark:text-cyan-400">AI</em>
          {ICONS.robot}
          <strong className="text-[10px] text-slate-700 dark:text-slate-300">AI Extract</strong>
          <small className="text-[9px] text-slate-500">Read document</small>
        </button> */}
        <button type="button" className={cx(tool, "border-purple-500/25")} onClick={downloadTemplate}>
          {ICONS.download}
          <strong className="text-[10px] text-slate-700 dark:text-slate-300">Template</strong>
          <small className="text-[9px] text-slate-500">Download</small>
        </button>
      </div>

      {/* ── Search & type filter bar ── */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/15 dark:border-slate-700 dark:bg-slate-800">
          <span className="text-slate-400 text-xs">🔍</span>
          <input
            value={lineSearch}
            onChange={e => setLineSearch(e.target.value)}
            placeholder="Search by process ID, description, part no…"
            className="flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
          />
          {lineSearch && (
            <button type="button" onClick={() => setLineSearch("")} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
          )}
        </div>

        {/* Type filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "TYRE", "RIM", "ASSEMBLY", "ITEM"].map(t => {
            const s = TYPE_STYLES[t];
            const count = typeCounts[t] ?? 0;
            if (t !== "ALL" && count === 0) return null;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActiveType(t)}
                className={cx(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition",
                  activeType === t
                    ? cx(s.bg, s.text, s.border)
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                )}
              >
                {t}
                <em className={cx("rounded-full px-1.5 py-0.5 text-[8px] not-italic font-bold", activeType === t ? cx(s.bg, s.text) : "bg-slate-100 text-slate-400 dark:bg-slate-700")}>
                  {count}
                </em>
              </button>
            );
          })}
        </div>

        {/* Result count */}
        {(lineSearch || activeType !== "ALL") && (
          <span className="text-[10px] text-slate-400">
            {displayedItems.length} of {items.length} line{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/[.05] px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400">
            {selectedCount} selected
          </span>
          <button
            type="button"
            onClick={() => setSelectedOnly((current) => !current)}
            className={cx(
              "rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition",
              selectedOnly
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-blue-500/30 bg-white text-blue-500 hover:bg-blue-500/[.08] dark:bg-slate-800"
            )}
          >
            {selectedOnly ? "Showing Selected" : "Show Selected"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRows(new Set());
              setSelectedOnly(false);
            }}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={deleteSelectedRows}
            className="rounded-lg border border-red-500/30 bg-red-500/[.08] px-2.5 py-1.5 text-[10px] font-semibold text-red-500 transition hover:bg-red-500/15"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* ── Floating Catalog Dropdown (outside table overflow) ── */}
      <AnimatePresence>
        {activeItem && filteredCatalogOutside.length > 0 && (
          <motion.div
            {...rise}
            data-catalog-outside
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: Math.max(coords.width, 290),
              zIndex: 9999,
            }}
            className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
          >
            {filteredCatalogOutside.map((entry) => (
              <button
                className="flex w-full justify-between border-b border-slate-200 px-3 py-2 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/60"
                type="button"
                key={entry.code}
                onClick={() => chooseCatalogItem(activeItem.id, {
                  code: entry.code,
                  name: entry.desc,
                  uom: "EA",
                  price: entry.price,
                  _itemType: entry.type,
                })}
              >
                <span>
                  <code className="block text-blue-500 dark:text-blue-400">{entry.code}</code>
                  <strong className="block text-[11px] text-slate-800 dark:text-white">{entry.desc}</strong>
                  <small className={cx(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                    entry.type === "TYRE"     && "text-amber-500",
                    entry.type === "RIM"      && "text-blue-500",
                    entry.type === "ASSEMBLY" && "text-emerald-500",
                  )}>{entry.type}</small>
                </span>
                <em className="not-italic text-emerald-500 dark:text-emerald-400">{formatMoney(entry.price)}</em>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-xs">
          <thead>
            <tr>
              {[
                "Select",
                "#",
                "Type",
                "Process ID",
                ...(hasCustomerPartNo ? ["Customer Part No"] : []),
                "Description",
                "Qty",
                config?.priceLabel || "Unit Price",
                "Disc %",
                "Line Total",
                // Conditionally include Error column if any invalid items exist
                ...(items.some(i => i.isInvalid) ? ["Error"] : []),
                "",
              ].map((head, index) => (
                <th
                  key={head || "action"}
                  className={cx(
                    "border-b-2 border-slate-200 px-1.5 py-2 text-left text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:border-slate-800",
                    ["Qty", config?.priceLabel || "Unit Price", "Disc %", "Line Total"].includes(head) && "text-right",
                    head === "Select" && "w-10 text-center"
                  )}
                >
                  {head === "Select" ? (
                    <input
                      type="checkbox"
                      checked={allDisplayedSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = !allDisplayedSelected && someDisplayedSelected;
                      }}
                      onChange={toggleSelectAllDisplayed}
                      className="size-4 rounded border-slate-300 text-blue-500"
                      aria-label="Select all displayed line items"
                    />
                  ) : head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {displayedItems.map((item, index) => {
              const qty      = Number(item.qty)   || 0;
              const price    = Number(item.price)  || 0;
              const disc     = Number(item.disc)   || 0;
              const tax      = Number(item.tax)    || 0;
              const subtotal = qty * price;
              const discount = isExternal ? subtotal * disc / 100 : 0;
              const lineTax  = isExternal ? (subtotal - discount) * tax / 100 : 0;
              const lineTotal = subtotal - discount + lineTax;

              // Catalogue autocomplete (uses CATALOG constant in OrderCopy)
              const searchTerm = (item.code || "").toLowerCase();
              const filteredCatalog = Object.values(catalogueMap)
                .filter((entry) => {
                  const code = String(entry?.code || "").toLowerCase();
                  const desc = String(entry?.desc || "").toLowerCase();
                  return !searchTerm || code.includes(searchTerm) || desc.includes(searchTerm);
                })
                .slice(0, 10);

              // Item type badge (only if added from drawer)
              const typePill = item._itemType && TYPE_PILL[item._itemType];

              return (
                <motion.tr
                  layout
                  key={item.id}
                  className={cx(
                    "border-b border-slate-200/80 hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-white/[.015]",
                    selectedRows.has(item.id) && "bg-blue-500/[.06] dark:bg-blue-500/[.08]",
                    item.isInvalid && "bg-rose-100 dark:bg-rose-900"
                  )}
                >
                  <td className="px-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(item.id)}
                      onChange={() => toggleRowSelection(item.id)}
                      className="size-4 rounded border-slate-300 text-blue-500"
                      aria-label={`Select line ${index + 1}`}
                    />
                  </td>

                  {/* # */}
                  <td className="px-2 text-slate-400 dark:text-slate-600">{index + 1}</td>

                  {/* Type badge */}
                  <td className="px-2 py-2">
                    {item.isInvalid ? (
  <span className="rounded-full border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold uppercase whitespace-nowrap text-rose-500">
    ERROR
  </span>
) : typePill ? (
  <span className={cx("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase whitespace-nowrap", typePill)}>
    {item._itemType}
  </span>
) : (
  <span className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400 dark:border-slate-700 dark:bg-slate-800">
    ITEM
  </span>
)}
                  </td>

                  {/* Process ID input without clipped dropdown */}
                  <td data-catalog-cell className="relative w-[110px] min-w-[110px] p-1">
                    <input
                      className={cell}
                      value={item.code || ""}
                      placeholder="Search..."
                      onFocus={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setCoords({
                          top: rect.bottom,
                          left: rect.left,
                          width: rect.width,
                        });
                        setCatalogRow(item.id);
                      }}
                      onChange={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setCoords({
                          top: rect.bottom,
                          left: rect.left,
                          width: rect.width,
                        });
                        updateItem(item.id, "code", e.target.value);
                        setCatalogRow(item.id);
                      }}
                    />
                  </td>

                  {hasCustomerPartNo && (
                    <td className="w-[110px] min-w-[100px] p-1">
                      <input
                        className={cell}
                        value={item.customerPartNo || item.customerPartNumber || item.custPartNo || ""}
                        placeholder="Customer Part No"
                        onChange={(e) => updateItem(item.id, "customerPartNo", e.target.value)}
                      />
                    </td>
                  )}

                  {/* Description */}
                  <td className="min-w-[200px] w-[260px] p-1">
                    <input
                      className={cell}
                      value={item.desc || ""}
                      placeholder="Description"
                      onChange={(e) => updateItem(item.id, "desc", e.target.value)}
                    />
                  </td>

                  {/* Qty */}
                  <td className="w-[70px] min-w-[70px] p-1">
                    <input
                      className={cx(cell, "text-right")}
                      type="number"
                      min="0"
                      value={item.qty}
                      onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                    />
                  </td>

                  {/* Unit Price */}
                  <td className="w-[110px] min-w-[110px] p-1">
                    <input
                      className={cx(cell, "text-right")}
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, "price", e.target.value)}
                    />
                  </td>

                  {/* Disc % */}
                  <td className="w-[80px] min-w-[80px] p-1">
                    <input
                      className={cx(cell, "text-right")}
                      type="number"
                      disabled={!isExternal}
                      min="0"
                      value={item.disc}
                      onChange={(e) => updateItem(item.id, "disc", e.target.value)}
                    />
                  </td>

                  {/* Line Total */}
                  <td className="whitespace-nowrap px-2 text-right font-mono font-bold text-amber-500 dark:text-amber-400">
                    {formatMoney(lineTotal)}
                  </td>

                  {/* Error message cell (conditionally rendered) */}
                  {items.some(i => i.isInvalid) && (
                    <td className="px-2 text-sm text-rose-600 dark:text-rose-400">
                      {item.errorMessage}
                    </td>
                  )}

                  <td>
                    <button
                      className="px-2 text-lg text-slate-400 hover:text-red-400 dark:text-slate-600"
                      type="button"
                      onClick={() => setItems(current => current.filter(row => row.id !== item.id))}
                    >
                      ×
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-start">
        <button
          type="button"
          onClick={() => appendItem({ code: "", desc: "", qty: 1, price: 0 })}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
        >
          ➕ Add Line
        </button>
      </div>
    </Panel>
  );
}

function LogisticsPanel({ logistics, setLogistics, collapsed, onToggle, }) {
  const updateField = (field, value) => { setLogistics((prev) => ({ ...prev, [field]: value, })); };
  return (
    <motion.div {...rise}><Panel section="logistics" title="Logistics & Financial Details" icon={ICONS.truck} badge="Before Discount" collapsed={collapsed} onToggle={onToggle}>
      <Divider className="mt-0"> Logistics Details </Divider> <Grid columns={4}><Field label="Pre-Carriage by" required><select value={logistics.preCarriageBy} onChange={(e) => updateField("preCarriageBy", e.target.value)} > <option value="">Select</option><option>By Road</option><option>By Air</option><option>By Sea</option><option>By Rail</option></select></Field>
        <Field label="Final Destination" required><select
          value={logistics.finalDestination}
          onChange={(e) =>
            updateField("finalDestination", e.target.value)}>
          <option value="">Select</option>
          <option>Chennai</option>
          <option>Dubai</option>
          <option>Singapore</option>
          <option>USA</option>
        </select>
        </Field>

        <Field label="Container Type" required>
          <select
            value={logistics.containerType}
            onChange={(e) =>
              updateField("containerType", e.target.value)
            }
          >
            <option value="">Select</option>
            <option>20 FT</option>
            <option>40 FT</option>
            <option>LCL</option>
            <option>Open Top</option>
          </select>
        </Field>

        <Field label="Packing Method" required>
          <select
            value={logistics.packingMethod}
            onChange={(e) =>
              updateField("packingMethod", e.target.value)
            }
          >
            <option value="">Select</option>
            <option>Wooden Box</option>
            <option>Pallet</option>
            <option>Carton</option>
            <option>Loose Packing</option>
          </select>
        </Field>
      </Grid>

      <Divider>
        Financials
      </Divider>

      <Grid columns={3}>
        <Field label="Incoterm">
          <select
            value={logistics.incoterm}
            onChange={(e) =>
              updateField("incoterm", e.target.value)
            }
          >
            <option value="">Select</option>
            <option>FOB</option>
            <option>CIF</option>
            <option>EXW</option>
            <option>DDP</option>
          </select>
        </Field>

        <Field label="Place of Incoterm" required>
          <input
            value={logistics.placeOfIncoterm}
            onChange={(e) =>
              updateField("placeOfIncoterm", e.target.value)
            }
            placeholder="Enter place"
          />
        </Field>

        <Field label="Lead Time" required>
          <select
            value={logistics.leadTime}
            onChange={(e) =>
              updateField("leadTime", e.target.value)
            }
          >
            <option value="">Select</option>
            <option>1 Week</option>
            <option>2 Weeks</option>
            <option>1 Month</option>
          </select>
        </Field>

        <Field label="Validity Date" required>
          <input
            type="date"
            value={logistics.validityDate}
            onChange={(e) =>
              updateField("validityDate", e.target.value)
            }
          />
        </Field>

        {/* <Field label="Payment Terms">
          <select
            value={logistics.paymentTerms}
            onChange={(e) =>
              updateField("paymentTerms", e.target.value)
            }
          >
            <option value="">Select</option>
            <option>Advance</option>
            <option>Net 30</option>
            <option>Net 45</option>
            <option>COD</option>
          </select>
        </Field> */}

        <Field label="Remarks" wide>
          <textarea
            className={INPUT}
            rows={3}
            value={logistics.remarks}
            onChange={(e) =>
              updateField("remarks", e.target.value)
            }
            placeholder="Enter remarks..."
          />
        </Field>
      </Grid>
    </Panel>
    </motion.div>
  );
}

function DiscountPanel({ taxes, setTaxes, charges, setCharges, discountMode, setDiscountMode, docDiscount, setDocDiscount, entity, totals, formatMoney, nextId, collapsed, onToggle }) {
  const updateTax = (id, field, value) => {
    setTaxes((current) => current.map((entry) => entry.id === id ? { ...entry, [field]: value } : entry));
  };
  const updateCharge = (id, field, value) => {
    setCharges((current) => current.map((entry) => entry.id === id ? { ...entry, [field]: value } : entry));
  };

  return (
    <motion.div {...rise}>
      <Panel section="discount" title="Document Discount & Tax" icon={ICONS.tag} badge="Applied after line items" collapsed={collapsed} onToggle={onToggle}>
        <Divider className="mt-0">Document Discount</Divider>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {[
            ["pct", "% Percentage"],
            ["flat", `${entity?.currency || ""} Flat Amount`],
            ["none", "No Discount"],
          ].map(([id, label]) => {
            const active = discountMode === id;
            return (
              <button
                className={cx(
                  "rounded-full border px-3 py-1.5 text-[10px] font-semibold transition",
                  active
                    ? "border-amber-400 bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-amber-300 hover:text-amber-500 dark:border-slate-700 dark:bg-slate-800"
                )}
                type="button"
                key={id}
                onClick={() => setDiscountMode(id)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {discountMode !== "none" && (
            <motion.div {...rise}>
              <Grid>
                <Field label="Discount Type">
                  <select>
                    <option>Trade Discount</option>
                    <option>Cash Discount</option>
                    <option>Loyalty Discount</option>
                  </select>
                </Field>
                <Field label="Discount Value">
                  <input
                    inputMode="decimal"
                    value={docDiscount}
                    onChange={(event) => setDocDiscount(normalizeNumericInput(event.target.value))}
                    onBlur={() => setDocDiscount((current) => inputValueOrZero(current))}
                  />
                </Field>
                <Field label="Approval / Reason"><input defaultValue="LOYAL2026" /></Field>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>

        <Divider>Tax Components</Divider>
        <div className="space-y-2">
          {taxes.map((tax) => {
            const rate = Number(tax.rate) || 0;
            return (
              <motion.div layout key={tax.id} className="grid items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800 sm:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
                <Field label="Tax Name">
                  <input value={tax.name} onChange={(event) => updateTax(tax.id, "name", event.target.value)} placeholder="Tax name" />
                </Field>
                <Field label="Code">
                  <select value={tax.code} onChange={(event) => updateTax(tax.id, "code", event.target.value)}>
                    <option>GST-9</option>
                    <option>VAT-20</option>
                    <option>EXEMPT</option>
                    <option>CUSTOM</option>
                  </select>
                </Field>
                <Field label="Rate / Value %">
                  <input
                    inputMode="decimal"
                    value={tax.rate}
                    onChange={(event) => updateTax(tax.id, "rate", normalizeNumericInput(event.target.value))}
                    onBlur={() => updateTax(tax.id, "rate", inputValueOrZero(tax.rate))}
                  />
                </Field>
                <Field label="Amount"><input readOnly value={formatMoney(totals.taxable * rate / 100)} /></Field>
                <Remove onClick={() => setTaxes((current) => current.filter((entry) => entry.id !== tax.id))} />
              </motion.div>
            );
          })}
        </div>
        <Add onClick={() => setTaxes((current) => [...current, { id: nextId.current++, name: "New Tax", code: "CUSTOM", rate: 0 }])}>Add Tax Component</Add>

        <Divider>Additional Charges</Divider>
        <div className="space-y-2">
          {charges.map((charge) => (
            <motion.div layout key={charge.id} className="grid items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
              <Field label="Name">
                <input value={charge.name} onChange={(event) => updateCharge(charge.id, "name", event.target.value)} />
              </Field>
              <Field label="Amount">
                <input
                  inputMode="decimal"
                  value={charge.amount}
                  onChange={(event) => updateCharge(charge.id, "amount", normalizeNumericInput(event.target.value))}
                  onBlur={() => updateCharge(charge.id, "amount", inputValueOrZero(charge.amount))}
                />
              </Field>
              <Field label="Taxable">
                <select value={charge.taxable} onChange={(event) => updateCharge(charge.id, "taxable", event.target.value)}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </Field>
              <Remove onClick={() => setCharges((current) => current.filter((entry) => entry.id !== charge.id))} />
            </motion.div>
          ))}
        </div>
        <Add onClick={() => setCharges((current) => [...current, { id: nextId.current++, name: "Insurance", amount: 0, taxable: "Yes" }])}>Add Charge</Add>
        <Calculation totals={totals} format={formatMoney} discountMode={discountMode} docDiscount={Number(docDiscount) || 0} />
      </Panel>
    </motion.div>
  );
}

function Sidebar({ config, theme, entity, customer, showCustomer, showPlant, source, destination, orderType, isExternal, items, totals, formatMoney, notify, onPreview }) {
  return <aside className="lg:sticky lg:top-[68px]"><AnimatePresence>{config && <motion.div {...rise} className={cx("mb-2.5 grid grid-cols-[auto_1fr] items-center rounded-lg border px-3 py-2.5", theme.bg, theme.border, theme.text)}><span className="row-span-2 mr-2 text-lg">{config.icon}</span><strong className="text-xs">{config.name}</strong><small className="text-[10px] opacity-80">{config.showCustomer ? "External - Customer - Delivery" : "Internal - No customer - No delivery"}</small></motion.div>}</AnimatePresence><motion.div layout className={cx("mb-2.5 flex flex-col rounded-xl border p-4 text-center", theme.bg, theme.border, theme.text)}><small className="text-[10px] font-bold uppercase tracking-[.1em]">Grand Total</small><strong className="font-serif text-3xl font-normal">{formatMoney(totals.grand)}</strong><span className="font-mono text-[10px] text-slate-500">{customer?.currency} - SO-2026-0413</span></motion.div><SummaryCard title={<span className="flex w-full justify-between">Order Summary <Draft /></span>}><Summary label="Order #" value="SO-2026-0413" accent /><Summary label="Entity" value={entity.name} /><Summary label="Order Type" value={config?.name || "- not selected -"} />{showCustomer && <Summary label="Customer" value={customer?.name} green />}{showPlant && <Summary label="Plant" value={orderType === "ipt" ? `${source?.id} -> ${destination?.id}` : source?.name} amber />}<Summary label="Date" value="22 May 2026" /><Summary label="Items" value={`${items.length}`} blue />{isExternal && <Summary label="Subtotal" value={formatMoney(totals.gross)} />}{isExternal && <Summary label="Discounts" value={`-${formatMoney(totals.lineDiscount + totals.documentDiscount)}`} red />}{isExternal && <Summary label="Tax" value={`+${formatMoney(totals.totalTax)}`} />}<Summary label="Grand Total" value={formatMoney(totals.grand)} accent total /><div className="mt-3 flex flex-col gap-1.5 border-t border-slate-200 pt-3 dark:border-slate-800"><button className={PRIMARY} type="button" onClick={() => config ? notify(`${ICONS.rocket} Order submitted successfully!`) : notify("Please select an order type first")}>{ICONS.rocket} Submit Order</button><button className={MUTED} type="button" onClick={() => notify(`${ICONS.save} Draft saved - SO-2026-0413`)}>{ICONS.save} Save Draft</button><button className={MUTED} type="button" onClick={onPreview}>{ICONS.preview} Preview</button></div></SummaryCard><SummaryCard title="Checklist"><Checklist done label="Entity selected" /><Checklist done={Boolean(config)} label="Order type chosen" /><Checklist done={Boolean(config)} label={config?.showCustomer ? "Customer selected" : config?.showPlant ? "Plant set" : "Customer / Plant set"} /><Checklist done={Boolean(config?.showAddress)} na={Boolean(config && !config.showAddress)} label={config?.showAddress ? "Address set" : "Address not applicable"} /><Checklist done={items.length > 0} label="Line items added" /><Checklist done={Boolean(config?.showDiscTax)} na={Boolean(config && !config.showDiscTax)} label={config?.showDiscTax ? "Discount & Tax" : "Discount not applicable"} /></SummaryCard></aside>;
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
    {/* <Field label="Expected Outcome"><select><option>Pass/Fail Report</option><option>Data Collection</option><option>Prototype Output</option></select></Field> */}
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
  if (!item) { return (<b className={cx("mb-2 flex size-8 items-center justify-center rounded-lg bg-slate-300 text-xs text-white")}>?</b>); }
  return (<b className={cx("mb-2 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br text-xs text-white", AVATAR[item.tone || "blue"])}>{item.initials || item.name?.charAt(0) || "C"}</b>);
}
function Tick() {
  return <b className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[9px] text-slate-950">{"\u2713"}</b>;
}
function Draft() {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--primary)/10] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--primary)]"><i className="size-1.5 rounded-full bg-current" />Draft</span>;
}
function Remove({ onClick }) {
  return <button className="p-2 text-lg text-slate-600 hover:text-red-400" type="button" onClick={onClick}>{"\u00D7"}</button>;
}
function Add({ onClick, children }) {
  return <button className="mt-2 px-1 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300" type="button" onClick={onClick}>+ {children}</button>;
}

function PDFPreviewModal({ open, onClose, data }) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-md dark:bg-black/75"
    >
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#111318]"
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-[#161820]">
          <div className="flex flex-col">
            <strong className="text-sm font-bold text-slate-800 dark:text-white">Proforma Invoice PDF Preview</strong>
            <span className="text-[10px] text-slate-500">Preview and verify the layout and mappings</span>
          </div>
          <button
            className="text-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
            type="button"
            onClick={onClose}
          >
            &times;
          </button>
        </header>
        <div className="flex-1 bg-slate-100 dark:bg-[#0c0e13]">
          <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
            <Document title={`Proforma Invoice - ${data?.orderRefNo || "SO-2026-0413"}`}>
              <ProformaPDF data={data} />
            </Document>
          </PDFViewer>
        </div>
        <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-[#161820]">
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}
