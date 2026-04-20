import React from "react";
import { Select } from "antd";

const ModernSelect = ({
  label,
  options = [],
  value,
  onChange,
  className = "w-40",
  placeholder = "Select",
  loading = false,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[0.6rem] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1 mb-0.5">
          {label}
        </label>
      )}

      <Select
        value={value}
        onChange={(val) => onChange?.(val)}
        options={options}
        loading={loading}
        placeholder={placeholder}
        className="w-full custom-ant-select"
        popupClassName="custom-ant-dropdown"
        size="middle"
      />
    </div>
  );
};

export default ModernSelect;