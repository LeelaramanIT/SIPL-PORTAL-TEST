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
import ExportInvoice from '../pages/TTS/Invoice/International/ExportInvoice'

// Define all routes in the router object
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "Masters/UserMaster/UserCreate", element: <UserCreate /> },
      { path: "Masters/UserMaster/ViewUsers", element: <ListUserMaster /> },
      { path: "Settings", element: <Settings /> },
      { path: "TTS/Invoice/Domestic/CustomerInvoice", element: <CustomerInvoice /> },
      { path: "TTS/Invoice/International/ExportInvoice", element: <ExportInvoice /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFoundPage /> },
]);
