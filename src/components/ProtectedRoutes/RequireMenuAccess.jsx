import { useSelector } from "react-redux";
import ProtectedPage from "../../pages/NotFound/protectedPage";
import { hasExactAccess, isAdminUser } from "../../utils/menuAccess";

// Route-level guard for URLs that are permission rows in the menu master but
// have no sidebar item of their own. Admin passes; everyone else needs the
// exact `permission` among their menu URLs.
const RequireMenuAccess = ({ permission, children }) => {
  const auth = useSelector((state) => state.auth);

  if (isAdminUser(auth)) return children;

  const permissions = (auth?.Menus || []).map((m) => m.menuUrl);
  if (!hasExactAccess(permissions, permission)) return <ProtectedPage />;

  return children;
};

export default RequireMenuAccess;
