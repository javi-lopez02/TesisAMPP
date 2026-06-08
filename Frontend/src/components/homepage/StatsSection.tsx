import type { StatCard } from "./HelpersHomePage";

interface Props {
  stats: StatCard[];
}

export const StatsSection = ({ stats }: Props) => {
  if (stats.length === 0) return null;

  return (
    <section aria-label="Estadísticas generales">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#7a8ab0]">
          Resumen general
        </h2>
        <span className="text-[10px] text-[#b0bcd0]">Actualizado ahora</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, Icon, trend }) => (
          <div
            key={label}
            className="rounded-xl border border-[#dce3f0] bg-white p-4 shadow-sm transition-colors dark:border-white/10 dark:bg-[#0e1a35]"
          >
            <div className="mb-2 flex items-center justify-between">
              <Icon
                size={14}
                className="text-[#1B3D8F] dark:text-white/40"
                aria-hidden="true"
              />
              {trend && (
                <span
                  className={`text-[10px] font-semibold ${
                    trend.isPositive ? "text-[#059669]" : "text-[#CC1A2E]"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {trend.value}%
                </span>
              )}
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8ab0]">
              {label}
            </p>
            <p className="mt-1 text-xl font-bold text-[#0e1f4d] dark:text-white">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
