// AnimatedPopup.jsx
import { Modal } from "antd";

const AnimatedPopup = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  width = 520,
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={title}
      footer={footer}
      centered
      width={width}
    >
      {children}
    </Modal>
  );
};

export default AnimatedPopup;
