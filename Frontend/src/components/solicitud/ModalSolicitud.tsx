import { useEffect, useState } from "react";
import {
  X,
  FileText,
  Route,
  Clock,
  MapPin,
  Building2,
  GitBranch,
  Map,
  Home,
  AlertCircle,
} from "lucide-react";
import type { getSolicitud } from "../../types/solicitud.types";
import {
  getEstadoLabel,
  getEstadoColor,
  getTipoSolicitudLabel,
  formatLitros,
  formatDistance,
  formatTime,
  formatDate,
} from "./HelpersSolicitud";
import { inputClass } from "../../helpers/helpers";

interface Props {
  solicitud: getSolicitud;
  onClose: () => void;
  onCancelar: (id: string, motivo: string) => Promise<void>;
  loading?: boolean;
}

export const ModalSolicitud = ({
  solicitud,
  onClose,
  onCancelar,
  loading = false,
}: Props) => {
  const [observaciones, setObservaciones] = useState("");

  // 🔹 Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // 🔹 Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleCancelar = async () => {
    if (!observaciones.trim()) return; // Validación: motivo obligatorio
    await onCancelar(solicitud.id, observaciones.trim());
    onClose();
  };

  const puntosOrdenados = [...solicitud.ruta.puntos].sort(
    (a, b) => a.orden - b.orden,
  );

  console.log(puntosOrdenados);

  const esPendiente = solicitud.estado === "PENDIENTE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 duration-200 rounded-2xl border border-black/[0.07] bg-white shadow-xl dark:border-white/[0.07] dark:bg-[#0e1a35]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-black/[0.07] px-5 py-4 dark:border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${esPendiente ? "bg-[#BA7517]/20" : getEstadoColor(solicitud.estado).split(" ")[0]}`}
            >
              <FileText
                size={18}
                className={esPendiente ? "text-[#BA7517]" : "text-white"}
              />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0e1f4d] dark:text-white">
                {solicitud.descripcion}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-400 dark:text-white/30">
                <span
                  className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${getEstadoColor(solicitud.estado)}`}
                >
                  {getEstadoLabel(solicitud.estado)}
                </span>
                <span>•</span>
                <span>{getTipoSolicitudLabel(solicitud.tipoSolicitud)}</span>
                <span>•</span>
                <span>ID: {solicitud.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="max-h-[65vh] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Columna izquierda: Info principal */}
            <div className="lg:col-span-2 space-y-4">
              {/* Info básica */}
              <div className="rounded-lg border border-black/70 bg-[#f8f9fc] p-4 dark:border-white/7 dark:bg-white/5">
                <h3 className="mb-3 text-[12px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
                  Información
                </h3>
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <p className="text-gray-400 dark:text-white/30">
                      Actividad
                    </p>
                    <p className="font-semibold text-[#0e1f4d] dark:text-white">
                      {solicitud.actividad}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-white/30">
                      Combustible
                    </p>
                    <p className="font-semibold text-[#0e1f4d] dark:text-white">
                      {solicitud.tipoCombustible.nombre} (
                      {solicitud.tipoCombustible.codigo})
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-white/30">Cantidad</p>
                    <p className="font-semibold text-[#0e1f4d] dark:text-white">
                      {formatLitros(solicitud.cantidadLitros)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-white/30">
                      Solicitante
                    </p>
                    <p className="font-semibold text-[#0e1f4d] dark:text-white">
                      {solicitud.usuario.nombre} {solicitud.usuario.apellidos}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-white/30">
                      Fecha requerida
                    </p>
                    <p className="font-semibold text-[#0e1f4d] dark:text-white">
                      {formatDate(solicitud.fechaRequerida)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-white/30">Creada</p>
                    <p className="font-semibold text-[#0e1f4d] dark:text-white">
                      {formatDate(solicitud.fechaCreacion)}
                    </p>
                  </div>
                </div>
                {solicitud.observaciones && (
                  <div className="mt-3 pt-3 border-t border-black/6 dark:border-white/6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
                      Observaciones
                    </p>
                    <p className="mt-1 text-[12px] text-[#0e1f4d] dark:text-white">
                      {solicitud.observaciones}
                    </p>
                  </div>
                )}
              </div>

              {/* Ruta */}
              <div className="rounded-lg border border-black/70 bg-[#f8f9fc] p-4 dark:border-white/7 dark:bg-white/5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
                    Ruta
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-white/40">
                    <span className="flex items-center gap-1">
                      <Route size={11} />
                      {formatDistance(solicitud.ruta.distanciaTotal)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatTime(solicitud.ruta.tiempoEstimado)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 pl-2 border-l-2 border-gray-200 dark:border-white/10">
                  {puntosOrdenados.map((p) => (
                    <div key={p.id} className="relative pl-4">
                      <div
                        className={`absolute -left-7.25 top-1 h-3 w-3 rounded-full border-2 border-white dark:border-[#0e1a35] ${p.tipo === "INICIO" ? "bg-[#3B6D11]" : p.tipo === "DESTINO" ? "bg-[#CC1A2E]" : "bg-[#1B3D8F]"}`}
                      />
                      <div className="rounded border border-black/60 bg-white p-2.5 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center rounded px-1 py-0.5 text-[8px] font-bold uppercase ${p.tipo === "INICIO" ? "bg-[#3B6D11]/10 text-[#3B6D11]" : p.tipo === "DESTINO" ? "bg-[#CC1A2E]/10 text-[#CC1A2E]" : "bg-[#1B3D8F]/10 text-[#1B3D8F]"}`}
                          >
                            {p.tipo === "INICIO"
                              ? "Inicio"
                              : p.tipo === "DESTINO"
                                ? "Destino"
                                : "Intermedio"}
                          </span>
                          <span className="font-mono text-[9px] text-gray-400">
                            #{p.orden + 1}
                          </span>
                        </div>
                        <p className="text-[12px] font-semibold text-[#0e1f4d] dark:text-white">
                          {p.nombre}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-white/30 flex items-center gap-1">
                          <MapPin size={9} />
                          {p.direccion}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-gray-400 dark:text-white/30">
                          <span className="flex items-center gap-1">
                            <Building2 size={8} />
                            {p.consejoPopular.nombre}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch size={8} />
                            {p.circunscripcion.nombre}
                          </span>
                          <span className="flex items-center gap-1">
                            <Map size={8} />
                            {p.zona.nombre}
                          </span>
                          <span className="flex items-center gap-1">
                            <Home size={8} />
                            CDR {p.cdr.numero}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna derecha: Acciones DIRECTAS */}
            <div className="space-y-4">
              {/* Panel de acciones (solo si pendiente) */}
              {esPendiente && (
                <div className="rounded-lg border border-[#BA7517]/30 bg-[#F5E6C8] p-4 dark:border-[#BA7517]/40 dark:bg-[#BA7517]/10">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={14} className="text-[#B77C1B]" />
                    <p className="text-[12px] font-semibold text-[#B77C1B]">
                      Solicitud pendiente
                    </p>
                  </div>

                  {/* Campo de observaciones (compartido para ambas acciones) */}
                  <div className="mb-4">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                      Observaciones{" "}
                      <span className="text-[#CC1A2E]">
                        (obligatorio para cancelar)
                      </span>
                    </label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      rows={3}
                      placeholder="Motivo de cancelación...."
                      className={`${inputClass(false)} resize-none text-[11px]`}
                    />
                  </div>

                  {/* Botones DIRECTOS de acción */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleCancelar}
                      disabled={loading || !observaciones.trim()}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#CC1A2E] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#a61525] disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{" "}
                          Procesando...
                        </>
                      ) : (
                        "✗ Cancelar Solicitud"
                      )}
                    </button>

                    {!observaciones.trim() && (
                      <p className="text-[10px] text-center text-[#CC1A2E]">
                        Debes escribir un motivo para cancelar
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Resumen rápido */}
              <div className="rounded-lg border border-black/70 bg-[#f8f9fc] p-4 dark:border-white/7 dark:bg-white/5">
                <h3 className="mb-3 text-[12px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
                  Resumen
                </h3>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Puntos:</span>
                    <span className="font-semibold">
                      {puntosOrdenados.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Distancia:</span>
                    <span className="font-semibold">
                      {formatDistance(solicitud.ruta.distanciaTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tiempo est.:</span>
                    <span className="font-semibold">
                      {formatTime(solicitud.ruta.tiempoEstimado)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Combustible:</span>
                    <span className="font-semibold">
                      {formatLitros(solicitud.cantidadLitros)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mensaje si no es pendiente */}
              {!esPendiente && (
                <div className="rounded-lg border border-black/70 bg-[#f8f9fc] p-4 text-center dark:border-white/7 dark:bg-white/5">
                  <p className="text-[12px] text-gray-400 dark:text-white/30">
                    Esta solicitud ya ha sido{" "}
                    {getEstadoLabel(solicitud.estado).toLowerCase()}.
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
                    No se pueden realizar acciones adicionales.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
