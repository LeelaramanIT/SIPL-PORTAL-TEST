import { useForm, useFieldArray, useWatch } from "react-hook-form";
import Button from "../../../../../../components/InputFields/Button";
import Input from "../../../../../../components/InputFields/Input";
import Select from "../../../../../../components/InputFields/Select";
import TextArea from "../../../../../../components/InputFields/TextArea";
import LoadingButton from "../../../../../../components/LoadingButton";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useMemo, useEffect, useState } from "react";
import { MdOutlinePayments } from "react-icons/md";
import { FaPaperPlane, FaMapMarkerAlt } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { TbHttpDelete } from "react-icons/tb";
import { RiStickyNoteAddLine, RiDiscountPercentLine } from "react-icons/ri";
import { BsReceiptCutoff } from "react-icons/bs";
import {
  getMasterData,
  setAdditionalForm,
} from "../../../../../../Redux/Slices/ProformaInvoice/ProformaInvoiceSlice";
const getGstPercent = (manual, igst, cgst, sgst) => {
  const manualVal = Number(manual);

  // 1. User input priority
  if (manual && !isNaN(manualVal) && manualVal > 0) {
    return manualVal;
  }

  // 2. Backend IGST
  if (igst && igst > 0) {
    return igst;
  }

  // 3. Backend CGST + SGST
  return (cgst || 0) + (sgst || 0);
};
// ─── 1. ChargesRow ────────────────────────────────────────────────────────────
const ChargesRow = ({
  invoiceIndex,
  register,
  errors,
  control,
  setValue,
  schemeName,
  dbMaxTotal = 0,
  isPrepared,
  watch,
  baseAmount = 0, // ← NEW: invoice total for % calculation
}) => {
  const [gstType, setGstType] = useState("");
  const [customGst, setCustomGst] = useState("");
  const { fields, append, remove } = useFieldArray({
    control,
    name: `additionalCharges.${invoiceIndex}.rows`,
  });
  const rows = useWatch({
    control,
    name: `additionalCharges.${invoiceIndex}.rows`,
  });
  const total = (rows || []).reduce(
    (sum, r) => sum + (Number(r.value) || 0),
    0,
  );

  const gstAmount = useMemo(() => {
    if (!baseAmount) return 0;

    if (gstType === "IGST_18") {
      return (baseAmount * 18) / 100;
    }

    if (gstType === "SGST_CGST") {
      return (baseAmount * 18) / 100; // total same, just split visually
    }

    if (gstType === "CUSTOM_IGST") {
      const pct = parseFloat(customGst) || 0;
      return (baseAmount * pct) / 100;
    }

    return 0;
  }, [gstType, customGst, baseAmount]);

  const finalTotal = total + gstAmount;

  useEffect(() => {
    setValue(`additionalCharges.${invoiceIndex}.total`, total);
  }, [total, invoiceIndex, setValue]);

  const maxAllowed = isPrepared ? dbMaxTotal : Infinity;
  const remaining = maxAllowed - total;
  const exceeded = isPrepared && total > dbMaxTotal;

  const chargeOptions = [
  "SURCHARGE",
  "PALLET CHARGES",
  "FREIGHT CHARGES",
  "FUMIGATION",
  "WRAPPING CHARGES",
  "BRAND PLATE MAKING CHARGES",
  "TARIFF",
];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
      <h5 className="text-sm font-semibold mb-2 flex justify-between">
        <span className="text-blue-700 dark:text-blue-400">
          Additional Charges {schemeName ? `(${schemeName})` : ""}
        </span>
        <span className={exceeded ? "text-red-600" : "text-blue-600"}>
          {total.toFixed(2)}
          {isPrepared && ` / ${dbMaxTotal.toFixed(2)}`}
        </span>
      </h5>

      <div className="space-y-3">
        {fields.map((field, k) => (
          <div key={field.id} className="flex gap-2 items-start pt-4">
            {/* <Input
              {...register(`additionalCharges.${invoiceIndex}.rows.${k}.desc`)}
              placeholder="Description"
              className="w-full px-2 py-1 text-sm border rounded"
            /> */}
            <SelectField
              label=""
              name={`additionalCharges.${invoiceIndex}.rows.${k}.desc`}
              register={register}
              errors={errors}
              options={chargeOptions}
              watch={watch}
              setValue={setValue}
            />
            <SmartValueInput
              value={rows?.[k]?.value ?? ""}
              baseAmount={baseAmount}
              readOnly={false}
              className={`w-28 px-2 py-1 text-sm border rounded ${isPrepared &&
                Number(rows?.[k]?.value) +
                (total - (Number(rows?.[k]?.value) || 0)) >
                dbMaxTotal
                ? "border-red-400"
                : "border-gray-300"
                }`}
              onChange={(computed) => {
                const otherTotal = total - (Number(rows?.[k]?.value) || 0);
                if (isPrepared && computed + otherTotal > dbMaxTotal) {
                  toast.error(`Max allowed is ${dbMaxTotal}`);
                  return;
                }
                setValue(
                  `additionalCharges.${invoiceIndex}.rows.${k}.value`,
                  computed,
                  { shouldDirty: true },
                );
              }}
            />
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(k)}
                className="text-red-500 hover:text-red-700 mt-1"
              >
                <TbHttpDelete size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs mt-2">
        {exceeded ? (
          <p className="text-red-600 font-semibold">
            ⚠ Total exceeds DB allowed limit ({dbMaxTotal})
          </p>
        ) : (
          isPrepared && (
            <p className="text-gray-500">
              Remaining allowed: <b>{remaining.toFixed(2)}</b>
            </p>
          )
        )}
      </div>

      {fields.length < 3 && (
        <button
          type="button"
          onClick={() => append({ desc: "", value: "" })}
          className="text-xs text-blue-600 mt-2 flex items-center gap-1 hover:underline"
        >
          <RiStickyNoteAddLine /> Add Charge
        </button>
      )}

      {/* Hint */}
      <p className="text-[10px] text-gray-400 mt-2 italic">
        💡 Enter a number (e.g. <b>500</b>) or a percentage (e.g. <b>2%</b>) —
        percentage is auto-calculated from the invoice total.
      </p>
    </div>
  );
};

// ─── 2. DiscountRow ───────────────────────────────────────────────────────────
const DiscountRow = ({
  invoiceIndex,
  register,
  errors,
  control,
  setValue,
  schemeName,
  isPrepared,
  watch,
  baseAmount = 0, // ← NEW
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `discountDetails.${invoiceIndex}.rows`,
  });
  const rows = useWatch({
    control,
    name: `discountDetails.${invoiceIndex}.rows`,
  });
  const total = (rows || []).reduce(
    (sum, r) => sum + (Number(r.value) || 0),
    0,
  );

  useEffect(() => {
    setValue(`discountDetails.${invoiceIndex}.total`, total);
  }, [total, invoiceIndex, setValue]);

  const discountOptions = [
  "DISCOUNT", 
  "CLAIM ADJUSTMENT",
];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-100 dark:border-red-900">
      <h5 className="text-sm font-semibold mb-2 flex justify-between text-red-700 dark:text-red-400">
        <span>Discounts {schemeName ? `(${schemeName})` : ""}</span>
        <span>{total.toFixed(2)}</span>
      </h5>

      <div className="space-y-3">
        {fields.map((field, k) => (
          <div key={field.id} className="flex gap-2 items-start pt-4">
            {/* <Input
              {...register(`discountDetails.${invoiceIndex}.rows.${k}.desc`)}
              placeholder="Reason"
              className="w-full px-2 py-1 text-sm border rounded"
              readOnly={isPrepared}
            /> */}
            <SelectField
              label=""
              name={`discountDetails.${invoiceIndex}.rows.${k}.desc`}
              register={register}
              errors={errors}
              options={discountOptions}
              watch={watch}
              setValue={setValue}
            />
            <SmartValueInput
              value={rows?.[k]?.value ?? ""}
              baseAmount={baseAmount}
              readOnly={isPrepared}
              className="w-28 px-2 py-1 text-sm border rounded border-gray-300"
              onChange={(computed) =>
                setValue(
                  `discountDetails.${invoiceIndex}.rows.${k}.value`,
                  computed,
                  { shouldDirty: true },
                )
              }
            />
            {fields.length > 1 && !isPrepared && (
              <button
                type="button"
                onClick={() => remove(k)}
                className="text-red-500 hover:text-red-700 mt-1"
              >
                <TbHttpDelete size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      {!isPrepared && (
        <>
          <button
            type="button"
            onClick={() => append({ desc: "", value: "" })}
            className="text-xs text-red-600 mt-2 flex items-center gap-1 hover:underline"
          >
            <RiDiscountPercentLine /> Add Discount
          </button>
          <p className="text-[10px] text-gray-400 mt-2 italic">
            💡 Enter a number (e.g. <b>500</b>) or a percentage (e.g. <b>5%</b>)
            — auto-calculated from invoice total.
          </p>
        </>
      )}
    </div>
  );
};

// ─── 3. Main Form ─────────────────────────────────────────────────────────────
const AdditionalCustDetailsForm = ({
  onClose,
  invoiceDetails,
  setShowWarning,
}) => {
  const dispatch = useDispatch();

  const savedFormData = useSelector(
    (state) => state?.proformaInvoice?.additionalForm,
  );
  const master = useSelector((state) => state?.proformaInvoice?.master);

  useEffect(() => {
    dispatch(getMasterData());
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatPaymentTerms = (htmlContent) => {
  if (!htmlContent) return "";
  const parser = new DOMParser();
  const decoded =
    parser.parseFromString(htmlContent, "text/html").body.textContent || "";
  return decoded
    .split("~")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
};

  const formatMultilineText = (text) => (text ? text.replace(/~/g, "\n") : "");

  const formattedAddress = formatMultilineText(
    savedFormData?.exportAuthorisedAddress ||
    invoiceDetails?.exportAuthorisedAddress ||
    "",
  );

  const matchedAddress = master?.exporterAddresses?.find(
    (addr) => addr.exporterAddressFormatted === formattedAddress,
  );

  const authorisedSignature = matchedAddress?.authorisedSignature || "";
  // ── Default values ─────────────────────────────────────────────────────────
  const defaultValues = useMemo(
    () => ({
      // Logistics
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
      packingMethod:
        savedFormData?.packingMethod || invoiceDetails?.packingMethod || "",
      // Address & References
      exportAuthorisedAddress: formatMultilineText(
        savedFormData?.exportAuthorisedAddress ||
        invoiceDetails?.exportAuthorisedAddress ||
        "",
      ),
      authorisedSignature,
      countryOfOriginOfGoods:
        savedFormData?.countryOfOriginOfGoods ||
        invoiceDetails?.countryOfOriginOfGoods ||
        "",
      BuyersOrderNumber:
        savedFormData?.BuyersOrderNumber || invoiceDetails?.orderRefNo || "",
      Date: savedFormData?.Date || invoiceDetails?.Date || "",
      EmailDate: savedFormData?.EmailDate || invoiceDetails?.EmailDate,

      revisionNumber:
        savedFormData?.revisionNumber || invoiceDetails?.revisionNumber || "",
      revisionDate:
        savedFormData?.revisionDate || invoiceDetails?.revisionDate || "",

      // Notify Party
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
      notifyPartyZipcode:
        savedFormData?.notifyPartyZipcode ||
        invoiceDetails?.notifyPartyZipcode ||
        "",

      // Financials
      incoterm: savedFormData?.incoterm || invoiceDetails?.incoterm || "",
      placeOfIncoterm:
        savedFormData?.placeOfIncoterm || invoiceDetails?.placeOfIncoterm || "",
      ExchangeCurrency:
        savedFormData?.ExchangeCurrency || invoiceDetails?.exchangeRate || "",
      paymentTerms: formatPaymentTerms(
        savedFormData?.paymentTerms || invoiceDetails?.paymentTerms || "",
      ),
      custInstruction: formatPaymentTerms(
        savedFormData?.custInstruction || invoiceDetails?.custInstruction || "",
      ),
      bankDetails: formatMultilineText(
        savedFormData?.bankDetails || invoiceDetails?.bankDetails || "",
      ),
      // remark: formatMultilineText(
      //   savedFormData?.remark || invoiceDetails?.remark || "",
      // ),
      leadTime: savedFormData?.leadTime || invoiceDetails?.leadTime || "",
      validityDate:
        savedFormData?.validityDate || invoiceDetails?.validityDate || "",

      // Invoice Details
      igstlut: savedFormData?.igstlut || invoiceDetails?.igstlut || "",
      rexNumber: savedFormData?.rexNumber || invoiceDetails?.rexNumber || "",
      invoice_Details:
        savedFormData?.invoice_Details || invoiceDetails?.invoice_Details || "",

      // ── NEW: Additional Charges & Discounts ──────────────────────────────
      // Each invoice scheme can have its own row-group (index = 0 here for single-invoice).
      // If you have multiple invoice schemes, map over them and seed one entry per scheme.
      additionalCharges: savedFormData?.additionalCharges || [
        { rows: [{ desc: "", value: "" }], total: 0 },
      ],
      discountDetails: savedFormData?.discountDetails || [
        { rows: [{ desc: "", value: "" }], total: 0 },
      ],
      gstCharges: {
        type: savedFormData?.gstCharges?.type || "BACKEND",
        igst: savedFormData?.gstCharges?.igst || "",
        cgst: savedFormData?.gstCharges?.cgst || "",
        sgst: savedFormData?.gstCharges?.sgst || "",
        percentage: savedFormData?.gstCharges?.percentage || "",
        amount: savedFormData?.gstCharges?.amount || 0,
      },
    }),
    [invoiceDetails, savedFormData],
  );
  const subtotal = useMemo(() => {
    return (invoiceDetails?.items || []).reduce((sum, item) => {
      // Ensure values are numbers to avoid string concatenation bugs
      const price =
        Number((item?.basicPrice || 0) + (item?.rimUnitPrice || 0)) || 0;
      const qty = Number(item?.itemQty) || 0;
      return sum + price * qty;
    }, 0);
  }, [invoiceDetails?.items]);

  console.log(subtotal);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // ── Reset to DB ────────────────────────────────────────────────────────────
  const handleResetToDatabase = () => {
    const dbValues = {
      preCarriageBy: invoiceDetails?.preCarriageBy || "",
      placeOfReceiptByPreCarrier:
        invoiceDetails?.placeOfReceiptByPreCarrier || "",
      portOfLoading: invoiceDetails?.portOfLoading || "",
      portOfDischarge: invoiceDetails?.portOfDischarge || "",
      finalDestination: invoiceDetails?.finalDestination || "",
      countryOfFinalDestination:
        invoiceDetails?.countryOfFinalDestination || "",
      containerType: invoiceDetails?.containerType || "",
      packingMethod: invoiceDetails?.packingMethod || "",
      exportAuthorisedAddress: formatMultilineText(
        invoiceDetails?.exportAuthorisedAddress || "",
      ),
      revisionNumber: invoiceDetails?.revisionNumber || "",
      revisionDate: invoiceDetails?.revisionDate || "",
      countryOfOriginOfGoods: invoiceDetails?.countryOfOriginOfGoods || "",
      BuyersOrderNumber: invoiceDetails?.orderRefNo || "",
      notifyPartyName: invoiceDetails?.notifyPartyName || "",
      notifyPartyEmail: invoiceDetails?.notifyPartyEmail || "",
      notifyPartyPhone: invoiceDetails?.notifyPartyPhone || "",
      notifyPartyCity: invoiceDetails?.notifyPartyCity || "",
      notifyPartyState: invoiceDetails?.notifyPartyState || "",
      notifyPartyCountry: invoiceDetails?.notifyPartyCountry || "",
      notifyPartyAddress: invoiceDetails?.notifyPartyAddress || "",
      incoterm: invoiceDetails?.incoterm || "",
      placeOfIncoterm: invoiceDetails?.placeOfIncoterm || "",
      ExchangeCurrency: invoiceDetails?.exchangeRate || "",
      paymentTerms: formatPaymentTerms(invoiceDetails?.paymentTerms || ""),
      custInstruction: formatPaymentTerms(
        invoiceDetails?.custInstruction || "",
      ),
      // remark: formatMultilineText(invoiceDetails?.remark || ""),
      bankDetails: formatMultilineText(invoiceDetails?.bankDetails || ""),
      leadTime: invoiceDetails?.leadTime || "",
      validityDate: invoiceDetails?.validityDate || "",
      igstlut: invoiceDetails?.igstlut || "",
      rexNumber: invoiceDetails?.rexNumber || "",
      invoice_Details: invoiceDetails?.invoice_Details || "",
      // Reset charges/discounts to a single empty row
      additionalCharges: [{ rows: [{ desc: "", value: "" }], total: 0 }],
      discountDetails: [{ rows: [{ desc: "", value: "" }], total: 0 }],
    };

    reset(dbValues);
    dispatch(setAdditionalForm({}));
    toast.success("Reset to database values", { icon: "🔄", duration: 5000 });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    const charges = data.additionalCharges || [];
    const discounts = data.discountDetails || [];

    const totalCharges = charges.reduce(
      (s, g) => s + (Number(g?.total) || 0),
      0,
    );

    const totalDiscounts = discounts.reduce(
      (s, g) => s + (Number(g?.total) || 0),
      0,
    );

    const taxable = subtotal + totalCharges - totalDiscounts;

    // Backend GST
    const backendIgst = Number(invoiceDetails?.igst || 0);
    const backendCgst = Number(invoiceDetails?.cgst || 0);
    const backendSgst = Number(invoiceDetails?.sgst || 0);

    const gstType = data.gstCharges?.type || "BACKEND";

    // ✅ FINAL GST PAYLOAD (single source of truth)
    let gstPayload = {
      type: gstType,
      igst: 0,
      cgst: 0,
      sgst: 0,
    };

    if (gstType === "IGST") {
      gstPayload.igst = Number(data.gstCharges?.igst || 0);
    } else if (gstType === "CGST_SGST") {
      gstPayload.cgst = Number(data.gstCharges?.cgst || 0);
      gstPayload.sgst = Number(data.gstCharges?.sgst || 0);
    } else {
      // BACKEND
      gstPayload.igst = backendIgst;
      gstPayload.cgst = backendCgst;
      gstPayload.sgst = backendSgst;
    }

    // ✅ GST %
    const gstPercent =
      gstPayload.igst > 0 ? gstPayload.igst : gstPayload.cgst + gstPayload.sgst;

    // ✅ GST Amount
    const gstAmount =
      taxable > 0 ? parseFloat(((taxable * gstPercent) / 100).toFixed(2)) : 0;

    const finalTotal = taxable + gstAmount;

    // ✅ FINAL PAYLOAD
    const finalPayload = {
      ...data,

      gstCharges: {
        ...gstPayload,
        percentage: gstPercent,
        amount: gstAmount,
        isManual: gstType !== "BACKEND",
      },

      summary: {
        subtotal,
        totalCharges,
        totalDiscounts,
        taxable,
        gstAmount,
        finalTotal,
      },
    };

    // ✅ SAVE
    dispatch(setAdditionalForm(finalPayload));

    toast.success("Draft saved successfully", { duration: 5000 });

    setShowWarning(true);
    onClose();
  };

  // ── isPrepared flag (tweak the condition to match your business logic) ─────
  const isPrepared = invoiceDetails?.status === "PREPARED";

  const charges = useWatch({ control, name: "additionalCharges" });
  const discounts = useWatch({ control, name: "discountDetails" });
  const totalCharges = (charges || []).reduce(
    (s, g) => s + (Number(g?.total) || 0),
    0,
  );

  const totalDiscounts = (discounts || []).reduce(
    (s, g) => s + (Number(g?.total) || 0),
    0,
  );
  const taxableAmount =
    (subtotal || 0) + (totalCharges || 0) - (totalDiscounts || 0);

  console.log("subtotal", subtotal);
  console.log("totalCharges", totalCharges);
  console.log("totalDiscounts", totalDiscounts);
  console.log("taxableAmount", taxableAmount);

  return (
    <div className="h-full flex flex-col dark:bg-gray-800">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
        <div className="flex flex-wrap gap-4 justify-between items-center text-sm text-gray-800 dark:text-white">
          <div>
            INVOICE TYPE:{" "}
            <span className="font-bold text-[var(--primary)]">
              {invoiceDetails?.invoiceType === "PI"
                ? "PROFORMA INVOICE"
                : "DRAFT INVOICE"}
            </span>
          </div>
          <div>
            ORDER REFERENCES:{" "}
            <span className="font-bold text-[var(--primary)]">
              {invoiceDetails?.orderRefNo}
            </span>
          </div>
          <div>
            CUSTOMER:{" "}
            <span className="font-bold text-[var(--primary)]">
              {invoiceDetails?.custFullName}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Form Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* ── 1. LOGISTICS ────────────────────────────────────────────────── */}
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
                options={
                  master?.transportModes?.map((i) => i.modeCode) || ["", "", ""]
                }
                watch={watch}
                setValue={setValue}
                required={true}
              />
              <InputField
                label="Final Destination"
                name="finalDestination"
                register={register}
                errors={errors}
                required={true}
              />
              <SelectField
                label="Container Type"
                name="containerType"
                register={register}
                errors={errors}
                options={
                  master?.containerTypes?.map((i) => i.containerType) || [
                    "",
                    "",
                    "",
                  ]
                }
                watch={watch}
                setValue={setValue}
                required={true}
              />
              <SelectField
                label="Packing Method"
                name="packingMethod"
                register={register}
                errors={errors}
                options={
                  master?.packingMethods?.map((i) => i.packingmethod) || [
                    "",
                    "",
                    "",
                  ]
                }
                watch={watch}
                setValue={setValue}
              />
            </div>
          </section>

          {/* ── 2. ADDRESS & REFERENCES ─────────────────────────────────────── */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg flex items-center gap-2 font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-200 pb-2 dark:border-gray-600">
              2. References <FaMapMarkerAlt className="text-[var(--primary)]" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SelectField
                label="Exporter Address"
                name="exportAuthorisedAddress"
                register={register}
                errors={errors}
                options={
                  master?.exporterAddresses?.map(
                    (i) => i.exporterAddressFormatted,
                  ) || ["", "", ""]
                }
                watch={watch}
                setValue={setValue}
                required={true}
              />
              <div className="grid grid-cols-1 gap-4">
                <InputField
                  label="Buyers Order No"
                  name="BuyersOrderNumber"
                  register={register}
                  errors={errors}
                  required={true}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <DateField
                  label="Order Date"
                  name="Date"
                  register={register}
                  errors={errors}
                  required={true}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <DateField
                  label="Email Date"
                  name="EmailDate"
                  register={register}
                  errors={errors}
                  required={true}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <InputField
                  label="Revision Number"
                  name="revisionNumber"
                  register={register}
                  errors={errors}
                // required
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <DateField
                  label="Revision Date"
                  name="revisionDate"
                  register={register}
                  errors={errors}
                // required={true}
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
                <InputField
                  label="Zip Code"
                  name="notifyPartyZipcode"
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
                // required={true}
                />
              </div>
            </div>
          </section>

          {/* ── 3. FINANCIALS ───────────────────────────────────────────────── */}
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
                options={
                  master?.incoterms?.map((i) => i.incoterm) || ["", "", ""]
                }
                watch={watch}
                setValue={setValue}
                required={true}
              />
              <InputField
                label="Place of Incoterm"
                name="placeOfIncoterm"
                register={register}
                errors={errors}
                required={true}
              />
              {/* <InputField
                label="Exchange Rate"
                name="ExchangeCurrency"
                register={register}
                errors={errors}
                type="decimal"
              /> */}
              <SelectField
                label="Lead Time"
                name="leadTime"
                register={register}
                errors={errors}
                options={
                  master?.leadtimemaster?.map((i) => i?.leadtimename) || [
                    "WITHIN 1 WEEK",
                    "2 WEEKS",
                    "3 TO 4 WEEKS",
                    "5 TO 6 WEEKS",
                    "ABOVE 8 WEEKS",
                  ]
                }
                watch={watch}
                setValue={setValue}
                required={true}
              />
              <DateField
                label="Validity Date"
                name="validityDate"
                register={register}
                errors={errors}
                required={true}
              />
              <div className="lg:col-span-4 gap-2 flex">
                <TextArea
                  label="Payment Terms"
                  name="paymentTerms"
                  register={register}
                  rows={6}
                  required={true}
                />
                <TextArea
                  label="Remarks"
                  name="custInstruction"
                  register={register}
                  rows={6}
                />
                <SelectField
                  label="Bank Details"
                  name="bankDetails"
                  register={register}
                  errors={errors}
                  options={master?.exporterBanks?.map(
                    (i) => i.bankAddressFormatted,
                  )}
                  watch={watch}
                  setValue={setValue}
                  required={true}
                />
              </div>
            </div>
          </section>

          {/* ── 4. OTHER CHARGES & DISCOUNTS ────────────────────────────────── */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-2 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
                4. Other Charges &amp; Discounts
                <BsReceiptCutoff className="text-[var(--primary)]" />
              </h2>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Subtotal:{" "}
                <span className="text-[var(--primary)] font-bold">
                  {(subtotal || 0).toFixed(2)}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChargesRow
                invoiceIndex={0}
                register={register}
                errors={errors}
                control={control}
                setValue={setValue}
                schemeName={invoiceDetails?.schemeName || ""}
                dbMaxTotal={Number(invoiceDetails?.maxAdditionalCharges) || 0}
                isPrepared={isPrepared}
                baseAmount={Number(subtotal) || 0}
                watch={watch} 
              />
              <DiscountRow
                invoiceIndex={0}
                register={register}
                errors={errors}
                control={control}
                setValue={setValue}
                schemeName={invoiceDetails?.schemeName || ""}
                isPrepared={isPrepared}
                baseAmount={Number(subtotal) || 0}
                watch={watch}
              />
            </div>
            <GstCharges
              control={control}
              invoiceDetails={invoiceDetails}
              taxableAmount={Number(taxableAmount)}
              register={register} // ← REQUIRED
              errors={errors} // ← REQUIRED
              setValue={setValue} // ← REQUIRED
              watch={watch} // ← REQUIRED
            />

            <ChargesSummary
              control={control}
              baseAmount={Number(subtotal)}
              invoiceDetails={invoiceDetails}
            />
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
                text="Back to Submit"
                className="bg-green-600 hover:bg-yellow-700 text-white px-8"
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

// ─── 4. ChargesSummary (net total bar) ───────────────────────────────────────
// Shows net = total charges − total discounts across all invoice groups.
const ChargesSummary = ({ control, baseAmount = 0, invoiceDetails }) => {
  const charges = useWatch({ control, name: "additionalCharges" });
  const discounts = useWatch({ control, name: "discountDetails" });

  const gstType = useWatch({ control, name: "gstCharges.type" });

  const igstInput = Number(useWatch({ control, name: "gstCharges.igst" }) || 0);
  const cgstInput = Number(useWatch({ control, name: "gstCharges.cgst" }) || 0);
  const sgstInput = Number(useWatch({ control, name: "gstCharges.sgst" }) || 0);

  // Backend GST
  const igstBackend = Number(invoiceDetails?.igst || 0);
  const cgstBackend = Number(invoiceDetails?.cgst || 0);
  const sgstBackend = Number(invoiceDetails?.sgst || 0);

  // Totals
  const totalCharges = (charges || []).reduce(
    (s, g) => s + (Number(g?.total) || 0),
    0,
  );

  const totalDiscounts = (discounts || []).reduce(
    (s, g) => s + (Number(g?.total) || 0),
    0,
  );

  const taxable = baseAmount + totalCharges - totalDiscounts;

  // ✅ GST % (same logic as onSubmit)
  let gstPercent = 0;

  if (gstType === "IGST") {
    gstPercent = igstInput;
  } else if (gstType === "CGST_SGST") {
    gstPercent = cgstInput + sgstInput;
  } else {
    gstPercent = igstBackend > 0 ? igstBackend : cgstBackend + sgstBackend;
  }

  // ✅ GST Amount
  const gst =
    taxable > 0 ? parseFloat(((taxable * gstPercent) / 100).toFixed(2)) : 0;

  const finalTotal = taxable + gst;

  return (
    <div className="mt-4 flex items-center justify-end gap-6 text-sm border-t pt-3 border-gray-200 dark:border-gray-600 flex-wrap">
      <span>
        Subtotal: <b>{baseAmount.toFixed(2)}</b>
      </span>
      <span>
        Charges: <b>{totalCharges.toFixed(2)}</b>
      </span>
      <span>
        Discounts: <b>-{totalDiscounts.toFixed(2)}</b>
      </span>
      <span>
        Taxable: <b>{taxable.toFixed(2)}</b>
      </span>
      <span>
        GST ({gstPercent}%): <b>{gst.toFixed(2)}</b>
      </span>
      <span className="font-bold text-lg text-green-600 dark:text-green-400">
        Final: {finalTotal.toFixed(2)}
      </span>
    </div>
  );
};

// ─── Generic Fields ───────────────────────────────────────────────────────────
const InputField = ({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
  readOnly,
  validate,
  required = false,
  icon: Icon,
}) => (
  <div className="w-full">
    {label && (
      <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
        {Icon && <Icon size={12} />} {label} {required && "*"}
      </label>
    )}
    <Input
      name={name}
      type={type}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded border text-sm ${errors[name]
        ? "border-red-500 focus:ring-red-200"
        : "border-gray-300 focus:ring-blue-100"
        }`}
      {...register(name, {
        required: required ? `${label} is required` : false,
        validate,
      })}
    />
    {errors[name] && (
      <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>
    )}
  </div>
);

const DateField = ({ label, name, register, errors, required = false }) => (
  <div className="w-full">
    {label && (
      <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">
        {label} {required && "*"}
      </label>
    )}
    <input
      type="date"
      {...register(name, {
        required: required ? `${label} is required` : false,
      })}
      className={`w-full px-3 py-2 rounded border text-sm bg-white dark:bg-gray-800 dark:text-white ${errors[name] ? "border-red-500" : "border-gray-300"
        }`}
    />
    {errors[name] && (
      <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>
    )}
  </div>
);

// import { useState, useEffect } from "react";

const SelectField = ({
  label,
  name,
  register,
  errors,
  options = [],
  setValue,
  watch,
  required = false,
}) => {
  const value = watch(name) || "";
  const normalizedOptions = options.filter(Boolean).map((o) => String(o));

  const [isCustom, setIsCustom] = useState(
    () => value !== "" && !normalizedOptions.includes(String(value)),
  );

  useEffect(() => {
    if (value === "" || normalizedOptions.includes(String(value))) {
      setIsCustom(false);
    }
  }, [value, normalizedOptions.join(",")]);

  return (
    <div className="w-full">
      <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">
        {label} {required && "*"}
      </label>

      {!isCustom ? (
        <Select
          name={name}
          className={`w-full px-3 py-2 rounded border text-sm ${errors?.[name] ? "border-red-500" : "border-gray-300"
            }`}
          {...register(name, {
            required: required ? `${label} is required` : false,
          })}
          value={value}
          onChange={(e) => {
            const val = e.target.value;

            if (val === "__custom__") {
              setIsCustom(true);
              setValue(name, "", { shouldDirty: true });
            } else {
              setValue(name, val, { shouldDirty: true });
            }
          }}
        >
          <option value="">Select...</option>
          {normalizedOptions.map((opt) => (
            <option key={opt} value={opt} title={opt}>
              {opt}
            </option>
          ))}
          <option value="__custom__">➕ Add New</option>
        </Select>
      ) : (
        <div className="relative">
          <Input
            name={name}
            type="text"
            placeholder="Enter value..."
            className={`w-full px-3 py-2 rounded border text-sm pr-8 ${errors?.[name] ? "border-red-500" : "border-blue-400"
              }`}
            {...register(name, {
              required: required ? `${label} is required` : false,
            })} // ✅ FIX HERE
            value={value}
            onChange={(e) =>
              setValue(name, e.target.value, { shouldDirty: true })
            }
            autoFocus
          />

          <button
            type="button"
            title="Back to list"
            onClick={() => {
              setIsCustom(false);
              setValue(name, "", { shouldDirty: true });
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {errors?.[name] && (
        <p className="text-red-500 text-[10px] mt-0.5">
          {errors[name].message}
        </p>
      )}
    </div>
  );
};
/**
 * SmartValueInput
 * - Plain number  → stored as-is           e.g. "10000"  → 10000
 * - Ends with %   → computed from base     e.g. "2%"     → baseAmount * 0.02
 * Shows a small pill when a % was resolved.
 */
const SmartValueInput = ({
  value,
  onChange,
  baseAmount = 0,
  readOnly,
  placeholder = "0.00 or 2%",
  className,
}) => {
  const [raw, setRaw] = useState(() =>
    value !== "" && value != null ? String(value) : "",
  );
  const [resolvedFrom, setResolvedFrom] = useState(""); // e.g. "2% of 50000"

  // Keep raw in sync when parent resets the form
  useEffect(() => {
    if (value === "" || value == null) {
      setRaw("");
      setResolvedFrom("");
    } else if (!raw.endsWith("%")) {
      // only sync if not mid-typing a percentage
      setRaw(String(value));
    }
  }, [value]);

  const resolve = (inputRaw) => {
    const trimmed = inputRaw.trim();
    const pctMatch = trimmed.match(/^(\d+(\.\d+)?)%$/);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      const computed = parseFloat(((pct / 100) * baseAmount).toFixed(2));
      setResolvedFrom(`${pct}% of ${baseAmount.toFixed(2)}`);
      setRaw(String(computed)); // show resolved number in input
      onChange(computed);
    } else {
      const num = parseFloat(trimmed) || 0;
      setResolvedFrom("");
      onChange(num);
    }
  };

  return (
    <div className="relative flex flex-col gap-0.5">
      <Input
        type="text"
        value={raw}
        readOnly={readOnly}
        placeholder={placeholder}
        className={className}
        onChange={(e) => {
          setRaw(e.target.value);
          setResolvedFrom(""); // clear pill while editing
          // live-update if it's a plain number
          const plain = parseFloat(e.target.value);
          if (!e.target.value.trim().endsWith("%") && !isNaN(plain)) {
            onChange(plain);
          }
        }}
        onBlur={() => resolve(raw)}
        onKeyDown={(e) => e.key === "Enter" && resolve(raw)}
      />
      {resolvedFrom && (
        <span className="absolute -top-4 right-0 text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full whitespace-nowrap">
          ={resolvedFrom}
        </span>
      )}
    </div>
  );
};

const GstCharges = ({
  control,
  invoiceDetails,
  taxableAmount,
  register,
  errors,
  setValue,
  watch,
}) => {
  const igstBackend = Number(invoiceDetails?.igst || 0);
  const cgstBackend = Number(invoiceDetails?.cgst || 0);
  const sgstBackend = Number(invoiceDetails?.sgst || 0);

  // GST Type (default BACKEND)
  const gstType = watch("gstCharges.type") || "BACKEND";

  // User Inputs
  const igstInput = Number(watch("gstCharges.igst") || 0);
  const cgstInput = Number(watch("gstCharges.cgst") || 0);
  const sgstInput = Number(watch("gstCharges.sgst") || 0);

  // ✅ Decide GST %
  let activeGstPercent = 0;

  if (gstType === "IGST") {
    activeGstPercent = igstInput;
  } else if (gstType === "CGST_SGST") {
    activeGstPercent = cgstInput + sgstInput;
  } else {
    activeGstPercent =
      igstBackend > 0 ? igstBackend : cgstBackend + sgstBackend;
  }

  // ✅ GST Amount
  const gstAmount = useMemo(() => {
    if (!taxableAmount || !activeGstPercent) return 0;
    return parseFloat(((taxableAmount * activeGstPercent) / 100).toFixed(2));
  }, [taxableAmount, activeGstPercent]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded border border-green-200 dark:border-green-900">
      <h5 className="text-sm font-semibold mb-4 text-green-700 dark:text-green-400">
        GST Charges
      </h5>

      {/* ✅ GST TYPE SELECT */}
      <div className="mb-4">
        <label className="text-[10px] font-bold text-gray-500 block mb-1">
          GST Type
        </label>

        <select
          {...register("gstCharges.type")}
          className="px-3 py-2 border rounded text-sm w-full"
        >
          <option value="BACKEND">Use Backend GST</option>
          <option value="IGST">IGST</option>
          <option value="CGST_SGST">CGST + SGST</option>
        </select>
      </div>

      {/* ✅ IGST INPUT */}
      {gstType === "IGST" && (
        <div className="mb-4">
          <label className="text-[10px] font-bold text-gray-500 block mb-1">
            IGST %
          </label>

          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="Enter IGST %"
            {...register("gstCharges.igst", {
              required: "IGST is required",
              min: { value: 0, message: "Min 0%" },
              max: { value: 100, message: "Max 100%" },
            })}
            className={`w-full px-3 py-2 border rounded text-sm ${errors?.gstCharges?.igst ? "border-red-400" : "border-gray-300"
              }`}
          />

          {errors?.gstCharges?.igst && (
            <p className="text-red-500 text-[10px] mt-1">
              {errors.gstCharges.igst.message}
            </p>
          )}
        </div>
      )}

      {/* ✅ CGST + SGST INPUT */}
      {gstType === "CGST_SGST" && (
        <div className="mb-4 flex gap-3">
          <div className="w-full">
            <label className="text-[10px] font-bold text-gray-500 block mb-1">
              CGST %
            </label>

            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="CGST %"
              {...register("gstCharges.cgst", {
                required: "CGST required",
                min: { value: 0, message: "Min 0%" },
                max: { value: 100, message: "Max 100%" },
              })}
              className={`w-full px-3 py-2 border rounded text-sm ${errors?.gstCharges?.cgst ? "border-red-400" : "border-gray-300"
                }`}
            />

            {errors?.gstCharges?.cgst && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.gstCharges.cgst.message}
              </p>
            )}
          </div>

          <div className="w-full">
            <label className="text-[10px] font-bold text-gray-500 block mb-1">
              SGST %
            </label>

            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="SGST %"
              {...register("gstCharges.sgst", {
                required: "SGST required",
                min: { value: 0, message: "Min 0%" },
                max: { value: 100, message: "Max 100%" },
              })}
              className={`w-full px-3 py-2 border rounded text-sm ${errors?.gstCharges?.sgst ? "border-red-400" : "border-gray-300"
                }`}
            />

            {errors?.gstCharges?.sgst && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.gstCharges.sgst.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ✅ BACKEND INFO */}
      {gstType === "BACKEND" && (
        <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-100 rounded">
          📌 Backend GST:{" "}
          {igstBackend > 0
            ? `IGST ${igstBackend}%`
            : `CGST ${cgstBackend}% + SGST ${sgstBackend}%`}
        </div>
      )}

      {/* ✅ TAXABLE */}
      <div className="text-xs text-gray-500 mb-2">
        Taxable Amount: <b>{taxableAmount.toFixed(2)}</b>
      </div>

      {/* ✅ GST AMOUNT */}
      <div className="text-sm p-2 bg-green-50 rounded border border-green-200">
        <div className="font-semibold text-green-700">
          GST ({activeGstPercent}%):{" "}
          <span className="text-lg">{gstAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* ✅ SPLIT DISPLAY */}
      {gstType === "CGST_SGST" && (
        <div className="text-xs mt-2 text-gray-500">
          CGST: {(gstAmount / 2).toFixed(2)} | SGST:{" "}
          {(gstAmount / 2).toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default AdditionalCustDetailsForm;
