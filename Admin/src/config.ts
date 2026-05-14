export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';


// // src/pages/TipoCombustiblePage.tsx
// import { useState, useCallback } from "react";
// import { Plus, Search, Fuel } from "lucide-react";
// import type { getTipoCombustible } from "../types/tipo-combustible.types";
// import { DeleteModal } from "../components/tipo-combustible/ModalDelete";
// import { TipoRow } from "../components/tipo-combustible/TipoRow";
// import { SidePanel } from "../components/tipo-combustible/SidePanel";

// // ── Tipos locales ─────────────────────────────────────────────────────────────
// export type FormMode = "crear" | "editar";

// export interface FormState {
//   nombre: string;
//   codigo: string;
//   precioPorLitro: string;
// }

// const FORM_INITIAL: FormState = { nombre: "", codigo: "", precioPorLitro: "" };

// const CODIGO_REGEX = /^[A-Z]{2,6}\d{0,2}$/;

// // ── Datos estáticos ───────────────────────────────────────────────────────────
// const MOCK_TIPOS: getTipoCombustible[] = [
//   {
//     id: "1",
//     nombre: "Diésel",
//     codigo: "DIE",
//     precioPorLitro: 1.2,
//     activo: true,
//     _count: {
//       vehiculos: 14,
//       inventarioCombustibles: 2,
//       movimientoCombustibles: 38,
//       solicituds: 44,
//       asignacions: 31,
//     },
//   },
//   {
//     id: "2",
//     nombre: "Gasolina 95",
//     codigo: "GAS95",
//     precioPorLitro: 1.5,
//     activo: true,
//     _count: {
//       vehiculos: 6,
//       inventarioCombustibles: 1,
//       movimientoCombustibles: 21,
//       solicituds: 25,
//       asignacions: 18,
//     },
//   },
//   {
//     id: "3",
//     nombre: "Gasolina 97",
//     codigo: "GAS97",
//     precioPorLitro: 1.75,
//     activo: false,
//     _count: {
//       vehiculos: 2,
//       inventarioCombustibles: 1,
//       movimientoCombustibles: 9,
//       solicituds: 8,
//       asignacions: 6,
//     },
//   },
// ];

// // ── TipoCombustiblePage ───────────────────────────────────────────────────────
// export const TipoCombustiblePage = () => {
//   const [tipos, setTipos] = useState<getTipoCombustible[]>(MOCK_TIPOS);
//   const [search, setSearch] = useState("");
//   const [filterActivo, setFilterActivo] = useState<
//     "todos" | "activo" | "inactivo"
//   >("todos");
//   const [panelOpen, setPanelOpen] = useState(false);
//   const [panelMode, setPanelMode] = useState<FormMode>("crear");
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState<FormState>(FORM_INITIAL);
//   const [formErrors, setFormErrors] = useState<
//     Partial<Record<keyof FormState, string>>
//   >({});
//   const [deleteTarget, setDeleteTarget] = useState<getTipoCombustible | null>(
//     null,
//   );
//   const [loadingSubmit, setLoadingSubmit] = useState(false);
//   const [loadingDelete, setLoadingDelete] = useState(false);

//   // ── Filtrado ──────────────────────────────────────────────────────────────────
//   const filtered = tipos.filter((t) => {
//     const q = search.toLowerCase();
//     const matchSearch =
//       t.nombre.toLowerCase().includes(q) || t.codigo.toLowerCase().includes(q);
//     const matchActivo =
//       filterActivo === "todos"
//         ? true
//         : filterActivo === "activo"
//           ? t.activo
//           : !t.activo;
//     return matchSearch && matchActivo;
//   });

//   // ── Totales ───────────────────────────────────────────────────────────────────
//   const totalVehiculos = tipos.reduce(
//     (acc, t) => acc + (t._count?.vehiculos ?? 0),
//     0,
//   );
//   const totalSolicituds = tipos.reduce(
//     (acc, t) => acc + (t._count?.solicituds ?? 0),
//     0,
//   );
//   const precioPromedio = tipos.length
//     ? (
//         tipos.reduce((acc, t) => acc + Number(t.precioPorLitro), 0) /
//         tipos.length
//       ).toFixed(2)
//     : "0.00";

//   // ── Validación ────────────────────────────────────────────────────────────────
//   const validate = useCallback((): boolean => {
//     const errs: Partial<Record<keyof FormState, string>> = {};

//     if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio";

//     if (!form.codigo.trim()) errs.codigo = "El código es obligatorio";
//     else if (!CODIGO_REGEX.test(form.codigo))
//       errs.codigo = "Solo letras mayúsculas y números, máx. 8 caracteres";

//     const precio = Number(form.precioPorLitro);
//     if (!form.precioPorLitro.trim())
//       errs.precioPorLitro = "El precio es obligatorio";
//     else if (isNaN(precio) || precio <= 0)
//       errs.precioPorLitro = "Debe ser un número mayor a 0";

//     const duplicado = tipos.find(
//       (t) =>
//         t.nombre.toLowerCase() === form.nombre.trim().toLowerCase() &&
//         t.id !== editingId,
//     );
//     if (duplicado) errs.nombre = "Ya existe un tipo con ese nombre";

//     setFormErrors(errs);
//     return Object.keys(errs).length === 0;
//   }, [form, editingId, tipos]);

//   // ── Handlers ──────────────────────────────────────────────────────────────────
//   const handleNuevo = useCallback(() => {
//     setForm(FORM_INITIAL);
//     setFormErrors({});
//     setEditingId(null);
//     setPanelMode("crear");
//     setPanelOpen(true);
//   }, []);

//   const handleEditar = useCallback((t: getTipoCombustible) => {
//     setForm({
//       nombre: t.nombre,
//       codigo: t.codigo,
//       precioPorLitro: String(t.precioPorLitro),
//     });
//     setFormErrors({});
//     setEditingId(t.id);
//     setPanelMode("editar");
//     setPanelOpen(true);
//   }, []);

//   const handleChange = useCallback((partial: Partial<FormState>) => {
//     setForm((prev) => ({ ...prev, ...partial }));
//   }, []);

//   const handleSubmit = useCallback(async () => {
//     if (!validate()) return;
//     setLoadingSubmit(true);
//     await new Promise((r) => setTimeout(r, 600)); // simula latencia
//     // TODO: reemplazar con create() / update() del hook

//     if (panelMode === "crear") {
//       const nuevo: getTipoCombustible = {
//         id: crypto.randomUUID(),
//         nombre: form.nombre.trim(),
//         codigo: form.codigo.trim(),
//         precioPorLitro: Number(form.precioPorLitro),
//         activo: true,
//         _count: {
//           vehiculos: 0,
//           inventarioCombustibles: 0,
//           movimientoCombustibles: 0,
//           solicituds: 0,
//           asignacions: 0,
//         },
//       };
//       setTipos((prev) => [nuevo, ...prev]);
//     } else if (editingId) {
//       setTipos((prev) =>
//         prev.map((t) =>
//           t.id === editingId
//             ? {
//                 ...t,
//                 nombre: form.nombre.trim(),
//                 codigo: form.codigo.trim(),
//                 precioPorLitro: Number(form.precioPorLitro),
//               }
//             : t,
//         ),
//       );
//     }

//     setLoadingSubmit(false);
//     setPanelOpen(false);
//     setForm(FORM_INITIAL);
//   }, [validate, form, panelMode, editingId]);

//   const handleDelete = useCallback(async () => {
//     if (!deleteTarget) return;
//     setLoadingDelete(true);
//     await new Promise((r) => setTimeout(r, 500)); // simula latencia
//     // TODO: reemplazar con softDelete() del hook
//     setTipos((prev) => prev.filter((t) => t.id !== deleteTarget.id));
//     setLoadingDelete(false);
//     setDeleteTarget(null);
//   }, [deleteTarget]);

//   // ── Render ────────────────────────────────────────────────────────────────────
//   return (
//     <div className="font-['Sora',sans-serif]">
//       {deleteTarget && (
//         <DeleteModal
//           tipo={deleteTarget}
//           onConfirm={handleDelete}
//           onCancel={() => setDeleteTarget(null)}
//           loading={loadingDelete}
//         />
//       )}

//       <div className="flex flex-col lg:flex-row lg:gap-0">
//         <div className="flex min-w-0 flex-1 flex-col">
//           {/* Encabezado */}
//           <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
//             <div>
//               <div className="flex items-center gap-2">
//                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3D8F]">
//                   <Fuel size={15} className="text-white" />
//                 </div>
//                 <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
//                   Tipos de Combustible
//                 </h1>
//               </div>
//               <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
//                 {tipos.filter((t) => t.activo).length} activos · {tipos.length}{" "}
//                 en total
//               </p>
//             </div>
//             <button
//               onClick={handleNuevo}
//               className="flex items-center gap-2 rounded-lg bg-[#1B3D8F] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#163272] hover:shadow-[0_0_16px_rgba(27,61,143,0.35)]"
//             >
//               <Plus size={14} strokeWidth={2.5} /> Nuevo tipo
//             </button>
//           </div>

//           {/* Tarjetas de resumen */}
//           <div className="mb-4 grid grid-cols-3 gap-3">
//             <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
//               <div className="absolute inset-x-0 top-0 h-0.75 bg-[#1B3D8F]" />
//               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
//                 Tipos registrados
//               </p>
//               <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
//                 {tipos.length}
//               </p>
//               <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
//                 {tipos.filter((t) => t.activo).length} activos
//               </p>
//             </div>
//             <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
//               <div className="absolute inset-x-0 top-0 h-0.75 bg-[#3B6D11]" />
//               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
//                 Vehículos asignados
//               </p>
//               <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
//                 {totalVehiculos}
//               </p>
//               <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
//                 en todos los tipos
//               </p>
//             </div>
//             <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
//               <div className="absolute inset-x-0 top-0 h-0.75 bg-[#BA7517]" />
//               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
//                 Precio promedio
//               </p>
//               <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
//                 ${precioPromedio}
//                 <span className="text-[13px] font-medium text-gray-400">
//                   {" "}
//                   /L
//                 </span>
//               </p>
//               <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
//                 {totalSolicituds} solicitudes totales
//               </p>
//             </div>
//           </div>

//           {/* Filtros */}
//           <div className="mb-4 flex flex-wrap gap-2">
//             <div className="relative min-w-50 flex-1">
//               <Search
//                 size={13}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/20"
//               />
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Buscar por nombre o código..."
//                 className="w-full rounded-lg border border-black/80 bg-white py-2.5 pl-8 pr-3.5 text-[13px] text-[#0e1f4d] outline-none transition placeholder:text-gray-300 focus:border-[#1B3D8F] dark:border-white/10 dark:bg-white/30 dark:text-white dark:placeholder:text-white/20 dark:focus:border-[#85B7EB]"
//               />
//             </div>
//             <div className="flex overflow-hidden rounded-lg border border-black/80 bg-white dark:border-white/10 dark:bg-white/30">
//               {(["todos", "activo", "inactivo"] as const).map((f) => (
//                 <button
//                   key={f}
//                   onClick={() => setFilterActivo(f)}
//                   className={`px-3.5 py-2 text-[12px] font-semibold capitalize transition ${
//                     filterActivo === f
//                       ? "bg-[#1B3D8F] text-white"
//                       : "text-gray-400 hover:bg-gray-50 dark:text-white/40 dark:hover:bg-white/50"
//                   }`}
//                 >
//                   {f}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Tabla */}
//           <div className="overflow-x-auto rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
//             <div
//               className="grid items-center border-b border-black/60 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/60 dark:bg-white/30 dark:text-white/30"
//               style={{
//                 gridTemplateColumns: "1fr 110px 80px 80px 80px 80px 100px 40px",
//                 minWidth: "780px",
//               }}
//             >
//               <span>Nombre / Código</span>
//               <span className="text-center">Precio / L</span>
//               <span className="text-center">Veh.</span>
//               <span className="text-center">Sol.</span>
//               <span className="text-center">Asig.</span>
//               <span className="text-center">Mov.</span>
//               <span className="text-center">Estado</span>
//               <span />
//             </div>

//             <div style={{ minWidth: "780px" }}>
//               {filtered.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
//                   <Fuel size={32} strokeWidth={1.5} />
//                   <p className="mt-3 text-[13px] font-semibold">
//                     Sin resultados
//                   </p>
//                   <p className="text-[12px]">
//                     Intenta ajustar el filtro o la búsqueda
//                   </p>
//                 </div>
//               ) : (
//                 filtered.map((t, i) => (
//                   <TipoRow
//                     key={t.id}
//                     tipo={t}
//                     isEditing={panelOpen && editingId === t.id}
//                     isLast={i === filtered.length - 1}
//                     onEdit={handleEditar}
//                     onDelete={setDeleteTarget}
//                   />
//                 ))
//               )}
//             </div>
//           </div>

//           {filtered.length > 0 && (
//             <p className="mt-3 text-right text-[11px] text-gray-300 dark:text-white/20">
//               Mostrando {filtered.length} de {tipos.length} tipos de combustible
//             </p>
//           )}
//         </div>

//         {/* Panel lateral */}
//         {panelOpen && (
//           <div className="mt-5 lg:ml-4 lg:mt-0">
//             <SidePanel
//               mode={panelMode}
//               form={form}
//               errors={formErrors}
//               loading={loadingSubmit}
//               onChange={handleChange}
//               onSubmit={handleSubmit}
//               onClose={() => setPanelOpen(false)}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
