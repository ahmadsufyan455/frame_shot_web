"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "warning" | "info";
}

export default function Dialog({
  open,
  onClose,
  title,
  description,
  actionLabel = "OK",
  onAction,
  variant = "info",
}: DialogProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  const accentColor = variant === "warning" ? "bg-red-500 hover:bg-red-400" : "bg-white hover:bg-neutral-200";
  const accentText = variant === "warning" ? "text-white" : "text-black";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-neutral-400 mb-6">{description}</p>

        <button
          onClick={onAction ?? onClose}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors active:scale-[0.98] ${accentColor} ${accentText}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
