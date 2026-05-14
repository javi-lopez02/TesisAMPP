// src/components/movimientos/SidePanel.tsx
import {
  Loader2,
  Plus,
  X,
  Fuel,
  Package,
  FileText,
  Building2,
} from "lucide-react";
import type { getTipoCombustible } from "../../types/tipo-combustible.types";
import type { getAsamblea } from "../../types/asamblea.types";
import { inputClass } from "../../helpers/helpers";
import { CREATION_TIPOS } from "./HelpersMovimientos";
import type { FormState } from "../../types/movimiento.types";

interface SidePanelProps {
  form: FormState;
  tiposCombustible: getTipoCombustible[] | null;
  asambleas: getAsamblea[] | null;
  inventarioInfo?: { existe: boolean; saldoActual?: number };
  errors: Partial<Record<keyof FormState, string>>;
  loading: boolean;
  onChange: (partial: Partial<FormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const SidePanel = ({
  form,
  tiposCombustible,
  asambleas,
  inventarioInfo,
  errors,
  loading,
  onChange,
  onSubmit,
  onClose,
}: SidePanelProps) => {
  return (
    <aside className="flex w-full flex-col border-l border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35] lg:w-85 lg:shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-4 dark:border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF3DE]">
            <Plus size={13} className="text-[#3B6D11]" />
          </div>
          <h2 className="text-[14px] font-bold text-[#0e1f4d] dark:text-white">
            Nuevo movimiento
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
        {/* Tipo de Movimiento */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <FileText size={11} /> Tipo de movimiento{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <select
            value={form.tipo}
            onChange={(e) =>
              onChange({ tipo: e.target.value as FormState["tipo"] })
            }
            className={`${inputClass(!!errors.tipo)} cursor-pointer appearance-none`}
          >
            {CREATION_TIPOS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
            {CREATION_TIPOS.find((o) => o.value === form.tipo)?.desc}
          </p>
          {form.tipo !== "ASIGNACION_INICIAL" && !inventarioInfo?.existe && (
            <p className="mt-1 text-[10px] text-[#CC1A2E]">
              ⚠️ Debe existir una Asignación Inicial previa para este tipo de
              movimiento
            </p>
          )}
        </div>

        {/* Asamblea */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Building2 size={11} /> Asamblea{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <select
            value={form.asambleaId}
            onChange={(e) => onChange({ asambleaId: e.target.value })}
            className={`${inputClass(!!errors.asambleaId)} cursor-pointer appearance-none`}
          >
            <option value="">— Seleccionar asamblea —</option>
            {asambleas?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre} ({a.codigo})
              </option>
            ))}
          </select>
          {errors.asambleaId && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.asambleaId}
            </p>
          )}
        </div>

        {/* Tipo de Combustible */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Fuel size={11} /> Tipo de combustible{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <select
            value={form.tipoCombustibleId}
            onChange={(e) => onChange({ tipoCombustibleId: e.target.value })}
            className={`${inputClass(!!errors.tipoCombustibleId)} cursor-pointer appearance-none`}
          >
            <option value="">— Seleccionar tipo —</option>
            {tiposCombustible?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} ({t.codigo})
              </option>
            ))}
          </select>
          {errors.tipoCombustibleId && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.tipoCombustibleId}
            </p>
          )}
        </div>

        {/* 🔹 Preview: Estado del inventario */}
        {form.asambleaId && form.tipoCombustibleId && (
          <div
            className={`rounded-lg border px-3 py-2 text-[12px] ${
              inventarioInfo?.existe
                ? "border-[#C0DD97] bg-[#EAF3DE] text-[#3B6D11] dark:border-[#3B6D11]/40 dark:bg-[#3B6D11]/10"
                : "border-[#B77C1B]/30 bg-[#F5E6C8] text-[#B77C1B] dark:border-[#B77C1B]/40 dark:bg-[#B77C1B]/10"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Package size={12} />
              <span className="font-semibold">
                {inventarioInfo?.existe
                  ? "✓ Inventario existente"
                  : form.tipo === "ASIGNACION_INICIAL"
                    ? "ℹ️ Se creará nuevo inventario"
                    : "⚠️ Sin inventario previo"}
              </span>
            </div>
            {inventarioInfo?.existe &&
              inventarioInfo.saldoActual !== undefined && (
                <p className="mt-1 font-mono text-[11px]">
                  Saldo actual: {inventarioInfo.saldoActual.toLocaleString()} L
                </p>
              )}
          </div>
        )}

        {/* Cantidad */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Package size={11} /> Cantidad (L){" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.cantidad}
            onChange={(e) => onChange({ cantidad: e.target.value })}
            placeholder="Ej: 250.50"
            className={inputClass(!!errors.cantidad)}
          />
          {errors.cantidad && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.cantidad}</p>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <FileText size={11} /> Observaciones
          </label>
          <textarea
            value={form.observaciones}
            onChange={(e) => onChange({ observaciones: e.target.value })}
            placeholder="Detalles adicionales del movimiento..."
            rows={3}
            className={`${inputClass(!!errors.observaciones)} resize-none`}
          />
        </div>

        {/* Preview de impacto en saldo */}
        {form.cantidad && inventarioInfo?.existe && (
          <div
            className={`rounded-lg px-3 py-2 text-[12px] ${
              ["DEVOLUCION", "AJUSTE"].includes(form.tipo)
                ? "bg-[#EAF3DE] text-[#3B6D11]"
                : "bg-[#FCEBEB] text-[#CC1A2E]"
            }`}
          >
            <p className="font-semibold">
              {["DEVOLUCION", "AJUSTE"].includes(form.tipo) ? "↑" : "↓"} Impacto
              en saldo:
            </p>
            <p className="font-mono">
              {inventarioInfo.saldoActual?.toLocaleString()} L{" "}
              {["DEVOLUCION", "AJUSTE"].includes(form.tipo) ? "+" : "-"}{" "}
              {Number(form.cantidad).toLocaleString()} L ={" "}
              <strong>
                {(
                  (inventarioInfo.saldoActual || 0) +
                  (["DEVOLUCION", "AJUSTE"].includes(form.tipo) ? 1 : -1) *
                    Number(form.cantidad)
                ).toLocaleString()}{" "}
                L
              </strong>
            </p>
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
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3B6D11] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#2d5509] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Registrando...
              </>
            ) : (
              <>
                <Plus size={14} /> Registrar movimiento
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
