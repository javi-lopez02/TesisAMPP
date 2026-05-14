export const ResumenCard = ({
  color,
  label,
  value,
  sub,
  icon: Icon,
  iconColor,
}: {
  color: string;
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  iconColor: string;
}) => (
  <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
    <div className={`absolute inset-x-0 top-0 h-0.75 ${color}`} />
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
        {label}
      </p>
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconColor}`}
      >
        <Icon size={14} />
      </div>
    </div>
    <p className="text-[22px] font-bold leading-none text-[#0e1f4d] dark:text-white">
      {value}
    </p>
    <p className="mt-1.5 text-[11px] text-gray-400 dark:text-white/40">{sub}</p>
  </div>
);
