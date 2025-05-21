// index.js
import "./index.css";
import App from "./App.jsx";
import { createRoot } from "react-dom/client";

// // ✅ Ensure dark mode is applied before rendering
// if (
//   localStorage.theme === "dark" ||
//   (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
// ) {
//         console.log("dark callled");
        
//   document.documentElement.classList.add("dark");
// } else {
//         console.log("dark removed");
//   document.documentElement.classList.remove("dark");
// }

createRoot(document.getElementById("root")).render(<App />);
