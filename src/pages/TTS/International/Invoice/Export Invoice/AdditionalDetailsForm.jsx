import { useForm } from "react-hook-form";
import Button from "../../../../../components/InputFields/Button";
import Input from "../../../../../components/InputFields/Input";
import Select from "../../../../../components/InputFields/Select";
import TextArea from "../../../../../components/InputFields/TextArea";
import LoadingButton from "../../../../../components/LoadingButton";
import { useDispatch, useSelector } from "react-redux";
import { setExportAdditionalInvoice } from "../../../../../Redux/Slices/InvoiceSlice";
import { getCurrency } from "../../../../../utils/currencies";

const AdditionalDetailsForm = ({ onClose, handleCloseForm, invoiceDetails }) => {
  // console.log(invoiceDetails);
  const origin = invoiceDetails?.containerLoadFrom === "MMN" || invoiceDetails?.containerLoadFrom === "PDK"
  ? "india"
  : "srilanka";
  
  const userCurrency = getCurrency(invoiceDetails?.usercurrency)

  const dispatch = useDispatch()
  const invoiceData = useSelector(
    (state) => state?.invoice?.exportInvoices?.additionalForm);

  const decodedText = invoiceDetails?.paymentTerms?.replace(/&amp;/g, "") || "";

let formattedDescription = '';
const numberedSections = decodedText.match(/(?:\d{2}\..*?)(?=\d{2}\.|$)/gs);


if (numberedSections?.length) {
  formattedDescription = numberedSections
    .map(section => section.replace(/~+/g, '\n').trim()) // line breaks inside each section
    .join('\n\n'); // double line break between sections
} else {
  // fallback if no numbered sections found
  formattedDescription = decodedText.replace(/~+/g, '\n');
}
console.log(invoiceDetails);

  const defaultValues = {
    ExporterAuthorizedAddress: invoiceData?.ExporterAuthorizedAddress || '',
    VesselFlight : invoiceData?.VesselFlight || "",
    InvoiceNo: invoiceDetails?.invoiceNumber || "", 
    BillOfLadingNo: invoiceData?.BillOfLadingNo || "",
    ContainerNo: invoiceData?.ContainerNo || "",
    CountryOfOriginOfGoods: invoiceDetails?.containerLoadFrom === "MMN" || invoiceDetails?.containerLoadFrom === "PDK" ? "india" : "srilanka",
    PortOfLoading: invoiceDetails.PortOfLoading || invoiceData?.PortOfLoading || "",
    PortOfDischarge : invoiceData?.PortOfDischarge || "",
    ContainerType: invoiceData?.ContainerType || '',
    PreCarriageby: invoiceData?.PreCarriageby || "",
    Incoterm: invoiceData?.Incoterm || "",
    ContainerSEALNO: invoiceData?.ContainerSEALNO || "",
    PlaceOfReceiptByPreCarrier: invoiceData?.PlaceOfReceiptByPreCarrier || "",
    FinalDestination: invoiceDetails?.shippingCity || "",
    OtherCharges1: invoiceData?.OtherCharges1 || '',
    OtherCharges2: invoiceData?.OtherCharges2 || '',
    OtherCharges3: invoiceData?.OtherCharges3 || '',
    ClaimAdjustment: invoiceData?.Value1 || "",
    OtherDiscount: invoiceData?.Value2 || "",
    PaymentTerms: formattedDescription,
    OtsNo:invoiceData?.OtsNo||'',
    itcHsNo:invoiceDetails?.itcHsNo || '',
  };
  
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({defaultValues});


  const onSubmit = async (data) => {
    console.log("Form submitted:");
    dispatch(setExportAdditionalInvoice(data))
    reset();
    onClose();
  };

  return (
    <div className="px-4 md:px-2 overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-4 items-start md:items-center text-sm text-gray-800 dark:text-white">
        <h1>
          SHIPMENT TYPE: <span className="font-bold">{invoiceDetails?.shipmentType}</span>
        </h1>
        <h1>
          WORK ORDER: <span className="font-bold">{invoiceDetails?.workorderno}</span>
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
        className="text-sm mt-6 text-gray-800 dark:text-gray-200 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 ease-out"
      >
        {/* Main Fields */}
        <SelectField
          label="Exporter Authorized Address"
          name="ExporterAuthorizedAddress"
          register={register}
          errors={errors}
          options={[
            "SUN TYRE & WHEEL SYSTEMS~(A DIVISION OF SUNDARAM INDUSTRIES PRIVATE LIMITED)~SREE KRISHNA TOWERS”III FLOOR, NP-31B/4,~THIRU VI KA INDUSTRIAL ESTATE EKKATTUTHANGAL,~CHENNAI – 600 032.~",
            "SUN TYRE & WHEEL SYSTEMS~(A DIVISION OF SUNDARAM INDUSTRIES PRIVATE LIMITED)~A1-F3/A, Sidco Industrial Estate~Maraimalai Nagar - 603 209~TAMIL NADU, INDIA",
            "SUNDARAM INDUSTRIES PRIVATE LIMITED~(Formerly Known as T.S.Rajam Tyres Pvt Limites)~KRISHNA TOWERS-3RD FLOOR, NP-31B/4,~THIRU VI KA INDUSTRIAL ESTATE ,EKKATTUTHANGAL,~CHENNAI – 600 032.INDIA~",
          ]}
        />
        <InputField label="Vessel/Flight" name="VesselFlight" register={register} errors={errors} />
        <InputField label="Invoice No" name="InvoiceNo" register={register} errors={errors} disabled={true} />
        <InputField label="BILL OF LADING NO" name="BillOfLadingNo" register={register} errors={errors} />
        <SelectField label="Container Type" name="ContainerType" register={register} errors={errors} options={["20'", "40'", "LCL"]} />
        <SelectField label="Pre-Carriage by" name="PreCarriageby" register={register} errors={errors} options={["SEA", "AIR", "ROAD"]} />
        <SelectField label="Incoterm" name="Incoterm" register={register} errors={errors} options={["FOB", "CIF", "DDU", "DDP", "C&F"]} />
        <InputField label="CONTAINER NO" name="ContainerNo" register={register} errors={errors} />
        <SelectField label="Country of origin of goods" name="CountryOfOriginOfGoods" register={register} errors={errors} options={["INDIA", "SRILANKA",'INDIA & SRILANKA']} disabled={false} />
        <InputField label="PORT OF DISCHARGE" name="PortOfDischarge" register={register} errors={errors} />
        <InputField label="Container SEAL NO" name="ContainerSEALNO" register={register} errors={errors} />
        <SelectField label="Port of loading" name="PortOfLoading" register={register} errors={errors} options={["CHENNAI, INDIA", "COLOMBO SRILANKA", "ENNORE, INDIA", "KATTUPALLI, INDIA", "THOOTHUKUDI, INDIA"]} />
        <SelectField label="Place of receipt by pre-carrier" name="PlaceOfReceiptByPreCarrier" register={register} errors={errors} options={["CHENNAI", "LANKA"]} />
        <InputField label="FINAL Destination" name="FinalDestination" register={register} errors={errors} />
        <InputField label="OTS Number" name="OtsNo" register={register} errors={errors} />
        <InputField label="I.T.C(H.S) No" name="itcHsNo" register={register} errors={errors} />
        {/* Other Charges Headers */}
        <div className="md:col-span-1 hidden lg:block">
          <h1 className="text-sm text-gray-500 font-light text-center">DESCRIPTION OF OTHER CHARGES</h1>
        </div>
        <div className="md:col-span-1 hidden lg:block">
          <h1 className="text-sm text-gray-500 font-light text-center">PLEASE ENTER VALUE IN {userCurrency?.code}</h1>
        </div>
        <div className="md:col-span-2 flex gap-4 relative justify-between">
          <span className="absolute right-54 font-bold bottom-5">-</span>
          <span className="absolute right-54 top-13 font-bold ">-</span>
          <span className="absolute right-56 top-0 ">&</span>
          <div className="flex flex-col gap-6">
          <h1 className="text-sm text-gray-500 font-light text-center">CLAIM ADJUSTMENT</h1>
          <InputField label="CLAIM ADJUSTMENT" name="ClaimAdjustment" register={register} errors={errors} />
          <InputField label="OTHER DISCOUNT" name="OtherDiscount" register={register} errors={errors} />
          </div>
          
          <div className="flex flex-col gap-6">
          <h1 className="text-sm text-gray-500 font-light text-center">OTHER DISCOUNT</h1>
          <InputField label="" name="ClaimAdjustmentValue" register={register} errors={errors} />
          <InputField label="" name="OtherDiscountValue" register={register} errors={errors} />
          </div>
        
        
        </div>
        
        <div className="col-span-full lg:col-span-2">
          <TextArea
            label="PAYMENT TERMS"
            rows={6}
            placeholder="Enter description..."
            defaultValue={`
              01. UNIT PRICES FOB CHENNAI/COLOMBO,USD BY SEA .
              02. DELIVERY: REFER "TRACK MY ORDER" IN S-COTS.
              03. PAYMENT: 100% PAYMENTS AFTER FAX DOCUMENTS.
              04. PROFORMA VALID 30 DAYS FROM ORDER DATE.
              05. SHIPMENT WILL BE MADE IN FULL 20' CONTAINER LOAD.`}
            {...register("PaymentTerms", { required: "PaymentTerms is required" })}
          />
          {errors.PaymentTerms && <ErrorText message={errors.PaymentTerms.message} />}
        </div>

        {/* Other Charges Headers */}
        <div className="md:col-span-1 lg:hidden">
          <h1 className="text-sm text-gray-500 font-light text-center">DESCRIPTION OF OTHER CHARGES</h1>
        </div>
        <div className="md:col-span-1 lg:hidden">
          <h1 className="text-sm text-gray-500 font-light text-center">PLEASE ENTER VALUE IN USD</h1>
        </div>
        {/* Other Charges & Values */}
        <div className="flex flex-col  gap-4 relative">
          <span className="absolute text-lg top-0 -right-4">+</span>
          <span className="absolute text-lg top-13 -right-4">+</span>
          <span className="absolute text-lg top-27 -right-4">+</span>
        <InputField label="" name="OtherCharges1" register={register} errors={errors} />
        <InputField label="" name="OtherCharges2" register={register} errors={errors} />
        <InputField label="" name="OtherCharges3" register={register} errors={errors} />
        </div>

        <div className="flex flex-col gap-4">
          <InputField label="Value 1" name="OtherChargesVal1" register={register} errors={errors} />
          <InputField label="Value 2" name="OtherChargesVal2" register={register} errors={errors} />
          <InputField label="Value 3" name="OtherChargesVal3" register={register} errors={errors} />
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
const InputField = ({ label, name, register, errors, disabled = false }) => {
  const fileName = name.toUpperCase().replace(/\s+/g, '');
  return (
  <div>
    <Input label={label} name={fileName} disabled={disabled} {...register(name, { required: `${label} is required` })} />
    {errors[name] && <ErrorText message={errors[name].message} />}
  </div>
)};

// Select wrapper
const SelectField = ({ label, name, register, errors, options , disabled = false }) => {
  const fileName = name.toUpperCase().replace(/\s+/g, '');

  return (
  <div>
    <Select label={label} name={fileName} disabled={disabled} {...register(name, { required: `Please select a ${label.toLowerCase()}` })}>
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
)};

// Error display
const ErrorText = ({ message }) => <p className="text-red-500 text-xs mt-1">{message}</p>;

export default AdditionalDetailsForm;
