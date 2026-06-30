import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../../utils/axios";

/* -------------------------------------------------------------------- */
/*  NOTE ON SHAPE                                                       */
/* -------------------------------------------------------------------- */
/*
  GET /BulkReport/report-details returns:
  {
    statusCode, message,
    data: [
      { typeId, typeName, reports: [ { reportId, reportName, reportParams }, ... ] },
      ...
    ]
  }

  Per Kaju's mapping:
    - typeId / typeName   -> treated as "Report Name" in the UI
    - reportId / reportName -> treated as "Report Type" in the UI (nested under a Report Name)

  We keep the raw nested `data` array as the single source of truth in the
  store (`reportList`), and derive the two flat lists the UI tabs need via
  selectors below, instead of duplicating state.
*/

const initialState = {
  reportTypes: [],
  reportNames: [],
  loading: false,
  error: null,
  success: false,
};

const reportMaster = createSlice({
  name: "reportMaster",
  initialState,
  reducers: {
    setMasterDetails: (state, action) => {
    state.reportTypes = action.payload.reportTypes || [];
    state.reportNames = action.payload.reportNames || [];
},

    setReportLoading: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },

    setReportSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },

    setReportError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearReportState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
    setMasterDetails,
    setReportLoading,
    setReportSuccess,
    setReportError,
    clearReportState,
} = reportMaster.actions;

/* -------------------------------------------------------------------- */
/*  THUNKS - reads                                                      */
/* -------------------------------------------------------------------- */

export const getReportList = () => async (dispatch) => {
  try {
    dispatch(setReportLoading());

    const res = await api.get("/BulkReport/master-details");

    if (res.status === 200) {
    dispatch(setMasterDetails(res.data));
    dispatch(setReportSuccess());
}

    throw new Error("Unexpected response status : " + res.status);
  } catch (error) {
    console.error("Get Report List Error:", error);

    dispatch(
      setReportError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
  }
};

export const getReports = () => async (dispatch) => {
  try {
    dispatch(setReportLoading());

    const res = await api.get("/BulkReport/report-details");

    if (res.status === 200) {
      dispatch(setReportList(res.data?.data || []));
      dispatch(setReportSuccess());
      return res.data?.data || [];
    }

    throw new Error("Unexpected response status : " + res.status);
  } catch (error) {
    console.error("Get Report List Error:", error);

    dispatch(
      setReportError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
  }
};

/* -------------------------------------------------------------------- */
/*  THUNKS - Report Name (typeId / typeName)                            */
/* -------------------------------------------------------------------- */

export const createReportName = (payload) => async (dispatch) => {
  try {
    dispatch(setReportLoading());
    console.log(payload);
    

    const res = await api.post("/BulkReport/ReportName-create", payload);

    if (res.status === 200 || res.status === 201) {
      dispatch(setReportSuccess());
      dispatch(getReportList());
      return res.data;
    }

    throw new Error("Unexpected response status : " + res.status);
  } catch (error) {
    console.error("Create Report Name Error:", error);

    dispatch(
      setReportError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
    throw error;
  }
};

export const updateReportName = (typeId, payload) => async (dispatch) => {
  try {
    dispatch(setReportLoading());

    const res = await api.put(`/BulkReport/ReportName-update/${typeId}`, payload);

    if (res.status === 200 || res.status === 201) {
      dispatch(setReportSuccess());
      dispatch(getReportList());
      return res.data;
    }

    throw new Error("Unexpected response status : " + res.status);
  } catch (error) {
    console.error("Update Report Name Error:", error);

    dispatch(
      setReportError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
    throw error;
  }
};

export const deleteReportName = (typeId) => async (dispatch) => {
  try {
    dispatch(setReportLoading());

    const res = await api.delete(`/BulkReport/ReportName-delete/${typeId}`);

    if (res.status === 200 || res.status === 204) {
      dispatch(setReportSuccess());
      dispatch(getReportList());
      return res.data;
    }

    throw new Error("Unexpected response status : " + res.status);
  } catch (error) {
    console.error("Delete Report Name Error:", error);

    dispatch(
      setReportError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
    throw error;
  }
};

/* -------------------------------------------------------------------- */
/*  THUNKS - Report Type (reportId / reportName, nested under a typeId) */
/* -------------------------------------------------------------------- */

export const createReportType = (payload) => async (dispatch) => {
  try {
    dispatch(setReportLoading());

    const res = await api.post("/BulkReport/Type-create", payload);

    if (res.status === 200 || res.status === 201) {
      dispatch(setReportSuccess());
      dispatch(getReportList());
      return res.data;
    }

    throw new Error("Unexpected response status : " + res.status);
  } catch (error) {
    console.error("Create Report Type Error:", error);

    dispatch(
      setReportError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
    throw error;
  }
};

export const updateReportType = (reportId, payload) => async (dispatch) => {
  try {
    dispatch(setReportLoading());

    const res = await api.put(`/BulkReport/Type-update/${reportId}`, payload);

    if (res.status === 200 || res.status === 201) {
      dispatch(setReportSuccess());
      dispatch(getReportList());
      return res.data;
    }

    throw new Error("Unexpected response status : " + res.status);
  } catch (error) {
    console.error("Update Report Type Error:", error);

    dispatch(
      setReportError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
    throw error;
  }
};

export const deleteReportType = (reportId) => async (dispatch) => {
  try {
    dispatch(setReportLoading());

    const res = await api.delete(`/BulkReport/Type-delete/${reportId}`);

    if (res.status === 200 || res.status === 204) {
      dispatch(setReportSuccess());
      dispatch(getReportList());
      return res.data;
    }

    throw new Error("Unexpected response status : " + res.status);
  } catch (error) {
    console.error("Delete Report Type Error:", error);

    dispatch(
      setReportError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
    throw error;
  }
};

/* -------------------------------------------------------------------- */
/*  THUNKS - Report Configuration (create-Reports)                      */
/* -------------------------------------------------------------------- */

export const createReport = (payload) => async (dispatch) => {
  try {
    dispatch(setReportLoading());
    console.log(payload);


    const res = await api.post("/BulkReport/create-Reports", payload);

    if (res.status === 200 || res.status === 201) {
      dispatch(setReportSuccess());
      dispatch(getReportList());
      return res.data;
    }

    throw new Error("Unexpected response status : " + res.status);
  } catch (error) {
    console.error("Create Report Error:", error);

    dispatch(
      setReportError(
        error?.response?.data?.message || error.message || String(error)
      )
    );
    throw error;
  }
};

/* -------------------------------------------------------------------- */
/*  SELECTORS - derive flat UI shapes from the nested reportList        */
/* -------------------------------------------------------------------- */

// // Flat list for the "Report Names" tab: one row per typeId/typeName group.
// export const selectReportNames = (state) =>
//   (state.reportMaster.reportList || []).map((group) => ({
//     id: group.typeId,
//     reportName: group.typeName,
//     createdBy: group.createdBy || "-",
//     createdDate: group.createdDate || "-",
//     status: group.status || "Active",
//   }));

// // Flat list for the "Report Types" tab: one row per reportId/reportName,
// // flattened out of every group's `reports[]`, carrying the parent typeName.
// export const selectReportTypes = (state) =>
//   (state.reportMaster.reportList || []).flatMap((group) =>
//     (group.reports || []).map((r) => ({
//       id: r.reportId,
//       typeName: r.reportName,
//       parentReportNameId: group.typeId,
//       parentReportName: group.typeName,
//       createdBy: r.createdBy || "-",
//       createdDate: r.createdDate || "-",
//       status: r.status || "Active",
//     }))
//   );

// export const selectReportListRaw = (state) => state.reportMaster.reportList;

export const selectReportNames = (state) =>
    state.reportMaster.reportNames;

export const selectReportTypes = (state) =>
    state.reportMaster.reportTypes;

export const selectReportLoading = (state) =>
    state.reportMaster.loading;

export const selectReportError = (state) =>
    state.reportMaster.error;

// export const selectReportLoading = (state) => state.reportMaster.loading;
// export const selectReportError = (state) => state.reportMaster.error;

export default reportMaster.reducer;