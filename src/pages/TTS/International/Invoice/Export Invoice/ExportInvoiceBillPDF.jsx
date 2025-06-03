import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

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
    fontSize: 9,
    padding: 1,
  },

  // row1
  row1: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    marginTop: "20px",
    height: 15,
    borderTop: BORDER_BOLD,
    borderRight: BORDER_BOLD,
    borderLeft: BORDER_BOLD,
  },

  //row2
  row2: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    height: "120px",
    borderLeft: BORDER_BOLD,
    borderRight: BORDER_BOLD,
    borderBottom: BORDER_THIN,
    borderTop: BORDER_THIN,
  },

  // row2 left side
  row2left: {
    width: "60.5%",
    height: "120px",
  },

  // row2 right side
  row2right: {
    width: "40%",
    height: 130,
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
    height: 50,
    borderBottom: BORDER_THIN,
    borderLeft: BORDER_THIN,
  },
  // row2 right side 3
  row2right3: {
    width: "100%",
    height: 38, // So the total = 100
    borderLeft: BORDER_THIN,
  },
  // row3
  row3: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    height: "180px",
    borderBottom: BORDER_THIN,
    borderLeft: BORDER_BOLD,
  },
  // row3 left side
  row3left: {
    width: "60%",
    height: "180px",
    display: "flex",
    flexDirection: "column",
  },
  // row3 left side 1
  row3left1: {
    height: "150px",
    borderBottom: BORDER_THIN,
    justifyContent: "center",
  },
  // row3 left side 2
  row3left2: {
    height: 40,
    flexDirection: "row",
  },
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
    height: "100%",
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
    width: "40%",
    borderLeft: BORDER_THIN,
    borderRight: BORDER_BOLD,
  },
  // row3 right side 1 row
  row3right1: {
    height: "50px",
    justifyContent: "center",
    borderBottom: BORDER_THIN,
  },

  // row3 right side 2 row
  row3right2: {
    height: "19px",
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "row",
    borderBottom: BORDER_THIN,
  },
  row3right2row1: {
    width: "50%",
    borderRight: BORDER_THIN,
  },
  row3right2row2: {
    width: "50%",
  },
  // row3 right side 2 row 1
  row3right3: {
    height: "19px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    borderBottom: BORDER_THIN,
  },
  row3right4: {
    height: "92px",
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
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
    justifyContent: "center",
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
    justifyContent: "space-evenly",
    borderLeft: BORDER_BOLD,
    borderBottom: BORDER_THIN,
    borderRight: BORDER_BOLD,
  },
  row6: {
    height: "40px",
    width: "100%",
    borderLeft: BORDER_BOLD,
    borderBottom: BORDER_BOLD,
    borderRight: BORDER_BOLD,
  },
  text: {
    fontSize: 7,
    padding: 5,
  },
  textb: {
    fontSize: 7,
    padding: 5,
    textAlign: "center",
  },
});

// PDF content component
const InvoicePDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.row1}>
        <Text style={styles.heading}>INVOICE CUM PACKING LIST</Text>
      </View>
      <View style={styles.row2}>
        <View style={styles.row2left}>
          <Text style={styles.text}>EXPORTER:</Text>
          <Text style={styles.text}>SUNDARAM INDUSTRIES PRIVATE LIMITED</Text>
          <Text style={styles.text}>
            ( Formerly known as T.S.Rajam Tyres Pvt Limited) ( DIVISION SUN TYRE
            & WHEEL SYSTEMS)
          </Text>
          <Text style={styles.text}>A1-F3/A, Sidco Industrial Estate</Text>
          <Text style={styles.text}>
            Maraimalai Nagar - 603 209, Tamil Nadu , India
          </Text>
          <Text style={styles.text}>
            IEC CODE NO: AAGCT6465R, GSTIN NO: 33AAGCT6465R2ZJ PAN NO:
          </Text>
          <Text style={styles.text}>AAGCT6465R</Text>
        </View>
        <View style={styles.row2right}>
          <View style={styles.row2right1}>
            <Text style={styles.text}>Invoice No: 192420378</Text>
            <Text style={styles.text}>DATE : 1/21/2025</Text>
          </View>
          <View style={styles.row2right2}>
            <Text style={styles.text}>Buyers Order No Ref:</Text>
            <Text style={styles.text}>
              REF: SIPL/ADVANCE TIRE PO #7360578/AUG-24
            </Text>
            <Text style={styles.text}>E MAIL DATE 29th AUG-24</Text>
          </View>
          <View style={styles.row2right3}>
            <Text style={styles.text}>Other Reference(s)</Text>
            <Text style={styles.text}>SDF Form</Text>
          </View>
        </View>
      </View>
      <View style={styles.row3}>
        <View style={styles.row3left}>
          <View style={styles.row3left1}>
            <Text style={styles.text}>CONSIGNEE:</Text>
            <Text style={styles.text}>M/S, ADVANCE TIRES</Text>
            <Text style={styles.text}>1000 Rike Dr.</Text>
            <Text style={styles.text}>Millstone Twp. NJ 08535</Text>
          </View>
          <View style={styles.row3left2}>
            <View style={styles.row3left2row1}>
              <Text style={styles.text}>Pre Carriage by</Text>
              <Text style={styles.text}>BY SEA</Text>
            </View>
            <View style={styles.row3left2row2}>
              <Text style={styles.text}>
                Place of Receipt by Pre-carrier CHENNAI-INDIA
              </Text>
            </View>
          </View>
          <View style={styles.row3left3}>
            <View style={styles.row3left3row1}>
              <Text style={styles.text}>Vessel/Flight No</Text>
            </View>
            <View style={styles.row3left3row2}>
              <Text style={styles.text}>Port of Loading CHENNAI-INDIA</Text>
            </View>
          </View>
          <View style={styles.row3left4}>
            <View style={styles.row3left2row1}>
              <Text style={styles.text}>Port of Discharge NEWYORK</Text>
            </View>
            <View style={styles.row3left2row2}>
              <Text style={styles.text}>
                Final Destination MILLSTONE TWP, NJ- USA
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.row3right}>
          <View style={styles.row3right1}>
            <Text style={styles.text}>Buyer (if otherthan Consignee)</Text>
          </View>
          <View style={styles.row3right2}>
            <View style={styles.row3right2row1}>
              <Text style={styles.text}>Country of Origin of goods</Text>
            </View>
            <View style={styles.row3right2row2}>
              <Text style={styles.text}>Country of Final Destination</Text>
            </View>
          </View>
          <View style={styles.row3right3}>
            <View style={styles.row3right2row1}>
              <Text style={styles.text}>INDIA</Text>
            </View>
            <View style={styles.row3right2row2}>
              <Text style={styles.text}>USA</Text>
            </View>
          </View>
          <View style={styles.row3right4}>
            <Text style={styles.text}> TERMS OF DELIVERY AND PAYMENT: </Text>
            <Text style={styles.text}>
              THE ABOVE PRICES ARE DDP NEW JERSEY, USD BY SEA.
            </Text>
            <Text style={styles.text}>
              100% Payment in 90 days from the date of Bill of Lading Remitted
              in SUNDARAM INDUSTRIES PVT LIMITED
            </Text>
          </View>
        </View>
      </View>
      {/* row 4 */}
      <View style={styles.row4}>
        <View style={styles.row4_1}>
          <View style={styles.row4_1heading}>
            <Text>Marks & Nos/ Container No</Text>
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
              <Text>TOTAL</Text>
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
            <Text>15496.800</Text>
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
            <Text>39763.05</Text>
          </View>
        </View>
      </View>
      {/* row5 */}
      <View style={styles.row5}>
        <Text style={styles.text}>
          (USD THIRTY NINE THOUSAND SEVEN HUNDRED SIXTY THREE AND CENTS FIVE
          ONLY)
        </Text>
        <Text style={styles.text}>
          GROSS WT: 15496.800 KGS NETT WT : 15496.800 KGS
        </Text>
        <Text style={{ textAlign: "center" }}>DECLARATION</Text>
        <Text style={styles.text}>
          WE DECLARE THAT THIS INVOICE CUM PACKING LIST SHOWS THE ACTUAL PRICE
          OF GOODS DESCRIBED AND ALL THE PARTICULARS ARE TRUE AND CORRECT.
        </Text>
        <Text style={styles.text}>
          The above shipment is under Advance Licence & EPCG Scheme. Advance
          Licence No. 0411007094 dt. 14.03.2024 & EPCG SCHEME NO: 0431006716
          Date 12/01/2024
        </Text>
        <Text style={{ fontSize: "7", padding: "5", color: "red" }}>
          IGST-Letter Of Undertaking (ARN)AD3302240385774 valid till 31.03.2025
        </Text>
      </View>
      <View style={styles.row6}>
        <Text style={styles.textb}>
          SUNDARAM INDUSTRIES PRIVATE LIMITED (Formerly Known as T.S.Rajam Tyres
          Private Limited) Regd Office: 'NO. 10
        </Text>
        <Text style={{ textAlign: "center", fontSize: "7" }}>
          Jawahar road Chokkikulam, Madurai - 625002.
        </Text>
        <Text style={{ fontWeight: "bold", fontSize: "7" }}>
          CIN:U51901TN2018PTC121156 Email: crm@sun-tws.com , Website:
          www.sun-tws.com , Tel: 044 - 43857129
        </Text>
      </View>
    </Page>
  </Document>
);

// Viewer component
const ExportInvoiceBillPDF = () => {
  return (
    <div>
      <PDFViewer style={styles.pdf}>
        <InvoicePDF data={{}} />
      </PDFViewer>
    </div>
  );
};

export default ExportInvoiceBillPDF;
