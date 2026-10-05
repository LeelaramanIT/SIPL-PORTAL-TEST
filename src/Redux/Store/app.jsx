import { combineReducers, configureStore } from "@reduxjs/toolkit";
import globalReducer from "../Slices/GlobalSlice";
import invoiceSlice from "../Slices/InvoiceSlice";
import proformaInvoice from "../Slices/ProformaInvoice/ProformaInvoiceSlice";
import authReducer from "../Slices/AuthSlice";
import UserMasterReducer from "../Slices/Master/UserMaster.jsx/UserCreationSlice";
import rimApplication from '../Slices/RimApplicationSlice'
import priceMasterSliceReducer from "../Slices/PriceMasterSlice";
import storage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import { persistReducer, persistStore } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import scanforlinspectionReducer from "../Slices/PDIDispatchMaster/PDIScanForInspectionSlice";
import PDIDispatchMasterReducer from "../Slices/PDIDispatchMaster/PDIMaster";
import PPCMasterReducer from "../Slices/PPCSubstitutionMaster/PPCMaster";
import PPCSubstitutionReducer from "../Slices/PPCSubstitutionMaster/PPCSubstitutionSlice";
import AssemblyProcessIDReducer from "../Slices/Master/PI_Master/AssemblyProcessIDSlice";
import TyreProcessIDReducer from "../Slices/Master/PI_Master/TyreProcessIDSlice";
import PDIFitmentMasterReducer from "../Slices/PDIFitmentMaster/PPCMaster";
import PDIFitmentReducer from "../Slices/PDIFitmentMaster/PDIFitmentSlice";
import { version } from "react";
import PIMasterReducer from '../Slices/ProformaInvoice/PIMasterSlice'
// task application
import ProjectReducer from '../Slices/Task_Master/Projects/ProjectSlice'
import SprintReducer from '../Slices/Task_Master/Sprint/SprintSlice'
import CIMMasterReducer from '../Slices/Customer_Item_Management/CIMMasterSlice'
import CIMBarcodeReducer from '../Slices/Customer_Item_Management/BarcodeSlice.jsx/BarcodeSlice'
// LegalEntity
import legalEntityMasterReducer from '../Slices/Master/LegalEntityMaster/LegalEntityMasterSlice'

// production report
import productionReportReducer from '../Slices/Report/ProductionReportSlice'

// error log
import errorLogReducer from '../Slices/ErrorLog/ErrorLogSlice'

// orderProcess
import OrderProcessReducer from "../Slices/OrderProcess/OrderProcessSlice";



// warehouse
import WarehouseReducer from "../Slices/Warehouse/WarehouseSlice";

import ReportMasterReducer from '../Slices/Master/ReportMasterCreation/ReportMasterCreationSlice';

// customer masters
import CustomerMaster from '../Slices/Master/CustomerMaster/CustomerMasterSlice'


// Encryption config
const encryptor = encryptTransform({
  secretKey: import.meta.env.VITE_REDUX_SECRET_KEY,
  onError: (error) => {
    console.error("Redux Encrypt Error:", error);
  },
});

const authPersistConfig = {
  key: "auth",
  version: 1,
  storage,
  transforms: [encryptor],
};
const UserMastertConfig = {
  key: "UserMaster",
  version: 1,
  storage,
  transforms: [encryptor],
};

const invoicePersistConfig = {
  key: "invoice",
  version: 1,
  storage:storageSession,
  transforms: [encryptor],
};

const proformaInvoiceConfig = {
  key : 'proformaInvoice',
  version : 1,
  storage : storageSession,
  transforms : [encryptor]
}

const globalPersistConfig = {
  key: "global",
  version: 1,
  storage,
  transforms: [encryptor],
}

const priceMasterPersistConfig = {
  key: "priceMaster",
  version: 1,
  storage:storageSession,
  transforms: [encryptor],
}

const PDIDispatchMasterPersistConfig = {
  key: "PDIDispatchMaster",
  version: 1,
  storage:storageSession,
  transforms: [encryptor],
}


const scanforlinspectionPersistConfig = {
  key: "scanforinspection",
  version: 1,
  storage:storageSession,
  transforms: [encryptor],
}
const PPCMasterPersistConfig = {
  key: "PPCMaster",
  version:1,
  storage:storageSession,
  transforms: [encryptor],
}

const PPCSubstitutionDetailsPersistConfig = {
  key:"PPCSubstitution",
  version:1,
  storage:storageSession,
  transforms: [encryptor],
}

const AssemblyProcessIDPersistConfig = {
  key: "AssemblyProcessID",
  version: 1,
  storage: storageSession,
  transforms: [encryptor],
};

const TyreProcessIDPersistConfig = {
  key: "TyreProcessID",
  version: 1,
  storage: storageSession,
  transforms: [encryptor],
}

const PDIFitmentMasterPersistConfig = {
  key: "PDIFitmentMaster",
  version: 1,
  storage: storageSession,
}

const PDIFitmentPersistConfig = {
  key: "PDIFitment",
  version: 1,
  storage: storageSession,
}

const PIMasterConfig = {
  key:'PIMaster',
  version:1,
  storage: storageSession
}

const ProjectReducerConfig = {
  key:'Project',
  version:1,
  storage: storageSession
}
const CIMMasterReducerConfig = {
  key:'CIMMaster',
  version:1,
  storage: storageSession
}
const CIMBarcodeReducerConfig = {
  key:'CIMMaster',
  version:1,
  storage: storageSession
}
const SprintReducerConfig = {
  key:'Sprint',
  version:1,
  storage: storageSession
}

const WarehouseReducerConfig = {
  key:'warehouse',
  version:1,
  storage: storageSession
}

const OrderProcessConfig = {
  key:'orderProcess',
  version:1,
  storage: storageSession
}

const ReportMasterConfig = {
  key:'reportMaster',
  version:1,
  storage: storageSession
}

const CustomerMasterConfig = {
  key: 'customerMaster',
  version:1,
  storage:storageSession
}

const legalEntityMasterConfig = {
  key: 'legalEntity',
  version:1,
  storage:storageSession
}


const persistedInvoiceReducer = persistReducer(invoicePersistConfig, invoiceSlice);
const persistedProformaInvoiceReducer = persistReducer(proformaInvoiceConfig, proformaInvoice);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedGlobalReducer = persistReducer(globalPersistConfig, globalReducer);
const persistedPriceMasterReducer = persistReducer(priceMasterPersistConfig, priceMasterSliceReducer);
const persistedPDIDispatchMasterReducer = persistReducer(PDIDispatchMasterPersistConfig, PDIDispatchMasterReducer);
const persistedScanforlinspectionReducer = persistReducer(scanforlinspectionPersistConfig, scanforlinspectionReducer);
const persistedPPCMasterReducer = persistReducer(PPCMasterPersistConfig, PPCMasterReducer);
const persistedPPCSubstitutionDetailsReducer = persistReducer(PPCSubstitutionDetailsPersistConfig, PPCSubstitutionReducer );
const persistedAssemblyProcessIDReducer = persistReducer(AssemblyProcessIDPersistConfig, AssemblyProcessIDReducer);
const persistedTyreProcessIDReducer = persistReducer(TyreProcessIDPersistConfig, TyreProcessIDReducer);
const persistedPDIFitmentMasterReducer = persistReducer(PDIFitmentMasterPersistConfig, PDIFitmentMasterReducer);
const persistedPDIFitmentReducer = persistReducer(PDIFitmentPersistConfig, PDIFitmentReducer);
const persistedPIMaster = persistReducer(PIMasterConfig,PIMasterReducer);
const persistedProjectReducer = persistReducer(ProjectReducerConfig,ProjectReducer)
const persistedCIMMasterReducer = persistReducer(CIMMasterReducerConfig,CIMMasterReducer)
const persistedCIMBarcodeReducer = persistReducer(CIMBarcodeReducerConfig,CIMBarcodeReducer)
const persistedSprintReducer = persistReducer(SprintReducerConfig,SprintReducer)
const presistedUserMasterReducer = persistReducer(UserMastertConfig,UserMasterReducer)
const persistedWarehouseReducer = persistReducer(WarehouseReducerConfig,WarehouseReducer)
const persistedOrderProcessReducer = persistReducer(OrderProcessConfig,OrderProcessReducer)
const persistedReportMasterReducer = persistReducer(ReportMasterConfig,ReportMasterReducer)
const persistedCustomerMasterReducer = persistReducer(CustomerMasterConfig,CustomerMaster)
const persistedLegalEntityMasterReducer = persistReducer(legalEntityMasterConfig,legalEntityMasterReducer)



// Root reducer
const rootReducer = combineReducers({
  global: persistedGlobalReducer, 
  invoice: persistedInvoiceReducer,
  proformaInvoice: persistedProformaInvoiceReducer,
  auth: persistedAuthReducer,
  UserMaster:presistedUserMasterReducer,
  rimApplication: rimApplication,
  priceMaster: persistedPriceMasterReducer,
  scanforinspection: persistedScanforlinspectionReducer,
  PDIDispatchMaster: persistedPDIDispatchMasterReducer,
  PPCMaster: persistedPPCMasterReducer,
  PPCSubstitution: persistedPPCSubstitutionDetailsReducer,
  AssemblyProcessID: persistedAssemblyProcessIDReducer,
  TyreProcessID: persistedTyreProcessIDReducer,
  PDIFitmentMaster: persistedPDIFitmentMasterReducer,
  PDIFitment: persistedPDIFitmentReducer,
  PIMaster: persistedPIMaster,
  Project:persistedProjectReducer,
  CIMMaster:persistedCIMMasterReducer,
  CIMBarcode:persistedCIMBarcodeReducer,
  Sprint:persistedSprintReducer,
  warehouse:persistedWarehouseReducer,
  orderProcess:persistedOrderProcessReducer,
  reportMaster:persistedReportMasterReducer,
  customerMaster: persistedCustomerMasterReducer,
  legalEntity: persistedLegalEntityMasterReducer,
  productionReport: productionReportReducer,
  errorLog: errorLogReducer
});

// Store setup
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true, // explicitly enable thunk
      immutableCheck: { warnAfter: 128 },
      serializableCheck: false,
    }),
  devTools: import.meta.env.MODE === "development",
});

// Persistor
export const persistor = persistStore(store);
