import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home";
import MainLayout from "../layout/MainLayout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserCreate from "../pages/Masters/UserCreate";
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
import Calendar from "../pages/Calendar/Calendar";
import ReportsLayout from "../layout/ReportsLayout";
import TTSReport from "../pages/Reports/TTSReports";
import RimLayout from "../layout/RimLayout";
import RimOverView from "../pages/TTS/Rim/RimOverView";
import RimWiseAndEDCWise from "../pages/TTS/Rim/RimAndEDCWiseData";
import RimStocks from "../pages/TTS/Rim/RimStocks";
import AllUSers from "../pages/Masters/AllUsers";
import SampleSplit from "../pages/TTS/International/Invoice/Export Invoice/SampleSplit";
import TaskLayout from "../layout/TaskLayout";
import TaskHomePage from "../pages/Task Managment/Home/TaskHomePage";
import MenuAccessManager from "../pages/MenuAccess/MenuAccessManager";
import SettingsLayout from "../layout/SettingsLayout";



export const router = createBrowserRouter([
  {
  path: "/",
  element: <ProtectedRoutes />, // This handles protection
  children: [
    {
      path: "/",
      element: <>
      <MainLayout />
      </>, // This renders layout
      children: [
        { index: true, element: <Home /> },
        { path: "Dashboard", element: <Dashboard /> },
        {
          path: "Masters",
          element: <MasterLayout />,
          children: [
            { path: "UserMaster/UserCreate", element: <UserCreate /> },
            { path: "/Masters/UserMaster/AllUsers", element: <AllUSers /> }
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
            { path: "Invoice/Export/ShippingSchemeSplit", element: <ShippingSchemeSplitTailwind/> },
            { path: "Invoice/Export/Sample", element: <SampleSplit/> }
          ],
        },
        {
          path:'TTS/Rim',
          element:<RimLayout />,
          children:[
            {
              path:'/TTS/Rim/RimOverView',element:<RimOverView/>,
            },
           {
            path:'DataWise',element:<RimWiseAndEDCWise/>
           } ,
           {
            path:'EDCNoWise',element:<RimWiseAndEDCWise/>
           },
           {
            path:'rimstock', index:true ,element:<RimStocks/>
           }
          ]
        },
        {
          path: '/Pages/Calendar', element:<Calendar/>
        },
        {
          path:'Reports',
          element: <ReportsLayout />,
          children: [
            { path:'TTSReports/Production',element:<TTSReport/> },
            { path:'TTSReports/Sale',element:<TTSReport/> },
            { path:'TTSReports',element:<TTSReport/> },
          ]
        },
        {
          path:'Task-Management',
          element:<TaskLayout />,
          children:[
            {path:'Home',element:<TaskHomePage/>}
          ]
        },
        { path: "Settings",
          element: <SettingsLayout />,
          children:[
            {index:true , element:<Settings/>},
            { path:'menuaccess', element:<MenuAccessManager/>}
          ]
         },
      ],
    },
  ],
},
{ path: "/login", element: <Login /> },
{ path: "*", element: <NotFoundPage /> },
{ path: "Protected", element: <ProtectedPage /> },
]);
