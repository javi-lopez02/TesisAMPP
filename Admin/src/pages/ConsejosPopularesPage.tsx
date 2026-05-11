// src/pages/ConsejosPopularesPage.tsx
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { StatPill } from "../components/consejos-populares/StatPill";
import { Badge } from "../components/consejos-populares/Badge";
import { SidePanel } from "../components/consejos-populares/SidePanel";
import { DeleteModal } from "../components/consejos-populares/ModalDelete";
import { useConsejoPopular } from "../hooks/useConsejoPopular";
import type { getConsejo } from "../types/consejo.types";
import { useUsuarios } from "../hooks/useUsuario";

// ── Tipos locales ─────────────────────────────────────────────────────────────
type FormMode = "crear" | "editar";

export interface FormState {
  nombre: string;
  codigo: string;
  activo: boolean;
  presidenteId: string;
}

const FORM_INITIAL: FormState = {
  nombre: "",
  codigo: "",
  activo: true,
  presidenteId: "",
};

// ── ConsejosPopularesPage ─────────────────────────────────────────────────────
export const ConsejosPopularesPage = () => {
  const {
    consejosPopulares,
    loading,
    error,
    create,
    update,
    getAll,
    softDelete,
  } = useConsejoPopular();

  const { usuarios: presidentes, getAll: getAllUsuarios } = useUsuarios();

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
  const [deleteTarget, setDeleteTarget] = useState<getConsejo | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Carga inicial
  useEffect(() => {
    getAll();
    getAllUsuarios({rol: "PRESIDENTE_CONSEJO"});
  }, [getAll, getAllUsuarios]);

  // ── Filtrado ─────────────────────────────────────────────────────────────────
  const filtered = (consejosPopulares ?? []).filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.nombre.toLowerCase().includes(q) ||
      c.codigo?.toLowerCase().includes(q) ||
      c.presidente?.nombre.toLowerCase().includes(q) ||
      c.presidente?.apellidos.toLowerCase().includes(q);

    const matchActivo =
      filterActivo === "todos"
        ? true
        : filterActivo === "activo"
          ? c.activo
          : !c.activo;

    return matchSearch && matchActivo;
  });

  // ── Validación ────────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};

    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio";

    if (!form.codigo.trim()) errs.codigo = "El código es obligatorio";
    else if (!/^CP-[A-Z]{2,6}-\d{3}$/.test(form.codigo))
      errs.codigo = "Formato: CP-XXX-000";

    const duplicado = (consejosPopulares ?? []).find(
      (c) =>
        c.nombre.toLowerCase() === form.nombre.trim().toLowerCase() &&
        c.id !== editingId,
    );
    if (duplicado) errs.nombre = "Ya existe un consejo con ese nombre";

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleNuevo = () => {
    setForm(FORM_INITIAL);
    setFormErrors({});
    setEditingId(null);
    setPanelMode("crear");
    setPanelOpen(true);
  };

  const handleEditar = (c: getConsejo) => {
    setForm({
      nombre: c.nombre,
      codigo: c.codigo ?? "",
      activo: c.activo,
      presidenteId: c.presidente?.id ?? "",
    });
    setFormErrors({});
    setEditingId(c.id);
    setPanelMode("editar");
    setPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoadingSubmit(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        codigo: form.codigo.trim(),
        activo: form.activo,
        presidenteId: form.presidenteId || undefined,
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
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await softDelete(deleteTarget.id);
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="font-['Sora',sans-serif]">
      {deleteTarget && (
        <DeleteModal
          consejo={deleteTarget}
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
                  <Building2 size={15} className="text-white" />
                </div>
                <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
                  Consejos Populares
                </h1>
              </div>
              <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
                {(consejosPopulares ?? []).filter((c) => c.activo).length}{" "}
                activos · {(consejosPopulares ?? []).length} en total
              </p>
            </div>
            <button
              onClick={handleNuevo}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#1B3D8F] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#163272] hover:shadow-[0_0_16px_rgba(27,61,143,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} strokeWidth={2.5} />
              Nuevo consejo
            </button>
          </div>

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
                placeholder="Buscar por nombre, código o presidente..."
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

          {/* Estado: cargando */}
          {loading && consejosPopulares === null && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
              <p className="mt-3 text-[13px] font-semibold">
                Cargando consejos...
              </p>
            </div>
          )}

          {/* Estado: error */}
          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-[#CC1A2E]">
              <AlertTriangle size={32} />
              <p className="mt-3 text-[13px] font-semibold">Error al cargar</p>
              <p className="text-[12px] text-center">{error.join(", ")}</p>
            </div>
          )}

          {/* Tabla */}
          {!loading && consejosPopulares !== null && (
            <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
              {/* Cabecera */}
              <div
                className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
                style={{
                  gridTemplateColumns: "1fr 180px 80px 80px 100px 40px",
                }}
              >
                <span>Nombre / Código</span>
                <span>Presidente</span>
                <span className="text-center">Circ.</span>
                <span className="text-center">Sol.</span>
                <span className="text-center">Estado</span>
                <span />
              </div>

              {/* Filas */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
                  <Building2 size={32} strokeWidth={1.5} />
                  <p className="mt-3 text-[13px] font-semibold">
                    Sin resultados
                  </p>
                  <p className="text-[12px]">
                    Intenta ajustar el filtro o la búsqueda
                  </p>
                </div>
              ) : (
                filtered.map((c, i) => (
                  <div
                    key={c.id}
                    className={`grid items-center px-5 py-3.5 transition hover:bg-[#f8f9fc] dark:hover:bg-white/3 ${
                      i < filtered.length - 1
                        ? "border-b border-black/5 dark:border-white/5"
                        : ""
                    } ${editingId === c.id && panelOpen ? "bg-[#EAF3DE]/40 dark:bg-[#1B3D8F]/10" : ""}`}
                    style={{
                      gridTemplateColumns: "1fr 180px 80px 80px 100px 40px",
                    }}
                  >
                    {/* Nombre + Código */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B3D8F]/10 dark:bg-[#1B3D8F]/20">
                        <Building2
                          size={15}
                          className="text-[#1B3D8F] dark:text-[#85B7EB]"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-[#0e1f4d] dark:text-white">
                          {c.nombre}
                        </p>
                        <p className="font-mono text-[11px] text-gray-400 dark:text-white/30">
                          {c.codigo}
                        </p>
                      </div>
                    </div>

                    {/* Presidente */}
                    <div className="flex items-center gap-2 min-w-0">
                      {c.presidente ? (
                        <>
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B3D8F] text-[10px] font-bold text-white uppercase">
                            {c.presidente.nombre[0]}
                            {c.presidente.apellidos[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold text-[#0e1f4d] dark:text-white">
                              {c.presidente.nombre} {c.presidente.apellidos}
                            </p>
                          </div>
                        </>
                      ) : (
                        <span className="text-[11px] italic text-gray-300 dark:text-white/20">
                          Sin asignar
                        </span>
                      )}
                    </div>

                    {/* Circunscripciones */}
                    <div className="flex justify-center">
                      <StatPill
                        value={c._count?.circunscripciones ?? 0}
                        label="Circ."
                      />
                    </div>

                    {/* Solicitudes */}
                    <div className="flex justify-center">
                      <StatPill
                        value={c._count?.solicituds ?? 0}
                        label="Sol."
                      />
                    </div>

                    {/* Estado */}
                    <div className="flex justify-center">
                      <Badge activo={c.activo} />
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditar(c)}
                        title="Editar"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-[#E6F1FB] hover:text-[#1B3D8F] dark:text-white/20 dark:hover:bg-[#1B3D8F]/20 dark:hover:text-[#85B7EB]"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
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
          {!loading && consejosPopulares !== null && filtered.length > 0 && (
            <p className="mt-3 text-right text-[11px] text-gray-300 dark:text-white/20">
              Mostrando {filtered.length} de {(consejosPopulares ?? []).length}{" "}
              consejos populares
            </p>
          )}
        </div>

        {/* ── Panel lateral ── */}
        {panelOpen && (
          <div className="mt-5 lg:ml-4 lg:mt-0">
            <SidePanel
              mode={panelMode}
              form={form}
              presidentes={presidentes}
              onChange={(partial) =>
                setForm((prev) => ({ ...prev, ...partial }))
              }
              onSubmit={handleSubmit}
              onClose={() => setPanelOpen(false)}
              loading={loadingSubmit}
              errors={formErrors}
            />
          </div>
        )}
      </div>
    </div>
  );
};
