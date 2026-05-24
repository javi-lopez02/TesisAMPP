// src/components/vehiculos/VehiculosTable.tsx
import { Pencil, Trash2, ChevronRight, Car, Fuel } from "lucide-react";
import type { getVehiculo } from "../../types/vehiculo.types";
import { StatPill } from "../globalComponents/StatPill";
import {
  getEstadoLabel,
  getEstadoColor,
  formatearKilometraje,
  formatearCapacidad,
} from "./HelpersVehiculo";

interface VehiculosTableProps {
  vehiculos: getVehiculo[];
  onEditar: (v: getVehiculo) => void;
  onEliminar: (v: getVehiculo) => void;
  editingId?: string | null;
  panelOpen?: boolean;
}

export const VehiculosTable = ({
  vehiculos,
  onEditar,
  onEliminar,
  editingId,
  panelOpen = false,
}: VehiculosTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0e1a35]">
      {/* Cabecera */}
      <div
        className="grid items-center border-b border-black/6 bg-[#f8f9fc] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/6 dark:bg-white/3 dark:text-white/30"
        style={{
          gridTemplateColumns: "120px 1fr 100px 100px 100px 80px 80px 40px",
        }}
      >
        <span className="flex items-center gap-1">
          <Car size={10} /> Placa
        </span>
        <span>Marca / Combustible</span>
        <span className="text-right">Capacidad</span>
        <span className="text-right">Km</span>
        <span className="text-center">Chofer</span>
        <span className="text-center">Asig.</span>
        <span className="text-center">Estado</span>
        <span />
      </div>

      {/* Filas */}
      {vehiculos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-white/20">
          <Car size={32} strokeWidth={1.5} />
          <p className="mt-3 text-[13px] font-semibold">Sin vehículos</p>
          <p className="text-[12px]">
            Registra el primer vehículo para comenzar
          </p>
        </div>
      ) : (
        vehiculos.map((v, i) => (
          <div
            key={v.id}
            className={`grid items-center px-5 py-3.5 transition hover:bg-[#f8f9fc] dark:hover:bg-white/3 ${
              i < vehiculos.length - 1
                ? "border-b border-black/5 dark:border-white/5"
                : ""
            } ${editingId === v.id && panelOpen ? "bg-[#EAF3DE]/40 dark:bg-[#1B3D8F]/10" : ""}`}
            style={{
              gridTemplateColumns: "120px 1fr 100px 100px 100px 80px 80px 40px",
            }}
          >
            {/* Placa */}
            <div className="font-mono text-[13px] font-bold text-[#0e1f4d] dark:text-white">
              {v.placa}
            </div>

            {/* Marca + Combustible */}
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-[#0e1f4d] dark:text-white">
                {v.marca}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/30">
                <Fuel size={9} />
                <span className="truncate">{v.tipoCombustible.nombre}</span>
              </div>
            </div>

            {/* Capacidad */}
            <div className="text-right font-mono text-[12px] text-gray-500 dark:text-white/40">
              {formatearCapacidad(v.capacidadTanque)}
            </div>

            {/* Kilometraje */}
            <div className="text-right font-mono text-[12px] text-gray-500 dark:text-white/40">
              {formatearKilometraje(v.kilometraje)}
            </div>

            {/* Chofer */}
            <div className="flex justify-center">
              {v.chofer ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B3D8F]/20 text-[9px] font-bold text-[#1B3D8F] dark:bg-[#1B3D8F]/30 dark:text-[#85B7EB] uppercase">
                    {v.chofer.nombre[0]}
                    {v.chofer.apellidos[0]}
                  </div>
                  <span className="truncate text-[11px] text-[#0e1f4d] dark:text-white max-w-20">
                    {v.chofer.nombre}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-gray-300 dark:text-white/20">
                  —
                </span>
              )}
            </div>

            {/* Asignaciones */}
            <div className="flex justify-center">
              <StatPill value={v._count?.asignaciones ?? 0} label="Asig." />
            </div>

            {/* Estado */}
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase ${getEstadoColor(v.estado)}`}
              >
                {getEstadoLabel(v.estado)}
              </span>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => onEditar(v)}
                title="Editar"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-[#E6F1FB] hover:text-[#1B3D8F] dark:text-white/20 dark:hover:bg-[#1B3D8F]/20 dark:hover:text-[#85B7EB]"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onEliminar(v)}
                title="Eliminar"
                disabled={!v.activo}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                  v.activo
                    ? "text-gray-300 hover:bg-[#FCEBEB] hover:text-[#CC1A2E] dark:text-white/20 dark:hover:bg-[#CC1A2E]/20 dark:hover:text-[#F09595]"
                    : "text-gray-200 cursor-not-allowed dark:text-white/10"
                }`}
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
  );
};
