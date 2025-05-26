// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "../Slices/GlobalSlice";
import invoiceReducer from "../Slices/InvoiceSlice";
import authReducer from '../Slices/AuthSlice'

export const store = configureStore({
  reducer: {
    global: globalReducer,
    invoice: invoiceReducer,
    auth: authReducer,
  },
  // devTools:false,
});
