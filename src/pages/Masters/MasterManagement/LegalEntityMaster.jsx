import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import toast from 'react-hot-toast';
// import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  Building,
  MapPin,
  Map,
  Globe2,
  Home,
  Milestone,
  Mailbox,
  Tag,
  Hash,
  Gauge,
  Ruler,
  Phone,
  Receipt,
  LayoutGrid,
  Layers,
  Boxes,
  Warehouse,
  Landmark,
  CreditCard,
  User,
  BadgeCheck,
  Check,
  FileText,
  Navigation,
  ScanLine,
  Plus,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  Search,
  ChevronDown,
  AlertTriangle,
  Inbox,
  Lock,
  Briefcase,
  FileCheck,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createLegalEntity,
  updateLegalEntity,
  updateLegalEntityAddress,
  getLegalEntities,
  getTypeMasterData,
  createLegalEntityBusinessDivision,
  updateLegalEntityBusinessDivision,
  createLegalEntityLocation,
  updateLegalEntityLocation,
  createLegalEntityWarehouse,
  updateLegalEntityWarehouse,
  createLegalEntityBank,
  updateLegalEntityBank,
} from '../../../Redux/Slices/Master/LegalEntityMaster/LegalEntityMasterSlice';

const CAPACITY_UNITS = ['Sq.Ft', 'Sq.M', 'MT', 'CBM', 'Pallets', 'Nos'];
const COUNTRIES = ['India', 'USA', 'UK', 'Germany', 'Canada', 'Singapore', 'UAE', 'Sri Lanka'];

const COUNTRY_MASTER = [
  { id: 1, name: 'India' },
  { id: 2, name: 'USA' },
  { id: 3, name: 'Singapore' },
];

const STATE_MASTER = [
  { id: 11, countryId: 1, name: 'Tamil Nadu' },
  { id: 12, countryId: 1, name: 'Karnataka' },
  { id: 13, countryId: 1, name: 'Maharashtra' },
  { id: 21, countryId: 2, name: 'Texas' },
  { id: 22, countryId: 2, name: 'Ohio' },
  { id: 31, countryId: 3, name: 'Central Region' },
];

const CITY_MASTER = [
  { id: 111, stateId: 11, name: 'Chennai' },
  { id: 112, stateId: 11, name: 'Coimbatore' },
  { id: 113, stateId: 11, name: 'Hosur' },
  { id: 121, stateId: 12, name: 'Bengaluru' },
  { id: 122, stateId: 12, name: 'Mysuru' },
  { id: 131, stateId: 13, name: 'Pune' },
  { id: 211, stateId: 21, name: 'Dallas' },
  { id: 221, stateId: 22, name: 'Columbus' },
  { id: 311, stateId: 31, name: 'Singapore' },
];

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const byId = (list, id) => list.find((x) => String(x.id) === String(id));
const toOptions = (list) => list.map((x) => ({ value: String(x.id), label: x.name }));
const flatten = (sections) => sections.flatMap((s) => s.fields);

const titleCase = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Underscore-separated codes (e.g. "MANUFACTURING_PLANT") read as one long
// word to titleCase's \b boundary — split on "_" first so each part gets capitalized.
const formatUnderscoreCode = (s) => titleCase(String(s || '').replace(/_/g, ' '));

// Warehouse/Bank submit a numeric addressTypeID FK.
const buildAddressTypeIdOptions = (addressTypes) =>
  addressTypes.map((a) => ({ value: String(a.addressTypeID), label: titleCase(a.addressTypeCode) }));

// The entity's own address (CreateLegalEntity) submits addressType as a free-text code.
const buildAddressTypeCodeOptions = (addressTypes) =>
  addressTypes.map((a) => ({ value: a.addressTypeCode, label: titleCase(a.addressTypeCode) }));

// CreateWarehouse submits warehouseType as a free-text name, not an ID.
const buildWarehouseTypeOptions = (warehouseTypes) =>
  warehouseTypes.map((w) => ({ value: w.warehouseTypeName, label: w.warehouseTypeName }));

// CreateLegalEntity/CreateLegalEntityRegistration submit registrationType as a free-text code.
const buildRegistrationTypeOptions = (registrationTypes) =>
  registrationTypes.map((r) => ({ value: r.registrationTypeCode, label: r.registrationTypeName }));

// CreateGlobalLocation/UpdateGlobalLocation submit locationType as a free-text
// code — only a code is returned by the master, no separate display name.
const buildLocationTypeOptions = (locationTypes) =>
  locationTypes.map((l) => ({ value: l.locationTypeCode, label: formatUnderscoreCode(l.locationTypeCode) }));

// locationFunction is a free-text code on the location payload.
const buildPrimaryFunctionOptions = (primaryFunctions) =>
  primaryFunctions.map((f) => ({ value: f.primaryFunctionCode, label: f.primaryFunctionName }));

// operationalCategory is a free-text code on the location payload.
const buildLocationCategoryOptions = (locationCategories) =>
  locationCategories.map((c) => ({ value: c.locationCategoryCode, label: c.locationCategoryName }));

// ==================== MOTION ====================

const ease = [0.22, 1, 0.36, 1];
const fast = { duration: 0.18, ease };
const fade = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.03, delayChildren: 0.04 } } };
const riseIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease } },
};

// ==================== FORM PRIMITIVES ====================

const FieldShell = ({ label, required, error, children }) => (
  <div className="mb-5">
    <label className="block mb-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 tracking-tight">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={fast}
          className="mt-1.5 flex items-center gap-1 text-[12px] text-rose-500 dark:text-rose-400"
        >
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const controlClass = (error) =>
  `w-full h-10 rounded-lg text-[13.5px] border outline-none transition-all duration-150 ${
    error
      ? 'border-rose-300 dark:border-rose-700 bg-rose-50/60 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/50 focus:border-rose-400'
      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-400 dark:focus:border-indigo-500'
  }`;

const LeadingIcon = ({ icon: Icon, error }) =>
  Icon ? (
    <Icon
      className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
        error ? 'text-rose-400' : 'text-slate-400 dark:text-slate-500'
      }`}
      strokeWidth={2}
    />
  ) : null;

const FormInput = ({ label, value, onChange, placeholder, error, required, maxLength, icon }) => (
  <FieldShell label={label} required={required} error={error}>
    <div className="relative">
      <LeadingIcon icon={icon} error={error} />
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`${controlClass(error)} ${
          icon ? 'pl-9' : 'pl-3.5'
        } pr-3.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
      />
    </div>
  </FieldShell>
);

const FormSelect = ({ label, value, onChange, options, error, required, placeholder, disabled, icon }) => (
  <FieldShell label={label} required={required} error={error}>
    <div className="relative">
      <LeadingIcon icon={icon} error={error} />
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${controlClass(error)} ${icon ? 'pl-9' : 'pl-3.5'} pr-9 appearance-none ${
          disabled
            ? 'cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600'
            : `cursor-pointer ${value ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`
        }`}
      >
        <option value="" disabled hidden>
          {placeholder || `Select ${label.toLowerCase()}`}
        </option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const text = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val} className="text-slate-800 dark:text-slate-100 dark:bg-slate-800">
              {text}
            </option>
          );
        })}
      </select>
      {disabled ? (
        <Lock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      ) : (
        <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      )}
    </div>
  </FieldShell>
);

const FormToggle = ({ label, value, onChange }) => (
  <div className="mb-5">
    <span className="block mb-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 tracking-tight">{label}</span>
    <div className="h-10 flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
          value ? 'bg-[var(--primary)]' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center ${
            value ? 'right-0.5' : 'left-0.5'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {value && (
              <motion.span
                key="on"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={fast}
              >
                <Check className="w-3 h-3 text-[var(--primary)]" strokeWidth={3.5} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </button>
      <span className="text-[12.5px] text-slate-500 dark:text-slate-400">{value ? 'Active' : 'Inactive'}</span>
    </div>
  </div>
);

const FieldRenderer = ({ field, value, error, onChange, options, disabled }) => {
  if (field.type === 'select')
    return (
      <FormSelect
        label={field.label}
        value={value}
        onChange={onChange}
        options={options || field.options}
        error={error}
        required={field.required}
        placeholder={disabled ? field.disabledHint : field.placeholder}
        disabled={disabled}
        icon={field.icon}
      />
    );
  if (field.type === 'toggle') return <FormToggle label={field.label} value={value} onChange={onChange} />;
  return (
    <FormInput
      label={field.label}
      value={value}
      onChange={onChange}
      placeholder={field.placeholder}
      error={error}
      required={field.required}
      maxLength={field.maxLength}
      icon={field.icon}
    />
  );
};

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <span className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900/50 ring-1 ring-slate-200/80 dark:ring-slate-700 flex items-center justify-center flex-shrink-0">
      <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" strokeWidth={2} />
    </span>
    <h3 className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
      {title}
    </h3>
    <span className="flex-1 h-px bg-slate-100 dark:bg-slate-700/60" />
  </div>
);

const FormSections = ({ sections, form, errors, onChange }) => (
  <motion.div variants={stagger} initial="hidden" animate="show">
    {sections.map((section) => (
      <motion.section key={section.title} variants={riseIn} className="mb-1">
        <SectionHeader icon={section.icon} title={section.title} />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4">
          {section.fields.map((f) => (
            <FieldRenderer
              key={f.name}
              field={f}
              value={form[f.name]}
              error={errors[f.name]}
              options={typeof f.options === 'function' ? f.options(form) : f.options}
              disabled={f.disabled ? f.disabled(form) : false}
              onChange={(v) => onChange(f, v)}
            />
          ))}
        </div>
      </motion.section>
    ))}
  </motion.div>
);

// ==================== BUTTONS & MODALS ====================

const PrimaryButton = ({ children, onClick, disabled, icon: Icon, loading, success }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={disabled ? undefined : { y: -1 }}
    whileTap={disabled ? undefined : { scale: 0.98 }}
    transition={fast}
    className="h-10 px-5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20"
  >
    <AnimatePresence mode="wait" initial={false}>
      {loading ? (
        <motion.span
          key="load"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={fast}
          className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
        />
      ) : success ? (
        <motion.span key="ok" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={fast}>
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </motion.span>
      ) : (
        Icon && (
          <motion.span key="icon" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={fast}>
            <Icon className="w-3.5 h-3.5" />
          </motion.span>
        )
      )}
    </AnimatePresence>
    {children}
  </motion.button>
);

const GhostButton = ({ children, onClick, icon: Icon, disabled }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={disabled ? undefined : { y: -1 }}
    whileTap={disabled ? undefined : { scale: 0.98 }}
    transition={fast}
    className="h-10 px-4 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 text-[13px] font-medium flex items-center justify-center gap-2"
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {children}
  </motion.button>
);

const ConfirmModal = ({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fast}
        onClick={onCancel}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/70 backdrop-blur-[2px]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={fast}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-slate-700/50"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0.7, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-100 dark:ring-rose-900/50 flex items-center justify-center"
            >
              <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" strokeWidth={2.25} />
            </motion.div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">{message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2.5 mt-6">
            <GhostButton onClick={onCancel}>Cancel</GhostButton>
            <motion.button
              onClick={onConfirm}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={fast}
              className="h-10 px-4 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[13px] font-medium flex items-center gap-2 shadow-sm shadow-rose-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmLabel}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const StatusPill = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ring-1 ${
      active
        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-900/50'
        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-slate-600'
    }`}
  >
    {active ? (
      <BadgeCheck className="w-3 h-3" strokeWidth={2.5} />
    ) : (
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
    )}
    {active ? 'Active' : 'Inactive'}
  </span>
);

const EmptyState = ({ icon: Icon, title, hint }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200/70 dark:ring-slate-700 flex items-center justify-center mb-3"
    >
      <Icon className="w-5 h-5 text-slate-300 dark:text-slate-600" strokeWidth={1.75} />
    </motion.div>
    <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300">{title}</p>
    {hint && <p className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">{hint}</p>}
  </div>
);

const DataTable = ({ data, columns, onEdit, onDelete, emptyIcon, emptyLabel, emptyHint }) => {
  if (data.length === 0) return <EmptyState icon={emptyIcon} title={emptyLabel} hint={emptyHint} />;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700">
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-3.5 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap"
              >
                <span className="inline-flex items-center gap-1.5">
                  {c.icon && <c.icon className="w-3 h-3 text-slate-400 dark:text-slate-500" strokeWidth={2} />}
                  {c.label}
                </span>
              </th>
            ))}
            <th className="px-3.5 py-2.5 text-center text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
            </th>
            <th className="px-3.5 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {data.map((item, i) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease, delay: Math.min(i, 8) * 0.03 } }}
                exit={{ opacity: 0, x: -12, transition: fast }}
                className="group border-b border-slate-100 dark:border-slate-700/60 last:border-0 hover:bg-indigo-50/40 dark:hover:bg-slate-700/30 transition-colors"
              >
                {columns.map((c) => {
                  const val = c.render ? c.render(item) : item[c.key];
                  return (
                    <td key={c.key} className="px-3.5 py-2.5 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {val || <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                  );
                })}
                <td className="px-3.5 py-2.5 text-center">
                  <StatusPill active={item.isActive !== false} />
                </td>
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.9 }}
                      transition={fast}
                      onClick={() => onEdit(item)}
                      title="Edit"
                      className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.9 }}
                      transition={fast}
                      onClick={() => onDelete(item)}
                      title="Delete"
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

// ==================== GENERIC CRUD PANEL ====================

const buildBlank = (fields) =>
  fields.reduce(
    (acc, f) => ({
      ...acc,
      [f.name]: f.type === 'toggle' ? true : '',
      ...(f.derive ? f.derive('', {}) : {}),
    }),
    {}
  );

const apiErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const CrudPanel = ({
  sections,
  columns,
  items,
  entityId,
  onAdd,
  onUpdate,
  onDelete,
  noun,
  emptyIcon,
  emptyLabel,
  emptyHint,
  extraDefault,
  extraValidate,
  renderExtra,
}) => {
  const fields = useMemo(() => flatten(sections), [sections]);
  const blank = useMemo(() => ({ ...buildBlank(fields), ...extraDefault }), [fields, extraDefault]);
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const setValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field.name]: value, ...(field.derive ? field.derive(value, prev) : {}) }));
    if (errors[field.name]) setErrors((prev) => ({ ...prev, [field.name]: undefined }));
  };

  const clear = () => {
    setForm(blank);
    setErrors({});
    setEditingId(null);
  };

  const handleSave = async () => {
    const found = {};
    fields.forEach((f) => {
      const value = String(form[f.name] ?? '').trim();
      // editOptional fields exist only for create (not part of the update
      // contract) — don't block saving an edit just because a field the
      // backend won't even receive came up blank.
      const isRequired = f.required && !(editingId && f.editOptional);
      if (isRequired && !value) found[f.name] = 'Required';
      else if (value && f.validate) {
        const msg = f.validate(value);
        if (msg) found[f.name] = msg;
      }
    });
    if (extraValidate) Object.assign(found, extraValidate(form) || {});
    if (Object.keys(found).length) {
      setErrors(found);
      toast.error(`Check the highlighted ${noun.toLowerCase()} fields`);
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await onUpdate(editingId, form);
        toast.success(`${noun} updated`);
      } else {
        await onAdd({ ...form, entityId });
        toast.success(`${noun} added`);
      }
      // Only clear the form once the backend has actually accepted the record.
      clear();
    } catch (error) {
      toast.error(apiErrorMessage(error, `Failed to save ${noun.toLowerCase()}`));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm(Object.keys(blank).reduce((acc, k) => ({ ...acc, [k]: item[k] ?? blank[k] }), {}));
    setEditingId(item.id);
    setErrors({});
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(pendingDelete.id);
      if (editingId === pendingDelete.id) clear();
      setPendingDelete(null);
      toast.success(`${noun} deleted`);
    } catch (error) {
      toast.error(apiErrorMessage(error, `Failed to delete ${noun.toLowerCase()}`));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div {...fade} transition={fast} className="pt-5">
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={fast}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
              <Edit2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
              <p className="text-[12.5px] font-medium text-indigo-700 dark:text-indigo-300">
                Editing an existing {noun.toLowerCase()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FormSections sections={sections} form={form} errors={errors} onChange={setValue} />

      {renderExtra && (
        <>
          <hr className="border-slate-100 dark:border-slate-700/60 mb-5" />
          {renderExtra({ form, setForm, errors, setErrors })}
        </>
      )}

      <div className="flex items-center gap-2.5 mb-6">
        <PrimaryButton onClick={handleSave} icon={editingId ? Save : Plus} loading={saving} disabled={saving}>
          {editingId ? `Update ${noun.toLowerCase()}` : `Add ${noun.toLowerCase()}`}
        </PrimaryButton>
        <AnimatePresence>
          {editingId && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={fast}>
              <GhostButton onClick={clear} icon={RotateCcw}>
                Cancel
              </GhostButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DataTable
        data={items}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(item) => setPendingDelete(item)}
        emptyIcon={emptyIcon || Inbox}
        emptyLabel={emptyLabel}
        emptyHint={emptyHint}
      />

      <ConfirmModal
        open={!!pendingDelete}
        title={`Delete ${noun.toLowerCase()}`}
        message={`This ${noun.toLowerCase()} record will be removed from the entity. This can't be undone.`}
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
};

// ==================== SINGLE FORM TAB: ENTITY DETAILS ====================

const ENTITY_IDENTITY_SECTIONS = [
  {
    title: 'Entity Details',
    icon: Building2,
    fields: [
      { name: 'companyLegalName', label: 'Company legal name', icon: Building2, required: true, placeholder: 'e.g. Sun TWS America Inc.' },
      { name: 'companyFormerName', label: 'Company former name', icon: Building, placeholder: 'Previous name, if any' },
      { name: 'country', label: 'Country', type: 'select', icon: Globe2, options: COUNTRIES, required: true },
      { name: 'isActive', label: 'Is active', type: 'toggle' },
    ],
  },
];

const buildAddressSections = (addressTypeOptions) => [
  {
    title: 'Address Info',
    icon: Home,
    fields: [
      { name: 'addressType', label: 'Address type', type: 'select', icon: Tag, options: addressTypeOptions, required: true },
      { name: 'addressLine1', label: 'Address line 1', icon: Home, required: true, placeholder: 'Street, building, unit' },
      { name: 'addressLine2', label: 'Address line 2', icon: Milestone, placeholder: 'Area, landmark (optional)' },
    ],
  },
  {
    title: 'Address Region',
    icon: Globe2,
    fields: [
      { name: 'city', label: 'City', icon: Building, required: true, placeholder: 'e.g. Chennai' },
      { name: 'state', label: 'State', icon: Map, required: true, placeholder: 'e.g. Tamil Nadu' },
      { name: 'postalCode', label: 'Postal code', icon: Mailbox, required: true, placeholder: 'e.g. 600028', maxLength: 12 },
      { name: 'country', label: 'Country', type: 'select', icon: Globe2, options: COUNTRIES, required: true },
    ],
  },
];

// Nested inside CreateGlobalLocation's payload — no country field, unlike the
// entity-level registration contract.
const buildLocationRegistrationSections = (registrationTypeOptions) => [
  {
    title: 'Registration Details',
    icon: FileCheck,
    fields: [
      { name: 'registrationType', label: 'Registration type', type: 'select', icon: Tag, options: registrationTypeOptions, required: true },
      { name: 'registrationNumber', label: 'Registration number', icon: Hash, required: true, placeholder: 'e.g. REG-987654' },
    ],
  },
];

const DIVISION_SECTIONS = [
  {
    title: 'Business Division Info',
    icon: Briefcase,
    fields: [
      { name: 'divisionName', label: 'Division name', icon: Briefcase, required: true, placeholder: 'e.g. Logistics & Supply Chain' },
      { name: 'description', label: 'Description', icon: FileText, placeholder: 'Brief overview of operations' },
    ],
  },
];

const RepeatableSection = ({ sections, items, onAdd, onUpdate, onRemove, renderItem, addLabel, adding, error }) => {
  const { title, icon: Icon, fields } = sections[0];
  const blank = useMemo(() => buildBlank(fields), [fields]);
  const [draft, setDraft] = useState(blank);
  const [draftErrors, setDraftErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  const setValue = (field, value) => {
    setDraft((prev) => ({ ...prev, [field.name]: value }));
    if (draftErrors[field.name]) setDraftErrors((prev) => ({ ...prev, [field.name]: undefined }));
  };

  const clearDraft = () => {
    setDraft(blank);
    setDraftErrors({});
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const found = {};
    fields.forEach((f) => {
      if (f.required && !String(draft[f.name] ?? '').trim()) found[f.name] = 'Required';
    });
    if (Object.keys(found).length) {
      setDraftErrors(found);
      return;
    }
    const result = editingId ? await onUpdate(editingId, draft) : await onAdd(draft);
    if (result !== false) {
      clearDraft();
    }
  };

  const handleEditRow = (item) => {
    setDraft(Object.keys(blank).reduce((acc, k) => ({ ...acc, [k]: item[k] ?? blank[k] }), {}));
    setEditingId(item.id);
    setDraftErrors({});
  };

  return (
    <div>
      <SectionHeader icon={Icon} title={title} />

      {items.length > 0 && (
        <div className="mb-4 space-y-2">
          {items.map((item, i) => (
            <div
              key={item.id ?? i}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30"
            >
              <span className="text-[12.5px] text-slate-600 dark:text-slate-300">{renderItem(item)}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Never offer Edit on a row without a real id — this row hasn't
                    round-tripped through GetEntityDetails yet, and sending an
                    undefined id to the PUT endpoint isn't acceptable. */}
                {onUpdate && item.id != null && (
                  <button
                    type="button"
                    onClick={() => handleEditRow(item)}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onRemove ? (
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  !onUpdate && <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId && (
        <div className="flex items-center gap-2 mb-3 px-3.5 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
          <Edit2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          <p className="text-[12.5px] font-medium text-indigo-700 dark:text-indigo-300">Editing an existing entry</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4">
        {fields.map((f) => (
          <FieldRenderer
            key={f.name}
            field={f}
            value={draft[f.name]}
            error={draftErrors[f.name]}
            options={typeof f.options === 'function' ? f.options(draft) : f.options}
            onChange={(v) => setValue(f, v)}
          />
        ))}
      </div>

      {error && (
        <p className="-mt-2 mb-3 flex items-center gap-1 text-[12px] text-rose-500 dark:text-rose-400">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}

      <div className="flex items-center gap-2.5">
        <GhostButton onClick={handleSubmit} icon={editingId ? Save : Plus} disabled={adding}>
          {adding ? (editingId ? 'Updating…' : 'Adding…') : editingId ? 'Update entry' : addLabel}
        </GhostButton>
        {editingId && (
          <GhostButton onClick={clearDraft} icon={RotateCcw}>
            Cancel
          </GhostButton>
        )}
      </div>
    </div>
  );
};

const EntityDetailsTab = ({
  initialEntity,
  isNew,
  saving,
  saved,
  onSave,
  onDelete,
  addressTypeCodeOptions,
}) => {
  const dispatch = useDispatch();
  const addressSections = useMemo(() => buildAddressSections(addressTypeCodeOptions), [addressTypeCodeOptions]);
  const [form, setForm] = useState(() => {
    const base = { ...initialEntity };
    if (!base.addresses || base.addresses.length === 0) {
      base.addresses = [{ addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', addressType: '' }];
    }
    if (!Array.isArray(base.businessDivisions)) base.businessDivisions = [];
    return base;
  });

  const [errors, setErrors] = useState({});
  const [addingDivision, setAddingDivision] = useState(false);

  // Handlers for top-level entity fields
  const handleEntityChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field.name]: value }));
    if (errors[field.name]) setErrors((prev) => ({ ...prev, [field.name]: undefined }));
  };

  // Handlers for nested address fields
  const handleAddressChange = (field, value) => {
    setForm((prev) => {
      const updated = [...prev.addresses];
      updated[0] = { ...updated[0], [field.name]: value };
      return { ...prev, addresses: updated };
    });
    if (errors[`address_${field.name}`]) {
      setErrors((prev) => ({ ...prev, [`address_${field.name}`]: undefined }));
    }
  };

  // Business division entries: staged locally while creating a new entity, posted
  // immediately via CreateLegalBusinessDivision once the entity already exists.
  // GetEntityDetails/CreateLegalEntity use `divisionName`; only the incremental
  // CreateLegalBusinessDivision endpoint expects `unitName`.
  const addDivision = async (entry) => {
    let created = null;
    if (!isNew) {
      try {
        setAddingDivision(true);
        created = await dispatch(
          createLegalEntityBusinessDivision({
            legalEntityId: initialEntity.id,
            divisionName: entry.divisionName,
            description: entry.description,
            isActive:true,
          })
        );
        try {
          await dispatch(getLegalEntities());
        } catch (refreshErr) {
          console.error('Failed to refresh legal entities after business division creation:', refreshErr);
        }
        toast.success('Business division added');
      } catch (err) {
        toast.error(err?.message || 'Failed to add business division');
        return false;
      } finally {
        setAddingDivision(false);
      }
    }
    // Only editable immediately if the create response carries the new id.
    setForm((prev) => ({
      ...prev,
      businessDivisions: [...prev.businessDivisions, isNew ? entry : { ...entry, id: created?.id }],
    }));
    if (errors.businessDivisions) setErrors((prev) => ({ ...prev, businessDivisions: undefined }));
  };

  const removeDivision = (index) => {
    setForm((prev) => ({ ...prev, businessDivisions: prev.businessDivisions.filter((_, i) => i !== index) }));
  };

  // Only reachable for a persisted division (real `id`), never while isNew.
  const updateDivision = async (id, entry) => {
    try {
      setAddingDivision(true);
      const original = form.businessDivisions.find((d) => d.id === id);
      await dispatch(
        updateLegalEntityBusinessDivision(id, {
          id,
          legalEntityId: initialEntity.id,
          divisionName: entry.divisionName,
          description: entry.description,
          isActive: original?.isActive ?? true,
        })
      );
      setForm((prev) => ({
        ...prev,
        businessDivisions: prev.businessDivisions.map((d) => (d.id === id ? { ...d, ...entry } : d)),
      }));
      dispatch(getLegalEntities()).catch((refreshErr) => {
        console.error('Failed to refresh legal entities after business division update:', refreshErr);
      });
      toast.success('Business division updated');
    } catch (err) {
      toast.error(err?.message || 'Failed to update business division');
      return false;
    } finally {
      setAddingDivision(false);
    }
  };

  // Single Save Handler
  const handleSave = () => {
    const found = {};

    // Validate entity section
    flatten(ENTITY_IDENTITY_SECTIONS).forEach((f) => {
      if (f.required && !String(form[f.name] ?? '').trim()) {
        found[f.name] = `${f.label} is required`;
      }
    });

    // Validate address section
    flatten(addressSections).forEach((f) => {
      if (f.required && !String(form.addresses[0]?.[f.name] ?? '').trim()) {
        found[`address_${f.name}`] = `${f.label} is required`;
      }
    });

    // Validate division section
    if (!form.businessDivisions.length) {
      found.businessDivisions = 'Add at least one business division';
    }

    if (Object.keys(found).length) {
      setErrors(found);
      toast.error('Please check highlighted required fields');
      return;
    }

    // form.businessDivisions already use `divisionName`, matching CreateLegalEntity.
    onSave(form);
  };

  // Helper error mapper for nested fields
  const getNestedErrors = (prefix) => {
    return Object.keys(errors)
      .filter((k) => k.startsWith(prefix))
      .reduce((acc, k) => ({ ...acc, [k.replace(prefix, '')]: errors[k] }), {});
  };

  return (
    <motion.div {...fade} transition={fast} className="pt-5 space-y-8">
      {/* 1. Entity Details Section */}
      <FormSections
        sections={ENTITY_IDENTITY_SECTIONS}
        form={form}
        errors={errors}
        onChange={handleEntityChange}
      />

      <hr className="border-slate-100 dark:border-slate-700/60" />

      {/* 2. Address Details Section */}
      <FormSections
        sections={addressSections}
        form={form.addresses[0] || {}}
        errors={getNestedErrors('address_')}
        onChange={handleAddressChange}
      />

      {/* 3. Business Division Details Section */}
      <RepeatableSection
        sections={DIVISION_SECTIONS}
        items={form.businessDivisions}
        onAdd={addDivision}
        onUpdate={isNew ? undefined : updateDivision}
        onRemove={isNew ? removeDivision : undefined}
        renderItem={(d) => `${d.divisionName || '—'}${d.description ? ' — ' + d.description : ''}`}
        addLabel={isNew ? 'Add division' : 'Add another division'}
        adding={addingDivision}
        error={errors.businessDivisions}
      />

      {/* Single Form Save Action */}
      <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-700">
        <PrimaryButton onClick={handleSave} loading={saving} success={saved} disabled={saving} icon={Save}>
          {saving ? 'Saving…' : saved ? 'Saved' : isNew ? 'Create Entity' : 'Update Entity'}
        </PrimaryButton>
        <GhostButton
          onClick={() => {
            setForm({
              ...initialEntity,
              addresses: [{ addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', addressType: '' }],
              businessDivisions: isNew ? [] : initialEntity.businessDivisions || [],
            });
            setErrors({});
            toast.success('Form reset');
          }}
          icon={RotateCcw}
        >
          Reset
        </GhostButton>
        {!isNew && (
          <motion.button
            onClick={onDelete}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={fast}
            className="h-10 px-4 ml-auto rounded-lg text-[13px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete entity
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ==================== OTHER PANELS ====================

const LocationPanel = ({
  entityId,
  items,
  onAdd,
  onUpdate,
  addressTypeIdOptions,
  addressTypes,
  locationTypeOptions,
  primaryFunctionOptions,
  locationCategoryOptions,
  registrationTypeOptions,
  ...props
}) => {
  const displayItems = useMemo(
    () => items.map((item) => toLocationDisplayItem(item, addressTypes)),
    [items, addressTypes]
  );

  const registrationSections = useMemo(
    () => buildLocationRegistrationSections(registrationTypeOptions),
    [registrationTypeOptions]
  );

  const handleAdd = (form) => onAdd?.(mapLocationPayload(form, entityId, addressTypes));
  const handleUpdate = (id, form) => {
    const original = items.find((l) => l.id === id);
    return onUpdate?.(id, mapLocationUpdatePayload(form, original, addressTypes));
  };

  return (
    <CrudPanel
      noun="Location"
      emptyIcon={Boxes}
      emptyLabel="No locations yet"
      emptyHint="Add the sites this entity operates from."
      sections={[
        {
          title: 'Identification',
          icon: Boxes,
          fields: [
            { name: 'locationCode', label: 'Location code', icon: Hash, required: true, placeholder: 'e.g. LOC-CHN', maxLength: 20 },
            { name: 'locationName', label: 'Location name', icon: MapPin, required: true, placeholder: 'e.g. Chennai Plant' },
            { name: 'locationType', label: 'Location type', type: 'select', icon: LayoutGrid, options: locationTypeOptions, required: true },
            { name: 'locationFunction', label: 'Location function', type: 'select', icon: Navigation, options: primaryFunctionOptions, placeholder: 'e.g. Manufacturing' },
            { name: 'operationalCategory', label: 'Operational category', type: 'select', icon: Layers, options: locationCategoryOptions, placeholder: 'e.g. Production' },
          ],
        },
        {
          title: 'Address',
          icon: Home,
          fields: [
            { name: 'addressTypeID', label: 'Address type', type: 'select', icon: Tag, required: true, options: addressTypeIdOptions },
            { name: 'locAddressLine1', label: 'Address line 1', icon: Home, required: true, placeholder: 'Street, building, unit' },
            { name: 'locAddressLine2', label: 'Address line 2', icon: Milestone, placeholder: 'Area, landmark (optional)' },
            { name: 'locCity', label: 'City', icon: Building, required: true, placeholder: 'e.g. Chennai' },
            { name: 'locState', label: 'State', icon: Map, required: true, placeholder: 'e.g. Tamil Nadu' },
            { name: 'locPostalCode', label: 'Postal code', icon: Mailbox, required: true, placeholder: 'e.g. 600028', maxLength: 10 },
            { name: 'locCountry', label: 'Country', type: 'select', icon: Globe2, required: true, options: COUNTRIES },
          ],
        },
        {
          title: 'Geo & Region',
          icon: Navigation,
          fields: [
            { name: 'countryCode', label: 'Country code', icon: Globe2, placeholder: 'e.g. IN', maxLength: 5 },
            { name: 'regionCode', label: 'Region code', icon: Map, placeholder: 'e.g. TN', maxLength: 10 },
            { name: 'timeZone', label: 'Time zone', icon: Navigation, placeholder: 'e.g. Asia/Kolkata' },
            { name: 'latitude', label: 'Latitude', icon: MapPin, placeholder: 'e.g. 13.1143' },
            { name: 'longitude', label: 'Longitude', icon: MapPin, placeholder: 'e.g. 80.1548' },
          ],
        },
      ]}
      columns={[
        { key: 'locCode', label: 'Loc code', icon: Hash },
        { key: 'locationName', label: 'Location name', icon: MapPin },
        { key: 'locationType', label: 'Type', icon: LayoutGrid },
        { key: 'locationFunction', label: 'Function', icon: Navigation },
        { key: 'operationalCategory', label: 'Category', icon: Layers },
        {
          key: 'registation',
          label: 'Registrations',
          icon: FileCheck,
          render: (item) => (item.registation?.length ? `${item.registation.length} reg(s)` : ''),
        },
      ]}
      items={displayItems}
      entityId={entityId}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      extraDefault={{ registation: [] }}
      extraValidate={(form) =>
        (form.registation || []).length
          ? null
          : { registation: 'Add at least one registration for this location' }
      }
      renderExtra={({ form, setForm, errors, setErrors }) => (
        <RepeatableSection
          sections={registrationSections}
          items={form.registation || []}
          onAdd={(entry) => {
            setForm((prev) => ({ ...prev, registation: [...(prev.registation || []), entry] }));
            if (errors.registation) setErrors((prev) => ({ ...prev, registation: undefined }));
          }}
          onRemove={(index) =>
            setForm((prev) => ({ ...prev, registation: prev.registation.filter((_, i) => i !== index) }))
          }
          renderItem={(r) => `${r.registrationType || '—'}: ${r.registrationNumber || '—'}`}
          addLabel="Add registration"
          adding={false}
          error={errors.registation}
        />
      )}
      {...props}
    />
  );
};

const getCurrentUserName = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.username || user.userName || 'admin';
  } catch {
    return 'admin';
  }
};

// Best-effort reverse lookup: GET records carry `addressType` as a free-text
// code/label, not the numeric addressTypeID the forms select from. Used only
// to pre-fill the edit form — never required, since the FK isn't part of any
// update contract.
const findAddressTypeId = (addressTypes, codeOrLabel) => {
  if (!codeOrLabel) return '';
  const match = addressTypes.find(
    (a) => a.addressTypeCode?.toLowerCase() === String(codeOrLabel).toLowerCase()
  );
  return match ? String(match.addressTypeID) : '';
};

const mapLocationPayload = (form, entityId, addressTypes = []) => {
  // locAddressType duplicates addressTypeID in the contract — derive it from the
  // same selection instead of asking the user to pick an address type twice.
  const matchedAddressType = addressTypes.find(
    (a) => String(a.addressTypeID) === String(form.addressTypeID)
  );

  return {
    legalEntityID: Number(entityId || 0),
    locationCode: String(form.locationCode ?? '').trim(),
    locationName: String(form.locationName ?? '').trim(),
    locationType: String(form.locationType ?? '').trim(),
    locationFunction: String(form.locationFunction ?? '').trim(),
    operationalCategory: String(form.operationalCategory ?? '').trim(),
    addressTypeID: Number(form.addressTypeID ?? 0),
    locAddressLine1: String(form.locAddressLine1 ?? '').trim(),
    locAddressLine2: String(form.locAddressLine2 ?? '').trim(),
    locCity: String(form.locCity ?? '').trim(),
    locState: String(form.locState ?? '').trim(),
    locPostalCode: String(form.locPostalCode ?? '').trim(),
    locCountry: String(form.locCountry ?? '').trim(),
    locAddressType: matchedAddressType?.addressTypeCode ?? '',
    countryCode: String(form.countryCode ?? '').trim(),
    regionCode: String(form.regionCode ?? '').trim(),
    timeZone: String(form.timeZone ?? '').trim(),
    latitude: Number(form.latitude ?? 0),
    longitude: Number(form.longitude ?? 0),
    createdBy: String(form.createdBy ?? getCurrentUserName()),
    registation: (form.registation || []).map((r) => ({
      registrationType: String(r.registrationType ?? '').trim(),
      registrationNumber: String(r.registrationNumber ?? '').trim(),
    })),
  };
};

// UpdateGlobalLocation's contract only accepts these identification fields —
// no address/geo fields, unlike CreateGlobalLocation.
const mapLocationUpdatePayload = (form, originalItem, addressTypes = []) => {
  // Same as create: locAddressType duplicates addressTypeID, derive it from
  // the same selection instead of asking the user to pick it twice.
  const matchedAddressType = addressTypes.find(
    (a) => String(a.addressTypeID) === String(form.addressTypeID)
  );

  return {
    global_Location_ID: Number(originalItem?.id ?? 0),
    legalEntityId: Number(originalItem?.entityId ?? 0),
    location_Code: String(form.locationCode ?? '').trim(),
    location_Name: String(form.locationName ?? '').trim(),
    location_Type: String(form.locationType ?? '').trim(),
    locationFunction: String(form.locationFunction ?? '').trim(),
    operationalCategory: String(form.operationalCategory ?? '').trim(),
    active_Flag: originalItem?.isActive ?? true,
    locAddressLine1: String(form.locAddressLine1 ?? '').trim(),
    locAddressLine2: String(form.locAddressLine2 ?? '').trim(),
    locCity: String(form.locCity ?? '').trim(),
    locState: String(form.locState ?? '').trim(),
    locPostalCode: String(form.locPostalCode ?? '').trim(),
    locCountry: String(form.locCountry ?? '').trim(),
    locAddressType: matchedAddressType?.addressTypeCode ?? '',
    countryCode: String(form.countryCode ?? '').trim(),
    regionCode: String(form.regionCode ?? '').trim(),
    timeZone: String(form.timeZone ?? '').trim(),
    latitude: Number(form.latitude ?? 0),
    longitude: Number(form.longitude ?? 0),
  };
};

// GetEntityDetails returns location address fields unprefixed
// (addressLine1/city/state/...), but the create form's fields are prefixed
// (locAddressLine1/locCity/...) — alias them so the table and the edit-prefill
// both show the entity's real data instead of coming up blank.
const toLocationDisplayItem = (item, addressTypes) => ({
  ...item,
  locationCode: item.locationCode ?? item.locCode ?? '',
  locAddressLine1: item.locAddressLine1 ?? item.addressLine1 ?? '',
  locAddressLine2: item.locAddressLine2 ?? item.addressLine2 ?? '',
  locCity: item.locCity ?? item.city ?? '',
  locState: item.locState ?? item.state ?? '',
  locPostalCode: item.locPostalCode ?? item.postalCode ?? '',
  locCountry: item.locCountry ?? item.country ?? '',
  addressTypeID: item.addressTypeID ?? findAddressTypeId(addressTypes, item.addressType) ?? '',
  registation: item.registation ?? item.registrations ?? [],
});

const mapWarehousePayload = (form, entityId) => {
  return {
    legalEntityID: Number(entityId || form.legalEntityID || 0),
    warehouseCode: String(form.warehouseCode ?? '').trim(),
    warehouseName: String(form.warehouseName ?? '').trim(),
    // CreateWarehouse's contract calls this locationID (not factoryID) — the
    // internal form field stays `factoryID` since that's the Location dropdown's name.
    locationID: Number(form.factoryID ?? form.locationId ?? 0),
    warehouseType: String(form.warehouseType ?? '').trim(),
    capacity: Number(form.capacity ?? 0),
    unit: String(form.unit ?? '').trim(),
    inchargeName: String(form.inchargeName ?? '').trim(),
    contactNo: String(form.contactNo ?? '').trim(),
    isMainWarehouse: Boolean(form.isMainWarehouse ?? false),
    addressTypeID: Number(form.addressTypeID ?? 0),
    wareHouseAddressLine1: String(form.wareHouseAddressLine1 ?? form.addressLine1 ?? '').trim(),
    wareHouseAddressLine2: String(form.wareHouseAddressLine2 ?? form.addressLine2 ?? '').trim(),
    wareCity: String(form.wareCity ?? form.city ?? '').trim(),
    wareState: String(form.wareState ?? form.state ?? '').trim(),
    warePostalCode: String(form.warePostalCode ?? form.zipcode ?? '').trim(),
    wareCountry: String(form.wareCountry ?? form.country ?? '').trim(),
    createdBy: String(form.createdBy ?? getCurrentUserName()),
  };
};

// UpdateWarehouse's contract drops addressTypeID and swaps factoryID for a
// numeric locationID, but otherwise mirrors create — the selected location's
// id (already resolved into form.factoryID) is submitted directly, no lookup
// needed for the payload itself.
const mapWarehouseUpdatePayload = (form, originalItem) => ({
  warehouseID: Number(originalItem?.id ?? 0),
  legalEntityID: Number(originalItem?.entityId ?? 0),
  locationID: Number(form.factoryID || 0),
  warehouseCode: String(form.warehouseCode ?? '').trim(),
  warehouseName: String(form.warehouseName ?? '').trim(),
  warehouseType: String(form.warehouseType ?? '').trim(),
  capacity: Number(form.capacity ?? 0),
  unit: String(form.unit ?? '').trim(),
  inchargeName: String(form.inchargeName ?? '').trim(),
  contactNo: String(form.contactNo ?? '').trim(),
  isMainWarehouse: Boolean(form.isMainWarehouse ?? false),
  wareHouseAddressLine1: String(form.wareHouseAddressLine1 ?? '').trim(),
  wareHouseAddressLine2: String(form.wareHouseAddressLine2 ?? '').trim(),
  wareCity: String(form.wareCity ?? '').trim(),
  wareState: String(form.wareState ?? '').trim(),
  warePostalCode: String(form.warePostalCode ?? '').trim(),
  wareCountry: String(form.wareCountry ?? '').trim(),
  isActive: originalItem?.isActive ?? true,
  modifiedBy: String(form.modifiedBy ?? getCurrentUserName()),
});

// GetEntityDetails returns warehouse address fields unprefixed
// (addressLine1/city/state/...) and only sometimes carries `warehouseType`
// (falls back to `warehouseTypeID`) — alias/derive for the table + edit-prefill.
const toWarehouseDisplayItem = (item, locations, warehouseTypes, addressTypes) => {
  // GetEntityDetails now returns a real numeric locationID on warehouse
  // records — prefer that over matching the often-null locCode string.
  const matchedLocation =
    (item.locationID != null && locations.find((l) => String(l.id) === String(item.locationID))) ||
    (item.locCode && locations.find((l) => l.locCode === item.locCode)) ||
    null;

  return {
    ...item,
    wareHouseAddressLine1: item.wareHouseAddressLine1 ?? item.addressLine1 ?? '',
    wareHouseAddressLine2: item.wareHouseAddressLine2 ?? item.addressLine2 ?? '',
    wareCity: item.wareCity ?? item.city ?? '',
    wareState: item.wareState ?? item.state ?? '',
    warePostalCode: item.warePostalCode ?? item.postalCode ?? '',
    wareCountry: item.wareCountry ?? item.country ?? '',
    factoryID: item.factoryID ?? matchedLocation?.id ?? item.locationID ?? '',
    warehouseType:
      item.warehouseType ||
      warehouseTypes.find((w) => w.warehouseTypeID === item.warehouseTypeID)?.warehouseTypeName ||
      '',
    addressTypeID: item.addressTypeID ?? findAddressTypeId(addressTypes, item.addressType) ?? '',
    locationLabel: matchedLocation
      ? `${matchedLocation.locCode} — ${matchedLocation.locationName}`
      : item.locCode || (item.locationID != null ? String(item.locationID) : ''),
  };
};

const WarehousePanel = ({
  locations,
  entityId,
  items,
  onAdd,
  onUpdate,
  onDelete,
  addressTypeOptions,
  addressTypes,
  warehouseTypeOptions,
  warehouseTypes,
  ...props
}) => {
  const displayItems = useMemo(
    () => items.map((item) => toWarehouseDisplayItem(item, locations, warehouseTypes, addressTypes)),
    [items, locations, warehouseTypes, addressTypes]
  );

  const handleAdd = (form) => {
    const payload = mapWarehousePayload(form, entityId);
    return onAdd?.(payload);
  };

  const handleUpdate = (id, form) => {
    const original = items.find((w) => w.id === id);
    const payload = mapWarehouseUpdatePayload(form, original);
    return onUpdate?.(id, payload);
  };

  return (
    <CrudPanel
      noun="Warehouse"
      emptyIcon={Warehouse}
      emptyLabel="No warehouses yet"
      emptyHint="Add the storage points operating under this entity."
      sections={[
        {
          title: 'Identification',
          icon: Warehouse,
          fields: [
            {
              name: 'factoryID',
              label: 'Location',
              type: 'select',
              icon: Boxes,
              placeholder: 'No location (optional)',
              options: locations.map((l) => ({ value: String(l.id), label: `${l.locCode} — ${l.locationName}` })),
            },
            { name: 'warehouseCode', label: 'Warehouse code', icon: ScanLine, required: true, placeholder: 'e.g. WH-CHN-01', maxLength: 20 },
            { name: 'warehouseName', label: 'Warehouse name', icon: Warehouse, required: true, placeholder: 'e.g. Chennai Main Store' },
            { name: 'warehouseType', label: 'Warehouse type', type: 'select', icon: Tag, options: warehouseTypeOptions, required: true },
            { name: 'inchargeName', label: 'Incharge name', icon: User, required: true, placeholder: 'e.g. R. Kumar' },
          ],
        },
        {
          title: 'Capacity & contact',
          icon: Gauge,
          fields: [
            {
              name: 'capacity',
              label: 'Capacity',
              icon: Gauge,
              required: true,
              placeholder: 'e.g. 25000',
              maxLength: 10,
              validate: (v) => (/^\d+(\.\d{1,2})?$/.test(v) ? '' : 'Enter a valid number'),
            },
            { name: 'unit', label: 'Unit', type: 'select', icon: Ruler, options: CAPACITY_UNITS, required: true },
            {
              name: 'contactNo',
              label: 'Contact no',
              icon: Phone,
              required: true,
              placeholder: 'e.g. 9840012345',
              maxLength: 15,
              validate: (v) => (/^[0-9+\-\s]{6,15}$/.test(v) ? '' : 'Enter a valid contact number'),
            },
            { name: 'isMainWarehouse', label: 'Main warehouse', type: 'toggle' },
          ],
        },
        {
          title: 'Address',
          icon: Globe2,
          fields: [
            // Still not part of UpdateWarehouse's contract — required only when creating.
            {
              name: 'addressTypeID',
              label: 'Address type',
              type: 'select',
              icon: Tag,
              required: true,
              editOptional: true,
              options: addressTypeOptions,
            },
            { name: 'wareHouseAddressLine1', label: 'Address line 1', icon: Home, required: true, placeholder: 'Street, building, unit' },
            { name: 'wareHouseAddressLine2', label: 'Address line 2', icon: Milestone, placeholder: 'Area, landmark (optional)' },
            { name: 'wareCity', label: 'City', icon: Building, required: true, placeholder: 'e.g. Chennai' },
            { name: 'wareState', label: 'State', icon: Map, required: true, placeholder: 'e.g. Tamil Nadu' },
            { name: 'warePostalCode', label: 'Postal code', icon: Mailbox, required: true, placeholder: 'e.g. 600028', maxLength: 10 },
            {
              name: 'wareCountry',
              label: 'Country',
              type: 'select',
              icon: Globe2,
              required: true,
              options: COUNTRIES,
            },
          ],
        },
      ]}
      items={displayItems}
      columns={[
        { key: 'warehouseCode', label: 'Code', icon: ScanLine },
        { key: 'warehouseName', label: 'Warehouse name', icon: Warehouse },
        { key: 'locationLabel', label: 'Location', icon: Boxes },
        { key: 'warehouseType', label: 'Type', icon: Tag },
        { key: 'capacity', label: 'Capacity', icon: Gauge, render: (item) => `${item.capacity} ${item.unit}` },
        { key: 'inchargeName', label: 'Incharge', icon: User },
        { key: 'contactNo', label: 'Contact no', icon: Phone },
        { key: 'addressType', label: 'Address type', icon: Tag },
        { key: 'wareCity', label: 'City', icon: Building },
        { key: 'wareState', label: 'State', icon: Map },
        { key: 'wareCountry', label: 'Country', icon: Globe2 },
        { key: 'warePostalCode', label: 'Postal code', icon: Mailbox },
      ]}
      entityId={entityId}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={onDelete}
      {...props}
    />
  );
};

const mapBankPayload = (form, entityId) => ({
  legalEntityID: Number(entityId || 0),

  bankName: String(form.bankName ?? '').trim(),
  branchName: String(form.branchName ?? '').trim(),
  floor: String(form.floor ?? '').trim(),
  street: String(form.street ?? '').trim(),
  area: String(form.area ?? '').trim(),

  accountNumber: String(form.accountNumber ?? '').trim(),
  swiftCode: String(form.swiftCode ?? '').trim(),
  purpose: String(form.purpose ?? '').trim(),

  addressTypeID: Number(form.addressTypeID ?? 0),

  bankAddressLine1: String(form.bankAddressLine1 ?? '').trim(),
  bankAddressLine2: String(form.bankAddressLine2 ?? '').trim(),
  bankCity: String(form.bankCity ?? '').trim(),
  bankState: String(form.bankState ?? '').trim(),
  bankPostalCode: String(form.bankPostalCode ?? '').trim(),
  bankCountry: String(form.bankCountry ?? '').trim(),
});

// UpdateBankDetails' contract matches the create fields (minus addressTypeID,
// which isn't on it) and adds bankDetailsID + isActive.
const mapBankUpdatePayload = (form, originalItem, entityId) => ({
  bankDetailsID: Number(originalItem?.id ?? 0),
  legalEntityID: Number(originalItem?.entityId ?? entityId ?? 0),
  bankName: String(form.bankName ?? '').trim(),
  branchName: String(form.branchName ?? '').trim(),
  floor: String(form.floor ?? '').trim(),
  street: String(form.street ?? '').trim(),
  area: String(form.area ?? '').trim(),
  accountNumber: String(form.accountNumber ?? '').trim(),
  swiftCode: String(form.swiftCode ?? '').trim(),
  purpose: String(form.purpose ?? '').trim(),
  bankAddressLine1: String(form.bankAddressLine1 ?? '').trim(),
  bankAddressLine2: String(form.bankAddressLine2 ?? '').trim(),
  bankCity: String(form.bankCity ?? '').trim(),
  bankState: String(form.bankState ?? '').trim(),
  bankPostalCode: String(form.bankPostalCode ?? '').trim(),
  bankCountry: String(form.bankCountry ?? '').trim(),
  isActive: originalItem?.isActive ?? true,
});

// GetEntityDetails returns bank address fields unprefixed (addressLine1/city/
// state/...), but the create form's fields are prefixed (bankAddressLine1/
// bankCity/...) — alias them so the table and the edit-prefill both show the
// bank's real address instead of coming up blank.
const toBankDisplayItem = (item) => ({
  ...item,
  bankAddressLine1: item.bankAddressLine1 ?? item.addressLine1 ?? '',
  bankAddressLine2: item.bankAddressLine2 ?? item.addressLine2 ?? '',
  bankCity: item.bankCity ?? item.city ?? '',
  bankState: item.bankState ?? item.state ?? '',
  bankPostalCode: item.bankPostalCode ?? item.postalCode ?? '',
  bankCountry: item.bankCountry ?? item.country ?? '',
});

const BankPanel = ({ entityId, items, onAdd, onUpdate, addressTypeOptions, ...props }) => {
  const displayItems = useMemo(() => items.map((item) => toBankDisplayItem(item)), [items]);

  const handleAdd = (form) => onAdd?.(mapBankPayload(form, entityId));
  const handleUpdate = (id, form) => {
    const original = items.find((b) => b.id === id);
    return onUpdate?.(id, mapBankUpdatePayload(form, original, entityId));
  };

  return (
    <CrudPanel
      noun="Bank account"
      emptyIcon={Landmark}
      emptyLabel="No bank accounts yet"
      emptyHint="Add the accounts used for settlements."
      sections={[
        {
          title: 'Bank',
          icon: Landmark,
          fields: [
            { name: 'bankName', label: 'Bank name', icon: Landmark, required: true, placeholder: 'e.g. HDFC Bank' },
            { name: 'branchName', label: 'Branch name', icon: Building, required: true, placeholder: 'e.g. Guindy' },
            { name: 'floor', label: 'Floor', icon: LayoutGrid, placeholder: 'e.g. 2nd Floor' },
            { name: 'street', label: 'Street', icon: Milestone, placeholder: 'e.g. Usman Road' },
            { name: 'area', label: 'Area', icon: MapPin, placeholder: 'e.g. T Nagar' },
          ],
        },
        {
          title: 'Account',
          icon: CreditCard,
          fields: [
            { name: 'accountNumber', label: 'Account number', icon: CreditCard, required: true, placeholder: 'e.g. 50100234567890', maxLength: 34 },
            { name: 'swiftCode', label: 'SWIFT code', icon: Hash, placeholder: 'e.g. KKBKINBBXXX', maxLength: 11 },
            { name: 'purpose', label: 'Purpose', icon: FileText, placeholder: 'e.g. Business Operations and Vendor Payments' },
          ],
        },
        {
          title: 'Bank Address',
          icon: Home,
          fields: [
            // Still not part of UpdateBankDetails' contract — required only when creating.
            {
              name: 'addressTypeID',
              label: 'Address type',
              type: 'select',
              icon: Tag,
              required: true,
              editOptional: true,
              options: addressTypeOptions,
            },
            { name: 'bankAddressLine1', label: 'Address line 1', icon: Home, required: true, placeholder: 'Street, building, unit' },
            { name: 'bankAddressLine2', label: 'Address line 2', icon: Milestone, placeholder: 'Area, landmark (optional)' },
            { name: 'bankCity', label: 'City', icon: Building, required: true, placeholder: 'e.g. Chennai' },
            { name: 'bankState', label: 'State', icon: Map, required: true, placeholder: 'e.g. Tamil Nadu' },
            { name: 'bankPostalCode', label: 'Postal code', icon: Mailbox, required: true, placeholder: 'e.g. 600028', maxLength: 10 },
            { name: 'bankCountry', label: 'Country', type: 'select', icon: Globe2, required: true, options: COUNTRIES },
          ],
        },
      ]}
      items={displayItems}
      columns={[
        { key: 'bankName', label: 'Bank', icon: Landmark },
        { key: 'branchName', label: 'Branch', icon: Building },
        { key: 'accountNumber', label: 'Account number', icon: CreditCard },
        { key: 'swiftCode', label: 'SWIFT', icon: Hash },
        { key: 'bankCity', label: 'City', icon: Building },
        { key: 'purpose', label: 'Purpose', icon: FileText },
      ]}
      entityId={entityId}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      {...props}
    />
  );
};

const EntityListItem = ({ entity, active, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ x: 2 }}
    whileTap={{ scale: 0.99 }}
    transition={fast}
    className={`w-full text-left px-3.5 py-3 rounded-xl border transition-colors ${
      active
        ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50'
        : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-200 dark:hover:border-slate-700'
    }`}
  >
    <div className="flex items-center gap-2.5">
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          active ? 'bg-[var(--primary)] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
        }`}
      >
        <Building2 className="w-3.5 h-3.5" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-[13px] font-semibold truncate ${
              active ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {entity.companyLegalName || 'Unnamed Entity'}
          </p>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${entity.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
        </div>
        <p className="mt-0.5 text-[11.5px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
          <Globe2 className="w-2.5 h-2.5" />
          {entity.country || 'N/A'}
        </p>
      </div>
    </div>
  </motion.button>
);

// ==================== MAIN COMPONENT ====================

const BLANK_ENTITY = {
  companyLegalName: '',
  companyFormerName: '',
  country: '',
  isActive: true,
  addresses: [{ addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', addressType: '' }],
  businessDivisions: [],
};

const LegalEntityMaster = () => {
  const dispatch = useDispatch();
  const reduxEntities = useSelector((state) => state.legalEntity?.entities || []);
  const reduxAddressTypes = useSelector((state) => state.legalEntity?.addressTypes || []);
  const reduxWarehouseTypes = useSelector((state) => state.legalEntity?.warehouseTypes || []);
  const reduxRegistrationTypes = useSelector((state) => state.legalEntity?.registrationTypes || []);
  const reduxLocationTypes = useSelector((state) => state.legalEntity?.locationTypes || []);
  const reduxPrimaryFunctions = useSelector((state) => state.legalEntity?.primaryFunctions || []);
  const reduxLocationCategories = useSelector((state) => state.legalEntity?.locationCategories || []);
  const reduxLocations = useSelector((state) => state.legalEntity?.locations || []);
  const reduxWarehouses = useSelector((state) => state.legalEntity?.warehouses || []);
  const reduxBanks = useSelector((state) => state.legalEntity?.banks || []);
  const addressTypeIdOptions = useMemo(() => buildAddressTypeIdOptions(reduxAddressTypes), [reduxAddressTypes]);
  const addressTypeCodeOptions = useMemo(() => buildAddressTypeCodeOptions(reduxAddressTypes), [reduxAddressTypes]);
  const warehouseTypeOptions = useMemo(() => buildWarehouseTypeOptions(reduxWarehouseTypes), [reduxWarehouseTypes]);
  const registrationTypeOptions = useMemo(
    () => buildRegistrationTypeOptions(reduxRegistrationTypes),
    [reduxRegistrationTypes]
  );
  const locationTypeOptions = useMemo(() => buildLocationTypeOptions(reduxLocationTypes), [reduxLocationTypes]);
  const primaryFunctionOptions = useMemo(
    () => buildPrimaryFunctionOptions(reduxPrimaryFunctions),
    [reduxPrimaryFunctions]
  );
  const locationCategoryOptions = useMemo(
    () => buildLocationCategoryOptions(reduxLocationCategories),
    [reduxLocationCategories]
  );

  const [entities, setEntities] = useState([]);

  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [activeTab, setActiveTab] = useState('entity_details');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDeleteEntity, setConfirmDeleteEntity] = useState(false);

  // Fetch legal entities and type master data (address/warehouse/registration types) on mount
  useEffect(() => {
    dispatch(getLegalEntities()).catch((err) => {
      toast.error(err?.message || 'Failed to load legal entities');
    });
    dispatch(getTypeMasterData()).catch((err) => {
      toast.error(err?.message || 'Failed to load type master data');
    });
  }, [dispatch]);

  // Sync Redux entities with local state
  useEffect(() => {
    setEntities(reduxEntities);
  }, [reduxEntities]);

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || null;

  const filteredEntities = useMemo(
    () =>
      entities.filter((e) =>
        `${e.companyLegalName} ${e.country}`.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [entities, search]
  );

  const entityLocations =
    selectedEntityId == null
      ? []
      : reduxLocations.filter((l) => Number(l.entityId) === Number(selectedEntityId));

  const entityWarehouses =
    selectedEntityId == null
      ? []
      : reduxWarehouses.filter((w) => Number(w.entityId) === Number(selectedEntityId));
  const entityBanks =
    selectedEntityId == null ? [] : reduxBanks.filter((b) => Number(b.entityId) === Number(selectedEntityId));

  // Location: persisted via CreateGlobalLocation/UpdateGlobalLocation.
  const handleLocationAdd = async (payload) => {
    await dispatch(createLegalEntityLocation(payload));
    try {
      await dispatch(getLegalEntities());
    } catch (refreshErr) {
      console.error('Failed to refresh legal entities after location creation:', refreshErr);
    }
  };

  const handleLocationUpdate = async (id, payload) => {
    await dispatch(updateLegalEntityLocation(id, payload));
    try {
      await dispatch(getLegalEntities());
    } catch (refreshErr) {
      console.error('Failed to refresh legal entities after location update:', refreshErr);
    }
  };

  const locationCrud = {
    onAdd: handleLocationAdd,
    onUpdate: handleLocationUpdate,
    onDelete: () => Promise.reject(new Error('Deleting a location is not supported by the API yet.')),
  };

  // Warehouse: persisted via CreateWarehouse/UpdateWarehouse.
  const handleWarehouseAdd = async (payload) => {
    await dispatch(createLegalEntityWarehouse(payload));
    try {
      await dispatch(getLegalEntities());
    } catch (refreshErr) {
      console.error('Failed to refresh legal entities after warehouse creation:', refreshErr);
    }
  };

  const handleWarehouseUpdate = async (id, payload) => {
    await dispatch(updateLegalEntityWarehouse(id, payload));
    try {
      await dispatch(getLegalEntities());
    } catch (refreshErr) {
      console.error('Failed to refresh legal entities after warehouse update:', refreshErr);
    }
  };

  const warehouseCrud = {
    onAdd: handleWarehouseAdd,
    onUpdate: handleWarehouseUpdate,
    onDelete: () => Promise.reject(new Error('Deleting a warehouse is not supported by the API yet.')),
  };

  // Bank: persisted via CreateBankDetails/UpdateBankDetails.
  const handleBankAdd = async (payload) => {
    await dispatch(createLegalEntityBank(payload));
    try {
      await dispatch(getLegalEntities());
    } catch (refreshErr) {
      console.error('Failed to refresh legal entities after bank creation:', refreshErr);
    }
  };

  const handleBankUpdate = async (id, payload) => {
    await dispatch(updateLegalEntityBank(id, payload));
    try {
      await dispatch(getLegalEntities());
    } catch (refreshErr) {
      console.error('Failed to refresh legal entities after bank update:', refreshErr);
    }
  };

  const bankCrud = {
    onAdd: handleBankAdd,
    onUpdate: handleBankUpdate,
    onDelete: () => Promise.reject(new Error('Deleting a bank account is not supported by the API yet.')),
  };

  // const handleSaveEntity = (form) => {
  //   setSaving(true);
  //   setTimeout(() => {
  //     if (selectedEntityId) {
  //       setEntities((prev) => prev.map((e) => (e.id === selectedEntityId ? { ...e, ...form } : e)));
  //       toast.success('Entity updated');
  //     } else {
  //       const id = Date.now();
  //       setEntities((prev) => [...prev, { ...form, id }]);
  //       setSelectedEntityId(id);
  //       toast.success('Entity created');
  //     }
  //     setSaving(false);
  //     setSaved(true);
  //     setTimeout(() => setSaved(false), 1400);
  //   }, 400);
  // };
  const handleSaveEntity = (formPayload) => {
    setSaving(true);
    setSaved(false);

    if (selectedEntityId) {
      // Updating an existing entity: UpdateLegalEntity + UpdateAddress (when a
      // real address record id exists) fire together, then a single refresh —
      // mirrors the create flow's own "POST then refresh" pattern below.
      const entityPayload = {
        companyID: selectedEntityId,
        companyLegalName: formPayload.companyLegalName,
        companyFormerName: formPayload.companyFormerName,
        entityCode: formPayload.entityCode,
        entityShortName: formPayload.entityShortName,
        isActive: formPayload.isActive,
      };

      const address = formPayload.addresses?.[0];
      const updates = [dispatch(updateLegalEntity(selectedEntityId, entityPayload))];

      if (address?.id) {
        const addressPayload = {
          id: address.id,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          addressType: address.addressType,
          ref_Id: address.ref_Id,
          country_Code: address.country_Code,
          region_Code: address.region_Code,
          latitude: address.latitude,
          longitude: address.longitude,
          timeZone: address.timeZone,
        };
        updates.push(dispatch(updateLegalEntityAddress(address.id, addressPayload)));
      }

      Promise.all(updates)
        .then(() => dispatch(getLegalEntities()))
        .then(() => {
          toast.success('Entity updated successfully!');
          setSaved(true);
          setTimeout(() => setSaved(false), 1400);
        })
        .catch((err) => {
          const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update entity';
          toast.error(errorMsg);
          console.error('Update entity error:', err);
        })
        .finally(() => setSaving(false));
    } else {
      // Creating new entity in Redux
      dispatch(createLegalEntity(formPayload))
        .then((newEntity) => {
          const createdId = newEntity?.companyID ?? newEntity?.id;
          // Auto recall GET to refresh the list with server-normalized data
          return dispatch(getLegalEntities()).then((entities) => {
            const match =
              entities.find((e) => e.id === createdId) ||
              (newEntity?.entityCode && entities.find((e) => e.entityCode === newEntity.entityCode));
            setSelectedEntityId(match ? match.id : createdId ?? null);
            toast.success('Entity created successfully!');
            setSaved(true);
            // Reset the saved state after animation
            setTimeout(() => setSaved(false), 1400);
          });
        })
        .catch((err) => {
          const errorMsg = err?.response?.data?.message || err?.message || 'Failed to create entity';
          toast.error(errorMsg);
          console.error('Create entity error:', err);
        })
        .finally(() => setSaving(false));
    }
  };


  // No DeleteLegalEntity backend endpoint exists yet — this only clears local
  // render state; the entity (and its warehouses/banks) will reappear on the
  // next GetEntityDetails refresh.
  const handleDeleteEntity = () => {
    const id = selectedEntityId;
    setEntities((prev) => prev.filter((e) => e.id !== id));
    setSelectedEntityId(null);
    setActiveTab('entity_details');
    setConfirmDeleteEntity(false);
    toast.success('Entity deleted');
  };

  const tabs = [
    { key: 'entity_details', label: 'Entity Details', icon: FileText },
    { key: 'location', label: 'Location', icon: Boxes, count: entityLocations.length },
    { key: 'warehouse', label: 'Warehouse', icon: Warehouse, count: entityWarehouses.length },
    { key: 'bank', label: 'Bank', icon: Landmark, count: entityBanks.length },
  ];

  const panelProps = { entityId: selectedEntityId };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-full bg-slate-50 dark:bg-slate-900">
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2.5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center"
              >
                <Building2 className="w-4 h-4 text-white" strokeWidth={2.25} />
              </motion.div>
              <h1 className="text-[19px] font-semibold text-slate-900 dark:text-white tracking-tight">Legal Entity Master</h1>
            </div>
            <p className="mt-1 ml-[42px] text-[13px] text-slate-400 dark:text-slate-500">
              Set up entity details, addresses, registrations, business divisions, locations, warehouses, and bank accounts
            </p>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-5">
            {/* LEFT: Entity List */}
            <aside className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden h-fit">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <motion.button
                  onClick={() => {
                    setSelectedEntityId(null);
                    setActiveTab('entity_details');
                  }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={fast}
                  className="w-full h-10 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[13px] font-medium flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  New Legal Entity
                </motion.button>
                <div className="mt-3 h-9 px-3 flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 focus-within:border-indigo-300 dark:focus-within:border-indigo-600 transition-colors">
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search entities…"
                    className="w-full bg-transparent text-[12.5px] text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none"
                  />
                </div>
              </div>
              <div className="p-2 space-y-1 max-h-[32rem] overflow-y-auto">
                {filteredEntities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
                      <Building2 className="w-6 h-6 text-slate-200 dark:text-slate-700 mb-2" />
                    </motion.div>
                    <p className="text-[12.5px] text-slate-400 dark:text-slate-500">
                      {entities.length === 0 ? 'No entities yet — create your first one' : 'No matches found'}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {filteredEntities.map((entity) => (
                      <motion.div key={entity.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} transition={fast}>
                        <EntityListItem
                          entity={entity}
                          active={selectedEntityId === entity.id}
                          onClick={() => {
                            setSelectedEntityId(entity.id);
                            setActiveTab('entity_details');
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </aside>

            {/* RIGHT: Main Tab Container */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-[14.5px] font-semibold text-slate-900 dark:text-white tracking-tight">
                      {selectedEntity ? selectedEntity.companyLegalName : 'New Legal Entity'}
                    </h2>
                    <p className="mt-0.5 text-[12px] text-slate-400 dark:text-slate-500">
                      {selectedEntity
                        ? `${selectedEntity.country}`
                        : 'Fill entity details, addresses, registrations & business divisions to save'}
                    </p>
                  </div>
                  {selectedEntity && <StatusPill active={selectedEntity.isActive} />}
                </div>
              </div>

              {/* Tab Navigation Header */}
              <div className="mt-4 px-3 flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
                {tabs.map((tab) => {
                  const locked = tab.key !== 'entity_details' && !selectedEntity;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => (locked ? toast.error('Create the entity first') : setActiveTab(tab.key))}
                      className={`relative flex items-center gap-2 px-3.5 py-3 text-[13px] font-medium whitespace-nowrap transition-colors ${
                        locked
                          ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          : isActive
                          ? 'text-[var(--primary)] dark:text-indigo-400'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <motion.span animate={{ scale: isActive ? 1.08 : 1 }} transition={fast}>
                        {locked ? <Lock className="w-3.5 h-3.5" /> : <tab.icon className="w-3.5 h-3.5" />}
                      </motion.span>
                      {tab.label}
                      {!locked && tab.count > 0 && (
                        <motion.span
                          key={tab.count}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold tabular-nums ${
                            isActive
                              ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {tab.count}
                        </motion.span>
                      )}
                      {isActive && (
                        <motion.span
                          layoutId="tab-underline"
                          transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                          className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[var(--primary)] dark:bg-indigo-400"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panels */}
              <div className="px-5 pb-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'entity_details' && (
                    <EntityDetailsTab
                      key={selectedEntityId || 'new'}
                      initialEntity={selectedEntity ? { ...BLANK_ENTITY, ...selectedEntity } : BLANK_ENTITY}
                      isNew={!selectedEntity}
                      saving={saving}
                      saved={saved}
                      onSave={handleSaveEntity}
                      onDelete={() => setConfirmDeleteEntity(true)}
                      addressTypeCodeOptions={addressTypeCodeOptions}
                    />
                  )}
                  {activeTab === 'location' && selectedEntity && (
                    <LocationPanel
                      key={`loc-${selectedEntityId}`}
                      items={entityLocations}
                      addressTypeIdOptions={addressTypeIdOptions}
                      addressTypes={reduxAddressTypes}
                      locationTypeOptions={locationTypeOptions}
                      primaryFunctionOptions={primaryFunctionOptions}
                      locationCategoryOptions={locationCategoryOptions}
                      registrationTypeOptions={registrationTypeOptions}
                      {...panelProps}
                      {...locationCrud}
                    />
                  )}
                  {activeTab === 'warehouse' && selectedEntity && (
                    <WarehousePanel
                      key={`wh-${selectedEntityId}`}
                      items={entityWarehouses}
                      locations={entityLocations}
                      addressTypeOptions={addressTypeIdOptions}
                      addressTypes={reduxAddressTypes}
                      warehouseTypeOptions={warehouseTypeOptions}
                      warehouseTypes={reduxWarehouseTypes}
                      {...panelProps}
                      {...warehouseCrud}
                    />
                  )}
                  {activeTab === 'bank' && selectedEntity && (
                    <BankPanel
                      key={`bank-${selectedEntityId}`}
                      items={entityBanks}
                      addressTypeOptions={addressTypeIdOptions}
                      {...panelProps}
                      {...bankCrud}
                    />
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </motion.main>

        <ConfirmModal
          open={confirmDeleteEntity}
          title="Delete legal entity"
          message="This entity and all its mapped locations, warehouses, and bank accounts will be removed. This cannot be undone."
          onConfirm={handleDeleteEntity}
          onCancel={() => setConfirmDeleteEntity(false)}
        />
      </div>
    </MotionConfig>
  );
};

export default LegalEntityMaster;