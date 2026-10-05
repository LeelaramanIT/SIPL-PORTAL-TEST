import { createSlice } from "@reduxjs/toolkit"
import { api } from "../../../utils/axios"

const initialState = {
    productionReport:[],
    loading:true,
    error:null
}

const ProductionReportSlice = createSlice({
    name: 'productionReport',
    initialState: initialState,
    reducers:{
        setReport:(state,action)=>{
            state.productionReport = action.payload
        },
        setReportLoading:(state,action)=>{
            state.loading = action.payload
        },
        setReportError:(state,action)=>{
            state.loading = false
            state.error = action.payload
        },
        // Combines the loading:false + data-set steps into one action so the
        // fetch-resolution moment triggers a single re-render instead of two.
        setReportSuccess:(state,action)=>{
            state.loading = false
            state.error = null
            state.productionReport = action.payload
        }
    }
})
export const { setReport, setReportLoading, setReportError, setReportSuccess } = ProductionReportSlice.actions

export const getProductionReport = () => async (dispatch) => {
    try {
      dispatch(setReportLoading(true));

      const res = await api.get("/ReportProductionTracker");

      if (res.status === 200) {
        const payload = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        dispatch(setReportSuccess(payload));
      } else {
        throw new Error("Unexpected response status: " + res.status);
      }

    } catch (error) {
      console.error("Failed to fetch production report:", error);
      dispatch(setReportError(error?.response?.data?.message || error.message || String(error)));
    }
  };


export default ProductionReportSlice.reducer