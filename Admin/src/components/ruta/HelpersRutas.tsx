import type { getRuta, TipoPuntoRuta } from "../../types/rutas.types";

export const formatDistance = (km: number) => `${km.toFixed(2)} km`;
export const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const getTipoPuntoLabel = (tipo: TipoPuntoRuta) => {
  const labels: Record<TipoPuntoRuta, string> = {
    INICIO: "Inicio",
    INTERMEDIO: "Intermedio",
    DESTINO: "Destino",
  };
  return labels[tipo];
};

export const getTipoPuntoColor = (tipo: TipoPuntoRuta) => {
  const colors: Record<TipoPuntoRuta, string> = {
    INICIO:
      "bg-[#3B6D11]/10 text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#9FD97A]",
    INTERMEDIO:
      "bg-[#1B3D8F]/10 text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]",
    DESTINO:
      "bg-[#CC1A2E]/10 text-[#CC1A2E] dark:bg-[#CC1A2E]/20 dark:text-[#F09595]",
  };
  return colors[tipo];
};

export interface FiltrosRutas {
  search: string;
  filterActiva: "todos" | "activa" | "inactiva";
}

export const aplicarFiltrosRutas = (
  rutas: getRuta[] | null,
  filtros: FiltrosRutas,
) => {
  const { search, filterActiva } = filtros;
  const lista = rutas ?? [];
  const q = search.toLowerCase();
  return lista.filter((r) => {
    const matchSearch =
      r.nombre.toLowerCase().includes(q) ||
      r.descripcion.toLowerCase().includes(q);
    const matchActiva =
      filterActiva === "todos" ||
      (filterActiva === "activa" ? r.activa : !r.activa);
    return matchSearch && matchActiva;
  });
};
