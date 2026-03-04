import { Page, View, StyleSheet, Text, Image } from "@react-pdf/renderer";
import React from "react";
import { Font } from "@react-pdf/renderer";
import LOGO from "../../../../../../assets/img/SUN-TWS.png";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
});

// Best practice: Define styles outside the component
const styles = StyleSheet.create({
  page: {
    padding: 14,
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
  },
  textBold: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#000",
    minHeight: 15,
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
    fontWeight: "bold",
  },
  cell: {
    borderRightWidth: 0.5,
    borderColor: "#000",
    padding: 2,
    justifyContent: "center",
  },
  lastCell: {
    padding: 2,
    justifyContent: "center",
  },
  text: {
    fontSize: "0.3rem",
    color: "#000",
    fontWeight: "bold",
    fontFamily: "Roboto",
  },


  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#000",
    backgroundColor: "#f1f5f9",
    height: 18,
    alignItems: "center",
  },

  headerCell: {
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 0.5,
    borderColor: "#000",
    paddingHorizontal: 2,
    height: "100%",
  },

  headerText: {
    fontSize: 5,
    fontWeight: "bold",
    textAlign: "center",
  },

  bodyRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#000",
    minHeight: 16,
    alignItems: "stretch",   // ✅ allows dynamic height
  },

  bodyCell: {
    justifyContent: "center",
    borderRightWidth: 0.5,
    borderColor: "#000",
    paddingHorizontal: 2,
    paddingVertical: 2,
    flexWrap: "wrap",   // ✅ important
  },

  bodyText: {
    fontSize: 6,
    textAlign: "left",   // ✅ better for wrapping
    fontWeight: "bold",
    flexWrap: "wrap",
    wordBreak: "break-all",
  },
});

const ProformaPDF = ({ }) => {
  const baseItem = {
    productNumber: "2060001",
    size: "9X5X5 SM",
    rim: "-",
    edc: "-",
    pattern: "SM",
    grade: "D1",
    brand: "WIDE-TRACK",
    sidewall: "-",
    qty: 20,
    unitPrice: 14.81,
    totalPrice: 296.2,
    unitWeight: 5.98,
    totalWeight: 119.5,
    sunPartNumber: "P-010979",
  };

  const generateItems = (baseItem, count, brand) => {
    return Array.from({ length: count }, (_, index) => ({
      ...baseItem,
      brand,
      srNo: (index + 1).toString()
    }));
  };
  const brands = ["WIDE-TRACK", "SPEED-X", "ROADMASTER"];

  const allItems = brands.flatMap((brand, brandIndex) =>
    generateItems(baseItem, 9, brand).map((item, index) => ({
      ...item,
      srNo: (brandIndex * 3 + index + 1).toString()
    }))
  );

  console.log(allItems);

  const ITEMS_PER_PAGE = 25;

  const chunkItems = (items, size) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  };


  const items = allItems; // test 50 items
  const data = {
    otherCharges: [],
    otherDiscountsList: [],
    items: items
  };
  const itemChunks = chunkItems(data.items, ITEMS_PER_PAGE);

  const subTotal = data.items.reduce(
    (sum, item) => sum + Number(item.totalPrice || 0),
    0
  );

  const freightCharges = 500; // example value
  const reciprocalTariff = subTotal * 0.2;

  const grandTotalDDP = subTotal + freightCharges + reciprocalTariff;
  return (
    <>
      {itemChunks.map((pageItems, pageIndex) => {
        const isLastPage = pageIndex === itemChunks.length - 1;

        return (
          <Page size="A4" style={styles.page}>
            <View style={styles.container}>
              {/* heading */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderBottomWidth: 0.5,
                  borderColor: "black",
                  height: 40,
                  paddingHorizontal: 10,
                }}
              >
                {/* LEFT LOGO */}
                <View style={{ width: "20%", justifyContent: "center" }}>
                  <Image
                    src={LOGO}   // <-- change to your logo path
                    style={{ width: 70, height: 40 }}
                  />
                </View>

                {/* CENTER TITLE */}
                <View
                  style={{
                    width: "60%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    PROFORMA INVOICE
                  </Text>
                </View>

                {/* RIGHT EMPTY SPACE (for perfect center balance) */}
                <View style={{ width: "20%" }} />
              </View>
              {/* Addresses Session */}
              <View style={{ flexDirection: "row", height: "12rem" }}>
                {/* left Side Content */}
                <View
                  style={{
                    width: "40%",
                    borderBottom: "0.03rem",
                    borderRight: "0.03rem",
                  }}
                >
                  <View
                    style={{
                      borderBottom: "0.03rem",
                      borderColor: "black",
                      height: "5.1rem",
                      fontSize: "0.3rem",
                      padding: 2,
                    }}
                  >
                    <Text style={{ ...styles.text, fontWeight: "bold" }}>
                      EXPORTER :
                    </Text>
                    <View>
                      {(data?.exporter ? data?.exporter.toUpperCase().split("~") : []).map(
                        (line, index) => (
                          <Text key={index} style={{ fontSize: "6px" }}>
                            {line.trim()}
                          </Text>
                        ),
                      )}
                    </View>
                    {data?.plantAddress && (<><Text style={{ ...styles.text, fontWeight: "bold", marginTop: 2 }}>
                      DELIVERY FROM :
                    </Text><View>
                        {(data?.plantAddress ? data?.plantAddress.toUpperCase().split("~") : []).map(
                          (line, index) => (
                            <Text key={index} style={{ fontSize: "6px" }}>
                              {line.trim()}
                            </Text>
                          )
                        )}
                      </View></>)}
                  </View>
                  <View
                    style={{
                      borderBottom: "0.03rem",
                      borderColor: "black",
                      height: "3.7rem",
                      padding: 2,
                      gap: "0.1rem",

                    }}
                  >
                    <Text style={styles.text}>BUYER / CONSIGNEE</Text>
                    <Text style={{ fontWeight: "bold", fontSize: "0.3rem" }}>
                      {data?.consignee?.name ?? ""}
                    </Text>

                    {(data?.consignee?.address || []).map((line, i) => (
                      <Text key={i} style={styles.text}>
                        {line}
                      </Text>
                    ))}

                    <Text style={styles.text}>
                      {[data?.consignee?.city, data?.consignee?.state, data?.consignee?.country]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>

                  </View>

                  <View
                    style={{
                      borderColor: "black",
                      height: "3.7rem",
                      padding: 2,
                      gap: "0.1rem",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <Text style={styles.bodyText}>CARRIER: SEA </Text>
                    <Text style={styles.bodyText}>PACKING METHOD: WOODEN</Text>
                    <Text style={styles.bodyText}>CONTAINER TYPE: 40 HC</Text>
                    <Text style={styles.bodyText}>LEAD TIME: WITHIN 4 WEEK</Text>
                  </View>
                </View>

                <View style={{ width: "60%", borderBottom: "0.03rem" }}>
                  {/* Right Side Content */}
                  <View
                    style={{
                      borderBottom: "0.03rem",
                      gap: "0.5rem",
                      borderColor: "black",
                      height: "1.6rem",
                      padding: 2,
                    }}
                  >
                    <Text style={styles.text}>
                      Buyers Order No: PO 3341
                    </Text>

                    <Text style={styles.text}>Rev no: {"01"}</Text>
                  </View>
                  <View
                    style={{
                      borderBottom: "0.03rem",
                      borderColor: "black",
                      height: "1.4rem",
                      padding: 2,
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.text}>
                      REV date:{" "}

                    </Text>
                    <Text style={styles.text}>Other Reference(s): EMAIL REF DT / LOAD 1 / CONTAINER NO</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      borderBottomWidth: "0.03rem", // Note: Use borderBottomWidth for React Native
                      borderColor: "black",
                      height: "4rem",

                    }}
                  >
                    {/* Left Section */}
                    <View style={{ flex: 1, padding: 2, gap: 2 }}>
                      <Text style={[styles.text, { fontWeight: "bold" }]}>
                        Buyer if other than Consignee:
                      </Text>
                      <Text style={{ fontWeight: "bold", fontSize: "0.3rem" }}>
                        {data?.buyerIfOtherThanConsignee?.name ?? ""}
                      </Text>

                      {(data?.buyerIfOtherThanConsignee?.address || []).map((line, i) => (
                        <Text key={i} style={styles.text}>
                          {line}
                        </Text>
                      ))}

                      <Text style={styles.text}>
                        {[data?.buyerIfOtherThanConsignee?.city, data?.buyerIfOtherThanConsignee?.state,
                        data?.buyerIfOtherThanConsignee?.country]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>

                      <Text style={styles.textBold}>
                        {data?.shippingContactName ?? ""}
                      </Text>
                      <Text style={styles.text}>
                        {[data?.shippingEmailId, data?.shippingMobile]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    </View>

                    {/* Right Section */}
                    {/* {data?.notifyParty && ( */}
                    <View
                      style={{
                        flex: 1,
                        gap: 2,
                        borderLeftWidth: "0.03rem",
                        borderColor: "black",
                        padding: 2,
                      }}
                    >
                      <Text style={[styles.text, { fontWeight: "bold" }]}>
                        NOTIFY PARTY:
                      </Text>
                      {/* I changed this to Bill To assuming that's what you need for the right side */}
                      <Text style={styles.text}>
                        {data?.notifyParty?.name ?? ""}{" "}
                      </Text>
                      <Text style={styles.text}>
                        {data?.notifyParty?.address ?? ""}
                      </Text>
                      <Text style={styles.text}>
                        {[
                          data?.notifyParty?.city,
                          data?.notifyParty?.state,
                          data?.notifyParty?.zipcode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                      <Text style={styles.text}>
                        {data?.notifyParty?.country ?? ""}
                      </Text>
                      <Text style={styles.text}>
                        {data?.notifyPartyName ?? ""}
                      </Text>
                      <Text style={styles.text}>
                        {[data?.notifyPartyEmail, data?.notifyPartyPhone]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    </View>
                    {/* )} */}
                  </View>

                  <View
                    style={{
                      borderColor: "black",
                      height: "5.3rem",
                      padding: 2,
                      gap: "0.1rem",
                      justifyContent: 'space-between',
                      height: '5rem',

                    }}
                  >
                    <View>
                      <Text style={styles.text}>
                        TERMS OF DELIVERY & PAYMENT:
                      </Text>
                      <Text style={styles.text}>
                        THE PRICES ARE FOB - COLOMBO BY SEA, IN USD
                      </Text>
                    </View>
                    <View style={{ marginTop: 0 }}>
                      <Text style={[styles.text, { fontWeight: "bold" }]}>
                        PAYMENT TERMS: ON RECEIPT OF INVOICE & PACKING LIST BY E-MAIL OR FAX
                      </Text>
                      <Text style={styles.text}>
                        {data?.paymentTerms}
                      </Text>
                    </View>
                    <Text
                      style={{ ...styles.text, fontWeight: "normal" }}
                    >
                      {(`PAYMENT TO BE REMITTED IN FAVOUR OF
                SUN TYRE & WHEEL SYSTEMS (A DIVISION OF SUNDARAM LANKA TYRES LTD)
                LOT 2, BLOCK B, BIYAGAMA EXPORT PROCESSING ZONE, BIYAGAMA,
                SRILANKA THROUGH OUR BANKER STATE BANK OF INDIA,
                16. SIR BARON JAYATHILAKA MW., COLOMBO - 01, SRI LANKA,
                SWIFT CODE: SBINLKLX, CC ACCOUNT NO: 25260337250219`).toUpperCase().split("~")}
                    </Text>
                  </View>
                </View>
              </View>

              {/* content 2 */}
              <View
                style={{
                  borderBottomWidth: "0.03rem",
                  borderColor: "black",
                }}
              >
                {/* TABLE HEADER ROW */}
                <View style={styles.tableHeaderRow}>
                  <View style={[styles.headerCell, { width: "4%" }]}>
                    <Text style={styles.headerText}>SR NO</Text>
                  </View>

                  <View style={[styles.headerCell, { width: "8%" }]}>
                    <Text style={styles.headerText}>PRODUCT</Text>
                  </View>

                  <View style={[styles.headerCell, { width: "8%" }]}>
                    <Text style={styles.headerText}>SUN PART</Text>
                  </View>

                  <View style={[styles.headerCell, { width: "28%" }]}>
                    <Text style={styles.headerText}>ITEM DESCRIPTION</Text>
                  </View>

                  <View style={[styles.headerCell, { width: "6%" }]}>
                    <Text style={styles.headerText}>EDC</Text>
                  </View>

                  <View style={[styles.headerCell, { width: "6%" }]}>
                    <Text style={styles.headerText}>QTY</Text>
                  </View>

                  <View style={[styles.headerCell, { width: "8%" }]}>
                    <Text style={styles.headerText}>UNIT PRICE</Text>
                    <Text style={styles.headerText}>USD</Text>
                  </View>

                  <View style={[styles.headerCell, { width: "8%" }]}>
                    <Text style={styles.headerText}>TOTAL PRICE</Text>
                    <Text style={styles.headerText}>USD</Text>
                  </View>

                  <View style={[styles.headerCell, { width: "6%" }]}>
                    <Text style={styles.headerText}>UNIT WT</Text>
                    <Text style={styles.headerText}>KGS</Text>
                  </View>

                  <View style={[styles.headerCell, { width: "6%" }]}>
                    <Text style={styles.headerText}>TOTAL WT</Text>
                    <Text style={styles.headerText}>KGS</Text>
                  </View>

                  <View style={[styles.headerCell, { width: "12%", borderRightWidth: 0 }]}>
                    <Text style={styles.headerText}>TOTAL VALUE</Text>
                    <Text style={styles.headerText}>IN {data?.usercurrency}</Text>
                  </View>
                </View>

                {/* TABLE CONTENT AREA */}
                <View style={{ flexDirection: "row" }}>
                  {/* TABLE CONTENT AREA */}
                  <View>
                    {pageItems?.map((item, index) => (
                      <View key={index} style={styles.bodyRow}>
                        <View style={[styles.bodyCell, { width: "4%" }]}>
                          <Text style={styles.bodyText}>{index + 1}</Text>
                        </View>

                        <View style={[styles.bodyCell, { width: "8%" }]}>
                          <Text style={styles.bodyText}>{item.productNumber}</Text>
                        </View>

                        <View style={[styles.bodyCell, { width: "8%" }]}>
                          <Text style={styles.bodyText}>{item.sunPartNumber}</Text>
                        </View>

                        <View style={[styles.bodyCell, { width: "28%" }]}>
                          <Text style={styles.bodyText}>
                            {item.size} {item.rim === "-" ? "0.00" : item.rim} {item.pattern} {item.brand} {item.sidewall} {item.grade}
                          </Text>
                        </View>

                        <View style={[styles.bodyCell, { width: "6%" }]}>
                          <Text style={styles.bodyText}>{item.edc}</Text>
                        </View>

                        <View style={[styles.bodyCell, { width: "6%" }]}>
                          <Text style={styles.bodyText}>{item.qty}</Text>
                        </View>

                        <View style={[styles.bodyCell, { width: "8%" }]}>
                          <Text style={styles.bodyText}>{item.unitPrice}</Text>
                        </View>

                        <View style={[styles.bodyCell, { width: "8%" }]}>
                          <Text style={styles.bodyText}>{item.totalPrice}</Text>
                        </View>

                        <View style={[styles.bodyCell, { width: "6%" }]}>
                          <Text style={styles.bodyText}>{item.unitWeight}</Text>
                        </View>

                        <View style={[styles.bodyCell, { width: "6%" }]}>
                          <Text style={styles.bodyText}>{item.totalWeight}</Text>
                        </View>

                        <View style={[styles.bodyCell, { width: "12%", borderRightWidth: 0 }]}>
                          <Text style={styles.bodyText}>{item.totalValue}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>


              {isLastPage && (
                <View style={{ flexDirection: "column" }}>
                  {[
                    { label: "SUB TOTAL", value: subTotal },
                    { label: "DDP FREIGHT CHARGES", value: freightCharges },
                    { label: "RECIPROCAL USA TARIFF 20%", value: reciprocalTariff },
                  ].map((row, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        height: 16,
                        borderColor: "black",
                      }}
                    >
                      {/* LABEL AREA */}
                      <View
                        style={{
                          width: "54%",
                          borderRightWidth: 0.5,
                          borderColor: "black",
                          justifyContent: "center",
                          alignItems: "flex-end",
                          paddingRight: 6,
                        }}
                      >
                        <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                          {row.label}
                        </Text>
                      </View>

                      {/* QTY COLUMN */}
                      <View
                        style={{
                          width: "6%",
                          borderRightWidth: 0.5,
                          borderColor: "black",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {row.label === "SUB TOTAL" && (
                          <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                            {/* {data.items.reduce(
                (sum, item) => sum + Number(item.qty || 0),
                0
              )} */}
                          </Text>
                        )}
                      </View>

                      {/* UNIT PRICE */}
                      <View style={{ width: "8%", borderRightWidth: 0.5, borderColor: "black" }} />

                      {/* TOTAL PRICE */}
                      <View style={{ width: "8%", borderRightWidth: 0.5, borderColor: "black" }} />

                      {/* UNIT WT */}
                      <View style={{ width: "6%", borderRightWidth: 0.5, borderColor: "black" }} />

                      {/* TOTAL WT */}
                      <View style={{ width: "6%", borderRightWidth: 0.5, borderColor: "black" }} />

                      {/* TOTAL VALUE */}
                      <View
                        style={{
                          width: "12%",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                          {row.value.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* TABLE BOTTOM */}
              <View
                style={{
                  flexDirection: "row",
                  height: 18,        // thick top border for highlight
                  borderBottomWidth: 0.5,
                  borderColor: "black",
                  backgroundColor: "#f1f5f9",  // light grey highlight
                }}
              >
                {/* LABEL AREA */}
                <View
                  style={{
                    width: "54%",
                    borderRightWidth: 0.5,
                    borderColor: "black",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    paddingRight: 6,
                    borderTop:isLastPage? 0.5 : 0
                  }}
                >
                  {isLastPage && (
                    <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                      GRAND TOTAL USD DDP CHATTANOOGA, TN BY SEA
                    </Text>
                  )}
                </View>

                {/* QTY */}
                <View
                  style={{
                    width: "6%",
                    borderRightWidth: 0.5,
                    borderColor: "black",
                    justifyContent: "center",
                    alignItems: "center",
                     borderTop:isLastPage? 0.5 : 0
                  }}
                >
                  {isLastPage && (
                    <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                      {data.items.reduce(
                        (sum, item) => sum + Number(item.qty || 0),
                        0
                      )}
                    </Text>
                  )}
                </View>

                {/* UNIT PRICE */}
                <View style={{ width: "8%", borderRightWidth: 0.5, borderColor: "black", borderTop:isLastPage? 0.5 : 0 }} />

                {/* TOTAL PRICE */}
                <View style={{ width: "8%", borderRightWidth: 0.5, borderColor: "black", borderTop:isLastPage? 0.5 : 0 }} />

                {/* UNIT WT */}
                <View style={{ width: "6%", borderRightWidth: 0.5, borderColor: "black", borderTop:isLastPage? 0.5 : 0 }} />

                {/* TOTAL WT */}
                <View style={{ width: "6%", borderRightWidth: 0.5, borderColor: "black", borderTop:isLastPage? 0.5 : 0 }} />

                {/* TOTAL VALUE */}
                <View
                  style={{
                    width: "12%",
                    justifyContent: "center",
                    alignItems: "center",
                     borderTop:isLastPage? 0.5 : 0
                  }}
                >
                  {isLastPage && (
                    <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                      {grandTotalDDP.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>


              {/* AMOUNT IN WORDS */}
              <View style={{ padding: 4, borderColor: "black", maxHeight: 16 }}>
                {isLastPage && (
                  <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                    (US DOLLARS FORTY SEVEN THOUSAND TWO HUNDRED ONE CENT THIRTY FOUR ONLY)
                  </Text>
                )}
              </View>

              {isLastPage && (
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: "auto", 
                    borderColor: "black",
                    paddingTop: 20,
                    marginBottom:10
                  }}
                >
                  {/* LEFT */}
                  <View
                    style={{
                      width: "50%",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                      FOR SUNDARAM LANKA TYRES LIMITED
                    </Text>

                    <Text style={{ marginTop: 50, fontSize: 7, fontWeight: "bold" }}>
                      AUTHORISED SIGNATORY
                    </Text>
                  </View>

                  {/* RIGHT */}
                  <View
                    style={{
                      width: "50%",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                      FOR NACCISA TIRE COMPANY, S.A. de C.V.
                    </Text>

                    <Text style={{ marginTop: 50, fontSize: 7, fontWeight: "bold" }}>
                      AUTHORISED SIGNATORY
                    </Text>
                  </View>
                </View>
              )}

            </View>
            <Text
              fixed
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} / ${totalPages}`
              }
              style={{
                position: "absolute",
                bottom: 5,
                right: 14,
                fontSize: 6,
                color: "#000",
              }}
            />
          </Page>
        );
      })}
    </>
  );
}

export default ProformaPDF;
