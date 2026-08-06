import React, { useState, useEffect, useCallback } from "react";
import {
  AlertCircle, CheckCircle2, Eye, EyeOff, Check, X,
  User, Mail, Phone, AtSign, UserRound, ShieldCheck, Building2, UserPlus,
} from "lucide-react";
import { getUserMasterData, userCreation } from "../../../Redux/Slices/Master/UserMaster.jsx/UserCreationSlice";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker, Select } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

// ============================================================================
// Motion variants
// ============================================================================
const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.04 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

// ============================================================================
// Toast
// ============================================================================
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`absolute top-4 right-4 z-[100] flex items-center gap-2.5 rounded-lg px-4 py-2.5 shadow-lg text-white
        ${type === "success" ? "bg-emerald-600 dark:bg-emerald-500" : "bg-rose-600 dark:bg-rose-500"}`}
    >
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      <span className="text-[13px] font-medium">{message}</span>
    </motion.div>
  );
};

// ============================================================================
// Field wrapper — label + control + animated error
// ============================================================================
const Field = ({ label, name, required, error, children }) => (
  <motion.div variants={fieldVariants} className="flex flex-col">
    <label htmlFor={name} className="mb-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-400">
      {label}
      {required && <span className="ml-0.5 text-rose-500 dark:text-rose-400">*</span>}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden"
        >
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle size={11} />
            <span className="truncate">{error}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const inputClass = (error, hasIcon) =>
  `h-9 w-full rounded-md border bg-white dark:bg-slate-800 ${hasIcon ? "pl-9" : "pl-3"} pr-3 text-[13px] text-slate-800 dark:text-slate-100 outline-none transition-colors duration-150
   placeholder:text-slate-400 dark:placeholder:text-slate-500
   ${
     error
       ? "border-rose-400 dark:border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
       : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15"
   }`;

// ============================================================================
// Inputs
// ============================================================================
const FormInput = ({ label, name, type = "text", value, onChange, error, placeholder, required, icon: Icon }) => (
  <Field label={label} name={name} required={required} error={error}>
    <div className="group relative">
      {Icon && (
        <Icon
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
        />
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClass(error, !!Icon)}
      />
    </div>
  </Field>
);

const PASSWORD_RULES = [
  { label: "8+ characters", test: (v) => v.length >= 8 },
  { label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "Number", test: (v) => /[0-9]/.test(v) },
  { label: "Special character", test: (v) => /[!@#$%^&*]/.test(v) },
];

const PasswordInput = ({ label, name, value, onChange, error, required }) => {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <Field label={label} name={name} required={required} error={error}>
        <div className="group relative">
          <ShieldCheck
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
          />
          <input
            id={name}
            type={visible ? "text" : "password"}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="••••••••"
            autoComplete="new-password"
            className={`${inputClass(error, true)} pr-9`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          >
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </Field>

      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-lg dark:shadow-black/40"
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Password requirements
            </p>
            <ul className="space-y-1.5">
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(value);
                return (
                  <li key={rule.label} className="flex items-center gap-2 text-[12px]">
                    <motion.span
                      key={ok ? "ok" : "no"}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="flex"
                    >
                      {ok ? (
                        <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <X size={13} className="text-slate-300 dark:text-slate-600" />
                      )}
                    </motion.span>
                    <span className={ok ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}>
                      {rule.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FormSelect = ({ label, name, value, onChange, options, error, required, loading, placeholder = "Select" }) => (
  <Field label={label} name={name} required={required} error={error}>
    <Select
      id={name}
      showSearch
      allowClear
      loading={loading}
      placeholder={placeholder}
      value={value || undefined}
      status={error ? "error" : ""}
      optionFilterProp="label"
      options={options}
      onChange={(val) => onChange({ target: { name, value: val ?? "" } })}
      className="uc-select w-full"
      popupClassName="uc-select-dropdown"
    />
  </Field>
);

const FormDatePicker = ({ label, name, value, onChange, error, required, disabledDate }) => (
  <Field label={label} name={name} required={required} error={error}>
    <DatePicker
      id={name}
      placeholder="Select date"
      status={error ? "error" : ""}
      value={value ? dayjs(value) : null}
      disabledDate={disabledDate}
      onChange={(date, dateString) => onChange({ target: { name, value: dateString } })}
      className="uc-picker w-full"
      popupClassName="uc-picker-dropdown"
    />
  </Field>
);

// ============================================================================
// Section — ERP-style logical grouping
// ============================================================================
const Section = ({ icon: Icon, title, description, children }) => (
  <motion.section
    variants={sectionVariants}
    className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-[220px_1fr]"
  >
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
        <Icon size={15} />
      </div>
      <div>
        <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="mt-1 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  </motion.section>
);

// ============================================================================
// Main
// ============================================================================
const INITIAL_FORM = {
  name: "",
  username: "",
  password: "",
  emailId: "",
  mobile: "",
  gender: "",
  dateOfBirth: "",
  joinningDate: "",
  departmentId: "",
  desiginationId: "",
  locationId: "",
  divisionId: "",
  roleId: "",
};

const UserCreation = ({ embedded = false, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const { loading, userMasterData } = useSelector((state) => state.UserMaster);

  useEffect(() => {
    dispatch(getUserMasterData());
  }, [dispatch]);

  // ---- Master data → Select options ----
  const master = userMasterData?.data ?? userMasterData ?? {};
  const departmentOptions = (master.departments ?? []).map((d) => ({ value: d.id, label: d.departementName }));
  const designationOptions = (master.designations ?? []).map((d) => ({ value: d.id, label: d.desiginationName }));
  const divisionOptions = (master.divisions ?? []).map((d) => ({ value: d.id, label: d.divisionName }));
  const locationOptions = (master.locations ?? []).map((l) => ({ value: l.id, label: l.locationName }));
  const roleOptions = (master.roles ?? []).map((r) => ({ value: r.roleId, label: r.rolesname }));
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    else if (formData.name.trim().length < 2) newErrors.name = "Min 2 characters";

    if (!formData.username.trim()) newErrors.username = "Required";
    else if (formData.username.trim().length < 3) newErrors.username = "Min 3 characters";
    else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) newErrors.username = "Letters, numbers, - and _ only";

    if (!formData.password) newErrors.password = "Required";
    else if (PASSWORD_RULES.some((r) => !r.test(formData.password)))
      newErrors.password = "Doesn't meet requirements";

    if (!formData.emailId.trim()) newErrors.emailId = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) newErrors.emailId = "Invalid email";

    if (!formData.mobile.trim()) newErrors.mobile = "Required";
    else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/\D/g, ""))) newErrors.mobile = "Invalid 10-digit number";

    if (!formData.gender) newErrors.gender = "Required";

    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Required";
    else {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 18) newErrors.dateOfBirth = "Must be 18+";
    }

    if (!formData.joinningDate) newErrors.joinningDate = "Required";

    if (!formData.departmentId) newErrors.departmentId = "Required";
    if (!formData.desiginationId) newErrors.desiginationId = "Required";
    if (!formData.locationId) newErrors.locationId = "Required";
    if (!formData.divisionId) newErrors.divisionId = "Required";
    if (!formData.roleId) newErrors.roleId = "Required";

    return newErrors;
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToast({ message: "Please fix the highlighted fields", type: "error" });
      return;
    }

    setIsLoading(true);

    // Payload expects numeric ids
    const payload = {
      ...formData,
      departmentId: Number(formData.departmentId),
      desiginationId: Number(formData.desiginationId),
      locationId: Number(formData.locationId),
      divisionId: Number(formData.divisionId),
      roleId: Number(formData.roleId),
    };

    const res = await dispatch(userCreation(payload));
    console.log(res.status);

    if (res?.status === 201) {
      setToast({ message: "User created successfully", type: "success" });
      handleReset();
      onSuccess?.(res?.data);
    } else if (res?.status === 409) {
      setToast({ message: "User already exists", type: "error" });
    } else {
      setToast({ message: "User creation failed", type: "error" });
    }

    setIsLoading(false);
  };

  const outerClass = embedded
    ? "relative w-full font-sans"
    : "relative h-full w-full bg-slate-100/60 dark:bg-slate-950 p-3 font-sans sm:p-5";

  const cardClass = embedded
    ? "flex w-full flex-col"
    : "mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none";

  const bodyClass = embedded ? "uc-form" : "uc-form flex-1 overflow-y-auto px-6 py-6";

  return (
    <div className={outerClass}>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cardClass}
      >
        {/* Header — standalone page only; the drawer already shows its own title */}
        {!embedded && (
          <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <UserPlus size={17} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-slate-900 dark:text-slate-50">Create User</h2>
              <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                Add a new user and assign their organization access.
              </p>
            </div>
          </div>
        )}

        {/* Body */}
        <div className={bodyClass}>
          <motion.form
            id="user-creation-form"
            onSubmit={handleSubmit}
            className="space-y-8"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            <Section
              icon={UserRound}
              title="Personal Details"
              description="Basic identity and contact information of the employee."
            >
              <FormInput label="Full Name" name="name" icon={User} value={formData.name} onChange={handleInputChange} error={errors.name} placeholder="Jane Doe" required />
              <FormInput label="Email" name="emailId" type="email" icon={Mail} value={formData.emailId} onChange={handleInputChange} error={errors.emailId} placeholder="jane@company.com" required />
              <FormInput label="Mobile" name="mobile" type="tel" icon={Phone} value={formData.mobile} onChange={handleInputChange} error={errors.mobile} placeholder="9876543210" required />
              <FormSelect label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} options={genderOptions} error={errors.gender} required />
              <FormDatePicker
                label="Date of Birth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                error={errors.dateOfBirth}
                disabledDate={(d) => d && d > dayjs().subtract(18, "year")}
                required
              />
            </Section>

            <motion.div variants={fieldVariants} className="border-t border-slate-100 dark:border-slate-800" />

            <Section
              icon={ShieldCheck}
              title="Account & Security"
              description="Login credentials the user will use to access the system."
            >
              <FormInput label="Username" name="username" icon={AtSign} value={formData.username} onChange={handleInputChange} error={errors.username} placeholder="jane.doe" required />
              <PasswordInput label="Password" name="password" value={formData.password} onChange={handleInputChange} error={errors.password} required />
              <FormSelect label="System Role" name="roleId" value={formData.roleId} onChange={handleInputChange} options={roleOptions} error={errors.roleId} loading={loading} required />
            </Section>

            <motion.div variants={fieldVariants} className="border-t border-slate-100 dark:border-slate-800" />

            <Section
              icon={Building2}
              title="Organization"
              description="Placement of the user within departments, divisions and locations."
            >
              <FormDatePicker
                label="Joining Date"
                name="joinningDate"
                value={formData.joinningDate}
                onChange={handleInputChange}
                error={errors.joinningDate}
                required
              />
              <FormSelect label="Department" name="departmentId" value={formData.departmentId} onChange={handleInputChange} options={departmentOptions} error={errors.departmentId} loading={loading} required />
              <FormSelect label="Designation" name="desiginationId" value={formData.desiginationId} onChange={handleInputChange} options={designationOptions} error={errors.desiginationId} loading={loading} required />
              <FormSelect label="Division" name="divisionId" value={formData.divisionId} onChange={handleInputChange} options={divisionOptions} error={errors.divisionId} loading={loading} required />
              <FormSelect label="Location" name="locationId" value={formData.locationId} onChange={handleInputChange} options={locationOptions} error={errors.locationId} loading={loading} required />
            </Section>
          </motion.form>
        </div>

        {/* Footer */}
        <div
          className={
            embedded
              ? "flex shrink-0 items-center justify-between gap-3 pt-5 mt-2 border-t border-slate-100 dark:border-slate-800"
              : "flex shrink-0 items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-6 py-3.5"
          }
        >
          <p className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">
            <span className="text-rose-500 dark:text-rose-400">*</span> Required fields
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            {embedded && onCancel && (
              <motion.button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                whileTap={{ scale: 0.97 }}
                className="h-9 flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 text-[13px] font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 sm:flex-none"
              >
                Cancel
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              whileTap={{ scale: 0.97 }}
              className="h-9 flex-1 rounded-md border border-[var(--border)] dark:border-slate-700 bg-[var(--primary)]/15 dark:bg-slate-800 px-5 text-[13px] font-medium text-[var(--primary)] dark:text-slate-200 transition-colors hover:bg-[var(--primary)] hover:!text-white dark:hover:bg-slate-700 disabled:opacity-50 sm:flex-none"
            >
              Clear
            </motion.button>
            <motion.button
              type="submit"
              form="user-creation-form"
              disabled={isLoading}
              whileTap={{ scale: 0.97 }}
              className="flex h-9 min-w-[140px] flex-1 items-center justify-center gap-2 rounded-md bg-[var(--primary)] dark:bg-blue-500 px-6 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 dark:active:bg-blue-700 disabled:opacity-60 sm:flex-none"
            >
              {isLoading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Create User
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* AntD control alignment with native inputs — light + dark */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .uc-form ::-webkit-scrollbar { width: 4px; }
        .uc-form ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .uc-form ::-webkit-scrollbar-thumb { background: #475569; }

        .uc-select .ant-select-selector,
        .uc-picker.ant-picker {
          height: 36px !important;
          border-radius: 6px !important;
          border-color: #cbd5e1 !important;
          font-size: 13px;
        }
        .uc-select .ant-select-selection-item,
        .uc-select .ant-select-selection-placeholder { line-height: 34px !important; }
        .uc-select.ant-select-status-error .ant-select-selector,
        .uc-picker.ant-picker-status-error { border-color: #fb7185 !important; }
        .uc-select:hover .ant-select-selector,
        .uc-picker.ant-picker:hover { border-color: #94a3b8 !important; }
        .uc-select.ant-select-focused .ant-select-selector,
        .uc-picker.ant-picker-focused {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15) !important;
        }

        /* Dark mode overrides — assumes a .dark class on a parent (e.g. <html>) */
        .dark .uc-select .ant-select-selector,
        .dark .uc-picker.ant-picker {
          background-color: #1e293b !important;
          border-color: #334155 !important;
        }
        .dark .uc-select .ant-select-selection-item,
        .dark .uc-picker input { color: #f1f5f9 !important; }
        .dark .uc-select .ant-select-selection-placeholder,
        .dark .uc-picker input::placeholder { color: #64748b !important; }
        .dark .uc-select .ant-select-arrow,
        .dark .uc-select .ant-select-clear,
        .dark .uc-picker .anticon { color: #94a3b8 !important; }
        .dark .uc-select:hover .ant-select-selector,
        .dark .uc-picker.ant-picker:hover { border-color: #475569 !important; }
        .dark .uc-select.ant-select-focused .ant-select-selector,
        .dark .uc-picker.ant-picker-focused {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
        .dark .uc-select.ant-select-status-error .ant-select-selector,
        .dark .uc-picker.ant-picker-status-error { border-color: #f43f5e !important; }

        .dark .uc-select-dropdown,
        .dark .uc-picker-dropdown .ant-picker-panel-container {
          background-color: #1e293b !important;
        }
        .dark .uc-select-dropdown .ant-select-item {
          color: #e2e8f0 !important;
        }
        .dark .uc-select-dropdown .ant-select-item-option-active,
        .dark .uc-select-dropdown .ant-select-item-option-selected {
          background-color: #334155 !important;
        }
        .dark .uc-picker-dropdown .ant-picker-cell { color: #94a3b8 !important; }
        .dark .uc-picker-dropdown .ant-picker-cell-in-view { color: #e2e8f0 !important; }
        .dark .uc-picker-dropdown .ant-picker-header,
        .dark .uc-picker-dropdown .ant-picker-footer {
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }
      `,
        }}
      />
    </div>
  );
};

export default UserCreation;