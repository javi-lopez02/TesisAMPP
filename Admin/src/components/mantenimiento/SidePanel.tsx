import {
  Check,
  Loader2,
  Pencil,
  Plus,
  X,
  Wrench,
  Car,
  Calendar,
  DollarSign,
  Gauge,
} from "lucide-react";
import type {
  FormState,
  TipoMantenimiento,
} from "../../types/mantenimiento.types";
import type { getVehiculo } from "../../types/vehiculo.types";
import type { FormMode } from "../../types/globalTypes";
import { inputClass } from "../../helpers/helpers";

const TIPOS: { value: TipoMantenimiento; label: string }[] = [
  { value: "Preventivo", label: "Preventivo" },
  { value: "Correctivo", label: "Correctivo" },
];

interface Props {
  mode: FormMode;
  form: FormState;
  vehiculos: getVehiculo[] | null;
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
  vehiculos,
  errors,
  loading,
  onChange,
  onSubmit,
  onClose,
  helpers,
}: Props) => {
  const isEditar = mode === "editar";

  return (
    <aside className="flex w-full flex-col border-l border-black/[0.07] rounded-2xl bg-white dark:border-white/[0.07] dark:bg-[#0e1a35] lg:w-85 lg:shrink-0">
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
            {isEditar ? "Editar mantenimiento" : "Nuevo mantenimiento"}
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
            <Wrench size={11} /> Tipo <span className="text-[#CC1A2E]">*</span>
          </label>
          <select
            value={form.tipo}
            onChange={(e) =>
              onChange({ tipo: e.target.value as TipoMantenimiento })
            }
            className={`${inputClass(!!errors.tipo)} cursor-pointer appearance-none`}
          >
            {TIPOS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.tipo && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.tipo}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Car size={11} /> Vehículo <span className="text-[#CC1A2E]">*</span>
          </label>
          <select
            value={form.vehiculoId}
            onChange={(e) => onChange({ vehiculoId: e.target.value })}
            className={`${inputClass(!!errors.vehiculoId)} cursor-pointer appearance-none`}
          >
            <option value="">— Seleccionar vehículo —</option>
            {vehiculos?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.marca} — {v.placa}
              </option>
            ))}
          </select>
          {errors.vehiculoId && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.vehiculoId}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Calendar size={11} /> Fecha{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => onChange({ fecha: e.target.value })}
            className={inputClass(!!errors.fecha)}
          />
          {errors.fecha && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.fecha}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Gauge size={11} /> Kilometraje{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.kilometraje}
            onChange={(e) => onChange({ kilometraje: e.target.value })}
            className={inputClass(!!errors.kilometraje)}
          />
          {errors.kilometraje ? (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.kilometraje}
            </p>
          ) : form.kilometraje &&
            helpers?.validateNumeroFormat(
              form.kilometraje,
              0,
              "Kilometraje",
            ) ? (
            <p className="mt-1 text-[11px] text-[#BA7517]">
              {helpers.validateNumeroFormat(form.kilometraje, 0, "Kilometraje")}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
              Kilómetros al momento del mantenimiento
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <DollarSign size={11} /> Costo ($){" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-400 dark:text-white/30">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.costo}
              onChange={(e) => onChange({ costo: e.target.value })}
              className={`${inputClass(!!errors.costo)} pl-7`}
            />
          </div>
          {errors.costo ? (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.costo}</p>
          ) : form.costo &&
            helpers?.validateNumeroFormat(form.costo, 0, "Costo") ? (
            <p className="mt-1 text-[11px] text-[#BA7517]">
              {helpers.validateNumeroFormat(form.costo, 0, "Costo")}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
              Costo total del mantenimiento
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Wrench size={11} /> Descripción{" "}
            <span className="text-[#CC1A2E]">*</span>
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) => onChange({ descripcion: e.target.value })}
            rows={3}
            className={`${inputClass(!!errors.descripcion)} resize-none`}
          />
          {errors.descripcion && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              {errors.descripcion}
            </p>
          )}
        </div>
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
