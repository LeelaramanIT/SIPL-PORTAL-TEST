import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/axios";
import axios from "axios";
import toast from "react-hot-toast";
import { numberToWords } from "../../utils/NumberToWords";
// import { data, generateTableData } from "../../utils/DummyJSON";
import { getCurrency, getCurrencySymble } from "../../utils/currencies";
import { HSN_CODE } from "../../utils/HSNCODE";
import { useMemo } from "react";


const initialState = {
  exportInvoices: {
    invoiceType: "Direct_Invoice",
    listOFInvoices: [], // multiple invoices
    invoiceDetails: null, // single invoice details
    additionalForm: null, // extra form info
    invoicePDF: null, // PDF export
    FinalSplitResult: [], // processed items
    FinalInvoicePDFData: [], // processed invoice data
    updatedInvoiceDetails: [],
    FinalInvoiceDetails: [],
    loading: false,
    error: null,
    localItems: [],
    splitItems: [],
    pdfBlob: [],
    showSubmmit: false,
    isPallateChecked: false,
  },
  domesticInvoices: {
    list: [],
    loading: false,
    error: null,
  },
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setExportInvoiceSalesDetails: (state, action) => {
      state.exportInvoices.invoiceDetails = action.payload;
      state.exportInvoices.loading = false;
      state.exportInvoices.error = null;
    },
    // setExportInvoiceAddressDetails: (state, action) => {
    //   state.exportInvoices.additionalForm = action.payload;
    // },
    setExportInvoiceLoading: (state, action) => {
      state.exportInvoices.loading = action.payload;
      state.exportInvoices.error = null;
    },
    setExportInvoiceError: (state, action) => {
      state.exportInvoices.loading = false;
      state.exportInvoices.error = action.payload;
    },
    setExportInvoiceList: (state, action) => {
      state.exportInvoices.listOFInvoices = action.payload;
      state.exportInvoices.loading = false;
      state.exportInvoices.error = null;
    },
    resetExportInvoiceDetails: (state) => {
      state.exportInvoices = initialState.exportInvoices;
    },
    setExportAdditionalInvoice: (state, action) => {
      state.exportInvoices.additionalForm = action.payload;
    },
    setInvoicePDF: (state, action) => {
      state.exportInvoices.invoicePDF = action.payload;
    },
    setInvoiceType: (state, action) => {
      state.exportInvoices.invoiceType = action.payload;
    },
    setLocalItems: (state, action) => {
      state.exportInvoices.localItems = action.payload;
    },
    setSplitItems: (state, action) => {
      state.exportInvoices.splitItems = action.payload;
    },
    setSplitResult: (state, action) => {
      state.exportInvoices.FinalSplitResult = action.payload; // final Items
    },
    setIsPallate: (state, action) => {
      state.exportInvoices.isPallateChecked = action.payload
    },
    // ...inside the invoiceSlice reducers

    setFinalInvoiceData: (state, action) => {
      // 1️⃣ Split invoices by scheme
      const groupedInvoices = splitInvoiceByScheme(action.payload);
      const totalInvoices = groupedInvoices.length;

      // 2️⃣ Prepare processed invoices
      const processedInvoices = groupedInvoices.map((invoice, index) => {
        // Calculate totals
        const totalqty = invoice.items.reduce((acc, item) => acc + item.itemQty, 0);
        const totalwt = invoice.items.reduce(
          (acc, item) => acc + item.finishedWt * item.itemQty,
          0
        );
        const grandTotal = invoice.items.reduce(
          (acc, item) => acc + item.basicprice * item.itemQty,
          0
        );

        const formattedGrandTotal = grandTotal.toFixed(5);
        const unitPrice = totalwt > 0 ? (grandTotal / totalwt).toFixed(5) : "0";
        const userCurrency = invoice?.usercurrency;

        // 3️⃣ Extract the scheme value directly (not array)
        let schemeLicenceValue = "";
        let schemeDate = "";
        let isPallat = false;
        let pallatCount = "";
        let pallatWeight = "";
        let pallatTyres = 0
        let isWoodenBox = false;
        let woodenBoxCount = 0;
        let woodenBoxTyres = 0;
        let woodenBoxWeight = 0;

        const sharedCharge1 = (Number(invoice.otherChargesValue1) || 0) / totalInvoices;
        const sharedCharge2 = (Number(invoice.otherChargesValue2) || 0) / totalInvoices;
        const sharedCharge3 = (Number(invoice.otherChargesValue3) || 0) / totalInvoices;

        // Note: Use 'schemeDetails' if you used the updated code from the previous step, 
        // otherwise use 'schemeLicences'
        const listToCheck = invoice.schemeDetails

        if (invoice.scheme && Array.isArray(listToCheck)) {

          // 1. Find the object that matches the current invoice scheme name
          const matched = listToCheck.find((item) => item.scheme === invoice.scheme);

          if (matched) {
            schemeLicenceValue = matched.schemeNumber || "";
            schemeDate = matched.schemeDate || "";

            // Pallet (existing)
            isPallat = Boolean(matched.isPallat);
            pallatCount = Number(matched.pallatCount ?? 0);
            pallatTyres = Number(matched.numberOfTyres ?? 0);
            pallatWeight = Number(matched.pallatWeight ?? 0);

            // Wooden box (new)
            isWoodenBox = Boolean(matched.isWoodenBox);
            woodenBoxCount = Number(matched.woodenBoxCount ?? 0);
            woodenBoxTyres = Number(matched.woodenBoxTyres ?? 0);
            woodenBoxWeight = Number(matched.woodenBoxWeight ?? 0);
          }

        }
        const totalGrossWeight =
          (Number(totalwt) || 0) +
          (isPallat ? (Number(pallatWeight) || 0) : 0) +
          (isWoodenBox ? (Number(woodenBoxWeight) || 0) : 0);

        // 4️⃣ Return final invoice with single schemeLicence value
        return {
          ...invoice,
          invoiceNumber: Number(invoice.invoiceNumber) + index,
          totalqty,
          totalwt: `${totalwt.toFixed(3)}`,
          grossWeight: `${totalGrossWeight.toFixed(3)}`,
          grandTotal: formattedGrandTotal,
          amountInWords: `${userCurrency}${numberToWords(grandTotal, userCurrency)}`,
          unitPrice,
          // ✅ Store only the matched scheme value instead of array
          schemeLicences: schemeLicenceValue,
          schemeDate,
          isPallat,
          pallatCount: isPallat ? pallatCount : 0,
          pallatWeight: isPallat ? pallatWeight : 0,
          pallatTyres: isPallat ? pallatTyres : 0,
          isWoodenBox,
          woodenBoxCount: isWoodenBox ? woodenBoxCount : 0,
          woodenBoxTyres: isWoodenBox ? woodenBoxTyres : 0,
          woodenBoxWeight: isWoodenBox ? woodenBoxWeight : 0,
          // 🟢 Store Divided Other Charges
          sharedOtherCharge1: sharedCharge1,
          sharedOtherCharge2: sharedCharge2,
          sharedOtherCharge3: sharedCharge3
        };
      });


      // 5️⃣ Save result in Redux state
      state.exportInvoices.FinalInvoiceDetails = processedInvoices;
    },



    // You can now remove the SetupdatedInvoiceDetails reducer, as its logic is
    // now part of setFinalInvoiceData.
    SetupdatedInvoiceDetails: (state, action) => {
      state.exportInvoices.updatedInvoiceDetails = action.payload;

      const invoices = splitInvoiceByScheme(action.payload);
      console.log(invoices);

      // hsncode 
      const matchedHSN = invoices.map(invoice => {
        const grouped = {};

        invoice.items?.forEach(item => {
          if (!item.scheme) return;
          const scheme = item.scheme.toUpperCase(); // Convert to UPPER
          if (!grouped[scheme]) grouped[scheme] = new Set();
          if (item.hsnCode) grouped[scheme].add(item.hsnCode);
        });

        return Object.keys(grouped).map(key => ({
          scheme: key,
          HSNCODE: [...grouped[key]]
        }));
      }).flat();

      const totalInvoices = invoices.length



      const data = invoices.map((invoice, index) => {
        // 1. Safe Math Calculations
        const totalqty = invoice.items.reduce((acc, item) => acc + (Number(item.itemQty) || 0), 0);

        // Net Weight (Goods only)
        const goodsWeight = invoice.items.reduce(
          (acc, item) => acc + (Number(item.finishedWt) || 0) * (Number(item.itemQty) || 0),
          0
        );

        const totalPrices = invoice.items.map(
          (item) => (Number(item.basicprice) || 0) * (Number(item.itemQty) || 0)
        );

        const grandTotal = totalPrices.reduce((acc, price) => acc + price, 0);
        const formattedGrandTotal = grandTotal.toFixed(5);

        // Prevent Division by Zero
        const unitPrice = goodsWeight > 0 ? (grandTotal / goodsWeight).toFixed(5) : "0.00000";

        const userCurrency = invoice?.usercurrency || ""; // Default to USD if missing
        console.log(userCurrency);

        // 2. Scheme & Pallet Logic
        let schemeLicenceValue = "";
        let schemeDate = "";
        let isPallat = false;
        let pallatCount = 0;
        let pallatWeight = 0;
        let pallatTyres = 0
        let isWoodenBox = false;
        let woodenBoxCount = 0;
        let woodenBoxTyres = 0;
        let woodenBoxWeight = 0;

        const listToCheck = invoice.schemeDetails || []; // Default to empty array

        const hsnCodeForScheme = matchedHSN.find(h => h.scheme === invoice.scheme?.toUpperCase());

        if (invoice.scheme && Array.isArray(listToCheck)) {
          const matched = listToCheck.find((item) => item.scheme === invoice.scheme);

          if (matched) {
            schemeLicenceValue = matched.schemeNumber || "";
            schemeDate = matched.schemeDate || "";

            // Pallet (existing)
            isPallat = Boolean(matched.isPallat);
            pallatCount = Number(matched.pallatCount ?? 0);
            pallatTyres = Number(matched.numberOfTyres ?? 0);
            pallatWeight = Number(matched.pallatWeight ?? 0);

            // Wooden box (new)
            isWoodenBox = Boolean(matched.isWoodenBox);
            woodenBoxCount = Number(matched.woodenBoxCount ?? 0);
            woodenBoxTyres = Number(matched.woodenBoxTyres ?? 0);
            woodenBoxWeight = Number(matched.woodenBoxWeight ?? 0);
          }

        }

        // Calculate Total Gross Weight
        const totalInvoiceQty = totalqty; // (calculated from invoice.items previously)
        const palletizedQty = Number(pallatTyres) || 0; // The entered 'numberOfTyres'
        const woodenBoxQty = Number(woodenBoxTyres) || 0;
        const totalPacked = palletizedQty + woodenBoxQty;
        const looseQty = totalInvoiceQty - totalPacked;

        const totalGrossWeight =
          (Number(goodsWeight) || 0) +
          (isPallat ? (Number(pallatWeight) || 0) : 0) +
          (isWoodenBox ? (Number(woodenBoxWeight) || 0) : 0);


        // ---- TYRE COUNT OBJECT ----
        const tyreCount = {
          ...(looseQty > 0 && {
            looseTyre: `${looseQty} LOOSE TYRES`
          }),
          ...(palletizedQty > 0 && {
            palletizedTyres: `${palletizedQty} PALLETIZED TYRES`
          }),
          ...(woodenBoxQty > 0 && {
            woodenBoxTyres: `${woodenBoxQty} WOODEN BOX TYRES`
          })
        };
        // 🔥 NEW — Read dynamic additional charges from user form
        // ⭐ 1. Get additional charges for this invoice
        const addCharges = invoice.additionalCharges?.find(
          (x) => x.invoiceIndex === index + 1
        );

        // 2. Extract first 3 rows (safe)
        const row1 = addCharges?.rows?.[0] || {};
        const row2 = addCharges?.rows?.[1] || {};
        const row3 = addCharges?.rows?.[2] || {};

        // ⭐ 3. Create your old fields (legacy support)
        const otherCharges1 = row1.desc || "";
        const otherChargesValue1 = Number(row1.value) || 0;

        const otherCharges2 = row2.desc || "";
        const otherChargesValue2 = Number(row2.value) || 0;

        const otherCharges3 = row3.desc || "";
        const otherChargesValue3 = Number(row3.value) || 0;

        // ⭐ 4. Build modern array (PDF table)
        const otherCharges = [
          ...(otherChargesValue1 > 0
            ? [{ name: otherCharges1, value: otherChargesValue1 }]
            : []),
          ...(otherChargesValue2 > 0
            ? [{ name: otherCharges2, value: otherChargesValue2 }]
            : []),
          ...(otherChargesValue3 > 0
            ? [{ name: otherCharges3, value: otherChargesValue3 }]
            : []),
        ];

        // ⭐ 5. Total
        const additionalChargesTotal = otherCharges.reduce(
          (sum, x) => sum + Number(x.value || 0),
          0
        );

        // ⭐ 6. Updated grandTotal
        const finalGrandTotal = (grandTotal + additionalChargesTotal).toFixed(2);



        console.log(finalGrandTotal);
        // 3. Return Sanitized Data (NO NULLS ALLOWED)
        return {
          invoiceNumber: Number(invoice?.invoiceNumber || 0) + index,
          orderRefNo: invoice?.orderRefNo || "",
          unitPrice, // Already a string
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          HSNCode: hsnCodeForScheme?.HSNCODE || [],
          buyersOrderNo: invoice?.orderRefNo || "",
          BuyersOrderNumber: invoice?.BuyersOrderNumber || "",
          refDate: invoice?.rfD_Date
            ? `E MAIL DATE ${invoice.rfD_Date}`
            : "",
          otherReferences: "SDF Form",
          exporter: invoice?.exporterAuthorizedAddress || "",
          consignee: {
            name: invoice?.billingCompanyName || "",
            address: invoice?.billingAddress?.split("~") || [],
            city: invoice?.billingCity?.toUpperCase() || "",
            state: invoice?.billingState?.toUpperCase() || "",
            country: invoice?.billingCountry?.toUpperCase() || "",
          },
          notifyParty: invoice.notifyParty,
          customerAgent: invoice?.customerAgent || "",
          preCarriageBy: invoice?.preCarriageBy?.toUpperCase() || "",
          placeOfReceipt: invoice?.placeOfReceiptByPreCarrier?.toUpperCase() || "",
          vesselFlightNo: invoice?.vesselFlightNo || "",
          portOfLoading: invoice?.portOfLoading?.toUpperCase() || "",
          portOfDischarge: invoice?.portOfDischarge?.toUpperCase() || "",
          finalDestination: invoice?.finalDestination?.toUpperCase() || "",
          buyerIfOtherThanConsignee: {
            name: invoice?.shippingCompanyName || "",
            address: invoice?.shippingAddress?.split("~") || [],
            city: invoice?.shippingCity?.toUpperCase() || "",
            state: invoice?.shippingState?.toUpperCase() || "",
            country: invoice?.shippingCountry?.toUpperCase() || "",
          },
          countryOfOrigin: invoice?.countryOfOriginOfGoods?.toUpperCase() || "",
          countryOfDestination: invoice?.shippingCountry?.toUpperCase() || "",
          incoterm: invoice?.incoterm || "",
          placeOfIncoterm:(invoice?.placeOfIncoterm).toUpperCase()||"",
          paymentTerms: invoice?.paymentTerms || "",
          bankDetails: {
            accountHolder: "Sun Tyre & Wheel Systems (A Div of SUNDARAM INDUSTRIES PRIVATE LIMITED)",
            address: "KRISHNA TOWERS, 3RD FLOOR, NP-31B/4, THIRU-VI-KA INDUSTRIAL ESTATE, EKKATTUTHANGAL, CHENNAI - 600 032",
            accountNumber: "40582959714",
            bank: "State Bank of India, Egmore, Chennai-600008.",
            swiftCode: "SBININBB174",
          },
          containerDetails: {
            size: invoice?.containerType || "",
            containerNo: invoice?.containerNo || "",
            linerSealNo: invoice?.containerSEALNO || "",
            otsNo: invoice?.otsNo || "",
          },
          packingDetails: {
            itcHsNo: hsnCodeForScheme?.HSNCODE?.join(", ") || "",
            description: hsnCodeForScheme?.HSNCODE
              ?.map(code => HSN_CODE.find(item => item.hsn === code)?.description?.toUpperCase() || "")
              .join(" , ")
              .trim() || ""
          },
          otherCharges,

          items: invoice.items || [],
          usercurrency: userCurrency,
          currencySymble: getCurrencySymble(userCurrency),

          quantityKgs: goodsWeight,

          // 🔥 CRITICAL FIX: Do not pass null here. Use empty string.
          unitPriceUsd: "",

          totalPrices: formattedGrandTotal,
          // totalValue: formattedGrandTotal,
          grandTotal: finalGrandTotal,

          amountInWords: `${userCurrency} ${numberToWords(parseFloat(finalGrandTotal), userCurrency)}`,

          // Ensure these are strings
          grossWeight: totalGrossWeight.toFixed(3),
          netWeight: goodsWeight.toFixed(3),
          totalqty: totalqty,
          pallatWeight,
          pallatCount: Number(pallatCount),
          pallatTyres,
          isWoodenBox,
          woodenBoxCount,
          woodenBoxWeight,
          woodenBoxTyres,
          declaration: "WE DECLARE THAT THIS INVOICE CUM PACKING LIST SHOWS THE ACTUAL PRICE OF GOODS DESCRIBED AND ALL THE PARTICULARS ARE TRUE AND CORRECT.",
          licenceDetails: {
            description: `This Shipment is Under ${invoice?.scheme || ""} Scheme. ${invoice?.scheme === "Direct" ? "" : `Licence No. ${schemeLicenceValue} dt. ${schemeDate}`}`,
            igstLUT: "IGST-Letter Of Undertaking (ARN)AD3302240385774 valid till 31.03.2025",
          },
          authorizedSignatory: "FOR SUNDHARAM INDUSTRIES PRIVATE LIMITED",
          footer: {
            line1: "SUNDARAM INDUSTRIES PRIVATE LIMITED (Formerly Known as T.S.Rajam Tyres Private Limited) Regd Office: 'NO. 10",
            line2: "Jawahar road Chokkikulam, Madurai - 625002.",
            line3: "CIN:U51901TN2018PTC121156 Email: crm@sun-tws.com , Website: www.sun-tws.com , Tel: 044 - 43857129",
          },
          tyreCount: tyreCount,

        };
      });
      state.exportInvoices.FinalInvoicePDFData = data;
    },
    setPdfBlob: (state, action) => {
      state.exportInvoices.pdfBlob = action.payload;
    },
    setShowSubmit: (state, action) => {
      state.exportInvoices.showSubmmit = action.payload;
    },
  },
});

// Thunk for async API call
export const getExportInvoice = (payload) => async (dispatch) => {

  try {
    dispatch(setExportInvoiceLoading(true));
    if (payload.type === "Customer") {
      const res = await api.get(`/Invoice/GettingSpecificOrders/${payload.id}`, { withCredentials: true });
      const data = res.data

      await dispatch(setExportInvoiceSalesDetails({ ...data, ...payload }));
    }

    if (payload.type === "Custom") {
      const res = await api.get(`/Invoice/GettingSpecificOrders/${payload.id}`, { withCredentials: true });
      const data = res.data
      await dispatch(setExportInvoiceSalesDetails({ ...data, ...payload }));
      // await dispatch(setExportInvoiceSalesDetails({ ...data, ...payload }));

    }
  } catch (error) {
    dispatch(setExportInvoiceError(error.message));
    console.error("Failed to fetch invoice:", error);
  }
};

// get the all exports data
export const getExportInvoiceAll = (payload) => async (dispatch) => {
  try {
    dispatch(setExportInvoiceLoading(true));
    dispatch(resetExportInvoiceDetails());
    if (payload?.type === "Customer") {
      const res = await api.get(`/Invoice/GettingCustomerInvoiceReadyOrders`, {
        withCredentials: true,
      });
      await dispatch(setExportInvoiceList(res.data));
    }
    if (payload?.type === "Custom") {
      const res = await api.get(`/Invoice/GettingInvoiceReadyOrders`, {
        withCredentials: true,
      });
      await dispatch(setExportInvoiceList(res.data));
      // const data = generateTableData(20)

      // await dispatch(setExportInvoiceList(data));
    }
  } catch (error) {
    await dispatch(setExportInvoiceError(error.message));
    console.error("Failed to fetch invoices Data:", error.message);
    toast.error(error.message)
  }

};
const parseDMY = (dateStr) => {
  if (!dateStr) return null;
  const [dd, mm, yyyy] = dateStr.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

export const submitInvoice = (payload, navigate) => async (dispatch) => {
  const safeISODate = (value) => {
    if (!value || typeof value !== "string") return null;

    const cleaned = value.trim();
    if (!cleaned) return null;

    const separator = cleaned.includes("/") ? "/" : "-";
    const [day, month, year] = cleaned.split(separator);
    if (!day || !month || !year) return null;

    const d = new Date(`${year}-${month}-${day}`);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  try {
    dispatch(setExportInvoiceLoading(true));

    const formattedPayload = {
      finalInvoiceDetails: payload.map((data, index) => {

        const invoiceIndex = index + 1;

        const match = (data.additionalCharges || []).find(
          (item) => item.invoiceIndex === invoiceIndex
        );

        // rows extracted safely
        const rows = match?.rows || [];

        const row1 = rows[0] || { desc: "", value: 0 };
        const row2 = rows[1] || { desc: "", value: 0 };
        const row3 = rows[2] || { desc: "", value: 0 };

        const otherCharges1 = row1.desc || "";
        const otherCharges2 = row2.desc || "";
        const otherCharges3 = row3.desc || "";

        const otherChargesValue1 = Number(row1.value) || 0;
        const otherChargesValue2 = Number(row2.value) || 0;
        const otherChargesValue3 = Number(row3.value) || 0;

        // grand total + additional charges
        const finalGrandTotal =
          (parseFloat(data.grandTotal) || 0) +
          otherChargesValue1 +
          otherChargesValue2 +
          otherChargesValue3;

        // --------------------------------------------------------

        return {
          o_ID: Number(data.o_id) || 0,
          exchangeRate: data.ExchangeCurrency || 0,
          type: (data.type)?.toUpperCase() || "",
          billID: Number(data.billid) || 0,
          shipID: Number(data.shipid) || 0,
          custCode: Number(data.custCode) || 0,
          custFullName: data.custfullname || "",
          orderRefNo: data.orderRefNo || "",
          buyersOrderRefNo: data.BuyersOrderNumber || "",
          exportAuthorisedAddress: data.exporterAuthorizedAddress || "",
          isSchemeSplit: Boolean(data.items.some((i) => i.isSplit)),
          dispatchedDate: safeISODate(data.dispatchedDate),
          shipmentType: data.shipmentType || "",
          userCurrency: data.usercurrency || "",
          billingCompanyName: data.billingCompanyName || "",
          billingAddress: data.billingAddress || "",
          billingCity: data.billingCity || "",
          billingState: data.billingState || "",
          billingCountry: data.billingCountry || "",
          billingZipcode: data.billingZipcode || "",
          billingContactName: data.billingContactName || "",
          billingEmailId: data.billingEmailId || "",
          billingMobile: data.billingMobile || "",
          completedDate: safeISODate(data.completedDate),
          rfD_Date: safeISODate(data.rfD_Date),
          totalQty: data.totalqty || "",
          plant: data.containerLoadFrom || "",
          isScheme: Boolean(data.items.some((i) => i.isScheme)),
          itcHsNo: data.itcHsNo || "",
          licenceDate: safeISODate(data.licenceDate ?? data.schemeDate),
          paymentTerms: data.paymentTerms || "",
          schemeId: 0,
          schemeLicences: data.schemeLicences || "",
          schemeDate: safeISODate(data.schemeDate),

          shippingCompanyName: data.shippingCompanyName || "",
          shippingAddress: data.shippingAddress || "",
          shippingCity: data.shippingCity || "",
          shippingState: data.shippingState || "",
          shippingCountry: data.shippingCountry || "",
          shippingZipcode: data.shippingZipcode || "",
          shippingContactName: data.shippingContactName || "",
          shippingEmailId: data.shippingEmailId || "",
          shippingMobile: data.shippingMobile || "",

          preCarriageBy: data.preCarriageBy || "",
          invoiceNumber: String(data.invoiceNumber || ""),
          invoiceDate: safeISODate(data.invoiceDate) || new Date().toISOString(),
          containerLoadFrom: data.containerLoadFrom || "",
          containerNo: data.containerNo || "",
          countryOfOriginOfGoods: data.countryOfOriginOfGoods || "",
          portOfLoading: data.portOfLoading || "",
          portOfDischarge: data.portOfDischarge || "",
          containerType: data.containerType || "",
          containerSEALNO: data.containerSEALNO || "",
          placeOfReceiptByPreCarrier: data.placeOfReceiptByPreCarrier || "",
          finalDestination: data.finalDestination || "",
          countryoffinaldestination: data.shippingCountry || "",
          inCoterm: (data.incoterm)?.toUpperCase() || "",
          placeOfIncoterm:data.placeOfIncoterm||"",
          scheme: data.scheme || "",

          // ---------------------------------------------------
          // 💥 SEND NEW ADDITIONAL CHARGES TO API
          // ---------------------------------------------------
          otherCharges1,
          otherCharges2,
          otherCharges3,
          otherChargesValue1,
          otherChargesValue2,
          otherChargesValue3,
          // ---------------------------------------------------

          otherDiscount: data.otherDiscount || 0,
          paymentermsId: 0,
          otsNo: data.otsNo || 0,
          paymentDays: data.paymentDays || 0,

          // GRAND TOTAL WITH NEW VALUES
          grandTotal: finalGrandTotal,

          totalPrice: data.totalPrice || 0,
          totalWeight: parseFloat(data.grossWeight) || 0,
          netweight: parseFloat(data.totalwt) || 0,

          amountInWords: `${data?.usercurrency} ${numberToWords(finalGrandTotal, data?.usercurrency)}`,

          docUnitPrice: String(data.unitPrice || 0),

          // pallet fields
          isPallet: data.isPallat || false,
          palletCount: data.pallatCount || 0,
          palletTyres: data.pallatTyres || 0,
          palletWeight: data.pallatWeight || 0,

          // wooden fields
          isWoodenBox: data.isWoodenBox || false,
          woodenBoxCount: data.woodenBoxCount || 0,
          woodenBoxTyres: data.woodenBoxTyres || 0,
          woodenBoxWeight: data.woodenBoxWeight || 0,

          workorderno: data.workorderno || "",

          notifyPartyAddress: data.notifyPartyAddress || "",
          notifyPartyCity: data.notifyPartyCity || "",
          notifyPartyCountry: data.notifyPartyCountry || "",
          notifyPartyEmail: data.notifyPartyEmail || "",
          notifyPartyName: data.notifyPartyName || "",
          notifyPartyPhone: data.notifyPartyPhone || "",
          notifyPartyState: data.notifyPartyState || "",

          items: data.items.map((item) => ({
            category: item.category || "",
            Platforms: item.platforms || "",
            tyreSize: item.tyreSize || "",
            edcRimSize: item.edcRimSize || "",
            tyreRim: item.tyreRim || "",
            tyreType: item.tyreType || "",
            brand: item.brand || "",
            sidewall: item.sidewall || "",
            basicPrice: parseFloat(item.basicprice) || 0,
            finishedWt: parseFloat(item.finishedWt) || 0,
            o_itemid: Number(item.o_itemid) || 0,
            itemCode: item.itemCode || "",
            isAssRimstatus: item.rimStatus > 0,
            rimItemcode: item.edcNo || "",
            rimItemsize: item.edcRimSize || "",
            rimUnitprice: Number(item.rimUnitPrice) || 0,
            O_ID: Number(item.o_ID) || 0,
            plant: item.plant || "",
            additionalInfo: item.additionalInfo || "",
            scheme: item.scheme || "",
            isScheme: Boolean(item.isScheme),
            isschemeSplit: Boolean(item.isSplit),
            actualQty: Number(item.itemQty) || 0,
            itemQty: Number(item.itemQty) || 0,
            hsnCode: item.hsnCode || 0,
          })),
        };
      }),
    };

    console.log("✅ FINAL PAYLOAD:", formattedPayload);

    const res = await api.post("/Invoice/CreatingInvoices", formattedPayload, {
      withCredentials: true,
    });

    dispatch(setExportInvoiceLoading(false));

    if (res.status === 200) {
      toast.success("File Uploaded Successfully");
    }
  } catch (error) {
    dispatch(setExportInvoiceLoading(false));
    console.error("❌ Error uploading invoice:", error.response?.data || error);
    toast.error("Failed to upload invoice");
  }
};




export const splitInvoiceByScheme = (invoice) => {
  const itemByScheme = invoice.items.reduce((acc, item) => {
    if (!acc[item.scheme]) {
      acc[item.scheme] = [];
    }
    acc[item.scheme].push(item);
    return acc;
  }, {});

  const invoices = Object.entries(itemByScheme).map(([scheme, items]) => {
    return {
      ...invoice,
      items, // only items of this scheme
      scheme, // optional: attach scheme at invoice level
    };
  });
  return invoices;
};

// Exports
export const {
  setExportInvoiceSalesDetails,
  // setExportInvoiceAddressDetails,
  setExportInvoiceLoading,
  setExportInvoiceError,
  setExportInvoiceList,
  resetExportInvoiceDetails,
  setExportAdditionalInvoice,
  setInvoicePDF,
  setInvoiceType,
  setSplitResult,
  SetupdatedInvoiceDetails,
  setFinalInvoiceData,
  setLocalItems,
  setSplitItems,
  setPdfBlob,
  setShowSubmit,
  setIsPallate,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
