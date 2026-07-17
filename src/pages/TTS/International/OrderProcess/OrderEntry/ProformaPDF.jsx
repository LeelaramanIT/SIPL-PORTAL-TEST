import { Page, View, StyleSheet, Text, Image, Font } from "@react-pdf/renderer";
import React from "react";
import LOGO from "../../../../../assets/img/SUN-TWS.png";
import { numberToWords } from "../../../../../utils/NumberToWords";
import { formatDateTime } from "../../../../../utils/FormatDate";

// ── Safe coercions ────────────────────────────────────────────────────────────
const s  = (val) => String(val ?? "");           // undefined/null → ""
const n  = (val) => String(Number(val) || 0);    // number → string
const sf = (val, dec = 2) =>                     // number → fixed string
  (Number(val) || 0).toFixed(dec);

// ── Font registration (module level — must NOT be called during render) ───────
Font.register({
  family: "Roboto",
  src: "/fonts/Roboto-Regular.ttf",
  fontWeight: "normal",
});
Font.registerHyphenationCallback((word) => [word]);

// ── Layout constants ──────────────────────────────────────────────────────────
const ITEMS_PER_PAGE       = 25;
const GRAND_TOTAL_ROW_HEIGHT = 16;
const ITEM_ROW_HEIGHT      = 16;

const chunkItemsForPages = (items) => {
  const chunks = [];
  const src = items || [];
  for (let i = 0; i < src.length; i += ITEMS_PER_PAGE)
    chunks.push(src.slice(i, i + ITEMS_PER_PAGE));
  if (chunks.length === 0) chunks.push([]);
  return chunks;
};

// ── Sort helper ────────────────────────────────────────────────────────────
// ── Sort helper ────────────────────────────────────────────────────────────
// const sortItemsByPosition = (items) =>
//   [...(items || [])].sort((a, b) => {
//     const typeA = Number(a?.typePosition) || 0;
//     const typeB = Number(b?.typePosition) || 0;
//     if (typeA !== typeB) return typeA - typeB;

//     const weightA = (Number(a?.finishedWt) || 0) + (Number(a?.rimfinishedwt) || 0);
//     const weightB = (Number(b?.finishedWt) || 0) + (Number(b?.rimfinishedwt) || 0);
//     return weightA - weightB;
//   });

  const ITEM_TYPE_ORDER = { TYRE:0, ASSEMBLY:1, RIM: 2 };

const sortItemsByPosition = (items) =>
  [...(items || [])].sort((a, b) => {
    const rankA = ITEM_TYPE_ORDER[a?.itemType] ?? 99;
    const rankB = ITEM_TYPE_ORDER[b?.itemType] ?? 99;
    if (rankA !== rankB) return rankA - rankB;

    const typeA = Number(a?.typePosition) || 0;
    const typeB = Number(b?.typePosition) || 0;
    if (typeA !== typeB) return typeA - typeB;

    const weightA = (Number(a?.finishedWt) || 0) + (Number(a?.rimfinishedwt) || 0);
    const weightB = (Number(b?.finishedWt) || 0) + (Number(b?.rimfinishedwt) || 0);
    return weightA - weightB;
  });


// ✅ FIXED: `full` now sums to exactly 100. Previously it summed to 106,
// so whenever EDC was shown the whole row overflowed and the renderer
// squeezed CUSTOMER PART# / SUN PART# / PO# to make it fit. The "removed"
// redistribution also compounded the error in the EDC-hidden case (114%).
// Every combination below now sums to exactly 100.
const getColWidths = (showEdc, showItemCode, showPONumber) => {
  const full = {
    srNo: 4, product: 8, sunPart: 5, po: 12,
    description: 23, edc: 8, qty: 6, unitWt: 9, totalWt: 9,
    unitPrice: 8, totalPrice: 8,
  };

  let removed = 0;
  const widths = { ...full };
  if (!showItemCode) { removed += full.product; widths.product = 0; }
  if (!showPONumber) { removed += full.po;       widths.po = 0; }
  if (!showEdc)       { removed += full.edc;      widths.edc = 0; }

  // Redistribute freed space into description + sunPart
  ["description", "sunPart"].forEach((col) => { widths[col] += removed / 2; });

  return Object.fromEntries(Object.entries(widths).map(([k, v]) => [k, `${v}%`]));
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page:           { padding: 10, backgroundColor: "#fff", flexDirection: "column" },
  container:      { flex: 1, borderWidth: 1, borderColor: "#000", flexDirection: "column" },
  text:           { fontSize: 6, color: "#000", fontWeight: "bold", fontFamily: "Roboto" },
  tableHeaderRow: { flexDirection: "row", borderBottomWidth: 0.5, borderTopWidth: 0.5, borderColor: "black", backgroundColor: "#f1f5f9", height: 18, alignItems: "center" },
  headerCell:     { justifyContent: "center", alignItems: "center", borderRightWidth: 0.5, borderColor: "#000", paddingHorizontal: 2, height: "100%" },
  headerText:     { fontSize: 5, fontWeight: "bold", textAlign: "center" },
  bodyRow:        { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#000", minHeight: ITEM_ROW_HEIGHT, alignItems: "stretch" },
  bodyCell:       { justifyContent: "center", borderRightWidth: 0.5, borderColor: "#000", paddingHorizontal: 2, paddingVertical: 2 },
  bodyText:       { fontSize: 6, textAlign: "left", fontWeight: "bold", flexWrap: "wrap" },
  summaryRow:     { flexDirection: "row", height: 14, borderColor: "#000" },
  grandTotalRow:  { flexDirection: "row", height: GRAND_TOTAL_ROW_HEIGHT, borderBottomWidth: 0.5, borderColor: "#000", backgroundColor: "#f1f5f9" },
  pageNumber:     { position: "absolute", bottom: 5, right: 14, fontSize: 6, color: "#000" },
});

// ── Header ────────────────────────────────────────────────────────────────────
const HeaderSection = ({ data }) => (
  <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 0.5, borderColor: "black", height: 35, paddingHorizontal: 10 }}>
    <View style={{ width: "20%", justifyContent: "center" }}>
     {LOGO ? (
        <Image src={LOGO} style={{ width: 100, height: 35 }} />
      ) : null}
    </View>
    <View style={{ width: "60%", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 8, fontWeight: "bold", textTransform: "uppercase" }}>CUSTOMER INVOICE</Text>
    </View>
    <View style={{ width: "20%" }} />
  </View>
);

// ── Address ───────────────────────────────────────────────────────────────────
const AddressSection = ({ data }) => (
  <View style={{ flexDirection: "row", height: 170 }}>
    {/* LEFT */}
    <View style={{ width: "40%", borderRightWidth: 0.5, borderColor: "black" }}>
      {/* Exporter */}
      <View style={{ borderBottomWidth: 0.5, borderColor: "black", height: 77, padding: 2 }}>
        <Text style={{ ...styles.bodyText, fontWeight: "bold" }}>EXPORTER :</Text>
        {s(data?.exportAuthorisedAddress).toUpperCase().split("~").map((line, i) => (
          <Text key={i} style={{ fontSize: 6 }}>{line.trim()}</Text>
        ))}
      </View>
      {/* Buyer */}
      <View style={{ borderBottomWidth: 0.5, borderColor: "black", height: 56, padding: 2, gap: 1 }}>
        <Text style={styles.bodyText}>BUYER / CONSIGNEE</Text>
        <Text style={{ fontWeight: "bold", fontSize: 6 }}>{s(data?.billingCompanyName)}</Text>
        <Text style={styles.text}>{s(data?.billingAddress)}</Text>
        <Text style={styles.text}>
          {[data?.billingCity, data?.billingState, data?.billingCountry, data?.billingZipcode].filter(Boolean).join(", ")}
        </Text>
        <Text style={{ fontWeight: "bold", fontSize: 6 }}>{s(data?.billingContactName)}</Text>
        <Text style={styles.text}>
          {[data?.billingEmailId, data?.billingMobile].filter(Boolean).join(", ")}
        </Text>
      </View>
      {/* Carrier */}
      <View style={{ padding: 2, gap: 1, justifyContent: "space-evenly", flex: 1 }}>
        <Text style={styles.bodyText}>CARRIER: <Text style={styles.text}>{s(data?.preCarriageBy)}</Text></Text>
        <Text style={styles.bodyText}>PACKING METHOD: <Text style={styles.text}>{s(data?.packingMethod)}</Text></Text>
        <Text style={styles.bodyText}>CONTAINER / CARGO TYPE: <Text style={styles.text}>{s(data?.containerType)}</Text></Text>
        <Text style={styles.bodyText}>LEAD TIME: <Text style={styles.text}>{s(data?.leadTime)}</Text></Text>
      </View>
    </View>

    {/* RIGHT */}
    <View style={{ width: "60%" }}>
      {/* Order ref */}
      <View style={{ borderBottomWidth: 0.5, borderColor: "black", height: 22, padding: 2, gap: 1 }}>
        <Text style={styles.bodyText}>Buyers Order No: <Text style={styles.text}>{s(data?.BuyersOrderNumber)}</Text></Text>
        <Text style={styles.bodyText}>Order Date: <Text style={styles.text}>{s(formatDateTime(data?.Date))}</Text></Text>
      </View>
      {/* Rev */}
      <View style={{ borderBottomWidth: 0.5, borderColor: "black", height: 20, padding: 1, justifyContent: "space-between" }}>
        {data?.revisionNumber ? (
          <Text style={styles.bodyText}>
            Rev no: <Text style={styles.text}>{s(data.revisionNumber)}</Text>{" "}
            Rev Date: <Text style={styles.text}>{s(formatDateTime(data.revisionDate))}</Text>
          </Text>
        ) : null}
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.bodyText}>Other Reference(s): </Text>
          <Text style={styles.text}>{data?.EmailDate ? `EMAIL REF :${data.EmailDate}` : ""}</Text>
        </View>
      </View>
      {/* Ship + Notify */}
      <View style={{ flexDirection: "row", borderBottomWidth: 0.5, borderColor: "black", height: 59 }}>
        <View style={{ flex: 1, padding: 2, gap: 2 }}>
          <Text style={[styles.bodyText, { fontWeight: "bold" }]}>Buyer If Other Than Consignee (Delivery address):</Text>
          <Text style={{ fontWeight: "bold", fontSize: 6 }}>{s(data?.shippingCompanyName)}</Text>
          <Text style={styles.text}>{s(data?.shippingAddress)}</Text>
          <Text style={styles.text}>
            {[data?.shippingCity, data?.shippingState, data?.shippingCountry, data?.shippingZipcode].filter(Boolean).join(", ")}
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 6 }}>{s(data?.shippingContactName)}</Text>
          <Text style={styles.text}>
            {[data?.shippingEmailId, data?.shippingMobile].filter(Boolean).join(", ")}
          </Text>
        </View>
        {data?.notifyPartyName ? (
          <View style={{ flex: 1, borderLeftWidth: 0.5, borderColor: "black", padding: 2, gap: 2 }}>
            <Text style={[styles.bodyText, { fontWeight: "bold" }]}>Notify Party:</Text>
            <Text style={styles.text}>{s(data.notifyPartyName)}</Text>
            <Text style={styles.text}>{s(data.notifyPartyAddress)}</Text>
            <Text style={styles.text}>
              {[data.notifyPartyCity, data.notifyPartyState, data.notifyPartyZipcode].filter(Boolean).join(", ")}
            </Text>
            <Text style={styles.text}>{s(data.notifyPartyCountry)}</Text>
            <Text style={styles.text}>
              {[data.notifyPartyEmail, data.notifyPartyPhone].filter(Boolean).join(", ")}
            </Text>
          </View>
        ) : null}
      </View>
      {/* Payment terms */}
      <View style={{ padding: 2, gap: 1, justifyContent: "space-between", flex: 1 }}>
        <View>
          <Text style={styles.bodyText}>TERMS OF DELIVERY & PAYMENT:</Text>
          <Text style={styles.text}>
            {`THE PRICES ARE ${s(data?.incoterm)} - ${s(data?.placeOfIncoterm).toUpperCase()} ${s(data?.preCarriageBy)}, IN ${s(data?.userCurrency).toUpperCase()}`}
          </Text>
        </View>
        <Text style={[styles.bodyText, { fontWeight: "bold" }]}>
          PAYMENT TERMS: <Text style={styles.text}>{s(data?.paymentTerms)}</Text>
        </Text>
        <Text style={{ ...styles.bodyText, fontWeight: "bold" }}>
          BANK DETAILS: <Text style={styles.text}>{s(data?.bankDetails).toUpperCase().split("~").join(" | ")}</Text>
        </Text>
      </View>
    </View>
  </View>
);

// ── Table Header ──────────────────────────────────────────────────────────────
const TableHeader = ({ data, showEdc, showItemCode, showPONumber }) => {
  const w = getColWidths(showEdc, showItemCode, showPONumber);
  const currency = s(data?.userCurrency) || "USD";
  const columns = [
    { label: "SR NO",                    width: w.srNo },
    ...(showItemCode ? [{ label: "CUSTOMER PART #", width: w.product }] : []),
    { label: "SUN PART #",               width: w.sunPart },
    ...(showPONumber ? [{ label: "PO #", width: w.po }] : []),
    { label: "ITEM DESCRIPTION",         width: w.description },
    ...(showEdc ? [{ label: "EDC",       width: w.edc }] : []),
    { label: "QTY",                      width: w.qty },
    { label: "UNIT WT\nKGS",             width: w.unitWt },
    { label: "TOTAL WT\nKGS",            width: w.totalWt },
    { label: `UNIT PRICE\n${currency}`,  width: w.unitPrice },
    { label: `TOTAL PRICE\n${currency}`, width: w.totalPrice, last: true },
  ];
  return (
    <View style={styles.tableHeaderRow}>
      {columns.map(({ label, width, last }, i) => (
        <View key={i} style={[styles.headerCell, { width }, last ? { borderRightWidth: 0 } : {}]}>
          {label.split("\n").map((l, j) => (
            <Text key={j} style={styles.headerText}>{l}</Text>
          ))}
        </View>
      ))}
    </View>
  );
};

// ── Table Rows ────────────────────────────────────────────────────────────────
const TableRows = ({ items, showEdc, showItemCode, showPONumber, startIndex = 0 }) => {
  console.log("items",items);
  
  const w = getColWidths(showEdc, showItemCode, showPONumber);
  return (
    <>
      {(items || []).map((item, index) => {
        const unitWt  = (Number(item?.finishedWt || 0) + Number(item?.rimfinishedwt || 0));
        const totalWt = unitWt * Number(item?.itemQty || 0);
        const unitPx  = (Number(item?.basicPrice || 0) + Number(item?.rimUnitPrice || 0));
        const totalPx = unitPx * Number(item?.itemQty || 0);

        // ✅ Description — format correctly for TYRE, RIM, or fallback to manual description
        // ✅ Description — itemType determines how we resolve descText.
// Source `description` is trusted first; reconstruction only fires if it's empty.
let descText = s(item?.description).trim();

if (!descText) {
  if (item?.itemType === "RIM") {
    const rimDetails = s(item?.tyreRim);
    descText = item?.edcNo
      ? `${item.edcNo}${rimDetails ? ` / ${rimDetails}` : ""}`
      : rimDetails;
  } else if (item?.itemType === "TYRE" || item?.itemType === "ASSEMBLY") {
    descText = item?.category === "SPLIT RIMS"
      ? "SPLIT RIMS"
      : `${s(item?.tyreSize)} / ${item?.tyreRim === "-" ? "0.00" : s(item?.tyreRim)} / ${s(item?.brand)} / ${s(item?.sidewall)} / ${s(item?.tyreType)} ${item?.assyRimstatus ? s(item?.edcNo) : ""} ${item?.color ? `${s(item.color)} ${s(item.des)}` : ""}`.trim();
  } else {
    descText = s(item?.tyreSize) || s(item?.brand) || "";
  }
}

const showExtraDetails = ["TYRE", "ASSEMBLY"].includes(
  item?.itemType?.toUpperCase()
);

const description = showExtraDetails
  ? [
      descText,
      item?.des,
      item?.color,
    ]
      .filter(Boolean)
      .join(" | ")
  : descText;

        return (
          <View key={index} style={styles.bodyRow}>
            <View style={[styles.bodyCell, { width: w.srNo }]}>
              <Text style={styles.bodyText}>{n(startIndex + index + 1)}</Text>
            </View>
            {showItemCode && (
              <View style={[styles.bodyCell, { width: w.product }]}>
                <Text style={styles.bodyText}>{s(item.partNumber)}</Text>
              </View>
            )}
            <View style={[styles.bodyCell, { width: w.sunPart }]}>
              <Text style={styles.bodyText}>{s(item.itemCode)}</Text>
            </View>
            {showPONumber && (
              <View style={[styles.bodyCell, { width: w.po }]}>
                <Text style={styles.bodyText}>{s(item.PONumber)}</Text>
              </View>
            )}
            <View style={[styles.bodyCell, { width: w.description }]}>
  <Text style={styles.bodyText}>{description}</Text>
</View>
            {showEdc && (
              <View style={[styles.bodyCell, { width: w.edc }]}>
                <Text style={[styles.bodyText, { textAlign: "right" }]}>{s(item.edcNo)}</Text>
              </View>
            )}
            <View style={[styles.bodyCell, { width: w.qty }]}>
              <Text style={[styles.bodyText, { textAlign: "right" }]}>{n(item.itemQty)}</Text>
            </View>
            <View style={[styles.bodyCell, { width: w.unitWt }]}>
              <Text style={[styles.bodyText, { textAlign: "right" }]}>{sf(unitWt, 3)}</Text>
            </View>
            <View style={[styles.bodyCell, { width: w.totalWt }]}>
              <Text style={[styles.bodyText, { textAlign: "right" }]}>{sf(totalWt, 3)}</Text>
            </View>
            <View style={[styles.bodyCell, { width: w.unitPrice }]}>
              <Text style={[styles.bodyText, { textAlign: "right" }]}>{sf(unitPx, 2)}</Text>
            </View>
            <View style={[styles.bodyCell, { width: w.totalPrice, borderRightWidth: 0 }]}>
              <Text style={[styles.bodyText, { textAlign: "right" }]}>{sf(totalPx, 2)}</Text>
            </View>
          </View>
        );
      })}
    </>
  );
};

// ── Summary ───────────────────────────────────────────────────────────────────
const getTaxSummaryRows = (data, totalTax, fallbackPercent) => {
  const explicitRows = Array.isArray(data?.taxSummary?.rows) ? data.taxSummary.rows : [];
  if (explicitRows.length > 0) {
    return explicitRows
      .filter((row) => Number(row?.amount) > 0)
      .map((row) => ({
        label: s(row?.label).toUpperCase(),
        amount: Number(row?.amount) || 0,
      }));
  }

  const taxes = Array.isArray(data?.taxes) ? data.taxes.filter((tax) => Number(tax?.amount) > 0) : [];
  if (taxes.length > 0) {
    const hasSplitGst =
      taxes.length === 2 &&
      taxes.some((tax) => s(tax?.taxName).toUpperCase() === "CGST") &&
      taxes.some((tax) => s(tax?.taxName).toUpperCase() === "SGST");

    if (hasSplitGst) {
      const cgst = taxes.find((tax) => s(tax?.taxName).toUpperCase() === "CGST");
      const sgst = taxes.find((tax) => s(tax?.taxName).toUpperCase() === "SGST");
      return [{
        label: `CGST + SGST (${n(cgst?.rate)}% + ${n(sgst?.rate)}%)`,
        amount: (Number(cgst?.amount) || 0) + (Number(sgst?.amount) || 0),
      }];
    }

    return taxes.map((tax) => ({
      label: `${s(tax?.taxName || "TAX").toUpperCase()} (${n(tax?.rate)}%)`,
      amount: Number(tax?.amount) || 0,
    }));
  }

  return fallbackPercent > 0
    ? [{ label: `TAX (${fallbackPercent}%)`, amount: Number(totalTax) || 0 }]
    : [];
};

const SummaryRows = ({ data, subTotal, grandTotalDDP = 0, totalTax = 0, fallbackTaxPercent = 0 }) => {
  const otherCharges = data?.additionalCharges?.[0]?.rows || [];
  const discounts    = data?.discountDetails?.[0]?.rows   || [];
  const taxSummaryRows = getTaxSummaryRows(data, totalTax, fallbackTaxPercent);

  const amountInWords = s(
  typeof numberToWords === "function"
    ? numberToWords(grandTotalDDP, s(data?.userCurrency))
    : ""
);

  const totalQty = (data?.items || []).reduce((acc, it) => acc + Number(it.itemQty || 0), 0);
  const totalWgt = (data?.items || []).reduce(
    (acc, it) => acc + (Number(it.finishedWt || 0) + Number(it.rimfinishedwt || 0)) * Number(it.itemQty || 0), 0
  );

  const showEdc      = data?.items?.some((i) => i?.assyRimstatus);
  const showItemCode = data?.items?.some((i) => i?.partNumber);
  const showPONumber = data?.items?.some((i) => i?.PONumber);
  const w = getColWidths(showEdc, showItemCode, showPONumber);

  const summaryLabelWidth =
    parseFloat(w.srNo) + parseFloat(w.product || 0) + parseFloat(w.sunPart) +
    parseFloat(w.po || 0) + parseFloat(w.description) + parseFloat(w.edc || 0);

  const BlankCells = ({ withTopBorder = false }) => (
    <>
      {[w.unitWt, w.totalWt, w.unitPrice].map((width, i) => (
        <View key={i} style={{ width, borderRightWidth: 0.5, borderColor: "#000", ...(withTopBorder ? { borderTopWidth: 0.5 } : {}) }} />
      ))}
    </>
  );

  const labelStyle = (extra = {}) => ({ width: `${summaryLabelWidth}%`, borderRightWidth: 0.5, borderColor: "#000", justifyContent: "center", alignItems: "flex-end", paddingRight: 6, ...extra });
  const qtyStyle   = (extra = {}) => ({ width: w.qty, borderRightWidth: 0.5, borderColor: "#000", justifyContent: "center", alignItems: "center", ...extra });
  const valueStyle = (extra = {}) => ({ width: w.totalPrice, justifyContent: "center", alignItems: "flex-end", paddingRight: 2, ...extra });

  return (
    <View wrap={false}>
      {/* Sub Total */}
      <View style={styles.summaryRow}>
        <View style={labelStyle()}><Text style={{ fontSize: 7, fontWeight: "bold" }}>SUB TOTAL</Text></View>
        <View style={qtyStyle()}><Text style={{ fontSize: 7, fontWeight: "bold" }}>{n(totalQty)}</Text></View>
        <BlankCells />
        <View style={valueStyle()}><Text style={{ fontSize: 7, fontWeight: "bold" }}>{sf(subTotal)}</Text></View>
      </View>

      {/* Discounts */}
      {discounts.filter((d) => Number(d?.value) > 0).map((disc, idx) => (
        <View key={`d-${idx}`} style={styles.summaryRow}>
          <View style={labelStyle()}><Text style={{ fontSize: 7, fontWeight: "bold" }}>{s(disc.desc).toUpperCase()}</Text></View>
          <View style={qtyStyle()} />
          <BlankCells />
          <View style={valueStyle()}><Text style={{ fontSize: 7, fontWeight: "bold" }}>{`- ${sf(disc.value)}`}</Text></View>
        </View>
      ))}

      {/* Other Charges */}
      {otherCharges.filter((c) => Number(c?.value) > 0).map((charge, idx) => (
        <View key={`c-${idx}`} style={styles.summaryRow}>
          <View style={labelStyle()}><Text style={{ fontSize: 7, fontWeight: "bold" }}>{s(charge.desc).toUpperCase()}</Text></View>
          <View style={qtyStyle()} />
          <BlankCells />
          <View style={valueStyle()}><Text style={{ fontSize: 7, fontWeight: "bold" }}>{sf(charge.value)}</Text></View>
        </View>
      ))}

      {/* Tax Summary */}
      {taxSummaryRows.map((tax, idx) => (
        <View key={`t-${idx}`} style={styles.summaryRow}>
          <View style={labelStyle()}><Text style={{ fontSize: 7, fontWeight: "bold" }}>{tax.label}</Text></View>
          <View style={qtyStyle()} />
          <BlankCells />
          <View style={valueStyle()}><Text style={{ fontSize: 7, fontWeight: "bold" }}>{sf(tax.amount)}</Text></View>
        </View>
      ))}

      {/* Grand Total */}
      <View style={styles.grandTotalRow}>
        <View style={labelStyle({ borderTopWidth: 0.5 })}>
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>
            {`GRAND TOTAL ${s(data?.userCurrency).toUpperCase()} ${s(data?.incoterm).toUpperCase()} ${s(data?.placeOfIncoterm).toUpperCase()} ${s(data?.preCarriageBy).toUpperCase()}`}
          </Text>
        </View>
        <View style={qtyStyle({ borderTopWidth: 0.5 })}>
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>{n(totalQty)}</Text>
        </View>
        <View style={{ width: w.unitWt, borderRightWidth: 0.5, borderColor: "#000", borderTopWidth: 0.5 }} />
        <View style={{ width: w.totalWt, borderRightWidth: 0.5, borderColor: "#000", borderTopWidth: 0.5, justifyContent: "center", alignItems: "flex-end", paddingRight: 2 }}>
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>{sf(totalWgt, 3)}</Text>
        </View>
        <View style={{ width: w.unitPrice, borderRightWidth: 0.5, borderColor: "#000", borderTopWidth: 0.5 }} />
        <View style={valueStyle({ borderTopWidth: 0.5 })}>
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>{sf(grandTotalDDP)}</Text>
        </View>
      </View>

      {/* Amount in words */}
      <View style={{ padding: 2 }}>
        <Text style={{ fontSize: 7, fontWeight: "bold" }}>{`( ${amountInWords} )`}</Text>
      </View>

      {/* T&C */}
      <View style={{ padding: 2, borderBottomWidth: 0.5, borderColor: "black" }}>
        <Text style={{ fontSize: 7, fontWeight: "bold", textAlign: "center", marginBottom: 3 }}>TERMS & CONDITIONS</Text>
        {(() => {
          const fixedLines = [
            `1. THE ABOVE PRICES ARE ${s(data?.userCurrency).toUpperCase()}, ${s(data?.incoterm).toUpperCase()} ${s(data?.placeOfIncoterm).toUpperCase()} (SHIPMENT ${s(data?.preCarriageBy)})`,
            `2. PAYMENT: ${s(data?.paymentTerms)}`,
          ];
          const dynamicLines = data?.custInstruction
            ? s(data.custInstruction).replace(/~/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean)
            : [];
          const allLines = [...fixedLines, ...dynamicLines];

          if (allLines.length > 4) {
            const mid = Math.ceil(allLines.length / 2);
            return (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  {allLines.slice(0, mid).map((line, i) => <Text key={i} style={{ fontSize: 7, fontWeight: "bold", marginTop: 3 }}>{line}</Text>)}
                </View>
                <View style={{ width: 0.5, backgroundColor: "black", marginHorizontal: 2 }} />
                <View style={{ flex: 1 }}>
                  {allLines.slice(mid).map((line, i) => <Text key={i} style={{ fontSize: 7, fontWeight: "bold", marginTop: 3 }}>{line}</Text>)}
                </View>
              </View>
            );
          }
          return allLines.map((line, i) => <Text key={i} style={{ fontSize: 7, fontWeight: "bold", marginTop: 3 }}>{line}</Text>);
        })()}
      </View>
    </View>
  );
};

// ── Signature ─────────────────────────────────────────────────────────────────
const SignatureBlock = ({ data }) => (
  <View wrap={false} style={{ flexDirection: "row", marginTop: "auto", paddingBottom: 5 }}>
    <View style={{ width: "50%", alignItems: "center" }}>
      <Text style={{ fontSize: 7, fontWeight: "bold" }}>{s(data?.authorisedSignature).toUpperCase()}</Text>
      <Text style={{ marginTop: 50, fontSize: 7, fontWeight: "bold" }}>AUTHORISED SIGNATORY</Text>
    </View>
    <View style={{ width: "50%", alignItems: "center" }}>
      <Text style={{ fontSize: 7, fontWeight: "bold" }}>{`FOR ${s(data?.custFullName)}`}</Text>
      <Text style={{ marginTop: 50, fontSize: 7, fontWeight: "bold" }}>AUTHORISED SIGNATORY</Text>
    </View>
  </View>
);

// ── Main export ───────────────────────────────────────────────────────────────
const ProformaPDF = ({ data }) => {
  const sortedItems  = sortItemsByPosition(data?.items);
  const showEdc      = (data?.items || []).some((item) => item?.assyRimstatus === true);
  const showItemCode = (data?.items || []).some((item) => item?.partNumber);
  const PONumber     = (data?.items || []).some((item) => item?.PONumber);
  const itemChunks   = chunkItemsForPages(sortedItems);
  console.log("pdfdata",itemChunks);

  const subTotal       = (data?.items || []).reduce((acc, it) => acc + (Number(it?.basicPrice || 0) + Number(it?.rimUnitPrice || 0)) * Number(it?.itemQty || 0), 0);
  const totalCharges   = Number(data?.additionalCharges?.[0]?.total || 0);
  const totalDiscounts = Number(data?.discountDetails?.[0]?.total   || 0);
  const taxable        = subTotal + totalCharges - totalDiscounts;
  const gstData        = data?.gstCharges || {};
  const gstType        = gstData.type || "BACKEND";

  let gstPercent = 0;
  if (gstData.percentage && Number(gstData.percentage) > 0) {
    gstPercent = Number(gstData.percentage);
  } else if (gstType === "IGST") {
    gstPercent = Number(gstData.igst || data?.igst || 0);
  } else if (gstType === "CGST_SGST") {
    gstPercent = Number(gstData.cgst || data?.cgst || 0) + Number(gstData.sgst || data?.sgst || 0);
  } else {
    const bi = Number(data?.igst || 0);
    gstPercent = bi > 0 ? bi : Number(data?.cgst || 0) + Number(data?.sgst || 0);
  }

  const fallbackTaxAmount = taxable > 0 ? parseFloat(((taxable * gstPercent) / 100).toFixed(2)) : 0;
  const totalTax = Array.isArray(data?.taxes) && data.taxes.length > 0
    ? (data.taxes || []).reduce((sum, tax) => sum + (Number(tax?.amount) || 0), 0)
    : fallbackTaxAmount;
  const grandTotalDDP = taxable + totalTax;

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
                <TableHeader data={data} showEdc={showEdc} showItemCode={showItemCode} showPONumber={PONumber} />
                <TableRows items={pageItems} showEdc={showEdc} showItemCode={showItemCode} showPONumber={PONumber} startIndex={pageIndex * ITEMS_PER_PAGE} />
              </View>
              {isLastPage && <SummaryRows data={{ ...data, items: sortedItems }} subTotal={subTotal} grandTotalDDP={grandTotalDDP} totalTax={totalTax} fallbackTaxPercent={gstPercent} />}
              {isLastPage && <SignatureBlock data={data} />}
            </View>
           <Text fixed render={({ pageNumber, totalPages }) => `Page ${n(pageNumber)} / ${n(totalPages)}`} style={styles.pageNumber} />
          </Page>
        );
      })}
    </>
  );
};

export default ProformaPDF;