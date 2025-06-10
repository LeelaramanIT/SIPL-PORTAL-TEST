import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

const themes = [
  { name: "light", color: "#1D293D" },
  { name: "Light-Sky-Blue", color: "#93C5FD" },
  { name: "green", color: "#10B981" },
  { name: "orange", color: "#F97316" },
  { name: "purple", color: "#8B5CF6" },
  { name: "red", color: "#EF4444" },
  { name: "blue", color: "#3B82F6" },
  { name: "yellow", color: "#F59E0B" },
  { name: "cyan", color: "#06B6D4" },
  { name: "pink", color: "#EC4899" },
];

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const buttonsRef = useRef([]);
  const wrapperRef = useRef(null); // NEW: Wrapper ref

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

  // 🧠 Detect outside clicks
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
              title={`Switch to ${theme.name} theme`}
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
