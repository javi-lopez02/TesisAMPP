// src/pages/TipoCombustiblePage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, Fuel, AlertTriangle } from "lucide-react";
import { useTipoCombustible } from "../hooks/useTipoCombustible";
import type {
  FormState,
  getTipoCombustible,
} from "../types/tipo-combustible.types";
import { DeleteModal } from "../components/tipo-combustible/ModalDelete";
import { TipoRow } from "../components/tipo-combustible/TipoRow";
import { SidePanel } from "../components/tipo-combustible/SidePanel";
import type { FormMode } from "../types/globalTypes";
import {
  aplicarFiltrosTipo,
  type FiltrosTipoCombustible,
  validarFormTipoCombustible,
  type ValidationResult,
  calcularMetricasTipo,
  type MetricasTipoCombustible,
  formatearPrecio,
} from "../components/tipo-combustible/HelpersTipoComb";

const FORM_INITIAL: FormState = {
  nombre: "",
  codigo: "",
  precioPorLitro: "",
  activo: true,
};

export const TipoCombustiblePage = () => {
  const {
    tipoCombustible,
    loading,
    error,
    create,
    update,
    getAll,
    softDelete,
  } = useTipoCombustible();

  const [search, setSearch] = useState("");
  const [filterActivo, setFilterActivo] = useState<
    "todos" | "activo" | "inactivo"
  >("todos");
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<FormMode>("crear");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_INITIAL);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [deleteTarget, setDeleteTarget] = useState<getTipoCombustible | null>(
    null,
  );
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    getAll();
  }, [getAll]);

  // ── Métricas (usando helper) ───────────────────────────────────────────────
  const metricas = useMemo((): MetricasTipoCombustible => {
    return calcularMetricasTipo(tipoCombustible);
  }, [tipoCombustible]);

  // ── Filtros (usando helper) ────────────────────────────────────────────────
  const filtros: FiltrosTipoCombustible = useMemo(() => ({
    search,
    filterActivo,
  }), [search, filterActivo]);

  const filtered = useMemo(() => {
    return aplicarFiltrosTipo(tipoCombustible, filtros);
  }, [tipoCombustible, filtros]);

  // ── Validación (usando helper) ─────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const result: ValidationResult = validarFormTipoCombustible(
      form,
      tipoCombustible,
      editingId,
      panelMode,
    );
    setFormErrors(result.errors);
    return result.isValid;
  }, [form, tipoCombustible, editingId, panelMode]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNuevo = useCallback(() => {
    setForm(FORM_INITIAL);
    setFormErrors({});
    setEditingId(null);
    setPanelMode("crear");
    setPanelOpen(true);
  }, []);

  const handleEditar = useCallback((t: getTipoCombustible) => {
    setForm({
      nombre: t.nombre,
      codigo: t.codigo,
      precioPorLitro: String(t.precioPorLitro),
      activo: t.activo,
    });
    setFormErrors({});
    setEditingId(t.id);
    setPanelMode("editar");
    setPanelOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoadingSubmit(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        codigo: form.codigo.trim(),
        precioPorLitro: Number(form.precioPorLitro),
        activo: form.activo,
      };

      if (panelMode === "crear") {
        await create(payload);
      } else if (editingId) {
        await update(
          {
            nombre: payload.nombre,
            codigo: payload.codigo,
            precioPorLitro: payload.precioPorLitro,
            activo: payload.activo,
          },
          editingId,
        );
      }

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

  const handleChange = useCallback((partial: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="font-['Sora',sans-serif]">
      {deleteTarget && (
        <DeleteModal
          tipo={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={loading}
        />
      )}

      <div className="flex flex-col lg:flex-row lg:gap-0">
        {/* ── Columna principal ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Encabezado */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3D8F]">
                  <Fuel size={15} className="text-white" />
                </div>
                <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
                  Tipos de Combustible
                </h1>
              </div>
              <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
                {metricas.activos} activos · {metricas.total} en total
              </p>
            </div>
            <button
              onClick={handleNuevo}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#1B3D8F] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#163272] hover:shadow-[0_0_16px_rgba(27,61,143,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} strokeWidth={2.5} />
              Nuevo tipo
            </button>
          </div>

          {/* Tarjetas de resumen (usando helpers) */}
          {!loading && tipoCombustible !== null && tipoCombustible.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#1B3D8F]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Tipos registrados
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.total}
                </p>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
                  {metricas.activos} activos
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#3B6D11]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Vehículos asignados
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.totalVehiculos}
                </p>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
                  en todos los tipos
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#BA7517]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Precio promedio
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {formatearPrecio(metricas.precioPromedio)}
                  <span className="text-[13px] font-medium text-gray-400"> /L</span>
                </p>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
                  {metricas.totalSolicitudes} solicitudes totales
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
                placeholder="Buscar por nombre o código..."
                className="w-full rounded-lg border border-black/8 bg-white py-2.5 pl-8 pr-3.5 text-[13px] text-[#0e1f4d] outline-none transition placeholder:text-gray-300 focus:border-[#1B3D8F] dark:border-white/10 dark:bg-white/3 dark:text-white dark:placeholder:text-white/20 dark:focus:border-[#85B7EB]"
              />
            </div>
            <div className="flex overflow-hidden rounded-lg border border-black/8 bg-white dark:border-white/10 dark:bg-white/3">
              {(["todos", "activo", "inactivo"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterActivo(f)}
                  className={`px-3.5 py-2 text-[12px] font-semibold capitalize transition ${
                    filterActivo === f
                      ? "bg-[#1B3D8F] text-white"
                      : "text-gray-400 hover:bg-gray-50 dark:text-white/40 dark:hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Cargando */}
          {loading && tipoCombustible === null && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
              <p className="mt-3 text-[13px] font-semibold">
                Cargando tipos de combustible...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-[#CC1A2E]">
              <AlertTriangle size={32} />
              <p className="mt-3 text-[13px] font-semibold">Error al cargar</p>
              <p className="text-center text-[12px]">{error.join(", ")}</p>
            </div>
          )}

          {/* Tabla */}
          {!loading && tipoCombustible !== null && (
            <div className="overflow-x-auto rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
              {/* Cabecera */}
              <div
                className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
                style={{
                  gridTemplateColumns: "1fr 100px 120px 80px 80px 80px 100px 40px",
                  minWidth: "800px",
                }}
              >
                <span>Nombre / Código</span>
                <span className="text-center">Precio / L</span>
                <span className="text-center">Vehículos</span>
                <span className="text-center">Sol.</span>
                <span className="text-center">Asig.</span>
                <span className="text-center">Mov.</span>
                <span className="text-center">Estado</span>
                <span />
              </div>

              {/* Filas */}
              <div style={{ minWidth: "800px" }}>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
                    <Fuel size={32} strokeWidth={1.5} />
                    <p className="mt-3 text-[13px] font-semibold">Sin resultados</p>
                    <p className="text-[12px]">Intenta ajustar el filtro o la búsqueda</p>
                  </div>
                ) : (
                  filtered.map((t, i) => (
                    <TipoRow
                      key={t.id}
                      tipo={t}
                      isEditing={panelOpen && editingId === t.id}
                      isLast={i === filtered.length - 1}
                      onEdit={handleEditar}
                      onDelete={setDeleteTarget}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Pie */}
          {!loading && tipoCombustible !== null && filtered.length > 0 && (
            <p className="mt-3 text-right text-[11px] text-gray-300 dark:text-white/20">
              Mostrando {filtered.length} de {(tipoCombustible ?? []).length} tipos de combustible
            </p>
          )}
        </div>

        {/* ── Panel lateral ── */}
        {panelOpen && (
          <div className="mt-5 lg:ml-4 lg:mt-0">
            <SidePanel
              mode={panelMode}
              form={form}
              errors={formErrors}
              loading={loadingSubmit}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onClose={() => setPanelOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};