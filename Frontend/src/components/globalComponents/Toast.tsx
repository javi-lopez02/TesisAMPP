// src/config/toast.ts
import { toast, type ExternalToast } from "sonner";
import { ToastContent } from "../../utils/toast.content";
import { getBaseOptions } from "../../utils/toast.base";

/**
 * Muestra un toast de éxito
 */
export const toastSuccess = (
  title?: string,
  message?: string,
  options?: ExternalToast,
) =>
  toast.custom(
    (t) => <ToastContent title={title} message={message} type="success" />,
    {
      ...getBaseOptions("success"),
      ...options,
    },
  );

/**
 * Muestra un toast de error
 */
export const toastError = (
  title?: string,
  message?: string,
  options?: ExternalToast,
) =>
  toast.custom(
    (t) => <ToastContent title={title} message={message} type="error" />,
    {
      ...getBaseOptions("error"),
      ...options,
    },
  );

/**
 * Muestra un toast informativo
 */
export const toastInfo = (
  title?: string,
  message?: string,
  options?: ExternalToast,
) =>
  toast.custom(
    (t) => <ToastContent title={title} message={message} type="info" />,
    {
      ...getBaseOptions("info"),
      ...options,
    },
  );

/**
 * Muestra un toast de advertencia
 */
export const toastWarning = (
  title?: string,
  message?: string,
  options?: ExternalToast,
) =>
  toast.custom(
    (t) => <ToastContent title={title} message={message} type="warning" />,
    {
      ...getBaseOptions("warning"),
      ...options,
    },
  );
