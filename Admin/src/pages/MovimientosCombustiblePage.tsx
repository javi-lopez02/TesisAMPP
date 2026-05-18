// src/pages/MovimientosCombustiblePage.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  ArrowDownUp,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Activity,
} from "lucide-react";
import { useMovimientoCombustible } from "../hooks/useMovimientoCombustible";
import { useInventario } from "../hooks/useInventario";
import { useAsamblea } from "../hooks/useAsamblea";
import { useTipoCombustible } from "../hooks/useTipoCombustible";
import { MovimientosTable } from "../components/movimientos/MovimientosTable";
import { SidePanel } from "../components/movimientos/SidePanel";
import { DateRangeFilter } from "../components/inventario/DateRangeFilter";
import { ResumenCard } from "../components/movimientos/ResumeCard";
import { DistribucionTipos } from "../components/movimientos/DistribucionTipos";

import type {
  createMovimiento,
  FormState,
  TipoMovimiento,
} from "../types/movimiento.types";

// 🔹 IMPORTAR HELPERS DE FILTRO Y MÉTRICAS
import {
  TIPO_LABELS,
  TIPO_COLORS,
  getTipoLabel,
  getTipoColor,
  calcularMetricas,
  type MetricasMovimientos,
  aplicarFiltros,
  type FiltrosMovimientos,
  formatearCantidad,
} from "../components/movimientos/HelpersMovimientos";

// 🔹 IMPORTAR VALIDACIONES CON ZOD
import {
  validateMovimientoForm,
  validateInventarioExistence,
  resetMovimientoForm,
  validateCantidadFormat,
} from "../schemas/movimiento-combustible.validation";

const FORM_INITIAL: FormState = resetMovimientoForm();

// ── MovimientosCombustiblePage ────────────────────────────────────────────────
export const MovimientosCombustiblePage = () => {
  const { movimientos, loading, create, getAll } =
    useMovimientoCombustible();
  const { inventario: inventarios, getAll: getAllInventarios } =
    useInventario();
  const { tipoCombustible: tipos, getAll: getAllTipos } = useTipoCombustible();
  const { asamblea: asambleas, getAll: getAllAsambleas } = useAsamblea();

  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<"todos" | TipoMovimiento>(
    "todos",
  );
  const [dateRange, setDateRange] = useState<{
    desde?: string;
    hasta?: string;
  }>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_INITIAL);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [inventarioInfo, setInventarioInfo] = useState<{
    existe: boolean;
    saldoActual?: number;
  }>({ existe: false });

  // 🔹 Cargar datos al montar
  useEffect(() => {
    getAll();
    getAllTipos();
    getAllAsambleas();
    getAllInventarios();
  }, [getAll, getAllTipos, getAllAsambleas, getAllInventarios]);

  // ── Info de inventario (para preview en UI) ────────────────────────────────
  useEffect(() => {
    if (!form.asambleaId || !form.tipoCombustibleId) {
      setInventarioInfo((prev) => {
        if (prev.existe === false && prev.saldoActual === undefined)
          return prev;
        return { existe: false, saldoActual: undefined };
      });
      return;
    }

    const inv = inventarios?.find(
      (i) =>
        i.asamblea.id === form.asambleaId &&
        i.tipoCombustible.id === form.tipoCombustibleId,
    );

    const nuevoExiste = !!inv;
    const nuevoSaldo = inv ? Number(inv.saldoActual) : undefined;

    setInventarioInfo((prev) => {
      if (prev.existe === nuevoExiste && prev.saldoActual === nuevoSaldo) {
        return prev;
      }
      return { existe: nuevoExiste, saldoActual: nuevoSaldo };
    });
  }, [form.asambleaId, form.tipoCombustibleId, inventarios]);

  // ── Métricas (usando helper) ───────────────────────────────────────────────
  const metricas = useMemo((): MetricasMovimientos => {
    return calcularMetricas(movimientos);
  }, [movimientos]);

  // ── Filtros (usando helper) ────────────────────────────────────────────────
  const filtros: FiltrosMovimientos = useMemo(
    () => ({
      search,
      filterTipo,
      dateRange,
    }),
    [search, filterTipo, dateRange],
  );

  const filtered = useMemo(() => {
    return aplicarFiltros(movimientos, filtros);
  }, [movimientos, filtros]);

  // ── Validación con Zod + lógica de inventario ──────────────────────────────
  const validate = useCallback((): boolean => {
    const zodInput = {
      tipo: form.tipo,
      cantidad: form.cantidad,
      observaciones: form.observaciones,
      asambleaId: form.asambleaId,
      tipoCombustibleId: form.tipoCombustibleId,
    };
    const zodResult = validateMovimientoForm(zodInput);

    if (!zodResult.isValid) {
      setFormErrors(zodResult.errors);
      return false;
    }

    const inventarioError = validateInventarioExistence(
      form.asambleaId,
      form.tipoCombustibleId,
      form.tipo,
      inventarios,
    );

    if (inventarioError) {
      setFormErrors({ tipoCombustibleId: inventarioError });
      return false;
    }

    setFormErrors({});
    return true;
  }, [form, inventarios]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNuevo = useCallback(() => {
    setForm(FORM_INITIAL);
    setFormErrors({});
    setPanelOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setLoadingSubmit(true);
    try {
      const payload: createMovimiento = {
        tipo: form.tipo,
        cantidad: Number(form.cantidad),
        observaciones: form.observaciones.trim(),
        asambleaId: form.asambleaId,
        tipoCombustibleId: form.tipoCombustibleId,
      };
      await create(payload);
      setPanelOpen(false);
      setForm(FORM_INITIAL);
    } finally {
      setLoadingSubmit(false);
    }
  }, [validate, form, create]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="font-['Sora',sans-serif]">
      <div className="flex flex-col lg:flex-row lg:gap-0">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Encabezado */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3D8F]">
                  <ArrowDownUp size={15} className="text-white" />
                </div>
                <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
                  Movimientos de Combustible
                </h1>
              </div>
              <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
                {metricas.total} registros ·{" "}
                <span className="font-semibold text-[#0e1f4d] dark:text-white">
                  {metricas.movimientosHoy}
                </span>{" "}
                hoy
              </p>
            </div>
            <button
              onClick={handleNuevo}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#1B3D8F] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#163272] hover:shadow-[0_0_16px_rgba(27,61,143,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} strokeWidth={2.5} />
              Nuevo movimiento
            </button>
          </div>

          {/* Tarjetas de resumen */}
          {!loading && movimientos !== null && movimientos.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ResumenCard
                color="bg-[#1B3D8F]"
                label="Total movimientos"
                value={metricas.total}
                sub="historial completo"
                icon={Activity}
                iconColor="bg-[#1B3D8F]/10 text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]"
              />
              <ResumenCard
                color="bg-[#3B6D11]"
                label="Total entradas"
                value={formatearCantidad(metricas.totalEntradas)}
                sub="asignaciones y devoluciones"
                icon={ArrowDownLeft}
                iconColor="bg-[#3B6D11]/10 text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#8BC34A]"
              />
              <ResumenCard
                color="bg-[#CC1A2E]"
                label="Total salidas"
                value={formatearCantidad(metricas.totalSalidas)}
                sub="solicitudes y mermas"
                icon={ArrowUpRight}
                iconColor="bg-[#CC1A2E]/10 text-[#CC1A2E] dark:bg-[#CC1A2E]/20 dark:text-[#F09595]"
              />
              <ResumenCard
                color="bg-[#BA7517]"
                label="Movimientos hoy"
                value={metricas.movimientosHoy}
                sub="registrados hoy"
                icon={RefreshCw}
                iconColor="bg-[#BA7517]/10 text-[#BA7517] dark:bg-[#BA7517]/20 dark:text-[#E8C57A]"
              />
              <div className="col-span-2 sm:col-span-4">
                <DistribucionTipos movimientos={movimientos} />
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="mb-4 flex flex-wrap gap-2">
            {/* Búsqueda */}
            <div className="relative min-w-50 flex-1">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/20"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por combustible, usuario u observaciones..."
                className="w-full rounded-lg border border-black/8 bg-white py-2.5 pl-8 pr-3.5 text-[13px] text-[#0e1f4d] outline-none transition placeholder:text-gray-300 focus:border-[#1B3D8F] dark:border-white/10 dark:bg-white/3 dark:text-white dark:placeholder:text-white/20 dark:focus:border-[#85B7EB]"
              />
            </div>

            {/* Filtro por tipo */}
            <div className="relative flex overflow-hidden rounded-lg border border-black/8 bg-white dark:border-white/10 dark:bg-white/3">
              <select
                value={filterTipo}
                onChange={(e) =>
                  setFilterTipo(e.target.value as typeof filterTipo)
                }
                className="cursor-pointer appearance-none bg-transparent px-3.5 py-2 pr-8 text-[12px] font-semibold text-gray-400 outline-none dark:scheme-dark dark:text-white/40"
              >
                <option value="todos">Todos los tipos</option>
                {(Object.keys(TIPO_LABELS) as TipoMovimiento[]).map((t) => (
                  <option key={t} value={t}>
                    {TIPO_LABELS[t]}
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

            {/* Filtro por fecha */}
            <DateRangeFilter
              onApply={(desde, hasta) => setDateRange({ desde, hasta })}
              onClear={() => setDateRange({})}
              initialDesde={dateRange.desde?.split("T")[0]}
              initialHasta={dateRange.hasta?.split("T")[0]}
            />
          </div>

          {/* Chip de filtros activos */}
          {(filterTipo !== "todos" || dateRange.desde || dateRange.hasta) && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-white/30">
                Filtros:
              </span>
              {filterTipo !== "todos" && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${TIPO_COLORS[filterTipo as TipoMovimiento]}`}
                >
                  {TIPO_LABELS[filterTipo as TipoMovimiento]}
                  <button
                    onClick={() => setFilterTipo("todos")}
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
              <span className="text-[11px] text-gray-400 dark:text-white/30">
                — {filtered.length} resultado(s)
              </span>
            </div>
          )}

          {/* Estado: cargando */}
          {loading && movimientos === null && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
              <p className="mt-3 text-[13px] font-semibold">
                Cargando movimientos...
              </p>
            </div>
          )}

          {/* Tabla - AHORA RESPONSIVE */}
          {!loading && movimientos !== null && (
            <div className="overflow-x-auto rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
              <div className="min-w-225">
                <MovimientosTable
                  movimientos={filtered}
                  getTipoLabel={getTipoLabel}
                  getTipoColor={getTipoColor}
                />
              </div>
            </div>
          )}

          {/* Pie */}
          {!loading && movimientos !== null && filtered.length > 0 && (
            <p className="mt-3 text-right text-[11px] text-gray-300 dark:text-white/20">
              Mostrando {filtered.length} de {(movimientos ?? []).length}{" "}
              movimientos
            </p>
          )}
        </div>

        {/* Panel lateral */}
        {panelOpen && (
          <div className="mt-5 lg:ml-4 lg:mt-0">
            <SidePanel
              form={form}
              tiposCombustible={tipos}
              asambleas={asambleas}
              inventarioInfo={inventarioInfo}
              onChange={(partial) =>
                setForm((prev) => ({ ...prev, ...partial }))
              }
              onSubmit={handleSubmit}
              onClose={() => setPanelOpen(false)}
              loading={loadingSubmit}
              errors={formErrors}
              helpers={{ validateCantidadFormat }}
            />
          </div>
        )}
      </div>
    </div>
  );
};