import { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import AdditionalDetailsForm from "./AdditionalDetailsForm.jsx";
import Button from "../../../../../components/InputFields/Button.jsx";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import TableSkeleton from "./TableSkeleton.jsx";
import toast from "react-hot-toast";
import DialogBox from "../../../../../components/DialogBox.jsx";
import { gsap } from "gsap";
import { currencies, getCurrency } from "../../../../../utils/currencies.js";
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
} from "../../../../../Redux/Slices/InvoiceSlice.jsx";
import { FiSearch } from "react-icons/fi";
import { IoChevronBackCircleOutline } from "react-icons/io5";

const ExportInvoicePrepare = () => {

  const [showDetailsForm, setShowDetailsForm] = useState(false); // Manages the visibility of the mandatory details form.
  const dispatch = useDispatch(); // Redux hook to dispatch actions.
  const navigate = useNavigate(); // React Router hook to navigate between pages.
  const loading = useSelector((state) => state.invoice.exportInvoices.loading); // Gets the loading state from Redux.
  const error = useSelector((state) => state.invoice.exportInvoices.error); // Gets any error messages from Redux.
  const [isOpen, setOpen] = useState(false); // Manages the visibility of the submit confirmation dialog.
  const [showWarning, setShowWarning] = useState(false);

  // Split-related local states
  const [splitInputs, setSplitInputs] = useState([]); // Stores the quantity input for splitting each item.
  const [useGlobalScheme, setUseGlobalScheme] = useState(false); // Determines if a single scheme applies to all items.
  const [globalScheme, setGlobalScheme] = useState(""); // Stores the value of the globally selected scheme.
  const [searchQuery, setSearchQuery] = useState("");

  // Destructuring relevant data from the Redux store
  const {
    invoiceDetails,
    updatedInvoiceDetails,
    invoiceType,
    FinalSplitResult,
    FinalInvoicePDFData,
    additionalForm,
    localItems,
    splitItems,
    pdfBlob,
    FinalInvoiceDetails,
    showSubmmit,
  } = useSelector((state) => state?.invoice?.exportInvoices || {});
  const formDAta = additionalForm;
  console.log("FinalInvoiceDetails", FinalInvoiceDetails);

  // useEffect hook to initialize local state from Redux data on load
  useEffect(() => {
    // Guard clause: Exit if invoice details or items are not available.
    if (!invoiceDetails?.items?.length) return;

    // Initialize localItems and splitItems only on the initial load
    // to avoid resetting state during subsequent re-renders.
    if ((!localItems || localItems.length === 0) && (!splitItems || splitItems.length === 0)) {
      dispatch(
        // Copy invoice items into localItems and add scheme/split flags
        setLocalItems(
          invoiceDetails.items.map((item) => ({
            ...item,
            isScheme: false,
            isSplit: false,
            scheme: "Direct",
          }))
        )
      );
    }
    // Initialize splitInputs array with an empty object for each item.
    setSplitInputs(invoiceDetails.items.map(() => ({})));
  }, [invoiceDetails, dispatch]); // Dependencies ensure this runs when invoiceDetails is fetched.

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

  // useEffect to update the invoice details in Redux with the final split result.
  useEffect(() => {
    dispatch(
      SetupdatedInvoiceDetails({
        ...invoiceDetails,
        ...formDAta,
        items: FinalSplitResult,
      })
    );
    dispatch(
      setFinalInvoiceData({
        ...invoiceDetails,
        ...formDAta,
        items: FinalSplitResult,
      })
    );
  }, [FinalSplitResult, formDAta, dispatch, invoiceDetails]);

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

  // useEffect to prepare and dispatch the final data for the invoice.
  useEffect(() => {
    const finalData = prepareFinalData();
    // Dispatch the final data to the Redux store only if it has changed.
    if (JSON.stringify(finalData) !== JSON.stringify(FinalSplitResult)) {
      dispatch(setSplitResult(finalData));
    }
  }, [invoiceType, localItems, splitItems, globalScheme, useGlobalScheme, dispatch, FinalSplitResult]); // Runs whenever relevant data changes.

  // UseMemo to get the user's currency symbol and code.
  const userCurrency = getCurrency(invoiceDetails?.usercurrency);
  // useMemo for efficient total quantity calculation.
  const totalQTY = useMemo(() => {
    const items = [...(localItems || []), ...(splitItems || [])];
    return items.reduce(
      (sum, item) => sum + (Number(item?.itemQty) || 0),
      0
    );
  }, [localItems, splitItems]);

  // useMemo for efficient total price calculation.
  const grandTotal = useMemo(() => {
    const items = [...(localItems || []), ...(splitItems || [])];

    return items.reduce((sum, item) => {
      const tyre = Number(item?.basicprice) || 0;
      const rim = Number(item?.rimUnitPrice) || 0;
      const qty = Number(item?.itemQty) || 0;

      return sum + (tyre + rim) * qty;
    }, 0);
  }, [localItems, splitItems]);

  // useMemo for efficient total finished weight (FWT) calculation.
  const totalFWT = useMemo(() => {
    const items = [...(localItems || []), ...(splitItems || [])];
    return items.reduce((sum, item) => {
      const tyrefw = Number(item?.finishedWt) || 0;
      const rimfw = Number(item?.rimfinishedwt) || 0;
      const qty = Number(item?.itemQty) || 0;
      return sum + (tyrefw + rimfw) * qty;
    }, 0);
  }, [localItems, splitItems]);


  // Function to handle changing the invoice type (Direct or Scheme).
  const handleInvoiceTypeChange = (type) => {
    dispatch(setInvoiceType(type)); // Update the invoice type in Redux.
    dispatch(setShowSubmit(false));
    // If the type is "Direct_Invoice," reset all split-related states.
    if (type === "Direct_Invoice") {
      setUseGlobalScheme(false);
      setGlobalScheme("");

      // Set all local items to "Direct" scheme.
      dispatch(
        setLocalItems(
          (invoiceDetails?.items || []).map((item) => ({
            ...item,
            scheme: "Direct",
            isSplit: false,
            isScheme: false,
          }))
        )
      );
      dispatch(setSplitItems([])); // Clear the split items array.
      setSplitInputs((invoiceDetails?.items || []).map(() => ({}))); // Reset split inputs.
    }
  };

  // useMemo to group items by plant for "COMBI" shipments.
  const combiOrders = useMemo(() => {
    if (invoiceDetails?.shipmentType !== "COMBI" || !invoiceDetails?.items) {
      return {};
    }

    return invoiceDetails.items.reduce((acc, item) => {
      const plant = item?.plant || "UNKNOWN";
      if (!acc[plant]) acc[plant] = [];
      acc[plant].push(item);
      return acc;
    }, {});
  }, [invoiceDetails?.shipmentType, invoiceDetails?.items]);

  // Function to close the AdditionalDetailsForm modal.
  const handleCloseForm = () => {
    setShowDetailsForm(false);
  };

  // Function to handle the final submission of the invoice.
  const handleSubmit = async () => {
    // If you want to send pdfBlob as FormData, you can re-enable later.
    // console.clear('submit',FinalInvoiceDetails)
    dispatch(submitInvoice(FinalInvoiceDetails, navigate));
  };

  // Function to handle changes in the global scheme selection.
  const handleGlobalSchemeChange = (value) => {
    if (value === "Individual_Scheme") {
      // If "Individual Scheme" is selected, disable global scheme.
      setUseGlobalScheme(false);
      setGlobalScheme("");
      return;
    }
    // Otherwise, enable global scheme and set its value.
    setUseGlobalScheme(true);
    setGlobalScheme(value);
    dispatch(setShowSubmit(false)); // for hide submit

    // Apply the global scheme to all local items that don't already have one.
    const updatedLocalItems = (localItems || []).map((item) => ({
      ...item,
      scheme: value, // Set the global scheme value
      isScheme: true, // Explicitly set isScheme to true
    }));
    dispatch(setLocalItems(updatedLocalItems));
  };

  const handleSplitItem = (index) => {
    dispatch(setShowSubmit(false));
    const { splitQty } = splitInputs[index] || {};
    const originalItem = (localItems || [])[index];

    if (!originalItem) {
      toast.error("Original item not found");
      return;
    }

    // Validation: Check for invalid split quantities.
    if (!splitQty || splitQty <= 0 || splitQty >= originalItem.itemQty) {
      toast.error("Invalid split quantity");
      return;
    }

    // --- Start of new validation to disallow decimals ---
    if (!Number.isInteger(splitQty)) {
      toast.error("Please enter a whole number for the split quantity.");
      return;
    }
    // --- End of new validation ---

    // Determine the scheme to apply based on the item or global setting.
    const appliedScheme =
      originalItem.scheme || (useGlobalScheme ? globalScheme : "");

    // Validation: Ensure a valid scheme is selected before splitting.
    if (!appliedScheme || appliedScheme === "Direct") {
      toast.error("Please select a valid scheme before splitting");
      return;
    }

    // Create a new array of local items.
    const updatedLocalItems = [...(localItems || [])];
    // Decrease the original item's quantity.
    updatedLocalItems[index] = {
      ...originalItem,
      isSplit: true, // Mark it as split.
      itemQty: originalItem.itemQty - splitQty,
      actualQty: originalItem.itemQty,
    };
    dispatch(setLocalItems(updatedLocalItems)); // Update local items in Redux.

    // Create a new array of split items.
    const newSplitItems = [...(splitItems || [])];
    // Check if a split item with the same scheme already exists for this original item.
    const existingIndex = newSplitItems.findIndex(
      (s) => s.originalIndex === index && s.scheme === appliedScheme
    );

    if (existingIndex !== -1) {
      // If it exists, update the quantity of the existing split item.
      newSplitItems[existingIndex] = {
        ...newSplitItems[existingIndex],
        itemQty: newSplitItems[existingIndex].itemQty + splitQty,
        splitQty: (newSplitItems[existingIndex].splitQty || 0) + splitQty,
        actualQty: originalItem.itemQty,
      };
    } else {
      // Otherwise, create a new split item.
      newSplitItems.push({
        ...originalItem,
        originalIndex: index,
        itemQty: splitQty,
        splitQty,
        scheme: appliedScheme,
        isScheme: true,
        isSplit: true,
      });
    }
    dispatch(setSplitItems(newSplitItems)); 

    // Clear the split quantity input for the item.
    setSplitInputs((prev) => {
      const newInputs = [...prev];
      newInputs[index] = {};
      return newInputs;
    });
  };

  // Function to remove a split item and return its quantity to the original item.
  const handleRemoveSplitItem = (splitItem, splitIndex) => {
    const updatedLocalItems = [...(localItems || [])];
    const originalItemIndex = splitItem.originalIndex;

    // Find the original item and add the quantity back.
    if (
      typeof originalItemIndex === "number" &&
      updatedLocalItems[originalItemIndex]
    ) {
      updatedLocalItems[originalItemIndex] = {
        ...updatedLocalItems[originalItemIndex],
        itemQty:
          updatedLocalItems[originalItemIndex].itemQty +
          (splitItem.splitQty || 0),
      };

      // Check if there are any other split items associated with the original item.
      const remainingSplits = (splitItems || []).filter(
        (item, i) =>
          i !== splitIndex && item.originalIndex === originalItemIndex
      );

      // If no other splits from this item exist, remove the isSplit flag from the original item.
      if (remainingSplits?.length === 0) {
        updatedLocalItems[originalItemIndex] = {
          ...updatedLocalItems[originalItemIndex],
          isSplit: false,
        };
      }
    }

    // Filter out the removed split item.
    const newSplits = (splitItems || []).filter((_, i) => i !== splitIndex);

    // Dispatch both updated states to Redux.
    dispatch(setLocalItems(updatedLocalItems));
    dispatch(setSplitItems(newSplits));
  };

  // Helper function to check if a split is valid (not used in the JSX, but defined).
  const isSplitValid = (index, originalItem) => {
    const { splitQty, scheme } = splitInputs[index] || {};
    return (
      splitQty &&
      splitQty > 0 &&
      splitQty < originalItem.itemQty &&
      (scheme || "").trim() !== ""
    );
  };

  // Function to merge local and split items into a final data array for submission.
  const prepareFinalData = () => {
    if (!invoiceDetails?.items) return [];

    const merged = [...(localItems || []), ...(splitItems || [])]; // Combine the two arrays.

    // Map over the merged array to finalize the scheme property.
    return merged.map((item) => {
      if (invoiceType === "Direct_Invoice") {
        // If direct invoice, ensure scheme is "Direct" and flags are false.
        return { ...item, scheme: "Direct", isScheme: false, isSplit: false };
      }
      // Otherwise, return the item as-is.
      return { ...item };
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col layout-scroll p-2 gap-2 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex flex-wrap items-center justify-between bg-white bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-2 rounded-lg shadow-2xs border border-[var(--secondary)] dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/TTS/International/Invoice/CustomInvoice", { state: { type: "Custom" } })}
            className="text-gray-500 hover:text-[var(--primary)] transition-colors"
            title="Back to Custom Invoices"
          >
            <IoChevronBackCircleOutline size={28} />
          </button>
          <div>
          <h1 className="text-xl font-bold  tracking-tight">
            {invoiceDetails?.type} Invoice Details
          </h1>
          <p className="text-sm text-slate-500 ">
            Fill in the details below to generate and finalize this invoice
          </p>
          </div>
        </div>
      </div>

      {loading ? (<ClientDetailsSkeleton />) : (<ClientDetailsSection
        invoiceDetails={{ ...invoiceDetails, ...additionalForm }}
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
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-sm text-gray-700 dark:text-gray-300">
              Invoice Type
            </label>
            <select
              className="border rounded px-1 py-1"
              onChange={(e) => handleInvoiceTypeChange(e.target.value)}
              value={invoiceType}
            >
              <option value="Direct_Invoice">Direct Invoice</option>
              <option value="Scheme_Invoice">Scheme Invoice</option>
            </select>
          </div>
          {/* Global Scheme */}
          {invoiceType === "Scheme_Invoice" && (
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">
                Select Scheme
              </label>
              <select
                className="border rounded px-2 py-1"
                value={useGlobalScheme ? globalScheme : "Individual_Scheme"}
                onChange={(e) => handleGlobalSchemeChange(e.target.value)}
              >
                <option value="Individual_Scheme">Individual scheme</option>
                <option value="Advance">Advance</option>
                <option value="Moowr">Moowr</option>
                <option value="Import Invoice">Import Invoice</option>
                <option value="DDB">DDB</option>
              </select>
            </div>
          )}
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
              {(localItems || []).map((item, idx) => {
                if (!matchesSearch(item)) return null;
                const tyre = Number(item?.basicprice) || 0;
                const rim = Number(item?.rimUnitPrice) || 0 ;
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

                    {invoiceType === "Scheme_Invoice" && (
                      <>
                        <td>
                          <input
                            type="number"
                            min="1"
                            max={item.itemQty}
                            value={splitInputs[idx]?.splitQty || ""}
                            onChange={(e) =>
                              setSplitInputs((prev) => {
                                const newInputs = [...prev];
                                newInputs[idx] = {
                                  ...newInputs[idx],
                                  splitQty: Number(e.target.value),
                                };
                                return newInputs;
                              })
                            }
                            className="w-16 border rounded px-1"
                          />
                        </td>

                        <td colSpan={2}>
                          <select
                            value={item.scheme === "Direct" ? "" : item.scheme}
                            onChange={(e) => {
                              dispatch(setShowSubmit(false));
                              const schemeValue = e.target.value;
                              const updated = [...(localItems || [])];
                              updated[idx] = {
                                ...updated[idx],
                                scheme: schemeValue ? schemeValue : "Direct",
                                isScheme: !!schemeValue,
                              };
                              dispatch(setLocalItems(updated));
                            }}
                          >
                            <option value="">Select Scheme</option>
                            <option value="Advance">Advance</option>
                            <option value="Moowr">Moowr</option>
                            <option value="Import Invoice">Import Invoice</option>
                            <option value="DDB">DDB</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className={`px-2 rounded ${splitInputs[idx]?.splitQty
                              ? "bg-blue-500 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            disabled={!splitInputs[idx]?.splitQty}
                            onClick={() => handleSplitItem(idx)}
                          >
                            Split
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}

              {/* Display Split Items */}
              {(splitItems || []).map((splitItem, i) => {
                if (!matchesSearch(splitItem)) return null;
                const tyre = Number(splitItem?.basicprice) || 0;
                const rim = splitItem?.rimStatus ? Number(splitItem?.rimUnitPrice) || 0 : 0;
                const qty = Number(splitItem?.splitQty) || 0;
                const tyrefw = Number(splitItem?.finishedWt) || 0;
                const rimfw = Number(splitItem?.rimfinishedwt) || 0;
                return (
                  <tr
                    key={`split-${i}`}
                    className="text-[13px] dark:text-black text-center bg-yellow-100 border-b border-[var(--primary-hover)]/30"
                  >
                    <td>{splitItem.category}</td>
                    <td>{splitItem.platforms}</td>
                    <td colSpan={2}>{splitItem.tyreSize}</td>
                    <td>{splitItem.tyreRim}</td>
                    <td>{splitItem.tyreType}</td>
                    <td>{splitItem.brand}</td>
                    <td>{splitItem.sidewall || "-"}</td>
                    <td>{splitItem.basicprice}</td>
                    <td>{splitItem.splitQty}</td>
                    <td>{((tyre + rim) * qty).toFixed(2)}</td>
                    <td>{((tyrefw + rimfw) * qty).toFixed(3)}</td>
                    <td colSpan={2}>{splitItem.additionalInfo || "-"}</td>
                    <td>{splitItem.plant}</td>
                    <td className="break-all">{splitItem.itemCode}</td>
                    <td>-</td>
                    <td colSpan={2}>{splitItem.scheme}</td>

                    {/* Remove Button */}
                    <td>
                      <button
                        className="bg-red-500 text-white px-2 rounded"
                        onClick={() => handleRemoveSplitItem(splitItem, i)}
                      >
                        Remove
                      </button>
                    </td>
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

      {invoiceDetails?.shipmentType === "COMBI" && (
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

        {/* Preview PDF: fixed invalid JSX and made condition clear */}
        {/* {!formDAta && (() => {
  let allowButton = true;

  if (Array.isArray(FinalInvoiceDetails) && FinalInvoiceDetails.length > 0) {
    const allDirect = FinalInvoiceDetails.every(
      (inv) => inv?.scheme?.trim()?.toLowerCase() === "direct"
    );

    const hasAdvancedType = FinalInvoiceDetails.some((inv) =>
      ["advance", "Moover", "DDB"].includes(inv?.scheme?.trim()?.toLowerCase())
    );

    const allAdvancedHaveLicence = FinalInvoiceDetails
      .filter((inv) =>
        ["advance", "Moover", "DDB"].includes(inv?.scheme?.trim()?.toLowerCase())
      )
      .every(
        (inv) =>
          inv?.schemeLicences &&
          Object.keys(inv.schemeLicences).length > 0
      );

    // ✅ Logic Decision
    allowButton = allDirect || (hasAdvancedType && allAdvancedHaveLicence);
  }

  return (
    allowButton && (
      <Button
        onClick={() => {
          navigate("/TTS/International/Invoice/Export/BillPDF");
          dispatch(setShowSubmit(true));
        }}
        text="Preview PDF"
      />
    )
  );
})()} */}
        <Button
          onClick={() => {
            navigate("/TTS/International/Invoice/Export/BillPDF");
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
        {formDAta && showSubmmit && (
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
              className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-11/12 max-h-[45rem] min-[44rem] overflow-y-auto border border-gray-300 dark:border-gray-700 custom-scrollbar"
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
              <AdditionalDetailsForm
                onClose={handleCloseForm}
                invoiceDetails={invoiceDetails}
                setShowWarning={setShowWarning}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportInvoicePrepare;

/* ------------------ ClientDetailsSection (unchanged except safe usage) ------------------ */

export function ClientDetailsSection({ invoiceDetails }) {
  const containerRef = useRef(null);
  const orderRefs = useRef([]);
  const shipRefs = useRef([]);
  orderRefs.current = [];
  shipRefs.current = [];

  const addToOrderRefs = (el) => {
    if (el) orderRefs.current.push(el);
  };
  const addToShipRefs = (el) => {
    if (el) shipRefs.current.push(el);
  };

  useLayoutEffect(() => {
    // Set the initial state of the elements to be animated
    if (!containerRef.current) return;
    gsap.set(containerRef.current, { opacity: 0, y: 50 });
    gsap.set(orderRefs.current, { opacity: 0, x: -40 });
    gsap.set(shipRefs.current, { opacity: 0, x: 40 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is visible, run the animations
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.to(containerRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.6,
            })
              .to(
                orderRefs.current,
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.6,
                  stagger: 0.2,
                },
                ">-0.3"
              ) // Start this animation 0.3s before the previous one ends
              .to(
                shipRefs.current,
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.6,
                  stagger: 0.2,
                },
                ">-0.5"
              ); // Start this animation 0.5s before the previous one ends
          } else {
            // Optional: Reset the state when it leaves the viewport
            gsap.set(containerRef.current, { opacity: 0, y: 50 });
            gsap.set(orderRefs.current, { opacity: 0, x: -40 });
            gsap.set(shipRefs.current, { opacity: 0, x: 40 });
          }
        });
      },
      {
        root: null, // Use the viewport as the root
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      // Cleanup the observer when the component unmounts
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []); // The empty dependency array ensures this effect runs once on mount.
  const getAvatarLabel = (name) => {
    if (!name) return "";

    const parts = name.trim().split(" ");
    const firstWord = parts[0];

    // RULE: If the first word is short (3 letters or less), use it as is (e.g., "ATC", "IBM", "MRF")
    if (firstWord.length <= 3) {
      return firstWord.toUpperCase();
    }

    // OTHERWISE: Take the first letter of the first 2 words (e.g., "Moiddeen Kaja" -> "MK")
    if (parts.length === 1) return firstWord.charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-md"
    >
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {invoiceDetails?.custfullname
                  ? invoiceDetails.custfullname
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                  : "?"}
              </span>
            </div>
            <div>
              <h2 className="md:text-2xl font-bold text-gray-900 dark:text-white">
                {invoiceDetails?.custfullname}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Primary Customer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--secondary)] dark:bg-[#1E2939] rounded-lg border border-[var(--primary)] dark:border-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              Order Ref #:{" "}
              <span className="text-green-900 dark:text-green-100">
                {invoiceDetails?.orderRefNo}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              Order Information
            </h3>
            {[
              {
                label: "Ordered Date",
                value: invoiceDetails?.completedDate,
                icon: "📅",
                color: "blue",
              },
              {
                label: "Desired Ship Date",
                value: invoiceDetails?.dispatchedDate,
                icon: "🚢",
                color: "green",
              },
              {
                label: "Bill To",
                value: (
                  <>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {invoiceDetails?.billingCompanyName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.billingAddress?.split("~").join(", ")}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.billingCity}
                    </div>
                    {invoiceDetails?.billingState && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {invoiceDetails?.billingState}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.billingCountry} -{" "}
                      {invoiceDetails?.billingZipcode}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                      Contact: {invoiceDetails?.billingContactName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Email: {invoiceDetails?.billingEmailId} - Phone:{" "}
                      {invoiceDetails?.billingMobile}
                    </div>
                  </>
                ),
                icon: "📍",
                color: "purple",
              },
              {
                label: "Special Instruction",
                value: invoiceDetails?.splIns || "Handle with care",
                icon: "⚠️",
                color: "orange",
              },
            ].map((item, i) => (
              <div
                key={i}
                ref={addToOrderRefs}
                className="relative p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-[var(--primary)]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gray-200 dark:bg-gray-700">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold dark:text-gray-400 uppercase tracking-wide mb-1">
                      {item.label}
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {item.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Shipping Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              Shipping Information
            </h3>
            {[
              invoiceDetails?.preCarriageBy === "AIR"
                ? {
                  label: "Delivery Method",
                  value: "Air Freight",
                  icon: "✈️",
                  color: "blue",
                }
                : invoiceDetails?.preCarriageBy === "SEA"
                  ? {
                    label: "Delivery Method",
                    value: "Sea Freight",
                    icon: "🚢",
                    color: "green",
                  }
                  : invoiceDetails?.preCarriageBy === "ROAD"
                    ? {
                      label: "Delivery Method",
                      value: "Road Freight",
                      icon: "🚚",
                      color: "orange",
                    }
                    : {
                      label: "Delivery Method",
                      value: "Please Add Delivery Method",
                      icon: "❗",
                      color: "red",
                    },
              {
                label: "Packing Method",
                value: "Wooden Crates",
                icon: "📦",
                color: "brown",
              },
              {
                label: "Ship To",
                value: (
                  <>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {invoiceDetails?.shippingCompanyName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.shippingAddress?.split("~").join(", ")}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.shippingCity}
                    </div>
                    {invoiceDetails?.shippingState && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {invoiceDetails?.shippingState}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.shippingCountry} -{" "}
                      {invoiceDetails?.shippingZipcode}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                      Contact: {invoiceDetails?.shippingContactName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Email: {invoiceDetails?.shippingEmailId} - Phone:{" "}
                      {invoiceDetails?.shippingMobile}
                    </div>
                  </>
                ),
                icon: "🏠",
                color: "green",
              },
              {
                label: "Special Notes",
                value:
                  invoiceDetails?.specialRequset || "Urgent delivery required",
                icon: "⚡",
                color: "yellow",
              },
            ].map((item, i) => (
              <div
                key={i}
                ref={addToShipRefs}
                className="relative p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-[var(--primary)]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gray-200 dark:bg-gray-700">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold dark:text-gray-400 uppercase tracking-wide mb-1">
                      {item.label}
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {item.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientDetailsSkeleton() {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-md">

      {/* Header Skeleton */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-600">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Avatar Circle */}
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0"></div>

            {/* Name and Title Lines */}
            <div className="space-y-2 w-full sm:w-48">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>

          {/* Right Badge Skeleton */}
          <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column Skeleton */}
          <div className="space-y-6">
            {/* Column Title */}
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>

            {/* Generate 4 skeleton cards to match the 4 items in your original list */}
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={`left-${i}`} />
            ))}
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            {/* Column Title */}
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>

            {/* Generate 4 skeleton cards */}
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={`right-${i}`} isAddress={i === 2} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper Sub-component for the individual cards
function SkeletonCard({ isAddress = false }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-start gap-3">
        {/* Icon Box */}
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 animate-pulse"></div>

        {/* Text Area */}
        <div className="flex-1 space-y-2 py-1">
          {/* Label */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>

          {/* Value */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>

          {/* If it's the address card (index 2 usually), add extra lines */}
          {isAddress && (
            <>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}