import { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import Button from "../../../../../../components/InputFields/Button.jsx";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import TableSkeleton from "../TableSkeleton.jsx";
import toast from "react-hot-toast";
import DialogBox from "../../../../../../components/DialogBox.jsx";
import { currencies, getCurrency } from "../../../../../../utils/currencies.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  setFinalInvoiceData,
  setInvoiceType,
  setLocalItems,
  setSplitItems,
  setSplitResult,
  SetupdatedInvoiceDetails,
  submitInvoice,
  setShowSubmit,
  setFinalCustomerData,
  submitCustomerInvoice,
} from "../../../../../../Redux/Slices/InvoiceSlice.jsx";
import { FiSearch } from "react-icons/fi";
import ClientDetailsSection, { ClientDetailsSkeleton } from "./ClientDetailsSection.jsx";
import AdditionalCustDetailsForm from "./AdditionalDetailsForm.jsx";
import { IoChevronBackCircleOutline } from "react-icons/io5";

const ExportCustInvoicePrepare = () => {

  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const dispatch = useDispatch(); // Redux hook to dispatch actions.
  const navigate = useNavigate(null); // React Router hook to navigate between pages.
  const loading = useSelector((state) => state.invoice.exportInvoices.loading); // Gets the loading state from Redux.
  const error = useSelector((state) => state.invoice.exportInvoices.error); // Gets any error messages from Redux.
  const [isOpen, setOpen] = useState(false); // Manages the visibility of the submit confirmation dialog.
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Split-related local states
  const [splitInputs, setSplitInputs] = useState([]); // Stores the quantity input for splitting each item.
  const [useGlobalScheme, setUseGlobalScheme] = useState(false); // Determines if a single scheme applies to all items.
  const [globalScheme, setGlobalScheme] = useState(""); // Stores the value of the globally selected scheme.
  const [searchQuery, setSearchQuery] = useState("");

  // Destructuring relevant data from the Redux store
  const {
    invoiceDetails,
    invoiceType,
    additionalForm,
    finalCustomerData,
    showSubmmit,
    invoiceCustDetails,

  } = useSelector((state) => state?.invoice?.exportInvoices || {});
  const formDAta = additionalForm;

  useEffect(() => {
    dispatch(setFinalCustomerData())
  }, [invoiceCustDetails?.invoiceNo]);

  // useEffect to display an error toast if an error occurs in the Redux state.
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // This useEffect will run whenever 'showWarning' changes.
  useEffect(() => {
    if (showWarning) {
      // Set a timer to hide the warning after 3 seconds
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 5000);

      // Cleanup function to clear the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [showWarning]);

  const matchesSearch = (item) => { //SEARCH
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();

    // Combine fields you want to search by
    const searchString = `
      ${item?.category || ""} 
      ${item?.tyreSize || ""} 
      ${item?.brand || ""} 
      ${item?.itemCode || ""} 
      ${item?.plant || ""}
      ${item?.tyreType || ""}
    `.toLowerCase();

    return searchString.includes(lowerQuery);
  };

  // UseMemo to get the user's currency symbol and code.
  const userCurrency = getCurrency(invoiceCustDetails?.usercurrency);
  // useMemo for efficient total quantity calculation.
  const items = useMemo(() => {
    return Array.isArray(invoiceCustDetails?.items)
      ? invoiceCustDetails.items
      : [];
  }, [invoiceCustDetails]);

  const totalQTY = useMemo(() => {
    return items?.reduce(
      (sum, item) => sum + (Number(item?.itemQty) || 0),
      0
    );
  }, [items]);

  // useMemo for efficient total price calculation.
  const grandTotal = useMemo(() => {

    return items.reduce((sum, item) => {
      const tyre = Number(item?.basicprice) || 0;
      const rim = item?.rimStatus ? Number(item?.rimUnitPrice) || 0 : 0;
      const qty = Number(item?.itemQty) || 0;

      return sum + (tyre + rim) * qty;
    }, 0);
  }, [items]);

  // useMemo for efficient total finished weight (FWT) calculation.
  const totalFWT = useMemo(() => {
    return items.reduce((sum, item) => {
      const tyrefw = Number(item?.finishedWt) || 0;
      const rimfw = Number(item?.rimfinishedwt) || 0;
      const qty = Number(item?.itemQty) || 0;
      return sum + (tyrefw + rimfw) * qty;
    }, 0);
  }, [items]);

  const combiOrders = useMemo(() => {
    return items.reduce((acc, item) => {
      const plant = item?.plant || "UNKNOWN";
      if (!acc[plant]) acc[plant] = [];
      acc[plant].push(item);
      return acc;
    }, {});
  }, [items]);

  // Function to close the AdditionalDetailsForm modal.
  const handleCloseForm = () => {
    setShowDetailsForm(false);
  };

  // Function to handle the final submission of the invoice.
const handleSubmit = async () => {
  try {
    setIsSubmitting(true);
    await dispatch(submitCustomerInvoice(finalCustomerData, navigate));
  } catch (err) {
    console.error(err);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="w-full flex-1 flex flex-col layout-scroll p-2 gap-2 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex flex-wrap items-center justify-between bg-white bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-2 rounded-lg shadow-2xs border border-[var(--secondary)] dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/TTS/International/Invoice/CustomerInvoice", { state: { type: "Customer" } })}
            className="text-gray-500 hover:text-[var(--primary)] transition-colors"
            title="Back to Custom Invoices"
          >
            <IoChevronBackCircleOutline size={28} />
          </button>
          <div>
          <h1 className="text-xl font-bold  tracking-tight">
            {invoiceCustDetails?.type} Invoice Details
          </h1>
          <p className="text-sm text-slate-500 ">
            Fill in the details below to generate and finalize this invoice
          </p>
          </div>
        </div>
      </div>

      {loading ? (<ClientDetailsSkeleton />) : (<ClientDetailsSection
        invoiceDetails={{ ...invoiceCustDetails, ...additionalForm }}
      />)}

      <div className="flex justify-between items-start">
        <div className="ml-1">
          <h1 className="text-xl font-bold  tracking-tight">
            Item Details
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            List of all billable items and their applicable rates.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-4">
          {/* --- NEW SEARCH INPUT --- */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-sm text-gray-700 dark:text-gray-300">
              Search Items
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Size, Brand, Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded px-3 py-1.5 pl-8 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <FiSearch className="absolute left-2.5 top-2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="max-h-[calc(100vh)] w-full overflow-y-auto custom-scrollbar bg-[#f7f2ef] dark:bg-gray-800 shadow-sm">
          <table
            border={1}
            className="w-full text-sm text-left table-fixed shadow-lg"
          >
            <thead className="bg-[#ECECEC] dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold sticky top-0 z-10">
              <tr>
                {[
                  "CATEGORY",
                  "PLATFORM",
                  "TYRE SIZE",
                  "RIM",
                  "TYPE",
                  "BRAND",
                  "SIDEWALL",
                  "BASIC PRICE",
                  "QTY",
                  "TOTAL PRICE",
                  "FWT",
                  // "RIM QTY",
                  // "RIM price",
                  "ADDITIONAL INFO",
                  "PLANT",
                  "PART-NO",
                  ...(invoiceType === "Scheme_Invoice"
                    ? ["Split Qty", "Invoice / Scheme", "Action"]
                    : []),
                ].map((head, idx) => (
                  <th
                    key={idx}
                    colSpan={idx === 11 || idx === 2 || idx === 15 ? 2 : 1}
                    className="px-1 py-4 text-center text-[13px]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(invoiceCustDetails?.items || []).map((item, idx) => {
                if (!matchesSearch(item)) return null;
                const tyre = Number(item?.basicprice) || 0;
                const rim =  Number(item?.rimUnitPrice) || 0;
                const qty = Number(item?.itemQty) || 0;
                const tyrefw = Number(item?.finishedWt) || 0;
                const rimfw = Number(item?.rimfinishedwt) || 0;
                return (
                  <tr
                    key={idx}
                    className={`text-[13px] text-center border-b border-[var(--primary-hover)]/30`}
                  >
                    {/* Existing Columns */}
                    <td>{item?.category}</td>
                    <td>{item?.platforms}</td>
                    <td colSpan={2}>{item?.tyreSize}</td>
                    <td>{item?.tyreRim}</td>
                    <td>{item?.tyreType}</td>
                    <td>{item?.brand}</td>
                    <td>{item?.sidewall || "-"}</td>
                    <td>{item?.basicprice || item?.rimUnitPrice}</td>
                    <td>{item?.itemQty}</td>
                    <td>{((tyre + rim) * qty).toFixed(2)}</td>
                    <td>{((tyrefw + rimfw) * qty).toFixed(3)}</td>
                    <td colSpan={2}>{item?.additionalInfo || "-"}</td>
                    <td>{item?.plant}</td>
                    <td className="break-all">{item?.itemCode}</td>
                  </tr>
                )
              })}
            </tbody>

            <tfoot className="font-semibold text-gray-800 dark:text-white">
              <tr className="bg-gray-100 dark:bg-gray-700 sticky bottom-0 z-10 text-xs">
                <td colSpan={9} className="text-right px-4 py-2">
                  Grand Total :
                </td>
                <td className="px-4 py-2 text-center">{totalQTY}</td>
                <td className="px-1 py-1 text-center whitespace-nowrap">
                  {`${userCurrency?.symbol || ""} ${grandTotal?.toFixed(2)}`}
                </td>

                <td className="px-4 py-2 text-center whitespace-nowrap">
                  {totalFWT?.toFixed(3)} Kgs
                </td>
                <td></td>
                <td colSpan={3}>Currency : {userCurrency?.code} - {userCurrency?.name}</td>
                {invoiceType === "Scheme_Invoice" && <td colSpan={4}></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {invoiceCustDetails?.shipmentType === "COMBI" && (
        <>
          <h1 className="text-2xl font-bold text-[var(--primary)] dark:text-gray-200">
            Combi Orders
          </h1>
          <div className="max-h-[calc(100vh-63px-150px)] w-full overflow-y-auto custom-scrollbar bg-[#f7f2ef] dark:bg-gray-800 shadow-sm">
            <table className="w-full text-sm text-left table-fixed shadow-lg">
              <thead className="bg-[#ECECEC] dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold sticky top-0 z-10">
                <tr>
                  {[
                    "PLANT",
                    "TYRE QTY",
                    "TYRE PRICE",
                    "TYRE WT",
                    "RIM QTY",
                    "RIM PRICE",
                    "RIM WT",
                    "TOTAL QTY",
                    "TOTAL PRICE",
                    "TOTAL WT",
                    "RFD",
                  ].map((head, idx) => (
                    <th key={idx} className="px-1 py-4 text-center text-[13px]">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(combiOrders || {}).map(([plant, items], idx) => {
                  const {
                    tyreQty,
                    tyrePrice,
                    tyreWt,
                    rimQty,
                    rimPrice,
                    rimWt,
                    totalQty,
                    totalPrice,
                    totalWt,
                  } = items.reduce(
                    (acc, item) => {
                      const qty = Number(item.itemQty) || 0;

                      const tyreUnitPrice = Number(item.basicprice) || 0;
                      const rimUnitPrice =
                        item.rimStatus ? Number(item.rimUnitPrice) || 0 : 0;

                      const tyreWeight = Number(item.finishedWt) || 0;
                      const rimWeight = Number(item.rimfinishedwt) || 0;


                      acc.tyreQty += qty;
                      acc.rimQty += item.rimStatus ? qty : 0;

                      acc.tyrePrice += tyreUnitPrice * qty;
                      acc.rimPrice += rimUnitPrice * qty;

                      acc.tyreWt += tyreWeight * qty;
                      acc.rimWt += rimWeight * qty;

                      acc.totalQty += qty;
                      acc.totalPrice += (tyreUnitPrice + rimUnitPrice) * qty;
                      acc.totalWt += (tyreWeight + rimWeight) * qty;

                      return acc;
                    },
                    {
                      tyreQty: 0,
                      tyrePrice: 0,
                      tyreWt: 0,
                      rimQty: 0,
                      rimPrice: 0,
                      rimWt: 0,
                      totalQty: 0,
                      totalPrice: 0,
                      totalWt: 0,
                    }
                  );

                  return (
                    <tr
                      key={plant}
                      className={`text-[13px] text-center ${idx % 2 === 0
                        ? "bg-[#F4F3FE] dark:bg-gray-700"
                        : "bg-white dark:bg-gray-800"
                        } text-gray-700 dark:text-gray-300`}
                    >
                      <td>{plant}</td>
                      <td>{tyreQty}</td>
                      <td>{tyrePrice.toFixed(2)}</td>
                      <td>{tyreWt.toFixed(2)}</td>
                      <td>{rimQty}</td>
                      <td>{rimPrice.toFixed(2)}</td>
                      <td>{rimWt.toFixed(2)}</td>
                      <td>{totalQty}</td>
                      <td>{totalPrice.toFixed(2)}</td>
                      <td>{totalWt.toFixed(2)}</td>
                      <td>RFD</td>
                    </tr>

                  );
                })}

              </tbody>
              <tfoot className="font-semibold text-gray-800 dark:text-white">
                <tr className="bg-gray-100 dark:bg-gray-700 sticky bottom-0 z-10">
                  <td colSpan={7} className="text-right px-4 py-2">
                    Total:
                  </td>
                  <td className="px-4 py-2 text-center">{totalQTY}</td>
                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    {`${userCurrency?.symbol || ""} ${grandTotal?.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {totalFWT?.toFixed(3)}
                  </td>
                  <td className="px-4 py-2 text-center"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center mt-4 mr-14">
        {/* Conditionally render the warning with a fade-in animation */}
        {showWarning && (
          <p className="text-red-500 animate-fade-in-out">
            Please check the PDF before submitting the invoice.
          </p>
        )}

        <Button
          onClick={() => {
            navigate("/TTS/International/Invoice/Customer/BillPDF");
            dispatch(setShowSubmit(true));
          }}
          text="Preview PDF"
        />


        {!additionalForm ? (
          <Button
            onClick={() => setShowDetailsForm(true)}
            text="Mandatory Fields"
          />
        ) : (
          <Button
            onClick={() => setShowDetailsForm(true)}
            text="Edit Mandatory Fields"
          />
        )}
        
        {showSubmmit && (
          <Button onClick={() => setOpen(true)} text="Submit" />
        )}
      </div>
      <DialogBox
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        title="Submit Invoice"
        message="Are you sure you want to submit this invoice? This action cannot be undone once submitted."
        confirmText="Submit"
        cancelText="Cancel"
        onConfirm={handleSubmit}
      />

      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-white/80 dark:bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="relative w-32 h-16 mb-4">
              <svg
                viewBox="0 0 100 50"
                className="w-full h-full fill-none"
                style={{ stroke: 'var(--primary, #2563eb)' }}
              >
                <path
                  d="M31.6,15.5C21,15.5,12.5,24,12.5,34.5S21,53.5,31.6,53.5c6.2,0,11.7-3,15.1-7.5L66.7,21.5c3.4-4.5,8.9-7.5,15.1-7.5,10.6,0,19.1,8.5,19.1,19.1S92.4,52.4,81.8,52.4c-6.2,0-11.7-3-15.1-7.5L31.6,15.5Z"
                  transform="scale(0.8) translate(12, 5)"
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <motion.path
                  d="M31.6,15.5C21,15.5,12.5,24,12.5,34.5S21,53.5,31.6,53.5c6.2,0,11.7-3,15.1-7.5L66.7,21.5c3.4-4.5,8.9-7.5,15.1-7.5,10.6,0,19.1,8.5,19.1,19.1S92.4,52.4,81.8,52.4c-6.2,0-11.7-3-15.1-7.5L31.6,15.5Z"
                  transform="scale(0.8) translate(12, 5)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{
                    pathLength: [0.1, 0.4, 0.1],
                    pathOffset: [0, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </svg>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
              Processing Invoice...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetailsForm && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm layout-scroll flex items-center justify-center"
          >
            <motion.div
              key="modal-content"
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              transition={{ duration: 0.1, ease: "easeIn" }}
              className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-11/12 max-h-[50rem] overflow-y-auto border border-gray-300 dark:border-gray-700 custom-scrollbar"
            >
              <h2 className="text-xl font-bold mb-4 text-[var(--primary)]">
                Additional Invoice Details
              </h2>
              <button
                onClick={handleCloseForm}
                className="absolute top-5 right-5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white z-20"
              >
                <IoMdClose className="text-2xl" />
              </button>
              <AdditionalCustDetailsForm
                onClose={handleCloseForm}
                invoiceDetails={invoiceCustDetails}
                setShowWarning={setShowWarning}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportCustInvoicePrepare;
