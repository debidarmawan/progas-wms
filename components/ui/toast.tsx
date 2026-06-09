"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  consumeFlashMessage,
  TOAST_EVENT,
  type FlashMessage,
} from "@/lib/flash";
import { cn } from "@/lib/utils/cn";

export function ToastHost() {
  const pathname = usePathname();
  const [toast, setToast] = useState<FlashMessage | null>(null);
  const [visible, setVisible] = useState(false);

  function display(message: FlashMessage) {
    setToast(message);
    requestAnimationFrame(() => setVisible(true));
  }

  useEffect(() => {
    const message = consumeFlashMessage();
    if (message) display(message);
  }, [pathname]);

  useEffect(() => {
    function handleToast(event: Event) {
      display((event as CustomEvent<FlashMessage>).detail);
    }
    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const hideTimer = setTimeout(() => setVisible(false), 3800);
    const clearTimer = setTimeout(() => setToast(null), 4200);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [toast]);

  if (!toast) return null;

  const isSuccess = toast.variant === "success";

  return (
    <div
      className={cn(
        "pointer-events-none fixed left-1/2 top-6 z-50 w-full max-w-md -translate-x-1/2 px-4 transition-all duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 opacity-0",
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-lg backdrop-blur-sm",
          isSuccess
            ? "border-emerald-200/80 bg-emerald-50/95 text-emerald-950"
            : "border-rose-200/80 bg-rose-50/95 text-rose-950",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            isSuccess ? "bg-emerald-600 text-white" : "bg-rose-600 text-white",
          )}
        >
          {isSuccess ? "✓" : "!"}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold">
            {isSuccess ? "Berhasil" : "Gagal"}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed opacity-90">
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg px-1.5 py-0.5 text-lg leading-none opacity-50 transition hover:opacity-100"
          onClick={() => {
            setVisible(false);
            setTimeout(() => setToast(null), 300);
          }}
          aria-label="Tutup"
        >
          ×
        </button>
      </div>
    </div>
  );
}
