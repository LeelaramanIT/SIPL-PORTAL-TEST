import { createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import { api } from "../../../utils/axios"

const initialState = {
  listOfCustomer: [],
  loading: false,
  error: null,
  entityMaster: [],
  customerItems: [],
  listOfItems: [],
}

const OrderProcessSlice = createSlice({
  name: 'orderProcess',
  initialState: initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setCustList: (state, action) => {
      state.listOfCustomer = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    setEntityMaster: (state, action) => {
      state.entityMaster = action.payload
    },
    setCustomerItems: (state, action) => {
      state.customerItems = action.payload
    },
    setItemsList: (state, action) => {
      state.listOfItems = action.payload
    },
    setSaveDraftLoading: (state, action) => {
      state.saveDraftLoading = action.payload
    },
    setSaveDraftSuccess: (state, action) => {
      state.saveDraftSuccess = action.payload
    },
  },

})
export const { setLoading, setError, setCustList, setEntityMaster, setCustomerItems, setItemsList,  setSaveDraftLoading, setSaveDraftSuccess } = OrderProcessSlice.actions

export const getEntityMaster = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.get("");

    if (res.status === 200) {

    } else {
      throw new Error("Unexpected response status: " + res.status);
    }

  } catch (error) {
    console.error("", error);
    // dispatch(setRimError(error?.response?.data?.message || error.message || String(error)));
  } finally {
    dispatch(setLoading(false));
  }
};

export const getListOfCustomer = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get("/OrderProcess/customer-master");
    console.log("Res", res);

    if (res.status === 200) {
      dispatch(setCustList(res?.data?.data?.customers))
      dispatch(setEntityMaster(res?.data?.data?.companyEntities))
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }

  } catch (error) {
    console.error("", error);
    dispatch(setError(error?.response?.data?.message || error.message || String(error)));
  } finally {
    dispatch(setLoading(false));
  }
};

export const getCustomerItems = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get("/OrderProcess/customer-master");

    if (res.status === 200) {
      dispatch(setCustomerItems(res.data.data))
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }

  } catch (error) {
    console.error("", error);
    dispatch(setError(error?.response?.data?.message || error.message || String(error)));
  } finally {
    dispatch(setLoading(false));
  }
};

export const getListOfItems = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get(`/OrderProcess/customer-LineItems/${payload}`);

    if (res.status === 200) {
      dispatch(setItemsList(res.data))
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }

  } catch (error) {
    console.error("", error);
    dispatch(setError(error?.response?.data?.message || error.message || String(error)));
  } finally {
    dispatch(setLoading(false));
  }
};

export const saveDraft = (payload, typeID = 1) => async (dispatch) => {
  try {
    dispatch(setSaveDraftLoading(true));
    dispatch(setError(null));

    const res = await api.post(
      `/OrderProcess/save?TypeID=${typeID}`,
      payload
    );

    if (res.status === 200 || res.status === 201) {
      dispatch(setSaveDraftSuccess(true));
      return res.data; // useful if component wants response
    } else {
      throw new Error(`Unexpected response status: ${res.status}`);
    }
  } catch (error) {
    console.error("Save draft failed:", error);

    dispatch(
      setError(
        error?.response?.data?.message ||
        error.message ||
        "Failed to save draft"
      )
    );

    throw error;
  } finally {
    dispatch(setSaveDraftLoading(false));
  }
};


export default OrderProcessSlice.reducer