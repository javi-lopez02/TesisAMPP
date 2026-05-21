// src/components/vehiculos/ModalDelete.tsx
import { AlertTriangle, Loader2 } from "lucide-react";
import type { getVehiculo } from "../../types/vehiculo.types";

interface DeleteModalProps {
  vehiculo: getVehiculo;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export const DeleteModal = ({ vehiculo, onConfirm, onCancel, loading }: DeleteModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-black/[0.07] bg-white p-6 shadow-2xl dark:border-white/[0.07] dark:bg-[#0e1a35]">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FCEBEB]">
            <AlertTriangle size={18} className="text-[#CC1A2E]" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-[#0e1f4d] dark:text-white">
              ¿Eliminar vehículo?
            </h3>
            <p className="mt-1 text-[13px] text-gray-500 dark:text-white/50">
              Esta acción desactivará el vehículo <span className="font-mono font-semibold">{vehiculo.placa}</span>. 
              No se eliminarán los registros históricos asociados.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-black/8 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white/50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#CC1A2E] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#a31525] disabled:opacity-70"
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
};