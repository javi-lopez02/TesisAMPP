import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Fuel,
  Building2,
  GitBranch,
  Map,
  Home,
  ListOrdered,
  Tag,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Route,
} from "lucide-react";
import type {
  FormState,
  FormPuntoRuta,
  TipoSolicitud,
  TipoPuntoRuta,
} from "../../types/solicitud.types";
import type { getTipoCombustible } from "../../types/tipo-combustible.types";
import type { getConsejo } from "../../types/consejo.types";
import type { getCircunscripcion } from "../../types/circunscripcion.types";
import type { getZonas } from "../../types/zonas.types";
import type { getCdrs } from "../../types/cdrs.types";
import { inputClass } from "../../helpers/helpers";
import {
  TIPOS_SOLICITUD,
  TIPOS_PUNTO,
  formatDistance,
  formatTime,
} from "../../schemas/solicitud.schema";

interface Props {
  form: FormState;
  tiposCombustible: getTipoCombustible[] | null;
  consejos: getConsejo[] | null;
  circunscripciones: getCircunscripcion[] | null;
  zonas: getZonas[] | null;
  cdrs: getCdrs[] | null;
  errors: Partial<Record<keyof FormState, string>> & {
    puntosRuta?: Record<number, Partial<Record<keyof FormPuntoRuta, string>>>;
  };
  loading: boolean;
  onChange: (partial: Partial<FormState>) => void;
  onAddPunto: () => void;
  onRemovePunto: (index: number) => void;
  onUpdatePunto: (index: number, partial: Partial<FormPuntoRuta>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const SelectField = ({
  value,
  onChange,
  options,
  placeholder,
  hasError,
  icon: Icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  hasError: boolean;
  icon?: React.ElementType;
}) => (
  <div className="relative">
    {Icon && (
      <Icon
        size={11}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 pointer-events-none"
      />
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass(hasError)} ${Icon ? "pl-8" : ""} cursor-pointer appearance-none pr-9`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={13}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/30"
    />
  </div>
);

export const SolicitudForm = ({
  form,
  tiposCombustible,
  consejos,
  circunscripciones,
  zonas,
  cdrs,
  errors,
  loading,
  onChange,
  onAddPunto,
  onRemovePunto,
  onUpdatePunto,
  onSubmit,
  onCancel,
}: Props) => {
  const [expandedPuntos, setExpandedPuntos] = useState<Record<number, boolean>>(
    {},
  );

  const togglePunto = (index: number) => {
    setExpandedPuntos((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handlePuntoChange = useCallback(
    (index: number, field: keyof FormPuntoRuta, value: string) => {
      onUpdatePunto(index, { [field]: value });
    },
    [onUpdatePunto],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Sección: Información General */}
      <div className="rounded-xl border border-black/[0.07] bg-white p-5 dark:border-white/[0.07] dark:bg-[#0e1a35]">
        <h3 className="mb-4 flex items-center gap-2 text-[14px] font-bold text-[#0e1f4d] dark:text-white">
          <FileText size={16} className="text-[#1B3D8F]" /> Información General
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Descripción */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <FileText size={11} /> Descripción{" "}
              <span className="text-[#CC1A2E]">*</span>
            </label>
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => onChange({ descripcion: e.target.value })}
              placeholder="Ej: Fiscalización de almacenes en zona norte"
              className={inputClass(!!errors.descripcion)}
            />
            {errors.descripcion && (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">
                {errors.descripcion}
              </p>
            )}
          </div>

          {/* Actividad */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <Tag size={11} /> Actividad{" "}
              <span className="text-[#CC1A2E]">*</span>
            </label>
            <input
              type="text"
              value={form.actividad}
              onChange={(e) => onChange({ actividad: e.target.value })}
              placeholder="Ej: Fiscalización"
              className={inputClass(!!errors.actividad)}
            />
            {errors.actividad && (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">
                {errors.actividad}
              </p>
            )}
          </div>

          {/* Tipo de Solicitud */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <Tag size={11} /> Tipo <span className="text-[#CC1A2E]">*</span>
            </label>
            <SelectField
              value={form.tipoSolicitud}
              onChange={(v) => onChange({ tipoSolicitud: v as TipoSolicitud })}
              options={TIPOS_SOLICITUD.map((t) => ({
                value: t,
                label: t.charAt(0) + t.slice(1).toLowerCase(),
              }))}
              placeholder="Seleccionar tipo"
              hasError={!!errors.tipoSolicitud}
            />
            {errors.tipoSolicitud && (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">
                {errors.tipoSolicitud}
              </p>
            )}
          </div>

          {/* Fecha Requerida */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <Calendar size={11} /> Fecha y hora{" "}
              <span className="text-[#CC1A2E]">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.fechaRequerida}
              onChange={(e) => onChange({ fechaRequerida: e.target.value })}
              // 🔹 Agregar min para bloquear fechas pasadas en el input nativo
              min={new Date().toISOString().slice(0, 16)}
              className={inputClass(!!errors.fechaRequerida)}
            />
            {errors.fechaRequerida ? (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">
                {errors.fechaRequerida}
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">
                Mínimo:{" "}
                {new Date().toLocaleDateString("es-CU", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          {/* Cantidad de Litros */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <Fuel size={11} /> Cantidad (L){" "}
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
                value={form.cantidadLitros}
                onChange={(e) => onChange({ cantidadLitros: e.target.value })}
                placeholder="0.00"
                className={`${inputClass(!!errors.cantidadLitros)} pl-7`}
              />
            </div>
            {errors.cantidadLitros && (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">
                {errors.cantidadLitros}
              </p>
            )}
          </div>

          {/* Tipo de Combustible */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <Fuel size={11} /> Combustible{" "}
              <span className="text-[#CC1A2E]">*</span>
            </label>
            <SelectField
              value={form.tipoCombustibleId}
              onChange={(v) => onChange({ tipoCombustibleId: v })}
              options={
                tiposCombustible?.map((t) => ({
                  value: t.id,
                  label: `${t.nombre} (${t.codigo})`,
                })) || []
              }
              placeholder="Seleccionar tipo"
              hasError={!!errors.tipoCombustibleId}
              icon={Fuel}
            />
            {errors.tipoCombustibleId && (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">
                {errors.tipoCombustibleId}
              </p>
            )}
          </div>

          {/* 🔹 Distancia Total (nuevo) */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <Route size={11} /> Distancia total (km){" "}
              <span className="text-[#CC1A2E]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-400 dark:text-white/30">
                km
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.distanciaTotal}
                onChange={(e) => onChange({ distanciaTotal: e.target.value })}
                placeholder="0.00"
                className={`${inputClass(!!errors.distanciaTotal)} pl-10`}
              />
            </div>
            {errors.distanciaTotal && (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">
                {errors.distanciaTotal}
              </p>
            )}
          </div>

          {/* 🔹 Tiempo Estimado (nuevo) */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <Clock size={11} /> Tiempo estimado (min){" "}
              <span className="text-[#CC1A2E]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-400 dark:text-white/30">
                min
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.tiempoEstimado}
                onChange={(e) => onChange({ tiempoEstimado: e.target.value })}
                placeholder="0"
                className={`${inputClass(!!errors.tiempoEstimado)} pl-12`}
              />
            </div>
            {errors.tiempoEstimado && (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">
                {errors.tiempoEstimado}
              </p>
            )}
            <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">
              {form.tiempoEstimado && formatTime(form.tiempoEstimado)}
            </p>
          </div>

          {/* Observaciones */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              <FileText size={11} /> Observaciones
            </label>
            <textarea
              value={form.observaciones}
              onChange={(e) => onChange({ observaciones: e.target.value })}
              placeholder="Detalles adicionales..."
              rows={2}
              className={`${inputClass(!!errors.observaciones)} resize-none`}
            />
            {errors.observaciones && (
              <p className="mt-1 text-[11px] text-[#CC1A2E]">
                {errors.observaciones}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sección: Puntos de Ruta */}
      <div className="rounded-xl border border-black/[0.07] bg-white p-5 dark:border-white/[0.07] dark:bg-[#0e1a35]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#0e1f4d] dark:text-white">
            <MapPin size={16} className="text-[#1B3D8F]" /> Puntos de Ruta
          </h3>
          <button
            type="button"
            onClick={onAddPunto}
            className="flex items-center gap-1.5 rounded-lg bg-[#3B6D11] px-3 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#2d5509]"
          >
            <Plus size={12} /> Agregar punto
          </button>
        </div>

        {form.puntosRuta.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-white/30">
            <MapPin size={24} strokeWidth={1.5} />
            <p className="mt-2 text-[12px]">No hay puntos de ruta agregados</p>
            <p className="text-[11px]">
              Haz clic en "Agregar punto" para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {form.puntosRuta.map((punto, index) => {
              const puntoErrors = errors.puntosRuta?.[index];
              const isExpanded = expandedPuntos[index] ?? false;
              const tipoColor =
                punto.tipo === "INICIO"
                  ? "bg-[#3B6D11]"
                  : punto.tipo === "DESTINO"
                    ? "bg-[#CC1A2E]"
                    : "bg-[#1B3D8F]";

              return (
                <div
                  key={punto.id || index}
                  className="rounded-lg border border-black/70 bg-[#f8f9fc] dark:border-white/7 dark:bg-white/5"
                >
                  {/* Header del punto */}
                  <div className="flex items-center justify-between border-b border-black/6 bg-[#f0f2f7] px-4 py-3 dark:border-white/6 dark:bg-white/10">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${tipoColor} text-[10px] font-bold text-white`}
                      >
                        {punto.orden || index + 1}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#0e1f4d] dark:text-white">
                          {punto.nombre || `Punto #${index + 1}`}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-white/30">
                          {punto.direccion || "Sin dirección"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => togglePunto(index)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
                        title={isExpanded ? "Contraer" : "Expandir"}
                      >
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemovePunto(index)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#FCEBEB] hover:text-[#CC1A2E] dark:hover:bg-[#CC1A2E]/20 dark:hover:text-[#F09595]"
                        title="Eliminar punto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Contenido expandible */}
                  {isExpanded && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Orden */}
                        <div>
                          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                            <ListOrdered size={10} /> Orden
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={punto.orden}
                            onChange={(e) =>
                              handlePuntoChange(index, "orden", e.target.value)
                            }
                            className={inputClass(!!puntoErrors?.orden)}
                            placeholder="0"
                          />
                          {puntoErrors?.orden && (
                            <p className="mt-1 text-[10px] text-[#CC1A2E]">
                              {puntoErrors?.orden}
                            </p>
                          )}
                        </div>

                        {/* Tipo */}
                        <div>
                          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                            <Tag size={10} /> Tipo
                          </label>
                          <select
                            value={punto.tipo}
                            onChange={(e) =>
                              handlePuntoChange(
                                index,
                                "tipo",
                                e.target.value as TipoPuntoRuta,
                              )
                            }
                            className={`${inputClass(!!puntoErrors?.tipo)} cursor-pointer appearance-none`}
                          >
                            {TIPOS_PUNTO.map((t) => (
                              <option key={t} value={t}>
                                {t.charAt(0) + t.slice(1).toLowerCase()}
                              </option>
                            ))}
                          </select>
                          {puntoErrors?.tipo && (
                            <p className="mt-1 text-[10px] text-[#CC1A2E]">
                              {puntoErrors?.tipo}
                            </p>
                          )}
                        </div>

                        {/* Nombre */}
                        <div className="sm:col-span-2">
                          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                            <MapPin size={10} /> Nombre{" "}
                            <span className="text-[#CC1A2E]">*</span>
                          </label>
                          <input
                            type="text"
                            value={punto.nombre}
                            onChange={(e) =>
                              handlePuntoChange(index, "nombre", e.target.value)
                            }
                            placeholder="Ej: Almacén Central"
                            className={inputClass(!!puntoErrors?.nombre)}
                          />
                          {puntoErrors?.nombre && (
                            <p className="mt-1 text-[10px] text-[#CC1A2E]">
                              {puntoErrors?.nombre}
                            </p>
                          )}
                        </div>

                        {/* Dirección */}
                        <div className="sm:col-span-2">
                          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                            <MapPin size={10} /> Dirección{" "}
                            <span className="text-[#CC1A2E]">*</span>
                          </label>
                          <input
                            type="text"
                            value={punto.direccion}
                            onChange={(e) =>
                              handlePuntoChange(
                                index,
                                "direccion",
                                e.target.value,
                              )
                            }
                            placeholder="Ej: Calle Principal #100"
                            className={inputClass(!!puntoErrors?.direccion)}
                          />
                          {puntoErrors?.direccion && (
                            <p className="mt-1 text-[10px] text-[#CC1A2E]">
                              {puntoErrors?.direccion}
                            </p>
                          )}
                        </div>

                        {/* Consejo Popular */}
                        <div>
                          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                            <Building2 size={10} /> Consejo{" "}
                            <span className="text-[#CC1A2E]">*</span>
                          </label>
                          <SelectField
                            value={punto.consejoPopularId}
                            onChange={(v) =>
                              handlePuntoChange(index, "consejoPopularId", v)
                            }
                            options={
                              consejos?.map((c) => ({
                                value: c.id,
                                label: c.nombre,
                              })) || []
                            }
                            placeholder="Seleccionar"
                            hasError={!!puntoErrors?.consejoPopularId}
                          />
                          {puntoErrors?.consejoPopularId && (
                            <p className="mt-1 text-[10px] text-[#CC1A2E]">
                              {puntoErrors?.consejoPopularId}
                            </p>
                          )}
                        </div>

                        {/* Circunscripción */}
                        <div>
                          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                            <GitBranch size={10} /> Circunscripción{" "}
                            <span className="text-[#CC1A2E]">*</span>
                          </label>
                          <SelectField
                            value={punto.circunscripcionId}
                            onChange={(v) =>
                              handlePuntoChange(index, "circunscripcionId", v)
                            }
                            options={
                              circunscripciones?.map((c) => ({
                                value: c.id,
                                label: c.nombre,
                              })) || []
                            }
                            placeholder="Seleccionar"
                            hasError={!!puntoErrors?.circunscripcionId}
                          />
                          {puntoErrors?.circunscripcionId && (
                            <p className="mt-1 text-[10px] text-[#CC1A2E]">
                              {puntoErrors?.circunscripcionId}
                            </p>
                          )}
                        </div>

                        {/* Zona */}
                        <div>
                          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                            <Map size={10} /> Zona{" "}
                            <span className="text-[#CC1A2E]">*</span>
                          </label>
                          <SelectField
                            value={punto.zonaId}
                            onChange={(v) =>
                              handlePuntoChange(index, "zonaId", v)
                            }
                            options={
                              zonas?.map((z) => ({
                                value: z.id,
                                label: z.nombre,
                              })) || []
                            }
                            placeholder="Seleccionar"
                            hasError={!!puntoErrors?.zonaId}
                          />
                          {puntoErrors?.zonaId && (
                            <p className="mt-1 text-[10px] text-[#CC1A2E]">
                              {puntoErrors?.zonaId}
                            </p>
                          )}
                        </div>

                        {/* CDR */}
                        <div>
                          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                            <Home size={10} /> CDR{" "}
                            <span className="text-[#CC1A2E]">*</span>
                          </label>
                          <SelectField
                            value={punto.cdrId}
                            onChange={(v) =>
                              handlePuntoChange(index, "cdrId", v)
                            }
                            options={
                              cdrs?.map((c) => ({
                                value: c.id,
                                label: `CDR #${c.numero}`,
                              })) || []
                            }
                            placeholder="Seleccionar"
                            hasError={!!puntoErrors?.cdrId}
                          />
                          {puntoErrors?.cdrId && (
                            <p className="mt-1 text-[10px] text-[#CC1A2E]">
                              {puntoErrors.cdrId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Advertencia si no hay puntos */}
        {form.puntosRuta.length === 0 && errors.puntosRuta && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#FCEBEB] px-3 py-2 text-[11px] text-[#791F1F] dark:bg-[#CC1A2E]/10 dark:text-[#CC1A2E]/90">
            <AlertCircle size={12} />
            <span>{errors.puntosRuta}</span>
          </div>
        )}

        {/* Preview de ruta (si hay datos) */}
        {form.distanciaTotal &&
          form.tiempoEstimado &&
          form.puntosRuta.length > 0 && (
            <div className="mt-4 rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-4 py-3 dark:border-[#3B6D11]/40 dark:bg-[#3B6D11]/10">
              <p className="text-[11px] font-semibold text-[#3B6D11] dark:text-[#8BC34A]">
                📊 Resumen: {formatDistance(form.distanciaTotal)} ·{" "}
                {formatTime(form.tiempoEstimado)} · {form.puntosRuta.length}{" "}
                puntos
              </p>
            </div>
          )}
      </div>

      {/* Footer con botones */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-lg border border-black/8 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1B3D8F] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#163272] disabled:opacity-70"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{" "}
              Enviando...
            </>
          ) : (
            "Crear Solicitud"
          )}
        </button>
      </div>
    </div>
  );
};
