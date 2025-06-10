import "./App.css";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/Router";
import { Provider, useSelector } from "react-redux";
import { persistor, store } from "./Redux/Store/app";
import AOS from "aos";
import 'aos/dist/aos.css';
import { useEffect } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { PersistGate } from "redux-persist/integration/react";

// 🟢 Moved this to a child so useSelector is safe
function ThemedApp() {
  const theme = useSelector((store) => store.global.theme);

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-green",
      "theme-orange",
      "theme-purple"
    );
    if (theme) {
      html.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
        <ThemedApp />
      </PersistGate>
    </Provider>
  );
}

export default App;
