import axios from "axios";

// Reuse your existing baseURL / interceptor setup if you already have an
// axios instance elsewhere (e.g. the one used in ExistingOrdersModal).
// This is written standalone so it can be dropped in and pointed at the
// same base URL.
const menuAccessApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

export const fetchAllMenus = async () => {
  const { data } = await menuAccessApi.get("/Menus");
  return data; // [{ id, menuName, menuUrl, isActive }]
};

export const fetchAllUsers = async () => {
  const { data } = await menuAccessApi.get("/CreateUser/getuserdetails");
  return data; // [{ id, name, userName, emailid, roleID, isActive }]
};

export const fetchUserMenus = async (userId) => {
  const { data } = await menuAccessApi.get(`/UserMenus/${userId}`);
  return data; // [{ menuId, menuName, menuUrl }]
};

export const saveUserMenus = async (userId, menuIds, updatedBy) => {
  const { data } = await menuAccessApi.put("/UserMenus", {
    userId,
    menuIds,
    updatedBy,
  });
  return data; // { success, message, grantedCount }
};

export default menuAccessApi;