import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useSelector } from "react-redux";

const themes = [
  { name: "light", color: "#2563EB", label: "Light", icon: "☀️" },
  { name: "Light-Sky-Blue", color: "#93C5FD", label: "Sky Blue", icon: "🌤️" },
  { name: "green", color: "#10B981", label: "Green", icon: "🌿" },
  { name: "orange", color: "#F97316", label: "Orange", icon: "🍊" },
  { name: "purple", color: "#8B5CF6", label: "Purple", icon: "🔮" },
  { name: "red", color: "#EF4444", label: "Red", icon: "❤️" },
  { name: "blue", color: "#3B82F6", label: "Blue", icon: "🌊" },
  { name: "yellow", color: "#F59E0B", label: "Yellow", icon: "⭐" },
  { name: "cyan", color: "#06B6D4", label: "Cyan", icon: "💎" },
  { name: "pink", color: "#EC4899", label: "Pink", icon: "🌸" },
  { name: "navi-blue", color: "#1E3A8A", label: "Navi Blue", icon: "🌙" },
];


export default function ThemeSwitcher({ variant = "floating" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const isDark = useSelector((state) => state.global.isDark);
  const buttonsRef = useRef([]);
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const html = document.documentElement;
    themes.forEach((t) => html.classList.remove(`theme-${t.name}`));
    html.classList.add(`theme-${currentTheme}`);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDark);
  }, [isDark]);

  useEffect(() => {
    const validButtons = buttonsRef.current.filter(Boolean);

    if (isOpen) {
      gsap.fromTo(
        validButtons,
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1.7)",
        }
      );

      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.9, y: -10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "back.out(1.7)",
        }
      );
    } else {
      gsap.to(validButtons, {
        opacity: 0,
        scale: 0.8,
        y: 20,
        duration: 0.2,
        stagger: 0.02,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  // Detect outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navbar variant
  if (variant === "navbar") {
    return (
      <div ref={wrapperRef} className="relative">
        {isOpen && (
          <div 
            ref={containerRef}
            className="absolute top-full right-0 mt-2 p-4 rounded-xl shadow-2xl glass border border-[var(--color-border)] min-w-[320px] animate-fade-in"
          >
            <div className="mb-3">
              <h3 className="text-sm font-semibold dark:text-white text-[var(--color-text)] mb-2">Choose Theme</h3>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {themes.map((theme, index) => (
                <button
                  key={theme.name}
                  ref={(el) => (buttonsRef.current[index] = el)}
                  onClick={() => {
                    setCurrentTheme(theme.name);
                    setIsOpen(false);
                  }}
                  title={`Switch to ${theme.label} theme`}
                  className={`w-[45px] h-[45px] rounded-xl transition-all duration-300 border-2 flex flex-col items-center justify-center gap-1 hover:scale-110 hover:shadow-lg ${
                    currentTheme === theme.name
                      ? "border-[var(--color-accent)] shadow-lg scale-105"
                      : "border-transparent hover:border-[var(--color-secondary)]"
                  }`}
                  style={{ backgroundColor: theme.color }}
                >
                  <span className="text-xs">{theme.icon}</span>
                  {currentTheme === theme.name && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white w-8 h-8 rounded-lg shadow-sm flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
          aria-label="Toggle Theme Picker"
        >
          🎨
        </button>
      </div>
    );
  }

  // Floating variant (original)
  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-6 left-6 z-50 flex flex-col gap-3"
    >
      {isOpen && (
        <div 
          ref={containerRef}
          className="mb-3 p-4 rounded-2xl shadow-2xl glass border border-[var(--color-border)] animate-fade-in-up"
        >
          <div className="mb-3">
            <h3 className="text-sm font-semibold dark:text-white text-[var(--color-text)] mb-2">Themes</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme, index) => (
              <button
                key={theme.name}
                ref={(el) => (buttonsRef.current[index] = el)}
                onClick={() => setCurrentTheme(theme.name)}
                title={`Switch to ${theme.label} theme`}
                className={`w-[35px] h-[35px] rounded-lg transition-all duration-300 border-2 flex items-center justify-center hover:scale-110 hover:shadow-md ${
                  currentTheme === theme.name
                    ? "border-[var(--color-accent)] shadow-lg scale-105"
                    : "border-transparent hover:border-[var(--color-secondary)]"
                }`}
                style={{ backgroundColor: theme.color }}
              >
                {currentTheme === theme.name && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[var(--color-primary)] dark:text-white hover:bg-[var(--color-primary-hover)] text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl animate-bounce-in"
        aria-label="Toggle Theme Picker"
      >
        🎨
      </button>
    </div>
  );
}
