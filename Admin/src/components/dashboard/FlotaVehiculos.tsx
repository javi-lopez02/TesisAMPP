import { useMemo } from "react";
import { Card } from "./Card";
import type { getVehiculo } from "../../types/vehiculo.types";

interface Props {
  vehiculos: getVehiculo[] | null;
}

export const FlotaVehiculos = ({ vehiculos }: Props) => {
  const stats = useMemo(() => {
    const lista = vehiculos ?? [];
    return {
      disponibles: lista.filter((v) => v.estado === "DISPONIBLE" && v.activo)
        .length,
      enUso: lista.filter((v) => v.estado === "EN_USO").length,
      mantenimiento: lista.filter((v) => v.estado === "MANTENIMIENTO").length,
      fueraServicio: lista.filter(
        (v) => v.estado === "FUERA_DE_SERVICIO" || !v.activo,
      ).length,
    };
  }, [vehiculos]);

  const items = [
    {
      label: "Disponibles",
      value: stats.disponibles,
      color: "bg-[#EAF3DE]",
      text: "text-[#3B6D11]",
      sub: "listos para asignación",
    },
    {
      label: "En uso",
      value: stats.enUso,
      color: "bg-[#E6F1FB]",
      text: "text-[#185FA5]",
      sub: "asignaciones activas",
    },
    {
      label: "Mantenimiento",
      value: stats.mantenimiento,
      color: "bg-[#FAEEDA]",
      text: "text-[#854F0B]",
      sub: "fuera de servicio temp.",
    },
    {
      label: "Fuera servicio",
      value: stats.fueraServicio,
      color: "bg-[#FCEBEB]",
      text: "text-[#A32D2D]",
      sub: "baja definitiva",
    },
  ];

  return (
    <Card title="Flota de vehículos">
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className={`rounded-lg p-3 ${item.color}`}>
            <p
              className={`text-[10px] font-bold uppercase tracking-wide ${item.text}`}
            >
              {item.label}
            </p>
            <p className={`mt-1 text-[20px] font-bold ${item.text}`}>
              {item.value}
            </p>
            <p className={`text-[10px] ${item.text} opacity-70`}>{item.sub}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
