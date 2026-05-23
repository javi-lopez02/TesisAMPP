import { Eye, Car, Calendar, FileText } from "lucide-react";
import type {
  getAsignacion,
} from "../../types/asignacion.types";
import {
  getEstadoLabel,
  getEstadoColor,
  formatearFechaCorta,
} from "./HelpersAsignacion";

interface Props {
  asignaciones: getAsignacion[];
  onVerDetalle?: (a: getAsignacion) => void;
}

export const AsignacionesTable = ({ asignaciones, onVerDetalle }: Props) => (
  <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
    <div
      className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
      style={{ gridTemplateColumns: "100px 1fr 140px 120px 100px 40px" }}
    >
      <span className="flex items-center gap-1">
        <Calendar size={10} /> Fecha
      </span>
      <span>Vehículo / Responsable</span>
      <span className="text-center">Estado</span>
      <span className="text-center">Entrega</span>
      <span className="text-center">Reportes</span>
      <span />
    </div>
    {asignaciones.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
        <FileText size={32} strokeWidth={1.5} />
        <p className="mt-3 text-[13px] font-semibold">Sin asignaciones</p>
      </div>
    ) : (
      asignaciones.map((a, i) => (
        <div
          key={a.id}
          className={`grid items-center px-5 py-3.5 transition hover:bg-[#f8f9fc] dark:hover:bg-white/3 ${i < asignaciones.length - 1 ? "border-b border-black/5 dark:border-white/5" : ""}`}
          style={{ gridTemplateColumns: "100px 1fr 140px 120px 100px 40px" }}
        >
          <div className="text-[12px] text-[#0e1f4d] dark:text-white">
            <div className="flex items-center gap-1.5">
              <Calendar
                size={11}
                className="text-gray-400 dark:text-white/30"
              />
              <span>{formatearFechaCorta(a.fechaAsignacion)}</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#1B3D8F]/20">
                <Car size={10} className="text-[#1B3D8F]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-[#0e1f4d] dark:text-white">
                  {a.vehiculo.placa} — {a.vehiculo.marca}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-white/30">
                  Resp: {a.responsable.nombre} {a.responsable.apellidos}
                </p>
              </div>
            </div>
            {/* {a.solicitud && (
              <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30 truncate">
                Solicitud: {a.solicitud.descripcion?.slice(0, 40)}
                {a.solicitud.descripcion && a.solicitud.descripcion.length > 40
                  ? "..."
                  : ""}
              </p>
            )} */}
          </div>
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase ${getEstadoColor(a.estado)}`}
            >
              {getEstadoLabel(a.estado)}
            </span>
          </div>
          <div className="text-center text-[12px] text-gray-500 dark:text-white/40">
            {a.fechaEntrega ? formatearFechaCorta(a.fechaEntrega) : "—"}
          </div>
          <div className="flex justify-center">
            <span className="font-mono text-[12px] text-[#0e1f4d] dark:text-white">
              {a._count?.reportes ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-end">
            {onVerDetalle && (
              <button
                onClick={() => onVerDetalle(a)}
                title="Ver detalle"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-[#E6F1FB] hover:text-[#1B3D8F] dark:text-white/20 dark:hover:bg-[#1B3D8F]/20 dark:hover:text-[#85B7EB]"
              >
                <Eye size={13} />
              </button>
            )}
          </div>
        </div>
      ))
    )}
  </div>
);
