import { useState, useEffect, useMemo } from "react";
import { Search, AlertTriangle, Route } from "lucide-react";
// Importa tu hook real
import { useRutas } from "../hooks/useRutas";
import { RutasTable } from "../components/ruta/RutasTable";
import { ModalPuntosRuta } from "../components/ruta/ModalPuntoRutas";
import {
  aplicarFiltrosRutas,
  type FiltrosRutas,
} from "../components/ruta/HelpersRutas";
import type { getRuta } from "../types/rutas.types";

export const RutasPage = () => {
  const { rutas, loading, error, getAll } = useRutas();
  const [search, setSearch] = useState("");
  const [filterActiva, setFilterActiva] = useState<
    "todos" | "activa" | "inactiva"
  >("todos");
  const [rutaSeleccionada, setRutaSeleccionada] = useState<getRuta | null>(
    null,
  );

  useEffect(() => {
    getAll();
  }, [getAll]);

  const filtros: FiltrosRutas = useMemo(
    () => ({ search, filterActiva }),
    [search, filterActiva],
  );
  const filtered = useMemo(
    () => aplicarFiltrosRutas(rutas, filtros),
    [rutas, filtros],
  );

  return (
    <div className="font-['Sora',sans-serif]">
      {rutaSeleccionada && (
        <ModalPuntosRuta
          ruta={rutaSeleccionada}
          onClose={() => setRutaSeleccionada(null)}
        />
      )}
      <div className="flex flex-col lg:flex-row lg:gap-0">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3D8F]">
                  <Route size={15} className="text-white" />
                </div>
                <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
                  Rutas
                </h1>
              </div>
              <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
                {filtered.length} rutas registradas
              </p>
            </div>
            {/* ❌ Sin botón de crear (vista solo lectura) */}
          </div>

          {/* Filters */}
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
                placeholder="Buscar por nombre o descripción..."
                className="w-full rounded-lg border border-black/8 bg-white py-2.5 pl-8 pr-3.5 text-[13px] text-[#0e1f4d] outline-none transition placeholder:text-gray-300 focus:border-[#1B3D8F] dark:border-white/10 dark:bg-white/3 dark:text-white dark:placeholder:text-white/20 dark:focus:border-[#85B7EB]"
              />
            </div>
            <div className="flex overflow-hidden rounded-lg border border-black/8 bg-white dark:border-white/10 dark:bg-white/3">
              {(["todos", "activa", "inactiva"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterActiva(f)}
                  className={`px-3.5 py-2 text-[12px] font-semibold capitalize transition ${filterActiva === f ? "bg-[#1B3D8F] text-white" : "text-gray-400 hover:bg-gray-50 dark:text-white/40 dark:hover:bg-white/5"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* States */}
          {loading && rutas === null && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
              <p className="mt-3 text-[13px] font-semibold">
                Cargando rutas...
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

          {/* Table */}
          {!loading && rutas !== null && (
            <RutasTable rutas={filtered} onVerPuntos={setRutaSeleccionada} />
          )}
          {!loading && rutas !== null && filtered.length > 0 && (
            <p className="mt-3 text-right text-[11px] text-gray-300 dark:text-white/20">
              Mostrando {filtered.length} de {(rutas ?? []).length} rutas
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
