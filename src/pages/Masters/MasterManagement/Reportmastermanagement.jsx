import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import {
  Select,
  Switch,
  Table,
  Tabs,
  Modal,
  Input as AntInput,
  Tooltip,
  Skeleton,
  ConfigProvider,
} from "antd";
import {
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  X,
  Check,
  FileJson,
  Save,
  RotateCcw,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  FileText,
  Tag,
  Settings2,
  Database,
} from "lucide-react";
import { 
  getReportList,
  createReportName,
  updateReportName,
  deleteReportName,
  createReportType,
  updateReportType,
  deleteReportType,
  createReport,
  selectReportNames,
  selectReportTypes,
  selectReportLoading,
 } from "../../../Redux/Slices/Master/ReportMasterCreation/ReportMasterCreationSlice";


/* ----------------------------------------------------------------------- */
/*  CONFIG / CONSTANTS                                                      */
/* ----------------------------------------------------------------------- */

const CURRENT_USER = "kaju"; // wire to real auth context in production

const DATA_TYPES = [
  "nvarchar",
  "varchar",
  "int",
  "bigint",
  "decimal",
  "float",
  "bit",
  "datetime",
  "date",
  "time",
  "uniqueidentifier",
];

const uid = () => Math.random().toString(36).slice(2, 10);

const SP_NAME_REGEX = /^[A-Za-z0-9_]+$/;

/* ----------------------------------------------------------------------- */
/*  TOAST SYSTEM                                                           */
/* ----------------------------------------------------------------------- */

const ToastContext = React.createContext(() => {});

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, message) => {
    const id = uid();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const icon = {
    success: <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />,
    error: <XCircle className="w-4.5 h-4.5 text-rose-500" />,
    info: <Info className="w-4.5 h-4.5 text-sky-500" />,
  };

  const ring = {
    success: "ring-emerald-200/70",
    error: "ring-rose-200/70",
    info: "ring-sky-200/70",
  };

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 w-[330px] pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-2.5 bg-white/95 backdrop-blur-md border border-slate-200/80 ring-1 ${ring[t.type]} rounded-xl px-4 py-3 shadow-lg shadow-slate-900/10`}
            >
              {icon[t.type]}
              <p className="text-sm text-slate-700 leading-snug flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

const useToast = () => React.useContext(ToastContext);

/* ----------------------------------------------------------------------- */
/*  SHARED UI PRIMITIVES                                                    */
/* ----------------------------------------------------------------------- */

function GlassCard({ children, className = "", ...rest }) {
  return (
    <div
      className={`relative bg-white backdrop-blur-xl border border-white/60 rounded-lg shadow-[0_8px_30px_-12px_rgba(30,41,59,0.18)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

function SectionLabel({ icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-slate-800">{children}</h3>
    </div>
  );
}

function PrimaryButton({ children, onClick, icon, disabled, loading, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white
        bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
        shadow-md shadow-indigo-600/25 transition-all active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${className}`}
    >
      {loading ? (
        <motion.span
          className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, icon, className = "", disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
        text-slate-600 bg-white/80 border border-slate-200 hover:bg-slate-50 hover:border-slate-300
        transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

function DangerGhostButton({ children, onClick, icon, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
        text-rose-600 bg-rose-50/80 border border-rose-200 hover:bg-rose-100 transition-all active:scale-[0.97] ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
      {children} {required && <span className="text-rose-500">*</span>}
    </label>
  );
}

function ErrorText({ children }) {
  if (!children) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 text-xs text-rose-500 mt-1.5"
    >
      <AlertCircle className="w-3 h-3" /> {children}
    </motion.p>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        active ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
      {status}
    </span>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center mb-4">
        <FileText className="w-7 h-7 text-indigo-400" />
      </div>
      <p className="text-slate-700 font-medium text-sm">{title}</p>
      <p className="text-slate-400 text-xs mt-1 max-w-[260px]">{subtitle}</p>
    </div>
  );
}

function TableSkeleton({ rows = 4 }) {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} active title={false} paragraph={{ rows: 1, width: "100%" }} />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  CONFIRM DELETE MODAL                                                    */
/* ----------------------------------------------------------------------- */

function useConfirm() {
  const [state, setState] = useState(null); // { title, message, resolve }

  const confirm = (title, message) =>
    new Promise((resolve) => {
      setState({ title, message, resolve });
    });

  const node = (
    <Modal
      open={!!state}
      onCancel={() => {
        state?.resolve(false);
        setState(null);
      }}
      footer={null}
      closable={false}
      centered
      width={380}
    >
      {state && (
        <div className="py-1">
          <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mb-3">
            <Trash2 className="w-5 h-5 text-rose-500" />
          </div>
          <h4 className="text-base font-semibold text-slate-800 mb-1">{state.title}</h4>
          <p className="text-sm text-slate-500 mb-5">{state.message}</p>
          <div className="flex justify-end gap-2">
            <GhostButton
              onClick={() => {
                state.resolve(false);
                setState(null);
              }}
            >
              Cancel
            </GhostButton>
            <DangerGhostButton
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                state.resolve(true);
                setState(null);
              }}
              className="bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
            >
              Delete
            </DangerGhostButton>
          </div>
        </div>
      )}
    </Modal>
  );

  return { confirm, node };
}

/* ----------------------------------------------------------------------- */
/*  TAB 1 — Report Names (typeId / typeName)                               */
/* ----------------------------------------------------------------------- */

function ReportNamesTab({ searchTerm, loading }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const { confirm, node: confirmModal } = useConfirm();

  const rows = useSelector(selectReportNames);

  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Report Name is required.");
      return;
    }
    if (rows.some((r) => r.reportName?.toLowerCase() === trimmed.toLowerCase())) {
      setError("Report Name already exists.");
      return;
    }
    setSaving(true);
    try {
      await dispatch(createReportName({ reportName: trimmed, createdBy: CURRENT_USER }));
      toast("success", "Report Name created.");
      setValue("");
      setError("");
    } catch (e) {
      toast("error", "Couldn't create Report Name.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setValue("");
    setError("");
  };

  const handleDelete = async (row) => {
    const ok = await confirm(
      "Delete this Report Name?",
      `"${row.reportName}" will be permanently removed, along with any Report Types nested under it. This cannot be undone.`
    );
    if (!ok) return;
    try {
      await dispatch(deleteReportName(row.id));
      toast("success", "Report Name deleted.");
    } catch (e) {
      toast("error", "Delete failed.");
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditValue(row.reportName);
  };

  const saveEdit = async (row) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast("error", "Report Name cannot be empty.");
      return;
    }
    try {
      await dispatch(updateReportName(row.id, { typeName: trimmed }));
      toast("success", "Report Name updated.");
      setEditingId(null);
    } catch (e) {
      toast("error", "Update failed.");
    }
  };

  const toggleStatus = async (row) => {
    try {
      await dispatch(updateReportName(row.id, { status: row.status === "Active" ? "Inactive" : "Active" }));
    } catch (e) {
      toast("error", "Couldn't update status.");
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (r) => r.reportName?.toLowerCase().includes(q) || r.createdBy?.toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    {
      title: "Report Name",
      dataIndex: "reportName",
      key: "reportName",
      render: (val, row) =>
        editingId === row.id ? (
          <div className="flex items-center gap-2">
            <AntInput
              size="small"
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onPressEnter={() => saveEdit(row)}
            />
            <button onClick={() => saveEdit(row)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-md">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-md">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="font-medium text-slate-700">{val}</span>
        ),
    },
    { title: "Created By", dataIndex: "createdBy", key: "createdBy", render: (v) => <span className="text-slate-500">{v}</span> },
    { title: "Created Date", dataIndex: "createdDate", key: "createdDate", render: (v) => <span className="text-slate-500">{v}</span> },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, row) => (
        <button onClick={() => toggleStatus(row)} className="cursor-pointer">
          <StatusBadge status={status} />
        </button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Edit">
            <button
              onClick={() => startEdit(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
      {confirmModal}
      <GlassCard className="p-5 h-fit">
        <SectionLabel icon={<FileText className="w-4 h-4 text-white" />}>Add Report Name</SectionLabel>
        <FieldLabel required>Report Name</FieldLabel>
        <AntInput
          size="large"
          placeholder="e.g. Production Summary"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          onPressEnter={handleSave}
          status={error ? "error" : ""}
          className="rounded-xl"
        />
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2 mt-4">
          <PrimaryButton onClick={handleSave} icon={<Save className="w-4 h-4" />} loading={saving} className="flex-1">
            Save
          </PrimaryButton>
          <GhostButton onClick={handleClear} icon={<RotateCcw className="w-4 h-4" />}>
            Clear
          </GhostButton>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-800">Existing Report Names</h3>
          <span className="text-xs text-slate-400">{filteredRows.length} records</span>
        </div>
        {loading ? (
          <TableSkeleton />
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title="No report names yet"
            subtitle="Add your first report name using the form on the left to get started."
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredRows}
            rowKey="id"
            pagination={{ pageSize: 6, hideOnSinglePage: true }}
            className="rounded-b-2xl"
          />
        )}
      </GlassCard>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  TAB 2 — Report Types (reportId / reportName, nested under typeId)      */
/* ----------------------------------------------------------------------- */

function ReportTypesTab({ searchTerm, loading }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const { confirm, node: confirmModal } = useConfirm();

  const rows = useSelector(selectReportTypes);

  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Type Name is required.");
      return;
    }
    if (rows.some((r) => r.typeName?.toLowerCase() === trimmed.toLowerCase())) {
      setError("Type Name already exists.");
      return;
    }
    setSaving(true);
    try {
      await dispatch(createReportType({ typeName: trimmed, createdBy: CURRENT_USER }));
      toast("success", "Report Type created.");
      setValue("");
      setError("");
    } catch (e) {
      toast("error", "Couldn't create Report Type.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setValue("");
    setError("");
  };

  const handleDelete = async (row) => {
    const ok = await confirm("Delete this Report Type?", `"${row.typeName}" will be permanently removed. This cannot be undone.`);
    if (!ok) return;
    try {
      await dispatch(deleteReportType(row.id));
      toast("success", "Report Type deleted.");
    } catch (e) {
      toast("error", "Delete failed.");
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditValue(row.typeName);
  };

  const saveEdit = async (row) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast("error", "Type Name cannot be empty.");
      return;
    }
    try {
      await dispatch(updateReportType(row.id, { typeName: trimmed }));
      toast("success", "Report Type updated.");
      setEditingId(null);
    } catch (e) {
      toast("error", "Update failed.");
    }
  };

  const toggleStatus = async (row) => {
    try {
      await dispatch(updateReportType(row.id, { status: row.status === "Active" ? "Inactive" : "Active" }));
    } catch (e) {
      toast("error", "Couldn't update status.");
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (r) => r.typeName?.toLowerCase().includes(q) || r.createdBy?.toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    {
      title: "Type Name",
      dataIndex: "typeName",
      key: "typeName",
      render: (val, row) =>
        editingId === row.id ? (
          <div className="flex items-center gap-2">
            <AntInput
              size="small"
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onPressEnter={() => saveEdit(row)}
            />
            <button onClick={() => saveEdit(row)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-md">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-md">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="font-medium text-slate-700">{val}</span>
        ),
    },
    { title: "Created By", dataIndex: "createdBy", key: "createdBy", render: (v) => <span className="text-slate-500">{v}</span> },
    { title: "Created Date", dataIndex: "createdDate", key: "createdDate", render: (v) => <span className="text-slate-500">{v}</span> },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, row) => (
        <button onClick={() => toggleStatus(row)} className="cursor-pointer">
          <StatusBadge status={status} />
        </button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Edit">
            <button
              onClick={() => startEdit(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
      {confirmModal}
      <GlassCard className="p-5 h-fit">
        <SectionLabel icon={<Tag className="w-4 h-4 text-white" />}>Add Report Type</SectionLabel>

        <FieldLabel required>Type Name</FieldLabel>
        <AntInput
          size="large"
          placeholder="e.g. Operational"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          onPressEnter={handleSave}
          status={error ? "error" : ""}
          className="rounded-xl"
        />
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2 mt-4">
          <PrimaryButton onClick={handleSave} icon={<Save className="w-4 h-4" />} loading={saving} className="flex-1">
            Save
          </PrimaryButton>
          <GhostButton onClick={handleClear} icon={<RotateCcw className="w-4 h-4" />}>
            Clear
          </GhostButton>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-800">Existing Report Types</h3>
          <span className="text-xs text-slate-400">{filteredRows.length} records</span>
        </div>
        {loading ? (
          <TableSkeleton />
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title="No report types yet"
            subtitle="Add your first report type using the form on the left to get started."
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredRows}
            rowKey="id"
            pagination={{ pageSize: 6, hideOnSinglePage: true }}
            className="rounded-b-2xl"
          />
        )}
      </GlassCard>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  TAB 3 — Report Configuration                                           */
/* ----------------------------------------------------------------------- */

function emptyParam(order) {
  return {
    _id: uid(),
    paramName: "",
    dataType: "nvarchar",
    required: true,
    hasOptions: false,
    options: [""],
    collapsed: false,
    order,
  };
}

function ParamCard({ param, index, onChange, onDuplicate, onDelete, errors }) {
  const dragControls = useDragControls();

  const update = (patch) => onChange({ ...param, ...patch });

  const addOption = () => update({ options: [...param.options, ""] });
  const removeOption = (i) => {
    const next = param.options.filter((_, idx) => idx !== i);
    update({ options: next.length ? next : [""] });
  };
  const setOption = (i, v) => {
    const next = [...param.options];
    next[i] = v;
    update({ options: next });
  };

  const dupOptionIndexes = useMemo(() => {
    const seen = {};
    const dupes = new Set();
    param.options.forEach((opt, i) => {
      const k = opt.trim().toLowerCase();
      if (!k) return;
      if (seen[k] !== undefined) {
        dupes.add(seen[k]);
        dupes.add(i);
      } else {
        seen[k] = i;
      }
    });
    return dupes;
  }, [param.options]);

  return (
    <Reorder.Item
      value={param}
      dragListener={false}
      dragControls={dragControls}
      as="div"
      layout
      initial={{ opacity: 0, scale: 0.97, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, x: -20, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="relative"
    >
      <GlassCard className={`mb-3 ${errors?.length ? "ring-2 ring-rose-300" : ""}`}>
        <div className="flex items-start gap-2 px-4 py-3">
          <button
            onPointerDown={(e) => dragControls.start(e)}
            className="mt-1.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-50 text-indigo-500 text-[11px] font-semibold shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-slate-700 truncate">
                  {param.paramName || "Untitled parameter"}
                </span>
                {param.required && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                    required
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip title="Duplicate">
                  <button onClick={onDuplicate} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip title="Delete">
                  <button onClick={onDelete} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip title={param.collapsed ? "Expand" : "Collapse"}>
                  <button
                    onClick={() => update({ collapsed: !param.collapsed })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    {param.collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </Tooltip>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {!param.collapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <FieldLabel required>Parameter Name</FieldLabel>
                      <AntInput
                        placeholder="e.g. Plant"
                        value={param.paramName}
                        onChange={(e) => update({ paramName: e.target.value })}
                        status={errors?.includes("name") || errors?.includes("dupe-name") ? "error" : ""}
                      />
                      {errors?.includes("dupe-name") && <ErrorText>Duplicate parameter name.</ErrorText>}
                      {errors?.includes("name") && !errors?.includes("dupe-name") && <ErrorText>Required.</ErrorText>}
                    </div>
                    <div>
                      <FieldLabel required>Data Type</FieldLabel>
                      <Select
                        className="w-full"
                        value={param.dataType}
                        onChange={(v) => update({ dataType: v })}
                        options={DATA_TYPES.map((t) => ({ value: t, label: t }))}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 border border-slate-100">
                      <span className="text-[13px] font-medium text-slate-600">Required</span>
                      <Switch checked={param.required} onChange={(v) => update({ required: v })} />
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 border border-slate-100">
                      <span className="text-[13px] font-medium text-slate-600">Has Options</span>
                      <Switch checked={param.hasOptions} onChange={(v) => update({ hasOptions: v })} />
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {param.hasOptions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-3">
                          <p className="text-[12px] font-medium text-indigo-500 mb-2">Options</p>
                          <div className="space-y-2">
                            {param.options.map((opt, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <AntInput
                                  size="small"
                                  placeholder={`Option ${i + 1}`}
                                  value={opt}
                                  status={dupOptionIndexes.has(i) ? "error" : ""}
                                  onChange={(e) => setOption(i, e.target.value)}
                                />
                                <button
                                  onClick={() => removeOption(i)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 shrink-0"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          {dupOptionIndexes.size > 0 && <ErrorText>Option values cannot be duplicated.</ErrorText>}
                          <button
                            onClick={addOption}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-600"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Option
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GlassCard>
    </Reorder.Item>
  );
}

function JsonPreview({ json, valid }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-slate-900/30 overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs text-slate-400 font-mono">reportParams.json</span>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            valid ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
          }`}
        >
          {valid ? "valid" : "incomplete"}
        </span>
      </div>
      <pre className="flex-1 p-4 text-[12.5px] leading-relaxed font-mono text-emerald-300 overflow-auto whitespace-pre-wrap min-h-[220px] max-h-[560px]">
        {json}
      </pre>
    </div>
  );
}

function ReportConfigurationTab() {
  const dispatch = useDispatch();
  const toast = useToast();

    const reportNames = useSelector(selectReportNames);
  const reportTypes = useSelector(selectReportTypes);


  const [reportTypeId, setReportTypeId] = useState(null); // -> reportId, shown first now
  const [reportNameId, setReportNameId] = useState(null); // -> typeId, shown second
  const [storedProc, setStoredProc] = useState("");
  const [params, setParams] = useState([emptyParam(0)]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

    const typeOptions = useMemo(
    () => reportTypes.map((t) => ({ value: t.id, label: t.typeName })),
    [reportTypes]
  );
  const nameOptions = useMemo(
    () => reportNames.map((r) => ({ value: r.id, label: r.reportName })),
    [reportNames]
  );

  const buildExportParams = (list) =>
    list.map((p) => {
      const base = {
        paramName: p.paramName.trim(),
        dataType: p.dataType,
        required: p.required,
      };
      if (p.hasOptions) {
        base.options = p.options.map((o) => o.trim()).filter(Boolean);
      }
      return base;
    });

  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(buildExportParams(params), null, 2);
    } catch {
      return "[]";
    }
  }, [params]);

  const validate = () => {
    const nextErrors = {};
    if (!reportNameId) nextErrors.reportNameId = "Report Name is required.";
    if (!reportTypeId) nextErrors.reportTypeId = "Report Type is required.";
    if (!storedProc.trim()) {
      nextErrors.storedProc = "Stored Procedure is required.";
    } else if (!SP_NAME_REGEX.test(storedProc.trim())) {
      nextErrors.storedProc = "Only letters, numbers, and underscores are allowed.";
    }
    // if (params.length === 0) {
    //   nextErrors.params = "At least one parameter must exist.";
    // }

    const paramErrorMap = {};
    const nameCount = {};
    params.forEach((p) => {
      const key = p.paramName.trim().toLowerCase();
      if (key) nameCount[key] = (nameCount[key] || 0) + 1;
    });

    params.forEach((p) => {
      const issues = [];
      if (!p.paramName.trim()) issues.push("name");
      else if (nameCount[p.paramName.trim().toLowerCase()] > 1) issues.push("dupe-name");
      if (!p.dataType) issues.push("dataType");
      if (p.hasOptions) {
        const cleaned = p.options.map((o) => o.trim()).filter(Boolean);
        const seen = new Set();
        let hasDupe = false;
        cleaned.forEach((o) => {
          const k = o.toLowerCase();
          if (seen.has(k)) hasDupe = true;
          seen.add(k);
        });
        if (hasDupe) issues.push("dupe-option");
        if (cleaned.length === 0) issues.push("no-options");
      }
      if (issues.length) paramErrorMap[p._id] = issues;
    });

    if (Object.keys(paramErrorMap).length) {
      nextErrors.params = nextErrors.params || "Fix the highlighted parameters.";
    }

    setErrors({ ...nextErrors, paramErrorMap });
    return Object.keys(nextErrors).filter((k) => k !== "paramErrorMap").length === 0 && Object.keys(paramErrorMap).length === 0;
  };

  const addParam = () => setParams((p) => [...p, emptyParam(p.length)]);

  const updateParam = (id, next) => setParams((list) => list.map((p) => (p._id === id ? next : p)));

  const duplicateParam = (id) => {
    setParams((list) => {
      const idx = list.findIndex((p) => p._id === id);
      if (idx === -1) return list;
      const copy = { ...list[idx], _id: uid(), paramName: `${list[idx].paramName} copy` };
      const next = [...list];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const deleteParam = (id) => setParams((list) => list.filter((p) => p._id !== id));

  const handleReset = () => {
    setReportNameId(null);
    setReportTypeId(null);
    setStoredProc("");
    setParams([emptyParam(0)]);
    setErrors({});
  };

  const handleSave = async () => {
    if (!validate()) {
      toast("error", "Please fix the validation errors before saving.");
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        createReport({
          reportTypeID: reportTypeId, // reportId
          reportNameID: reportNameId, // typeId
          reportSP: storedProc.trim(),
          createdBy: CURRENT_USER,
          reportParams: JSON.stringify(buildExportParams(params)),
        })
      );
      toast("success", "Report configuration saved.");
      handleReset();
    } catch (e) {
      toast("error", "Couldn't save the configuration.");
    } finally {
      setSaving(false);
    }
  };

  const previewPanel = <JsonPreview json={jsonString} valid={!errors.params} />;

  return (
    <div className="pb-24">
      <GlassCard className="p-5 sm:p-6 mb-5">
        <SectionLabel icon={<Settings2 className="w-4 h-4 text-white" />}>Basic Information</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FieldLabel required>Report Type</FieldLabel>
            <Select
              className="w-full"
              size="large"
              placeholder="Select Report Type"
              value={reportTypeId}
              onChange={setReportTypeId}
              options={typeOptions}
              showSearch
              optionFilterProp="label"
              status={errors.reportTypeId ? "error" : ""}
            />
            <ErrorText>{errors.reportTypeId}</ErrorText>
          </div>
          <div>
            <FieldLabel required>Report Name</FieldLabel>
            <Select
              className="w-full"
              size="large"
              placeholder="Select Report Name"
              value={reportNameId}
              onChange={setReportNameId}
              options={nameOptions}
              showSearch
              optionFilterProp="label"
              status={errors.reportNameId ? "error" : ""}
            />
            <ErrorText>{errors.reportNameId}</ErrorText>
          </div>
          <div>
            <FieldLabel required>Stored Procedure</FieldLabel>
            <AntInput
              size="large"
              placeholder="Enter Stored Procedure Name"
              value={storedProc}
              onChange={(e) => setStoredProc(e.target.value)}
              status={errors.storedProc ? "error" : ""}
              prefix={<Database className="w-3.5 h-3.5 text-slate-300" />}
            />
            <p className="text-[11px] text-slate-400 mt-1.5">e.g. sp_GetProductionReport</p>
            <ErrorText>{errors.storedProc}</ErrorText>
          </div>
        </div>
      </GlassCard>

      <div className={`grid gap-5 ${isDesktop ? "grid-cols-[1fr_380px]" : "grid-cols-1"}`}>
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel icon={<FileJson className="w-4 h-4 text-white" />}>Report Parameters</SectionLabel>
            <PrimaryButton onClick={addParam} icon={<Plus className="w-4 h-4" />}>
              Add Parameter
            </PrimaryButton>
          </div>

          <ErrorText>{errors.params}</ErrorText>

          {params.length === 0 ? (
            <EmptyState title="No parameters yet" subtitle="Add your first parameter to define what this report needs at run time." />
          ) : (
            <Reorder.Group axis="y" values={params} onReorder={setParams} className="mt-2">
              <AnimatePresence initial={false}>
                {params.map((param, index) => (
                  <ParamCard
                    key={param._id}
                    param={param}
                    index={index}
                    errors={errors.paramErrorMap?.[param._id]}
                    onChange={(next) => updateParam(param._id, next)}
                    onDuplicate={() => duplicateParam(param._id)}
                    onDelete={() => deleteParam(param._id)}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          )}

          {!isDesktop && (
            <div className="mt-5">
              <p className="text-[13px] font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5" /> Live JSON Preview
              </p>
              {previewPanel}
            </div>
          )}
        </GlassCard>

        {isDesktop && (
          <div className="sticky top-4 self-start h-[calc(100vh-160px)]">{previewPanel}</div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pointer-events-none">
        <div className="max-w-5xl mx-auto pointer-events-auto">
          <div className="flex flex-wrap items-center justify-end gap-2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 px-4 py-3">
            <GhostButton onClick={() => setPreviewOpen(true)} icon={<Eye className="w-4 h-4" />}>
              Preview JSON
            </GhostButton>
            <GhostButton onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
              Reset
            </GhostButton>
            <PrimaryButton onClick={handleSave} icon={<Save className="w-4 h-4" />} loading={saving}>
              Save Configuration
            </PrimaryButton>
          </div>
        </div>
      </div>

      <Modal
        title="Report parameters JSON"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={560}
      >
        <JsonPreview json={jsonString} valid={!errors.params} />
      </Modal>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  PAGE HEADER                                                             */
/* ----------------------------------------------------------------------- */

function PageHeader({ search, setSearch, onRefresh, refreshing }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white px-6 sm:px-6 py-3 mb-2 border border-[var(--border)]">
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-[20px] font-bold text-[var(--primary)] tracking-tight"
          >
            Report Master Management
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-gray-800 text-sm mt-1"
          >
            Manage Report Names, Report Types and Report Configuration
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--primary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full sm:w-56 pl-10 pr-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-[var(--primary)] placeholder:text-[var(--primary)] text-sm
                focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all"
            />
          </div>
          <Tooltip title="Refresh">
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-white/15 border border-white/25 text-white hover:bg-white/25 transition-all active:scale-95"
            >
              <motion.span animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.6, ease: "linear" }}>
                <RefreshCw className="w-4 h-4" />
              </motion.span>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  ROOT PAGE                                                               */
/* ----------------------------------------------------------------------- */

function ReportMasterManagementInner() {
  const dispatch = useDispatch();
  const loading = useSelector(selectReportLoading);

  const [activeTab, setActiveTab] = useState("types");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getReportList());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(getReportList());
    setTimeout(() => setRefreshing(false), 600);
  };

  const tabItems = [
    {
      key: "types",
      label: (
        <span className="inline-flex items-center gap-1.5 px-1">
          <Tag className="w-3.5 h-3.5" /> Report Types
        </span>
      ),
      children: <ReportTypesTab searchTerm={search} loading={loading} />,
    },
    {
      key: "names",
      label: (
        <span className="inline-flex items-center gap-1.5 px-1">
          <FileText className="w-3.5 h-3.5" /> Report Names
        </span>
      ),
      children: <ReportNamesTab searchTerm={search} loading={loading} />,
    },
    {
      key: "config",
      label: (
        <span className="inline-flex items-center gap-1.5 px-1">
          <Settings2 className="w-3.5 h-3.5" /> Report Configuration
        </span>
      ),
      children: <ReportConfigurationTab />,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#6366f1",
          borderRadius: 10,
          fontFamily: "inherit",
        },
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <PageHeader search={search} setSearch={setSearch} onRefresh={handleRefresh} refreshing={refreshing} />

          <GlassCard className="p-2 sm:p-3 mb-5">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems.map((t) => ({ key: t.key, label: t.label }))}
              className="px-1"
            />
          </GlassCard>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {tabItems.find((t) => t.key === activeTab)?.children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default function ReportMasterManagement() {
  return (
    <ToastProvider>
      <ReportMasterManagementInner />
    </ToastProvider>
  );
}