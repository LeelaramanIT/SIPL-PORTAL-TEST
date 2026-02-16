import { Document, StyleSheet, PDFViewer, pdf } from "@react-pdf/renderer";
import Button from "../../../../../components/InputFields/Button";
import { useNavigate } from "react-router-dom";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import formatCustomDate from "../../../../../utils/DateFormat";
import InvoicePDF from "./InvoiceExportPDF";
import { useEffect, useState } from "react";
import { setPdfBlob, SetupdatedInvoiceDetails } from "../../../../../Redux/Slices/InvoiceSlice";
import { numberToWords } from "../../../../../utils/NumberToWords";
Font.register({
  family: "Arial",
  src: "/fonts/Arial.ttf", // path to your font
});

const BORDER_THIN = "0.5px solid black";
const BORDER_BOLD = "1.5px solid black";
import { Font } from "@react-pdf/renderer";
import LankaCustomPDF from "./SRILANKA_INVOICE/LankaCustomPDF";
import LamkaCustomPackingPDF from "./SRILANKA_INVOICE/LamkaCustomPackingPDF";

Font.register({
  family: "Roboto",
  src: "/fonts/Roboto-Regular.ttf"
});
Font.register({
  family: "Noto Sans",
  src: "/fonts/Roboto-Regular.ttf"
});

// Styles
export const styles = StyleSheet.create({
  textValue: {
    fontFamily: "Noto Sans", // force Arial instead of default
    fontSize: 6,
    paddingHorizontal: "3px",
    paddingVertical: "1px",
    fontWeight: "bold",
  },
  //   row4_1heading: {
  //   width: "35%",
  //   borderRightWidth: 0.7,
  //   borderRightColor: "#000",
  //   paddingRight: 4,
  //   justifyContent: "center",
  // },

  // row4_1value: {
  //   width: "65%",
  //   paddingLeft: 6,
  // },
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
    textAlign: "center", // ✅ center text
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
    justifyContent: 'space-evenly'
  },

  // row3 left side 2 row 2
  row3left2row2: {
    width: "50%",
    height: "100%",
    borderLeft: BORDER_THIN,
    justifyContent: "space-evenly",
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
    justifyContent: "space-evenly",
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
    whiteSpace: 'nowrap'
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
    flexWrap: 'nowrap'
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

// Viewer component
const ExportInvoiceBillPDF = () => {
  const navigate = useNavigate();
  const {
    additionalForm,
    FinalInvoicePDFData,
    updatedInvoiceDetails,
  } = useSelector((state) => state.invoice.exportInvoices);

  const dispatch = useDispatch();
  // console.log(FinalInvoicePDFData);


  useEffect(() => {
    if (!FinalInvoicePDFData) {
      navigate("/TTS/International/Invoice/ExportInvoice");
    }
  }, [FinalInvoicePDFData]);


  useEffect(() => {
    if (!FinalInvoicePDFData || FinalInvoicePDFData.length === 0) return;

    const generatePDF = async () => {
  try {
    const blob = await pdf(
      <Document>
        {FinalInvoicePDFData.map((invoice, idx) =>
          invoice.containerLoadFrom === "SITL" ||
          invoice.containerLoadFrom === "SLTL" ? (
            <LankaCustomPDF key={idx} data={invoice} styles={styles} />
          ) : (
            <InvoicePDF key={idx} data={invoice} styles={styles} />
          )
        )}
      </Document>
    ).toBlob();

    dispatch(setPdfBlob(blob));
  } catch (err) {
    console.error("❌ PDF generation failed", err);
  }
};


    generatePDF();
  }, [FinalInvoicePDFData, dispatch]);

  return (
    <div className="w-full p-1 bg-[var(--background)]">
      <div className="w-full h-12 bg-[var(--background)] rounded-lg flex justify-evenly items-center">
        <Button
          icon={<IoChevronBackCircleOutline />}
          type="button"
          onClick={() => {
            navigate("/TTS/International/Invoice/CustomInvoice/Prepare");
          }}
          text={"Back"}
          className={""}
        />
        <h1 className="font-bold">{FinalInvoicePDFData?.[0]?.consignee?.name || "Default"} - Custom Invoice PDF</h1>
      </div>
      <PDFViewer style={styles.pdf}>
        <Document
          title={`Invoice_RefNo_${FinalInvoicePDFData[0]?.orderRefNo || "Default"}`}
          author="siplsuntws"
          subject="Customs Export Invoice PDF"
          creator="Your React App"
          producer="React PDF Generator"
        >
          {FinalInvoicePDFData?.map((invoice, index) => (
            invoice.containerLoadFrom === "SITL" ||
              invoice.containerLoadFrom === "SLTL" ? (
              <>
              <LankaCustomPDF key={index} data={invoice} styles={styles} />
              <LamkaCustomPackingPDF key={index} data={invoice} styles={styles} />
              </>
            ) : (
              <InvoicePDF key={index} data={invoice} styles={styles} />
            )
          ))}
        </Document>
      </PDFViewer>
    </div>
  );
};

export default ExportInvoiceBillPDF;
