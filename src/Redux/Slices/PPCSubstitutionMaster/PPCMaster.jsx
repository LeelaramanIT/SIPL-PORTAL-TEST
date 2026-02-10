// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
 mode: "substitutiondetails",
 loading : false,
 search: "",
};

const PPCMasterSlice = createSlice({
    name: 'PPCMaster',
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

export const { setMode, setLoading, setSearch } = PPCMasterSlice.actions;
export default PPCMasterSlice.reducer;