// src/pages/InventarioMovimientosPage.tsx
import { useState, useEffect } from "react";
import { useInventario } from "../hooks/useInventario";
import { DateRangeFilter } from "../components/inventario/DateRangeFilter";
import { MovimientosTable } from "../components/inventario/MovimientosTable";
import { X } from "lucide-react";

interface InventarioMovimientosPageProps {
  inventarioId: string;
}

export const InventarioMovimientosPage = ({ inventarioId }: InventarioMovimientosPageProps) => {
  const { 
    movimientos, 
    loadingMovimientos, 
    errorMovimientos, 
    getInventarioMovimientos 
  } = useInventario();

  const [activeFilters, setActiveFilters] = useState<{
    desde?: string;
    hasta?: string;
  }>({});

  // Cargar movimientos cuando cambien los filtros
  useEffect(() => {
    if (inventarioId) {
      getInventarioMovimientos(inventarioId, {
        ...activeFilters,
        limite: 100,
      });
    }
  }, [inventarioId, activeFilters.desde, activeFilters.hasta, activeFilters, getInventarioMovimientos]);

  const handleApplyFilters = (desde: string | undefined, hasta: string | undefined) => {
    setActiveFilters({ desde, hasta });
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  return (
    <div className="space-y-4">
      {/* Header de la página */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
            Historial de Movimientos
          </h1>
          <p className="text-[12px] text-gray-400 dark:text-white/40">
            Registro de entradas, salidas y ajustes de combustible
          </p>
        </div>
        
        {/* Filtro de fechas */}
        <DateRangeFilter
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          initialDesde={activeFilters.desde?.split("T")[0]}
          initialHasta={activeFilters.hasta?.split("T")[0]}
        />
      </div>

      {/* Estado: cargando */}
      {loadingMovimientos && movimientos === null && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
          <p className="mt-3 text-[13px] text-gray-400">Cargando movimientos...</p>
        </div>
      )}

      {/* Estado: error */}
      {errorMovimientos && (
        <div className="rounded-xl border border-[#CC1A2E]/30 bg-[#FCEBEB] p-4 text-[#CC1A2E]">
          <p className="text-[13px] font-semibold">Error al cargar</p>
          <p className="text-[12px]">{errorMovimientos.join(", ")}</p>
          <button
            onClick={() => handleApplyFilters(activeFilters.desde, activeFilters.hasta)}
            className="mt-2 text-[12px] font-semibold underline hover:text-[#b31728]"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de movimientos */}
      {!loadingMovimientos && (
        <>
          <MovimientosTable movimientos={movimientos} inventarioId={inventarioId} />
          
          {/* Pie informativo */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 dark:text-white/20">
            <p>
              {movimientos?.length} movimientos encontrados
              {(activeFilters.desde || activeFilters.hasta) && (
                <span className="ml-1 text-[#1B3D8F] dark:text-[#85B7EB]">
                  · Filtro activo
                </span>
              )}
            </p>
            {(activeFilters.desde || activeFilters.hasta) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-[#1B3D8F] hover:underline dark:text-[#85B7EB]"
              >
                <X size={10} />
                Quitar filtros
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};