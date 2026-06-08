import { useMemo } from "react";
import { Fuel } from "lucide-react";
import { Card } from "./Card";
import type { getInventario } from "../../types/inventario.types";

interface Props {
  inventario: getInventario[] | null;
}

const getNivel = (porcentaje: number) => {
  if (porcentaje >= 40)
    return {
      bar: "bg-[#1B3D8F]",
      text: "text-[#185FA5]",
      label: "del total asignado",
      iconBg: "bg-[#E6F1FB]",
      iconColor: "text-[#185FA5]",
    };
  if (porcentaje >= 20)
    return {
      bar: "bg-[#BA7517]",
      text: "text-[#854F0B]",
      label: "— nivel bajo",
      iconBg: "bg-[#FAEEDA]",
      iconColor: "text-[#854F0B]",
    };
  return {
    bar: "bg-[#CC1A2E]",
    text: "text-[#A32D2D]",
    label: "— crítico",
    iconBg: "bg-[#FCEBEB]",
    iconColor: "text-[#A32D2D]",
  };
};

export const InventarioCombustible = ({ inventario }: Props) => {
  const items = useMemo(() => {
    if (!inventario) return [];
    return inventario.map((inv) => {
      const porcentaje =
        inv.cantidadAsignada > 0
          ? Math.round((inv.saldoActual / inv.cantidadAsignada) * 100)
          : 0;
      return {
        tipoCombustible: inv.tipoCombustible.nombre,
        saldoActual: inv.saldoActual,
        porcentaje,
        nivel: getNivel(porcentaje),
      };
    });
  }, [inventario]);

  return (
    <Card title="Inventario de combustible">
      {items.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-gray-400 dark:text-white/30">
          Sin inventario registrado
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((inv) => (
            <div key={inv.tipoCombustible} className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${inv.nivel.iconBg}`}
              >
                <Fuel size={14} className={inv.nivel.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <p className="text-[11px] text-gray-400 dark:text-white/40 font-medium">
                    {inv.tipoCombustible}
                  </p>
                  <p className="text-[13px] font-bold text-[#0e1f4d] dark:text-white">
                    {inv.saldoActual.toLocaleString("es-CU")} L
                  </p>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/6 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full ${inv.nivel.bar}`}
                    style={{ width: `${Math.min(inv.porcentaje, 100)}%` }}
                  />
                </div>
                <p className={`mt-1 text-[10px] font-bold ${inv.nivel.text}`}>
                  {inv.porcentaje}% {inv.nivel.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
