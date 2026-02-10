// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../utils/axios";
import toast from "react-hot-toast";
import { setLoading } from "../PDIDispatchMaster/PDIMaster";

const initialState = {
    listOfInspectionData: [],
    search: "",
    InspectionDetails: null,
    barcodeDetails: [],
};

const scanforinspectionSlice = createSlice({
    name: 'scanforinspection',
    initialState,
    reducers: {
        setListOfInspectionData: (state, action) => {
            state.listOfInspectionData = action.payload;
        },
        setInspectionDetails: (state, action) => {
            state.InspectionDetails = action.payload; 
        },
        setBarcodeDetails: (state, action) => {
            state.barcodeDetails = action.payload; 
        },
        setSearch: (state, action) => {
            state.search = action.payload;
        },
        resetAll: (state) => {
            state.listOfInspectionData = [];
            state.search = "";
        },
        restInspectionDetails: (state) => {
            state.InspectionDetails = null;
        },
    },
})

export const getListOfInspectionData = (plant) => async (dispatch) => {
    try {
        dispatch(setLoading(true))
        dispatch(resetAll())
        console.log("called>>>>>>>>");
        const res = await api.get(`/PdiInspection/GetListOfPdiInspectOrders:${plant}`);
        console.log(res.data)
        if (res.status === 200) {
            dispatch(setListOfInspectionData(res.data))
        }
        dispatch(setLoading(false))
    } catch (error) {
        dispatch(setLoading(false))
        console.log(error)
        toast.error(error.message)
    }
}

export const getCustomerDetails = (payload) => async (dispatch) => {
    const data = {
    custcode: typeof payload.custCode === 'string' ? payload.custCode.trim() : payload.custCode,
    orderrefno: typeof payload.orderRefNo === 'string' ? payload.orderRefNo.trim() : payload.orderRefNo,
    o_ID: typeof payload.id === 'string' ? payload.id.trim() : payload.id,
    pdiPlant: typeof payload.plant === 'string' ? payload.plant.trim() : payload.plant
};
    console.log(payload)    
    try {
        dispatch(
        setLoading(true))
        dispatch(restInspectionDetails())
        const res = await api.post(`/PdiInspection/GetCustomer`, data);
        
        if (res.status === 200) {
            dispatch(setInspectionDetails({...payload, items:res.data}))
        }
        dispatch(setLoading(false))
        console.log(res.data);
        
    } catch (error) {
        dispatch(setLoading(false))
        if (error.response) {
            console.error('Server responded with error:', error.response.data);
            console.error('Error status:', error.response.status);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Request setup error:', error.message);
        }
    }
}

export const PDICheckBarcode = (payload) => async (dispatch) => {
try {
    const data = {
  barcode: payload.barcode,
  custcode: payload.custCode,
  workorderno: payload.workOrderNo,
  pdiPlant: payload.plant,
  o_Id: payload.id
}
    
    console.log("from barcode",data);
    const res = await api.post('/PdiInspection/BarcodeChecker',data);
    console.log(res.data);
    if (res.status === 200) {
        dispatch(setBarcodeDetails(res.data))
    }
} catch (error) {
    if (error.response) {
        console .error('Server responded with error:', error.response.data);
    }
}
}


export const { setListOfInspectionData, setSearch, resetAll, setInspectionDetails,restInspectionDetails,setBarcodeDetails } = scanforinspectionSlice.actions;
export default scanforinspectionSlice.reducer;