import { useForm, useWatch, useFieldArray } from "react-hook-form";
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
import { TbHttpDelete } from "react-icons/tb";
import { RiStickyNoteAddLine, RiDiscountPercentLine } from "react-icons/ri";
import { GiWeight, GiWoodenCrate } from "react-icons/gi";
import { MdOutlinePayments, MdPallet } from "react-icons/md";
import { FaPaperPlane, FaMapMarkerAlt } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import {
  LiaBoxesSolid,
  LiaFileInvoiceDollarSolid,
  LiaPalletSolid,
} from "react-icons/lia";
import { PiTireDuotone, PiWarehouseLight } from "react-icons/pi";

const AdditionalCustDetailsForm = ({
  onClose,
  handleCloseForm,
  invoiceDetails, // This is your new JSON object
  setShowWarning,
}) => {
  const dispatch = useDispatch();

  // Redux Data (for persistence if needed, but we prioritize props now)
  const savedFormData = useSelector(
    (state) => state?.invoice?.exportInvoices?.additionalCustForm,
  );

  // --- Helper: Format Payment Terms (HTML to Text) ---
  const formatPaymentTerms = (htmlContent) => {
    if (!htmlContent) return "";
    const parser = new DOMParser();
    const decoded =
      parser.parseFromString(htmlContent, "text/html").body.textContent || "";
    // Regex to handle numbered lists if present, or just replace tildes
    const numberedSections = decoded.match(/(?:\d{2}\..*?)(?=\d{2}\.|$)/gs);
    if (numberedSections?.length) {
      return numberedSections
        .map((section) => section.replace(/~+/g, "\n").trim())
        .join("\n");
    }
    return decoded.replace(/~+/g, "\n").trim();
  };
    const isPrepared =
    Array.isArray(invoiceDetails?.otherChargesDetails) &&
    invoiceDetails.otherChargesDetails.length > 0;

  const formattedDescription = formatPaymentTerms(
    savedFormData?.paymentTerms || invoiceDetails?.paymentTerms || "",
  );

  const handleResetToDatabase = () => {
    dispatch(resetCustomerAdditionalData());

    const chargeSource = invoiceDetails?.otherChargesDetails || [];
    const detailSource = invoiceDetails?.additionalDetails || [];

    const additionalCharges = [];
    const discountDetails = [];
    const packingDefaults = {};

    chargeSource.forEach((charge, index) => {
      const det = detailSource.find(
        (d) =>
          d.invoiceID === charge.invoiceID &&
          d.schemeName === charge.schemeName
      );

      const key = `${charge.schemeName}_${index}`;

      // ---------- PACKING ----------
      if (det) {
        packingDefaults[`${key}_isPallet`] = det.isPallet || false;
        packingDefaults[`${key}_palletCount`] = det.palletCount || "";
        packingDefaults[`${key}_numberOfTyres`] = det.palletTyres || "";
        packingDefaults[`${key}_palletWeight`] = det.palletweight || "";
        packingDefaults[`${key}_palletDimension`] = det.palletDimension || "";

        packingDefaults[`${key}_isWoodenBox`] = det.isWoodenBox || false;
        packingDefaults[`${key}_woodenBoxCount`] = det.woodenBoxCount || "";
        packingDefaults[`${key}_woodenBoxTyres`] = det.woodenBoxTyres || "";
        packingDefaults[`${key}_woodenBoxWeight`] = det.woodenBoxWeight || "";
        packingDefaults[`${key}_woodenBoxDimension`] = det.woodenBoxDimension || "";
      }

      // ---------- CHARGES ----------
      const chargeRows = [];
      if (charge.chargesType1)
        chargeRows.push({ desc: charge.chargesType1, value: charge.otherCharges1 });
      if (charge.chargesType2)
        chargeRows.push({ desc: charge.chargesType2, value: charge.otherCharges2 });
      if (charge.chargesType3)
        chargeRows.push({ desc: charge.chargesType3, value: charge.otherCharges3 });

      additionalCharges.push({
        invoiceIndex: index,
        invoiceID: charge.invoiceID,
        scheme: charge.schemeName,
        rows: chargeRows.length ? chargeRows : [{ desc: "", value: "" }],
        total: chargeRows.reduce((s, r) => s + Number(r.value || 0), 0),
      });

      // ---------- DISCOUNTS ----------
      const discountRows = [];
      if (charge.discount1)
        discountRows.push({ desc: charge.discount1, value: charge.discountValue1 });
      if (charge.discount2)
        discountRows.push({ desc: charge.discount2, value: charge.discountValue2 });
      if (charge.discount3)
        discountRows.push({ desc: charge.discount3, value: charge.discountValue3 });

      discountDetails.push({
        invoiceIndex: index,
        invoiceID: charge.invoiceID,
        scheme: charge.schemeName,
        rows: discountRows.length ? discountRows : [{ desc: "", value: "" }],
        total: discountRows.reduce((s, r) => s + Number(r.value || 0), 0),
      });
    });

    reset({
      ...defaultValues, // keeps logistics & static fields
      ...packingDefaults,
      additionalCharges,
      discountDetails,
    });

    toast.success("Reset to database values", { icon: "🔄" });
  };

  const formatMultilineText = (text) => (text ? text.replace(/~/g, "\n") : "");

  const buildDefaultsFromInvoice = (invoiceDetails) => {
    const defaults = {};
    const details = invoiceDetails?.additionalDetails || [];

    details.forEach((det, index) => {
      const key = `${det.schemeName}_${index}`;

      defaults[`${key}_isPallet`] = det.isPallet || false;
      defaults[`${key}_palletCount`] = det.palletCount || "";
      defaults[`${key}_numberOfTyres`] = det.palletTyres || "";
      defaults[`${key}_palletWeight`] = det.palletweight || "";
      defaults[`${key}_palletDimension`] = det.palletDimension || "";

      defaults[`${key}_isWoodenBox`] = det.isWoodenBox || false;
      defaults[`${key}_woodenBoxCount`] = det.woodenBoxCount || "";
      defaults[`${key}_woodenBoxTyres`] = det.woodenBoxTyres || "";
      defaults[`${key}_woodenBoxWeight`] = det.woodenBoxWeight || "";
      defaults[`${key}_woodenBoxDimension`] = det.woodenBoxDimension || "";
    });

    return {
      preCarriageBy: invoiceDetails?.preCarriageBy || "",
      placeOfReceiptByPreCarrier:
        invoiceDetails?.placeOfReceiptByPreCarrier || "",
      portOfLoading: invoiceDetails?.portOfLoading || "",
      portOfDischarge: invoiceDetails?.portOfDischarge || "",
      finalDestination: invoiceDetails?.finalDestination || "",
      countryOfFinalDestination:
        invoiceDetails?.countryOfFinalDestination || "",
      containerType: invoiceDetails?.containerType || "",
      containerNo: invoiceDetails?.containerNo || "",
      containerSEALNO: invoiceDetails?.containerSEALNO || "",
      exportAuthorisedAddress:
        formatMultilineText(invoiceDetails?.exportAuthorisedAddress) || "",
      countryOfOriginOfGoods: invoiceDetails?.countryOfOriginOfGoods || "",
      invoiceNumber: invoiceDetails?.invoiceNumber || "",
      otsNo: invoiceDetails?.otsNo || "",
      orderRefNo: invoiceDetails?.orderRefNo,
      BuyersOrderNumber: invoiceDetails?.buyerorderrefno || "",
      incoterm: invoiceDetails?.incoterm || "",
      ExchangeCurrency: invoiceDetails?.exchangeRate || "",
      paymentTerms: invoiceDetails?.paymentTerms || "",
      additionalCharges: [
        {
          invoiceIndex: 0,
          invoiceID: invoiceDetails?.id || 1,
          scheme: "Direct",
          rows: [{ desc: "", value: "" }],
          total: 0
        }
      ],
      discountDetails: [
        {
          invoiceIndex: 0,
          invoiceID: invoiceDetails?.id || 1,
          scheme: "Direct",
          rows: [{ desc: "", value: "" }],
          total: 0
        }
      ],

      ...defaults,
    };
  };
  // --- 1. Prepare Default Values ---
  const defaultValues = useMemo(() => {
    // Helper to get defaults for packing from additionalDetails array
    const getPackingDefaults = () => {
      const defaults = {};

      const uniqueGroups = invoiceDetails?.otherChargesDetails || [];
      const details =
        savedFormData?.additionalDetails ||
        invoiceDetails?.additionalDetails ||
        [];

      uniqueGroups.forEach((group, index) => {
        const det = details.find(
          (d) =>
            d.invoiceID === group.invoiceID &&
            d.schemeName === group.schemeName,
        );

        if (!det) return;

        const key = `${det.schemeName}_${index}`;

        defaults[`${key}_isPallet`] = det.isPallet || false;
        defaults[`${key}_palletCount`] = det.palletCount || "";
        defaults[`${key}_numberOfTyres`] = det.palletTyres || "";
        defaults[`${key}_palletWeight`] = det.palletweight || "";
        defaults[`${key}_palletDimension`] = det.palletDimension || "";

        defaults[`${key}_isWoodenBox`] = det.isWoodenBox || false;
        defaults[`${key}_woodenBoxCount`] = det.woodenBoxCount || "";
        defaults[`${key}_woodenBoxTyres`] = det.woodenBoxTyres || "";
        defaults[`${key}_woodenBoxWeight`] = det.woodenBoxWeight || "";
        defaults[`${key}_woodenBoxDimension`] = det.woodenBoxDimension || "";

        defaults[`${key}_plantAddress`] = "";
        defaults[`${key}_InvoiceDiscription`] = "";
      });

      return defaults;
    };

    // Helper to map charges/discounts from JSON if they exist, else empty
    const getFinancialDefaults = () => {
      const charges = [];
      const discounts = [];

      const chargeSource = invoiceDetails?.otherChargesDetails || [];
      const packingSource =
        savedFormData?.additionalDetails ||
        invoiceDetails?.additionalDetails ||
        [];

      chargeSource.forEach((charge, idx) => {
        const schemeMatch = packingSource.find(
          (p) => p.invoiceID === charge.invoiceID,
        );

        const chargeRows = [];
        if (charge.chargesType1 && charge.otherCharges1)
          chargeRows.push({
            desc: charge.chargesType1,
            value: charge.otherCharges1,
          });

        if (charge.chargesType2 && charge.otherCharges2)
          chargeRows.push({
            desc: charge.chargesType2,
            value: charge.otherCharges2,
          });

        if (charge.chargesType3 && charge.otherCharges3)
          chargeRows.push({
            desc: charge.chargesType3,
            value: charge.otherCharges3,
          });

        charges.push({
          invoiceIndex: idx,
          invoiceID: charge.invoiceID,
          scheme: schemeMatch?.schemeName || charge.schemeName,
          rows: chargeRows.length ? chargeRows : [{ desc: "", value: "" }],
          total: chargeRows.reduce((s, r) => s + Number(r.value || 0), 0),
        });

        const discountRows = [];
        if (charge.discount1 && charge.discountValue1)
          discountRows.push({
            desc: charge.discount1,
            value: charge.discountValue1,
          });

        if (charge.discount2 && charge.discountValue2)
          discountRows.push({
            desc: charge.discount2,
            value: charge.discountValue2,
          });

        if (charge.discount3 && charge.discountValue3)
          discountRows.push({
            desc: charge.discount3,
            value: charge.discountValue3,
          });

        discounts.push({
          invoiceIndex: idx,
          invoiceID: charge.invoiceID,
          scheme: schemeMatch?.schemeName || charge.schemeName,
          rows: discountRows.length ? discountRows : [{ desc: "", value: "" }],
          total: discountRows.reduce((s, r) => s + Number(r.value || 0), 0),
        });
      });

      return {
        additionalCharges: savedFormData?.additionalCharges?.length
          ? savedFormData.additionalCharges
          : charges,
        discountDetails: savedFormData?.discountDetails?.length
          ? savedFormData.discountDetails
          : discounts,
      };
    };

    return {
      // --- Logistics ---
      preCarriageBy:
        savedFormData?.preCarriageBy || invoiceDetails?.preCarriageBy || "",
      placeOfReceiptByPreCarrier:
        savedFormData?.placeOfReceiptByPreCarrier ||
        invoiceDetails?.placeOfReceiptByPreCarrier ||
        "",
      vesselFlightNo: savedFormData?.vesselFlightNo || "",
      billOfLadingNo: savedFormData?.billOfLadingNo || "",
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
      containerNo:
        savedFormData?.containerNo || invoiceDetails?.containerNo || "",
      containerSEALNO:
        savedFormData?.containerSEALNO || invoiceDetails?.containerSEALNO || "",

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
      invoiceNumber: isPrepared
        ? (Array.isArray(invoiceDetails?.invoiceNo)
          ? invoiceDetails.invoiceNo.join(", ")
          : invoiceDetails?.invoiceNumber || "")
        : (savedFormData?.invoiceNumber || ""),

      // invoiceNumber:
      //   savedFormData?.invoiceNumber ??
      //   invoiceDetails?.invoiceNumber ??
      //   "",
      otsNo: savedFormData?.otsNo || invoiceDetails?.otsNo || "",
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
        savedFormData?.placeOfIncoterm || invoiceDetails?.placeOfIncoterm || "", // Not in JSON explicitly
      ExchangeCurrency:
        savedFormData?.ExchangeCurrency || invoiceDetails?.exchangeRate || "",
      paymentTerms: formattedDescription,
      rexNumber: savedFormData?.rexNumber || invoiceDetails?.rexNumber || "",
      igstlut: savedFormData?.igstlut || invoiceDetails?.igstlut || "",
      invoice_Details: savedFormData?.invoice_Details || "",
      bankDetails: formatMultilineText(savedFormData?.bankDetails) || "",
      ...getPackingDefaults(),
      ...getFinancialDefaults(),
    };
  }, [invoiceDetails, savedFormData, formattedDescription]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
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
    toast.success("Processing Customer Invoice Details...");

    const finalData = {
  ...invoiceDetails,
  ...data,
  invoiceNumber: isPrepared
    ? invoiceDetails.invoiceNumber
    : data.invoiceNumber,
};

    const details = invoiceDetails?.additionalDetails || [];

    const buildOtherChargesForAPI = (additionalCharges, discountDetails) => {
      return additionalCharges.map((chargeGroup, idx) => {
        const discountGroup = discountDetails[idx];
        const rows = chargeGroup.rows || [];
        const dRows = discountGroup?.rows || [];

        return {
          invoiceID: chargeGroup.invoiceID,
          schemeName: chargeGroup.scheme,

          chargesType1: rows[0]?.desc || null,
          otherCharges1: Number(rows[0]?.value) || 0,
          chargesType2: rows[1]?.desc || null,
          otherCharges2: Number(rows[1]?.value) || 0,
          chargesType3: rows[2]?.desc || null,
          otherCharges3: Number(rows[2]?.value) || 0,

          discount1: dRows[0]?.desc || null,
          discountValue1: Number(dRows[0]?.value) || 0,
          discount2: dRows[1]?.desc || null,
          discountValue2: Number(dRows[1]?.value) || 0,
          discount3: dRows[2]?.desc || null,
          discountValue3: Number(dRows[2]?.value) || 0,
        };
      });
    };

    // ✅ Convert UI rows → DB structure
    finalData.otherChargesDetails = buildOtherChargesForAPI(
      data.additionalCharges,
      data.discountDetails,
    );

    // ✅ Packing only stays in additionalDetails
    const baseDetails =
      Array.isArray(invoiceDetails?.additionalDetails) &&
        invoiceDetails.additionalDetails.length > 0
        ? invoiceDetails.additionalDetails
        : schemeGroups.map((group, index) => ({
          invoiceID: group.invoiceID,
          schemeName: group.schemeName,
        }));

    finalData.additionalDetails = baseDetails.map((det, index) => ({
      ...det,

      isPallet: data[`${det.schemeName}_${index}_isPallet`] || false,
      palletCount: Number(data[`${det.schemeName}_${index}_palletCount`] || 0),
      palletTyres: Number(data[`${det.schemeName}_${index}_numberOfTyres`] || 0),
      palletweight: Number(data[`${det.schemeName}_${index}_palletWeight`] || 0),
      palletDimension:
        data[`${det.schemeName}_${index}_palletDimension`] || "",

      isWoodenBox: data[`${det.schemeName}_${index}_isWoodenBox`] || false,
      woodenBoxCount: Number(data[`${det.schemeName}_${index}_woodenBoxCount`] || 0),
      woodenBoxTyres: Number(data[`${det.schemeName}_${index}_woodenBoxTyres`] || 0),
      woodenBoxWeight: Number(data[`${det.schemeName}_${index}_woodenBoxWeight`] || 0),
      woodenBoxDimension:
        data[`${det.schemeName}_${index}_woodenBoxDimension`] || "",
    }));

    // Save UI state for edit mode
    finalData.additionalCharges = data.additionalCharges;
    finalData.discountDetails = data.discountDetails;

    dispatch(setExportCustAdditionalInvoice(finalData));
    dispatch(setFinalCustomerData());
    setShowWarning(true);
    onClose();
  };



  const schemeGroups = useMemo(() => {
    if (
      Array.isArray(invoiceDetails?.otherChargesDetails) &&
      invoiceDetails.otherChargesDetails.length > 0
    ) {
      return invoiceDetails.otherChargesDetails;
    }

    // Direct Invoice Mode
    return [
      {
        schemeName: "Direct",
        invoiceID: invoiceDetails?.id || 1,
        totalQty: Array.isArray(invoiceDetails?.items)
          ? invoiceDetails.items.reduce(
            (sum, item) => sum + Number(item?.itemQty || 0),
            0
          )
          : 0,
      },
    ];
  }, [invoiceDetails]);





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
              />
              <SelectField
                label="Place of Receipt"
                name="placeOfReceiptByPreCarrier"
                register={register}
                errors={errors}
                options={["CHENNAI", "SRI LANKA", "PUDUKKOTAI, INDIA"]}
              />
              <InputField
                label="Vessel/Flight No"
                name="vesselFlightNo"
                register={register}
                errors={errors}
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
              <InputField
                label="Container Type"
                name="containerType"
                register={register}
                errors={errors}
              />
              <InputField
                label="Container No"
                name="containerNo"
                register={register}
                errors={errors}
              />
              <InputField
                label="Seal No"
                name="containerSEALNO"
                register={register}
                errors={errors}
              />
              <InputField
                label="Bill of Lading No"
                name="billOfLadingNo"
                register={register}
                errors={errors}
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
                />
                <InputField
                  label="Invoice Number"
                  name="invoiceNumber"
                  register={register}
                  errors={errors}
                  readOnly={isPrepared}
                />
                <InputField
                  label="OTS Number"
                  name="otsNo"
                  register={register}
                  errors={errors}
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

          {/* --- 3. FINANCIALS & PACKING --- */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200 border-b border-gray-200 pb-2 dark:border-gray-600">
              3. Financials & Packing{" "}
              <MdOutlinePayments className="text-[var(--primary)]" />
            </h2>

            {/* Terms Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <SelectField
                label="Incoterm"
                name="incoterm"
                register={register}
                errors={errors}
                options={["FOB", "CIF", "DDU", "DDP", "C&F", "DAP", "EXW"]}
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

            {/* Dynamic Sections per Scheme/Group */}
            <div className="space-y-8">
              {Array.isArray(schemeGroups) &&
                schemeGroups.map((chargeDetail, index) => {
                  // const packDetail = invoiceDetails?.additionalDetails?.find(
                  //   (p) =>
                  //     p.invoiceID === chargeDetail.invoiceID &&
                  //     p.schemeName === chargeDetail.schemeName,
                  // );

                  console.log("InvoiceDetails:", invoiceDetails);

                  return (
                    <div
                      key={chargeDetail.invoiceID}
                      className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10"
                    >
                      <div className="flex justify-between items-center mb-4 border-b border-blue-200 dark:border-blue-800 pb-2">
                        <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300">
                          {chargeDetail.schemeName}
                          <span className="text-sm font-normal text-gray-500">
                            {" "}
                            (Invoice {chargeDetail.invoiceID})
                          </span>
                        </h3>

                        <div className="text-sm bg-white dark:bg-gray-800 px-3 py-1 rounded border">
                          Total Qty: <b>{chargeDetail?.totalQty || 0}</b>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                        <ChargesRow
                          invoiceIndex={index}
                          register={register}
                          control={control}
                          setValue={setValue}
                          errors={errors}
                          schemeName={chargeDetail.schemeName}
                          dbMaxTotal={
                            (Number(chargeDetail?.otherCharges1) || 0) +
                            (Number(chargeDetail?.otherCharges2) || 0) +
                            (Number(chargeDetail?.otherCharges3) || 0)
                          }
                          isPrepared={isPrepared}
                        />

                        <DiscountRow
                          invoiceIndex={index}
                          register={register}
                          control={control}
                          setValue={setValue}
                          errors={errors}
                          schemeName={chargeDetail.schemeName}
                          isPrepared={isPrepared}
                        />
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                          Packing Details
                        </h4>
                        <PackingRow
                          schemeKey={`${chargeDetail.schemeName}_${index}`}
                          totalQty={chargeDetail.totalQty}
                          register={register}
                          control={control}
                          setValue={setValue}
                          getValues={getValues}
                          errors={errors}
                          isPrepared={isPrepared}
                        />

                      </div>
                    </div>
                  );
                },
                )}
            </div>
          </section>
          {/* --- 4. Invoice Details --- */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200 border-b border-gray-200 pb-2 dark:border-gray-600">
              4. Invoice Details{" "}
              <MdOutlinePayments className="text-[var(--primary)]" />
            </h2>

            {/* Terms Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <div className="lg:col-span-4 flex">
                <InputField
                  label="IGST LUT"
                  name="igstlut"
                  register={register}
                  errors={errors}
                />
                {/* <InputField
                  label="REX Number"
                  name="rexNumber"
                  register={register}
                  errors={errors}
                /> */}
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

// --- SUB-COMPONENTS ---

// 1. Packing Row (Handles Pallet & Wooden Box logic)
const PackingRow = ({
  schemeKey,
  totalQty,
  register,
  control,
  setValue,
  getValues,
  errors,
  isPrepared
}) => {
  // Watch Checkboxes
  const isPallet = useWatch({ control, name: `${schemeKey}_isPallet` });
  const isWooden = useWatch({ control, name: `${schemeKey}_isWoodenBox` });

  // Watch Quantities
  const palletTyres = useWatch({ control, name: `${schemeKey}_numberOfTyres` });
  const woodenTyres = useWatch({
    control,
    name: `${schemeKey}_woodenBoxTyres`,
  });

  const packedTotal = (Number(palletTyres) || 0) + (Number(woodenTyres) || 0);
  const balance = Math.max(0, totalQty - packedTotal);

  // 🔥 Smart Sync Logic (DB + User Interaction Safe)
  useEffect(() => {
    const palletQty = Number(getValues(`${schemeKey}_numberOfTyres`) || 0);
    const woodenQty = Number(getValues(`${schemeKey}_woodenBoxTyres`) || 0);

    // If pallet enabled and qty not set → auto-fill remaining
    if (isPallet && palletQty === 0) {
      const remaining = totalQty - woodenQty;
      if (remaining > 0) {
        setValue(`${schemeKey}_numberOfTyres`, remaining);
      }
    }

    // If wooden enabled and qty not set → auto-fill remaining
    if (isWooden && woodenQty === 0) {
      const remaining = totalQty - palletQty;
      if (remaining > 0) {
        setValue(`${schemeKey}_woodenBoxTyres`, remaining);
      }
    }

    // If pallet unchecked → clear pallet values
    if (!isPallet && palletQty !== 0) {
      setValue(`${schemeKey}_numberOfTyres`, 0);
      setValue(`${schemeKey}_palletCount`, 0);
    }

    // If wooden unchecked → clear wooden values
    if (!isWooden && woodenQty !== 0) {
      setValue(`${schemeKey}_woodenBoxTyres`, 0);
      setValue(`${schemeKey}_woodenBoxCount`, 0);
    }
  }, [isPallet, isWooden, totalQty, schemeKey, setValue, getValues]);

  // Validation to prevent exceeding total
  const validateQty = (val) => {
    const num = Number(val || 0);
    if (num > totalQty) return `Exceeds Total (${totalQty})`;

    const other =
      isPallet && val === palletTyres
        ? Number(woodenTyres || 0)
        : Number(palletTyres || 0);

    if (num + other > totalQty) return `Combined exceeds ${totalQty}`;

    return true;
  };

  return (
    <div>
      {/* Checkboxes */}
      <div className="flex gap-6 mb-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register(`${schemeKey}_isPallet`)}
            className="w-4 h-4 text-blue-600 rounded"
            disabled={isPrepared}
          />
          <span className="flex items-center gap-1 font-medium">
            <MdPallet className="text-blue-600" /> Pallet
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register(`${schemeKey}_isWoodenBox`)}
            className="w-4 h-4 text-amber-700 rounded"
            disabled={isPrepared}
          />
          <span className="flex items-center gap-1 font-medium">
            <GiWoodenCrate className="text-amber-700" /> Wooden Box
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pallet Fields */}
        {isPallet && (
          <div className="bg-blue-50 p-3 rounded border border-blue-100">
            <h5 className="text-xs font-bold text-blue-800 uppercase mb-2">
              Pallet Details
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Count"
                name={`${schemeKey}_palletCount`}
                type="number"
                register={register}
                errors={errors}
                icon={LiaPalletSolid}
                readOnly={isPrepared}
              />
              <InputField
                label="Tyre Qty"
                name={`${schemeKey}_numberOfTyres`}
                type="number"
                register={register}
                errors={errors}
                icon={PiTireDuotone}
                validate={validateQty}
                readOnly={isPrepared}

              />
              <InputField
                label="Weight (Kg)"
                name={`${schemeKey}_palletWeight`}
                type="number"
                register={register}
                errors={errors}
                icon={GiWeight}
                readOnly={isPrepared}

              />
              <InputField
                label="Dimensions"
                name={`${schemeKey}_palletDimension`}
                register={register}
                errors={errors}
                readOnly={isPrepared}

              />
            </div>
          </div>
        )}

        {/* Wooden Box Fields */}
        {isWooden && (
          <div className="bg-amber-50 p-3 rounded border border-amber-100">
            <h5 className="text-xs font-bold text-amber-800 uppercase mb-2">
              Wooden Box Details
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Count"
                name={`${schemeKey}_woodenBoxCount`}
                type="number"
                register={register}
                errors={errors}
                icon={LiaBoxesSolid}
                readOnly={isPrepared}

              />
              <InputField
                label="Tyre Qty"
                name={`${schemeKey}_woodenBoxTyres`}
                type="number"
                register={register}
                errors={errors}
                icon={PiTireDuotone}
                validate={validateQty}
                readOnly={isPrepared}

              />
              <InputField
                label="Weight (Kg)"
                name={`${schemeKey}_woodenBoxWeight`}
                type="number"
                register={register}
                errors={errors}
                icon={GiWeight}
                readOnly={isPrepared}

              />
              <InputField
                label="Dimensions"
                name={`${schemeKey}_woodenBoxDimension`}
                register={register}
                errors={errors}
                readOnly={isPrepared}

              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-right mt-2 text-xs">
        {packedTotal > totalQty ? (
          <span className="text-red-600 font-bold">
            Error: Packed ({packedTotal}) exceeds Total ({totalQty})
          </span>
        ) : (
          <span className="text-gray-500">
            Packed: <b>{packedTotal}</b> / {totalQty} (Loose: {balance})
          </span>
        )}
      </div>
    </div>
  );
};

// 2. Charges Row
const ChargesRow = ({
  invoiceIndex,
  register,
  errors,
  control,
  setValue,
  schemeName,
  dbMaxTotal = 0,
  isPrepared
}) => {
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

  useEffect(() => {
    setValue(`additionalCharges.${invoiceIndex}.total`, total);
  }, [total, invoiceIndex, setValue]);

  const maxAllowed = isPrepared ? dbMaxTotal : Infinity;
  const remaining = maxAllowed - total;
  const exceeded = isPrepared && total > dbMaxTotal;


  return (
    <div className="bg-white p-3 rounded border border-gray-200">
      <h5 className="text-sm font-semibold mb-2 flex justify-between">
        Charges ({schemeName})
        <span className={exceeded ? "text-red-600" : "text-blue-600"}>
          {total.toFixed(2)} / {dbMaxTotal.toFixed(2)}
        </span>
      </h5>

      <div className="space-y-2">
        {fields.map((field, k) => (
          <div key={field.id} className="flex gap-2 items-center">
            <Input
              {...register(`additionalCharges.${invoiceIndex}.rows.${k}.desc`)}
              placeholder="Description"
              className="w-full px-2 py-1 text-sm border rounded"
            />
            <Input
              {...register(
                `additionalCharges.${invoiceIndex}.rows.${k}.value`,
                {
                  validate: (val) => {
                    const current = Number(val || 0);
                    const otherTotal = total - (Number(rows?.[k]?.value) || 0);

                    if (isPrepared && current + otherTotal > dbMaxTotal)
                      return `Max allowed is ${dbMaxTotal}`;

                    return true;
                  },
                },
              )}
              type="number"
              placeholder="0.00"
              className="w-24 px-2 py-1 text-sm border rounded"
            />
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(k)}
                className="text-red-500"
              >
                <TbHttpDelete size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-xs mt-2">
        {exceeded ? (
          <p className="text-red-600 font-semibold">
            ⚠ Total exceeds DB allowed limit ({dbMaxTotal})
          </p>
        ) : (
          <p className="text-gray-500">
            Remaining allowed: <b>{remaining.toFixed(2)}</b>
          </p>
        )}
      </div>

      {/* LIMIT TO 3 ROWS */}
      {fields.length < 3 && (
        <button
          type="button"
          onClick={() => append({ desc: "", value: "" })}
          className="text-xs text-blue-600 mt-2 flex items-center gap-1"
        >
          <RiStickyNoteAddLine /> Add Charge
        </button>
      )}
    </div>
  );
};

// 3. Discount Row (Similar to Charges)
const DiscountRow = ({
  invoiceIndex,
  register,
  errors,
  control,
  setValue,
  schemeName,
  isPrepared
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

  return (
    <div className="bg-white p-3 rounded border border-red-100">
      <h5 className="text-sm font-semibold mb-2 flex justify-between text-red-700">
        Discounts ({schemeName})<span>{total.toFixed(2)}</span>
      </h5>
      <div className="space-y-2">
        {fields.map((field, k) => (
          <div key={field.id} className="flex gap-2 items-center">
            <Input
              {...register(`discountDetails.${invoiceIndex}.rows.${k}.desc`)}
              placeholder="Reason"
              className="w-full px-2 py-1 text-sm border rounded"
              readOnly={isPrepared}
            />
            <Input
              {...register(`discountDetails.${invoiceIndex}.rows.${k}.value`)}
              type="number"
              placeholder="0.00"
              className="w-24 px-2 py-1 text-sm border rounded"
              readOnly={isPrepared}
            />
            {fields.length > 1 && !isPrepared && (
              <button
                type="button"
                onClick={() => remove(k)}
                className="text-red-500"
              >
                <TbHttpDelete size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
      {!isPrepared && (
        <button
          type="button"
          onClick={() => append({ desc: "", value: "" })}
          className="text-xs text-red-600 mt-2 flex items-center gap-1"
        >
          <RiDiscountPercentLine /> Add Discount
        </button>
      )}
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
      className={`w-full px-3 py-2 rounded border text-sm ${errors[name] ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"}`}
      {...register(name, { validate })}
    />
    {errors[name] && (
      <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>
    )}
  </div>
);

const SelectField = ({ label, name, register, options }) => (
  <div className="w-full">
    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">
      {label}
    </label>
    <Select
      name={name}
      className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
      {...register(name)}
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </Select>
  </div>
);

export default AdditionalCustDetailsForm;
