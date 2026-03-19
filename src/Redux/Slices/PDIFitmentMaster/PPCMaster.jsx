// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
 mode: "substitutiondetails",
 loading : false,
 search: "",
};

const PDIFitmentMasterSlice = createSlice({
    name: 'PDIFitmentMaster',
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

export const { setMode, setLoading, setSearch } = PDIFitmentMasterSlice.actions;
export default PDIFitmentMasterSlice.reducer;