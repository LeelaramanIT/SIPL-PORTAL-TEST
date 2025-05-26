// import React from "react";

import { Link } from "react-router-dom";

import './invoice.css'
const InvoiceBill = () => {

  return (
    <div className="flex justify-center items-center w-full h-[100%]">
      <div className="text-[8px] scroll-auto">
        <p className="TextP" style={{ textIndent: "0pt", textAlign: "left" }}>
          <br />
        </p>
        <table
          style={{ borderCollapse: "collapse", marginLeft: "3pt" }}
          cellSpacing="0"
        >
          <thead>
            <tr style={{ height: "11pt" }}>
              <td
                style={{
                  width: "409pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={7}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    lineHeight: "6pt",
                    textAlign: "center",
                  }}
                >
                  INVOICE CUM PACKING LIST
                </p>
              </td>
            </tr>
          </thead>

          <tbody>
            <tr style={{ height: "32pt" }}>
              <td
                style={{
                  width: "219pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={3}
                rowSpan={3}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    paddingLeft: "1pt",
                    textIndent: "0pt",
                    textAlign: "left",
                  }}
                >
                  EXPORTER:
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "4pt",
                    textIndent: "0pt",
                    paddingLeft: "1pt",
                    textAlign: "left",
                  }}
                >
                  SUNDARAM INDUSTRIES PRIVATE LIMITED
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    paddingRight: "78pt",
                    paddingLeft: "1pt",
                    textIndent: "0pt",
                    lineHeight: "173%",
                    textAlign: "left",
                  }}
                >
                  ( Formerly known as T.S.Rajam Tyres Pvt Limited) ( DIVISION SUN
                  TYRE &amp; WHEEL SYSTEMS)
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    textIndent: "0pt",
                    lineHeight: "6pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  A1-F3/A, Sidco Industrial Estate
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "4pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Maraimalai Nagar - 603 209, Tamil Nadu , India
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingRight: "36pt",
                    textIndent: "0pt",
                    lineHeight: "10pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  IEC CODE NO: AAGCT6465R, GSTIN NO: 33AAGCT6465R2ZJ PAN NO:
                  AAGCT6465R
                </p>
              </td>
              <td
                style={{
                  width: "190pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={4}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    paddingRight: "110pt",
                    textIndent: "0pt",
                    lineHeight: "165%",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Invoice No: 192420378 DATE : 1/21/2025
                </p>
              </td>
            </tr>

            <tr style={{ height: "32pt" }}>
              <td
                style={{
                  width: "190pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={4}
              >
                <p
                  className="s2 TextP"
                  style={{
                    paddingTop: "4pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Buyers Order No Ref:
                </p>
                <p
                  className="s3 TextP"
                  style={{
                    paddingTop: "4pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  REF: SIPL/ADVANCE TIRE PO #7360578/AUG-24
                </p>
                <p
                  className="s4 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    lineHeight: "6pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  E MAIL DATE 29th AUG-24
                </p>
              </td>
            </tr>

            <tr style={{ height: "21pt" }}>
              <td
                style={{
                  width: "190pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={4}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "2pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Other Reference(s)
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    lineHeight: "6pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  SDF Form
                </p>
              </td>
            </tr>

            <tr style={{ height: "42pt" }}>
              <td
                style={{
                  width: "219pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={3}
                rowSpan={4}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  CONSIGNEE:
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "1pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  M/S, ADVANCE TIRES
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "4pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  1000 Rike Dr.
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "4pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Millstone Twp. NJ 08535
                </p>
              </td>
              <td
                style={{
                  width: "190pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={4}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Buyer (if otherthan Consignee)
                </p>
              </td>
            </tr>

            <tr style={{ height: "11pt" }}>
              <td
                style={{
                  width: "84pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={2}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    lineHeight: "5pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Country of Origin of goods
                </p>
              </td>
              <td
                style={{
                  width: "106pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={2}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    lineHeight: "5pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Country of Final Destination
                </p>
              </td>
            </tr>

            <tr style={{ height: "11pt" }}>
              <td
                style={{
                  width: "84pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={2}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    lineHeight: "5pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  INDIA
                </p>
              </td>
              <td
                style={{
                  width: "106pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={2}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    lineHeight: "5pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  USA
                </p>
              </td>
            </tr>

            <tr style={{ height: "21pt" }}>
              <td
                style={{
                  width: "190pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={4}
                rowSpan={4}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  TERMS OF DELIVERY AND PAYMENT:
                </p>
                <p
                  className="s3"
                  style={{
                    paddingTop: "4pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  THE ABOVE PRICES ARE DDP NEW JERSEY, USD BY SEA.
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "4pt",
                    paddingRight: "11pt",
                    textIndent: "0pt",
                    lineHeight: "165%",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  100% Payment in 90 days from the date of Bill of Lading Remitted
                  in SUNDARAM INDUSTRIES PVT LIMITED
                </p>
              </td>
            </tr>

            <tr style={{ height: "21pt" }}>
              <td
                style={{
                  width: "122pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={2}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingRight: "71pt",
                    textIndent: "0pt",
                    lineHeight: "10pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Pre Carriage by BY SEA
                </p>
              </td>
              <td
                style={{
                  width: "97pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingRight: "11pt",
                    textIndent: "0pt",
                    lineHeight: "10pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Place of Receipt by Pre-carrier CHENNAI-INDIA
                </p>
              </td>
            </tr>

            <tr style={{ height: "21pt" }}>
              <td
                style={{
                  width: "122pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={2}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Vessel/Flight No
                </p>
              </td>
              <td
                style={{
                  width: "97pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingRight: "52pt",
                    textIndent: "0pt",
                    lineHeight: "10pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Port of Loading CHENNAI-INDIA
                </p>
              </td>
            </tr>

            <tr style={{ height: "21pt" }}>
              <td
                style={{
                  width: "122pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan={2}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingRight: "44pt",
                    textIndent: "0pt",
                    lineHeight: "10pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}

                >
                  Port of Discharge NEWYORK
                </p>
              </td>
              <td
                style={{
                  width: "97pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "2pt",
                  }}
                >
                  Final Destination
                </p>
                <p
                  className="s5 TextP"
                  style={{
                    paddingTop: "4pt",
                    paddingBottom: "1pt",
                    textIndent: "0pt",
                    lineHeight: "5pt",
                    textAlign: "left",
                    paddingLeft: "2pt",
                  }}
                >
                  MILLSTONE TWP, NJ- USA
                </p>
              </td>
            </tr>

            <tr style={{ height: "21pt" }}>
              <td
                style={{
                  width: "47pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s5"
                  style={{
                    paddingRight: "12pt",
                    textIndent: "0pt",
                    lineHeight: "10pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Marks & Nos/ Container No
                </p>
              </td>
              <td
                style={{
                  width: "47pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s5"
                  style={{
                    textIndent: "0pt",
                    lineHeight: "10pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  No & Kind of Packing
                </p>
              </td>
              <td
                style={{
                  width: "162pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan="2"
              >
                <p
                  className="s5"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    textAlign: "center",
                    paddingLeft: "1pt",
                  }}
                >
                  Description of goods
                </p>
              </td>
              <td
                style={{
                  width: "47pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s5"
                  style={{
                    paddingLeft: "17pt",
                    textIndent: "-8pt",
                    lineHeight: "10pt",
                    textAlign: "left",
                  }}
                >
                  QUANITITY KGS
                </p>
              </td>
              <td
                style={{
                  width: "38pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s5"
                  style={{
                    paddingLeft: "6pt",
                    paddingRight: "1pt",
                    textIndent: "-4pt",
                    lineHeight: "10pt",
                    textAlign: "left",
                  }}
                >
                  UNIT PRICES DDP USD
                </p>
              </td>
              <td
                style={{
                  width: "68pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s5"
                  style={{
                    paddingLeft: "21pt",
                    paddingRight: "5pt",
                    textIndent: "-7pt",
                    lineHeight: "10pt",
                    textAlign: "center",
                  }}
                >
                  TOTAL PRICES DDP USD
                </p>
              </td>
            </tr>

            <tr style={{ height: "138pt" }}>
              <td
                style={{
                  width: "47pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    paddingRight: "4pt",
                    textIndent: "0pt",
                    lineHeight: "165%",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Container Size 1 x 20'
                </p>
                <p
                  style={{
                    paddingTop: "4pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  <br />
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingRight: "4pt",
                    textIndent: "0pt",
                    lineHeight: "165%",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Container No: TEMU309862-1
                </p>
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingRight: "4pt",
                    textIndent: "0pt",
                    lineHeight: "194%",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Liner Seal No OOLKHF7308
                </p>
                <p
                  style={{
                    paddingTop: "1pt",
                    textIndent: "0pt",
                    textAlign: "left",
                  }}
                >
                  <br />
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingRight: "4pt",
                    textIndent: "0pt",
                    lineHeight: "165%",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  OTS NO: iTEK03254133
                </p>
              </td>
              <td
                style={{
                  width: "47pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  I.T.C.(H.S) NO.
                </p>
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
                <p className="s1 TextP" style={{ textIndent: "0pt", textAlign: "left", paddingLeft: "1pt", }}>
                  4012 90 20
                </p>
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    textIndent: "0pt",
                    lineHeight: "165%",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  128 LOOSE TYRES
                </p>
              </td>
              <td
                style={{
                  width: "162pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan="2"
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingRight: "53pt",
                    textIndent: "0pt",
                    lineHeight: "165%",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  Automobile tyres reinforced with Nylon tyre Cord warp sheet /
                  Rayon Tyre cord warp sheet.
                </p>
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingRight: "70pt",
                    textIndent: "1pt",
                    lineHeight: "165%",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  SOLID INDUSTRIAL TYRES LESS DISCOUNT 3%
                </p>
              </td>
              <td
                style={{
                  width: "47pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingLeft: "10pt",
                    textIndent: "0pt",
                    textAlign: "left",
                  }}
                >
                  15496.800
                </p>
              </td>
              <td
                style={{
                  width: "38pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingLeft: "8pt",
                    textIndent: "0pt",
                    textAlign: "left",
                  }}
                >
                  2.64525
                </p>
              </td>
              <td
                style={{
                  width: "68pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
                <p
                  className="s1 TextP"
                  style={{ textIndent: "0pt", textAlign: "center" }}
                >
                  40992.84
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "2pt",
                    textIndent: "0pt",
                    textAlign: "center",
                  }}
                >
                  1229.79
                </p>
              </td>
            </tr>

            <tr style={{ height: "11pt" }}>
              <td
                style={{
                  width: "47pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
              </td>
              <td
                style={{
                  width: "47pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
              </td>
              <td
                style={{
                  width: "125pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
              </td>
              <td
                style={{
                  width: "37pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    paddingLeft: "15pt",
                    textIndent: "0pt",
                    lineHeight: "5pt",
                    textAlign: "left",
                  }}
                >
                  TOTAL
                </p>
              </td>
              <td
                style={{
                  width: "47pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    paddingLeft: "9pt",
                    textIndent: "0pt",
                    lineHeight: "5pt",
                    textAlign: "left",
                  }}
                >
                  15496.800
                </p>
              </td>
              <td
                style={{
                  width: "38pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
              </td>
              <td
                style={{
                  width: "68pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "1pt",
                    paddingLeft: "21pt",
                    textIndent: "0pt",
                    textAlign: "left",
                  }}
                >
                  39763.05
                </p>
              </td>
            </tr>

            <tr style={{ height: "115pt" }}>
              <td
                style={{
                  width: "409pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan="7"
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  (USD THIRTY NINE THOUSAND SEVEN HUNDRED SIXTY THREE AND CENTS FIVE
                  ONLY)
                </p>
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingRight: "318pt",
                    textIndent: "0pt",
                    lineHeight: "165%",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  GROSS WT: 15496.800 KGS NETT WT : 15496.800 KGS
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingLeft: "183pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    
                  }}
                >
                  DECLARATION
                </p>
                <p
                  className="s2"
                  style={{
                    paddingTop: "5pt",
                    textIndent: "0pt",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  WE DECLARE THAT THIS INVOICE CUM PACKING LIST SHOWS THE ACTUAL
                  PRICE OF GOODS DESCRIBED AND ALL THE PARTICULARS ARE TRUE AND
                  CORRECT.
                </p>
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "4pt",
                    paddingRight: "205pt",
                    textIndent: "1pt",
                    lineHeight: "165%",
                    textAlign: "left",
                    paddingLeft: "1pt",
                  }}
                >
                  The above shipment is under Advance Licence & EPCG Scheme. Advance
                  Licence No. 0411007094 dt. 14.03.2024 &
                </p>
                <p className="s1 TextP" style={{ textIndent: "0pt", textAlign: "left",paddingLeft:"1pt", }}>
                  EPCG SCHEME NO: 0431006716 Date 12/01/2024
                </p>
                <p style={{ textIndent: "0pt", textAlign: "left" }}>
                  <br />
                </p>
                <p
                  className="text-[#ff0000]"
                  style={{
                    textIndent: "0pt",
                    lineHeight: "5pt",
                    textAlign: "left",
                    paddingLeft:"1pt",
                    paddingBottom:"25pt",
                    // color:"red"
                  }}
                >
                  IGST-Letter Of Undertaking (ARN)AD3302240385774 valid till
                  31.03.2025
                </p>
              </td>
            </tr>

            <tr style={{ height: "32pt" }}>
              <td
                style={{
                  width: "409pt",
                  borderTopStyle: "solid",
                  borderTopWidth: "1pt",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1pt",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1pt",
                  borderRightStyle: "solid",
                  borderRightWidth: "1pt",
                }}
                colSpan="7"
              >
                <p
                  className="s1 TextP"
                  style={{
                    paddingTop: "3pt",
                    // paddingLeft: "112pt",
                    // paddingRight: "55pt",
                    // textIndent: "-47pt",
                    // lineHeight: "165%",
                    textAlign: "center",
                  }}
                >
                  SUNDARAM INDUSTRIES PRIVATE LIMITED (Formerly Known as T.S.Rajam
                  Tyres Private Limited) Regd Office: 'NO. 10 <br/>Jawahar road
                  Chokkikulam, Madurai - 625002.
                </p>
                <p
                  className="s5 TextP"
                  style={{
                    textIndent: "0pt",
                    lineHeight: "5pt",
                    textAlign: "left",
                  }}
                >
                  <Link href="mailto:crm@sun-tws.com" className="s7" target="_blank">
                    CIN:U51901TN2018PTC121156 Email:{" "}
                  </Link>
                  <Link href="http://www.sun-tws.com/" className="s7" target="_blank">
                    crm@sun-tws.com , Website:{" "}
                  </Link>
                  www.sun-tws.com , Tel: 044 - 43857129
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceBill;
