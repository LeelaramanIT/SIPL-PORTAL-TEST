import { Document, PDFViewer } from '@react-pdf/renderer';
import { pdf } from "@react-pdf/renderer";
import { useDispatch } from "react-redux";
import { useEffect } from 'react';
import { IoChevronBackCircleOutline } from 'react-icons/io5';
import Button from '../../../../../../components/InputFields/Button';
import { useNavigate } from 'react-router-dom';
import ProformaPDF from './ProformaPDF';





const ProformaPDFViewer = () => {
  // const finalCustomerData = useSelector(
  //   (state) => state.invoice.exportInvoices.finalCustomerData
  // );
  const dispatch = useDispatch();


  useEffect(() => {
    // if (!finalCustomerData) return;

    const generateBlob = async () => {
      const blob = await pdf(
        <Document>
       <ProformaPDF />
        </Document>
      ).toBlob();

      // dispatch(setPdfBlob(blob));
      console.log("✅ Customer PDF Blob generated:", blob.size);
    };
    generateBlob();
  }, [dispatch]);
  const navigate = useNavigate();


  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-gray-100 p-4">
      <div className="w-full h-12 bg-[var(--background)] rounded-lg flex justify-evenly items-center">
        <Button
          icon={<IoChevronBackCircleOutline />}
          type="button"
          onClick={() => {
            navigate("/TTS/International/Invoice/ProformaInvoice/PDF");
          }}
          text={"Back"}
          className={"text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"}
        />
        <h1 className="font-bold">{"Default"} - Customer Invoice PDF</h1>
      </div>
      <PDFViewer style={{ width: '100%', height: '80.1vh', border: 'none', overflow: 'hidden' }}>
        <Document title="Invoice with Border">
          <ProformaPDF />
        </Document>
      </PDFViewer>
    </div>
  );
};

export default ProformaPDFViewer;
