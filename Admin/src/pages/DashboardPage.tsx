// src/pages/DashboardPage.tsx
import { AlertTriangle, Fuel } from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface DashboardStats {
  solicitudesHoy: number;
  solicitudesHoyAprobadas: number;
  solicitudesHoyPendientes: number;
  combustibleTotalLitros: number;
  combustibleVariacion: number; // % vs semana pasada (negativo = bajó)
  asignacionesActivas: number;
  asignacionesEnUso: number;
  asignacionesAsignadas: number;
  rendimientoPromedio: number; // km/L
}

interface SolicitudReciente {
  id: string;
  codigo: string;
  iniciales: string;
  tipo: "GENERAL" | "FISCALIZACION" | "CONTROL_POPULAR" | "EMERGENCIA";
  consejo: string;
  litros: number;
  estado:
    | "PENDIENTE"
    | "APROBADA"
    | "RECHAZADA"
    | "EN_PROCESO"
    | "COMPLETADA"
    | "CANCELADA";
}

interface SolicitudPorConsejo {
  nombre: string;
  total: number;
  maximo: number; // para calcular el ancho de la barra
}

interface ResumenEstados {
  aprobadas: number;
  pendientes: number;
  rechazadas: number;
}

interface InventarioCombustible {
  tipoCombustible: string;
  saldoActual: number;
  totalAsignado: number;
  porcentaje: number;
  nivel: "ok" | "bajo" | "critico";
}

interface FlotaVehiculos {
  disponibles: number;
  enUso: number;
  mantenimiento: number;
  fueraServicio: number;
}

interface ActividadItem {
  id: string;
  texto: string;
  tiempo: string;
  color: "blue" | "green" | "red" | "amber";
}

// ── Helpers visuales ──────────────────────────────────────────────────────────

const ESTADO_MAP: Record<
  SolicitudReciente["estado"],
  { label: string; className: string }
> = {
  PENDIENTE: { label: "Pendiente", className: "bg-[#FAEEDA] text-[#854F0B]" },
  APROBADA: { label: "Aprobada", className: "bg-[#EAF3DE] text-[#3B6D11]" },
  RECHAZADA: { label: "Rechazada", className: "bg-[#FCEBEB] text-[#A32D2D]" },
  EN_PROCESO: { label: "En proceso", className: "bg-[#E6F1FB] text-[#185FA5]" },
  COMPLETADA: { label: "Completada", className: "bg-[#EAF3DE] text-[#3B6D11]" },
  CANCELADA: { label: "Cancelada", className: "bg-[#F1EFE8] text-[#5F5E5A]" },
};

const TIPO_MAP: Record<SolicitudReciente["tipo"], string> = {
  GENERAL: "General",
  FISCALIZACION: "Fiscalización",
  CONTROL_POPULAR: "Control popular",
  EMERGENCIA: "Emergencia",
};

const DOT_COLOR: Record<ActividadItem["color"], string> = {
  blue: "bg-[#1B3D8F]",
  green: "bg-[#3B6D11]",
  red: "bg-[#CC1A2E]",
  amber: "bg-[#BA7517]",
};

const NIVEL_MAP: Record<
  InventarioCombustible["nivel"],
  { bar: string; text: string; label: string }
> = {
  ok: {
    bar: "bg-[#1B3D8F]",
    text: "text-[#185FA5]",
    label: "del total asignado",
  },
  bajo: { bar: "bg-[#BA7517]", text: "text-[#854F0B]", label: "— nivel bajo" },
  critico: { bar: "bg-[#CC1A2E]", text: "text-[#A32D2D]", label: "— crítico" },
};

// ── Datos de ejemplo (reemplazar con llamadas al backend) ─────────────────────

const STATS: DashboardStats = {
  solicitudesHoy: 7,
  solicitudesHoyAprobadas: 5,
  solicitudesHoyPendientes: 2,
  combustibleTotalLitros: 2840,
  combustibleVariacion: -18,
  asignacionesActivas: 4,
  asignacionesEnUso: 2,
  asignacionesAsignadas: 2,
  rendimientoPromedio: 8.3,
};

const SOLICITUDES_RECIENTES: SolicitudReciente[] = [
  {
    id: "1",
    codigo: "SOL-20250429-001",
    iniciales: "JM",
    tipo: "FISCALIZACION",
    consejo: "Versalles",
    litros: 40,
    estado: "PENDIENTE",
  },
  {
    id: "2",
    codigo: "SOL-20250429-002",
    iniciales: "RL",
    tipo: "CONTROL_POPULAR",
    consejo: "La Playa",
    litros: 60,
    estado: "APROBADA",
  },
  {
    id: "3",
    codigo: "SOL-20250428-019",
    iniciales: "CP",
    tipo: "GENERAL",
    consejo: "Pastorita",
    litros: 25,
    estado: "EN_PROCESO",
  },
  {
    id: "4",
    codigo: "SOL-20250428-018",
    iniciales: "AM",
    tipo: "EMERGENCIA",
    consejo: "Mtzo. Este",
    litros: 80,
    estado: "RECHAZADA",
  },
  {
    id: "5",
    codigo: "SOL-20250427-015",
    iniciales: "DP",
    tipo: "GENERAL",
    consejo: "Versalles",
    litros: 35,
    estado: "COMPLETADA",
  },
];

const SOLICITUDES_POR_CONSEJO: SolicitudPorConsejo[] = [
  { nombre: "Versalles", total: 44, maximo: 44 },
  { nombre: "Pastorita", total: 31, maximo: 44 },
  { nombre: "La Playa", total: 25, maximo: 44 },
  { nombre: "Mtzo. Este", total: 19, maximo: 44 },
  { nombre: "Mtzo. Oeste", total: 15, maximo: 44 },
];

const RESUMEN_ESTADOS: ResumenEstados = {
  aprobadas: 98,
  pendientes: 18,
  rechazadas: 18,
};

const INVENTARIO: InventarioCombustible[] = [
  {
    tipoCombustible: "Diésel",
    saldoActual: 1640,
    totalAsignado: 2800,
    porcentaje: 58,
    nivel: "ok",
  },
  {
    tipoCombustible: "Gasolina 95",
    saldoActual: 820,
    totalAsignado: 2800,
    porcentaje: 29,
    nivel: "bajo",
  },
  {
    tipoCombustible: "Gasolina 97",
    saldoActual: 380,
    totalAsignado: 2800,
    porcentaje: 14,
    nivel: "critico",
  },
];

const FLOTA: FlotaVehiculos = {
  disponibles: 14,
  enUso: 4,
  mantenimiento: 3,
  fueraServicio: 1,
};

const ACTIVIDAD: ActividadItem[] = [
  {
    id: "1",
    texto: "ASN-001 marcada DEVUELTA — reporte generado",
    tiempo: "Hace 15 min",
    color: "green",
  },
  {
    id: "2",
    texto: "Inventario Diésel actualizado: +500 L asignados",
    tiempo: "Hace 1h",
    color: "blue",
  },
  {
    id: "3",
    texto: "Vehículo HBC-291 enviado a mantenimiento",
    tiempo: "Hace 2h",
    color: "red",
  },
  {
    id: "4",
    texto: "SOL-20250429-001 sin gestión — 48h pendiente",
    tiempo: "Hace 3h",
    color: "amber",
  },
  {
    id: "5",
    texto: "Nueva ruta creada: Versalles Norte B",
    tiempo: "Ayer, 14:30",
    color: "green",
  },
];

const SOLICITUDES_PENDIENTES_CRITICAS = 3; // > 48h sin gestión

// ── Componentes internos ──────────────────────────────────────────────────────

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-xl border border-black/[0.07] bg-white p-5 dark:border-white/[0.07] dark:bg-[#0e1a35] ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) => (
  <div className="mb-4 flex items-center justify-between">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
      {title}
    </span>
    {action && (
      <button
        onClick={onAction}
        className="text-[11px] font-semibold text-[#1B3D8F] dark:text-[#85B7EB]"
      >
        {action}
      </button>
    )}
  </div>
);

const Separator = () => (
  <div className="my-2 h-px bg-black/5 dark:bg-white/5" />
);

// ── DashboardPage ─────────────────────────────────────────────────────────────

export const DashboardPage = () => {
  const fecha = new Date().toLocaleDateString("es-CU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4 font-['Sora',sans-serif] hide-scrollbar">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[19px] font-bold text-[#0e1f4d] dark:text-white">
            Buenos días, <span className="text-[#1B3D8F]">Administrador</span>
          </h1>
          <p className="mt-0.5 text-[12px] text-gray-400 dark:text-white/40">
            Asamblea Municipal del Poder Popular — Panel operativo
          </p>
        </div>
        <span className="rounded-full border border-black/[0.07] bg-white px-3.5 py-1.5 text-[11px] font-medium capitalize text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
          {fecha}
        </span>
      </div>

      {/* Banner de alerta — solicitudes críticas */}
      {SOLICITUDES_PENDIENTES_CRITICAS > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[#F09595] bg-[#FCEBEB] px-4 py-2.5">
          <AlertTriangle size={14} className="shrink-0 text-[#CC1A2E]" />
          <p className="text-[12px] font-medium text-[#791F1F]">
            <span className="font-bold">
              {SOLICITUDES_PENDIENTES_CRITICAS} solicitudes
            </span>{" "}
            llevan más de 48h en estado PENDIENTE sin gestión — requieren
            atención inmediata
          </p>
        </div>
      )}

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Solicitudes hoy */}
        <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
          <div className="absolute inset-x-0 top-0 h-0.75 bg-[#1B3D8F]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
            Solicitudes hoy
          </p>
          <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
            {STATS.solicitudesHoy}
          </p>
          <p className="mt-1.5 text-[11px] text-gray-400 dark:text-white/40">
            <span className="font-bold text-[#3B6D11]">
              {STATS.solicitudesHoyAprobadas} aprobadas
            </span>
            {" · "}
            {STATS.solicitudesHoyPendientes} pendientes
          </p>
        </div>

        {/* Combustible disponible */}
        <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
          <div className="absolute inset-x-0 top-0 h-0.75 bg-[#CC1A2E]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
            Combustible disponible
          </p>
          <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
            {STATS.combustibleTotalLitros.toLocaleString("es-CU")}
            <span className="text-[13px] font-medium text-gray-400"> L</span>
          </p>
          <p className="mt-1.5 text-[11px] text-gray-400 dark:text-white/40">
            <span className="font-bold text-[#CC1A2E]">
              ↓ {Math.abs(STATS.combustibleVariacion)}%
            </span>
            {" vs semana pasada"}
          </p>
        </div>

        {/* Asignaciones activas */}
        <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
          <div className="absolute inset-x-0 top-0 h-0.75 bg-[#BA7517]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
            Asignaciones activas
          </p>
          <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
            {STATS.asignacionesActivas}
          </p>
          <p className="mt-1.5 text-[11px] text-gray-400 dark:text-white/40">
            {STATS.asignacionesEnUso} en uso · {STATS.asignacionesAsignadas}{" "}
            asignadas
          </p>
        </div>

        {/* Rendimiento promedio */}
        <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#0e1a35]">
          <div className="absolute inset-x-0 top-0 h-0.75 bg-[#3B6D11]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
            Rendimiento promedio
          </p>
          <p className="mt-1 text-[24px] font-bold leading-none text-[#0e1f4d] dark:text-white">
            {STATS.rendimientoPromedio.toFixed(1)}
            <span className="text-[13px] font-medium text-gray-400"> km/L</span>
          </p>
          <p className="mt-1.5 text-[11px] text-gray-400 dark:text-white/40">
            Últimos 30 reportes
          </p>
        </div>
      </div>

      {/* Solicitudes por consejo + Recientes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader title="Solicitudes por consejo popular" />

          {/* Barras horizontales */}
          <div className="space-y-3">
            {SOLICITUDES_POR_CONSEJO.map((cp) => (
              <div
                key={cp.nombre}
                className="grid items-center gap-2"
                style={{ gridTemplateColumns: "90px 1fr 32px" }}
              >
                <p className="truncate text-right text-[11px] text-gray-400 dark:text-white/40">
                  {cp.nombre}
                </p>
                <div className="h-0.75 overflow-hidden rounded-full bg-black/6 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#1B3D8F]"
                    style={{
                      width: `${Math.round((cp.total / cp.maximo) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] font-bold text-[#0e1f4d] dark:text-white">
                  {cp.total}
                </p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Resumen de estados del mes */}
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
            Estado de solicitudes del mes
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-[#EAF3DE] py-2">
              <p className="text-[18px] font-bold text-[#3B6D11]">
                {RESUMEN_ESTADOS.aprobadas}
              </p>
              <p className="text-[10px] font-bold text-[#3B6D11]">Aprobadas</p>
            </div>
            <div className="rounded-lg bg-[#FAEEDA] py-2">
              <p className="text-[18px] font-bold text-[#854F0B]">
                {RESUMEN_ESTADOS.pendientes}
              </p>
              <p className="text-[10px] font-bold text-[#854F0B]">Pendientes</p>
            </div>
            <div className="rounded-lg bg-[#FCEBEB] py-2">
              <p className="text-[18px] font-bold text-[#A32D2D]">
                {RESUMEN_ESTADOS.rechazadas}
              </p>
              <p className="text-[10px] font-bold text-[#A32D2D]">Rechazadas</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Solicitudes recientes" action="Ver todas →" />
          <div className="space-y-2">
            {SOLICITUDES_RECIENTES.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-lg border border-black/5 bg-[#f0f3fa] px-2.5 py-2 dark:border-white/5 dark:bg-white/3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B3D8F] text-[10px] font-bold text-white">
                  {s.iniciales}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-[#0e1f4d] dark:text-white">
                    {s.codigo}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-white/40">
                    {TIPO_MAP[s.tipo]} · {s.consejo} · {s.litros}L
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${ESTADO_MAP[s.estado].className}`}
                >
                  {ESTADO_MAP[s.estado].label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Inventario + Flota + Actividad */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Inventario de combustible */}
        <Card>
          <CardHeader title="Inventario de combustible" />
          <div className="space-y-4">
            {INVENTARIO.map((inv) => {
              const nivel = NIVEL_MAP[inv.nivel];
              return (
                <div
                  key={inv.tipoCombustible}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      inv.nivel === "ok"
                        ? "bg-[#E6F1FB]"
                        : inv.nivel === "bajo"
                          ? "bg-[#FAEEDA]"
                          : "bg-[#FCEBEB]"
                    }`}
                  >
                    <Fuel
                      size={14}
                      className={
                        inv.nivel === "ok"
                          ? "text-[#185FA5]"
                          : inv.nivel === "bajo"
                            ? "text-[#854F0B]"
                            : "text-[#A32D2D]"
                      }
                    />
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
                        className={`h-full rounded-full ${nivel.bar}`}
                        style={{ width: `${inv.porcentaje}%` }}
                      />
                    </div>
                    <p className={`mt-1 text-[10px] font-bold ${nivel.text}`}>
                      {inv.porcentaje}% {nivel.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Flota de vehículos */}
        <Card>
          <CardHeader title="Flota de vehículos" />
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: "Disponibles",
                value: FLOTA.disponibles,
                color: "bg-[#EAF3DE]",
                text: "text-[#3B6D11]",
                sub: "listos para asignación",
              },
              {
                label: "En uso",
                value: FLOTA.enUso,
                color: "bg-[#E6F1FB]",
                text: "text-[#185FA5]",
                sub: "asignaciones activas",
              },
              {
                label: "Mantenimiento",
                value: FLOTA.mantenimiento,
                color: "bg-[#FAEEDA]",
                text: "text-[#854F0B]",
                sub: "fuera de servicio temp.",
              },
              {
                label: "Fuera servicio",
                value: FLOTA.fueraServicio,
                color: "bg-[#FCEBEB]",
                text: "text-[#A32D2D]",
                sub: "baja definitiva",
              },
            ].map((item) => (
              <div key={item.label} className={`rounded-lg p-3 ${item.color}`}>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wide ${item.text}`}
                >
                  {item.label}
                </p>
                <p className={`mt-1 text-[20px] font-bold ${item.text}`}>
                  {item.value}
                </p>
                <p className={`text-[10px] ${item.text} opacity-70`}>
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Actividad reciente */}
        <Card>
          <CardHeader title="Actividad reciente" />
          <div className="space-y-0">
            {ACTIVIDAD.map((a, i) => (
              <div key={a.id}>
                {i > 0 && <Separator />}
                <div className="flex items-start gap-2.5">
                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[a.color]}`}
                  />
                  <div>
                    <p className="text-[11px] text-gray-400 dark:text-white/50">
                      {a.texto}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-300 dark:text-white/25">
                      {a.tiempo}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
