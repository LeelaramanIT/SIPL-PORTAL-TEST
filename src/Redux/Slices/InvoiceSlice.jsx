import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/axios";
import axios from "axios";
import toast from "react-hot-toast";
import { numberToWords } from "../../utils/NumberToWords";
// import { data, generateTableData } from "../../utils/DummyJSON";
import { getCurrency, getCurrencySymble } from "../../utils/currencies";
import { HSN_CODE } from "../../utils/HSNCODE";
import { useMemo } from "react";

const downloadPDF = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};


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
    // Customer
    invoiceCustDetails: [],
    additionalCustForm: null,
    finalCustomerData: null,
  },

  domesticInvoices: {
    listOfInvoices: [],
    loading: false,
    error: null,
  },
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setExportInvoiceSalesDetails: (state, action) => {
      // custom invoice details
      state.exportInvoices.invoiceDetails = action.payload;
      state.exportInvoices.loading = false;
      state.exportInvoices.error = null;
    },
    setExportCustInvoiceSalesDetails: (state, action) => {
      // customer invoice details
      state.exportInvoices.invoiceCustDetails = action.payload;
      state.exportInvoices.loading = false;
      state.exportInvoices.error = null;
    },

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
    setExportCustAdditionalInvoice: (state, action) => {
      state.exportInvoices.additionalCustForm = action.payload;
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
      state.exportInvoices.isPallateChecked = action.payload;
    },
    // ...inside the invoiceSlice reducers

    setFinalInvoiceData: (state, action) => {
      // 1️⃣ Split invoices by scheme
      const groupedInvoices = splitInvoiceByScheme(action.payload);
      const totalInvoices = groupedInvoices.length;

      // 2️⃣ Prepare processed invoices
      const processedInvoices = groupedInvoices.map((invoice, index) => {
        // Calculate totals
        const totalqty = invoice.items.reduce(
          (acc, item) => acc + (Number(item.itemQty) || 0),
          0,
        );
        const totalwt = invoice.items.reduce((acc, item) => {
          const finishedWt = Number(item.finishedWt) || 0;
          const rimFinishedWt = Number(item.rimfinishedwt) || 0;
          const qty = Number(item.itemQty) || 0;

          return acc + (finishedWt + rimFinishedWt) * qty;
        }, 0);

        const grandTotal = invoice.items.reduce((acc, item) => {
          const tyre = Number(item?.basicprice) || 0;
          const rim = Number(item?.rimUnitPrice) || 0;
          const qty = Number(item?.itemQty) || 0;

          return acc + (tyre + rim) * qty;
        }, 0);
        console.log("grandTotal.....", grandTotal);

        const unitPrice =
          totalwt > 0 && !Number.isNaN(grandTotal)
            ? (grandTotal / totalwt).toFixed(5)
            : "0.00000";
        const userCurrency = invoice?.usercurrency;

        // 3️⃣ Extract the scheme value directly (not array)
        let schemeLicenceValue = "";
        let schemeDate = "";
        let isPallat = false;
        let pallatCount = "";
        let pallatWeight = "";
        let pallatTyres = 0;
        let palletDimension = 0;
        let isWoodenBox = false;
        let woodenBoxCount = 0;
        let woodenBoxTyres = 0;
        let woodenBoxWeight = 0;
        let woodenBoxDimension = 0;
        let InvoiceDiscription = "";
        let ImportedCountryOfOriginGoods = "";
        let ImportedREXNumber = "";
        let plantAddress = "";

        // Note: Use 'schemeDetails' if you used the updated code from the previous step,
        // otherwise use 'schemeLicences'
        const listToCheck = invoice.schemeDetails;

        if (invoice.scheme && Array.isArray(listToCheck)) {
          // 1. Find the object that matches the current invoice scheme name
          const matched = listToCheck.find(
            (item) => item.scheme === invoice.scheme,
          );
          if (matched) {
            schemeLicenceValue = matched.schemeNumber || "";
            schemeDate = matched.schemeDate || "";

            // Pallet (existing)
            isPallat = Boolean(matched.isPallat);
            pallatCount = Number(matched.pallatCount ?? 0);
            pallatTyres = Number(matched.numberOfTyres ?? 0);
            pallatWeight = Number(matched.pallatWeight ?? 0);
            palletDimension = matched.palletDimension || "";

            // Wooden box (new)
            isWoodenBox = Boolean(matched.isWoodenBox);
            woodenBoxCount = Number(matched.woodenBoxCount ?? 0);
            woodenBoxTyres = Number(matched.woodenBoxTyres ?? 0);
            woodenBoxWeight = Number(matched.woodenBoxWeight ?? 0);
            woodenBoxDimension = matched.woodenBoxDimension || "";

            InvoiceDiscription = matched.InvoiceDiscription || "";
            ImportedCountryOfOriginGoods =
              matched.ImportedCountryOfOriginGoods || "";
            ImportedREXNumber = matched.ImportedREXNumber || "";
            plantAddress = matched.plantAddress || "";
          }
        }

        const totalGrossWeight =
          (Number(totalwt) || 0) +
          (isPallat ? Number(pallatWeight) || 0 : 0) +
          (isWoodenBox ? Number(woodenBoxWeight) || 0 : 0);

        // 🔥 READ ADDITIONAL CHARGES (same as submit)
        const addCharges = invoice.additionalCharges?.find(
          (x) => x.invoiceIndex === index + 1,
        );

        const rows = addCharges?.rows || [];

        const row1 = rows[0] || { desc: "", value: 0 };
        const row2 = rows[1] || { desc: "", value: 0 };
        const row3 = rows[2] || { desc: "", value: 0 };

        const otherCharges1 = row1.desc || "";
        const otherCharges2 = row2.desc || "";
        const otherCharges3 = row3.desc || "";

        const otherChargesValue1 = Number(row1.value) || 0;
        const otherChargesValue2 = Number(row2.value) || 0;
        const otherChargesValue3 = Number(row3.value) || 0;

        const addDiscounts = invoice.discountDetails?.find(
          (x) => x.invoiceIndex === index + 1,
        );
        const discountRows = addDiscounts?.rows || [];

        const disrow1 = discountRows[0] || { desc: "", value: 0 };
        const disrow2 = discountRows[1] || { desc: "", value: 0 };
        const disrow3 = discountRows[2] || { desc: "", value: 0 };

        const discount1 = disrow1.desc || "";
        const discount2 = disrow2.desc || "";
        const discount3 = disrow3.desc || "";

        const discountValue1 = Number(disrow1.value) || 0;
        const discountValue2 = Number(disrow2.value) || 0;
        const discountValue3 = Number(disrow3.value) || 0;

        const totalDiscount = discountRows.reduce(
          (acc, row) => acc + (Number(row.value) || 0),
          0,
        );

        const finalGrandTotal =
          grandTotal +
          otherChargesValue1 +
          otherChargesValue2 +
          otherChargesValue3 -
          totalDiscount;

        const formattedGrandTotal = finalGrandTotal.toFixed(5);
        const baseInvoiceNumber = Number(invoice.invoiceNumber);
        const finalInvoiceNumber = Number.isFinite(baseInvoiceNumber)
          ? baseInvoiceNumber + index // 🔥 increases by 1 per invoice
          : invoice.invoiceNumber;

        // 4️⃣ Return final invoice with single schemeLicence value
        return {
          ...invoice,
          invoiceNumber: finalInvoiceNumber,
          totalqty,
          totalwt: `${totalwt.toFixed(3)}`,
          grossWeight: `${totalGrossWeight.toFixed(3)}`,

          // ✅ UPDATED GRAND TOTAL
          grandTotal: formattedGrandTotal,
          totalPrices: grandTotal.toFixed(5),

          // ✅ STORE OTHER CHARGES (EXACT FIELDS YOU WANT)
          otherCharges1,
          otherCharges2,
          otherCharges3,
          otherChargesValue1,
          otherChargesValue2,
          otherChargesValue3,
          discount1,
          discount2,
          discount3,
          discountValue1,
          discountValue2,
          discountValue3,
          amountInWords: `${userCurrency}${numberToWords(
            Number.isFinite(finalGrandTotal) ? finalGrandTotal : 0,
            userCurrency,
          )}`,

          unitPrice,
          schemeLicences: schemeLicenceValue,
          schemeDate,

          isPallat,
          pallatCount: isPallat ? pallatCount : 0,
          pallatWeight: isPallat ? pallatWeight : 0,
          pallatTyres: isPallat ? pallatTyres : 0,
          palletDimension: palletDimension ? palletDimension : "",

          isWoodenBox,
          woodenBoxCount: isWoodenBox ? woodenBoxCount : 0,
          woodenBoxTyres: isWoodenBox ? woodenBoxTyres : 0,
          woodenBoxWeight: isWoodenBox ? woodenBoxWeight : 0,
          woodenBoxDimension: woodenBoxDimension ? woodenBoxDimension : "",
          InvoiceDiscription: InvoiceDiscription ? InvoiceDiscription : "",
          ImportedCountryOfOriginGoods: ImportedCountryOfOriginGoods
            ? ImportedCountryOfOriginGoods
            : "",
          ImportedREXNumber: ImportedREXNumber ? ImportedREXNumber : "",
          plantAddress: plantAddress ? plantAddress : "",
        };
      });

      // 5️⃣ Save result in Redux state

      state.exportInvoices.FinalInvoiceDetails = processedInvoices;
    },

    // now part of setFinalInvoiceData.
    SetupdatedInvoiceDetails: (state, action) => {
      state.exportInvoices.updatedInvoiceDetails = action.payload;

      const invoices = splitInvoiceByScheme(action.payload);

      // hsncode
      const matchedHSN = invoices
        .map((invoice) => {
          const grouped = {};

          invoice.items?.forEach((item) => {
            if (!item.scheme) return;
            const scheme = item?.scheme.toUpperCase(); // Convert to UPPER
            if (!grouped[scheme]) grouped[scheme] = new Set();
            if (item.hsnCode) grouped[scheme].add(item.hsnCode);
          });

          return Object.keys(grouped).map((key) => ({
            scheme: key,
            HSNCODE: [...grouped[key]],
          }));
        })
        .flat();

      const totalInvoices = invoices.length;

      const data = invoices.map((invoice, index) => {
        // 1. Safe Math Calculations
        const totalqty = invoice.items.reduce(
          (acc, item) => acc + (Number(item.itemQty) || 0),
          0,
        );

        // Net Weight (Goods only)
        const goodsWeight = invoice.items.reduce((acc, item) => {
          const finishedWt = Number(item.finishedWt) || 0;
          const rimFinishedWt = Number(item.rimfinishedwt) || 0;
          const qty = Number(item.itemQty) || 0;

          return acc + (finishedWt + rimFinishedWt) * qty;
        }, 0);

        const totalPrices = invoice.items.map((item) => {
          const tyre = Number(item.basicprice) || 0;
          const rim = Number(item.rimUnitPrice) || 0;
          const qty = Number(item.itemQty) || 0;

          return (tyre + rim) * qty;
        });
        const grandTotal = totalPrices.reduce((acc, price) => acc + price, 0);
        const formattedGrandTotal = grandTotal.toFixed(5);

        // Prevent Division by Zero
        const unitPrice =
          goodsWeight > 0 ? (grandTotal / goodsWeight).toFixed(5) : "0.00000";

        const userCurrency = invoice?.usercurrency || ""; // Default to USD if missing

        // 2. Scheme & Pallet Logic
        let schemeLicenceValue = "";
        let schemeDate = "";
        let isPallat = false;
        let pallatCount = 0;
        let pallatWeight = 0;
        let pallatTyres = 0;
        let palletDimension = "";
        let isWoodenBox = false;
        let woodenBoxCount = 0;
        let woodenBoxTyres = 0;
        let woodenBoxWeight = 0;
        let woodenBoxDimension = "";
        let InvoiceDiscription = "";
        let plantAddress = "";

        const listToCheck = invoice.schemeDetails || []; // Default to empty array

        const hsnCodeForScheme = matchedHSN.find(
          (h) => h.scheme === invoice.scheme?.toUpperCase(),
        );


        if (invoice.scheme && Array.isArray(listToCheck)) {
          const matched = listToCheck.find(
            (item) => item.scheme === invoice.scheme,
          );

          if (matched) {
            schemeLicenceValue = matched.schemeNumber || "";
            schemeDate = matched.schemeDate || "";

            // Pallet (existing)
            isPallat = Boolean(matched.isPallat);
            pallatCount = Number(matched.pallatCount ?? 0);
            pallatTyres = Number(matched.numberOfTyres ?? 0);
            pallatWeight = Number(matched.pallatWeight ?? 0);
            palletDimension = matched.palletDimension
              ? String(matched.palletDimension).toUpperCase()
              : "";

            // Wooden box (new)
            isWoodenBox = Boolean(matched.isWoodenBox);
            woodenBoxCount = Number(matched.woodenBoxCount ?? 0);
            woodenBoxTyres = Number(matched.woodenBoxTyres ?? 0);
            woodenBoxWeight = Number(matched.woodenBoxWeight ?? 0);
            woodenBoxDimension = matched.woodenBoxDimension
              ? String(matched.woodenBoxDimension).toUpperCase()
              : "";
            InvoiceDiscription = matched.InvoiceDiscription;
            plantAddress = matched.plantAddress;
          }
        }

        // Calculate Total Gross Weight

        const totalInvoiceQty = totalqty; // (calculated from invoice.items previously)
        const palletizedQty = Number(pallatCount) || 0; // The entered 'numberOfTyres'
        const palletizedTyres = Number(pallatTyres) || 0;

        const woodenBoxQty = Number(woodenBoxCount) || 0;
        const woodenBoxedTyres = Number(woodenBoxTyres) || 0;

        const totalPacked = Number(palletizedQty) + Number(woodenBoxQty);

        const looseQty =
          Number(totalInvoiceQty) -
          Number(woodenBoxTyres) -
          Number(pallatTyres);

        const totalCount = looseQty + totalPacked;

        const totalGrossWeight =
          (Number(goodsWeight) || 0) +
          (isPallat ? Number(pallatWeight) || 0 : 0) +
          (isWoodenBox ? Number(woodenBoxWeight) || 0 : 0);

        // ---- TYRE COUNT OBJECT ----
        const tyreCount = {
          ...(looseQty > 0 && {
            looseTyre: `${looseQty} LOOSE TYRES`,
          }),
          ...(palletizedQty > 0 && {
            palletizedTyres: `${palletizedTyres} TYRES PACKED IN ${palletizedQty} ${palletizedQty > 1 ? "PALLETS" : "PALLET"}`,
            palletDimension,
          }),
          ...(woodenBoxQty > 0 && {
            woodenBoxTyres: `${woodenBoxedTyres} TYRES PACKED IN ${woodenBoxQty} ${woodenBoxQty > 1 ? "WOODEN BOXES" : "WOODEN BOX"} `,
            woodenBoxDimension,
          }),
          totalTyres: `TOTAL: ${totalCount}`,
        };
        // 🔥 NEW — Read dynamic additional charges from user form
        // ⭐ 1. Get additional charges for this invoice
        const addCharges = invoice.additionalCharges?.find(
          (x) => x.invoiceIndex === index + 1,
        );

        // 2. Extract first 3 rows (safe)
        const row1 = addCharges?.rows?.[0] || {};
        const row2 = addCharges?.rows?.[1] || {};
        const row3 = addCharges?.rows?.[2] || {};

        // ⭐ 3. Create your old fields (legacy support)
        const otherCharges1 = row1.desc || "";
        const otherChargesValue1 = Number(row1.value).toFixed(2) || 0;

        const otherCharges2 = row2.desc || "";
        const otherChargesValue2 = Number(row2.value).toFixed(2) || 0;

        const otherCharges3 = row3.desc || "";
        const otherChargesValue3 = Number(row3.value).toFixed(2) || 0;

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
          0,
        );
        // ------------------------------------------
        // 🔥 NEW CODE: Process Discounts for PDF
        // ------------------------------------------
        const addDiscounts = invoice.discountDetails?.find(
          (x) => x.invoiceIndex === index + 1,
        );
        const discountRows = addDiscounts?.rows || [];
        // Create array for PDF Table (Optional, if you want to list them)
        const otherDiscountsList = discountRows
          .filter((row) => Number(row.value) > 0)
          .map((row) => ({
            name: row.desc,
            value: Number(row.value).toFixed(2),
          }));
        // Calculate Total
        const totalDiscount = discountRows.reduce(
          (sum, x) => sum + Number(x.value || 0),
          0,
        );

        // ⭐ 6. Updated grandTotal
        const finalGrandTotal = (
          grandTotal +
          additionalChargesTotal -
          totalDiscount
        ).toFixed(2);

        // 3. Return Sanitized Data (NO NULLS ALLOWED)
        const isDirectScheme =
          invoice?.scheme === "Import Invoice" ||
          invoice?.scheme === "DDB" ||
          invoice?.scheme === "Direct";
        const hasRimAssembly = invoice.items?.some(
          (item) => item.rimStatus === true,
        );
        const baseInvoiceNumber = Number(invoice.invoiceNumber);
        const finalInvoiceNumber = Number.isFinite(baseInvoiceNumber)
          ? baseInvoiceNumber + index // 🔥 increases by 1 per invoice
          : invoice.invoiceNumber;

        // const hasRimAssembly = data?.items?.some(
        //   (item) => item.rimStatus === true
        // );

        const hasRimOnly = invoice.items?.some(
          (item) => item.hsnCode === "84312010"
        );

        let finalDescription = "SOLID INDUSTRIAL TYRES";

        // Priority 1 – Rim Assembly
        if (hasRimAssembly) {
          finalDescription = "SOLID INDUSTRIAL TYRES WITH RIM ASSEMBLY";
        }
        // Priority 2 – Rim Only
        else if (hasRimOnly) {
          finalDescription = "SOLID INDUSTRIAL TYRES WITH RIM";
        }

        return {
          invoiceNumber: finalInvoiceNumber,
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
          refDate: invoice?.completedDate ? `E MAIL DATE ${invoice.completedDate}` : "",
          otherReferences: "SDF Form",
          exporter: invoice?.exporterAuthorizedAddress || "",
          plantAddress: plantAddress || "",
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
          placeOfReceipt:
            invoice?.placeOfReceiptByPreCarrier?.toUpperCase() || "",
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
          countryOfOrigin:
            invoice?.scheme === "Import Invoice"
              ? invoice?.schemeDetails
                ?.find((s) => s.scheme === "Import Invoice")
                ?.ImportedCountryOfOriginGoods?.toUpperCase() || ""
              : invoice?.countryOfOriginOfGoods?.toUpperCase() || "",
          // countryOfOrigin: invoice?.countryOfOriginOfGoods?.toUpperCase() || "",
          countryOfDestination:
            invoice?.countryOfDestination?.toUpperCase() || "",
          containerLoadFrom: invoice?.containerLoadFrom?.toUpperCase() || "",
          incoterm: invoice?.incoterm || "",
          placeOfIncoterm: invoice?.placeOfIncoterm?.toUpperCase() || "",
          paymentTerms: invoice?.paymentTerms || "",
          REXNumber:
            invoice?.scheme === "Import Invoice"
              ? invoice?.schemeDetails
                ?.find((s) => s.scheme === "Import Invoice")
                ?.ImportedREXNumber?.toUpperCase() || ""
              : invoice?.REXNumber?.toUpperCase() || "",
          bankDetails: {
            accountHolder:
              "Sun Tyre & Wheel Systems (A Div of SUNDARAM INDUSTRIES PRIVATE LIMITED)",
            address:
              "KRISHNA TOWERS, 3RD FLOOR, NP-31B/4, THIRU-VI-KA INDUSTRIAL ESTATE, EKKATTUTHANGAL, CHENNAI - 600 032",
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
            description: finalDescription,
          },
          otherCharges,
          otherDiscountsList,
          items: invoice.items || [],
          usercurrency: userCurrency,
          currencySymble: getCurrencySymble(userCurrency),

          quantityKgs: goodsWeight,

          // 🔥 CRITICAL FIX: Do not pass null here. Use empty string.
          unitPriceUsd: "",

          totalPrices: formattedGrandTotal,
          // totalValue: formattedGrandTotal,
          otherDiscount: totalDiscount,
          grandTotal: finalGrandTotal,

          amountInWords: `${numberToWords(
            Number.isFinite(Number(finalGrandTotal))
              ? Number(finalGrandTotal)
              : 0,
            userCurrency,
          )}`,

          // Ensure these are strings
          grossWeight: totalGrossWeight.toFixed(3),
          netWeight: goodsWeight.toFixed(3),
          totalqty: totalqty,
          pallatWeight,
          pallatCount: Number(pallatCount),
          pallatTyres,
          palletDimension,
          isWoodenBox,
          woodenBoxCount,
          woodenBoxWeight,
          woodenBoxTyres,
          woodenBoxDimension,
          declaration:
            "WE DECLARE THAT THIS INVOICE CUM PACKING LIST SHOWS THE ACTUAL PRICE OF GOODS DESCRIBED AND ALL THE PARTICULARS ARE TRUE AND CORRECT.",
          licenceDetails: {
            description: isDirectScheme
              ? InvoiceDiscription
              : `This Shipment is Under ${invoice?.scheme || ""} Scheme. Licence No. ${schemeLicenceValue} dt. ${schemeDate}`,

            igstLUT: invoice?.IGSTLUT || "",
            REXNumber:
              invoice?.scheme === "Import Invoice"
                ? invoice?.schemeDetails
                  ?.find((s) => s.scheme === "Import Invoice")
                  ?.ImportedREXNumber?.toUpperCase() || ""
                : invoice?.REXNumber?.toUpperCase() || "",
            scheme: invoice?.scheme || "",
          },
          InvoiceDis: isDirectScheme ? "" : InvoiceDiscription || "",
          authorizedSignatory: "FOR SUNDHARAM INDUSTRIES PRIVATE LIMITED",
          footer: {
            line1:
              "SUNDARAM INDUSTRIES PRIVATE LIMITED (Formerly Known as T.S.Rajam Tyres Private Limited) Regd Office: 'NO. 10",
            line2: "Jawahar road Chokkikulam, Madurai - 625002.",
            line3:
              "CIN:U51901TN2018PTC121156 Email: crm@sun-tws.com , Website: www.sun-tws.com , Tel: 044 - 43857129",
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

    // invoice customer list
    setExportInvoiceCustlist: (state, action) => {
      state.exportInvoices.ListOfCustInvoice = action.payload;
      state.exportInvoices.loading = false;
      state.exportInvoices.error = null;
    },
    setFinalCustomerData: (state, action) => {
      const base = state.exportInvoices.invoiceCustDetails || {};
      const extra = state.exportInvoices.additionalCustForm || {};
      state.exportInvoices.finalCustomerData = {
        ...base,
        ...extra,
      };
    },
    resetCustomerAdditionalData: (state) => {
      state.exportInvoices.additionalCustForm = null;
      state.exportInvoices.finalCustomerData = null;
    },
  },
});

// Thunk for async API call
export const getExportInvoice = (payload) => async (dispatch) => {
  try {
    dispatch(setExportInvoiceLoading(true));
    if (payload.type === "Customer") {
      const res = await api.get(
        `/Invoice/GettingSpecificCustOrders/${payload.id}`,
        { withCredentials: true },
      );
      const data = res.data;

      await dispatch(setExportCustInvoiceSalesDetails({ ...data, ...payload }));
    }

    if (payload.type === "Custom") {
      const res = await api.get(
        `/Invoice/GettingSpecificOrders/${payload.id}`,
        { withCredentials: true },
      );
      const data = res.data;
      console.log("Invoice Details Response:", data);

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
      const res = await api.get(`/Invoice/GettingCustInvoiceReadyOrders`, {
        withCredentials: true,
      });
      // console.log("Export Invoices Response:", res.data);
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
    toast.error(error.message);
  }
};
const parseDMY = (dateStr) => {
  if (!dateStr) return null;
  const [dd, mm, yyyy] = dateStr.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

export const submitInvoice = (payload, navigate) => async (dispatch) => {
  const REGEX_DMY = /^\d{2}[-/]\d{2}[-/]\d{4}$/;
  const REGEX_YMD = /^\d{4}-\d{2}-\d{2}$/;

  const safeDateDMY = (value) => {
    if (!value) return "";

    let d;

    if (value instanceof Date) {
      d = value;
    } else if (typeof value === "string") {
      const cleaned = value.trim();
      if (!cleaned) return "";

      // Handle ISO strings like "2023-01-01T00:00:00"
      const dateOnly = cleaned.split("T")[0];

      let day, month, year;

      // DD-MM-YYYY or DD/MM/YYYY
      if (REGEX_DMY.test(dateOnly)) {
        const sep = dateOnly.includes("/") ? "/" : "-";
        [day, month, year] = dateOnly.split(sep);
        d = new Date(Number(year), Number(month) - 1, Number(day));
      }
      // YYYY-MM-DD
      else if (REGEX_YMD.test(dateOnly)) {
        [year, month, day] = dateOnly.split("-");
        d = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        d = new Date(cleaned);
      }
    } else {
      return "";
    }

    if (!d || isNaN(d.getTime())) return "";

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
  };

  // ✅ FIX 2: Helper that returns NULL for empty dates and YYYY-MM-DD for valid dates
  const formatDateForAPI = (value) => {
    if (!value) return null; // 👈 CRITICAL: Backend needs null, not ""

    let d;
    if (value instanceof Date) {
      d = value;
    } else if (typeof value === "string") {
      const cleaned = value.trim();
      if (!cleaned) return null; // Return null for empty strings

      const dateOnly = cleaned.split("T")[0]; // Handle ISO strings
      let day, month, year;

      if (REGEX_DMY.test(dateOnly)) {
        const sep = dateOnly.includes("/") ? "/" : "-";
        [day, month, year] = dateOnly.split(sep);
        d = new Date(Number(year), Number(month) - 1, Number(day));
      } else if (REGEX_YMD.test(dateOnly)) {
        [year, month, day] = dateOnly.split("-");
        d = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        d = new Date(cleaned);
      }
    } else {
      return null;
    }

    if (!d || isNaN(d.getTime())) return null;

    // ✅ OUTPUT as YYYY-MM-DD (Standard for APIs)
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    return `${yyyy}-${mm}-${dd}`;
  };

  try {
    // dispatch(setExportInvoiceLoading(true));

    const formattedPayload = {
      finalInvoiceDetails: payload.map((data, index) => {
        const invoiceIndex = index + 1;

        const match = (data.additionalCharges || []).find(
          (item) => item.invoiceIndex === invoiceIndex,
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

        // --- 2. HANDLE DISCOUNTS (🔥 NEW UPDATE) ---
        const discountMatch = (data.discountDetails || []).find(
          (item) => item.invoiceIndex === invoiceIndex,
        );
        const discountRows = discountMatch?.rows || [];
        // Extract individual rows (just like charges)
        const disRow1 = discountRows[0] || { desc: "", value: 0 };
        const disRow2 = discountRows[1] || { desc: "", value: 0 };
        const disRow3 = discountRows[2] || { desc: "", value: 0 };

        // Extract Descriptions
        const discount1 = disRow1.desc || "";
        const discount2 = disRow2.desc || "";
        const discount3 = disRow3.desc || "";

        // Extract Values
        const discountValue1 = Number(disRow1.value) || 0;
        const discountValue2 = Number(disRow2.value) || 0;
        const discountValue3 = Number(disRow3.value) || 0;

        const totalDiscount = discountRows.reduce(
          (acc, row) => acc + (Number(row.value) || 0),
          0,
        );

        // grand total + additional charges
        const finalGrandTotal = parseFloat(data.grandTotal) || 0; // +
        // otherChargesValue1 +
        // otherChargesValue2 +
        // otherChargesValue3 -
        // totalDiscount;
        return {
          o_ID: Number(data.o_id) || 0,
          exchangeRate: Number(data.ExchangeCurrency) || 0,
          type: data.type?.toUpperCase() || "",
          SpecialRequest: data.specialRequest || "",
          billID: Number(data.billid) || 0,
          shipID: Number(data.shipid) || 0,
          custCode: Number(data.custCode) || 0,
          custFullName: data.custfullname || "",
          orderRefNo: data.orderRefNo || "",
          buyersOrderRefNo: data.BuyersOrderNumber || "",
          exportAuthorisedAddress: data.exporterAuthorizedAddress || "",
          isSchemeSplit: Boolean(data.items.some((i) => i.isSplit)),
          dispatchedDate: formatDateForAPI(data.dispatchedDate),
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
          completeddate: formatDateForAPI(data.completedDate) || "",
          rfD_Date: formatDateForAPI(data.rfD_Date),
          totalQty: data.totalqty || "",
          plant: data.containerLoadFrom || "",
          plantAddress: data.plantAddress || "", // add
          isScheme: Boolean(data.items.some((i) => i.isScheme)),
          itcHsNo: data.itcHsNo || "",
          licenceDate: formatDateForAPI(data.licenceDate ?? data.schemeDate),
          paymentTerms: data.paymentTerms || "",
          schemeId: 0,
          schemeLicences: data.schemeLicences || "",
          schemeDate: formatDateForAPI(data.schemeDate),
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
          invoiceDate:
            formatDateForAPI(data.invoiceDate) || new Date().toISOString(),
          containerLoadFrom: data.containerLoadFrom || "",
          containerNo: data.containerNo || "",
          countryOfOriginOfGoods: data.countryOfOriginOfGoods || "",
          portOfLoading: data.portOfLoading || "",
          portOfDischarge: data.portOfDischarge || "",
          containerType: data.containerType || "",
          containerSEALNO: data.containerSEALNO || "",
          placeOfReceiptByPreCarrier: data.placeOfReceiptByPreCarrier || "",
          finalDestination: data.finalDestination || "",
          CountryOfFinalDestination: data.countryOfDestination || "",
          inCoterm: data.incoterm?.toUpperCase() || "",
          placeOfIncoterm: data.placeOfIncoterm || "",
          scheme: data.scheme || "",
          otherCharges1,
          otherCharges2,
          otherCharges3,
          otherChargesValue1,
          otherChargesValue2,
          otherChargesValue3,
          // --- 🔥 DISCOUNT FIELDS (Added) ---
          discount1, //add
          discount2, //add
          discount3, //add
          discountValue1, //add
          discountValue2, //add
          discountValue3, //add
          // ---------------------------------------------------
          otherDiscount: totalDiscount || 0,
          paymentermsId: 0,
          otsNo: data.otsNo || null,
          paymentDays: data.paymentDays || 0,
          // GRAND TOTAL WITH NEW VALUES
          grandTotal: finalGrandTotal,
          totalPrice: data.totalPrices || 0,
          totalWeight: parseFloat(data.grossWeight) || 0,
          netweight: parseFloat(data.totalwt) || 0,
          amountInWords: `${data?.usercurrency} ${numberToWords(finalGrandTotal, data?.usercurrency)}`,
          docUnitPrice: Number(data.unitPrice || 0),
          // pallet fields
          isPallet: data.isPallat || false,
          palletCount: data.pallatCount || 0,
          palletTyres: data.pallatTyres || 0,
          palletWeight: data.pallatWeight || 0,
          palletDimension: data.palletDimension || "", //add
          // wooden fields
          isWoodenBox: data.isWoodenBox || false,
          woodenBoxCount: data.woodenBoxCount || 0,
          woodenBoxTyres: data.woodenBoxTyres || 0,
          woodenBoxWeight: data.woodenBoxWeight || 0,
          woodenBoxDimension: data.woodenBoxDimension || "", //add
          workorderno: data.workorderno || "",
          notifyPartyAddress: data.notifyPartyAddress || "",
          notifyPartyCity: data.notifyPartyCity || "",
          notifyPartyCountry: data.notifyPartyCountry || "",
          notifyPartyEmail: data.notifyPartyEmail || "",
          notifyPartyName: data.notifyPartyName || "",
          notifyPartyPhone: data.notifyPartyPhone || "",
          notifyPartyState: data.notifyPartyState || "",
          // 🚨 FIX 3: Add potentially missing Description
          InvoiceDiscription: data.InvoiceDiscription || "", //add
          ImportedCountryOfOriginGoods: data.ImportedCountryOfOriginGoods || "", //add
          ImportedREXNumber: data.ImportedREXNumber || "", // new added
          REXNumber:
            data.scheme === "Import Invoice"
              ? data.ImportedREXNumber
              : data.REXNumber || "",
          IGSTLUT: data.IGSTLUT || "",
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
    dispatch(setExportInvoiceLoading(false));
    const res = await api.post("/Invoice/CreatingInvoices", formattedPayload, {
      withCredentials: true,
    });

    dispatch(setExportInvoiceLoading(false));

    if (res.status === 200) {
      toast.success("Invoice Created Successfully");
      dispatch(uploadCustomInvoicePDF())
      navigate(
        "/TTS/International/Invoice/CustomInvoice", {
        state: { type: "Custom" }
      }
      );
    }
  } catch (error) {
    dispatch(setExportInvoiceLoading(false));
    console.error("❌ Error uploading invoice:", error.response?.data || error);
    toast.error("Failed to upload invoice");
  }
};

export const uploadCustomInvoicePDF = () => async (dispatch, getState) => {
  try {
    const { pdfBlob, FinalInvoiceDetails } = getState().invoice.exportInvoices;

    if (!pdfBlob || pdfBlob.size === 0) {
      console.warn("❌ No valid PDF blob found to upload");
      return;
    }

    if (!FinalInvoiceDetails || FinalInvoiceDetails.length === 0) {
      console.warn("❌ No invoice data found");
      return;
    }

    const invoiceNumbers = FinalInvoiceDetails
      .map(inv => inv.invoiceNumber)
      .filter(Boolean)
      .join(",");

    const orderRefNo = FinalInvoiceDetails[0]?.orderRefNo || "";
    const custCode = FinalInvoiceDetails[0]?.custCode || "";
    console.log(FinalInvoiceDetails[0]);
    const year = new Date().getFullYear();
    const formData = new FormData();
    const pdfFile = new File([pdfBlob], `Invoices_${invoiceNumbers}.pdf`, {
      type: "application/pdf",
    });

    formData.append("file", pdfFile); // ✅ ONLY FILE IN BODY

    const queryParams = new URLSearchParams({
      invoiceNo: invoiceNumbers,
      InvoiceType: "custom",
      OrderRefno: orderRefNo,
      customerCode: custCode,
      year: year.toString(),
    }).toString();

    console.log("📤 Upload URL:", `/PdfUpload/Invoice/upload?${queryParams}`);
    console.log("📄 File size:", pdfFile.size);

    await api.post(
      `/PdfUpload/Invoice/upload?${queryParams}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    console.log("✅ PDF Uploaded Successfully");

    // 🔽 DOWNLOAD AFTER SUCCESS
    await downloadPDF(pdfBlob, `Custom Invoice_${invoiceNumbers}.pdf`)

    console.log("⬇ PDF Downloaded Successfully");
  } catch (error) {
    console.error("❌ PDF Upload Failed", error.response?.data || error);
  }
};



export const uploadCustomerInvoicePDF = () => async (dispatch, getState) => {
  try {
    const { pdfBlob, invoiceCustDetails } = getState().invoice.exportInvoices;

    if (!pdfBlob || pdfBlob.size === 0) {
      console.warn("❌ No valid PDF blob found to upload");
      return;
    }

    if (!invoiceCustDetails) {
      console.warn("❌ No customer invoice details found");
      return;
    }

    const invoiceNo = Array.isArray(invoiceCustDetails.invoiceNo)
      ? invoiceCustDetails.invoiceNo.join(",")
      : invoiceCustDetails.invoiceNo || "";

    const orderRefNo = invoiceCustDetails.orderRefNo || "";
    const custCode = invoiceCustDetails.custCode || invoiceCustDetails.customerCode || "";
    const year = new Date().getFullYear();
    const invoiceNumbers = invoiceCustDetails.invoiceNo.join(',');

    if (!custCode) {
      console.error("❌ customerCode missing in invoiceCustDetails", invoiceCustDetails);
      return;
    }

    // Only file in body
    const formData = new FormData();
    const pdfFile = new File([pdfBlob], `CustomerInvoice_${invoiceNo}.pdf`, {
      type: "application/pdf",
    });
    formData.append("file", pdfFile);

    // Metadata in query params (as per Swagger)
    const queryParams = new URLSearchParams({
      invoiceNo,
      InvoiceType: "customer",
      OrderRefno: orderRefNo,
      customerCode: custCode,
      year: year.toString(),
    }).toString();

    console.log("📤 Uploading Customer Invoice PDF");
    console.log("URL:", `/PdfUpload/Invoice/upload?${queryParams}`);

    await api.post(
      `/PdfUpload/Invoice/upload?${queryParams}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    // 🔽 DOWNLOAD AFTER SUCCESS
    await downloadPDF(pdfBlob, `Customer Invoice_${invoiceNumbers}.pdf`)


    console.log("✅ Customer Invoice PDF Uploaded Successfully");
  } catch (error) {
    console.error("❌ Customer PDF Upload Failed", error.response?.data || error);
  }
};


export const submitCustomerInvoice =
  (payload, navigate) => async (dispatch) => {
    try {
      // date formatting
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
      const yyyy = today.getFullYear();
      const formattedDate = `${dd}/${mm}/${yyyy}`;
      const totalQty = payload?.items.reduce(
        (sum, item) => sum + (Number(item.itemQty) || 0),
        0,
      );
      const netWeight =
        payload?.items?.reduce(
          (sum, item) =>
            sum +
            (Number((item.rimfinishedwt + item.finishedWt) * item.itemQty) ||
              0),
          0,
        ) || 0;
      const totalPrice =
        payload?.items?.reduce(
          (sum, item) =>
            sum +
            (Number((item.basicprice + item.rimUnitPrice) * item.itemQty) || 0),
          0,
        ) || 0;

      // 🔥 MERGE ALL CHARGES FROM SCHEMES INTO 3 SLOTS
      const chargeMap = {};

      (payload.otherChargesDetails || []).forEach((row) => {
        [
          [row.chargesType1, row.otherCharges1],
          [row.chargesType2, row.otherCharges2],
          [row.chargesType3, row.otherCharges3],
        ].forEach(([label, value]) => {
          if (!label || !value) return;
          const key = label.trim();
          chargeMap[key] = (chargeMap[key] || 0) + Number(value);
        });
      });

      const mergedCharges = Object.entries(chargeMap).slice(0, 3);

      const discountMap = {};

      (payload.otherChargesDetails || []).forEach((row) => {
        [
          [row.discount1, row.discountValue1],
          [row.discount2, row.discountValue2],
          [row.discount3, row.discountValue3],
        ].forEach(([label, value]) => {
          if (!label || !value) return;
          const key = label.trim();
          discountMap[key] = (discountMap[key] || 0) + Number(value);
        });
      });

      const mergedDiscounts = Object.entries(discountMap).slice(0, 3);

      const totalCharges = mergedCharges.reduce((sum, [, val]) => sum + val, 0);
      const totalDiscounts = mergedDiscounts.reduce(
        (sum, [, val]) => sum + val,
        0,
      );

      const invoiceValue = totalPrice + totalCharges - totalDiscounts;

      // 🔥 COMBINED PACKING TOTALS (NO REPEAT)
      const totalPalletTyres = (payload?.additionalDetails || []).reduce(
        (sum, det) => sum + (Number(det.isPallet ? det.palletTyres : 0) || 0),
        0,
      );
      const isPallet = (payload?.additionalDetails || []).reduce(
        (foundPallet, det) => foundPallet || det.isPallet === true,
        false,
      );

      const totalPallets = (payload?.additionalDetails || []).reduce(
        (sum, det) => sum + (Number(det.isPallet ? det.palletCount : 0) || 0),
        0,
      );
      const totalPalletWeight = (payload?.additionalDetails || []).reduce(
        (sum, det) => sum + (Number(det.isPallat ? det.palletweight : 0) || 0),
        0,
      );

      const totalWoodenTyres = (payload?.additionalDetails || []).reduce(
        (sum, det) =>
          sum + (Number(det.isWoodenBox ? det.woodenBoxTyres : 0) || 0),
        0,
      );
      const isWooden = (payload?.additionalDetails || []).reduce(
        (foundWooden, det) => foundWooden || det.isWoodenBox === true,
        false,
      );

      const totalWoodenBoxs = (payload?.additionalDetails || []).reduce(
        (sum, det) =>
          sum + (Number(det.isWoodenBox ? det.woodenBoxCount : 0) || 0),
        0,
      );
      const totalWoodenBoxWeight = (payload?.additionalDetails || []).reduce(
        (sum, det) =>
          sum + (Number(det.isWoodenBox ? det.woodenBoxWeight : 0) || 0),
        0,
      );
      const totalPalletDimensions = (payload?.additionalDetails || [])
        .reduce(
          (sum, det) => (det.isPallet ? [...sum, det.palletDimension] : sum), // Collect pallet dimensions if isPallet is true
          [],
        )
        .join(","); // Join all pallet dimensions into a single string with commas

      const totalWoodenBoxDimensions = (payload?.additionalDetails || [])
        .reduce(
          (sum, det) =>
            det.isWoodenBox ? [...sum, det.woodenBoxDimension] : sum, // Collect wooden box dimensions if isWoodenBox is true
          [],
        )
        .join(","); // Join all wooden box dimensions into a single string with commas

      const totalPackedTyres = totalPalletTyres + totalWoodenTyres;
      const totalPalletWT = (data.additionalDetails || []).reduce(
        (sum, det) => sum + (Number(det.isPallet ? det.palletweight : 0) || 0),
        0,
      )
      const totalWoodenWT = (data.additionalDetails || []).reduce(
        (sum, det) => sum + (Number(det.isWoodenBox ? det.woodenBoxWeight : 0) || 0),
        0,
      )

      // const totalPackedTyres = totalPalletTyres + totalWoodenTyres;

      const totalGrossWT =
        (Number(totalPalletWT) || 0) +
        (Number(totalWoodenWT) || 0) +
        (Number(totalWeight) || 0);

      const finalGrossWT =
        Number(data?.grossWeight) > 0
          ? Number(data.grossWeight)
          : totalGrossWT;

      const data = {
        invoiceDto: {},
        finalInvoiceDetails: [
          {
            o_ID: Number(payload.o_id) || 0,
            type: payload.type?.toUpperCase() || "",
            billID: Number(payload.billid) || 0,
            shipID: Number(payload.shipid) || 0,
            custCode: Number(payload.custCode) || 0,
            custFullName: payload.custfullname || "",
            orderRefNo: String(payload.orderRefNo || ""),
            exportAuthorisedAddress: payload.exportAuthorisedAddress || "",
            isSchemeSplit: false,
            totalQty: totalQty || "",
            containerNo: payload.containerNo || "",
            rexNumber: payload.rexNumber || "",
            igstlut: payload.igstlut || "",
            dispatchedDate: parseDMY(payload.dispatchedDate) || null,
            completeddate: parseDMY(payload.completedDate) || null,
            shipmentType: payload.shipmentType || "",
            importedCountryOfOriginGoods:
              payload.ImportedCountryOfOriginGoods || "",
            exchangerate: Number(payload.ExchangeCurrency) || 0,
            invoiceDiscription: payload.InvoiceDiscription || "",
            billingCompanyName: payload.billingCompanyName || "",
            billingAddress: payload.billingAddress || "",
            billingCity: payload.billingCity || "",
            billingState: payload.billingState || "",
            billingCountry: payload.billingCountry || "",
            billingZipcode: payload.billingZipcode || "",
            billingContactName: payload.billingContactName || "",
            billingEmailId: payload.billingEmailId || "",
            billingMobile: payload.billingMobile || "",
            plantAddress: payload.plantAddress || "",
            billOfLadingNo: payload.billOfLadingNo || "",
            vesselFlightNo: payload.vesselFlightNo || "",
            placeOfIncoterm: payload.placeOfIncoterm || "",
            plant: payload.containerLoadFrom || "",
            isScheme: Boolean(payload.items.some((i) => i.isScheme)),
            schemeId: 0,
            schemedate: parseDMY(payload.schemeDate) || null,
            shippingCompanyName: payload.shippingCompanyName || "",
            shippingAddress: payload.shippingAddress || "",
            shippingCity: payload.shippingCity || "",
            shippingState: payload.shippingState || "",
            shippingCountry: payload.shippingCountry || "",
            shippingZipcode: payload.shippingZipcode || "",
            shippingContactName: payload.shippingContactName || "",
            shippingEmailId: payload.shippingEmailId || "",
            shippingMobile: payload.shippingMobile || "",
            specialRequest: payload.specialRequest || "",
            preCarriageBy: payload.preCarriageBy || "",
            invoiceNumber:
              Array.isArray(payload?.invoiceNo) && payload.invoiceNo.length > 0
                ? payload.invoiceNo.join(", ")
                : payload?.invoiceNumber || "",
            invoiceDate:
              parseDMY(payload.invoiceDate) || new Date().toISOString(),
            containerLoadFrom: payload.containerLoadFrom || "",
            countryOfOriginOfGoods: payload.countryOfOriginOfGoods || "",
            portOfLoading: payload.portOfLoading || "",
            portOfDischarge: payload.portOfDischarge || "",
            containerType: payload.containerType || "",
            containerSEALNO: payload.containerSEALNO || "",
            placeOfReceiptByPreCarrier:
              payload.placeOfReceiptByPreCarrier || "",
            finalDestination: payload.finalDestination || "",
            countryOfFinalDestination: payload.countryOfFinalDestination || "",
            inCoterm: payload.incoterm?.toUpperCase() || "",
            scheme: payload.scheme || "",
            paymentTerms: payload.paymentTerms || "",
            otherCharges1: mergedCharges[0]?.[0] || "",
            otherChargesValue1: mergedCharges[0]?.[1] || 0,

            otherCharges2: mergedCharges[1]?.[0] || "",
            otherChargesValue2: mergedCharges[1]?.[1] || 0,

            otherCharges3: mergedCharges[2]?.[0] || "",
            otherChargesValue3: mergedCharges[2]?.[1] || 0,

            discount1: mergedDiscounts[0]?.[0] || "",
            discountValue1: mergedDiscounts[0]?.[1] || 0,

            discount2: mergedDiscounts[1]?.[0] || "",
            discountValue2: mergedDiscounts[1]?.[1] || 0,

            discount3: mergedDiscounts[2]?.[0] || "",
            discountValue3: mergedDiscounts[2]?.[1] || 0,
            paymentermsId: 0,
            paymentTerms: payload.paymentTerms || "",
            paymentDays: payload.paymentDays || 0,
            otsNo: payload.otsNo || 0,
            grandTotal: invoiceValue || 0,
            totalPrice,
            totalWeight: parseFloat(finalGrossWT) || 0,
            netweight: parseFloat(netWeight) || 0,
            amountInWords: `${payload.usercurrency} ${numberToWords(invoiceValue, payload.usercurrency)}`,
            docUnitPrice: Number(payload.unitPrice || 0),
            username: payload.username || "",
            isPallet: isPallet || false,
            palletCount: totalPallets || 0,
            palletTyres: totalPalletTyres || 0,
            palletWeight: totalPalletWeight || 0,
            isWoodenBox: isWooden || false,
            woodenBoxCount: totalWoodenBoxs || 0,
            woodenBoxTyres: totalWoodenTyres || 0,
            woodenBoxWeight: totalWoodenBoxWeight || 0,
            woodenBoxDimension: totalWoodenBoxDimensions || "",
            palletDimension: totalPalletDimensions || "",
            notifyPartyAddress: payload.notifyPartyAddress || "",
            notifyPartyCity: payload.notifyPartyCity || "",
            notifyPartyCountry: payload.notifyPartyCountry || "",
            notifyPartyEmail: payload.notifyPartyEmail || "",
            notifyPartyName: payload.notifyPartyName || "",
            notifyPartyPhone: payload.notifyPartyPhone || "",
            notifyPartyState: payload.notifyPartyState || "",
            userCurrency: payload.usercurrency || "",
            items: payload.items.map((item) => ({
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
          },
        ],
      };
      console.log("final CUST SUBMIT data", data);

      // dispatch(setExportInvoiceLoading(true));
      // const res = await api.post("/Invoice/CreatingCustomerInvoice", data);
      // console.log(res.data);

      // dispatch(setExportInvoiceLoading(false));
      // if (res.status === 200) {
      //   toast.success("File Uploaded Successfully");
      //   dispatch(uploadCustomerInvoicePDF())
      //   navigate(
      //     "/TTS/International/Invoice/CustomerInvoice", {
      //     state: { type: "Customer" }
      //   }
      //   );

      // }
    } catch (error) {
      console.error(
        "❌ Error uploading customer invoice:",
        error.response?.data || error,
      );
      toast.error("Failed to upload customer invoice");
      dispatch(setExportInvoiceLoading(false));
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
  setExportCustInvoiceSalesDetails,
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
  setExportCustAdditionalInvoice,
  // customer
  setExportInvoiceCustlist,
  setFinalCustomerData,
  resetCustomerAdditionalData,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
