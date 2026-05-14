// src/components/zonas/SidePanel.tsx
import {
  Check,
  Hash,
  Loader2,
  Pencil,
  Plus,
  Tag,
  ToggleLeft,
  ToggleRight,
  X,
  GitBranch,
  ChevronDown,
} from "lucide-react";
import type { getCircunscripcion } from "../../types/circunscripcion.types";
import type { FormState } from "../../types/zonas.types";
import type { FormMode } from "../../types/globalTypes";

const generateCodigo = (nombre: string): string => {
  const words = nombre.trim().toUpperCase().split(/\s+/);
  const prefix = words
    .map((w) => w.slice(0, 3))
    .join("")
    .slice(0, 6);
  const num = String(Math.floor(Math.random() * 900) + 100);
  return `Z-${prefix}-${num}`;
};

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-[13px] text-[#0e1f4d] outline-none transition
   placeholder:text-gray-300
   dark:bg-black/3 dark:text-gray-500 dark:placeholder:text-white/20
   ${
     hasError
       ? "border-[#F09595] bg-[#FCEBEB] focus:border-[#CC1A2E] dark:bg-[#CC1A2E]/10"
       : "border-black/[0.10] bg-white focus:border-[#1B3D8F] dark:border-white/10 dark:focus:border-[#85B7EB]"
   }`;
const SelectField = ({
  value,
  onChange,
  hasError,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
  children: React.ReactNode;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass(hasError)} cursor-pointer appearance-none pr-9 dark:scheme-dark`}
    >
      {children}
    </select>
    <ChevronDown
      size={13}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/30"
    />
  </div>
);

interface SidePanelProps {
  mode: FormMode;
  form: FormState;
  circunscripciones: getCircunscripcion[] | null;
  errors: Partial<Record<keyof FormState, string>>;
  loading: boolean;
  onChange: (partial: Partial<FormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const SidePanel = ({
  mode,
  form,
  circunscripciones,
  errors,
  loading,
  onChange,
  onSubmit,
  onClose,
}: SidePanelProps) => {
  const isEditar = mode === "editar";

  const circunscripcionSeleccionada = circunscripciones?.find(
    (c) => c.id === form.circunscripcionId,
  );

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
            {isEditar ? "Editar zona" : "Nueva zona"}
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
            placeholder="Ej: Centro Ciudad"
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
            onChange={(e) => onChange({ codigo: e.target.value.toUpperCase() })}
            placeholder="Z-XXX-000"
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

        {/* Circunscripción — obligatoria */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <GitBranch size={11} /> Circunscripción{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>

          {/* Preview */}
          {circunscripcionSeleccionada && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3 py-2 dark:border-[#3B6D11]/40 dark:bg-[#3B6D11]/10">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#1B3D8F]/20 dark:bg-[#1B3D8F]/30">
                <GitBranch
                  size={10}
                  className="text-[#1B3D8F] dark:text-[#85B7EB]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[#3B6D11] dark:text-[#8BC34A]">
                  {circunscripcionSeleccionada.nombre}
                </p>
                <p className="font-mono text-[10px] text-[#3B6D11]/60 dark:text-[#8BC34A]/60">
                  {circunscripcionSeleccionada.codigo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ circunscripcionId: "" })}
                className="shrink-0 text-[#3B6D11]/50 transition hover:text-[#CC1A2E] dark:text-[#8BC34A]/50 dark:hover:text-[#F09595]"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <SelectField
            value={form.circunscripcionId}
            onChange={(v) => onChange({ circunscripcionId: v })}
            hasError={!!errors.circunscripcionId}
          >
            <option value="">— Seleccionar circunscripción —</option>
            {circunscripciones?.length === 0 ? (
              <option disabled>Cargando circunscripciones...</option>
            ) : (
              circunscripciones?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))
            )}
          </SelectField>

          {errors.circunscripcionId && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.circunscripcionId}
            </p>
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
                <Plus size={14} /> Crear zona
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
