// ── Configuración Centralizada ──────────────────────────────────────────────
export const TOAST_CONFIG = {
  duration: {
    success: 3000,
    error: 5000,
    info: 4000,
    warning: 4000,
  } as const,
  
  position: "bottom-right" as const,
  
  maxWidth: "380px",
  
  colors: {
    success: {
      wrapper: "border-[#C0DD97]/60 bg-white/95 dark:bg-[#0e1a35]/95 dark:border-[#3B6D11]/40 shadow-[0_8px_32px_rgba(59,109,17,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
      accent: "bg-gradient-to-b from-[#3B6D11] to-[#2d5509]",
      iconBg: "bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#3B6D11]/15 dark:text-[#9FD97A]",
      title: "text-[#0e1f4d] dark:text-white",
      message: "text-gray-500 dark:text-white/50",
    },
    error: {
      wrapper: "border-[#F09595]/60 bg-white/95 dark:bg-[#0e1a35]/95 dark:border-[#CC1A2E]/40 shadow-[0_8px_32px_rgba(204,26,46,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
      accent: "bg-gradient-to-b from-[#CC1A2E] to-[#a31525]",
      iconBg: "bg-[#FCEBEB] text-[#CC1A2E] dark:bg-[#CC1A2E]/15 dark:text-[#F09595]",
      title: "text-[#0e1f4d] dark:text-white",
      message: "text-gray-500 dark:text-white/50",
    },
    info: {
      wrapper: "border-[#A8D0EB]/60 bg-white/95 dark:bg-[#0e1a35]/95 dark:border-[#1B3D8F]/40 shadow-[0_8px_32px_rgba(27,61,143,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
      accent: "bg-gradient-to-b from-[#1B3D8F] to-[#142e6b]",
      iconBg: "bg-[#E6F1FB] text-[#1B3D8F] dark:bg-[#1B3D8F]/15 dark:text-[#85B7EB]",
      title: "text-[#0e1f4d] dark:text-white",
      message: "text-gray-500 dark:text-white/50",
    },
    warning: {
      wrapper: "border-[#E8C57A]/60 bg-white/95 dark:bg-[#0e1a35]/95 dark:border-[#B77C1B]/40 shadow-[0_8px_32px_rgba(183,124,27,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
      accent: "bg-gradient-to-b from-[#B77C1B] to-[#8b5e15]",
      iconBg: "bg-[#F5E6C8] text-[#B77C1B] dark:bg-[#B77C1B]/15 dark:text-[#E8C57A]",
      title: "text-[#0e1f4d] dark:text-white",
      message: "text-gray-500 dark:text-white/50",
    },
  } as const,
};

export type ToastType = keyof typeof TOAST_CONFIG.colors;