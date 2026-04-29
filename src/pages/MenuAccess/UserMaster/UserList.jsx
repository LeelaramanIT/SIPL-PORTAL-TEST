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
  message,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  UserOutlined,
  LockOutlined,
  CloseOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { api } from "../../../utils/axios";

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-lime-600",
  "bg-sky-500",
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

// ─── Toast System ────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 min-w-[260px] border
            ${
              t.type === "success"
                ? `
              bg-emerald-100 border-emerald-300 text-emerald-700
              dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200
            `
                : ""
            }
            ${
              t.type === "error"
                ? `
              bg-red-100 border-red-300 text-red-700
              dark:bg-red-950 dark:border-red-700 dark:text-red-200
            `
                : ""
            }
            ${
              t.type === "info"
                ? `
              bg-blue-100 border-blue-300 text-blue-700
              dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200
            `
                : ""
            }
          `}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0
              ${t.type === "success" ? "bg-emerald-500 dark:bg-emerald-400" : ""}
              ${t.type === "error" ? "bg-red-500 dark:bg-red-400" : ""}
              ${t.type === "info" ? "bg-blue-500 dark:bg-blue-400" : ""}
            `}
          />

          <span className="flex-1">{t.message}</span>

          <button
            onClick={() => onRemove(t.id)}
            className="opacity-50 hover:opacity-100 transition-opacity ml-2 text-base leading-none text-slate-600 dark:text-slate-300"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
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
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" strokeWidth="2" />
    <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconEdit = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconTrash = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline
      points="3 6 5 6 21 6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 6l-1 14H6L5 6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 11v6M14 11v6" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M9 6V4h6v2"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconEye = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" strokeWidth="2" />
  </svg>
);
const IconSort = ({ dir }) => (
  <svg
    className="w-3.5 h-3.5 ml-1 inline-block"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    {dir === "asc" ? (
      <path
        d="M12 19V5M5 12l7-7 7 7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : dir === "desc" ? (
      <path
        d="M12 5v14M5 12l7 7 7-7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <>
        <path
          d="M8 9l4-4 4 4M16 15l-4 4-4-4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
);
const IconClose = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconChevronLeft = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="m15 18-6-6 6-6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconChevronRight = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="m9 18 6-6-6-6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconUsers = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="9" cy="7" r="4" strokeWidth="2" />
    <path
      d="M23 21v-2a4 4 0 0 0-3-3.87"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconShield = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconActivity = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline
      points="22 12 18 12 15 21 9 3 6 12 2 12"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconPlus = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconDownload = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <polyline
      points="7 10 12 15 17 10"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="15"
      x2="12"
      y2="3"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const IconCheck = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline
      points="20 6 9 17 4 12"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconMail = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      strokeWidth="2"
    />
    <polyline points="22,6 12,13 2,6" strokeWidth="2" />
  </svg>
);
const IconPhone = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconBuilding = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18H6z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 12H4a2 2 0 0 0-2 2v8h4M18 9h2a2 2 0 0 1 2 2v11h-4"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="10" y1="6" x2="10" y2="6" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="6" x2="14" y2="6" strokeWidth="2" strokeLinecap="round" />
    <line
      x1="10"
      y1="10"
      x2="10"
      y2="10"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="14"
      y1="10"
      x2="14"
      y2="10"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="10"
      y1="14"
      x2="10"
      y2="14"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="14"
      y1="14"
      x2="14"
      y2="14"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide

    ${
      status === true
        ? `
          bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300
          dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-700/50
        `
        : `
          bg-slate-100 text-slate-700 ring-1 ring-slate-300
          dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-600/50
        `
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full
        ${
          status === true
            ? "bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_#34d399]"
            : "bg-slate-500 dark:bg-slate-400"
        }
      `}
    />
    {status === true ? "Active" : "Inactive"}
  </span>
);

// ─── RoleBadge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    Admin: `
      bg-violet-100 text-violet-700 ring-1 ring-violet-300
      dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-700/50
    `,
    Editor: `
      bg-blue-100 text-blue-700 ring-1 ring-blue-300
      dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-700/50
    `,
    User: `
      bg-slate-100 text-slate-700 ring-1 ring-slate-300
      dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-600/50
    `,
  };

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
        styles[role] || styles.User
      }`}
    >
      {role}
    </span>
  );
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const ToggleSwitch = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none
      ${checked ? "bg-green-500" : "bg-slate-600"}`}
    role="switch"
    aria-checked={checked}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200
      ${checked ? "translate-x-4" : "translate-x-0"}`}
    />
  </button>
);

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-slate-800">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div
          className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
          style={{ width: `${60 + Math.random() * 40}%` }}
        />
      </td>
    ))}
  </tr>
);

// ─── SearchBar Component ──────────────────────────────────────────────────────
const SearchBar = ({ value, onChange }) => (
  <div className="relative">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--primary)]">
      <IconSearch />
    </span>
    <input
      type="text"
      placeholder="Search users..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-1.5 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-lg text-sm text-black placeholder-slate-600
        focus:outline-none focus:border-[var(--ring)] focus:ring-0 focus:ring-blue-500/30 transition-all duration-200"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <IconClose />
      </button>
    )}
  </div>
);

// ─── Pagination Component ─────────────────────────────────────────────────────
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  perPage,
}) => {
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  const pages = useMemo(() => {
    const p = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) p.push(i);
    } else {
      if (currentPage <= 4) {
        p.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        p.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        p.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return p;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
      {/* Info */}
      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
        Showing{" "}
        <span className="text-[var(--primary)] dark:text-slate-200">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="text-[var(--primary)] dark:text-slate-200">
          {totalItems}
        </span>{" "}
        users
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg 
            text-slate-600 dark:text-slate-400 
            hover:text-slate-900 dark:hover:text-white 
            hover:bg-slate-100 dark:hover:bg-slate-800
            disabled:opacity-30 disabled:cursor-not-allowed 
            transition-all duration-150"
        >
          <IconChevronLeft />
        </button>

        {/* Pages */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-slate-500 dark:text-slate-500 text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-6 h-6 rounded-lg text-xs font-semibold transition-all duration-150
                ${
                  p === currentPage
                    ? "bg-[var(--primary)] text-white shadow-lg shadow-blue-900/40"
                    : `
                      text-slate-600 dark:text-slate-400
                      hover:text-slate-900 dark:hover:text-white
                      hover:bg-slate-100 dark:hover:bg-slate-800
                    `
                }`}
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg 
            text-slate-600 dark:text-slate-400 
            hover:text-slate-900 dark:hover:text-white 
            hover:bg-slate-100 dark:hover:bg-slate-800
            disabled:opacity-30 disabled:cursor-not-allowed 
            transition-all duration-150"
        >
          <IconChevronRight />
        </button>
      </div>
    </div>
  );
};

// ─── ConfirmDialog Component ──────────────────────────────────────────────────
const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  danger = true,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto
          ${danger ? "bg-red-950 text-red-400" : "bg-blue-950 text-blue-400"}`}
        >
          {danger ? <IconTrash /> : <IconCheck />}
        </div>
        <h3
          className="text-lg font-semibold text-slate-100 text-center mb-2"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-200 dark:bg-slate-800 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200
              ${danger ? "bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40" : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── UserModal Component (View / Edit) ────────────────────────────────────────
const UserModal = ({ open, mode, user, onClose, onSave, toast }) => {
  const [form] = Form.useForm();
  const [passForm] = Form.useForm();
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const isView = mode === "view";

  useEffect(() => {
    if (open && user && !isCreate) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
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

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        width={640}
        closable={false}
        footer={
          isEdit ? (
            <div className="flex gap-3 p-2">
              <Button
                onClick={onClose}
                block
                size="large"
                className="rounded-xl"
              >
                Discard Changes
              </Button>
              <Button
                type="primary"
                block
                size="large"
                onClick={handleUpdateUser}
                className="bg-blue-600 rounded-xl shadow-lg"
              >
                Update Profile
              </Button>
            </div>
          ) : null
        }
      >
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">
              {isCreate
                ? "Create User"
                : isEdit
                  ? "Edit Profile"
                  : "User Profile"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isEdit ? "Update settings and security" : "Member information"}
            </p>
          </div>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        </div>

        {/* --- CONTENT --- */}
        {isCreate ? (
          <UserCreation
            onSuccess={(newUser) => {
              onSave(newUser);
              onClose();
            }}
            onCancel={onClose}
          />
        ) : (
          <div className="space-y-6">
            {/* AVATAR HEADER */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl flex items-center gap-6 border border-slate-100 dark:border-slate-800">
              <Avatar
                size={80}
                className={`${getAvatarColor(user?.id)} font-bold`}
              >
                {user?.avatar}
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold m-0 dark:text-white">
                  {user?.name}
                </h3>
                <p className="text-slate-500 mb-2">@{user?.userName}</p>
                <Space>
                  <RoleBadge role={user?.rolesName} />
                  <StatusBadge status={user?.isActive} />
                </Space>
              </div>
            </div>

            {/* SECURITY OPTION (Only in Edit Mode) */}
            {isEdit && (
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center">
                    <KeyOutlined />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-orange-900 m-0">
                      Password & Security
                    </p>
                    <p className="text-xs text-orange-700 m-0">
                      Securely reset the user's account password.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsPassModalOpen(true)}
                  className="rounded-lg border-orange-200 text-orange-700 hover:bg-orange-100"
                >
                  Change Password
                </Button>
              </div>
            )}

            {/* MAIN FORM */}
            <Form form={form} layout="vertical" disabled={isView}>
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true }]}
                  >
                    <Input size="large" className="rounded-xl" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="userName" label="Username">
                    <Input
                      prefix={<UserOutlined />}
                      size="large"
                      className="rounded-xl"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item
                    name="emailId"
                    label="Email"
                    rules={[{ required: true, type: "email" }]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      size="large"
                      className="rounded-xl"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="mobile" label="Phone">
                    <Input
                      prefix={<PhoneOutlined />}
                      size="large"
                      className="rounded-xl"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider className="my-6" />

              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item name="rolesName" label="Role">
                    <Select size="large" className="w-full h-11">
                      <Select.Option value="Admin">Admin</Select.Option>
                      <Select.Option value="Editor">Editor</Select.Option>
                      <Select.Option value="User">User</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="isActive" label="Status">
                    <Select size="large" className="w-full h-11">
                      <Select.Option value={true}>Active</Select.Option>
                      <Select.Option value={false}>Inactive</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        )}
      </Drawer>

      {/* --- PASSWORD RESET MODAL --- */}
      <Modal
        title="Reset Password"
        open={isPassModalOpen}
        onCancel={() => setIsPassModalOpen(false)}
        onOk={handleResetPassword}
        confirmLoading={loading}
        okText="Update Password"
        okButtonProps={{ className: "bg-blue-600 rounded-lg" }}
        cancelButtonProps={{ className: "rounded-lg" }}
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
                prefix={<LockOutlined />}
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
// ─── UserRow Component ────────────────────────────────────────────────────────
const UserRow = ({
  user,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  isAdmin,
}) => (
  <tr className="border-b border-[var(--border)] dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 bg-white dark:bg-slate-800/40 transition-colors duration-150 group">
    <td className="px-4 py-3.5">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(user.id)}
        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-200  accent-[var(--accent)] cursor-pointer"
      />
    </td>

    <td className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl ${getAvatarColor(user.id)} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md`}
        >
          {user.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-400 leading-tight">
            {user.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-300 ">
            {user.dept}
          </p>
        </div>
      </div>
    </td>

    <td className="px-4 py-3.5">
      <span className="text-sm text-slate-600 dark:text-slate-300  font-mono">
        @{user.userName}
      </span>
    </td>

    <td className="px-4 py-3.5 hidden md:table-cell">
      <span className="text-sm text-slate-600 dark:text-slate-300 ">
        {user.emailId}
      </span>
    </td>

    <td className="px-4 py-3.5 hidden lg:table-cell">
      <span className="text-sm text-slate-600 dark:text-slate-300 ">
        {user.mobile}
      </span>
    </td>

    <td className="px-4 py-3.5 hidden sm:table-cell">
      <RoleBadge role={user.rolesName} />
    </td>

    <td className="px-4 py-3.5">
      <div className="flex items-center gap-2">
        <ToggleSwitch
          checked={user.isActive === true}
          onChange={() => isAdmin && onToggleStatus(user.id)}
        />
        <StatusBadge status={user.isActive} />
      </div>
    </td>

    <td className="px-4 py-3.5">
      <div className="flex items-center gap-1 transition-opacity duration-150">
        <button
          onClick={() => onView(user)}
          title="View"
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all duration-150"
        >
          <IconEye />
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => onEdit(user)}
              title="Edit"
              className="p-1.5 rounded-lg text-slate-500  dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all duration-150"
            >
              <IconEdit />
            </button>

            <button
              onClick={() => onDelete(user)}
              title="Delete"
              className="p-1.5 rounded-lg text-slate-500  dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all duration-150"
            >
              <IconTrash />
            </button>
          </>
        )}
      </div>
    </td>
  </tr>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent, delta }) => (
  <div
    className="
      bg-white dark:bg-slate-900
       border-slate-0 dark:border-[var(--primary)]
      border-t-3 border-[var(--primary)]
      rounded-lg p-3 flex items-start justify-between
      hover:border-[var(--accent)] dark:hover:border-[var(--accent)]
      transition-all duration-200 shadow-lg
    "
  >
    <div>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>

      <p
        className="text-2xl font-bold text-slate-900 dark:text-white"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {value}
      </p>

      {delta && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
          {delta}
        </p>
      )}
    </div>

    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}
    >
      {icon}
    </div>
  </div>
);

// ─── UserList (Main) ──────────────────────────────────────────────────────────
export default function UserList() {
  // const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "view", user: null });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    target: null,
  });
  const [isAdmin] = useState(true);

  const { toasts, add: addToast, remove: removeToast } = useToast();
  const debouncedSearch = useDebounce(search, 300);
  const { users } = useSelector((state) => state.UserMaster);

  const dispatch = useDispatch();

  const mappedUsers = useMemo(() => {
    return (users || []).map((u) => ({
      id: u.userId, // important
      name: u.name,
      userName: u.userName,
      emailId: u.emailId,
      mobile: u.mobile,
      // Fix role (capitalize if needed)
      rolesName: u.rolesName
        ? u.rolesName.charAt(0).toUpperCase() + u.rolesName.slice(1)
        : "User",
      // Department mapping
      dept: u.departementName,
      // Avatar (first letter)
      avatar: u.name?.charAt(0).toUpperCase(),
      // Keep boolean (your UI expects true/false)
      isActive: u.isActive,
      // Optional extra fields
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
  console.log(mappedUsers);

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
  }, [mappedUsers, debouncedSearch, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processed.length / perPage));
  const paginated = processed.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortField, sortDir]);
  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage]);

  // Sort toggle
  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Selection
  const isAllSelected =
    paginated.length > 0 && paginated.every((u) => selectedIds.includes(u.id));
  const toggleSelectAll = () => {
    if (isAllSelected)
      setSelectedIds((p) =>
        p.filter((id) => !paginated.find((u) => u.id === id)),
      );
    else
      setSelectedIds((p) => [
        ...new Set([...p, ...paginated.map((u) => u.id)]),
      ]);
  };
  const toggleSelect = (id) =>
    setSelectedIds((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id],
    );

  // Actions
  const handleView = (user) => setModal({ open: true, mode: "view", user });
  const handleEdit = (user) => setModal({ open: true, mode: "edit", user });
  const handleDeleteClick = (user) =>
    setConfirmDialog({ open: true, type: "single", target: user });
  const handleBulkDeleteClick = () => {
    if (!selectedIds.length) return;
    setConfirmDialog({ open: true, type: "bulk", target: null });
  };

  const handleDeleteConfirm = async () => {
    if (confirmDialog.type === "single") {
      // dispatch delete API here
      addToast(`User "${confirmDialog.target.name}" deleted.`, "error");
    } else {
      // bulk delete API
      addToast(`${selectedIds.length} users deleted.`, "error");
      setSelectedIds([]);
    }

    dispatch(getUserList()); // refresh list
    setConfirmDialog({ open: false, type: null, target: null });
  };

  const handleToggleStatus = async (id) => {
    const user = mappedUsers.find((u) => u.id === id);

    const payload = {
      id: id,
      status: !user.isActive, // toggle value
    };

    const res = await dispatch(updateUserStatus(payload));
    if (res?.status === 200) {
      addToast(
        `${user.name} is now ${payload.status ? "Active" : "Inactive"}`,
        "info",
      );
    }
  };

  const handleSave = (updated) => {
    setUsers((p) =>
      p.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
    );
    setModal({ open: false, mode: "view", user: null });
    addToast(`${updated.name}'s profile updated.`, "success");
  };

  // Stats
  const activeCount = mappedUsers.filter((u) => u.isActive === true).length;
  const adminCount = mappedUsers.filter((u) => u.rolesName === "Admin").length;

  // SortHeader helper
  const SortHeader = ({ field, label }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest cursor-pointer hover:text-slate-500 transition-colors whitespace-nowrap select-none"
      onClick={() => handleSort(field)}
    >
      {label}
      <IconSort dir={sortField === field ? sortDir : null} />
    </th>
  );

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen bg-white dark:bg-slate-950 text-gray-800"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Top Nav */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-[var(--primary)]/5 dark:bg-slate-950 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--secondary)] rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                <IconShield />
              </div>
              <div>
                <h1
                  className="text-base font-bold text-slate-900 dark:text-white leading-tight"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Acme Admin
                </h1>
                <p className="text-xs text-slate-500">User Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--text)]">
                  <IconShield />
                  Admin Mode
                </span>
              )}
              <div className="w-9 h-9 bg-[var(--primary)] rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-900/40">
                SU
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-3.5 py-3">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard
              label="Total Users"
              value={mappedUsers.length}
              delta="+2 this week"
              icon={<IconUsers />}
              accent="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            />

            <StatCard
              label="Active"
              value={activeCount}
              icon={<IconActivity />}
              accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            />

            <StatCard
              label="Inactive"
              value={mappedUsers.length - activeCount}
              icon={<IconActivity />}
              accent="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
            />

            <StatCard
              label="Admins"
              value={adminCount}
              icon={<IconShield />}
              accent="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400"
            />
          </div>

          {/* Main Table Card */}
          <div className="bg-[var(---secondary)] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden">
            {/* Table Toolbar */}
            <div className="px-3 py-3 border-b border-[var(--border)] dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 max-w-xs">
                <SearchBar value={search} onChange={setSearch} />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950 border border-red-700/50 text-red-300 text-sm font-semibold hover:bg-red-900 transition-all duration-200"
                  >
                    <IconTrash />
                    Delete ({selectedIds.length})
                  </button>
                )}
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] border border-[var(--border)] text-[var(--text)] hover:text-[var(--text-hover)] text-sm font-medium hover:bg-[var(--destructive-foreground)] transition-all duration-200">
                  <IconDownload />
                  <span className="hidden sm:inline">Export</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() =>
                      setModal({ open: true, mode: "create", user: null })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] border border-[var(--border)] text-[var(--text)] hover:text-[var(--text-hover)] text-sm font-medium hover:bg-[var(--destructive-foreground)] transition-all duration-200"
                  >
                    <IconPlus />
                    <span className="hidden sm:inline">Add User</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-200 dark:bg-slate-200 accent-[var(--accent)] cursor-pointer"
                      />
                    </th>
                    <SortHeader field="name" label="User" />
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-widest whitespace-nowrap">
                      Username
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-widest whitespace-nowrap hidden md:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-widest whitespace-nowrap hidden lg:table-cell">
                      Mobile
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">
                      Role
                    </th>
                    <SortHeader field="isActive" label="Status" />
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
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
                          <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                            <IconUsers />
                          </div>
                          <p
                            className="text-slate-500 dark:text-slate-500 font-semibold"
                            style={{ fontFamily: "'Sora', sans-serif" }}
                          >
                            No users found
                          </p>
                          <p className="text-slate-600 text-sm">
                            {debouncedSearch
                              ? `No results for "${debouncedSearch}"`
                              : "Start by adding some users."}
                          </p>
                          {debouncedSearch && (
                            <button
                              onClick={() => setSearch("")}
                              className="text-xs text-blue-400 hover:underline mt-1"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        selected={selectedIds.includes(user.id)}
                        onSelect={toggleSelect}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onToggleStatus={handleToggleStatus}
                        isAdmin={isAdmin}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && processed.length > 0 && (
              <div className="px-5 py-4 border-t border-[var(--border)] dark:border-slate-800">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={processed.length}
                  perPage={perPage}
                />
              </div>
            )}
          </div>
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
          title={
            confirmDialog.type === "bulk"
              ? "Delete Selected Users"
              : "Delete User"
          }
          message={
            confirmDialog.type === "bulk"
              ? `Are you sure you want to delete ${selectedIds.length} selected users? This action cannot be undone.`
              : `Are you sure you want to delete "${confirmDialog.target?.name}"? This action cannot be undone.`
          }
          onConfirm={handleDeleteConfirm}
          onCancel={() =>
            setConfirmDialog({ open: false, type: null, target: null })
          }
          confirmLabel="Delete"
          danger
        />

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </>
  );
}
