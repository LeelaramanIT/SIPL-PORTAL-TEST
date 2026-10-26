import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "../pages/Home/Home";
import MainLayout from "../layout/MainLayout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserCreate from "../pages/Masters/UserMaster/UserCreate";
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
import RimLayout from "../layout/RimLayout";
import RimOverView from "../pages/TTS/Rim/TyreStockTransfer";
import RimWiseAndEDCWise from "../pages/TTS/Rim/RimAndEDCWiseData";
import RimStocks from "../pages/TTS/Rim/RimStocks";
import AllUSers from "../pages/Masters/UserMaster/AllUsers";
import SampleSplit from "../pages/TTS/International/Invoice/Export Invoice/SampleSplit";
import TaskLayout from "../layout/TaskLayout";
import TaskHomePage from "../pages/Task Managment/Home/TaskHomePage";
import MenuAccessManager from "../pages/MenuAccess/MenuAccessManager";
import SettingsLayout from "../layout/SettingsLayout";
import PriceMaster from "../pages/Masters/PriceMaster/PriceMaster";
import InvoicePDF from "../pages/TTS/International/Invoice/Export Invoice/Customer Invoice/CustomerPDFViewer";
import ExportCustInvoicePrepare from "../pages/TTS/International/Invoice/Export Invoice/Customer Invoice/ExportCustPrepare";
import PDIMaster from "../pages/TTS/Domostic/Dispatch/PDI/PDIMaster";
// import ScanForInspectionDetails from "../pages/TTS/Domostic/Dispatch/PDI/ScanForInspection/ScanForInspectionDetails";
import PPCMaster from "../pages/TTS/Domostic/Dispatch/PDC/PPCMaster";
import SubstitutionDetails from "../pages/TTS/Domostic/Dispatch/PDC/Substitution/SubstitutionDetails";
import ScanForInspectionDetails from "../pages/TTS/Domostic/Dispatch/PDI/ScanForInspection/ScanForInspectionDetails";
import ItemIDMaster from "../pages/Masters/Item ID Master/ItemIDMaster";
import AssemblyProcessIDCreation from "../pages/Masters/Item ID Master/Assembly ProcessID/AssemblyProcessIDCreation";
import TyreProcessIDCreation from "../pages/Masters/Item ID Master/Tyre ProcessID/TyreProcessIDCreation";
import RIMProcessIDCreation from "../pages/Masters/Item ID Master/RIM ProcessID/RIMProcessIDCreation";
import CustomerLabelling from "../pages/Masters/Item ID Master/Customer Label Mapping/CustomerLabelling";
import PDIScanForInspection from "../pages/TTS/Domostic/Dispatch/PDI/ScanForInspection/PDIScanForInspection";
import InspectionInComplete from "../pages/TTS/Domostic/Dispatch/PDI/Inspection In Complete/InspecttionInComplete";
import LoadingCheck from "../pages/TTS/Domostic/Dispatch/PDI/Loading Check/LoadingCheck";
import BarcodeDelete from "../pages/TTS/Domostic/Dispatch/PDI/Barcode Delete/BarcodeDelete";
import ApprovalForLoading from "../pages/TTS/Domostic/Dispatch/PDI/Approval For Loading/ApprovalForLoading";
import FinalInspectionReport from "../pages/TTS/Domostic/Dispatch/PDI/Final Inspection Report/FinalInspectionReport";
import ProformaPDFViewer from "../pages/TTS/International/Invoice/Export Invoice/Proforma Invoice/ProformaPDFViewer";
import ProformaList from "../pages/TTS/International/Invoice/Export Invoice/Proforma Invoice/ProformaList";
import Barcode from "../pages/Dashboard/Barcode";
import TyreAndRimFitment from "../pages/TTS/Domostic/Dispatch/Tyre And Rim Fitment/TyreAndRimFitment";
import FitmentList from "../pages/TTS/Domostic/Dispatch/Tyre And Rim Fitment/FitmentList";
import FitmentMaster from "../pages/TTS/Domostic/Dispatch/Tyre And Rim Fitment/FitmentMaster";
import ProformaPrepare from "../pages/TTS/International/Invoice/Export Invoice/Proforma Invoice/ProformaPrepare";
import TaskDashboard from "../pages/Task Managment/Dashboard/TaskDashboard";
import Projects from "../pages/Task Managment/Projects/Projects";
import Sprints from "../pages/Task Managment/Sprints/Sprints";
import Tasks from "../pages/Task Managment/Tasks/Tasks";
import DailyLog from "../pages/Task Managment/DailyLog/DailyLog";
import Team from "../pages/Task Managment/Team/Team";
import Reports from "../pages/Task Managment/Reports/Reports";
import Masters from "../pages/Task Managment/Masters/Masters";
import PIMaster from "../pages/TTS/International/Invoice/Export Invoice/Proforma Invoice/PIMaster";
import ApprovalForInspection from "../pages/TTS/Domostic/Dispatch/PDI/ApprovalForInspection/ApprovalForInspection";
import TTSPowerBIReports from "../pages/Reports/TTSPowerBIReports";
import SaleRepostMaster from "../pages/Reports/SaleReports/SaleRepostMaster";
import CPMMaster from "../pages/Customer Product Mapping/CPMMaster";
import TyreBarcodeGenerator from "../pages/Customer Product Mapping/BarcodePrint/BarcodePrint";
import BarcodePrintIndex from "../pages/Customer Product Mapping/BarcodePrint/BarcodePrintIndex";
import RequireMenuAccess from "../components/ProtectedRoutes/RequireMenuAccess";
import { BARCODE_MODES } from "../pages/Customer Product Mapping/BarcodePrint/barcodeModes";
import TyreSalesDashboard from "../pages/Reports/SaleReports/SaleReports";
import UserCreation from "../pages/MenuAccess/UserMaster/UserCreation";
import ProductionDashboard from "../pages/Reports/ProductionReports/Production";
import UserList from "../pages/MenuAccess/UserMaster/UserList";
import UserMasterLayout from "../layout/UserMasterLayout";
import MasterReportGenerationPage from "../pages/Reports/SP_Reports/MasterReportGenerationPage";
import TyreStockTransfer from "../pages/TTS/Rim/TyreStockTransfer";
import PendingTransferPage from "../pages/TTS/Rim/PendingTransferPage";
import TyreStockReceiveRedesign from "../pages/TTS/Rim/TyreStockReceiveRedesign";
import DCPreparationApproval from "../pages/TTS/Rim/DCPreparationApproval";
import OrderCopy from "../pages/TTS/International/OrderProcess/OrderEntry/SaleOrderEntry";
import MasterManagement from "../pages/Masters/MasterManagement/MasterCreationHome";
import MasterCreationLayout from "../layout/MasterCreationLayout";
import SaleReportRedirect from "../pages/Reports/SaleReports/SaleReportRedirect";
import LegalEntityMaster from "../pages/Masters/MasterManagement/LegalEntityMaster";
import MasterCreationHome from "../pages/Masters/MasterManagement/MasterCreationHome";
import MenuAccessManager1 from "../pages/MenuAccess/MenuAccessManager1.JSX";
import ReportMasterManagement from "../pages/Masters/MasterManagement/Reportmastermanagement";
import CustomerMasterPage from "../pages/Masters/Customer Master/Customermasterpage";
import CustomerHubHome from "../pages/Masters/Customer Master/CustomerMasterHome";
import CustomerModule from "../pages/Masters/Customer Master/Customermodule";
import CustomerModule1 from "../pages/Masters/Customer Master/CustomerModule1";
import CustomerModule2 from "../pages/Masters/Customer Master/CustomerrModule2";
import CRMReports from "../pages/Reports/CRMReports/CRMReports";
import PlannerWorkspace from "../pages/Dashboard/Plannerworkspace";
import WorkOrderPlanning from "../pages/TTS/International/OrderProcess/PlantAssign/PlantAssign";
import ManufacturingPlanningRevision from "../pages/TTS/International/OrderProcess/Manufacturingplanningrevision/Manufacturingplanningrevision";
import ProcessIdModification from "../pages/Dashboard/Processidmodification";
import UserMasterManagement from "../pages/MenuAccess/UserMaster/UserMasterManagement";
import CustomerProcessIDMapping from "../pages/Masters/Customer Master/CustomerProcessIDMapping/CustomerProcessIDMapping";
import MyProfilePage from "../pages/Settings/UserProfile/UserProfile";
import ProductionOrderTracking from "../pages/Reports/ProductionReports/ProductionReportTracking/ProductionOrderTracking";
import SerialLogs from "../pages/ErrorLog/Seriallogs";
import CustomerProcessIDMappingFunctionDoc from "../pages/Masters/Customer Master/CustomerProcessIDMapping/data/Customerprocessidmappingfunctiondoc ";
// import CustomerProcessID from "../pages/Masters/Item ID Master/Customer ProcessID/CustomerProcessID";
// import WorkOrderPlanning from "../pages/Dashboard/PlantAssign";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes />, // This handles protection
    children: [
      {
        path: "/",
        element: (
          <>
            <MainLayout />
          </>
        ), // This renders layout
        children: [
          { index: true, element: <Home /> },
          { path: "Dashboard", element: <Dashboard /> },
          // { path: "Barcode", element: <Barcode /> },
          { path: "Barcode", element: <ProcessIdModification /> },
          // { path: "Barcode", element: <PlannerWorkspace /> },
          // { path: "Barcode", element: <ManufacturingPlanningRevision /> },
          {
            path: "Masters",
            element: <MasterLayout />,
            children: [
              { path: "UserMaster/UserCreate", element: <UserCreate /> },
              { path: "/Masters/UserMaster/AllUsers", element: <AllUSers /> },
              { path: "/Masters/PriceMaster", element: <PriceMaster /> },
              { path: "/Masters/CustomerMaster", element: <MasterCreationLayout type={'CustomerMaster'} />,
                children: [
                  { index: true, element: <CustomerHubHome /> },
                  { path:'customer-home', element: <CustomerHubHome /> },
                  { path: "Creation" ,element: <CustomerModule /> },
                  { path: "Creation1" ,element: <CustomerModule1 /> },
                  { path: "Creation2" ,element: <CustomerModule2 /> },
                  { path: "ProcessIDMapping" ,element: <CustomerProcessIDMapping /> },
                  { path: "FunctionalDocumentation" ,element: <CustomerProcessIDMappingFunctionDoc /> },

                ],
               },
    
              {
                path: "/Masters/Master-creation",
                element: <MasterCreationLayout type={"MasterCreation"}/>,
                children: [
                  { index: true, element: <MasterCreationHome /> },
                  { path:'legal-entity', element: <LegalEntityMaster /> },
                  { path:'reports-master', element: <ReportMasterManagement /> },
                ],
              },
              {
                path: "ItemIDMaster",
                element: <ItemIDMaster />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="AssemblyProcessIDCreation" />,
                  },
                  {
                    path: "AssemblyProcessIDCreation",
                    element: <AssemblyProcessIDCreation />,
                  },
                  {
                    path: "TyreProcessIDCreation",
                    element: <TyreProcessIDCreation />,
                  },
                  {
                    path: "RIMProcessIDCreation",
                    element: <RIMProcessIDCreation />,
                  },
                  {
                    path: "CustomerProcessIDCreation",
                    // element: <CustomerProcessID />,
                    element: <CustomerProcessIDMapping />,

                  },
                  {
                    path: "CustomerLabelling",
                    element: <CustomerLabelling />,
                  },
                ],
              },
              // {
              //   path: "UserMaster",
              //   element: <ItemIDMaster />,
              //   children: [
              //     {
              //       index: true,
              //       element: <Navigate to="AssemblyProcessIDCreation" />,
              //     },
              //     {
              //       path: "AssemblyProcessIDCreation",
              //       element: <AssemblyProcessIDCreation />,
              //     },
              //     {
              //       path: "TyreProcessIDCreation",
              //       element: <TyreProcessIDCreation />,
              //     },
              //     {
              //       path: "RIMProcessIDCreation",
              //       element: <RIMProcessIDCreation />,
              //     },
              //     {
              //       path: "CustomerProcessIDCreation",
              //       element: <RIMProcessIDCreation />,
              //     },
              //   ],
              // },
              // {
              //   path: "UserMaster",
              //   element: <ItemIDMaster />,
              //   children: [
              //     {
              //       index: true,
              //       element: <Navigate to="AssemblyProcessIDCreation" />,
              //     },
              //     {
              //       path: "AssemblyProcessIDCreation",
              //       element: <AssemblyProcessIDCreation />,
              //     },
              //     {
              //       path: "TyreProcessIDCreation",
              //       element: <TyreProcessIDCreation />,
              //     },
              //     {
              //       path: "RIMProcessIDCreation",
              //       element: <RIMProcessIDCreation />,
              //     },
              //     {
              //       path: "CustomerProcessIDCreation",
              //       element: <RIMProcessIDCreation />,
              //     },
              //   ],
              // },
            ],
          },
          {
            path: "TTS/Domestic",
            element: <InvoiceLayout />,
            children: [
              { path: "Invoice/Customer", element: <CustomerInvoice /> },
              { path: "Invoice/Custom", element: <CustomInvoice /> },
              {
                path: "Dispatch/PDI/Inspection/:plant/:custType",
                element: <PDIMaster />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="ScanForInspection" />,
                  },
                  {
                    path: "ScanForInspection",
                    element: <PDIScanForInspection />,
                  },
                  {
                    path: "InspectionInComplete",
                    element: <InspectionInComplete />,
                  },
                  {
                    path: "LoadingCheck",
                    element: <LoadingCheck />,
                  },
                  {
                    path: "BarcodeDelete",
                    element: <BarcodeDelete />,
                  },
                  {
                    path: "ApprovalForLoading",
                    element: <ApprovalForLoading />,
                  },
                  {
                    path: "FinalInspectionReport",
                    element: <FinalInspectionReport />,
                  },
                  {
                    path: "ApprovalForInspection",
                    element: <FinalInspectionReport />,
                  },
                ],
              },
              {
                path: "Dispatch/PDI/Inspection/ScanForInspection/Details",
                element: <ScanForInspectionDetails />,
              },
              {
                path: "Dispatch/PPC/Substitution/:plant/:custType",
                element: <PPCMaster />,
              },
              {
                path: "Dispatch/PPC/Substitution/Details",
                element: <SubstitutionDetails />,
              },
              {
                path: "Dispatch/PDI/RimAndTyreFitment/:plant/:custType",
                element: <FitmentMaster />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="List" replace />,
                  },
                  {
                    path: "List",
                    element: <FitmentList />,
                  },
                ],
              },
              {
                path: "Dispatch/PDI/RimAndTyreFitment/:plant/:custType/Details",
                element: <TyreAndRimFitment />,
              },
            ],
          },
          {
            path: "TTS/International",
            element: <InvoiceLayout />,
            children: [
              // Order Process
              { path: "OrderProcess/OrderEntry", element: <OrderCopy /> },
              { path: "OrderProcess/OrderFulfillment", element: <WorkOrderPlanning /> },
              // { path: "OrderProcesscopy", element: <OrderEntryCopy /> },
              // { path: "OrderProcess1", element: <SalesOrderPage /> },
              // invoice
              { path: "Invoice/CustomerInvoice", element: <ExportInvoice /> },
              { path: "Invoice/CustomInvoice", element: <ExportInvoice /> },
              {
                path: "Invoice/CustomerInvoice/Prepare",
                element: <ExportCustInvoicePrepare />,
              },
              {
                path: "Invoice/CustomInvoice/Prepare",
                element: <ExportInvoicePrepare />,
              },
              {
                path: "Invoice/Export/BillPDF",
                element: <ExportInvoiceBillPDF />,
              },
              { path: "Invoice/Customer/BillPDF", element: <InvoicePDF /> },
              {
                path: "Invoice/Export/ShippingSchemeSplit",
                element: <ShippingSchemeSplitTailwind />,
              },
              { path: "Invoice/Export/Sample", element: <SampleSplit /> },
              {
                path: "ProformaInvoice/List",
                element: <PIMaster />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="PI" replace />,
                  },
                  {
                    path: ":invoiceType",
                    element: <ProformaList />,
                  },
                  // {
                  //   path:'Draft',
                  //   element:<ProformaList/>
                  // }
                ],
              },
              {
                path: "Invoice/ProformaInvoice/PDF",
                element: <ProformaPDFViewer />,
              },
              { path: "ProformaInvoice/Prepare", element: <ProformaPrepare /> },
              {
                path: "Invoice/ProformaInvoice/Draft/Prepare",
                element: <ProformaPrepare />,
              },
              {
                path: "Dispatch/PDI/Inspection/:plant/:custType",
                element: <PDIMaster />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="ScanForInspection" replace />,
                  },
                  {
                    path: "ScanForInspection",
                    element: <PDIScanForInspection />,
                  },
                  {
                    path: "InspectionInComplete",
                    element: <InspectionInComplete />,
                  },
                  {
                    path: "LoadingCheck",
                    element: <LoadingCheck />,
                  },
                  {
                    path: "BarcodeDelete",
                    element: <BarcodeDelete />,
                  },
                  {
                    path: "ApprovalForLoading",
                    element: <ApprovalForLoading />,
                  },
                  {
                    path: "FinalInspectionReport",
                    element: <FinalInspectionReport />,
                  },
                  {
                    path: "ApprovalForInspection",
                    element: <ApprovalForInspection />,
                  },
                ],
              },
              {
                path: "Dispatch/PDI/Inspection/ScanForInspection/Details",
                element: <ScanForInspectionDetails />,
              },
              {
                path: "Dispatch/PPC/Substitution/:plant/:custType",
                element: <PPCMaster />,
              },
              {
                path: "Dispatch/PPC/Substitution/Details",
                element: <SubstitutionDetails />,
              },
              {
                path: "Dispatch/PDI/RimAndTyreFitment/:plant/:custType",
                element: <FitmentMaster />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="List" replace />,
                  },
                  {
                    path: "List",
                    element: <FitmentList />,
                  },
                ],
              },
              {
                path: "Dispatch/PDI/RimAndTyreFitment/:plant/:custType/Details",
                element: <TyreAndRimFitment />,
              },
            ],
          },
          {
            path: "TTS/Warehouse",
            element: <RimLayout />,
            children: [
              {
                index: true, // ✅ default route
                element: <Navigate to="PendingTransfer" />, // 👈 choose your default page
              },
              {
                path: "/TTS/Warehouse/PendingTransfer",
                element: <PendingTransferPage />,
              },
              {
                path: "/TTS/Warehouse/factory",
                element: <TyreStockTransfer />,
              },
              {
                path: "/TTS/Warehouse/warehouse",
                element: <TyreStockReceiveRedesign />,
              },
              {
                path: "/TTS/Warehouse/DCPreparationApproval",
                element: <DCPreparationApproval />,
              },
              {
                path: "EDCNoWise",
                element: <RimWiseAndEDCWise />,
              },
              {
                path: "rimstock",
                index: true,
                element: <RimStocks />,
              },
            ],
          },
          {
            path: "/Pages/Calendar",
            element: <Calendar />,
          },
          {
            path: "Reports",
            element: <ReportsLayout />,
            children: [
              { path: "TTSReports/Production", element: <TTSPowerBIReports /> },
              {
                path: "TTSReports/Sale",
                element: <SaleRepostMaster />,
                children: [
                  {
                    index: true,
                    element: <SaleReportRedirect />,
                  },
                  { path: "PowerBIReport", element: <TTSPowerBIReports /> },
                  { path: "SaleRepost", element: <TyreSalesDashboard /> },
                  // {
                  //   path: "ProductionRepost",
                  //   element: <ProductionDashboard />,
                  // },
                  {
                    path: "ProductionRepost",
                    element: <ProductionOrderTracking />,
                  },
                  {
                    path: "DomesticsReport",
                    element: <CRMReports />,
                  },
                  {
                    path: "MasterReportGeneration",
                    element: <MasterReportGenerationPage />,
                  },
                ],
              },
            ],
          },
          // {
          //   path: "Task-Management",
          //   element: <TaskLayout />,
          //   children: [
          //     { path: "Home", element: <TaskHomePage /> },
          //     { path: "Dashboard", element: <TaskDashboard /> },
          //     { path: "Projects", element: <Projects /> },
          //     { path: "Sprints", element: <Sprints /> },
          //     { path: "Tasks", element: <Tasks /> },
          //     { path: "DailyLog", element: <DailyLog /> },
          //     { path: "Team", element: <Team /> },
          //     { path: "Reports", element: <Reports /> },
          //     { path: "Masters", element: <Masters /> },
          //   ],
          // },
          {
            path: "customer-item-management",
            element: <CPMMaster />,
            children: [
              {
                index: true, // ✅ default route
                element: <Navigate to="barcode-print" />, // 👈 choose your default page
              },
              // Bare URL redirects to the first mode the user can access.
              { path: "barcode-print", element: <BarcodePrintIndex /> },
              // One route per mode; each mode URL is its own menu permission.
              ...BARCODE_MODES.map((m) => ({
                path: `barcode-print/${m.segment}`,
                element: (
                  <RequireMenuAccess permission={m.path}>
                    <TyreBarcodeGenerator mode={m.key} />
                  </RequireMenuAccess>
                ),
              })),
            ],
          },
          {
            path: "Settings",
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="profile"/> },
              { path: "Settings", element: <Settings /> },
              { path: "profile", element: <MyProfilePage /> },

            ],
          },
          {
            path: "UserMaster",
            element: <UserMasterLayout />,
            children: [
              { index: true, element: <UserList /> },
              { path: "user-list", element: <UserList /> },
              { path: "user-creation", element: <UserCreation /> },
              // { path: "menuaccess", element: <MenuAccessManager /> },
              { path: "menuaccess", element: <MenuAccessManager1 /> },
              { path: "UserMasterManagement", element: <UserMasterManagement /> },
            ],
          },
          {
            path:'ErrorLog',
            element:<SerialLogs/>
          }
        ],
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFoundPage /> },
  { path: "Protected", element: <ProtectedPage /> },
]);
