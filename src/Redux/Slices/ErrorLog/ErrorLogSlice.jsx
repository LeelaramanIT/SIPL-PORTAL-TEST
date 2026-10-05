import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../utils/axios";

const initialState = {
  logs: [],
  loading: false,
  error: null,
};

const ErrorLogSlice = createSlice({
  name: "errorLog",
  initialState,
  reducers: {
    setLogsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLogsError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Combines the loading:false + data-set steps into one action so the
    // fetch-resolution moment triggers a single re-render instead of two.
    setLogsSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.logs = action.payload;
    },
  },
});

export const { setLogsLoading, setLogsError, setLogsSuccess } =
  ErrorLogSlice.actions;

const buildLogsEndpoint = ({ plantCode, level, fromDate, toDate } = {}) => {
  const params = new URLSearchParams();
  if (plantCode) params.append("PlantCode", plantCode);
  if (level) params.append("Level", level);
  if (fromDate) params.append("FromDate", fromDate);
  if (toDate) params.append("ToDate", toDate);

  const query = params.toString();
  return query ? `/SerialLog/GetParamLogs?${query}` : "/SerialLog/GetLogs";
};

// Only the newest request should ever be allowed to update the table. Without this,
// a slow request from an old filter (or an auto-refresh tick) can resolve AFTER a
// newer one and silently overwrite fresh data with stale data. Aborting the previous
// request also saves the browser from downloading/parsing a response nobody needs.
let pendingRequest = null;

export const getSerialLogs = (filters) => async (dispatch) => {
  pendingRequest?.abort();
  const request = new AbortController();
  pendingRequest = request;

  try {
    dispatch(setLogsLoading(true));

    // This endpoint needs a Bearer token specifically (WWW-Authenticate: Bearer) —
    // unlike the rest of the API, which authenticates via the session cookie that
    // `api`'s withCredentials already sends automatically.
    const token = localStorage.getItem("authToken");

    const res = await api.get(buildLogsEndpoint(filters), {
      signal: request.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const result = res.data;
    if (!result?.isSuccess) {
      throw new Error(result?.message || "Unable to retrieve logs.");
    }

    dispatch(setLogsSuccess(Array.isArray(result.data) ? result.data : []));
  } catch (error) {
    if (error.code === "ERR_CANCELED") return; // superseded by a newer request, ignore

    dispatch(
      setLogsError(error?.response?.data?.message || error.message || "Unable to retrieve logs.")
    );
  }
};

export default ErrorLogSlice.reducer;
