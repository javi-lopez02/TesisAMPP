import type { getInventario } from "../../types/inventario.types";
import {
  pctDisponible,
  UMBRAL_BAJO,
  UMBRAL_CRITICO,
} from "./HelpersInventario";

export const NivelStockBar = ({
  inventario,
}: {
  inventario: getInventario[];
}) => {
  const criticos = inventario.filter(
    (i) => pctDisponible(i) < UMBRAL_CRITICO,
  ).length;
  const bajos = inventario.filter(
    (i) => pctDisponible(i) >= UMBRAL_CRITICO && pctDisponible(i) < UMBRAL_BAJO,
  ).length;
  const normales = inventario.filter(
    (i) => pctDisponible(i) >= UMBRAL_BAJO,
  ).length;
  const total = inventario.length || 1;

  return (
    <div className="rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
          Niveles de stock
        </p>
        <span className="text-[11px] font-semibold text-gray-400 dark:text-white/30">
          {inventario.length} tipos
        </span>
      </div>

      {/* Barra segmentada */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        {criticos > 0 && (
          <div
            className="h-full bg-[#CC1A2E] transition-all"
            style={{ width: `${(criticos / total) * 100}%` }}
          />
        )}
        {bajos > 0 && (
          <div
            className="h-full bg-[#BA7517] transition-all"
            style={{ width: `${(bajos / total) * 100}%` }}
          />
        )}
        {normales > 0 && (
          <div
            className="h-full bg-[#3B6D11] transition-all"
            style={{ width: `${(normales / total) * 100}%` }}
          />
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {[
          {
            label: "Crítico",
            count: criticos,
            color: "bg-[#CC1A2E]",
            text: "text-[#CC1A2E]",
          },
          {
            label: "Bajo",
            count: bajos,
            color: "bg-[#BA7517]",
            text: "text-[#BA7517]",
          },
          {
            label: "Normal",
            count: normales,
            color: "bg-[#3B6D11]",
            text: "text-[#3B6D11] dark:text-[#8BC34A]",
          },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${item.color}`} />
            <span className="text-[11px] text-gray-400 dark:text-white/40">
              {item.label}{" "}
              <span className={`font-bold ${item.text}`}>{item.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
