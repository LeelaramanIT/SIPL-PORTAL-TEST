import { useForm } from "react-hook-form";
import Button from "../../components/Button";

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
    w-full px-3 py-2   border border-gray-300 rounded-md text-gray-900 dark:text-white
    bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400
  `;

  const labelClass = "block mb-1 font-semibold text-gray-700 dark:text-gray-300";

  const fields = [
    { label: "Exporter Authorized Address", name: "exporterAddress", type: "text" },
    { label: "Invoice No", name: "invoiceNo", type: "text" },
    { label: "Date", name: "invoiceDate", type: "date" },
    { label: "Pre-Carriage by", name: "preCarriage", type: "select", options: ["Truck", "Rail", "Sea", "Air"] },
    { label: "Country of Origin of Goods", name: "originCountry", type: "select", options: ["India", "China", "USA", "Germany"] },
    { label: "Port of Loading", name: "portOfLoading", type: "select", options: ["Chennai", "Mumbai", "Kolkata"] },
    { label: "Bill of Lading No", name: "billOfLadingNo", type: "text" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl  mx-auto p-6 bg-white dark:bg-gray-900 rounded-md shadow-md space-y-6 text-gray-800 dark:text-gray-200">
      <h2 className="text-xl font-bold mb-4">
        SHIPMENT TYPE: <span className="text-blue-600">DIRECT</span> &nbsp; | &nbsp; WORK ORDER: <span className="text-blue-600">24-25(1123)</span>
      </h2>

      {fields.map(({ label, name, type, options }) => (
        <div key={name} className="flex flex-col">
          <label htmlFor={name} className={labelClass}>
            {label}
          </label>
          {type === "select" ? (
            <select
              id={name}
              {...register(name, { required: `${label} is required` })}
              className={inputClass}
            >
              <option value="">Select</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={name}
              type={type}
              {...register(name, { required: `${label} is required` })}
              className={inputClass}
            />
          )}
          {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>}
        </div>
      ))}

      <div className="flex flex-col">
        <label htmlFor="paymentTerms" className={labelClass}>
          Payment Terms
        </label>
        <textarea
          id="paymentTerms"
          {...register("paymentTerms", { required: "Payment terms are required" })}
          rows={6}
          className={inputClass + " resize-none"}
          defaultValue={`01. UNIT PRICES ARE INR EX-WORKS , MMN.

02. DELIVERY: REFER "TRACK MY ORDER" IN S-COTS

03. PAYMENT TERMS: 30% ADVANCE AGAINST RECEIPT OF PROFORMA THROUGH EMAIL/FAX AND BALANCE 70% PAYMENT AFTER INSPECTION - PRIOR DISPATCH OF MATERIAL.

04. PROFORMA VALID 30 DAYS FROM ORDER DATE.

05. SINCE THE SHIPMENT IS AN FCL CARGO, TYRES WILL BE STRETCH WRAPPED INDIVIDUALLY AND SENT IN LOOSE CONDITION.`}
        />
        {errors.paymentTerms && <p className="text-red-500 text-sm mt-1">{errors.paymentTerms.message}</p>}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          onClick={onClose}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-5 py-2 rounded"
          text="Cancel"
          type="button"
        />
        <Button
          className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-5 py-2 rounded"
          text="Save"
          type="submit"
        />
      </div>
    </form>
  );
};

export default ShipmentDetailsForm;
