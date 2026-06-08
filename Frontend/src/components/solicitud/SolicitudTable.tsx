import { Eye, FileText, Calendar, User } from "lucide-react";
import type { getSolicitud } from "../../types/solicitud.types";
import {
  getEstadoLabel,
  getEstadoColor,
  getTipoSolicitudLabel,
  formatLitros,
  formatDate,
} from "./HelpersSolicitud";

interface Props {
  solicitudes: getSolicitud[];
  onVerDetalle: (s: getSolicitud) => void;
}

export const SolicitudesTable = ({ solicitudes, onVerDetalle }: Props) => (
  <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
    <div
      className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
      style={{ gridTemplateColumns: "1fr 120px 100px 100px 100px 80px 40px" }}
    >
      <span className="flex items-center gap-1">
        <FileText size={10} /> Solicitud
      </span>
      <span className="text-center">Tipo</span>
      <span className="text-center">Combustible</span>
      <span className="text-center">Litros</span>
      <span className="text-center">Fecha req.</span>
      <span className="text-center">Estado</span>
      <span />
    </div>
    {solicitudes.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
        <FileText size={32} strokeWidth={1.5} />
        <p className="mt-3 text-[13px] font-semibold">Sin solicitudes</p>
      </div>
    ) : (
      solicitudes.map((s, i) => (
        <div
          key={s.id}
          className={`grid items-center px-5 py-3.5 transition hover:bg-[#f8f9fc] dark:hover:bg-white/3 ${i < solicitudes.length - 1 ? "border-b border-black/5 dark:border-white/5" : ""}`}
          style={{
            gridTemplateColumns: "1fr 120px 100px 100px 100px 80px 40px",
          }}
        >
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-[#0e1f4d] dark:text-white">
              {s.descripcion}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-gray-400 dark:text-white/30">
              <span className="flex items-center gap-1">
                <User size={9} />
                {s.usuario.nombre} {s.usuario.apellidos[0]}.
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={9} />
                {formatDate(s.fechaSolicitada)}
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${getEstadoColor(s.estado).replace("bg-[", "bg-opacity-10 bg-[")}`}
            >
              {getTipoSolicitudLabel(s.tipoSolicitud)}
            </span>
          </div>
          <div className="flex justify-center text-[11px] text-gray-500 dark:text-white/40">
            {s.tipoCombustible.codigo}
          </div>
          <div className="flex justify-center font-mono text-[11px] text-[#0e1f4d] dark:text-white">
            {formatLitros(s.cantidadLitros)}
          </div>
          <div className="flex justify-center text-[11px] text-gray-500 dark:text-white/40">
            {formatDate(s.fechaRequerida).split(",")[0]}
          </div>
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold uppercase ${getEstadoColor(s.estado)}`}
            >
              {getEstadoLabel(s.estado)}
            </span>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={() => onVerDetalle(s)}
              title="Ver detalles"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-[#E6F1FB] hover:text-[#1B3D8F] dark:text-white/20 dark:hover:bg-[#1B3D8F]/20 dark:hover:text-[#85B7EB]"
            >
              <Eye size={13} />
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);
