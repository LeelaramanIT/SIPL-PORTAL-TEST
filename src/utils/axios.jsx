import axios from "axios";
import { BackendUrl } from "../config";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../Redux/Slices/AuthSlice";

export const api = axios.create({
  baseURL: BackendUrl,
  withCredentials: true,
});

export function useAxiosInterceptors() {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          window.localStorage.clear();
          window.sessionStorage.clear();
          dispatch(logout())
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);
}
