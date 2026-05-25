import { memo } from "react";

// ── StatPill ──────────────────────────────────────────────────────────────────
export const StatPill = memo(({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center rounded-lg bg-[#f0f3fa] px-2.5 py-1 dark:bg-white/5">
    <span className="text-[13px] font-bold text-[#1B3D8F] dark:text-[#85B7EB]">{value}</span>
    <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/30">{label}</span>
  </div>
));