import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BackendUrl } from "../../main";
import { api } from "../../utils/axios";
import toast from "react-hot-toast";

// Initial State
const initialState = {
  export: {
    datas: [
      {
        id: "",
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
      },
    ],  

    invoiceData: {
      salesData: "",
      addressData: "",
    },
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
    setExportInvoiceSaleData: (state, action) => {
      state.export.invoiceData.salesData = action.payload;
      state.export.loading = false;
      state.export.error = null;
    },
    setExportInvoiceAddressData:(state, action)=>{
      state.export.invoiceData.addressData = action.payload
    },
    setExportLoading: (state) => {
      state.export.loading = true;
      state.export.error = null;
    },
    setExportError: (state, action) => {
      state.export.loading = false;
      state.export.error = action.payload;
    },
    setExportdatas: (state, action) => {
      state.export.datas = action.payload;
      state.export.loading = false;
      state.export.error = null;
    },
    resetExportData:(state)=>{
      state.export.invoiceData.salesData = [];
      state.export.invoiceData.addressData = [];
    }
  },
});

// Thunk for async API call
export const getExportInvoice = (payload) => async (dispatch) => {
  
  try {
    dispatch(setExportLoading());
    dispatch(setExportInvoiceAddressData(payload))

    const ExportInvoiceSaleData = Array.from({ length: 20 }, (_, i) => ({
      category: "Truck",
      platform: "6-Wheel",
      tyreSize: "295/80R22.5",
      rim: "22.5",
      type: "Radial",
      brand: "Michelin",
      sidewall: "Black",
      basicPrice: 250.0,
      qty: 4 + i,
      totalPrice: 250.82 * (4 + i),
      fwt: 500.399 + i * 10.389,
      additionalInfo: "NO GRADE MARKINGS & BARCODE STICKERS ON TYRE",
      plant: `Plant ${String.fromCharCode(65 + (i % 3))}`,
      partNo: `P-167807C18060713${i.toString().padStart(2, "0")}A`,
    }));
    const res = await axios.post(`${BackendUrl}/Invoice/GettingSpecificOrders/${payload.id}`,{},{withCredentials:true});
    const data = res.data
    console.log(data)
    
      await dispatch(setExportInvoiceSaleData(ExportInvoiceSaleData));
    
  } catch (error) {
    dispatch(setExportError(error.message));

    console.error("Failed to fetch invoice:", error);
  }
};

// get the all exports data
export const getExportInvoiceAll = () => async (dispatch) => {
  try {

    const dummyData = Array.from({ length: 200 }, (_, i) => {
  const day = (i % 28) + 1;
  const pad = n => String(n).padStart(2, '0');
  return {
    id: `${i + 1}`,
    custCode: `CUST${pad(i + 1)}`,
    custfullname: `Customer ${i + 1}`,
    orderRefNo: `ORD${1000 + i + 1}`,
    workorderno: `WO${2000 + i + 1}`,
    completedDate: `2025-01-${pad(day)}`,
    dispatchedDate: `2025-01-${pad((day + 1) % 28 || 28)}`,
    ppC_Date: `2025-01-${pad((day - 1) || 28)}`,
    shipmentType: ["Air", "Sea", "Road", "Rail"][i % 4],
    containerLoadFrom: `Warehouse ${String.fromCharCode(65 + (i % 5))}`,
    rfD_Date: `2025-01-${pad((day + 2) % 28 || 28)}`,
    usercurrency: ["USD", "EUR", "GBP", "INR"][i % 4],
    totalqty: `${(i + 1) * 5}`,
    totalwt: `${((i + 1) * 12.5).toFixed(2)}`
  };
});

    // await dispatch(setExportLoading());
    // await dispatch(resetExportData())
    // const res = await api.get(
    //   `${BackendUrl}/Invoice/GettingInvoiceReadyOrders`
    // ,{withCredentials:true});
    // dispatch(setExportdatas(res.data)); // dispatch the data to the store
    dispatch(setExportdatas(dummyData))
  } catch (error) {
    await dispatch((error.message));
    console.error("Failed to fetch invoices Data:", error);
  }
};
// Exports
export const {
  setExportLoading,
  setExportError,
  setExportdatas,
  setExportInvoiceSaleData,
  setExportInvoiceAddressData,
  resetExportData,  
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
