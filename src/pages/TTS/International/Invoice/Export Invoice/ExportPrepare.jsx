import { useEffect, useRef, useState } from "react";
import AdditionalDetailsForm from "./AdditionalDetailsForm.jsx";
import TitleText from "../../../../../components/TitleText.jsx";
import gsap from "gsap";
import Button from "../../../../../components/Button.jsx";
import { IoMdClose } from "react-icons/io";

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
    totalPrice: 250.82 * (4 + i),
    fwt: 500.399 + i * 10.389,
    additionalInfo: "NO GRADE MARKINGS & BARCODE STICKERS ON TYRE",
    plant: `Plant ${String.fromCharCode(65 + (i % 3))}`, // A, B, C
    partNo: `P-167807C18060713${i.toString().padStart(2, "0")}A`,
  }));

  const rowsRef = useRef([]);

  const grandTotal = invoiceData.reduce(
    (sum, item) => sum + item?.totalPrice,
    0
  );

  const totalQTY = invoiceData.reduce((sum, item) => sum + item.qty, 0);
  const totalFWT = invoiceData.reduce((sum, item) => sum + item.fwt, 0);

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
  const rows = rowsRef.current.filter(Boolean);

  const tl = gsap.timeline();

  tl.fromTo(
    [div1.current, div2.current, div3.current, div4.current, div5.current],
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
      "+=0.2" // slight pause before rows start
    );
  }
};



  const div1 = useRef(null);
  const div2 = useRef(null);
  const div3 = useRef(null);
  const div4 = useRef(null);
  const div5 = useRef(null);
  const formRef = useRef(null);


  useEffect(() => {
    animateRows();
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
        className="p-2 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg bg-white dark:bg-gray-800"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Customer Name: <span className="font-normal">Kaja Moideen</span>
          </h2>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Order Ref #:{" "}
            <span className="text-gray-900 dark:text-white">ORD-123456</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-2 grid bg-background dark:bg-gray-700 shadow rounded-md grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800 dark:text-gray-300">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-[150px_1fr] gap-2">
              <span className="font-semibold">Ordered Date:</span>
              <span>2025-05-14</span>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-2">
              <span className="font-semibold">Desired Ship Date:</span>
              <span>2025-06-01</span>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-2">
              <span className="font-semibold">Bill To:</span>
              <div>
                <div className="font-normal">Kaja Moideen</div>
                <div>
                  Customer Address Info Laborum do sint sit pariatur consequat
                  dolore....
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-2">
              <span className="font-semibold">Special Instruction:</span>
              <span>Handle with care</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-[150px_1fr] gap-2">
              <span className="font-semibold">Delivery Method:</span>
              <span>Air Freight</span>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-2">
              <span className="font-semibold">Packing Method:</span>
              <span>Wooden Crates</span>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-2">
              <span className="font-semibold">Ship To:</span>
              <span>
                Receiver Address Info Customer Address Info Laborum do sint sit
                pariatur consequat dolore....
              </span>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-2">
              <span className="font-semibold">Special Notes:</span>
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
              {/* {header.map((header) => ( */}
                <th  className="p-1 text-center text-[13px]">
                  CATEGORY
                </th>
                <th  className="p-1 text-center text-[13px]">
                  PLATFORM
                </th>
                <th  className="p-1 text-center text-[13px]">
                  TYRE SIZE
                </th>
                <th  className="p-1 text-center text-[13px]">
                  RIM
                </th>
                <th  className="p-1 text-center text-[13px]">
                  TYPE
                </th>
                <th  className="p-1 text-center text-[13px]">
                  BRAND
                </th>
                <th  className="p-1 text-center text-[13px]">
                  SIDEWALL
                </th>
                <th  className="p-1 text-center text-[13px]">
                  BASIC PRICE
                </th>
                <th  className="p-1 text-center text-[13px]">
                  QTY
                </th>
                <th  className="p-1 text-center text-[13px]">
                  TOTAL PRICE
                </th>
                <th  className="p-1 text-center text-[13px]">
                FWT
                </th>
                <th colSpan={4} className="p-1 text-center text-[13px]">
                  ADDITIONAL INFO
                </th>
                <th  className="p-1 text-center text-[13px]">
                  PLANT
                </th>
                <th  className="p-1 text-center text-[13px]">
                  PART-NO
                </th>
              {/* ))} */}
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
                <td className="py-0.5 px-2 rounded-bl-sm">{item?.category}</td>
                <td className="py-0.5 px-2">{item?.platform}</td>
                <td className="py-0.5 px-2">{item?.tyreSize}</td>
                <td className="py-0.5 px-2">{item?.rim}</td>
                <td className="py-0.5 px-2">{item?.type}</td>
                <td className="py-0.5 px-2">{item?.brand}</td>
                <td className="py-0.5 px-2">{item?.sidewall}</td>
                <td className="py-0.5 px-2">{item?.basicPrice}</td>
                <td className="py-0.5 px-2">{item?.qty}</td>
                <td className="py-0.5 px-2">{item?.totalPrice.toFixed(2)}</td>
                <td className="py-0.5 px-2">{item?.fwt.toFixed(3)}</td>
                <td colSpan={4}
                  className="py-0.5  px-2 whitespace-nowrap overflow-hidden"
                  title={item?.additionalInfo}
                >
                  {item?.additionalInfo}
                </td>

                <td className="py-0.5 px-2">{item?.plant}</td>
                <td className="py-0.5 px-2 break-all rounded-br-sm">
                  {item.partNo}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-semibold text-gray-800 dark:text-white">
            <tr className="bg-gray-100 dark:bg-gray-700 sticky bottom-0 z-10">
              <td colSpan={8} className="text-right px-4 py-2">
                Grand Total:
              </td>
              <td className="px-4 py-2 text-center">{totalQTY}</td>
              <td className="px-4 py-2 text-center">{grandTotal.toFixed(2)}</td>
              <td className="px-4 py-2 text-center">{totalFWT.toFixed(3)}</td>
              <td colSpan={6}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Section 3: Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center">
        <Button
          onClick={() => setShowDetailsForm(true)}
          text={"+ Add Additional Details"}
        />
        <Button onClick={""} text={"Submit Invoice"} />
      </div>

      {/* Additional Details Form */}
      {showDetailsForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay only behind the form */}
          <div className="absolute inset-0 bg-black/0  backdrop-blur-[1rem] z-0" />

          {/* Form wrapper */}
          <div ref={formRef} className="relative z-10 bg-white dark:bg-gray-900 p-6 rounded-lg overflow-auto custom-scrollbar shadow-2xl w-full max-w-5xl h-[30rem] border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setShowDetailsForm(false)}
              className="absolute top-9 right-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white z-20"
            >
              <IoMdClose className="text-2xl" />
            </button>

            <TitleText title={"Additional Details"} />
            <AdditionalDetailsForm onClose={() => setShowDetailsForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportInvoicePrepare;
