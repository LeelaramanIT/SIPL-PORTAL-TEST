import { Document, PDFViewer } from '@react-pdf/renderer';
import InvoiceCustomerPDF from './InvoiceCustomerPDF';
import { useSelector } from 'react-redux';
import InvoiceCustomerPacking from './InvoiceCustomerPacking';
import { pdf } from "@react-pdf/renderer";
import { useDispatch } from "react-redux";
import { useEffect } from 'react';
import { setPdfBlob } from '../../../../../../Redux/Slices/InvoiceSlice';




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
      <PDFViewer style={{ width: '100%', height: '90vh', border: 'none', overflow: 'hidden'}}>
        <Document title="Invoice with Border">
          <InvoiceCustomerPDF data={finalCustomerData} />
          <InvoiceCustomerPacking data={finalCustomerData} />
        </Document>
      </PDFViewer>
    </div>
  );
};

export default InvoicePDF;
