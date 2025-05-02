import React from "react";

interface ModalProps {
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const modalStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(3px)",
};

const contentStyle: React.CSSProperties = {
  background: "var(--vscode-editor-background, #fff)",
  color: "var(--vscode-editor-foreground, #222)",
  borderRadius: 8,
  minWidth: 320,
  maxWidth: "80%",
  width: "400px",
  maxHeight: "85vh",
  overflowY: "auto",
  padding: 24,
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  position: "relative",
  margin: "0 20px",
};

const closeBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: 12,
  right: 16,
  background: "none",
  border: "none",
  fontSize: 22,
  color: "var(--vscode-editor-foreground, #444)",
  cursor: "pointer",
};

const Modal: React.FC<ModalProps> = ({ onClose, title, children }) => {
  return (
    <div style={modalStyle} onClick={onClose}>
      <div
        style={contentStyle}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <button style={closeBtnStyle} onClick={onClose} aria-label="닫기">
          ×
        </button>
        {title && <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: 18 }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
