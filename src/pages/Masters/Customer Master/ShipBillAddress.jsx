import React, { useState, useMemo, useEffect } from "react";
  import {
    Form,
    Input,
    Select,
    Table,
    Tag,
    Divider,
    Tooltip,
    Switch,
    Empty,
    Skeleton,
    message,
    Row,
    Col,
    Modal,
    Segmented,
  } from "antd";
  import {
    PlusOutlined,
    ReloadOutlined,
    DownloadOutlined,
    SearchOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    StarFilled,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    FilterOutlined,
    GlobalOutlined,
    IdcardOutlined,
    SettingOutlined,
    ExclamationCircleOutlined,
  } from "@ant-design/icons";
  import { motion, AnimatePresence } from "framer-motion";
  import { useDispatch, useSelector } from "react-redux";
  import { createShipBillAddress, getCustomerMasterData, getCustomers, getShipBillAddress, getShipCustomerUsers, updateShipBillAddress } from "../../../Redux/Slices/Master/CustomerMaster/CustomerMasterSlice";

  const { TextArea } = Input;

  /* ============================================================
    ENTERPRISE MASTER DATA
    ============================================================
    Business rule (dummy data, API integration comes later):
      AddressType: 2 = Billing, 1 = Shipping
      BillID: 0 for Billing rows, parent Billing ID for Shipping rows
    Each row keeps its own `addressType` ("Billing" | "Shipping") and
    `billId` so the existing UI never has to know about the numeric
    codes — they're only used at save-time to match the schema.
    ============================================================ */


  const INITIAL_ADDRESSES = [
    // ---- VIKING TRAILERS: 2 Billing addresses, one with 2 Shipping, one with 1 ----
    {
      id: "BILL-11",
      billId: 0,
      customer: "VIKING TRAILERS INTERNATIONAL FZCO",
      addressType: "Billing",
      company: "Viking Trailers Intl. FZCO — Main Office",
      address: "Jebel Ali Free Zone, PO Box 261830",
      city: "Dubai",
      state: "Dubai",
      country: "United Arab Emirates",
      pincode: "261830",
      contactPerson: "Bob Law",
      phone: "+971 4 881 2233",
      email: "boblvti@eim.ae",
      status: "Active",
      isDefault: true,
    },
    {
      id: "SHIP-13",
      billId: "BILL-11",
      customer: "VIKING TRAILERS INTERNATIONAL FZCO",
      addressType: "Shipping",
      company: "Warehouse A",
      address: "Jebel Ali Logistics Zone, Gate 4",
      city: "Dubai",
      state: "Dubai",
      country: "United Arab Emirates",
      pincode: "261831",
      contactPerson: "Ahmed Rashid",
      phone: "+971 4 881 9911",
      email: "warehouse.a@viking.ae",
      status: "Active",
      isDefault: true,
    },
    {
      id: "SHIP-15",
      billId: "BILL-11",
      customer: "VIKING TRAILERS INTERNATIONAL FZCO",
      addressType: "Shipping",
      company: "Warehouse C",
      address: "Al Quoz Industrial Area 3",
      city: "Dubai",
      state: "Dubai",
      country: "United Arab Emirates",
      pincode: "261833",
      contactPerson: "Sara Yusuf",
      phone: "+971 4 881 4477",
      email: "warehouse.c@viking.ae",
      status: "Active",
      isDefault: false,
    },
    {
      id: "BILL-12",
      billId: 0,
      customer: "VIKING TRAILERS INTERNATIONAL FZCO",
      addressType: "Billing",
      company: "Viking Trailers Intl. FZCO — Branch Office",
      address: "Sharjah Airport Free Zone, Building 7",
      city: "Sharjah",
      state: "Sharjah",
      country: "United Arab Emirates",
      pincode: "342100",
      contactPerson: "Nadia Farooq",
      phone: "+971 6 557 2200",
      email: "branch@viking.ae",
      status: "Active",
      isDefault: false,
    },
    {
      id: "SHIP-14",
      billId: "BILL-12",
      customer: "VIKING TRAILERS INTERNATIONAL FZCO",
      addressType: "Shipping",
      company: "Warehouse B",
      address: "SAIF Zone, Warehouse Row 12",
      city: "Sharjah",
      state: "Sharjah",
      country: "United Arab Emirates",
      pincode: "342101",
      contactPerson: "Khalid Omar",
      phone: "+971 6 557 8800",
      email: "warehouse.b@viking.ae",
      status: "Active",
      isDefault: true,
    },

    // ---- TOV ZEUS: 1 Billing address, 1 Shipping address ----
    {
      id: "BILL-21",
      billId: 0,
      customer: "TOV ZEUS",
      addressType: "Billing",
      company: "TOV Zeus Trading — HQ",
      address: "Herengracht 182",
      city: "Amsterdam",
      state: "North Holland",
      country: "Germany",
      pincode: "1016BR",
      contactPerson: "Elena Novak",
      phone: "+31 20 555 0192",
      email: "elena@tovzeus.com",
      status: "Active",
      isDefault: true,
    },
    {
      id: "SHIP-22",
      billId: "BILL-21",
      customer: "TOV ZEUS",
      addressType: "Shipping",
      company: "TOV Zeus Distribution Center",
      address: "Havenweg 34",
      city: "Rotterdam",
      state: "South Holland",
      country: "Germany",
      pincode: "3044AA",
      contactPerson: "Jasper Klein",
      phone: "+31 10 555 0421",
      email: "dc@tovzeus.com",
      status: "Active",
      isDefault: true,
    },

    // ---- LOGERMAX: 1 Billing address, NO shipping yet (tests empty state) ----
    {
      id: "BILL-31",
      billId: 0,
      customer: "LOGERMAX SUPPLY CO",
      addressType: "Billing",
      company: "Logermax Supply Co.",
      address: "221 Industrial Parkway",
      city: "Houston",
      state: "Texas",
      country: "United States",
      pincode: "77034",
      contactPerson: "Marcus Reed",
      phone: "+1 713 555 0148",
      email: "m.reed@logermax.com",
      status: "Inactive",
      isDefault: false,
    },

    // ---- SIPL EXPORTS: 1 Billing address, 1 Shipping address ----
    {
      id: "BILL-41",
      billId: 0,
      customer: "SIPL EXPORTS LTD",
      addressType: "Billing",
      company: "SIPL Exports Ltd.",
      address: "Plot 44, SIPCOT Industrial Estate",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      pincode: "600058",
      contactPerson: "Priya Raman",
      phone: "+91 44 4567 8901",
      email: "priya.raman@siplexports.in",
      status: "Active",
      isDefault: true,
    },
    {
      id: "SHIP-42",
      billId: "BILL-41",
      customer: "SIPL EXPORTS LTD",
      addressType: "Shipping",
      company: "SIPL Bonded Warehouse",
      address: "Plot 51, SIPCOT Industrial Estate",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      pincode: "600058",
      contactPerson: "Karthik Selvam",
      phone: "+91 44 4567 9090",
      email: "warehouse@siplexports.in",
      status: "Active",
      isDefault: true,
    },
  ];

  // Domestic/Export classification must use ONLY UserMaster.custCode.
  const isDomesticCustomer = (custCode) =>
    String(custCode || "").trim().toUpperCase() === "DE0048";

  export default function ExportCustomerAddressManagement() {
    /* ---------------- State ---------------- */
    const [form] = Form.useForm();
    // const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);

    // Read the master data from Redux and keep a local working copy for UI-only edits.
  const dispatch = useDispatch();
  const addressesFromStore = useSelector((state) => state.customerMaster.listOfShipBillAddress);
  const customersList = useSelector((state) => state.customerMaster.listOfUseres || []);
  const loadingTable = useSelector((state) => state.customerMaster.loadingShip);
  // Master data (customer types / countries / payment terms / GST rates) —
  // needed here for the domestic-only GST Rate dropdown below.
  const masterData = useSelector((state) => state.customerMaster.masterData) || {};
  const [addresses, setAddresses] = useState([]);
  console.log(customersList);

  // Domestic / Export toggle — filters CUSTOMER_OPTIONS by UserMaster.custCode only.
  const [customerMode, setCustomerMode] = useState("domestic");


  useEffect(() => {
    dispatch(getShipBillAddress());
    dispatch(getShipCustomerUsers());
    dispatch(getCustomerMasterData());
  }, [dispatch]);

  useEffect(() => {
    setAddresses(Array.isArray(addressesFromStore) ? addressesFromStore : []);
  }, [addressesFromStore]);
    // Parent-child ERP state (Customer -> Billing -> Shipping)
    const [selectedCustomer, setSelectedCustomer] = useState(undefined);
    const [selectedBilling, setSelectedBilling] = useState(null);

    const [selectedId, setSelectedId] = useState(null);
    const [mode, setMode] = useState("create"); // create | edit | view
    const [formType, setFormType] = useState("billing"); // billing | shipping — which kind of record the drawer is creating/editing
    const [panelOpen, setPanelOpen] = useState(false); // controls the slide-over drawer
    // const [loadingTable, setLoadingTable] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);

    const [filters, setFilters] = useState({
      addressType: undefined,
      user: undefined,
      country: undefined,
      status: undefined,
    });

    const CUSTOMERS = useMemo(() => {
      if (customersList.length > 0) {
        return customersList.map((item) => item.custFullName).filter(Boolean);
      }

      return [...new Set(addresses.map((x) => x.customer).filter(Boolean))];
    }, [addresses, customersList]);

    const CUSTOMER_OPTIONS = useMemo(() => {
    if (!Array.isArray(customersList)) return [];

    return customersList
      .filter(
        (item) =>
          Number(item.userStatus) === 1 &&
          item.custFullName?.trim()
      )
      .filter((item) =>
        customerMode === "domestic"
          ? isDomesticCustomer(item.custCode)
          : !isDomesticCustomer(item.custCode)
      )
      .map((item) => ({
        label: `${item.custCode || item.id} - ${item.custFullName}`,
        value: String(item.id),
      }));
  }, [customersList, customerMode]);

  const COUNTRIES = useMemo(() => {
    return [
      ...new Set(
        addresses.map(x => x.country)
      ),
    ];
  }, [addresses]);

  // GST Rate options for the domestic-only GST section below. Selecting one
  // supplies cgst/sgst/igst automatically at save time (see handleSave) —
  // the user only has to type the GST registration number themselves.
  const gstRateOptions = useMemo(() => {
    return (masterData.gstRates || []).map((item) => ({
      value: item.gstRateId,
      label: `${item.gstName} (${item.gstCode})`,
    }));
  }, [masterData.gstRates]);

    const getCustomerCode = (customerName) => {
      const selectedCustomerMaster = customersList.find((item) => item.custname === customerName);
      if (selectedCustomerMaster?.custcode) {
        return selectedCustomerMaster.custcode;
      }

      const selectedAddress = addresses.find((item) => item.customer === customerName || item.company === customerName);
      return selectedAddress?.custCode || "";
    };

    const getFormValuesFromRecord = (record) => {
      // Best-effort match of the record's stored cgst/sgst/igst back to a
      // GST Rate option, so EDIT/VIEW shows which slab was originally picked.
      // The address record itself doesn't store a gstRateId — only the
      // resulting cgst/sgst/igst numbers — so this is a value match, not
      // an id lookup.
      const matchedGstRate = (masterData.gstRates || []).find(
        (item) =>
          Number(item.cgst) === Number(record.cgst || 0) &&
          Number(item.sgst) === Number(record.sgst || 0) &&
          Number(item.igst) === Number(record.igst || 0)
      );

      return {
        ...record,
        status: record.status === "Active",
        isDefault: !!record.isDefault,
        gstRateId: matchedGstRate?.gstRateId,
        billTo:
          record.addressType === "Shipping"
            ? addresses.find((item) => item.id === record.billId && item.addressType === "Billing")?.company || ""
            : undefined,
      };
    };

    const selectedCustomerDetails = useMemo(() => {
    if (!selectedCustomer) return null;

    return customersList.find(
      (item) =>
        String(item.custCode) === String(selectedCustomer)
    );
  }, [customersList, selectedCustomer]);

  const selectedCustomerCodes = useMemo(() => {
    if (!selectedCustomerDetails?.custFullName) {
      return [];
    }

    const selectedName = selectedCustomerDetails.custFullName
      .trim()
      .toUpperCase();

    return customersList
      .filter(
        (item) =>
          item.custFullName?.trim().toUpperCase() === selectedName
      )
      .map((item) => String(item.custCode));
  }, [customersList, selectedCustomerDetails]);

    /* ---------------- Derived data ---------------- */

    // Only Billing rows (AddressType = 2), scoped to the selected customer if one is chosen
    const billingAddresses = useMemo(() => {
    return addresses.filter((address) => {
      // Only Billing Addresses
      if (address.addressType !== "Billing") {
        return false;
      }

      // FIX:
      // Customer Master ID === Ship/Bill Address custCode
      if (
        selectedCustomer &&
        String(address.custCode).trim() !==
          String(selectedCustomer).trim()
      ) {
        return false;
      }

      if (
        filters.country &&
        address.country !== filters.country
      ) {
        return false;
      }

      if (
        filters.status &&
        address.status !== filters.status
      ) {
        return false;
      }

      return true;
    });
  }, [
    addresses,
    selectedCustomer,
    filters.country,
    filters.status,
  ]);
  console.log("======================================");
  console.log("SELECTED CUSTOMER ID:", selectedCustomer);

  const selectedCustomerData = customersList.find(
    (customer) =>
      String(customer.id).trim() ===
      String(selectedCustomer).trim()
  );

  console.log("SELECTED CUSTOMER DATA:", selectedCustomerData);

  console.log("ACTIVE CUSTOMER OPTIONS:");
  console.table(
    CUSTOMER_OPTIONS.map((customer) => ({
      label: customer.label,
      customerId: customer.value,
    }))
  );

  console.log("ALL ADDRESS DATA:");
  console.table(
    addresses.map((address) => ({
      addressId: address.id,
      addressCustCode: address.custCode,
      addressType: address.addressType,
      customer: address.customer,
      isSelectedCustomer:
        String(address.custCode).trim() ===
        String(selectedCustomer).trim(),
    }))
  );

  console.log("MATCHED BILLING ADDRESSES:");
  console.table(
    addresses
      .filter(
        (address) =>
          address.addressType === "Billing" &&
          String(address.custCode).trim() ===
            String(selectedCustomer).trim()
      )
      .map((address) => ({
        addressId: address.id,
        custCode: address.custCode,
        addressType: address.addressType,
        customer: address.customer,
        company: address.company,
      }))
  );

  console.log("======================================");

    // Only Shipping rows (AddressType = 1) that belong to the currently selected Billing address
    const shippingAddresses = useMemo(() => {
      if (!selectedBilling) return [];
      return addresses.filter((a) => a.addressType === "Shipping" && a.billId === selectedBilling.id);
    }, [addresses, selectedBilling]);

    /* ---------------- Handlers ---------------- */
    const handleRefresh = async () => {
      await dispatch(getShipBillAddress());
      message.success("Master data re-synchronized successfully.");
    };

    const handleExport = () => {
      message.loading("Generating corporate audit report (XLSX)...");
    };

    const handleSearch = () => {
      message.success("Address filters applied successfully.");
    };

    const handleReset = () => {
      setFilters({ addressType: undefined, user: undefined, country: undefined, status: undefined });
      setSelectedCustomer(undefined);
      setSelectedBilling(null);
    };

    // Requirement 1: selecting a customer scopes everything below it and clears
    // whatever Billing Address was previously selected (it belonged to another customer).
    const handleCustomerChange = (value) => {
      setSelectedCustomer(value);
      setSelectedBilling(null);
    };

    // Domestic / Export toggle — a customer selected in one mode must not remain
    // selected when switching to the other mode, so reset dependent selection state.
    const handleCustomerModeChange = (value) => {
      setCustomerMode(value);
      setSelectedCustomer(undefined);
      setSelectedBilling(null);
      setSelectedId(null);
      setPanelOpen(false);
      form.resetFields();
    };

    // Requirement 3: clicking a Billing row selects it, highlights it, and the
    // Shipping list below refreshes automatically via the shippingAddresses useMemo.
    const handleSelectBilling = (record) => {
      setSelectedBilling(record);
    };

    // Requirement 5: New Billing Address -> AddressType = 2, BillID = 0
    const handleNewBilling = () => {
      setMode("create");
      setFormType("billing");
      setSelectedId(null);
      form.resetFields();
      if (selectedCustomer) {
        form.setFieldsValue({ customer: selectedCustomer, addressType: "Billing", status: true, isDefault: false });
      } else {
        form.setFieldsValue({ addressType: "Billing", status: true, isDefault: false });
      }
      setPanelOpen(true);
    };

    // Requirement 6: New Shipping Address -> AddressType = 1, BillID = SelectedBilling.ID
    // Blocked until a Billing Address has been selected.
    const handleNewShipping = () => {
      if (!selectedBilling) {
        message.warning("Select a Billing Address first before adding a Shipping Address.");
        return;
      }
      setMode("create");
      setFormType("shipping");
      setSelectedId(null);
      form.resetFields();
      form.setFieldsValue({
        // customer: selectedBilling.customer,
        customer: selectedBilling.custCode,
        billTo: selectedBilling.company,
        addressType: "Shipping",
        status: true,
        isDefault: false,
      });
      setPanelOpen(true);
    };

    const handleView = (record) => {
      setMode("view");
      setFormType(record.addressType === "Billing" ? "billing" : "shipping");
      setSelectedId(record.id);
      form.setFieldsValue(getFormValuesFromRecord(record));
      setPanelOpen(true);
    };

    // Requirement 7: editing a Billing address only updates that Billing address;
    // editing a Shipping address keeps its BillID relationship untouched.
    const handleEdit = (record) => {
      setMode("edit");
      setFormType(record.addressType === "Billing" ? "billing" : "shipping");
      setSelectedId(record.id);
      form.setFieldsValue(getFormValuesFromRecord(record));
      setPanelOpen(true);
    };

    // Requirement 9: deleting a Shipping address only removes that Shipping address.
    const handleDeleteShipping = (record) => {
      setAddresses((prev) => prev.filter((a) => a.id !== record.id));
      message.warning(`Shipping record [${record.id}] has been removed.`);
      if (selectedId === record.id) {
        setSelectedId(null);
        setMode("create");
        form.resetFields();
        setPanelOpen(false);
      }
    };

    // Requirement 8: deleting a Billing address must warn that all of its Shipping
    // addresses will go with it, then (dummy) cascade-delete them together.
    const handleDeleteBilling = (record) => {
      const childCount = addresses.filter((a) => a.addressType === "Shipping" && a.billId === record.id).length;
      Modal.confirm({
        title: "Delete Billing Address?",
        icon: <ExclamationCircleOutlined />,
        content:
          childCount > 0
            ? `"${record.company}" has ${childCount} Shipping Address${childCount > 1 ? "es" : ""} linked to it. Deleting this Billing Address will also remove all of its Shipping Addresses. This cannot be undone.`
            : `This will permanently delete "${record.company}". This cannot be undone.`,
        okText: "Delete Billing Address",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: () => {
          setAddresses((prev) => prev.filter((a) => a.id !== record.id && a.billId !== record.id));
          message.warning(`Billing record [${record.id}] and its Shipping Addresses have been removed.`);
          if (selectedBilling?.id === record.id) {
            setSelectedBilling(null);
          }
          if (selectedId === record.id) {
            setSelectedId(null);
            setMode("create");
            form.resetFields();
            setPanelOpen(false);
          }
        },
      });
    };

    // Routes to the correct delete flow based on the record's own type —
    // the Actions column and the Shipping cards both just call this.
    const handleDelete = (record) => {
      if (record.addressType === "Billing") {
        handleDeleteBilling(record);
      } else {
        handleDeleteShipping(record);
      }
    };

    // Requirement: "Set Primary" for Shipping is scoped to its parent Billing address,
    // not the whole customer, since each Billing address can have its own default Shipping.
    const handleSetDefault = (record) => {
      setAddresses((prev) =>
        prev.map((a) => {
          if (record.addressType === "Shipping") {
            if (a.addressType === "Shipping" && a.billId === record.billId) {
              return { ...a, isDefault: a.id === record.id };
            }
            return a;
          }
          if (a.addressType === "Billing" && a.customer === record.customer) {
            return { ...a, isDefault: a.id === record.id };
          }
          return a;
        })
      );
      message.success(`Primary address vector updated for ${record.customer}`);
    };

    const handleSave = async () => {
      try {
        const values = await form.validateFields();
        setLoadingForm(true);

        // GST breakdown is derived from the selected GST Rate master-data
        // entry (domestic-only section below) — cgst/sgst/igst are never
        // typed by hand, only looked up. In export mode gstRateId stays
        // undefined, so this naturally resolves to zeros, matching the
        // slice's existing `Number(formPayload.cgst || 0)` defaults.
        const selectedGstRate = (masterData.gstRates || []).find(
          (item) => item.gstRateId === values.gstRateId
        );
        const gstBreakdown = {
          cgst: selectedGstRate?.cgst ?? 0,
          sgst: selectedGstRate?.sgst ?? 0,
          igst: selectedGstRate?.igst ?? 0,
        };

        if (mode === "edit" && selectedId) {
          const existing = addresses.find((a) => a.id === selectedId);
          if (!existing) {
            message.error("Original address record not found.");
            return;
          }

          await dispatch(
            updateShipBillAddress({
              ...values,
              ...gstBreakdown,
              id: selectedId,
              custCode: existing.custCode,
              company: values.company || values.customer,
              status: values.status ? "Active" : "Inactive",
              isDefault: !!values.isDefault,
              addressType: existing.addressType,
              billId: existing.billId,
            })
          );

          message.success(`Address entry updated [Ref: ${selectedId}]`);
        } else {
          if (formType === "shipping" && !selectedBilling) {
            message.error("A Billing Address must be selected before creating a Shipping Address.");
            return;
          }

          // const custCode = getCustomerCode(values.customer);
          const custCode = values.customer;
          if (!custCode) {
            message.error("Customer code was not found for the selected customer.");
            return;
          }

          await dispatch(
            createShipBillAddress({
              ...values,
              ...gstBreakdown,
              custCode,
              customer: values.customer,
              company: values.company || values.customer,
              status: values.status ? "Active" : "Inactive",
              isDefault: !!values.isDefault,
              addressType: formType === "billing" ? "Billing" : "Shipping",
              billId: formType === "billing" ? 0 : selectedBilling?.id,
            })
          );

          message.success(`New ${formType === "billing" ? "Billing" : "Shipping"} address created successfully.`);
        }

        setMode("create");
        setSelectedId(null);
        form.resetFields();
        setPanelOpen(false);
      } catch (error) {
        if (error?.errorFields) {
          message.error("Validation failed. Please verify ledger constraints.");
        } else {
          message.error(error?.response?.data?.message || "Failed to save the address.");
        }
      } finally {
        setLoadingForm(false);
      }
    };

    const handleClear = () => form.resetFields();

    const handleCancel = () => {
      setMode("create");
      setSelectedId(null);
      form.resetFields();
      setPanelOpen(false);
    };

    const isReadOnly = mode === "view";

    /* ---------------- Enterprise Table Columns ---------------- */
    const columns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (text) => <span className="font-mono font-bold text-slate-600">{text}</span>,
      },
      { title: "Customer Account", dataIndex: "customer", key: "customer", width: 220, ellipsis: true },
      {
        title: "Address Type",
        dataIndex: "addressType",
        key: "addressType",
        width: 120,
        render: (v) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border ${
              v === "Billing" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"
            }`}
          >
            {v}
          </span>
        ),
      },
      // { title: "Legal Entity Name", dataIndex: "company", key: "company", width: 200, ellipsis: true },
      // { title: "Address", dataIndex: "address", key: "address", width: 220 },
 {
   title: "Address",
   dataIndex: "address",
   key: "address",
   width: 220,
   render: (text) =>
     // FIX: legacy .NET data uses "~" as a line separator; split and render as lines
     text
       ? text
           .split("~")
           .map((line) => line.trim())
           .filter(Boolean)
           .map((line, i) => <div key={i}>{line}</div>)
       : "",
 },
      { title: "City", dataIndex: "city", key: "city", width: 120, ellipsis: true },
      { title: "State", dataIndex: "state", key: "state", width: 120, ellipsis: true },
      { title: "Country/Region", dataIndex: "country", key: "country", width: 150, ellipsis: true },
      { title: "Contact Person", dataIndex: "contactPerson", key: "contactPerson", width: 140, ellipsis: true },
      {
        title: "System Status",
        dataIndex: "status",
        key: "status",
        width: 110,
        render: (v) => (
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${v === "Active" ? "text-emerald-600" : "text-slate-400"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${v === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
            {v}
          </span>
        ),
      },
      {
        title: "Actions",
        key: "action",
        width: 110,
        fixed: "right",
        render: (_, record) => (
          <div className="flex items-center gap-0.5">
            <Tooltip title="View Master Record" placement="top">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(record);
                }}
                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition"
              >
                <EyeOutlined className="text-xs" />
              </button>
            </Tooltip>
            <Tooltip title="Modify Entry" placement="top">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(record);
                }}
                className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition"
              >
                <EditOutlined className="text-xs" />
              </button>
            </Tooltip>
            <Tooltip title="Deprecate Record" placement="top">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(record);
                }}
                className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition"
              >
                <DeleteOutlined className="text-xs" />
              </button>
            </Tooltip>
          </div>
        ),
      },
    ];

    return (
      <div className="min-h-screen w-full bg-[#f4f6f9] text-[#1e293b] antialiased text-xs font-sans">
        {/* ================= ERP APPLICATION HEADER ================= */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Segmented
                  value={customerMode}
                  onChange={handleCustomerModeChange}
                  options={[
                    { label: "Domestic", value: "domestic" },
                    { label: "Export", value: "export" },
                  ]}
                  size="small"
                />
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <GlobalOutlined className="text-blue-600" />
                {customerMode === "domestic" ? "Domestic Customer Address Management" : "Export Customer Address Management"}
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5">
                System Matrix for Global Logistics, Customs Operations &amp; Billing Endpoints.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNewBilling}
                className="inline-flex items-center gap-1.5 rounded bg-[var(--primary)] hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all"
              >
                <PlusOutlined /> New Billing Address
              </button>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-1.5 rounded border border-[var(--border)] bg-white hover:bg-[var(--background)] text-slate-700 px-3 py-1.5 text-xs font-medium shadow-xs transition"
              >
                <ReloadOutlined /> Synchronize
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded border border-[var(--border)] bg-white hover:bg-[var(--background)] text-slate-700 px-3 py-1.5 text-xs font-medium shadow-xs transition"
              >
                <DownloadOutlined /> Data Output
              </button>
            </div>
          </div>
        </div>

        {/* ================= SYSTEM OPERATIONAL CORE LAYER ================= */}
        <div className="p-6 max-w-[1920px] mx-auto space-y-4">
          {/* FILTERS AREA (SAP Standard Top Filter Ribbon) */}
          <div className="bg-[var(--background)] border border-slate-200 rounded p-4 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FilterOutlined className="text-slate-400" /> Query Filters
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Customer Account</label>
                <Select
                  allowClear
                  showSearch
                  placeholder="All Accounts"
                  className="w-full text-xs enterprise-select"
                  value={selectedCustomer}
                  onChange={handleCustomerChange}
                  options={CUSTOMER_OPTIONS}
                  optionFilterProp="label"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Functional Designation</label>
                <Select
                  allowClear
                  placeholder="All Types"
                  className="w-full text-xs"
                  value={filters.addressType}
                  onChange={(v) => setFilters((f) => ({ ...f, addressType: v }))}
                  options={[
                    { label: "Billing Endpoints", value: "Billing" },
                    { label: "Shipping / Freight Delivery", value: "Shipping" },
                  ]}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Jurisdiction / Country</label>
                <Select
                  allowClear
                  placeholder="Global Regions"
                  className="w-full text-xs"
                  value={filters.country}
                  onChange={(v) => setFilters((f) => ({ ...f, country: v }))}
                  options={COUNTRIES.map((c) => ({ label: c, value: c }))}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Operational Lifecycle</label>
                <Select
                  allowClear
                  placeholder="Status Matrix"
                  className="w-full text-xs"
                  value={filters.status}
                  onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                  options={[
                    { label: "Active Nodes", value: "Active" },
                    { label: "Inactive Nodes", value: "Inactive" },
                  ]}
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-1.5 text-xs font-medium shadow-xs transition"
                >
                  <SearchOutlined /> Execute Query
                </button>
                <button
                  onClick={handleReset}
                  className="rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-medium transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* DOUBLE COLUMN CORE WORKSPACE — table expands to full width when the drawer is closed */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-start relative overflow-hidden">
            {/* PRIMARY WORK DESK: CENTRAL LEDGER MATRIX (Billing Addresses only) */}
            <div
              className={`transition-all duration-300 ${
                panelOpen ? "xl:col-span-3" : "xl:col-span-5"
              } bg-white border border-slate-200 rounded shadow-xs`}
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="font-bold text-slate-800 tracking-tight text-sm">Billing Address Ledger</div>
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-mono">
                  {billingAddresses.length} Record Matrix
                </span>
              </div>

              <div className="p-2">
                {loadingTable ? (
                  <div className="p-4">
                    <Skeleton active paragraph={{ rows: 8 }} />
                  </div>
                ) : billingAddresses.length === 0 ? (
                  <div className="py-12">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Database query yielded zero entity definitions." />
                  </div>
                ) : (
                  <Table
                    rowKey="id"
                    dataSource={billingAddresses}
                    columns={columns}
                    size="small"
                    scroll={{ x: 800 }}
                    pagination={{ pageSize: 16, showSizeChanger: false }}
                    className="enterprise-grid"
                    onRow={(record) => ({
                      onClick: () => handleSelectBilling(record),
                      className: "cursor-pointer",
                    })}
                    rowClassName={(record) =>
                      record.id === selectedId || record.id === selectedBilling?.id
                        ? "!bg-blue-50/60 font-medium transition-colors"
                        : "hover:!bg-slate-50/80 transition-colors text-slate-600"
                    }
                  />
                )}
              </div>
            </div>

            {/* SLIDE-OVER ENTRY DRAWER LAYER */}
            <AnimatePresence>
              {panelOpen && (
                <motion.div
                  initial={{ x: "100%", opacity: 0.5 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="xl:col-span-2 w-full bg-white border border-slate-200 rounded shadow-lg sticky top-4 z-10"
                >
                  {/* ================= PANEL HEADER ================= */}
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <IdcardOutlined className="text-blue-600" />
                      <span className="font-bold text-slate-800 text-sm">
                        {mode === "create"
                          ? formType === "billing"
                            ? "New Billing Address"
                            : "New Shipping Address"
                          : mode === "edit"
                          ? "Modify Master Record"
                          : "Audit View Control"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-wider ${
                          mode === "edit"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : mode === "view"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {mode === "edit" ? "Staged changes" : mode === "view" ? "Protected entry" : "New Matrix Ledger"}
                      </span>
                      {/* Close button to quickly dismiss panel */}
                      <button
                        onClick={handleCancel}
                        className="text-slate-400 hover:text-slate-600 font-bold px-1.5 py-0.5 hover:bg-slate-100 rounded text-xs transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* ================= PANEL BODY ================= */}
                  <div className="p-5 max-h-[calc(100vh-220px)] overflow-y-auto">
                    {loadingForm ? (
                      <Skeleton active paragraph={{ rows: 12 }} />
                    ) : (
                      <Form form={form} layout="vertical" disabled={isReadOnly} requiredMark={true}>
                        {/* Category 1: Account Scoping */}
                        <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-3">1. Company Details</div>
                        <Row gutter={12}>
                          <Col span={24}>
                            <Form.Item
                              name="customer"
                              label="Customer Account"
                              rules={[{ required: true, message: "Field constraint required" }]}
                            >
                              <Select showSearch placeholder="Select assigned account identifier" options={CUSTOMER_OPTIONS} onChange={handleCustomerChange} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="addressType" label="Functional Mapping" initialValue="Billing">
                              <Select options={[{ label: "Billing Endpoint", value: "Billing" }, { label: "Shipping Terminal", value: "Shipping" }]} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="userId" label="User ID">
                              <Select
                                placeholder="Select Operator Token"
                                options={[
                                  { label: "vikingdubai", value: "vikingdubai" },
                                  { label: "tovzeus_admin", value: "tovzeus_admin" },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          {formType === "shipping" && (
                            <Col span={24}>
                              <Form.Item name="billTo" label="Parent Billing Address">
                                <Input disabled />
                              </Form.Item>
                            </Col>
                          )}
                          <Col span={24}>
                            <Form.Item
                              name="company"
                              label="Company Name (For Invoice/Documents)"
                              rules={[{ required: true, message: "Corporate title constraint violated" }]}
                            >
                              <Input placeholder="As written on legal trade registry dossiers" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider className="my-4" />

                        {/* Category 2: Spatial Vectors */}
                        <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-3">2. Address</div>
                        <Form.Item
                          name="address"
                          label="Physical Address (Street, Block, Unit No.)"
                          rules={[{ required: true, message: "Spatial designation required" }]}
                        >
                          <TextArea rows={2} placeholder="Enter full geographic address structure" />
                        </Form.Item>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="city" label="City">
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="state" label="State">
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="country"
                              label="Country"
                              rules={[{ required: true, message: "Territory matching required" }]}
                            >
                              <Select options={COUNTRIES.map((c) => ({ label: c, value: c }))} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="pincode" label="ZIP / PINCODE">
                              <Input />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider className="my-4" />

                        {/* Category 3: Comms Pipeline */}
                        <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-3">3. Communication Channels</div>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="contactPerson" label="Primary Contact Person">
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="phone"
                              label="Phone Number"
                              rules={[{ required: true, message: "Primary phone line needed" }]}
                            >
                              <Input placeholder="+000 00 000 0000" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="mobile" label="Mobile Number">
                              <Input placeholder="+000 00 000 0000" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="fax" label="Fax Number">
                              <Input placeholder="Fax line (optional)" />
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item
                              name="email"
                              label="Email Address"
                              rules={[
                                { required: true, message: "System destination needed" },
                                { type: "email", message: "Pattern mismatched" },
                              ]}
                            >
                              <Input placeholder="procurement@entity.corp" />
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* Category 4: GST Registration — domestic customers only. Export
                            customers don't collect this, so the section (and the values
                            it produces) simply doesn't exist for them. */}
                        {customerMode === "domestic" && (
                          <>
                            <Divider className="my-4" />
                            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-3">4. GST Registration (Domestic)</div>
                            <Row gutter={12}>
                              <Col span={12}>
                                <Form.Item name="gstNo" label="GST Number">
                                  <Input placeholder="22AAAAA0000A1Z5" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item name="gstRateId" label="GST Rate">
                                  <Select allowClear placeholder="Select applicable GST slab" options={gstRateOptions} />
                                </Form.Item>
                              </Col>
                            </Row>
                          </>
                        )}

                        <Divider className="my-4" />

                        {/* Category 5: Directives */}
                        <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center justify-between gap-6 mb-4">
                          <Form.Item name="status" label="Registry Status Flag" valuePropName="checked" initialValue={true} className="!mb-0 enterprise-switch">
                            <Switch checkedChildren="Active Nodes" unCheckedChildren="Suspended" />
                          </Form.Item>
                          <Form.Item name="isDefault" label="Primary Corporate Vector" valuePropName="checked" className="!mb-0 enterprise-switch">
                            <Switch checkedChildren="Default Master" unCheckedChildren="Alternative" />
                          </Form.Item>
                        </div>

                        {/* Operational Controls Interface */}
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={isReadOnly}
                            className="flex-1 rounded bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white px-4 py-2 text-xs font-semibold shadow-xs transition"
                          >
                            Commit Record
                          </button>
                          <button
                            type="button"
                            onClick={handleClear}
                            disabled={isReadOnly}
                            className="rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 px-4 py-2 text-xs font-semibold transition"
                          >
                            Purge Inputs
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="rounded text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 px-4 py-2 text-xs font-semibold transition"
                          >
                            Abort Action
                          </button>
                        </div>
                      </Form>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOTTOM LAYER: Shipping Addresses for the selected Billing Address */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-slate-800 text-sm tracking-tight">Shipping Addresses</div>
                {selectedBilling ? (
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Linked to Billing Address: <span className="font-semibold text-slate-700">{selectedBilling.company}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 mt-0.5">Select a Billing Address above to view its Shipping Addresses.</div>
                )}
              </div>
              <button
                onClick={handleNewShipping}
                disabled={!selectedBilling}
                className="inline-flex items-center gap-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all"
              >
                <PlusOutlined /> New Shipping Address
              </button>
            </div>

            {!selectedBilling ? (
              <div className="bg-white border border-slate-200 rounded p-6 text-center">
                <Empty description="No Billing Address selected." />
              </div>
            ) : shippingAddresses.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded p-6 text-center">
                <Empty description="No Shipping Addresses found for this Billing Address." />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <AnimatePresence>
                  {shippingAddresses.map((addr, i) => (
                    <motion.div
                      key={addr.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative bg-white border border-slate-200 rounded p-4 shadow-2xs hover:border-blue-400 transition"
                    >
                      {addr.isDefault && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded">
                          <StarFilled /> Default Vector
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            addr.addressType === "Billing" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {addr.addressType}
                        </span>
                        <span className={`h-2 w-2 rounded-full ${addr.status === "Active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                      </div>
                      <div className="font-bold text-slate-900 text-xs mb-1 truncate">{addr.company}</div>

                      <div className="space-y-1 text-[11px] text-slate-600 mb-3">
                        <div className="flex items-start gap-1">
                          <EnvironmentOutlined className="mt-0.5 text-slate-400" />{" "}
                          <span className="line-clamp-2">
                            {addr.address}, {addr.city}, {addr.country}
                          </span>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-400">Attn:</span> {addr.contactPerson}
                        </div>
                        <div className="truncate">
                          <PhoneOutlined className="text-slate-400" /> {addr.phone}
                        </div>
                        <div className="truncate text-blue-600">
                          <MailOutlined className="text-slate-400" /> {addr.email}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(addr)} className="text-[11px] text-slate-500 hover:text-blue-600 font-medium">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(addr)} className="text-[11px] text-slate-400 hover:text-rose-600">
                            Delete
                          </button>
                        </div>
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr)}
                            className="text-[10px] text-slate-400 hover:text-slate-900 font-medium bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5"
                          >
                            Set Primary
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }