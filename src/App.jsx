import "./App.css";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/Router"; // Make sure this import is correct
import { Provider } from "react-redux";
import { persistor, store } from "./Redux/Store/app";
import AOS from "aos";
import 'aos/dist/aos.css'; // Import AOS styles
import { useEffect } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { PersistGate } from "redux-persist/integration/react";




function App() {

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false, // Set to false if you want to animate every time
    });
  }, []);
  

  return (
    <>
      <Toaster
        position="bottom-right"
        reverseOrder={true}
        toastOptions={{
          success: {
            style: {
              background: "#314158",
              color: "white",
            },
          },
          error: {
            style: {
              background: "red",
              color: "white",
            },
          },
        }}
      />
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} /> 
      </PersistGate>
      </Provider>
    </>
  );
}

export default App;
