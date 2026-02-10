import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { routePermissions } from "./routePermissions";
import toast from "react-hot-toast";
import ProtectedPage from "../../pages/NotFound/protectedPage";
import { useEffect } from "react";
import { api } from "../../utils/axios";

const ProtectedRoutes = () => {
  const isLoggedIn = useSelector((state) => state.auth?.loggedIn);
  const roles = useSelector((state) => state.auth?.roles);
  const menus = useSelector((state) => state.auth?.menus || []);
  const roleID = useSelector((state) => state.auth?.RoleID);
  const location = useLocation();


//  useEffect(() => {
//   const refreshSession = async () =>{
//     try {
//       if (!isLoggedIn) <Navigate to="/login" replace />;
//       // console.log("Refreshing token...");
//       // const res = await api.get("auth/verify-token")
//       // console.log(res);
      
//       // if (!res.status === 401) {
//       //   throw new Error("Refresh failed");
//       // }
//       console.log("Token refreshed successfully");
//     } catch (error) {
//       console.error("Silent refresh failed:", error);
//     }
//   }
//   // const intervalId = setInterval(refreshSession,  5 * 1000);
//   refreshSession();
//   // return () => clearInterval(intervalId);
// },[isLoggedIn] )

  // 1️⃣ Not logged in → redirect
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // 2️⃣ Admin → full access
  const isAdmin = (roles === "admin" || roles === "Admin") && roleID === 1;
  if (isAdmin) return <Outlet />;

  // 3️⃣ Clean current path
  const currentPath = location.pathname.replace(/\/+$/, "");
  // console.log("Current Path:", currentPath);

  // 4️⃣ Exact match with routePermissions
  const requiredMenuName = routePermissions[currentPath];
  

  // 5️⃣ If URL not present in permission list → no restriction
  if (!requiredMenuName) {
    return <Outlet />;
  }

  console.log("Required Permission:", requiredMenuName);

  // 6️⃣ Validate backend menus
  const hasPermission = menus.some(
    (item) => item.MenuName?.toLowerCase() === requiredMenuName.toLowerCase()
  );

  if (!hasPermission) {
    toast.error("Access denied. You are not authorized to view this page.");
    return <ProtectedPage />;
  }

  // 7️⃣ Allow authorized user
  return <Outlet />;
};

export default ProtectedRoutes;
