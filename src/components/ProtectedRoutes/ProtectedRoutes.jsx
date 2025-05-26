import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { routePermissions } from './routePermissions';
import toast from 'react-hot-toast';
import ProtectedPage from '../../pages/NotFound/protectedPage';

const ProtectedRoutes = () => {
  const isLoggedIn = useSelector((state)=> state.auth.loggedIn)
  const roles = useSelector((state)=> state.auth.roles)
  const menus = useSelector((state)=> state.auth.menus)
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace={true} />
  }

  const currentPath = location.pathname.replace(/^\/+/, '')
  
  const permissionKey = routePermissions[currentPath];

  // if(permissionKey && !menus.includes(permissionKey)){
  //   toast.error('Access denied. Authentication required.');
  //   return <ProtectedPage />
  // }
  return <Outlet />  
};

export default ProtectedRoutes;
