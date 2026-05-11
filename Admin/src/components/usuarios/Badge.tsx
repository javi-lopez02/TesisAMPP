// src/components/usuarios/Badge.tsx
interface BadgeProps {
  activo: boolean;
}

export const Badge = ({ activo }: BadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
      activo
        ? "bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#9FD97A]"
        : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40"
    }`}
  >
    {activo ? "Activo" : "Inactivo"}
  </span>
);