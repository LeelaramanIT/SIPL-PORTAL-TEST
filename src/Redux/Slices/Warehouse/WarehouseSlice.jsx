// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../utils/axios";



const initialState = {
 loading:'',
 plant:'',
 barcode:'',
 scannedList:'',

};

const WarehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {

  },
});

export const scanBarcode = (payload) => async (dispatch) => {
  try {
    const res = await api.post('')
  } catch (error) {
    
  }
};

export const { } = WarehouseSlice.actions;
export default WarehouseSlice.reducer;
