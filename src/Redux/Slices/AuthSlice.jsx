import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/axios";
import { toast } from "react-hot-toast";

const initialState = {
  token: null,
  username: null,
  roles: 'Admin',
  menus: [],
  loggedIn: true,
  loading: false,
  error: null,
  roleID: 1,
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
      const { Token, username, roles, Menus,RoleID , Department } = action.payload;

      state.token = Token;
      state.username = username;
      state.roles = roles;
      state.menus = Menus;
      state.loggedIn = true;
      state.loading = false;


      // toast.success("Login Successfull");
    },
    logout: (state) => {
      (state.token = null),
        (state.username = null),
        (state.roles = []),
        (state.menus = []),
        (state.loggedIn = false);
        window.localStorage.clear()
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
    const res = await api.post("/Auth/logins", credentials, { withCredentials: true });
    if (res.status === 200) {
      const data = res.data;
      dispatch(loginSuccess(data));
    }
  } catch (error) {
    
    const errorMessage =
      error.response?.data || error.message || "Login faild";
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
      error.response?.data || error.message || "Logout faild";
    dispatch(loginFailure(errorMessage));
  }
};

export const { loginSuccess, logout, loginStart, loginFailure } =
  authSlice.actions;

export default authSlice.reducer;
