import React, { useState, useEffect, useCallback, useMemo } from "react";
import UserCreation from "./UserCreation";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserList,
  toggleUserStatus,
  updateUserStatus,
  resetPassword,
} from "../../../Redux/Slices/Master/UserMaster.jsx/UserCreationSlice";
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Avatar,
  Space,
  Divider,
  Row,
  Col,
  Modal,
  Dropdown,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  LockOutlined,
  CloseOutlined,
  KeyOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const AVATAR_COLORS = [
  "from-violet-500 to-violet-600",
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-cyan-500 to-cyan-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600",
  "from-orange-500 to-orange-600",
  "from-pink-500 to-pink-600",
  "from-lime-600 to-lime-700",
  "from-sky-500 to-sky-600",
];

const getAvatarColor = (id) => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

// ─── Utility: useDebounce ────────────────────────────────────────────────────
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame;
    const start = display;
    const diff = value - start;
    const duration = 500;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{display}</>;
}

// ─── Toast System ────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-3 right-3 left-3 sm:left-auto sm:top-5 sm:right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium w-full sm:min-w-[260px] sm:w-auto border backdrop-blur-md
              ${t.type === "success" ? "bg-emerald-50/95 border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-300" : ""}
              ${t.type === "error" ? "bg-red-50/95 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-300" : ""}
              ${t.type === "info" ? "bg-blue-50/95 border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300" : ""}
            `}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0
                ${t.type === "success" ? "bg-emerald-500" : ""}
                ${t.type === "error" ? "bg-red-500" : ""}
                ${t.type === "info" ? "bg-blue-500" : ""}
              `}
            />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => onRemove(t.id)}
              className="opacity-50 hover:opacity-100 transition-opacity ml-2 text-base leading-none"
            >
              &times;
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── useIsMobile ─────────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  const remove = useCallback(
    (id) => setToasts((p) => p.filter((t) => t.id !== id)),
    [],
  );
  return { toasts, add, remove };
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeWidth="2" />
    <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6l-1 14H6L5 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 6V4h6v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconSort = ({ dir }) => (
  <svg className="w-3.5 h-3.5 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {dir === "asc" ? (
      <path d="M12 19V5M5 12l7-7 7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ) : dir === "desc" ? (
      <path d="M12 5v14M5 12l7 7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M8 9l4-4 4 4M16 15l-4 4-4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);
const IconClose = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="m15 18-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="m9 18 6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="7" r="4" strokeWidth="2" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconShield = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconActivity = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconDownload = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" />
    <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconChevronDown = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const Breadcrumb = () => (
  <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
    <span>Administration</span>
    <span className="text-slate-300 dark:text-slate-600">/</span>
    <span className="text-[var(--primary)] font-medium">User Management</span>
  </nav>
);

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ring-1
    ${
      status === true
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800"
        : "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
    }`}
  >
    <span className="relative flex h-1.5 w-1.5">
      {status === true && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status === true ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"}`}
      />
    </span>
    {status === true ? "Active" : "Inactive"}
  </span>
);

// ─── RoleBadge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    Admin: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-800",
    Editor: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
    User: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ring-1 ${
        styles[role] || styles.User
      }`}
    >
      <IconShield className="w-2.5 h-2.5" />
      {role}
    </span>
  );
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const ToggleSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none
      ${checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
    style={{ width: 36, height: 20, minWidth: 36, minHeight: 20 }}
    role="switch"
    aria-checked={checked}
  >
    <span
      className="pointer-events-none inline-block rounded-full bg-white shadow-md transition-transform duration-200 ease-out"
      style={{
        width: 16,
        height: 16,
        transform: checked ? "translateX(16px)" : "translateX(0px)",
      }}
    />
  </button>
);

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-slate-100 dark:border-slate-800">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div
          className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
          style={{ width: `${60 + Math.random() * 40}%` }}
        />
      </td>
    ))}
  </tr>
);

// ─── SearchBar Component ──────────────────────────────────────────────────────
const SearchBar = ({ value, onChange }) => (
  <div className="relative">
    <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
      <IconSearch />
    </span>
    <input
      type="text"
      placeholder="Search users..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-9 sm:pl-10 pr-8 sm:pr-9 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800 border border-[var(--border)] rounded-lg text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
        focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/15 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
      >
        <IconClose />
      </button>
    )}
  </div>
);

// ─── FilterDropdown (UI-only, filters the already-processed list) ───────────
const FilterDropdown = ({ label, value, options, onChange }) => (
  <Select
    value={value || undefined}
    placeholder={label}
    onChange={(v) => onChange(v ?? "")}
    allowClear
    className="w-full sm:w-auto sm:min-w-[130px] h-9"
    options={options.map((o) => ({ value: o, label: o }))}
    suffixIcon={<IconChevronDown />}
  />
);

// ─── Pagination Component ─────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, perPage }) => {
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  const pages = useMemo(() => {
    const p = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) p.push(i);
    } else if (currentPage <= 4) {
      p.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      p.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      p.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return p;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
      <p className="text-xs text-[var(--primary)] dark:text-slate-400 font-medium">
        Showing <span className="text-slate-700 dark:text-slate-200 font-semibold">{start}–{end}</span> of{" "}
        <span className="text-slate-700 dark:text-slate-200 font-semibold">{totalItems}</span> users
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          <IconChevronLeft />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400 dark:text-slate-600 text-sm">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-150
                ${p === currentPage
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          <IconChevronRight />
        </button>
      </div>
    </div>
  );
};

// ─── ConfirmDialog Component ──────────────────────────────────────────────────
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, confirmLabel = "Delete", danger = true }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto
            ${danger ? "bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400"}`}
          >
            {danger ? <IconTrash /> : <IconCheck />}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-center mb-2">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 shadow-md
                ${danger ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"}`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// ─── UserModal Component (View / Edit) ────────────────────────────────────────
const UserModal = ({ open, mode, user, onClose, onSave, toast }) => {
  const [form] = Form.useForm();
  const [passForm] = Form.useForm();
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const dispatch = useDispatch();

  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const isView = mode === "view";
  const isMobile = useIsMobile();

  useEffect(() => {
    if (open && user && !isCreate) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
    setActiveTab("general");
  }, [user, open, isCreate, form]);

  const handleUpdateUser = async () => {
    try {
      const values = await form.validateFields();
      onSave({ ...user, ...values });
    } catch (error) {
      console.log("Validation Failed:", error);
    }
  };

  const handleResetPassword = async () => {
    try {
      const values = await passForm.validateFields();
      setLoading(true);

      const payload = {
        username: user.userName,
        newPassword: values.newPassword,
      };

      const res = await dispatch(resetPassword(payload));
      console.log(res);

      if (res?.data?.statusCode === 200) {
        toast(res.data.message, "success");
        setIsPassModalOpen(false);
        passForm.resetFields();
      } else {
        toast(res, "error");
      }
    } catch (error) {
      console.log("Reset Failed:", error);
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs = isEdit
    ? [{ key: "general", label: "General" }, { key: "security", label: "Security" }]
    : [{ key: "general", label: "General" }];

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        width={isMobile ? "100%" : 750}
        closable={false}
        styles={{ body: { padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" } }}
        footer={
          isEdit ? (
            <div className="flex gap-3 p-2">
              <Button onClick={onClose} block size="large" className="rounded-xl">
                Discard Changes
              </Button>
              <Button
                type="primary"
                block
                size="large"
                onClick={handleUpdateUser}
                className="bg-[var(--primary)] rounded-xl shadow-md"
              >
                Update Profile
              </Button>
            </div>
          ) : null
        }
      >
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col h-full"
        >
          {/* --- HEADER --- */}
          <div className="flex justify-between items-center px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 m-0">
                {isCreate ? "Create User" : isEdit ? "Edit Profile" : "User Profile"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isEdit ? "Update settings and security" : "Member information"}
              </p>
            </div>
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} className="rounded-lg" />
          </div>

          {/* --- CONTENT --- */}
          {isCreate ? (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
              <UserCreation
                embedded
                onSuccess={(newUser) => {
                  onSave(newUser);
                  onClose();
                }}
                onCancel={onClose}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 space-y-5">
              {/* AVATAR HEADER */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.25 }}
                className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-4 sm:gap-6 border border-slate-100 dark:border-slate-700"
              >
                <Avatar
                  size={72}
                  className={`bg-gradient-to-br ${getAvatarColor(user?.id)} font-bold ring-4 ring-white dark:ring-slate-900 shadow-lg`}
                >
                  {user?.avatar}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-bold m-0 text-slate-900 dark:text-slate-100">{user?.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm">@{user?.userName}</p>
                  <Space>
                    <RoleBadge role={user?.rolesName} />
                    <StatusBadge status={user?.isActive} />
                  </Space>
                </div>
              </motion.div>

              {/* TABS */}
              {tabs.length > 1 && (
                <div className="flex gap-1 border-b border-slate-100 dark:border-slate-800">
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`relative px-4 py-2 text-sm font-medium transition-colors duration-150
                        ${activeTab === t.key ? "text-[var(--primary)]" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                    >
                      {t.label}
                      {activeTab === t.key && (
                        <motion.div
                          layoutId="drawer-tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                {activeTab === "security" && isEdit ? (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row gap-3 justify-between sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500 text-white rounded-lg flex items-center justify-center shrink-0">
                        <KeyOutlined />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200 m-0">Password & Security</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 m-0">Securely reset the user's account password.</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsPassModalOpen(true)}
                      className="rounded-lg border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                    >
                      Change Password
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Form form={form} layout="vertical" disabled={isView}>
                      <Row gutter={[20, 0]}>
                        <Col xs={24} sm={12}>
                          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                            <Input size="large" className="rounded-xl" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item name="userName" label="Username">
                            <Input prefix={<UserOutlined className="text-slate-400 dark:text-slate-500" />} size="large" className="rounded-xl" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[20, 0]}>
                        <Col xs={24} sm={12}>
                          <Form.Item name="emailId" label="Email" rules={[{ required: true, type: "email" }]}>
                            <Input prefix={<MailOutlined className="text-slate-400 dark:text-slate-500" />} size="large" className="rounded-xl" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item name="mobile" label="Phone">
                            <Input prefix={<PhoneOutlined className="text-slate-400 dark:text-slate-500" />} size="large" className="rounded-xl" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider className="my-5" />

                      <Row gutter={[20, 0]}>
                        <Col xs={24} sm={12}>
                          <Form.Item name="rolesName" label="Role">
                            <Select size="large" className="w-full h-11">
                              <Select.Option value="Admin">Admin</Select.Option>
                              <Select.Option value="Editor">Editor</Select.Option>
                              <Select.Option value="User">User</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item name="isActive" label="Status">
                            <Select size="large" className="w-full h-11">
                              <Select.Option value={true}>Active</Select.Option>
                              <Select.Option value={false}>Inactive</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </Drawer>

      {/* --- PASSWORD RESET MODAL --- */}
      <Modal
        title="Reset Password"
        open={isPassModalOpen}
        onCancel={() => setIsPassModalOpen(false)}
        onOk={handleResetPassword}
        confirmLoading={loading}
        okText="Update Password"
        okButtonProps={{ className: "bg-[var(--primary)] rounded-lg" }}
        cancelButtonProps={{ className: "rounded-lg" }}
        className="rounded-2xl"
      >
        <div className="py-4">
          <p className="text-xs text-slate-500 mb-4">
            Changing password for user: <strong>{user?.userName}</strong>
          </p>
          <Form form={passForm} layout="vertical">
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "Please enter a new password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 dark:text-slate-500" />}
                placeholder="Enter new secure password"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

// ─── User row menu items (shared by table row & mobile card) ─────────────────
const getUserMenuItems = (user, isAdmin) => [
  { key: "view", label: "View", icon: <EyeOutlined /> },
  ...(isAdmin
    ? [
        { key: "edit", label: "Edit", icon: <EditOutlined /> },
        {
          key: "toggle",
          label: user.isActive ? "Disable" : "Enable",
          icon: user.isActive ? <StopOutlined /> : <CheckCircleOutlined />,
        },
        { type: "divider" },
        { key: "delete", label: "Delete", icon: <DeleteOutlined />, danger: true },
      ]
    : []),
];

// ─── UserRow Component ────────────────────────────────────────────────────────
const UserRow = ({ user, selected, onSelect, onView, onEdit, onDelete, onToggleStatus, isAdmin, index }) => {
  const menuItems = getUserMenuItems(user, isAdmin);

  const handleMenuClick = ({ key }) => {
    if (key === "view") onView(user);
    if (key === "edit") onEdit(user);
    if (key === "toggle") onToggleStatus(user.id);
    if (key === "delete") onDelete(user);
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.03 }}
      className="group relative border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 bg-white dark:bg-slate-900 transition-colors duration-150"
    >
      <td className="px-4 py-3.5 relative">
        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--primary)] scale-y-0 group-hover:scale-y-100 transition-transform duration-150 origin-center" />
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(user.id)}
          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-[var(--accent)] cursor-pointer"
        />
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(user.id)} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm ring-2 ring-white dark:ring-slate-900 group-hover:scale-105 transition-transform duration-150`}
          >
            {user.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{user.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{user.dept}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">@{user.userName}</span>
      </td>

      <td className="px-4 py-3.5 hidden md:table-cell">
        <span className="text-sm text-slate-500 dark:text-slate-400">{user.emailId}</span>
      </td>

      <td className="px-4 py-3.5 hidden lg:table-cell">
        <span className="text-sm text-slate-500 dark:text-slate-400">{user.mobile}</span>
      </td>

      <td className="px-4 py-3.5 hidden sm:table-cell">
        <RoleBadge role={user.rolesName} />
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <ToggleSwitch checked={user.isActive === true} onChange={() => isAdmin && onToggleStatus(user.id)} />
          <StatusBadge status={user.isActive} />
        </div>
      </td>

      <td className="px-4 py-3.5">
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all duration-150">
            <MoreOutlined className="text-base" />
          </button>
        </Dropdown>
      </td>
    </motion.tr>
  );
};

// ─── UserCard Component (mobile) ──────────────────────────────────────────────
const UserCard = ({ user, selected, onSelect, onView, onEdit, onDelete, onToggleStatus, isAdmin, index }) => {
  const menuItems = getUserMenuItems(user, isAdmin);

  const handleMenuClick = ({ key }) => {
    if (key === "view") onView(user);
    if (key === "edit") onEdit(user);
    if (key === "toggle") onToggleStatus(user.id);
    if (key === "delete") onDelete(user);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.03 }}
      className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-lg p-2.5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(user.id)}
            className="w-3.5 h-3.5 mt-1 rounded border-slate-300 dark:border-slate-600 accent-[var(--accent)] cursor-pointer flex-shrink-0"
          />
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(user.id)} flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-sm ring-2 ring-white dark:ring-slate-900`}
          >
            {user.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">@{user.userName}</p>
          </div>
        </div>
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={["click"]} placement="bottomRight">
          <button className="p-1 -mt-0.5 -mr-0.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all duration-150 flex-shrink-0">
            <MoreOutlined className="text-sm" />
          </button>
        </Dropdown>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
        <div className="min-w-0">
          <p className="text-slate-400 dark:text-slate-500 mb-0.5">Email</p>
          <p className="text-slate-600 dark:text-slate-300 truncate">{user.emailId || "—"}</p>
        </div>
        <div className="min-w-0">
          <p className="text-slate-400 dark:text-slate-500 mb-0.5">Mobile</p>
          <p className="text-slate-600 dark:text-slate-300 truncate">{user.mobile || "—"}</p>
        </div>
        <div className="min-w-0">
          <p className="text-slate-400 dark:text-slate-500 mb-0.5">Department</p>
          <p className="text-slate-600 dark:text-slate-300 truncate">{user.dept || "—"}</p>
        </div>
        <div className="min-w-0">
          <p className="text-slate-400 dark:text-slate-500 mb-0.5">Role</p>
          <RoleBadge role={user.rolesName} />
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <StatusBadge status={user.isActive} />
        <ToggleSwitch checked={user.isActive === true} onChange={() => isAdmin && onToggleStatus(user.id)} />
      </div>
    </motion.div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent, delta, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, ease: "easeOut" }}
    whileHover={{ y: -3 }}
    className="bg-white border border-slate-200 border-t-[3px] border-t-[var(--primary)] dark:bg-slate-900 dark:border-slate-800 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-2 flex items-start justify-between shadow-sm hover:shadow-lg transition-shadow duration-200"
  >
    <div className="min-w-0">
      <p className="text-[9px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 sm:mb-1.5 truncate">{label}</p>
      <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
        <AnimatedNumber value={value} />
      </p>
      {delta && <p className="hidden sm:block text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{delta}</p>}
    </div>
    <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br ${accent} shadow-sm flex-shrink-0`}>
      {icon}
    </div>
  </motion.div>
);

// ─── UserList (Main) ──────────────────────────────────────────────────────────
export default function UserList() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "view", user: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, target: null });
  const [isAdmin] = useState(true);

  // UI-only filters — narrow the already-processed list, no API/logic changes
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { toasts, add: addToast, remove: removeToast } = useToast();
  const debouncedSearch = useDebounce(search, 300);
  const { users } = useSelector((state) => state.UserMaster);
  const isMobile = useIsMobile();

  const dispatch = useDispatch();

  const mappedUsers = useMemo(() => {
    return (users || []).map((u) => ({
      id: u.userId,
      name: u.name,
      userName: u.userName,
      emailId: u.emailId,
      mobile: u.mobile,
      rolesName: u.rolesName ? u.rolesName.charAt(0).toUpperCase() + u.rolesName.slice(1) : "User",
      dept: u.departementName,
      avatar: u.name?.charAt(0).toUpperCase(),
      isActive: u.isActive,
      division: u.divisionName,
      location: u.locationName,
      designation: u.desiginationName,
    }));
  }, [users]);

  // Simulate API load
  useEffect(() => {
    dispatch(getUserList());
    setLoading(true);
    const t = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const roleOptions = useMemo(
    () => [...new Set(mappedUsers.map((u) => u.rolesName).filter(Boolean))],
    [mappedUsers],
  );
  const deptOptions = useMemo(
    () => [...new Set(mappedUsers.map((u) => u.dept).filter(Boolean))],
    [mappedUsers],
  );

  // Filter + Sort
  const processed = useMemo(() => {
    let list = [...mappedUsers];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.emailId.toLowerCase().includes(q) ||
          u.userName.toLowerCase().includes(q) ||
          u.rolesName.toLowerCase().includes(q) ||
          u.mobile?.toString().includes(q),
      );
    }
    if (roleFilter) list = list.filter((u) => u.rolesName === roleFilter);
    if (deptFilter) list = list.filter((u) => u.dept === deptFilter);
    if (statusFilter) list = list.filter((u) => (statusFilter === "Active" ? u.isActive : !u.isActive));

    list.sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];
      if (typeof av === "boolean") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      av = av?.toString().toLowerCase() || "";
      bv = bv?.toString().toLowerCase() || "";
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [mappedUsers, debouncedSearch, sortField, sortDir, roleFilter, deptFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(processed.length / perPage));
  const paginated = processed.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortField, sortDir, roleFilter, deptFilter, statusFilter]);
  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const isAllSelected = paginated.length > 0 && paginated.every((u) => selectedIds.includes(u.id));
  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedIds((p) => p.filter((id) => !paginated.find((u) => u.id === id)));
    else setSelectedIds((p) => [...new Set([...p, ...paginated.map((u) => u.id)])]);
  };
  const toggleSelect = (id) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));

  const handleView = (user) => setModal({ open: true, mode: "view", user });
  const handleEdit = (user) => setModal({ open: true, mode: "edit", user });
  const handleDeleteClick = (user) => setConfirmDialog({ open: true, type: "single", target: user });
  const handleBulkDeleteClick = () => {
    if (!selectedIds.length) return;
    setConfirmDialog({ open: true, type: "bulk", target: null });
  };

  const handleDeleteConfirm = async () => {
    if (confirmDialog.type === "single") {
      addToast(`User "${confirmDialog.target.name}" deleted.`, "error");
    } else {
      addToast(`${selectedIds.length} users deleted.`, "error");
      setSelectedIds([]);
    }
    dispatch(getUserList());
    setConfirmDialog({ open: false, type: null, target: null });
  };

  const handleToggleStatus = async (id) => {
    const user = mappedUsers.find((u) => u.id === id);
    const payload = { id: id, status: !user.isActive };
    const res = await dispatch(updateUserStatus(payload));
    if (res?.status === 200) {
      addToast(`${user.name} is now ${payload.status ? "Active" : "Inactive"}`, "info");
    }
  };

  const handleSave = (updated) => {
    dispatch(getUserList());
    setModal({ open: false, mode: "view", user: null });
    addToast(updated?.name ? `${updated.name}'s profile updated.` : "User saved.", "success");
  };

  const activeCount = mappedUsers.filter((u) => u.isActive === true).length;
  const adminCount = mappedUsers.filter((u) => u.rolesName === "Admin").length;

  const SortHeader = ({ field, label }) => (
    <th
      className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors whitespace-nowrap select-none"
      onClick={() => handleSort(field)}
    >
      {label}
      <IconSort dir={sortField === field ? sortDir : null} />
    </th>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-sm"
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4 flex flex-row items-center justify-between gap-3">
          <div className="min-w-0">
            <Breadcrumb />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-md sm:rounded-lg flex items-center justify-center shadow-md text-white flex-shrink-0">
                <IconShield />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">User Management</h1>
                <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">Manage identities, roles, and access across the organization.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isAdmin && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300">
                <IconShield />
                Admin Mode
              </span>
            )}
            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[var(--primary)] rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-md flex-shrink-0">
              SU
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-[1400px] mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <StatCard
            label="Total Users"
            value={mappedUsers.length}
            delta="+2 this week"
            icon={<IconUsers className="text-white" />}
            accent="from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={<IconActivity className="text-white" />}
            accent="from-emerald-500 to-emerald-600"
            delay={0.05}
          />
          <StatCard
            label="Inactive"
            value={mappedUsers.length - activeCount}
            icon={<IconActivity className="text-white" />}
            accent="from-slate-400 to-slate-500"
            delay={0.1}
          />
          <StatCard
            label="Admins"
            value={adminCount}
            icon={<IconShield className="text-white" />}
            accent="from-violet-500 to-violet-600"
            delay={0.15}
          />
        </div>

        {/* Main Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white border border-[var(--border)] dark:bg-slate-900 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden"
        >
          {/* Toolbar */}
          <div className="px-2.5 sm:px-4 py-2.5 sm:py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center gap-2 sm:gap-3">
            <div className="w-full lg:flex-1 lg:max-w-xs">
              <SearchBar value={search} onChange={setSearch} />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <FilterDropdown label="Role" value={roleFilter} options={roleOptions} onChange={setRoleFilter} />
              <FilterDropdown label="Department" value={deptFilter} options={deptOptions} onChange={setDeptFilter} />
              <FilterDropdown label="Status" value={statusFilter} options={["Active", "Inactive"]} onChange={setStatusFilter} />
            </div>

            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 lg:ml-auto">
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleBulkDeleteClick}
                    className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 text-xs sm:text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-150"
                  >
                    <IconTrash />
                    Delete ({selectedIds.length})
                  </motion.button>
                )}
              </AnimatePresence>
              <button className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[var(--border)] text-[var(--primary)] hover:text-[var(--text-hover)] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-all duration-150">
                <IconDownload />
                <span className="hidden sm:inline">Export</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setModal({ open: true, mode: "create", user: null })}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[var(--primary)] text-white text-xs sm:text-sm font-medium shadow-sm hover:opacity-90 transition-all duration-150"
                >
                  <IconPlus />
                  <span className="hidden sm:inline">Add User</span>
                </button>
              )}
            </div>
          </div>

          {/* Table (sm and up) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-[var(--accent)] cursor-pointer"
                    />
                  </th>
                  <SortHeader field="name" label="User" />
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap hidden lg:table-cell">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">
                    Role
                  </th>
                  <SortHeader field="isActive" label="Status" />
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <IconUsers />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-semibold">No users found</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">
                          {debouncedSearch ? `No results for "${debouncedSearch}"` : "Start by adding some users."}
                        </p>
                        {debouncedSearch && (
                          <button onClick={() => setSearch("")} className="text-xs text-blue-600 hover:underline mt-1">
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {paginated.map((user, i) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        index={i}
                        selected={selectedIds.includes(user.id)}
                        onSelect={toggleSelect}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onToggleStatus={handleToggleStatus}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
          <div className="sm:hidden p-2">
            {loading ? (
              <div className="flex flex-col gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <IconUsers />
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-semibold">No users found</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm text-center">
                  {debouncedSearch ? `No results for "${debouncedSearch}"` : "Start by adding some users."}
                </p>
                {debouncedSearch && (
                  <button onClick={() => setSearch("")} className="text-xs text-blue-600 hover:underline mt-1">
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {paginated.map((user, i) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      index={i}
                      selected={selectedIds.includes(user.id)}
                      onSelect={toggleSelect}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onToggleStatus={handleToggleStatus}
                      isAdmin={isAdmin}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && processed.length > 0 && (
            <div className="px-3 sm:px-5 py-4 border-t border-slate-100 dark:border-slate-800">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={processed.length}
                perPage={perPage}
              />
            </div>
          )}
        </motion.div>
      </main>

      {/* Modals */}
      <UserModal
        open={modal.open}
        mode={modal.mode}
        user={modal.user}
        onClose={() => setModal({ open: false, mode: "view", user: null })}
        onSave={handleSave}
        toast={addToast}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.type === "bulk" ? "Delete Selected Users" : "Delete User"}
        message={
          confirmDialog.type === "bulk"
            ? `Are you sure you want to delete ${selectedIds.length} selected users? This action cannot be undone.`
            : `Are you sure you want to delete "${confirmDialog.target?.name}"? This action cannot be undone.`
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ open: false, type: null, target: null })}
        confirmLabel="Delete"
        danger
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}