import { useEffect, useRef, useState } from "react";
import AdditionalDetailsForm from "./AdditionalDetailsForm.jsx";
import TitleText from "../../../../../components/TitleText.jsx";
import gsap from "gsap";

const ExportInvoicePrepare = () => {
  const [showDetailsForm, setShowDetailsForm] = useState(false);

  const invoiceData = Array.from({ length: 20 }, (_, i) => ({
    category: "Truck",
    platform: "6-Wheel",
    tyreSize: "295/80R22.5",
    rim: "22.5",
    type: "Radial",
    brand: "Michelin",
    sidewall: "Black",
    basicPrice: 250.0,
    qty: 4 + i,
    totalPrice: 250.0 * (4 + i),
    fwt: `${500 + i * 10}kg`,
    additionalInfo: "None",
    plant: `Plant ${String.fromCharCode(65 + (i % 3))}`, // A, B, C
    partNo: `P-167807C18060713${i.toString().padStart(2, "0")}A`,
  }));

  const rowsRef = useRef([]);

  const grandTotal = invoiceData.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  const header = [
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
  ];

  const animateRows = () => {
    const element = rowsRef.current.filter(Boolean);
    if (element.length > 0) {
      gsap.fromTo(
        element,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 }
      );
    }
    gsap.fromTo(
      [div1.current, div2.current, div3.current, div4.current, div5.current],
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.2,
        ease: "power2.out",
      }
    );
  };

  const div1 = useRef(null);
  const div2 = useRef(null);
  const div3 = useRef(null);
  const div4 = useRef(null);
  const div5 = useRef(null);

  useEffect(() => {
    animateRows();
  }, []);

  useEffect(() => {
    if (showDetailsForm) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => document.body.classList.remove("overflow-hidden");
  }, [showDetailsForm]);

  return (
    <div
      ref={div1}
      className="w-full h-full flex flex-col overflow-auto p-4 gap-2 dark:bg-gray-900 dark:text-gray-100"
    >
      <TitleText title="Client Details" />

      {/* Section 1: Invoice Header Info */}
      <div
        ref={div2}
        className="max-h-[200px] overflow-auto p-4 border border-[#e2e8f0] dark:border-gray-700 rounded-md shadow-md bg-white dark:bg-gray-800"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Customer Name: Kaja Moideen
          </h2>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Order Ref #:{" "}
            <span className="text-gray-800 dark:text-white">ORD-123456</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-300">
          {/* Left Column */}
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-gray-800 dark:text-white">
                Desired Ship Date:{" "}
              </span>
              <span>2025-06-01</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800 dark:text-white">
                Ordered Date:{" "}
              </span>
              <span>2025-05-14</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800 dark:text-white">
                Bill To:{" "}
              </span>
              <span>
                Customer Address Info Laborum do sint sit pariatur consequat
                dolore...
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-800 dark:text-white">
                Special Instruction:{" "}
              </span>
              <span>Handle with care</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-gray-800 dark:text-white">
                Delivery Method:{" "}
              </span>
              <span>Air Freight</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800 dark:text-white">
                Packing Method:{" "}
              </span>
              <span>Wooden Crates</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800 dark:text-white">
                Ship To:{" "}
              </span>
              <span>Receiver Address Info</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800 dark:text-white">
                Special Notes:{" "}
              </span>
              <span>Urgent delivery required</span>
            </div>
          </div>
        </div>
      </div>

      <TitleText title="Item Details" />

      {/* Section 2: Table */}
      <div className="h-[400px] overflow-auto custom-scrollbar bg-[#f7f2ef] dark:bg-gray-800 shadow-sm">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="bg-[#f7f2ef] dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold sticky top-0 z-10">
            <tr>
              {header.map((header) => (
                <th key={header} className="p-1 text-center text-[13px]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoiceData.map((item, idx) => (
              <tr
                key={idx}
                className={`text-gray-700 dark:text-gray-300 text-[13px] text-center ${
                  idx % 2 === 0
                    ? "bg-[#E2E8F0] dark:bg-gray-700"
                    : "bg-white dark:bg-gray-800"
                }`}
                ref={(el) => (rowsRef.current[idx] = el)}
              >
                <td className="py-0.5 px-2 rounded-b-sm">{item?.category}</td>
                <td className="py-0.5 px-2">{item?.platform}</td>
                <td className="py-0.5 px-2">{item?.tyreSize}</td>
                <td className="py-0.5 px-2">{item?.rim}</td>
                <td className="py-0.5 px-2">{item?.type}</td>
                <td className="py-0.5 px-2">{item?.brand}</td>
                <td className="py-0.5 px-2">{item?.sidewall}</td>
                <td className="py-0.5 px-2">{item?.basicPrice}</td>
                <td className="py-0.5 px-2">{item?.qty}</td>
                <td className="py-0.5 px-2">{item?.totalPrice}</td>
                <td className="py-0.5 px-2">{item?.fwt}</td>
                <td className="py-0.5 px-2">{item?.additionalInfo}</td>
                <td className="py-0.5 px-2">{item?.plant}</td>
                <td className="py-0.5 px-2 break-all rounded-b-sm">
                  {item.partNo}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-semibold text-gray-800 dark:text-white">
            <tr className="bg-gray-100 dark:bg-gray-700 sticky bottom-0 z-10">
              <td colSpan={9} className="text-right px-4 py-2">
                Grand Total:
              </td>
              <td className="px-4 py-2 text-center">{grandTotal.toFixed(2)}</td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Section 3: Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center">
        <button
          onClick={() => setShowDetailsForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          + Add Additional Details
        </button>
        <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition">
          Submit Invoice
        </button>
      </div>

      {/* Additional Details Form */}
      {showDetailsForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay only behind the form */}
          <div className="absolute inset-0 bg-black/0  backdrop-blur-[1rem] z-0" />

          {/* Form wrapper */}
          <div className="relative z-10 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-2xl w-full max-w-5xl h-[30rem] border border-gray-300 dark:border-gray-700">
            <AdditionalDetailsForm onClose={() => setShowDetailsForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportInvoicePrepare;
