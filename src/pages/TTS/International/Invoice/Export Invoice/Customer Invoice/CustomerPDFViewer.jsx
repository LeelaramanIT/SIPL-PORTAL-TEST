import { Document, PDFViewer } from '@react-pdf/renderer';
import InvoiceCustomerPDF from './InvoiceCustomerPDF';
import { useSelector } from 'react-redux';
import InvoiceCustomerPacking from './InvoiceCustomerPacking';
import { pdf } from "@react-pdf/renderer";
import { useDispatch } from "react-redux";
import { useEffect } from 'react';
import { setPdfBlob } from '../../../../../../Redux/Slices/InvoiceSlice';
import { IoChevronBackCircleOutline } from 'react-icons/io5';
import { Button } from 'antd';




const InvoicePDF = () => {
  const finalCustomerData = useSelector(
    (state) => state.invoice.exportInvoices.finalCustomerData
  );
  const dispatch = useDispatch();

  if (!finalCustomerData) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    if (!finalCustomerData) return;

    const generateBlob = async () => {
      const blob = await pdf(
        <Document>
          <InvoiceCustomerPDF data={finalCustomerData} />
          <InvoiceCustomerPacking data={finalCustomerData} />
        </Document>
      ).toBlob();

      dispatch(setPdfBlob(blob));
      console.log("✅ Customer PDF Blob generated:", blob.size);
    };
    generateBlob();
  }, [finalCustomerData, dispatch]);

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <div className="w-full h-12 bg-[var(--background)] rounded-lg flex justify-evenly items-center">
        <Button
          icon={<IoChevronBackCircleOutline />}
          type="button"
          onClick={() => {
            navigate("/TTS/International/Invoice/CustomerInvoice/Prepare");
          }}
          text={"Back"}
          className={"text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"}
        />
        <h1 className="font-bold">{finalCustomerData?.custfullname || "Default"} - Customer Invoice PDF</h1>
      </div>
      <PDFViewer style={{ width: '100%', height: '90vh', border: 'none', overflow: 'hidden' }}>
        <Document title="Invoice with Border">
          <InvoiceCustomerPDF data={finalCustomerData} />
          <InvoiceCustomerPacking data={finalCustomerData} />
        </Document>
      </PDFViewer>
    </div>
  );
};

export default InvoicePDF;
