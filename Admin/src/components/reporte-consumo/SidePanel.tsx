import {
  Check,
  Loader2,
  Pencil,
  Plus,
  X,
  Car,
  Droplet,
  Gauge,
  AlignLeft,
} from "lucide-react";
import type { FormState } from "../../types/reporte-consumo.types";
import type { getAsignacion } from "../../types/asignacion.types";

type FormMode = "crear" | "editar";
const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-[13px] text-[#0e1f4d] outline-none transition placeholder:text-gray-300 dark:bg-black/3 dark:text-gray-500 dark:placeholder:text-white/20 ${hasError ? "border-[#F09595] bg-[#FCEBEB] focus:border-[#CC1A2E] dark:bg-[#CC1A2E]/10" : "border-black/[0.10] bg-white focus:border-[#1B3D8F] dark:border-white/10 dark:focus:border-[#85B7EB]"}`;

interface Props {
  mode: FormMode;
  form: FormState;
  asignaciones: getAsignacion[] | null;
  errors: Partial<Record<keyof FormState, string>>;
  loading: boolean;
  onChange: (partial: Partial<FormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
  helpers?: {
    validateNumeroFormat: (
      value: string,
      min: number,
      field: string,
    ) => string | undefined;
  };
}

export const SidePanel = ({
  mode,
  form,
  asignaciones,
  errors,
  loading,
  onChange,
  onSubmit,
  onClose,
  helpers,
}: Props) => {
  const isEditar = mode === "editar";
  const asignacionSeleccionada = asignaciones?.find(
    (a) => a.id === form.asignacionId,
  );

  return (
    <aside className="flex w-full flex-col border-l border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35] lg:w-85 lg:shrink-0">
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
            {isEditar ? "Editar reporte" : "Nuevo reporte"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X size={15} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Car size={11} /> Asignación{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <select
            value={form.asignacionId}
            onChange={(e) => onChange({ asignacionId: e.target.value })}
            className={`${inputClass(!!errors.asignacionId)} cursor-pointer appearance-none`}
          >
            <option value="">— Seleccionar asignación —</option>
            {asignaciones?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.vehiculo?.placa} — {a.vehiculo?.marca}
              </option>
            ))}
          </select>
          {errors.asignacionId && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.asignacionId}
            </p>
          )}
          {asignacionSeleccionada && (
            <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">
              Responsable: {asignacionSeleccionada.responsable?.nombre}{" "}
              {asignacionSeleccionada.responsable?.apellidos}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Droplet size={11} /> Consumo real (L){" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-400 dark:text-white/30">
              L
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.consumoReal}
              onChange={(e) => onChange({ consumoReal: e.target.value })}
              className={`${inputClass(!!errors.consumoReal)} pl-7`}
            />
          </div>
          {errors.consumoReal ? (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.consumoReal}
            </p>
          ) : form.consumoReal &&
            helpers?.validateNumeroFormat(form.consumoReal, 0.01, "Consumo") ? (
            <p className="mt-1 text-[11px] text-[#BA7517]">
              {helpers.validateNumeroFormat(form.consumoReal, 0.01, "Consumo")}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
              Litros consumidos
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Gauge size={11} /> Kilometraje recorrido{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.kilometrajeRecorrido}
            onChange={(e) => onChange({ kilometrajeRecorrido: e.target.value })}
            className={inputClass(!!errors.kilometrajeRecorrido)}
          />
          {errors.kilometrajeRecorrido ? (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.kilometrajeRecorrido}
            </p>
          ) : form.kilometrajeRecorrido &&
            helpers?.validateNumeroFormat(
              form.kilometrajeRecorrido,
              0,
              "Kilometraje",
            ) ? (
            <p className="mt-1 text-[11px] text-[#BA7517]">
              {helpers.validateNumeroFormat(
                form.kilometrajeRecorrido,
                0,
                "Kilometraje",
              )}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
              Kilómetros del recorrido
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Gauge size={11} /> Rendimiento (km/L)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.rendimiento}
            onChange={(e) => onChange({ rendimiento: e.target.value })}
            className={inputClass(!!errors.rendimiento)}
            placeholder="Opcional: se calcula automáticamente"
          />
          {errors.rendimiento && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.rendimiento}
            </p>
          )}
          <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
            Dejar vacío para cálculo automático
          </p>
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <AlignLeft size={11} /> Observaciones
          </label>
          <textarea
            value={form.observaciones}
            onChange={(e) => onChange({ observaciones: e.target.value })}
            rows={3}
            className={`${inputClass(!!errors.observaciones)} resize-none`}
            placeholder="Detalles adicionales..."
          />
          {errors.observaciones && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.observaciones}
            </p>
          )}
        </div>
        {/* Preview de cálculo */}
        {form.consumoReal && form.kilometrajeRecorrido && !form.rendimiento && (
          <div className="rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3 py-2">
            <p className="text-[11px] font-semibold text-[#3B6D11]">
              Rendimiento estimado:{" "}
              {(
                Number(form.kilometrajeRecorrido) / Number(form.consumoReal)
              ).toFixed(2)}{" "}
              km/L
            </p>
          </div>
        )}
      </div>
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
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold text-white transition disabled:opacity-70 ${isEditar ? "bg-[#1B3D8F] hover:bg-[#163272]" : "bg-[#3B6D11] hover:bg-[#2d5509]"}`}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Guardando...
              </>
            ) : isEditar ? (
              <>
                <Check size={14} /> Guardar
              </>
            ) : (
              <>
                <Plus size={14} /> Registrar
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
