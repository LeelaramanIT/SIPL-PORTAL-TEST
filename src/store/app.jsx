// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./SidebarSlice";

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
  },
});
