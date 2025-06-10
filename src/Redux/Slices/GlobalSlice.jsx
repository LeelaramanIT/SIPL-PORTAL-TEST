// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  if (typeof window !== "undefined" && localStorage.theme) {
    return localStorage.theme;
  }
  return "light";
};


const initialState = {
  open: false,
  theme: getInitialTheme(),  
  sections: {
    mastersOpen: false,
    userMasterOpen: false,
    organizationOpen: false,
    otherOption: false,
    alertOpen: false,
    alertUserOpen: false,
    alertMasterOpen: false,
    invoiceOpen: false,
    domesticOpen: false,
    TTSOpen: false,
  },
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.open = !state.open;
    },
    toggleSection: (state, action) => {
      
      const section = action.payload;
      state.sections[section] = !state.sections[section];
    },
    setSection: (state, action) => {
      const { section, value } = action.payload;
      state.sections[section] = value;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.theme = action.payload;
    },
  },
});

export const { toggleSidebar, toggleSection, setSection,setTheme } = globalSlice.actions;
export default globalSlice.reducer;
