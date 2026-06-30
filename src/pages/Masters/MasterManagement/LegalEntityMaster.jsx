import React, { useState, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Building2,
  MapPin,
  Layers,
  FileBadge2,
  Plus,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  Search,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldCheck,
  Inbox,
} from 'lucide-react';

/* ============================================================
   SCHEMA NOTE
   legalEntityMaster (1) ──< legalEntityAddresses >── (1) LegalAddress
   legalEntityMaster (1) ──< LegalBuisnessDivision
   legalEntityMaster (1) ──< legalEntityRegistrations
   ============================================================ */

const COUNTRIES = ['India', 'USA', 'UK', 'Germany', 'Canada', 'Singapore', 'UAE'];
const ADDRESS_TYPES = ['Registered', 'Billing', 'Shipping', 'Export'];
const REGISTRATION_TYPES = ['GST', 'PAN', 'CIN', 'EIN', 'TIN', 'VAT'];

// ==================== FORM PRIMITIVES ====================

const FieldShell = ({ label, required, error, hint, children }) => (
  <div className="mb-5">
    <label className="flex items-baseline justify-between mb-1.5">
      <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300 tracking-tight">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {hint && <span className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</span>}
    </label>
    {children}
    {error && (
      <p className="text-rose-500 text-[12px] mt-1.5 flex items-center gap-1 dark:text-rose-400">
        <AlertTriangle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

const FormInput = ({ label, value, onChange, placeholder, error, required, hint, maxLength }) => (
  <FieldShell label={label} required={required} error={error} hint={hint}>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full h-10 px-3.5 rounded-lg text-[13.5px] text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border transition-all duration-150 outline-none ${
        error
          ? 'border-rose-300 dark:border-rose-700 bg-rose-50/60 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 focus:border-rose-400 dark:focus:border-rose-600'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-400 dark:focus:border-indigo-500'
      }`}
    />
  </FieldShell>
);

const FormSelect = ({ label, value, onChange, options, error, required, placeholder }) => (
  <FieldShell label={label} required={required} error={error}>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full h-10 pl-3.5 pr-9 rounded-lg text-[13.5px] appearance-none cursor-pointer border transition-all duration-150 outline-none ${
          value ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'
        } ${
          error
            ? 'border-rose-300 dark:border-rose-700 bg-rose-50/60 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 focus:border-rose-400 dark:focus:border-rose-600'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-400 dark:focus:border-indigo-500'
        }`}
      >
        <option value="" disabled hidden>
          {placeholder || `Select ${label.toLowerCase()}`}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-slate-800 dark:text-slate-100 dark:bg-slate-800">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </FieldShell>
);

const ToggleField = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between mb-5 h-10">
    <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300 tracking-tight">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${
        checked ? 'bg-[var(--primary)]' : 'bg-slate-200 dark:bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-slate-200 rounded-full shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

// ==================== CONFIRM MODAL ====================

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Delete' }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/70 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-slate-700/50 max-w-sm w-full p-6 animate-[scaleIn_0.18s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center justify-center ring-1 ring-rose-100 dark:ring-rose-900/50">
            <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" strokeWidth={2.25} />
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h3>
            <p className="text-[13.5px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2.5 mt-6 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-[13px] font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 active:scale-[0.98] transition-all shadow-sm shadow-rose-500/20"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== STATUS PILL ====================

const StatusPill = ({ active, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-colors ${
      active
        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 ring-1 ring-emerald-200 dark:ring-emerald-900/50'
        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 ring-1 ring-slate-200 dark:ring-slate-600'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'}`} />
    {active ? 'ACTIVE' : 'INACTIVE'}
  </button>
);

// ==================== GENERIC RECORD TABLE (for sub-entities) ====================

const RecordTable = ({ data, columns, onEdit, onDelete, emptyLabel }) => {
  const [confirm, setConfirm] = useState({ open: false, id: null });

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6">
        <div className="w-12 h-12 bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-3 ring-1 ring-[var(--border)] dark:ring-slate-700">
          <Inbox className="w-5 h-5 text-slate-300 dark:text-slate-600" strokeWidth={1.75} />
        </div>
        <p className="text-slate-400 dark:text-slate-500 text-[12.5px]">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-3.5 py-2.5 text-left font-semibold text-slate-500 text-[10.5px] uppercase tracking-wider whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
              <th className="px-3.5 py-2.5 text-center font-semibold text-slate-500 text-[10.5px] uppercase tracking-wider">
                Status
              </th>
              <th className="px-3.5 py-2.5 text-right font-semibold text-slate-500 text-[10.5px] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors group">
                {columns.map((c) => (
                  <td key={c.key} className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                    {item[c.key] || <span className="text-slate-300">—</span>}
                  </td>
                ))}
                <td className="px-3.5 py-2.5 text-center">
                  <StatusPill active={item.isActive} onClick={() => {}} />
                </td>
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirm({ open: true, id: item.id })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        isOpen={confirm.open}
        title="Delete record"
        message="This record will be removed permanently. This can't be undone."
        onConfirm={() => {
          onDelete(confirm.id);
          setConfirm({ open: false, id: null });
        }}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
    </>
  );
};

// ==================== TAB BAR ====================

const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 px-1">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        className={`relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors ${
          active === tab.key ? 'text-[var(--primary)] dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        <tab.icon className="w-3.5 h-3.5" />
        {tab.label}
        {tab.count > 0 && (
          <span
            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-md tabular-nums ${
              active === tab.key ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            {tab.count}
          </span>
        )}
        {active === tab.key && <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--primary)] dark:bg-indigo-400 rounded-full" />}
      </button>
    ))}
  </div>
);

// ==================== SUB-FORM PANELS ====================

const AddressPanel = ({ items, onAdd, onUpdate, onDelete }) => {
  const blank = { addressType: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '' };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.addressType) e.addressType = 'Required';
    if (!form.addressLine1.trim()) e.addressLine1 = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    if (!form.postalCode.trim()) e.postalCode = 'Required';
    if (!form.country) e.country = 'Required';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      toast.error('Fill all required address fields');
      return;
    }
    if (editingId) {
      onUpdate(editingId, form);
      toast.success('Address updated');
    } else {
      onAdd(form);
      toast.success('Address added');
    }
    setForm(blank);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setForm({
      addressType: item.addressType,
      addressLine1: item.addressLine1,
      addressLine2: item.addressLine2,
      city: item.city,
      state: item.state,
      postalCode: item.postalCode,
      country: item.country,
    });
    setEditingId(item.id);
  };

  return (
    <div className="pt-5">
      {editingId && (
        <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          <p className="text-[12.5px] text-indigo-700 dark:text-indigo-300 font-medium">Editing address</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <FormSelect
          label="Address type"
          value={form.addressType}
          onChange={(e) => setForm({ ...form, addressType: e.target.value })}
          options={ADDRESS_TYPES}
          error={errors.addressType}
          required
        />
        <FormInput
          label="Address line 1"
          value={form.addressLine1}
          onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
          placeholder="Street, building, unit"
          error={errors.addressLine1}
          required
        />
        <FormInput
          label="Address line 2"
          value={form.addressLine2}
          onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
          placeholder="Area, landmark (optional)"
        />
        <FormInput
          label="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="e.g. Chennai"
          error={errors.city}
          required
        />
        <FormInput
          label="State"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          placeholder="e.g. Tamil Nadu"
          error={errors.state}
          required
        />
        <FormInput
          label="Postal code"
          value={form.postalCode}
          onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
          placeholder="e.g. 600028"
          error={errors.postalCode}
          required
        />
        <FormSelect
          label="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          options={COUNTRIES}
          error={errors.country}
          required
        />
      </div>
      <div className="flex items-center gap-2.5 mb-5">
        <button
          onClick={handleSave}
          className="h-9 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[12.5px] font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm shadow-indigo-600/20 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          {editingId ? 'Update address' : 'Add address'}
        </button>
        {editingId && (
          <button
            onClick={() => {
              setForm(blank);
              setErrors({});
              setEditingId(null);
            }}
            className="h-9 px-4 text-[12.5px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      <RecordTable
        data={items}
        columns={[
          { key: 'addressType', label: 'Type' },
          { key: 'addressLine1', label: 'Address line 1' },
          { key: 'city', label: 'City' },
          { key: 'state', label: 'State' },
          { key: 'country', label: 'Country' },
        ]}
        onEdit={handleEdit}
        onDelete={onDelete}
        emptyLabel="No addresses added yet"
      />
    </div>
  );
};

const DivisionPanel = ({ items, onAdd, onUpdate, onDelete }) => {
  const blank = { unitName: '', description: '' };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.unitName.trim()) e.unitName = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      toast.error('Fill all required fields');
      return;
    }
    if (editingId) {
      onUpdate(editingId, form);
      toast.success('Division updated');
    } else {
      onAdd(form);
      toast.success('Division added');
    }
    setForm(blank);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setForm({ unitName: item.unitName, description: item.description });
    setEditingId(item.id);
  };

  return (
    <div className="pt-5">
      {editingId && (
        <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          <p className="text-[12.5px] text-indigo-700 dark:text-indigo-300 font-medium">Editing business division</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <FormInput
          label="Unit name"
          value={form.unitName}
          onChange={(e) => setForm({ ...form, unitName: e.target.value })}
          placeholder="e.g. Tyre Manufacturing Unit"
          error={errors.unitName}
          required
        />
        <FormInput
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Short description of this division"
          error={errors.description}
          required
        />
      </div>
      <div className="flex items-center gap-2.5 mb-5">
        <button
          onClick={handleSave}
          className="h-9 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[12.5px] font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm shadow-indigo-600/20 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          {editingId ? 'Update division' : 'Add division'}
        </button>
        {editingId && (
          <button
            onClick={() => {
              setForm(blank);
              setErrors({});
              setEditingId(null);
            }}
            className="h-9 px-4 text-[12.5px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      <RecordTable
        data={items}
        columns={[
          { key: 'unitName', label: 'Unit name' },
          { key: 'description', label: 'Description' },
        ]}
        onEdit={handleEdit}
        onDelete={onDelete}
        emptyLabel="No business divisions added yet"
      />
    </div>
  );
};

const RegistrationPanel = ({ items, onAdd, onUpdate, onDelete }) => {
  const blank = { registrationType: '', registrationNumber: '', country: '' };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.registrationType) e.registrationType = 'Required';
    if (!form.registrationNumber.trim()) e.registrationNumber = 'Required';
    if (!form.country) e.country = 'Required';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      toast.error('Fill all required fields');
      return;
    }
    if (editingId) {
      onUpdate(editingId, form);
      toast.success('Registration updated');
    } else {
      onAdd(form);
      toast.success('Registration added');
    }
    setForm(blank);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setForm({
      registrationType: item.registrationType,
      registrationNumber: item.registrationNumber,
      country: item.country,
    });
    setEditingId(item.id);
  };

  return (
    <div className="pt-5">
      {editingId && (
        <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          <p className="text-[12.5px] text-indigo-700 dark:text-indigo-300 font-medium">Editing registration</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
        <FormSelect
          label="Registration type"
          value={form.registrationType}
          onChange={(e) => setForm({ ...form, registrationType: e.target.value })}
          options={REGISTRATION_TYPES}
          error={errors.registrationType}
          required
        />
        <FormInput
          label="Registration number"
          value={form.registrationNumber}
          onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
          placeholder="e.g. 33AAACX1234F1Z5"
          error={errors.registrationNumber}
          required
        />
        <FormSelect
          label="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          options={COUNTRIES}
          error={errors.country}
          required
        />
      </div>
      <div className="flex items-center gap-2.5 mb-5">
        <button
          onClick={handleSave}
          className="h-9 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[12.5px] font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm shadow-indigo-600/20 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          {editingId ? 'Update registration' : 'Add registration'}
        </button>
        {editingId && (
          <button
            onClick={() => {
              setForm(blank);
              setErrors({});
              setEditingId(null);
            }}
            className="h-9 px-4 text-[12.5px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      <RecordTable
        data={items}
        columns={[
          { key: 'registrationType', label: 'Type' },
          { key: 'registrationNumber', label: 'Registration number' },
          { key: 'country', label: 'Country' },
        ]}
        onEdit={handleEdit}
        onDelete={onDelete}
        emptyLabel="No registrations added yet"
      />
    </div>
  );
};

// ==================== ENTITY LIST (LEFT RAIL) ====================

const EntityListItem = ({ entity, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3.5 py-3 rounded-xl transition-colors border ${
      active ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50' : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-200 dark:hover:border-slate-700'
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <p className={`text-[13px] font-semibold truncate ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-100'}`}>
        {entity.companyLegalName || 'Untitled entity'}
      </p>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${entity.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
    </div>
    <p className="text-[11.5px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
      {entity.entityCode || 'No code'} &middot; {entity.country || 'No country'}
    </p>
  </button>
);

// ==================== MAIN COMPONENT ====================

const LegalEntityMaster = () => {
  const [entities, setEntities] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('addresses');
  const [showNewForm, setShowNewForm] = useState(true);

  const blankEntity = {
    companyLegalName: '',
    companyFormerName: '',
    entityCode: '',
    entityShortName: '',
    country: '',
    isActive: true,
  };
  const [entityForm, setEntityForm] = useState(blankEntity);
  const [entityErrors, FsetEntityErrors] = useState({});
  const [entityLoading, setEntityLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || null;

  const filteredEntities = useMemo(
    () =>
      entities.filter((e) =>
        `${e.companyLegalName} ${e.entityCode} ${e.country}`.toLowerCase().includes(search.toLowerCase())
      ),
    [entities, search]
  );

  // ---------- Entity CRUD ----------

  const validateEntity = () => {
    const e = {};
    if (!entityForm.companyLegalName.trim()) e.companyLegalName = 'Legal name is required';
    if (!entityForm.entityCode.trim()) e.entityCode = 'Entity code is required';
    if (!entityForm.country) e.country = 'Country is required';
    return e;
  };

  const handleSaveEntity = async () => {
    const errs = validateEntity();
    if (Object.keys(errs).length) {
      setEntityErrors(errs);
      toast.error('Please fix the errors before saving');
      return;
    }
    setEntityLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      if (selectedEntityId && !showNewForm) {
        setEntities(entities.map((e) => (e.id === selectedEntityId ? { ...e, ...entityForm } : e)));
        toast.success('Legal entity updated');
      } else {
        const newEntity = {
          ...entityForm,
          id: Date.now(),
          addresses: [],
          divisions: [],
          registrations: [],
        };
        setEntities([...entities, newEntity]);
        setSelectedEntityId(newEntity.id);
        setShowNewForm(false);
        toast.success('Legal entity created');
      }
      setEntityErrors({});
    } catch {
      toast.error('Error saving legal entity');
    } finally {
      setEntityLoading(false);
    }
  };

  const handleSelectEntity = (entity) => {
    setSelectedEntityId(entity.id);
    setShowNewForm(false);
    setEntityForm({
      companyLegalName: entity.companyLegalName,
      companyFormerName: entity.companyFormerName,
      entityCode: entity.entityCode,
      entityShortName: entity.entityShortName,
      country: entity.country,
      isActive: entity.isActive,
    });
    setEntityErrors({});
    setActiveTab('addresses');
  };

  const handleNewEntity = () => {
    setShowNewForm(true);
    setSelectedEntityId(null);
    setEntityForm(blankEntity);
    setEntityErrors({});
  };

  const handleResetEntityForm = () => {
    if (selectedEntity) {
      handleSelectEntity(selectedEntity);
    } else {
      setEntityForm(blankEntity);
      setEntityErrors({});
    }
    toast.success('Form reset');
  };

  const handleDeleteEntity = () => {
    setEntities(entities.filter((e) => e.id !== deleteConfirm.id));
    if (selectedEntityId === deleteConfirm.id) {
      handleNewEntity();
    }
    setDeleteConfirm({ open: false, id: null });
    toast.success('Legal entity deleted');
  };

  // ---------- Sub-entity CRUD (operate on selected entity) ----------

  const updateSelectedEntity = (patch) => {
    setEntities(entities.map((e) => (e.id === selectedEntityId ? patch(e) : e)));
  };

  const addAddress = (data) =>
    updateSelectedEntity((e) => ({
      ...e,
      addresses: [...e.addresses, { ...data, id: Date.now(), isActive: true }],
    }));
  const updateAddress = (id, data) =>
    updateSelectedEntity((e) => ({
      ...e,
      addresses: e.addresses.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  const deleteAddress = (id) =>
    updateSelectedEntity((e) => ({ ...e, addresses: e.addresses.filter((a) => a.id !== id) }));

  const addDivision = (data) =>
    updateSelectedEntity((e) => ({
      ...e,
      divisions: [...e.divisions, { ...data, id: Date.now(), isActive: true }],
    }));
  const updateDivision = (id, data) =>
    updateSelectedEntity((e) => ({
      ...e,
      divisions: e.divisions.map((d) => (d.id === id ? { ...d, ...data } : d)),
    }));
  const deleteDivision = (id) =>
    updateSelectedEntity((e) => ({ ...e, divisions: e.divisions.filter((d) => d.id !== id) }));

  const addRegistration = (data) =>
    updateSelectedEntity((e) => ({
      ...e,
      registrations: [...e.registrations, { ...data, id: Date.now(), isActive: true }],
    }));
  const updateRegistration = (id, data) =>
    updateSelectedEntity((e) => ({
      ...e,
      registrations: e.registrations.map((r) => (r.id === id ? { ...r, ...data } : r)),
    }));
  const deleteRegistration = (id) =>
    updateSelectedEntity((e) => ({ ...e, registrations: e.registrations.filter((r) => r.id !== id) }));

  const tabs = selectedEntity
    ? [
        { key: 'addresses', label: 'Addresses', icon: MapPin, count: selectedEntity.addresses.length },
        { key: 'divisions', label: 'Business divisions', icon: Layers, count: selectedEntity.divisions.length },
        { key: 'registrations', label: 'Registrations', icon: FileBadge2, count: selectedEntity.registrations.length },
      ]
    : [];

  return (
    <div className="min-h-full bg-slate-50">
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
      `}</style>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: '13px', borderRadius: '10px' } }} />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-white" strokeWidth={2.25} />
            </div>
            <h1 className="text-[19px] font-semibold text-slate-900 dark:text-white tracking-tight">Legal Entity Master</h1>
          </div>
          <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 ml-[42px]">
            Legal entities with addresses, business divisions and statutory registrations
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="grid grid-cols-1 lg:grid-cols-[19rem_1fr] gap-5">
          {/* LEFT: Entity list */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none overflow-hidden h-fit">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <button
                onClick={handleNewEntity}
                className="w-full h-10 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[13px] font-medium rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm shadow-indigo-600/20 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                New legal entity
              </button>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 h-9 mt-3">
                <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search entities…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-[12.5px] bg-transparent outline-none placeholder-slate-400 text-slate-700"
                />
              </div>
            </div>
            <div className="p-2 max-h-[34rem] overflow-y-auto space-y-1">
              {filteredEntities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <Building2 className="w-6 h-6 text-slate-200 mb-2" />
                  <p className="text-slate-400 text-[12.5px] text-center">
                    {entities.length === 0 ? 'No legal entities yet' : 'No matches found'}
                  </p>
                </div>
              ) : (
                filteredEntities.map((entity) => (
                  <EntityListItem
                    key={entity.id}
                    entity={entity}
                    active={selectedEntityId === entity.id}
                    onClick={() => handleSelectEntity(entity)}
                  />
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Entity form + tabs */}
          <div className="space-y-5">
            {/* Entity core form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] dark:border-slate-700/50 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[14.5px] font-semibold text-slate-900 dark:text-white tracking-tight">
                  {showNewForm ? 'New legal entity' : 'Entity details'}
                </h2>
                {!showNewForm && selectedEntity && (
                  <button
                    onClick={() => setDeleteConfirm({ open: true, id: selectedEntity.id })}
                    className="text-[12px] font-medium text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete entity
                  </button>
                )}
              </div>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mb-5">legalEntityMaster</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <FormInput
                  label="Company legal name"
                  value={entityForm.companyLegalName}
                  onChange={(e) => setEntityForm({ ...entityForm, companyLegalName: e.target.value })}
                  placeholder="e.g. Sun TWS America Inc."
                  error={entityErrors.companyLegalName}
                  required
                />
                <FormInput
                  label="Company former name"
                  value={entityForm.companyFormerName}
                  onChange={(e) => setEntityForm({ ...entityForm, companyFormerName: e.target.value })}
                  placeholder="Previous name, if any"
                />
                <FormInput
                  label="Entity code"
                  value={entityForm.entityCode}
                  onChange={(e) => setEntityForm({ ...entityForm, entityCode: e.target.value })}
                  placeholder="e.g. STA"
                  error={entityErrors.entityCode}
                  required
                  maxLength={50}
                />
                <FormInput
                  label="Entity short name"
                  value={entityForm.entityShortName}
                  onChange={(e) => setEntityForm({ ...entityForm, entityShortName: e.target.value })}
                  placeholder="e.g. Sun TWS"
                  maxLength={50}
                />
                <FormSelect
                  label="Country"
                  value={entityForm.country}
                  onChange={(e) => setEntityForm({ ...entityForm, country: e.target.value })}
                  options={COUNTRIES}
                  error={entityErrors.country}
                  required
                />
                <ToggleField
                  label="Entity active"
                  checked={entityForm.isActive}
                  onChange={(val) => setEntityForm({ ...entityForm, isActive: val })}
                />
              </div>

              <div className="flex items-center gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={handleSaveEntity}
                  disabled={entityLoading}
                  className="h-10 px-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-indigo-300 text-white text-[13px] font-medium rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm shadow-indigo-600/20 active:scale-[0.98]"
                >
                  {entityLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {entityLoading ? 'Saving…' : showNewForm ? 'Create entity' : 'Update entity'}
                </button>
                <button
                  onClick={handleResetEntityForm}
                  className="h-10 px-4 text-[13px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Sub-entity tabs (only when an entity is selected/saved) */}
            {selectedEntity ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] dark:border-slate-700/50 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none overflow-hidden">
                <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
                <div className="px-5 pb-5">
                  {activeTab === 'addresses' && (
                    <AddressPanel
                      items={selectedEntity.addresses}
                      onAdd={addAddress}
                      onUpdate={updateAddress}
                      onDelete={deleteAddress}
                    />
                  )}
                  {activeTab === 'divisions' && (
                    <DivisionPanel
                      items={selectedEntity.divisions}
                      onAdd={addDivision}
                      onUpdate={updateDivision}
                      onDelete={deleteDivision}
                    />
                  )}
                  {activeTab === 'registrations' && (
                    <RegistrationPanel
                      items={selectedEntity.registrations}
                      onAdd={addRegistration}
                      onUpdate={updateRegistration}
                      onDelete={deleteRegistration}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50 p-10 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-7 h-7 text-slate-200 dark:text-slate-700 mb-3" />
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">Save the entity to add details</p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
                  Addresses, business divisions and registrations unlock once the entity is created
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={deleteConfirm.open}
        title="Delete legal entity"
        message="This will remove the entity along with all its linked addresses, divisions and registrations. This can't be undone."
        onConfirm={handleDeleteEntity}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />

      <footer className="border-t border-slate-200 dark:border-slate-700 mt-4 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-[12px] text-slate-400 dark:text-slate-500">
          Legal Entity Master &middot; Last updated {new Date().toLocaleDateString()}
        </div>
      </footer>
    </div>
  );
};

export default LegalEntityMaster;