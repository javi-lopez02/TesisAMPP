import { useMemo } from "react";
import { Card, Separator } from "./Card";
import type { getSolicitud } from "../../types/solicitud.types";

interface Props {
  solicitudes: getSolicitud[] | null;
}

export const SolicitudesPorSolicitante = ({ solicitudes }: Props) => {
  const { data, resumen } = useMemo(() => {
    const lista = solicitudes ?? [];

    // Agrupar por solicitante (nombre + apellidos)
    const agrupado = lista.reduce(
      (acc, s) => {
        const nombre = `${s.usuario.nombre} ${s.usuario.apellidos}`;
        acc[nombre] = (acc[nombre] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Ordenar por cantidad descendente
    const items = Object.entries(agrupado)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6); // Top 6 solicitantes

    const maximo = Math.max(...items.map((i) => i.total), 1);

    // Resumen de estados del mes
    const ahora = new Date();
    const esteMes = lista.filter((s) => {
      const fecha = new Date(s.fechaCreacion);
      return (
        fecha.getMonth() === ahora.getMonth() &&
        fecha.getFullYear() === ahora.getFullYear()
      );
    });

    const resumen = {
      aprobadas: esteMes.filter((s) => s.estado === "APROBADA").length,
      pendientes: esteMes.filter((s) => s.estado === "PENDIENTE").length,
      rechazadas: esteMes.filter((s) => s.estado === "RECHAZADA").length,
    };

    return { data: items.map((i) => ({ ...i, maximo })), resumen };
  }, [solicitudes]);

  return (
    <Card title="Solicitudes por solicitante">
      {data.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-gray-400 dark:text-white/30">
          No hay solicitudes registradas
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((solicitante) => (
            <div
              key={solicitante.nombre}
              className="grid items-center gap-2"
              style={{ gridTemplateColumns: "120px 1fr 32px" }}
            >
              <p className="truncate text-right text-[11px] text-gray-400 dark:text-white/40">
                {solicitante.nombre}
              </p>
              <div className="h-0.75 overflow-hidden rounded-full bg-black/6 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[#1B3D8F]"
                  style={{
                    width: `${Math.round((solicitante.total / solicitante.maximo) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] font-bold text-[#0e1f4d] dark:text-white">
                {solicitante.total}
              </p>
            </div>
          ))}
        </div>
      )}

      <Separator />

      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
        Estado de solicitudes del mes
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-[#EAF3DE] py-2">
          <p className="text-[18px] font-bold text-[#3B6D11]">
            {resumen.aprobadas}
          </p>
          <p className="text-[10px] font-bold text-[#3B6D11]">Aprobadas</p>
        </div>
        <div className="rounded-lg bg-[#FAEEDA] py-2">
          <p className="text-[18px] font-bold text-[#854F0B]">
            {resumen.pendientes}
          </p>
          <p className="text-[10px] font-bold text-[#854F0B]">Pendientes</p>
        </div>
        <div className="rounded-lg bg-[#FCEBEB] py-2">
          <p className="text-[18px] font-bold text-[#A32D2D]">
            {resumen.rechazadas}
          </p>
          <p className="text-[10px] font-bold text-[#A32D2D]">Rechazadas</p>
        </div>
      </div>
    </Card>
  );
};
