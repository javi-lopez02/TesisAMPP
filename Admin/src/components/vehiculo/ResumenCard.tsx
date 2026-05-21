// src/components/vehiculos/ResumeCard.tsx
import type { LucideIcon } from "lucide-react";

interface ResumenCardProps {
  color: string;
  label: string;
  value: string | number;
  sub: string;
  icon?: LucideIcon;
  iconColor?: string;
}

export const ResumenCard = ({ color, label, value, sub, icon: Icon, iconColor }: ResumenCardProps) => (
  <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
    <div className={`absolute inset-x-0 top-0 h-0.75 ${color}`} />
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
      {label}
    </p>
    <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
      {value}
    </p>
    <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
      {sub}
    </p>
    {Icon && (
      <div className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg ${iconColor || "bg-gray-100 dark:bg-white/10"}`}>
        <Icon size={14} />
      </div>
    )}
  </div>
);