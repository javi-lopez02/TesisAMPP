// src/pages/VehiculosPage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Car,
  TrendingUp,
  Activity,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { useVehiculo } from "../hooks/useVehiculo";
import { useTipoCombustible } from "../hooks/useTipoCombustible";
import { useUsuarios } from "../hooks/useUsuario";
import type {
  createVehiculo,
  FormState,
  EstadoVehiculo,
  getVehiculo,
} from "../types/vehiculo.types";
import { VehiculosTable } from "../components/vehiculo/VehiculoTable";
import { ModalForm } from "../components/vehiculo/ModalForm";
import { DeleteModal } from "../components/vehiculo/ModalDelete";
import { ResumenCard } from "../components/vehiculo/ResumenCard";

// 🔹 IMPORTAR HELPERS DE FILTRO Y MÉTRICAS
import {
  aplicarFiltrosVehiculos,
  type FiltrosVehiculos,
  calcularMetricasVehiculos,
  type MetricasVehiculos,
  getEstadoLabel,
  getEstadoColor,
  formatearKilometraje,
} from "../components/vehiculo/HelpersVehiculo";

// 🔹 IMPORTAR VALIDACIONES CON ZOD
import {
  validateVehiculoForm,
  validateVehiculoDuplicate,
  validateChoferConditional,
  resetVehiculoForm,
  validatePlacaFormat,
  validateNumeroFormat,
  PLACA_FORMATO_MSG,
} from "../schemas/vehiculo.validation";

const FORM_INITIAL: FormState = resetVehiculoForm();

// ── VehiculosPage ────────────────────────────────────────────────────────────
export const VehiculosPage = () => {
  const { vehiculos, loading, create, update, getAll, softDelete } =
    useVehiculo();
  const { tipoCombustible: tipos, getAll: getAllTipos } = useTipoCombustible();
  const { usuarios: choferes, getAll: getAllUsuarios } = useUsuarios();

  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoVehiculo>(
    "todos",
  );
  const [filterActivo, setFilterActivo] = useState<
    "todos" | "activo" | "inactivo"
  >("todos");
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"crear" | "editar">("crear");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_INITIAL);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [deleteTarget, setDeleteTarget] = useState<getVehiculo | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // 🔹 Cargar datos al montar
  useEffect(() => {
    getAll();
    getAllTipos();
    getAllUsuarios({ rol: "CHOFER" });
  }, [getAll, getAllTipos, getAllUsuarios]);

  // ── Métricas (usando helper) ───────────────────────────────────────────────
  const metricas = useMemo((): MetricasVehiculos => {
    return calcularMetricasVehiculos(vehiculos);
  }, [vehiculos]);

  // ── Filtros (usando helper) ────────────────────────────────────────────────
  const filtros: FiltrosVehiculos = useMemo(
    () => ({
      search,
      filterEstado,
      filterActivo,
    }),
    [search, filterEstado, filterActivo],
  );

  const filtered = useMemo(() => {
    return aplicarFiltrosVehiculos(vehiculos, filtros);
  }, [vehiculos, filtros]);

  // ── Validación con Zod + lógica de negocio ─────────────────────────────────
  const validate = useCallback((): boolean => {
    // 1. Validar con Zod (reglas sintácticas)
    const zodInput = {
      placa: form.placa,
      marca: form.marca,
      capacidadTanque: form.capacidadTanque,
      tipoCombustibleId: form.tipoCombustibleId,
      estado: form.estado,
      kilometraje: form.kilometraje,
      choferId: form.choferId || undefined,
    };
    const zodResult = validateVehiculoForm(zodInput, panelMode);

    if (!zodResult.isValid) {
      setFormErrors(zodResult.errors);
      return false;
    }

    // 2. Validar placa única (regla de negocio)
    const duplicateError = validateVehiculoDuplicate(
      form.placa,
      vehiculos,
      editingId,
    );
    if (duplicateError) {
      setFormErrors({ placa: duplicateError });
      return false;
    }

    // 3. Validar chofer condicional (si EN_USO, requiere chofer)
    const choferError = validateChoferConditional(form.estado, form.choferId);
    if (choferError) {
      setFormErrors({ choferId: choferError });
      return false;
    }

    // ✅ Todo OK
    setFormErrors({});
    return true;
  }, [form, vehiculos, editingId, panelMode]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNuevo = useCallback(() => {
    setForm(FORM_INITIAL);
    setFormErrors({});
    setEditingId(null);
    setPanelMode("crear");
    setPanelOpen(true);
  }, []);

  const handleEditar = useCallback((v: getVehiculo) => {
    setForm({
      placa: v.placa,
      marca: v.marca,
      capacidadTanque: String(v.capacidadTanque),
      tipoCombustibleId: v.tipoCombustibleId,
      estado: v.estado,
      kilometraje: String(v.kilometraje),
      choferId: v.choferId || "",
    });
    setFormErrors({});
    setEditingId(v.id);
    setPanelMode("editar");
    setPanelOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setLoadingSubmit(true);
    try {
      const payload: createVehiculo = {
        placa: form.placa.trim().toUpperCase(),
        marca: form.marca.trim(),
        capacidadTanque: Number(form.capacidadTanque),
        tipoCombustibleId: form.tipoCombustibleId,
        estado: form.estado,
        kilometraje: Number(form.kilometraje),
        choferId: form.choferId || undefined,
      };

      if (panelMode === "crear") {
        await create(payload);
      } else if (editingId) {
        await update(payload, editingId);
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="font-['Sora',sans-serif]">
      {/* Modal eliminar */}
      {deleteTarget && (
        <DeleteModal
          vehiculo={deleteTarget}
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
                  <Car size={15} className="text-white" />
                </div>
                <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
                  Vehículos
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
              Nuevo vehículo
            </button>
          </div>

          {/* Tarjetas de resumen */}
          {!loading && vehiculos !== null && vehiculos.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ResumenCard
                color="bg-[#1B3D8F]"
                label="Total vehículos"
                value={metricas.total}
                sub="registrados en sistema"
                icon={Car}
                iconColor="bg-[#1B3D8F]/10 text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]"
              />
              <ResumenCard
                color="bg-[#3B6D11]"
                label="Disponibles"
                value={metricas.disponibles}
                sub="listos para asignar"
                icon={CheckCircle2}
                iconColor="bg-[#3B6D11]/10 text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#9FD97A]"
              />
              <ResumenCard
                color="bg-[#BA7517]"
                label="En uso"
                value={metricas.enUso}
                sub="actualmente asignados"
                icon={Activity}
                iconColor="bg-[#BA7517]/10 text-[#BA7517] dark:bg-[#BA7517]/20 dark:text-[#E8C57A]"
              />
              <ResumenCard
                color="bg-[#CC1A2E]"
                label="Mantenimiento"
                value={metricas.enMantenimiento + metricas.fueraDeServicio}
                sub="fuera de operación"
                icon={Wrench}
                iconColor="bg-[#CC1A2E]/10 text-[#CC1A2E] dark:bg-[#CC1A2E]/20 dark:text-[#F09595]"
              />

              {/* Fila completa para métricas adicionales */}
              <div className="col-span-2 sm:col-span-4 grid grid-cols-2 gap-3">
                <ResumenCard
                  color="bg-[#8B5CF6]"
                  label="Kilometraje total"
                  value={formatearKilometraje(metricas.kilometrajeTotal)}
                  sub="acumulado en flota"
                  icon={TrendingUp}
                />
                <ResumenCard
                  color="bg-[#1B3D8F]"
                  label="Kilometraje promedio"
                  value={formatearKilometraje(metricas.kilometrajePromedio)}
                  sub="por vehículo"
                  icon={TrendingUp}
                />
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
                placeholder="Buscar por placa, marca, chofer o combustible..."
                className="w-full rounded-lg border border-black/8 bg-white py-2.5 pl-8 pr-3.5 text-[13px] text-[#0e1f4d] outline-none transition placeholder:text-gray-300 focus:border-[#1B3D8F] dark:border-white/10 dark:bg-white/3 dark:text-white dark:placeholder:text-white/20 dark:focus:border-[#85B7EB]"
              />
            </div>

            {/* Filtro por estado */}
            <div className="flex overflow-hidden rounded-lg border border-black/8 bg-white dark:border-white/10 dark:bg-white/3">
              <select
                value={filterEstado}
                onChange={(e) =>
                  setFilterEstado(e.target.value as typeof filterEstado)
                }
                className="cursor-pointer appearance-none bg-transparent px-3.5 py-2 pr-8 text-[12px] font-semibold text-gray-400 outline-none dark:text-white/40"
              >
                <option value="todos">Todos los estados</option>
                {(
                  [
                    "DISPONIBLE",
                    "EN_USO",
                    "MANTENIMIENTO",
                    "FUERA_DE_SERVICIO",
                  ] as EstadoVehiculo[]
                ).map((estado) => (
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

            {/* Filtro por activo */}
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

          {/* Chip de filtros activos */}
          {(filterEstado !== "todos" || filterActivo !== "todos" || search) && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-white/30">
                Filtros:
              </span>
              {filterEstado !== "todos" && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getEstadoColor(filterEstado as EstadoVehiculo)}`}
                >
                  {getEstadoLabel(filterEstado as EstadoVehiculo)}
                  <button
                    onClick={() => setFilterEstado("todos")}
                    className="opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterActivo !== "todos" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1B3D8F]/10 px-2.5 py-1 text-[11px] font-semibold text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]">
                  {filterActivo === "activo" ? "Activos" : "Inactivos"}
                  <button
                    onClick={() => setFilterActivo("todos")}
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
                — {filtered.length} resultado(s)
              </span>
            </div>
          )}

          {/* Estado: cargando */}
          {loading && vehiculos === null && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
              <p className="mt-3 text-[13px] font-semibold">
                Cargando vehículos...
              </p>
            </div>
          )}

          {/* Tabla */}
          <div className="overflow-x-auto rounded-xl">
            {!loading && vehiculos !== null && (
              <div className="min-w-180">
                <VehiculosTable
                  vehiculos={filtered}
                  onEditar={handleEditar}
                  onEliminar={setDeleteTarget}
                  editingId={editingId}
                  panelOpen={panelOpen}
                />
              </div>
            )}
          </div>

          {/* Pie */}
          {!loading && vehiculos !== null && filtered.length > 0 && (
            <p className="mt-3 text-right text-[11px] text-gray-300 dark:text-white/20">
              Mostrando {filtered.length} de {(vehiculos ?? []).length}{" "}
              vehículos
            </p>
          )}
        </div>

        {/* ── Panel lateral ── */}
        {panelOpen && (
          <div className="mt-5 lg:ml-4 lg:mt-0">
            <ModalForm
              mode={panelMode}
              form={form}
              tiposCombustible={tipos}
              choferes={choferes}
              onChange={(partial) =>
                setForm((prev) => ({ ...prev, ...partial }))
              }
              onSubmit={handleSubmit}
              onClose={() => setPanelOpen(false)}
              loading={loadingSubmit}
              errors={formErrors}
              helpers={{
                validatePlacaFormat,
                validateNumeroFormat,
                PLACA_FORMATO_MSG,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
