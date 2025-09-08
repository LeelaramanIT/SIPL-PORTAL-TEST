import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/axios";
import toast from "react-hot-toast";

// Initial State
const initialState = {
  exportInvoices: {
    invoiceType:'Scheme_Invoice',
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
    },
    setInvoiceType:(state,action)=>{
      state.exportInvoices.invoiceType = action.payload
    }
  },
});

// Thunk for async API call
export const getExportInvoice = (payload) => async (dispatch) => {
  function generateItem(category, platforms, brand, tyreSize, tyreType, sidewall, plant, itemCodePrefix) {
    const basicPrice = (Math.random() * 200 + 50).toFixed(2);
    const itemQty = Math.floor(Math.random() * 50 + 1);
    const finishedWt = (Math.random() * 100).toFixed(1);
    const rimItemQty = category === 'Rim' ? itemQty : 0;
    const rimUnitPrice = category === 'Rim' ? basicPrice : 0;
    const additionalInfo = category === 'Tyre' ? 'High performance tyres' : 'Heavy duty rims';
  
    return {
      category,
      platforms,
      tyreSize,
      tyreRim: '22.5',
      tyreType,
      brand,
      sidewall,
      basicprice: parseFloat(basicPrice),
      itemQty,
      finishedWt: parseFloat(finishedWt),
      rimItemQty,
      rimUnitPrice,
      additionalInfo,
      plant,
      itemCode: `${itemCodePrefix}-${Math.floor(Math.random() * 10000)}`
    };
  }
  
  function generateItems(count = 3) {
    const categories = [
      { category: 'Tyre', platforms: 'Truck', brand: 'Michelin', tyreSize: '295/80R22.5', tyreType: 'Radial', sidewall: 'Black', plant: 'Plant-A', itemCodePrefix: 'TYR-MIC' },
      { category: 'Tyre', platforms: 'Bus', brand: 'Bridgestone', tyreSize: '315/80R22.5', tyreType: 'Radial', sidewall: 'White', plant: 'Plant-B', itemCodePrefix: 'TYR-BRD' },
      { category: 'Rim', platforms: 'Truck', brand: 'Tata Steel', tyreSize: '22.5 Rim', tyreType: 'Steel', sidewall: 'N/A', plant: 'Plant-A', itemCodePrefix: 'RIM-TATA' }
    ];
  
    const items = [];
  
    for (let i = 0; i < count; i++) {
      const config = categories[i % categories.length];
      items.push(generateItem(
        config.category,
        config.platforms,
        config.brand,
        config.tyreSize,
        config.tyreType,
        config.sidewall,
        config.plant,
        config.itemCodePrefix
      ));
    }
  
    return { items };
  }
  
  // Generate and print the JSON
  console.log(JSON.stringify(generateItems(3), null, 2));
  

  const data = {
    "type": "Export",
    "custfullname": "Global Tech Ltd",
    "orderRefNo": "ORD-2025-001",
    "workorderno": "WO-789",
    "completedDate": "2025-09-01",
    "dispatchedDate": "2025-09-03",
    "rfD_Date": "2025-09-05",
    "shipmentType": "COMBI",
    "usercurrency": "USD",
  
    "billingCompanyName": "Global Tech Ltd",
    "billingAddress": "123 Tech Park~Building 5~Floor 3",
    "billingCity": "New York",
    "billingState": "NY",
    "billingCountry": "USA",
    "billingZipcode": "10001",
    "billingContactName": "John Doe",
    "billingEmailId": "john.doe@globaltech.com",
    "billingMobile": "+1-212-555-7890",
  
    "shippingCompanyName": "Skyline Logistics",
    "shippingAddress": "Warehouse 12~Dock B~Industrial Area",
    "shippingCity": "Los Angeles",
    "shippingState": "CA",
    "shippingCountry": "USA",
    "shippingZipcode": "90021",
    "shippingContactName": "Jane Smith",
    "shippingEmailId": "jane.smith@skyline.com",
    "shippingMobile": "+1-310-555-1234",
  
    "PreCarriageby": "sea",
    "splIns": "Handle with care - Fragile items",
    "specialRequset": "Deliver before end of September",
  
    "items": [
      {
        "category": "Tyre",
        "platforms": "Truck",
        "tyreSize": "295/80R22.5",
        "tyreRim": "22.5",
        "tyreType": "Radial",
        "brand": "Michelin",
        "sidewall": "Black",
        "basicprice": 150.75,
        "itemQty": 20,
        "finishedWt": 45.6,
        "rimItemQty": 0,
        "rimUnitPrice": 0,
        "additionalInfo": "High performance tyres",
        "plant": "Plant-A",
        "itemCode": "TYR-MIC-29580R22-1"
      },
      {
        "category": "Tyre",
        "platforms": "Bus",
        "tyreSize": "315/80R22.5",
        "tyreRim": "22.5",
        "tyreType": "Radial",
        "brand": "Bridgestone",
        "sidewall": "White",
        "basicprice": 175.50,
        "itemQty": 15,
        "finishedWt": 50.2,
        "rimItemQty": 2,
        "rimUnitPrice": 30,
        "additionalInfo": "",
        "plant": "Plant-B",
        "itemCode": "TYR-BRD-31580R22-2"
      },
      {
        "category": "Rim",
        "platforms": "Truck",
        "tyreSize": "22.5 Rim",
        "tyreRim": "22.5",
        "tyreType": "Steel",
        "brand": "Tata Steel",
        "sidewall": "N/A",
        "basicprice": 90.25,
        "itemQty": 10,
        "finishedWt": 25.3,
        "rimItemQty": 10,
        "rimUnitPrice": 90.25,
        "additionalInfo": "Heavy duty rims",
        "plant": "Plant-A",
        "itemCode": "RIM-TATA-22-3"
      },
      {
        "category": "Tyre",
        "platforms": "Truck",
        "tyreSize": "295/80R22.5",
        "tyreRim": "22.5",
        "tyreType": "Radial",
        "brand": "Michelin",
        "sidewall": "Black",
        "basicprice": 150.75,
        "itemQty": 20,
        "finishedWt": 45.6,
        "rimItemQty": 0,
        "rimUnitPrice": 0,
        "additionalInfo": "High performance tyres",
        "plant": "Plant-A",
        "itemCode": "TYR-MIC-29580R22-4"
      },
      {
        "category": "Tyre",
        "platforms": "Bus",
        "tyreSize": "315/80R22.5",
        "tyreRim": "22.5",
        "tyreType": "Radial",
        "brand": "Bridgestone",
        "sidewall": "White",
        "basicprice": 175.50,
        "itemQty": 15,
        "finishedWt": 50.2,
        "rimItemQty": 2,
        "rimUnitPrice": 30,
        "additionalInfo": "",
        "plant": "Plant-B",
        "itemCode": "TYR-BRD-31580R22-5"
      },
      {
        "category": "Rim",
        "platforms": "Truck",
        "tyreSize": "22.5 Rim",
        "tyreRim": "22.5",
        "tyreType": "Steel",
        "brand": "Tata Steel",
        "sidewall": "N/A",
        "basicprice": 90.25,
        "itemQty": 10,
        "finishedWt": 25.3,
        "rimItemQty": 10,
        "rimUnitPrice": 90.25,
        "additionalInfo": "Heavy duty rims",
        "plant": "Plant-A",
        "itemCode": "RIM-TATA-22-6"
      },
      {
        "category": "Tyre",
        "platforms": "Truck",
        "tyreSize": "295/80R22.5",
        "tyreRim": "22.5",
        "tyreType": "Radial",
        "brand": "Michelin",
        "sidewall": "Black",
        "basicprice": 150.75,
        "itemQty": 20,
        "finishedWt": 45.6,
        "rimItemQty": 0,
        "rimUnitPrice": 0,
        "additionalInfo": "High performance tyres",
        "plant": "Plant-A",
        "itemCode": "TYR-MIC-29580R22-7"
      },
      {
        "category": "Tyre",
        "platforms": "Bus",
        "tyreSize": "315/80R22.5",
        "tyreRim": "22.5",
        "tyreType": "Radial",
        "brand": "Bridgestone",
        "sidewall": "White",
        "basicprice": 175.50,
        "itemQty": 15,
        "finishedWt": 50.2,
        "rimItemQty": 2,
        "rimUnitPrice": 30,
        "additionalInfo": "",
        "plant": "Plant-B",
        "itemCode": "TYR-BRD-31580R22-8"
      },
      {
        "category": "Rim",
        "platforms": "Truck",
        "tyreSize": "22.5 Rim",
        "tyreRim": "22.5",
        "tyreType": "Steel",
        "brand": "Tata Steel",
        "sidewall": "N/A",
        "basicprice": 90.25,
        "itemQty": 10,
        "finishedWt": 25.3,
        "rimItemQty": 10,
        "rimUnitPrice": 90.25,
        "additionalInfo": "Heavy duty rims",
        "plant": "Plant-A",
        "itemCode": "RIM-TATA-22-9"
      },
      {
        "category": "Tyre",
        "platforms": "Truck",
        "tyreSize": "295/80R22.5",
        "tyreRim": "22.5",
        "tyreType": "Radial",
        "brand": "Michelin",
        "sidewall": "Black",
        "basicprice": 150.75,
        "itemQty": 20,
        "finishedWt": 45.6,
        "rimItemQty": 0,
        "rimUnitPrice": 0,
        "additionalInfo": "High performance tyres",
        "plant": "Plant-A",
        "itemCode": "TYR-MIC-29580R22-10"
      }
    ]
    
  }
  
  
  try {
    dispatch(setExportInvoiceLoading());
    if(payload.type === 'Customer'){
    //   const res = await api.get(`/Invoice/GettingSpecificOrders/${payload.id}`,{withCredentials:true});
    // const data = res.data
    
    await dispatch(setExportInvoiceSalesDetails({ ...data, ...payload }));
    }

    if (payload.type === 'Custom') {
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
  dispatch(setExportInvoiceLoading())
  dispatch(resetExportInvoiceDetails())
  if (payload.type === "Customer") {
    const res = await api.get(
      `/Invoice/GettingInvoiceReadyOrders`
    ,{withCredentials:true});
    await dispatch(setExportInvoiceList(res.data));
  }
  if (payload.type === 'Custom') {
    const res = await api.get(
      `/Invoice/GettingInvoiceReadyOrders`
    ,{withCredentials:true});
    await dispatch(setExportInvoiceList(res.data));
  }
  
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
  setInvoiceType,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;

