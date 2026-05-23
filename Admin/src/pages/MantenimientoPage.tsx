import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, AlertTriangle, Wrench } from "lucide-react";
import { useMantenimiento } from "../hooks/useMantenimiento";
import { useVehiculo } from "../hooks/useVehiculo";
import type {
  createMantenimiento,
  FormState,
  TipoMantenimiento,
  getMantenimiento,
} from "../types/mantenimiento.types";
import { MantenimientosTable } from "../components/mantenimiento/MantenimientoTable";
import { SidePanel } from "../components/mantenimiento/SidePanel";
import { DeleteModal } from "../components/mantenimiento/ModalDelete";
import { DateRangeFilter } from "../components/globalComponents/DateRangeFilter";
import {
  aplicarFiltrosMantenimientos,
  type FiltrosMantenimientos,
  calcularMetricasMantenimientos,
  getTipoColor,
  formatearCosto,
} from "../components/mantenimiento/HelpersMantenimiento";
import {
  validateMantenimientoForm,
  resetMantenimientoForm,
  validateNumeroFormat,
} from "../schemas/mantenimiento.validation";

const FORM_INITIAL = resetMantenimientoForm();

export const MantenimientosPage = () => {
  const { mantenimientos, loading, error, create, update, getAll, softDelete } =
    useMantenimiento();
  const { vehiculos, getAll: getAllVehiculos } = useVehiculo();

  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<"todos" | TipoMantenimiento>(
    "todos",
  );
  const [dateRange, setDateRange] = useState<{
    desde?: string;
    hasta?: string;
  }>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"crear" | "editar">("crear");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_INITIAL);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [deleteTarget, setDeleteTarget] = useState<getMantenimiento | null>(
    null,
  );
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    getAll();
    getAllVehiculos();
  }, [getAll, getAllVehiculos]);

  const metricas = useMemo(
    () => calcularMetricasMantenimientos(mantenimientos),
    [mantenimientos],
  );
  const filtros: FiltrosMantenimientos = useMemo(
    () => ({ search, filterTipo, dateRange }),
    [search, filterTipo, dateRange],
  );
  const filtered = useMemo(
    () => aplicarFiltrosMantenimientos(mantenimientos, filtros),
    [mantenimientos, filtros],
  );

  const validate = useCallback((): boolean => {
    const zodInput = {
      tipo: form.tipo,
      descripcion: form.descripcion,
      costo: form.costo,
      kilometraje: form.kilometraje,
      fecha: form.fecha,
      vehiculoId: form.vehiculoId,
    };
    const result = validateMantenimientoForm(zodInput, panelMode);
    setFormErrors(result.errors);
    return result.isValid;
  }, [form, panelMode]);

  const handleNuevo = useCallback(() => {
    setForm(FORM_INITIAL);
    setFormErrors({});
    setEditingId(null);
    setPanelMode("crear");
    setPanelOpen(true);
  }, []);
  const handleEditar = useCallback((m: getMantenimiento) => {
    setForm({
      tipo: m.tipo,
      descripcion: m.descripcion,
      costo: String(m.costo),
      kilometraje: String(m.kilometraje),
      fecha: m.fecha.split("T")[0],
      vehiculoId: m.vehiculo.id,
    });
    setFormErrors({});
    setEditingId(m.id);
    setPanelMode("editar");
    setPanelOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoadingSubmit(true);
    try {
      const payload: createMantenimiento = {
        tipo: form.tipo,
        descripcion: form.descripcion.trim(),
        costo: Number(form.costo),
        kilometraje: Number(form.kilometraje),
        fecha: new Date(form.fecha).toISOString(),
        vehiculoId: form.vehiculoId,
      };
      if (panelMode === "crear") await create(payload);
      else if (editingId) await update(payload, editingId);
      setPanelOpen(false);
      setForm(FORM_INITIAL);
    } finally {
      setLoadingSubmit(false);
    }
  }, [validate, form, panelMode, editingId, create, update]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await softDelete(deleteTarget.id);
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, softDelete]);

  return (
    <div className="font-['Sora',sans-serif]">
      {deleteTarget && (
        <DeleteModal
          mantenimiento={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={loading}
        />
      )}
      <div className="flex flex-col lg:flex-row lg:gap-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3D8F]">
                  <Wrench size={15} className="text-white" />
                </div>
                <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
                  Mantenimientos
                </h1>
              </div>
              <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
                {metricas.total} registros · {metricas.preventivos} preventivos
              </p>
            </div>
            <button
              onClick={handleNuevo}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#1B3D8F] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#163272] hover:shadow-[0_0_16px_rgba(27,61,143,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} strokeWidth={2.5} /> Nuevo mantenimiento
            </button>
          </div>

          {!loading && mantenimientos !== null && mantenimientos.length > 0 && (
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
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#3B6D11]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Preventivos
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.preventivos}
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#CC1A2E]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Correctivos
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.correctivos}
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#BA7517]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Costo Total
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {formatearCosto(metricas.costoTotal)}
                </p>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
                  Prom: {formatearCosto(metricas.costoPromedio)}
                </p>
              </div>
            </div>
          )}

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
                placeholder="Buscar por descripción, vehículo..."
                className="w-full rounded-lg border border-black/8 bg-white py-2.5 pl-8 pr-3.5 text-[13px] text-[#0e1f4d] outline-none transition placeholder:text-gray-300 focus:border-[#1B3D8F] dark:border-white/10 dark:bg-white/3 dark:text-white dark:placeholder:text-white/20 dark:focus:border-[#85B7EB]"
              />
            </div>
            <div className="flex overflow-hidden rounded-lg border border-black/8 bg-white dark:border-white/10 dark:bg-white/3">
              <select
                value={filterTipo}
                onChange={(e) =>
                  setFilterTipo(e.target.value as typeof filterTipo)
                }
                className="cursor-pointer appearance-none bg-transparent px-3.5 py-2 pr-8 text-[12px] font-semibold text-gray-400 outline-none dark:text-white/40"
              >
                <option value="todos">Todos</option>
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
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

          {(filterTipo !== "todos" ||
            dateRange.desde ||
            dateRange.hasta ||
            search) && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-white/30">
                Filtros:
              </span>
              {filterTipo !== "todos" && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getTipoColor(filterTipo)}`}
                >
                  {filterTipo}
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

          {loading && mantenimientos === null && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
              <p className="mt-3 text-[13px] font-semibold">
                Cargando mantenimientos...
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

          {!loading && mantenimientos !== null && (
            <MantenimientosTable
              mantenimientos={filtered}
              onEditar={handleEditar}
              onEliminar={setDeleteTarget}
              editingId={editingId}
              panelOpen={panelOpen}
            />
          )}
          {!loading && mantenimientos !== null && filtered.length > 0 && (
            <p className="mt-3 text-right text-[11px] text-gray-300 dark:text-white/20">
              Mostrando {filtered.length} de {(mantenimientos ?? []).length}
            </p>
          )}
        </div>

        {panelOpen && (
          <div className="mt-5 lg:ml-4 lg:mt-0">
            <SidePanel
              mode={panelMode}
              form={form}
              vehiculos={vehiculos}
              onChange={(p) => setForm((prev) => ({ ...prev, ...p }))}
              onSubmit={handleSubmit}
              onClose={() => setPanelOpen(false)}
              loading={loadingSubmit}
              errors={formErrors}
              helpers={{ validateNumeroFormat }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
