// index.js
import "./index.css";
import App from "./App.jsx";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
window.Buffer = Buffer;
export const BackendUrl = import.meta.env.VITE_BASE_URL



createRoot(document.getElementById("root")).render(<App />);
