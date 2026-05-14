// src/components/movimientos/MovimientosTable.tsx
import {
  Fuel,
  Calendar,
  User,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import type {
  getMovimientoCombustible,
  TipoMovimiento,
} from "../../types/movimiento.types";
import { formatDate, GRID_CLASS, GRID_COLS } from "./HelpersMovimientos";

interface MovimientosTableProps {
  movimientos: getMovimientoCombustible[];
  getTipoLabel: (t: TipoMovimiento) => string;
  getTipoColor: (t: TipoMovimiento) => string;
}

const TIPOS_SALIDA: TipoMovimiento[] = ["ASIGNACION_SOLICITUD", "MERMA"];

export const MovimientosTable = ({
  movimientos,
  getTipoLabel,
  getTipoColor,
}: MovimientosTableProps) => (
  <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
    {/* Cabecera */}
    <div
      className={`${GRID_CLASS} ${GRID_COLS} border-b border-black/6 bg-[#f8f9fc] py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30`}
    >
      <span className="flex items-center gap-1.5">
        <Calendar size={10} /> Fecha / Responsable
      </span>
      <span>Tipo</span>
      <span className="text-right">Cantidad</span>
      <span className="text-right">Saldo resultante</span>
      <span className="flex items-center gap-1.5">
        <Fuel size={10} /> Combustible
      </span>
      <span className="flex items-center justify-end gap-1.5">
        <FileText size={10} /> Observaciones
      </span>
    </div>

    {/* Vacío */}
    {movimientos.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
        <Fuel size={32} strokeWidth={1.5} />
        <p className="mt-3 text-[13px] font-semibold">Sin movimientos</p>
        <p className="text-[12px]">
          Registra el primer movimiento para comenzar
        </p>
      </div>
    ) : (
      movimientos.map((m, i) => {
        const esSalida = TIPOS_SALIDA.includes(m.tipo);

        return (
          <div
            key={m.id}
            className={`${GRID_CLASS} ${GRID_COLS} py-4 transition hover:bg-[#f8f9fc] dark:hover:bg-white/3 ${
              i < movimientos.length - 1
                ? "border-b border-black/5 dark:border-white/5"
                : ""
            }`}
          >
            {/* Fecha + Responsable */}
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#0e1f4d] dark:text-white">
                {formatDate(m.createdAt)}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1B3D8F]/10 dark:bg-[#1B3D8F]/20">
                  <User
                    size={9}
                    className="text-[#1B3D8F] dark:text-[#85B7EB]"
                  />
                </div>
                <span className="truncate text-[11px] text-gray-400 dark:text-white/30">
                  {m.usuario.nombre} {m.usuario.apellidos[0]}.
                </span>
              </div>
            </div>

            {/* Tipo */}
            <div>
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getTipoColor(m.tipo)}`}
              >
                {getTipoLabel(m.tipo)}
              </span>
            </div>

            {/* Cantidad */}
            <div className="flex items-center justify-end gap-2">
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  esSalida ? "bg-[#FCEBEB]" : "bg-[#EAF3DE]"
                }`}
              >
                {esSalida ? (
                  <ArrowUpRight size={11} className="text-[#CC1A2E]" />
                ) : (
                  <ArrowDownLeft size={11} className="text-[#3B6D11]" />
                )}
              </div>
              <span
                className={`text-[13px] font-bold tabular-nums ${
                  esSalida
                    ? "text-[#CC1A2E]"
                    : "text-[#3B6D11] dark:text-[#8BC34A]"
                }`}
              >
                {esSalida ? "-" : "+"}
                {Number(m.cantidad).toLocaleString("es-CU")} L
              </span>
            </div>

            {/* Saldo resultante */}
            <div className="text-right">
              <p className="font-mono text-[13px] font-semibold text-[#0e1f4d] dark:text-white">
                {Number(m.saldoNuevo).toLocaleString("es-CU")} L
              </p>
              <p className="mt-0.5 text-[10px] text-gray-400 dark:text-white/30">
                ant: {Number(m.saldoAnterior).toLocaleString("es-CU")} L
              </p>
            </div>

            {/* Combustible */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1B3D8F]">
                <Fuel size={13} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-[#0e1f4d] dark:text-white">
                  {m.tipoCombustible.nombre}
                </p>
                <p className="font-mono text-[10px] text-gray-400 dark:text-white/30">
                  {m.tipoCombustible.codigo}
                </p>
              </div>
            </div>

            {/* Observaciones */}
            <div className="flex justify-end">
              {m.observaciones ? (
                <span
                  title={m.observaciones}
                  className="block max-w-35 truncate rounded-lg border border-black/6 bg-[#f8f9fc] px-2.5 py-1 text-[11px] text-gray-500 dark:border-white/6 dark:bg-white/3 dark:text-white/40"
                >
                  {m.observaciones}
                </span>
              ) : (
                <span className="text-[12px] text-gray-200 dark:text-white/10">
                  —
                </span>
              )}
            </div>
          </div>
        );
      })
    )}
  </div>
);
