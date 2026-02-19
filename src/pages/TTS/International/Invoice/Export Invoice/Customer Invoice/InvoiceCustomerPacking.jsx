import { Page, View, StyleSheet, Text } from "@react-pdf/renderer";
import React from "react";
import { getDescriptionByHSN, HSN_CODE } from "../../../../../../utils/HSNCODE";
import { numberToWords } from "../../../../../../utils/NumberToWords";
import { currencies } from "../../../../../../utils/currencies";
import { Font } from "@react-pdf/renderer";
import { formatDateTime } from "../../../../../../utils/FormatDate";

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
});

const InvoiceCustomerPacking = ({ data }) => {
  console.log(data);
  const ITEMS_PER_PAGE = 20;

  const chunkItems = (items = []) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
      chunks.push(items.slice(i, i + ITEMS_PER_PAGE));
    }
    return chunks;
  };

  const itemPages = chunkItems(data?.items || []);

  const totalQty = data?.items.reduce(
    (sum, item) => sum + (Number(item.itemQty) || 0),
    0,
  );
  const totalWeight =
    data?.items?.reduce(
      (sum, item) =>
        sum +
        (Number((item.rimfinishedwt + item.finishedWt) * item.itemQty) || 0),
      0,
    ) || 0;
  const totalPrice = data?.items?.reduce(
    (sum, item) =>
      sum + (Number((item.basicprice + item.rimUnitPrice) * item.itemQty) || 0),
    0,
  );
  const uniqueHSNs = [...new Set(data?.items?.map((item) => item.hsnCode))];
  // console.log(uniqueHSNs);

  const isAssRimstatus = data?.items?.some((item) => item.rimStatus === true);
  const amountInWords = numberToWords(totalPrice, data?.usercurrency);
  const currency = currencies.find((item) => item.code === data.usercurrency);

  // date formatting
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const formattedDate = `${dd}/${mm}/${yyyy}`;

  // invoice hsn codes
  // const hasRimAssembly = data?.items?.some((item) => item.rimStatus === true);
  const uniqueHsnCodes = [
    ...new Set(data?.items?.map((item) => item.hsnCode).filter(Boolean)),
  ];

  // 🔥 COMBINED     PACKING TOTALS (NO REPEAT)
  const totalPalletTyres = (data?.additionalDetails || []).reduce(
    (sum, det) => sum + (Number(det.isPallet ? det.palletTyres : 0) || 0),
    0,
  );
  const totalPallets = (data?.additionalDetails || []).reduce(
    (sum, det) => sum + (Number(det.isPallet ? det.palletCount : 0) || 0),
    0,
  );

  const totalWoodenTyres = (data?.additionalDetails || []).reduce(
    (sum, det) => sum + (Number(det.isWoodenBox ? det.woodenBoxTyres : 0) || 0),
    0,
  );
  const totalWoodenBoxs = (data?.additionalDetails || []).reduce(
    (sum, det) => sum + (Number(det.isWoodenBox ? det.woodenBoxCount : 0) || 0),
    0,
  );

  const totalPalletWT = (data.additionalDetails || []).reduce(
    (sum, det) => sum + (Number(det.isPallet ? det.palletweight : 0) || 0),
    0,
  )
  const totalWoodenWT = (data.additionalDetails || []).reduce(
    (sum, det) => sum + (Number(det.isWoodenBox ? det.woodenBoxWeight : 0) || 0),
    0,
  )

  const totalPackedTyres = totalPalletTyres + totalWoodenTyres;

  const totalGrossWT =
    (Number(totalPalletWT) || 0) +
    (Number(totalWoodenWT) || 0) +
    (Number(totalWeight) || 0);

  const finalGrossWT =
    Number(data?.grossWeight) > 0
      ? Number(data.grossWeight)
      : totalGrossWT;

  // console.log("TotalPallet",totalPalletWoodenWT + totalWeight);

  const totalLooseTyres = Math.max(
    0,
    (data?.items || []).reduce(
      (sum, item) => sum + (Number(item.itemQty) || 0),
      0,
    ) - totalPackedTyres,
  );

  const packingSummary = [];

  if (totalPalletTyres > 0) {
    packingSummary.push(
      `${totalPalletTyres} TYRES PACKED IN ${totalPallets} ${totalPallets > 1 ? "PALLETS" : "PALLET"}`,
    );
  }

  if (totalWoodenTyres > 0) {
    packingSummary.push(
      `${totalWoodenTyres} TYRES PACKED IN ${totalWoodenBoxs} ${totalWoodenBoxs > 1 ? "WOODEN BOXES" : "WOODEN BOXE"}`,
    );
  }

  if (totalLooseTyres > 0) {
    packingSummary.push(
      `${totalLooseTyres} LOOSE ${totalLooseTyres > 1 ? "TYRES" : "TYRE"}`,
    );
  }

  // 🔥 COMBINE CHARGES FROM BACKEND STRUCTURE
  const combinedCharges = {};

  (data?.otherChargesDetails || []).forEach((row) => {
    const chargePairs = [
      [row.chargesType1, row.otherCharges1],
      [row.chargesType2, row.otherCharges2],
      [row.chargesType3, row.otherCharges3],
    ];

    chargePairs.forEach(([label, value]) => {
      if (!label || !value) return;
      const key = label.trim().toUpperCase();
      combinedCharges[key] = (combinedCharges[key] || 0) + Number(value);
    });
  });

  const chargeLines = Object.entries(combinedCharges);
  const totalcharges = chargeLines.reduce(
    (sum, [label, value]) => sum + value,
    0,
  );
  // console.log(totalcharges);

  // 🔥 COMBINE ALL DISCOUNTS
  // 🔥 COMBINE DISCOUNTS FROM BACKEND STRUCTURE
  const combinedDiscounts = {};

  (data?.otherChargesDetails || []).forEach((row) => {
    const discountPairs = [
      [row.discount1, row.discountValue1],
      [row.discount2, row.discountValue2],
      [row.discount3, row.discountValue3],
    ];

    discountPairs.forEach(([label, value]) => {
      if (!label || !value) return;
      const key = label.trim().toUpperCase();
      combinedDiscounts[key] = (combinedDiscounts[key] || 0) + Number(value);
    });
  });

  const discountLines = Object.entries(combinedDiscounts);

  const totalDiscounts = Object.values(combinedDiscounts).reduce(
    (sum, value) => sum + value,
    0,
  );

  const invoiceValue = totalcharges + totalPrice - totalDiscounts;
  const cleanPaymentTermsForPDF = (text = "") => {
    if (!text) return "";

    return (
      text
        // Decode HTML entities
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")

        // Convert backend separator to real line break
        .replace(/~/g, "\n")

        // Ensure numbering always starts on new line
        .replace(/\s*(\d{2}\.)/g, "\n$1")

        .trim()
    );
  };

  // console.log(currency.symbol);
  const hasRimAssembly = data?.items?.some(
    (item) => item.rimStatus === true
  );

  const hasRimOnly = data?.items?.some(
    (item) => item.hsnCode === "84312010"
  );

  let finalDescription = "SOLID INDUSTRIAL TYRES";

  // 🔥 Priority 1 – Rim Assembly (Highest)
  if (hasRimAssembly) {
    finalDescription = "SOLID INDUSTRIAL TYRES WITH RIM ASSEMBLY";
  }
  // 🔥 Priority 2 – Rim Only
  else if (hasRimOnly) {
    finalDescription = "SOLID INDUSTRIAL TYRES WITH RIM";
  }
  // 🔥 Priority 3 – Only Tyres
  else {
    finalDescription = "SOLID INDUSTRIAL TYRES";
  }


  return (
    <>
      {itemPages.map((pageItems, pageIndex) => {
        const isLastPage = pageIndex === itemPages.length - 1;
        // console.log("-----SUBTOTAL", pageIndex, isLastPage);

        return (
          <Page key={pageIndex} size="A4" style={styles.page}>
            <View style={styles.container}>
              {/* heading */}
              <View
                style={{
                  borderWidth: "0.03rem",
                  borderTop: 0,
                  borderLeft: 0,
                  borderRight: 0,
                  borderBottom: "0.03rem",
                  borderColor: "black",
                  height: 14,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: "0.5rem",
                    fontWeight: "bold",
                    color: "black",
                    textTransform: "uppercase",
                    paddingTop: "0.5rem",
                  }}
                >
                  PACKING LIST
                </Text>
              </View>
              {/* Addresses Session */}
              <View style={{ flexDirection: "row", height: "14rem" }}>
                {/* left Side Content */}
                <View
                  style={{
                    width: "40%",
                    borderBottom: "0.03rem",
                    borderRight: "0.03rem",
                    borderColor: "black",
                  }}
                >
                  <View
                    style={{
                      borderBottom: "0.03rem",
                      borderColor: "black",
                      height: "3.8rem",
                      fontSize: "0.3rem",
                      padding: 2,
                    }}
                  >
                    <Text style={{ ...styles.text, fontWeight: "bold" }}>
                      EXPORTER:
                    </Text>
                    {(data?.exportAuthorisedAddress
                      ? data?.exportAuthorisedAddress.toUpperCase().split("~")
                      : []
                    ).map((line, index) => (
                      <Text
                        key={index}
                        style={{ ...styles.text, fontWeight: "normal" }}
                      >
                        {line.trim()}
                      </Text>
                    ))}
                  </View>
                  <View
                    style={{
                      borderBottom: "0.03rem",
                      borderColor: "black",
                      height: "5rem",
                      padding: 2,
                      gap: "0.1rem",
                    }}
                  >
                    <Text style={styles.text}>BUYER / CONSIGNEE</Text>
                    <Text style={styles.text}>
                      {data?.billingCompanyName ?? ""}{" "}
                    </Text>
                    <Text style={styles.text}>
                      {data?.billingAddress ?? ""}
                    </Text>
                    <Text style={styles.text}>
                      {[data?.billingCity, data?.billingZipcode]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                    <Text style={styles.text}>
                      {data?.billingCountry ?? ""}
                    </Text>
                    <Text style={styles.text}>
                      {[data?.billingEmailId, data?.billingMobile]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                  </View>

                  <View
                    style={{
                      borderBottom: "0.03rem",
                      borderColor: "black",
                      height: "0.7rem",
                    }}
                  >
                    <Text style={styles.text}>
                      BL NO: {data?.billOfLadingNo}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderBottom: "0.03rem",
                      borderColor: "black",
                      height: "1.5rem",
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        width: "50%",
                        height: "1.5rem",
                        gap: "0.5rem",
                        borderRight: "0.03rem",
                        borderColor: "black",
                        padding: 2,
                      }}
                    >
                      <Text style={styles.text}>Pre- Carriage by:</Text>
                      <Text style={styles.text}>{data?.preCarriageBy}</Text>
                      <Text style={styles.text}></Text>
                    </View>
                    <View
                      style={{
                        width: "50%",
                        height: "1.5rem",
                        gap: "0.5rem",
                        borderColor: "black",
                        padding: 2,
                      }}
                    >
                      <Text style={styles.text}>
                        Place of Receipt by Pre-carrier:
                      </Text>
                      <Text style={styles.text}>
                        {data?.placeOfReceiptByPreCarrier}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      borderBottom: "0.03rem",
                      borderColor: "black",
                      height: "1.5rem",
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        width: "50%",
                        height: "1.5rem",
                        gap: "0.5rem",
                        borderRight: "0.03rem",
                        borderColor: "black",
                        padding: 2,
                      }}
                    >
                      <Text style={styles.text}>Vessel/Flight No:</Text>
                      <Text style={styles.text}>{data?.vesselFlightNo}</Text>
                    </View>
                    <View
                      style={{
                        width: "50%",
                        height: "1.5rem",
                        gap: "0.5rem",
                        borderColor: "black",
                        padding: 2,
                      }}
                    >
                      <Text style={styles.text}>Port of Loading:</Text>
                      <Text style={styles.text}>{data?.portOfLoading}</Text>
                      <Text style={styles.text}></Text>
                    </View>
                  </View>
                  <View
                    style={{
                      borderColor: "black",
                      height: "1.5rem",
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        width: "50%",
                        height: "1.5rem",
                        gap: "0.5rem",
                        borderRight: "0.03rem",
                        borderColor: "black",
                        padding: 2,
                      }}
                    >
                      <Text style={styles.text}>Port of Discharge:</Text>
                      <Text style={styles.text}>{data?.portOfDischarge}</Text>
                      <Text style={styles.text}></Text>
                    </View>
                    <View
                      style={{
                        width: "50%",
                        height: "1.5rem",
                        gap: "0.5rem",
                        borderColor: "black",
                        padding: 2,
                      }}
                    >
                      <Text style={styles.text}>Final Destination:</Text>
                      <Text style={styles.text}>{data?.finalDestination}</Text>
                      <Text style={styles.text}></Text>
                    </View>
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
                      Invoice No:{" "}
                      {Array.isArray(data?.invoiceNo) && data.invoiceNo.length > 0
                        ? data.invoiceNo.join(", ")
                        : data?.invoiceNumber || ""}
                    </Text>
                    <Text style={styles.text}>Date: {formatDateTime(data?.invoiceDate)}</Text>
                  </View>
                  <View
                    style={{
                      borderBottom: "0.03rem",
                      gap: "0.5rem",
                      borderColor: "black",
                      height: "1rem",
                      padding: 2,
                    }}
                  >
                    <Text style={styles.text}>
                      Buyers Orders No Ref:{" "}
                      {data.buyerorderrefno || data.orderRefNo || ""}
                    </Text>
                    {/* <Text style={styles.text}>{data.buyerorderrefno || data.orderRefNo || ""}</Text> */}
                  </View>
                  <View
                    style={{
                      borderBottom: "0.03rem",
                      gap: "0.5rem",
                      borderColor: "black",
                      height: "1.192rem",
                      padding: 2,
                    }}
                  >
                    <Text style={styles.text}>
                      Other Reference: {data.orderRefNo || ""}
                    </Text>
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
                        SHIP TO:
                      </Text>
                      <Text style={styles.text}>
                        {data?.shippingCompanyName ?? ""}{" "}
                      </Text>
                      <Text style={styles.text}>
                        {data?.shippingAddress ?? ""}
                      </Text>
                      <Text style={styles.text}>
                        {[data?.shippingCity, data?.shippingZipcode]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                      <Text style={styles.text}>
                        {data?.shippingCountry ?? ""}
                      </Text>
                      <Text style={styles.text}>
                        {data?.shippingContactName ?? ""}
                      </Text>
                      <Text style={styles.text}>
                        {[data?.shippingEmailId, data?.shippingMobile]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    </View>

                    {/* Right Section */}
                    {data?.notifyPartyAddress && (
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
                          {data?.notifyPartyCompanyName ?? ""}{" "}
                        </Text>
                        <Text style={styles.text}>
                          {data?.notifyPartyAddress ?? ""}
                        </Text>
                        <Text style={styles.text}>
                          {[
                            data?.notifyPartyCity,
                            data?.notifyPartyState,
                            data?.notifyPartyZipcode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </Text>
                        <Text style={styles.text}>
                          {data?.notifyPartyCountry ?? ""}
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
                    )}
                  </View>
                  <View
                    style={{
                      borderColor: "black",
                      borderBottom: "0.03rem",
                      height: "1.2rem",
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        width: "50%",
                        height: "1.2rem",
                        gap: "0.2rem",
                        borderRight: "0.03rem",
                        borderColor: "black",
                        padding: 2,
                      }}
                    >
                      <Text style={styles.text}>
                        Country of Origin of Goods:
                      </Text>
                      <Text style={styles.text}>
                        {data.countryOfOriginOfGoods || ""}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: "50%",
                        height: "1.2rem",
                        gap: "0.2rem",
                        borderColor: "black",
                        padding: 2,
                      }}
                    >
                      <Text style={styles.text}>
                        Country of Final Destination:
                      </Text>
                      <Text style={styles.text}>
                        {data?.countryOfFinalDestination || ""}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      borderColor: "black",
                      height: "4.0rem",
                      padding: 2,
                      gap: "0.3rem",
                    }}
                  >
                    <Text style={styles.text}>
                      TERMS OF DELIVERY AND PAYMENT:
                    </Text>
                    <Text style={styles.text}>
                      THE PRICES ARE {data?.usercurrency} {data?.incoterm}{" "}
                      {data?.placeOfIncoterm}, CA BY SEA:
                    </Text>
                    {/* <Text style={styles.text}>PAYMENT TERMS:</Text> */}

                    {/* <View style={{ marginTop: 0 }}>
                      <Text style={[styles.text, { fontWeight: "bold" }]}>
                        PAYMENT TERMS:
                      </Text>

                      <Text style={styles.text}>
                        {cleanPaymentTermsForPDF(data?.paymentTerms)}
                      </Text>
                    </View>

                    {(data?.bankDetails
                      ? data?.bankDetails.toUpperCase().split("~")
                      : []
                    ).map((line, index) => (
                      <Text
                        key={index}
                        style={{ ...styles.text, fontWeight: "normal" }}
                      >
                        {line.trim()}
                      </Text>
                    ))} */}
                  </View>
                </View>
              </View>
              {/* content 2 */}
              <View
                style={{
                  borderBottomWidth: "0.03rem",
                  borderColor: "black",
                  height: "18.5rem",
                }}
              >
                {/* TABLE HEADER ROW */}
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: "0.03rem",
                    borderColor: "black",
                    backgroundColor: "#f8fafc",
                    height: "1rem",
                    alignItems: "center",
                  }}
                >
                  {/* Col 1: 15% - Marks & Nos */}
                  <View
                    style={{
                      width: "10%",
                      textAlign: "center",
                      borderRightWidth: "0.03rem",
                      borderColor: "black",
                      height: "100%",
                      paddingLeft: "0.03rem",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 5, fontWeight: "bold" }}>
                      Marks & Nos./
                    </Text>
                    <Text style={{ fontSize: 5, fontWeight: "bold" }}>
                      Container No.
                    </Text>
                  </View>

                  {/* Col 2: 10% - Pkgs */}
                  <View
                    style={{
                      width: "10%",
                      textAlign: "center",
                      borderRightWidth: "0.03rem",
                      borderColor: "black",
                      height: "100%",
                      paddingLeft: "0.03rem",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 5, fontWeight: "bold" }}>
                      No. & Kind
                    </Text>
                    <Text style={{ fontSize: 5, fontWeight: "bold" }}>
                      of Pkgs
                    </Text>
                  </View>

                  {/* Col 3: 45% - Description (Main Content) */}
                  <View
                    style={{
                      width: "57%",
                      textAlign: "center",
                      borderRightWidth: "0.03rem",
                      borderColor: "black",
                      height: "100%",
                      paddingLeft: "0.03rem",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                      Description of Goods
                    </Text>
                  </View>

                  {/* Col 4: 10% - Quantity */}
                  <View
                    style={{
                      width: "6%",
                      textAlign: "center",
                      borderRightWidth: "0.03rem",
                      borderColor: "black",
                      height: "100%",
                      paddingLeft: "0.03rem",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 6, fontWeight: "bold" }}>
                      Quantity
                    </Text>
                    <Text style={{ fontSize: 6, fontWeight: "bold" }}>
                      In NOS
                    </Text>
                  </View>

                  {/* Col 5: 10% - Rate */}
                  <View
                    style={{
                      width: "7%",
                      textAlign: "center",
                      borderRightWidth: "0.03rem",
                      borderColor: "black",
                      height: "100%",
                      paddingLeft: "0.03rem",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 6, fontWeight: "bold" }}>
                      UNIT WEIGHT KGS
                    </Text>
                    <Text style={{ fontSize: 6, fontWeight: "bold" }}></Text>
                  </View>

                  {/* Col 6: 10% - Amount */}
                  <View
                    style={{
                      width: "10%",
                      textAlign: "center",
                      height: "100%",
                      paddingLeft: "0.03rem",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 6, fontWeight: "bold" }}>
                      TOTAL WEIGHT
                    </Text>
                    <Text style={{ fontSize: 6, fontWeight: "bold" }}>
                      IN KG
                    </Text>
                  </View>
                </View>

                {/* TABLE CONTENT AREA */}
                <View style={{ flexDirection: "row", flex: 1 }}>
                  <View
                    style={{
                      justifyContent: "space-evenly",
                      width: "10%",
                      borderRightWidth: "0.03rem",
                      borderColor: "black",
                      padding: 2,
                    }}
                  >
                    <View style={{ gap: "4" }}>
                      <Text style={{ fontSize: 7 }}>{data?.containerType}</Text>
                    </View>
                    {data.containerNo && (
                      <View style={{ gap: "4" }}>
                        <Text style={{ fontSize: 7 }}>Container No:</Text>
                        <Text style={{ fontSize: 7 }}>{data?.containerNo}</Text>
                      </View>
                    )}
                    {data?.containerSEALNO && (
                      <View style={{ gap: "4" }}>
                        <Text style={{ fontSize: 7 }}>Seal No:</Text>
                        <Text style={{ fontSize: 7 }}>
                          {data?.containerSEALNO}
                        </Text>
                      </View>
                    )}
                    {data?.otsNo && (
                      <View style={{ gap: "4" }}>
                        <Text style={{ fontSize: 7 }}>OTS No:</Text>
                        <Text style={{ fontSize: 7 }}>{data?.otsNo}</Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      justifyContent: "space-evenly",
                      width: "10%",
                      borderRightWidth: "0.03rem",
                      borderColor: "black",
                      padding: 2,
                    }}
                  >
                    <View style={{ gap: "4" }}>
                      <Text style={{ fontSize: 7 }}>I.T.C (H.S) NO</Text>
                      <Text style={{ fontSize: 7 }}>{uniqueHSNs}</Text>
                    </View>
                    <View style={{ gap: 2 }}>
                      {packingSummary.map((line, i) => (
                        <Text key={i} style={{ fontSize: 7 }}>
                          {line}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <View
                    style={{
                      width: "57%",
                      borderRightWidth: "0.03rem",
                      borderColor: "black",
                      padding: 0,
                    }}
                  >
                    {/* Category Heading */}
                    <View
                      style={{
                        borderBottomWidth: "0.03rem",
                        borderColor: "black",
                        backgroundColor: "#f0f0f0",
                        height: "2rem",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {/* {uniqueHSNs.map((hsnCode, index) => (
                        <Text
                          key={index}
                          style={{
                            fontSize: 7,
                            fontWeight: "bold",
                            padding: 3,
                          }}
                        >
                          {getDescriptionByHSN(hsnCode, isAssRimstatus)}
                        </Text>
                      ))} */}
                      <Text
                        style={{
                          fontSize: 7,
                          fontWeight: "bold",
                          padding: 3,
                        }}
                      >
                        {finalDescription}
                      </Text>
                    </View>

                    {/* SUB-HEADER FOR ITEMS */}
                    <View
                      style={{
                        flexDirection: "row",
                        borderBottomWidth: 0.5,
                        borderColor: "black",
                        height: 15,
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: "5%",
                          borderRightWidth: 0.5,
                          borderColor: "black",
                          height: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 5,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          SNo:
                        </Text>
                      </View>

                      <View
                        style={{
                          width: "19%",
                          borderRightWidth: 0.5,
                          borderColor: "black",
                          height: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 5,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          SIZE
                        </Text>
                      </View>

                      <View
                        style={{
                          width: "7%",
                          borderRightWidth: 0.5,
                          borderColor: "black",
                          height: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 5,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          RIM
                        </Text>
                      </View>

                      <View
                        style={{
                          width: "12%",
                          borderRightWidth: 0.5,
                          borderColor: "black",
                          height: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 5,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          TREAD
                        </Text>
                        <Text
                          style={{
                            fontSize: 5,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          PATTERN
                        </Text>
                      </View>

                      <View
                        style={{
                          width: "10%",
                          borderRightWidth: 0.5,
                          borderColor: "black",
                          height: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 5,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          GRADE
                        </Text>
                      </View>

                      <View
                        style={{
                          width: "19%",
                          borderRightWidth: 0.5,
                          borderColor: "black",
                          height: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 5,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          BRAND
                        </Text>
                      </View>

                      <View
                        style={{
                          width: "18%",
                          borderRightWidth: 0.5,
                          borderColor: "black",
                          height: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 5,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          SIDEWALL
                        </Text>
                      </View>

                      <View
                        style={{
                          width: "10%",
                          height: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 5,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          PRODUCT
                        </Text>
                        <Text
                          style={{
                            fontSize: 5,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          CODE
                        </Text>
                      </View>
                    </View>

                    {/* DYNAMIC LINE ITEMS */}
                    {pageItems.map((item, index) => {
                      const serialNumber =
                        pageIndex * ITEMS_PER_PAGE + index + 1;
                      return (
                        <View
                          key={index}
                          wrap={false}
                          style={{
                            flexDirection: "row",
                            borderBottomWidth: index === 20 ? 0 : 0.5,
                            borderColor: "black",
                            height: 15,
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              width: "5%",
                              justifyContent: "center",
                              borderRight: "0.03rem",
                              borderColor: "black",
                            }}
                          >
                            <Text style={{ fontSize: 5, textAlign: "center" }}>
                              {serialNumber}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: "19%",
                              justifyContent: "center",
                              borderRight: "0.03rem",
                              borderColor: "black",
                            }}
                          >
                            <Text style={{ fontSize: 5, textAlign: "center" }}>
                              {item.tyreSize}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: "7%",
                              justifyContent: "center",
                              borderRight: "0.03rem",
                              borderColor: "black",
                            }}
                          >
                            <Text style={{ fontSize: 5, textAlign: "center" }}>
                              {item.tyreRim}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: "12%",
                              justifyContent: "center",
                              borderRight: "0.03rem",
                              borderColor: "black",
                            }}
                          >
                            <Text style={{ fontSize: 5, textAlign: "center" }}>
                              {item.platforms}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: "10%",
                              justifyContent: "center",
                              borderRight: "0.03rem",
                              borderColor: "black",
                            }}
                          >
                            <Text style={{ fontSize: 5, textAlign: "center" }}>
                              {item.tyreType}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: "19%",
                              justifyContent: "center",
                              borderRight: "0.03rem",
                              borderColor: "black",
                            }}
                          >
                            <Text style={{ fontSize: 5, textAlign: "center" }}>
                              {item.brand}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: "18%",
                              justifyContent: "center",
                              borderRight: "0.03rem",
                              borderColor: "black",
                            }}
                          >
                            <Text style={{ fontSize: 5, textAlign: "center" }}>
                              {item.sidewall}
                            </Text>
                          </View>

                          <View
                            style={{ width: "10%", justifyContent: "center" }}
                          >
                            <Text style={{ fontSize: 5, textAlign: "center" }}>
                              {item.itemCode}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                  {/* Quantity In NOS */}
                  <View
                    style={{
                      width: "6%",
                      borderRightWidth: "0.03rem",
                      borderColor: "black",
                      padding: 0,
                    }}
                  >
                    {/* Category Heading */}
                    <View
                      style={{
                        borderBottomWidth: "0.03rem",
                        borderColor: "black",
                        backgroundColor: "#f0f0f0",
                        height: "2rem",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{ fontSize: 7, fontWeight: "bold", padding: 3 }}
                      ></Text>
                    </View>
                    {/* SUB-HEADER FOR ITEMS */}
                    <View
                      style={{
                        flexDirection: "row",
                        borderBottomWidth: 0.5,
                        borderColor: "black",
                        height: 15,
                        alignItems: "center",
                      }}
                    ></View>
                    {/* DYNAMIC LINE ITEMS */}
                    {pageItems.map((item, index) => {
                      return (
                        <View
                          key={index}
                          wrap={false}
                          style={{
                            flexDirection: "row",
                            borderBottomWidth: index === 20 ? 0 : 0.5,
                            borderColor: "black",
                            height: 15,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ fontSize: 5, textAlign: "center" }}>
                            {item.itemQty}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View
                    style={{
                      width: "7%",
                      borderRightWidth: "0.03rem",
                      borderColor: "black",
                      padding: 0,
                    }}
                  >
                    {/* Category Heading */}
                    <View
                      style={{
                        borderBottomWidth: "0.03rem",
                        borderColor: "black",
                        backgroundColor: "#f0f0f0",
                        height: "2rem",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{ fontSize: 7, fontWeight: "bold", padding: 3 }}
                      ></Text>
                    </View>

                    {/* SUB-HEADER FOR ITEMS */}
                    <View
                      style={{
                        flexDirection: "row",
                        borderBottomWidth: 0.5,
                        borderColor: "black",
                        height: 15,
                        alignItems: "center",
                      }}
                    ></View>

                    {/* DYNAMIC LINE ITEMS */}
                    {pageItems.map((item, index) => {
                      return (
                        <View
                          key={index}
                          wrap={false}
                          style={{
                            flexDirection: "row",
                            borderBottomWidth: index === 20 ? 0 : 0.5,
                            borderColor: "black",
                            height: 15,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ fontSize: 5, textAlign: "center" }}>
                            {(
                              (Number(item.finishedWt) || 0) +
                              (Number(item.rimfinishedwt) || 0)
                            ).toFixed(3)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View
                    style={{
                      width: "10%",
                      borderRightWidth: "0.03rem",
                      borderColor: "black",
                      padding: 0,
                    }}
                  >
                    {/* Category Heading */}
                    <View
                      style={{
                        borderBottomWidth: "0.03rem",
                        borderColor: "black",
                        backgroundColor: "#f0f0f0",
                        height: "2rem",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{ fontSize: 7, fontWeight: "bold", padding: 3 }}
                      ></Text>
                    </View>

                    {/* SUB-HEADER FOR ITEMS */}
                    <View
                      style={{
                        flexDirection: "row",
                        borderBottomWidth: 0.5,
                        borderColor: "black",
                        height: 15,
                        alignItems: "center",
                      }}
                    ></View>
                    {/* DYNAMIC LINE ITEMS */}
                    {pageItems.map((item, index) => {
                      return (
                        <View
                          key={index}
                          wrap={false}
                          style={{
                            flexDirection: "row",
                            borderBottomWidth: index === 20 ? 0 : 0.5,
                            borderColor: "black",
                            height: 15,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ fontSize: 5, textAlign: "center" }}>
                            {(
                              (item.finishedWt + item.rimfinishedwt) *
                              item.itemQty
                            ).toFixed(3)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
              {/* TABLE BOTTOM (TOTALS) */}
              <View
                style={{
                  flexDirection: "row",
                  height: 15,
                  borderBottomWidth: 0.5,
                  borderColor: "black",
                }}
              >
                <View
                  style={{
                    width: "10%",
                    borderRightWidth: 0.5,
                    borderColor: "black",
                  }}
                />
                <View
                  style={{
                    width: "10%",
                    borderRightWidth: 0.5,
                    borderColor: "black",
                  }}
                />
                <View
                  style={{
                    width: "57%",
                    borderRightWidth: 0.5,
                    borderColor: "black",
                    paddingRight: 5,
                    textAlign: "center",
                    justifyContent: "center",
                  }}
                >
                  {isLastPage && (
                    <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                      TOTAL:
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    width: "6%",
                    borderRightWidth: 0.5,
                    borderColor: "black",
                    textAlign: "center",
                    justifyContent: "center",
                  }}
                >
                  {isLastPage && (
                    <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                      {totalQty}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    width: "7%",
                    borderRightWidth: 0.5,
                    borderColor: "black",
                  }}
                />
                <View
                  style={{
                    width: "10%",
                    textAlign: "center",
                    justifyContent: "center",
                  }}
                >
                  {isLastPage && (
                    <Text style={{ fontSize: 6, fontWeight: "bold" }}>
                      {totalWeight.toFixed(4)}
                    </Text>
                  )}
                </View>
              </View>

              {/* AMOUNT IN WORDS */}
              {isLastPage && (
                <View
                  style={{
                    padding: 4,
                    paddingBottom: 0,
                    borderColor: "black",
                    height: "1.2rem",
                  }}
                >
                  <Text style={{ fontSize: 6, fontWeight: "bold" }}>
                    GROSS WT: {finalGrossWT.toFixed(3)} KGS
                  </Text>

                  <Text style={{ fontSize: 6, fontWeight: "bold" }}>
                    NET WT : {totalWeight.toFixed(4)} KGS
                  </Text>
                </View>
              )}

              {/* CAUTION & DECLARATION BOX */}
              <View
                style={{
                  paddingLeft: 4,
                  paddingRight: 4,
                  paddingBottom: 0,
                  paddingTop: 0,
                  minHeight: 63,
                  width: "100%",
                }}
              >
                {isLastPage && (
                  <Text
                    style={{ fontSize: 6, fontWeight: "bold", marginTop: 2 }}
                  >
                    DECLARATION
                  </Text>
                )}
                {isLastPage && (
                  <Text style={{ fontSize: 6, marginTop: 5 }}>
                    WE DECLARE THAT THIS PACKING LIST SHOWS THE ACTUAL WEIGHT OF
                    GOODS DESCRIBED AND ALL THE PARTICULARS ARE TRUE AND CORRECT
                  </Text>
                )}
              </View>

              {/* FINAL SIGNATURE SECTION */}
              <View style={{ flexDirection: "row", height: 70 }}>
                {/* Left Side (Bank Details / Empty) */}
                <View
                  style={{ width: "50%", padding: 4, flexDirection: "column" }}
                >
                  {/* {isLastPage && <Text style={styles.textBold}> {data?.invoice_Details}</Text>}
                                    {isLastPage && <Text style={styles.textBold}> {data?.igstlut}</Text>} */}
                </View>

                {/* Right Side (Signatory) */}
                {isLastPage && (
                  <View
                    style={{
                      width: "50%",
                      padding: 6,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View>
                      {data.containerLoadFrom === "MMN" ||
                        data.containerLoadFrom === "PDK" ? (
                        <View style={{
                          textAlign: 'center',
                          flexDirection: 'col',
                          justifyContent: 'center',
                          alignItems: 'center'

                        }}><Text
                          style={{
                            fontSize: 7,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                            FOR SUNDARAM INDUSTRIES PRIVATE LIMITED
                          </Text>
                          <Text style={{ fontSize: 5, textAlign: 'center' }}>
                            (SUN TYRES & WHEEL SYSTEM)
                          </Text>
                        </View>
                      ) : (
                        <View style={{
                          textAlign: 'center',
                          flexDirection: 'col',
                          justifyContent: 'center',
                          alignItems: 'center'

                        }}>
                          <Text
                            style={{
                              fontSize: 7,
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            FOR SUNDARAM LANKA PRIVATE LIMITED
                          </Text>
                          <Text style={{ fontSize: 5, textAlign: 'center' }}>
                            (SUN TYRES & WHEEL SYSTEM)
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* This will now definitely show at the bottom of the row */}
                    <Text
                      style={{
                        fontSize: 7,
                        fontWeight: "bold",
                        paddingTop: 2,
                        width: "80%",
                        textAlign: "center",
                      }}
                    >
                      AUTHORISED SIGNATORY
                    </Text>
                  </View>
                )}
              </View>
              {data?.containerLoadFrom === "MMN" ||
                data?.containerLoadFrom === "PDK" ? (
                <View
                  style={{
                    borderTop: "0.03rem",
                    padding: 4,
                    flexDirection: "column",
                    justifyContent: "center", // Center content vertically
                    alignItems: "center", // Center content horizontally
                    marginTop: "3px",
                    fontWeight: "bold",
                    height: "auto",
                  }}
                >
                  <Text style={{ fontSize: 6 }}>
                    SUNDARAM INDUSTRIES PRIVATE LIMITED (Formerly Known as
                    T.S.Rajam Tyres Private Limited)
                  </Text>
                  <Text style={{ fontSize: 6 }}>
                    Regd Office: NO. 10 Jawahar road Chokkikulam, Madurai -
                    625002.
                  </Text>
                  <Text style={{ fontSize: 6 }}>
                    Factory: SUN TYRE & WHEELS SYSTEMS, A1-F3/A Sidco Industrial
                    Estate, Maraimalai Nagar - 603 209, Kanchipuram District,
                    Tamilnadu, India
                  </Text>
                  <Text style={{ fontSize: 6 }}>
                    CIN: U51901TN2018PTC121156 Email: crm@sun-tws.com , Website:
                    www.sun-tws.com , Tel: 044 - 43857129
                  </Text>
                </View>
              ) : (
                <View></View>
              )}
            </View>
          </Page>
        );
      })}
    </>
  );
};

export default InvoiceCustomerPacking;
