import { useForm, useWatch } from "react-hook-form";
import Button from "../../../../../components/InputFields/Button";
import Input from "../../../../../components/InputFields/Input";
import Select from "../../../../../components/InputFields/Select";
import TextArea from "../../../../../components/InputFields/TextArea";
import LoadingButton from "../../../../../components/LoadingButton";
import { useDispatch, useSelector } from "react-redux";
import { setExportAdditionalInvoice } from "../../../../../Redux/Slices/InvoiceSlice";
import { getCurrency } from "../../../../../utils/currencies";
import toast from "react-hot-toast";
import { useMemo, useEffect } from "react";
import { HSN_CODE } from "../../../../../utils/HSNCODE";

const AdditionalDetailsForm = ({
  onClose,
  handleCloseForm,
  invoiceDetails,
  setShowWarning,
}) => {
  const userCurrency = getCurrency(invoiceDetails?.usercurrency);
  const dispatch = useDispatch();

  // Redux Data
  const invoiceData = useSelector(
    (state) => state?.invoice?.exportInvoices?.additionalForm
  );
  const invoiceFinalData = useSelector(
    (state) => state?.invoice?.exportInvoices.FinalInvoiceDetails
  );

  // --- Helper: Get Unique Schemes ---
  const uniqueSchemes = useMemo(() => {
    const schemes = invoiceFinalData?.map((d) => d.scheme) || [];
    return [...new Set(schemes)];
  }, [invoiceFinalData]);

  // --- Helper: Format Payment Terms ---
  const formatPaymentTerms = (htmlContent) => {
    if (!htmlContent) return "";
    const parser = new DOMParser();
    const decoded = parser.parseFromString(htmlContent, "text/html").body.textContent || "";
    const numberedSections = decoded.match(/(?:\d{2}\..*?)(?=\d{2}\.|$)/gs);
    if (numberedSections?.length) {
      return numberedSections.map((section) => section.replace(/~+/g, "\n").trim()).join("\n");
    }
    return decoded.replace(/~+/g, "\n").trim();
  };

  const formattedDescription = formatPaymentTerms(
    invoiceData?.paymentTerms || invoiceDetails?.paymentTerms || ""
  );

  // hsncode 
  const hsnGroupedByInvoice = useMemo(() => {

    if (!invoiceFinalData || !Array.isArray(invoiceFinalData)) return [];

    return invoiceFinalData.map((invoice, index) => {
      const grouped = {};

      invoice.items?.forEach(item => {
        if (!item.scheme) return;
        if (!grouped[item.scheme]) grouped[item.scheme] = new Set();
        if (item.hsnCode) grouped[item.scheme].add(item.hsnCode);
      });

      // Convert Set to Array
      const groupArray = {};
      Object.keys(grouped).forEach(key => {
        groupArray[key] = [...grouped[key]];
      });

      return {
        invoiceIndex: index + 1,
        schemeHSN: groupArray
      };
    });

  }, [invoiceFinalData]);



  // --- 1. Prepare Default Values (Wrapped in useMemo) ---
  const defaultValues = useMemo(() => {
    const getDynamicDefaults = () => {
      const defaults = {};
      const existingSchemes = invoiceData?.schemeDetails || [];

      uniqueSchemes.forEach(scheme => {
        const savedData = existingSchemes.find(s => s.scheme === scheme) || {};

        // Pallet fields (existing)
        defaults[`${scheme}_number`] = savedData.schemeNumber || "";
        defaults[`${scheme}_date`] = savedData.schemeDate || "";
        defaults[`${scheme}_isPallet`] = savedData.isPallat || false;
        defaults[`${scheme}_palletCount`] = savedData.pallatCount || ""; // No. of Pallets
        defaults[`${scheme}_numberOfTyres`] = savedData.numberOfTyres || ""; // Pallet tyre qty
        defaults[`${scheme}_palletWeight`] = savedData.pallatWeight || "";

        // Wooden box fields (new)
        defaults[`${scheme}_isWoodenBox`] = savedData.isWoodenBox || false;
        defaults[`${scheme}_woodenBoxCount`] = savedData.woodenBoxCount || "";
        defaults[`${scheme}_woodenBoxTyres`] = savedData.woodenBoxTyres || "";
        defaults[`${scheme}_woodenBoxWeight`] = savedData.woodenBoxWeight || "";
      });

      return defaults;
    };

    return {
      // Static Fields
      exporterAuthorizedAddress: invoiceData?.exporterAuthorizedAddress || "",
      vesselFlightNo: invoiceData?.vesselFlightNo || "",
      invoiceNumber: invoiceData?.invoiceNumber || invoiceDetails?.invoiceNumber || "",
      billOfLadingNo: invoiceData?.billOfLadingNo || "",
      containerNo: invoiceData?.containerNo || "",
      countryOfOriginOfGoods: invoiceData?.countryOfOriginOfGoods || invoiceDetails?.countryOfOriginOfGoods || "",
      portOfLoading: invoiceData?.portOfLoading || invoiceDetails?.portOfLoading || "",
      portOfDischarge: invoiceData?.portOfDischarge || "",
      containerType: invoiceData?.containerType || "",
      preCarriageBy: invoiceData?.preCarriageBy || "",
      incoterm: invoiceData?.incoterm || invoiceDetails?.incoterm || "",
      placeOfIncoterm: invoiceData?.placeOfIncoterm || invoiceDetails?.placeOfIncoterm || "",
      containerSEALNO: invoiceData?.containerSEALNO || "",
      placeOfReceiptByPreCarrier: invoiceData?.placeOfReceiptByPreCarrier || "",
      finalDestination: invoiceData?.shippingCity || invoiceDetails?.shippingCity || "",
      otherCharges1: invoiceData?.otherCharges1 || "",
      otherCharges2: invoiceData?.otherCharges2 || "",
      otherCharges3: invoiceData?.otherCharges3 || "",
      otherChargesValue1: invoiceData?.otherChargesValue1 || "",
      otherChargesValue2: invoiceData?.otherChargesValue2 || "",
      otherChargesValue3: invoiceData?.otherChargesValue3 || "",
      paymentTerms: formattedDescription || "",
      SchemeDetailsImportMoowr: invoiceData?.SchemeDetailsImportMoowr || "",
      // --- ADD THIS BLOCK HERE 🔥 ---
      // inside your defaultValues useMemo -> return { ... }
      additionalCharges: (() => {
        // if redux saved additionalCharges exists, merge scheme from invoiceFinalData if missing
        if (Array.isArray(invoiceData?.additionalCharges) && invoiceData.additionalCharges.length) {
          return invoiceData.additionalCharges.map((ac, idx) => {
            const invoice = invoiceFinalData?.[idx] || {};
            const fallbackScheme =
              invoice.scheme ||
              invoice.schemeDetails?.[0]?.scheme ||
              (invoice.items && invoice.items[0]?.scheme) ||
              "N/A";

            return {
              invoiceIndex: ac.invoiceIndex ?? idx + 1,
              scheme: ac.scheme ?? fallbackScheme,
              rows: Array.isArray(ac.rows) && ac.rows.length ? ac.rows : [{ desc: "", value: "" }],
              total: Number(ac.total) || 0,
            };
          });
        }

        // default build from invoiceFinalData
        if (Array.isArray(invoiceFinalData) && invoiceFinalData.length) {
          return invoiceFinalData.map((invoice, i) => ({
            invoiceIndex: i + 1,
            scheme:
              invoice?.scheme ||
              invoice?.schemeDetails?.[0]?.scheme ||
              (invoice?.items && invoice.items[0]?.scheme) ||
              "N/A",
            rows: [{ desc: "", value: "" }],
            total: 0,
          }));
        }

        // fallback single empty
        return [
          {
            invoiceIndex: 1,
            scheme: "N/A",
            rows: [{ desc: "", value: "" }],
            total: 0,
          },
        ];
      })(),

      otsNo: invoiceData?.otsNo || "",
      itcHsNo: invoiceData?.itcHsNo || "",
      ExchangeCurrency: invoiceData?.ExchangeCurrency || "",
      notifyPartyName: invoiceData?.notifyPartyName || "",
      notifyPartyPhone: invoiceData?.notifyPartyPhone || "",
      notifyPartyEmail: invoiceData?.notifyPartyEmail || "",
      notifyPartyCity: invoiceData?.notifyPartyCity || "",
      notifyPartyState: invoiceData?.notifyPartyState || "",
      notifyPartyCountry: invoiceData?.notifyPartyCountry || "",
      notifyPartyAddress: invoiceData?.notifyPartyAddress || "",
      BuyersOrderNumber: invoiceData?.BuyersOrderNumber || "",
      ...getDynamicDefaults()
    };
  }, [invoiceData, invoiceDetails, uniqueSchemes, formattedDescription]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ defaultValues });

  // Reset form when Redux data loads
  useEffect(() => {
    if (invoiceData) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, invoiceData]);

  // --- Submit Handler ---
  const onSubmit = async (data) => {
    toast.success("Processing Invoice Details...");
    console.log(data);


    const staticData = { ...data };
    const schemeDetailsArray = [];

    uniqueSchemes.forEach(scheme => {
      const schemeObj = {
        scheme: scheme,
        isPallat: data[`${scheme}_isPallet`] || false,
        isWoodenBox: data[`${scheme}_isWoodenBox`] || false,
      };

      // Pallet details
      if (schemeObj.isPallat) {
        schemeObj.pallatCount = data[`${scheme}_palletCount`];
        schemeObj.numberOfTyres = data[`${scheme}_numberOfTyres`]; // Pallet tyres
        schemeObj.pallatWeight = data[`${scheme}_palletWeight`];
      }

      // Wooden box details
      if (schemeObj.isWoodenBox) {
        schemeObj.woodenBoxCount = data[`${scheme}_woodenBoxCount`];
        schemeObj.woodenBoxTyres = data[`${scheme}_woodenBoxTyres`];
        schemeObj.woodenBoxWeight = data[`${scheme}_woodenBoxWeight`];
      }

      if (scheme !== 'Direct') {
        schemeObj.schemeNumber = data[`${scheme}_number`];
        schemeObj.schemeDate = data[`${scheme}_date`];
      }

      schemeDetailsArray.push(schemeObj);

      // Clean up flat data
      delete staticData[`${scheme}_isPallet`];
      delete staticData[`${scheme}_palletCount`];
      delete staticData[`${scheme}_numberOfTyres`];
      delete staticData[`${scheme}_palletWeight`];
      delete staticData[`${scheme}_isWoodenBox`];
      delete staticData[`${scheme}_woodenBoxCount`];
      delete staticData[`${scheme}_woodenBoxTyres`];
      delete staticData[`${scheme}_woodenBoxWeight`];
      delete staticData[`${scheme}_number`];
      delete staticData[`${scheme}_date`];
    });

    const updatedInvoice = {
      ...invoiceDetails,
      ...staticData,
      schemeDetails: schemeDetailsArray,
      schemeLicences: schemeDetailsArray.map(s => ({ [s.scheme]: s.schemeNumber })),

      ...(data?.notifyPartyName && {
        notifyParty: {
          name: data?.notifyPartyName,
          email: data?.notifyPartyEmail,
          phone: data?.notifyPartyPhone,
          city: data?.notifyPartyCity,
          state: data?.notifyPartyState,
          country: data?.notifyPartyCountry,
          address: data?.notifyPartyAddress,
        }
      })
    };
    const processedCharges = (data.additionalCharges || []).map(chg => ({
      invoiceIndex: chg.invoiceIndex,
      scheme: chg.scheme,
      rows: chg.rows,
      total: chg.total,
    }));

    updatedInvoice.additionalCharges = processedCharges;

    dispatch(setExportAdditionalInvoice(updatedInvoice));
    setShowWarning(true);
    onClose();
  };

  const ChargesRow = ({ invoiceIndex, register, errors, control, setValue, maxRows }) => {

    const rows = useWatch({
      control,
      name: `additionalCharges.${invoiceIndex}.rows`,
      defaultValue: [{ desc: "", value: "" }],
    });

    // Get scheme name for this invoice
    const invoice = invoiceFinalData?.[invoiceIndex] || {};

    const schemeName =
      invoice.scheme ||
      invoice.schemeDetails?.[0]?.scheme ||
      (invoice.items && invoice.items[0]?.scheme) ||
      "N/A";

    // 🔥 Auto total calculation
    const total = useMemo(() => {
      return rows.reduce((sum, row) => sum + (Number(row.value) || 0), 0);
    }, [rows]);

    // Update total inside react-hook-form
    useEffect(() => {
      setValue(`additionalCharges.${invoiceIndex}.total`, total);
    }, [total, invoiceIndex, setValue]);

    // Add row
    const addRow = () => {
      if (rows.length >= maxRows) return; // 🚫 stop adding
      const updated = [...rows, { desc: "", value: "" }];
      setValue(`additionalCharges.${invoiceIndex}.rows`, updated);
    };

    // Remove row
    const removeRow = (rowIndex) => {
      const updated = rows.filter((_, i) => i !== rowIndex);
      setValue(`additionalCharges.${invoiceIndex}.rows`, updated);
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-[var(--border)] dark:border-gray-600 shadow-sm">

        {/* HEADER */}
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 dark:border-gray-600 mb-4">
          Additional Charges – Invoice {invoiceIndex + 1}
          <span className="text-blue-600 dark:text-blue-400 ml-2">
            ({schemeName})
          </span>
        </h3>

        {/* DYNAMIC ROWS */}
        <div className="space-y-4">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
            >
              {/* DESCRIPTION */}
              <InputField
                label="Description"
                placeholder="Enter Description"
                name={`additionalCharges.${invoiceIndex}.rows.${rowIndex}.desc`}
                register={register}
                errors={errors}
              />

              {/* VALUE */}
              <InputField
                label="Value"
                type="number"
                placeholder="Amount"
                name={`additionalCharges.${invoiceIndex}.rows.${rowIndex}.value`}
                register={register}
                errors={errors}
              />

              {/* REMOVE */}
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(rowIndex)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* + Add Row Button */}
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= maxRows}
          className={`mt-3 text-sm ${rows.length >= maxRows
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-600"
            }`}
        >
          + Add More Charge
        </button>

        {/* TOTAL */}
        <div className="text-right mt-4 border-t pt-3 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Total Charges:
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400 ml-2">
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    );
  };


  return (
    <div className="h-full flex flex-col dark:bg-gray-800">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
        <div className="flex flex-wrap gap-4 justify-between items-center text-sm text-gray-800 dark:text-white">
          <div>SHIPMENT TYPE: <span className="font-bold text-blue-600 dark:text-blue-400">{invoiceDetails?.shipmentType}</span></div>
          <div>WORK ORDER: <span className="font-bold text-blue-600 dark:text-blue-400">{invoiceDetails?.workorderno}</span></div>
          <div>Date: <span className="font-bold">{new Date().toLocaleDateString("en-GB")}</span></div>
        </div>
      </div>

      {/* Scrollable Form Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* --- SESSION 1: LOGISTICS --- */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-200 pb-2 dark:border-gray-600">
              1. Logistics & Transport
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SelectField label="Pre-Carriage by" name="preCarriageBy" register={register} errors={errors} required options={["SEA", "AIR", "ROAD"]} />
              <SelectField label="Place of Receipt" name="placeOfReceiptByPreCarrier" register={register} required errors={errors} options={["CHENNAI", "LANKA", "PUDUKKOTAI, INDIA"]} />
              {invoiceFinalData[0]?.type === "custom" && (
                <>
                  <InputField label="Vessel/Flight No" name="vesselFlightNo" required register={register} errors={errors} />
                  <InputField label="Bill of Lading No" name="billOfLadingNo" required register={register} errors={errors} />
                </>
              )}
              <SelectField label="Port of Loading" name="portOfLoading" required register={register} errors={errors} options={["CHENNAI, INDIA", "COLOMBO SRILANKA", "ENNORE, INDIA", "KATTUPALLI, INDIA", "THOOTHUKUDI, INDIA", "TUTICORIN, INDIA"]} />
              <InputField label="Port of Discharge" name="portOfDischarge" required register={register} errors={errors} />
              <InputField label="Final Destination" name="finalDestination" required register={register} errors={errors} />
              <SelectField label="Container Type" name="containerType" required register={register} errors={errors} options={["20' GP", "20' OT", "40' OT", "40' HC", "LCL"]} />
              <InputField label="Container No" name="containerNo" required register={register} errors={errors} />
              <InputField label="Seal No" name="containerSEALNO" required register={register} errors={errors} />
            </div>
          </section>

          {/* --- SESSION 2: ADDRESS & REFERENCES --- */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-200 pb-2 dark:border-gray-600">
              2. Address & References
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <SelectField
                  label="Exporter Authorized Address"
                  name="exporterAuthorizedAddress"
                  register={register}
                  errors={errors}
                  required
                  options={[
                    `SUNDARAM INDUSTRIES PRIVATE LIMITED~(Formerly Known as T.S.RAJAM TYRES PRIVATE LIMITED)~SOLID TYRE DIVISION (SUN-TWS, SUN TYRE AND WHEEL SYSTEMS)~7B/1, SIPCOT INDUSTRIAL COMPLEX, VELLANUR, PUDUKKOTTAI, TAMIL NADU, 622002, INDIA.~I.E.CODE: AAGCT6465R, PAN: AAGCT6465R, GSTIN: 33AAGCT6465R2ZJ,`,
                    `SUN TYRE & WHEEL SYSTEMS~(A DIVISION OF SUNDARAM LANKA TYRES LIMITED)~LOT 02, BLOCK B, BIYAGAMA EXPORT PROCESSING ZONE,~BIYAGAMA, SRI LANKA.~VAT Registration No.114628417-7000`,
                    `SUN TYRE & WHEEL SYSTEMS~(A DIVISION OF SUNDARAM INDUSTRIES PRIVATE LIMITED)~A1-F3/A, SIDCO Industrial Estate~Maraimalai Nagar - 603 209~TAMIL NADU, INDIA`,
                    `SUNDARAM INDUSTRIES PRIVATE LIMITED~(Formerly Known as T.S. Rajam Tyres Pvt Limited)~KRISHNA TOWERS - 3RD FLOOR, NP-31B/4,~THIRU VI KA INDUSTRIAL ESTATE, EKKATTUTHANGAL,~CHENNAI – 600 032, INDIA`,
                  ]}
                />
              </div>
              <SelectField label="Country of Origin" name="countryOfOriginOfGoods" required register={register} errors={errors} options={["INDIA", "SRILANKA", "INDIA & SRILANKA"]} />
              <InputField label="Invoice No" type="number" name="invoiceNumber" required register={register} errors={errors} />
              <InputField label="OTS Number" name="otsNo" required register={register} errors={errors} />
              <InputField label="Buyers Order No" name="BuyersOrderNumber" register={register} errors={errors} />
              <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <h2 className="text-lg font-semibold mb-3">HSN Codes Grouped by Scheme</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {hsnGroupedByInvoice.map(inv => (
                    <div
                      key={inv.invoiceIndex}
                      className="border border-gray-200 rounded-lg p-3 shadow-sm bg-white"
                    >
                      <h3 className="font-bold text-blue-600 mb-2 text-sm">
                        Invoice {inv.invoiceIndex}
                      </h3>

                      <div className="flex flex-wrap gap-3">
                        {Object.entries(inv.schemeHSN).map(([scheme, hsnList]) => (
                          <div
                            key={scheme}
                            className="w-fit bg-gray-100 px-3 py-2 rounded-lg border border-gray-200"
                          >
                            <span className="font-semibold block text-gray-800 text-sm">{scheme}</span>

                            <div className="flex flex-wrap gap-1 mt-1">
                              {hsnList.map((hsn, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-100 text-blue-700 px-2 py-[2px] rounded text-xs"
                                >
                                  {hsn}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
            {/* --- Notify Party Details (Optional) --- */}
            <div className="col-span-4 mt-6 p-5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
              <h3 className="text-md font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b pb-2 dark:border-gray-600">
                Notify Party Details (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

                {/* Row 1: Name | Email */}
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
                  type="email"

                />

                {/* Row 2: Phone | City */}
                <InputField
                  label="Phone"
                  name="notifyPartyPhone"
                  register={register}
                  errors={errors}
                  type="number"

                />

                <InputField
                  label="City"
                  name="notifyPartyCity"
                  register={register}
                  errors={errors}
                />

                {/* Row 3: State | Country */}
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

              {/* Row 4: Address TextArea (Full Width) */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <TextArea
                  rows={3}
                  placeholder="Enter full address..."
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 
                 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 
                 focus:ring-blue-500 outline-none"
                  {...register("notifyPartyAddress")}
                />
              </div>
            </div>



          </section>

          {/* --- SESSION 3: FINANCIALS --- */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-200 pb-2 dark:border-gray-600">
              3. Financials & Charges
            </h2>

            {/* ---------------- ROW 1 ---------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

              <SelectField
                label="Incoterm"
                name="incoterm"
                register={register}
                required
                errors={errors}
                options={["FOB", "CIF", "DDU", "DDP", "C&F"]}
              />
              <InputField
                label="Place Of Incoterm"
                type="text"
                name="placeOfIncoterm"
                required
                register={register}
                errors={errors}
              />

              <InputField
                label="Exchange Currency Value"
                type="number"
                name="ExchangeCurrency"
                required
                register={register}
                errors={errors}
              />

              <div className="lg:col-span-1">
                <TextArea
                  required
                  label="Payment Terms"
                  rows={3}
                  placeholder="Enter payment terms..."
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white p-2"
                  {...register("paymentTerms")}
                />
              </div>

            </div>

            {/* ---------------- ROW 2: Additional Charges ---------------- */}
            {/* INDIVIDUAL INVOICE CHARGES LIKE SCHEME ROW */}
            <div className="space-y-6 mt-6">
              {invoiceFinalData.map((_, i) => (
                <ChargesRow
                  key={i}
                  invoiceIndex={i}
                  register={register}
                  errors={errors}
                  control={control}
                  setValue={setValue}
                  maxRows={3} // 👈 LIMIT HERE
                  />
              ))}
            </div>
          </section>


          {/* --- SESSION 4: SCHEME & PACKING --- */}
          <section className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-200 pb-2 dark:border-gray-600">
              4. Scheme & Packing Details
            </h2>
            <div className="space-y-6">
              {uniqueSchemes.map((schemeName) => (
                <SchemeRow
                  key={schemeName}
                  schemeName={schemeName}
                  register={register}
                  errors={errors}
                  control={control}
                  setValue={setValue}
                  getValues={getValues}
                  invoiceFinalData={invoiceFinalData}
                />
              ))}
            </div>
          </section>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t dark:border-gray-700">
            <Button type="button" text="Cancel" onClick={onClose} disabled={isSubmitting} className="bg-gray-500 hover:bg-gray-600 text-white" />
            {isSubmitting ? (
              <LoadingButton className="bg-green-600 text-white px-6" text="Submitting..." />
            ) : (
              <Button type="submit" text="Submit Details" className="bg-green-600 hover:bg-green-700 text-white px-8" />
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// --- UPDATED SCHEME ROW (With Pallet + Wooden Box support) ---
const SchemeRow = ({ schemeName, register, errors, control, setValue, getValues, invoiceFinalData }) => {

  const isPalletized = useWatch({
    control,
    name: `${schemeName}_isPallet`,
    defaultValue: false
  });

  const isWoodenBox = useWatch({
    control,
    name: `${schemeName}_isWoodenBox`,
    defaultValue: false
  });

  // Watch the NUMBER OF TYRES for pallet and wooden
  const palletTyres = useWatch({
    control,
    name: `${schemeName}_numberOfTyres`,
    defaultValue: ""
  });

  const woodenTyres = useWatch({
    control,
    name: `${schemeName}_woodenBoxTyres`,
    defaultValue: ""
  });

  const totalSchemeQty = useMemo(() => {
    if (!invoiceFinalData) return 0;
    const schemeData = invoiceFinalData.find(d => d.scheme === schemeName);
    if (!schemeData || !schemeData.items) return 0;
    return schemeData.items.reduce((acc, item) => acc + (Number(item.itemQty) || 0), 0);
  }, [invoiceFinalData, schemeName]);

  // Combined packed tyres
  const combinedPacked = (Number(palletTyres) || 0) + (Number(woodenTyres) || 0);
  const looseBalance = Math.max(0, totalSchemeQty - combinedPacked);

  // Auto-Populate Logic for Pallet and Wooden (remaining balance logic)
  useEffect(() => {
    // When pallet is checked
    if (isPalletized) {
      const currentPallet = getValues(`${schemeName}_numberOfTyres`);
      const currentWooden = Number(getValues(`${schemeName}_woodenBoxTyres`) || 0);
      // If pallet empty, set to remaining (so we don't exceed)
      if (currentPallet === "" || currentPallet === undefined || currentPallet === null) {
        const remaining = Math.max(0, totalSchemeQty - currentWooden);
        setValue(`${schemeName}_numberOfTyres`, remaining);
      }
    } else {
      // Clear pallet fields if unchecked
      setValue(`${schemeName}_palletCount`, "");
      setValue(`${schemeName}_numberOfTyres`, "");
      setValue(`${schemeName}_palletWeight`, "");
    }
  }, [isPalletized, totalSchemeQty, setValue, getValues, schemeName]);

  useEffect(() => {
    // When wooden box is checked
    if (isWoodenBox) {
      const currentWood = getValues(`${schemeName}_woodenBoxTyres`);
      const currentPallet = Number(getValues(`${schemeName}_numberOfTyres`) || 0);
      if (currentWood === "" || currentWood === undefined || currentWood === null) {
        const remaining = Math.max(0, totalSchemeQty - currentPallet);
        setValue(`${schemeName}_woodenBoxTyres`, remaining);
      }
    } else {
      // Clear wooden fields if unchecked
      setValue(`${schemeName}_woodenBoxCount`, "");
      setValue(`${schemeName}_woodenBoxTyres`, "");
      setValue(`${schemeName}_woodenBoxWeight`, "");
    }
  }, [isWoodenBox, totalSchemeQty, setValue, getValues, schemeName]);

  const validatePallet = (value) => {
    const pallet = Number(value || 0);
    console.log(pallet);

    const wooden = Number(getValues(`${schemeName}_woodenBoxTyres`) || 0);

    if (isPalletized && (value === "" || value === undefined)) return "Required";
    if (pallet < 1 && isPalletized) return "Min 1";

    // NEW: prevent pallet value exceeding total or exceeding remaining
    if (pallet > totalSchemeQty) return `Max ${totalSchemeQty}`;
    if (pallet + wooden > totalSchemeQty)
      return `Combined limit exceeded (Max ${totalSchemeQty})`;

    return true;
  };

  const validateWooden = (value) => {
    const wooden = Number(value || 0);
    const pallet = Number(getValues(`${schemeName}_numberOfTyres`) || 0);

    if (isWoodenBox && (value === "" || value === undefined)) return "Required";
    if (wooden < 1 && isWoodenBox) return "Min 1";

    // NEW: prevent wooden value exceeding total or exceeding remaining
    if (wooden > totalSchemeQty) return `Max ${totalSchemeQty}`;
    if (pallet + wooden > totalSchemeQty)
      return `Combined limit exceeded (Max ${totalSchemeQty})`;

    return true;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 border-r dark:border-gray-600 pr-4">
          <div className="mb-3">
            <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 block mb-1">Scheme</span>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              {schemeName}
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-200">
                Total Qty: {totalSchemeQty}
              </span>
            </div>
          </div>
          {schemeName !== "Direct" && schemeName !== "Import_Invoice" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <InputField label="License Number" name={`${schemeName}_number`} register={register} errors={errors} placeholder="Enter License No" />
              <InputField label="License Date" type="date" name={`${schemeName}_date`} register={register} errors={errors} />
            </div>
          )}
          {schemeName === "Import_Invoice" && (
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 mt-4">
              <TextArea
                  required
                  label="Scheme Details"
                  rows={3}
                  placeholder="Enter Scheme Details..."
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white p-2"
                  {...register("SchemeDetailsImportMoowr")}
                />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="mb-2">
            <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 block mb-2">Packing for {schemeName}</span>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input type="checkbox" {...register(`${schemeName}_isPallet`)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Is Palletized?</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input type="checkbox" {...register(`${schemeName}_isWoodenBox`)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Is Wooden Box?</span>
              </label>
            </div>

          </div>

          {/* Pallet UI */}
          <div className={`grid gap-3 transition-all duration-300 ease-in-out overflow-hidden ${isPalletized ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 h-0"}`}>
            <div className="min-h-0 grid grid-cols-1 sm:grid-cols-3 gap-3 p-1">

              {/* 1. Pallet Count (Physical Pallets) */}
              <InputField
                label="No. of Pallets"
                type="number"
                placeholder="Count"
                name={`${schemeName}_palletCount`}
                register={register}
                errors={errors}
              />

              {/* 2. Number of Tyres (Quantity on Pallets) - WITH VALIDATION */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  No. of Tyres on Pallets <br /><span className="text-gray-400 font-light">(Combined Max: {totalSchemeQty})</span>
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  {...register(`${schemeName}_numberOfTyres`, {
                    validate: validatePallet
                  })}
                />
                {errors[`${schemeName}_numberOfTyres`] && (
                  <ErrorText message={errors[`${schemeName}_numberOfTyres`].message} />
                )}
              </div>

              {/* 3. Pallet Weight */}
              <InputField
                label="Pallet Weight KGs"
                type="number"
                placeholder="KGs"
                name={`${schemeName}_palletWeight`}
                register={register}
                errors={errors}
              />
            </div>
          </div>

          {/* Wooden Box UI */}
          <div className={`grid gap-3 transition-all duration-300 ease-in-out overflow-hidden ${isWoodenBox ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 h-0"}`}>
            <div className="min-h-0 grid grid-cols-1 sm:grid-cols-3 gap-3 p-1">

              {/* 1. Wooden Box Count */}
              <InputField
                label="No. of Wooden Boxes"
                type="number"
                placeholder="Count"
                name={`${schemeName}_woodenBoxCount`}
                register={register}
                errors={errors}
              />

              {/* 2. Tyres in Wooden Boxes - WITH VALIDATION */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  No. of Tyres in Wooden Boxes <br /><span className="text-gray-400 font-light">(Combined Max: {totalSchemeQty})</span>
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  {...register(`${schemeName}_woodenBoxTyres`, {
                    validate: validateWooden
                  })}
                />
                {errors[`${schemeName}_woodenBoxTyres`] && (
                  <ErrorText message={errors[`${schemeName}_woodenBoxTyres`].message} />
                )}
              </div>

              {/* 3. Wooden Box Weight */}
              <InputField
                label="Wooden Box Weight KGs"
                type="number"
                placeholder="KGs"
                name={`${schemeName}_woodenBoxWeight`}
                register={register}
                errors={errors}
              />
            </div>
          </div>

          {/* Balance Info */}
          <div className="mt-3 text-right">
            <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              Packed: {(Number(palletTyres) || 0) + (Number(woodenTyres) || 0)} / {totalSchemeQty} &nbsp; • &nbsp;
              Loose Balance: <span className="font-bold">{looseBalance}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Standard UI Components ---
const InputField = ({ label, name, register, errors, disabled = false, type = "text", placeholder, readOnly = false, className, required = false }) => (
  <div className="w-full">
    {label && (
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <Input
      name={name}
      disabled={disabled}
      readOnly={readOnly}
      type={type}
      placeholder={placeholder}
      className={className || "w-full px-3 py-2 rounded-md border border-gray-200"}
      {...register(name, {
        required: required ? `${label} is required` : false,
      })}
    />
    {errors[name] && <ErrorText message={errors[name].message} />}
  </div>
);


const SelectField = ({ label, name, register, errors, options, disabled = false, required = false }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>

    <Select
      name={name}
      disabled={disabled}
      className="w-full px-3 py-2 rounded-md border border-gray-200"
      {...register(name, {
        required: required ? `${label} is required` : false,
      })}
    >
      <option value="" disabled hidden>Select...</option>

      {options.map((opt, index) => (
        <option key={index} value={opt}>
          {opt}
        </option>
      ))}
    </Select>

    {errors[name] && <ErrorText message={errors[name].message} />}
  </div>
);

const ErrorText = ({ message }) => (
  <p className="text-red-500 dark:text-red-400 text-[10px] mt-1">{message}</p>
);

export default AdditionalDetailsForm;
