import { useMemo } from "react";
import { Card } from "./Card";
import type { getSolicitud } from "../../types/solicitud.types";

interface Props {
  solicitudes: getSolicitud[] | null;
}

const ESTADO_MAP: Record<string, { label: string; className: string }> = {
  PENDIENTE: { label: "Pendiente", className: "bg-[#FAEEDA] text-[#854F0B]" },
  APROBADA: { label: "Aprobada", className: "bg-[#EAF3DE] text-[#3B6D11]" },
  RECHAZADA: { label: "Rechazada", className: "bg-[#FCEBEB] text-[#A32D2D]" },
  EN_PROCESO: { label: "En proceso", className: "bg-[#E6F1FB] text-[#185FA5]" },
  COMPLETADA: { label: "Completada", className: "bg-[#EAF3DE] text-[#3B6D11]" },
  CANCELADA: { label: "Cancelada", className: "bg-[#F1EFE8] text-[#5F5E5A]" },
};

const TIPO_MAP: Record<string, string> = {
  FISCALIZACION: "Fiscalización",
  DISTRIBUCION: "Distribución",
  EMERGENCIA: "Emergencia",
  OTRO: "Otro",
};

export const SolicitudesRecientes = ({ solicitudes }: Props) => {
  const recientes = useMemo(() => {
    if (!solicitudes) return [];
    return [...solicitudes]
      .sort(
        (a, b) =>
          new Date(b.fechaCreacion).getTime() -
          new Date(a.fechaCreacion).getTime(),
      )
      .slice(0, 5);
  }, [solicitudes]);

  return (
    <Card title="Solicitudes recientes">
      {recientes.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-gray-400 dark:text-white/30">
          No hay solicitudes recientes
        </p>
      ) : (
        <div className="space-y-2">
          {recientes.map((s) => {
            const iniciales =
              `${s.usuario.nombre[0]}${s.usuario.apellidos[0]}`.toUpperCase();
            const estado = ESTADO_MAP[s.estado] || ESTADO_MAP.PENDIENTE;
            return (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-lg border border-black/5 bg-[#f0f3fa] px-2.5 py-2 dark:border-white/5 dark:bg-white/3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B3D8F] text-[10px] font-bold text-white">
                  {iniciales}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-[#0e1f4d] dark:text-white">
                    {s.actividad}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-white/40">
                    {TIPO_MAP[s.tipoSolicitud]} · {s.usuario?.nombre || "—"} ·{" "}
                    {s.cantidadLitros}L
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${estado.className}`}
                >
                  {estado.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
