import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();

    // Use functional update to avoid race conditions when adding rapidly
    let added = false;
    setToasts(prev => {
      if (prev.some(t => t.message === message && t.type === type)) {
        return prev; // already present
      }
      added = true;
      return [...prev, { id, message, type }];
    });

    if (added && duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return added ? id : null;
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Integrate window.alert -> toast while provider mounted
  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalAlert = window.alert;
    window.alert = (msg, type = "info") => {
      try {
        addToast(typeof msg === "string" ? msg : String(msg), type || "info", 4000);
      } catch {
        // fallback to original alert if something goes wrong
        try {
          originalAlert(msg);
        } catch {
          /* noop */
        }
      }
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [addToast]);

  // Separar toasts por tipo
  const successToasts = toasts.filter(t => t.type === "success");
  const otherToasts = toasts.filter(t => t.type !== "success");

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toasts de éxito - superior y centro */}
      <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 9999 }}>
        {successToasts.map(t => (
          <div
            key={t.id}
            style={{
              marginTop: 8,
              minWidth: 260,
              padding: "10px 14px",
              borderRadius: 6,
              color: "#fff",
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
              background: "#2e7d32"
            }}>
            {t.message}
          </div>
        ))}
      </div>
      {/* Otros toasts - inferior derecha */}
      <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9999 }}>
        {otherToasts.map(t => (
          <div
            key={t.id}
            style={{
              marginTop: 8,
              minWidth: 260,
              padding: "10px 14px",
              borderRadius: 6,
              color: "#fff",
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
              background: t.type === "error" ? "#e53935" : "#3b82f6"
            }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx.addToast;
};

export default ToastProvider;
