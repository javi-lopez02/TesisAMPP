import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import type { getCdrs } from "../../types/cdrs.types";

export const DeleteModal = ({
  cdr,
  onConfirm,
  onCancel,
  loading,
}: {
  cdr: getCdrs;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-2xl border border-black/8 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0e1a35]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FCEBEB]">
        <AlertTriangle size={22} className="text-[#CC1A2E]" />
      </div>
      <h2 className="text-[16px] font-bold text-[#0e1f4d] dark:text-white">
        Eliminar cdr
      </h2>
      <p className="mt-2 text-[13px] text-gray-400 dark:text-white/50">
        ¿Estás seguro de que deseas eliminar el CDR{" "}
        <span className="font-bold text-[#0e1f4d] dark:text-white">
          #{cdr.numero}
        </span>
        ? Esta acción no se puede deshacer
      </p>

      {(cdr._count?.puntoRutas ?? 0) > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#F09595] bg-[#FCEBEB] p-3">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[#CC1A2E]" />
          <p className="text-[11px] font-medium text-[#791F1F]">
            Este CDR tiene{" "}
            <strong>{cdr._count?.puntoRutas}</strong>{" "}
            punto(s) de ruta(s) vinculadas.
          </p>
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-lg border border-black/8 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#CC1A2E] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#a81525] disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Eliminando...
            </>
          ) : (
            <>
              <Trash2 size={14} /> Eliminar
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);