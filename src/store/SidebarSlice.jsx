// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: false,
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

const sidebarSlice = createSlice({
  name: "sidebar",
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
  },
});

export const { toggleSidebar, toggleSection, setSection } = sidebarSlice.actions;
export default sidebarSlice.reducer;
