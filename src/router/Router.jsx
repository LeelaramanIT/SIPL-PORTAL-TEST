import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home";
import MainLayout from "../layout/MainLayout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserCreate from "../pages/Masters/UserCreate";
import ListUserMaster from "../pages/Masters/ListUserMaster";
import Settings from "../pages/Settings/Settings";
import NotFoundPage from "../pages/NotFoundPage";

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
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFoundPage /> },
]);
