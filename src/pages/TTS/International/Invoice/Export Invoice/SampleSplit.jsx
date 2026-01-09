import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  setInvoiceType,
  setLocalItems,
  setSplitItems,
  setSplitResult,
  SetupdatedInvoiceDetails,
} from "../../../../../Redux/Slices/InvoiceSlice.jsx";
import { getCurrency } from "../../../../../utils/currencies.js";

const SampleSplit = () => {
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.invoice.exportInvoices.loading);
  const error = useSelector((state) => state.invoice.exportInvoices.error);
  const [isOpen, setOpen] = useState(false);
  const {
    invoiceDetails,
    updatedInvoiceDetails,
    invoiceType,
    FinalSplitResult,
    additionalForm,
    localItems,
    splitItems,
  } = useSelector((state) => state?.invoice?.exportInvoices || {});

  // split states
  const [splitInputs, setSplitInputs] = useState([]);
  const [useGlobalScheme, setUseGlobalScheme] = useState(false);
  const [globalScheme, setGlobalScheme] = useState("");

  

  const formDAta = additionalForm;

  useEffect(() => {
    if (!invoiceDetails?.items?.length) return;
    if (localItems?.length === 0 && splitItems?.length === 0) {
      dispatch(setLocalItems(invoiceDetails.items.map((item) => ({ ...item }))));
    }
    setSplitInputs(invoiceDetails.items.map(() => ({})));
  }, [invoiceDetails, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    const finalData = prepareFinalData();
    if (JSON.stringify(finalData) !== JSON.stringify(FinalSplitResult)) {
      dispatch(setSplitResult(finalData));
    }
  }, [invoiceType, localItems, splitItems, globalScheme, useGlobalScheme]);

  const userCurrency = getCurrency(invoiceDetails?.usercurrency);

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
            manualScheme: false,
          })) || []
        )
      );
      dispatch(setSplitItems([]));
      setSplitInputs(invoiceDetails?.items?.map(() => ({})) || []);
    }
  };

  const handleGlobalSchemeChange = (value) => {
    if (value === "Individual_Scheme") {
      setUseGlobalScheme(false);
      setGlobalScheme("");
      return;
    }

    setUseGlobalScheme(true);
    setGlobalScheme(value);

    const updatedLocalItems = localItems?.map((item) =>
      item.manualScheme ? item : { ...item, scheme: value }
    );
    dispatch(setLocalItems(updatedLocalItems));
  };

  const handleSplitItem = (index) => {
    const { splitQty } = splitInputs[index] || {};
    const originalItem = localItems[index];

    if (!splitQty || splitQty <= 0 || splitQty >= originalItem.itemQty) {
      toast.error("Invalid split quantity");
      return;
    }

    const appliedScheme = originalItem.scheme || (useGlobalScheme ? globalScheme : "");

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
        manualScheme: true,
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

    if (typeof originalItemIndex === "number" && updatedLocalItems[originalItemIndex]) {
      updatedLocalItems[originalItemIndex] = {
        ...updatedLocalItems[originalItemIndex],
        itemQty: updatedLocalItems[originalItemIndex].itemQty + (splitItem.splitQty || 0),
      };
    }

    const newSplits = splitItems?.filter((_, i) => i !== splitIndex);
    dispatch(setLocalItems(updatedLocalItems));
    dispatch(setSplitItems(newSplits));
  };

  const prepareFinalData = () => {
    if (!invoiceDetails?.items) return [];

    const merged = [...localItems, ...splitItems];

    return merged.map((item) => {
      if (invoiceType === "Direct_Invoice") {
        return { ...item, scheme: "Direct", manualScheme: false };
      }
      return { ...item };
    });
  };

  return (
    <div className="w-full h-full">
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

      <div className="max-h-[calc(100vh-62px-150px)] w-full overflow-y-auto custom-scrollbar bg-[#f7f2ef] dark:bg-gray-800 shadow-sm">
        <table className="w-full text-sm text-left table-fixed shadow-lg">
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
                "ADDITIONAL INFO",
                "PLANT",
                "PART-NO",
                ...(invoiceType === "Scheme_Invoice"
                  ? ["Split Qty", "Scheme", "Action"]
                  : []),
              ].map((head, idx) => (
                <th key={idx} className="px-1 py-4 text-center text-[13px]">
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {localItems && localItems.map((item, idx) => (
              <tr key={idx} className="text-[13px] text-center border-b">
                <td>{item.category}</td>
                <td>{item.platforms}</td>
                <td colSpan={2}>{item.tyreSize}</td>
                <td>{item.tyreRim}</td>
                <td>{item.tyreType}</td>
                <td>{item.brand}</td>
                <td>{item.sidewall || "-"}</td>
                <td>{item.basicprice}</td>
                <td>{item.itemQty}</td>
                <td>{(item.basicprice * item.itemQty).toFixed(2)}</td>
                <td>{(item.finishedWt * item.itemQty).toFixed(3)}</td>
                <td colSpan={2}>{item.additionalInfo || "-"}</td>
                <td>{item.plant}</td>
                <td>{item.itemCode}</td>

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

                    <td>
                      <select
                        value={item.scheme === "Direct" ? "" : item.scheme}
                        onChange={(e) => {
                          const schemeValue = e.target.value;
                          const updated = [...localItems];
                          updated[idx] = {
                            ...updated[idx],
                            scheme: schemeValue ? schemeValue : "Direct",
                            manualScheme: !!schemeValue,
                          };
                          dispatch(setLocalItems(updated));
                        }}
                      >
                        <option value="">Select Scheme</option>
                        <option value="Advance">Advance</option>
                        <option value="Moowr">Moowr</option>
                      </select>
                    </td>

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

            {splitItems && splitItems.map((splitItem, i) => (
              <tr
                key={`split-${i}`}
                className="text-[13px] text-center bg-yellow-100 border-b"
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
                <td colSpan={2}>-</td>
                <td>{splitItem.plant}</td>
                <td>{splitItem.itemCode}</td>
                <td>{splitItem.scheme}</td>
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
              <td className="px-4 py-2 text-center">{totalFWT?.toFixed(3)}</td>
              <td colSpan={3}>Currency : {userCurrency.code}</td>
              {invoiceType === "Scheme_Invoice" && <td colSpan={3}></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default SampleSplit;