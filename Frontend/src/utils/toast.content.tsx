import type { ReactNode } from "react";
import { TOAST_CONFIG, type ToastType } from "./toast.config";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

// ── Componente de Contenido del Toast ───────────────────────────────────────
interface ToastContentProps {
  title?: string;
  message?: string;
  type: ToastType;
}

export const ToastContent = ({ title, message, type }: ToastContentProps) => {
  const config = TOAST_CONFIG.colors[type];
  
  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 size={18} strokeWidth={2} className="shrink-0" />,
    error: <XCircle size={18} strokeWidth={2} className="shrink-0" />,
    info: <Info size={18} strokeWidth={2} className="shrink-0" />,
    warning: <AlertCircle size={18} strokeWidth={2} className="shrink-0" />,
  };

  return (
    <div className={`relative flex w-full items-start gap-3 rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 hover:shadow-lg ${config.wrapper}`}>
      {/* Barra de acento con gradiente */}
      <div className={`absolute left-0 top-1/2 h-10 w-1.5 -translate-y-1/2 rounded-r-full ${config.accent}`} />
      
      {/* Ícono con fondo suave */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconBg} transition-transform duration-200 hover:scale-105`}>
        {icons[type]}
      </div>

      {/* Contenido de texto con jerarquía clara */}
      <div className="flex-1 min-w-0 pt-0.5">
        {title && (
          <p className={`text-[14px] font-semibold leading-tight tracking-tight ${config.title}`}>
            {title}
          </p>
        )}
        {message && (
          <p className={`mt-1 text-[13px] leading-relaxed ${config.message}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};