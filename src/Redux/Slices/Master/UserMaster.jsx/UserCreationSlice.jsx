// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../../utils/axios";
import toast from "react-hot-toast";
const initialState = {
  loading: false,
  users: [],
};

const UserMasterSlice = createSlice({
  name: "UserMaster",
  initialState,
  reducers: {
    setloading: (state, action) => {
      state.loading = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    toggleUserStatus: (state, action) => {
      const userId = action.payload;

      const user = state.users.find((u) => u.userId === userId);
      if (user) {
        user.isActive = !user.isActive; // ✅ toggle boolean
      }
    },
  },
});

export const userCreation = (payload) => async (dispatch) => {
  try {
    dispatch(setloading(true));

    const res = await api.post(`/CreateUser/createusers`, payload);

    dispatch(setloading(false));

    return res; // ✅ IMPORTANT: return response
  } catch (error) {
    dispatch(setloading(false));

    const message = error?.response?.data?.message || "Something went wrong";
    toast.error(message);

    return { status: error?.response?.status || 500 }; // ✅ return fallback
  }
};

export const getUserList = (payload) => async (dispatch) => {
  try {
    dispatch(setloading(true));
    const res = await api.get(`/CreateUser/getuserdetails`);
    if (res.status === 200) {
      dispatch(setUsers(res.data.data));
    }
    dispatch(setloading(false));
    return res; // ✅ IMPORTANT: return response
  } catch (error) {
    dispatch(setloading(false));
    const message = error?.response?.data?.message || "Something went wrong";
    toast.error(message);
    return { status: error?.response?.status || 500 }; // ✅ return fallback
  }
};

export const updateUserStatus = (payload) => async (dispatch) => {
  try {
    dispatch(setloading(true));

    const res = await api.post(`/CreateUser/update-user-status`, payload);

    if (res.status === 200) {
      // ✅ update local redux state after success
      dispatch(toggleUserStatus(payload.id));
    }

    dispatch(setloading(false));
    return res;
  } catch (error) {
    dispatch(setloading(false));

    const message = error?.response?.data?.message || "Status update failed";
    toast.error(message);

    return { status: error?.response?.status || 500 };
  }
};
export const resetPassword = (payload) => async (dispatch) => {
  try {
    dispatch(setloading(true));
    console.log(payload);
    

    const res = await api.post("/CreateUser/reset-password", {
      Username: payload.username, 
      newPassword: payload.newPassword,
    });

    if (res.status === 200) {
      return res;
    }

    dispatch(setloading(false));
    return res;
  } catch (error) {
    dispatch(setloading(false));
    console.log(error);
    return `${error?.response?.data?.message}`
  }
};

export const { setloading, setUsers, toggleUserStatus } =
  UserMasterSlice.actions;
export default UserMasterSlice.reducer;
