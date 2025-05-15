import { useRef, useState } from "react";
import AdditionalDetailsForm from "./AdditionalDetailsForm.jsx";

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

  return (
    <div className="w-full h-full flex flex-col overflow-auto p-4 gap-2 ">
      {/* Section 1: Invoice Header Info */}
      <div className="max-h-[200px] overflow-auto p-4 bg-[#f9f5f2] border border-[#e2e8f0] rounded-md shadow-md ">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">
          Customer Name: Kaja Moideen
        </h2>
          <div className="text-sm font-medium text-gray-600">
            Order Ref #: <span className="text-gray-800">ORD-123456</span>
          </div>
        </div>

        {/* Detail Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          {/* Left Column */}
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-gray-800">
                Desired Ship Date:{" "}
              </span>
              <span className="text-gray-700">2025-06-01</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">
                Ordered Date:{" "}
              </span>
              <span className="text-gray-700">2025-05-14</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Bill To: </span>
              <span className="text-gray-700">
                Customer Address Info Laborum do sint sit pariatur consequat
                dolore consequat ipsum exercitation magna eu occaecat magna.
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">
                Special Instruction:{" "}
              </span>
              <span className="text-gray-700">Handle with care</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-gray-800">
                Delivery Method:{" "}
              </span>
              <span className="text-gray-700">Air Freight</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">
                Packing Method:{" "}
              </span>
              <span className="text-gray-700">Wooden Crates</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Ship To: </span>
              <span className="text-gray-700">Receiver Address Info</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">
                Special Notes:{" "}
              </span>
              <span className="text-gray-700">Urgent delivery required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Table */}
      <div className="h-[400px] overflow-auto custom-scrollbar rounded-lg bg-[#f7f2ef] shadow-sm">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="bg-[#f7f2ef] text-gray-700 font-semibold sticky top-0 z-10">
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
              ].map((header) => (
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
                className={` text-gray-700 text-[13px] text-center ${
                  idx % 2 == 0 ? "bg-[#E2E8F0]" : "bg-white"
                }`}
                ref={(el) => (rowsRef.current[idx] = el)}
              >
                <td className="py-0.5 px-2">{item.category}</td>
                <td className="py-0.5 px-2">{item.platform}</td>
                <td className="py-0.5 px-2">{item.tyreSize}</td>
                <td className="py-0.5 px-2">{item.rim}</td>
                <td className="py-0.5 px-2">{item.type}</td>
                <td className="py-0.5 px-2">{item.brand}</td>
                <td className="py-0.5 px-2">{item.sidewall}</td>
                <td className="py-0.5 px-2">{item.basicPrice}</td>
                <td className="py-0.5 px-2">{item.qty}</td>
                <td className="py-0.5 px-2">{item.totalPrice}</td>
                <td className="py-0.5 px-2">{item.fwt}</td>
                <td className="py-0.5 px-2">{item.additionalInfo}</td>
                <td className="py-0.5 px-2">{item.plant}</td>
                <td className="py-0.5 px-2 break-all">{item.partNo}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-semibold text-gray-800">
            <tr>
              <td colSpan={9} className="text-right px-4 py-2">
                Grand Total:
              </td>
              <td className="px-4 py-2 text-center">{grandTotal.toFixed(2)}</td>
              <td colSpan={3}></td>
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
        <div className="mt-4">
          <AdditionalDetailsForm onClose={() => setShowDetailsForm(false)} />
        </div>
      )}
    </div>
  );
};

export default ExportInvoicePrepare;
