import { useMemo, useRef, useState } from "react";
import { Form, Input, Avatar, Tag, Tooltip } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  IdCard, Mail, Phone, Building2, Layers, MapPin, Clock, ShieldCheck,
  Check, Lock, X, CheckCircle2, UserRound, Upload, Trash2, Info,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { resetUserPassword } from "../../../Redux/Slices/AuthSlice";

/* ---------- theme (light/dark via .dark on any ancestor) ---------- */
const themeCss = `
  .pf-scope {
    --pf-bg: #f6f7f9; --pf-card: #ffffff; --pf-border: #e5e7eb;
    --pf-text: #1f2328; --pf-muted: #6b7280; --pf-soft: #f3f4f6;
    --pf-accent: #4f46e5; --pf-accent-soft: #eef2ff;
    --pf-success: #16a34a; --pf-danger: #dc2626;
    --pf-shadow: 0 1px 2px rgba(16,24,40,.05), 0 1px 3px rgba(16,24,40,.06);
  }
  .dark .pf-scope, .pf-scope.dark {
    --pf-bg: #101418; --pf-card: #171c22; --pf-border: #2a313a;
    --pf-text: #e6e9ed; --pf-muted: #8b94a1; --pf-soft: #1f252d;
    --pf-accent: #818cf8; --pf-accent-soft: #26264a;
    --pf-success: #4ade80; --pf-danger: #f87171;
    --pf-shadow: 0 1px 3px rgba(0,0,0,.4);
  }
  .pf-scope .ant-form-item-label > label { color: var(--pf-text); font-weight: 500; font-size: 12px; }
  .pf-scope .ant-input, .pf-scope .ant-input-affix-wrapper {
    background: var(--pf-card); border-color: var(--pf-border); color: var(--pf-text); font-size: 12px;
  }
  .pf-scope .ant-input::placeholder { color: var(--pf-muted); }
  .pf-scope .ant-input-affix-wrapper-disabled, .pf-scope .ant-input[disabled] {
    background: var(--pf-soft); color: var(--pf-muted);
  }
  .pf-scope .ant-input-password-icon { color: var(--pf-muted); }
  .pf-scope .ant-input-show-count-suffix { font-size: 11px; }
  .pf-scope .ant-tag { font-size: 10px; }
`;

const defaultUser = {
  fullName: "Kaja Moideen MK",
  username: "kaja.it",
  role: "FULL STACK DEVELOPER",
  employeeCode: "EMP-00412",
  email: "kajamoideen3100@gmail.com",
  mobile: "+91 9360799752",
  department: "IT & SYSTEM",
  division: "STD",
  location: "Chennai, IN",
  lastLogin: "Today, 09:42 AM",
  status: "active",
  avatarUrl: null,
};

const RULES = [
  { key: "length", label: "Minimum 8 characters", test: (p) => p.length >= 8 },
  { key: "upper", label: "At least one uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { key: "number", label: "At least one number", test: (p) => /\d/.test(p) },
  { key: "special", label: "At least one special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
  { key: "differs", label: "Different from current password", test: (p, cur) => p.length > 0 && p !== cur },
];

const STRENGTH = [
  { label: "Weak", color: "var(--pf-danger)", width: "33%" },
  { label: "Fair", color: "#d97706", width: "66%" },
  { label: "Strong", color: "var(--pf-success)", width: "100%" },
];

const TABS = [
  { key: "profile", label: "Profile Details", icon: UserRound },
  { key: "password", label: "Password", icon: Lock },
];

const MAX_AVATAR_MB = 2;
const initialsOf = (name) =>
  (name || "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={13} className="mt-0.5 shrink-0" style={{ color: "var(--pf-muted)" }} strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="text-[11px]" style={{ color: "var(--pf-muted)" }}>{label}</p>
        <p className="text-xs font-medium truncate" style={{ color: "var(--pf-text)" }}>{value}</p>
      </div>
    </div>
  );
}

function InlineMessage({ type, children }) {
  const danger = type === "error";
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden max-w-[480px]"
    >
      <div
        className="mb-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs"
        style={{
          borderColor: danger ? "rgba(220,38,38,.3)" : "rgba(22,163,74,.3)",
          background: danger ? "rgba(220,38,38,.06)" : "rgba(22,163,74,.06)",
          color: danger ? "var(--pf-danger)" : "var(--pf-success)",
        }}
      >
        {danger ? <X size={15} className="mt-0.5 shrink-0" /> : <Check size={15} className="mt-0.5 shrink-0" />}
        {children}
      </div>
    </motion.div>
  );
}

export default function MyProfilePage({ user = defaultUser, onSubmit, onUpdateProfile }) {
  const [activeTab, setActiveTab] = useState("profile");
  const {username,roles, DepartmentDetails, LocationDetails, } = useSelector((state)=> state.auth)
  console.log(username,roles,DepartmentDetails,LocationDetails);
  

  /* ---------------- profile details ---------------- */
  const fileRef = useRef(null);
  const [displayName, setDisplayName] = useState(username || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState(undefined); // undefined = untouched, null = removed
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const nameError =
    displayName.trim().length === 0
      ? "Display name is required"
      : displayName.trim().length < 3
      ? "Display name must be at least 3 characters"
      : null;

  const profileDirty = displayName.trim() !== (user.fullName || "").trim() || avatarFile !== undefined;
  const canSaveProfile = profileDirty && !nameError;

  const pickAvatar = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setProfileError("Please select a valid image file.");
    if (file.size > MAX_AVATAR_MB * 1024 * 1024)
      return setProfileError(`Image must be smaller than ${MAX_AVATAR_MB} MB.`);
    setProfileError(null);
    if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    setAvatarUrl(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  const removeAvatar = () => {
    if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    setAvatarUrl(null);
    setAvatarFile(null);
    setProfileError(null);
  };

  const resetProfile = () => {
    if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    setDisplayName(user.fullName || "");
    setAvatarUrl(user.avatarUrl || null);
    setAvatarFile(undefined);
    setProfileError(null);
  };

  const saveProfile = async () => {
    if (!canSaveProfile) return;
    setProfileError(null);
    setProfileSaving(true);
    try {
      await onUpdateProfile?.({ displayName: displayName.trim(), avatarFile });
      setAvatarFile(undefined);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err?.message || "Unable to update profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  /* ---------------- password ---------------- */
  const [form] = Form.useForm();
  const newPassword = Form.useWatch("newPassword", form) || "";
  const currentPassword = Form.useWatch("currentPassword", form) || "";
  const confirmPassword = Form.useWatch("confirmPassword", form) || "";

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);
  const dispatch = useDispatch();

  const ruleResults = useMemo(
    () => RULES.map((r) => ({ ...r, passed: r.test(newPassword, currentPassword) })),
    [newPassword, currentPassword]
  );
  const allRulesPass = ruleResults.every((r) => r.passed);
  const confirmMatches = confirmPassword.length > 0 && confirmPassword === newPassword;
  const canSubmit = allRulesPass && confirmMatches && currentPassword.length > 0;

  const strength = useMemo(() => {
    if (!newPassword) return null;
    const score = ruleResults.slice(0, 4).filter((r) => r.passed).length;
    if (score <= 2) return STRENGTH[0];
    if (score === 3) return STRENGTH[1];
    return STRENGTH[2];
  }, [newPassword, ruleResults]);

  const handleFinish = async (values) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const payload = {
    //   username: user.username, // or username from Redux
      oldPassword: values.currentPassword,
      newPassword: values.newPassword,
    };
      console.log("Payload:", payload);
      const res = await dispatch(resetUserPassword(payload))
      console.log(res);
      setSuccess(true);
      form.resetFields(["currentPassword", "newPassword", "confirmPassword"]);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setServerError(err?.message || "Unable to update password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const col = {
    hidden: { opacity: 0, y: 16 },
    show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.08, ease: "easeOut" } }),
  };
  const panel = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
  };

  const showFooter = !(activeTab === "password" && success);
  const footerDisabled = activeTab === "profile" ? !canSaveProfile || profileSaving : !canSubmit || submitting;
  const footerBusy = activeTab === "profile" ? profileSaving : submitting;
  const footerLabel = activeTab === "profile" ? "Save Changes" : "Update Password";
  const footerHint =
    activeTab === "profile"
      ? nameError || (!profileDirty ? "No changes to save" : "")
      : !canSubmit
      ? "Complete all password requirements to continue"
      : "";

  const onFooterSave = () => (activeTab === "profile" ? saveProfile() : form.submit());
  const onFooterCancel = () => {
    if (activeTab === "profile") return resetProfile();
    form.resetFields(["currentPassword", "newPassword", "confirmPassword"]);
    setServerError(null);
  };

  return (
    <div className="pf-scope w-full h-full flex flex-col overflow-hidden" style={{ background: "var(--pf-bg)" }}>
      <style>{themeCss}</style>

      <div className="mx-auto w-full max-w-6xl flex-1 min-h-0 flex flex-col px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-5">
        <div className="mb-3 sm:mb-4 shrink-0">
          <h1 className="text-sm sm:text-base font-semibold tracking-tight" style={{ color: "var(--pf-text)" }}>
            My Profile
          </h1>
          <p className="text-[11px] sm:text-xs mt-0.5" style={{ color: "var(--pf-muted)" }}>
            Manage your profile details and account password
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[35%_1fr] flex-1 min-h-0 items-stretch">
          {/* ---------------- LEFT: profile card ---------------- */}
          <motion.aside
            custom={0} variants={col} initial="hidden" animate="show"
            className="rounded-xl border flex flex-col min-h-0 overflow-hidden"
            style={{ background: "var(--pf-card)", borderColor: "var(--pf-border)", boxShadow: "var(--pf-shadow)" }}
          >
            <div className="p-4 sm:p-6 pb-4 flex flex-col items-center text-center shrink-0">
              <Avatar
                size={56} src={avatarUrl}
                style={{ background: "var(--pf-accent-soft)", color: "var(--pf-accent)", fontWeight: 600, fontSize: 18 }}
              >
                {initialsOf(displayName)}
              </Avatar>
              <h2 className="mt-3 text-sm font-semibold" style={{ color: "var(--pf-text)" }}>
                {displayName.trim() || user.fullName}
              </h2>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--pf-muted)" }}>
                @{ username || user.username}
              </p>
              <Tag className="mt-2.5 !rounded-md !text-[10px] !px-2 !border-0"
                style={{ background: "var(--pf-accent-soft)", color: "var(--pf-accent)" }}>
                {roles||user.role}
              </Tag>
              <AnimatePresence>
                {profileDirty && (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-2 text-[11px]" style={{ color: "var(--pf-muted)" }}
                  >
                    Preview — unsaved changes
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="mx-4 sm:mx-6 border-t shrink-0" style={{ borderColor: "var(--pf-border)" }} />

            <div className="px-4 sm:px-6 py-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <DetailRow icon={IdCard} label="Employee Code" value={'--'} />
              {/* <DetailRow icon={IdCard} label="Employee Code" value={user.employeeCode} /> */}
              <DetailRow icon={Mail} label="Email" value={"--"} />
              {/* <DetailRow icon={Mail} label="Email" value={user.email} /> */}
              <DetailRow icon={Phone} label="Mobile Number" value={"--"} />
              {/* <DetailRow icon={Phone} label="Mobile Number" value={user.mobile} /> */}
              <DetailRow icon={Building2} label="Department" value={"--"} />
              {/* <DetailRow icon={Building2} label="Department" value={user.department} /> */}
              <DetailRow icon={Layers} label="Division" value={"--"} />
              {/* <DetailRow icon={Layers} label="Division" value={user.division} /> */}
              <DetailRow icon={MapPin} label="Location" value={user.location} />
              <DetailRow icon={Clock} label="Last Login" value={user.lastLogin} />
              <div className="flex items-start gap-3 py-2">
                <ShieldCheck size={13} className="mt-0.5 shrink-0" style={{ color: "var(--pf-muted)" }} strokeWidth={1.75} />
                <div>
                  <p className="text-[11px]" style={{ color: "var(--pf-muted)" }}>Account Status</p>
                  <span
                    className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={
                      user.status === "active"
                        ? { background: "rgba(22,163,74,.1)", color: "var(--pf-success)" }
                        : { background: "rgba(220,38,38,.1)", color: "var(--pf-danger)" }
                    }
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
                    {user.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* ---------------- RIGHT: editable panels ---------------- */}
          <motion.section
            custom={1} variants={col} initial="hidden" animate="show"
            className="rounded-xl border flex flex-col min-h-0 overflow-hidden"
            style={{ background: "var(--pf-card)", borderColor: "var(--pf-border)", boxShadow: "var(--pf-shadow)" }}
          >
            {/* tabs */}
            <div className="flex gap-1 border-b px-4 sm:px-6 lg:px-8 shrink-0" style={{ borderColor: "var(--pf-border)" }}>
              {TABS.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className="relative flex items-center gap-2 px-3 py-3 text-xs font-medium transition-colors"
                    style={{ color: active ? "var(--pf-accent)" : "var(--pf-muted)" }}
                  >
                    <tab.icon size={13} strokeWidth={1.9} />
                    {tab.label}
                    {active && (
                      <motion.span
                        layoutId="pf-tab-underline"
                        className="absolute inset-x-0 -bottom-px h-0.5 rounded-full"
                        style={{ background: "var(--pf-accent)" }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-5 sm:px-6 lg:px-8 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {/* ============ PROFILE DETAILS ============ */}
                {activeTab === "profile" && (
                  <motion.div key="profile" variants={panel} initial="hidden" animate="show" exit="exit">
                    <h2 className="text-sm font-semibold" style={{ color: "var(--pf-text)" }}>
                      Profile Details
                    </h2>
                    <p className="mt-1 mb-5 text-xs" style={{ color: "var(--pf-muted)" }}>
                      Update your photo and the name shown across the application.
                    </p>

                    <AnimatePresence>
                      {profileError && <InlineMessage type="error">{profileError}</InlineMessage>}
                      {profileSuccess && !profileError && (
                        <InlineMessage type="success">Profile updated successfully.</InlineMessage>
                      )}
                    </AnimatePresence>

                    {/* avatar */}
                    <div className="max-w-[480px]">
                      <p className="mb-2 text-xs font-medium" style={{ color: "var(--pf-text)" }}>
                        Profile Picture
                      </p>
                      <div className="flex items-center gap-4">
                        <Avatar
                          size={60} src={avatarUrl}
                          style={{ background: "var(--pf-accent-soft)", color: "var(--pf-accent)", fontWeight: 600, fontSize: 20 }}
                        >
                          {initialsOf(displayName)}
                        </Avatar>
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => fileRef.current?.click()}
                              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                              style={{ borderColor: "var(--pf-border)", color: "var(--pf-text)" }}
                            >
                              <Upload size={12} strokeWidth={1.9} />
                              {avatarUrl ? "Change photo" : "Upload photo"}
                            </button>
                            {avatarUrl && (
                              <button
                                type="button"
                                onClick={removeAvatar}
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                                style={{ borderColor: "var(--pf-border)", color: "var(--pf-danger)" }}
                              >
                                <Trash2 size={12} strokeWidth={1.9} />
                                Remove
                              </button>
                            )}
                          </div>
                          <p className="mt-2 text-[11px]" style={{ color: "var(--pf-muted)" }}>
                            JPG or PNG, square image, up to {MAX_AVATAR_MB} MB.
                          </p>
                        </div>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
                    </div>

                    <div className="my-6 max-w-[480px] border-t" style={{ borderColor: "var(--pf-border)" }} />

                    {/* display name + username */}
                    <div className="max-w-[480px] space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--pf-text)" }}>
                          Display Name
                        </label>
                        <Input
                          size="middle"
                          className="!rounded-lg"
                          value={displayName}
                          maxLength={50}
                          showCount
                          placeholder="Enter your display name"
                          status={nameError && profileDirty ? "error" : ""}
                          onChange={(e) => setDisplayName(e.target.value)}
                        />
                        {nameError && profileDirty ? (
                          <p className="mt-1 text-[11px]" style={{ color: "var(--pf-danger)" }}>{nameError}</p>
                        ) : (
                          <p className="mt-1 text-[11px]" style={{ color: "var(--pf-muted)" }}>
                            Shown in the header, approvals and activity logs.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--pf-text)" }}>
                          Username
                        </label>
                        {/* <Input size="middle" className="!rounded-lg" value={user.username} disabled /> */}
                        <Input size="middle" className="!rounded-lg" value={"--"} disabled />
                      </div>

                      <div
                        className="flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[11px]"
                        style={{ borderColor: "var(--pf-border)", background: "var(--pf-soft)", color: "var(--pf-muted)" }}
                      >
                        <Info size={12} className="mt-0.5 shrink-0" strokeWidth={1.9} />
                        Employee code, department, division and role are managed by your administrator.
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ============ PASSWORD ============ */}
                {activeTab === "password" && (
                  <motion.div key="password" variants={panel} initial="hidden" animate="show" exit="exit">
                    {success ? (
                      <div className="flex flex-col items-center justify-center py-16 max-w-[480px]">
                        <motion.div
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                          <CheckCircle2 size={44} style={{ color: "var(--pf-success)" }} strokeWidth={1.5} />
                        </motion.div>
                        <p className="mt-3 text-xs font-semibold" style={{ color: "var(--pf-text)" }}>
                          Password updated
                        </p>
                        <p className="mt-1 text-xs" style={{ color: "var(--pf-muted)" }}>
                          Use your new password the next time you sign in.
                        </p>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-sm font-semibold" style={{ color: "var(--pf-text)" }}>
                          Change Password
                        </h2>
                        <p className="mt-1 mb-5 text-xs" style={{ color: "var(--pf-muted)" }}>
                          Choose a strong password you haven't used elsewhere.
                        </p>

                        <AnimatePresence>
                          {serverError && <InlineMessage type="error">{serverError}</InlineMessage>}
                        </AnimatePresence>

                        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}
                          className="max-w-[480px]" autoComplete="off">
                          <Form.Item label="Username" name="username" initialValue={username}>
                            <Input disabled size="middle" className="!rounded-lg" />
                          </Form.Item>

                          <Form.Item
                            label="Current Password" name="currentPassword"
                            rules={[{ required: true, message: "Enter your current password" }]}
                          >
                            <Input.Password size="middle" className="!rounded-lg" placeholder="Enter current password" />
                          </Form.Item>

                          <Form.Item
                            label="New Password" name="newPassword" className="!mb-2"
                            rules={[{ required: true, message: "Enter a new password" }]}
                          >
                            <Input.Password size="middle" className="!rounded-lg" placeholder="Enter new password" />
                          </Form.Item>

                          {/* strength meter */}
                          <div className="mb-3 flex items-center gap-3">
                            <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: "var(--pf-soft)" }}>
                              <motion.div
                                className="h-full rounded-full"
                                animate={{
                                  width: strength ? strength.width : "0%",
                                  backgroundColor: strength ? strength.color : "transparent",
                                }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                              />
                            </div>
                            <span className="text-[11px] font-medium w-12 text-right"
                              style={{ color: strength ? strength.color : "var(--pf-muted)" }}>
                              {strength ? strength.label : ""}
                            </span>
                          </div>

                          {/* rules checklist */}
                          <div className="mb-5 rounded-lg border px-4 py-3"
                            style={{ borderColor: "var(--pf-border)", background: "var(--pf-soft)" }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                              {ruleResults.map((rule) => (
                                <div key={rule.key} className="flex items-center gap-2">
                                  <motion.span
                                    animate={rule.passed ? { scale: [0.7, 1.15, 1] } : { scale: 1 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex h-4 w-4 items-center justify-center rounded-full shrink-0"
                                    style={{
                                      background: rule.passed ? "var(--pf-success)" : "transparent",
                                      border: rule.passed ? "none" : "1.5px solid var(--pf-border)",
                                    }}
                                  >
                                    {rule.passed && <Check size={10} color="#fff" strokeWidth={3} />}
                                  </motion.span>
                                  <span className="text-[11px]" style={{ color: rule.passed ? "var(--pf-text)" : "var(--pf-muted)" }}>
                                    {rule.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Form.Item
                            label="Confirm New Password" name="confirmPassword" dependencies={["newPassword"]}
                            rules={[
                              { required: true, message: "Re-enter your new password" },
                              ({ getFieldValue }) => ({
                                validator: (_, value) =>
                                  !value || getFieldValue("newPassword") === value
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Passwords do not match")),
                              }),
                            ]}
                          >
                            <Input.Password size="middle" className="!rounded-lg" placeholder="Re-enter new password" />
                          </Form.Item>
                        </Form>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* sticky footer actions */}
            {showFooter && (
              <div
                className="shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 rounded-b-xl border-t px-4 py-4 sm:px-6 lg:px-8"
                style={{ background: "var(--pf-card)", borderColor: "var(--pf-border)" }}
              >
                <button
                  type="button"
                  onClick={onFooterCancel}
                  className="rounded-lg border px-4 py-2 text-xs font-medium transition-colors hover:opacity-80 w-full sm:w-auto"
                  style={{ borderColor: "var(--pf-border)", color: "var(--pf-text)", background: "var(--pf-card)" }}
                >
                  Cancel
                </button>
                <Tooltip title={footerDisabled ? footerHint : ""}>
                  <button
                    type="button"
                    disabled={footerDisabled}
                    onClick={onFooterSave}
                    className="rounded-lg px-5 py-2 text-xs font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 w-full sm:w-auto"
                    style={{ background: "var(--pf-accent)" }}
                  >
                    {footerBusy ? (
                      <span className="inline-flex items-center gap-2 text-xs">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Saving…
                      </span>
                    ) : (
                      footerLabel
                    )}
                  </button>
                </Tooltip>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}