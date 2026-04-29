import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../utils/axios";

const initialState = {
  listOfProformaInvoice: [],
  listOfDraftProforma: [],
  loading: false,
  proformaDetails: {}, // ← ONLY DB data
  additionalForm: null,
  finalData: {}, // ← proformaDetails + additionalForm merged
  submitLoading: false,
  submitSuccess: false,
  master: {},
  showPartNumber: false,
};

const proformaInvoice = createSlice({
  initialState,
  name: "proformaInvoice",
  reducers: {
    // ✅ Fix — give the draft reducer its own unique name
    setListOfProformaInvoice: (state, action) => {
      state.listOfProformaInvoice = action.payload;
    },
    setListOfDraftProforma: (state, action) => {
      // ← renamed
      state.listOfDraftProforma = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSubmitLoading: (state, action) => {
      state.submitLoading = action.payload;
    },
    setSubmitSuccess: (state, action) => {
      state.submitSuccess = action.payload;
    },
    resetMaster: (state) => {
      state.listOfProformaInvoice = [];
    },
    setProformaInvoiceDetails: (state, action) => {
      // ✅ Preserve any partNumbers user already entered before re-fetch overwrites
      const existingItems = state.proformaDetails?.items || [];

      const incomingItems = (action.payload?.items || []).map((newItem) => {
        const existing = existingItems.find(
          (old) => old.itemCode === newItem.itemCode,
        );
        return {
          ...newItem,
          partNumber: existing?.partNumber || "", // ← carry over user input
        };
      });

      state.proformaDetails = {
        ...action.payload,
        items: incomingItems,
      };
    },
    setAdditionalForm: (state, action) => {
      state.additionalForm =
        action.payload && Object.keys(action.payload).length > 0
          ? action.payload
          : null;

      // ✅ Preserve existing partNumbers already set in proformaDetails.items
      const existingItems = state.proformaDetails.items || [];

      state.finalData = {
        ...state.proformaDetails,
        ...(state.additionalForm || {}),
        items: existingItems, // ← keep items from proformaDetails (with partNumbers intact)
      };
    },
    resetProformaSubmit: (state) => {
      state.finalData = {};
      state.additionalForm = null;
      state.submitSuccess = false;
    },
    setMaster: (state, action) => {
      state.master = action.payload;
    },
    resetListOfDraftPI: (state) => {
      state.listOfDraftProforma = [];
      state.listOfProformaInvoice = [];
    },
    setPartNumber: (state, action) => {
      const { itemCode, value, o_ItemID } = action.payload;

      // ✅ Update proformaDetails.items
      const detailItem = state.proformaDetails.items?.find(
        (i) => i.itemCode === itemCode && i.o_ItemID === o_ItemID,
      );
      if (detailItem) {
        detailItem.partNumber = value;
      }

      // ✅ Also sync finalData.items so submit payload gets it too
      const finalItem = state.finalData.items?.find(
        (i) => i.itemCode === itemCode && i.o_ItemID === o_ItemID,
      );
      if (finalItem) {
        finalItem.partNumber = value;
      }
    },
    resetPartNumbers: (state) => {
      // ✅ Clear from proformaDetails.items
      state.proformaDetails.items = (state.proformaDetails.items || []).map(
        (item) => ({ ...item, partNumber: "" }),
      );
      // ✅ Clear from finalData.items too
      state.finalData.items = (state.finalData.items || []).map((item) => ({
        ...item,
        partNumber: "",
      }));
    },
    setShowPartNumber: (state, action) => {
      state.showPartNumber = action.payload; // ← toggle itself, no payload needed
    },
  },
});

export const getListOfProformaInvoice = (payload, type) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    if (type === "DRAFT") {
      console.log("draft");

      dispatch(resetListOfDraftPI());

      const res = await api.get(`/DraftPI/GettingDraftPIReadyOrders`, {
        params: { DocumentType: payload },
      });

      if (res.status === 200) {
        dispatch(setListOfDraftProforma(res.data));
      }
    } else {
      console.log("PI");

      dispatch(resetListOfDraftPI());

      const res = await api.get(`/DraftPI/GettingPIReadyOrders`, {
        params: { DocumentType: payload },
      });

      if (res.status === 200) {
        dispatch(setListOfProformaInvoice(res.data));
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setLoading(false));
  }
};

export const getProformaInvoiceDetails = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.get(`/DraftPI/GettingDraftPIReadySpecificOrders`, {
      params: { o_id: payload.oid },
    });
    if (res.status === 200) {
      // ✅ Only pure DB data stored here
      dispatch(setProformaInvoiceDetails({ ...payload, ...res.data }));
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setLoading(false));
  }
};

export const submitProformaInvoice =
  (invoiceType) => async (dispatch, getState) => {
    try {
      dispatch(setSubmitLoading(true));

      const type = invoiceType === "PI" ? "PROFORMA INVOICE" : "DRAFT PROFORMA";

      const { finalData, master } = getState().proformaInvoice;

      const chargeAdjustmentmasters = [
        // ✅ Charges
        ...(finalData.additionalCharges?.[0]?.rows?.map((c, index) => ({
          chargesid: index + 1,
          chargesname: c.desc,
          chargestype: "ADD",
          chargesValue: Number(c.value) || 0,
          discountValue: 0,
        })) || []),

        // ✅ Discounts
        ...(finalData.discountDetails?.[0]?.rows?.map((d, index) => ({
          chargesid:
            (finalData.additionalCharges?.[0]?.rows?.length || 0) + index + 1,
          chargesname: d.desc,
          chargestype: "LESS",
          chargesValue: 0,
          discountValue: Number(d.value) || 0,
        })) || []),
      ];

      console.log(chargeAdjustmentmasters);

      const selectedExporter = master?.exporterAddresses.find(
        (addr) =>
          addr.exporterAddressFormatted === finalData.exportAuthorisedAddress,
      );
      const addressId = selectedExporter?.addressId || 0;
      const companyId = selectedExporter?.companyId || 0;
      const addressType = selectedExporter?.addressType || "";
      const authorisedSignature =
        selectedExporter?.authorisedSignature ||
        finalData.authorisedSignature ||
        "";

      const selectedBank = master?.exporterBanks?.find(
        (bank) => bank.bankAddressFormatted === finalData.bankDetails,
      );
      const bankDetailsId = selectedBank?.bankDetailsId;
      const bankAddressFormatted = selectedBank?.bankAddressFormatted;

      const selectTransport = master?.transportModes?.find(
        (Transport) => Transport.modeCode === finalData.preCarriageBy,
      );
      const transportid = selectTransport?.id;
      const transportmode = selectTransport?.modeCode;

      const selectIncoterms = master?.incoterms.find(
        (incoterm) => incoterm.incoterm === finalData?.incoterm,
      );

      const incoterm = selectIncoterms?.incoterm;
      const incotermId = selectIncoterms?.id;

      const selectContainer = master?.containerTypes?.find(
        (container) => container.containerType === finalData.containerType,
      );

      const containerType = selectContainer?.containerType || "";
      const containerID = selectContainer?.id || 0;

      const selectleadtime = master?.leadtimemaster.find(
        (time) => time.leadtimename === finalData?.leadTime,
      );

      const leadtime = selectleadtime?.leadtimename;
      const leadtimecode = selectleadtime?.id;

      const selectedpackingMethods = master?.packingMethods.find(
        (value) => value.packingmethod === finalData?.packingMethod,
      );

      console.log(finalData);
      console.log(master);
      const formatDate = (date) => {
        return date ? new Date(date).toISOString() : null;
      };

      const payload = {
        draftPI_Id: 0,
        piType: type,
        o_id: finalData.o_id,
        custCode: finalData.custCode || finalData.custcode || "",
        shipID: finalData.shipid,
        billID: finalData.billid,
        plant: finalData.plant || "MMN",
        splIns: finalData.splIns,
        specialRequset: finalData.specialRequset,
        rfD_Date: new Date().toISOString(),

        billingAddress: finalData.billingAddress,
        billingCompanyName: finalData.billingCompanyName,
        shippingAddress: finalData.shippingAddress,
        shippingCompanyName: finalData.shippingCompanyName,

        paymentTerms: finalData.paymentTerms,
        paymentDays: finalData.paymentDays || 0,

        addressId: addressId || 0,
        companyId: companyId || 0,
        addressttype: addressType || "ho",
        exporterAddressFormatted: finalData.exportAuthorisedAddress,
        authorisedSignature: finalData.authorisedSignature || "",

        bankDetailsId: bankDetailsId || 0,
        bankAddressFormatted: finalData.bankDetails || "",

        transportid: transportid || 0,
        transportmode: finalData.preCarriageBy || "",

        incotermId: incotermId || 0,
        incotermname: finalData?.incoterm,

        containerid: containerID || 0,
        containerName: finalData.containerType,

        leadid: leadtimecode || 0,
        leadname: finalData?.leadTime,

        buyersOrderNo: finalData.BuyersOrderNumber,
        orderRefNo: finalData.orderRefNo,

        revisionNumber: Number(finalData.revisionNumber),
        RevisionDate: formatDate(finalData.revisionDate),
        validityDate: formatDate(finalData.validityDate),

        Remarks: finalData.custInstruction,

        // ✅ Packing Methods
        packagemethods: [
          {
            packageid: selectedpackingMethods?.id || 0,
            packageMethod: finalData?.packingMethod,
          },
        ],

        // ✅ Charges
        chargeAdjustmentmasters: chargeAdjustmentmasters,

        // ✅ Items mapping
        items: finalData.items.map((item) => ({
          o_ID: item.o_ID || 0,
          category: item.category || "",
          platforms: item.platforms || "",
          tyreSize: item.tyreSize || "",
          tyreRim: item.tyreRim || "",
          tyreType: item.tyreType || "",
          brand: item.brand || "",
          basicPrice: item.basicPrice || 0,
          itemQty: item.itemQty || 0,
          itemCode: item.itemCode || "",
          typeDesc: item.typeDesc || "",
          hsnCode: item.hsnCode || "",
          assyRimStatus: item.assyRimstatus || false,
          edcRimSize: item.edcRimSize || "",
          finishedWt: item.finishedWt || 0,
          o_ItemID: item.o_ItemID || 0,
          rimItemQty: item.rimItemQty || 0,
          rimUnitPrice: item.rimUnitPrice || 0,
          rimFinishedWt: item.rimfinishedwt || 0,
          sidewall: item.sidewall || "",
          PartNumber: item.partNumber || "",
        })),
      };

      console.log("Submitting Payload:", payload);

      if (type === "PROFORMA INVOICE") {
        const res = await api.post(`/DraftPI/create_PI`, payload);
        if (res.status === 200 || res.status === 201) {
          dispatch(setSubmitSuccess(true));
          dispatch(resetProformaSubmit());
          return { success: true, data: res.data };
        }
      } else {
        const res = await api.post(`/DraftPI/create_DraftPI`, payload);
        if (res.status === 200 || res.status === 201) {
          dispatch(setSubmitSuccess(true));
          dispatch(resetProformaSubmit());
          return { success: true, data: res.data };
        }
      }
    } catch (error) {
      console.error("Submit failed:", error);
      return { success: false, error };
    } finally {
      dispatch(setSubmitLoading(false));
    }
  };

export const getMasterData = () => async (dispatch, getState) => {
  try {
    const res = await api.get("/DraftPI/GettingDraftPIMaster");
    console.log(res.data);

    if (res.status === 200) {
      dispatch(setMaster(res.data));
    }
  } catch (error) {
    console.log("error", error);
  }
};

export const {
  setListOfProformaInvoice,
  setLoading,
  setSubmitLoading,
  setSubmitSuccess,
  resetMaster,
  setProformaInvoiceDetails,
  setAdditionalForm, // ← renamed to PascalCase for consistency
  resetProformaSubmit,
  setMaster,
  resetListOfDraftPI,
  setListOfDraftProforma,
  setPartNumber,
  resetPartNumbers,
  setShowPartNumber,
} = proformaInvoice.actions;

export default proformaInvoice.reducer;
