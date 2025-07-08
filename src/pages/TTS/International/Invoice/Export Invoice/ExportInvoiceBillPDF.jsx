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


const BORDER_THIN = "0.5px solid black";
const BORDER_BOLD = "1.5px solid black";

// Styles
const styles = StyleSheet.create({
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

// PDF content component
const InvoicePDF = ({ data }) => (
  <Document
    title={`Invoice_No_${data?.orderRefNo || "Default"}`}
    author="siplsuntws"
    subject="Customs Export Invoice PDF"
    creator="Your React App"
    producer="React PDF Generator"
  >
    <Page size="A4" style={styles.page}>
      <View style={styles.row1}>
        <Text style={styles.heading}>INVOICE CUM PACKING LIST</Text>
      </View>
      <View style={styles.row2}>
        <View style={styles.row2left}>
          <Text style={styles.text}>EXPORTER:</Text>
          <View>
            {(data?.exporter
              ? data.exporter.split("~")
              : `SUNDARAM INDUSTRIES PRIVATE LIMITED~( Formerly known as T.S.Rajam Tyres Pvt Limited) ( DIVISION SUN TYRE & WHEEL SYSTEMS)~A1-F3/A, Sidco Industrial Estate  Maraimalai Nagar - 603 209, Tamil Nadu , India~IEC CODE NO: AAGCT6465R, PAN NO: AAGCT6465R~GSTIN NO: 33AAGCT6465R2ZJ`.split(
                "~"
              )
            ).map((line, index) => (
              <Text key={index} style={styles.textValue}>
                {line.trim()}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.row2right}>
          <View style={styles.row2right1}>
            <Text style={styles.text}>
              INVOICE NO:{" "}
              <Text style={styles.textValue}>
                {data?.orderRefNo || "192420378"}
              </Text>
            </Text>
            <Text style={styles.text}>
              DATE :{" "}
              <Text style={styles.textValue}>{data.date || "1/21/2025"}</Text>
            </Text>
          </View>
          <View style={styles.row2right2}>
            <Text style={styles.text}>
              Buyers Order No:
              <Text style={styles.textValue}>
                {data?.buyersOrderNo ||
                  "Ref: SIPL/ADVANCE TIRE PO #7360578/AUG-24"}
              </Text>
            </Text>
          </View>
          <View style={styles.row2right3}>
            <Text style={styles.text}>
              REF DATE:
              <Text style={styles.textValue}>
                {data?.refDate || "E MAIL DATE 29th AUG-24"}
              </Text>
            </Text>
          </View>
          <View style={styles.row2right4}>
            <Text style={styles.text}>Other Reference(s)</Text>
            <Text style={styles.textValue}>
              {data?.otherReferences || "SDF Form"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.row3}>
        <View style={styles.row3left}>
          <View style={styles.row3left1}>
            <View>
              <Text style={styles.text}>CONSIGNEE:</Text>
              <Text style={styles.textValue}>
                {data.consignee.name || ""}
              </Text>
              {data?.consignee?.address
                ? data.consignee.address.map((item, index) => (
                  <Text key={index} style={styles.textValue}>
                    {item.trim()}
                  </Text>
                ))
                : ''}
             <Text style={styles.textValue}>
                {data.consignee.city || ""}
              </Text>
              <Text style={styles.textValue}>
                {data.consignee.state || ""}
              </Text>
              <Text style={styles.textValue}>
                {data.consignee.country || ""}
              </Text>
            </View>
            <View>
              <Text style={styles.text}>CUSTOMER AGENT</Text>
              <Text style={styles.textValue}>{data.customerAgent.name || "M/S, ADVANCE TIRE"}</Text>
              {data?.customerAgent?.address
                ? data.consignee.address.map((item, index) => (
                  <Text key={index} style={styles.textValue}>
                    {item.trim()}
                  </Text>
                ))
                : null}
              {/* <Text style={styles.textValue}>1000 Rike Dr.</Text> */}
              {/* <Text style={styles.textValue}>Millstone Twp. NJ 08535</Text> */}
            </View>
          </View>
          <View style={styles.row3left2}>
            <View style={styles.row3left2row1}>
              <Text style={styles.text}>Pre Carriage by</Text>
              <Text style={styles.textValue}>BY {data?.preCarriageBy || ""}</Text>
            </View>
            <View style={styles.row3left2row2}>
              <Text style={styles.text}>Place of Receipt by Pre-carrier</Text>
              <Text style={styles.textValue}>{data?.placeOfReceipt || "CHENNAI-INDIA"}</Text>
            </View>
          </View>
          <View style={styles.row3left3}>
            <View style={styles.row3left3row1}>
              <Text style={styles.text}>Vessel/Flight No</Text>
              <Text style={styles.textValue}>{data?.vesselFlightNo || ""}</Text>
            </View>
            <View style={styles.row3left3row2}>
              <Text style={styles.text}>Port of Loading</Text>
              <Text style={styles.textValue}>{data?.portOfLoading || "CHENNAI-INDIA"}</Text>
            </View>
          </View>
          <View style={styles.row3left4}>
            <View style={styles.row3left2row1}>
              <Text style={styles.text}>Port of Discharge</Text>
              <Text style={styles.textValue}>{data?.portOfDischarge || "NEWYORK"}</Text>
            </View>
            <View style={styles.row3left2row2}>
              <Text style={styles.text}>Final Destination</Text>
              <Text style={styles.textValue}>{data?.finalDestination || "MILLSTONE TWP, NJ- USA"}</Text>
            </View>
          </View>
        </View>
        <View style={styles.row3right}>
          <View style={styles.row3right1}>
            <Text style={styles.text}>Buyer if otherthan Consignee</Text>
            <View>
              <Text style={styles.textValue}>
                {data?.buyerIfOtherThanConsignee?.name},
              </Text>
              {Array.isArray(data?.buyerIfOtherThanConsignee?.address) &&
                data.buyerIfOtherThanConsignee.address.map((line, index) => (
                  <Text key={index} style={styles.textValue}>
                    {line.trim()}
                  </Text>
                ))
              }
              <Text style={styles.textValue}>
                {data?.buyerIfOtherThanConsignee?.city.trim()}
              </Text>
              <Text style={styles.textValue}>
                {data?.buyerIfOtherThanConsignee?.state}
              </Text>
              <Text style={styles.textValue}>
                {data?.buyerIfOtherThanConsignee?.country}
              </Text>
            </View>

            {/* <Text style={styles.textValue}></Text>/ */}
          </View>
          <View style={styles.row3right3}>
            <View style={styles.row3right2row1}>
              <Text style={styles.text}>Country of Origin of goods</Text>
            </View>
            <View style={styles.row3right2row2}>
              <Text style={styles.text}>Country of Final Destination</Text>
            </View>
          </View>
          <View style={styles.row3right3}>
            <View style={styles.row3right2row1}>
              <Text style={styles.textValue}>{data?.countryOfOrigin || "INDIA"}</Text>
            </View>
            <View style={styles.row3right2row2}>
              <Text style={styles.textValue}>{data?.countryOfDestination || "USA"}</Text>
            </View>
          </View>
          <View style={styles.row3right4}>
            <View>
              <Text style={styles.text}> TERMS OF DELIVERY AND PAYMENT: </Text>
              <Text style={styles.textValue}>
                THE ABOVE PRICES ARE DDP NEW JERSEY, USD BY SEA.
              </Text>
            </View>
            <Text style={styles.textValue}>
              PAYMENT TERMS: 100% Payment in 90 days from the date of Bill of
              Lading Remitted in SUNDARAM INDUSTRIES PVT LIMITED
            </Text>
            <View>
              <Text style={styles.textlight}>
                Sun Tyre & Wheel Systems (A Div of SUNDARAM INDUSTRIES PRIVATE
                LIMITED), KRISHNA TOWERS, 3RD FLOOR, NP-31B/4, THIRU-VI-KA
                INDUSTRIAL ESTATE, EKKATTUTHANGAL, CHENNAI - 600 032
              </Text>
              <View>
                <Text style={styles.textValue}>
                  ACCOUNT NO: 40582959714 State Bank of India, Egmore,
                  Chennai-600008.
                </Text>
                <Text style={styles.textValue}>Swift Code: SBININBB174</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      {/* row 4 */}
      <View style={styles.row4}>
        <View style={styles.row4_1}>
          <View style={styles.row4_1heading}>
            <Text>Marks & Nos/</Text>
            <Text>Container No</Text>
          </View>
          <View style={styles.row4_1value}>
            <Text style={styles.text}>Container Size 1 x 20'</Text>
            <Text style={styles.text}>Container No: TEMU309862-1</Text>
            <Text style={styles.text}>Liner Seal No OOLKHF7308</Text>
            <Text style={styles.text}>OTS NO: iTEK03254133</Text>
          </View>
          <View></View>
        </View>
        <View style={styles.row4_2}>
          <View style={styles.row4_1heading}>
            <Text>No & Kind of Packing</Text>
          </View>
          <View style={styles.row4_1value}>
            <Text style={styles.text}>I.T.C.(H.S) NO.</Text>
            <Text style={styles.text}>4012 90 20</Text>
            <Text style={styles.text}>128 LOOSE TYRES</Text>
          </View>
          <View></View>
        </View>
        <View style={styles.row4_3}>
          <View style={styles.row4_1heading}>
            <Text>Description of goods</Text>
          </View>
          <View style={styles.row4_1value}>
            <Text style={styles.text}>
              Automobile tyres reinforced with Nylon tyre Cord warp sheet /
              Rayon Tyre cord warp sheet.
            </Text>
            <Text style={styles.text}>
              SOLID INDUSTRIAL TYRES LESS DISCOUNT 3%
            </Text>
          </View>
          <View style={styles.row4_1botm}>
            <View style={styles.row4_1botm1}></View>
            <View style={styles.row4_1botmtotal}>
              <Text style={styles.heading}>TOTAL: </Text>
            </View>
          </View>
        </View>
        <View style={styles.row4_4}>
          <View style={styles.row4_1heading}>
            <Text>QUANITITY KGS</Text>
          </View>
          <View style={styles.row4_1value}>
            <Text style={styles.text}>15496.800</Text>
          </View>
          <View style={styles.row4_1botm}>
            <Text style={styles.heading}>15496.800</Text>
          </View>
        </View>
        <View style={styles.row4_5}>
          <View style={styles.row4_1heading}>
            <Text>UNIT PRICES DDP USD</Text>
          </View>
          <View style={styles.row4_1value}>
            <Text style={styles.text}>2.64525</Text>
          </View>
          <View></View>
        </View>
        <View style={styles.row4_6}>
          <View style={styles.row4_1heading}>
            <Text>TOTAL PRICES DDP USD</Text>
          </View>
          <View style={styles.row4_1value}>
            <Text style={styles.text}>40992.84</Text>
            <Text style={styles.text}>1229.79</Text>
          </View>
          <View style={styles.row4_1botm}>
            <Text style={styles.heading}>39763.05</Text>
          </View>
        </View>
      </View>
      {/* row5 */}
      <View style={styles.row5}>
        <Text style={styles.textValue}>
          (USD THIRTY NINE THOUSAND SEVEN HUNDRED SIXTY THREE AND CENTS FIVE
          ONLY)
        </Text>
        <View>
          <Text style={styles.textValue}>GROSS WT: 15496.800 KGS</Text>
          <Text style={styles.textValue}>NETT WT : 15496.800 KGS</Text>
        </View>
        <View></View>
        <Text style={{ textAlign: "center", fontWeight: "bold" }}>
          DECLARATION
        </Text>
        <Text style={styles.textValue}>
          WE DECLARE THAT THIS INVOICE CUM PACKING LIST SHOWS THE ACTUAL PRICE
          OF GOODS DESCRIBED AND ALL THE PARTICULARS ARE TRUE AND CORRECT.
        </Text>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "90px",
          }}
        >
          <View
            style={{
              width: "50%",
              height: "100%",
              textAlign: "left",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.textValue}>
              The above shipment is under Advance Licence & EPCG Scheme. S.No-I
              Advance Licence No. 0411007094 dt. 14.03.2024 S.No-II (MOOWR
              Licence No. 0411007094 date. 14.03.2024)
            </Text>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={{ fontSize: "7", padding: "5", color: "red" }}>
                IGST-Letter Of Undertaking (ARN)AD3302240385774 valid till
                31.03.2025
              </Text>
            </View>
          </View>
          <View
            style={{
              width: "50%",
              height: "100%",
              textAlign: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.textValue}>
              FOR SUNDHARAM INDUSTRIES PRIVATE LIMITED
            </Text>
            <Text style={styles.textValue}>Authorized Signatory</Text>
          </View>
        </View>
      </View>
      {/* row6 */}
      <View style={styles.row6}>
        <Text
          style={{ fontWeight: "bold", fontSize: "7", textAlign: "center" }}
        >
          SUNDARAM INDUSTRIES PRIVATE LIMITED (Formerly Known as T.S.Rajam Tyres
          Private Limited) Regd Office: 'NO. 10
        </Text>
        <Text
          style={{ fontWeight: "bold", fontSize: "7", textAlign: "center" }}
        >
          Jawahar road Chokkikulam, Madurai - 625002.
        </Text>
        <Text
          style={{ fontWeight: "bold", fontSize: "7", textAlign: "center" }}
        >
          CIN:U51901TN2018PTC121156 Email: crm@sun-tws.com , Website:
          www.sun-tws.com , Tel: 044 - 43857129
        </Text>
      </View>
    </Page>
  </Document>
);

// Viewer component
const ExportInvoiceBillPDF = () => {
  const { sales, address, additionalForm } = useSelector((state) => state.invoice.exportInvoices.invoiceDetails)
  const invoice = { ...sales, ...address, ...additionalForm }
  console.log(invoice);

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
      address: invoice?.billingAddress?.split('~') || '',
      city: invoice?.billingCity || '',
      state: invoice?.billingState || '',
      country:invoice?.billingCountry || '' 
    },
    customerAgent: {
      name: "M/S, ADVANCE TIRES",
      address: ["1000 Rike Dr.", "Millstone Twp. NJ 08535"],
    },
    preCarriageBy: invoice?.PreCarriageby.toUpperCase() ||"",
    placeOfReceipt: invoice?.PlaceOfReceiptByPreCarrier.toUpperCase() ||"",
    vesselFlightNo: invoice?.VesseFlight || "",
    portOfLoading: "CHENNAI-INDIA",
    portOfDischarge: "NEWYORK",
    finalDestination: "MILLSTONE TWP, NJ- USA",
    buyerIfOtherThanConsignee: {
      name: invoice?.shippingCompanyName || '',
      address: invoice?.shippingAddress?.split('~') || '',
      city: invoice?.shippingCity || '',
      state:invoice?.shippingState || '',
      country:invoice?.shippingcountry || ''
    },
    countryOfOrigin: "INDIA",
    countryOfDestination: "USA",
    deliveryTerms: "THE ABOVE PRICES ARE DDP NEW JERSEY, USD BY SEA.",
    paymentTerms:
      "100% Payment in 90 days from the date of Bill of Lading Remitted in SUNDARAM INDUSTRIES PVT LIMITED",
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
      size: "1 x 20'",
      containerNo: "TEMU309862-1",
      linerSealNo: "OOLKHF7308",
      otsNo: "iTEK03254133",
    },
    packingDetails: {
      itcHsNo: "4012 90 20",
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

  const navigate = useNavigate();
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
        <InvoicePDF data={data} />
      </PDFViewer>
    </div>
  );
};

export default ExportInvoiceBillPDF;
