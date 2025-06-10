import { combineReducers, configureStore } from "@reduxjs/toolkit";
import globalReducer from "../Slices/GlobalSlice";
import invoiceReducer from "../Slices/InvoiceSlice";
import authReducer from "../Slices/AuthSlice";
import storage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import { persistReducer, persistStore } from "redux-persist";

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
  storage,
  transforms: [encryptor],
};

const globalPersistConfig = {
  key: "global",
  version: 1,
  storage,
  transforms: [encryptor],
}



const persistedInvoiceReducer = persistReducer(invoicePersistConfig, invoiceReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedGlobalReducer = persistReducer(globalPersistConfig, globalReducer);

// Root reducer
const rootReducer = combineReducers({
  global: persistedGlobalReducer, 
  invoice: persistedInvoiceReducer,
  auth: persistedAuthReducer,

});

// Store setup
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  devTools: import.meta.env.MODE === "development",
});

// Persistor
export const persistor = persistStore(store);
