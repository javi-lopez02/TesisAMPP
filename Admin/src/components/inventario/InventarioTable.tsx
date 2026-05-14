// src/components/inventario/InventarioTable.tsx
import { Fuel, Calendar } from "lucide-react";
import type { getInventario } from "../../types/inventario.types";
import { StatPill } from "../globalComponents/StatPill";
import { formatDate, getUsageColor, getUsagePercent } from "./HelpersInventario";

interface InventarioTableProps {
  inventarios: getInventario[];
}

export const InventarioTable = ({ inventarios }: InventarioTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
      {/* Cabecera */}
      <div
        className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
        style={{
          gridTemplateColumns: "1.5fr 120px 140px 100px 100px 80px 40px",
        }}
      >
        <span className="flex items-center gap-1">
          <Fuel size={10} /> Combustible
        </span>
        <span className="text-right">Asignado</span>
        <span className="text-right">Saldo Actual</span>
        <span className="text-center">Uso</span>
        <span className="text-center">Movimientos</span>
        <span className="text-center">Actualización</span>
        <span />
      </div>

      {/* Filas */}
      {inventarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
          <Fuel size={32} strokeWidth={1.5} />
          <p className="mt-3 text-[13px] font-semibold">Sin inventarios</p>
          <p className="text-[12px]">
            Agrega un nuevo inventario para comenzar
          </p>
        </div>
      ) : (
        inventarios.map((inv, i) => {
          const usagePercent = getUsagePercent(
            inv.cantidadAsignada,
            inv.saldoActual,
          );

          return (
            <div
              key={inv.id}
              className={`grid items-center px-5 py-3.5 transition hover:bg-[#f8f9fc] dark:hover:bg-white/3 ${
                i < inventarios.length - 1
                  ? "border-b border-black/5 dark:border-white/5"
                  : ""
              }`}
              style={{
                gridTemplateColumns: "1.5fr 120px 140px 100px 100px 80px 40px",
              }}
            >
              {/* Combustible: Nombre + Código */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B3D8F]/10 dark:bg-[#1B3D8F]/20">
                  <Fuel
                    size={15}
                    className="text-[#1B3D8F] dark:text-[#85B7EB]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-[#0e1f4d] dark:text-white">
                    {inv.tipoCombustible.nombre}
                  </p>
                  <p className="font-mono text-[11px] text-gray-400 dark:text-white/30">
                    {inv.tipoCombustible.codigo}
                  </p>
                </div>
              </div>

              {/* Cantidad Asignada */}
              <div className="text-right">
                <p className="font-mono text-[13px] font-bold text-[#0e1f4d] dark:text-white">
                  {inv.cantidadAsignada.toLocaleString()} L
                </p>
              </div>

              {/* Saldo Actual */}
              <div className="text-right">
                <p
                  className={`font-mono text-[13px] font-bold ${
                    inv.saldoActual < inv.cantidadAsignada * 0.3
                      ? "text-[#CC1A2E]"
                      : "text-[#0e1f4d] dark:text-white"
                  }`}
                >
                  {inv.saldoActual.toLocaleString()} L
                </p>
              </div>

              {/* Barra de uso */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getUsageColor(usagePercent)}`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-white/30">
                  {usagePercent}%
                </span>
              </div>

              {/* Movimientos */}
              <div className="flex justify-center">
                <StatPill
                  value={inv._count?.movimientos ?? 0}
                  label="Mov."
                />
              </div>

              {/* Fecha de actualización */}
              <div className="flex justify-center">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/30">
                  <Calendar size={10} />
                  <span>{formatDate(inv.fechaUltimaActualizacion)}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
