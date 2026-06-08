import { useMemo } from "react";
import { Card } from "./Card";
import type { getSolicitud } from "../../types/solicitud.types";

interface Props {
  solicitudes: getSolicitud[] | null;
}

interface ActividadItem {
  id: string;
  texto: string;
  tiempo: string;
  color: "blue" | "green" | "red" | "amber";
}

const DOT_COLOR: Record<ActividadItem["color"], string> = {
  blue: "bg-[#1B3D8F]",
  green: "bg-[#3B6D11]",
  red: "bg-[#CC1A2E]",
  amber: "bg-[#BA7517]",
};

const formatTiempo = (fecha: string): string => {
  const ahora = new Date();
  const fechaObj = new Date(fecha);
  const diffMs = ahora.getTime() - fechaObj.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "Ahora mismo";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffH < 24) return `Hace ${diffH}h`;
  if (diffD < 7) return `Hace ${diffD}d`;
  return fechaObj.toLocaleDateString("es-CU", {
    day: "numeric",
    month: "short",
  });
};

export const ActividadReciente = ({ solicitudes }: Props) => {
  const actividad = useMemo((): ActividadItem[] => {
    if (!solicitudes) return [];

    return [...solicitudes]
      .sort(
        (a, b) =>
          new Date(b.fechaCreacion).getTime() -
          new Date(a.fechaCreacion).getTime(),
      )
      .slice(0, 6)
      .map((s) => {
        let color: ActividadItem["color"] = "blue";
        let texto = `Solicitud "${s.actividad}" creada por ${s.usuario.nombre}`;

        switch (s.estado) {
          case "APROBADA":
            color = "green";
            texto = `Solicitud "${s.actividad}" aprobada`;
            break;
          case "RECHAZADA":
            color = "red";
            texto = `Solicitud "${s.actividad}" rechazada`;
            break;
          case "PENDIENTE":
            color = "amber";
            texto = `Solicitud "${s.actividad}" pendiente de revisión`;
            break;
          case "COMPLETADA":
            color = "green";
            texto = `Solicitud "${s.actividad}" completada`;
            break;
        }

        return {
          id: s.id,
          texto,
          tiempo: formatTiempo(s.fechaCreacion),
          color,
        };
      });
  }, [solicitudes]);

  return (
    <Card title="Actividad reciente">
      {actividad.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-gray-400 dark:text-white/30">
          Sin actividad reciente
        </p>
      ) : (
        <div className="space-y-0">
          {actividad.map((a, i) => (
            <div key={a.id}>
              {i > 0 && (
                <div className="my-2 h-px bg-black/5 dark:bg-white/5" />
              )}
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[a.color]}`}
                />
                <div>
                  <p className="text-[11px] text-gray-400 dark:text-white/50">
                    {a.texto}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-300 dark:text-white/25">
                    {a.tiempo}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
