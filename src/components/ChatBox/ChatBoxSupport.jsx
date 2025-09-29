import React, { useState, useRef, useEffect } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useLocation } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import toast from "react-hot-toast";
import LoadingButton from "../LoadingButton";

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
  const editorRef = useRef();

  useEffect(() => {
    if (pageUrl.current) {
      pageUrl.current.value = window.location.href;
    }
  }, [location]);

  useEffect(() => {
    setStatus({ message: "", type: null });
  }, [isOpen]);

  const [position, setPosition] = useState({
    x: window.innerWidth - 70,
    y: window.innerHeight - 100,
  });
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const widgetRef = useRef(null);
  const [isRightSide, setIsRightSide] = useState(true);
  const [isBottom, setIsBottom] = useState(true);

  // NEW: Ref to check if the clicked element can toggle the chat window
  const canToggleOnMouseUp = useRef(false);

  const snapToEdge = (x, y) => {
    setIsRightSide(x >= window.innerWidth / 2);
    setIsBottom(y >= window.innerHeight / 2);
    setPosition({ x, y });
  };

  // MODIFIED: Accepts a boolean to know if the element can toggle the view
  const handleMouseDown = (e, canToggle) => {
    // Prevent drag from starting if clicking on an interactive element inside the header
    if (e.target.tagName === "BUTTON" && !canToggle) return;

    isDragging.current = true;
    hasDragged.current = false;
    canToggleOnMouseUp.current = canToggle; // Set whether a click should toggle
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
    ) {
      hasDragged.current = true;
    }
  };

  // MODIFIED: Checks the new ref before toggling
  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Only toggle if no drag occurred AND the drag was initiated by a toggle-able element
    if (!hasDragged.current && canToggleOnMouseUp.current) {
      setIsOpen((prev) => !prev);
    }

    snapToEdge(position.x, position.y);
    hasDragged.current = false;
    canToggleOnMouseUp.current = false; // Reset for the next cycle
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [position]);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFileSelection = () => {
    setSelectedFiles([]);
    const input = document.getElementById("screenshot-file-input");
    if (input) input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setStatus({ message: "Please add a description.", type: "error" });
      return;
    }
    setIsSubmitting(true);
    setStatus({ message: "Sending report...", type: "loading" });
    try {
      const file = selectedFiles.length > 0 ? selectedFiles[0] : null;
      const base64Image = file ? await fileToBase64(file) : null;
      const payload = {
        fromEmail: userEmail?.current ? userEmail?.current.value : "",
        toEmail: supportEmailRef?.current ? supportEmailRef?.current.value : "",
        pageName: pageUrl?.current ? pageUrl.current.value : "URL N/A",
        description: description,
        screenshot: base64Image,
      };
      console.log("Mock POST:", payload);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus({ message: "Report sent successfully!", type: "success" });
      toast.success("Report sent successfully!");
      setDescription("");
      removeFileSelection();
      //  setIsOpen(false);
    } catch {
      setStatus({ message: "Error sending report.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        ref={widgetRef}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          position: "fixed",
        }}
        className="z-[1000] select-none"
      >
        {/* MODIFIED: The button is now a "drag and toggle" handle */}
        <button
          onMouseDown={(e) => handleMouseDown(e, true)} // Pass `true` to indicate this can toggle
          className="p-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] 
                   text-[var(--color-text)] rounded-full shadow-xl 
                   focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all cursor-move"
        >
          {isOpen ? <IoIosCloseCircleOutline /> : <IoChatboxEllipsesOutline />}
        </button>

        {/* Chat Box */}
        <div
          className={`absolute transition-all duration-300 ease-in-out transform ${
            isOpen
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
          style={{
            top: isBottom ? "auto" : "0",
            bottom: isBottom ? "0" : "auto",
            left: isRightSide ? "auto" : "100%",
            right: isRightSide ? "100%" : "auto",
            marginLeft: isRightSide ? "0" : "-10px",
            marginRight: isRightSide ? "-10px" : "0",
            marginTop: isBottom ? "0" : "10px",
            marginBottom: isBottom ? "10px" : "0",
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-80 md:w-96 flex flex-col max-h-[70vh]">
            {/* NEW: The header is now a "drag-only" handle */}
            <div
              className="p-4 bg-[var(--color-primary)] text-white rounded-t-xl flex justify-between items-center cursor-move"
              onMouseDown={(e) => handleMouseDown(e, false)} // Pass `false` to indicate this is drag-only
            >
              <h3 className="text-lg font-bold">Support & Feedback</h3>
              <button className="w-6 h-6" onClick={() => setIsOpen(false)}>
                {" "}
                <IoIosCloseCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-grow custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-4">
                {status.message && (
                  <div
                    className={`p-3 rounded-lg text-sm ${getStatusClasses()}`}
                  >
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
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-2 text-gray-900 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Support Team
                  </label>
                  <select
                    ref={supportEmailRef}
                    defaultValue={supportEmails[0]}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    {supportEmails?.map((email, i) => {
                      return (
                        <option key={i} value={email}>
                          {email}
                        </option>
                      );
                    })}
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
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-2 text-xs text-gray-500 dark:text-gray-400 truncate"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <Editor
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                    onInit={(evt, editor) => (editorRef.current = editor)}
                    value={description}
                    onEditorChange={(newContent) => setDescription(newContent)}
                    init={{
                      height: 250,
                      menubar: false,
                      branding: false,
                      plugins:
                        "anchor autolink charmap codesample emoticons link lists searchreplace visualblocks wordcount",
                      toolbar:
                        "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link emoticons | align lineheight | numlist bulllist indent outdent",
                      content_style:
                        "body { font-family:Helvetica,Arial,sans-serif; font-size:12px }",
                    }}
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
                    className="mt-1 ml-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    Upload File
                  </label>
                  <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {selectedFiles.length === 0 ? (
                      <span>No file chosen</span>
                    ) : (
                      <span>{selectedFiles.length} file(s) selected</span>
                    )}
                    {selectedFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={removeFileSelection}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-2 flex justify-center rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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
    </>
  );
};

export default SupportChat;
