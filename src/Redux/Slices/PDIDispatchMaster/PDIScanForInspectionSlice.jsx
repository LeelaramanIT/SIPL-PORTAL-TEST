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
    loadingBarcode: false,
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
        setLoadingBarcode: (state, action) => {
            state.loadingBarcode = action.payload;
        },

    },
})

export const getListOfInspectionData = (plant, custType) => async (dispatch) => {
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
        console.log("DB Data", res.data);
        if (res.status === 200) {
            dispatch(setBarcodeDetails({ ...res.data, ...data }))
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
                        substitutionQty: response.substitutionQty,
                        scannedCount: response.ScannedSubtitutionQty,
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

export const getBarcodeWise = (payload) => async (dispatch) => {
    console.log(payload);

    const PID = payload?.items?.find(item => item.pid !== 0)?.pid || 0;

    console.log(PID);
    try {
        dispatch(setLoadingBarcode(true))
        const res = await api.get(`/PdiInspection/GetScannedBarcodeInfo:${PID}:${'scanned'}:${payload.plant}`);
        dispatch(setLoadingBarcode(false))
        // console.log(res.data)
        if (res.status === 200) {
            console.log(res.data)
            dispatch(setBarcodeDetails(res.data))
            dispatch(setLoadingBarcode(false))
        }

    } catch (error) {
        dispatch(setLoadingBarcode(false))
        console.log(error);
    }
}

export const getWorkorder = (custCode, orderRefNo) => async () => {
    try {
       console.log(custCode,orderRefNo);
       
        const res = await api.get(`/PdfUpload/download-workorder`, {
            params: {
                custCode: custCode,
                OrderrefNo: orderRefNo // Match the C# 'workorderno' parameter name
            },
            responseType: 'blob'
        });

        if (res.status === 200) {
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.body.appendChild(document.createElement('a'));
            link.href = url;
            link.download = `${orderRefNo}.pdf`;
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }
    } catch (error) {
        // If you get a 404 now on port 5300, it means the physical 
        // file doesn't exist in the folder defined in your C# _config.
        console.error("Download Error:", error);
    }
};


export const { setListOfInspectionData, setSearch, resetAll, setInspectionDetails, restInspectionDetails, setBarcodeDetails, resetBarcodeDetails, setLoadingBarcode } = scanforinspectionSlice.actions;
export default scanforinspectionSlice.reducer;