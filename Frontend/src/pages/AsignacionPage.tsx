import { useState, useEffect, useMemo } from "react";
import { Search, AlertTriangle, FileText } from "lucide-react";
import { useAsignacion } from "../hooks/useAsignacion";
import { useVehiculo } from "../hooks/useVehiculo";
import type {
  getAsignacion,
  EstadoAsignacion,
} from "../types/asignacion.types";
import { AsignacionesTable } from "../components/asignacion/AsignacionTable";
import { ModalDetalle } from "../components/asignacion/ModalDetalle";
import {
  aplicarFiltrosAsignaciones,
  type FiltrosAsignaciones,
  calcularMetricasAsignaciones,
  getEstadoLabel,
  getEstadoColor,
  ESTADOS_ASIGNACION,
} from "../components/asignacion/HelpersAsignacion";
import { DateRangeFilter } from "../components/globalComponents/DateRangeFilter";

export const AsignacionesPage = () => {
  const { asignaciones, loading, error, getAll } = useAsignacion();
  const { vehiculos, getAll: getAllVehiculos } = useVehiculo();

  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoAsignacion>(
    "todos",
  );
  const [filterVehiculo, setFilterVehiculo] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    desde?: string;
    hasta?: string;
  }>({});
  const [detalleAbierto, setDetalleAbierto] = useState<getAsignacion | null>(
    null,
  );

  useEffect(() => {
    getAll();
    getAllVehiculos();
  }, [getAll, getAllVehiculos]);

  const metricas = useMemo(
    () => calcularMetricasAsignaciones(asignaciones),
    [asignaciones],
  );
  const filtros: FiltrosAsignaciones = useMemo(
    () => ({
      search,
      filterEstado,
      filterVehiculo,
      dateRange,
    }),
    [search, filterEstado, filterVehiculo, dateRange],
  );
  const filtered = useMemo(
    () => aplicarFiltrosAsignaciones(asignaciones, filtros),
    [asignaciones, filtros],
  );

  return (
    <div className="font-['Sora',sans-serif]">
      {detalleAbierto && (
        <ModalDetalle
          asignacion={detalleAbierto}
          onClose={() => setDetalleAbierto(null)}
        />
      )}
      <div className="flex flex-col lg:flex-row lg:gap-0">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Encabezado */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3D8F]">
                  <FileText size={15} className="text-white" />
                </div>
                <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
                  Asignaciones
                </h1>
              </div>
              <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
                {metricas.total} registros · {metricas.pendientes} pendientes
              </p>
            </div>
          </div>

          {/* Tarjetas de resumen */}
          {!loading && asignaciones !== null && asignaciones.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#1B3D8F]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Total
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.total}
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#BA7517]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Pendientes
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.pendientes}
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#1B3D8F]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  En progreso
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.enProgreso}
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#3B6D11]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Completadas
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.completadas}
                </p>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-50 flex-1">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/20"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por vehículo, responsable o solicitud..."
                className="w-full rounded-lg border border-black/8 bg-white py-2.5 pl-8 pr-3.5 text-[13px] text-[#0e1f4d] outline-none transition placeholder:text-gray-300 focus:border-[#1B3D8F] dark:border-white/10 dark:bg-white/3 dark:text-white dark:placeholder:text-white/20 dark:focus:border-[#85B7EB]"
              />
            </div>
            <div className="flex overflow-hidden rounded-lg border border-black/8 bg-white dark:border-white/10 dark:bg-white/3">
              <select
                value={filterEstado}
                onChange={(e) =>
                  setFilterEstado(e.target.value as typeof filterEstado)
                }
                className="cursor-pointer appearance-none bg-transparent px-3.5 py-2 pr-8 text-[12px] font-semibold text-gray-400 outline-none dark:text-white/40"
              >
                <option value="todos">Todos los estados</option>
                {ESTADOS_ASIGNACION.map((estado) => (
                  <option key={estado} value={estado}>
                    {getEstadoLabel(estado)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-gray-300 dark:text-white/20"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            <div className="flex overflow-hidden rounded-lg border border-black/8 bg-white dark:border-white/10 dark:bg-white/3">
              <select
                value={filterVehiculo}
                onChange={(e) => setFilterVehiculo(e.target.value)}
                className="cursor-pointer appearance-none bg-transparent px-3.5 py-2 pr-8 text-[12px] font-semibold text-gray-400 outline-none dark:text-white/40"
              >
                <option value="">Todos los vehículos</option>
                {vehiculos?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.marca}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-gray-300 dark:text-white/20"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            <DateRangeFilter
              onApply={(d, h) => setDateRange({ desde: d, hasta: h })}
              onClear={() => setDateRange({})}
              initialDesde={dateRange.desde?.split("T")[0]}
              initialHasta={dateRange.hasta?.split("T")[0]}
            />
          </div>

          {/* Chips de filtros activos */}
          {(filterEstado !== "todos" ||
            filterVehiculo ||
            dateRange.desde ||
            dateRange.hasta ||
            search) && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-white/30">
                Filtros:
              </span>
              {filterEstado !== "todos" && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getEstadoColor(filterEstado)}`}
                >
                  {getEstadoLabel(filterEstado)}
                  <button
                    onClick={() => setFilterEstado("todos")}
                    className="opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterVehiculo && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:bg-white/10 dark:text-white/40">
                  Vehículo seleccionado
                  <button
                    onClick={() => setFilterVehiculo("")}
                    className="opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {(dateRange.desde || dateRange.hasta) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1B3D8F]/10 px-2.5 py-1 text-[11px] font-semibold text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]">
                  {dateRange.desde && `Desde ${dateRange.desde.split("T")[0]}`}
                  {dateRange.desde && dateRange.hasta && " · "}
                  {dateRange.hasta && `Hasta ${dateRange.hasta.split("T")[0]}`}
                  <button
                    onClick={() => setDateRange({})}
                    className="opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:bg-white/10 dark:text-white/40">
                  "{search}"
                  <button
                    onClick={() => setSearch("")}
                    className="opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              )}
              <span className="text-[11px] text-gray-400 dark:text-white/30">
                — {filtered.length}
              </span>
            </div>
          )}

          {/* Estados */}
          {loading && asignaciones === null && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
              <p className="mt-3 text-[13px] font-semibold">
                Cargando asignaciones...
              </p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-[#CC1A2E]">
              <AlertTriangle size={32} />
              <p className="mt-3 text-[13px] font-semibold">Error al cargar</p>
              <p className="text-center text-[12px]">{error.join(", ")}</p>
            </div>
          )}

          {/* Tabla */}
          {!loading && asignaciones !== null && (
            <AsignacionesTable
              asignaciones={filtered}
              onVerDetalle={setDetalleAbierto}
            />
          )}
          {!loading && asignaciones !== null && filtered.length > 0 && (
            <p className="mt-3 text-right text-[11px] text-gray-300 dark:text-white/20">
              Mostrando {filtered.length} de {(asignaciones ?? []).length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
