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
  loading: false,
  error: null,
};

const ProjectSlice = createSlice({
  name: "Project",
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
    setModuelToProject: (state, action) => {
      const modules = action.payload;
      if (modules && modules.length > 0) {
        const project = state.listOfProject.find(
          (p) => p.projectID === modules[0].projectID,
        );
        if (project) {
          project.modules = modules;
        }
      }
      state.listOfProject.find(
        (data) => data.projectID === action.payload[0].projectID,
      );
    },
    
  },
});

export const {
  setLoading,
  setMasterData,
  setError,
  setProjectList,
  setModuelToProject,
} = ProjectSlice.actions;

export const fetchMaster = (url, key) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get(url);

    if (res.status === 200) {
      dispatch(
        setMasterData({
          key,
          data: res.data?.data,
        }),
      );
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }

    dispatch(setLoading(false));
  } catch (error) {
    console.error("API Error:", error);
    dispatch(
      setError(
        error?.response?.data?.message || error.message || String(error),
      ),
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
        error?.response?.data?.message || error.message || String(error),
      ),
    );
  }
};

export const createModuel = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.post("/Project/module/create", payload); // 

    if (res.status === 200) {
      toast.success("Module Created successfully");

      // ✅ Update Redux state
    //   dispatch(setModuelToProject([res.data?.data]));
    dispatch(setLoading(false));
    return 'SUCCESS'
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("API Error:", error);
    dispatch(
      setError(
        error?.response?.data?.message || error.message || String(error),
      ),
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
        error?.response?.data?.message || error.message || String(error),
      ),
    );
  }
};

export const getProjectModuel = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await api.get(`/Project/${id}/modules`);

    if (res.status === 200) {
      dispatch(setModuelToProject(res.data?.data));
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }

    dispatch(setLoading(false));
  } catch (error) {
    console.error("API Error:", error);
    dispatch(
      setError(
        error?.response?.data?.message || error.message || String(error),
      ),
    );
  }
};

export default ProjectSlice.reducer;
