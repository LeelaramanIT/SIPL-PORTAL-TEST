// src/store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../../utils/axios";
import toast from "react-hot-toast";
const initialState = {
  loading: false,
  users: [],
  userMasterData: [],
  menuAccessUsers: [],
  menuAccessAllMenus: [],
  menuAccessUserPermissions: [],
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
    setUserMasterData: (state, action) => {
      state.userMasterData = action.payload;
    },
    setMenuAccessUsers: (state, action) => {
      state.menuAccessUsers = action.payload;
    },
    setMenuAccessAllMenus: (state, action) => {
      state.menuAccessAllMenus = action.payload;
    },
    setMenuAccessUserPermissions: (state, action) => {
      state.menuAccessUserPermissions = action.payload;
    },
  },
});

export const getUserMasterData = () => async (dispatch) => {
  try {
    dispatch(setloading(true));
    const res = await api.get(`/Master/GetAllMasterData`);
    if (res.status === 200) {
      dispatch(setUserMasterData(res.data.data));
    }
    dispatch(setloading(false));
    return res;
  } catch (error) {
    dispatch(setloading(false));
    const message = error?.response?.data?.message || "Something went wrong";
    toast.error(message);
    return { status: error?.response?.status || 500 };
  }
};

export const userCreation = (payload) => async (dispatch) => {
  try {
    dispatch(setloading(true));

    const res = await api.post(`/CreateUser/createusers`, payload);

    dispatch(setloading(false));

    return res; // ✅ IMPORTANT: return response
  } catch (error) {
    dispatch(setloading(false));

    const message = error?.response?.data?.message || "Something went wrong";
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
    return `${error?.response?.data?.message}`;
  }
};

// ============================================================================
// Master data creation thunks
// Each follows the same pattern as userCreation: dispatch loading, call the
// endpoint, return the raw response so the caller can check res.status,
// and refetch GetAllMasterData afterwards so dropdowns/lists stay in sync.
// ============================================================================

export const createDepartment = (payload) => async (dispatch) => {
  try {
    dispatch(setloading(true));
    const res = await api.post(`/Master/DepartmentMaster`, payload);
    dispatch(setloading(false));
    return res;
  } catch (error) {
    dispatch(setloading(false));
    const message = error?.response?.data?.message || "Something went wrong";
    toast.error(message);
    return { status: error?.response?.status || 500 };
  }
};

export const createDesignation = (payload) => async (dispatch) => {
  try {
    dispatch(setloading(true));
    const res = await api.post(`/Master/createDESIGINATIONMaster`, payload);
    dispatch(setloading(false));
    return res;
  } catch (error) {
    dispatch(setloading(false));
    const message = error?.response?.data?.message || "Something went wrong";
    toast.error(message);
    return { status: error?.response?.status || 500 };
  }
};

export const createDivision = (payload) => async (dispatch) => {
  try {
    dispatch(setloading(true));
    const res = await api.post(`/Master/createDivisionMaster`, payload);
    dispatch(setloading(false));
    return res;
  } catch (error) {
    dispatch(setloading(false));
    const message = error?.response?.data?.message || "Something went wrong";
    toast.error(message);
    return { status: error?.response?.status || 500 };
  }
};

export const createLocation = (payload) => async (dispatch) => {
  try {
    dispatch(setloading(true));
    const res = await api.post(`/Master/createLocationMaster`, payload);
    dispatch(setloading(false));
    return res;
  } catch (error) {
    dispatch(setloading(false));
    const message = error?.response?.data?.message || "Something went wrong";
    toast.error(message);
    return { status: error?.response?.status || 500 };
  }
};

export const createRole = (payload) => async (dispatch) => {
  try {
    dispatch(setloading(true));
    const res = await api.post(`/Master/createRole`, payload);
    dispatch(setloading(false));
    return res;
  } catch (error) {
    dispatch(setloading(false));
    const message = error?.response?.data?.message || "Something went wrong";
    toast.error(message);
    return { status: error?.response?.status || 500 };
  }
};

export const createMenu = (payload) => async (dispatch) => {
  try {
    dispatch(setloading(true));
    const res = await api.post(`/Master/createMenu`, payload);
    dispatch(setloading(false));
    return res;
  } catch (error) {
    dispatch(setloading(false));
    const message = error?.response?.data?.message || "Something went wrong";
    toast.error(message);
    return { status: error?.response?.status || 500 };
  }
};

// ============================================================================
// Menu Access thunks
// Moved from src/pages/MenuAccess/Menuaccessapi.js. Kept error-unhandled
// (like the original plain-axios versions) so MenuAccessManager1's own
// try/catch/finally around each call keeps working unchanged.
// ============================================================================

export const fetchAllMenus = () => async (dispatch) => {
  const { data } = await api.get("/MenuAccess/menus");
  const list = data?.data; // [{ id, menuName, menuUrl, isActive }]
  dispatch(setMenuAccessAllMenus(list));
  return list;
};

export const fetchAllUsers = () => async (dispatch) => {
  const { data } = await api.get("/MenuAccess/menuaccessusers");
  const list = data?.data; // [{ id, name, userName, emailid, roleID, isActive }]
  dispatch(setMenuAccessUsers(list));
  return list;
};

export const fetchUserMenus = (userId) => async (dispatch) => {
  const { data } = await api.get(`/MenuAccess/${userId}`);
  const list = data?.data || []; // [{ menuId, menuName, menuUrl }]
  dispatch(setMenuAccessUserPermissions(list.map((m) => m.menuId)));
  return list;
};

export const saveUserMenus = (userId, menuIds, updatedBy) => async () => {
  const { data } = await api.post("/MenuAccess/usermenus", {
    userId,
    menuIds,
    updatedBy,
  });
  return data; // { success, message, grantedCount }
};

export const {
  setloading,
  setUsers,
  toggleUserStatus,
  setUserMasterData,
  setMenuAccessUsers,
  setMenuAccessAllMenus,
  setMenuAccessUserPermissions,
} = UserMasterSlice.actions;
export default UserMasterSlice.reducer;