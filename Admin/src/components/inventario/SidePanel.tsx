// src/components/inventario/SidePanel.tsx
import {
  Check,
  Loader2,
  Pencil,
  Plus,
  X,
  Fuel,
  Package,
  AlertCircle,
  Building2, // ⬅️ Icono para Asamblea
} from "lucide-react";
import type { getTipoCombustible } from "../../types/tipo-combustible.types";
import type { getAsamblea } from "../../types/asamblea.types";
import type { FormState } from "../../types/inventario.types";
import type { FormMode } from "../../types/globalTypes";
import { inputClass } from "../../helpers/helpers";


interface SidePanelProps {
  mode: FormMode;
  form: FormState;
  tiposCombustible: getTipoCombustible[] | null;
  asambleas: getAsamblea[] | null;
  errors: Partial<Record<keyof FormState, string>>;
  loading: boolean;
  onChange: (partial: Partial<FormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const SidePanel = ({
  mode,
  form,
  tiposCombustible,
  asambleas,
  errors,
  loading,
  onChange,
  onSubmit,
  onClose,
}: SidePanelProps) => {
  const isEditar = mode === "editar";
  const tipoSeleccionado = tiposCombustible?.find((t) => t.id === form.tipoCombustibleId);
  const asambleaSeleccionada = asambleas?.find((a) => a.id === form.asambleaId);

  // Calcular diferencia para mostrar preview
  const cantidad = Number(form.cantidadAsignada) || 0;
  const saldo = Number(form.saldoActual) || 0;
  const diferencia = cantidad - saldo;

  return (
    <aside className="flex w-full flex-col border-l border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35] lg:w-85 lg:shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-4 dark:border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${isEditar ? "bg-[#E6F1FB]" : "bg-[#EAF3DE]"}`}
          >
            {isEditar ? (
              <Pencil size={13} className="text-[#185FA5]" />
            ) : (
              <Plus size={13} className="text-[#3B6D11]" />
            )}
          </div>
          <h2 className="text-[14px] font-bold text-[#0e1f4d] dark:text-white">
            {isEditar ? "Editar inventario" : "Nuevo inventario"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X size={15} />
        </button>
      </div>

      {/* Formulario */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        
        {/* 🔹 Asamblea — Obligatorio */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Building2 size={11} /> Asamblea{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>

          {/* Preview asamblea seleccionada */}
          {asambleaSeleccionada && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3 py-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#1B3D8F]/20">
                <Building2 size={10} className="text-[#1B3D8F]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[#3B6D11]">
                  {asambleaSeleccionada.nombre}
                </p>
                <p className="font-mono text-[10px] text-[#3B6D11]/60">
                  {asambleaSeleccionada.codigo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ asambleaId: "" })}
                className="shrink-0 text-[#3B6D11]/60 transition hover:text-[#CC1A2E]"
                title="Quitar selección"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <select
            value={form.asambleaId}
            onChange={(e) => onChange({ asambleaId: e.target.value })}
            className={`${inputClass(!!errors.asambleaId)} cursor-pointer appearance-none`}
          >
            <option value="">— Seleccionar asamblea —</option>
            {asambleas?.length === 0 ? (
              <option disabled>Cargando asambleas...</option>
            ) : (
              asambleas?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} ({a.codigo})
                </option>
              ))
            )}
          </select>
          {errors.asambleaId && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.asambleaId}</p>
          )}
        </div>

        {/* 🔹 Tipo de Combustible — Obligatorio */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Fuel size={11} /> Tipo de combustible{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>

          {/* Preview tipo seleccionado */}
          {tipoSeleccionado && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3 py-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#1B3D8F]/20">
                <Fuel size={10} className="text-[#1B3D8F]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[#3B6D11]">
                  {tipoSeleccionado.nombre}
                </p>
                <p className="font-mono text-[10px] text-[#3B6D11]/60">
                  {tipoSeleccionado.codigo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ tipoCombustibleId: "" })}
                className="shrink-0 text-[#3B6D11]/60 transition hover:text-[#CC1A2E]"
                title="Quitar selección"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <select
            value={form.tipoCombustibleId}
            onChange={(e) => onChange({ tipoCombustibleId: e.target.value })}
            disabled={isEditar}
            className={`${inputClass(!!errors.tipoCombustibleId)} cursor-pointer appearance-none ${isEditar ? "bg-gray-50 dark:bg-white/5" : ""}`}
          >
            <option value="">— Seleccionar combustible —</option>
            {tiposCombustible?.length === 0 ? (
              <option disabled>Cargando tipos...</option>
            ) : (
              tiposCombustible?.map((t) => (
                <option key={t.id} value={t.id} disabled={isEditar && t.id !== tipoSeleccionado?.id}>
                  {t.nombre} ({t.codigo})
                </option>
              ))
            )}
          </select>
          {errors.tipoCombustibleId && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.tipoCombustibleId}</p>
          )}
          {isEditar && (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
              El tipo de combustible no se puede modificar después de creado
            </p>
          )}
        </div>

        {/* 🔹 Cantidad Asignada */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Package size={11} /> Cantidad asignada (L){" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.cantidadAsignada}
            onChange={(e) => onChange({ cantidadAsignada: e.target.value })}
            placeholder="Ej: 5000"
            className={inputClass(!!errors.cantidadAsignada)}
          />
          {errors.cantidadAsignada && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.cantidadAsignada}</p>
          )}
        </div>

        {/* 🔹 Saldo Actual */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Package size={11} /> Saldo actual (L){" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.saldoActual}
            onChange={(e) => onChange({ saldoActual: e.target.value })}
            placeholder="Ej: 3250.50"
            className={inputClass(!!errors.saldoActual)}
          />
          {errors.saldoActual && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.saldoActual}</p>
          )}
        </div>

        {/* 🔹 Preview de diferencia */}
        {(cantidad > 0 || saldo > 0) && (
          <div className={`rounded-lg px-3 py-2 text-[12px] ${
            diferencia < 0
              ? "bg-[#FCEBEB] text-[#CC1A2E]"
              : diferencia === 0
              ? "bg-[#E6F1FB] text-[#1B3D8F]"
              : "bg-[#EAF3DE] text-[#3B6D11]"
          }`}>
            <div className="flex items-center gap-1.5">
              <AlertCircle size={12} />
              <span>
                {diferencia < 0 
                  ? "⚠️ El saldo supera lo asignado" 
                  : diferencia === 0
                  ? "✓ Saldo igual a lo asignado"
                  : `Consumo registrado: ${diferencia.toLocaleString()} L`
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-black/[0.07] p-5 dark:border-white/[0.07]">
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-black/8 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold text-white transition disabled:opacity-70 ${
              isEditar
                ? "bg-[#1B3D8F] hover:bg-[#163272]"
                : "bg-[#3B6D11] hover:bg-[#2d5509]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Guardando...
              </>
            ) : isEditar ? (
              <>
                <Check size={14} /> Guardar cambios
              </>
            ) : (
              <>
                <Plus size={14} /> Crear inventario
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};