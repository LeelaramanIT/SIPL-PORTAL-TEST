import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/axios";

const initialState = {
  exportInvoices: {
    invoiceType: "Direct_Invoice",
    listOFInvoices: [], // multiple invoices
    invoiceDetails: null, // single invoice details
    additionalForm: null, // extra form info
    invoicePDF: null, // PDF export
    FinalSplitResult: [], // processed items
    FinalInvoiceData: [], // processed invoice data
    updatedInvoiceDetails: [],
    loading: false,
    error: null,
    localItems: [],
    splitItems: [],
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
      state.exportInvoices.invoiceType = "Direct_Invoice";
      state.exportInvoices.additionalForm = null;
      state.exportInvoices.FinalInvoiceData = []; // Should be an array
      state.exportInvoices.FinalSplitResult = []; // Should be an array
      state.exportInvoices.updatedInvoiceDetails = []; // Should be an array
      state.exportInvoices.localItems = []; // Add this to reset it properly
      state.exportInvoices.splitItems = []; // Add this to reset it properly
    },
    setExportAdditionalInvoice: (state, action) => {
      state.exportInvoices.additionalForm = action.payload;
    },
    setInvoicePDF: (state, action) => {
      state.exportInvoices.invoicePDF = action.payload;
    },
    setInvoiceType: (state, action) => {
      state.exportInvoices.invoiceType = action.payload;
    },
    setLocalItems: (state, action) => {
      state.exportInvoices.localItems = action.payload;
    },
    setSplitItems: (state, action) => {
      state.exportInvoices.splitItems = action.payload;
    },
    setSplitResult: (state, action) => {
      state.exportInvoices.FinalSplitResult = action.payload; // final Items
    },
    setFinalInvoiceData: (state, action) => {
      state.exportInvoices.FinalInvoiceData = {
        ...state.exportInvoices.invoiceDetails,
        items: [...action.payload],
      };
    },
    SetupdatedInvoiceDetails: (state, action) => {
      state.exportInvoices.updatedInvoiceDetails = {
        ...state.exportInvoices.invoiceDetails,
        items: [...action.payload],
      };
    },
  },
});

// Thunk for async API call
export const getExportInvoice = (payload) => async (dispatch) => {
  const data = {
    type: "Export",
    custfullname: "Global Tech Ltd",
    orderRefNo: "ORD-2025-001",
    workorderno: "WO-789",
    completedDate: "2025-09-01",
    dispatchedDate: "2025-09-03",
    rfD_Date: "2025-09-05",
    shipmentType: "COMBI",
    usercurrency: "USD",

    billingCompanyName: "Global Tech Ltd",
    billingAddress: "123 Tech Park~Building 5~Floor 3",
    billingCity: "New York",
    billingState: "NY",
    billingCountry: "USA",
    billingZipcode: "10001",
    billingContactName: "John Doe",
    billingEmailId: "john.doe@globaltech.com",
    billingMobile: "+1-212-555-7890",

    shippingCompanyName: "Skyline Logistics",
    shippingAddress: "Warehouse 12~Dock B~Industrial Area",
    shippingCity: "Los Angeles",
    shippingState: "CA",
    shippingCountry: "USA",
    shippingZipcode: "90021",
    shippingContactName: "Jane Smith",
    shippingEmailId: "jane.smith@skyline.com",
    shippingMobile: "+1-310-555-1234",
    PreCarriageby: "sea",
    
    splIns: "Handle with care - Fragile items",
    specialRequset: "Deliver before end of September",

    items: [
      {
        category: "Tyre",
        platforms: "Truck",
        tyreSize: "295/80R22.5",
        tyreRim: "22.5",
        tyreType: "Radial",
        brand: "Michelin",
        sidewall: "Black",
        basicprice: 150.75,
        itemQty: 20,
        finishedWt: 45.6,
        rimItemQty: 0,
        rimUnitPrice: 0,
        additionalInfo: "High performance tyres",
        plant: "Plant-A",
        itemCode: "TYR-MIC-29580R22-1",
        o_itemid:1
      },
      {
        category: "Tyre",
        platforms: "Bus",
        tyreSize: "315/80R22.5",
        tyreRim: "22.5",
        tyreType: "Radial",
        brand: "Bridgestone",
        sidewall: "White",
        basicprice: 175.5,
        itemQty: 15,
        finishedWt: 50.2,
        rimItemQty: 2,
        rimUnitPrice: 30,
        additionalInfo: "",
        plant: "Plant-B",
        itemCode: "TYR-BRD-31580R22-2",
        o_itemid:2
      },
      {
        category: "Rim",
        platforms: "Truck",
        tyreSize: "22.5 Rim",
        tyreRim: "22.5",
        tyreType: "Steel",
        brand: "Tata Steel",
        sidewall: "N/A",
        basicprice: 90.25,
        itemQty: 10,
        finishedWt: 25.3,
        rimItemQty: 10,
        rimUnitPrice: 90.25,
        additionalInfo: "Heavy duty rims",
        plant: "Plant-A",
        itemCode: "RIM-TATA-22-3",
        o_itemid:3
      },
      {
        category: "Tyre",
        platforms: "Truck",
        tyreSize: "295/80R22.5",
        tyreRim: "22.5",
        tyreType: "Radial",
        brand: "Michelin",
        sidewall: "Black",
        basicprice: 150.75,
        itemQty: 20,
        finishedWt: 45.6,
        rimItemQty: 0,
        rimUnitPrice: 0,
        additionalInfo: "High performance tyres",
        plant: "Plant-A",
        itemCode: "TYR-MIC-29580R22-4",
        o_itemid:4
      },
      // {
  //     //   "category": "Tyre",
  //     //   "platforms": "Bus",
  //     //   "tyreSize": "315/80R22.5",
  //     //   "tyreRim": "22.5",
  //     //   "tyreType": "Radial",
  //     //   "brand": "Bridgestone",
  //     //   "sidewall": "White",
  //     //   "basicprice": 175.50,
  //     //   "itemQty": 15,
  //     //   "finishedWt": 50.2,
  //     //   "rimItemQty": 2,
  //     //   "rimUnitPrice": 30,
  //     //   "additionalInfo": "",
  //     //   "plant": "Plant-B",
  //     //   "itemCode": "TYR-BRD-31580R22-5"
  //     // },
  //     // {
  //     //   "category": "Rim",
  //     //   "platforms": "Truck",
  //     //   "tyreSize": "22.5 Rim",
  //     //   "tyreRim": "22.5",
  //     //   "tyreType": "Steel",
  //     //   "brand": "Tata Steel",
  //     //   "sidewall": "N/A",
  //     //   "basicprice": 90.25,
  //     //   "itemQty": 10,
  //     //   "finishedWt": 25.3,
  //     //   "rimItemQty": 10,
  //     //   "rimUnitPrice": 90.25,
  //     //   "additionalInfo": "Heavy duty rims",
  //     //   "plant": "Plant-A",
  //     //   "itemCode": "RIM-TATA-22-6"
  //     // },
  //     // {
  //     //   "category": "Tyre",
  //     //   "platforms": "Truck",
  //     //   "tyreSize": "295/80R22.5",
  //     //   "tyreRim": "22.5",
  //     //   "tyreType": "Radial",
  //     //   "brand": "Michelin",
  //     //   "sidewall": "Black",
  //     //   "basicprice": 150.75,
  //     //   "itemQty": 20,
  //     //   "finishedWt": 45.6,
  //     //   "rimItemQty": 0,
  //     //   "rimUnitPrice": 0,
  //     //   "additionalInfo": "High performance tyres",
  //     //   "plant": "Plant-A",
  //     //   "itemCode": "TYR-MIC-29580R22-7"
  //     // },
  //     // {
  //     //   "category": "Tyre",
  //     //   "platforms": "Bus",
  //     //   "tyreSize": "315/80R22.5",
  //     //   "tyreRim": "22.5",
  //     //   "tyreType": "Radial",
  //     //   "brand": "Bridgestone",
  //     //   "sidewall": "White",
  //     //   "basicprice": 175.50,
  //     //   "itemQty": 15,
  //     //   "finishedWt": 50.2,
  //     //   "rimItemQty": 2,
  //     //   "rimUnitPrice": 30,
  //     //   "additionalInfo": "",
  //     //   "plant": "Plant-B",
  //     //   "itemCode": "TYR-BRD-31580R22-8"
  //     // },
  //     // {
  //     //   "category": "Rim",
  //     //   "platforms": "Truck",
  //     //   "tyreSize": "22.5 Rim",
  //     //   "tyreRim": "22.5",
  //     //   "tyreType": "Steel",
  //     //   "brand": "Tata Steel",
  //     //   "sidewall": "N/A",
  //     //   "basicprice": 90.25,
  //     //   "itemQty": 10,
  //     //   "finishedWt": 25.3,
  //     //   "rimItemQty": 10,
  //     //   "rimUnitPrice": 90.25,
  //     //   "additionalInfo": "Heavy duty rims",
  //     //   "plant": "Plant-A",
  //     //   "itemCode": "RIM-TATA-22-9"
  //     // },
  //     // {
  //     //   "category": "Tyre",
  //     //   "platforms": "Truck",
  //     //   "tyreSize": "295/80R22.5",
  //     //   "tyreRim": "22.5",
  //     //   "tyreType": "Radial",
  //     //   "brand": "Michelin",
  //     //   "sidewall": "Black",
  //     //   "basicprice": 150.75,
  //     //   "itemQty": 20,
  //     //   "finishedWt": 45.6,
  //     //   "rimItemQty": 0,
  //     //   "rimUnitPrice": 0,
  //     //   "additionalInfo": "High performance tyres",
  //     //   "plant": "Plant-A",
  //     //   "itemCode": "TYR-MIC-29580R22-10"
  //     // }
    ],
  };

  try {
    dispatch(setExportInvoiceLoading());
    if (payload.type === "Customer") {
      //   const res = await api.get(`/Invoice/GettingSpecificOrders/${payload.id}`,{withCredentials:true});
      // const data = res.data

      await dispatch(setExportInvoiceSalesDetails({ ...data, ...payload }));
    }

    if (payload.type === "Custom") {
      //   const res = await api.get(`/Invoice/GettingSpecificOrders/${payload.id}`,{withCredentials:true});
      // const data = res.data
      await dispatch(setExportInvoiceSalesDetails({ ...data, ...payload }));
    }
  } catch (error) {
    dispatch(setExportInvoiceError(error.message));

    console.error("Failed to fetch invoice:", error);
  }
};

// get the all exports data
export const getExportInvoiceAll = (payload) => async (dispatch) => {
  try {
    dispatch(setExportInvoiceLoading());
    dispatch(resetExportInvoiceDetails());
    if (payload.type === "Customer") {
      const res = await api.get(`/Invoice/GettingInvoiceReadyOrders`, {
        withCredentials: true,
      });
      await dispatch(setExportInvoiceList(res.data));
    }
    if (payload.type === "Custom") {
      const res = await api.get(`/Invoice/GettingInvoiceReadyOrders`, {
        withCredentials: true,
      });
      await dispatch(setExportInvoiceList(res.data));
    }
  } catch (error) {
    await dispatch(setExportInvoiceError(error.message));
    console.error("Failed to fetch invoices Data:", error);
  }
};

export const getSubmit = () => () => {};

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
  setInvoiceType,
  setSplitResult,
  SetupdatedInvoiceDetails,
  setFinalInvoiceData,
  setLocalItems,
  setSplitItems,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
