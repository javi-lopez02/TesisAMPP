import { Pencil, ChevronRight, FileText, Gauge, Droplet } from "lucide-react";
import type { getReporte } from "../../types/reporte-consumo.types";
import {
  formatearConsumo,
  formatearKilometraje,
  formatearRendimiento,
} from "./HelpersReporteConsumo";

interface Props {
  reportes: getReporte[];
  onEditar: (r: getReporte) => void;
  editingId?: string | null;
  panelOpen?: boolean;
}

export const ReportesTable = ({
  reportes,
  onEditar,
  editingId,
  panelOpen,
}: Props) => (
  <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
    <div
      className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
      style={{ gridTemplateColumns: "100px 1fr 120px 120px 100px 40px" }}
    >
      <span className="flex items-center gap-1">
        <FileText size={10} /> Fecha
      </span>
      <span>Vehículo / Asignación</span>
      <span className="text-right">Consumo</span>
      <span className="text-right">Km</span>
      <span className="text-right">Rendimiento</span>
      <span />
    </div>
    {reportes.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
        <FileText size={32} strokeWidth={1.5} />
        <p className="mt-3 text-[13px] font-semibold">Sin reportes</p>
      </div>
    ) : (
      reportes.map((r, i) => (
        <div
          key={r.id}
          className={`grid items-center px-5 py-3.5 transition hover:bg-[#f8f9fc] dark:hover:bg-white/3 ${i < reportes.length - 1 ? "border-b border-black/5 dark:border-white/5" : ""} ${editingId === r.id && panelOpen ? "bg-[#EAF3DE]/40 dark:bg-[#1B3D8F]/10" : ""}`}
          style={{ gridTemplateColumns: "100px 1fr 120px 120px 100px 40px" }}
        >
          <div className="text-[12px] text-[#0e1f4d] dark:text-white">
            {new Date(r.createdAt).toLocaleDateString("es-CU")}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-[#0e1f4d] dark:text-white">
              {r.asignacion.vehiculo?.placa} — {r.asignacion.vehiculo?.marca}
            </p>
            {r.observaciones && (
              <p className="text-[10px] text-gray-400 dark:text-white/30 truncate">
                {r.observaciones}
              </p>
            )}
          </div>
          <div className="text-right font-mono text-[12px] text-[#0e1f4d] dark:text-white">
            <div className="flex items-center justify-end gap-1">
              <Droplet size={10} className="text-gray-400" />
              <span>{formatearConsumo(r.consumoReal)}</span>
            </div>
          </div>
          <div className="text-right font-mono text-[12px] text-gray-500 dark:text-white/40">
            <div className="flex items-center justify-end gap-1">
              <Gauge size={10} className="text-gray-400" />
              <span>{formatearKilometraje(r.kilometrajeRecorrido)}</span>
            </div>
          </div>
          <div className="text-right font-mono text-[12px] text-[#1B3D8F] dark:text-[#85B7EB]">
            {formatearRendimiento(r.rendimiento)}
          </div>
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onEditar(r)}
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
