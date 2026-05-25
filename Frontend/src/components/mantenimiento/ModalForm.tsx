// src/components/mantenimiento/ModalForm.tsx
import { useEffect } from "react";
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

interface ModalFormProps {
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

export const ModalForm = ({
  mode,
  form,
  vehiculos,
  errors,
  loading,
  onChange,
  onSubmit,
  onClose,
  helpers,
}: ModalFormProps) => {
  const isEditar = mode === "editar";

  // 🔹 Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // 🔹 Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    // 🔹 Backdrop con animación de fade-in
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        // Cerrar si se hace clic fuera del modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 🔹 Modal con animación de entrada */}
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-2xl border border-black/[0.07] bg-white shadow-xl dark:border-white/[0.07] dark:bg-[#0e1a35]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-4 dark:border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${isEditar ? "bg-[#E6F1FB]" : "bg-[#EAF3DE]"}`}
            >
              {isEditar ? (
                <Pencil size={14} className="text-[#185FA5]" />
              ) : (
                <Plus size={14} className="text-[#3B6D11]" />
              )}
            </div>
            <h2 className="text-[15px] font-bold text-[#0e1f4d] dark:text-white">
              {isEditar ? "Editar mantenimiento" : "Nuevo mantenimiento"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Formulario con scroll interno */}
        <div className="max-h-[70vh] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-5">
          <div className="flex flex-col gap-4">
            {/* Tipo */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                <Wrench size={11} /> Tipo{" "}
                <span className="text-[#CC1A2E]">*</span>
              </label>
              <select
                value={form.tipo}
                onChange={(e) =>
                  onChange({ tipo: e.target.value as TipoMantenimiento })
                }
                className={`${inputClass(!!errors.tipo)} cursor-pointer appearance-none`}
                autoFocus
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

            {/* Vehículo */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                <Car size={11} /> Vehículo{" "}
                <span className="text-[#CC1A2E]">*</span>
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

            {/* Fecha */}
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
                <p className="mt-1 text-[11px] text-[#CC1A2E]">
                  {errors.fecha}
                </p>
              )}
            </div>

            {/* Kilometraje */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                <Gauge size={11} /> Kilometraje{" "}
                <span className="text-[#CC1A2E]">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Ej: 15000"
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
                  {helpers.validateNumeroFormat(
                    form.kilometraje,
                    0,
                    "Kilometraje",
                  )}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
                  Kilómetros al momento del mantenimiento
                </p>
              )}
            </div>

            {/* Costo */}
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
                  placeholder="Ej: 250.00"
                  value={form.costo}
                  onChange={(e) => onChange({ costo: e.target.value })}
                  className={`${inputClass(!!errors.costo)} pl-7`}
                />
              </div>
              {errors.costo ? (
                <p className="mt-1 text-[11px] text-[#CC1A2E]">
                  {errors.costo}
                </p>
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

            {/* Descripción */}
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
        </div>

        {/* Footer con botones */}
        <div className="border-t border-black/[0.07] bg-[#f8f9fc] px-5 py-4 dark:border-white/[0.07] dark:bg-white/3">
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
      </div>
    </div>
  );
};
