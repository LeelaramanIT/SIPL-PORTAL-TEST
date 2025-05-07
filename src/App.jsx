import "./App.css";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/Router"; // Make sure this import is correct
import { Provider } from "react-redux";
import { store } from "./store/app";

function App() {
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
      <RouterProvider router={router} /> 
      </Provider>
    </>
  );
}

export default App;
