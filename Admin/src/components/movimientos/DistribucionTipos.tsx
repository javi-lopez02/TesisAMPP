import type {
  getMovimientoCombustible,
  TipoMovimiento,
} from "../../types/movimiento.types";
import { TIPO_LABELS } from "./HelpersMovimientos";

// ── Distribución por tipo ─────────────────────────────────────────────────────
export const DistribucionTipos = ({
  movimientos,
}: {
  movimientos: getMovimientoCombustible[];
}) => {
  const total = movimientos.length || 1;
  const conteos = (Object.keys(TIPO_LABELS) as TipoMovimiento[])
    .map((tipo) => ({
      tipo,
      count: movimientos.filter((m) => m.tipo === tipo).length,
    }))
    .filter((t) => t.count > 0);

  const coloresBar: Record<TipoMovimiento, string> = {
    ASIGNACION_INICIAL: "bg-[#1B3D8F]",
    ASIGNACION_SOLICITUD: "bg-[#3B6D11]",
    DEVOLUCION: "bg-[#8B5CF6]",
    AJUSTE: "bg-[#B77C1B]",
    MERMA: "bg-gray-400",
  };

  return (
    <div className="rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
          Distribución por tipo
        </p>
        <span className="text-[11px] font-semibold text-gray-400 dark:text-white/30">
          {movimientos.length} total
        </span>
      </div>

      {/* Barra segmentada */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        {conteos.map(({ tipo, count }) => (
          <div
            key={tipo}
            className={`h-full transition-all ${coloresBar[tipo]}`}
            style={{ width: `${(count / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {conteos.map(({ tipo, count }) => (
          <div key={tipo} className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${coloresBar[tipo]}`}
            />
            <span className="text-[11px] text-gray-400 dark:text-white/40">
              {TIPO_LABELS[tipo]}{" "}
              <span className="font-bold text-[#0e1f4d] dark:text-white">
                {count}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
