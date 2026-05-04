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
  dispatch(setLoading(true));

  try {
    const res = await api.get(
      `/CustomBarcode/GetMetcoBarcodeLable?barcode=${barcode}`
    );

    if (res.status === 200 && res.data) {
      if (res.data.zplCode) {
        await printSingleBarcodeLabel(res.data.zplCode);
      }

      return {
        success: true,
        data: res.data,
        message: "Barcode processed successfully",
      };
    }

    return {
      success: false,
      message: "Invalid response from server",
    };

  } catch (error) {
    console.error("❌ Barcode API Error:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  } finally {
    dispatch(setLoading(false));
  }
};

export const { setMode, setLoading, setSearch } = CIMBarcodeSlice.actions;
export default CIMBarcodeSlice.reducer;