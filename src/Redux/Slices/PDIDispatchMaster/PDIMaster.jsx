// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
 mode: "scanforinspection",
 loading : false,
 search: "",
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
    },
})

export const { setMode, setLoading, setSearch } = PDIDispatchMasterSlice.actions;
export default PDIDispatchMasterSlice.reducer;