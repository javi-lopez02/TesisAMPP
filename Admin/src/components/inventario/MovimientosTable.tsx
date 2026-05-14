// src/components/inventario/MovimientosTable.tsx

import type { getMovimientoCombustible } from "../../types/movimiento.types";

interface MovimientosTableProps {
  movimientos: getMovimientoCombustible[] | null;
  inventarioId: string;
}

export const MovimientosTable = ({ movimientos }: MovimientosTableProps) => {
  const getTipoBadgeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      ENTRADA: "bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#3B6D11]/20",
      SALIDA: "bg-[#FCEBEB] text-[#CC1A2E] dark:bg-[#CC1A2E]/20",
      AJUSTE: "bg-[#E6F1FB] text-[#1B3D8F] dark:bg-[#1B3D8F]/20",
      MERMA: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/40",
    };
    return colors[tipo] || colors.MERMA;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
      {/* Cabecera */}
      <div
        className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
        style={{ gridTemplateColumns: "1fr 100px 100px 100px 1fr 120px" }}
      >
        <span>Fecha</span>
        <span>Tipo</span>
        <span>Cantidad</span>
        <span>Saldo</span>
        <span>Usuario</span>
        <span>Combustible</span>
      </div>

      {/* Filas */}
      {movimientos?.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-gray-400">
          Sin movimientos en el período seleccionado
        </div>
      ) : (
        movimientos?.map((m) => (
          <div
            key={m.id}
            className="grid items-center border-b border-black/5 px-4 py-3 text-[12px] last:border-0 hover:bg-[#f8f9fc] dark:border-white/5 dark:hover:bg-white/3"
            style={{ gridTemplateColumns: "1fr 100px 100px 100px 1fr 120px" }}
          >
            <span className="text-[#0e1f4d] dark:text-white">
              {new Date(m.createdAt).toLocaleString("es-CU")}
            </span>

            <span
              className={`inline-flex justify-center rounded-md px-2 py-0.5 text-[10px] font-bold ${getTipoBadgeColor(m.tipo)}`}
            >
              {m.tipo}
            </span>

            <span
              className={`text-right font-mono font-semibold ${m.tipo === "ASIGNACION_INICIAL" ? "text-[#3B6D11]" : "text-[#CC1A2E]"}`}
            >
              {m.tipo === "ASIGNACION_INICIAL" ? "+" : "-"}
              {m.cantidad.toLocaleString()} L
            </span>

            <span className="text-right font-mono text-gray-500 dark:text-white/40">
              {m.saldoNuevo.toLocaleString()} L
            </span>

            <span className="truncate text-[#0e1f4d] dark:text-white">
              {m.usuario.nombre} {m.usuario.apellidos[0]}.
            </span>

            <span className="text-[11px] text-gray-400 dark:text-white/30">
              {m.tipoCombustible.nombre}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
