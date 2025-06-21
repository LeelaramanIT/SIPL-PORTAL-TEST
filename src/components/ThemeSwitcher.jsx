import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

const themes = [
  { name: "light", color: "#2563EB", label: "Light" },
  { name: "Light-Sky-Blue", color: "#93C5FD", label: "Sky Blue" },
  { name: "green", color: "#10B981", label: "Green" },
  { name: "orange", color: "#F97316", label: "Orange" },
  { name: "purple", color: "#8B5CF6", label: "Purple" },
  { name: "red", color: "#EF4444", label: "Red" },
  { name: "blue", color: "#3B82F6", label: "Blue" },
  { name: "yellow", color: "#F59E0B", label: "Yellow" },
  { name: "cyan", color: "#06B6D4", label: "Cyan" },
  { name: "pink", color: "#EC4899", label: "Pink" },
  { name: "navi-blue", color: "#1E3A8A", label: "Navi Blue" },
];

// Helper function to get current theme label
export const getCurrentThemeLabel = () => {
  const currentTheme = localStorage.getItem("theme") || "light";
  const theme = themes.find(t => t.name === currentTheme);
  return theme ? theme.label : "Light";
};

export default function ThemeSwitcher({ variant = "floating" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const buttonsRef = useRef([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const html = document.documentElement;
    themes.forEach((t) => html.classList.remove(`theme-${t.name}`));
    html.classList.add(`theme-${currentTheme}`);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const validButtons = buttonsRef.current.filter(Boolean);

    if (isOpen) {
      gsap.fromTo(
        validButtons,
        { opacity: 0.5, x: -20, display: "none" },
        {
          opacity: 1,
          x: 0,
          display: "block",
          duration: 0.3,
          stagger: 0.05,
          ease: "power1",
        }
      );
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
          <div className="absolute top-full right-0 mt-2 p-3 rounded-xl shadow-lg flex gap-2 bg-[var(--color-background)] border border-[var(--color-secondary)] min-w-[280px]">
            <div className="grid grid-cols-5 gap-2">
              {themes.map((theme, index) => (
                <button
                  key={theme.name}
                  ref={(el) => (buttonsRef.current[index] = el)}
                  onClick={() => {
                    setCurrentTheme(theme.name);
                    setIsOpen(false);
                  }}
                  title={`Switch to ${theme.label} theme`}
                  className={`w-[40px] h-[40px] rounded-lg transition duration-300 border-2 flex items-center justify-center ${
                    currentTheme === theme.name
                      ? "border-[var(--color-primary)] shadow-lg"
                      : "border-transparent hover:border-[var(--color-secondary)]"
                  }`}
                  style={{ backgroundColor: theme.color, display: "none" }}
                >
                  {currentTheme === theme.name && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white w-8 h-8 rounded-lg shadow-sm flex items-center justify-center text-sm font-bold cursor-pointer transition-colors duration-200"
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
      className="fixed bottom-3 left-6 z-10"
    >
      {isOpen && (
        <div className="mt-2 p-3 rounded-xl shadow-lg flex gap-2 bg-[var(--color-background)]">
          {themes.map((theme, index) => (
            <button
              key={theme.name}
              ref={(el) => (buttonsRef.current[index] = el)}
              onClick={() => setCurrentTheme(theme.name)}
              title={`Switch to ${theme.label} theme`}
              className={`w-[30px] h-[30px] rounded-full transition duration-300 border ${
                currentTheme === theme.name
                  ? "border-[3px] border-[var(--color-primary-hover)]"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: theme.color, display: "none" }}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[var(--color-primary)] dark:bg-gray-700 text-white w-10 h-10 rounded-full shadow-md flex items-center justify-center text-lg font-bold cursor-pointer"
        aria-label="Toggle Theme Picker"
      >
        🎨
      </button>
    </div>
  );
}
