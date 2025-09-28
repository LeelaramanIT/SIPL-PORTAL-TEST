import { Document, Page, Text, View } from "@react-pdf/renderer";
import { getCurrency } from "../../../../../utils/currencies";

const InvoicePDF = ({ data, styles }) => (
  <Page size="A4" style={styles.page}>
    {/* Watermark Element */}
    <View
      fixed
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: -2, // This is the key
      }}
    >
      <Text
        style={{
          fontSize: 60,
          color: "rgba(0, 0, 0, 0.1)",
          transform: "rotate(-45deg)",
          userSelect: "none",
        }}
      >
        CONFIDENTIAL
      </Text>
    </View>
    <View style={styles.row1}>
      <Text style={styles.heading}>INVOICE CUM PACKING LIST</Text>
    </View>
    <View style={styles.row2}>
      <View style={styles.row2left}>
        <Text style={styles.text}>EXPORTER:</Text>
        <View>
          {(data?.exporter ? data?.exporter.toUpperCase().split("~") : []).map(
            (line, index) => (
              <Text key={index} style={styles.textValue}>
                {line.trim()}
              </Text>
            )
          )}
        </View>
      </View>
      <View style={styles.row2right}>
        <View style={styles.row2right1}>
          <Text style={styles.text}>
            INVOICE NO:{" "}
            <Text style={styles.textValue}>{data?.invoiceNumber || ""}</Text>
          </Text>
          <Text style={styles.text}>
            DATE : <Text style={styles.textValue}>{data?.date || ""}</Text>
          </Text>
        </View>
        <View style={styles.row2right2}>
          <Text style={styles.text}>
            Buyers Order No:
            <Text style={styles.textValue}>{data?.buyersOrderNo || ""}</Text>
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
            <Text style={styles.textValue}>Name: {data?.consignee?.name || ""}</Text>
            {data?.consignee?.address
              ? data?.consignee?.address.map((item, index) => (
                  <Text key={index} style={styles.textValue}>
                    {item.trim().toUpperCase()}
                  </Text>
                ))
              : ""}
            <Text style={styles.textValue}>
              City: {data?.consignee.city.toUpperCase() || ""}
            </Text>
            <Text style={styles.textValue}>
              State: {data?.consignee.state.toUpperCase() || ""}
            </Text>
            <Text style={styles.textValue}>
              Cuntory: {data?.consignee.country.toUpperCase() || ""}
            </Text>
          </View>
          {data?.customerAgent && (
            <View>
              <Text style={styles.text}>CUSTOMER AGENT</Text>
              <Text style={styles.textValue}>
                {data?.customerAgent?.name?.toUpperCase() || ""}
              </Text>
              {data?.customerAgent?.address
                ? data?.customerAgent?.address.map((item, index) => (
                    <Text key={index} style={styles.textValue}>
                      {item.trim().toUpperCase()}
                    </Text>
                  ))
                : null}
            </View>
          )}
        </View>
        <View style={styles.row3left2}>
          <View style={styles.row3left2row1}>
            <Text style={styles.text}>Pre Carriage by</Text>
            <Text style={styles.textValue}>BY {data?.preCarriageBy || ""}</Text>
          </View>
          <View style={styles.row3left2row2}>
            <Text style={styles.text}>Place of Receipt by Pre-carrier</Text>
            <Text style={styles.textValue}>{data?.placeOfReceipt || ""}</Text>
          </View>
        </View>
        <View style={styles.row3left3}>
          <View style={styles.row3left3row1}>
            <Text style={styles.text}>Vessel/Flight No</Text>
            <Text style={styles.textValue}>{data?.vesselFlightNo || ""}</Text>
          </View>
          <View style={styles.row3left3row2}>
            <Text style={styles.text}>Port of Loading</Text>
            <Text style={styles.textValue}>
              {data?.portOfLoading || ""}
            </Text>
          </View>
        </View>
        <View style={styles.row3left4}>
          <View style={styles.row3left2row1}>
            <Text style={styles.text}>Port of Discharge</Text>
            <Text style={styles.textValue}>
              {data?.portOfDischarge || ""}
            </Text>
          </View>
          <View style={styles.row3left2row2}>
            <Text style={styles.text}>Final Destination</Text>
            <Text style={styles.textValue}>
              {data?.finalDestination || ""}
            </Text>
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
              data?.buyerIfOtherThanConsignee.address.map((line, index) => (
                <Text key={index} style={styles.textValue}>
                  {line.trim().toUpperCase()}
                </Text>
              ))}
            <Text style={styles.textValue}>
              {data?.buyerIfOtherThanConsignee?.city.trim().toUpperCase()}
            </Text>
            <Text style={styles.textValue}>
              {data?.buyerIfOtherThanConsignee?.state.trim().toUpperCase()}
            </Text>
            <Text style={styles.textValue}>
              {data?.buyerIfOtherThanConsignee?.country.trim().toUpperCase()}
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
            <Text style={styles.textValue}>{data?.countryOfOrigin.toUpperCase() || ""}</Text>
          </View>
          <View style={styles.row3right2row2}>
            <Text style={styles.textValue}>
              {data?.countryOfDestination.toUpperCase() || ""}
            </Text>
          </View>
        </View>
        <View style={styles.row3right4}>
          <View>
            <Text style={styles.text}> TERMS OF DELIVERY AND PAYMENT: </Text>
            <Text style={styles.textValue}>
              {`THE ABOVE PRICES ARE ${data?.incoterm?.toUpperCase()} ${data?.finalDestination}, USD BY ${data?.preCarriageBy}.`}
            </Text>
          </View>
          <Text style={styles.textValue}>{data?.paymentTerms}</Text>
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
          <Text style={styles.text}>
            Container Size 1 x {data?.containerDetails?.size}
          </Text>
          <Text style={styles.text}>
            Container No: {data?.containerDetails?.containerNo}
          </Text>
          <Text style={styles.text}>
            Liner Seal No: {data?.containerDetails?.linerSealNo}
          </Text>
          <Text style={styles.text}>
            OTS NO: {data?.containerDetails?.otsNo}
          </Text>
        </View>
        <View></View>
      </View>
      <View style={styles.row4_2}>
        <View style={styles.row4_1heading}>
          <Text>No & Kind of Packing</Text>
        </View>
        <View style={styles.row4_1value}>
          <Text style={styles.text}>I.T.C.(H.S) NO.</Text>
          <Text style={styles.text}>{data?.itcHsNo}</Text>
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
            Automobile tyres reinforced with Nylon tyre Cord warp sheet / Rayon
            Tyre cord warp sheet.
          </Text>
          {/* <Text style={styles.text}>
                SOLID INDUSTRIAL TYRES LESS DISCOUNT 3%
              </Text> */}
        </View>
        <View style={styles.row4_1botm}>
          <View style={styles.row4_1botm1}></View>
          {/* <View style={styles.row4_1botmtotal}></View> */}
        </View>
      </View>
      <View style={styles.row4_5}>
        <View style={styles.row4_1heading}>
          <Text>QUANITITY</Text>
        </View>
        <View style={styles.row4_1value}>
          <Text style={styles.text}>{data?.totalqty}</Text>
          {/* <Text style={styles.text}>1229.79</Text> */}
        </View>
        <View style={styles.row4_1botm}>
          <Text style={styles.heading}>TOTAL:</Text>
        </View>
      </View>
      <View style={styles.row4_4}>
        <View style={styles.row4_1heading}>
          <Text>QUANITITY KGS</Text>
        </View>
        <View style={styles.row4_1value}>
          <Text style={styles.text}>{data?.grossWeight}</Text>
        </View>
        <View style={styles.row4_1botm}>
          <Text style={styles.heading}>{data?.grossWeight}</Text>
        </View>
      </View>
      <View style={styles.row4_5}>
        <View style={styles.row4_1heading}>
          <Text>UNIT PRICES DDP USD</Text>
        </View>
        <View style={styles.row4_1value}>
          <Text style={styles.text}>{data?.unitPrice}</Text>
        </View>
        <View></View>
      </View>
      <View style={styles.row4_6}>
        <View style={styles.row4_1heading}>
          <Text>TOTAL PRICES DDP USD</Text>
        </View>
        <View style={styles.row4_1value}>
          <Text style={styles.text}>{data?.grandTotal}</Text>
          {/* <Text style={styles.text}>1229.79</Text> */}
        </View>
        <View style={styles.row4_1botm}>
          <Text style={styles.heading}>{`${data.currencySymble} ${data?.grandTotal}`}</Text>
        </View>
      </View>
    </View>
    {/* row5 */}
    <View style={styles.row5}>
      <Text style={styles.textValue}>
        {data?.amountInWords}
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
        WE DECLARE THAT THIS INVOICE CUM PACKING LIST SHOWS THE ACTUAL PRICE OF
        GOODS DESCRIBED AND ALL THE PARTICULARS ARE TRUE AND CORRECT.
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
            {data?.licenceDetails?.description ||
              `The above shipment is under Advance Licence & EPCG Scheme. S.No-I
                Advance Licence No. 0411007094 dt. 14.03.2024 S.No-II (MOOWR
                Licence No. 0411007094 date. 14.03.2024)`}
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
            FOR SUNDARAM INDUSTRIES PRIVATE LIMITED
          </Text>
          <Text style={styles.textValue}>Authorized Signatory</Text>
        </View>
      </View>
    </View>
    {/* row6 */}
    <View style={styles.row6}>
      <Text style={{ fontWeight: "bold", fontSize: "7", textAlign: "center" }}>
        SUNDARAM INDUSTRIES PRIVATE LIMITED (Formerly Known as T.S.Rajam Tyres
        Private Limited) Regd Office: 'NO. 10
      </Text>
      <Text style={{ fontWeight: "bold", fontSize: "7", textAlign: "center" }}>
        Jawahar road Chokkikulam, Madurai - 625002.
      </Text>
      <Text style={{ fontWeight: "bold", fontSize: "7", textAlign: "center" }}>
        CIN:U51901TN2018PTC121156 Email: crm@sun-tws.com , Website:
        www.sun-tws.com , Tel: 044 - 43857129
      </Text>
    </View>
  </Page>
);

export default InvoicePDF;
