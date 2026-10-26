import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProtectedPage from "../../NotFound/protectedPage";
import { getAllowedModes } from "./barcodeModes";

// Bare /barcode-print URL: send the user to the first mode they can access.
const BarcodePrintIndex = () => {
  const auth = useSelector((state) => state.auth);
  const [first] = getAllowedModes(auth);

  if (!first) return <ProtectedPage />;
  return <Navigate to={first.path} replace />;
};

export default BarcodePrintIndex;
