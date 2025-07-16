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
  confirmText = 'Confirm',
}) => {
  return (
    <Modal
      open={isOpen}
      title={title}
      onCancel={() => {
        onCancel?.();
        onClose();
      }}
      footer={[
        showCancel ? (
          <div key="footer-buttons" className="flex gap-4 justify-end">
            <button
              key="cancel"
              onClick={() => {
                onCancel?.();
                onClose();
              }}
              className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-300"
            >
              {cancelText}
            </button>
            <Button
              key="confirm"
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              text={confirmText}
            />
          </div>
        ) : (
          <Button
            key="confirm"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            text={confirmText}
          />
        )
      ]}      
    >
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  );
};

export default DialogBox;
