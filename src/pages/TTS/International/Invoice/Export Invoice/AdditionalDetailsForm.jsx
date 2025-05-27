import { useForm } from "react-hook-form";
import Button from "../../../../../components/Button";

const ShipmentDetailsForm = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    reset();
    onClose();
  };

  const inputClass = `
  w-full border-b border-gray-400 dark:border-gray-600 bg-transparent focus:outline-none
  focus:border-blue-600 dark:focus:border-blue-400 px-1 py-2 text-sm text-gray-900 dark:text-white
`;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm text-gray-800 dark:text-gray-200">
      {/* Header */}
      <div className="text-lg font-bold">
        SHIPMENT TYPE: <span className="text-blue-600">DIRECT</span> &nbsp; | &nbsp; WORK ORDER: <span className="text-blue-600">24-25(1123)</span>
      </div>

      {/* Grid layout */}
      <div className="space-y-4">
        {[
          { label: "Exporter Authorized Address", name: "exporterAddress", type: "text" },
          { label: "Invoice No", name: "invoiceNo", type: "text" },
          { label: "Date", name: "invoiceDate", type: "date" },
          {
            label: "Pre-Carriage by", name: "preCarriage", type: "select", options: ["Truck", "Rail", "Sea", "Air"],
          },
          {
            label: "Country of Origin of Goods", name: "originCountry", type: "select", options: ["India", "China", "USA", "Germany"],
          },
          {
            label: "Port of Loading", name: "portOfLoading", type: "select", options: ["Chennai", "Mumbai", "Kolkata"],
          },
        ].map((field, i) => (
          <div key={i} className="grid grid-cols-[220px_1fr] gap-4 items-start">
            <label className="font-medium pt-2">{field.label}</label>
            {field.type === "select" ? (
              <select {...register(field.name)} className="input-class">
                <option value="">Select</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                {...register(field.name, { required: `${field.label} is required` })}
                className="input-class"
              />
            )}
            {errors[field.name] && (
              <div className="col-span-2 text-red-500 text-xs -mt-2">
                {errors[field.name].message}
              </div>
            )}
          </div>
        ))}

        {/* Payment Terms */}
        <div className="grid grid-cols-[220px_1fr] gap-4">
          <label className="font-medium pt-2">Payment Terms</label>
          <textarea
            {...register("paymentTerms", { required: "Payment terms are required" })}
            rows={6}
            className="input-class resize-none"
            defaultValue={`01. UNIT PRICES ARE INR EX-WORKS , MMN.

02. DELIVERY: REFER "TRACK MY ORDER" IN S-COTS

03. PAYMENT TERMS: 30% ADVANCE AGAINST RECEIPT OF PROFORMA THROUGH EMAIL/FAX AND BALANCE 70% PAYMENT AFTER INSPECTION - PRIOR DISPATCH OF MATERIAL.

04. PROFORMA VALID 30 DAYS FROM ORDER DATE.

05. SINCE THE SHIPMENT IS AN FCL CARGO, TYRES WILL BE STRETCH WRAPPED INDIVIDUALLY AND SENT IN LOOSE CONDITION.`}
          />
        </div>

        {/* Bill of Lading */}
        <div className="grid grid-cols-[220px_1fr] gap-4">
          <label className="font-medium pt-2">Bill of Lading No</label>
          <input
            type="text"
            {...register("billOfLadingNo")}
            className="input-class"
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          onClick={onClose}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          text="Cancel"
          type="button"
        />
        <Button
          className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
          text="Save"
          type="submit"
        />
      </div>
    </form>
  );
};
const inputClass = `
  w-full border-b border-gray-400 dark:border-gray-600 bg-transparent focus:outline-none
  focus:border-blue-600 dark:focus:border-blue-400 px-1 py-2 text-sm text-gray-900 dark:text-white
`;

export default ShipmentDetailsForm;
