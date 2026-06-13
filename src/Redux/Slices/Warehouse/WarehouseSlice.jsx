// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../utils/axios";

const initialState = {
  loading: "",
  scanLoading: "",
  plant: "",
  barcode: "",
  scannedTyres: [],
  factoryRefNo: "",
  transfers: [],
  factoryWarehouseDetails: [],
  binLocation: [],
};

const WarehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    setFactoryRefNo: (state, action) => {
      state.factoryRefNo = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setScanLoading: (state, action) => {
      state.scanLoading = action.payload;
    },
    setScannedTyres: (state, action) => {
      state.scannedTyres = action.payload;
    },
    setTransfers: (state, action) => {
      state.transfers = action.payload;
    },
    setFactoryWarehouseDetails: (state, action) => {
      state.factoryWarehouseDetails = action.payload;
    },
    setBinLocation: (state, action) => {
      state.binLocation = action.payload;
    },
  },
});

export const GetFactoryWarehouseDetails = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.get("/FactoryWarehouse/GetFactoryWarehouseDetails");
    console.log(res);
    if (res.status === 200) {
      const data = res?.data?.data;
      dispatch(setFactoryWarehouseDetails(data));
      dispatch(setLoading(false));
    }
  } catch (error) {
    console.log(error);
    dispatch(setLoading(false));
  }
};

export const GetFactoryRefNo = (plant) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.get("/FactoryWarehouse/GetFactoryRefNo", {
      params: {
        plant: plant,
      },
    });
    if (res.status === 200) {
      const data = res?.data?.data?.sequenceNo;
      dispatch(setFactoryRefNo(data));
      dispatch(setLoading(false));
    }
  } catch (error) {
    console.log(error);
    dispatch(setLoading(false));
  }
};

export const scanFactoryBarcode = (payload) => async (dispatch) => {
  try {
    dispatch(setScanLoading(true));

    const res = await api.post("/FactoryWarehouse/GetProductionData", payload);

    dispatch(setScanLoading(false));

    return res;
  } catch (error) {
    console.log(error);

    dispatch(setScanLoading(false));

    throw error;
  }
};

export const InsertTransaction = (payload) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));

    const res = await api.post("/FactoryWarehouse/v1/InsertTransaction", payload);

    if (res.status === 200) {
      console.log(res);
    }

    dispatch(setLoading(false));

    return res;
  } catch (error) {
    console.log(error);

    dispatch(setLoading(false));

    throw error;
  }
};

export const GetTransactionById = (id, statusNo) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get(
      `/FactoryWarehouse/Warehouse/Get-SpecAllTransList/${id}/${statusNo}`,
    );

    dispatch(setLoading(false));

    return res;
  } catch (error) {
    console.log(error);

    dispatch(setLoading(false));

    throw error;
  }
};

export const UpdateLoadDone = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.post("/FactoryWarehouse/UpdateLoadDone", payload);
    if (res.status === 200) {
      dispatch(setLoading(false));
    }
    return res;
  } catch (error) {
    console.log(error);
    dispatch(setLoading(false));
    throw error;
  }
};

export const GetTransfers = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get(
      "/FactoryWarehouse/Warehouse/Get-TransactionDetails",
    );

    const data = Array.isArray(res?.data?.data) ? res.data.data : [];

    dispatch(setTransfers(data));

    return data;
  } catch (error) {
    console.log(error);

    dispatch(setTransfers([]));

    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const DCAapproval = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    console.log(id);
    const url = `/FactoryWarehouse/dca-approval/${id}`;
    console.log(url);

    const res = await api.post(`/FactoryWarehouse/dca-approval/${id}`);
    if (res.status === 200) {
      dispatch(setLoading(false));
    }
    return res;
  } catch (error) {
    console.log(error);
    dispatch(setLoading(false));
    throw error;
  }
};

export const scanReceiveBarcode = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    console.log(payload);
    
    const res = await api.post(
      `/FactoryWarehouse/Warehouse/UpdateBinLocation`,
      payload,
    );

    dispatch(setLoading(false));

    return res;
  } catch (error) {
    console.log(error);
    dispatch(setLoading(false));
    throw error;
  }
};

export const GetBinLocationMaster = () => async (dispatch) => {
  try {
    console.log("called");
    
    const res = await api.get(
      "/FactoryWarehouse/GetPhysicalLocations",
    );
    console.log("resss",res);
    
    return res;
  } catch (err) {
    throw err;
  }
};

export const FinalSubmit = (id) => async (dispatch) => {
  try {
    console.log("called");
    
    const res = await api.post(
      `/FactoryWarehouse/Warehouse/finish/${id?.id}`,
    );
    console.log("resss",res);
    
    return res;
  } catch (err) {
    throw err;
  }
};

export const {
  setFactoryRefNo,
  setLoading,
  setScanLoading,
  setScannedTyres,
  setTransfers,
  setFactoryWarehouseDetails,
} = WarehouseSlice.actions;
export default WarehouseSlice.reducer;
