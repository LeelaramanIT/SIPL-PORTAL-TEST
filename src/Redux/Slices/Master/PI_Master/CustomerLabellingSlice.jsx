import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../../utils/axios";

const initialState = {
  loading: false,
};

const CustomerLabellingSlice = createSlice({
  name: "CustomerLabelling",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

// Barcode layout master data - customers, brands, layoutTypes and layoutNames
// in a single call; feeds every dropdown on the Customer Label Mapping page.
export const getBarcodeLayoutMasterData = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get("/CustomerBarcode/layout-master-data");

    if (res.status === 200) {
      return res?.data?.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Active customer label / barcode configurations — customerId, customerName,
// brand, Labeltype, layoutName, zplTemplate. Also the source of the Brand,
// Label Type and Layout Name dropdowns on the Customer Label Mapping page.
// NOTE: confirm the route with the backend if it differs.
export const getActiveBarcodeConfigurations = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get("/CustomerBarcode/active-configurations");

    if (res.status === 200) {
      return res?.data?.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// ALL configurations - active and inactive - each with its audit fields
// (createdBy, createdDate, modifiedBy, modifiedDate). Feeds the records table.
// NOTE: confirm this route with the backend.
export const getAllBarcodeConfigurations = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    let res;
    try {
      res = await api.get("/CustomerBarcode/all-configurations");
    } catch (allError) {
      // Route not available on this backend - fall back to the active list
      // so the table still loads (inactive rows will not be included).
      console.warn("all-configurations failed, falling back to active-configurations", allError);
      res = await api.get("/CustomerBarcode/active-configurations");
    }

    if (res.status === 200) {
      return res?.data?.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Creates one label configuration per brand for a customer + layout.
// payload: { customerId, layoutID, layoutType, brand: [string] }
export const createMultiConfiguration = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.post("/CustomerBarcode/CreateMultiConfiguration", payload);

    if (res.status === 200 || res.status === 201) {
      return res?.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Single endpoint for BOTH edit and status change of one configuration.
// Body: { id, customerId, isActive, layout_ID, custCode, brand }.
// Fields that must stay unchanged are sent empty: customerId 0, layout_ID 0,
// custCode "" and brand "" (customer itself can never be changed).
export const modifyConfiguration = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.put("/CustomerBarcode/modify-configuration", payload);

    if (res.status === 200 || res.status === 201) {
      return res?.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const { setLoading } = CustomerLabellingSlice.actions;
export default CustomerLabellingSlice.reducer;
