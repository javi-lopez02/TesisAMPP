// src/components/circunscripciones/SidePanel.tsx
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
  UserCircle2,
  Building2,
} from "lucide-react";
import type { getConsejo } from "../../types/consejo.types";
import type { FormState } from "../../pages/CircunscripcionPage";
import type { getUsuario } from "../../types/usuarios.types";

type FormMode = "crear" | "editar";

const generateCodigo = (nombre: string): string => {
  const words = nombre.trim().toUpperCase().split(/\s+/);
  const prefix = words
    .map((w) => w.slice(0, 3))
    .join("")
    .slice(0, 6);
  const num = String(Math.floor(Math.random() * 900) + 100);
  return `C-${prefix}-${num}`;
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

interface SidePanelProps {
  mode: FormMode;
  form: FormState;
  delegados: getUsuario[] | null;
  consejos: getConsejo[] | null;
  errors: Partial<Record<keyof FormState, string>>;
  loading: boolean;
  onChange: (partial: Partial<FormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const SidePanel = ({
  mode,
  form,
  delegados,
  consejos,
  errors,
  loading,
  onChange,
  onSubmit,
  onClose,
}: SidePanelProps) => {
  const isEditar = mode === "editar";

  // Objetos seleccionados actualmente para los previews
  const delegadoSeleccionado = delegados?.find((u) => u.id === form.delegadoId);
  const consejoSeleccionado = consejos?.find(
    (c) => c.id === form.consejoPopularId,
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
            {isEditar ? "Editar circunscripción" : "Nueva circunscripción"}
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
            placeholder="Ej: La Ceiba"
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
            placeholder="C-XXX-000"
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

        {/* Consejo Popular — obligatorio */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Building2 size={11} /> Consejo popular{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>

          {/* Preview consejo seleccionado */}
          {consejoSeleccionado && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3 py-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#1B3D8F]/20">
                <Building2 size={10} className="text-[#1B3D8F]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[#3B6D11]">
                  {consejoSeleccionado.nombre}
                </p>
                <p className="font-mono text-[10px] text-[#3B6D11]/60">
                  {consejoSeleccionado.codigo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ consejoPopularId: "" })}
                className="shrink-0 text-[#3B6D11]/60 transition hover:text-[#CC1A2E]"
                title="Quitar selección"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <select
            value={form.consejoPopularId}
            onChange={(e) => onChange({ consejoPopularId: e.target.value })}
            className={`${inputClass(!!errors.consejoPopularId)} cursor-pointer appearance-none`}
          >
            <option value="">— Seleccionar consejo —</option>
            {consejos?.length === 0 ? (
              <option disabled>Cargando consejos...</option>
            ) : (
              consejos?.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.nombre}
                </option>
              ))
            )}
          </select>
          {errors.consejoPopularId && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.consejoPopularId}
            </p>
          )}
        </div>

        {/* Delegado — opcional */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <UserCircle2 size={11} /> Delegado
          </label>

          {/* Preview delegado seleccionado */}
          {delegadoSeleccionado && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3 py-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B3D8F] text-[10px] font-bold text-white uppercase">
                {delegadoSeleccionado.nombre[0]}
                {delegadoSeleccionado.apellidos[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[#3B6D11]">
                  {delegadoSeleccionado.nombre} {delegadoSeleccionado.apellidos}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ delegadoId: "" })}
                className="shrink-0 text-[#3B6D11]/60 transition hover:text-[#CC1A2E]"
                title="Quitar delegado"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <select
            value={form.delegadoId}
            onChange={(e) => onChange({ delegadoId: e.target.value })}
            className={`${inputClass(!!errors.delegadoId)} cursor-pointer appearance-none`}
          >
            <option value="">— Sin asignar —</option>
            {delegados?.length === 0 ? (
              <option disabled>Cargando usuarios...</option>
            ) : (
              delegados?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellidos}
                </option>
              ))
            )}
          </select>
          {errors.delegadoId ? (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.delegadoId}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
              Solo usuarios con rol Delegado
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
                <Plus size={14} /> Crear circunscripción
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
