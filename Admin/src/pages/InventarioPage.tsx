// src/pages/InventarioPage.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Fuel,
  Filter,
  TrendingDown,
  BarChart3,
  Droplets,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useInventario } from "../hooks/useInventario";
import { useTipoCombustible } from "../hooks/useTipoCombustible";
import { InventarioTable } from "../components/inventario/InventarioTable";
import { ResumenCard } from "../components/inventario/ResumeCard";
import { NivelStockBar } from "../components/inventario/NivelStockBar";
import {
  UMBRAL_CRITICO,
  aplicarFiltrosInventario,
  type FiltrosInventario,
  calcularMetricasInventario,
  type MetricasInventario,
} from "../components/inventario/HelpersInventario";

// ── InventarioPage ────────────────────────────────────────────────────────────
export const InventarioPage = () => {
  const { inventario, loading, getAll } = useInventario();
  const { getAll: getAllTipos } = useTipoCombustible();

  const [search, setSearch] = useState("");
  const [filterBajo, setFilterBajo] = useState<"todos" | "bajo" | "normal">(
    "todos",
  );

  useEffect(() => {
    getAll();
    getAllTipos();
  }, [getAll, getAllTipos]);

  // ── Métricas (usando helper) ───────────────────────────────────────────────
  const metricas = useMemo((): MetricasInventario => {
    return calcularMetricasInventario(inventario);
  }, [inventario]);

  // ── Filtros (usando helper) ────────────────────────────────────────────────
  const filtros: FiltrosInventario = useMemo(
    () => ({
      search,
      filterBajo,
    }),
    [search, filterBajo],
  );

  const filtered = useMemo(() => {
    return aplicarFiltrosInventario(inventario, filtros);
  }, [inventario, filtros]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="font-['Sora',sans-serif]">
      <div className="flex flex-col lg:flex-row lg:gap-0">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Encabezado - Ajuste responsive */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3D8F]">
                  <Fuel size={15} className="text-white" />
                </div>
                <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
                  Inventario de Combustible
                </h1>
              </div>
              <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
                {(inventario ?? []).length} registros ·{" "}
                <span
                  className={
                    metricas.conStockBajo > 0
                      ? "font-semibold text-[#CC1A2E] dark:text-[#F09595]"
                      : "text-gray-400 dark:text-gray-400"
                  }
                >
                  {metricas.conStockBajo} con stock bajo
                </span>
              </p>
            </div>
          </div>

          {/* Tarjetas de resumen - Ajuste grid responsive */}
          {!loading && inventario !== null && inventario.length > 0 && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ResumenCard
                color="bg-[#1B3D8F]"
                label="Total asignado"
                value={`${metricas.totalAsignado.toLocaleString("es-CU")} L`}
                sub="capacidad total registrada"
                icon={BarChart3}
              />
              <ResumenCard
                color="bg-[#3B6D11]"
                label="Disponible"
                value={`${metricas.totalDisponible.toLocaleString("es-CU")} L`}
                sub={`${metricas.pctGlobal}% del total asignado`}
                icon={Droplets}
              />
              <ResumenCard
                color="bg-[#BA7517]"
                label="Consumido"
                value={`${metricas.totalConsumido.toLocaleString("es-CU")} L`}
                sub="diferencia asignado vs saldo"
                icon={TrendingDown}
              />
              <ResumenCard
                color="bg-[#CC1A2E]"
                label="Movimientos"
                value={metricas.totalMovimientos}
                sub="total registrados"
                icon={RefreshCw}
              />

              {/* Barra de niveles - ocupa ancho completo en móvil */}
              <div className="sm:col-span-2 lg:col-span-4">
                <NivelStockBar inventario={inventario} />
              </div>
            </div>
          )}

          {/* Filtros - Ajuste responsive */}
          <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-2">
            {/* Búsqueda - ocupa todo el ancho en móvil */}
            <div className="relative w-full sm:min-w-50 sm:flex-1">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/20"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o código de combustible..."
                className="w-full rounded-lg border border-black/8 bg-white py-2.5 pl-8 pr-3.5 text-[13px] text-[#0e1f4d] outline-none transition placeholder:text-gray-300 focus:border-[#1B3D8F] dark:border-white/10 dark:bg-white/3 dark:text-white dark:placeholder:text-white/20 dark:focus:border-[#85B7EB]"
              />
            </div>

            {/* Filtro por stock - botón compacto */}
            <div className="flex overflow-hidden rounded-lg border border-black/8 bg-white dark:border-white/10 dark:bg-white/3 w-full sm:w-auto">
              {(
                [
                  {
                    key: "todos",
                    label: "Todos",
                    active: "bg-[#1B3D8F] text-white",
                  },
                  {
                    key: "bajo",
                    label: "Stock bajo",
                    active: "bg-[#CC1A2E] text-white",
                  },
                  {
                    key: "normal",
                    label: "Normal",
                    active: "bg-[#3B6D11] text-white",
                  },
                ] as const
              ).map(({ key, label, active }) => (
                <button
                  key={key}
                  onClick={() => setFilterBajo(key)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold transition ${
                    filterBajo === key
                      ? active
                      : "text-gray-400 hover:bg-gray-50 dark:text-white/40 dark:hover:bg-white/5"
                  }`}
                >
                  {key === "todos" && <Filter size={10} />}
                  <span className="sm:hidden">
                    {label === "Stock bajo"
                      ? "Bajo"
                      : label === "Normal"
                        ? "Norm"
                        : "Todos"}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alerta stock crítico */}
          {!loading && inventario !== null && metricas.conStockCritico > 0 && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-[#CC1A2E]/30 bg-[#CC1A2E]/10 px-4 py-2.5 dark:border-[#F09595]/30 dark:bg-[#CC1A2E]/20">
              <AlertTriangle
                size={14}
                className="shrink-0 text-[#CC1A2E] dark:text-[#F09595]"
              />
              <p className="text-[12px] font-medium text-[#791F1F] dark:text-[#F09595]/90">
                <span className="font-bold">
                  {metricas.conStockCritico} tipo(s)
                </span>{" "}
                de combustible con nivel crítico (menos del {UMBRAL_CRITICO}%
                disponible).
              </p>
            </div>
          )}

          {/* Estado: cargando */}
          {loading && inventario === null && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
              <p className="mt-3 text-[13px] font-semibold">
                Cargando inventario...
              </p>
            </div>
          )}

          {/* ✅ Tabla con contenedor de scroll horizontal */}
          {!loading && inventario !== null && (
            <div className="overflow-x-auto">
              <InventarioTable inventarios={filtered} />
            </div>
          )}

          {/* Pie */}
          {!loading && inventario !== null && filtered.length > 0 && (
            <p className="mt-3 text-right text-[11px] text-gray-400 dark:text-gray-400">
              Mostrando {filtered.length} de {(inventario ?? []).length}{" "}
              inventarios
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
