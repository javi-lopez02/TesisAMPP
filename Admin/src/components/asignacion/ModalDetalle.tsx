import { X, Car, User, Calendar, FileText } from "lucide-react";
import type { getAsignacion } from "../../types/asignacion.types";
import {
  getEstadoLabel,
  getEstadoColor,
  formatearFechaCorta,
} from "./HelpersAsignacion";

interface Props {
  asignacion: getAsignacion;
  onClose: () => void;
}
export const ModalDetalle = ({ asignacion, onClose }: Props) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-lg rounded-2xl border border-black/[0.07] bg-white p-6 shadow-xl dark:border-white/[0.07] dark:bg-[#0e1a35]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B3D8F]/20">
            <FileText size={18} className="text-[#1B3D8F]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#0e1f4d] dark:text-white">
              Detalle de asignación
            </h3>
            <p className="mt-0.5 text-[12px] text-gray-400 dark:text-white/40">
              ID: {asignacion.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
      <div className="mt-4 space-y-4">
        <div className="rounded-lg border border-black/6 bg-[#f8f9fc] p-3 dark:border-white/6 dark:bg-white/3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
            Estado
          </p>
          <p
            className={`mt-1 inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold uppercase ${getEstadoColor(asignacion.estado)}`}
          >
            {getEstadoLabel(asignacion.estado)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
              Vehículo
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Car size={14} className="text-gray-400" />
              <p className="text-[13px] font-semibold text-[#0e1f4d] dark:text-white">
                {asignacion.vehiculo.marca}
              </p>
            </div>
            <p className="font-mono text-[12px] text-gray-500">
              {asignacion.vehiculo.placa}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
              Responsable
            </p>
            <div className="mt-1 flex items-center gap-2">
              <User size={14} className="text-gray-400" />
              <p className="text-[13px] font-semibold text-[#0e1f4d] dark:text-white">
                {asignacion.responsable.nombre}{" "}
                {asignacion.responsable.apellidos}
              </p>
            </div>
            <p className="text-[11px] text-gray-400">
              {asignacion.responsable.correo}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
              Fecha asignación
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <p className="text-[13px] text-[#0e1f4d] dark:text-white">
                {formatearFechaCorta(asignacion.fechaAsignacion)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
              Fecha entrega
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <p className="text-[13px] text-[#0e1f4d] dark:text-white">
                {asignacion.fechaEntrega
                  ? formatearFechaCorta(asignacion.fechaEntrega)
                  : "No definida"}
              </p>
            </div>
          </div>
        </div>
        {/* {asignacion.solicitud && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
              Solicitud asociada
            </p>
            <div className="mt-1 flex items-start gap-2">
              <FileText size={14} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-[#0e1f4d] dark:text-white">
                  {asignacion.solicitud.descripcion}
                </p>
                <p className="text-[11px] text-gray-400">
                  Creada: {formatearFechaCorta(asignacion.solicitud.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )} */}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-lg border border-black/8 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-500 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
);
