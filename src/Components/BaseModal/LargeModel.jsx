import Modal from "./Modal";

const LargeModal = ({
  show,
  title,
  message,
  children,
  onClose,
  type = "default",
  className = "",
}) => {
  // Pasamos size='large' y dejamos que Modal maneje el wrapper con scroll y tamaño máximo
  return (
    <Modal
      show={show}
      title={title}
      message={message}
      onClose={onClose}
      type={type}
      size="large"
      className={className}
    >
      {children}
    </Modal>
  );
};

export default LargeModal;
