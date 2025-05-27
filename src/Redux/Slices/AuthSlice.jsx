import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/axios";
import { toast } from "react-hot-toast";


const initialState = {
  token: sessionStorage.getItem("token") || null,
  username: sessionStorage.getItem("username") || null,
  roles: JSON.parse(sessionStorage.getItem("roles") || "[]"),
  menus: JSON.parse(sessionStorage.getItem("menus") || "[]"),
  loggedIn: sessionStorage.getItem("loggedIn") === "true",
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { token, username, roles, menus } = action.payload;

      state.token = token;
      state.username = username;
      state.roles = roles;
      state.menus = menus;
      state.loggedIn = true;
      state.loading = false;

      // sessionStorage.setItem("token", token);
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("roles", JSON.stringify(roles));
      sessionStorage.setItem("menus", JSON.stringify(menus));
      sessionStorage.setItem("loggedIn", "true");

      // toast.success("Login Successfull");
    },
    logout: (state) => {
      (state.token = null),
        (state.username = null),
        (state.roles = []),
        (state.menus = []),
        (state.loggedIn = false);
      sessionStorage.clear();
    },

    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const userLogin = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const res = await api.post("/Auth/login", credentials, { withCredentials: true });
    if (res.status === 200) {
      const data = res.data;
      dispatch(loginSuccess(data));
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Login faild";
    dispatch(loginFailure(errorMessage));
  }
};

export const userLogout = (navigate) => async (dispatch) => {
  try {
    dispatch(logout());
    const res = await api.get("/Auth/logout", { withCredentials: true });
    if (res.status === 200) {
      navigate('/login')
      toast.success(res.data.message);
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Login faild";
    dispatch(loginFailure(errorMessage));
  }
};

export const { loginSuccess, logout, loginStart, loginFailure } =
  authSlice.actions;

export default authSlice.reducer;
