export const StatPill = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center rounded-lg bg-[#f0f3fa] px-3 py-1.5 dark:bg-white/5">
    <span className="text-[14px] font-bold text-[#1B3D8F] dark:text-[#85B7EB]">
      {value}
    </span>
    <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/30">
      {label}
    </span>
  </div>
);