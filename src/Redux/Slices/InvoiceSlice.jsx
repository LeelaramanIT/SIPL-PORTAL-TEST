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
      pdf:null,
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
    },
  },
});

// Thunk for async API call
export const getExportInvoice = (payload) => async (dispatch) => {
  
  try {
    dispatch(setExportInvoiceLoading());
    dispatch(setExportInvoiceAddressDetails(payload))

    // const ExportInvoiceSaleData = Array.from({ length: 20 }, (_, i) => ({
    //   category: "Truck",
    //   platform: "6-Wheel",
    //   tyreSize: "295/80R22.5",
    //   rim: "22.5",
    //   type: "Radial",
    //   brand: "Michelin",
    //   sidewall: "Black",
    //   basicPrice: 250.0,
    //   qty: 4 + i,
    //   totalPrice: 250.82 * (4 + i),
    //   fwt: 500.399 + i * 10.389,
    //   additionalInfo: "NO GRADE MARKINGS & BARCODE STICKERS ON TYRE",
    //   plant: `Plant ${String.fromCharCode(65 + (i % 3))}`,
    //   partNo: `P-167807C18060713${i.toString().padStart(2, "0")}A`,
    // }));
    const res = await axios.get(`${BackendUrl}/Invoice/GettingSpecificOrders/${payload.id}`,{withCredentials:true});
    const data = res.data
    
      await dispatch(setExportInvoiceSalesDetails(data));
    
  } catch (error) {
    dispatch(setExportError(error.message));

    console.error("Failed to fetch invoice:", error);
  }
};

// get the all exports data
export const getExportInvoiceAll = () => async (dispatch) => {
  try {


    
//     const dummyData = Array.from({ length: 200 }, (_, i) => {
//   const day = (i % 28) + 1;
//   const pad = n => String(n).padStart(2, '0');
//   return {
//     id: `${i + 1}`,
//     custCode: `CUST${pad(i + 1)}`,
//     custfullname: `Customer ${i + 1}`,
//     orderRefNo: `ORD${1000 + i + 1}`,
//     workorderno: `WO${2000 + i + 1}`,
//     completedDate: `2025-01-${pad(day)}`,
//     dispatchedDate: `2025-01-${pad((day + 1) % 28 || 28)}`,
//     ppC_Date: `2025-01-${pad((day - 1) || 28)}`,
//     shipmentType: ["Air", "Sea", "Road", "Rail"][i % 4],
//     containerLoadFrom: `Warehouse ${String.fromCharCode(65 + (i % 5))}`,
//     rfD_Date: `2025-01-${pad((day + 2) % 28 || 28)}`,
//     usercurrency: ["USD", "EUR", "GBP", "INR"][i % 4],
//     totalqty: `${(i + 1) * 5}`,
//     totalwt: `${((i + 1) * 12.5).toFixed(2)}`
//   };
// });

    await dispatch(setExportInvoiceLoading());

    
    
    await dispatch(resetExportInvoiceDetails())
    const res = await api.get(
      `${BackendUrl}/Invoice/GettingInvoiceReadyOrders`
    ,{withCredentials:true});
    
    await dispatch(setExportInvoiceList(res.data));
  
  } catch (error) {
    await dispatch((error.message));
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
} = invoiceSlice.actions;

export default invoiceSlice.reducer;

