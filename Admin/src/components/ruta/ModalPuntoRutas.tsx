import { useEffect } from "react";
import {
  X,
  MapPin,
  Clock,
  Route,
  Building2,
  GitBranch,
  Map,
  Home,
} from "lucide-react";
import type { getRuta } from "../../types/rutas.types";
import {
  formatDistance,
  formatTime,
  getTipoPuntoLabel,
  getTipoPuntoColor,
} from "./HelpersRutas";

interface Props {
  ruta: getRuta;
  onClose: () => void;
}

export const ModalPuntosRuta = ({ ruta, onClose }: Props) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const puntosOrdenados = [...ruta.puntos].sort((a, b) => a.orden - b.orden);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 rounded-2xl border border-black/[0.07] bg-white shadow-xl dark:border-white/[0.07] dark:bg-[#0e1a35]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-4 dark:border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F1FB]">
              <Route size={16} className="text-[#185FA5]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#0e1f4d] dark:text-white">
                {ruta.nombre}
              </h2>
              <p className="text-[11px] text-gray-400 dark:text-white/30 truncate max-w-62.5">
                {ruta.descripcion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Info Bar */}
        <div className="flex flex-wrap items-center gap-4 border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[11px] text-gray-500 dark:border-white/6 dark:bg-white/3 dark:text-white/40">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} /> {formatDistance(ruta.distanciaTotal)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} /> {formatTime(ruta.tiempoEstimado)}
          </span>
          <span className="flex items-center gap-1.5">
            <Route size={12} /> {puntosOrdenados.length} puntos
          </span>
        </div>

        {/* Puntos Timeline */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <div className="space-y-4 pl-6 border-l-2 border-gray-200 dark:border-white/10">
            {puntosOrdenados.map((p) => (
              <div key={p.id} className="relative pl-4">
                {/* Dot */}
                <div
                  className={`absolute -left-8.75 top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-[#0e1a35] ${getTipoPuntoColor(p.tipo).split(" ")[0].replace("/10", "").replace("/20", "").trim()}`}
                />

                <div className="rounded-lg border border-black/70 bg-[#f8f9fc] p-3 dark:border-white/7 dark:bg-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${getTipoPuntoColor(p.tipo)}`}
                    >
                      {getTipoPuntoLabel(p.tipo)}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">
                      Orden #{p.orden + 1}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold text-[#0e1f4d] dark:text-white">
                    {p.nombre}
                  </p>
                  <div className="mt-1 flex items-start gap-1.5 text-[11px] text-gray-500 dark:text-white/40">
                    <MapPin size={11} className="mt-0.5 shrink-0" />
                    <span>{p.direccion}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-400 dark:text-white/30">
                    <span className="flex items-center gap-1">
                      <Building2 size={9} /> {p.consejoPopular.nombre}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch size={9} /> {p.circunscripcion.nombre}
                    </span>
                    <span className="flex items-center gap-1">
                      <Map size={9} /> {p.zona.nombre}
                    </span>
                    <span className="flex items-center gap-1">
                      <Home size={9} /> CDR {p.cdr.numero}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.07] bg-[#f8f9fc] px-5 py-4 dark:border-white/[0.07] dark:bg-white/3 flex justify-end">
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
};
