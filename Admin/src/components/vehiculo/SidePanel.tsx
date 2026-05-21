// src/components/vehiculos/SidePanel.tsx
import { Check, Loader2, Pencil, Plus, X, Car, Fuel, Gauge, User, Wrench } from "lucide-react";
import type { FormState, EstadoVehiculo } from "../../types/vehiculo.types";
import type { getTipoCombustible } from "../../types/tipo-combustible.types";
import type { getUsuario } from "../../types/usuarios.types";
import { inputClass } from "../../helpers/helpers";
import type { FormMode } from "../../types/globalTypes";
import { ESTADOS } from "./HelpersVehiculo";


interface SidePanelProps {
  mode: FormMode;
  form: FormState;
  tiposCombustible: getTipoCombustible[] | null;
  choferes: getUsuario[] | null;
  errors: Partial<Record<keyof FormState, string>>;
  loading: boolean;
  onChange: (partial: Partial<FormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
  helpers?: {
    validatePlacaFormat: (placa: string) => string | undefined;
    validateNumeroFormat: (value: string, min: number, max: number, field: string) => string | undefined;
    PLACA_FORMATO_MSG: string;
  };
}

export const SidePanel = ({
  mode,
  form,
  tiposCombustible,
  choferes,
  errors,
  loading,
  onChange,
  onSubmit,
  onClose,
  helpers,
}: SidePanelProps) => {
  const isEditar = mode === "editar";

  const choferSeleccionado = choferes?.find((c) => c.id === form.choferId);

  return (
    <aside className="flex w-full flex-col border-l border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35] lg:w-85 lg:shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-4 dark:border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isEditar ? "bg-[#E6F1FB]" : "bg-[#EAF3DE]"}`}>
            {isEditar ? <Pencil size={13} className="text-[#185FA5]" /> : <Plus size={13} className="text-[#3B6D11]" />}
          </div>
          <h2 className="text-[14px] font-bold text-[#0e1f4d] dark:text-white">
            {isEditar ? "Editar vehículo" : "Nuevo vehículo"}
          </h2>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white">
          <X size={15} />
        </button>
      </div>

      {/* Formulario */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        
        {/* Placa */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Car size={11} /> Placa <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="text"
            value={form.placa}
            onChange={(e) => onChange({ placa: e.target.value.toUpperCase() })}
            placeholder="Ej: ABC-123"
            className={`${inputClass(!!errors.placa)} font-mono uppercase`}
          />
          {errors.placa ? (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.placa}</p>
          ) : form.placa && helpers?.validatePlacaFormat(form.placa) ? (
            <p className="mt-1 text-[11px] text-[#BA7517]">{helpers.validatePlacaFormat(form.placa)}</p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">{helpers?.PLACA_FORMATO_MSG}</p>
          )}
        </div>

        {/* Marca */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Car size={11} /> Marca <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="text"
            value={form.marca}
            onChange={(e) => onChange({ marca: e.target.value })}
            placeholder="Ej: Toyota, Ford, Nissan"
            className={inputClass(!!errors.marca)}
          />
          {errors.marca && <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.marca}</p>}
        </div>

        {/* Tipo de Combustible */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Fuel size={11} /> Tipo de combustible <span className="text-[#CC1A2E]">*</span>
          </label>
          <select
            value={form.tipoCombustibleId}
            onChange={(e) => onChange({ tipoCombustibleId: e.target.value })}
            className={`${inputClass(!!errors.tipoCombustibleId)} cursor-pointer appearance-none`}
          >
            <option value="">— Seleccionar tipo —</option>
            {tiposCombustible?.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre} ({t.codigo})</option>
            ))}
          </select>
          {errors.tipoCombustibleId && <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.tipoCombustibleId}</p>}
        </div>

        {/* Capacidad de Tanque */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Fuel size={11} /> Capacidad de tanque (L) <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="number"
            min="10"
            max="10000"
            step="1"
            value={form.capacidadTanque}
            onChange={(e) => onChange({ capacidadTanque: e.target.value })}
            placeholder="Ej: 50"
            className={inputClass(!!errors.capacidadTanque)}
          />
          {errors.capacidadTanque ? (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.capacidadTanque}</p>
          ) : form.capacidadTanque && helpers?.validateNumeroFormat(form.capacidadTanque, 10, 10000, "Capacidad") ? (
            <p className="mt-1 text-[11px] text-[#BA7517]">{helpers.validateNumeroFormat(form.capacidadTanque, 10, 10000, "Capacidad")}</p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">Entre 10 y 10,000 litros</p>
          )}
        </div>

        {/* Kilometraje */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Gauge size={11} /> Kilometraje actual <span className="text-[#CC1A2E]">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="9999999"
            step="1"
            value={form.kilometraje}
            onChange={(e) => onChange({ kilometraje: e.target.value })}
            placeholder="Ej: 45000"
            className={inputClass(!!errors.kilometraje)}
          />
          {errors.kilometraje ? (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.kilometraje}</p>
          ) : form.kilometraje && helpers?.validateNumeroFormat(form.kilometraje, 0, 9999999, "Kilometraje") ? (
            <p className="mt-1 text-[11px] text-[#BA7517]">{helpers.validateNumeroFormat(form.kilometraje, 0, 9999999, "Kilometraje")}</p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">Kilómetros recorridos</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <Wrench size={11} /> Estado <span className="text-[#CC1A2E]">*</span>
          </label>
          <select
            value={form.estado}
            onChange={(e) => onChange({ estado: e.target.value as EstadoVehiculo })}
            className={`${inputClass(!!errors.estado)} cursor-pointer appearance-none`}
          >
            {ESTADOS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
            {ESTADOS.find((o) => o.value === form.estado)?.desc}
          </p>
          {errors.estado && <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.estado}</p>}
          
          {/* Advertencia si EN_USO sin chofer */}
          {form.estado === "EN_USO" && !form.choferId && (
            <p className="mt-1 text-[11px] text-[#CC1A2E]">
              ⚠️ Un vehículo en uso debe tener chofer asignado
            </p>
          )}
        </div>

        {/* Chofer (opcional) */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
            <User size={11} /> Chofer asignado
          </label>
          
          {choferSeleccionado && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3 py-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B3D8F] text-[10px] font-bold text-white uppercase">
                {choferSeleccionado.nombre[0]}{choferSeleccionado.apellidos[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[#3B6D11]">
                  {choferSeleccionado.nombre} {choferSeleccionado.apellidos}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ choferId: "" })}
                className="shrink-0 text-[#3B6D11]/60 transition hover:text-[#CC1A2E]"
                title="Quitar chofer"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <select
            value={form.choferId}
            onChange={(e) => onChange({ choferId: e.target.value })}
            className={`${inputClass(!!errors.choferId)} cursor-pointer appearance-none`}
          >
            <option value="">— Sin asignar —</option>
            {choferes?.length === 0 ? (
              <option disabled>Cargando choferes...</option>
            ) : (
              choferes?.filter((c) => c.rol === "CHOFER").map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.apellidos}
                </option>
              ))
            )}
          </select>
          {errors.choferId && <p className="mt-1 text-[11px] text-[#CC1A2E]">{errors.choferId}</p>}
          <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
            Solo usuarios con rol Chofer
          </p>
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
              isEditar ? "bg-[#1B3D8F] hover:bg-[#163272]" : "bg-[#3B6D11] hover:bg-[#2d5509]"
            }`}
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Guardando...</>
            ) : isEditar ? (
              <><Check size={14} /> Guardar cambios</>
            ) : (
              <><Plus size={14} /> Registrar vehículo</>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};