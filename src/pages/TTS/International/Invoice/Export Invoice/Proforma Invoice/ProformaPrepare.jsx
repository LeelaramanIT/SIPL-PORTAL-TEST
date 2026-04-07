import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { IoChevronBackOutline } from "react-icons/io5";
import { FiSearch, FiFileText, FiCheckCircle, FiEdit3 } from "react-icons/fi";
import DialogBox from "../../../../../../components/DialogBox.jsx";
import ClientDetailsSection, {
  ClientDetailsSkeleton,
} from "./ClientDetailsSection.jsx";
import AdditionalCustDetailsForm from "./AdditionalDetailsForm.jsx";
import { DynamicDataTable } from "../../../../../../components/DynamicDataTable.jsx";
import { getCurrency } from "../../../../../../utils/currencies.js";
import {
  setShowSubmit,
  setFinalCustomerData,
  submitCustomerInvoice,
} from "../../../../../../Redux/Slices/InvoiceSlice.jsx";
import { formatDateTime } from "../../../../../../utils/FormatDate.js";
import { useParams } from "react-router-dom";
import {
  getProformaInvoiceDetails,
  resetProformaSubmit,
  submitProformaInvoice, // ← new
} from "../../../../../../Redux/Slices/ProformaInvoice/ProformaInvoiceSlice.jsx";

const ProformaPrepare = () => {
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { state } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // console.log(state);

  const getProformaDetails = async () => {
    await dispatch(getProformaInvoiceDetails(state.data));
  };

  useEffect(() => {
    getProformaDetails();
  }, [state.data]);

  const invoiceType = state?.invoiceType;

  // console.log(invoiceType);

  const {
    error,
    // additionalForm,
    finalCustomerData,
    showSubmmit,
    // proformaDetails,
  } = useSelector((state) => state?.invoice?.exportInvoices || {});

  const {
    loading,
    proformaDetails,
    additionalForm,
    submitLoading,
    submitSuccess,
  } = useSelector((state) => state.proformaInvoice);
  // console.log(proformaDetails);

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
    setIsSubmitting(true);
    try {
      const result = await dispatch(submitProformaInvoice(invoiceType));
      if (result?.success) {
        toast.success("Proforma Invoice submitted successfully!");
        setOpen(false);
        navigate(-1); // or navigate to a success page
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } catch (err) {
      toast.error("Unexpected error during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "platform",
      accessor: "platforms",
      width: "1fr",
      align: "center",
    },
    {
      header: "category",
      accessor: "category",
      width: "1.2fr",
      align: "center",
    },
    {
      header: "tyre Size",
      accessor: "tyreSize",
      width: "1.2fr",
      align: "center",
    },
    {
      header: "tyre Type",
      accessor: "tyreType",
      width: "1.2fr",
      align: "center",
      render: (value) => formatDateTime(value),
    },
    {
      header: "tyre Rim",
      accessor: "tyreRim",
      width: "1.2fr",
      align: "center",
      render: (value) => formatDateTime(value),
    },
    {
      header: "brand",
      accessor: "brand",
      width: "1.2fr",
      align: "center",
      render: (value) => formatDateTime(value),
    },
    {
      header: "sidewall",
      accessor: "sidewall",
      width: "1.3fr",
      align: "center",
      render: (value) => formatDateTime(value),
    },
    {
      header: "PROCESS id",
      accessor: "itemCode",
      width: "1fr",
      align: "center",
    },
    { header: "hsnCode", accessor: "hsnCode", width: "1fr", align: "center" },
    { header: "QTY", accessor: "itemQty", width: "0.8fr", align: "center" },
    {
      header: "unit weight",
      accessor: "finishedWt",
      width: "0.8fr",
      align: "center",
      render: (value, row) => (
        <p>{(row.finishedWt + row.rimfinishedwt).toFixed(3)}</p>
      ),
    },
    {
      header: "total weight",
      accessor: "totalweight",
      width: "0.8fr",
      align: "center",
      render: (value, row) => (
        <p>{((row.finishedWt + row.rimfinishedwt) * row.itemQty).toFixed(3)}</p>
      ),
    },
    {
      header: "Basic Price",
      accessor: "basicPrice",
      width: "1fr",
      align: "center",
      render: (value, row) => (
        <p>{(row.basicPrice + row.rimUnitPrice).toFixed(2)}</p>
      ),
    },
    {
      header: "Total Price",
      accessor: "basicPrice",
      width: "1fr",
      align: "center",
      render: (value, row) => (
        <p>{((row.basicPrice + row.rimUnitPrice) * row.itemQty).toFixed(2)}</p>
      ),
    },
  ];
  const subtotal = useMemo(() => {
    return (proformaDetails?.items || []).reduce((sum, item) => {
      // Ensure values are numbers to avoid string concatenation bugs
      const price = Number((item?.basicPrice || 0) + (item?.rimUnitPrice || 0)) || 0;
      const qty = Number(item?.itemQty) || 0;
      return sum + price * qty;
    }, 0);
  }, [proformaDetails?.items]);

  const totalWeight = useMemo(() => {
    return (proformaDetails?.items || []).reduce((sum, item) => {
      // Ensure values are numbers to avoid string concatenation bugs
      const wt =
        Number((item?.finishedWt || 0) + (item?.rimfinishedwt || 0)) || 0;
      const qty = Number(item?.itemQty) || 0;
      return sum + wt * qty;
    }, 0);
  }, [proformaDetails?.items]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return proformaDetails?.items || [];
    const q = searchQuery.toLowerCase();
    return (proformaDetails?.items || []).filter((item) =>
      [
        item?.tyreSize,
        item?.brand,
        item?.category,
        item?.tyreType,
        item?.platforms,
        item?.hsnCode,
        item?.itemCode,
        item?.sidewall,
      ]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q)),
    );
  }, [searchQuery, proformaDetails?.items]);
  const finalInvoiceData = useSelector(
    (state) => state?.proformaInvoice?.finalData,
  );
  // console.log(finalInvoiceData);

  const hasAdditionalForm =
    additionalForm && Object.keys(additionalForm).length > 0;

  const canSubmit = showSubmmit && hasAdditionalForm;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F1A] flex flex-col p-2 md:p-2 lg:px-4 gap-3 transition-colors duration-300">
      {/* 01. Breadcrumb & Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* LEFT SECTION */}
        <div className="flex w-full lg:w-auto items-start sm:items-center gap-3 sm:gap-4">
          {/* Back Button */}
          <button
            onClick={() => {
              navigate(-1);
              dispatch(resetProformaSubmit());
            }}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:text-indigo-600 transition-all shadow-sm shrink-0"
          >
            <IoChevronBackOutline size={20} />
          </button>

          {/* Title Section */}
          <div className="flex-1 min-w-0">
            {/* Top Labels */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              {invoiceType === "Draft" ? (
                <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-800/50 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Draft Proforma Invoice
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/50 whitespace-nowrap">
                  <FiCheckCircle className="text-[10px]" />
                  Proforma Invoice
                </span>
              )}

              <span className="text-[10px] font-bold text-gray-400 hidden sm:inline">
                /
              </span>

              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                {proformaDetails?.type || "Standard"} Export
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              {proformaDetails?.isDraft
                ? "Refine Draft Details"
                : "Prepare Proforma Document"}
            </h1>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 sm:gap-4 p-2 sm:p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            {/* Verified */}
            <div className="flex sm:flex-col justify-between sm:justify-center items-center px-3 sm:px-4 py-2 sm:py-1 text-center border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 w-full sm:w-auto">
              <p className="text-[9px] font-bold text-gray-400 uppercase">
                Verified By
              </p>
              <p
                className={`text-xs font-black uppercase tracking-tighter ${
                  proformaDetails?.isDraft
                    ? "text-amber-600"
                    : "text-indigo-600"
                }`}
              >
                {proformaDetails?.isDraft ? "In-Review" : "JANA"}
              </p>
            </div>

            {/* Order Ref */}
            <div className="flex sm:flex-col justify-between sm:justify-center items-center px-3 sm:px-4 py-2 sm:py-1 text-center w-full sm:w-auto">
              <p className="text-[9px] font-bold text-gray-400 uppercase">
                Order Reference
              </p>
              <p className="text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-gray-100 break-all">
                {proformaDetails?.orderRefNo}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 02. Client Details Section */}
      <div className="relative group">
        <div className="absolute -inset-1  rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-1000"></div>
        {loading ? (
          <ClientDetailsSkeleton />
        ) : (
          <ClientDetailsSection
            invoiceDetails={{ ...proformaDetails, ...additionalForm }}
          />
        )}
      </div>

      {/* 03. Item Management Section */}
      <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col min-h-[400px] max-h-[600px]">
        {/* 🔹 Top Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Billable Items
              <span className="h-5 w-5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] flex items-center justify-center text-gray-500">
                {filteredItems.length}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage quantities and unit pricing for this proforma.
            </p>
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

        {/* 🔹 Table Scroll Area */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          {" "}
          {/* 3. flex-1 and overflow-auto are key */}
          <DynamicDataTable
            data={filteredItems || []}
            columns={columns}
            // 4. Ensure the background color is solid (no transparency) so text doesn't bleed through while scrolling
            headerClassName="dark:bg-slate-800 bg-[var(--primary)]/90 text-gray-900 dark:text-white sticky top-0 z-20 shadow-sm"
          />
        </div>

        {/* 🔹 Bottom Total Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50 dark:bg-gray-800/40 flex justify-end items-center">
          <div className="flex items-stretch gap-0 divide-x divide-gray-200 dark:divide-gray-700">
            <div className="flex flex-col items-center px-5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Total Items
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                {(proformaDetails?.items || []).reduce(
                  (sum, item) => sum + Number(item?.itemQty || 0),
                  0,
                )}
              </span>
            </div>

            <div className="flex flex-col items-end px-5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Total Weight
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-indigo-600">
                  {totalWeight.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end px-5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Subtotal Amount
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-medium text-indigo-600">
                  {proformaDetails?.userCurrency || "USD"}
                </span>
                <span className="text-xl font-black text-indigo-600">
                  {subtotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  /-
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04. Unified Action Bar */}
      <footer className="sticky bottom-1 flex flex-col md:flex-row justify-between items-center gap-4 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-40">
        {/* Left: Status hints */}
        <div className="flex flex-col gap-1 w-full md:w-auto">
          {/* Warning: PDF not previewed yet */}
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

          {/* Hint: Additional details not filled */}
          {showSubmmit && !hasAdditionalForm && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-bold text-indigo-500 flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              Fill in additional details to enable final submission.
            </motion.p>
          )}

          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            Draft last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Step 1 — Always visible: Preview PDF */}
          <button
            onClick={() => {
              navigate("/TTS/International/Invoice/ProformaInvoice/PDF", {
                state: invoiceType,
              });
              dispatch(setShowSubmit(true));
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-[var(--primary)]/5 dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <FiFileText />
            Preview PDF
          </button>

          {/* Step 2 — Always visible: Fill / Edit additional details */}
          <button
            onClick={() => setShowDetailsForm(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/30 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all shadow-sm"
          >
            <FiEdit3 />
            {/* Only say "Edit Fields" if the form was actually filled */}
            {hasAdditionalForm ? "Edit Fields" : "Fill Details"}
          </button>

          {/* Step 3 — Only when PDF previewed AND additional form filled */}
          {canSubmit && (
            <button
              onClick={() => setOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg bg-gray-900 dark:bg-indigo-600 text-white text-sm font-bold hover:bg-black dark:hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
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
        message={`Finalizing will lock this ${invoiceType === "PI" ? "proforma" : "draft proforma"} and generate the official reference. Continue?`}
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
                <button
                  onClick={() => setShowDetailsForm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <IoMdClose className="text-xl text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <AdditionalCustDetailsForm
                  onClose={() => setShowDetailsForm(false)}
                  invoiceDetails={{ ...proformaDetails, invoiceType }}
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
