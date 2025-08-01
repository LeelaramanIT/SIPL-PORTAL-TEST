import { Modal } from "antd";
import Button from "./InputFields/Button"; // Assuming you're using a custom button for Confirm

const DialogBox = ({
  isOpen,
  onClose,
  title,
  message,
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = true,
  confirmText, // No default value anymore
}) => {
  const hasConfirm = !!confirmText;

  const renderFooter = () => {
    if (!showCancel && !hasConfirm) return null;

    return (
      <div key="footer-buttons" className="flex gap-4 justify-end">
        {showCancel && (
          <button
            key="cancel"
            onClick={() => {
              onCancel?.();
              onClose();
            }}
            className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
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
            className="dark:bg-green-700 dark:hover:bg-green-600"
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
    >
      <p className="text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-200">{message}</p>
    </Modal>
  );
};

export default DialogBox;
