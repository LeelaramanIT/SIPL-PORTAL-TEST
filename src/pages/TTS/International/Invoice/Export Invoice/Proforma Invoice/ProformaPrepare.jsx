import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { IoChevronBackOutline } from "react-icons/io5";
import { FiSearch, FiFileText, FiCheckCircle, FiEdit3 } from "react-icons/fi";
import DialogBox from "../../../../../../components/DialogBox.jsx";
import ClientDetailsSection, { ClientDetailsSkeleton } from "./ClientDetailsSection.jsx";
import AdditionalCustDetailsForm from "./AdditionalDetailsForm.jsx";
import { DynamicDataTable } from "../../../../../../components/DynamicDataTable.jsx";
import { getCurrency } from "../../../../../../utils/currencies.js";
import {
  setShowSubmit,
  setFinalCustomerData,
  submitCustomerInvoice,
} from "../../../../../../Redux/Slices/InvoiceSlice.jsx";
import { getProformaInvoiceDetails } from "../../../../../../Redux/Slices/ProformaInvoice/ProformaInvoiceSlice.jsx";

const ProformaPrepare = () => {
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {state} = useLocation()
   const dispatch = useDispatch();
  const navigate = useNavigate();

  const getProformaDetails = async()=>{
    await dispatch(getProformaInvoiceDetails(state.data))
  }

  useEffect(() =>{
   getProformaDetails()
  },[state.data])

  const {
    error,
    // additionalForm,
    finalCustomerData,
    showSubmmit,
    invoiceCustDetails,
  } = useSelector((state) => state?.invoice?.exportInvoices || {});

  const { loading, proformaDetails, additionalForm } = useSelector((state) => state.proformaInvoice );
  
  console.log(proformaDetails);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (showWarning) {
      const timer = setTimeout(() => setShowWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showWarning]);

  const handleSubmit = async () => {
    
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F1A] flex flex-col p-2 md:p-2 lg:p-4 gap-3 transition-colors duration-300">
      
      {/* 01. Breadcrumb & Header */}
<header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
  <div className="flex items-center gap-4">
    <button
      onClick={() => navigate("/TTS/International/Invoice/ProformaInvoice/List")}
      className="p-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:text-indigo-600 transition-all shadow-sm"
    >
      <IoChevronBackOutline size={20} />
    </button>
    
    <div>
      <div className="flex items-center gap-2 mb-1">
        {/* Switch between Draft and Proforma Mode */}
        {invoiceCustDetails?.isDraft ? (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Draft Proforma Invoice
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/50">
            <FiCheckCircle className="text-[10px]" />
            Proforma Invoice
          </span>
        )}

        <span className="text-[10px] font-bold text-gray-400">/</span>
        
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {invoiceCustDetails?.type || "Standard"} Export
        </span>
      </div>

      <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
        {invoiceCustDetails?.isDraft ? "Refine Draft Details" : "Prepare Proforma Document"}
      </h1>
    </div>
  </div>

  {/* Dynamic Summary Cards */}
  <div className="flex gap-4 p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <div className="px-4 py-1 text-center border-r border-gray-100 dark:border-gray-800">
        <p className="text-[9px] font-bold text-gray-400 uppercase">Verified By</p>
        <p className={`text-xs font-black uppercase tracking-tighter ${invoiceCustDetails?.isDraft ? 'text-amber-600' : 'text-indigo-600'}`}>
          {invoiceCustDetails?.isDraft ? 'In-Review' : 'JANA'}
        </p>
      </div>
      <div className="px-4 py-1 text-center">
        <p className="text-[9px] font-bold text-gray-400 uppercase">Order Reference</p>
        <p className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">{invoiceCustDetails?.orderRefNo}</p>
      </div>
  </div>
</header>

      {/* 02. Client Details Section */}
      <div className="relative group">
        <div className="absolute -inset-1  rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-1000"></div>
        {loading ? <ClientDetailsSkeleton /> : (
          <ClientDetailsSection invoiceDetails={{ ...invoiceCustDetails, ...additionalForm }} />
        )}
      </div>

      {/* 03. Item Management Section */}
      <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Billable Items
              <span className="h-5 w-5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] flex items-center justify-center text-gray-500">
                {invoiceCustDetails?.items?.length}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage quantities and unit pricing for this proforma.</p>
          </div>

          <div className="relative w-full lg:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by size, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="p-2">
          <DynamicDataTable />
        </div>
      </section>

      {/* 04. Unified Action Bar */}
      <footer className="sticky bottom-6 mt-4 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-40">
        <div className="flex flex-col gap-1">
          {showWarning && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-bold text-amber-600 flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Required: Review the PDF preview before finalizing submission.
            </motion.p>
          )}
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            Draft last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              navigate("/TTS/International/Invoice/Customer/BillPDF");
              dispatch(setShowSubmit(true));
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <FiFileText />
            Preview PDF
          </button>

          <button
            onClick={() => setShowDetailsForm(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/30 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all shadow-sm"
          >
            <FiEdit3 />
            {additionalForm ? "Edit Fields" : "Fill Details"}
          </button>

          {showSubmmit && (
            <button
              onClick={() => setOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-gray-900 dark:bg-indigo-600 text-white text-sm font-bold hover:bg-black dark:hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
            >
              <FiCheckCircle />
              Finalize & Submit
            </button>
          )}
        </div>
      </footer>

      {/* 05. Overlays & Modals */}
      <DialogBox
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        title="Confirm Submission"
        message="Finalizing will lock this proforma and generate the official reference. Continue?"
        confirmText="Yes, Finalize"
        onConfirm={handleSubmit}
      />

      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-white/90 dark:bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center"
          >
             {/* Custom Infinite Spinner */}
             <div className="w-16 h-16 border-4 border-indigo-100 dark:border-gray-800 border-t-indigo-600 rounded-full animate-spin mb-4" />
             <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">
               Encrypting & Storing Invoice Data
             </p>
          </motion.div>
        )}

        {showDetailsForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-lg font-black tracking-tight text-indigo-600 dark:text-indigo-400 uppercase">
                  Logistics & Additional Details
                </h2>
                <button onClick={() => setShowDetailsForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <IoMdClose className="text-xl text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <AdditionalCustDetailsForm
                  onClose={() => setShowDetailsForm(false)}
                  invoiceDetails={invoiceCustDetails}
                  setShowWarning={setShowWarning}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProformaPrepare;