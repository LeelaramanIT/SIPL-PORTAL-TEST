import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { routePermissions } from './routePermissions';
import toast from 'react-hot-toast';
import ProtectedPage from '../../pages/NotFound/protectedPage';

const ProtectedRoutes = () => {
  const isLoggedIn = useSelector((state) => state.auth.loggedIn);
  const roles = useSelector((state) => state.auth.roles);
  const menus = useSelector((state) => state.auth.menus);
  const location = useLocation();

  // 1. Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2. Allow access if user is Admin
  if (roles?.some(role => role.roleName !== 'Admin')) {
    return <Outlet />;
  }

  // 3. Get permission key from path
  const currentPath = location.pathname.replace(/^\/+|\/+$/g, ''); // clean leading/trailing slashes
  console.log(currentPath);
  

  // Permissions map: path → permissionKey
  const permissionKey = routePermissions[currentPath];
  console.log(permissionKey);
  
  
  const allowedMenuNames = menus.map(menu => menu.menuName);
  console.log(allowedMenuNames);
  
  
  if (permissionKey && !allowedMenuNames.includes(permissionKey)) {
    toast.error('Access denied. You do not have permission to view this page.');
    return <ProtectedPage />;
  }
  

  // 5. Default: allow access
  return <Outlet />;
};

export default ProtectedRoutes;
