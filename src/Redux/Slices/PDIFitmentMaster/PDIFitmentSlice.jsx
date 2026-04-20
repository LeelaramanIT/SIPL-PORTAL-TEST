// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../utils/axios";
import toast from "react-hot-toast";
import { message } from "antd";
import { printLabel } from "../../../utils/BarcodePrint";
const initialState = {
  mode: "substitutiondetails",
  loading: false,
  search: "",
  listOfFitmentData: [],
  FitmentDetails: null,
  scanSession: {
    tyre: null,
    rim: null,
    status: "WAITING"
    // WAITING | PARTIAL | READY | SUBMITTED
  },
};

const PDIFitmentSlice = createSlice({
  name: 'PDIFitment',
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
    setListOfFitmentData: (state, action) => {
      state.listOfFitmentData = action.payload;
    },
    setFitmentDetails: (state, action) => {
      state.FitmentDetails = action.payload;
    },
    resetAll: (state) => {
      state.listOfFitmentData = [];
      state.FitmentDetails = null;
      state.scanSession = {
        tyre: null,
        rim: null,
        status: "WAITING"
      }
      state.search = "";
    },
    setTyreDetails: (state, action) => {
      state.scanSession.tyre = action.payload

      if (state.scanSession.rim) {
        state.scanSession.status = "READY"
      } else {
        state.scanSession.status = "PARTIAL"
      }
    },
    resetTyreDetails: (state) => {
      state.scanSession.tyre = null

      if (state.scanSession.rim) {
        state.scanSession.status = "PARTIAL"
      } else {
        state.scanSession.status = "WAITING"
      }
    },

    resetRimDetails: (state) => {
      state.scanSession.rim = null

      if (state.scanSession.tyre) {
        state.scanSession.status = "PARTIAL"
      } else {
        state.scanSession.status = "WAITING"
      }
    },
    setRimDetails: (state, action) => {
      state.scanSession.rim = action.payload

      if (state.scanSession.tyre) {
        state.scanSession.status = "READY"
      } else {
        state.scanSession.status = "PARTIAL"
      }
    },
    resetScanSession: (state) => {
      state.scanSession = {
        tyre: null,
        rim: null,
        status: "WAITING"
      }
    }
  },
})

export const getListOfFitmentData = (plant, custType) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    dispatch(resetAll())
    console.log("called>>>>>>>>");
    const res = await api.get(`/WheelAssemblies/GetFitmentTyreList:${plant}:${custType}`);
    console.log(res.data)
    if (res.status === 200) {
      dispatch(setListOfFitmentData(res.data))
    }
    dispatch(setLoading(false))
  } catch (error) {
    dispatch(setLoading(false))
    console.log(error)
    toast.error(error.message)
  }
}

export const getFitmentDetails = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    dispatch(resetAll())
    // console.log("called>>>>>>>>",payload);
    const res = await api.get(`/WheelAssemblies/GetSpecificAssemblyTyre:${payload.id}`);
    // console.log(res.data)
    if (res.status === 200) {
      dispatch(setFitmentDetails({ ...payload, items: res.data }))
    }
    dispatch(setLoading(false))
  } catch (error) {
    dispatch(setLoading(false))
    console.log(error)
    toast.error(error.message)
  }
}

export const PIDFitmentCheckBarcode = (payload) => async (dispatch) => {
  try {

    // console.log("From Barcode", payload)
    const res = await api.get(`/WheelAssemblies/ScanBarcode:${payload.barcode}:${payload.O_ID}:${payload.O_ItemID}:${payload.PID}:${payload.plant}`);
    // console.log("TYPE:", res.data.type, "| length:", res.data.type.length);
    if (res.status === 200) {
      const type = res.data.type?.trim().toUpperCase()
      console.log(res.data);


      if (type === "TYRE") {
        dispatch(setTyreDetails(res.data))
      }

      if (type === "RIM") {
        dispatch(setRimDetails(res.data))
      }
      return {
        status: res.data.status,
        message: res.data.message
      };
    }
  } catch (error) {
    if (error.response) {

      console.log("API ERROR RESPONSE", error.response.data);

      return {
        status: error.response.data.status,
        message: error.response.data.message,
      };

    }

    console.log("NETWORK ERROR", error);

    return {
      status: false,
      message: "Network error"
    };
  }
}

export const verifyFitment = (payload) => async (dispatch) => {
  try {

    // console.log(payload);

    const { TyreSize, RimSize, Processid, O_ItemID, O_ID, EdcNo } = payload;
    console.log(payload);

    const res = await api.post(`/WheelAssemblies/fitment-validation`,
      {
        edcNo: EdcNo,
        tyreSize: TyreSize,
        rimSize: RimSize,
        processid: Processid,
        o_ID: O_ID,
        o_ItemID: O_ItemID
      });

    console.log("SUCCESS RESPONSE", res.data);

    return {
      status: res.data.status,
      message: res.data.message
    };

  } catch (error) {

    if (error.response) {

      console.log("API ERROR RESPONSE", error.response.data);

      return {
        status: error.response.data.status,
        message: error.response.data.message
      };

    }

    console.log("NETWORK ERROR", error);

    return {
      status: false,
      message: "Network error"
    };
  }
};


export const getAssyDetails = (payload) => async (dispatch) => {
  try {
    const res = await api.get(`/WheelAssemblies/GenerateAssemblyBarcode:${payload.StencilGrade}:${payload.ProcessID}:${payload.EdcNo}:${payload.Direction}:${payload.o_ID}`)
    if (res.status === 200) {
      return {
        assemblyBarcode: res.data.assemblyBarcode,
        status: res.data.status,
        message: res.data.message,
        o_ItemID:res.data.o_ItemID
      };
    }
  } catch (error) {
    if (error.response) {

      console.log("API ERROR RESPONSE", error.response.data);

      return {
        status: error.response.data.status,
        message: error.response.data.message,
        assemblyBarcode: ''
      };

    }

    console.log("NETWORK ERROR", error);

    return {
      status: false,
      message: "Network error"
    };
  }

}

export const SubmitFitmentInspection = (payload, setViewMode) => async (dispatch,getState) => {

  try {
    const res = await api.post("/WheelAssemblies/SaveFitmentItem", payload)
    if (res.status === 200) {
      console.log(res.data);
      const { FitmentDetails } = getState().PDIFitment;
      if (!FitmentDetails) return;
      const updatedItems = FitmentDetails.items.map(item => {
        if (item.o_ItemID === res.data.o_ItemID) {
          return {
            ...item,
            scannedQty: res.data.scannedQty,
          }
        }
        return item
      });
      await printLabel(payload?.assemblyBarcode)
      dispatch(setFitmentDetails({
        ...FitmentDetails,
        items: updatedItems
      }));
      setViewMode("inventory")
      dispatch(resetScanSession())
      dispatch(resetTyreDetails())
      dispatch(resetRimDetails())
    }
  } catch (error) {
    console.log(error);
  }
}
export const { setMode, setLoading, setSearch, setListOfFitmentData, resetAll, setFitmentDetails, setRimDetails, setTyreDetails
  , resetRimDetails, resetTyreDetails, resetScanSession
} = PDIFitmentSlice.actions;
export default PDIFitmentSlice.reducer;