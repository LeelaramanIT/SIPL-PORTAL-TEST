import { Document, Page, Text, View } from "@react-pdf/renderer";
import { getCurrency } from "../../../../../utils/currencies";

const InvoicePDF = ({ data, styles }) => (
  <Page size="A4" style={styles.page}>
    {console.log(data)}
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
      <Text style={styles.heading}>{data?.licenceDetails?.scheme === "Import_Invoice" ? "IMPORTED INVOICE CUM PACKING LIST" : "INVOICE CUM PACKING LIST"}</Text>
    </View>
    <View style={styles.row2}>
      <View style={styles.row2left}>
        <Text style={[styles.text, { fontWeight: "bold" }]}>EXPORTER:</Text>
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
          <Text style={[styles.text, { fontWeight: "bold" }]}>
            INVOICE NO:{" "}
            <Text style={styles.textValue}>{data?.invoiceNumber || ""}</Text>
          </Text>
          <Text style={[styles.text, { fontWeight: "bold" }]}>
            DATE : <Text style={styles.textValue}>{data?.date || ""}</Text>
          </Text>
        </View>
        <View style={styles.row2right2}>
          <Text style={[styles.text, { fontWeight: "bold" }]}>
            BUYERS ORDER NO:
            <Text style={styles.textValue}>{data?.BuyersOrderNumber || data?.buyersOrderNo || ""}</Text>
          </Text>
        </View>
        <View style={styles.row2right3}>
          <Text style={[styles.text, { fontWeight: "bold" }]}>
            REF DATE:
            <Text style={styles.textValue}>
              {data?.refDate || "E MAIL DATE 29th AUG-24"}
            </Text>
          </Text>
        </View>
        <View style={styles.row2right4}>
          <Text style={[styles.text, { fontWeight: "bold" }]}>OTHER REFERENCE(s)</Text>
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
            {/* <Text style={[styles.text, { fontWeight: "bold" }]}>CONSIGNEE:</Text> */}
            <Text style={[styles.text, { fontWeight: "bold" }]}>CONSIGNEE  / BUYER:</Text>
            <Text style={styles.textValue}>{data?.consignee?.name || ""}</Text>
            {data?.consignee?.address
              ? data?.consignee?.address.map((item, index) => (
                <Text key={index} style={styles.textValue}>
                  {item.trim().toUpperCase()}
                </Text>
              ))
              : ""}
            <Text style={styles.textValue}>
              {data?.consignee.city.toUpperCase() || ""}
            </Text>
            <Text style={styles.textValue}>
              {data?.consignee.state.toUpperCase() || ""}
            </Text>
            <Text style={styles.textValue}>
              {data?.consignee.country.toUpperCase() || ""}
            </Text>
          </View>
          {data?.notifyParty &&
            Object.values(data.notifyParty).some(value => value && value !== "") && (
              <View style={{ borderTop: 1 }}>
                <Text style={[styles.text, { fontWeight: "bold" }]}>NOTIFY PARTY:</Text>

                {data?.notifyParty?.name && (
                  <Text style={styles.textValue}>
                    Name: {data.notifyParty.name.toUpperCase()}
                  </Text>
                )}

                {data?.notifyParty?.email && (
                  <Text style={styles.textValue}>
                    Email: {data.notifyParty.email.toUpperCase()}
                  </Text>
                )}

                {data?.notifyParty?.phone && (
                  <Text style={styles.textValue}>
                    Phone: {data.notifyParty.phone.toUpperCase()}
                  </Text>
                )}

                {data?.notifyParty?.address && (
                  <Text style={styles.textValue}>
                    Address: {data.notifyParty.address.toUpperCase()}
                  </Text>
                )}

                {data?.notifyParty?.city && (
                  <Text style={styles.textValue}>
                    City: {data.notifyParty.city.toUpperCase()}
                  </Text>
                )}

                {(data?.notifyParty?.state || data?.notifyParty?.country) && (
                  <Text style={styles.textValue}>
                    {data.notifyParty.state && `State: ${data.notifyParty.state.toUpperCase()}`}
                    {data.notifyParty.state && data.notifyParty.country && ", "}
                    {data.notifyParty.country && `Country: ${data.notifyParty.country.toUpperCase()}`}
                  </Text>
                )}
              </View>
            )}

        </View>
        <View style={styles.row3left2}>
          <View style={styles.row3left2row1}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>PRE CARRIAGE BY</Text>
            <Text style={styles.textValue}>BY {data?.preCarriageBy || ""}</Text>
          </View>
          <View style={styles.row3left2row2}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>PLACE OF RECEIPT BY PRE-CARRIER</Text>
            <Text style={styles.textValue}>{data?.placeOfReceipt || ""}</Text>
          </View>
        </View>
        <View style={styles.row3left3}>
          <View style={styles.row3left3row1}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>VESSEL/FLIGHT NO</Text>
            <Text style={styles.textValue}>{data?.vesselFlightNo || ""}</Text>
          </View>
          <View style={styles.row3left3row2}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>PORT OF LOADING</Text>
            <Text style={styles.textValue}>
              {data?.portOfLoading || ""}
            </Text>
          </View>
        </View>
        <View style={styles.row3left4}>
          <View style={styles.row3left2row1}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>PORT OF DISCHARGE</Text>
            <Text style={styles.textValue}>
              {data?.portOfDischarge || ""}
            </Text>
          </View>
          <View style={styles.row3left2row2}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>FINAL DESTINATION</Text>
            <Text style={styles.textValue}>
              {data?.finalDestination || ""}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.row3right}>
        <View style={styles.row3right1}>
          {/* <Text style={[styles.text, { fontWeight: "bold" }]}>BUYER IF OTHERTHEN CONSIGNEE:</Text> */}
          <Text style={[styles.text, { fontWeight: "bold" }]}>SHIP TO:</Text>
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
            <Text style={[styles.text, { fontWeight: "bold" }]}>COUNTRY OF ORIGIN OF GOODS</Text>
          </View>
          <View style={styles.row3right2row2}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>COUNTRY OF FINAL DESTINATION</Text>
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
            <Text style={[styles.text, { fontWeight: "bold" }]}> TERMS OF DELIVERY AND PAYMENT: </Text>
            <Text style={styles.textValue}>
              {`THE ABOVE PRICES ARE ${data?.incoterm?.toUpperCase()} ${data?.placeOfIncoterm}, USD BY ${data?.preCarriageBy}.`}
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

      {/* ---------------------- ROW 1 : CONTAINER DETAILS ---------------------- */}
      <View style={styles.row4_1}>
        <View style={styles.row4_1heading}>
          <Text>MARKS & NOS/</Text>
          <Text>CONTAINER NO</Text>
        </View>

        <View style={styles.row4_1value}>
          <View>
            <Text style={[styles.text, { fontWeight: "bold" }]}>CONTAINER SIZE:</Text>
            <Text style={styles.text}>{data?.containerDetails?.size}</Text>
          </View>

          <View>
            <Text style={[styles.text, { fontWeight: "bold" }]}>CONTAINER NO:</Text>
            <Text style={styles.text}>{data?.containerDetails?.containerNo}</Text>
          </View>

          <View>
            <Text style={[styles.text, { fontWeight: "bold" }]}>LINER SEAL NO:</Text>
            <Text style={styles.text}>{data?.containerDetails?.linerSealNo}</Text>
          </View>

          <View>
            <Text style={[styles.text, { fontWeight: "bold" }]}>OTS NO:</Text>
            <Text style={styles.text}>{data?.containerDetails?.otsNo}</Text>
          </View>
        </View>
      </View>

      {/* ---------------------- ROW 2 : PACKING ---------------------- */}
      <View style={styles.row4_2}>
        <View style={styles.row4_1heading}>
          <Text>NO & KIND OF</Text>
          <Text>PACKING</Text>
        </View>

        <View style={styles.row4_1value}>
          <View>
            <Text style={[styles.text, { fontWeight: "bold" }]}>I.T.C.(H.S) NO:</Text>
            {data?.packingDetails?.itcHsNo?.split(",").map((code, i) => (
              <Text key={i} style={styles.text}>{code.trim()}</Text>
            ))}
          </View>

          <View>
            {data?.tyreCount &&
              Object.values(data?.tyreCount).map((text, i) => (
                <Text key={i} style={styles.text}>{text}</Text>
              ))}
          </View>
          {/* <View>
            {data?.tyreCount?.totalTyres && (
              <Text style={styles.text}>
                {data?.tyreCount?.totalTyres}
              </Text>
            )}
            {console.log("Rendering totalTyres:", data?.tyreCount?.totalTyres)
}
          </View> */}
        </View>
      </View>

      {/* ---------------------- ROW 3 : DESCRIPTION + OTHER CHARGES ---------------------- */}
      <View style={styles.row4_3}>
        <View style={styles.row4_1heading}>
          <Text>DESCRIPTION OF GOODS</Text>
        </View>

        <View style={[styles.row4_1value, { flexDirection: "column" }]}>

          {/* Description Centered */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            {data?.packingDetails?.description
              ?.split(",")
              .map((desc, i) => (
                <Text key={i} style={styles.text}>{desc.trim()}</Text>
              ))}
          </View>

          {/* Other Charges at Bottom */}
          {data?.otherCharges?.length > 0 && (
            <View style={{ marginTop: "auto" }}>
              <Text style={[styles.text, { fontWeight: "bold" }]}>OTHER CHARGES:</Text>
              {data?.otherCharges?.map((charge, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    paddingVertical: 2,
                    // borderBottom: "0.5px solid #ccc",
                  }}
                >
                  <Text style={{ ...styles.text, width: "100%" }}>{charge.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.row4_1botm}>
          <View style={styles.row4_1botm1}></View>
        </View>
      </View>

      {/* ---------------------- ROW 4 : QUANTITY ---------------------- */}
      <View style={styles.row4_5}>
        <View style={styles.row4_1heading}>
          <Text>QUANTITY</Text>
        </View>
        <View style={styles.row4_1value}>
          <Text style={styles.text}>{data?.totalqty}</Text>
          {/* Other Charges */}
          {data?.otherCharges?.length > 0 && (
            <View
              style={{
                marginTop:
                  data.otherCharges.length === 1
                    ? -35
                    : data.otherCharges.length === 2
                      ? -10
                      : data.otherCharges.length === 3
                        ? 15
                        : 0,
                backgroundColor: "#ccc",
              }}
            />
          )}
        </View>
        <View style={styles.row4_1botm}>
          <Text style={styles.heading}>TOTAL:</Text>
        </View>
      </View>

      {/* ---------------------- ROW 5 : QUANTITY KGS ---------------------- */}
      <View style={styles.row4_4}>
        <View style={styles.row4_1heading}>
          <Text>QUANTITY KGS</Text>
        </View>
        <View style={styles.row4_1value}>
          <Text style={styles.text}>{data?.netWeight}</Text>
          {/* Other Charges */}
          {data?.otherCharges?.length > 0 && (
            <View
              style={{
                marginTop:
                  data.otherCharges.length === 1
                    ? -35
                    : data.otherCharges.length === 2
                      ? -10
                      : data.otherCharges.length === 3
                        ? 15
                        : 0,
                backgroundColor: "#ccc",
              }}
            />
          )}
        </View>
        <View style={styles.row4_1botm}>
          <Text style={styles.heading}>{data?.netWeight}</Text>
        </View>
      </View>

      {/* ---------------------- ROW 6 : UNIT PRICE ---------------------- */}
      <View style={styles.row4_5}>
        <View style={styles.row4_1heading}>
          <Text>UNIT PRICES</Text>
        </View>
        <View style={styles.row4_1value}>
          <Text style={styles.text}>{data?.unitPrice}</Text>
          {/* Other Charges */}
          {data?.otherCharges?.length > 0 && (
            <View
              style={{
                marginTop:
                  data.otherCharges.length === 1
                    ? -35
                    : data.otherCharges.length === 2
                      ? -10
                      : data.otherCharges.length === 3
                        ? 15
                        : 0,
                backgroundColor: "#ccc",
              }}
            />
          )}
        </View>
      </View>

      {/* ---------------------- ROW 7 : TOTAL PRICES + OTHER CHARGES + FINAL ---------------------- */}
      <View style={styles.row4_6}>

        {/* LEFT HEADING */}
        <View style={styles.row4_1heading}>
          <Text style={{ fontSize: 6 }}>
            TOTAL PRICES {data?.incoterm?.toUpperCase()} {data?.placeOfIncoterm} {data?.usercurrency}
          </Text>
        </View>

        {/* RIGHT COLUMN */}
        <View style={[styles.row4_1value, { flexDirection: "column", justifyContent: "flex-start" }]}>

          {/* Center Base Price */}
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ ...styles.text }}>
              {Number(data?.totalPrices).toFixed(2)}
            </Text>
          </View>

          {/* Other Charges */}
          {data?.otherCharges?.length > 0 && (
            <View style={{ marginTop: 17 }}>
              {data?.otherCharges?.map((charge, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    paddingVertical: 2,
                    borderBottomWidth: 0.5,
                    borderColor: "#ccc",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ ...styles.text, width: "30%", textAlign: "center" }}>
                    {charge.value}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* FINAL TOTAL */}
        <View style={styles.row4_1botm}>

          <Text style={styles.heading}>
            <Text style={styles.heading}>{data?.currencySymble} </Text>
            {Number(data?.grandTotal).toFixed(2)}
          </Text>
        </View>

      </View>


    </View>

    {/* row5 */}
    <View style={styles.row5}>
      <Text style={[styles.text, { fontWeight: "bold" }]}>
        {data?.amountInWords}
      </Text>
      <View>
        <Text style={[styles.text, { fontWeight: "bold" }]}>GROSS WT: {data?.grossWeight} KGS</Text>
        <Text style={[styles.text, { fontWeight: "bold" }]}>NET WT : {data?.netWeight} KGS</Text>
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
          <Text style={[styles.text, { fontWeight: "bold" }]}>
            {data?.licenceDetails?.description}
          </Text>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Text style={{ fontSize: "7", padding: "5", color: "red" }}>
              {data?.containerLoadFrom === "MMN" || data?.containerLoadFrom === "PDK"
                ? "IGST-Letter Of Undertaking (ARN)AD3302240385774 valid till 31.03.2025"
                : ""}
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
            {data?.containerLoadFrom === "MMN" || data?.containerLoadFrom === "PDK"
              ? "FOR SUNDARAM INDUSTRIES PRIVATE LIMITED"
              : "FOR SUNDARAM LANKA PRIVATE LIMITED"}

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
