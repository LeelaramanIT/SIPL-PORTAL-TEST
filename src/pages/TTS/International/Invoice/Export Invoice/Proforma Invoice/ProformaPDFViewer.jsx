import { Document, PDFViewer } from '@react-pdf/renderer';
import { pdf } from "@react-pdf/renderer";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from 'react';
import { IoChevronBackCircleOutline } from 'react-icons/io5';
import Button from '../../../../../../components/InputFields/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import ProformaPDF from './ProformaPDF';





const ProformaPDFViewer = () => {
  const finalInvoiceData = useSelector(
      (state) => state?.proformaInvoice?.finalData,
    );
  const dispatch = useDispatch();
  console.log(finalInvoiceData);
  const { state } = useLocation();
  // console.log(state)
  


  // useEffect(() => {
  //   if (!finalInvoiceData) return;

  //   const generateBlob = async () => {
  //     const blob = await pdf(
  //       <Document>
  //      <ProformaPDF data={finalInvoiceData} />
  //       </Document>
  //     ).toBlob();

  //     // dispatch(setPdfBlob(blob));
  //     console.log("✅ Customer PDF Blob generated:", blob.size);
  //   };
  //   generateBlob();
  // }, [dispatch]);
  const navigate = useNavigate();

  if (!finalInvoiceData || Object.keys(finalInvoiceData.items).length === 0) {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-100 p-6">
      
      {/* Card */}
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        
        {/* Icon */}
        <div className="text-5xl mb-4">📄</div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          No Invoice Data Found
        </h2>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-6">
          We couldn't find any invoice details to generate the PDF.
          Please go back and ensure all required information is filled.
        </p>
        <div>
        {/* Button */}
        <Button
          icon={<IoChevronBackCircleOutline />}
          type="button"
          onClick={() => navigate(-1)}
          text={"Go Back"}
          className={
            "w-full justify-center items-center text-white bg-blue-600 hover:bg-blue-700 transition-all"
          }
          />
          </div>
      </div>
    </div>
  );
}


  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-gray-100 p-4">
      <div className="w-full h-12 bg-[var(--background)] rounded-lg flex justify-evenly items-center">
        <Button
          icon={<IoChevronBackCircleOutline />}
          type="button"
          onClick={() => {
            navigate(-1);
          }}
          text={"Back"}
          className={"text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"}
        />
        <h1 className="font-bold">{finalInvoiceData?.custFullName} - {state==="PI"?"PREFORMA":"DRAFT"} INVOICE PDF</h1>
      </div>
      <PDFViewer style={{ width: '100%', height: '80.1vh', border: 'none', overflow: 'hidden' }}>
        <Document title={`${finalInvoiceData?.custFullName} - ${finalInvoiceData?.orderRefNo}`}>
          <ProformaPDF data={finalInvoiceData} />
        </Document>
      </PDFViewer>
    </div>
  );
};

export default ProformaPDFViewer;
