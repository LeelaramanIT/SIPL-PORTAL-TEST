import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "../../../../utils/axios";

const initialState = {
  listOfCustomer: [],
  listOfUseres: [],
  listOfCustomerUsers: [],
  listOfShipBillAddress: [],
  loading: false,
  loadingUsers: false,
  loadingShip: false,
  error: null,
  errorUsers: null,
  masterData: {
    customerTypes: [],
    countries: [],
    paymentTerms: [],
    gstRates: [],
  },
  loadingMasterData: false,
  masterDataError: null,
};

const customerMaster = createSlice({
  name: "customerMaster",
  initialState: initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCustomers: (state, action) => {
      state.listOfCustomer = action.payload;
    },
    setLoadingUsers: (state, action) => {
      state.loadingUsers = action.payload;
    },
    setCustomerUsers: (state, action) => {
      state.listOfCustomerUsers = action.payload;
    },
    setShipCustomerUsers: (state, action) => {
      state.listOfUseres = action.payload;
    },
    setLoadingShip: (state, action) => {
      state.loadingShip = action.payload;
    },
    setShipBillAddress: (state, action) => {
      state.listOfShipBillAddress = action.payload;
    },
    setLoadingMasterData: (state, action) => {
      state.loadingMasterData = action.payload;
    },
    setMasterData: (state, action) => {
      state.masterData = action.payload;
    },
    setMasterDataError: (state, action) => {
      state.masterDataError = action.payload;
    },
  },
});
export const {
  setLoading,
  setCustomers,
  setLoadingUsers,
  setCustomerUsers,
  setLoadingShip,
  setShipBillAddress,
  setLoadingMasterData,
  setMasterData,
  setMasterDataError,
  setShipCustomerUsers,
} = customerMaster.actions;

export const getCustomers = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get("/CustomerMaster");

    if (res.status === 200) {
      dispatch(setCustomers(res?.data?.data));
      dispatch(setLoading(false));
    } else {
      dispatch(setLoading(false));
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    dispatch(setLoading(false));
    console.error("Failed to fetch Customers:", error);
    dispatch(error?.response?.data?.message || error.message || String(error));
  }
};

export const createCustomer = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.post("/CustomerMaster", payload);

    dispatch(setLoading(false));

    return res.data; // <-- return response
  } catch (error) {
    dispatch(setLoading(false));

    console.error("Failed to Create Customer:", error);

    throw error; // <-- throw error so component can catch it
  }
};

export const updateCustomer = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.put("/CustomerMaster/UpdateCustomer", payload);

    dispatch(setLoading(false));

    return res.data; // <-- return response
  } catch (error) {
    dispatch(setLoading(false));

    console.error("Failed to Update Customer:", error);

    throw error; // <-- throw error
  }
};

// Customer User Master Thunks
export const getShipCustomerUsers = () => async (dispatch) => {
  try {
    dispatch(setLoadingUsers(true));
    const res = await api.get("/CustomerMaster/user-masters");
    if (res.status === 200) {
      dispatch(setShipCustomerUsers(res?.data?.data || res?.data));
    }
    dispatch(setLoadingUsers(false));
  } catch (error) {
    dispatch(setLoadingUsers(false));
    console.error("Failed to fetch Customer Users:", error);
  }
};

// The API groups customer-user records by cust_Type:
//   data: [ { cust_Type, customers: [ <complete customer-user record>, ... ] }, ... ]
// Each entry inside a group's `customers` array is already a fully
// combined customer-user record — this thunk only flattens the groups
// and stamps the parent `cust_Type` onto every record it contains.
export const getCustomerUsers = () => async (dispatch) => {
  try {
    dispatch(setLoadingUsers(true));

    const res = await api.get("/CustomerMaster/customer-user-details");
    console.log(res);
    

    const groups = Array.isArray(res?.data?.data) ? res.data.data : [];
    console.log("Groups",groups);
    

    const combinedList = groups.reduce((acc, group) => {
      const customers = Array.isArray(group?.customers) ? group.customers : [];
      customers.forEach((record) => {
        acc.push({ ...record, cust_Type: group?.cust_Type });
      });
      return acc;
    }, []);

    dispatch(setCustomerUsers(combinedList));
    dispatch(setLoadingUsers(false));
  } catch (error) {
    dispatch(setLoadingUsers(false));
    console.error("Failed to fetch Customer Users:", error);
  }
};

export const createCustomerUser = (payload) => async (dispatch) => {
  try {
    dispatch(setLoadingUsers(true));
    const res = await api.post("/CustomerMaster/create-usermaster", payload);
    return res.data;
  } catch (error) {
    console.error("Failed to Create Customer User:", error);
    throw error; // let component handle notification/message
  } finally {
    dispatch(setLoadingUsers(false));
  }
};
export const createCustomerWithUser = (payload) => async (dispatch) => {
  try {
    dispatch(setLoadingUsers(true));
    const res = await api.post("/CustomerMaster/create-custom-user", payload);
    return res.data;
  } catch (error) {
    console.error("Failed to Create Customer User:", error);
    throw error; // let component handle notification/message
  } finally {
    dispatch(setLoadingUsers(false));
  }
};

// The controller DTO requires the payload wrapped in a `request` field
// (bare bodies fail with "The request field is required").
export const updateCustomerUser = (payload) => async (dispatch) => {
  try {
    dispatch(setLoadingUsers(true));
    const res = await api.put("/CustomerMaster/update-user", { request: payload });
    return res.data;
  } catch (error) {
    console.error("Failed to Update Customer User:", error);
    throw error;
  } finally {
    dispatch(setLoadingUsers(false));
  }
};
export const updateCustomerWithUser = (payload) => async (dispatch) => {
  try {
    dispatch(setLoadingUsers(true));
    const res = await api.put("/CustomerMaster/update-user", { payload });
    return res.data;
  } catch (error) {
    console.error("Failed to Update Customer User:", error);
    throw error;
  } finally {
    dispatch(setLoadingUsers(false));
  }
};

export const deleteCustomerUser = (id) => async (dispatch) => {
  try {
    dispatch(setLoadingUsers(true));
    const res = await api.delete(`/CustomerMaster/user-masters/${id}`);
    dispatch(setLoadingUsers(false));
    return res.data;
  } catch (error) {
    dispatch(setLoadingUsers(false));
    console.error("Failed to Delete Customer User:", error);
    throw error;
  }
};

export const getShipBillAddress = () => async (dispatch) => {
  try {
    dispatch(setLoadingShip(true));

    const res = await api.get("/CustomerMaster/ShipBillAddress-master");

    if (res.status === 200) {
      // Safely extract the raw array from the response data wrapper
      const rawData = res?.data?.data || res?.data || [];

      // Transform backend schema to frontend structure
      const mappedAddresses = rawData.map((item) => ({
        id: item.id,

        // Billing ID
        billId: item.addressType === 2 ? 0 : item.billID,

        custCode: item.custCode,

        customer: item.companyName ?? "",

        company: item.companyName ?? "",

        addressType: item.addressType === 2 ? "Billing" : "Shipping",

        address: item.shipAddress ?? "",

        city: item.city ?? "",

        state: item.stateName ?? "",

        country: item.country ?? "",

        pincode: item.zipCode ?? "",

        contactPerson: item.contact_Name ?? "",

        phone: item.mobile || item.phoneNo || "",
        mobile: item.mobile ?? "",
        email: item.emailID ?? "",

        status:
          item.addressStatus === "True" || item.addressStatus === true
            ? "Active"
            : "Inactive",

        isDefault: item.isDefault ?? false,

        stateCode: item.stateCode ?? "",

        gstNo: item.gsT_No ?? "",

        fax: item.fax ?? "",

        exciseDuty: item.exciseDuty ?? 0,

        cstPer: item.cstPer ?? 0,

        vatPer1: item.vatPer1 ?? 0,

        education: item.education,

        highEducation: item.highEducation,

        ledgerInfo: item.ledgerInfo,

        serviceTaxPercentage: item.serviceTaxPercentage,

        cgst: item.cgst,

        sgst: item.sgst,

        igst: item.igst,

        majorDataVerified: item.majorDataVerified,
      }));

      dispatch(setShipBillAddress(mappedAddresses));
    }
    dispatch(setLoadingShip(false));
  } catch (error) {
    dispatch(setLoadingShip(false));
    console.error("Failed to fetch Ship/Bill Addresses:", error);
  }
};

// Create Ship/Bill Address Thunk
export const createShipBillAddress = (formPayload) => async (dispatch) => {
  try {
    dispatch(setLoadingShip(true));

    // Reverse-map the frontend UI state back into the strict API schema types
    const apiPayload = {
      custCode: formPayload.custCode, // Match your customer code identification
      contact_Name: formPayload.contactPerson || "",
      shipAddress: formPayload.address || "",
      city: formPayload.city || "",
      country: formPayload.country || "INDIA",
      zipCode: String(formPayload.pincode || ""),
      mobile: formPayload.mobile || "",
      fax: formPayload.fax || "",
      // Map frontend status string back to API format ("Active" -> "True", "Inactive" -> "False")
      addressStatus: formPayload.status === "Active",
      stateName: formPayload.state || "",
      companyName: formPayload.company || formPayload.customer || "",
      emailID: formPayload.email || "",
      exciseDuty: Number(formPayload.exciseDuty || 0),
      cstPer: Number(formPayload.cstPer || 0),
      vatPer1: Number(formPayload.vatPer1 || 0),
      phoneNo: formPayload.phone || "",
      // Map UI values back to numerical schema values (2 for Billing, 1 for Shipping)
      addressType: formPayload.addressType === "Billing" ? 2 : 1,
      // If Shipping, assign the corresponding Billing master item ID, otherwise 0
      billID:
        formPayload.addressType === "Shipping"
          ? Number(formPayload.billId || 0)
          : 0,
      education: String(formPayload.education || "0.00"),
      highEducation: String(formPayload.highEducation || "0.00"),
      ledgerInfo: Boolean(formPayload.ledgerInfo),
      serviceTaxPercentage: Number(formPayload.serviceTaxPercentage || 14),
      stateCode: String(formPayload.stateCode || ""),
      gsT_No: formPayload.gstNo || formPayload.gsT_No || "",
      cgst: Number(formPayload.cgst || 0),
      sgst: Number(formPayload.sgst || 0),
      igst: Number(formPayload.igst || 0),
      majorDataVerified: formPayload.majorDataVerified ?? true,
    };

    // Use your custom axios wrapper 'api' instance
    const res = await api.post(
      "/CustomerMaster/Create-ShipBillAddress",
      apiPayload,
    );

    // Refresh the table listing after a successful addition
    dispatch(getShipBillAddress());

    return res.data; // Return raw success metadata to your UI component
  } catch (error) {
    console.error("Failed to Create Ship/Bill Address:", error);
    throw error; // Let your component catch this to display an Ant Design message error block
  } finally {
    dispatch(setLoadingShip(false));
  }
};

// Update Ship/Bill Address Thunk
export const updateShipBillAddress = (formPayload) => async (dispatch) => {
  try {
    dispatch(setLoadingShip(true));

    const apiPayload = {
      id: formPayload.id,
      custCode: formPayload.custCode,
      contact_Name: formPayload.contactPerson || "",
      shipAddress: formPayload.address || "",
      city: formPayload.city || "",
      country: formPayload.country || "INDIA",
      zipCode: String(formPayload.pincode || ""),
      mobile: formPayload.mobile || "",
      fax: formPayload.fax || "",
      addressStatus: formPayload.status === "Active", // boolean
      stateName: formPayload.state || "",
      companyName: formPayload.company || formPayload.customer || "",
      emailID: formPayload.email || "",
      exciseDuty: Number(formPayload.exciseDuty || 0),
      cstPer: Number(formPayload.cstPer || 0),
      vatPer1: Number(formPayload.vatPer1 || 0),
      phoneNo: formPayload.phone || "",
      addressType: formPayload.addressType === "Billing" ? 2 : 1,
      billID:
        formPayload.addressType === "Shipping"
          ? Number(formPayload.billId || 0)
          : 0,
      education: String(formPayload.education || "0.00"),
      highEducation: String(formPayload.highEducation || "0.00"),
      ledgerInfo: Boolean(formPayload.ledgerInfo), // FIX: boolean, not string
      serviceTaxPercentage: Number(formPayload.serviceTaxPercentage || 14),
      stateCode: String(formPayload.stateCode || ""),
      gsT_No: formPayload.gstNo || formPayload.gsT_No || "",
      cgst: Number(formPayload.cgst || 0),
      sgst: Number(formPayload.sgst || 0),
      igst: Number(formPayload.igst || 0),
      majorDataVerified: formPayload.majorDataVerified ?? true,
    };

    const res = await api.put(
      "/CustomerMaster/Update-ShipBillAddress",
      apiPayload,
    ); // no wrapper

    dispatch(getShipBillAddress());

    return res.data;
  } catch (error) {
    console.error("Failed to Update Ship/Bill Address:", error);
    throw error;
  } finally {
    dispatch(setLoadingShip(false));
  }
};

export const getCustomerMasterData = () => async (dispatch) => {
  try {
    dispatch(setLoadingMasterData(true));
    dispatch(setMasterDataError(null));

    const res = await api.get("/CustomerMaster/master-data");

    if (res.status === 200) {
      dispatch(setMasterData(res?.data?.data || {}));
    }
    dispatch(setLoadingMasterData(false));
  } catch (error) {
    dispatch(setLoadingMasterData(false));
    dispatch(
      setMasterDataError(error?.response?.data?.message || error.message),
    );
    console.error("Failed to fetch Customer Master Data:", error);
  }
};

export const getGeneratedCustomerCode = (customerTypeId) => async () => {
  try {
    const res = await api.get(
      `/CustomerMaster/CustomerCodeGenerator?CustomerTypeID=${customerTypeId}`,
    );
    return res.data;
  } catch (error) {
    console.error("Failed to generate customer code:", error);
    throw error;
  }
};

export default customerMaster.reducer;
