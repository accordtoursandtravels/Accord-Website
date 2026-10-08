"use client";

import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-2 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={onClose}>
      <div className={`flex max-h-[calc(100dvh-1rem)] w-full ${maxWidth} flex-col overflow-hidden rounded-xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.25)] sm:max-h-[calc(100dvh-2rem)]`} onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-3.5 sm:px-6 sm:py-4">
          <h3 className="font-heading min-w-0 pr-4 text-base font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700" aria-label="Close"><FaTimes size={14} /></button>
        </div>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
