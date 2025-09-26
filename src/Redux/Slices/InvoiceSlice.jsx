import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/axios";
import axios from "axios";
import toast from "react-hot-toast";
import { numberToWords } from "../../utils/NumberToWords";
import { data } from "../../utils/DummyJSON";
import { getCurrency, getCurrencySymble } from "../../utils/currencies";

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
    FinalInvoiceDetails:[],
    loading: false,
    error: null,
    localItems: [],
    splitItems: [],
    pdfBlob: [],
    showSubmmit: false,
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
    setExportInvoiceAddressDetails: (state, action) => {
      state.exportInvoices.additionalForm = action.payload;
    },
    setExportInvoiceLoading: (state) => {
      state.exportInvoices.loading = true;
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
      state.exportInvoices.invoiceDetails = null;
      state.exportInvoices.invoiceType = "Direct_Invoice";
      state.exportInvoices.additionalForm = null;
      state.exportInvoices.FinalInvoicePDFData = []; // Should be an array
      state.exportInvoices.FinalSplitResult = []; // Should be an array
      state.exportInvoices.updatedInvoiceDetails = []; // Should be an array
      state.exportInvoices.localItems = []; // Add this to reset it properly
      state.exportInvoices.splitItems = []; // Add this to reset it properly
      state.exportInvoices.pdfBlob = [];
      state.exportInvoices.showSubmmit = false;
      state.exportInvoices.FinalInvoiceDetails = [];
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
    // ...inside the invoiceSlice reducers

setFinalInvoiceData: (state, action) => {
  // 1. Group the invoice items by scheme from the payload.
  const groupedInvoices = splitInvoiceByScheme(action.payload);

  // 2. Map over the grouped invoices to create a new array.
  // This new array will contain the calculated totals and other formatted data.
  const processedInvoices = groupedInvoices.map((invoice, index) => {
    // Perform all calculations here for each grouped invoice
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
    const unitPrice =
    totalwt > 0 && (grandTotal / totalwt).toFixed(5);

    const userCurrency = invoice?.usercurrency

    // Return a new object that includes the original invoice data
    // and the new calculated fields.
    return {
      ...invoice,
      invoiceNo: Number(invoice.invoiceNo) + index,
      totalqty,
      totalwt: `${totalwt.toFixed(3)}`,
      grandTotal: formattedGrandTotal,
      amountInWords: `${userCurrency}${numberToWords(grandTotal,userCurrency)}`,
      unitPrice,
    };
  });

  // 3. Store the processed invoices (with calculations) in FinalInvoiceDetails.
  state.exportInvoices.FinalInvoiceDetails = processedInvoices;
  
},

// You can now remove the SetupdatedInvoiceDetails reducer, as its logic is
// now part of setFinalInvoiceData.
    SetupdatedInvoiceDetails: (state, action) => {
      state.exportInvoices.updatedInvoiceDetails = action.payload
      
      const invoices = splitInvoiceByScheme(
        action.payload
      );
       const data = invoices.map((invoice,index) => {
          // Calculate total quantity, total weight, total price, and grand total for each invoice
          const totalqty = invoice.items.reduce((acc, item) => acc + item.itemQty, 0);
          const grossWeight = invoice.items.reduce(
            (acc, item) => acc + item.finishedWt * item.itemQty,
            0
          );
          const totalPrices = invoice.items.map(
            (item) => item.basicprice * item.itemQty
          );
          
          const grandTotal = totalPrices.reduce((acc, price) => acc + price, 0)
          const formattedGrandTotal = grandTotal.toFixed(5);
      
          const unitPrice = (grandTotal / grossWeight).toFixed(5)

          const userCurrency = invoice?.usercurrency
      
          return {
            invoiceNo: Number(invoice?.invoiceNo) + index,
            orderRefNo: invoice?.orderRefNo,
            unitPrice,
            date: new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            buyersOrderNo: invoice?.orderRefNo,
            refDate: `E MAIL DATE ${new Date(invoice?.rfD_Date).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            )}`,
            otherReferences: "SDF Form",
            exporter: invoice?.exporterAuthorizedAddress || "",
            consignee: {
              name: invoice?.billingCompanyName || "",
              address: invoice?.billingAddress?.split("~") || [],
              city: invoice?.billingCity?.toUpperCase() || "",
              state: invoice?.billingState?.toUpperCase() || "",
              country: invoice?.billingCountry?.toUpperCase() || "",
            },
            customerAgent: invoice?.customerAgent || "",
            preCarriageBy: invoice?.PreCarriageby?.toUpperCase() || "",
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
            deliveryTerms: invoice?.Incoterm,
            paymentTerms: invoice?.paymentTerms || "",
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
              itcHsNo: invoice?.itcHsNo,
              description: invoice?.items
                .map(
                  (item) =>
                    `${item.itemQty} ${item.tyreSize} ${item.brand} ${item.category}`
                )
                .join(", "),
            },
            items: invoice.items,
            usercurrency:invoice?.usercurrency,
            currencySymble:getCurrencySymble(invoice?.usercurrency),
            quantityKgs: grossWeight,
            unitPriceUsd: null, // This field is not directly available from the new data structure, consider how to calculate it
            totalPrices: totalPrices,
            grandTotal: formattedGrandTotal,
            amountInWords: `${userCurrency} ${numberToWords(grandTotal,userCurrency)}`,
            grossWeight: `${grossWeight.toFixed(3)} Kgs`,
            netWeight: `${grossWeight.toFixed(3)} Kgs`, // Assuming net and gross are same for simplicity
            totalqty:totalqty,
            declaration:
              "WE DECLARE THAT THIS INVOICE CUM PACKING LIST SHOWS THE ACTUAL PRICE OF GOODS DESCRIBED AND ALL THE PARTICULARS ARE TRUE AND CORRECT.",
            licenceDetails: {
              description: `This shipment is under ${invoice?.items[0]?.scheme} scheme. Licence No. 0411007094 dt. 14.03.2024`,
              igstLUT:
                "IGST-Letter Of Undertaking (ARN)AD3302240385774 valid till 31.03.2025",
            },
            authorizedSignatory: "FOR SUNDHARAM INDUSTRIES PRIVATE LIMITED",
            footer: {
              line1:
                "SUNDARAM INDUSTRIES PRIVATE LIMITED (Formerly Known as T.S.Rajam Tyres Private Limited) Regd Office: 'NO. 10",
              line2: "Jawahar road Chokkikulam, Madurai - 625002.",
              line3:
                "CIN:U51901TN2018PTC121156 Email: crm@sun-tws.com , Website: www.sun-tws.com , Tel: 044 - 43857129",
            },
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
    dispatch(setExportInvoiceLoading());
    if (payload.type === "Customer") {
      //   const res = await api.get(`/Invoice/GettingSpecificOrders/${payload.id}`,{withCredentials:true});
      // const data = res.data

      await dispatch(setExportInvoiceSalesDetails({ ...data, ...payload }));
    }

    if (payload.type === "Custom") {
      //   const res = await api.get(`/Invoice/GettingSpecificOrders/${payload.id}`,{withCredentials:true});
      // const data = res.data
      await dispatch(setExportInvoiceSalesDetails({ ...data, ...payload }));
    }
  } catch (error) {
    dispatch(setExportInvoiceError(error.message));

    console.error("Failed to fetch invoice:", error);
  }
};

// get the all exports data
export const getExportInvoiceAll = (payload) => async (dispatch) => {
  try {
    dispatch(setExportInvoiceLoading());
    dispatch(resetExportInvoiceDetails());
    if (payload.type === "Customer") {
      const res = await api.get(`/Invoice/GettingInvoiceReadyOrders`, {
        withCredentials: true,
      });
      await dispatch(setExportInvoiceList(res.data));
    }
    if (payload.type === "Custom") {
      const res = await api.get(`/Invoice/GettingInvoiceReadyOrders`, {
        withCredentials: true,
      });
      await dispatch(setExportInvoiceList(res.data));
    }
  } catch (error) {
    await dispatch(setExportInvoiceError(error.message));
    console.error("Failed to fetch invoices Data:", error);
  }
};

export const submitInvoice = (payload) => async (dispatch) => {
  try {
    console.log("Submited");
    const res = await axios.post("http://localhost:3000/upload", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.status === 200) {
      toast.success("File Uploaded Successfully");
      console.log("PDF uploaded successfully:", res.data);
    }
  } catch (error) {
    console.error("Error uploading PDF:", error);
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
  setExportInvoiceAddressDetails,
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
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
