import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Initial State
const initialState = {
  export: {
    data: [],
    invoiceData: [],
    loading: false,
    error: null,
  },
  domestic: {
    data: [],
    loading: false,
    error: null,
  },
};

// Slice
const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setExportInvoice: (state, action) => {
      state.export.invoiceData = action.payload;
      state.export.loading = false;
      state.export.error = null;
    },
    setExportLoading: (state) => {
      state.export.loading = true;
      state.export.error = null;
    },
    setExportError: (state, action) => {
      state.export.loading = false;
      state.export.error = action.payload;
    },
  },
});

// Thunk for async API call
export const getExportInvoice = (payload) => async (dispatch) => {
  try {
    dispatch(setExportLoading());

    // Example GET request with query params
    const res = await axios.get("/api/invoice", {
      params: payload, // payload is like { id: 123 }
    });
    dispatch(setExportInvoice(payload));
  } catch (error) {
    dispatch(setExportError(error.message));
    console.error("Failed to fetch invoice:", error);
  }
};

// Exports
export const { setExportInvoice, setExportLoading, setExportError } =
  invoiceSlice.actions;

export default invoiceSlice.reducer;
