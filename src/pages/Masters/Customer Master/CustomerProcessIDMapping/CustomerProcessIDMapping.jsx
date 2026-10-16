import React, { useEffect, useMemo, useState } from "react";

import { Select, Dropdown, Checkbox, message } from "antd";
import { motion } from "framer-motion";


import {
  Download,
  Upload as UploadIcon,
  RefreshCcw,
  Search,
  X,
  Settings,
  Layers,
  Maximize,
  Disc,
  Type,
  Tag,
  FileText,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Hash,
  Save,
  ChevronDown,
  ArrowLeftRight,
  BookOpen,
} from "lucide-react";
import { SettingOutlined } from "@ant-design/icons";
import MappingTable, { BASE_COLUMNS } from "./components/MappingTable";
import MappingDrawer from "./components/MappingDrawer";
import ViewDrawer from "./components/ViewDrawer";
import HistoryDrawer from "./components/HistoryDrawer";
import ImportDialog from "./components/ImportDialog";
import DuplicateItemsDialog from "./components/DuplicateItemsDialog";
import EditCustomerItemDialog from "./components/EditCustomerItemDialog";
import { CUSTOMERS, INITIAL_MAPPINGS, enrichMapping } from "./data/mockData";
import { getListOfCustomer, getListOfItems, getCustomerItemsByCustomerAndShip, createCustomerItem, updateCustomerItem } from "../../../../Redux/Slices/Master/PI_Master/CustomerProcessIDSlice";
import { useDispatch } from "react-redux";
import { norm, buildProcessMaster, isDuplicateMapping } from "./helpers";


// ============================================================================
// Spec fields — same selection flow as Assembly Process ID Creation.
// Only fields that actually exist in the selected customer's process master are rendered.
// ============================================================================
const SPEC_FIELDS = [
  { key: "category", label: "Category", icon: Settings },
  { key: "platform", label: "Platform", icon: Layers },
  { key: "tyreSize", label: "Tyre Size", icon: Maximize },
  { key: "rimSize", label: "Rim", icon: Disc },
  { key: "tyreType", label: "Type", icon: Type },
  { key: "brand", label: "Brand", icon: Tag },
  { key: "sideWall", label: "Sidewall", icon: FileText },
  // Distinguishes an assembly's LH/RH variant — two assemblies of the same
  // tyre (e.g. P012257A / P012257B) can otherwise share every other spec.
  { key: "directional", label: "Direction", icon: ArrowLeftRight },
];

const pidOf = (row) => row?.processId ?? row?.ourProcessId ?? row?.pid ?? "";

const formatShipAddress = (addr) =>
  [addr?.addressName, addr?.city, addr?.country].filter(Boolean).join(", ").replace(/~/g, ", ");

const EMPTY_SPECS = Object.fromEntries(SPEC_FIELDS.map((f) => [f.key, ""]));

const inputCls =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 px-2 py-1.5 text-[11px] text-slate-700 dark:text-slate-200 outline-none transition-colors hover:bg-white dark:hover:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15";

const Field = ({ label, icon: Icon, accent, children }) => (
  <div className="space-y-1">
    <label
      className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-tight ${
        accent || "text-slate-400 dark:text-slate-500"
      }`}
    >
      {Icon && <Icon className="h-3 w-3" />} {label}
    </label>
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, accent, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay }}
    whileHover={{ y: -2 }}
    className="group relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-2 sm:p-3 shadow-sm transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg"
  >
    <div
      className={`absolute inset-x-0 top-0 h-[2px] sm:h-[3px] ${accent} !bg-current opacity-85 transition-all duration-300 group-hover:h-[4px] group-hover:opacity-100`}
    />
    <div className="flex items-center gap-2 sm:gap-3">
      <div
        className={`flex h-7 w-7 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl ${accent} shadow-sm`}
      >
        <Icon size={14} className="sm:hidden" />
        <Icon size={20} className="hidden sm:block" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[9px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm sm:text-xl font-bold leading-tight text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  </motion.div>
);

const CustomerProcessIDMapping = () => {
  const [rawMappings, setRawMappings] = useState(INITIAL_MAPPINGS);
  const [loading, setLoading] = useState(false);

  // Creation / filter panel state
  const [customer, setCustomer] = useState(undefined);
  const [customerList,setCustomerList] = useState([])
  const [shipAddress, setShipAddress] = useState([]); // multi-select — array of ship address ids
  const [shipAddressList, setShipAddressList] = useState([]);
  const [customerLineItems, setCustomerLineItems] = useState({ tyre: [], assemblyTyre: [], rim: [] });
  const [itemTypeFilter, setItemTypeFilter] = useState("tyre");
  const [customerData, setCustomerData] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  // console.log(shipAddressList[0]?.companyName)
  


  const [specs, setSpecs] = useState(EMPTY_SPECS);
  const [processId, setProcessId] = useState("");
  const [customerProcessId, setCustomerProcessId] = useState("");
  const [savingMapping, setSavingMapping] = useState(false);
  const [duplicateDialog, setDuplicateDialog] = useState({ open: false, duplicateRows: [], validShipIds: [] });
  const [editDialog, setEditDialog] = useState({ open: false, record: null });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [copied, setCopied] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  // Table-level controls
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(undefined);
  const [shipAddressFilter, setShipAddressFilter] = useState(undefined);
  const [companyNameFilter, setCompanyNameFilter] = useState(undefined);
  const [customerFilter, setCustomerFilter] = useState(undefined);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() =>
    Object.fromEntries(BASE_COLUMNS.map((c) => [c.key, true])),
  );

  const [mappingDrawer, setMappingDrawer] = useState({ open: false, mode: "create", record: null });
  const [viewDrawer, setViewDrawer] = useState({ open: false, record: null });
  const [historyDrawer, setHistoryDrawer] = useState({ open: false, record: null });
  const [importOpen, setImportOpen] = useState(false);
  const dispatch = useDispatch()

  // Process master for the *selected customer* — tyre + assembly-tyre + rim
  // line items normalized to the SPEC_FIELDS keys, so only Process IDs that
  // actually belong to this customer ever reach the spec dropdowns. A tyre
  // and its assembly (e.g. P-012257 / P012257A) can carry identical specs —
  // that's what the Type filter below exists to disambiguate.
  const customerProcessMaster = useMemo(() => buildProcessMaster(customerLineItems), [customerLineItems]);

  // Narrow to the selected item Type first — this is what actually resolves
  // the tyre-vs-assembly ambiguity, since everything downstream reads from this.
  const filteredProcessMaster = useMemo(
    () => (itemTypeFilter ? customerProcessMaster.filter((row) => row.itemType === itemTypeFilter) : customerProcessMaster),
    [customerProcessMaster, itemTypeFilter],
  );

  // Only keep spec fields the (type-filtered) process master actually carries.
  const activeFields = useMemo(() => {
  return SPEC_FIELDS.filter((f) => {
    // Direction should appear ONLY for Assembly
    if (f.key === "directional") {
      return itemTypeFilter?.toLowerCase() === "assembly";
    }

    // Other fields: show only if available in process master
    return filteredProcessMaster.some(
      (p) =>
        p[f.key] !== undefined &&
        p[f.key] !== null &&
        p[f.key] !== ""
    );
  });
}, [filteredProcessMaster, itemTypeFilter]);

  // Rows matching every currently selected spec — drives both the Process ID
  // resolution and the "narrow further" hint.
  const matchedRows = useMemo(
    () =>
      filteredProcessMaster.filter((row) =>
        activeFields.every((f) => !specs[f.key] || String(row[f.key]) === specs[f.key]),
      ),
    [specs, activeFields, filteredProcessMaster],
  );

  // Cascading options: each dropdown shows only values still reachable given
  // the other selections, so the user can never build an impossible combo.
  const specOptions = useMemo(() => {
    const out = {};
    activeFields.forEach((f) => {
      const pool = filteredProcessMaster.filter((row) =>
        activeFields.every((o) => o.key === f.key || !specs[o.key] || String(row[o.key]) === specs[o.key]),
      );
      out[f.key] = [...new Set(pool.map((row) => row[f.key]).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b)),
      );
    });
    return out;
  }, [specs, activeFields, filteredProcessMaster]);

  // Display name for the selected customer — mapping rows (mock + API) store the
  // customer's name, while `customer` state itself holds the selected custID.
  const selectedCustomerName = useMemo(
    () => customerList.find((c) => c.custID === customer)?.customerName || "",
    [customerList, customer],
  );

  // Existing customer items fetched via getCustomerItemsByCustomerAndShip, reshaped
  // into the same row shape the Records table (MappingTable) already renders.
  // GetByCustomerCode already returns the full spec per item (category/config/
  // tyreSize/tyreRim/tyreType/brand/sideWall/createdBy/createdDate) — only
  // itemType (tyre/rim/assembly) isn't in that response, so that alone is
  // cross-referenced against customerProcessMaster.
  // const apiMappings = useMemo(() => {
  //   return (customerData || []).map((item, i) => {
  //     const proc = customerProcessMaster.find((p) => p.processId === item.itemCode);
  //     const shipAddr = shipAddressList.find((addr) => String(addr.id) === String(item.shipid));

  //     return {
  //       // `id` alone isn't unique across ship addresses (the same item id can
  //       // repeat once per shipid it's mapped to), so combine both.
  //       id: `api-${item.id ?? i}-${item.shipid ?? ""}`,
  //       // Raw numeric id — needed as `customerItemID` when calling
  //       // UpdateCustomerItem, separate from the composite `id` above.
  //       customerItemID: item.id,
  //       customer: selectedCustomerName,
  //       customerCode: item.customerCode ?? "",
  //       shipid: item.shipid,
  //       shipAddress: shipAddr ? formatShipAddress(shipAddr) : "",
  //       companyName: shipAddr?.companyName || "",
  //       customerProcessId: item.customerItemCode || "",
  //       ourProcessId: item.itemCode || "",
  //       status: item.isActive ? "Active" : "Inactive",
  //       remarks: "",
  //       revision: 1,
  //       createdBy: item.createdBy || "-",
  //       createdDate: item.createdDate || new Date().toISOString(),
  //       updatedBy: item.modifiedBy || item.createdBy || "-",
  //       lastUpdated: item.modifiedDate || item.createdDate || new Date().toISOString(),
  //       history: [],
  //       category: item.category || "",
  //       platform: item.config || "",
  //       tyreSize: item.tyreSize || "",
  //       rimSize: item.tyreRim || "",
  //       tyreType: item.tyreType || "",
  //       brand: item.brand || "",
  //       sideWall: item.sideWall || "",
  //       itemType: proc?.itemType || "",
  //     };
  //   });
  // }, [customerData, selectedCustomerName, customerProcessMaster, shipAddressList]);
  // // console.log(apiMappings);
 const apiMappings = useMemo(() => {
  return (customerData || []).map((item, i) => {
    const proc = customerProcessMaster.find((p) => p.processId === item.itemCode);
    const shipAddr = shipAddressList.find((addr) => String(addr.id) === String(item.shipid));

    const category = item.category || proc?.category || "";
    const platform = item.config || proc?.platform || "";
    const rimSize = item.tyreRim || proc?.rimSize || "";
    const tyreType = item.tyreType || proc?.tyreType || "";
    const brand = item.brand || proc?.brand || "";
    const sideWall = item.sideWall || proc?.sideWall || "";
    const directional = item.directional || proc?.directional || "";
    const tyreSize = item.tyreSize || proc?.tyreSize || proc?.piDetails || "";

    return {
      id: `api-${item.id ?? i}-${item.shipid ?? ""}`,
      customerItemID: item.id,
      customer: selectedCustomerName,
      // The Customer ID shown in the dropdown (custID) — all rows in the
      // currently loaded table belong to the one selected customer, so
      // it's the same value across every row. Not the same as
      // `customerCode`, which is a separate business field from the API item.
      customerID: customer,
      customerCode: item.customerCode ?? "",
      shipid: item.shipid,
      shipAddress: shipAddr ? formatShipAddress(shipAddr) : "",
      companyName: shipAddr?.companyName || "",
      customerProcessId: item.customerItemCode || "",
      ourProcessId: item.itemCode || "",
      status: item.isActive ? "Active" : "Inactive",
      remarks: "",
      revision: 1,
      createdBy: item.createdBy || "-",
      createdDate: item.createdDate || new Date().toISOString(),
      updatedBy: item.modifiedBy || item.createdBy || "-",
      lastUpdated: item.modifiedDate || item.createdDate || new Date().toISOString(),
      history: [],
      category,
      platform,
      tyreSize,
      rimSize,
      tyreType,
      brand,
      sideWall,
      directional,
      itemType: proc?.itemType || "",
    };
  });
}, [customerData, customer, selectedCustomerName, customerProcessMaster, shipAddressList]);

  // Records table stays empty until Customer + Ship Address are selected and
  // getCustomerItemsByCustomerAndShip responds — no local/demo rows shown.
  const mappings = apiMappings;
  // Backend can return the same item (same customer + ship + Process ID) more
// than once. This is purely detection for display — it never removes or
// merges anything, it just flags which rows share that combination so you
// can spot and reconcile them (e.g. on the backend) rather than them
// silently sitting there unnoticed.
const duplicateIds = useMemo(() => {
  const dupKey = (m) => `${norm(m.customerCode)}::${m.shipid}::${norm(m.ourProcessId)}`;
  const counts = new Map();
  mappings.forEach((m) => {
    const k = dupKey(m);
    counts.set(k, (counts.get(k) || 0) + 1);
  });
  const ids = new Set();
  mappings.forEach((m) => {
    if (counts.get(dupKey(m)) > 1) ids.add(m.id);
  });
  return ids;
}, [mappings]);


  // Resolve the Process ID once the specs identify exactly one master row.
  // A tyre and its assembly can share identical specs (e.g. P-012257 / P012257A),
  // so when specs match more than one row, keep the current Process ID if it's
  // still one of the candidates instead of wiping a value the user just set.
  useEffect(() => {
    const anySelected = activeFields.some((f) => specs[f.key]);
    if (!anySelected) return;

    if (matchedRows.length === 1) {
      setProcessId(pidOf(matchedRows[0]));
    } else {
      setProcessId((prev) => (matchedRows.some((r) => pidOf(r) === prev) ? prev : ""));
    }
  }, [matchedRows, specs, activeFields]);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await dispatch(getListOfCustomer());
      // console.log(response?.customers);
      
      setCustomerList(response?.customers || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomerList([]);
    }
  };

  fetchData();
}, [dispatch]);

// Ship addresses are the customer's addresses with addressType 1 (ship-to).
useEffect(() => {
  if (!customer) {
    setShipAddressList([]);
    return;
  }

  const selectedCustomer = customerList.find((c) => c.custID === customer);
  const ships = (selectedCustomer?.addresses || []).filter(
    (addr) => Number(addr.addressType) === 1,
  );
  setShipAddressList(ships);
}, [customer, customerList]);

// Drives the spec dropdowns + Process ID resolution — the Process IDs
// available to a customer, not the whole plant-wide PROCESS_MASTER mock.
useEffect(() => {
  if (!customer) {
    setCustomerLineItems({ tyre: [], assemblyTyre: [], rim: [] });
    return;
  }

  const fetchLineItems = async () => {
    try {
      const response = await dispatch(getListOfItems(customer));
      setCustomerLineItems({
        tyre: response?.tyre || [],
        assemblyTyre: response?.assemblyTyre || [],
        rim: response?.rim || [],
      });
    } catch (error) {
      console.error("Failed to fetch customer line items:", error);
      setCustomerLineItems({ tyre: [], assemblyTyre: [], rim: [] });
    }
  };

  fetchLineItems();
}, [customer, dispatch]);

// Only call the customer-items API once both Customer and at least one Ship Address are selected.
useEffect(() => {
  if (!customer || !shipAddress.length) {
    setCustomerData([]);
    return;
  }

  const fetchCustomerItems = async () => {
    try {
      setCustomerLoading(true);

      // console.log("Selected Customer:", customer);
      // console.log("Selected Ship Address(es):", shipAddress);
      // console.log("API Parameters:", { customerCode: customer, shipID: shipAddress });

      const response = await dispatch(
        getCustomerItemsByCustomerAndShip({ customerCode: customer, shipIds: shipAddress })
      );

      setCustomerData(response?.payload || response || []);

    } catch (error) {
      console.error("Customer item API error:", error);

      setCustomerData([]);

    } finally {
      setCustomerLoading(false);
    }
  };

  fetchCustomerItems();

}, [customer, shipAddress, dispatch]);

  const handleSpecChange = (key, value) =>
    setSpecs((prev) => {
      const next = { ...prev, [key]: value };
      // Drop other selections that can no longer coexist with this one.
      if (value) {
        activeFields.forEach((f) => {
          if (f.key === key || !next[f.key]) return;
          const stillValid = filteredProcessMaster.some(
            (row) => String(row[key]) === value && String(row[f.key]) === next[f.key],
          );
          if (!stillValid) next[f.key] = "";
        });
      }
      return next;
    });

  // Typing a known Process ID back-fills every spec (reverse lookup).
  const handleProcessIdInput = (value) => {
    setProcessId(value);
    const row = filteredProcessMaster.find((p) => String(pidOf(p)).toUpperCase() === value.trim().toUpperCase());
    if (row) setSpecs(Object.fromEntries(activeFields.map((f) => [f.key, row[f.key] ? String(row[f.key]) : ""])));
  };

  const copyProcessId = () => {
    if (!processId) return;
    navigator.clipboard.writeText(processId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetPanel = () => {
    setCustomer(undefined);
    setShipAddress([]);
    setItemTypeFilter("tyre");
    setSpecs(EMPTY_SPECS);
    setProcessId("");
    setCustomerProcessId("");
    setSearch("");
    setStatus(undefined);
    setShipAddressFilter(undefined);
    setCompanyNameFilter(undefined);
    setCustomerFilter(undefined);
  };

  // Clears ONLY the Records table's own filters (search, status, dropdown
// filters, duplicates toggle) — does NOT touch the Specification panel's
// Customer/Ship Address/Item Type/Specs selection. That's what the panel's
// own "Reset" button (resetPanel) is for.
const clearTableFilters = () => {
  setSearch("");
  setStatus(undefined);
  setShipAddressFilter(undefined);
  setCompanyNameFilter(undefined);
  setCustomerFilter(undefined);
  setShowDuplicatesOnly(false);
};

  const hasActiveFilters =
    customer ||
    itemTypeFilter ||
    status ||
    shipAddressFilter ||
    companyNameFilter ||
    customerFilter ||
    search.trim() ||
    activeFields.some((f) => specs[f.key]) ||
    processId;

    const hasActiveTableFilters =
  status ||
  shipAddressFilter ||
  companyNameFilter ||
  customerFilter ||
  search.trim() ||
  showDuplicatesOnly;

  // Distinct values actually present in the loaded rows, for the Records
  // table's filter dropdowns.
  const shipAddressFilterOptions = useMemo(
    () => [...new Set(mappings.map((m) => m.shipAddress).filter(Boolean))].sort(),
    [mappings],
  );
  const companyNameFilterOptions = useMemo(
    () => [...new Set(mappings.map((m) => m.companyName).filter(Boolean))].sort(),
    [mappings],
  );
  const customerFilterOptions = useMemo(
    () => [...new Set(mappings.map((m) => m.customer).filter(Boolean))].sort(),
    [mappings],
  );

  // --- Table data -----------------------------------------------------------
  // Only `search`, `status`, `shipAddressFilter`, `companyNameFilter`, and
  // `customerFilter` filter the Records table. `specs`/`processId` belong to
  // the creation panel (picking a Process ID to map) — they don't describe
  // the customer's already-mapped items shown here, so applying them as a
  // filter here would hide real rows any time the panel has a selection.
const filteredData = useMemo(() => {
  const q = search.trim().toLowerCase();
  return mappings.filter((m) => {
    if (showDuplicatesOnly && !duplicateIds.has(m.id)) return false;
    if (q && !Object.values(m).join(" ").toLowerCase().includes(q)) return false;
    if (status && m.status !== status) return false;
    if (shipAddressFilter && m.shipAddress !== shipAddressFilter) return false;
    if (companyNameFilter && m.companyName !== companyNameFilter) return false;
    if (customerFilter && m.customer !== customerFilter) return false;
    return true;
  });
}, [mappings, search, status, shipAddressFilter, companyNameFilter, customerFilter, showDuplicatesOnly, duplicateIds]);
  const stats = useMemo(() => {
    const total = mappings.length;
    const active = mappings.filter((m) => m.status === "Active").length;
    const inactive = mappings.filter((m) => m.status === "Inactive").length;
    const recentlyUpdated = mappings.filter(
      (m) => Date.now() - new Date(m.lastUpdated).getTime() < 7 * 86400000,
    ).length;
    return { total, active, inactive, recentlyUpdated };
  }, [mappings]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500); // stand-in for a real refetch
  };

  // --- Drawer orchestration -------------------------------------------------
  // Every row in `mappings` is a real, API-backed record now, so Edit opens
  // the real UpdateCustomerItem-backed dialog rather than the local mock form.
  const openEdit = (record) => {
    setViewDrawer({ open: false, record: null });
    setEditError("");
    setEditDialog({ open: true, record });
  };
  const closeEditDialog = () => {
    setEditError("");
    setEditDialog({ open: false, record: null });
  };

  const handleSaveEditedItem = async (payload) => {
    setEditError("");

    // Same duplicate rule as manual creation and bulk import — checked here
    // too since editing can change the Process ID to one that's already
    // mapped for this ship address. Excludes the record being edited itself,
    // otherwise it would always flag as a duplicate of its own prior state.
    const editingId = editDialog.record?.id;
    const otherMappings = mappings.filter((m) => m.id !== editingId);
    if (
      isDuplicateMapping(otherMappings, {
        customerCode: payload.customerCode,
        shipid: payload.shipid,
        itemCode: payload.itemCode,
        customerItemCode: payload.customerItemCode,
      })
    ) {
      // Shown both as a toast and inline in the dialog — the dialog stays
      // open on top of everything else, so a toast alone is easy to miss
      // and reads as "nothing happened" (looks like a bug) rather than
      // "blocked on purpose".
      const msg = "This Process ID or Customer Item Code is already mapped for this Customer Ship Address.";
      message.error(msg);
      setEditError(msg);
      return;
    }

    setSavingEdit(true);
    try {
      await dispatch(updateCustomerItem(payload));
      message.success("Customer item updated.");
      closeEditDialog();

      // Refresh the currently viewed list so the change shows up immediately.
      if (customer && shipAddress.length) {
        const refreshed = await dispatch(
          getCustomerItemsByCustomerAndShip({ customerCode: customer, shipIds: shipAddress }),
        );
        setCustomerData(refreshed || []);
      }
    } catch (error) {
      console.error("Failed to update customer item:", error);
      const msg = "Failed to update the item. Please try again.";
      message.error(msg);
      setEditError(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const openClone = (record) => setMappingDrawer({ open: true, mode: "clone", record });
  const openView = (record) => setViewDrawer({ open: true, record });
  const openHistory = (record) => setHistoryDrawer({ open: true, record });
  const closeMappingDrawer = () => setMappingDrawer((d) => ({ ...d, open: false }));

  const handleOpenExisting = (existing) => {
    closeMappingDrawer();
    setTimeout(() => openEdit(enrichMapping(existing)), 150);
  };

// Builds the exact payload your backend expects — customerItemID, customerCode,
// customerItemCode, description, isActive, itemCode, shipid. `description`
// isn't stored on the row, so it's resolved off customerProcessMaster the
// same way submitMapping() already does, keyed by the item's Process ID.
const buildStatusPayload = (record, isActive) => {
  const matchedItem = customerProcessMaster.find(
    (p) => String(pidOf(p)).toUpperCase() === String(record.ourProcessId).toUpperCase(),
  );
  return {
    customerItemID: record.customerItemID,
    customerCode: record.customerCode,
    customerItemCode: record.customerProcessId,
    description: matchedItem?.piDetails || "",
    isActive,
    itemCode: record.ourProcessId,
    shipid: record.shipid,
  };
};

const refreshCurrentList = async () => {
  if (customer && shipAddress.length) {
    const refreshed = await dispatch(
      getCustomerItemsByCustomerAndShip({ customerCode: customer, shipIds: shipAddress }),
    );
    setCustomerData(refreshed?.payload || refreshed || []);
  }
};

// Per-row toggle (unchanged from the fixed version — now correctly includes description).
const handleToggleStatus = async (record) => {
  try {
    await dispatch(updateCustomerItem(buildStatusPayload(record, record.status !== "Active")));
    message.success(record.status === "Active" ? "Item deactivated." : "Item activated.");
    await refreshCurrentList();
  } catch (error) {
    console.error("Failed to toggle status:", error);
    message.error("Failed to update status. Please try again.");
  }
};

// Bulk activate/deactivate — fires one updateCustomerItem call per selected
// record (no dedicated bulk endpoint exists) via Promise.allSettled, so one
// failure doesn't block the rest, then refreshes once at the end.
const handleBulkStatusChange = async (records, isActive) => {
  const results = await Promise.allSettled(
    records.map((r) => dispatch(updateCustomerItem(buildStatusPayload(r, isActive)))),
  );
  const failed = results.filter((r) => r.status === "rejected").length;
  const verb = isActive ? "Activated" : "Deactivated";

  if (failed) {
    message.error(`${verb} ${records.length - failed} of ${records.length}. ${failed} failed — please retry.`);
  } else {
    message.success(`${verb} ${records.length} item${records.length === 1 ? "" : "s"}.`);
  }
  await refreshCurrentList();
};
// Bulk-disable — called from MappingTable's toolbar once the user selects
// 2+ rows and clicks "Disable Selected". Fires one updateCustomerItem call
// per record (no bulk endpoint currently exists), then refreshes once.
const handleBulkDisable = async (records) => {
  const results = await Promise.allSettled(
    records.map((r) => dispatch(updateCustomerItem(buildStatusPayload(r, false)))),
  );
  const failed = results.filter((r) => r.status === "rejected").length;

  if (failed) {
    message.error(`Disabled ${records.length - failed} of ${records.length}. ${failed} failed — please retry.`);
  } else {
    message.success(`Disabled ${records.length} item${records.length === 1 ? "" : "s"}.`);
  }
  await refreshCurrentList();
};

  const handleSaveMapping = (form, mode) => {
    if (mode === "edit") {
      setRawMappings((prev) =>
        prev.map((m) =>
          m.id === form.id
            ? {
                ...m,
                ...form,
                revision: m.revision + 1,
                updatedBy: "Current User",
                lastUpdated: new Date().toISOString(),
                history: [
                  ...m.history,
                  { date: new Date().toISOString(), by: "Current User", action: "Updated mapping", status: form.status },
                ],
              }
            : m,
        ),
      );
    } else {
      const newRecord = {
        id: Math.max(0, ...rawMappings.map((m) => m.id)) + 1,
        customer: form.customer,
        customerProcessId: form.customerProcessId,
        ourProcessId: form.ourProcessId,
        status: form.status,
        remarks: form.remarks,
        revision: 1,
        createdBy: "Current User",
        createdDate: new Date().toISOString(),
        updatedBy: "Current User",
        lastUpdated: new Date().toISOString(),
        history: [
          { date: new Date().toISOString(), by: "Current User", action: "Created mapping", status: form.status },
        ],
      };
      setRawMappings((prev) => [newRecord, ...prev]);
    }
    closeMappingDrawer();
  };

  // Actually submits — one `customerIDs` entry per ship id in `shipIds`
  // (never a `shipid` array), all sharing the same item. Called either
  // directly (no duplicates) or from the Duplicate Items dialog's
  // "Create Valid Items Only" action (duplicates excluded from `shipIds`).
  const submitMapping = async (shipIds) => {
    if (!shipIds.length) return;

    const matchedItem = customerProcessMaster.find(
      (p) => String(pidOf(p)).toUpperCase() === processId.trim().toUpperCase(),
    );

    setSavingMapping(true);
    try {
      const item = {
        itemType: itemTypeFilter,
        itemCode: processId,
        customerItemCode: customerProcessId.trim().toUpperCase(),
        isActive: true,
        // The description column doesn't allow NULL — piD_Details is always
        // populated on the matched tyre/assembly line item, so it's used
        // instead of a free-text field the user fills in.
        description: matchedItem?.piDetails || "",
      };

      const payload = {
        customerIDs: shipIds.map((shipid) => ({
          id: 0,
          shipid: Number(shipid),
          customerCode: String(customer),
          items: [item],
        })),
      };

      await dispatch(createCustomerItem(payload));

      handleSaveMapping(
        {
          customer: selectedCustomerName,
          customerProcessId: customerProcessId.trim().toUpperCase(),
          ourProcessId: processId,
          status: "Active",
          remarks: "",
        },
        "create",
      );

      // Refresh the currently viewed list using the same customer + ship
      // addresses so the newly created mapping(s) show up immediately.
      const refreshed = await dispatch(
        getCustomerItemsByCustomerAndShip({ customerCode: customer, shipIds: shipAddress }),
      );
      setCustomerData(refreshed || []);

      setCustomerProcessId("");
      message.success(
        `Mapped ${customerProcessId.trim().toUpperCase()} → ${processId} for ${shipIds.length} ship address${shipIds.length === 1 ? "" : "es"}.`,
      );
    } catch (error) {
      console.error("Failed to save customer item:", error);
      message.error("Failed to save the mapping. Please try again.");
    } finally {
      setSavingMapping(false);
    }
  };

  // Inline create — the Assembly-style "Create" action. Validates, then
  // splits the selected ship addresses into ones that already have this
  // exact (customerCode + shipid + itemType + itemCode) mapping vs. ones
  // that don't, reusing the customer items already loaded for the current
  // selection (`mappings`) rather than firing an extra lookup call.
  const handleCreateMapping = async () => {
    if (savingMapping) return; // guard against double-submit (double-click / Enter + click)
    if (!customer) return message.error("Select a customer.");
    if (!shipAddress.length) return message.error("Select at least one Customer Ship Address.");
    if (!itemTypeFilter) return message.error("Select an Item Type (Tyre / Rim / Assembly).");
    if (!processId) return message.error("Select the specs until a single Process ID is resolved.");
    if (!customerProcessId.trim()) return message.error("Enter the Customer Process ID.");

    // NOTE: reusing the same Customer Process ID across multiple ship
    // addresses for the same item is valid (confirmed by real data — the
    // same customerItemCode legitimately repeats per ship address), so
    // uniqueness is checked per shipid below, not per customer as a whole.
    // Uses the same isDuplicateMapping() the Excel bulk-upload flow uses —
    // one duplicate-detection rule, not two parallel implementations.
    const duplicateShipIds = [];
    const validShipIds = [];

    shipAddress.forEach((shipId) => {
      const existing = isDuplicateMapping(mappings, {
        customerCode: customer,
        shipid: shipId,
        itemCode: processId,
        customerItemCode: customerProcessId.trim().toUpperCase(),
      });
      (existing ? duplicateShipIds : validShipIds).push(shipId);
    });

    if (duplicateShipIds.length > 0) {
      const duplicateRows = duplicateShipIds.map((shipId) => {
        const addr = shipAddressList.find((a) => String(a.id) === String(shipId));
        return { shipId, shipAddressLabel: addr ? formatShipAddress(addr) : String(shipId) };
      });
      setDuplicateDialog({ open: true, duplicateRows, validShipIds });
      return;
    }

    await submitMapping(validShipIds);
  };

  // Deep-validates parsed Excel rows, in this exact order: (1) Customer
  // allowed, (2) Item Type allowed *for that customer*, (3) Item Code
  // belongs to that customer's allowed item list, (4) auto-fill Description,
  // (5) duplicate within the file, (6) duplicate against real backend data —
  // duplicates are checked LAST, only once everything else already passed.
  // "Allowed Item Types" isn't a hardcoded global list — it's the distinct
  // set of itemTypes actually present in that customer's own fetched line
  // items (tyre/assemblyTyre/rim), so a customer with no tyre[] entries
  // simply doesn't allow "Tyre" rows, dynamically, per customer.
  // Fetches each distinct customer's line items and existing mapped items at
  // most once (cached per customerCode for this run), not once per row.
  const handleValidateImportRows = async (rawRows) => {
    const byCustomer = new Map();
    rawRows.forEach((row) => {
      const key = norm(row.customerCode);
      if (!byCustomer.has(key)) byCustomer.set(key, []);
      byCustomer.get(key).push(row);
    });

    const processMasterByCustomer = new Map();
    const allowedItemTypesByCustomer = new Map();
    const existingByCustomer = new Map();
    const customerRecordByKey = new Map();

    for (const [key, rowsForCustomer] of byCustomer.entries()) {
      if (!key) continue;
      const customerRecord = customerList.find((c) => norm(c.custID) === key || norm(c.customerCode) === key);
      customerRecordByKey.set(key, customerRecord);
      if (!customerRecord) continue;

      const shipIdsForCustomer = [
        ...new Set(rowsForCustomer.map((r) => Number(r.shipId)).filter((n) => Number.isFinite(n))),
      ];
      const lineItemsRes = await dispatch(getListOfItems(customerRecord.custID));
      const master = buildProcessMaster({
        tyre: lineItemsRes?.tyre || [],
        assemblyTyre: lineItemsRes?.assemblyTyre || [],
        rim: lineItemsRes?.rim || [],
      });
      processMasterByCustomer.set(key, master);
      allowedItemTypesByCustomer.set(key, [...new Set(master.map((p) => p.itemType).filter(Boolean))]);

      if (shipIdsForCustomer.length) {
        const existing = await dispatch(
          getCustomerItemsByCustomerAndShip({ customerCode: customerRecord.custID, shipIds: shipIdsForCustomer }),
        );
        existingByCustomer.set(key, existing || []);
      } else {
        existingByCustomer.set(key, []);
      }
    }

    // Pre-count in-file duplicates so EVERY row sharing a key is flagged —
    // not just the second-or-later occurrence. A row shouldn't be treated as
    // "the valid original" just because it happened to appear first; if two
    // rows collide, both are wrong until the user fixes one of them.
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

    return rawRows.map((row) => {
      const key = norm(row.customerCode);
      const customerRecord = customerRecordByKey.get(key);
      const shipIdNum = Number(row.shipId);

      // STEP 1 — Customer allowed.
      if (!row.customerCode) return { ...row, _valid: false, _error: "Missing Customer Code" };
      if (!customerRecord) {
        return { ...row, _valid: false, _error: "Customer Code is not available in the allowed customer list." };
      }

      if (!row.shipId || !Number.isFinite(shipIdNum)) {
        return { ...row, _valid: false, _error: "Ship ID must be a number" };
      }
      const belongsToCustomer = (customerRecord.addresses || []).some(
        (a) => Number(a.addressType) === 1 && Number(a.id) === shipIdNum,
      );
      if (!belongsToCustomer) return { ...row, _valid: false, _error: "Ship ID doesn't belong to this Customer" };

      // STEP 2 — Item Type allowed for THIS customer (dynamic, not global).
      const itemType = norm(row.itemType);
      if (!itemType) return { ...row, _valid: false, _error: "Missing Item Type" };
      const allowedItemTypes = allowedItemTypesByCustomer.get(key) || [];
      if (!allowedItemTypes.includes(itemType)) {
        const allowedLabel = allowedItemTypes.length
          ? allowedItemTypes.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
          : "none";
        return {
          ...row,
          _valid: false,
          _error: `Item Type '${row.itemType}' is not allowed for customer ${row.customerCode}. Allowed Item Types: ${allowedLabel}.`,
        };
      }

      // STEP 3 — Item Code belongs to that customer's allowed item list
      // (and, for extra precision, actually is of the validated Item Type).
      if (!row.itemCode) return { ...row, _valid: false, _error: "Missing Item Code" };
      const master = processMasterByCustomer.get(key) || [];
      const matchedItem = master.find((p) => norm(pidOf(p)) === norm(row.itemCode) && p.itemType === itemType);
      if (!matchedItem) {
        return { ...row, _valid: false, _error: `Process ID '${row.itemCode}' is not assigned to this customer` };
      }

      if (!row.customerItemCode) return { ...row, _valid: false, _error: "Missing Customer Item Code" };

      // STEP 4 (Description) is filled in at the end, once a row is fully valid.

      // STEP 5 — duplicate against real backend data. Checked first: if this
      // item or this Customer Item Code is already permanently mapped at
      // this ship address, that's the objective reason — reported as plain
      // "Already exists", regardless of what else is going on in the file.
      const existingRecords = existingByCustomer.get(key) || [];
      const itemExistsInBackend = existingRecords.some(
        (m) => norm(m.customerCode) === norm(customerRecord.custID) && Number(m.shipid) === shipIdNum && norm(m.ourProcessId ?? m.itemCode) === norm(row.itemCode),
      );
      const cicExistsInBackend = existingRecords.some(
        (m) =>
          norm(m.customerCode) === norm(customerRecord.custID) &&
          Number(m.shipid) === shipIdNum &&
          norm(m.customerProcessId ?? m.customerItemCode) === norm(row.customerItemCode),
      );
      if (itemExistsInBackend || cicExistsInBackend) {
        return { ...row, _valid: false, _error: "Already exists" };
      }

      // STEP 6 — duplicate within the uploaded file itself. Uses the
      // pre-counted totals above, so every row sharing the same Item Code or
      // Customer Item Code at the same Ship ID is flagged — not just the
      // second-or-later one — since neither can be trusted as "the original".
      const dupItemKey = `${key}::${shipIdNum}::item::${norm(row.itemCode)}`;
      const dupCustItemCodeKey = `${key}::${shipIdNum}::cic::${norm(row.customerItemCode)}`;
      if ((itemKeyCounts.get(dupItemKey) || 0) > 1) {
        return { ...row, _valid: false, _error: "Item Code duplicated within this file for this Ship ID" };
      }
      if ((cicKeyCounts.get(dupCustItemCodeKey) || 0) > 1) {
        return { ...row, _valid: false, _error: "Customer Item Code duplicated within this file for this Ship ID" };
      }

      // Normalize to the resolved custID — the Excel cell may contain either
      // the custID or the business customerCode (both are matched above),
      // but every CustomerItemMaster call in this app sends custID as
      // `customerCode`, so that's what must flow into the create payload.
      // itemType is normalized to the same lowercase tyre/rim/assembly the
      // manual creation flow sends, regardless of how it was cased in Excel.
      return {
        ...row,
        customerCode: customerRecord.custID,
        itemType,
        _valid: true,
        _error: null,
        description: matchedItem.piDetails || "",
      };
    });
  };

  // Bulk-create via the same CreateCustomerItem endpoint the manual Save
  // Mapping flow uses — rows are grouped by CustCode+ShipID so multiple
  // customers/ship addresses in one file still resolve to a single API call.
  // `importedRows` are already validated + deduped by handleValidateImportRows.
  const handleImport = async (importedRows) => {
    const groups = new Map();
    importedRows.forEach((row) => {
      const key = `${row.customerCode}::${row.shipId}`;
      if (!groups.has(key)) {
        groups.set(key, { id: 0, shipid: Number(row.shipId), customerCode: String(row.customerCode), items: [] });
      }
      groups.get(key).items.push({
        itemType: row.itemType,
        itemCode: row.itemCode,
        customerItemCode: row.customerItemCode,
        isActive: true,
        description: row.description || "",
      });
    });

    try {
      await dispatch(createCustomerItem({ customerIDs: Array.from(groups.values()) }));
      message.success(`Imported ${importedRows.length} row${importedRows.length === 1 ? "" : "s"}.`);

      // Refresh the currently viewed customer/ship so newly imported rows
      // for it show up immediately.
      if (customer && shipAddress.length) {
        const refreshed = await dispatch(
          getCustomerItemsByCustomerAndShip({ customerCode: customer, shipIds: shipAddress }),
        );
        setCustomerData(refreshed || []);
      }
    } catch (error) {
      console.error("Bulk import failed:", error);
      message.error("Import failed. Please check the file and try again.");
      throw error;
    }
  };

  const handleExport = () => {
  const headers = [
    "customer",
    "customerID", // ← fixed — was "customerItemID" (wrong field, item's DB id)
    "shipid",
    "shipAddress",
    "companyName",
    "customerProcessId",
    "ourProcessId",
    "platform",
    "brand",
    "sideWall",
    "tyreSize",
    "rimSize",
    "tyreType",
    "status",
    "lastUpdated",
  ];
  const csv = [
    headers.join(","),
    ...filteredData.map((m) => headers.map((h) => `"${String(m[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customer-process-mappings.csv";
  a.click();
  URL.revokeObjectURL(url);
};

// Exports only the rows flagged as duplicates (same customer + ship +
// Process ID combination appearing more than once in the fetched data) —
// same CSV shape as handleExport, filtered to duplicateIds.
const handleExportDuplicates = () => {
  const duplicateRows = mappings.filter((m) => duplicateIds.has(m.id));
  if (!duplicateRows.length) {
    message.info("No duplicate items to export.");
    return;
  }

  const headers = [
    "customer",
    "customerID",
    "shipid",
    "shipAddress",
    "companyName",
    "customerProcessId",
    "ourProcessId",
    "platform",
    "brand",
    "sideWall",
    "tyreSize",
    "rimSize",
    "tyreType",
    "status",
    "lastUpdated",
  ];
  const csv = [
    headers.join(","),
    ...duplicateRows.map((m) => headers.map((h) => `"${String(m[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "duplicate-customer-process-mappings.csv";
  a.click();
  URL.revokeObjectURL(url);
};


  const matchHint = () => {
    const anySelected = activeFields.some((f) => specs[f.key]);
    if (processId) {
      return matchedRows.length > 1
        ? { tone: "ok", text: `Process ID resolved — ${matchedRows.length} items share these specs` }
        : { tone: "ok", text: "Process ID resolved — 1 exact match" };
    }
    if (!anySelected) return { tone: "idle", text: "Select the specs to resolve a Process ID" };
    if (matchedRows.length === 0) return { tone: "error", text: "No process matches this combination" };
    return { tone: "warn", text: `${matchedRows.length} processes match — narrow the specs further` };
  };
  const hint = matchHint();
  const hintTone = {
    ok: "text-emerald-600 dark:text-emerald-400",
    warn: "text-amber-600 dark:text-amber-400",
    error: "text-rose-600 dark:text-rose-400",
    idle: "text-slate-400 dark:text-slate-500",
  }[hint.tone];

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden bg-slate-100/60 dark:bg-slate-900 p-2 font-sans sm:p-3">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-2 sm:mb-2.5 shrink-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
      >
        <div className="min-w-0">
          <h1 className="truncate text-[13px] sm:text-[17px] font-semibold text-slate-900 dark:text-slate-100">
            Customer Process ID Mapping
          </h1>
          <p className="truncate text-[10px] sm:text-[12px] text-slate-500 dark:text-slate-400">
            Select the customer and tyre specification to resolve the internal Process ID, then map the customer's ID.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          <button
            onClick={refresh}
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium text-[var(--primary)] dark:text-slate-200 transition-transform hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
          >
            <RefreshCcw size={13} /> <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => window.open("https://claude.ai/code/artifact/8a11f52c-cc33-4a8c-9117-adbdbd94ccaa", "_blank", "noopener,noreferrer")}
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium text-[var(--primary)] dark:text-slate-200 transition-transform hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
          >
            <BookOpen size={13} /> <span className="hidden sm:inline">Documentation</span>
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium text-[var(--primary)] dark:text-slate-200 transition-transform hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
          >
            <UploadIcon size={13} /> <span className="hidden sm:inline">Import Excel</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium text-[var(--primary)] dark:text-slate-200 transition-transform hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
          >
            <Download size={13} /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mb-2 sm:mb-2.5 shrink-0 grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
        <StatCard label="Total Mappings" value={stats.total} icon={Layers} accent="bg-blue-50 text-blue-600" delay={0} />
        <StatCard label="Active" value={stats.active} icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" delay={0.05} />
        <StatCard label="Inactive" value={stats.inactive} icon={XCircle} accent="bg-slate-100 text-slate-500" delay={0.1} />
        <StatCard label="Recently Updated" value={stats.recentlyUpdated} icon={Clock} accent="bg-amber-50 text-amber-600" delay={0.15} />
      </div>

      {/* Specification panel — mirrors Assembly Process ID Creation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-2 sm:mb-2.5 shrink-0 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
      >
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2 sm:cursor-default"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Specification &amp; Mapping
          </span>
          <span className="flex items-center gap-2">
            <span className={`text-[11px] font-medium ${hintTone}`}>{hint.text}</span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform sm:hidden ${panelOpen ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        <div className={`${panelOpen ? "block" : "hidden"} sm:block border-t border-slate-100 dark:border-slate-700 p-3`}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
            {/* Customer */}
            <Field label="Customer" icon={Building2} accent="text-blue-600 dark:text-blue-400">
              {/* <Select
                showSearch
                allowClear
                optionFilterProp="label"
                filterOption={(input, option) => {
                  const searchValue = input.toLowerCase();
                  return (
                    String(option?.label || "").toLowerCase().includes(searchValue) ||
                    String(option?.customerCode || "").toLowerCase().includes(searchValue)
                  );
                }}
                value={customer}
                onChange={(value) => {
                  setCustomer(value);
                  // Reset ship address when customer changes
                  setShipAddress([]);
                  // Clear previous API data
                  setCustomerData([]);
                  // Spec dropdowns / Process ID / Type are customer-specific — drop stale selections
                  setSpecs(EMPTY_SPECS);
                  setProcessId("");
                  setItemTypeFilter("tyre");
                }}
                placeholder="Select Customer"
                options={customerList.map((c) => ({
                  value: c.custID,
                  label: c.customerName,
                  customerCode: c.customerCode,
                }))}
                className="w-full [&_.ant-select-selector]:!h-[30px] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-placeholder]:!text-[11px]"
              /> */}
              <Select
  showSearch
  allowClear
  optionFilterProp="label"
  filterOption={(input, option) => {
    const searchValue = input.toLowerCase();
    return (
      String(option?.label || "").toLowerCase().includes(searchValue) ||
      String(option?.customerCode || "").toLowerCase().includes(searchValue)
    );
  }}
  value={customer}
  onChange={(value) => {
    setCustomer(value);
    setShipAddress([]);
    setCustomerData([]);
    setSpecs(EMPTY_SPECS);
    setProcessId("");
    setItemTypeFilter("tyre");
  }}
  placeholder="Select Customer"
  options={customerList.map((c) => ({
    value: c.custID,
    // Was: label: c.customerName — now shows "SIPL LANKA - 9988"
    label: c.custID ? `${c.customerName} - ${c.custID}` : c.customerName,
    customerCode: c.customerCode,
  }))}
  className="w-full [&_.ant-select-selector]:!h-[30px] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-placeholder]:!text-[11px]"
/>
            </Field>

            <Field label="Customer Ship Address" icon={Building2} accent="text-blue-600 dark:text-blue-400">
              <Select
                showSearch
                allowClear
                mode="multiple"
                maxTagCount="responsive"
                optionFilterProp="label"
                value={shipAddress}
                onChange={(value) => {
                  setShipAddress(value);
                  setCustomerData([]);
                }}
                disabled={!customer}
                placeholder="Select Ship Address"
                options={shipAddressList.map((addr) => ({
                  value: addr?.id,
                  // label: formatShipAddress(addr),
                  label: `${addr?.companyName} - ${addr?.city} - ${addr?.stateName} - ${addr?.country} - ${addr?.zipCode}`,
                }))}
                className="w-full [&_.ant-select-selector]:!h-[30px] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-placeholder]:!text-[11px]"
              />
            </Field>

            {/* Item Type — disambiguates a tyre from its assembly when they share identical specs */}
            <Field label="Item Type" icon={Layers} accent="text-blue-600 dark:text-blue-400">
              <select
                value={itemTypeFilter}
                onChange={(e) => {
                  setItemTypeFilter(e.target.value);
                  setSpecs(EMPTY_SPECS);
                  setProcessId("");
                }}
                className={inputCls}
              >
                {/* <option value="">All Types</option> */}
                <option value="tyre">Tyre</option>
                {/* <option value="rim">Rim</option> */}
                <option value="assembly">Assembly</option>
              </select>
            </Field>

            {/* Spec dropdowns */}
            {activeFields.map((f) => (
              <Field key={f.key} label={f.label} icon={f.icon}>
                <select
                  value={specs[f.key]}
                  onChange={(e) => handleSpecChange(f.key, e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select...</option>
                  {specOptions[f.key]?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>
            ))}

            {/* Resolved internal Process ID */}
            <Field label="Our Process ID" icon={Hash} accent="text-blue-600 dark:text-blue-400">
              <div className="relative">
                <input
                  value={processId}
                  onChange={(e) => handleProcessIdInput(e.target.value)}
                  maxLength={8}
                  placeholder="Auto / type to search"
                  className="w-full rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 px-2 py-1.5 pr-7 text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15"
                />
                {processId && (
                  <button
                    type="button"
                    onClick={copyProcessId}
                    aria-label="Copy Process ID"
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3 text-blue-400" />
                    )}
                  </button>
                )}
              </div>
            </Field>

            {/* Customer Process ID */}
            <Field label="Customer Process ID" icon={Hash} accent="text-slate-500 dark:text-slate-400">
              <input
                value={customerProcessId}
                onChange={(e) => setCustomerProcessId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleCreateMapping()}
                placeholder="Enter customer ID"
                className={`${inputCls} font-mono font-semibold uppercase`}
              />
            </Field>
          </div>

          {/* Action bar */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateMapping}
              disabled={
                savingMapping ||
                !customer ||
                !shipAddress.length ||
                !itemTypeFilter ||
                !processId ||
                !customerProcessId.trim()
              }
              className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save size={14} /> {savingMapping ? "Saving…" : "Save Mapping"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={resetPanel}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-[12px] font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <RefreshCcw size={14} /> Reset
            </motion.button>
            <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500">
              {filteredData.length} of {mappings.length} records
            </span>
          </div>
        </div>
      </motion.div>

      {/* Records */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-1 min-h-[380px] sm:min-h-[480px] flex-col overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
      >
        <div className="shrink-0 flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-700 p-2.5">
          <div className="relative min-w-[200px] flex-1">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across all columns…"
              className="h-8 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-8 pr-3 text-[13px] text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            />
          </div>

          <Select
            allowClear
            placeholder="Status"
            value={status}
            onChange={setStatus}
            options={["Active", "Inactive", "Pending"].map((s) => ({ value: s, label: s }))}
            className="w-[120px] [&_.ant-select-selector]:!h-8"
          />

          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Ship Address"
            value={shipAddressFilter}
            onChange={setShipAddressFilter}
            options={shipAddressFilterOptions.map((addr) => ({ value: addr, label: addr }))}
            className="w-[180px] [&_.ant-select-selector]:!h-8"
          />

          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Company Name"
            value={companyNameFilter}
            onChange={setCompanyNameFilter}
            options={companyNameFilterOptions.map((name) => ({ value: name, label: name }))}
            className="w-[180px] [&_.ant-select-selector]:!h-8"
          />

          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Customer"
            value={customerFilter}
            onChange={setCustomerFilter}
            options={customerFilterOptions.map((name) => ({ value: name, label: name }))}
            className="w-[180px] [&_.ant-select-selector]:!h-8"
          />
          {duplicateIds.size > 0 && (
  <div
    className={`flex h-8 items-stretch overflow-hidden rounded-md border transition-colors ${
      showDuplicatesOnly
        ? "border-amber-300 dark:border-amber-700"
        : "border-amber-200 dark:border-amber-800"
    }`}
  >
    <button
      onClick={() => setShowDuplicatesOnly((v) => !v)}
      className={`flex items-center gap-1.5 px-3 text-[12px] font-semibold transition-colors ${
        showDuplicatesOnly
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400"
      }`}
    >
      Duplicates ({duplicateIds.size})
    </button>
    <button
      onClick={handleExportDuplicates}
      title="Download duplicate items"
      className={`flex items-center justify-center border-l px-2 transition-colors ${
        showDuplicatesOnly
          ? "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
      }`}
    >
      <Download size={13} />
    </button>
  </div>
)}

          <Dropdown
            open={colMenuOpen}
            onOpenChange={setColMenuOpen}
            trigger={["click"]}
            placement="bottomRight"
            getPopupContainer={() => document.body}
            dropdownRender={() => (
              <div className="w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-lg">
                <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Show columns
                </p>
                <div className="max-h-64 overflow-y-auto pr-1">
                  {BASE_COLUMNS.map((c) => (
                    <label
                      key={c.key}
                      className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Checkbox
                        checked={visibleColumns[c.key]}
                        onChange={(e) => setVisibleColumns((prev) => ({ ...prev, [c.key]: e.target.checked }))}
                      />
                      {c.title}
                    </label>
                  ))}
                </div>
              </div>
            )}
          >
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-3 text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              <SettingOutlined /> Columns
            </button>
          </Dropdown>

          {hasActiveTableFilters && (
  <button
    onClick={clearTableFilters}
    className="flex items-center gap-1 whitespace-nowrap text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
  >
    <X size={12} /> Clear
  </button>
)}
        </div>

  <MappingTable
  data={filteredData}
  loading={loading || customerLoading}
  visible={visibleColumns}
  onView={openView}
  onEdit={openEdit}
  onToggleStatus={handleToggleStatus}
  onBulkStatusChange={handleBulkStatusChange}
  duplicateIds={duplicateIds}
/>
      </motion.div>

      {/* Drawers */}
      <MappingDrawer
        open={mappingDrawer.open}
        mode={mappingDrawer.mode}
        record={mappingDrawer.record}
        mappings={mappings}
        onClose={closeMappingDrawer}
        onSave={handleSaveMapping}
        onOpenExisting={handleOpenExisting}
      />
      <ViewDrawer
        open={viewDrawer.open}
        record={viewDrawer.record}
        onClose={() => setViewDrawer({ open: false, record: null })}
        onEdit={openEdit}
      />
      <HistoryDrawer
        open={historyDrawer.open}
        record={historyDrawer.record}
        onClose={() => setHistoryDrawer({ open: false, record: null })}
      />
      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onValidate={handleValidateImportRows}
        onImport={handleImport}
      />
      <DuplicateItemsDialog
        open={duplicateDialog.open}
        onClose={() => setDuplicateDialog({ open: false, duplicateRows: [], validShipIds: [] })}
        duplicateRows={duplicateDialog.duplicateRows}
        validCount={duplicateDialog.validShipIds.length}
        customer={selectedCustomerName}
        itemType={itemTypeFilter}
        itemCode={processId}
        submitting={savingMapping}
        onCreateValidOnly={async () => {
          const { validShipIds } = duplicateDialog;
          setDuplicateDialog({ open: false, duplicateRows: [], validShipIds: [] });
          await submitMapping(validShipIds);
        }}
      />
      <EditCustomerItemDialog
        open={editDialog.open}
        record={editDialog.record}
        customerProcessMaster={customerProcessMaster}
        onClose={closeEditDialog}
        onSave={handleSaveEditedItem}
        saving={savingEdit}
        error={editError}
      />
    </div>
  );
};

export default CustomerProcessIDMapping;