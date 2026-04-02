// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
 mode: "Draft Proforma Invoice",
 loading : false,
 search: "",
};

const  PIMasterSlice= createSlice({
    name: 'PIMaster',
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

export const { setMode, setLoading, setSearch } = PIMasterSlice.actions;
export default PIMasterSlice.reducer;