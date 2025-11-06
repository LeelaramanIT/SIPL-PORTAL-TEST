import { useForm } from "react-hook-form";
import Button from "../../../../../components/InputFields/Button";
import Input from "../../../../../components/InputFields/Input";
import Select from "../../../../../components/InputFields/Select";
import TextArea from "../../../../../components/InputFields/TextArea";
import LoadingButton from "../../../../../components/LoadingButton";
import { useDispatch, useSelector } from "react-redux";
import { setExportAdditionalInvoice, setIsPallate } from "../../../../../Redux/Slices/InvoiceSlice";
import { getCurrency } from "../../../../../utils/currencies";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";

const AdditionalDetailsForm = ({
  onClose,
  handleCloseForm,
  invoiceDetails,
  setShowWarning,
}) => {


  const userCurrency = getCurrency(invoiceDetails?.usercurrency);

  const dispatch = useDispatch();
  const invoiceData = useSelector(
    (state) => state?.invoice?.exportInvoices?.additionalForm
  );
  const invoiceFinalData = useSelector(
    (state) => state?.invoice?.exportInvoices.FinalInvoiceDetails
  );


  const decodedText =
    invoiceData?.paymentTerms || invoiceDetails?.paymentTerms || "";

  // Decode HTML entities
  const parser = new DOMParser();
  const decoded =
    parser.parseFromString(decodedText, "text/html").body.textContent || "";

  // Split into sections if numbered
  const numberedSections = decoded.match(/(?:\d{2}\..*?)(?=\d{2}\.|$)/gs);

  let formattedDescription = "";
  if (numberedSections?.length) {
    formattedDescription = numberedSections
      .map((section) => section.replace(/~+/g, "\n").trim())
      .join("\n");
  } else {
    formattedDescription = decoded.replace(/~+/g, "\n").trim();
  }

  // console.log(invoiceDetails);
  // console.log(invoiceData);
  console.log(invoiceFinalData);

// 1. Get all scheme names that will be rendered as fields
const schemeNames = useMemo(() => 
  invoiceFinalData
    ?.filter((d) => d.scheme !== "Direct")
    .map((d) => d.scheme), 
  [invoiceFinalData]
);


// 2. Convert existing schemeLicences array into a flat object
// FIX 1: Read from invoiceData.schemeLicences, not invoiceFinalData.schemeLicences
const existingSchemeValues = (invoiceData?.schemeLicences || []).reduce(
(acc, schemeObj) => {
  // FIX 2: Get entries from schemeObj directly, not schemeObj[0]
  const [key, value] = Object.entries(schemeObj)[0] || [];
  if (key) {
    acc[key] = value;
  }
  return acc;
},
{}
);

// 3. Create the default values object for the dynamic scheme fields
const schemeDefaults = {};
for (const schemeName of schemeNames) {
schemeDefaults[schemeName] = existingSchemeValues[schemeName] || "";
}
  

  const defaultValues = {
    exporterAuthorizedAddress: invoiceData?.exporterAuthorizedAddress || "",
    vesselFlightNo: invoiceData?.vesselFlightNo || "",
    invoiceNumber:
      invoiceData?.invoiceNumber || invoiceDetails?.invoiceNumber || "",
    billOfLadingNo: invoiceData?.billOfLadingNo || "",
    containerNo: invoiceData?.containerNo || "",
    countryOfOriginOfGoods:
      invoiceData?.countryOfOriginOfGoods ||
      invoiceDetails?.countryOfOriginOfGoods ||
      "",
    portOfLoading:
      invoiceData?.portOfLoading || invoiceDetails?.portOfLoading || "",
    portOfDischarge: invoiceData?.portOfDischarge || "",
    containerType: invoiceData?.containerType || "",
    preCarriageBy: invoiceData?.preCarriageBy || "",
    // ✅ Apply consistent casing from fix
    incoterm:
      invoiceData?.incoterm?.toLowerCase() ||
      invoiceDetails?.incoterm?.toLowerCase() ||
      "",
    containerSEALNO: invoiceData?.containerSEALNO || "",
    placeOfReceiptByPreCarrier: invoiceData?.placeOfReceiptByPreCarrier || "",
    finalDestination:
      invoiceData?.shippingCity || invoiceDetails?.shippingCity || "",
    otherCharges1: invoiceData?.otherCharges1 || "",
    otherCharges2: invoiceData?.otherCharges2 || "",
    otherCharges3: invoiceData?.otherCharges3 || "",
    otherChargesValue1: invoiceData?.otherChargesValue1 || "",
    otherChargesValue2: invoiceData?.otherChargesValue2 || "",
    otherChargesValue3: invoiceData?.otherChargesValue3 || "",
    claimAdjustment: invoiceData?.claimAdjustment || "",
    otherDiscount: invoiceData?.otherDiscount || "",

    // ✅ use formattedDescription here instead of raw DB value
    paymentTerms: formattedDescription || "",

    otsNo: invoiceData?.otsNo || "",
    itcHsNo: invoiceData?.itcHsNo || "",
    ExchangeCurrency: invoiceData?.ExchangeCurrency || '',
    pallateWeight: invoiceData?.pallateWeight,
    ...schemeDefaults,
  };

  // Decode & format strictly from invoiceDetails (DB)
  const rawDbPaymentTerms = invoiceDetails?.paymentTerms || "";
  const dbDecoded =
    parser.parseFromString(rawDbPaymentTerms, "text/html").body.textContent ||
    "";

  const dbSections = dbDecoded.match(/(?:\d{2}\..*?)(?=\d{2}\.|$)/gs);

  let dbFormattedDescription = "";
  if (dbSections?.length) {
    dbFormattedDescription = dbSections
      .map((section) => section.replace(/~+/g, "\n").trim())
      .join("\n");
  } else {
    dbFormattedDescription = dbDecoded.replace(/~+/g, "\n").trim();
  }

  // Values strictly from DB (ignore invoiceData)
  const dbValues = {
    exporterAuthorizedAddress: invoiceDetails?.exporterAuthorizedAddress || "",
    vesselFlightNo: invoiceDetails?.vesselFlightNo || "",
    invoiceNumber: invoiceDetails?.invoiceNumber || "",
    billOfLadingNo: invoiceDetails?.billOfLadingNo || "",
    containerNo: invoiceDetails?.containerNo || "",
    countryOfOriginOfGoods: invoiceDetails?.countryOfOriginOfGoods || "",
    portOfLoading: invoiceDetails?.portOfLoading || "",
    portOfDischarge: invoiceDetails?.portOfDischarge || "",
    containerType: invoiceDetails?.containerType || "",
    preCarriageBy: invoiceDetails?.preCarriageBy || "",
    // ✅ Apply consistent casing from fix
    incoterm: invoiceDetails?.incoterm?.toLowerCase() || "",
    containerSEALNO: invoiceDetails?.containerSEALNO || "",
    placeOfReceiptByPreCarrier:
      invoiceDetails?.placeOfReceiptByPreCarrier || "",
    finalDestination: invoiceDetails?.shippingCity || "",
    otherCharges1: "",
    otherCharges2: "",
    otherCharges3: "",
    otherChargesValue1: "",
    otherChargesValue2: "",
    otherChargesValue3: "",
    claimAdjustment: "",
    otherDiscount: "",
    paymentTerms: dbFormattedDescription, // ✅ fixed here
    otsNo: invoiceDetails?.otsNo || "",
    itcHsNo: invoiceDetails?.itcHsNo || "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ defaultValues });

  const onSubmit = async (data) => {
        toast.success("Form submitted:");
    
        // 1. Get the list of scheme names again
        const schemeNames = invoiceFinalData
        .filter((d) => d.scheme !== 'Direct')
        .map((d) => d.scheme);
    
        // 2. Build the schemeLicences array
        const schemeLicences = [];
        const otherData = { ...data }; // Good
    
        for (const schemeName of schemeNames) {
          if (Object.prototype.hasOwnProperty.call(data, schemeName)) {
            schemeLicences.push({ [schemeName]: data[schemeName] });
            delete otherData[schemeName]; // Good
          }
        }
    
        const updatedInvoice = {
          ...invoiceDetails,
          ...otherData, // ✅ FIX 1: Use otherData, not data
          schemeLicences: schemeLicences,
        };
    
        dispatch(setExportAdditionalInvoice(updatedInvoice));
        setShowWarning(true);
        reset(data); // ✅ FIX 2: Reset with the original flat 'data'
        onClose();
      };

  return (
    // ✅ Added dark:bg-gray-800 for the container background
    <div className="px-4 md:px-2 overflow-y-auto dark:bg-gray-800">
      {/* Header Section (Already has dark mode) */}
      <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-4 items-start md:items-center text-sm text-gray-800 dark:text-white">
        <h1>
          SHIPMENT TYPE:{" "}
          <span className="font-bold">{invoiceDetails?.shipmentType}</span>
        </h1>
        <h1>
          WORK ORDER:{" "}
          <span className="font-bold">{invoiceDetails?.workorderno}</span>
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

      {/* Form (Already has dark mode text) */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="text-sm mt-6 text-gray-800 dark:text-gray-200 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 ease-out"
      >
        {/* Main Fields */}
        <SelectField
          label="Exporter Authorized Address"
          name="exporterAuthorizedAddress"
          register={register}
          errors={errors}
          options={[
            "SUN TYRE & WHEEL SYSTEMS~(A DIVISION OF SUNDARAM INDUSTRIES PRIVATE LIMITED)~SREE KRISHNA TOWERS”III FLOOR, NP-31B/4,~THIRU VI KA INDUSTRIAL ESTATE EKKATTUTHANGAL,~CHENNAI – 600 032.~",
            "SUN TYRE & WHEEL SYSTEMS~(A DIVISION OF SUNDARAM INDUSTRIES PRIVATE LIMITED)~A1-F3/A, Sidco Industrial Estate~Maraimalai Nagar - 603 209~TAMIL NADU, INDIA",
            "SUNDARAM INDUSTRIES PRIVATE LIMITED~(Formerly Known as T.S.Rajam Tyres Pvt Limites)~KRISHNA TOWERS-3RD FLOOR, NP-31B/4,~THIRU VI KA INDUSTRIAL ESTATE ,EKKATTUTHANGAL,~CHENNAI – 600 032.INDIA~",
          ]}
        />
        <InputField
          label="Vessel/Flight"
          name="vesselFlightNo"
          register={register}
          errors={errors}
        />
        <InputField
          label="BILL OF LADING NO"
          name="billOfLadingNo"
          register={register}
          errors={errors}
        />
        <SelectField
          label="Container Type"
          name="containerType"
          register={register}
          errors={errors}
          options={["20'", "40'", "LCL"]}
        />
        <SelectField
          label="Pre-Carriage by"
          name="preCarriageBy"
          register={register}
          errors={errors}
          options={["SEA", "AIR", "ROAD"]}
        />
        <SelectField
          label="incoterm"
          name="incoterm"
          register={register}
          errors={errors}
          options={["FOB", "CIF", "DDU", "DDP", "C&F"]}
        />
        <InputField
          label="CONTAINER NO"
          name="containerNo"
          register={register}
          errors={errors}
        />
        <SelectField
          label="Country of origin of goods"
          name="countryOfOriginOfGoods"
          register={register}
          errors={errors}
          options={["INDIA", "SRILANKA", "INDIA & SRILANKA"]}
          disabled={false}
        />
        <InputField
          label="PORT OF DISCHARGE"
          name="portOfDischarge"
          register={register}
          errors={errors}
        />
        <InputField
          label="Container SEAL NO"
          name="containerSEALNO"
          register={register}
          errors={errors}
        />
        <SelectField
          label="Port of loading"
          name="portOfLoading"
          register={register}
          errors={errors}
          options={[
            "CHENNAI, INDIA",
            "COLOMBO SRILANKA",
            "ENNORE, INDIA",
            "KATTUPALLI, INDIA",
            "THOOTHUKUDI, INDIA",
          ]}
        />
        <SelectField
          label="Place of receipt by pre-carrier"
          name="placeOfReceiptByPreCarrier"
          register={register}
          errors={errors}
          options={["CHENNAI", "LANKA"]}
        />

        {/* Other Charges Headers */}
        <div className="md:col-span-1 hidden lg:block mt-3">
          <h1 className="text-sm text-gray-500 font-light text-center"></h1>
          {/* ✅ Added dark:text-gray-400 */}
          <h1 className="text-sm text-gray-500 dark:text-gray-400 font-light text-center">
            DESCRIPTION OF OTHER CHARGES
          </h1>
        </div>
        <div className="md:col-span-1 hidden lg:block mt-3">
          <h1 className="text-sm text-gray-500 font-light text-center"></h1>
          {/* ✅ Added dark:text-gray-400 */}
          <h1 className="text-sm text-gray-500 dark:text-gray-400 font-light text-center">
            PLEASE ENTER VALUE IN {userCurrency?.code}
          </h1>
        </div>
        <InputField
          label="FINAL Destination"
          name="finalDestination"
          register={register}
          errors={errors}
        />

        <InputField
          label="OTS Number"
          name="otsNo"
          register={register}
          errors={errors}
        />
        <InputField
          label="I.T.C(H.S) No"
          name="itcHsNo"
          register={register}
          errors={errors}
        />
        <InputField
          label="Invoice No"
          type="number"
          name="invoiceNumber"
          register={register}
          errors={errors}
          disabled={false}
        />

        {/* Other Charges Headers */}
        <div className="md:col-span-1 lg:hidden">
          <h1 className="text-sm text-gray-500 font-light text-center"></h1>
          {/* ✅ Added dark:text-gray-400 */}
          <h1 className="text-sm text-gray-500 dark:text-gray-400 font-light text-center">
            DESCRIPTION OF OTHER CHARGES
          </h1>
        </div>
        <div className="md:col-span-1 lg:hidden">
          <h1 className="text-sm text-gray-500 font-light text-center"></h1>
          {/* ✅ Added dark:text-gray-400 */}
          <h1 className="text-sm text-gray-500 dark:text-gray-400 font-light text-center">
            PLEASE ENTER VALUE IN USD
          </h1>
        </div>
        {/* Other Charges & Values */}
        <div className="flex flex-col  gap-4 relative">
          <span className="absolute text-lg top-0 -right-4">+</span>
          <span className="absolute text-lg top-13 -right-4">+</span>
          <span className="absolute text-lg top-27 -right-4">+</span>
          <InputField
            label=""
            name="otherCharges1"
            register={register}
            errors={errors}
          />
          <InputField
            label=""
            name="otherCharges2"
            register={register}
            errors={errors}
          />
          <InputField
            label=""
            name="otherCharges3"
            register={register}
            errors={errors}
          />
        </div>

        <div className="flex flex-col gap-4">
          <InputField
            label="Value 1"
            name="otherChargesValue1"
            register={register}
            errors={errors}
          />
          <InputField
            label="Value 2"
            name="otherChargesValue2"
            register={register}
            errors={errors}
          />
          <InputField
            label="Value 3"
            name="otherChargesValue3"
            register={register}
            errors={errors}
          />

        </div>
        <div className="col-span-full lg:col-span-2">
          <TextArea
            label="PAYMENT TERMS"
            rows={6}
            placeholder="Enter description..."
            // ✅ Added className to match SelectField styling
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
            {...register("paymentTerms", {
              required: "paymentTerms is required",
            })}
          />
          {errors.paymentTerms && (
            <ErrorText message={errors.paymentTerms.message} />
          )}
        </div>
        <div className="col-span-full lg:col-span-1">
          <InputField
            label="Exchange Currency Value"
            type="number"
            name="otherChargesValue3"
            register={register}
            errors={errors}
          />
          <IsPalateToggleInput register={register} errors={errors} />
        </div>
        <div className="col-span-full lg:col-span-1 flex flex-col gap-2">
          {invoiceFinalData
            .filter((data) => data.scheme !== 'Direct') // ✅ filters out "Direct"
            .map((data) => (
              <InputField
                key={data.scheme} 
                label={`${data.scheme} Scheme`}
                type="text"
                name={data.scheme}
                register={register}
                errors={errors}
              />
            ))}
        </div>

        {/* Form Actions (Assuming Button components handle their own dark mode) */}
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
          <Button
            type="button"
            text="Reset"
            onClick={() => reset(dbValues)}
            disabled={isSubmitting}
          />
          {isSubmitting ? (
            <LoadingButton
              className="p-1 bg-[var(--primary)]"
              text="Submitting..."
            />
          ) : (
            <Button type="submit" text="Submit" disabled={isSubmitting} />
          )}
        </div>
      </form>
    </div>
  );
};

// Input wrapper
const InputField = ({
  label,
  name,
  register,
  errors,
  disabled = false,
  type = "text",
}) => {
  const fileName = name.toUpperCase().replace(/\s+/g, "");
  return (
    <div>
      <Input
        label={label}
        name={fileName}
        disabled={disabled}
        type={type}
        // ✅ Added className to match SelectField styling
        className="w-full rounded-md border border-gray-300 dark:border-gray-700 
                 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
        {...register(name, { required: `${label} is required` })}
      />
      {errors[name] && <ErrorText message={errors[name].message} />}
    </div>
  );
};

// Select wrapper
const SelectField = ({
  label,
  name,
  register,
  errors,
  options,
  disabled = false,
}) => {
  const fileName = name.toUpperCase().replace(/\s+/g, "");

  return (
    <div>
      <Select
        label={label}
        name={fileName}
        disabled={disabled}

        className="w-full rounded-md border border-gray-300 dark:border-gray-700 
                 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
        {...register(name, {
          required: `Please select a ${label.toLowerCase()}`,
        })}
      >
        <option value="" disabled hidden>
          Select {label}
        </option>
        {options.map((option) => (
          // ✅ Changed value to toLowerCase() to match the fix
          <option key={option} value={option.toLowerCase()}>
            {option}
          </option>
        ))}
      </Select>
      {errors[name] && <ErrorText message={errors[name].message} />}
    </div>
  );
};

// Error display
const ErrorText = ({ message }) => (
  // ✅ Added dark:text-red-400 for better visibility in dark mode
  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{message}</p>
);

function IsPalateToggleInput({ register, errors }) {
  const isChecked = useSelector(
    (state) => state?.invoice?.exportInvoices?.isPallateChecked
  );
  const dispatch = useDispatch();

  const handleCheckboxChange = (event) => {
    dispatch(setIsPallate(event.target.checked));
    console.log(event.target.checked);

  };

  return (
    <div className="py-2 w-40">
      {/* Checkbox to toggle the input field */}
      <label
        htmlFor="isPalateToggle"
        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-300 dark:border-gray-700 
                 bg-white dark:bg-gray-900 text-gray-800 dark:text-white cursor-pointer transition-colors"
      >
        <input
          type="checkbox"
          id="isPalateToggle"
          {...register("isPalate")}
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 rounded"
        />
        <span className="text-gray-700 dark:text-gray-200 font-medium">
          Palletized?
        </span>
      </label>

      {/* Conditionally render the input field with a smooth transition */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isChecked ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
      >
        {isChecked && (
          <>
            <label
              htmlFor="pallateWeight"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Pallate Weight
            </label>
            <input
              type="number"
              id="pallateWeight"
              placeholder="Enter pallate weight..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-900 text-gray-800 dark:text-white 
                         rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!isChecked}
              {...register("pallateWeight", {
                required: isChecked ? "Pallate weight is required" : false,
              })}
            />
            {errors.pallateWeight && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                {errors.pallateWeight.message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}


export default AdditionalDetailsForm;