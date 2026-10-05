import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sun, Moon } from "lucide-react";
import { setIsDark } from "../../Redux/Slices/GlobalSlice";

const DarkModeToggle = () => {
  const isDark = useSelector((state) => state.global.isDark);
  const dispatch = useDispatch();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    dispatch(setIsDark(!isDark)); // send a boolean
  };

  return (
    <button
      onClick={toggleTheme}
      title="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-white transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
};

export default DarkModeToggle;
