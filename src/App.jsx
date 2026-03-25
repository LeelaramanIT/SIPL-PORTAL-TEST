import "./App.css";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/Router";
import { Provider, useSelector } from "react-redux";
import { persistor, store } from "./Redux/Store/app";
import { useEffect } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { PersistGate } from "redux-persist/integration/react";
import ThemeSwitcher from "./components/ThemeSwitcher";


// 🟢 Moved this to a child so useSelector is safe
function ThemedApp() {
  const theme = useSelector((store) => store.global.theme);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove(
      'theme-dark',
      'theme-light',
      'theme-green',
      'theme-orange',
      'theme-purple',
      'theme-red',
      'theme-pink',
      'theme-navi-blue',
    );
    if (theme!='dark' && theme) {
      html.classList.add(`theme-${theme}`);
    }
  }, [theme]);

 
  return (
    <>
      <RouterProvider router={router} />
      <ThemeSwitcher variant="floating" />
    </>
  );
}

function App() {
  //  useAxiosInterceptors()
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Toaster
        
          position="top-right"
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
