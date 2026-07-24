import React, { createContext, useContext } from "react";

/* ================================================================== */
/*  THEME — shared across Work Order Planning and Order Summary        */
/* ================================================================== */

export const THEMES = {
  light: {
    mode: "light",
    bg: "#f3f5f9", surface: "#ffffff", surfaceAlt: "#f7f9fc", inset: "#eef1f6",
    border: "#e3e8f0", borderStrong: "#cfd7e3",
    text: "#151b28", sub: "#5a657a", faint: "#8d97ab",
    primary: "#3b5bdb", primarySoft: "rgba(59,91,219,0.09)", primaryBorder: "rgba(59,91,219,0.35)",
    success: "#12945f", successSoft: "rgba(18,148,95,0.11)",
    warn: "#c77414", warnSoft: "rgba(199,116,20,0.12)",
    danger: "#d92d20", dangerSoft: "rgba(217,45,32,0.10)",
    shadow: "0 1px 2px rgba(16,24,40,0.05), 0 4px 16px rgba(16,24,40,0.06)",
    shadowLg: "0 8px 30px rgba(16,24,40,0.12)",
    onPrimary: "#ffffff",
    haze: "radial-gradient(900px 420px at 12% -8%, rgba(59,91,219,0.07), transparent), radial-gradient(700px 360px at 96% 0%, rgba(18,148,95,0.05), transparent)",
  },
  dark: {
    mode: "dark",
    bg: "#0e131e", surface: "#151b2a", surfaceAlt: "#1a2133", inset: "#101625",
    border: "#27304a", borderStrong: "#36415f",
    text: "#e9edf6", sub: "#98a2ba", faint: "#5f6a84",
    primary: "#7c96f5", primarySoft: "rgba(124,150,245,0.13)", primaryBorder: "rgba(124,150,245,0.4)",
    success: "#3fd69a", successSoft: "rgba(63,214,154,0.13)",
    warn: "#f0a43a", warnSoft: "rgba(240,164,58,0.14)",
    danger: "#f5766b", dangerSoft: "rgba(245,118,107,0.13)",
    shadow: "0 1px 2px rgba(0,0,0,0.3), 0 6px 20px rgba(0,0,0,0.25)",
    shadowLg: "0 10px 36px rgba(0,0,0,0.45)",
    onPrimary: "#0e131e",
    haze: "radial-gradient(900px 420px at 12% -8%, rgba(124,150,245,0.08), transparent), radial-gradient(700px 360px at 96% 0%, rgba(63,214,154,0.05), transparent)",
  },
};

export const ThemeCtx = createContext(THEMES.light);
export const useT = () => useContext(ThemeCtx);

/* ================================================================== */
/*  SHARED HELPERS                                                     */
/* ================================================================== */

export const fmtDate = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
export const daysFromNow = (d) => Math.round((d - new Date()) / 86400000);

/* ================================================================== */
/*  SHARED UI PRIMITIVES                                               */
/* ================================================================== */

export function Pill({ tone = "neutral", children, icon: Icon }) {
  const t = useT();
  const map = {
    neutral: { c: t.sub, bg: t.inset },
    primary: { c: t.primary, bg: t.primarySoft },
    success: { c: t.success, bg: t.successSoft },
    warn: { c: t.warn, bg: t.warnSoft },
    danger: { c: t.danger, bg: t.dangerSoft },
  }[tone];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
      style={{ color: map.c, background: map.bg }}>
      {Icon && <Icon size={10} strokeWidth={2.6} />}{children}
    </span>
  );
}

export function SectionLabel({ children, right }) {
  const t = useT();
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <span className="text-[10.5px] font-bold uppercase tracking-[0.09em]" style={{ color: t.faint }}>{children}</span>
      {right}
    </div>
  );
}