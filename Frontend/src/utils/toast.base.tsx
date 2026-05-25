import type { ExternalToast } from "sonner";
import { TOAST_CONFIG, type ToastType } from "./toast.config";

export const getBaseOptions = (type: ToastType): ExternalToast => ({
  duration: TOAST_CONFIG.duration[type],
  position: TOAST_CONFIG.position,
  style: {
    background: "transparent",
    border: "none",
    padding: "0",
    boxShadow: "none",
    maxWidth: TOAST_CONFIG.maxWidth,
    zIndex: 9999,
  },
  classNames: {
    toast: "p-0 m-0 w-full",
    description: "m-0",
    closeButton:
      "text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/60",
  },
  closeButton: true,
});
