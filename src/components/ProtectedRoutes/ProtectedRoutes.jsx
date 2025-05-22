import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = () => {
  const isLoggedIn = window.sessionStorage.getItem("loggedIn") === "true";
  
  return isLoggedIn ? <Outlet /> : <Navigate to="/login"/>;
};

export default ProtectedRoutes;
