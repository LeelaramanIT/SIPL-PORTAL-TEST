// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../../utils/axios";
import { printSingleBarcodeLabel } from "../../../../utils/BarcodePrint";
const initialState = {
 mode: "barcode-print",
 loading : false,
 search: "",
 custWorkOrder: [],
 itemsByWorkOrder: [],
};

const  CIMBarcodeSlice= createSlice({
    name: 'CIMBarcode',
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
      setCustWorkOrder: (state, action) => {
        state.custWorkOrder = action.payload;
      },
      setItemsByWorkOrder: (state, action) => {
        state.itemsByWorkOrder = action.payload;
      },
    },
})

export const printSingleBarcode = (barcode) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const res = await api.get(
      `/CustomBarcode/GetMetcoBarcodeLable?barcode=${barcode}`
    );

    if (res.status === 200 && res.data) {
      if (res.data.zplCode) {
        await printSingleBarcodeLabel(res.data.zplCode);
      }

      return {
        success: true,
        data: res.data,
        message: "Barcode processed successfully",
      };
    }

    return {
      success: false,
      message: "Invalid response from server",
    };

  } catch (error) {
    console.error("❌ Barcode API Error:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  } finally {
    dispatch(setLoading(false));
  }
};

export const printScannedBarcodeLabel = (barcode) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const res = await api.get(
      `/CustomerBarcode/GenerateScannedBarcodeLabel?request=${encodeURIComponent(barcode)}`
    );

    // API returns { data: { zpl } }
    const zplCode = res.data?.data?.zpl ?? res.data?.zpl;

    if (res.status === 200 && zplCode) {
      await printSingleBarcodeLabel(zplCode);

      return {
        success: true,
        data: { ...(res.data?.data ?? res.data), zplCode },
        message: "Barcode processed successfully",
      };
    }

    return {
      success: false,
      message: res.data?.message || "Invalid response from server",
    };

  } catch (error) {
    console.error("❌ Barcode API Error:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  } finally {
    dispatch(setLoading(false));
  }
};

export const printBulkBarcode = (o_ItemID) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const res = await api.get(
      `/CustomBarcode/GetMetcoBarcodeLable?barcode=${o_ItemID}`
    );

    if (res.status === 200 && res.data) {
      if (res.data.zplCode) {
        await printSingleBarcodeLabel(res.data.zplCode);
      }

      return {
        success: true,
        data: res.data,
        message: "Barcode processed successfully",
      };
    }

    return {
      success: false,
      message: "Invalid response from server",
    };

  } catch (error) {
    console.error("❌ Barcode API Error:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  } finally {
    dispatch(setLoading(false));
  }
};

export const getCusWorkOrder = (plant) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const res = await api.get(
      `/CustomBarcode/GetWorkOrderDetails?Plant=${plant}`
    );

    if (res.status === 200 && res.data) {
      dispatch(setCustWorkOrder(res.data));
      return {
        success: true,
        data: res.data,
        message: "",
      };
    }

    return {
      success: false,
      message: "Invalid response from server",
    };

  } catch (error) {
    console.error("❌ Barcode API Error:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  } finally {
    dispatch(setLoading(false));
  }
};

export const getItemsByWorkOrder = (O_ID) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const res = await api.get(
      `/CustomBarcode/GetItemDetails?O_ID=${O_ID}`
    );

    if (res.status === 200 && res.data) {
      dispatch(setItemsByWorkOrder(res.data));
      return {
        success: true,
        data: res.data,
        message: "",
      };
    }

    return {
      success: false,
      message: "Invalid response from server",
    };

  } catch (error) {
    console.error("❌ Barcode API Error:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  } finally {
    dispatch(setLoading(false));
  }
};




export const { setMode, setLoading, setSearch, setCustWorkOrder , setItemsByWorkOrder} = CIMBarcodeSlice.actions;
export default CIMBarcodeSlice.reducer;