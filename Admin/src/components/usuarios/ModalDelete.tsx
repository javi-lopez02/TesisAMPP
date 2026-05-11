// src/components/usuarios/ModalDelete.tsx
import { AlertTriangle, Loader2, X } from "lucide-react";
import type { getUsuario } from "../../types/usuarios.types";

interface DeleteModalProps {
  usuario: getUsuario;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export const DeleteModal = ({
  usuario,
  onConfirm,
  onCancel,
  loading,
}: DeleteModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-xl dark:border-white/[0.07] dark:bg-[#0e1a35]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.07] bg-[#FCEBEB] px-5 py-3 dark:border-white/[0.07] dark:bg-[#CC1A2E]/10">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#CC1A2E]" />
            <h3 className="text-[14px] font-bold text-[#0e1f4d] dark:text-white">
              Eliminar usuario
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-5 py-4">
          <p className="text-[13px] text-gray-500 dark:text-white/50">
            ¿Estás seguro de eliminar al usuario{" "}
            <span className="font-semibold text-[#0e1f4d] dark:text-white">
              {usuario.nombre} {usuario.apellidos}
            </span>
            ? Esta acción es reversible mediante soft delete.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-black/[0.07] px-5 py-4 dark:border-white/[0.07]">
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
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#CC1A2E] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#b31728] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Eliminando...
              </>
            ) : (
              <>
                <AlertTriangle size={14} /> Sí, eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};