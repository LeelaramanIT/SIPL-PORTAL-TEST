// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
 mode: "scanforinspection",
 loading : false,
 search: "",
 inspectionType:'NEW'
};

const  PDIDispatchMasterSlice= createSlice({
    name: 'PDIDispatchMaster',
    initialState,
    reducers: {
      setMode: (state, action) => {
        state.mode = action.payload;
      },
      setLoading: (state, action) => {
        state.loading = action.payload;
      },
      setSearch: (state, action) => {
        state.search = action.payload;
      },
      setInspectionType: (state, action) => {
        state.inspectionType = action.payload
      }
    },
})

export const { setMode, setLoading, setSearch , setInspectionType } = PDIDispatchMasterSlice.actions;
export default PDIDispatchMasterSlice.reducer;