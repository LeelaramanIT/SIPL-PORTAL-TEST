import { createSlice } from "@reduxjs/toolkit";
// import api from "../../utils/axios";
import toast from "react-hot-toast";

const initialState = {
    // manage State
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    category: "Tyre",
    mode: 'upload',
    isUploading: false,
    moduleOn: true,
    loading: false,
    error: null,
    selectedCustomer: "All Customers",
    selectedSheet: "",
    sheetOptions: [],
    items: [],

    // upload State
    excelJson: [],
    sheetMode: 'new',
    generatedId: '',
    search: '',
    errorFilter: '',
    isLoadingList: false,
    selectedUpdateCustomer: "All Customers",
    excelFileName: '',
    priceSheetRef: "",
    existingSheets: [],
}
const priceMasterSlice = createSlice({
    name: 'priceMaster',
    initialState,
    reducers: {
        setExcelData: (state, action) => {
            state.excelJson = action.payload
            // state.excelFileName = action.payload.fileName
        },
        setDates: (state, action) => {
            if (action.payload.start) state.startDate = action.payload.start;
            if (action.payload.end) state.endDate = action.payload.end;
        },
        setCategory: (state, action) => {
            state.category = action.payload;
        },
        resetUploadState: (state) => {
            state.excelJson = [];
            state.excelFileName = "";
            state.search = "";
            state.errorFilter = "All";
            state.selectedCustomer = "All Customers";
            if (state.sheetMode === "new" && state.generatedId) {
                state.priceSheetRef = state.generatedId;
            } else if (state.sheetMode === "new") {
                state.priceSheetRef = "";
            } else {
                state.priceSheetRef = "";
            }
        },
        setPriceSheetRef: (state, action) => {
            state.priceSheetRef = action.payload;
        },
        setSheetMode: (state, action) => {
            state.sheetMode = action.payload;
        },
        setSearch: (state, action) => {
            state.search = action.payload;
        },
        setErrorFilter: (state, action) => {
            state.errorFilter = action.payload;
        },
        setIsUploading: (state, action) => {
            state.isUploading = action.payload;
        },
        setMode: (state, action) => {
            state.mode = action.payload
        },
        setModuleOn: (state, action) => {
            state.moduleOn = action.payload
        },
        setSelectedCustomer: (state, action) => {
            state.selectedCustomer = action.payload
        },
        setSelectedUpdateCustomer: (state, action) => {
            state.selectedUpdateCustomer = action.payload
        },
        setSelectedSheet: (state, action) => {
            state.selectedSheet = action.payload
            state.selectedCustomer = "All Customers"
        },
        setSheetOptions: (state, action) => {
            state.sheetOptions = action.payload
        },
        setItems: (state, action) => {
            state.items = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        resetAll: (state) => {
            state.priceSheetRef = "";
            state.category = "Tyre";
            state.mode = 'manage';
            state.isProcessing = false;
            state.isUploading = false;
            state.moduleOn = true;
            state.loading = false;
            state.error = null;
            state.selectedCustomer = "All Customers";
            state.items = [];
        },
        updateGlobalSheetStatus: (state, action) => {
            const { id, status } = action.payload;
            const sheetIndex = state.sheetOptions.findIndex(sheet => sheet.id === id);
            if (sheetIndex !== -1) {
                state.sheetOptions[sheetIndex].activeStatus = status;
            }
            state.moduleOn = status;

        },
        setExcelFileName: (state, action) => {
            state.excelFileName = action.payload;
        },
        setGeneratedId: (state, action) => {
            state.generatedId = action.payload;
        },
        setExistingSheets: (state, action) => {
            state.existingSheets = action.payload;
        },
    }
})
export const { updateGlobalSheetStatus, setMode, setModuleOn, setSelectedCustomer, setExcelData, setDates, setCategory, resetUploadState, setSelectedSheet, setSheetOptions, setItems, setLoading, resetAll,
    // New Exports (Make sure to import these in your component)
    setGeneratedId, setSheetMode, setPriceSheetRef, setSearch, setExistingSheets,
    setErrorFilter, setIsUploading, setIsLoadingList, setSelectedUpdateCustomer, setExcelFileName
} = priceMasterSlice.actions;
export default priceMasterSlice.reducer