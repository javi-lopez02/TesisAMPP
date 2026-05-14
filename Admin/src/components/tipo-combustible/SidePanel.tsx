import { memo } from "react";
import {
  Check,
  DollarSign,
  Fuel,
  Hash,
  Loader2,
  Pencil,
  Plus,
  Tag,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import type { FormState } from "../../types/tipo-combustible.types";
import type { FormMode } from "../../types/globalTypes";
import { inputClass } from "../../helpers/helpers";
import { generateCodigo } from "./HelpersTipoComb";

// ── SidePanel ─────────────────────────────────────────────────────────────────
export const SidePanel = memo(
  ({
    mode,
    form,
    errors,
    loading,
    onChange,
    onSubmit,
    onClose,
  }: {
    mode: FormMode;
    form: FormState;
    errors: Partial<Record<keyof FormState, string>>;
    loading: boolean;
    onChange: (p: Partial<FormState>) => void;
    onSubmit: () => void;
    onClose: () => void;
  }) => {
    const isEditar = mode === "editar";

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
              {isEditar ? "Editar tipo" : "Nuevo tipo"}
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
          {/* Nombre */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <Tag size={11} /> Nombre
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => {
                const nombre = e.target.value;
                onChange({
                  nombre,
                  codigo: nombre ? generateCodigo(nombre) : "",
                });
              }}
              placeholder="Ej: Diésel"
              className={inputClass(!!errors.nombre)}
            />
            {errors.nombre && (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.nombre}</p>
            )}
          </div>

          {/* Código */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <Hash size={11} /> Código
            </label>
            <input
              type="text"
              value={form.codigo}
              onChange={(e) =>
                onChange({ codigo: e.target.value.toUpperCase() })
              }
              placeholder="Ej: DIE"
              className={`${inputClass(!!errors.codigo)} font-mono`}
            />
            {errors.codigo ? (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.codigo}</p>
            ) : (
              <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
                Generado automáticamente, puedes editarlo
              </p>
            )}
          </div>

          {/* Precio por litro */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <DollarSign size={11} /> Precio por litro
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-400 dark:text-white/30">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.precioPorLitro}
                onChange={(e) => onChange({ precioPorLitro: e.target.value })}
                placeholder="0.00"
                className={`${inputClass(!!errors.precioPorLitro)} pl-7`}
              />
            </div>
            {errors.precioPorLitro && (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">
                {errors.precioPorLitro}
              </p>
            )}
          </div>

          {/* Toggle Activo/Inactivo */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              Estado
            </label>
            <button
              type="button"
              onClick={() => onChange({ activo: !form.activo })}
              className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 transition ${
                form.activo
                  ? "border-[#C0DD97] bg-[#EAF3DE] dark:border-[#3B6D11]/40 dark:bg-[#3B6D11]/10"
                  : "border-black/8 bg-white dark:border-white/10 dark:bg-white/3"
              }`}
            >
              <span
                className={`text-[13px] font-semibold ${
                  form.activo
                    ? "text-[#3B6D11] dark:text-[#8BC34A]"
                    : "text-gray-400 dark:text-white/40"
                }`}
              >
                {form.activo ? "Activo" : "Inactivo"}
              </span>
              {form.activo ? (
                <ToggleRight
                  size={20}
                  className="text-[#3B6D11] dark:text-[#8BC34A]"
                />
              ) : (
                <ToggleLeft
                  size={20}
                  className="text-gray-300 dark:text-white/20"
                />
              )}
            </button>
          </div>

          {/* Vista previa */}
          {form.nombre && (
            <>
              <div className="h-px bg-black/50 dark:bg-white/50" />
              <div className="rounded-xl border border-black/70 bg-[#f8f9fc] p-4 dark:border-white/7 dark:bg-white/30">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
                  Vista previa
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B3D8F]">
                    <Fuel size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0e1f4d] dark:text-white">
                      {form.nombre}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-gray-400 dark:text-white/30">
                        {form.codigo || "—"}
                      </span>
                      {form.precioPorLitro && (
                        <>
                          <span className="text-gray-200 dark:text-white/10">
                            ·
                          </span>
                          <span className="text-[11px] font-semibold text-[#3B6D11] dark:text-[#8BC34A]">
                            ${Number(form.precioPorLitro).toFixed(2)} / L
                          </span>
                        </>
                      )}
                    </div>
                    {/* Indicador de estado en preview */}
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          form.activo
                            ? "bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#8BC34A]"
                            : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40"
                        }`}
                      >
                        {form.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-black/10 p-5 dark:border-white/[0.07]">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-black/80 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white/50"
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
                  <Plus size={14} /> Crear tipo
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    );
  },
);
SidePanel.displayName = "SidePanel";
