import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useReporteConsumo } from "../hooks/useReporteConsumo";
import { useAsignacion } from "../hooks/useAsignacion";
import type {
  createReporte,
  FormState,
  getReporte,
} from "../types/reporte-consumo.types";
import { ReportesTable } from "../components/reporte-consumo/ReportesTable";
import { ModalForm } from "../components/reporte-consumo/ModalForm";
import {
  aplicarFiltrosReportes,
  type FiltrosReportes,
  calcularMetricasReportes,
  formatearConsumo,
  formatearKilometraje,
} from "../components/reporte-consumo/HelpersReporteConsumo";
import {
  validateReporteForm,
  resetReporteForm,
  validateNumeroFormat,
} from "../schemas/reporte-consumo.validation";
import { DateRangeFilter } from "../components/globalComponents/DateRangeFilter";

const FORM_INITIAL = resetReporteForm();

export const ReporteConsumoPage = () => {
  const { reportes, loading, error, create, update, getAll } =
    useReporteConsumo();
  const { asignaciones, getAll: getAllAsignaciones } = useAsignacion();

  const [search, setSearch] = useState("");
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
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    getAll();
    getAllAsignaciones();
  }, [getAll, getAllAsignaciones]);

  const metricas = useMemo(
    () => calcularMetricasReportes(reportes),
    [reportes],
  );
  const filtros: FiltrosReportes = useMemo(
    () => ({ search, dateRange }),
    [search, dateRange],
  );
  const filtered = useMemo(
    () => aplicarFiltrosReportes(reportes, filtros),
    [reportes, filtros],
  );

  const validate = useCallback((): boolean => {
    const zodInput = {
      consumoReal: form.consumoReal,
      kilometrajeRecorrido: form.kilometrajeRecorrido,
      rendimiento: form.rendimiento || undefined,
      observaciones: form.observaciones,
      asignacionId: form.asignacionId,
    };
    const result = validateReporteForm(zodInput, panelMode);
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
  const handleEditar = useCallback((r: getReporte) => {
    setForm({
      consumoReal: String(r.consumoReal),
      kilometrajeRecorrido: String(r.kilometrajeRecorrido),
      rendimiento: r.rendimiento ? String(r.rendimiento) : "",
      observaciones: r.observaciones || "",
      asignacionId: "",
    });
    setFormErrors({});
    setEditingId(r.id);
    setPanelMode("editar");
    setPanelOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoadingSubmit(true);
    try {
      const payload: createReporte = {
        consumoReal: Number(form.consumoReal),
        kilometrajeRecorrido: Number(form.kilometrajeRecorrido),
        rendimiento: form.rendimiento ? Number(form.rendimiento) : undefined,
        observaciones: form.observaciones.trim() || undefined,
        asignacionId: form.asignacionId,
      };
      if (panelMode === "crear") await create(payload);
      else if (editingId) await update(payload, editingId);
      setPanelOpen(false);
      setForm(FORM_INITIAL);
    } finally {
      setLoadingSubmit(false);
    }
  }, [validate, form, panelMode, editingId, create, update]);

  return (
    <div className="font-['Sora',sans-serif]">
      <div className="flex flex-col lg:flex-row lg:gap-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3D8F]">
                  <FileText size={15} className="text-white" />
                </div>
                <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
                  Reportes de Consumo
                </h1>
              </div>
              <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
                {metricas.total} registros
              </p>
            </div>
            <button
              onClick={handleNuevo}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#1B3D8F] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#163272] hover:shadow-[0_0_16px_rgba(27,61,143,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} strokeWidth={2.5} /> Nuevo reporte
            </button>
          </div>

          {!loading && reportes !== null && reportes.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#1B3D8F]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Total reportes
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.total}
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#3B6D11]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Consumo total
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {formatearConsumo(metricas.consumoTotal)}
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#BA7517]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Km totales
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {formatearKilometraje(metricas.kilometrajeTotal)}
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#8B5CF6]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Rendimiento prom.
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.rendimientoPromedio !== null
                    ? `${metricas.rendimientoPromedio.toFixed(2)} km/L`
                    : "—"}
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
                placeholder="Buscar por vehículo u observaciones..."
                className="w-full rounded-lg border border-black/8 bg-white py-2.5 pl-8 pr-3.5 text-[13px] text-[#0e1f4d] outline-none transition placeholder:text-gray-300 focus:border-[#1B3D8F] dark:border-white/10 dark:bg-white/3 dark:text-white dark:placeholder:text-white/20 dark:focus:border-[#85B7EB]"
              />
            </div>
            <DateRangeFilter
              onApply={(d, h) => setDateRange({ desde: d, hasta: h })}
              onClear={() => setDateRange({})}
              initialDesde={dateRange.desde?.split("T")[0]}
              initialHasta={dateRange.hasta?.split("T")[0]}
            />
          </div>

          {(dateRange.desde || dateRange.hasta || search) && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-white/30">
                Filtros:
              </span>
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

          {loading && reportes === null && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
              <p className="mt-3 text-[13px] font-semibold">
                Cargando reportes...
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

          {!loading && reportes !== null && (
            <ReportesTable
              reportes={filtered}
              onEditar={handleEditar}
              editingId={editingId}
              panelOpen={panelOpen}
            />
          )}
          {!loading && reportes !== null && filtered.length > 0 && (
            <p className="mt-3 text-right text-[11px] text-gray-300 dark:text-white/20">
              Mostrando {filtered.length} de {(reportes ?? []).length}
            </p>
          )}
        </div>

        {panelOpen && (
          <div className="mt-5 lg:ml-4 lg:mt-0">
            <ModalForm
              mode={panelMode}
              form={form}
              asignaciones={asignaciones}
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
