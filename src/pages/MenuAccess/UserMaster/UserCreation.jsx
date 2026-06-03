import React, { useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff, Info } from "lucide-react";
import { userCreation } from "../../../Redux/Slices/Master/UserMaster.jsx/UserCreationSlice";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "antd";
import dayjs from "dayjs";

// ============================================================================
// Modern Compact Toast
// ============================================================================
const Toast = ({ message, type = "success", onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-emerald-500/90" : "bg-rose-500/90";

  return (
    <div
      className={`absolute top-4 right-4 ${bgColor} backdrop-blur-md text-white px-4 py-2.5 rounded-lg shadow-xl 
      flex items-center gap-2.5 animate-in slide-in-from-top-5 fade-in duration-300 z-[100]`}
    >
      <CheckCircle
        size={16}
        className={type === "success" ? "block" : "hidden"}
      />
      <AlertCircle
        size={16}
        className={type === "error" ? "block" : "hidden"}
      />
      <span className="text-sm font-medium tracking-wide">{message}</span>
    </div>
  );
};

// ============================================================================
// Ultra-Compact Form Input
// ============================================================================
const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  showPassword = false,
  onTogglePassword,
  isPasswordHovered,
  setPasswordHovered,
}) => {
  const isPassword = type === "password";
  const inputType = isPassword && !showPassword ? "password" : "text";

  return (
    <div className="group relative flex flex-col justify-end">
      <label
        htmlFor={name}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 
        transition-colors duration-300 group-focus-within:text-blue-600"
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div className="relative">
        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 text-sm rounded-lg transition-all duration-300
            bg-slate-50/50 border outline-none shadow-sm backdrop-blur-sm
            ${
              error
                ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            } placeholder:text-slate-400`}
        />

        {isPassword && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onMouseEnter={() => setPasswordHovered?.(true)}
              onMouseLeave={() => setPasswordHovered?.(false)}
              className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
            >
              <Info size={16} />
            </button>
            <button
              type="button"
              onClick={() => onTogglePassword?.(name)}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        )}
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${error ? "max-h-6 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
      >
        <div className="flex items-center gap-1 text-rose-500 text-[11px] font-medium">
          <AlertCircle size={12} />
          <span className="truncate">{error}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Ultra-Compact Form Select
// ============================================================================
const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = "Select...",
}) => {
  return (
    <div className="group relative flex flex-col justify-end">
      <label
        htmlFor={name}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 
        transition-colors duration-300 group-focus-within:text-blue-600"
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 text-sm rounded-lg transition-all duration-300
          bg-slate-50/50 border outline-none shadow-sm backdrop-blur-sm appearance-none cursor-pointer
          ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
              : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          }`}
      >
        <option value="" disabled className="text-slate-400">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-slate-700">
            {opt.label}
          </option>
        ))}
      </select>

      <div className="absolute right-3 top-[28px] pointer-events-none text-slate-400">
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${error ? "max-h-6 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
      >
        <div className="flex items-center gap-1 text-rose-500 text-[11px] font-medium">
          <AlertCircle size={12} />
          <span className="truncate">{error}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Application Component
// ============================================================================
const UserCreation = () => {
  const [showPasswords, setShowPasswords] = useState({});
  const [isPasswordHovered, setPasswordHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.UserMaster);

  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    else if (formData.name.trim().length < 2) newErrors.name = "Min 2 chars";

    if (!formData.username.trim()) newErrors.username = "Required";
    else if (formData.username.trim().length < 3)
      newErrors.username = "Min 3 chars";
    else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username))
      newErrors.username = "Invalid format";

    if (!formData.password) newErrors.password = "Required";
    else if (formData.password.length < 8) newErrors.password = "Min 8 chars";
    else if (!/[A-Z]/.test(formData.password))
      newErrors.password = "Needs uppercase";
    else if (!/[0-9]/.test(formData.password))
      newErrors.password = "Needs number";
    else if (!/[!@#$%^&*]/.test(formData.password))
      newErrors.password = "Needs special char";

    if (!formData.emailId.trim()) newErrors.emailId = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId))
      newErrors.emailId = "Invalid emailId";

    if (!formData.mobile.trim()) newErrors.mobile = "Required";
    else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/\D/g, "")))
      newErrors.mobile = "Invalid 10-digit no.";

    if (!formData.gender) newErrors.gender = "Required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Required";
    else {
      const age =
        new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 18) newErrors.dateOfBirth = "Must be 18+";
    }

    if (!formData.joinningDate) newErrors.joinningDate = "Required";
    else if (
      new Date(formData.joinningDate) < new Date(new Date().setHours(0, 0, 0, 0))
    )
      newErrors.joinningDate = "Cannot be past";

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

  const handleTogglePassword = (fieldName) => {
    setShowPasswords((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
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

    const res = await dispatch(userCreation(formData));

    if (res?.status === 200) {
      setToast({ message: "User provisioned successfully", type: "success" });
      handleReset(); // ✅ only on success
    } else {
      setToast({ message: "User creation failed", type: "error" });
    }

    setIsLoading(false); // ✅ only once
  };

  const handleReset = () => {
    setFormData({
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
    });
    setErrors({});
  };

  // Mock Data
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];
  const departmentOptions = [
    { value: "1", label: "IT" },
    { value: "2", label: "CRM" },
    { value: "3", label: "DISPATCH" },
    { value: "3", label: "PLANT" },
  ];
  const designationOptions = [
    { value: "1", label: "Jr Developer" },
    { value: "2", label: "Sr Developer" },
    { value: "3", label: "Manager" },
  ];
  const locationOptions = [
    { value: "1", label: "New York" },
    { value: "2", label: "London" },
    { value: "3", label: "Bangalore" },
  ];
  const divisionOptions = [
    { value: "1", label: "Product" },
    { value: "2", label: "Platform" },
  ];
  const roleOptions = [
    { value: "1", label: "Admin" },
    { value: "2", label: "User" },
    // { value: "3", label: "Viewer" },
  ];

  return (
    // Changed to h-full w-full to adapt strictly to the Outlet parent
    <div className="h-full w-full flex items-center justify-center p-2 sm:p-6 relative font-sans">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Card matches the parent Outlet size without overflowing it */}
      <div className="w-full h-full max-h-full max-w-5xl bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-500">
        {/* Header stays pinned */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Provision New User
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Configure identity and access controls.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            System Online
          </div>
        </div>

        {/* Scrollable Form Body - allows fields to scroll while header/footer stay fixed */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form
            id="user-creation-form"
            onSubmit={handleSubmit}
            className="h-full flex flex-col"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-5">
              <FormInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Jane Doe"
                required
              />
              <FormInput
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
                placeholder="jane.doe"
                required
              />
              <FormInput
                label="Email"
                name="emailId"
                type="email"
                value={formData.emailId}
                onChange={handleInputChange}
                error={errors.emailId}
                placeholder="jane@company.com"
                required
              />
              <FormInput
                label="Mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleInputChange}
                error={errors.mobile}
                placeholder="9876543210"
                required
              />

              <div className="relative">
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  placeholder="••••••••"
                  required
                  showPassword={showPasswords.password}
                  onTogglePassword={handleTogglePassword}
                  setPasswordHovered={setPasswordHovered}
                />
                {isPasswordHovered && (
                  <div className="absolute top-[105%] left-0 bg-slate-800 text-white text-[10px] p-2.5 rounded-lg shadow-xl w-48 animate-in fade-in z-50">
                    <p className="font-semibold mb-1 text-slate-200 border-b border-slate-600 pb-1">
                      Requirements:
                    </p>
                    <ul className="space-y-0.5">
                      <li
                        className={
                          formData.password.length >= 8
                            ? "text-emerald-400"
                            : ""
                        }
                      >
                        • 8+ characters
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(formData.password)
                            ? "text-emerald-400"
                            : ""
                        }
                      >
                        • 1+ uppercase letter
                      </li>
                      <li
                        className={
                          /[0-9]/.test(formData.password)
                            ? "text-emerald-400"
                            : ""
                        }
                      >
                        • 1+ number
                      </li>
                      <li
                        className={
                          /[!@#$%^&*]/.test(formData.password)
                            ? "text-emerald-400"
                            : ""
                        }
                      >
                        • 1+ special char
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <FormSelect
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                options={genderOptions}
                error={errors.gender}
                required
              />
              <FormDatePicker
                label="Date of Birth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                error={errors.dateOfBirth}
                required
              />
              <FormDatePicker
                label="Joining Date"
                name="joinningDate"
                value={formData.joinningDate}
                onChange={handleInputChange}
                error={errors.joinningDate}
                required
              />
              <FormSelect
                label="Department"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                options={departmentOptions}
                error={errors.departmentId}
                required
              />
              <FormSelect
                label="Designation"
                name="desiginationId"
                value={formData.desiginationId}
                onChange={handleInputChange}
                options={designationOptions}
                error={errors.desiginationId}
                required
              />
              <FormSelect
                label="Location"
                name="locationId"
                value={formData.locationId}
                onChange={handleInputChange}
                options={locationOptions}
                error={errors.locationId}
                required
              />
              <FormSelect
                label="Division"
                name="divisionId"
                value={formData.divisionId}
                onChange={handleInputChange}
                options={divisionOptions}
                error={errors.divisionId}
                required
              />

              <FormSelect
                label="System Role"
                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                options={roleOptions}
                error={errors.roleId}
                required
              />
            </div>
          </form>
        </div>

        {/* Footer actions pinned to the bottom */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50 rounded-b-2xl">
          <p className="text-[10px] text-slate-400 hidden sm:block">
            Fields marked with <span className="text-rose-500">*</span> are
            mandatory.
          </p>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-6 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 
                rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50 shadow-sm"
            >
              Clear
            </button>
            <button
              type="submit"
              form="user-creation-form"
              disabled={isLoading}
              className="flex-1 sm:flex-none px-8 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 
                rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 focus:outline-none focus:ring-2 
                focus:ring-blue-500/50 disabled:opacity-70 flex items-center justify-center gap-2 min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing</span>
                </>
              ) : (
                <span>Create Identity</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
};

const FormDatePicker = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder = "Select date",
}) => {
  return (
    <div className="group relative flex flex-col justify-end">
      <label
        htmlFor={name}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 transition-colors duration-300 group-focus-within:text-blue-600"
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <DatePicker
        id={name}
        placeholder={placeholder}
        // Antd's native error status handles the red border
        status={error ? "error" : ""}
        // Convert string date to dayjs object for Antd, or null if empty
        value={value ? dayjs(value) : null}
        onChange={(date, dateString) => {
          // Fire a synthetic event to perfectly match your existing handleInputChange logic
          onChange({ target: { name, value: dateString } });
        }}
        // Tailwind overrides to ensure it matches your exact input heights and styles
        className={`w-full px-3 py-[7px] text-sm rounded-lg transition-all duration-300
          bg-slate-50/50 backdrop-blur-sm shadow-sm
          ${
            error
              ? "focus-within:ring-4 focus-within:ring-rose-500/10 hover:bg-white"
              : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10"
          }`}
      />

      {/* Your standard animated error message block */}
      <div
        className={`overflow-hidden transition-all duration-300 ${error ? "max-h-6 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
      >
        <div className="flex items-center gap-1 text-rose-500 text-[11px] font-medium">
          <AlertCircle size={12} />
          <span className="truncate">{error}</span>
        </div>
      </div>
    </div>
  );
};

export default UserCreation;
