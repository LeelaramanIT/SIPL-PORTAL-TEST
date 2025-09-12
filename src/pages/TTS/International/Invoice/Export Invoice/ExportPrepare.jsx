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
} from "../../../../../Redux/Slices/InvoiceSlice.jsx";

const ExportInvoicePrepare = () => {
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.invoice.exportInvoices.loading);
  const error = useSelector((state) => state.invoice.exportInvoices.error);
  const [isOpen, setOpen] = useState(false);
  //split states
  const [splitInputs, setSplitInputs] = useState([]);
  const [useGlobalScheme, setUseGlobalScheme] = useState(false);
  const [globalScheme, setGlobalScheme] = useState("");
  const {
    invoiceDetails,
    updatedInvoiceDetails,
    invoiceType,
    FinalSplitResult,
    additionalForm,
    localItems,
    splitItems,
  } = useSelector((state) => state?.invoice?.exportInvoices || {});
  const formDAta = additionalForm;
  console.log(updatedInvoiceDetails)
  useEffect(() => {
    if (!invoiceDetails?.items?.length) return;
    if (localItems?.length === 0 && splitItems?.length === 0) {
      dispatch(
        setLocalItems(invoiceDetails.items.map((item) => ({ ...item })))
      );
    }
    setSplitInputs(invoiceDetails.items.map(() => ({})));
  }, [invoiceDetails, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(()=>{
    dispatch(SetupdatedInvoiceDetails(FinalSplitResult))
  },[FinalSplitResult])

  useEffect(() => {
    const finalData = prepareFinalData();
    if (JSON.stringify(finalData) !== JSON.stringify(FinalSplitResult)) {
      dispatch(setSplitResult(finalData));
    }
  }, [invoiceType, localItems, splitItems, globalScheme, useGlobalScheme]);

  const userCurrency = getCurrency(invoiceDetails?.usercurrency);

  // calculation for items table
  const grandTotal = useMemo(() => {
    return invoiceDetails?.items.reduce(
      (sum, item) => sum + item?.basicprice * item?.itemQty,
      0
    );
  }, [invoiceDetails]);

  const totalQTY = useMemo(() => {
    return invoiceDetails?.items.reduce((sum, item) => sum + item?.itemQty, 0);
  }, [invoiceDetails]);

  const totalFWT = useMemo(() => {
    return invoiceDetails?.items.reduce(
      (sum, item) => sum + item?.finishedWt * item?.itemQty,
      0
    );
  }, [invoiceDetails]);

  const handleInvoiceTypeChange = (type) => {
    dispatch(setInvoiceType(type));

    if (type === "Direct_Invoice") {
      setUseGlobalScheme(false);
      setGlobalScheme("");

      dispatch(
        setLocalItems(
          invoiceDetails?.items?.map((item) => ({
            ...item,
            scheme: "Direct",
            isScheme: false,
          })) || []
        )
      );
      dispatch(setSplitItems([]));
      setSplitInputs(invoiceDetails?.items?.map(() => ({})) || []);
    }
  };
  // combi orders
  const combiOrders = useMemo(() => {
    if (invoiceDetails?.shipmentType !== "COMBI" || !invoiceDetails?.items)
      return [];
    const grouped = invoiceDetails?.items.reduce((acc, item) => {
      const plant = item.plant;
      if (!acc[plant]) acc[plant] = [];
      acc[plant].push(item);
      return acc;
    }, {});

    return grouped;
  }, [invoiceDetails?.shipmentType, invoiceDetails?.items]);

  const handleCloseForm = () => {
    setShowDetailsForm(false);
  };

  const handleSubmit = () => {
    console.log("Confirm Invoive");
  };

  // global scheme change
  const handleGlobalSchemeChange = (value) => {
    if (value === "Individual_Scheme") {
      setUseGlobalScheme(false);
      setGlobalScheme("");
      return;
    }

    setUseGlobalScheme(true);
    setGlobalScheme(value);

    const updatedLocalItems = localItems?.map((item) =>
      item.isScheme ? item : { ...item, scheme: value }
    );
    dispatch(setLocalItems(updatedLocalItems));
  };

  // split logic
  const handleSplitItem = (index) => {
    const { splitQty } = splitInputs[index] || {};
    const originalItem = localItems[index];

    if (!splitQty || splitQty <= 0 || splitQty >= originalItem.itemQty) {
      toast.error("Invalid split quantity");
      return;
    }

    const appliedScheme =
      originalItem.scheme || (useGlobalScheme ? globalScheme : "");

    if (!appliedScheme || appliedScheme === "Direct") {
      toast.error("Please select a valid scheme before splitting");
      return;
    }

    // Update local items
    const updatedLocalItems = [...localItems];
    updatedLocalItems[index] = {
      ...originalItem,
      isSplit: true,
      itemQty: originalItem.itemQty - splitQty,
    };
    dispatch(setLocalItems(updatedLocalItems));

    // Update split items
    const newSplitItems = [...splitItems];
    const existingIndex = newSplitItems.findIndex(
      (s) => s.originalIndex === index && s.scheme === appliedScheme
    );

    if (existingIndex !== -1) {
      newSplitItems[existingIndex] = {
        ...newSplitItems[existingIndex],
        itemQty: newSplitItems[existingIndex].itemQty + splitQty,
        splitQty: newSplitItems[existingIndex].splitQty + splitQty,
      };
    } else {
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

    setSplitInputs((prev) => {
      const newInputs = [...prev];
      newInputs[index] = {};
      return newInputs;
    });
  };

  const handleRemoveSplitItem = (splitItem, splitIndex) => {
    const updatedLocalItems = [...localItems];
    const originalItemIndex = splitItem.originalIndex;

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
    }

    const newSplits = splitItems?.filter((_, i) => i !== splitIndex);
    dispatch(setLocalItems(updatedLocalItems));
    dispatch(setSplitItems(newSplits));
  };

  // const [invoiceType, setInvoiceType] = useState("Direct");
  const isSplitValid = (index, originalItem) => {
    const { splitQty, scheme } = splitInputs[index] || {};
    return (
      splitQty &&
      splitQty > 0 &&
      splitQty < originalItem.itemQty &&
      (scheme || "").trim() !== ""
    );
  };

  const prepareFinalData = () => {
    if (!invoiceDetails?.items) return [];

    const merged = [...localItems, ...splitItems];

    return merged.map((item) => {
      if (invoiceType === "Direct_Invoice") {
        return { ...item, scheme: "Direct", isScheme: false };
      }
      return { ...item };
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col layout-scroll p-4 gap-6 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold text-[var(--color-primary)] dark:text-gray-200">
        {invoiceDetails?.type} Invoice Details
      </h1>
      <ClientDetailsSection
        invoiceDetails={{ ...invoiceDetails, ...formDAta }}
      />

      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] dark:text-gray-200">
          Item Details
        </h1>

        <div className="flex justify-center gap-4 mb-4">
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">
              Invoice Type
            </label>
            <select
              className="border rounded px-2 py-1"
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
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="max-h-[calc(100vh-63px-150px)] w-full overflow-y-auto custom-scrollbar bg-[#f7f2ef] dark:bg-gray-800 shadow-sm">
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
                    ? ["Split Qty", "Scheme", "Action"]
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
              {localItems.map((item, idx) => (
                <tr
                  key={idx}
                  className={`text-[13px] text-center border-b border-[var(--color-primary-hover)]/30`}
                >
                  {/* Existing Columns */}
                  <td>{item?.category}</td>
                  <td>{item?.platforms}</td>
                  <td colSpan={2}>{item?.tyreSize}</td>
                  <td>{item?.tyreRim}</td>
                  <td>{item?.tyreType}</td>
                  <td>{item?.brand}</td>
                  <td>{item?.sidewall || "-"}</td>
                  <td>{item?.basicprice}</td>
                  <td>{item?.itemQty}</td>
                  <td>{(item?.basicprice * item?.itemQty).toFixed(2)}</td>
                  <td>{(item?.finishedWt * item?.itemQty).toFixed(3)}</td>
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

                      {/* ✅ Only show dropdown if global scheme is NOT used */}
                      {
                        <td colSpan={2}>
                          <select
                            value={item.scheme === "Direct" ? "" : item.scheme}
                            onChange={(e) => {
                              const schemeValue = e.target.value;
                              const updated = [...localItems];
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
                          </select>
                        </td>
                      }

                      <td>
                        <button
                          className={`px-2 rounded ${
                            splitInputs[idx]?.splitQty
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
              ))}

              {/* Display Split Items */}
              {splitItems.map((splitItem, i) => (
                <tr
                  key={`split-${i}`}
                  className="text-[13px] dark:text-black text-center bg-yellow-100 border-b border-[var(--color-primary-hover)]/30"
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

                  <td>
                    {(splitItem.basicprice * splitItem.splitQty).toFixed(2)}
                  </td>

                  <td>
                    {(splitItem.finishedWt * splitItem.splitQty).toFixed(3)}
                  </td>

                  <td colSpan={2}>{splitItem.additionalInfo || '-'}</td>
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
              ))}
            </tbody>

            <tfoot className="font-semibold text-gray-800 dark:text-white">
              <tr className="bg-gray-100 dark:bg-gray-700 sticky bottom-0 z-10 text-xs">
                <td colSpan={9} className="text-right px-4 py-2">
                  Grand Total :
                </td>
                <td className="px-4 py-2 text-center">{totalQTY}</td>
                <td className="px-1 py-1 text-center">
                  {userCurrency.symbol} {grandTotal?.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-center">
                  {totalFWT?.toFixed(3)}
                </td>
                <td></td>
                <td colSpan={3}>Currency : {userCurrency.code}</td>
                {invoiceType === "Scheme_Invoice" && <td colSpan={4}></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {invoiceDetails?.shipmentType == "COMBI" && (
        <>
          <h1 className="text-2xl font-bold text-[var(--color-primary)] dark:text-gray-200">
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
                {Object.entries(combiOrders)?.map(([plant, items], idx) => {
                  // Calculate totals per plant
                  const tyreQty = items.reduce(
                    (sum, item) => sum + item.itemQty,
                    0
                  );
                  const tyrePrice = items.reduce(
                    (sum, item) => sum + item.basicprice * item.itemQty,
                    0
                  );
                  const tyreWt = items.reduce(
                    (sum, item) => sum + item.finishedWt * item.itemQty,
                    0
                  );
                  const rimQty = items.reduce(
                    (sum, item) => sum + item.rimItemQty,
                    0
                  );
                  const rimPrice = items.reduce(
                    (sum, item) => sum + item.rimUnitPrice * item.rimItemQty,
                    0
                  );
                  const rimWt = 0;
                  const totalQty = tyreQty + rimQty;
                  const totalPrice = tyrePrice + rimPrice;
                  const totalWt = tyreWt + rimWt;

                  return (
                    <tr
                      key={plant}
                      className={`text-[13px] text-center ${
                        idx % 2 === 0
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
                  <td className="px-4 py-2 text-center">
                    {grandTotal?.toFixed(2)}
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
        {formDAta && (
          <Button
            onClick={() =>
              navigate("/TTS/International/Invoice/Export/BillPDF")
            }
            text="Preview PDF"
          />
        )}
        {!formDAta ? (
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
        {formDAta && <Button onClick={() => setOpen(true)} text="Submit" />}
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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm layout-scroll flex items-center justify-center"
          >
            <motion.div
              key="modal-content"
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              transition={{ duration: 0.1, ease: "easeIn" }}
              className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-11/12 max-h-[40rem] overflow-y-auto border border-gray-300 dark:border-gray-700 custom-scrollbar"
            >
              <h2 className="text-xl font-bold mb-4 text-[var(--color-primary)]">
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
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportInvoicePrepare;

function ClientDetailsSection({ invoiceDetails }) {
  const containerRef = useRef(null);
  const orderRefs = useRef([]);
  const shipRefs = useRef([]);
  orderRefs.current = [];
  shipRefs.current = [];

  const addToOrderRefs = (el) => {
    if (el && !orderRefs.current.includes(el)) {
      orderRefs.current.push(el);
    }
  };

  const addToShipRefs = (el) => {
    if (el && !shipRefs.current.includes(el)) {
      shipRefs.current.push(el);
    }
  };

  useLayoutEffect(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.6,
      ease: "power3.out",
    });

    gsap.from(orderRefs.current, {
      opacity: 0,
      x: -40,
      duration: 0.6,
      stagger: 0.2,
      delay: 0.3,
      ease: "power3.out",
    });

    gsap.from(shipRefs.current, {
      opacity: 0,
      x: 40,
      duration: 0.6,
      stagger: 0.2,
      delay: 0.5,
      ease: "power3.out",
    });
  }, []);

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
              <span className="text-white font-bold text-lg">MK</span>
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
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-secondary)] dark:bg-[#1E2939] rounded-lg border border-[var(--color-primary)] dark:border-green-700">
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
                      {invoiceDetails.billingCompanyName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.billingAddress?.split("~").join(", ")}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.billingCity}
                    </div>
                    {invoiceDetails.billingState && (
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
                className="relative p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-[var(--color-primary)]"
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
              invoiceDetails?.PreCarriageby === "air"
                ? {
                    label: "Delivery Method",
                    value: "Air Freight",
                    icon: "✈️",
                    color: "blue",
                  }
                : invoiceDetails?.PreCarriageby === "sea"
                ? {
                    label: "Delivery Method",
                    value: "Sea Freight",
                    icon: "🚢",
                    color: "green",
                  }
                : invoiceDetails?.PreCarriageby === "road"
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
                      {invoiceDetails.shippingCompanyName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.shippingAddress?.split("~").join(", ")}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {invoiceDetails?.shippingCity}
                    </div>
                    {invoiceDetails.shippingState && (
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
                  invoiceDetails.specialRequset || "Urgent delivery required",
                icon: "⚡",
                color: "yellow",
              },
            ].map((item, i) => (
              <div
                key={i}
                ref={addToShipRefs}
                className="relative p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-[var(--color-primary)]"
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
