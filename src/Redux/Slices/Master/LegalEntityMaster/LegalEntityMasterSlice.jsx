import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "../../../../utils/axios";

const initialState = {
  entities: [],
  locations: [],
  warehouses: [],
  banks: [],
  addressTypes: [],
  warehouseTypes: [],
  registrationTypes: [],
  locationTypes: [],
  primaryFunctions: [],
  locationCategories: [],
  loading: false,
  error: null,
};

const legalEntityMasterSlice = createSlice({
  name: "legalEntity",
  initialState: initialState,
  reducers: {
    setEntities: (state, action) => {
      state.entities = action.payload;
    },
    setAddressTypes: (state, action) => {
      state.addressTypes = action.payload;
    },
    setWarehouseTypes: (state, action) => {
      state.warehouseTypes = action.payload;
    },
    setRegistrationTypes: (state, action) => {
      state.registrationTypes = action.payload;
    },
    setLocationTypes: (state, action) => {
      state.locationTypes = action.payload;
    },
    setPrimaryFunctions: (state, action) => {
      state.primaryFunctions = action.payload;
    },
    setLocationCategories: (state, action) => {
      state.locationCategories = action.payload;
    },
    setLocations: (state, action) => {
      state.locations = action.payload;
    },
    setWarehouses: (state, action) => {
      state.warehouses = action.payload;
    },
    setBanks: (state, action) => {
      state.banks = action.payload;
    },
    addEntitySuccess: (state, action) => {
      state.entities.push(action.payload);
      state.loading = false;
    },
    setEntityError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setEntityLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setEntitySuccess: (state) => {
      state.loading = false;
    },
  },
});

export const {
  setEntities,
  setAddressTypes,
  setWarehouseTypes,
  setRegistrationTypes,
  setLocationTypes,
  setPrimaryFunctions,
  setLocationCategories,
  setLocations,
  setWarehouses,
  setBanks,
  addEntitySuccess,
  setEntityError,
  setEntityLoading,
  setEntitySuccess,
} = legalEntityMasterSlice.actions;

// GET: Fetch all legal entities
export const getLegalEntities = () => async (dispatch) => {
  try {
    dispatch(setEntityLoading());

    const res = await api.get("LegalEntityMaster/GetEntityDetails");

    if (res.status === 200) {
      const payload = res.data?.data || {};
      const {
        legalEntities = [],
        addresses = [],
        registrations = [],
        businessDivisions = [],
        globalLocations = [],
        warehouses = [],
        banks = [],
      } = payload;

      const entities = legalEntities.map((entity) => ({
        ...entity,
        id: entity.companyID,
        isActive: entity.isActive ?? true,
        country:
          addresses.find((a) => a.ref_Id === entity.companyID)?.country || "",
        addresses: addresses.filter((a) => a.ref_Id === entity.companyID),
        registrations: registrations.filter(
          (r) => r.legalEntityId === entity.companyID
        ),
        businessDivisions: businessDivisions.filter(
          (d) => d.legalEntityId === entity.companyID
        ),
      }));

      // Backend casing for these fields has been observed as both
      // `global_location_id`/`location_code`/... and `global_Location_ID`/
      // `location_Code`/... — accept either, normalized to the
      // id/locCode/locationName shape LocationPanel expects.
      const locations = globalLocations.map((loc) => ({
        ...loc,
        id: loc.global_Location_ID ?? loc.global_location_id,
        locCode: loc.location_Code ?? loc.location_code,
        locationName: loc.location_Name ?? loc.location_name,
        locationType: loc.location_Type ?? loc.location_type,
        entityId: loc.legalEntityId,
        isActive: loc.active_Flag ?? loc.active_flag,
      }));

      const normalizedWarehouses = warehouses.map((wh) => ({
        ...wh,
        id: wh.warehouseID,
        entityId: wh.legalEntityID,
      }));

      const normalizedBanks = banks.map((bank) => ({
        ...bank,
        id: bank.bankDetailsID,
        entityId: bank.legalEntityID,
      }));

      dispatch(setEntities(entities));
      dispatch(setLocations(locations));
      dispatch(setWarehouses(normalizedWarehouses));
      dispatch(setBanks(normalizedBanks));
      dispatch(setEntitySuccess());
      return entities;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to fetch Legal Entities:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    dispatch(setEntityError(errorMsg));
    return Promise.reject(new Error(errorMsg));
  }
};

// GET: Fetch address type / warehouse type / registration type master data
export const getTypeMasterData = () => async (dispatch) => {
  try {
    const res = await api.get("LegalEntityMaster/TypeMasterData");

    if (res.status === 200) {
      const payload = res.data?.data || {};
      const {
        addressTypes = [],
        warehouseTypes = [],
        registrationTypes = [],
        locationTypes = [],
        primaryFunctions = [],
        locationCategories = [],
      } = payload;

      dispatch(setAddressTypes(addressTypes));
      dispatch(setWarehouseTypes(warehouseTypes));
      dispatch(setRegistrationTypes(registrationTypes));
      dispatch(setLocationTypes(locationTypes));
      dispatch(setPrimaryFunctions(primaryFunctions));
      dispatch(setLocationCategories(locationCategories));
      return payload;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to fetch type master data:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    return Promise.reject(new Error(errorMsg));
  }
};

// POST: Save/Create single payload entity
export const createLegalEntity = (payload) => async (dispatch) => {
  try {
    dispatch(setEntityLoading());
    console.log("Creating entity:", payload);

    const res = await api.post(
      "LegalEntityMaster/CreateLegalEntity",
      payload
    );

    if (res.status === 200 || res.status === 201) {
      const entityData = res.data?.data || res.data;
      dispatch(addEntitySuccess(entityData));
      dispatch(setEntitySuccess());
      return entityData;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to create Legal Entity:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    dispatch(setEntityError(errorMsg));
    return Promise.reject(error);
  }
};

// PUT: Update an existing legal entity
export const updateLegalEntity = (companyId, payload) => async (dispatch) => {
  try {
    dispatch(setEntityLoading());

    const res = await api.put(
      `LegalEntityMaster/UpdateLegalEntity/${companyId}`,
      payload
    );

    if (res.status === 200 || res.status === 201) {
      dispatch(setEntitySuccess());
      return res.data?.data || res.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to update Legal Entity:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    dispatch(setEntityError(errorMsg));
    return Promise.reject(error);
  }
};

// PUT: Update an existing legal entity's address
export const updateLegalEntityAddress = (addressId, payload) => async () => {
  try {
    const res = await api.put(
      `LegalEntityMaster/UpdateAddress/${addressId}`,
      payload
    );

    if (res.status === 200 || res.status === 201) {
      return res.data?.data || res.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to update Address:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    return Promise.reject(new Error(errorMsg));
  }
};

// POST: Add a registration to an existing legal entity
export const createLegalEntityRegistration = (payload) => async () => {
  try {
    const res = await api.post(
      "LegalEntityMaster/CreateLegalEntityRegistration",
      payload
    );

    if (res.status === 200 || res.status === 201) {
      return res.data?.data || res.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to create Legal Entity Registration:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    return Promise.reject(new Error(errorMsg));
  }
};

// PUT: Update an existing legal entity registration
export const updateLegalEntityRegistration = (id, payload) => async () => {
  try {
    const res = await api.put(
      `LegalEntityMaster/UpdateLegalEntityRegistration/${id}`,
      payload
    );

    if (res.status === 200 || res.status === 201) {
      return res.data?.data || res.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to update Legal Entity Registration:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    return Promise.reject(new Error(errorMsg));
  }
};

// POST: Add a business division to an existing legal entity
export const createLegalEntityBusinessDivision = (payload) => async () => {
  try {
    
    const res = await api.post(
      "LegalEntityMaster/CreateLegalBusinessDivision",
      payload
    );

    if (res.status === 200 || res.status === 201) {
      return res.data?.data || res.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to create Legal Entity Business Division:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    return Promise.reject(new Error(errorMsg));
  }
};

// PUT: Update an existing legal entity business division
export const updateLegalEntityBusinessDivision = (id, payload) => async () => {
  try {
    const res = await api.put(
      `LegalEntityMaster/UpdateLegalBusinessDivision/${id}`,
      payload
    );

    if (res.status === 200 || res.status === 201) {
      return res.data?.data || res.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to update Legal Entity Business Division:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    return Promise.reject(new Error(errorMsg));
  }
};

// POST: Create a global location for a legal entity
export const createLegalEntityLocation = (payload) => async (dispatch) => {
  try {
    dispatch(setEntityLoading());

    const res = await api.post("LegalEntityMaster/CreateGlobalLocation", payload);

    if (res.status === 200 || res.status === 201) {
      const locationData = res.data?.data || res.data;
      dispatch(setEntitySuccess());
      return locationData;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to create Global Location:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    dispatch(setEntityError(errorMsg));
    return Promise.reject(error);
  }
};

// PUT: Update an existing global location
export const updateLegalEntityLocation = (id, payload) => async (dispatch) => {
  try {
    dispatch(setEntityLoading());

    const res = await api.put(`LegalEntityMaster/UpdateGlobalLocation/${id}`, payload);

    if (res.status === 200 || res.status === 201) {
      dispatch(setEntitySuccess());
      return res.data?.data || res.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to update Global Location:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    dispatch(setEntityError(errorMsg));
    return Promise.reject(error);
  }
};

// POST: Create Warehouse for a legal entity
export const createLegalEntityWarehouse = (payload) => async (dispatch) => {
  try {
    dispatch(setEntityLoading());

    const res = await api.post("LegalEntityMaster/CreateWarehouse", payload);

    if (res.status === 200 || res.status === 201) {
      const warehouseData = res.data?.data || res.data;
      dispatch(setEntitySuccess());
      return warehouseData;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to create Warehouse:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    dispatch(setEntityError(errorMsg));
    return Promise.reject(error);
  }
};

// PUT: Update an existing warehouse
export const updateLegalEntityWarehouse = (id, payload) => async (dispatch) => {
  try {
    dispatch(setEntityLoading());

    // Swagger's route for this endpoint has no separator before the id
    // (UpdateWarehouse{id}, not UpdateWarehouse/{id}) — matching it exactly.
    const res = await api.put(`LegalEntityMaster/UpdateWarehouse/${id}`, payload);

    if (res.status === 200 || res.status === 201) {
      dispatch(setEntitySuccess());
      return res.data?.data || res.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to update Warehouse:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    dispatch(setEntityError(errorMsg));
    return Promise.reject(error);
  }
};

// POST: Create Bank details for a legal entity
export const createLegalEntityBank = (payload) => async (dispatch) => {
  try {
    dispatch(setEntityLoading());

    const res = await api.post("LegalEntityMaster/CreateBankDetails", payload);

    if (res.status === 200 || res.status === 201) {
      const bankData = res.data?.data || res.data;
      dispatch(setEntitySuccess());
      return bankData;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to create Bank details:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    dispatch(setEntityError(errorMsg));
    return Promise.reject(error);
  }
};

// PUT: Update an existing bank detail record
export const updateLegalEntityBank = (id, payload) => async (dispatch) => {
  try {
    dispatch(setEntityLoading());

    const res = await api.put(`LegalEntityMaster/UpdateBankDetails/${id}`, payload);

    if (res.status === 200 || res.status === 201) {
      dispatch(setEntitySuccess());
      return res.data?.data || res.data;
    } else {
      throw new Error("Unexpected response status: " + res.status);
    }
  } catch (error) {
    console.error("Failed to update Bank details:", error);
    const errorMsg = error?.response?.data?.message || error.message || String(error);
    dispatch(setEntityError(errorMsg));
    return Promise.reject(error);
  }
};

export default legalEntityMasterSlice.reducer;