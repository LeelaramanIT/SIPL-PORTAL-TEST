import { useEffect, useMemo, useRef, useState } from "react";
import AdditionalDetailsForm from "./AdditionalDetailsForm.jsx";
import TitleText from "../../../../../components/TitleText.jsx";
import gsap from "gsap";
import Button from "../../../../../components/InputFields/Button.jsx";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TableSkeleton from "./TableSkeleton.jsx";

const ExportInvoicePrepare = () => {
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const navigate = useNavigate();
  const loading = useSelector((state) => state.invoice.export.loading);

  const invoiceDataRaw = useSelector(
    (state) => state?.invoice?.export?.invoiceData?.salesData
  );


  const invoiceData = useMemo(() => {
    return Array.isArray(invoiceDataRaw) ? invoiceDataRaw : [];
  }, [invoiceDataRaw]);

  const rowsRef = useRef([]);
  const div1 = useRef(null);
  const div2 = useRef(null);
  const formRef = useRef(null);

  const grandTotal = useMemo(() => {
    return invoiceData.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [invoiceData]);
  const totalQTY = useMemo(() => {
    return invoiceData.reduce((sum, item) => sum + item.qty, 0);
  }, [invoiceData]);

  const totalFWT = useMemo(() => {
    return invoiceData.reduce((sum, item) => sum + item.fwt, 0);
  }, [invoiceData]);
  useEffect(() => {
    const rows = rowsRef.current.filter(Boolean);
    const tl = gsap.timeline();

    tl.fromTo(
      [div1.current, div2.current],
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.2,
        ease: "power2.out",
      }
    );

    if (rows.length > 0) {
      tl.fromTo(
        rows,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.1,
          ease: "power2.out",
        },
        "+=0.2"
      );
    }
  }, []);

  useEffect(() => {
    if (showDetailsForm && formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, scale: 0.8, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
        }
      );
    }
  }, [showDetailsForm]);

  const handleCloseForm = () => {
    if (formRef.current) {
      gsap.to(formRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 50,
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => setShowDetailsForm(false),
      });
    } else {
      setShowDetailsForm(false);
    }
  };

  useEffect(() => {
    const layoutScrollContainer = document.querySelector(".layout-scroll");
    if (layoutScrollContainer) {
      layoutScrollContainer.style.overflow = showDetailsForm
        ? "hidden"
        : "auto";
    }
    return () => {
      if (layoutScrollContainer) layoutScrollContainer.style.overflow = "auto";
    };
  }, [showDetailsForm]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", showDetailsForm);
  }, [showDetailsForm]);

  return (
    <div
      ref={div1}
      className="w-full flex-1 flex flex-col layout-scroll p-4 gap-6 dark:bg-gray-900 dark:text-gray-100"
    >
      <TitleText title="Client Details" />
      
      {/* Enhanced Client Details Card */}
      <div
        ref={div2}
        className="group relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-1"
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Header Section */}
        <div className="relative px-6 py-5 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">KM</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Kaja Moideen
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Primary Customer</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-700 group-hover:scale-105 transition-transform duration-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                Order Ref #: <span className="text-green-900 dark:text-green-100">ORD-123456</span>
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
                  value: "2025-05-14",
                  icon: "📅",
                  color: "blue"
                },
                {
                  label: "Desired Ship Date",
                  value: "2025-06-01",
                  icon: "🚢",
                  color: "green"
                },
                {
                  label: "Bill To",
                  value: (
                    <>
                      <div className="font-medium text-gray-900 dark:text-white">Kaja Moideen</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Customer Address Info Laborum do sint sit pariatur consequat dolore....
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
                  className="group/item relative p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 dark:from-${item.color}-900/30 dark:to-${item.color}-800/30 flex items-center justify-center text-lg group-hover/item:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
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
                  value: "Receiver Address Info Customer Address Info Laborum do sint sit pariatur consequat dolore....",
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
                  className="group/item relative p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-md transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 dark:from-${item.color}-900/30 dark:to-${item.color}-800/30 flex items-center justify-center text-lg group-hover/item:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
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
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-700 dark:text-green-300">Active</span>
          </div>
        </div>
      </div>

      <TitleText title="Item Details" />

      {/* Table */}
      {loading && invoiceData ? (
        <TableSkeleton />
      ) : (
        <div className="max-h-[calc(100vh-63px-150px)] w-full overflow-y-auto custom-scrollbar bg-[#f7f2ef] dark:bg-gray-800 shadow-sm">
          <table className="w-full text-sm text-left table-fixed">
            <thead className="bg-[var(--color-background)] dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold sticky top-0 z-10">
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
                ].map((head, idx) =>
                  idx === 11 ? (
                    <th
                      key={idx}
                      colSpan={2}
                      className="px-1  text-center text-[13px]"
                    >
                      {head}
                    </th>
                  ) : (
                    <th key={idx} className="px-1 py-4 text-center text-[13px]">
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {invoiceData.map((item, idx) => (
                <tr
                  key={idx}
                  ref={(el) => (rowsRef.current[idx] = el)}
                  className={`text-[13px] text-center ${
                    idx % 2 === 0
                      ? "bg-[var(--color-secondary)] dark:bg-gray-700"
                      : "bg-white dark:bg-gray-800"
                  } text-gray-700 dark:text-gray-300`}
                >
                  <td>{item.category}</td>
                  <td>{item.platform}</td>
                  <td>{item.tyreSize}</td>
                  <td>{item.rim}</td>
                  <td>{item.type}</td>
                  <td>{item.brand}</td>
                  <td>{item.sidewall}</td>
                  <td>{item.basicPrice}</td>
                  <td>{item.qty}</td>
                  <td>{item.totalPrice.toFixed(2)}</td>
                  <td>{item.fwt.toFixed(3)}</td>
                  <td colSpan={2} title={item.additionalInfo}>
                    {item.additionalInfo}
                  </td>
                  <td>{item.plant}</td>
                  <td className="break-all">{item.partNo}</td>
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
                <td className="px-4 py-2 text-center">{totalFWT.toFixed(3)}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center mt-4">
        <Button
          onClick={() => {
            navigate("/TTS/International/Invoice/Export/BillPDF");
          }}
          text="Preview PDF"
        />
        <Button
          onClick={() => setShowDetailsForm(true)}
          text="+ Add Additional Details"
        />
        <Button onClick={() => {}} text="Submit Invoice" />
      </div>

      {/* Additional Details Form */}
      {showDetailsForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm layout-scroll flex items-center justify-center">
          <div
            ref={formRef}
            className="relative bg-white mt-[22rem] dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[40rem] overflow-y-auto border border-gray-300 dark:border-gray-700 custom-scrollbar"
          >
            <TitleText title="Additional Invoice Details" />
            <button
              onClick={handleCloseForm}
              className="absolute top-9 right-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white z-20"
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
