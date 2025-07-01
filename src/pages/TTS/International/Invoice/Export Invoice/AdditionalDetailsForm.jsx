import { useForm } from "react-hook-form";
import Button from "../../../../../components/InputFields/Button";
import Input from "../../../../../components/InputFields/Input";
import Select from "../../../../../components/InputFields/Select";
import TextArea from "../../../../../components/InputFields/TextArea";
import LoadingButton from "../../../../../components/LoadingButton";

const AdditionalDetailsForm = ({ onClose, handleCloseForm }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    console.log("Form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 9000));
    reset();
    onClose();
  };

  return (
    <div className="px-4 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-4 items-start md:items-center text-sm text-gray-800 dark:text-white">
        <h1>
          SHIPMENT TYPE: <span className="font-bold">DIRECT</span>
        </h1>
        <h1>
          WORK ORDER: <span className="font-bold">LOAD 307</span>
        </h1>
        <h1>
          Date:{" "}
          <span className="font-bold">
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="text-sm mt-6 text-gray-800 dark:text-gray-200 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Main Fields */}
        <SelectField
          label="Exporter Authorized Address"
          name="Exporter Authorized Address"
          register={register}
          errors={errors}
          options={[
            "SUN TYRE & WHEEL SYSTEMS~(A DIVISION OF SUNDARAM INDUSTRIES PRIVATE LIMITED)~SREE KRISHNA TOWERS”III FLOOR, NP-31B/4,~THIRU VI KA INDUSTRIAL ESTATE EKKATTUTHANGAL,~CHENNAI – 600 032.~",
            "SUN TYRE & WHEEL SYSTEMS~(A DIVISION OF SUNDARAM INDUSTRIES PRIVATE LIMITED)~A1-F3/A, Sidco Industrial Estate~Maraimalai Nagar - 603 209~TAMIL NADU, INDIA",
            "SUNDARAM INDUSTRIES PRIVATE LIMITED~(Formerly Known as T.S.Rajam Tyres Pvt Limites)~KRISHNA TOWERS-3RD FLOOR, NP-31B/4,~THIRU VI KA INDUSTRIAL ESTATE ,EKKATTUTHANGAL,~CHENNAI – 600 032.INDIA~",
          ]}
        />
        <InputField label="Vessel/Flight" name="Vessel/Flight" register={register} errors={errors} />
        <InputField label="Invoice No" name="Invoice No" register={register} errors={errors} />
        <InputField label="BILL OF LADING NO" name="BILL OF LADING NO" register={register} errors={errors} />
        <SelectField label="Container Type" name="Container Type" register={register} errors={errors} options={["20'", "40'", "LCL"]} />
        <SelectField label="Pre-Carriage by" name="Pre-Carriage by" register={register} errors={errors} options={["SEA", "AIR", "ROAD"]} />
        <SelectField label="Incoterm" name="Incoterm" register={register} errors={errors} options={["FOB", "CIF", "DDU", "DDP", "C&F"]} />
        <InputField label="CONTAINER NO" name="CONTAINER NO" register={register} errors={errors} />
        <SelectField label="Country of origin of goods" name="Country of origin of goods" register={register} errors={errors} options={["INDIA", "SRILANKA"]} />
        <InputField label="PORT OF DISCHARGE" name="PORT OF DISCHARGE" register={register} errors={errors} />
        <InputField label="Container SEAL NO" name="Container SEAL NO" register={register} errors={errors} />
        <SelectField label="Port of loading" name="Port of loading" register={register} errors={errors} options={["CHENNAI, INDIA", "COLOMBO SRILANKA", "ENNORE, INDIA", "KATTUPALLI, INDIA", "THOOTHUKUDI, INDIA"]} />
        <SelectField label="Place of receipt by pre-carrier" name="Place of receipt by pre-carrier" register={register} errors={errors} options={["CHENNAI", "LANKA"]} />
        <InputField label="FINAL Destination" name="FINAL Destination" register={register} errors={errors} />

        {/* Other Charges Headers */}
        <div className="md:col-span-1 hidden lg:block">
          <h1 className="text-sm text-gray-500 font-light text-center">DESCRIPTION OF OTHER CHARGES</h1>
        </div>
        <div className="md:col-span-1 hidden lg:block">
          <h1 className="text-sm text-gray-500 font-light text-center">PLEASE ENTER VALUE IN USD</h1>
        </div>

        <div className="col-span-full lg:col-span-2">
          <TextArea
            label="Payment terms"
            rows={6}
            placeholder="Enter description..."
            defaultValue={`01. UNIT PRICES FOB CHENNAI/COLOMBO,USD BY SEA .
02. DELIVERY: REFER "TRACK MY ORDER" IN S-COTS.
03. PAYMENT: 100% PAYMENTS AFTER FAX DOCUMENTS.
04. PROFORMA VALID 30 DAYS FROM ORDER DATE.
05. SHIPMENT WILL BE MADE IN FULL 20' CONTAINER LOAD.`}
            {...register("description", { required: "Description is required" })}
          />
          {errors.description && <ErrorText message={errors.description.message} />}
        </div>

  {/* Other Charges Headers */}
  <div className="md:col-span-1 lg:hidden">
          <h1 className="text-sm text-gray-500 font-light text-center">DESCRIPTION OF OTHER CHARGES</h1>
        </div>
        <div className="md:col-span-1 lg:hidden">
          <h1 className="text-sm text-gray-500 font-light text-center">PLEASE ENTER VALUE IN USD</h1>
        </div>
        {/* Other Charges & Values */}
        <div className="flex flex-col gap-4">
          <SelectField label="OTHER CHARGES" name="OTHER CHARGES 1" register={register} errors={errors} options={["CHENNAI", "LANKA"]} />
          <SelectField label="OTHER CHARGES" name="OTHER CHARGES 2" register={register} errors={errors} options={["CHENNAI", "LANKA"]} />
          <SelectField label="OTHER CHARGES" name="OTHER CHARGES 3" register={register} errors={errors} options={["CHENNAI", "LANKA"]} />
        </div>

        <div className="flex flex-col gap-4">
          <InputField label="Value" name="Value 1" register={register} errors={errors} />
          <InputField label="Value" name="Value 2" register={register} errors={errors} />
          <InputField label="Value" name="Value 3" register={register} errors={errors} />
        </div>

        {/* Form Actions */}
        <div className="col-span-full flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button
            type="button"
            text="Cancel"
            onClick={() => {
              if (onClose) onClose();
              if (handleCloseForm) handleCloseForm();
            }}
            disabled={isSubmitting}
          />
          {isSubmitting ? (
            <LoadingButton className="p-1 bg-[var(--color-primary)]" text="Submitting..." />
          ) : (
            <Button type="submit" text="Submit" disabled={isSubmitting} />
          )}
        </div>
      </form>
    </div>
  );
};

// Input wrapper
const InputField = ({ label, name, register, errors }) => (
  <div>
    <Input label={label} name={name} {...register(name, { required: `${label} is required` })} />
    {errors[name] && <ErrorText message={errors[name].message} />}
  </div>
);

// Select wrapper
const SelectField = ({ label, name, register, errors, options }) => (
  <div>
    <Select label={label} name={name} {...register(name, { required: `Please select a ${label.toLowerCase()}` })}>
      <option className="dark:bg-gray-900 dark:text-white" value="" disabled hidden>
        Select {label}
      </option>
      {options.map((option) => (
        <option key={option} className="dark:bg-gray-900 dark:text-white" value={option.toLowerCase()}>
          {option}
        </option>
      ))}
    </Select>
    {errors[name] && <ErrorText message={errors[name].message} />}
  </div>
);

// Error display
const ErrorText = ({ message }) => <p className="text-red-500 text-xs mt-1">{message}</p>;

export default AdditionalDetailsForm;
