import { combineReducers, configureStore } from "@reduxjs/toolkit";
import globalReducer from "../Slices/GlobalSlice";
import invoiceSlice from "../Slices/InvoiceSlice";
import authReducer from "../Slices/AuthSlice";
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
import { version } from "react";

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

const invoicePersistConfig = {
  key: "invoice",
  version: 1,
  storage:storageSession,
  transforms: [encryptor],
};

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


const persistedInvoiceReducer = persistReducer(invoicePersistConfig, invoiceSlice);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedGlobalReducer = persistReducer(globalPersistConfig, globalReducer);
const persistedPriceMasterReducer = persistReducer(priceMasterPersistConfig, priceMasterSliceReducer);
const persistedPDIDispatchMasterReducer = persistReducer(PDIDispatchMasterPersistConfig, PDIDispatchMasterReducer);
const persistedScanforlinspectionReducer = persistReducer(scanforlinspectionPersistConfig, scanforlinspectionReducer);
const persistedPPCMasterReducer = persistReducer(PPCMasterPersistConfig,PPCMasterReducer);
const persistedPPCSubstitutionDetailsReducer = persistReducer(PPCSubstitutionDetailsPersistConfig,PPCSubstitutionReducer );

// Root reducer
const rootReducer = combineReducers({
  global: persistedGlobalReducer, 
  invoice: persistedInvoiceReducer,
  auth: persistedAuthReducer,
  rimApplication: rimApplication,
  priceMaster: persistedPriceMasterReducer,
  scanforinspection: persistedScanforlinspectionReducer,
  PDIDispatchMaster: persistedPDIDispatchMasterReducer,
  PPCMaster: persistedPPCMasterReducer,
  PPCSubstitution: persistedPPCSubstitutionDetailsReducer,
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
