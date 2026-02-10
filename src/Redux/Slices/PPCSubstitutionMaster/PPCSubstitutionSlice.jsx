// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../utils/axios";
import toast from "react-hot-toast";
import { setLoading } from "../PPCSubstitutionMaster/PPCMaster";

const initialState = {
    listOfSubstitutionData: [],
    search: "",
    SubstitutionDetails: null,
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
    },
})

export const getListOfSubstitutionData = (plant,custtype) => async (dispatch) => {
    try {
        dispatch(setLoading(true))
        dispatch(resetAll())
        const res = await api.get(`/Substution/GettingSusbstitutionReadyOrders/${plant},${custtype}`);
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
        const res = await api.get(`/Substution/GettingSpecificSusbstitutionOrders/${payload.id}`,);
        
        if (res.status === 200) {
            dispatch(setSubstitutionDetails({...payload, items:res.data}))
        }
        console.log(res.data);
        
    } catch (error) {
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

export const { setListOfSubstitutionData, setSearch, resetAll, setSubstitutionDetails } = substitutionSlice.actions;
export default substitutionSlice.reducer;