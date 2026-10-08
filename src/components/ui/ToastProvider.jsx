"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

const ToastContext = createContext(null);

const ICONS = {
  success: <FaCheckCircle className="text-emerald-500" size={16} />,
  error: <FaExclamationCircle className="text-red-500" size={16} />,
  info: <FaInfoCircle className="text-orange-600" size={16} />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "info") => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-300 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_10px_30px_rgba(0,0,0,0.12)] animate-[toast-in_0.2s_ease-out]"
          >
            {ICONS[t.type]}
            {t.message}
            <button onClick={() => dismiss(t.id)} className="ml-2 text-slate-300 hover:text-slate-500">
              <FaTimes size={11} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
