// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../../utils/axios";
import toast from "react-hot-toast";
const initialState = {
  mode: "substitutiondetails",
  loading: false,
  search: "",
  ProcessIDMaster: null,
  ProcessIDList: null,
  generatedProcessID: null,
};

const TyreProcessIDSlice = createSlice({
  name: "TyreProcessID",
  initialState,
  reducers: {
    setProcessIDMaster: (state, action) => {
      state.ProcessIDMaster = action.payload;
    },
    setProcessIDList: (state, action) => {
      state.ProcessIDList = action.payload;
    },
    setGeneratedProcessID: (state, action) => {
      state.generatedProcessID = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
  },
});

export const getProcessIDMaster = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.get("EDC_Master/EDC_MasterList");
    dispatch(setLoading(false));
    dispatch(setProcessIDMaster(res.data));
  } catch (error) {
    console.log(error);
    dispatch(setLoading(false));
    throw error;
  }
};  
export const getAllProcessIDDetailsList = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.get("/ProcessIDMaster/GetAllProcessIDMaster");
    dispatch(setLoading(false));
    dispatch(setProcessIDList(res?.data?.data));
    return res.data;
  } catch (error) {
    console.log(error);
    dispatch(setLoading(false));
    throw error;
  }
};


export const getProcessIDByParameters = (params) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.get(`/EDC_Master/GetAssyProcessIDByParameter`, {
      params,
    });
    dispatch(setLoading(false));
    dispatch(setGeneratedProcessID(res.data));
    return res.data;
  } catch (error) {
    console.log(error);
    dispatch(setLoading(false));
  }
};

export const getEDCNumbers = (filters) => async (dispatch) => {
  try {
    console.log(filters);

    const response = await api.get("/EDC_Master/GetEDCNoByProcessID", {
      params: {
        RimSize: filters.tyreRim,
        TyreSize: filters.tyreSize,
      },
    });
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.log("EDC API ERROR:", error);
    throw error;
    return [];
  }
};

export const getProcessID = (params) => async (dispatch) => {
  const data = {
    Category: params.category.toUpperCase(),
    config: params.platform.toUpperCase(), // ⚠ also fix this
    TyreSize: params.tyreSize.toUpperCase(),
    TyreType: params.tyreType.toUpperCase(),
    TyreRim: params.tyreRim.toUpperCase(),
    Brand: params.brand.toUpperCase(),
    Sidewall: params.sidewall.toUpperCase(),
  };

  try {
    const res = await api.get(`/EDC_Master/GetAssyProcessID`, {
      params: data, // ✅ FIXED
    });

    return res?.data?.processID;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const saveAssyProcess = (payload) => async (dispatch) => {
  const data = {
    directional: payload.directional,
    processID: payload.processID,
    edcno: payload.edcNo,
  };

  try {
    const res = await api.post(`/EDC_Master/SaveAssyPID`, data);
    if (res.status === 201) {
      toast.success("Assembly Process ID Created Successfully");
    }

    return res.data;
  } catch (error) {
    console.log("Save API Error:", error);
    throw error;
  }
};

export const getProcessIDByPID = (params) => async (dispatch) => {
  try {
    const res = await api.get(`EDC_Master/FindByProcessID?processId=${params}`);
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const {
  setLoading,
  setSearch,
  setProcessIDMaster,
  setGeneratedProcessID,
  setProcessIDList,
} = TyreProcessIDSlice.actions;
export default TyreProcessIDSlice.reducer;
