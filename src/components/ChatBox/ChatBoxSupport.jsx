import React, { useState, useRef, useEffect } from "react";
import { IoIosCloseCircle, IoIosCloseCircleOutline } from "react-icons/io";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingButton from "../LoadingButton";
import {
  MdFormatStrikethrough,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatClear,
} from "react-icons/md";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });


const CustomTextEditor = ({
  value,
  onChange,
  placeholder = "Describe your issue...",
}) => {
  const editorRef = useRef(null);

  // Set initial content only once
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // This ensures the browser knows exactly where to apply the command.
  const execCommand = (command, value = null) => {
    editorRef.current.focus(); // Ensure focus first
    document.execCommand(command, false, value);
    handleInput();
  };

  return (
    <div className="border border-gray-300 rounded-lg">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        {/* Paragraph Format Button */}
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "P")}
          title="Paragraph"
          className="p-1 hover:bg-gray-200 rounded"
        >
           P
        </button>

        <span className="mx-1 border-l border-gray-300"></span>

        {/* Basic Formatting Group */}
        <button
          type="button"
          onClick={() => execCommand("bold")}
          title="Bold"
          className="p-1 hover:bg-gray-200 rounded"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          title="Italic"
          className="p-1 hover:bg-gray-200 rounded"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          title="Underline"
          className="p-1 hover:bg-gray-200 rounded"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => execCommand("strikeThrough")}
          title="Strikethrough"
          className="p-1 hover:bg-gray-200 rounded"
        >
          <MdFormatStrikethrough size={20} />
        </button>

        <span className="mx-1 border-l border-gray-300"></span>

        {/* List Formatting Group */}
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          title="Bullet List"
          className="p-1 hover:bg-gray-200 rounded"
        >
          <MdFormatListBulleted size={20} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          title="Numbered List"
          className="p-1 hover:bg-gray-200 rounded"
        >
          <MdFormatListNumbered size={20} />
        </button>

        <span className="mx-1 border-l border-gray-300"></span>

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={() => execCommand("removeFormat")}
          title="Remove Formatting"
          className="p-1 hover:bg-gray-200 rounded text-red-600"
        >
          <MdFormatClear size={20} />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[150px] p-4 focus:outline-none"
        style={{ direction: "ltr", textAlign: "left" }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState({ message: "", type: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const userEmail = useRef(null);
  const [description, setDescription] = useState("");
  const supportEmails = [
    "support@yourcompany.com",
    "harish@sun-tws.com",
    "leelaraman@sun-tws.com",
  ];
  const supportEmailRef = useRef(null);
  const pageUrl = useRef(null);
  const location = useLocation();

  const [position, setPosition] = useState({
    x: window.innerWidth - 1511,
    y: window.innerHeight - 130,
  });
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const widgetRef = useRef(null);
  const [isRightSide, setIsRightSide] = useState(true);
  const [isBottom, setIsBottom] = useState(true);
  const canToggleOnMouseUp = useRef(false);

  const initialTouchCoords = useRef({ x: 0, y: 0 });
  const DRAG_THRESHOLD = 5;

  useEffect(() => {
    if (pageUrl.current) pageUrl.current.value = window.location.href;
  }, [location]);

  useEffect(() => setStatus({ message: "", type: null }), [isOpen]);

  // Reset position on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition({
        x: window.innerWidth - 70,
        y: window.innerHeight - 100,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const snapToEdge = (x, y) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    setIsRightSide(x >= screenWidth / 2);
    setIsBottom(y >= screenHeight / 2);

    const clampedX = Math.max(10, Math.min(x, screenWidth - 60));
    const clampedY = Math.max(10, Math.min(y, screenHeight - 60));

    setPosition({ x: clampedX, y: clampedY });
  };

  // ---------- Mouse Handlers ----------
  const handleMouseDown = (e, canToggle) => {
    if (!e.target.closest("button") && !canToggle) return;

    isDragging.current = true;
    hasDragged.current = false;
    canToggleOnMouseUp.current = canToggle;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    setPosition({ x: newX, y: newY });
    if (
      !hasDragged.current &&
      (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2)
    )
      hasDragged.current = true;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (!hasDragged.current && canToggleOnMouseUp.current)
      setIsOpen((prev) => !prev);
    snapToEdge(position.x, position.y);
    hasDragged.current = false;
    canToggleOnMouseUp.current = false;
  };

  // ---------- Touch Handlers ----------
  const handleTouchStart = (e, canToggle) => {
    const touch = e.touches[0];
    if (!e.target.closest("button") && !canToggle) return;

    isDragging.current = true;
    hasDragged.current = false;
    canToggleOnMouseUp.current = canToggle;
    dragOffset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
    initialTouchCoords.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.current.x;
    const newY = touch.clientY - dragOffset.current.y;
    setPosition({ x: newX, y: newY });
    if (
      !hasDragged.current &&
      (Math.abs(touch.clientX - initialTouchCoords.current.x) >
        DRAG_THRESHOLD ||
        Math.abs(touch.clientY - initialTouchCoords.current.y) > DRAG_THRESHOLD)
    )
      hasDragged.current = true;

    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    const wasDragged = hasDragged.current;
    isDragging.current = false;
    if (!wasDragged && canToggleOnMouseUp.current) setIsOpen((prev) => !prev);
    snapToEdge(position.x, position.y);
    hasDragged.current = false;
    canToggleOnMouseUp.current = false;
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [position]);

  // ---------- Helpers ----------
  const getStatusClasses = () => {
    if (!status.type) return "hidden";
    switch (status.type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "loading":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "";
    }
  };

  const handleFileChange = (e) => setSelectedFiles(Array.from(e.target.files));
  const removeFileSelection = () => {
    setSelectedFiles([]);
    document.getElementById("screenshot-file-input").value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim())
      return setStatus({ message: "Please add a description.", type: "error" });
    setIsSubmitting(true);
    setStatus({ message: "Sending report...", type: "loading" });
    try {
      const file = selectedFiles[0];
      const base64Image = file ? await fileToBase64(file) : null;
      const payload = {
        fromEmail: userEmail.current?.value || "",
        toEmail: supportEmailRef.current?.value || "",
        pageName: pageUrl.current?.value || "URL N/A",
        description,
        screenshot: base64Image,
      };
      console.log("Mock POST:", payload);
      await new Promise((r) => setTimeout(r, 1500));
      setStatus({ message: "Report sent successfully!", type: "success" });
      toast.success("Report sent successfully!");
      setDescription("");
      removeFileSelection();
    } catch {
      setStatus({ message: "Error sending report.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close chat when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        widgetRef.current &&
        !widgetRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // ---------- Render ----------
  return (
    <div
      ref={widgetRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: "fixed",
        touchAction: "none",
      }}
      className="z-[1000] select-none"
    >
      {/* Toggle Button */}
      <button
        onMouseDown={(e) => handleMouseDown(e, true)}
        onTouchStart={(e) => handleTouchStart(e, true)}
        className="p-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text)] rounded-full shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all cursor-move sm:cursor-pointer touch-none"
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        {isOpen ? (
          <IoIosCloseCircleOutline size={20} />
        ) : (
          <IoChatboxEllipsesOutline size={20} />
        )}
      </button>

      {/* Chat Box */}
      <div
        className={`fixed sm:absolute transition-all duration-300 ease-in-out transform ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 pointer-events-none translate-y-4"
        }`}
        style={{
          top: window.innerWidth < 640 ? "0" : isBottom ? "auto" : "0",
          bottom: window.innerWidth < 640 ? "0" : isBottom ? "0" : "auto",
          left: window.innerWidth < 640 ? "0" : isRightSide ? "auto" : "100%",
          right: window.innerWidth < 640 ? "0" : isRightSide ? "100%" : "auto",
          marginLeft:
            window.innerWidth < 640 ? "0" : isRightSide ? "0" : "-10px",
          marginRight:
            window.innerWidth < 640 ? "0" : isRightSide ? "-10px" : "0",
          marginTop: window.innerWidth < 640 ? "0" : isBottom ? "0" : "10px",
          marginBottom: window.innerWidth < 640 ? "0" : isBottom ? "10px" : "0",
          width:
            window.innerWidth < 640
              ? "100vw"
              : window.innerWidth < 768
              ? "20rem"
              : "24rem",
          height: window.innerWidth < 640 ? "100vh" : "auto",
          maxHeight: window.innerWidth < 640 ? "100vh" : "80vh",
          zIndex: 1001,
        }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-none sm:rounded-xl shadow-2xl w-[22rem] sm:h-[30rem] flex flex-col">
          {/* Header */}
          <div
            className="p-4 bg-[var(--color-primary)] text-white rounded-t-none sm:rounded-t-xl flex justify-between items-center cursor-move sm:cursor-move"
            onMouseDown={(e) => handleMouseDown(e, false)}
            onTouchStart={(e) => handleTouchStart(e, false)}
          >
            <h3 className="text-lg sm:text-lg font-bold">Support & Feedback</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center"
              aria-label="Close support chat"
            >
              <IoIosCloseCircle className="w-6 h-6 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-grow custom-scrollbar text-sm sm:text-base">
            <form onSubmit={handleSubmit} className="space-y-4">
              {status.message && (
                <div className={`p-3 rounded-lg text-sm ${getStatusClasses()}`}>
                  {status.message}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Email
                </label>
                <input
                  ref={userEmail}
                  type="email"
                  placeholder="kaja.it@sun-tws.com"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-gray-100 text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Support Team
                </label>
                <select
                  ref={supportEmailRef}
                  defaultValue={supportEmails[0]}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base"
                >
                  {supportEmails.map((email, i) => (
                    <option key={i} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page URL
                </label>
                <input
                  type="text"
                  ref={pageUrl}
                  readOnly
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-2 text-xs text-gray-500 dark:text-gray-400 truncate"
                />
              </div>

              {/* Custom Text Editor */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <CustomTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe your issue or feedback..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Screenshot
                </label>
                <input
                  id="screenshot-file-input"
                  type="file"
                  accept="image/png, image/jpeg"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="screenshot-file-input"
                  className="mt-1 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer w-full justify-center"
                >
                  Upload File
                </label>
                <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400 justify-between">
                  {selectedFiles.length === 0 ? (
                    <span>No file chosen</span>
                  ) : (
                    <span>{selectedFiles.length} file(s) selected</span>
                  )}
                  {selectedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={removeFileSelection}
                      className="ml-2 text-red-500 hover:text-red-700 p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-2 flex justify-center items-center rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-base font-medium"
              >
                {isSubmitting ? (
                  <LoadingButton
                    className="w-full flex justify-center rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    text="Submitting..."
                  />
                ) : (
                  "Send Report"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportChat;
