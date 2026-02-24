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
        resetBarcodeDetails: (state) => {
            state.barcodeDetails = [];
        },
        
    },
})

export const getListOfInspectionData = (plant,custType) => async (dispatch) => {
    try {
        dispatch(setLoading(true))
        dispatch(resetAll())
        console.log("called>>>>>>>>");
        const res = await api.get(`/PdiInspection/GetListOfPdiInspectOrders:${plant}:${custType}`);
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
            dispatch(setInspectionDetails({ ...payload, items: res.data }))
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
            o_Id: payload.id,
            processID: payload.processID,
            stencilNo: payload.stencilNo,
            o_ItemID: payload.o_ItemID,
            orderQty: payload.itemQty,
            orderrefno: payload.orderRefNo,
        }
        console.log("From Barcode", data)
        const res = await api.post('/PdiInspection/BarcodeChecker', data);
        console.log("DB Data",res.data);
        if (res.status === 200) {
            dispatch(setBarcodeDetails({...res.data,...data}))
        }
    } catch (error) {
        if (error.response) {
            console.error('Server responded with error:', error.response.data);
        }
    }
}

export const SubmitInspection = (payload) => async (dispatch, getState) => {
    try {

        const res = await api.post('/PdiInspection/PDI_SaveItem', payload);

        if (res.status === 200) {

            const response = res.data;

            // check save success
            if (!response.saveStatus) return;

            // 1️⃣ get current state
            const { InspectionDetails } = getState().scanforinspection;
            if (!InspectionDetails) return;

            // 2️⃣ update only matching item
            const updatedItems = InspectionDetails.items.map(item => {
                if (item.o_ItemID === response.o_ItemID) {
                    return {
                        ...item,
                        scannedQty: response.scannedQty,
                        pid: response.pid,
                        substitutionQty: response.substitutionQty
                    };
                }
                return item;
            });

            // 3️⃣ dispatch updated state
            dispatch(setInspectionDetails({
                ...InspectionDetails,
                items: updatedItems
            }));
            toast.success("Scan Successful!")
        }

    } catch (error) {
        console.log(error);
    }
};


export const { setListOfInspectionData, setSearch, resetAll, setInspectionDetails, restInspectionDetails, setBarcodeDetails, resetBarcodeDetails } = scanforinspectionSlice.actions;
export default scanforinspectionSlice.reducer;