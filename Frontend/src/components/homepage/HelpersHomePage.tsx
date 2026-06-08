import type { getSolicitud } from "../../types/solicitud.types";
import type { getVehiculo } from "../../types/vehiculo.types";
import type { getInventario } from "../../types/inventario.types";
import type { getMantenimiento } from "../../types/mantenimiento.types";
import { Droplet, FileText, Truck, Wrench } from "lucide-react";

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface StatCard {
  label: string;
  value: string | number;
  Icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
}

export interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected" | "completed";
}

// ── Formato de tiempo relativo ───────────────────────────────────────────────

/**
 * Formatea una fecha a tiempo relativo (Hace 5 min, Hace 2h, etc.)
 * Maneja fechas inválidas retornando "Fecha desconocida"
 */
export const formatTiempo = (
  fecha: string | Date | null | undefined,
): string => {
  if (!fecha) return "Fecha desconocida";

  const fechaObj = typeof fecha === "string" ? new Date(fecha) : fecha;

  // Validar que la fecha sea válida
  if (isNaN(fechaObj.getTime())) {
    console.warn("Fecha inválida recibida:", fecha);
    return "Fecha desconocida";
  }

  const ahora = new Date();
  const diffMs = ahora.getTime() - fechaObj.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "Ahora mismo";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffH < 24) return `Hace ${diffH}h`;
  if (diffD < 7) return `Hace ${diffD}d`;
  return fechaObj.toLocaleDateString("es-CU", {
    day: "numeric",
    month: "short",
  });
};

// ── Cálculo de estadísticas ──────────────────────────────────────────────────

export const calcularEstadisticas = (
  solicitudes: getSolicitud[] | null,
  vehiculos: getVehiculo[] | null,
  inventario: getInventario[] | null,
  mantenimientos: getMantenimiento[] | null,
  rol: string | undefined,
): StatCard[] => {
  const listaSolicitudes = solicitudes ?? [];
  const listaVehiculos = vehiculos ?? [];
  const listaInventario = inventario ?? [];
  const listaMantenimientos = mantenimientos ?? [];

  // Solicitudes activas (pendientes + aprobadas)
  const solicitudesActivas = listaSolicitudes.filter(
    (s) => s.estado === "PENDIENTE" || s.estado === "APROBADA",
  ).length;

  // Vehículos disponibles
  const vehiculosDisponibles = listaVehiculos.filter(
    (v) => v.estado === "DISPONIBLE" && v.activo,
  ).length;

  // Litros disponibles
  const litrosDisponibles = listaInventario.reduce(
    (acc, i) => acc + (Number(i.saldoActual) || 0),
    0,
  );

  // Mantenimientos pendientes (correctivos)
  const mantenimientosPendientes = listaMantenimientos.filter(
    (m) => m.tipo === "Correctivo",
  ).length;

  return [
    {
      label: rol === "CHOFER" ? "Mis asignaciones" : "Solicitudes activas",
      value: solicitudesActivas,
      Icon: FileText,
    },
    {
      label: rol === "CHOFER" ? "Próximo viaje" : "Vehículos disponibles",
      value: rol === "CHOFER" ? "Hoy" : vehiculosDisponibles,
      Icon: Truck,
    },
    {
      label: "Litros disponibles",
      value: `${litrosDisponibles.toLocaleString("es-CU")} L`,
      Icon: Droplet,
    },
    {
      label: "Mantenimientos pendientes",
      value: mantenimientosPendientes,
      Icon: Wrench,
    },
  ];
};

// ── Generación de actividad reciente ─────────────────────────────────────────

export const generarActividadReciente = (
  solicitudes: getSolicitud[] | null,
  mantenimientos: getMantenimiento[] | null,
): ActivityItem[] => {
  const items: ActivityItem[] = [];

  // Solicitudes recientes
  if (solicitudes && solicitudes.length > 0) {
    const solicitudesRecientes = [...solicitudes]
      .filter((s) => s.fechaSolicitada) // Filtrar solicitudes con fecha válida
      .sort(
        (a, b) =>
          new Date(b.fechaSolicitada).getTime() -
          new Date(a.fechaSolicitada).getTime(),
      )
      .slice(0, 5);

    solicitudesRecientes.forEach((s) => {
      let status: ActivityItem["status"] = "pending";
      let action = `Solicitud "${s.actividad}" creada`;

      switch (s.estado) {
        case "APROBADA":
          status = "approved";
          action = `Solicitud "${s.actividad}" aprobada`;
          break;
        case "RECHAZADA":
          status = "rejected";
          action = `Solicitud "${s.actividad}" rechazada`;
          break;
        case "COMPLETADA":
          status = "completed";
          action = `Solicitud "${s.actividad}" completada`;
          break;
      }

      const timestamp = formatTiempo(s.fechaSolicitada);

      // Solo agregar si la fecha es válida
      if (timestamp !== "Fecha desconocida") {
        items.push({
          id: s.id,
          action,
          timestamp,
          status,
        });
      }
    });
  }

  // Mantenimientos recientes
  if (mantenimientos && mantenimientos.length > 0) {
    const mantenimientosRecientes = [...mantenimientos]
      .filter((m) => m.fecha) // Filtrar mantenimientos con fecha válida
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 3);

    mantenimientosRecientes.forEach((m) => {
      const timestamp = formatTiempo(m.fecha);

      // Solo agregar si la fecha es válida
      if (timestamp !== "Fecha desconocida") {
        items.push({
          id: m.id,
          action: `Mantenimiento ${m.tipo} registrado para ${m.vehiculo?.placa || "vehículo"}`,
          timestamp,
          status: "completed",
        });
      }
    });
  }

  // Ordenar por timestamp y tomar los 5 más recientes
  return items
    .sort((a, b) => {
      const getMinutos = (t: string) => {
        if (t.includes("min")) return parseInt(t.match(/\d+/)?.[0] || "0");
        if (t.includes("h")) return parseInt(t.match(/\d+/)?.[0] || "0") * 60;
        if (t.includes("d")) return parseInt(t.match(/\d+/)?.[0] || "0") * 1440;
        if (t.includes("Ahora")) return 0;
        return 9999;
      };
      return getMinutos(a.timestamp) - getMinutos(b.timestamp);
    })
    .slice(0, 5);
};

// ── Saludo contextual ────────────────────────────────────────────────────────

export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
};

export const formatRol = (rol: string | undefined): string => {
  return (
    rol
      ?.toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? ""
  );
};
