import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";

interface ModuleCard {
  to: string;
  label: string;
  description: string;
  Icon: React.ElementType;
  accent: string;
  quickAction?: { label: string; to: string };
}

interface Props {
  modules: ModuleCard[];
}

export const ModulesSection = ({ modules }: Props) => {
  if (modules.length === 0) return null;

  return (
    <section aria-label="Módulos del sistema">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#7a8ab0]">
        Accesos rápidos
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ to, label, description, Icon, accent, quickAction }) => (
          <Link
            key={to}
            to={to}
            className="group relative overflow-hidden rounded-xl border border-[#dce3f0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-[#0e1a35] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          >
            {/* Acento lateral */}
            <span
              className="absolute left-0 top-0 h-full w-1 rounded-l-xl transition-all duration-200 group-hover:w-1.5"
              style={{ background: accent }}
              aria-hidden="true"
            />

            <div className="flex items-start justify-between">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: `${accent}18` }}
                aria-hidden="true"
              >
                <Icon size={17} strokeWidth={2} style={{ color: accent }} />
              </div>
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                className="text-[#b0bcd0] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#1B3D8F] dark:group-hover:text-white"
                aria-hidden="true"
              />
            </div>

            <p className="mt-3 text-[14px] font-bold text-[#0e1f4d] dark:text-white">
              {label}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#7a8ab0]">
              {description}
            </p>

            {quickAction && (
              <Link
                to={quickAction.to}
                onClick={(e) => e.stopPropagation()}
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ color: accent }}
              >
                <Plus size={12} strokeWidth={2.5} />
                {quickAction.label}
              </Link>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};