import { createSlice } from "@reduxjs/toolkit"
import axios from "axios"

const initialState = {
    rimSize:[],
    loading:false,
    error:null
}

const rimApplication = createSlice({
    name: 'rimApplication',
    initialState: initialState,
    reducers:{
        setRimSize:(state,action)=>{
            state.rimSize = action.payload
        },
        setRimError:(state,action)=>{
            state.loading = false
            state.error = action.payload
        },
        setRimLoading:(state)=>{
            state.loading = true
        },
        setRimSuccess:(state)=>{
            state.loading = false
        }
    }
})
export const { setRimSize, setRimError, setRimLoading, setRimSuccess } = rimApplication.actions

export const getRimSize = () => async (dispatch) => {
    try {
      dispatch(setRimLoading());
  
      const res = await axios.get("https://localhost:7174/api/RimStock/RimSize");
  
      if (res.status === 200) {
        dispatch(setRimSize(res.data));
        dispatch(setRimSuccess());
      } else {
        throw new Error("Unexpected response status: " + res.status);
      }
  
    } catch (error) {
      console.error("Failed to fetch Rim Size:", error);
      dispatch(setRimError(error?.response?.data?.message || error.message || String(error)));
    }
  };


export default rimApplication.reducer