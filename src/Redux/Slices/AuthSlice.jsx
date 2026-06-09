import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/axios";
import { toast } from "react-hot-toast";

const userData = JSON.parse(localStorage.getItem("user")) || {};
console.log(userData);


const initialState = {
  // token: localStorage.getItem("authToken") || null,

  username: userData.username || null,
  roles: userData.roles || "",
  Menus: userData.menus || [],

  DepartmentDetails: userData.departmentDetails || [],
  LocationDetails: userData.locationDetails || [],

  RoleID: userData.roleID || "",

  loggedIn: !!localStorage.getItem("authToken"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      console.log(action.payload);

      const data = action.payload;

      // state.token = data.Token;

      state.username = data.username;
      state.roles = data.roles;

      state.Menus = data.menus || [];

      state.DepartmentDetails = data.departmentDetails || [];

      state.LocationDetails = data.locationDetails || [];

      state.RoleID = data.roleID;

      state.loggedIn = true;
      state.loading = false;

      localStorage.setItem("authToken", data.Token);

      // SAVE FULL RESPONSE EXACTLY
      localStorage.setItem("user", JSON.stringify(data));
    },

    logout: (state) => {
      state.token = null;
      state.username = null;
      state.roles = [];
      state.Menus = [];
      state.loggedIn = false;
      state.Department = "";
      state.RoleID = "";
      state.Location = "";
      state.loading = false;
      state.error = null;
      window.localStorage.clear();
      window.sessionStorage.clear();
      console.log("logout");
    },

    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
    },
  },
});

export const userLogin = (credentials) => async (dispatch) => {
  dispatch(loginStart(true));

  try {
    const res = await api.post("/Auth/logins", credentials, {
      withCredentials: true,
    });
    if (res.status === 200) {
      const data = res.data;
      dispatch(loginSuccess(data));
      dispatch(loginStart(false));
    }
  } catch (error) {
    dispatch(loginStart(false));

    let message = "Login failed";

    if (error.response?.data?.errors) {
      message = Object.values(error.response.data.errors).flat().join(" ");
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    dispatch(loginFailure({ message, status: error.response?.status }));
  }
};

export const userLogout = (navigate) => async (dispatch) => {
  try {
    dispatch(logout());
    const res = await api.post("/Auth/logout");
    if (res.status === 200) {
      navigate("/login");
      if (res?.data?.message) {
        toast.success(res?.data?.message);
      } else {
        toast.success("LOGOUT SUCCESSFULL");
      }
    }
  } catch (error) {
    let message = "Logout failed";

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    dispatch(loginFailure({ message }));
  }
};

export const resetPassword = (payload) => async (dispatch) => {
  try {
    dispatch(logout());
    const res = await api.post("/Auth/logout");

    if (res.status === 200) {
      navigate("/login");
      if (res?.data?.message) {
        toast.success(res?.data?.message);
      } else {
        toast.success("LOGOUT SUCCESSFULL");
      }
    }
  } catch (error) {
    let message = "Logout failed";

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    dispatch(loginFailure({ message }));
  }
};
export const { loginSuccess, logout, loginStart, loginFailure } =
  authSlice.actions;

export default authSlice.reducer;
