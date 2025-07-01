import { useEffect, useMemo, useState } from "react";
import AdditionalDetailsForm from "./AdditionalDetailsForm.jsx";
import Button from "../../../../../components/InputFields/Button.jsx";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TableSkeleton from "./TableSkeleton.jsx";
import toast from "react-hot-toast";

const ExportInvoicePrepare = () => {
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const navigate = useNavigate();
  const loading = useSelector((state) => state.invoice.exportInvoices.loading);
  const error = useSelector((state) => state.invoice.exportInvoices.error);
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
  const invoiceData = useSelector(
    (state) => state?.invoice?.exportInvoices?.invoiceDetails?.sales
  );

  const invoiceAddress = useSelector((state)=> state?.invoice?.exportInvoices?.invoiceDetails?.address)
  // console.log(invoiceAddress);
  

  // const invoiceData = useMemo(
  //   () => (Array.isArray(invoiceDataRaw) ? invoiceDataRaw : []),
  //   [invoiceDataRaw]
  // );
  
  console.log(invoiceData);

  const grandTotal = useMemo(() => {
    return invoiceData?.items.reduce((sum, item) => sum + item?.basicprice * item?.itemQty, 0);
  }, [invoiceData]);
  
  const totalQTY = useMemo(() => {
    return invoiceData?.items.reduce((sum, item) => sum + item?.itemQty, 0);
  }, [invoiceData]);
  

  const totalFWT = useMemo(() => {
    return invoiceData?.items.reduce((sum, item) => sum + item?.finishedWt * item?.itemQty, 0);
  }, [invoiceData]);
  

  const handleCloseForm = () => {
    setShowDetailsForm(false);
  };

  return (
    <div className="w-full flex-1 flex flex-col layout-scroll p-4 gap-6 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold text-[var(--color-primary)] dark:text-gray-200">
        Client Details
      </h1>
      <ClientDetailsSection invoiceDetails={{ ...invoiceAddress, ...invoiceData }} />

      <h1 className="text-2xl font-bold text-[var(--color-primary)] dark:text-gray-200">
        Item Details
      </h1>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="max-h-[calc(100vh-63px-150px)] w-full overflow-y-auto custom-scrollbar bg-[#f7f2ef] dark:bg-gray-800 shadow-sm">
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
                ].map((head, idx) => (
                  <th
                    key={idx}
                    colSpan={idx === 11 ? 2 : 1}
                    className="px-1 py-4 text-center text-[13px]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoiceData?.items.map((item, idx) => (
                <tr
                  key={idx}
                  className={`text-[13px] text-center ${
                    idx % 2 === 0
                      ? "bg-[#F4F3FE] dark:bg-gray-700"
                      : "bg-white dark:bg-gray-800"
                  } text-gray-700 dark:text-gray-300`}
                >
                  <td>{item?.category}</td>
                  <td>{item?.platforms}</td>
                  <td>{item?.tyreSize}</td>
                  <td>{item?.tyreRim}</td>
                  <td>{item?.tyreType}</td>
                  <td>{item?.brand}</td>
                  <td>{item?.sidewall}</td>
                  <td>{item?.basicprice}</td>
                  <td>{item?.itemQty}</td>
                  <td>{(item?.basicprice * item?.itemQty).toFixed(2)}</td>
                  <td>{(item?.finishedWt * item?.itemQty).toFixed(3)}</td>
                  <td colSpan={2} title={item?.additionalInfo}>
                    {item?.additionalInfo}
                  </td>
                  <td>{item?.plant}</td>
                  <td className="break-all">{item?.itemCode}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-semibold text-gray-800 dark:text-white">
              <tr className="bg-gray-100 dark:bg-gray-700 sticky bottom-0 z-10">
                <td colSpan={8} className="text-right px-4 py-2">
                  Grand Total:
                </td>
                <td className="px-4 py-2 text-center">{totalQTY}</td>
                <td className="px-4 py-2 text-center">
                  {grandTotal.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-center">
                  {totalFWT.toFixed(3)}
                </td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center mt-4">
        <Button
          onClick={() => navigate("/TTS/International/Invoice/Export/BillPDF")}
          text="Preview PDF"
        />
        <Button onClick={() => setShowDetailsForm(true)} text="+ Add Additional Details" />
        <Button onClick={() => {}} text="Submit Invoice" />
      </div>

      {/* Modal Form */}
      {showDetailsForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm layout-scroll flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-6xl max-h-[80rem] overflow-y-auto border border-gray-300 dark:border-gray-700 custom-scrollbar">
            <h2 className="text-xl font-bold mb-4 text-[var(--color-primary)]">Additional Invoice Details</h2>
            <button
              onClick={handleCloseForm}
              className="absolute top-5 right-5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white z-20"
            >
              <IoMdClose className="text-2xl" />
            </button>
            <AdditionalDetailsForm onClose={handleCloseForm} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportInvoicePrepare;



  function ClientDetailsSection({ div2 ,invoiceDetails }) {
    console.log(invoiceDetails);
    
    return (
      <>
        <div
          ref={div2}
          className="group relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-1"
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          {/* Header Section */}
          <div className="relative px-6 py-5 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">MK</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-[var(--color-primary)] dark:group-hover:text-blue-400 transition-colors duration-300">
                    {invoiceDetails?.custfullname}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Primary Customer</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-secondary)] dark:bg-[#1E2939] dark:to-emerald-900/30 rounded-lg border border-[var(--color-primary)] dark:border-green-700 group-hover:scale-105 transition-transform duration-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Order Ref #: <span className="text-green-900 dark:text-green-100">{invoiceDetails?.orderRefNo}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Grid Details */}
          <div className="relative p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
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
                    color: "blue"
                  },
                  {
                    label: "Desired Ship Date",
                    value: invoiceDetails?.dispatchedDate,
                    icon: "🚢",
                    color: "green"
                  },
                  {
                    label: "Bill To",
                    value: (
                      <>
                        <div className="font-medium text-gray-900 dark:text-white">{invoiceDetails.billingCompanyName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {invoiceDetails?.billingAddress?.split('~').join(', ')}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {invoiceDetails?.billingCity},
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {invoiceDetails?.billingCountry} - {invoiceDetails?.billingZipcode}.
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Email: {invoiceDetails?.billingEmailId} - Phone: {invoiceDetails?.billingMobile}
                        </div>
                      </>
                    ),
                    icon: "📍",
                    color: "purple"
                  },
                  {
                    label: "Special Instruction",
                    value: "Handle with care",
                    icon: "⚠️",
                    color: "orange"
                  }
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="group/item relative p-4 hover:text-[var(--color-primary)] bg-[var(--color-thered)] dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${item?.color}-100 to-${item?.color}-200 dark:from-${item?.color}-900/30 dark:to-${item?.color}-800/30 flex items-center justify-center text-lg group-hover/item:scale-110 transition-transform duration-300`}>
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
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  Shipping Information
                </h3>
                {[
                  {
                    label: "Delivery Method",
                    value: "Air Freight",
                    icon: "✈️",
                    color: "blue"
                  },
                  {
                    label: "Packing Method",
                    value: "Wooden Crates",
                    icon: "📦",
                    color: "brown"
                  },
                  {
                    label: "Ship To",
                    value: 
                    <>
                    <div className="font-medium text-gray-900 dark:text-white">{invoiceDetails.shippingCompanyName}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {invoiceDetails?.shippingAddress?.split('~').join(', ')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {invoiceDetails?.shippingCity},
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {invoiceDetails?.shippingCountry} - {invoiceDetails?.shippingZipcode}.
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Email: {invoiceDetails?.shippingEmailId} - Phone: {invoiceDetails?.shippingMobile}
                    </div>  
                  </>
                  ,
                    icon: "🏠",
                    color: "green"
                  },
                  {
                    label: "Special Notes",
                    value: "Urgent delivery required",
                    icon: "⚡",
                    color: "yellow"
                  }
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="group/item relative hover:text-[var(--color-primary)] p-4 bg-[var(--color-thered)] dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-md transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 dark:from-${item.color}-900/30 dark:to-${item.color}-800/30 flex items-center justify-center text-lg group-hover/item:scale-110 transition-transform duration-300`}>
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
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="absolute top-13 left-50">
            <div className="flex items-center gap-2 px-3 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full border border-[var(--color-primary)] dark:border-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Active</span>
            </div>
          </div>
        </div>
      </>
    );
  }