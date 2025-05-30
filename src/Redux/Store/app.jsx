import { combineReducers, configureStore } from "@reduxjs/toolkit";
import globalReducer from "../Slices/GlobalSlice";
import invoiceReducer from "../Slices/InvoiceSlice";
import authReducer from "../Slices/AuthSlice";
import storage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt"; // ✅ Correct import
import { persistReducer, persistStore } from "redux-persist";

const encryptor = encryptTransform({
  secretKey: import.meta.env.VITE_REDUX_SECRET_KEY,
  onError: (error) => {
    console.error("Redux Encrypt Error:", error);
  },
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // only persist auth slice
  transforms: [encryptor],
  blacklist:['loading','error'] // Do NOT persist these
};

const rootReducer = combineReducers({
  global: globalReducer,
  invoice: invoiceReducer,
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  devTools: import.meta.env.MODE === "development",
});

export const persistor = persistStore(store);
