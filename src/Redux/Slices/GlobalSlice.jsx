// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";



const initialState = {
  open: false,
  theme: 'light',
  isDark: localStorage.getItem('darkMode') === 'true',

};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.open = !state.open;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.theme = action.payload;
    },
    setIsDark: (state, action) => {
      state.isDark = action.payload;
      localStorage.setItem('darkMode', action.payload); // action.payload will be a boolean
    }    
  },
});

export const { toggleSidebar,setTheme,setIsDark } = globalSlice.actions;
export default globalSlice.reducer;
