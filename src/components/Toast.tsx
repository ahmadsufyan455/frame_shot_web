"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error";
  text: string;
}

interface ToastProps {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
}

function ToastItem({ message, onDismiss }: { message: ToastMessage; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const Icon = message.type === "success" ? CheckCircle2 : AlertCircle;
  const borderColor = message.type === "success" ? "border-green-800" : "border-red-800";
  const iconColor = message.type === "success" ? "text-green-400" : "text-red-400";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border ${borderColor} rounded-xl shadow-lg transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
      <span className="text-sm text-neutral-200 flex-1">{message.text}</span>
      <button onClick={onDismiss} className="text-neutral-500 hover:text-neutral-300 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function Toast({ messages, onDismiss }: ToastProps) {
  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[360px] max-w-[90vw]">
      {messages.map((msg) => (
        <ToastItem key={msg.id} message={msg} onDismiss={() => onDismiss(msg.id)} />
      ))}
    </div>
  );
}
