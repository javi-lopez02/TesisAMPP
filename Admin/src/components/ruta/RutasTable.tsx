import { Eye, Route, Clock } from "lucide-react";
import type { getRuta } from "../../types/rutas.types";
import { Badge } from "../globalComponents/Badge";
import { formatDistance, formatTime } from "./HelpersRutas";

interface Props {
  rutas: getRuta[];
  onVerPuntos: (ruta: getRuta) => void;
}

export const RutasTable = ({ rutas, onVerPuntos }: Props) => (
  <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
    <div
      className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
      style={{ gridTemplateColumns: "1fr 120px 100px 80px 80px 40px" }}
    >
      <span className="flex items-center gap-1">
        <Route size={10} /> Ruta
      </span>
      <span className="text-right">Distancia</span>
      <span className="text-center">Tiempo est.</span>
      <span className="text-center">Puntos</span>
      <span className="text-center">Estado</span>
      <span />
    </div>
    {rutas.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
        <Route size={32} strokeWidth={1.5} />
        <p className="mt-3 text-[13px] font-semibold">Sin rutas registradas</p>
      </div>
    ) : (
      rutas.map((r, i) => (
        <div
          key={r.id}
          className={`grid items-center px-5 py-3.5 transition hover:bg-[#f8f9fc] dark:hover:bg-white/3 ${i < rutas.length - 1 ? "border-b border-black/5 dark:border-white/5" : ""}`}
          style={{ gridTemplateColumns: "1fr 120px 100px 80px 80px 40px" }}
        >
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-[#0e1f4d] dark:text-white">
              {r.nombre}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-white/30 truncate">
              {r.descripcion}
            </p>
          </div>
          <div className="text-right font-mono text-[12px] text-gray-500 dark:text-white/40">
            {formatDistance(r.distanciaTotal)}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[12px] text-gray-500 dark:text-white/40">
            <Clock size={12} />
            {formatTime(r.tiempoEstimado)}
          </div>
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-md bg-[#1B3D8F]/10 px-2 py-0.5 text-[10px] font-bold text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]">
              {r.puntos.length}
            </span>
          </div>
          <div className="flex justify-center">
            <Badge activo={r.activa ?? false} />
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={() => onVerPuntos(r)}
              title="Ver puntos"
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
