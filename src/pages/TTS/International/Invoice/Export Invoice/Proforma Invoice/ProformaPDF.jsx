import { Page, View, StyleSheet, Text, Image } from "@react-pdf/renderer";
import React from "react";
import { Font } from "@react-pdf/renderer";
import LOGO from "../../../../../../assets/img/SUN-TWS.png";
import { numberToWords } from "../../../../../../utils/NumberToWords";
import { formatDateTime } from "../../../../../../utils/FormatDate";
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
});
// ─── Layout constants ─────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 25;
const GRAND_TOTAL_ROW_HEIGHT = 18;
const ITEM_ROW_HEIGHT = 16;
// ─── Simple fixed chunker (25 items per page) ─────────────────────────────────
const chunkItemsForPages = (items) => {
  const chunks = [];
  for (let i = 0; i < items?.length; i += ITEMS_PER_PAGE) {
    chunks.push(items?.slice(i, i + ITEMS_PER_PAGE));
  }
  if (chunks?.length === 0) chunks?.push([]);
  return chunks;
};
// ─── Column widths ────────────────────────────────────────────────────────────
// Without EDC: srNo(4)+product(8)+sunPart(8)+description(36)+qty(6)+unitPrice(8)+unitWt(9)+totalWt(9)+totalPrice(14) = 102%
// With    EDC: srNo(4)+product(8)+sunPart(8)+description(30)+edc(6)+qty(6)+unitPrice(8)+unitWt(9)+totalWt(9)+totalPrice(14) = 102%
//
// Summary alignment — both EDC and non-EDC cases produce label = 56%:
//   Without EDC: 4+8+8+36           = 56%  → summaryLabel
//   With    EDC: 4+8+8+30+6         = 56%  → summaryLabel
//   qty(6%)                                → summaryQty
//   unitPrice(8%)                          → summaryBlankUnitPrice
//   unitWt(9%)                             → summaryBlankUnitWt
//   totalWt(9%)                            → summaryBlankTotalWt
//   totalPrice(14%)                        → summaryValue
const getColWidths = (showEdc, showItemCode, showPONumber) => {
  let base = {
    srNo: 4,
    product: showItemCode ? 8 : 0,
    sunPart: 8,
    po: showPONumber ? 6 : 0,
    description: showEdc ? 30 : 36,
    edc: showEdc ? 6 : 0,
    qty: 6,
    unitPrice: 8,
    unitWt: 9,
    totalWt: 9,
    totalPrice: 14,
  };

  // 👉 Calculate removed width
  let removed = 0;
  if (!showItemCode) removed += 8;
  if (!showPONumber) removed += 6;
  if (!showEdc) removed += 6;

  // 👉 Distribute removed width smartly
  const distributeCols = ["description", "sunPart"];
  distributeCols.forEach((col) => {
    base[col] += removed / distributeCols.length;
  });

  // 👉 Convert to %
  return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, `${v}%`]));
};
// ─── Styles ───────────────────────────────────────────────────────────────────
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
    flexDirection: "column",
  },
  text: {
    fontSize: 6,
    color: "#000",
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: "black",
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
    minHeight: ITEM_ROW_HEIGHT,
    alignItems: "stretch",
  },
  bodyCell: {
    justifyContent: "center",
    borderRightWidth: 0.5,
    borderColor: "#000",
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  bodyText: {
    fontSize: 6,
    textAlign: "left",
    fontWeight: "bold",
    flexWrap: "wrap",
    wordBreak: "break-all",
  },
  // ─── Summary styles — each width mirrors the matching table column(s) ───────
  summaryRow: {
    flexDirection: "row",
    height: 16,
    borderColor: "#000",
  },
  summaryLabel: {
    // srNo(4)+product(8)+sunPart(8)+description(30|36)[+edc(6)] = 56%
    width: "56%",
    borderRightWidth: 0.5,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 6,
  },
  summaryQty: {
    // qty (6%)
    width: "6%",
    borderRightWidth: 0.5,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryBlankUnitPrice: {
    // unitPrice (8%)
    width: "8%",
    borderRightWidth: 0.5,
    borderColor: "#000",
  },
  summaryBlankUnitWt: {
    // unitWt (9%)
    width: "9%",
    borderRightWidth: 0.5,
    borderColor: "#000",
  },
  summaryBlankTotalWt: {
    // totalWt (9%)
    width: "9%",
    borderRightWidth: 0.5,
    borderColor: "#000",
  },
  summaryValue: {
    // totalPrice (14%) — no right border (last column)
    width: "14%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 2,
  },
  grandTotalRow: {
    flexDirection: "row",
    height: GRAND_TOTAL_ROW_HEIGHT,
    borderBottomWidth: 0.5,
    borderColor: "#000",
    backgroundColor: "#f1f5f9",
  },
  pageNumber: {
    position: "absolute",
    bottom: 5,
    right: 14,
    fontSize: 6,
    color: "#000",
  },
});
// ─── Sub-components ───────────────────────────────────────────────────────────
const HeaderSection = ({ data }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 0.5,
      borderColor: "black",
      height: 36,
      paddingHorizontal: 10,
    }}
  >
    <View style={{ width: "20%", justifyContent: "center" }}>
      <Image src={LOGO} style={{ width: 100, height: 35 }} />
    </View>
    <View
      style={{ width: "60%", alignItems: "center", justifyContent: "center" }}
    >
      <Text
        style={{ fontSize: 8, fontWeight: "bold", textTransform: "uppercase" }}
      >
        PROFORMA INVOICE
      </Text>
    </View>
    <View style={{ width: "20%" }} />
  </View>
);
const AddressSection = ({ data }) => (
  <View style={{ flexDirection: "row", height: 170 }}>
    {/* LEFT */}
    <View style={{ width: "40%", borderRightWidth: 0.5, borderColor: "black" }}>
      {/* Exporter */}
      <View
        style={{
          borderBottomWidth: 0.5,
          borderColor: "black",
          height: 77,
          padding: 2,
        }}
      >
        <Text style={{ ...styles.bodyText, fontWeight: "bold" }}>
          EXPORTER :
        </Text>

        {(data?.exportAuthorisedAddress
          ? data.exportAuthorisedAddress.toUpperCase().split("~")
          : []
        ).map((line, i) => (
          <Text key={i} style={{ fontSize: 6 }}>
            {line.trim()}
          </Text>
        ))}
        {data?.plantAddress && (
          <>
            <Text style={{ ...styles.text, fontWeight: "bold", marginTop: 2 }}>
              DELIVERY FROM :
            </Text>
            {data.plantAddress
              .toUpperCase()
              .split("~")
              .map((line, i) => (
                <Text key={i} style={{ fontSize: 6 }}>
                  {line.trim()}
                </Text>
              ))}
          </>
        )}
      </View>
      {/* Buyer / Consignee */}
      <View
        style={{
          borderBottomWidth: 0.5,
          borderColor: "black",
          height: 56,
          padding: 2,
          gap: 1,
        }}
      >
        <Text style={styles.bodyText}>BUYER / CONSIGNEE</Text>
        <Text style={{ fontWeight: "bold", fontSize: 6 }}>
          {data?.billingCompanyName ?? ""}
        </Text>
        <Text style={styles.text}>{data?.billingAddress}</Text>
        <Text style={styles.text}>
          {[
            data?.billingCity,
            data?.billingState,
            data?.billingCountry,
            data?.billingZipcode,
          ]
            .filter(Boolean)
            .join(", ")}
        </Text>
        <Text style={{ fontWeight: "bold", fontSize: 6 }}>
          {data?.billingContactName ?? ""}
        </Text>
        <Text style={styles.text}>
          {[data?.billingEmailId, data?.billingMobile]
            .filter(Boolean)
            .join(", ")}
        </Text>
      </View>
      {/* Carrier info */}
      <View
        style={{ padding: 2, gap: 1, justifyContent: "space-evenly", flex: 1 }}
      >
        <Text style={styles.bodyText}>
          CARRIER: <Text style={styles.text}>{data?.preCarriageBy}</Text>
        </Text>
        <Text style={styles.bodyText}>
          PACKING METHOD: <Text style={styles.text}>{data?.packingMethod}</Text>
        </Text>
        <Text style={styles.bodyText}>
          CONTAINER TYPE: <Text style={styles.text}>{data?.containerType}</Text>
        </Text>
        <Text style={styles.bodyText}>
          LEAD TIME: <Text style={styles.text}>{data?.leadTime}</Text>
        </Text>
      </View>
    </View>
    {/* RIGHT */}
    <View style={{ width: "60%" }}>
      {/* Order ref */}
      <View
        style={{
          borderBottomWidth: 0.5,
          borderColor: "black",
          height: 22,
          padding: 2,
          gap: 1,
        }}
      >
        <Text style={styles.bodyText}>
          Buyers Order No:{" "}
          <Text style={styles.text}>{data?.BuyersOrderNumber}</Text>
        </Text>
        <Text style={styles.bodyText}>
          Rev no: <Text style={styles.text}>{data?.revisionNumber}</Text>
        </Text>
      </View>
      {/* Rev date */}
      <View
        style={{
          borderBottomWidth: 0.5,
          borderColor: "black",
          height: 20,
          padding: 1,
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.bodyText}>
          Rev Date:{" "}
          <Text style={styles.text}>{formatDateTime(data?.revisionDate)}</Text>
        </Text>
        <Text style={styles.bodyText}>
          Other Reference(s):{" "}
          <Text style={styles.text}>
            EMAIL REF {data?.completedDate} / {data?.orderRefNo} / CONTAINER
            NO{" "}
          </Text>
        </Text>
      </View>
      {/* Ship-to + Notify Party */}
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 0.5,
          borderColor: "black",
          height: 59,
        }}
      >
        <View style={{ flex: 1, padding: 2, gap: 2 }}>
          <Text style={[styles.bodyText, { fontWeight: "bold" }]}>
            Buyer If Other Than Consignee:
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 6 }}>
            {data?.shippingCompanyName ?? ""}
          </Text>
          <Text style={styles.text}>{data?.shippingAddress || ""}</Text>
          <Text style={styles.text}>
            {[
              data?.shippingCity,
              data?.shippingState,
              data?.shippingCountry,
              data?.shippingZipcode,
            ]
              .filter(Boolean)
              .join(", ")}
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 6 }}>
            {data?.shippingContactName ?? ""}
          </Text>
          <Text style={styles.text}>
            {[data?.shippingEmailId, data?.shippingMobile]
              .filter(Boolean)
              .join(", ")}
          </Text>
        </View>
        {data?.notifyPartyName && (
          <View
            style={{
              flex: 1,
              borderLeftWidth: 0.5,
              borderColor: "black",
              padding: 2,
              gap: 2,
            }}
          >
            <Text style={[styles.bodyText, { fontWeight: "bold" }]}>
              Notify Party:
            </Text>
            <Text style={styles.text}>{data?.notifyPartyName ?? ""}</Text>
            <Text style={styles.text}>{data?.notifyPartyAddress ?? ""}</Text>
            <Text style={styles.text}>
              {[
                data?.notifyPartyCity,
                data?.notifyPartyState,
                data?.notifyPartyZipcode,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
            <Text style={styles.text}>{data?.notifyPartyCountry ?? ""}</Text>
            <Text style={styles.text}>
              {[data?.notifyPartyEmail, data?.notifyPartyPhone]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </View>
        )}
      </View>
      {/* Payment terms */}
      <View
        style={{ padding: 2, gap: 1, justifyContent: "space-between", flex: 1 }}
      >
        <View>
          <Text style={styles.bodyText}>TERMS OF DELIVERY & PAYMENT:</Text>
          <Text style={styles.text}>
            THE PRICES ARE {data?.incoterm} -{" "}
            {(data?.placeOfIncoterm || "").toUpperCase()} BY{" "}
            {data?.preCarriageBy}, IN {(data?.userCurrency || "").toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.bodyText, { fontWeight: "bold" }]}>
          PAYMENT TERMS:{" "}
          <Text style={styles.bodyText}>
            <Text style={styles.text}>{data?.paymentTerms}</Text>
          </Text>
        </Text>
        <Text style={{ ...styles.bodyText, fontWeight: "bold" }}>
          BANK DETAILS:{" "}
          <Text style={styles.text}>
            {(data?.bankDetails || "").toUpperCase().split("~")}
          </Text>
        </Text>
      </View>
    </View>
  </View>
);
// ─── Table Header ─────────────────────────────────────────────────────────────
const TableHeader = ({ data, showEdc, showItemCode, showPONumber }) => {
  const w = getColWidths(showEdc, showItemCode);
  const columns = [
    { label: "SR NO", width: w.srNo },
    ...(showItemCode ? [{ label: "CUSTOMER PART #", width: w.product }] : []),
    { label: "SUN PART #", width: w.sunPart },
    ...(showPONumber ? [{ label: "PO #", width: w.po }] : []),
    { label: "ITEM DESCRIPTION", width: w.description },
    ...(showEdc ? [{ label: "EDC", width: w.edc }] : []),
    { label: "QTY", width: w.qty },
    { label: `UNIT PRICE\n${data?.userCurrency ?? "USD"}`, width: w.unitPrice },
    { label: "UNIT WT\nKGS", width: w.unitWt },
    { label: "TOTAL WT\nKGS", width: w.totalWt },
    {
      label: `TOTAL PRICE\n${data?.userCurrency ?? "USD"}`,
      width: w.totalPrice,
      last: true,
    },
  ];
  return (
    <View style={styles.tableHeaderRow}>
      {columns.map(({ label, width, last }, i) => (
        <View
          key={i}
          style={[
            styles.headerCell,
            { width },
            last ? { borderRightWidth: 0 } : {},
          ]}
        >
          {label.split("\n").map((l, j) => (
            <Text key={j} style={styles.headerText}>
              {l}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};
// ─── Table Rows ───────────────────────────────────────────────────────────────
const TableRows = ({
  items,
  showEdc,
  showItemCode,
  showPONumber,
  startIndex = 0,
}) => {
  const w = getColWidths(showEdc, showItemCode);
  return (
    <>
      {items.map((item, index) => (
        <View key={index} style={styles.bodyRow}>
          <View style={[styles.bodyCell, { width: w.srNo }]}>
            <Text style={styles.bodyText}>
              {item.srNo ?? startIndex + index + 1}
            </Text>
          </View>
          {showItemCode && (
            <View style={[styles.bodyCell, { width: w.product }]}>
              <Text style={styles.bodyText}>{item.product}</Text>
            </View>
          )}
          <View style={[styles.bodyCell, { width: w.sunPart }]}>
            <Text style={styles.bodyText}>{item.itemCode}</Text>
          </View>
          {showPONumber && (
            <View style={[styles.bodyCell, { width: w.po }]}>
              <Text style={styles.bodyText}>{item.PONumber}</Text>
            </View>
          )}
          <View style={[styles.bodyCell, { width: w.description }]}>
            <Text style={styles.bodyText}>
              {item.tyreSize} / {" "}
              {item.tyreRim === "-" ? "0.00" : item.tyreRim} /{" "}
              {item.brand} / {item.sidewall} / {item.tyreType}
            </Text>
          </View>
          {showEdc && (
            <View style={[styles.bodyCell, { width: w.edc }]}>
              <Text style={[styles.bodyText, { textAlign: "right" }]}>
                {item.edcNo}
              </Text>
            </View>
          )}
          <View style={[styles.bodyCell, { width: w.qty }]}>
            <Text style={[styles.bodyText, { textAlign: "right" }]}>
              {item.itemQty}
            </Text>
          </View>
          <View style={[styles.bodyCell, { width: w.unitPrice }]}>
            <Text style={[styles.bodyText, { textAlign: "right" }]}>
              {item.basicPrice}
            </Text>
          </View>
          <View style={[styles.bodyCell, { width: w.unitWt }]}>
            <Text style={[styles.bodyText, { textAlign: "right" }]}>
              {item.finishedWt}
            </Text>
          </View>
          <View style={[styles.bodyCell, { width: w.totalWt }]}>
            <Text style={[styles.bodyText, { textAlign: "right" }]}>
              {(item.finishedWt * item.itemQty).toFixed(3)}
            </Text>
          </View>
          <View
            style={[
              styles.bodyCell,
              { width: w.totalPrice, borderRightWidth: 0 },
            ]}
          >
            <Text style={[styles.bodyText, { textAlign: "right" }]}>
              {(item.basicPrice * item.itemQty).toFixed(2)}
            </Text>
          </View>
        </View>
      ))}
    </>
  );
};
// ─── Summary + T&C ────────────────────────────────────────────────────────────
const SummaryRows = ({ data, subTotal, grandTotalDDP = 0 }) => {
  const otherCharges = data?.additionalCharges?.[0]?.rows || [];
  const discounts = data?.discountDetails?.[0]?.rows || [];
  const amountInWords = numberToWords(grandTotalDDP, data?.userCurrency || "");
  const totalQty = (data?.items || []).reduce(
    (s, it) => s + Number(it.itemQty || 0),
    0,
  );

  const showEdc = data?.items?.some((i) => i?.assyRimstatus);
  const showItemCode = data?.items?.some((i) => i?.product);
  const showPONumber = data?.items?.some((i) => i?.PONumber);

  const w = getColWidths(showEdc, showItemCode, showPONumber);

  const summaryLabelWidth =
    parseFloat(w.srNo) +
    parseFloat(w.product || 0) +
    parseFloat(w.sunPart) +
    parseFloat(w.po || 0) +
    parseFloat(w.description);

  // Reusable blank spacers matching unitPrice / unitWt / totalWt columns
  const BlankCells = ({ withTopBorder = false }) => (
    <>
      <View
        style={[
          styles.summaryBlankUnitPrice,
          withTopBorder && { borderTopWidth: 0.5 },
        ]}
      />
      <View
        style={[
          styles.summaryBlankUnitWt,
          withTopBorder && { borderTopWidth: 0.5 },
        ]}
      />
      <View
        style={[
          styles.summaryBlankTotalWt,
          withTopBorder && { borderTopWidth: 0.5 },
        ]}
      />
    </>
  );

  return (
    <View wrap={false}>
      {/* 1. Sub Total */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryLabel, { width: `${summaryLabelWidth}%` }]}>
          <Text style={{ fontSize: 7, fontWeight: "bold" }}>SUB TOTAL</Text>
        </View>
        <View style={styles.summaryQty}>
          <Text style={{ fontSize: 7, fontWeight: "bold" }}>{totalQty}</Text>
        </View>
        <BlankCells />
        <View style={styles.summaryValue}>
          <Text style={{ fontSize: 7, fontWeight: "bold" }}>
            {subTotal.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* 2. Dynamic Other Charges */}
      {otherCharges
        .filter((charge) => Number(charge?.value) > 0)
        .map((charge, idx) => (
          <View key={`charge-${idx}`} style={styles.summaryRow}>
            <View style={[styles.summaryLabel,{ width: `${summaryLabelWidth}%` }]}>
              <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                {charge.desc.toUpperCase()}
              </Text>
            </View>
            <View style={styles.summaryQty} />
            <BlankCells />
            <View style={styles.summaryValue}>
              <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                {Number(charge.value).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

      {/* 3. Dynamic Discounts */}
      {discounts
        .filter((disc) => Number(disc?.value) > 0)
        .map((disc, idx) => (
          <View key={`disc-${idx}`} style={styles.summaryRow}>
            <View style={[styles.summaryLabel,{ width: `${summaryLabelWidth}%` }]}>
              <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                {disc.desc.toUpperCase()}
              </Text>
            </View>
            <View style={styles.summaryQty} />
            <BlankCells />
            <View style={styles.summaryValue}>
              <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                - {Number(disc.value).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

      {/* 4. Grand Total */}
      <View style={styles.grandTotalRow}>
        <View
          style={[
            styles.summaryLabel,
            {
              width: `${summaryLabelWidth}%`,
              borderTopWidth: 0.5,
            },
          ]}
        >
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>
            GRAND TOTAL {(data?.userCurrency || "USD").toUpperCase()}{" "}
            {(data?.incoterm || "").toUpperCase()}{" "}
            {(data?.placeOfIncoterm || "").toUpperCase()} BY{" "}
            {(data?.preCarriageBy || "").toUpperCase()}
          </Text>
        </View>
        <View
          style={[
            styles.summaryQty,
            {
              borderTopWidth: 0.5,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>{totalQty}</Text>
        </View>
        <BlankCells withTopBorder />
        <View
          style={[
            styles.summaryValue,
            { borderTopWidth: 0.5, justifyContent: "center" },
          ]}
        >
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>
            {(grandTotalDDP || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Amount in words */}
      <View style={{ padding: 4 }}>
        <Text style={{ fontSize: 7, fontWeight: "bold" }}>
          ( {amountInWords} )
        </Text>
      </View>

      {/* Terms & Conditions */}
      <View
        style={{ padding: 4, borderBottomWidth: 0.5, borderColor: "black" }}
      >
        <Text
          style={{
            fontSize: 7,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 3,
          }}
        >
          TERMS & CONDITIONS
        </Text>
        <Text style={{ fontSize: 7, fontWeight: "bold", marginTop: 3 }}>
          1. THE ABOVE PRICES ARE {(data?.userCurrency || "").toUpperCase()},{" "}
          {(data?.incoterm || "").toUpperCase()}{" "}
          {(data?.placeOfIncoterm || "").toUpperCase()} (SHIPMENT BY{" "}
          {data?.preCarriageBy})
        </Text>
        <Text style={{ fontSize: 7, fontWeight: "bold", marginTop: 3 }}>
          2. PAYMENT: {data?.paymentTerms}
        </Text>
        {data?.remark && (
          <Text style={{ fontSize: 7, fontWeight: "bold", marginTop: 3 }}>
            {data.remark}
          </Text>
        )}
      </View>
    </View>
  );
};
// ─── Signature block ──────────────────────────────────────────────────────────
const SignatureBlock = ({ data }) => (
  <View
    wrap={false}
    style={{
      flexDirection: "row",
      marginTop: "auto",
      paddingTop: 0,
      paddingBottom: 5,
    }}
  >
    <View style={{ width: "50%", alignItems: "center" }}>
      <Text style={{ fontSize: 7, fontWeight: "bold" }}>
        {data?.authorisedSignature}
      </Text>
      <Text style={{ marginTop: 50, fontSize: 7, fontWeight: "bold" }}>
        AUTHORISED SIGNATORY
      </Text>
    </View>
    <View style={{ width: "50%", alignItems: "center" }}>
      <Text style={{ fontSize: 7, fontWeight: "bold" }}>
        FOR {data?.custFullName}
      </Text>
      <Text style={{ marginTop: 50, fontSize: 7, fontWeight: "bold" }}>
        AUTHORISED SIGNATORY
      </Text>
    </View>
  </View>
);
// ─── Main component ───────────────────────────────────────────────────────────
const ProformaPDF = ({ data }) => {
  const showEdc = data?.items?.some((item) => item?.assyRimstatus === true);
  const showItemCode = data?.items?.some((item) => item?.product);
  const PONumber = data?.items?.some((item) => item?.PONumber);
  const itemChunks = chunkItemsForPages(data?.items);
  const subTotal = (data?.items || []).reduce(
    (s, it) =>
      s + Number((it?.basicPrice + it?.rimUnitPrice) * it?.itemQty || 0),
    0,
  );
  const totalCharges = data?.additionalCharges?.[0]?.total || 0;
  const totalDiscounts = data?.discountDetails?.[0]?.total || 0;
  const grandTotalDDP =
    subTotal + Number(totalCharges) - Number(totalDiscounts);
  return (
    <>
      {itemChunks.map((pageItems, pageIndex) => {
        const isLastPage = pageIndex === itemChunks.length - 1;
        return (
          <Page key={pageIndex} size="A4" style={styles.page}>
            <View style={styles.container}>
              <HeaderSection data={data} />
              <AddressSection data={data} />
              <View style={{ borderColor: "black" }}>
                <TableHeader
                  data={data}
                  showEdc={showEdc}
                  showItemCode={showItemCode}
                  showPONumber={PONumber}
                />
                <TableRows
                  items={pageItems}
                  showEdc={showEdc}
                  showItemCode={showItemCode}
                  showPONumber={PONumber}
                  startIndex={pageIndex * ITEMS_PER_PAGE}
                />
              </View>
              {isLastPage && (
                <SummaryRows
                  data={data}
                  subTotal={subTotal}
                  grandTotalDDP={grandTotalDDP}
                />
              )}
              {isLastPage && <SignatureBlock data={data} />}
            </View>
            <Text
              fixed
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} / ${totalPages}`
              }
              style={styles.pageNumber}
            />
          </Page>
        );
      })}
    </>
  );
};
export default ProformaPDF;
