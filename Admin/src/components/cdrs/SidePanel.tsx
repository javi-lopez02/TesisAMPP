// src/components/cdrs/SidePanel.tsx
import {
  Check,
  Hash,
  Loader2,
  Pencil,
  Plus,
  ToggleLeft,
  ToggleRight,
  X,
  MapPin,
  Home,
} from "lucide-react";
import type { FormState } from "../../pages/CdrPage";
import type { getZonas } from "../../types/zonas.types";

type FormMode = "crear" | "editar";

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-[13px] text-[#0e1f4d] outline-none transition
   placeholder:text-gray-300
   dark:bg-black/3 dark:text-gray-500 dark:placeholder:text-white/20
   ${
     hasError
       ? "border-[#F09595] bg-[#FCEBEB] focus:border-[#CC1A2E] dark:bg-[#CC1A2E]/10"
       : "border-black/[0.10] bg-white focus:border-[#1B3D8F] dark:border-white/10 dark:focus:border-[#85B7EB]"
   }`;

interface SidePanelProps {
  mode: FormMode;
  form: FormState;
  zonas: getZonas[] | null;
  errors: Partial<Record<keyof FormState, string>>;
  loading: boolean;
  onChange: (partial: Partial<FormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const SidePanel = ({
  mode,
  form,
  zonas,
  errors,
  loading,
  onChange,
  onSubmit,
  onClose,
}: SidePanelProps) => {
  const isEditar = mode === "editar";
  const zonaSeleccionada = zonas?.find((z) => z.id === form.zonaId);

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
            {isEditar ? "Editar CDR" : "Nuevo CDR"}
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
        {/* Número */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Hash size={11} /> Número <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={form.numero}
            onChange={(e) => onChange({ numero: e.target.value })}
            placeholder="Ej: 15"
            className={inputClass(!!errors.numero)}
          />
          {errors.numero && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.numero}</p>
          )}
        </div>

        {/* Dirección */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Home size={11} /> Dirección <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => onChange({ direccion: e.target.value })}
            placeholder="Ej: Calle 10 #23-45"
            className={inputClass(!!errors.direccion)}
          />
          {errors.direccion && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.direccion}</p>
          )}
        </div>

        {/* Zona — obligatorio */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <MapPin size={11} /> Zona <span className="text-[#CC1A2E]">*</span>
          </label>

          {/* Preview zona seleccionada */}
          {zonaSeleccionada && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3 py-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#1B3D8F]/20">
                <MapPin size={10} className="text-[#1B3D8F]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[#3B6D11]">
                  {zonaSeleccionada.nombre}
                </p>
                <p className="font-mono text-[10px] text-[#3B6D11]/60">
                  {zonaSeleccionada.codigo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ zonaId: "" })}
                className="shrink-0 text-[#3B6D11]/60 transition hover:text-[#CC1A2E]"
                title="Quitar selección"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <select
            value={form.zonaId}
            onChange={(e) => onChange({ zonaId: e.target.value })}
            className={`${inputClass(!!errors.zonaId)} cursor-pointer appearance-none`}
          >
            <option value="">— Seleccionar zona —</option>
            {zonas?.length === 0 ? (
              <option disabled>Cargando zonas...</option>
            ) : (
              zonas?.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nombre} ({z.codigo})
                </option>
              ))
            )}
          </select>
          {errors.zonaId && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.zonaId}</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            Estado
          </label>
          <button
            type="button"
            onClick={() => onChange({ activo: !form.activo })}
            className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 transition ${
              form.activo
                ? "border-[#C0DD97] bg-[#EAF3DE]"
                : "border-black/8 bg-white dark:border-white/10 dark:bg-white/3"
            }`}
          >
            <span
              className={`text-[13px] font-semibold ${
                form.activo
                  ? "text-[#3B6D11]"
                  : "text-gray-400 dark:text-white/40"
              }`}
            >
              {form.activo ? "Activo" : "Inactivo"}
            </span>
            {form.activo ? (
              <ToggleRight size={20} className="text-[#3B6D11]" />
            ) : (
              <ToggleLeft size={20} className="text-gray-300 dark:text-white/20" />
            )}
          </button>
        </div>
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
                <Plus size={14} /> Crear CDR
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};