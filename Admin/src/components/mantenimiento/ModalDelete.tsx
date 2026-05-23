import { AlertTriangle, Loader2, X, Wrench } from "lucide-react";
import type { getMantenimiento } from "../../types/mantenimiento.types";
import { formatearCosto, formatearFechaCorta } from "./HelpersMantenimiento";

interface Props {
  mantenimiento: getMantenimiento;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}
export const DeleteModal = ({
  mantenimiento,
  onConfirm,
  onCancel,
  loading = false,
}: Props) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-2xl border border-black/[0.07] bg-white p-6 shadow-xl dark:border-white/[0.07] dark:bg-[#0e1a35]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FCEBEB] dark:bg-[#CC1A2E]/20">
            <AlertTriangle size={18} className="text-[#CC1A2E]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#0e1f4d] dark:text-white">
              ¿Eliminar mantenimiento?
            </h3>
            <p className="mt-0.5 text-[12px] text-gray-400 dark:text-white/40">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
      <div className="mt-4 rounded-lg border border-black/6 bg-[#f8f9fc] p-3 dark:border-white/6 dark:bg-white/3">
        <div className="flex items-center gap-2">
          <Wrench size={14} className="text-[#1B3D8F] dark:text-[#85B7EB]" />
          <p className="text-[13px] font-semibold text-[#0e1f4d] dark:text-white">
            {mantenimiento.tipo} — {formatearFechaCorta(mantenimiento.fecha)}
          </p>
        </div>
        <p className="mt-2 text-[12px] text-gray-400 dark:text-white/30">
          • Vehículo: {mantenimiento.vehiculo.placa} (
          {mantenimiento.vehiculo.marca})<br />• Kilometraje:{" "}
          {mantenimiento.kilometraje.toLocaleString()} km
          <br />• Costo: {formatearCosto(mantenimiento.costo)}
          <br />• Descripción: {mantenimiento.descripcion}
        </p>
      </div>
      <div className="mt-6 flex gap-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-lg border border-black/8 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#CC1A2E] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#a61525] disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Procesando...
            </>
          ) : (
            "Sí, eliminar"
          )}
        </button>
      </div>
    </div>
  </div>
);
