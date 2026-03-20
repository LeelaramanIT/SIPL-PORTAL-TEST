// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../utils/axios";
import toast from "react-hot-toast";
import { setLoading } from "../PPCSubstitutionMaster/PPCMaster";
import ZplRenderer from "react-zpl-renderer";
import axios from "axios";

const initialState = {
    listOfSubstitutionData: [],
    search: "",
    SubstitutionDetails: null,
    custType: "Domestic",
    selectedData: null,
};

const printLabel = (zpl) => {

  window.BrowserPrint.getDefaultDevice("printer", function(printer){

    printer.send(zpl, function(){
      console.log("Label Printed");
    }, function(error){
      console.error(error);
    });

  }, function(error){
    console.error(error);
  });

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
            state.selectedData = null;
            state.search = "";
        },
        handleCustType: (state, action) => {
            state.custType = action.payload;
        },
        setSelectedData: (state, action) => {
            state.selectedData = action.payload
        },
        resetSelectedData: (state) => {
            state.selectedData = null
        },
        updateSubstitutionDetails: (state, action) => {
            const updatedItemsFromDB = action.payload; // array from backend

            if (!state.SubstitutionDetails?.items) return;

            state.SubstitutionDetails.items =
                state.SubstitutionDetails.items.map(existingItem => {

                    const updatedItem = updatedItemsFromDB.find(
                        u => u.o_ItemID === existingItem.o_ItemID
                    );

                    if (updatedItem) {
                        return {
                            ...existingItem,
                            substitutionQty: updatedItem.substitutionQty,
                            totaqty: updatedItem.totaqty,
                            substitutions: updatedItem.substitutions
                        };
                    }

                    return existingItem;
                });

            // 🔥 Recalculate overall order substitutionQty
            state.SubstitutionDetails.substitutionQty =
                state.SubstitutionDetails.items.reduce(
                    (sum, item) => sum + item.substitutionQty,
                    0
                );       

        },
    },
})

export const getListOfSubstitutionData = (Plant, custType) => async (dispatch) => {
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
            dispatch(setSubstitutionDetails({ ...payload, items: res.data }))
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

export const insertUpdateSubstitution = (payload) => async (dispatch) => {
    try {
        dispatch(setLoading(true))

        const res = await api.post(
            `/Substution/InsertUpdateItemSubstitution`,
            null,
            {
                params: payload
            }
        )

        if (res.status === 200) {
            console.log("Substitution saved successfully:", res.data)
            // 1.update 
            dispatch(updateSubstitutionDetails(res.data))
            // 2.print
            // res.data.forEach(item => {
            //     if (item.zpldata) {
            //         printLabel(item.zpldata);
            //     }
            // });
            toast.success("Substitution saved successfully")
        }

        dispatch(setLoading(false))
    } catch (error) {
        dispatch(setLoading(false))
        toast.error("Failed to save substitution")
        console.error(error)
    }
}


export const { setListOfSubstitutionData, setSearch, resetAll, setSubstitutionDetails, updateSubstitutionDetails, handleCustType, setSelectedData, resetSelectedData, printBarcode } = substitutionSlice.actions;
export default substitutionSlice.reducer;