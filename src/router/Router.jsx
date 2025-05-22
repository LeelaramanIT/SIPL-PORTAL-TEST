import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home";
import MainLayout from "../layout/MainLayout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserCreate from "../pages/Masters/UserCreate";
import ListUserMaster from "../pages/Masters/ListUserMaster";
import Settings from "../pages/Settings/Settings";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import CustomerInvoice from "../pages/TTS/Invoice/Domostic/CustomerInvoice";
import ExportInvoice from "../pages/TTS/Invoice/International/Export Invoice/ExportInvoicePage";
import InvoiceLayout from "../layout/InvoiceLayout";
import CustomInvoice from "../pages/TTS/Invoice/Domostic/CustomInvoice";
import MasterLayout from "../layout/MastarLayout";
import ExportInvoicePrepare from "../pages/TTS/Invoice/International/Export Invoice/ExportPrepare";
import ProtectedRoutes from "../components/ProtectedRoutes/ProtectedRoutes";

export const router = createBrowserRouter([
  {
  path: "/",
  element: <ProtectedRoutes />, // This handles protection
  children: [
    {
      path: "/",
      element: <MainLayout />, // This renders layout
      children: [
        { index: true, element: <Home /> },
        { path: "dashboard", element: <Dashboard /> },
        {
          path: "Masters",
          element: <MasterLayout />,
          children: [
            { path: "UserMaster/UserCreate", element: <UserCreate /> },
            { path: "UserMaster/ListUserMaster", element: <ListUserMaster /> }
          ]
        },
        {
          path: "TTS/Invoice",
          element: <InvoiceLayout />,
          children: [
            { path: "Domestic/Customer", element: <CustomerInvoice /> },
            { path: "Domestic/Custom", element: <CustomInvoice /> },
            { path: "International/Export", element: <ExportInvoice /> },
            { path: "International/Export/Prepare", element: <ExportInvoicePrepare /> },
          ],
        },
        { path: "Settings", element: <Settings /> },
      ],
    },
  ],
},
{ path: "/login", element: <Login /> },
{ path: "*", element: <NotFoundPage /> },
]);
