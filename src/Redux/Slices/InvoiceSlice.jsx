import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BackendUrl } from "../../main";
import { api } from "../../utils/axios";

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
  },
});

// Thunk for async API call
export const getExportInvoice = () => async (dispatch) => {
  try {
    dispatch(setExportLoading());
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
    // const res = await axios.get("/invoice",{ withCredentials: true });
    // const data = res.data;
    dispatch(setExportInvoiceSaleData(ExportInvoiceSaleData));
  } catch (error) {
    dispatch(setExportError(error.message));
    console.error("Failed to fetch invoice:", error);
  }
};

// get the all exports data
export const getExportInvoiceAll = () => async (dispatch) => {
  try {
    dispatch(setExportLoading());
    const res = await api.get(
      `${BackendUrl}/Invoice/GettingInvoiceReadyOrders`,
      { withCredentials: true }
    );
    dispatch(setExportdatas(res.data)); // dispatch the data to the store
  } catch (error) {
    dispatch(setExportError(error.message));
    console.error("Failed to fetch invoices Data:", error);
  }
};
// Exports
export const {
  setExportLoading,
  setExportError,
  setExportdatas,
  setExportInvoiceSaleData,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
