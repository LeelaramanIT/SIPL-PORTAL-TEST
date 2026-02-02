import axios from "axios";
import { BackendUrl } from "../config";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout, userLogout } from "../Redux/Slices/AuthSlice";
import { toast } from "react-hot-toast";

// 1. Export the instance
export const api = axios.create({
  baseURL: BackendUrl,
  withCredentials: true,
});

export function useAxiosInterceptors() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Ref to prevent multiple toasts/redirects for 401
  const isHandling401 = useRef(false);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response, // Happy path
      (error) => {
        const status = error.response ? error.response.status : null;

        // ---------------------------------------------------
        // CASE 1: Session Timeout (401) -> LOGOUT
        // ---------------------------------------------------
        if (status === 401) {
          if (!isHandling401.current) {
            isHandling401.current = true; // Lock it

            toast.error("Session expired. Please login again.", {
              id: "session-expired", // Prevents duplicate toasts
              style: { background: "#ff4d4f", color: "#fff" },
            });

            // Clear Storage
            window.localStorage.clear();
            window.sessionStorage.clear();

            // Redux Logout (Optional if using window.location, but good practice)
            dispatch(logout());
            dispatch(userLogout(navigate));

            // FORCE REFRESH to Login (Clears memory)
            // Use this instead of navigate for security on logout
            window.location.href = "/login";

            // Note: No need to reset isHandling401 because the page will reload
          }
        }

        // ---------------------------------------------------
        // CASE 2: Permission Denied (403) -> STAY ON PAGE
        // ---------------------------------------------------
        else if (status === 403) {
          toast.error("You do not have permission to perform this action.", {
            id: "permission-denied", // unique ID prevents duplicates
          });
          // Do NOT logout the user
        } else if (status === 408) {
          toast.error("Request timed out. Please login again.", {
            id: "request-timeout",
          });
          // Clear Storage
          window.localStorage.clear();
          window.sessionStorage.clear();

          // Redux Logout (Optional if using window.location, but good practice)
          dispatch(logout());
          dispatch(userLogout(navigate));
          // FORCE REFRESH to Login (Clears memory)
          // Use this instead of navigate for security on logout
          window.location.href = "/login";
        } else if (status === 400) {
          // ---------------------------------------------------
          // CASE 0: Validation Errors (400)
          // ---------------------------------------------------
          const data = error.response?.data;

          let message = "Invalid request.";

          if (data?.errors) {
            message = Object.values(data.errors).flat().join("\n");
          } else if (data?.message) {
            message = data.message;
          }
          toast.error(message, { id: "validation-error" });

          return Promise.reject({ ...error, handled: true });
        }
        // ---------------------------------------------------
        // CASE 3: Server Errors (500+)
        // ---------------------------------------------------
        else if (status >= 500) {
          toast.error("Server error. Please try again later.");
        }

        return Promise.reject(error);
      },
    );

    // Cleanup: Remove interceptor when component unmounts
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate, dispatch]);
}
