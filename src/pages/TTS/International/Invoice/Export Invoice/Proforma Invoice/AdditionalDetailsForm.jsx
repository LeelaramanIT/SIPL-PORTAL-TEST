import { useForm } from "react-hook-form";
import Button from "../../../../../../components/InputFields/Button";
import Input from "../../../../../../components/InputFields/Input";
import Select from "../../../../../../components/InputFields/Select";
import TextArea from "../../../../../../components/InputFields/TextArea";
import LoadingButton from "../../../../../../components/LoadingButton";
import { useDispatch, useSelector } from "react-redux";
import {
  resetCustomerAdditionalData,
  setExportCustAdditionalInvoice,
  setFinalCustomerData,
  setShowSubmit,
} from "../../../../../../Redux/Slices/InvoiceSlice";
import toast from "react-hot-toast";
import { useMemo, useEffect } from "react";
import { MdOutlinePayments } from "react-icons/md";
import { FaPaperPlane, FaMapMarkerAlt } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { setadditionalForm } from "../../../../../../Redux/Slices/ProformaInvoice/ProformaInvoiceSlice";

const AdditionalCustDetailsForm = ({
  onClose,
  handleCloseForm,
  invoiceDetails,
  setShowWarning,
}) => {
  const dispatch = useDispatch();

  const savedFormData = useSelector(
    (state) => state?.invoice?.proformaInvoice?.additionalForm,
  );

  // --- Helper: Format Payment Terms (HTML to Text) ---
  const formatPaymentTerms = (htmlContent) => {
    if (!htmlContent) return "";
    const parser = new DOMParser();
    const decoded =
      parser.parseFromString(htmlContent, "text/html").body.textContent || "";
    const numberedSections = decoded.match(/(?:\d{2}\..*?)(?=\d{2}\.|$)/gs);
    if (numberedSections?.length) {
      return numberedSections
        .map((section) => section.replace(/~+/g, "\n").trim())
        .join("\n");
    }
    return decoded.replace(/~+/g, "\n").trim();
  };

  const formattedDescription = formatPaymentTerms(
    savedFormData?.paymentTerms || invoiceDetails?.paymentTerms || "",
  );

  const formatMultilineText = (text) => (text ? text.replace(/~/g, "\n") : "");

  const handleResetToDatabase = () => {
    dispatch(resetCustomerAdditionalData());
    reset(defaultValues);
    toast.success("Reset to database values", { icon: "🔄" });
  };

  // --- Default Values ---
  const defaultValues = useMemo(() => {
    return {
      // --- Logistics ---
      preCarriageBy:
        savedFormData?.preCarriageBy || invoiceDetails?.preCarriageBy || "",
      placeOfReceiptByPreCarrier:
        savedFormData?.placeOfReceiptByPreCarrier ||
        invoiceDetails?.placeOfReceiptByPreCarrier ||
        "",
      portOfLoading:
        savedFormData?.portOfLoading || invoiceDetails?.portOfLoading || "",
      portOfDischarge:
        savedFormData?.portOfDischarge || invoiceDetails?.portOfDischarge || "",
      finalDestination:
        savedFormData?.finalDestination ||
        invoiceDetails?.finalDestination ||
        "",
      countryOfFinalDestination:
        savedFormData?.countryOfFinalDestination ||
        invoiceDetails?.countryOfFinalDestination ||
        "",
      containerType:
        savedFormData?.containerType || invoiceDetails?.containerType || "",
      // --- Address & References ---
      exportAuthorisedAddress: formatMultilineText(
        savedFormData?.exportAuthorisedAddress ||
        invoiceDetails?.exportAuthorisedAddress ||
        "",
      ),
      countryOfOriginOfGoods:
        savedFormData?.countryOfOriginOfGoods ||
        invoiceDetails?.countryOfOriginOfGoods ||
        "",
      BuyersOrderNumber:
        savedFormData?.BuyersOrderNumber || invoiceDetails?.orderRefNo || "",

      // --- Notify Party ---
      notifyPartyName:
        savedFormData?.notifyPartyName || invoiceDetails?.notifyPartyName || "",
      notifyPartyEmail:
        savedFormData?.notifyPartyEmail ||
        invoiceDetails?.notifyPartyEmail ||
        "",
      notifyPartyPhone:
        savedFormData?.notifyPartyPhone ||
        invoiceDetails?.notifyPartyPhone ||
        "",
      notifyPartyCity:
        savedFormData?.notifyPartyCity || invoiceDetails?.notifyPartyCity || "",
      notifyPartyState:
        savedFormData?.notifyPartyState ||
        invoiceDetails?.notifyPartyState ||
        "",
      notifyPartyCountry:
        savedFormData?.notifyPartyCountry ||
        invoiceDetails?.notifyPartyCountry ||
        "",
      notifyPartyAddress:
        savedFormData?.notifyPartyAddress ||
        invoiceDetails?.notifyPartyAddress ||
        "",

      // --- Financials ---
      incoterm: savedFormData?.incoterm || invoiceDetails?.incoterm || "",
      placeOfIncoterm:
        savedFormData?.placeOfIncoterm || invoiceDetails?.placeOfIncoterm || "",
      ExchangeCurrency:
        savedFormData?.ExchangeCurrency || invoiceDetails?.exchangeRate || "",
      paymentTerms: formattedDescription,
      rexNumber: savedFormData?.rexNumber || invoiceDetails?.rexNumber || "",
      igstlut: savedFormData?.igstlut || invoiceDetails?.igstlut || "",
      invoice_Details: savedFormData?.invoice_Details || "",
      bankDetails: formatMultilineText(savedFormData?.bankDetails) || "",
      leadTime: savedFormData?.leadTime || invoiceDetails?.leadTime || "",
      validityDate: savedFormData?.validityDate || invoiceDetails?.validityDate || "",
    };
  }, [invoiceDetails, savedFormData, formattedDescription]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ defaultValues });

  // Reset form when invoiceDetails changes
  useEffect(() => {
    if (invoiceDetails || savedFormData) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, invoiceDetails, savedFormData]);

  const onSubmit = async (data) => {
    toast.success("Processing Proforma Invoice Details...");

    const finalData = {
      ...invoiceDetails,
      ...data,
    };

    dispatch(setadditionalForm(finalData));
    dispatch(setFinalCustomerData());
    setShowWarning(true);
    onClose();
  };

  return (
    <div className="h-full flex flex-col dark:bg-gray-800">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
        <div className="flex flex-wrap gap-4 justify-between items-center text-sm text-gray-800 dark:text-white">
          <div>
            SHIPMENT:{" "}
            <span className="font-bold text-[var(--primary)]">
              {invoiceDetails?.shipmentType}
            </span>
          </div>
          <div>
            WORK ORDER:{" "}
            <span className="font-bold text-[var(--primary)]">
              {invoiceDetails?.workorderno}
            </span>
          </div>
          <div>
            CUSTOMER:{" "}
            <span className="font-bold text-[var(--primary)]">
              {invoiceDetails?.custfullname}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Form Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* --- 1. LOGISTICS --- */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg flex items-center gap-2 font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-200 pb-2 dark:border-gray-600">
              1. Logistics <FaPaperPlane className="text-[var(--primary)]" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SelectField
                label="Pre-Carriage by"
                name="preCarriageBy"
                register={register}
                errors={errors}
                options={["SEA", "AIR", "ROAD"]}
                watch={watch}
                setValue={setValue}
              />
              <SelectField
                label="Place of Receipt"
                name="placeOfReceiptByPreCarrier"
                register={register}
                errors={errors}
                options={["CHENNAI", "SRI LANKA", "PUDUKKOTAI, INDIA"]}
                watch={watch}
                setValue={setValue}
              />
              <InputField
                label="Port of Loading"
                name="portOfLoading"
                register={register}
                errors={errors}
              />
              <InputField
                label="Port of Discharge"
                name="portOfDischarge"
                register={register}
                errors={errors}
              />
              <InputField
                label="Final Destination"
                name="finalDestination"
                register={register}
                errors={errors}
              />
              <InputField
                label="Country of Final Destination"
                name="countryOfFinalDestination"
                register={register}
                errors={errors}
              />
              <SelectField
                label="CONTAINER TYPE"
                name="containerType"
                register={register}
                errors={errors}
                options={["20'", "40'", "40 HC"]}
                watch={watch}
                setValue={setValue}
              />
            </div>
          </section>

          {/* --- 2. ADDRESS & REFERENCES --- */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg flex items-center gap-2 font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-200 pb-2 dark:border-gray-600">
              2. References <FaMapMarkerAlt className="text-[var(--primary)]" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextArea
                label="Exporter Address"
                name="exportAuthorisedAddress"
                register={register}
                errors={errors}
                rows={7}
              />
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Country of Origin Goods"
                  name="countryOfOriginOfGoods"
                  register={register}
                  errors={errors}
                  options={["INDIA", "SRI LANKA", "INDIA & SRILANKA"]}
                  watch={watch}
                  setValue={setValue}
                />
                <InputField
                  label="Buyers Order No"
                  name="BuyersOrderNumber"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>

            {/* Notify Party */}
            <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                Notify Party Details <IoMdNotificationsOutline />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Name"
                  name="notifyPartyName"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="Email"
                  name="notifyPartyEmail"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="Phone"
                  name="notifyPartyPhone"
                  register={register}
                  errors={errors}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <InputField
                  label="City"
                  name="notifyPartyCity"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="State"
                  name="notifyPartyState"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="Country"
                  name="notifyPartyCountry"
                  register={register}
                  errors={errors}
                />
              </div>
              <div className="mt-3">
                <TextArea
                  label="Address"
                  name="notifyPartyAddress"
                  register={register}
                  rows={2}
                />
              </div>
            </div>
          </section>

          {/* --- 3. FINANCIALS --- */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200 border-b border-gray-200 pb-2 dark:border-gray-600">
              3. Financials{" "}
              <MdOutlinePayments className="text-[var(--primary)]" />
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <SelectField
                label="Incoterm"
                name="incoterm"
                register={register}
                errors={errors}
                options={["FOB", "CIF", "DDU", "DDP", "C&F", "DAP", "EXW"]}
                watch={watch}
                setValue={setValue}
              />
              <InputField
                label="Place of Incoterm"
                name="placeOfIncoterm"
                register={register}
                errors={errors}
              />
              <InputField
                label="Exchange Rate"
                name="ExchangeCurrency"
                register={register}
                errors={errors}
                type="decimal"
              />
              <SelectField
                label="LEAD TIME"
                name="leadTime"
                register={register}
                errors={errors}
                options={["WITHIN 1 WEEK", "2 WEEKS", "3 TO 4 WEEKS", "5 TO 6 WEEKS", "ABOVE 8 WEEKS"]}
                watch={watch}
                setValue={setValue}
              />
              {/* Validity Date */}
              <DateField
                label="Validity Date"
                name="validityDate"
                register={register}
                errors={errors}
              />
              <div className="lg:col-span-4 gap-2 flex">
                <TextArea
                  label="Payment Terms"
                  name="paymentTerms"
                  register={register}
                  rows={4}
                />
                <TextArea
                  label="Bank Details"
                  name="bankDetails"
                  register={register}
                  rows={4}
                />
              </div>
            </div>
          </section>

          {/* --- 4. Invoice Details --- */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200 border-b border-gray-200 pb-2 dark:border-gray-600">
              4. Invoice Details{" "}
              <MdOutlinePayments className="text-[var(--primary)]" />
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <div className="lg:col-span-4 flex">
                <InputField
                  label="IGST LUT"
                  name="igstlut"
                  register={register}
                  errors={errors}
                />
              </div>
              <div className="lg:col-span-4 flex gap-2">
                <TextArea
                  label="Invoice Details"
                  name="invoice_Details"
                  register={register}
                  rows={4}
                />
                <TextArea
                  label="REX Number"
                  name="rexNumber"
                  register={register}
                  rows={4}
                />
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
            <Button
              type="button"
              text="Cancel"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            />
            {isSubmitting ? (
              <LoadingButton
                className="bg-green-600 text-white px-6"
                text="Saving..."
              />
            ) : (
              <Button
                type="submit"
                text="Save Details"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              />
            )}
            <Button
              type="button"
              text="Reset"
              onClick={handleResetToDatabase}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

// --- GENERIC FIELDS ---
const InputField = ({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
  readOnly,
  validate,
  icon: Icon,
}) => (
  <div className="w-full">
    {label && (
      <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
        {Icon && <Icon size={12} />} {label}
      </label>
    )}
    <Input
      name={name}
      type={type}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded border text-sm ${
        errors[name]
          ? "border-red-500 focus:ring-red-200"
          : "border-gray-300 focus:ring-blue-100"
      }`}
      {...register(name, { validate })}
    />
    {errors[name] && (
      <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>
    )}
  </div>
);

const DateField = ({ label, name, register, errors }) => (
  <div className="w-full">
    {label && (
      <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
        {label}
      </label>
    )}
    <input
      type="date"
      {...register(name)}
      className={`w-full px-3 py-2 rounded border text-sm bg-white dark:bg-gray-800 dark:text-white ${
        errors[name]
          ? "border-red-500 focus:ring-red-200"
          : "border-gray-300 focus:ring-blue-100"
      }`}
    />
    {errors[name] && (
      <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>
    )}
  </div>
);

const SelectField = ({
  label,
  name,
  register,
  errors,
  options = [],
  setValue,
  watch,
}) => {
  const selectedValue = typeof watch === "function" ? watch(name) : "";
  const isCustom = selectedValue === "__custom__";

  return (
    <div className="w-full">
      <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">
        {label}
      </label>
      {!isCustom ? (
        <Select
          name={name}
          className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
          {...register(name)}
          onChange={(e) => {
            const val = e.target.value;
            setValue?.(name, val);
          }}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__custom__">➕ Add New</option>
        </Select>
      ) : (
        <Input
          name={name}
          type="text"
          placeholder="Enter value..."
          className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
          onBlur={(e) => {
            setValue?.(name, e.target.value || "");
          }}
          autoFocus
        />
      )}
    </div>
  );
};

export default AdditionalCustDetailsForm;