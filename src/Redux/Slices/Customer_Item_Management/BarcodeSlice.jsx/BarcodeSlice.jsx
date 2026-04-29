// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../../utils/axios";
import { printSingleBarcodeLabel } from "../../../../utils/BarcodePrint";
const initialState = {
 mode: "barcode-print",
 loading : false,
 search: "",
};

const  CIMBarcodeSlice= createSlice({
    name: 'CIMBarcode',
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

export const printSingleBarcode = (barcode) => async (dispatch) => {
    try {
  
      const res = await api.get(`/CustomBarcode/GetMetcoBarcodeLable?barcode=${barcode}`);
  
      if (res.status === 200) {
        await printSingleBarcodeLabel(res.data.zplCode)
        return res.data;
      } else {
        throw new Error("Unexpected response status: " + res.status);
      }
  
    } catch (error) {
      console.error("Failed to fetch Rim Size:", error);
    //   dispatch(setRimError(error?.response?.data?.message || error.message || String(error)));
    }
  };

export const { setMode, setLoading, setSearch } = CIMBarcodeSlice.actions;
export default CIMBarcodeSlice.reducer;