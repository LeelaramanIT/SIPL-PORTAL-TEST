import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import Button from "../../../../../components/InputFields/Button";
import { useNavigate } from "react-router-dom";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import formatCustomDate from "../../../../../utils/DateFormat";
import InvoicePDF from "./InvoiceExportPDF";
import { useEffect } from "react";


const BORDER_THIN = "0.5px solid black";
const BORDER_BOLD = "1.5px solid black";

// Styles
export const styles = StyleSheet.create({
  // pdf
  pdf: {
    width: "100%",
    height: "100vh",
    margin: 0,
    padding: 0,
  },
  // page
  page: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 25,
    paddingRight: 25,
    fontSize: 10,
  },
  // heading
  heading: {
    fontWeight: "bold",
    fontSize: 8,
    padding: 0.5,
  },

  // row1
  row1: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    marginTop: "20px",
    padding: "1px",
    borderTop: BORDER_BOLD,
    borderRight: BORDER_BOLD,
    borderLeft: BORDER_BOLD,
  },

  //row2
  row2: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    height: "105px",
    borderLeft: BORDER_BOLD,
    borderRight: BORDER_BOLD,
    borderBottom: BORDER_THIN,
    borderTop: BORDER_THIN,
  },

  // row2 left side
  row2left: {
    width: "52%",
    height: "105px",
  },

  // row2 right side
  row2right: {
    width: "53%",
    height: "104px",
    flexDirection: "column",
  },

  // row2 right side 1
  row2right1: {
    width: "100%",
    height: 30,
    borderBottom: BORDER_THIN,
    borderLeft: BORDER_THIN,
  },
  // row2 right side 2
  row2right2: {
    width: "100%",
    padding: "0.1px",
    borderBottom: BORDER_THIN,
    borderLeft: BORDER_THIN,
  },
  // row2 right side 3
  row2right3: {
    width: "100%",
    height: 38,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    textAlign: "center",
    borderLeft: BORDER_THIN,
    borderBottom: BORDER_THIN,
  },
  row2right4: {
    width: "100%",
    height: 32, // So the total = 100
    borderLeft: BORDER_THIN,
  },
  // row3
  row3: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    height: "220px",
    borderBottom: BORDER_THIN,
    borderLeft: BORDER_BOLD,
  },
  // row3 left side
  row3left: {
    width: "52%",
    height: "220px",
    display: "flex",
    flexDirection: "column",
  },
  // row3 left side 1
  row3left1: {
    height: "180px",
    borderBottom: BORDER_THIN,
    display: "flex",
    justifyContent: "space-between",
  },
  // row3 left side 2
  row3left2: {
    height: "50px",
    flexDirection: "row",
  },
  // row3left3: {
  //   height: "110px",
  //   flexDirection: "row",
  //   backgroundColor: "black",
  // },
  // row3 left side 2 row 1
  row3left2row1: {
    width: "50%",
    height: "100%",
  },

  // row3 left side 2 row 2
  row3left2row2: {
    width: "50%",
    height: "100%",
    borderLeft: BORDER_THIN,
    justifyContent: "center",
  },
  // row3 left side 3 row 1
  row3left3: {
    height: "40px",
    borderTop: BORDER_THIN,
    borderBottom: BORDER_THIN,
    flexDirection: "row",
  },
  // row3 left side 3 row 1
  row3left3row1: {
    width: "50%",
    justifyContent: "center",
  },
  // row3 left side 3 row 2
  row3left3row2: {
    width: "50%",
    height: "100%",
    borderLeft: BORDER_THIN,
    justifyContent: "center",
  },
  // row3 left side 4th
  row3left4: {
    height: "40px",
    flexDirection: "row",
  },

  // row3 right side
  row3right: {
    width: "53.4%",
    borderLeft: BORDER_THIN,
    borderRight: BORDER_BOLD,
  },
  // row3 right side 1 row
  row3right1: {
    height: "72px",
    justifyContent: "flex-start",
    borderBottom: BORDER_THIN,
  },

  // row3 right side 2 row
  row3right2: {
    padding: "1px",
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "row",
    borderBottom: BORDER_THIN,
  },
  row3right2row1: {
    width: "50%",
    height: "100%",
    textAlign: "center",
    borderRight: BORDER_THIN,
  },
  row3right2row2: {
    width: "50%",
    height: "100%",
    textAlign: "center",
  },
  // row3 right side 2 row 1
  row3right3: {
    flexDirection: "row",
    borderBottom: BORDER_THIN,
  },
  row3right4: {
    height: "60%",
    display: "flex",
    justifyContent: "space-between",
  },
  // row4
  row4: {
    height: "225px",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    borderLeft: BORDER_BOLD,
    borderRight: BORDER_BOLD,
    borderBottom: BORDER_THIN,
  },
  row4_1: {
    height: "225px",
    width: "15.1%",
    borderRight: BORDER_THIN,
  },
  row4_2: {
    height: "225px",
    width: "15.1%",
    borderRight: BORDER_THIN,
  },

  row4_3: {
    height: "225px",
    width: "40%",
    borderRight: BORDER_THIN,
  },

  row4_4: {
    height: "225px",
    width: "10%",
    borderRight: BORDER_THIN,
  },
  row4_5: {
    height: "225px",
    width: "10%",
    borderRight: BORDER_THIN,
  },
  row4_6: {
    height: "225px",
    width: "10%",
  },
  row4_1heading: {
    fontSize: "7px",
    height: "25px",
    color: "#000000",
    fontWeight: "bold",
    justifyContent: "center",
    textAlign: "center",
    borderBottom: BORDER_THIN,
  },

  row4_1value: {
    height: "180px",
    justifyContent: "space-evenly",
    textAlign: "center",
    borderBottom: BORDER_THIN,
  },
  row4_1botm: {
    width: "100%",
    height: "20px",
    flexDirection: "row",
    justifyContent: "center", // Add this
    alignItems: "center", // Add this
    display: "flex", // Add this
  },

  row4_1botm1: {
    width: "80%",
    height: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  row4_1botmtotal: {
    width: "20%",
    height: "20px",
    justifyContent: "center",
    alignItems: "center",
    borderLeft: BORDER_THIN,
    display: "flex",
  },
  row5: {
    height: "180px",
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    borderLeft: BORDER_BOLD,
    borderBottom: BORDER_THIN,
    borderRight: BORDER_BOLD,
  },
  row6: {
    height: "30px",
    width: "100%",
    paddingTop: "5px",
    borderLeft: BORDER_BOLD,
    borderBottom: BORDER_BOLD,
    borderRight: BORDER_BOLD,
  },
  text: {
    fontSize: 7,
    paddingLeft: "3px",
    paddingVertical: "2px",
  },
  textValue: {
    fontSize: 6,
    paddingHorizontal: "3px",
    paddingVertical: "1px",
    fontWeight: "bold",
  },
  textlight: {
    fontSize: "6px",
    paddingHorizontal: "3px",
  },
  textb: {
    fontSize: 7,
    padding: 5,
    textAlign: "center",
  },
});

// Viewer component
const ExportInvoiceBillPDF = () => {
  const navigate = useNavigate()
  const { invoiceDetails, additionalForm } = useSelector((state) => state.invoice.exportInvoices)

  const invoice = { ...invoiceDetails, ...additionalForm }
  

  useEffect(()=>{
    if(!invoice){
      navigate('/TTS/International/Invoice/ExportInvoice')
    }
  },[invoice])

  const data = {
    orderRefNo: invoice?.invoiceNumber,
    date: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    buyersOrderNo: invoice?.orderRefNo,
    refDate: `E MAIL DATE ${formatCustomDate(invoice?.rfD_Date)}`,
    otherReferences: "SDF Form",
    exporter: invoice?.ExporterAuthorizedAddress || '',
    consignee: {
      name: invoice?.billingCompanyName || '',
      address: invoice?.billingAddress?.split('~') || [],
      city: invoice?.billingCity?.toUpperCase() || '',
      state: invoice?.billingState?.toUpperCase() || '',
      country: invoice?.billingCountry?.toUpperCase() || ''
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
      name: invoice?.shippingCompanyName || '',
      address: invoice?.shippingAddress?.split('~') || [],
      city: invoice?.shippingCity?.toUpperCase() || '',
      state: invoice?.shippingState?.toUpperCase() || '',
      country: invoice?.shippingcountry?.toUpperCase() || ''
    },
    countryOfOrigin: invoice?.CountryOfOriginOfGoods?.toUpperCase() || "",
    countryOfDestination: invoice?.shippingCountry?.toUpperCase() || "",
    deliveryTerms: "THE ABOVE PRICES ARE DDP NEW JERSEY, USD BY SEA.",
    PaymentTerms: invoice?.PaymentTerms || '',
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
      otsNo: invoice?.OtsNo || '',
    },
    packingDetails: {
      itcHsNo: invoice?.itcHsNo,
      description: "128 LOOSE TYRES",
    },
    goodsDescription: [
      "Automobile tyres reinforced with Nylon tyre Cord warp sheet / Rayon Tyre cord warp sheet.",
      "SOLID INDUSTRIAL TYRES LESS DISCOUNT 3%",
    ],
    quantityKgs: 15496.8,
    unitPriceUsd: 2.64525,
    totalPricesUsd: [40992.84, 1229.79],
    grandTotalUsd: 39763.05,
    amountInWords:
      "USD THIRTY NINE THOUSAND SEVEN HUNDRED SIXTY THREE AND CENTS FIVE ONLY",
    grossWeight: "15496.800 KGS",
    netWeight: "15496.800 KGS",
    declaration:
      "WE DECLARE THAT THIS INVOICE CUM PACKING LIST SHOWS THE ACTUAL PRICE OF GOODS DESCRIBED AND ALL THE PARTICULARS ARE TRUE AND CORRECT.",
    licenceDetails: {
      description:
        "The above shipment is under Advance Licence & EPCG Scheme. S.No-I Advance Licence No. 0411007094 dt. 14.03.2024 S.No-II (MOOWR Licence No. 0411007094 date. 14.03.2024)",
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
  
  return (
    <div className="w-full p-1 bg-background">
      <div className="w-full h-12 bg-background rounded-lg flex justify-evenly items-center">
        <Button
          icon={<IoChevronBackCircleOutline />}
          type="button"
          onClick={() => {
            navigate("/TTS/International/Invoice/ExportInvoicePrepare");
          }}
          text={"Back"}
          className={""}
        />
      </div>
      <PDFViewer style={styles.pdf}>
      <Document
      title={`Invoice_No_${data?.orderRefNo || "Default"}`}
      author="siplsuntws"
      subject="Customs Export Invoice PDF"
      creator="Your React App"
      producer="React PDF Generator"
    >
        <InvoicePDF data={data} styles={styles} />
        </Document>
      </PDFViewer>
    </div>
  );
};

export default ExportInvoiceBillPDF;
