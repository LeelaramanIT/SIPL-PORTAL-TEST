import React, { useRef } from "react";
import { Modal } from "antd";
import toast from "react-hot-toast";

// Shows the exact body that Save sends to the API.
const ExportJsonModal = ({ open, payload, routeName, onClose }) => {
  const preRef = useRef(null);
  const json = payload ? JSON.stringify(payload, null, 2) : "";

  const copy = () =>
    navigator.clipboard
      .writeText(json)
      .then(() => toast.success("Copied"))
      .catch(() => {
        const range = document.createRange();
        range.selectNodeContents(preRef.current);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        toast("Selected: press Ctrl+C to copy");
      });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Order route JSON"
      width={720}
      footer={[
        <button key="close" type="button" onClick={onClose} className="mr-2 rounded-md border border-slate-200 px-3 py-1.5 text-[13px] font-semibold">
          Close
        </button>,
        <button key="copy" type="button" onClick={copy} className="rounded-md bg-indigo-600 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-indigo-700">
          Copy JSON
        </button>,
      ]}
    >
      <p className="mb-2 text-[13px] text-slate-500">This is the body Save sends to the API for “{routeName}”.</p>
      <pre ref={preRef} className="custom-scrollbar m-0 max-h-[55vh] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11.5px]">
        {json}
      </pre>
    </Modal>
  );
};

export default ExportJsonModal;
