import {
  Pencil,
  ChevronRight,
  Wrench,
  Car,
  Calendar,
} from "lucide-react";
import type { getMantenimiento } from "../../types/mantenimiento.types";
import {
  getTipoLabel,
  getTipoColor,
  formatearCosto,
  formatearKilometraje,
  formatearFechaCorta,
} from "./HelpersMantenimiento";

interface Props {
  mantenimientos: getMantenimiento[];
  onEditar: (m: getMantenimiento) => void;
  editingId?: string | null;
  panelOpen?: boolean;
}

export const MantenimientosTable = ({
  mantenimientos,
  onEditar,
  editingId,
  panelOpen,
}: Props) => (
  <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
    <div
      className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
      style={{ gridTemplateColumns: "100px 1fr 140px 100px 100px 40px" }}
    >
      <span className="flex items-center gap-1">
        <Calendar size={10} /> Fecha
      </span>
      <span>Tipo / Descripción</span>
      <span className="text-right">Vehículo</span>
      <span className="text-right">Km</span>
      <span className="text-right">Costo</span>
      <span />
    </div>
    {mantenimientos.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
        <Wrench size={32} strokeWidth={1.5} />
        <p className="mt-3 text-[13px] font-semibold">Sin mantenimientos</p>
      </div>
    ) : (
      mantenimientos.map((m, i) => (
        <div
          key={m.id}
          className={`grid items-center px-5 py-3.5 transition hover:bg-[#f8f9fc] dark:hover:bg-white/3 ${i < mantenimientos.length - 1 ? "border-b border-black/5 dark:border-white/5" : ""} ${editingId === m.id && panelOpen ? "bg-[#EAF3DE]/40 dark:bg-[#1B3D8F]/10" : ""}`}
          style={{ gridTemplateColumns: "100px 1fr 140px 100px 100px 40px" }}
        >
          <div className="text-[12px] text-[#0e1f4d] dark:text-white">
            <div className="flex items-center gap-1.5">
              <Calendar
                size={11}
                className="text-gray-400 dark:text-white/30"
              />
              <span>{formatearFechaCorta(m.fecha)}</span>
            </div>
          </div>
          <div className="min-w-0">
            <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${getTipoColor(m.tipo)}`}
            >
              {getTipoLabel(m.tipo)}
            </span>
            <p className="mt-1 truncate text-[12px] text-[#0e1f4d] dark:text-white">
              {m.descripcion}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Car size={11} className="text-gray-400 dark:text-white/30" />
              <span className="font-mono text-[12px] text-[#0e1f4d] dark:text-white">
                {m.vehiculo.placa}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-white/30 truncate">
              {m.vehiculo.marca}
            </p>
          </div>
          <div className="text-right font-mono text-[12px] text-gray-500 dark:text-white/40">
            {formatearKilometraje(m.kilometraje)}
          </div>
          <div className="text-right font-semibold text-[#0e1f4d] dark:text-white">
            {formatearCosto(m.costo)}
          </div>
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onEditar(m)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-[#E6F1FB] hover:text-[#1B3D8F] dark:text-white/20 dark:hover:bg-[#1B3D8F]/20 dark:hover:text-[#85B7EB]"
            >
              <Pencil size={13} />
            </button>

            <ChevronRight
              size={13}
              className="text-gray-200 dark:text-white/10"
            />
          </div>
        </div>
      ))
    )}
  </div>
);
