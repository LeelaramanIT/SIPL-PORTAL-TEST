import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BackendUrl } from "../../main";
import { api } from "../../utils/axios";
import toast from "react-hot-toast";

// Initial State
const initialState = {
  exportInvoices: {
    listOFInvoices: [],
    invoiceDetails: {
      sales: null,
      address: null,
      additionalForm:null,
    },
    loading: false,
    error: null,
  },
  domesticInvoices: {
    list: [],
    loading: false,
    error: null,
  },
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setExportInvoiceSalesDetails: (state, action) => {
      state.exportInvoices.invoiceDetails.sales = action.payload;
      state.exportInvoices.loading = false;
      state.exportInvoices.error = null;
    },
    setExportInvoiceAddressDetails: (state, action) => {
      state.exportInvoices.invoiceDetails.address = action.payload;
    },
    setExportInvoiceLoading: (state) => {
      state.exportInvoices.loading = true;
      state.exportInvoices.error = null;
    },
    setExportInvoiceError: (state, action) => {
      state.exportInvoices.loading = false;
      state.exportInvoices.error = action.payload;
    },
    setExportInvoiceList: (state, action) => {
      state.exportInvoices.listOFInvoices = action.payload;
      state.exportInvoices.loading = false;
      state.exportInvoices.error = null;
    },
    resetExportInvoiceDetails: (state) => {
      state.exportInvoices.invoiceDetails.sales = null;
      state.exportInvoices.invoiceDetails.address = null;
      state.exportInvoices.invoiceDetails.additionalForm = null;
    },
    setExportAdditionalInvoice: (state,action)=>{
      state.exportInvoices.invoiceDetails.additionalForm = action.payload;
    }
  },
});

// Thunk for async API call
export const getExportInvoice = (payload) => async (dispatch) => {
  
  try {
    dispatch(setExportInvoiceLoading());
    dispatch(setExportInvoiceAddressDetails(payload))

    const res = await api.get(`/Invoice/GettingSpecificOrders/${payload.id}`,{withCredentials:true});
    const data = res.data
    
      await dispatch(setExportInvoiceSalesDetails(data));
    
  } catch (error) {
    dispatch(setExportInvoiceError(error.message));

    console.error("Failed to fetch invoice:", error);
  }
};

// get the all exports data
export const getExportInvoiceAll = () => async (dispatch) => {
  try {
    await dispatch(setExportInvoiceLoading())
    await dispatch(resetExportInvoiceDetails())
    const res = await api.get(
      `/Invoice/GettingInvoiceReadyOrders`
    ,{withCredentials:true});
    
    await dispatch(setExportInvoiceList(res.data));
  
  } catch (error) {
    await dispatch(setExportInvoiceError(error.message));
    console.error("Failed to fetch invoices Data:", error);
  }
};
// Exports
export const {
  setExportInvoiceSalesDetails,
  setExportInvoiceAddressDetails,
  setExportInvoiceLoading,
  setExportInvoiceError,
  setExportInvoiceList,
  resetExportInvoiceDetails,
  setExportAdditionalInvoice,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;

