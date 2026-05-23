import { prisma } from "../../config/prisma";
import { numberToDecimal, decimalToNumber } from "../../utils/decimal";
import {
  CreateSolicitudInput,
  ApproveSolicitudInput,
  RejectSolicitudInput,
  CancelSolicitudInput,
} from "./solicitud.dto";
import {
  EstadoSolicitud,
  TipoMovimientoCombustible,
  EstadoAsignacion,
} from "../../generated/prisma/enums";

// Generador de código único: SOL-YYYYMMDD-XXX
const generateSolicitudCode = async (): Promise<string> => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.solicitud.count({
    where: {
      createdAt: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    },
  });
  const consecutive = String(count + 1).padStart(3, "0");
  return `SOL-${dateStr}-${consecutive}`;
};

export const SolicitudService = {
  // ── LISTAR ────────────────────────────────────────────────────
  async findAll(filters?: {
    estado?: EstadoSolicitud;
    usuarioId?: string;
    tipoCombustibleId?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }) {
    const where: any = {};
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters?.tipoCombustibleId)
      where.tipoCombustibleId = filters.tipoCombustibleId;
    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.fechaRequerida = {
        ...(filters.fechaDesde && { gte: filters.fechaDesde }),
        ...(filters.fechaHasta && { lte: filters.fechaHasta }),
      };
    }

    const solicitudes = await prisma.solicitud.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellidos: true, rol: true },
        },
        tipoCombustible: { select: { id: true, nombre: true, codigo: true } },
        consejoPopular: { select: { id: true, nombre: true, codigo: true } },
        circunscripcion: { select: { id: true, nombre: true, codigo: true } },
        ruta: {
          select: {
            id: true,
            nombre: true,
            distanciaTotal: true,
            puntos: {
              select: {
                id: true,
                orden: true,
                tipo: true,
                nombre: true,
                consejoPopular: { select: { nombre: true } },
                circunscripcion: { select: { nombre: true } },
              },
            },
          },
        },
        asignacion: {
          select: {
            id: true,
            codigo: true,
            estado: true,
            vehiculo: { select: { placa: true } },
          },
        },
      },
    });

    return solicitudes.map((s) => ({
      ...s,
      cantidadLitros: decimalToNumber(s.cantidadLitros),
      ruta: s.ruta
        ? { ...s.ruta, distanciaTotal: decimalToNumber(s.ruta.distanciaTotal) }
        : null,
    }));
  },

  async findById(id: string) {
    const solicitud = await prisma.solicitud.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, nombre: true, correo: true, rol: true },
        },
        tipoCombustible: {
          select: { id: true, nombre: true, precioPorLitro: true },
        },
        consejoPopular: { select: { id: true, nombre: true, codigo: true } },
        circunscripcion: { select: { id: true, nombre: true, codigo: true } },
        ruta: {
          include: {
            puntos: {
              orderBy: { orden: "asc" },
              include: {
                consejoPopular: { select: { nombre: true } },
                circunscripcion: { select: { nombre: true } },
                zona: { select: { nombre: true } },
                cdr: { select: { numero: true, direccion: true } },
              },
            },
          },
        },
        asignacion: {
          include: {
            vehiculo: {
              select: { id: true, placa: true, marca: true, estado: true },
            },
            responsable: { select: { id: true, nombre: true } },
          },
        },
      },
    });
    if (!solicitud) throw new Error("Solicitud no encontrada");

    return {
      ...solicitud,
      cantidadLitros: decimalToNumber(solicitud.cantidadLitros),
      ruta: solicitud.ruta
        ? {
            ...solicitud.ruta,
            distanciaTotal: decimalToNumber(solicitud.ruta.distanciaTotal),
          }
        : null,
    };
  },

  // ── CREAR SOLICITUD (con puntos de ruta) ──────────────────────
  async create(data: CreateSolicitudInput, usuarioId: string) {
    // Validar tipo de combustible
    const tipoComb = await prisma.tipoCombustible.findUnique({
      where: { id: data.tipoCombustibleId, activo: true },
    });
    if (!tipoComb)
      throw new Error("Tipo de combustible no encontrado o inactivo");

    // Validar jerarquía territorial si se proporciona
    if (data.consejoPopularId) {
      const cp = await prisma.consejoPopular.findUnique({
        where: { id: data.consejoPopularId, activo: true },
      });
      if (!cp) throw new Error("Consejo Popular no encontrado o inactivo");
    }
    if (data.circunscripcionId) {
      const circ = await prisma.circunscripcion.findUnique({
        where: { id: data.circunscripcionId, activo: true },
      });
      if (!circ) throw new Error("Circunscripción no encontrada o inactiva");
    }

    // Generar código único
    const codigo = await generateSolicitudCode();

    // Crear solicitud en estado PENDIENTE
    const solicitud = await prisma.solicitud.create({
      data: {
        codigo,
        descripcion: data.descripcion,
        actividad: data.actividad,
        tipoSolicitud: data.tipoSolicitud || "GENERAL",
        fechaRequerida: data.fechaRequerida,
        cantidadLitros: numberToDecimal(data.cantidadLitros),
        estado: "PENDIENTE",
        usuarioId,
        tipoCombustibleId: data.tipoCombustibleId,
        consejoPopularId: data.consejoPopularId,
        circunscripcionId: data.circunscripcionId,
      },
    });

    // 🔹 Crear Ruta y PuntosRuta asociados (se guardan pero no se activan hasta aprobación)
    if (data.puntosRuta.length > 0) {
      const ruta = await prisma.ruta.create({
        data: {
          nombre: `Ruta para ${codigo}`,
          descripcion: `Generada desde solicitud ${codigo}`,
          distanciaTotal: numberToDecimal(0), // Se calculará al aprobar si hay coordenadas
          activa: false, // Se activa al aprobar
        },
      });

      // Vincular ruta a la solicitud
      await prisma.solicitud.update({
        where: { id: solicitud.id },
        data: { rutaId: ruta.id },
      });

      // Crear puntos de ruta
      for (const punto of data.puntosRuta) {
        await prisma.puntoRuta.create({
          data: {
            orden: punto.orden,
            tipo: punto.tipo || "INTERMEDIO",
            nombre: punto.nombre,
            direccion: punto.direccion,
            coordenadasLat: punto.coordenadasLat,
            coordenadasLng: punto.coordenadasLng,
            rutaId: ruta.id,
            consejoPopularId: punto.consejoPopularId,
            circunscripcionId: punto.circunscripcionId,
            zonaId: punto.zonaId,
            cdrId: punto.cdrId,
          },
        });
      }
    }

    return await this.findById(solicitud.id);
  },

  // ── APROBAR: crea Ruta activa + Asignación + Movimiento de inventario ──
  async approve(id: string, data: ApproveSolicitudInput, aprobadorId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validar solicitud
      const solicitud = await tx.solicitud.findUnique({
        where: { id },
        include: { ruta: { include: { puntos: true } }, tipoCombustible: true },
      });
      if (!solicitud) throw new Error("Solicitud no encontrada");
      if (solicitud.estado !== "PENDIENTE") {
        throw new Error(
          `Solo se pueden aprobar solicitudes en estado PENDIENTE (actual: ${solicitud.estado})`,
        );
      }

      // 2. Validar inventario disponible
      const inventario = await tx.inventarioCombustible.findFirst({
        where: {
          tipoCombustibleId: solicitud.tipoCombustibleId,
        },
      });
      if (!inventario)
        throw new Error(
          "No hay inventario disponible para este tipo de combustible",
        );
      if (inventario.saldoActual.lt(solicitud.cantidadLitros)) {
        throw new Error(
          `Saldo insuficiente: disponible ${decimalToNumber(inventario.saldoActual)}L, solicitado ${decimalToNumber(solicitud.cantidadLitros)}L`,
        );
      }

      // 3. Activar/actualizar Ruta
      if (solicitud.ruta) {
        // Calcular distancia si hay coordenadas (simplificado)
        const distanciaEstimada = solicitud.ruta.puntos.length * 2.5; // km por punto (ejemplo)
        await tx.ruta.update({
          where: { id: solicitud.rutaId! },
          data: {
            activa: true,
            nombre: `Ruta ${solicitud.codigo}`,
            distanciaTotal: numberToDecimal(distanciaEstimada),
          },
        });
      }

      // 4. Crear Movimiento de Combustible (descontar del inventario)
      const movimiento = await tx.movimientoCombustible.create({
        data: {
          tipo: "ASIGNACION_SOLICITUD",
          cantidad: solicitud.cantidadLitros,
          saldoAnterior: inventario.saldoActual,
          saldoNuevo: inventario.saldoActual.sub(solicitud.cantidadLitros),
          observaciones: `Asignación para solicitud ${solicitud.codigo}`,
          asambleaId: inventario.asambleaId,
          tipoCombustibleId: solicitud.tipoCombustibleId,
          usuarioId: aprobadorId,
          inventarioCombustibleId: inventario.id,
        },
      });

      // 5. Actualizar inventario
      await tx.inventarioCombustible.update({
        where: { id: inventario.id },
        data: {
          saldoActual: movimiento.saldoNuevo,
          fechaUltimaActualizacion: new Date(),
        },
      });

      // 6. Crear Asignación
      const asignacion = await tx.asignacion.create({
        data: {
          codigo: `ASN-${solicitud.codigo.replace("SOL-", "")}`,
          cantidadLitros: solicitud.cantidadLitros,
          odometroInicial: numberToDecimal(0), // Se actualizará al reportar
          estado: "ASIGNADO",
          solicitudId: solicitud.id,
          vehiculoId: data.vehiculoId,
          tipoCombustibleId: solicitud.tipoCombustibleId,
          rutaId: solicitud.rutaId,
          asambleaId: inventario.asambleaId,
          responsableId: data.responsableId,
          choferId: data.choferId,
          movimientoId: movimiento.id,
        },
      });

      // 7. Actualizar estado de la solicitud
      const updated = await tx.solicitud.update({
        where: { id },
        data: {
          estado: "APROBADA",
          observaciones: data.observaciones,
        },
        include: {
          asignacion: {
            include: {
              vehiculo: { select: { placa: true } },
              movimiento: true,
            },
          },
          ruta: { include: { puntos: true } },
        },
      });

      return {
        ...updated,
        cantidadLitros: decimalToNumber(updated.cantidadLitros),
        asignacion: {
          ...updated.asignacion,
          cantidadLitros: decimalToNumber(updated.asignacion!.cantidadLitros),
          odometroInicial: decimalToNumber(updated.asignacion!.odometroInicial),
        },
      };
    });
  },

  // ── RECHAZAR ──────────────────────────────────────────────────
  async reject(id: string, data: RejectSolicitudInput, rechazadorId: string) {
    const solicitud = await prisma.solicitud.findUnique({ where: { id } });
    if (!solicitud) throw new Error("Solicitud no encontrada");
    if (solicitud.estado !== "PENDIENTE") {
      throw new Error(
        `Solo se pueden rechazar solicitudes en estado PENDIENTE`,
      );
    }

    const updated = await prisma.solicitud.update({
      where: { id },
      data: {
        estado: "RECHAZADA",
        observaciones: `Rechazado: ${data.motivo}`,
      },
    });

    // Registrar auditoría opcional
    await prisma.auditoria.create({
      data: {
        tabla: "Solicitud",
        registroId: id,
        accion: "ACTUALIZAR",
        datosAnteriores: { estado: solicitud.estado },
        datosNuevos: { estado: "RECHAZADA", observaciones: data.motivo },
        usuarioId: rechazadorId,
      },
    });

    return updated;
  },

  // ── CANCELAR (solo por creador o ADMIN) ───────────────────────
  async cancel(
    id: string,
    data: CancelSolicitudInput,
    userId: string,
    userRol: string,
  ) {
    const solicitud = await prisma.solicitud.findUnique({
      where: { id },
      select: {
        id: true,
        estado: true,
        usuarioId: true,
        asignacion: { select: { id: true, estado: true } },
      },
    });
    if (!solicitud) throw new Error("Solicitud no encontrada");

    // Validar permisos: creador o ADMIN
    if (solicitud.usuarioId !== userId && userRol !== "ADMINISTRADOR") {
      throw new Error("No tienes permiso para cancelar esta solicitud");
    }

    // Validar estado: solo PENDIENTE o APROBADA (antes de EN_PROCESO)
    if (!["PENDIENTE", "APROBADA"].includes(solicitud.estado)) {
      throw new Error(
        `No se puede cancelar: estado actual "${solicitud.estado}"`,
      );
    }

    // Si ya tiene asignación en EN_USO, no permitir cancelación
    if (solicitud.asignacion?.estado === "EN_USO") {
      throw new Error("No se puede cancelar: la asignación ya está en uso");
    }

    return await prisma.solicitud.update({
      where: { id },
      data: {
        estado: "CANCELADA",
        observaciones: `Cancelado por usuario: ${data.motivo}`,
      },
    });
  },

  // ── MÉTODOS AUXILIARES ────────────────────────────────────────

  // Obtener solicitudes de un usuario con sus estados
  async getByUsuario(usuarioId: string, estados?: EstadoSolicitud[]) {
    const where: any = { usuarioId };
    if (estados?.length) where.estado = { in: estados };

    return await prisma.solicitud.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tipoCombustible: { select: { nombre: true, codigo: true } },
        asignacion: {
          select: {
            id: true,
            estado: true,
            vehiculo: { select: { placa: true } },
          },
        },
      },
    });
  },

  // Validar si una solicitud puede ser editada (solo PENDIENTE y por su creador)
  canEdit(solicitud: any, userId: string): boolean {
    return solicitud.estado === "PENDIENTE" && solicitud.usuarioId === userId;
  },

  // Obtener transiciones permitidas para un estado
  getAvailableTransitions(
    estado: EstadoSolicitud,
    userId: string,
    solicitudUserId: string,
    userRol: string,
  ): string[] {
    const transitions: Record<EstadoSolicitud, string[]> = {
      PENDIENTE: ["APROBAR", "RECHAZAR", "CANCELAR"],
      APROBADA: ["EN_PROCESO", "CANCELAR"], // CANCELAR solo ADMIN o creador
      RECHAZADA: [],
      EN_PROCESO: ["COMPLETADA", "CANCELAR"],
      COMPLETADA: [],
      CANCELADA: [],
    };

    const allowed = transitions[estado] || [];

    // Filtrar CANCELAR por permisos
    return allowed.filter((action) => {
      if (action === "CANCELAR") {
        return userId === solicitudUserId || userRol === "ADMINISTRADOR";
      }
      return true;
    });
  },
};
