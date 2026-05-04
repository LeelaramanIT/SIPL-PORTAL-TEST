import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { gsap } from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../Redux/Slices/GlobalSlice";

const themes = [
  { name: "light", color: "#2563EB", label: "Light", icon: "☀️" },
  { name: "light-sky-blue", color: "#93C5FD", label: "Sky Blue", icon: "🌤️" },
  { name: "green", color: "#10B981", label: "Green", icon: "🌿" },
  { name: "orange", color: "#F97316", label: "Orange", icon: "🍊" },
  { name: "purple", color: "#8B5CF6", label: "Purple", icon: "🔮" },
  { name: "red", color: "#EF4444", label: "Red", icon: "❤️" },
  { name: "blue", color: "#3B82F6", label: "Blue", icon: "🌊" },
  { name: "yellow", color: "#F59E0B", label: "Yellow", icon: "⭐" },
  { name: "cyan", color: "#06B6D4", label: "Cyan", icon: "💎" },
  { name: "pink", color: "#EC4899", label: "Pink", icon: "🌸" },
  { name: "navi-blue", color: "#1E3A8A", label: "Navi Blue", icon: "🌙" },
  { 
    name: "auto", 
    gradient: "linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff)",
    label: "Auto", 
    icon: "⚡" 
  },
];

// Memoize theme names to avoid recalculation
const themeNames = themes.map((t) => t.name).filter((t) => t !== "auto");

export default function ThemeSwitcher({ variant = "floating" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => 
    localStorage.getItem("theme") || "light"
  );
  const [autoMode, setAutoMode] = useState(() => 
    localStorage.getItem("theme") === "auto"
  );

  const isDark = useSelector((state) => state.global.isDark);
  const dispatch = useDispatch();

  const buttonsRef = useRef([]);
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  // Memoize the toggle handler
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Handle theme change - memoized
  const handleThemeChange = useCallback(
    (themeName) => {
      if (themeName === "auto") {
        setAutoMode(true);
        setCurrentTheme("auto");
        localStorage.setItem("theme", "auto");
      } else {
        setAutoMode(false);
        setCurrentTheme(themeName);
      }
      if (variant === "navbar") {
        setIsOpen(false);
      }
    },
    [variant]
  );

  // Dark mode effect - optimized
  useEffect(() => {
    const html = document.documentElement;
    const method = isDark ? "add" : "remove";
    html.classList[method]("dark");
    localStorage.setItem("darkMode", isDark);
  }, [isDark]);

  // GSAP animation effect - optimized with cleanup
  useEffect(() => {
    if (!isOpen) return;

    // Cancel any existing animation
    if (animationRef.current) {
      animationRef.current.kill();
    }

    const validButtons = buttonsRef.current.filter(Boolean);
    if (!validButtons.length) return;

    // Use a single timeline for better performance
    const tl = gsap.timeline();

    if (containerRef.current) {
      tl.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.9, y: -10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "back.out(1.7)",
        },
        0
      );
    }

    tl.fromTo(
      validButtons,
      { opacity: 0, scale: 0.8, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "back.out(1.7)",
      },
      0.1
    );

    animationRef.current = tl;

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [isOpen]);

  // Auto theme rotation effect - optimized
  useEffect(() => {
    if (!autoMode) return;

    let index = 0;
    const html = document.documentElement;

    const interval = setInterval(() => {
      // Remove old theme class
      const oldTheme = themeNames[index];
      html.classList.remove(`theme-${oldTheme}`);

      // Move to next theme
      index = (index + 1) % themeNames.length;
      const nextTheme = themeNames[index];

      // Add new theme class
      html.classList.add(`theme-${nextTheme}`);
      dispatch(setTheme(nextTheme));
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [autoMode, dispatch]);

  // Manual theme application effect - optimized
  useEffect(() => {
    if (currentTheme === "auto") return;

    const html = document.documentElement;

    // Batch DOM updates
    requestAnimationFrame(() => {
      // Remove all theme classes at once
      themeNames.forEach((name) => {
        html.classList.remove(`theme-${name}`);
      });

      // Add new theme class
      html.classList.add(`theme-${currentTheme}`);
    });

    localStorage.setItem("theme", currentTheme);
    dispatch(setTheme(currentTheme));
  }, [currentTheme, dispatch]);

  // Click outside handler - optimized
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Use capture phase for better performance
    document.addEventListener("mousedown", handleClickOutside, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isOpen]);

  // Memoize theme buttons to prevent re-renders
  const themeButtons = useMemo(
    () =>
      themes.map((theme, index) => (
        <button
          key={theme.name}
          ref={(el) => {
            if (el) buttonsRef.current[index] = el;
          }}
          onClick={() => handleThemeChange(theme.name)}
          title={`Switch to ${theme.label} theme`}
          className={`${
            variant === "navbar" ? "w-[45px] h-[45px]" : "w-[35px] h-[35px]"
          } rounded-xl transition-all duration-300 border-2 flex ${
            variant === "navbar" ? "flex-col gap-1" : ""
          } items-center justify-center hover:scale-110 hover:shadow-lg ${
            currentTheme === theme.name
              ? "border-[var(--accent)] shadow-lg scale-105"
              : "border-transparent hover:border-[var(--secondary)]"
          }`}
          style={
            theme.gradient
              ? { backgroundImage: theme.gradient }
              : { backgroundColor: theme.color }
          }
        >
          {variant === "navbar" && <span className="text-xs">{theme.icon}</span>}
          {currentTheme === theme.name && (
            <span className="text-white text-xs font-bold">✓</span>
          )}
        </button>
      )),
    [currentTheme, handleThemeChange, variant]
  );

  if (variant === "navbar") {
    return (
      <div ref={wrapperRef} className="relative">
        {isOpen && (
          <div
            ref={containerRef}
            className="absolute top-full right-0 mt-2 p-4 rounded-xl shadow-2xl glass border border-[var(--border)] min-w-[320px] animate-fade-in"
          >
            <div className="mb-3">
              <h3 className="text-sm font-semibold dark:text-white text-[var(--text)] mb-2">
                Choose Theme
              </h3>
            </div>
            <div className="grid grid-cols-5 gap-3">{themeButtons}</div>
          </div>
        )}
        <button
          onClick={toggleOpen}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white w-8 h-8 rounded-lg shadow-sm flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
          aria-label="Toggle Theme Picker"
        >
          🎨
        </button>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-6 left-6 z-50 flex flex-col gap-3"
    >
      {isOpen && (
        <div
          ref={containerRef}
          className="mb-3 p-4 rounded-2xl shadow-2xl glass border border-[var(--border)] animate-fade-in-up"
        >
          <div className="mb-3">
            <h3 className="text-sm font-semibold dark:text-white text-[var(--text)] mb-2">
              Themes
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">{themeButtons}</div>
        </div>
      )}
      <button
        onClick={toggleOpen}
        className="bg-[var(--primary)] dark:text-white hover:bg-[var(--primary-hover)] text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl animate-bounce-in"
        aria-label="Toggle Theme Picker"
      >
        🎨
      </button>
    </div>
  );
} 