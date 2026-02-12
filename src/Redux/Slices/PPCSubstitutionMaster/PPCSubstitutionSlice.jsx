// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../utils/axios";
import toast from "react-hot-toast";
import { setLoading } from "../PPCSubstitutionMaster/PPCMaster";
import axios from "axios";

const initialState = {
    listOfSubstitutionData: [],
    search: "",
    SubstitutionDetails: null,
    custType:"Domestic"
};

const substitutionSlice = createSlice({
    name: 'PPCSubstitution',
    initialState,
    reducers: {
        setListOfSubstitutionData: (state, action) => {
            state.listOfSubstitutionData = action.payload;
        },
        setSubstitutionDetails: (state, action) => {
            state.SubstitutionDetails = action.payload; 
        },
        setSearch: (state, action) => {
            state.search = action.payload;
        },
        resetAll: (state) => {
            state.listOfSubstitutionData = [];
            state.SubstitutionDetails = null;
            state.search = "";
        },
        handleCustType: (state, action) => {
            state.custType = action.payload;
        },
    },
})

export const getListOfSubstitutionData = (Plant,custType) => async (dispatch) => {
    try {
        dispatch(setLoading(true))
        dispatch(resetAll())
        const res = await api.get(`/Substution/GettingSusbstitutionReadyOrders/${Plant},${custType}`);
        console.log(res.data)
        if (res.status === 200) {
            dispatch(setListOfSubstitutionData(res.data))
        }
        dispatch(setLoading(false))
    } catch (error) {
        dispatch(setLoading(false))
        console.log(error)
        toast.error(error.message)
    }
}

export const getSubstitutionDetails = (payload) => async (dispatch) => {
    
    try {
        dispatch(setLoading(true))
        const res = await api.get(`/Substution/GettingSpecificSusbstitutionOrders/${payload.id}`,);
        
        if (res.status === 200) {
            dispatch(setSubstitutionDetails({...payload, items:res.data}))
        }
        dispatch(setLoading(false))
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

export const { setListOfSubstitutionData, setSearch, resetAll, setSubstitutionDetails, handleCustType } = substitutionSlice.actions;
export default substitutionSlice.reducer;