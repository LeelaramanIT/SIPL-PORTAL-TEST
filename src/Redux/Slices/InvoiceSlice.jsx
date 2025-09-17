import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/axios";
import axios from "axios";
import toast from "react-hot-toast";
import { numberToWords } from "../../utils/NumberToWords";

const initialState = {
  exportInvoices: {
    invoiceType: "Direct_Invoice",
    listOFInvoices: [], // multiple invoices
    invoiceDetails: null, // single invoice details
    additionalForm: null, // extra form info
    invoicePDF: null, // PDF export
    FinalSplitResult: [], // processed items
    FinalInvoiceData: [], // processed invoice data
    updatedInvoiceDetails: [],
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
      state.exportInvoices.FinalInvoiceData = []; // Should be an array
      state.exportInvoices.FinalSplitResult = []; // Should be an array
      state.exportInvoices.updatedInvoiceDetails = []; // Should be an array
      state.exportInvoices.localItems = []; // Add this to reset it properly
      state.exportInvoices.splitItems = []; // Add this to reset it properly
      state.exportInvoices.pdfBlob = [];
      state.exportInvoices.showSubmmit = false;
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
    setFinalInvoiceData: (state, action) => {
      state.exportInvoices.FinalInvoiceData = action.payload;
    },
    SetupdatedInvoiceDetails: (state, action) => {
      state.exportInvoices.updatedInvoiceDetails = {
        ...state.exportInvoices.invoiceDetails,
        ...state.exportInvoices.additionalForm,
        items: [...action.payload],
      };
      const splitInvoiceByScheme = (invoice) => {
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

      const invoices = splitInvoiceByScheme(
        state.exportInvoices.updatedInvoiceDetails
      );
       const data = invoices.map((invoice) => {
          // Calculate total quantity, total weight, total price, and grand total for each invoice
          const totalQty = invoice.items.reduce((acc, item) => acc + item.itemQty, 0);
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
      
          return {
            orderRefNo: invoice?.InvoiceNo,
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
            exporter: invoice?.ExporterAuthorizedAddress || "",
            consignee: {
              name: invoice?.billingCompanyName || "",
              address: invoice?.billingAddress?.split("~") || [],
              city: invoice?.billingCity?.toUpperCase() || "",
              state: invoice?.billingState?.toUpperCase() || "",
              country: invoice?.billingCountry?.toUpperCase() || "",
            },
            customerAgent: {
              name: "M/S, ADVANCE TIRES",
              address: ["1000 Rike Dr.", "Millstone Twp. NJ 08535"],
            },
            preCarriageBy: invoice?.PreCarriageby?.toUpperCase() || "",
            placeOfReceipt: invoice?.PlaceOfReceiptByPreCarrier?.toUpperCase() || "",
            vesselFlightNo: invoice?.VesselFlight || "",
            portOfLoading: invoice?.PortOfLoading?.toUpperCase() || "",
            portOfDischarge: invoice?.PortOfDischarge?.toUpperCase() || "",
            finalDestination: invoice?.FinalDestination?.toUpperCase() || "",
            buyerIfOtherThanConsignee: {
              name: invoice?.shippingCompanyName || "",
              address: invoice?.shippingAddress?.split("~") || [],
              city: invoice?.shippingCity?.toUpperCase() || "",
              state: invoice?.shippingState?.toUpperCase() || "",
              country: invoice?.shippingCountry?.toUpperCase() || "",
            },
            countryOfOrigin: invoice?.CountryOfOriginOfGoods?.toUpperCase() || "",
            countryOfDestination: invoice?.shippingCountry?.toUpperCase() || "",
            deliveryTerms: invoice?.Incoterm,
            PaymentTerms: invoice?.PaymentTerms || "",
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
              size: invoice?.ContainerType,
              containerNo: invoice?.ContainerNo,
              linerSealNo: invoice?.ContainerSEALNO,
              otsNo: invoice?.OtsNo || "",
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
            quantityKgs: grossWeight,
            unitPriceUsd: null, // This field is not directly available from the new data structure, consider how to calculate it
            totalPricesUsd: totalPrices,
            grandTotalUsd: formattedGrandTotal,
            amountInWords: `USD ${numberToWords(grandTotal)}`,
            grossWeight: `${grossWeight.toFixed(3)} KGS`,
            netWeight: `${grossWeight.toFixed(3)} KGS`, // Assuming net and gross are same for simplicity
            totalQty:totalQty,
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
      state.exportInvoices.FinalInvoiceData = data;
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
  const data = {
    type: "Export",
    custfullname: "Global Tech Ltd",
    orderRefNo: "ORD-2025-001",
    workorderno: "WO-789",
    completedDate: "2025-09-01",
    dispatchedDate: "2025-09-03",
    rfD_Date: "2025-09-05",
    shipmentType: "COMBI",
    usercurrency: "USD",

    billingCompanyName: "Global Tech Ltd",
    billingAddress: "123 Tech Park~Building 5~Floor 3",
    billingCity: "New York",
    billingState: "NY",
    billingCountry: "USA",
    billingZipcode: "10001",
    billingContactName: "John Doe",
    billingEmailId: "john.doe@globaltech.com",
    billingMobile: "+1-212-555-7890",

    shippingCompanyName: "Skyline Logistics",
    shippingAddress: "Warehouse 12~Dock B~Industrial Area",
    shippingCity: "Los Angeles",
    shippingState: "CA",
    shippingCountry: "USA",
    shippingZipcode: "90021",
    shippingContactName: "Jane Smith",
    shippingEmailId: "jane.smith@skyline.com",
    shippingMobile: "+1-310-555-1234",
    PreCarriageby: "sea",

    splIns: "Handle with care - Fragile items",
    specialRequset: "Deliver before end of September",

    items: [
      {
        category: "Tyre",
        platforms: "Truck",
        tyreSize: "295/80R22.5",
        tyreRim: "22.5",
        tyreType: "Radial",
        brand: "Michelin",
        sidewall: "Black",
        basicprice: 150.75,
        itemQty: 20,
        finishedWt: 45.6,
        rimItemQty: 0,
        rimUnitPrice: 0,
        additionalInfo: "High performance tyres",
        plant: "Plant-A",
        itemCode: "TYR-MIC-29580R22-1",
        o_itemid: 1,
      },
      {
        category: "Tyre",
        platforms: "Bus",
        tyreSize: "315/80R22.5",
        tyreRim: "22.5",
        tyreType: "Radial",
        brand: "Bridgestone",
        sidewall: "White",
        basicprice: 175.5,
        itemQty: 15,
        finishedWt: 50.2,
        rimItemQty: 2,
        rimUnitPrice: 30,
        additionalInfo: "",
        plant: "Plant-B",
        itemCode: "TYR-BRD-31580R22-2",
        o_itemid: 2,
      },
      {
        category: "Rim",
        platforms: "Truck",
        tyreSize: "22.5 Rim",
        tyreRim: "22.5",
        tyreType: "Steel",
        brand: "Tata Steel",
        sidewall: "N/A",
        basicprice: 90.25,
        itemQty: 10,
        finishedWt: 25.3,
        rimItemQty: 10,
        rimUnitPrice: 90.25,
        additionalInfo: "Heavy duty rims",
        plant: "Plant-A",
        itemCode: "RIM-TATA-22-3",
        o_itemid: 3,
      },
      {
        category: "Tyre",
        platforms: "Truck",
        tyreSize: "295/80R22.5",
        tyreRim: "22.5",
        tyreType: "Radial",
        brand: "Michelin",
        sidewall: "Black",
        basicprice: 150.75,
        itemQty: 20,
        finishedWt: 45.6,
        rimItemQty: 0,
        rimUnitPrice: 0,
        additionalInfo: "High performance tyres",
        plant: "Plant-A",
        itemCode: "TYR-MIC-29580R22-4",
        o_itemid: 4,
      },
      // {
      //     //   "category": "Tyre",
      //     //   "platforms": "Bus",
      //     //   "tyreSize": "315/80R22.5",
      //     //   "tyreRim": "22.5",
      //     //   "tyreType": "Radial",
      //     //   "brand": "Bridgestone",
      //     //   "sidewall": "White",
      //     //   "basicprice": 175.50,
      //     //   "itemQty": 15,
      //     //   "finishedWt": 50.2,
      //     //   "rimItemQty": 2,
      //     //   "rimUnitPrice": 30,
      //     //   "additionalInfo": "",
      //     //   "plant": "Plant-B",
      //     //   "itemCode": "TYR-BRD-31580R22-5"
      //     // },
      //     // {
      //     //   "category": "Rim",
      //     //   "platforms": "Truck",
      //     //   "tyreSize": "22.5 Rim",
      //     //   "tyreRim": "22.5",
      //     //   "tyreType": "Steel",
      //     //   "brand": "Tata Steel",
      //     //   "sidewall": "N/A",
      //     //   "basicprice": 90.25,
      //     //   "itemQty": 10,
      //     //   "finishedWt": 25.3,
      //     //   "rimItemQty": 10,
      //     //   "rimUnitPrice": 90.25,
      //     //   "additionalInfo": "Heavy duty rims",
      //     //   "plant": "Plant-A",
      //     //   "itemCode": "RIM-TATA-22-6"
      //     // },
      //     // {
      //     //   "category": "Tyre",
      //     //   "platforms": "Truck",
      //     //   "tyreSize": "295/80R22.5",
      //     //   "tyreRim": "22.5",
      //     //   "tyreType": "Radial",
      //     //   "brand": "Michelin",
      //     //   "sidewall": "Black",
      //     //   "basicprice": 150.75,
      //     //   "itemQty": 20,
      //     //   "finishedWt": 45.6,
      //     //   "rimItemQty": 0,
      //     //   "rimUnitPrice": 0,
      //     //   "additionalInfo": "High performance tyres",
      //     //   "plant": "Plant-A",
      //     //   "itemCode": "TYR-MIC-29580R22-7"
      //     // },
      //     // {
      //     //   "category": "Tyre",
      //     //   "platforms": "Bus",
      //     //   "tyreSize": "315/80R22.5",
      //     //   "tyreRim": "22.5",
      //     //   "tyreType": "Radial",
      //     //   "brand": "Bridgestone",
      //     //   "sidewall": "White",
      //     //   "basicprice": 175.50,
      //     //   "itemQty": 15,
      //     //   "finishedWt": 50.2,
      //     //   "rimItemQty": 2,
      //     //   "rimUnitPrice": 30,
      //     //   "additionalInfo": "",
      //     //   "plant": "Plant-B",
      //     //   "itemCode": "TYR-BRD-31580R22-8"
      //     // },
      //     // {
      //     //   "category": "Rim",
      //     //   "platforms": "Truck",
      //     //   "tyreSize": "22.5 Rim",
      //     //   "tyreRim": "22.5",
      //     //   "tyreType": "Steel",
      //     //   "brand": "Tata Steel",
      //     //   "sidewall": "N/A",
      //     //   "basicprice": 90.25,
      //     //   "itemQty": 10,
      //     //   "finishedWt": 25.3,
      //     //   "rimItemQty": 10,
      //     //   "rimUnitPrice": 90.25,
      //     //   "additionalInfo": "Heavy duty rims",
      //     //   "plant": "Plant-A",
      //     //   "itemCode": "RIM-TATA-22-9"
      //     // },
      //     // {
      //     //   "category": "Tyre",
      //     //   "platforms": "Truck",
      //     //   "tyreSize": "295/80R22.5",
      //     //   "tyreRim": "22.5",
      //     //   "tyreType": "Radial",
      //     //   "brand": "Michelin",
      //     //   "sidewall": "Black",
      //     //   "basicprice": 150.75,
      //     //   "itemQty": 20,
      //     //   "finishedWt": 45.6,
      //     //   "rimItemQty": 0,
      //     //   "rimUnitPrice": 0,
      //     //   "additionalInfo": "High performance tyres",
      //     //   "plant": "Plant-A",
      //     //   "itemCode": "TYR-MIC-29580R22-10"
      //     // }
    ],
  };

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
