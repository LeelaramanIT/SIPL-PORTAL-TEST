// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../../utils/axios";
import toast from "react-hot-toast";
const initialState = {
  mode: "substitutiondetails",
  loading: false,
  search: "",
  ProcessIDMaster: null,
  generatedProcessID: null,
};

const CustomerProcessIDSlice = createSlice({
  name: "CustomerProcessID",
  initialState,
  reducers: {
    setProcessIDMaster: (state, action) => {
      state.ProcessIDMaster = action.payload;
    },
    setGeneratedProcessID: (state, action) => {
      state.generatedProcessID = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
  },
});

export const getListOfCustomer = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get("/OrderProcess/customer-master");
    // console.log("Res", res);

    if (res.status === 200) {
      return res?.data?.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }

  } catch (error) {
    console.error("", error);
  } finally {
    dispatch(setLoading(false));
  }
};

export const getCustomerItemsByCustomerAndShip = ({ customerCode, shipIds }) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    // Build the query string manually — axios's default array serialization
    // for `params` emits `shipID[]=x&shipID[]=y`, but the backend's model
    // binder only accepts the plain repeated-key form `shipID=x&shipID=y`.
    const query = new URLSearchParams();
    query.append("customerCode", customerCode);
    (Array.isArray(shipIds) ? shipIds : [shipIds]).forEach((id) => query.append("shipID", id));

    const res = await api.get(`/CustomerItemMaster/customer-ship?${query.toString()}`);

    if (res.status === 200) {
      return res?.data?.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }

  } catch (error) {
    console.error("", error);
  } finally {
    dispatch(setLoading(false));
  }
};

export const createCustomerItem = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.post("/CustomerItemMaster/CreateCustomerItem", payload);

    if (res.status === 200 || res.status === 201) {
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

export const updateCustomerItem = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.put("/CustomerItemMaster/UpdateCustomerItem", payload);

    if (res.status === 200 || res.status === 201) {
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

export const getListOfItems = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.get(`/OrderProcess/customer-LineItems/${payload}`);

    if (res.status === 200) {
      return res?.data?.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }

  } catch (error) {
    console.error("", error);
  } finally {
    dispatch(setLoading(false));
  }
};

export const {
  setLoading,
  setSearch,
  setProcessIDMaster,
  setGeneratedProcessID,
} = CustomerProcessIDSlice.actions;
export default CustomerProcessIDSlice.reducer;
