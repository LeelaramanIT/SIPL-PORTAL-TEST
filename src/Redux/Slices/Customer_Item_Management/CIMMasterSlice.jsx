// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
 mode: "barcode-print",
 loading : false,
 search: "",
};

const  CIMMasterSlice= createSlice({
    name: 'CIMMaster',
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

export const { setMode, setLoading, setSearch } = CIMMasterSlice.actions;
export default CIMMasterSlice.reducer;