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
Font.registerHyphenationCallback((word) => [word]);

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

// ─── Group items by tyreType, preserving order within each group ────────────
const groupItemsByTyreType = (items) => {
  if (!items || items.length === 0) return [];

  const groups = new Map();

  items.forEach((item) => {
    const key = item?.tyreType || "UNSPECIFIED";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  // Map preserves insertion order, so groups appear in the order their
  // tyreType first showed up in the original items array.
  const grouped = [];
  for (const [, groupItems] of groups) {
    grouped.push(...groupItems);
  }

  return grouped;
};

// ─── Column widths ────────────────────────────────────────────────────────────
// Column order: srNo | product | sunPart | po | description | edc | qty | unitWt | totalWt | unitPrice | totalPrice
// EDC width increased from 6 → 8, totalPrice reduced from 14 → 12 (same total budget)
const getColWidths = (showEdc, showItemCode, showPONumber) => {
  let base = {
    srNo: 4,
    product: showItemCode ? 8 : 0,
    sunPart: 8,
    po: showPONumber ? 6 : 0,
    description: showEdc ? 28 : 36,
    edc: showEdc ? 8 : 0, // ← increased from 6 to 8
    qty: 6,
    unitWt: 9, // ← reordered: now comes before unitPrice
    totalWt: 9, // ← reordered: now comes before unitPrice
    unitPrice: 8, // ← moved after totalWt
    totalPrice: 12, // ← reduced from 14 to 12
  };
 

  // Calculate removed width from optional columns
  let removed = 0;
  if (!showItemCode) removed += 8;
  if (!showPONumber) removed += 6;
  if (!showEdc) removed += 8; // match the increased edc budget

  // Distribute removed width across description and sunPart
  const distributeCols = ["description", "sunPart"];
  distributeCols.forEach((col) => {
    base[col] += removed / distributeCols.length;
  });

  // Convert to %
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
  summaryRow: {
    flexDirection: "row",
    height: 16,
    borderColor: "#000",
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
          CONTAINER / CARGO TYPE: <Text style={styles.text}>{data?.containerType}</Text>
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
          Order Date:{" "}
          <Text style={styles.text}>{formatDateTime(data?.Date)}</Text>
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
        {data?.revisionNumber && (
          <Text style={styles.bodyText}>
            Rev no: <Text style={styles.text}>{data?.revisionNumber}</Text> Rev
            Date:{" "}
            <Text style={styles.text}>
              {formatDateTime(data?.revisionDate)}
            </Text>
          </Text>
        )}
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.bodyText}>Other Reference(s): </Text>
          <Text style={styles.text}>
            {data?.EmailDate && `EMAIL REF :${data.EmailDate} / `}
          </Text>
          <Text style={styles.text}>
            {data?.orderRefNo && `${data.orderRefNo}`}
          </Text>
          <Text style={styles.text}>
            {data?.containerNo && `/ CONTAINER NO ${data.containerNo}`}
          </Text>
        </View>
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
            {"Buyer If Other Than Consignee (Delivery address):"}
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
  // ✅ Fixed: pass all three flags so widths match TableRows exactly
  const w = getColWidths(showEdc, showItemCode, showPONumber);

  // ✅ Column order: ... qty | unitWt | totalWt | unitPrice | totalPrice
  const columns = [
    { label: "SR NO", width: w.srNo },
    ...(showItemCode ? [{ label: "CUSTOMER PART #", width: w.product }] : []),
    { label: "SUN PART #", width: w.sunPart },
    ...(showPONumber ? [{ label: "PO #", width: w.po }] : []),
    { label: "ITEM DESCRIPTION", width: w.description },
    ...(showEdc ? [{ label: "EDC", width: w.edc }] : []),
    { label: "QTY", width: w.qty },
    { label: "UNIT WT\nKGS", width: w.unitWt }, // ← moved before unitPrice
    { label: "TOTAL WT\nKGS", width: w.totalWt }, // ← moved before unitPrice
    { label: `UNIT PRICE\n${data?.userCurrency ?? "USD"}`, width: w.unitPrice }, // ← moved after totalWt
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
  const w = getColWidths(showEdc, showItemCode, showPONumber);

  return (
    <>
      {items.map((item, index) => {
        return (
          <View key={index} style={styles.bodyRow}>
            <View style={[styles.bodyCell, { width: w.srNo }]}>
              <Text style={styles.bodyText}>
                {item.srNo ?? startIndex + index + 1}
              </Text>
            </View>
            {showItemCode && (
              <View style={[styles.bodyCell, { width: w.product }]}>
                <Text style={styles.bodyText}>{item.partNumber}</Text>
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
                {item?.category === "SPLIT RIMS"
                  ? item.category
                  : `${item.tyreSize} / ${
                      item.tyreRim === "-" ? "0.00" : item.tyreRim
                    } / ${item.brand} / ${item.sidewall} / ${item.tyreType} ${
                      item?.assyRimstatus ? item?.edcNo : ""
                    } ${item?.color ? `${item.color} ${item.des || ""}` : ""}`}
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
                {item.itemQty || 0}
              </Text>
            </View>
            {/* ✅ unitWt now before unitPrice */}
            <View style={[styles.bodyCell, { width: w.unitWt }]}>
              <Text style={[styles.bodyText, { textAlign: "right" }]}>
                {((item?.finishedWt || 0) + (item?.rimfinishedwt || 0)).toFixed(
                  3,
                )}
              </Text>
            </View>
            {/* ✅ totalWt now before unitPrice */}
            <View style={[styles.bodyCell, { width: w.totalWt }]}>
              <Text style={[styles.bodyText, { textAlign: "right" }]}>
                {(
                  ((item?.finishedWt || 0) + (item?.rimfinishedwt || 0)) *
                  (item?.itemQty || 0)
                ).toFixed(3)}
              </Text>
            </View>
            {/* ✅ unitPrice now after weight columns */}
            <View style={[styles.bodyCell, { width: w.unitPrice }]}>
              <Text style={[styles.bodyText, { textAlign: "right" }]}>
                {((item?.basicPrice || 0) + (item?.rimUnitPrice || 0)).toFixed(
                  2,
                )}
              </Text>
            </View>
            <View
              style={[
                styles.bodyCell,
                { width: w.totalPrice, borderRightWidth: 0 },
              ]}
            >
              <Text style={[styles.bodyText, { textAlign: "right" }]}>
                {(
                  ((item?.basicPrice || 0) + (item?.rimUnitPrice || 0)) *
                  (item?.itemQty || 0)
                ).toFixed(2)}
              </Text>
            </View>
          </View>
        );
      })}
    </>
  );
};

// ─── Summary + T&C ────────────────────────────────────────────────────────────
const SummaryRows = ({ data, subTotal, grandTotalDDP = 0, gstAmount, gstPercent, }) => {
  const gstData = data?.gstCharges || {};
  const otherCharges = data?.additionalCharges?.[0]?.rows || [];
  const discounts = data?.discountDetails?.[0]?.rows || [];
  const amountInWords = numberToWords(grandTotalDDP, data?.userCurrency || "");
  const igst = Number(data?.igst || 0);
    const gstType = gstData.type || "BACKEND";
 

  const totalQty = (data?.items || []).reduce(
    (s, it) => s + Number(it.itemQty || 0),
    0,
  );
  const grandTotalWeight = (data?.items || []).reduce(
    (sum, item) =>
      sum +
      ((item?.finishedWt || 0) + (item?.rimfinishedwt || 0)) *
        (item?.itemQty || 0),
    0,
  );

  const showEdc = data?.items?.some((i) => i?.assyRimstatus);
  const showItemCode = data?.items?.some((i) => i?.partNumber);
  const showPONumber = data?.items?.some((i) => i?.PONumber);

  // ✅ Use the same getColWidths so every pixel matches the table above
  const w = getColWidths(showEdc, showItemCode, showPONumber);

  // Compute label width as the sum of all columns before qty
  const summaryLabelWidth =
    parseFloat(w.srNo) +
    parseFloat(w.product || 0) +
    parseFloat(w.sunPart) +
    parseFloat(w.po || 0) +
    parseFloat(w.description) +
    parseFloat(w.edc || 0);

  // ✅ BlankCells now uses computed widths — borders will always align with header/rows
  // Order matches new column sequence: unitWt | totalWt | unitPrice
  const BlankCells = ({ withTopBorder = false }) => (
    <>
      <View
        style={{
          width: w.unitWt,
          borderRightWidth: 0.5,
          borderColor: "#000",
          ...(withTopBorder ? { borderTopWidth: 0.5 } : {}),
        }}
      />
      <View
        style={{
          width: w.totalWt,
          borderRightWidth: 0.5,
          borderColor: "#000",
          ...(withTopBorder ? { borderTopWidth: 0.5 } : {}),
        }}
      />
      <View
        style={{
          width: w.unitPrice,
          borderRightWidth: 0.5,
          borderColor: "#000",
          ...(withTopBorder ? { borderTopWidth: 0.5 } : {}),
        }}
      />
    </>
  );

  // Shared inline style builders to avoid repeating literals
  const labelStyle = (extra = {}) => ({
    width: `${summaryLabelWidth}%`,
    borderRightWidth: 0.5,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 6,
    ...extra,
  });

  const qtyStyle = (extra = {}) => ({
    width: w.qty,
    borderRightWidth: 0.5,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    ...extra,
  });

  const valueStyle = (extra = {}) => ({
    width: w.totalPrice,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 2,
    ...extra,
  });

  const gstLabel =
  gstType === "IGST"
    ? `IGST (${gstPercent}%)`
    : gstType === "CGST_SGST"
    ? `CGST + SGST (${gstPercent}%)`
    : gstData.cgst > 0 || gstData.sgst > 0
    ? `CGST + SGST (${gstPercent}%)`
    : `IGST (${gstPercent}%)`;

  return (
    <View wrap={false}>
      {/* 1. Sub Total */}
      <View style={styles.summaryRow}>
        <View style={labelStyle()}>
          <Text style={{ fontSize: 7, fontWeight: "bold" }}>SUB TOTAL</Text>
        </View>
        <View style={qtyStyle()}>
          <Text style={{ fontSize: 7, fontWeight: "bold" }}>{totalQty}</Text>
        </View>
        <BlankCells />
        <View style={valueStyle()}>
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
            <View style={labelStyle()}>
              <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                {charge.desc.toUpperCase()}
              </Text>
            </View>
            <View style={qtyStyle()} />
            <BlankCells />
            <View style={valueStyle()}>
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
            <View style={labelStyle()}>
              <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                {disc.desc.toUpperCase()}
              </Text>
            </View>
            <View style={qtyStyle()} />
            <BlankCells />
            <View style={valueStyle()}>
              <Text style={{ fontSize: 7, fontWeight: "bold" }}>
                - {Number(disc.value).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

      {/* 4. GST */}
      {gstPercent > 0 && (
        <View style={styles.summaryRow}>
          <View style={labelStyle()}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>
              {gstLabel}
            </Text>
          </View>
          <View style={qtyStyle()} />
          <BlankCells />
          <View style={valueStyle()}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>
              {gstAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* 4. Grand Total */}
      <View style={styles.grandTotalRow}>
        <View style={labelStyle({ borderTopWidth: 0.5 })}>
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>
            GRAND TOTAL {(data?.userCurrency || "USD").toUpperCase()}{" "}
            {(data?.incoterm || "").toUpperCase()}{" "}
            {(data?.placeOfIncoterm || "").toUpperCase()} BY{" "}
            {(data?.preCarriageBy || "").toUpperCase()}
          </Text>
        </View>
        <View style={qtyStyle({ borderTopWidth: 0.5 })}>
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>{totalQty}</Text>
        </View>
        <View
          style={{
            width: w.unitWt,
            borderRightWidth: 0.5,
            borderColor: "#000",
            borderTopWidth: 0.5,
          }}
        />

        <View
          style={{
            width: w.totalWt,
            borderRightWidth: 0.5,
            borderColor: "#000",
            borderTopWidth: 0.5,
            justifyContent: "center",
            alignItems: "flex-end",
            paddingRight: 2,
          }}
        >
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>
            {grandTotalWeight.toFixed(3)}
          </Text>
        </View>

        <View
          style={{
            width: w.unitPrice,
            borderRightWidth: 0.5,
            borderColor: "#000",
            borderTopWidth: 0.5,
          }}
        />
        <View style={valueStyle({ borderTopWidth: 0.5 })}>
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
        {(() => {
          const fixedLines = [
            `1. THE ABOVE PRICES ARE ${(data?.userCurrency || "").toUpperCase()}, ${(data?.incoterm || "").toUpperCase()} ${(data?.placeOfIncoterm || "").toUpperCase()} (SHIPMENT BY ${data?.preCarriageBy})`,
            `2. PAYMENT: ${data?.paymentTerms}`,
          ];
          const dynamicLines = data?.custInstruction
            ? data.custInstruction
                .replace(/~/g, "\n")
                .split("\n")
                .filter((l) => l.trim() !== "")
                .map((l) => l.trim())
            : [];
          const allLines = [...fixedLines, ...dynamicLines];

          if (allLines.length > 4) {
            const mid = Math.ceil(allLines.length / 2);
            const leftLines = allLines.slice(0, mid);
            const rightLines = allLines.slice(mid);
            return (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  {leftLines.map((line, i) => (
                    <Text
                      key={i}
                      style={{ fontSize: 7, fontWeight: "bold", marginTop: 3 }}
                    >
                      {line}
                    </Text>
                  ))}
                </View>
                <View
                  style={{
                    width: 0.5,
                    backgroundColor: "black",
                    marginHorizontal: 2,
                  }}
                />
                <View style={{ flex: 1 }}>
                  {rightLines.map((line, i) => (
                    <Text
                      key={i}
                      style={{ fontSize: 7, fontWeight: "bold", marginTop: 3 }}
                    >
                      {line}
                    </Text>
                  ))}
                </View>
              </View>
            );
          }

          return allLines.map((line, i) => (
            <Text
              key={i}
              style={{ fontSize: 7, fontWeight: "bold", marginTop: 3 }}
            >
              {line}
            </Text>
          ));
        })()}
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
  const showItemCode = data?.items?.some((item) => item?.partNumber);
  const PONumber = data?.items?.some((item) => item?.PONumber);
  // const itemChunks = chunkItemsForPages(data?.items);
  const itemChunks = chunkItemsForPages(groupItemsByTyreType(data?.items));

  const subTotal = (data?.items || []).reduce(
    (s, it) =>
      s + Number((it?.basicPrice + it?.rimUnitPrice) * it?.itemQty || 0),
    0,
  );
  const totalCharges = data?.additionalCharges?.[0]?.total || 0;
  const totalDiscounts = data?.discountDetails?.[0]?.total || 0;
  // ✅ TAXABLE
  const taxable = subTotal + Number(totalCharges) - Number(totalDiscounts);
  // ✅ GST FROM BACKEND
  const gstData = data?.gstCharges || {};

const gstType = gstData.type || "BACKEND";

// Backend fallback
const backendIgst = Number(data?.igst || 0);
const backendCgst = Number(data?.cgst || 0);
const backendSgst = Number(data?.sgst || 0);

let gstPercent = 0;

// ✅ 1. Use percentage first (IMPORTANT FIX)
if (gstData.percentage && Number(gstData.percentage) > 0) {
  gstPercent = Number(gstData.percentage);
}

// ✅ 2. Type-based fallback
else if (gstData.type === "IGST") {
  gstPercent = Number(gstData.igst || backendIgst || 0);
} else if (gstData.type === "CGST_SGST") {
  gstPercent =
    Number(gstData.cgst || backendCgst || 0) +
    Number(gstData.sgst || backendSgst || 0);
}

// ✅ 3. Final fallback
else {
  gstPercent =
    backendIgst > 0 ? backendIgst : backendCgst + backendSgst;
}
  // ✅ GST AMOUNT
  const gstAmount =
  taxable > 0
    ? parseFloat(((taxable * gstPercent) / 100).toFixed(2))
    : 0;
  // ✅ FINAL TOTAL
  const grandTotalDDP = taxable + gstAmount;

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
                  gstAmount={gstAmount}
                  gstPercent={gstPercent}
                  
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
