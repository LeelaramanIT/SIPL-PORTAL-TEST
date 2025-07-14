import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/axios";
import toast from "react-hot-toast";

// Initial State
const initialState = {
  exportInvoices: {
    listOFInvoices: [],
    invoiceDetails: null,
    additionalForm: null,
    invoicePDF:null,
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
      console.log(action.payload);
      state.exportInvoices.invoiceDetails = action.payload;
      state.exportInvoices.loading = false;
      state.exportInvoices.error = null;
    },
    setExportInvoiceAddressDetails: (state, action) => {
      state.exportInvoices.additionalForm = action.payload;
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
      state.exportInvoices.invoiceDetails = null;
      state.exportInvoices.additionalForm = null;
    },
    setExportAdditionalInvoice: (state,action)=>{
      state.exportInvoices.additionalForm = action.payload;
    },
    setInvoicePDF: (state,action)=>{
      state.exportInvoices.invoicePDF = action.payload
    }
  },
});

// Thunk for async API call
export const getExportInvoice = (payload) => async (dispatch) => {
  
  try {
    dispatch(setExportInvoiceLoading());

    const res = await api.get(`/Invoice/GettingSpecificOrders/${payload.id}`,{withCredentials:true});
    const data = res.data
    
    await dispatch(setExportInvoiceSalesDetails({ ...data, ...payload }));

  } catch (error) {
    dispatch(setExportInvoiceError(error.message));

    console.error("Failed to fetch invoice:", error);
  }
};

// get the all exports data
export const getExportInvoiceAll = () => async (dispatch) => {
  try {
  dispatch(setExportInvoiceLoading())
  dispatch(resetExportInvoiceDetails())
    const res = await api.get(
      `/Invoice/GettingInvoiceReadyOrders`
    ,{withCredentials:true});
    
    await dispatch(setExportInvoiceList(res.data));
  
  } catch (error) {
    await dispatch(setExportInvoiceError(error.message));
    console.error("Failed to fetch invoices Data:", error);
  }
};

export const getSubmit = () => () =>{
  
}

// Exports
export const {
  setExportInvoiceSalesDetails,
  setExportInvoiceAddressDetails,
  setExportInvoiceLoading,
  setExportInvoiceError,
  setExportInvoiceList,
  resetExportInvoiceDetails,
  setExportAdditionalInvoice,
  setInvoicePDF,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;

