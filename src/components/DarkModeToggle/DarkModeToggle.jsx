import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../../Redux/Slices/GlobalSlice";
import "./DarkModeToggle.css";

const DarkModeToggle = () => {
  const theme = useSelector((state) => state.global.theme);
  const dispatch = useDispatch();

  const isDark = theme === "dark";

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    dispatch(setTheme(isDark ? "light" : "dark"));
  };

  return (
    <div>
      <input
        type="checkbox"
        className={`checkbox`}
        id="checkbox"
        checked={isDark}
        onChange={toggleTheme}
      />
      <label htmlFor="checkbox" className="checkbox-label">
        <i className="fas fa-sun"></i>
        <i className="fas fa-moon"></i>
        <span className="ball"></span>
      </label>
    </div>
  );
};

export default DarkModeToggle;
