export type FlashMessage = {
  message: string;
  variant: "success" | "error";
};

const FLASH_KEY = "wms_flash";

export function setFlashMessage(
  message: string,
  variant: FlashMessage["variant"] = "success",
) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, variant }));
}

export function consumeFlashMessage(): FlashMessage | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(FLASH_KEY);
  try {
    return JSON.parse(raw) as FlashMessage;
  } catch {
    return null;
  }
}

export const TOAST_EVENT = "wms-toast";

/** Tampilkan toast langsung tanpa redirect (halaman yang sama). */
export function showToast(
  message: string,
  variant: FlashMessage["variant"] = "success",
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<FlashMessage>(TOAST_EVENT, {
      detail: { message, variant },
    }),
  );
}
