import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BackendUrl } from "../../main";
import { api } from "../../utils/axios";

// Initial State
const initialState = {
  export: {
    datas: [{
      id: '',
      custCode: "",
      custfullname: "",
      orderRefNo: "",
      workorderno: "",
      completedDate: "",
      dispatchedDate: "",
      ppC_Date: "",
      shipmentType: "",
      containerLoadFrom: "",
      rfD_Date: "",
      usercurrency: "",
      totalqty: "",
      totalwt: "",
    }],

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
    setExportdatas:(state,action)=>{
      state.export.datas = action.payload;
      state.export.loading = false;
      state.export.error = action.payload;
    }
    
  },
});

// Thunk for async API call
export const getExportInvoice = (payload) => async (dispatch) => {
  try {
    dispatch(setExportLoading());

    const res = await axios.get("/invoice", {
      params: payload, 
    });
    dispatch(setExportInvoice(payload));
  } catch (error) {
    dispatch(setExportError(error.message));
    console.error("Failed to fetch invoice:", error);
  }
};

// get the all exports data 
export const getExportInvoiceAll = () => async (dispatch) =>{
  try {
    dispatch(setExportLoading());
    const res = await api.get(`${BackendUrl}/Invoice/GettingInvoiceReadyOrders`,{withCredentials:true})
    dispatch(setExportdatas(res.data)); // dispatch the data to the store
  } catch (error) {
    dispatch(setExportError(error.message));
    console.error("Failed to fetch invoices Data:", error);
  }
}
// Exports
export const { setExportInvoice, setExportLoading, setExportError, setExportdatas } =
  invoiceSlice.actions;

export default invoiceSlice.reducer;
