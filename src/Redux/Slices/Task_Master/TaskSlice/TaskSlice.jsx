import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../../utils/axios";
import toast from "react-hot-toast";

const initialState = {
  taskList: [],
  loading: false,
  error: null,
};

const TaskSlice = createSlice({
  name: "Task",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    setTaskList: (state, action) => {
      state.taskList = action.payload;
    },

    addTaskToList: (state, action) => {
      state.taskList.push(action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  setTaskList,
  addTaskToList,
} = TaskSlice.actions;

export const createTask = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.post("/Task/create", payload);

    if (res.status === 200) {
      toast.success("Task created successfully ✅");

      // 🔥 update redux instantly
      dispatch(addTaskToList(res.data?.data));

      dispatch(setLoading(false));
      return "SUCCESS";
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("API Error:", error);

    dispatch(
      setError(
        error?.response?.data?.message ||
        error.message ||
        String(error)
      )
    );
  }
};

export const getTaskList = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get("/api/Task/all");

    if (res.status === 200) {
      dispatch(setTaskList(res.data?.data));
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }

    dispatch(setLoading(false));
  } catch (error) {
    console.error("API Error:", error);

    dispatch(
      setError(
        error?.response?.data?.message ||
        error.message ||
        String(error)
      )
    );
  }
};