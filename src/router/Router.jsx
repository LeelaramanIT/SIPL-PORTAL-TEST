import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home";
import MainLayout from "../layout/MainLayout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserCreate from "../pages/Masters/UserCreate";
import ListUserMaster from "../pages/Masters/ListUserMaster";
import Settings from "../pages/Settings/Settings";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import CustomerInvoice from "../pages/TTS/Domostic/Invoice/CustomerInvoice";
import ExportInvoice from "../pages/TTS/International/Invoice/Export Invoice/ExportInvoicePage";
import InvoiceLayout from "../layout/InvoiceLayout";
import CustomInvoice from "../pages/TTS/Domostic/Invoice/CustomInvoice";
import MasterLayout from "../layout/MastarLayout";
import ExportInvoicePrepare from "../pages/TTS/International/Invoice/Export Invoice/ExportPrepare";
import ProtectedRoutes from "../components/ProtectedRoutes/ProtectedRoutes";
import ProtectedPage from "../pages/NotFound/protectedPage";
import ExportInvoiceBillPDF from "../pages/TTS/International/Invoice/Export Invoice/PDFViewer";
import ShippingSchemeSplitTailwind from "../pages/TTS/International/Invoice/Export Invoice/ShippingSchemeSplitTailwind";
import PagesLayout from "../layout/PagesLayout";
import Calendar from "../pages/Calendar/Calendar";


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
        { path: "Dashboard", element: <Dashboard /> },
        {
          path: "Masters",
          element: <MasterLayout />,
          children: [
            { path: "UserMaster/UserCreate", element: <UserCreate /> },
            { path: "UserMaster/ListUserMaster", element: <ListUserMaster /> }
          ]
        },
        {
          path: "TTS/Domestic",
          element: <InvoiceLayout />,
          children: [
            { path: "Invoice/Customer", element: <CustomerInvoice /> },
            { path: "Invoice/Custom", element: <CustomInvoice /> },
          ],
        },
        {
          path: "TTS/International",
          element: <InvoiceLayout />,
          children: [
            { path: "Invoice/CustomerInvoice", element: <ExportInvoice /> },
            { path: "Invoice/CustomInvoice", element: <ExportInvoice /> },
            { path: "Invoice/CustomerInvoice/Prepare", element: <ExportInvoicePrepare /> },
            { path: "Invoice/CustomInvoice/Prepare", element: <ExportInvoicePrepare /> },
            { path: "Invoice/Export/BillPDF", element: <ExportInvoiceBillPDF/> },
            { path: "Invoice/Export/ShippingSchemeSplit", element: <ShippingSchemeSplitTailwind/> }
          ],
        },
        {
          path:'Pages',
          element: <PagesLayout />,
          children: [
            { path:'Calender',element:<Calendar/>}
          ]
        },
        { path: "Settings", element: <Settings /> },
      ],
    },
  ],
},
{ path: "/login", element: <Login /> },
{ path: "*", element: <NotFoundPage /> },
{ path: "Protected", element: <ProtectedPage /> },
]);
