import React from "react";
import { Modal } from "antd";
import Button from "./InputFields/Button"; 

const DialogBox = ({
  isOpen,
  onClose,
  title,
  message,
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = true,
  confirmText,
}) => {
  const hasConfirm = !!confirmText;

  const renderFooter = () => {
    if (!showCancel && !hasConfirm) return null;

    return (
      <div key="footer-buttons" className="flex gap-4 justify-end mt-4">
        {showCancel && (
          <button
            key="cancel"
            onClick={() => {
              onCancel?.();
              onClose();
            }}
            className="px-4 py-2 text-sm rounded-md transition-colors
              bg-gray-100 text-gray-700 hover:bg-gray-200 
              dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            {cancelText}
          </button>
        )}
        {hasConfirm && (
          <Button
            key="confirm"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            text={confirmText}
            className="dark:bg-green-700 dark:hover:bg-green-600 dark:text-white"
          />
        )}
      </div>
    );
  };

  return (
    <Modal
      open={isOpen}
      title={title}
      onCancel={() => {
        onCancel?.();
        onClose();
      }}
      footer={renderFooter()}
      // FIX: This class string overrides Ant Design's internal white styles
      className="
        [&_.ant-modal-content]:dark:bg-slate-900 
        [&_.ant-modal-header]:dark:bg-slate-900 
        [&_.ant-modal-header]:dark:border-slate-700
        [&_.ant-modal-title]:dark:text-slate-100 
        [&_.ant-modal-close]:dark:text-slate-400 
        [&_.ant-modal-close:hover]:dark:text-slate-100
      "
    >
      <p className="text-sm text-gray-600 dark:text-slate-300">
        {message}
      </p>
    </Modal>
  );
};

export default DialogBox;