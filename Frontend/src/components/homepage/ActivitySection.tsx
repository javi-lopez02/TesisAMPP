import { Link } from "react-router-dom";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { ActivityItem } from "./HelpersHomePage";

interface Props {
  activities: ActivityItem[];
  userRol?: string;
}

const StatusIcon = ({ status }: { status: ActivityItem["status"] }) => {
  const config = {
    pending: { Icon: Clock, color: "#d97706" },
    approved: { Icon: CheckCircle2, color: "#059669" },
    rejected: { Icon: AlertCircle, color: "#CC1A2E" },
    completed: { Icon: CheckCircle2, color: "#1B3D8F" },
  };
  const { Icon, color } = config[status];
  return (
    <Icon size={14} className="shrink-0" style={{ color }} aria-hidden="true" />
  );
};

export const ActivitySection = ({ activities, userRol }: Props) => {
  return (
    <section
      aria-label="Actividad reciente"
      className="rounded-2xl border border-[#dce3f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0e1a35]"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#7a8ab0]">
          Actividad reciente
        </h2>
        <Link
          to="/solicitudes/mis-solicitudes"
          className="text-[11px] font-semibold text-[#1B3D8F] hover:underline dark:text-white/70"
        >
          Ver todo
        </Link>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg p-2 hover:bg-[#f8f9fc] dark:hover:bg-white/5"
            >
              <StatusIcon status={item.status} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#0e1f4d] dark:text-white">
                  {item.action}
                </p>
                <p className="text-[11px] text-[#7a8ab0]">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Clock size={24} className="mb-2 text-[#b0bcd0]" aria-hidden="true" />
          <p className="text-[13px] text-[#7a8ab0]">
            Aún no hay actividad registrada
          </p>
          {userRol !== "CHOFER" && (
            <Link
              to="/solicitudes/crear"
              className="mt-2 text-[12px] font-semibold text-[#1B3D8F] hover:underline dark:text-white/70"
            >
              Crear tu primera solicitud →
            </Link>
          )}
        </div>
      )}
    </section>
  );
};
