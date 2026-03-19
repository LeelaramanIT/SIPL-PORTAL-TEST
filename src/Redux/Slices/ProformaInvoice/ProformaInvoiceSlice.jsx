import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../utils/axios";

const initialState = {
listOfProformaInvoice:[],
loading:false,
proformaDetails:{},
additionalForm:{}
}

const proformaInvoice = createSlice({
    initialState,
    name:'proformaInvoice',
    reducers: {
        setListOfProformaInvoice: (state,action) => {
            state.listOfProformaInvoice = action.payload
        },
        setLoading: (state,action) => {
            state.loading = action.payload
        },
        resetMaster: (state) => {
            state.listOfProformaInvoice = []
        },
        setProformaInvoiceDetails: (state,action) => {
            state.proformaDetails = action.payload
        },
        setadditionalForm: (state,action) => {
            state.additionalForm = action.payload
        }
    }
})

export const getListOfProformaInvoice = (payload) => async (dispatch) => {
    try {
        dispatch(setLoading(true))
        const res = await api.get(`/DraftPI/GettingDraftPIReadyOrders`,{
            params:{
                DocumentType:payload
            }
        })
        if(res.status === 200){
            dispatch(setListOfProformaInvoice(res.data))
            dispatch(setLoading(false))
        }
        console.log(res.data);
    } catch (error) {
        dispatch(setLoading(false))
        console.log(error);
    }
}

export const getProformaInvoiceDetails = (payload) => async (dispatch) => {
    try {
        dispatch(setLoading(true))
        const res = await api.get(`/DraftPI/GettingDraftPIReadySpecificOrders`,{
            params:{
                o_id:payload.oid
            }
        })
        // console.log(res.data);
        
        if(res.status === 200){
            dispatch(setProformaInvoiceDetails(res.data[0]))
            dispatch(setLoading(false))
        }
        
    } catch (error) {
        dispatch(setLoading(false))
        console.log(error);
    }
}

export const {setListOfProformaInvoice , setLoading, resetMaster, setProformaInvoiceDetails, setadditionalForm } = proformaInvoice.actions

export default proformaInvoice.reducer