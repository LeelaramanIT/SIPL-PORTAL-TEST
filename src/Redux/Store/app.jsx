// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "../Slices/GlobalSlice";
import invoiceReducer from "../Slices/InvoiceSlice";

export const store = configureStore({
  reducer: {
    global: globalReducer,
    invoice: invoiceReducer,
  },
});
