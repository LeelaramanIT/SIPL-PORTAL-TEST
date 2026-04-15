import { useForm } from "react-hook-form";
import Button from "../../../components/InputFields/Button";

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
    w-full px-3 py-2 border border-[var(--color-secondary)] rounded-md text-[var(--color-text)]
    bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
  `;

  const labelClass = "block mb-1 font-semibold text-[var(--color-text)]";

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
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold text-[var(--color-primary)] mb-6'>Create User</h1>
      
      <div className='bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-secondary)]'>
        <h2 className='text-lg font-semibold text-[var(--color-primary)] mb-4'>User Information</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="p-4 bg-[var(--color-background)] border border-[var(--color-secondary)] rounded-md">
            <h3 className="text-md font-semibold text-[var(--color-primary)] mb-4">
              SHIPMENT TYPE: <span className="text-[var(--color-primary)]">DIRECT</span> &nbsp; | &nbsp; WORK ORDER: <span className="text-[var(--color-primary)]">24-25(1123)</span>
            </h3>
          </div>

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
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/80 text-[var(--color-text)] px-5 py-2 rounded"
              text="Cancel"
              type="button"
            />
            <Button
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-hover)] px-5 py-2 rounded"
              text="Save"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShipmentDetailsForm;
