// src/pages/UsuariosPage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  User,
  ChevronRight,
  AlertTriangle,
  Mail,
  UserCircle2,
  Shield,
  Building2,
  MapPin,
} from "lucide-react";
import { useUsuarios } from "../hooks/useUsuario";
import type {
  getUsuario,
  createUsuario,
  updateUsuario,
  FormState,
  RolUsuario,
} from "../types/usuarios.types";
import { DeleteModal } from "../components/usuarios/ModalDelete";
import { Badge } from "../components/globalComponents/Badge";
import { AssignmentPill } from "../components/usuarios/StatPill";
import { SidePanel } from "../components/usuarios/SidePanel";
import type { FormMode } from "../types/globalTypes";
import {
  ROL_LABELS,
  ROL_COLORS,
  getRolLabel,
  getRolColor,
  formatearFechaCorta,
  formatearIniciales,
  aplicarFiltrosUsuarios,
  type FiltrosUsuarios,
  validarFormUsuario,
  type ValidationResult,
  calcularMetricasUsuarios,
  type MetricasUsuarios,
  prepararPayloadUsuario,
} from "../components/usuarios/HelpersUsers";

const FORM_INITIAL: FormState = {
  correo: "",
  contrasenia: "",
  nombre: "",
  apellidos: "",
  rol: "DELEGADO",
  activo: true,
};

// ── UsuariosPage ──────────────────────────────────────────────────────────────
export const UsuariosPage = () => {
  const { usuarios, loading, error, create, update, getAll, softDelete } =
    useUsuarios();

  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState<"todos" | RolUsuario>("todos");
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
  const [deleteTarget, setDeleteTarget] = useState<getUsuario | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Cargar datos al montar
  useEffect(() => {
    getAll();
  }, [getAll]);

  // ── Métricas (usando helper) ───────────────────────────────────────────────
  const metricas = useMemo((): MetricasUsuarios => {
    return calcularMetricasUsuarios(usuarios);
  }, [usuarios]);

  // ── Filtros (usando helper) ────────────────────────────────────────────────
  const filtros: FiltrosUsuarios = useMemo(
    () => ({
      search,
      filterRol,
      filterActivo,
    }),
    [search, filterRol, filterActivo],
  );

  const filtered = useMemo(() => {
    return aplicarFiltrosUsuarios(usuarios, filtros);
  }, [usuarios, filtros]);

  // ── Validación (usando helper) ─────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const result: ValidationResult = validarFormUsuario(
      form,
      usuarios,
      editingId,
      panelMode,
    );
    setFormErrors(result.errors);
    return result.isValid;
  }, [form, usuarios, editingId, panelMode]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNuevo = useCallback(() => {
    setForm({ ...FORM_INITIAL, contrasenia: "" });
    setFormErrors({});
    setEditingId(null);
    setPanelMode("crear");
    setShowPassword(false);
    setPanelOpen(true);
  }, []);

  const handleEditar = useCallback((u: getUsuario) => {
    setForm({
      correo: u.correo,
      contrasenia: "", // No se muestra la contraseña existente
      nombre: u.nombre,
      apellidos: u.apellidos,
      rol: u.rol,
      activo: u.activo,
    });
    setFormErrors({});
    setEditingId(u.id);
    setPanelMode("editar");
    setShowPassword(false);
    setPanelOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoadingSubmit(true);
    try {
      // 🔹 Usar helper para preparar payload
      const payload = prepararPayloadUsuario(form, panelMode);

      if (panelMode === "crear") {
        await create(payload as createUsuario);
      } else if (editingId) {
        await update(payload as Partial<updateUsuario>, editingId);
      }
      setPanelOpen(false);
      setForm({ ...FORM_INITIAL, contrasenia: "" });
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
          usuario={deleteTarget}
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
                  <User size={15} className="text-white" />
                </div>
                <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
                  Usuarios
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
              Nuevo usuario
            </button>
          </div>

          {/* Tarjetas de resumen (opcional, usando helpers) */}
          {!loading && usuarios !== null && usuarios.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#1B3D8F]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Total usuarios
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.total}
                </p>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
                  {metricas.inactivos} inactivos
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#3B6D11]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Con consejo asignado
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.conConsejo}
                </p>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
                  presidentes de consejo
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#B77C1B]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Con circunscripción
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.conCircunscripcion}
                </p>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
                  delegados activos
                </p>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-[#8B5CF6]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Administradores
                </p>
                <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
                  {metricas.porRol.ADMINISTRADOR}
                </p>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
                  con acceso completo
                </p>
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
                placeholder="Buscar por nombre, apellidos o correo..."
                className="w-full rounded-lg border border-black/8 bg-white py-2.5 pl-8 pr-3.5 text-[13px] text-[#0e1f4d] outline-none transition placeholder:text-gray-300 focus:border-[#1B3D8F] dark:border-white/10 dark:bg-white/3 dark:text-white dark:placeholder:text-white/20 dark:focus:border-[#85B7EB]"
              />
            </div>

            {/* Filtro por rol */}
            <div className="flex overflow-hidden rounded-lg border border-black/8 bg-white dark:border-white/10 dark:bg-white/3">
              <select
                value={filterRol}
                onChange={(e) =>
                  setFilterRol(e.target.value as typeof filterRol)
                }
                className="px-3.5 py-2 text-[12px] font-semibold text-gray-400 bg-transparent outline-none cursor-pointer dark:text-white/40"
              >
                <option value="todos">Todos los roles</option>
                {(Object.keys(ROL_LABELS) as RolUsuario[]).map((rol) => (
                  <option key={rol} value={rol}>
                    {ROL_LABELS[rol]}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
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
          {(filterRol !== "todos" || filterActivo !== "todos" || search) && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-white/30">
                Filtros:
              </span>
              {filterRol !== "todos" && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROL_COLORS[filterRol as RolUsuario]}`}
                >
                  {ROL_LABELS[filterRol as RolUsuario]}
                  <button
                    onClick={() => setFilterRol("todos")}
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
          {loading && usuarios === null && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
              <p className="mt-3 text-[13px] font-semibold">
                Cargando usuarios...
              </p>
            </div>
          )}

          {/* Estado: error */}
          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-[#CC1A2E]">
              <AlertTriangle size={32} />
              <p className="mt-3 text-[13px] font-semibold">Error al cargar</p>
              <p className="text-center text-[12px]">{error.join(", ")}</p>
            </div>
          )}

          {/* Tabla */}
          {!loading && usuarios !== null && (
            <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
              {/* Cabecera */}
              <div
                className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
                style={{
                  gridTemplateColumns: "1.5fr 1.2fr 1fr 1fr 1fr 80px 40px",
                }}
              >
                <span className="flex items-center gap-1">
                  <UserCircle2 size={10} /> Usuario
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={10} /> Correo
                </span>
                <span>Rol</span>
                <span className="text-center">Consejo</span>
                <span className="text-center">Circunscripción</span>
                <span className="text-center">Estado</span>
                <span />
              </div>

              {/* Filas */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
                  <User size={32} strokeWidth={1.5} />
                  <p className="mt-3 text-[13px] font-semibold">
                    Sin resultados
                  </p>
                  <p className="text-[12px]">
                    Intenta ajustar los filtros o la búsqueda
                  </p>
                </div>
              ) : (
                filtered.map((u, i) => (
                  <div
                    key={u.id}
                    className={`grid items-center px-5 py-3.5 transition hover:bg-[#f8f9fc] dark:hover:bg-white/3 ${
                      i < filtered.length - 1
                        ? "border-b border-black/5 dark:border-white/5"
                        : ""
                    } ${editingId === u.id && panelOpen ? "bg-[#EAF3DE]/40 dark:bg-[#1B3D8F]/10" : ""}`}
                    style={{
                      gridTemplateColumns: "1.5fr 1.2fr 1fr 1fr 1fr 80px 40px",
                    }}
                  >
                    {/* Usuario: Nombre + Apellidos + Iniciales */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B3D8F]/10 dark:bg-[#1B3D8F]/20 text-[11px] font-bold text-[#1B3D8F] dark:text-[#85B7EB] uppercase">
                        {formatearIniciales(u.nombre, u.apellidos)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-[#0e1f4d] dark:text-white">
                          {u.nombre} {u.apellidos}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-white/30">
                          Creado: {formatearFechaCorta(u.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Correo */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail
                        size={12}
                        className="shrink-0 text-gray-300 dark:text-white/20"
                      />
                      <p className="truncate text-[12px] text-[#0e1f4d] dark:text-white">
                        {u.correo}
                      </p>
                    </div>

                    {/* Rol */}
                    <div>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold ${getRolColor(
                          u.rol,
                        )}`}
                      >
                        <Shield size={10} className="mr-1" />
                        {getRolLabel(u.rol)}
                      </span>
                    </div>

                    {/* Consejo asignado (solo para PRESIDENTE_CONSEJO) */}
                    <div className="flex justify-center">
                      {u.consejoPopularPresidente ? (
                        <AssignmentPill
                          value={u.consejoPopularPresidente.nombre}
                          icon={<Building2 size={10} />}
                        />
                      ) : (
                        <span className="text-[11px] text-gray-300 dark:text-white/20">
                          —
                        </span>
                      )}
                    </div>

                    {/* Circunscripción asignada (solo para DELEGADO) */}
                    <div className="flex justify-center">
                      {u.circunscripcionDelegado ? (
                        <AssignmentPill
                          value={u.circunscripcionDelegado.nombre}
                          icon={<MapPin size={10} />}
                        />
                      ) : (
                        <span className="text-[11px] text-gray-300 dark:text-white/20">
                          —
                        </span>
                      )}
                    </div>

                    {/* Estado */}
                    <div className="flex justify-center">
                      <Badge activo={u.activo} />
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditar(u)}
                        title="Editar"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-[#E6F1FB] hover:text-[#1B3D8F] dark:text-white/20 dark:hover:bg-[#1B3D8F]/20 dark:hover:text-[#85B7EB]"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        title="Eliminar"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-[#FCEBEB] hover:text-[#CC1A2E] dark:text-white/20 dark:hover:bg-[#CC1A2E]/20 dark:hover:text-[#F09595]"
                      >
                        <Trash2 size={13} />
                      </button>
                      <ChevronRight
                        size={13}
                        className="text-gray-200 dark:text-white/10"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pie */}
          {!loading && usuarios !== null && filtered.length > 0 && (
            <p className="mt-3 text-right text-[11px] text-gray-300 dark:text-white/20">
              Mostrando {filtered.length} de {(usuarios ?? []).length} usuarios
            </p>
          )}
        </div>

        {/* ── Panel lateral ── */}
        {panelOpen && (
          <div className="mt-5 lg:ml-4 lg:mt-0">
            <SidePanel
              mode={panelMode}
              form={form}
              onChange={(partial) =>
                setForm((prev) => ({ ...prev, ...partial }))
              }
              onSubmit={handleSubmit}
              onClose={() => setPanelOpen(false)}
              loading={loadingSubmit}
              errors={formErrors}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((p) => !p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
