import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "../../../../utils/axios";
import toast from "react-hot-toast";

const initialState = {
  master: {
    taskTypes: [],
    projectTypes: [],
    priorities: [],
    projectStatus: [],
    departmentdivisions: [],
  },
  listOfProject: [],
  listOfSprint: [],
  loading: false,
  moduleLoading: false,
  error: null,
};

const SprintSlice = createSlice({
  name: "Sprint",
  initialState,
  reducers: {
    setMasterData: (state, action) => {
      const { key, data } = action.payload;
      state.master[key] = data;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setProjectList: (state, action) => {
      state.listOfProject = action.payload;
    },
    setModuleLoading: (state, action) => {
      state.moduleLoading = action.payload;
    },
    setModuelToProject: (state, action) => {
      console.log(action.payload);
      
      const { projectID, modules } = action.payload;
      
      if (projectID && modules && Array.isArray(modules)) {
        const project = state.listOfProject.find(
          (p) => p.projectID === projectID
        );
        if (project) {
          project.modules = modules;
        }
      }
    },
  },
});

export const {
  setLoading,
  setMasterData,
  setError,
  setProjectList,
  setModuelToProject,
  setModuleLoading,
} = SprintSlice.actions;

export const fetchMaster = (url, key) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.get(url);
    if (res.status === 200) {
      dispatch(
        setMasterData({
          key,
          data: res.data?.data,
        })
      );
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
    dispatch(setLoading(false));
  } catch (error) {
    console.error("API Error:", error);
    dispatch(
      setError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
  }
};

export const projectCreate = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.post("/Project/create", payload);
    if (res.status === 200) {
      toast.success("project Created succenfully");
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
    dispatch(setLoading(false));
  } catch (error) {
    console.error("API Error:", error);
    dispatch(
      setError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
  }
};

export const createModuel = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.post("/Project/module/create", payload);
    if (res.status === 200) {
      toast.success("Module Created successfully");
      // ✅ Update Redux state
      // dispatch(setModuelToProject([res.data?.data]));
      dispatch(setLoading(false));
      return "SUCCESS";
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("API Error:", error);
    dispatch(
      setError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
  }
};

export const getProjectList = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.get("/Project/all");
    if (res.status === 200) {
      dispatch(setProjectList(res.data?.data));
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
    dispatch(setLoading(false));
  } catch (error) {
    console.error("API Error:", error);
    dispatch(
      setError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
  }
};

export const getProjectModuel = (projectID) => async (dispatch) => {
  try {
    dispatch(setModuleLoading(true));
    const res = await api.get(`/Project/${projectID}/modules`);
    if (res.status === 200) {
      dispatch(
        setModuelToProject({
          projectID: projectID,
          modules: res.data?.data || [],
        })
      );
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
    dispatch(setModuleLoading(false));
  } catch (error) {
    console.error("API Error:", error);
    dispatch(
      setError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
    dispatch(setModuleLoading(false));
  }
};

export default SprintSlice.reducer;