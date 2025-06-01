import { useEffect, useRef, useState } from "react";
import AdditionalDetailsForm from "./AdditionalDetailsForm.jsx";
import TitleText from "../../../../../components/TitleText.jsx";
import gsap from "gsap";
import Button from "../../../../../components/InputFields/Button.jsx";
import { IoMdClose } from "react-icons/io";
import { useDispatch } from "react-redux";

const ExportInvoicePrepare = () => {
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const dispatch = useDispatch();

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
    plant: `Plant ${String.fromCharCode(65 + (i % 3))}`,
    partNo: `P-167807C18060713${i.toString().padStart(2, "0")}A`,
  }));
  
  const rowsRef = useRef([]);
  const div1 = useRef(null);
  const div2 = useRef(null);
  const formRef = useRef(null);

  const grandTotal = invoiceData.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const totalQTY = invoiceData.reduce((sum, item) => sum + item.qty, 0);
  const totalFWT = invoiceData.reduce((sum, item) => sum + item.fwt, 0);

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
      className="w-full flex-1 flex flex-col layout-scroll p-4 gap-2 dark:bg-gray-900 dark:text-gray-100"
    >
      <TitleText title="Client Details" />
      <div
        ref={div2}
        className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-sm shadow-lg bg-white dark:bg-gray-800"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Customer Name: <span className="font-normal">Kaja Moideen</span>
          </h2>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Order Ref #:{" "}
            <span className="text-gray-900 dark:text-white">ORD-123456</span>
          </div>
        </div>

        {/* Grid Details */}
        <div className="p-10 grid bg-background dark:bg-gray-700 shadow rounded-md grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800 dark:text-gray-300">
          <div className="space-y-4">
            {[
              ["Ordered Date:", "2025-05-14"],
              ["Desired Ship Date:", "2025-06-01"],
              [
                "Bill To:",
                <>
                  <div className="font-normal">Kaja Moideen</div>
                  <div>
                    Customer Address Info Laborum do sint sit pariatur consequat
                    dolore....
                  </div>
                </>,
              ],
              ["Special Instruction:", "Handle with care"],
            ].map(([label, value], i) => (
              <div key={i} className="grid grid-cols-[150px_1fr] gap-2">
                <span className="font-semibold text-[17px]">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {[
              ["Delivery Method:", "Air Freight"],
              ["Packing Method:", "Wooden Crates"],
              [
                "Ship To:",
                "Receiver Address Info Customer Address Info Laborum do sint sit pariatur consequat dolore....",
              ],
              ["Special Notes:", "Urgent delivery required"],
            ].map(([label, value], i) => (
              <div key={i} className="grid grid-cols-[150px_1fr] gap-2">
                <span className="font-semibold text-[17px]">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TitleText title="Item Details" />

      {/* Table */}
      <div className="max-h-[calc(100vh-63px-150px)] w-full overflow-y-auto custom-scrollbar bg-[#f7f2ef] dark:bg-gray-800 shadow-sm">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="bg-[#f7f2ef] dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold sticky top-0 z-10">
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
                    ? "bg-[#E2E8F0] dark:bg-gray-700"
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
              <td className="px-4 py-2 text-center">{grandTotal.toFixed(2)}</td>
              <td className="px-4 py-2 text-center">{totalFWT.toFixed(3)}</td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center mt-4">
        <Button onClick={() => {}} text="Preview PDF" />
        <Button
          onClick={() => setShowDetailsForm(true)}
          text="+ Add Additional Details"
        />
        <Button onClick={() => {}} text="Submit Invoice" />
      </div>

      {/* Additional Details Form */}
      {showDetailsForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div
            ref={formRef}
            className="relative bg-white dark:bg-gray-900 p-6 rounded-lg layout-scroll shadow-xl w-full max-w-5xl max-h-[40rem] overflow-y-auto border border-gray-300 dark:border-gray-700 custom-scrollbar"
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
