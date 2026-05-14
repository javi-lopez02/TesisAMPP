import { memo } from "react";
import type { getTipoCombustible } from "../../types/tipo-combustible.types";
import { ChevronRight, Fuel, Pencil, Trash2 } from "lucide-react";
import { StatPill } from "../globalComponents/StatPill";
import { Badge } from "../globalComponents/Badge";

// ── TipoRow ───────────────────────────────────────────────────────────────────
export const TipoRow = memo(
  ({
    tipo,
    isEditing,
    isLast,
    onEdit,
    onDelete,
  }: {
    tipo: getTipoCombustible;
    isEditing: boolean;
    isLast: boolean;
    onEdit: (t: getTipoCombustible) => void;
    onDelete: (t: getTipoCombustible) => void;
  }) => (
    <div
      className={`grid items-center px-5 py-3.5 transition hover:bg-[#f8f9fc] dark:hover:bg-white/30 ${
        !isLast ? "border-b border-black/50 dark:border-white/50" : ""
      } ${isEditing ? "bg-[#EAF3DE]/40 dark:bg-[#1B3D8F]/10" : ""}`}
      style={{
        gridTemplateColumns: "1fr 110px 80px 80px 80px 80px 100px 40px",
      }}
    >
      {/* Nombre + Código */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1B3D8F]">
          <Fuel size={15} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-[#0e1f4d] dark:text-white">
            {tipo.nombre}
          </p>
          <p className="font-mono text-[11px] text-gray-400 dark:text-white/30">
            {tipo.codigo}
          </p>
        </div>
      </div>

      {/* Precio */}
      <div className="text-center">
        <span className="text-[13px] font-bold text-[#3B6D11] dark:text-[#8BC34A]">
          ${Number(tipo.precioPorLitro).toFixed(2)}
        </span>
        <p className="text-[10px] text-gray-400 dark:text-white/30">/ litro</p>
      </div>

      <div className="flex justify-center">
        <StatPill value={tipo._count?.vehiculos ?? 0} label="Veh." />
      </div>
      <div className="flex justify-center">
        <StatPill value={tipo._count?.solicituds ?? 0} label="Sol." />
      </div>
      <div className="flex justify-center">
        <StatPill value={tipo._count?.asignacions ?? 0} label="Asig." />
      </div>
      <div className="flex justify-center">
        <StatPill
          value={tipo._count?.movimientoCombustibles ?? 0}
          label="Mov."
        />
      </div>

      <div className="flex justify-center">
        <Badge activo={tipo.activo} />
      </div>

      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => onEdit(tipo)}
          title="Editar"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-[#E6F1FB] hover:text-[#1B3D8F] dark:text-white/20 dark:hover:bg-[#1B3D8F]/20 dark:hover:text-[#85B7EB]"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(tipo)}
          title="Eliminar"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-[#FCEBEB] hover:text-[#CC1A2E] dark:text-white/20 dark:hover:bg-[#CC1A2E]/20 dark:hover:text-[#F09595]"
        >
          <Trash2 size={13} />
        </button>
        <ChevronRight size={13} className="text-gray-200 dark:text-white/10" />
      </div>
    </div>
  ),
  (prev, next) =>
    prev.tipo === next.tipo &&
    prev.isEditing === next.isEditing &&
    prev.isLast === next.isLast,
);