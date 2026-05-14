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
} from "lucide-react";
import type { getUsuario } from "../../types/usuarios.types";
import type { FormState } from "../../types/consejo.types";
import type { FormMode } from "../../types/globalTypes";
import { inputClass } from "../../helpers/helpers";
import { generateCodigo } from "./HelpersConsejos";

interface SidePanelProps {
  mode: FormMode;
  form: FormState;
  presidentes: getUsuario[] | null;
  errors: Partial<Record<keyof FormState, string>>;
  loading: boolean;
  onChange: (partial: Partial<FormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const SidePanel = ({
  mode,
  form,
  presidentes,
  errors,
  loading,
  onChange,
  onSubmit,
  onClose,
}: SidePanelProps) => {
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
            {isEditar ? "Editar consejo" : "Nuevo consejo"}
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
            placeholder="Ej: Versalles"
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
            placeholder="CP-XXX-000"
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

        {/* Presidente */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <UserCircle2 size={11} /> Presidente
          </label>

          {/* Preview del presidente seleccionado */}
          {form.presidenteId &&
            (() => {
              const p = presidentes?.find((u) => u.id === form.presidenteId);
              return p ? (
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3 py-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B3D8F] text-[10px] font-bold text-white uppercase">
                    {p.nombre[0]}
                    {p.apellidos[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#3B6D11]">
                      {p.nombre} {p.apellidos}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ presidenteId: "" })}
                    className="shrink-0 text-[#3B6D11]/60 transition hover:text-[#CC1A2E]"
                    title="Quitar presidente"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : null;
            })()}

          <select
            value={form.presidenteId}
            onChange={(e) => onChange({ presidenteId: e.target.value })}
            className={`${inputClass(!!errors.presidenteId)} cursor-pointer appearance-none`}
          >
            <option value="">— Sin asignar —</option>
            {presidentes?.length === 0 ? (
              <option disabled>Cargando usuarios...</option>
            ) : (
              presidentes?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellidos}
                </option>
              ))
            )}
          </select>

          {errors.presidenteId ? (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.presidenteId}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
              Solo usuarios con rol Presidente de Consejo
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
                <Plus size={14} /> Crear consejo
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
