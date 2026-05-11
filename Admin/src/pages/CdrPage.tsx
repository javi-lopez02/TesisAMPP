// src/pages/CdrsPage.tsx
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Hash,
  Home,
} from "lucide-react";
import { useCdr } from "../hooks/useCdr";
import { useZonas } from "../hooks/useZonas";
import type { getCdrs, createCdr, updateCdr } from "../types/cdrs.types";
import { DeleteModal } from "../components/cdrs/ModalDelete";
import { StatPill } from "../components/cdrs/StatPill";
import { Badge } from "../components/cdrs/Badge";
import { SidePanel } from "../components/cdrs/SidePanel";

// ── Tipos locales ─────────────────────────────────────────────────────────────
type FormMode = "crear" | "editar";

export interface FormState {
  numero: string;
  direccion: string;
  activo: boolean;
  zonaId: string;
}

const FORM_INITIAL: FormState = {
  numero: "",
  direccion: "",
  activo: true,
  zonaId: "",
};

// ── CdrsPage ─────────────────────────────────────────────────────────────────
export const CdrsPage = () => {
  const { cdrs, loading, error, create, update, getAll, softDelete } = useCdr();
  const { zonas, getAll: getAllZonas } = useZonas();

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
  const [deleteTarget, setDeleteTarget] = useState<getCdrs | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // 🔹 Cargar datos al montar
  useEffect(() => {
    getAll();
    getAllZonas();
  }, [getAll, getAllZonas]);

  // ── Filtrado ─────────────────────────────────────────────────────────────────
  const filtered = (cdrs ?? []).filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.numero.toString().includes(q) ||
      c.direccion.toLowerCase().includes(q) ||
      c.zona?.nombre.toLowerCase().includes(q) ||
      c.zona?.codigo?.toLowerCase().includes(q);

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

    if (
      !form.numero ||
      isNaN(Number(form.numero)) ||
      Number(form.numero) <= 0
    ) {
      errs.numero = "El número debe ser válido";
    }

    if (!form.direccion.trim()) errs.direccion = "La dirección es obligatoria";

    if (!form.zonaId) errs.zonaId = "Debes seleccionar una zona";

    // Verificar duplicados por número + zona
    const duplicado = (cdrs ?? []).find(
      (c) =>
        c.numero === form.numero &&
        c.zona?.id === form.zonaId &&
        c.id !== editingId,
    );
    if (duplicado)
      errs.numero = "Ya existe un CDR con este número en la zona seleccionada";

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

  const handleEditar = (c: getCdrs) => {
    setForm({
      numero: c.numero.toString(),
      direccion: c.direccion,
      activo: c.activo,
      zonaId: c.zona?.id ?? "",
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
      const payload: createCdr | updateCdr = {
        numero: form.numero,
        direccion: form.direccion.trim(),
        activo: form.activo,
        zonaId: form.zonaId,
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
      {/* Modal eliminar */}
      {deleteTarget && (
        <DeleteModal
          cdr={deleteTarget}
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
                  <MapPin size={15} className="text-white" />
                </div>
                <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
                  CDRs
                </h1>
              </div>
              <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
                {(cdrs ?? []).filter((c) => c.activo).length} activos ·{" "}
                {(cdrs ?? []).length} en total
              </p>
            </div>
            <button
              onClick={handleNuevo}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#1B3D8F] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#163272] hover:shadow-[0_0_16px_rgba(27,61,143,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} strokeWidth={2.5} />
              Nuevo CDR
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
                placeholder="Buscar por número, dirección o zona..."
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
          {loading && cdrs === null && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
              <p className="mt-3 text-[13px] font-semibold">Cargando CDRs...</p>
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
          {!loading && cdrs !== null && (
            <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
              {/* Cabecera */}
              <div
                className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
                style={{
                  gridTemplateColumns: "100px 1fr 180px 80px 100px 40px",
                }}
              >
                <span className="flex items-center gap-1">
                  <Hash size={10} /> Número
                </span>
                <span>Dirección</span>
                <span>Zona</span>
                <span className="text-center">Rutas</span>
                <span className="text-center">Estado</span>
                <span />
              </div>

              {/* Filas */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
                  <MapPin size={32} strokeWidth={1.5} />
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
                      gridTemplateColumns: "100px 1fr 180px 80px 100px 40px",
                    }}
                  >
                    {/* Número */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1B3D8F]/10 dark:bg-[#1B3D8F]/20">
                        <Hash
                          size={12}
                          className="text-[#1B3D8F] dark:text-[#85B7EB]"
                        />
                      </div>
                      <span className="font-mono text-[13px] font-bold text-[#0e1f4d] dark:text-white">
                        {c.numero}
                      </span>
                    </div>

                    {/* Dirección */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Home
                        size={12}
                        className="shrink-0 text-gray-300 dark:text-white/20"
                      />
                      <p className="truncate text-[13px] text-[#0e1f4d] dark:text-white">
                        {c.direccion}
                      </p>
                    </div>

                    {/* Zona */}
                    <div className="flex items-center gap-2 min-w-0">
                      {c.zona ? (
                        <>
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#1B3D8F]/10 dark:bg-[#1B3D8F]/20">
                            <MapPin
                              size={9}
                              className="text-[#1B3D8F] dark:text-[#85B7EB]"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold text-[#0e1f4d] dark:text-white">
                              {c.zona.nombre}
                            </p>
                            <p className="font-mono text-[10px] text-gray-400 dark:text-white/30">
                              {c.zona.codigo}
                            </p>
                          </div>
                        </>
                      ) : (
                        <span className="text-[11px] italic text-gray-300 dark:text-white/20">
                          Sin zona
                        </span>
                      )}
                    </div>

                    {/* Rutas */}
                    <div className="flex justify-center">
                      <StatPill
                        value={c._count?.puntoRutas ?? 0}
                        label="Rut."
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
          {!loading && cdrs !== null && filtered.length > 0 && (
            <p className="mt-3 text-right text-[11px] text-gray-300 dark:text-white/20">
              Mostrando {filtered.length} de {(cdrs ?? []).length} CDRs
            </p>
          )}
        </div>

        {/* ── Panel lateral ── */}
        {panelOpen && (
          <div className="mt-5 lg:ml-4 lg:mt-0">
            <SidePanel
              mode={panelMode}
              form={form}
              zonas={zonas}
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
