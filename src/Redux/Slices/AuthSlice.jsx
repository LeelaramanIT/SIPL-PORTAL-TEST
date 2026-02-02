import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/axios";
import { toast } from "react-hot-toast";

const initialState = {
  token: localStorage.getItem("authToken") || null,
  username: JSON.parse(localStorage.getItem("user"))?.username || null,
  roles: JSON.parse(localStorage.getItem("user"))?.roles || "",
  menus: JSON.parse(localStorage.getItem("user"))?.menus || [],
  loggedIn: !!localStorage.getItem("authToken"),
  loading: false,
  error: null,
  Department: JSON.parse(localStorage.getItem("user"))?.Department || "",
  RoleID: JSON.parse(localStorage.getItem("user"))?.RoleID || "",
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

      const { Token, username, roles, Menus, RoleID, Department } =
      action.payload;
      state.token = Token;
      state.username = username;
      state.roles = roles;
      state.menus = Menus;
      state.Department = Department;
      state.RoleID = RoleID;
      state.loggedIn = true;
      state.loading = false;
      localStorage.setItem("authToken", Token);
      const userObj = {
        username,
        roles,
        menus: Menus, // Ensure this matches the casing in initialState
        Department,
        RoleID,
      };
      localStorage.setItem("user", JSON.stringify(userObj));
    },

    logout: (state) => {
      state.token = null;
      state.username = null;
      state.roles = [];
      state.menus = [];
      state.loggedIn = false;
      state.Department = "";
      state.RoleID = "";
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
        toast.success("LOGOUT SUCCESSFULL")
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
