import { prisma } from "../../config/prisma";
import { numberToDecimal, decimalToNumber } from "../../utils/decimal";
import {
  CreateSolicitudInput,
  ApproveInput,
  RejectInput,
  CancelInput,
  GetSolicitudesInput,
} from "./solicitud.dto";
import {
  EstadoSolicitud,
  TipoMovimientoCombustible,
  Rol,
} from "../../generated/prisma/enums";

// ─────────────────────────────────────────────────────────────
// GENERADOR DE CÓDIGO ÚNICO: SOL-YYYYMMDD-XXX
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// VALIDACIÓN DE SALDO EN INVENTARIO
// ─────────────────────────────────────────────────────────────
const validateInventoryBalance = async (
  tipoCombustibleId: string,
  cantidadLitros: number,
  asambleaId?: string,
) => {
  // Buscar inventario activo para este tipo de combustible
  const inventario = await prisma.inventarioCombustible.findFirst({
    where: {
      tipoCombustibleId,
      asambleaId: asambleaId || undefined,
    },
    orderBy: { fechaUltimaActualizacion: "desc" },
  });

  if (!inventario) {
    throw new Error(
      `No hay inventario registrado para este tipo de combustible`,
    );
  }

  const saldoDisponible = Number(inventario.saldoActual);
  if (saldoDisponible < cantidadLitros) {
    throw new Error(
      `Saldo insuficiente: disponible ${saldoDisponible}L, solicitado ${cantidadLitros}L`,
    );
  }

  return inventario;
};

// ─────────────────────────────────────────────────────────────
// SERVICIO PRINCIPAL
// ─────────────────────────────────────────────────────────────
export const SolicitudService = {
  // 🔹 LISTAR con filtros
  async findAll(filters: GetSolicitudesInput) {
    const where: any = {};
    if (filters.estado) where.estado = filters.estado;
    if (filters.tipoSolicitud) where.tipoSolicitud = filters.tipoSolicitud;
    if (filters.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters.tipoCombustibleId)
      where.tipoCombustibleId = filters.tipoCombustibleId;

    if (filters.desde || filters.hasta) {
      where.fechaSolicitada = {
        ...(filters.desde && { gte: filters.desde }),
        ...(filters.hasta && { lte: filters.hasta }),
      };
    }

    const solicitudes = await prisma.solicitud.findMany({
      where,
      orderBy: { fechaSolicitada: "desc" },
      take: 100,
      include: {
        usuario: {
          select: { id: true, nombre: true, apellidos: true, rol: true },
        },
        tipoCombustible: { select: { id: true, nombre: true, codigo: true } },
        ruta: {
          include: {
            puntos: {
              include: {
                consejoPopular: true,
                circunscripcion: true,
                zona: true,
                cdr: true,
              },
              orderBy: { orden: "asc" },
              take: 5,
            },
          },
        },
        asignacion: { select: { id: true, estado: true, codigo: true } },
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

  // 🔹 CONSULTAR POR ID con trazabilidad completa
  async findById(id: string) {
    const solicitud = await prisma.solicitud.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            correo: true,
            rol: true,
          },
        },
        tipoCombustible: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            precioPorLitro: true,
          },
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
            vehiculo: { select: { placa: true, marca: true } },
            responsable: { select: { nombre: true, rol: true } },
            movimiento: { select: { tipo: true, cantidad: true } },
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

  // 🔹 CREAR: genera Ruta + PuntoRuta + Solicitud en transacción
  async create(data: CreateSolicitudInput, usuarioId: string) {
    // Validar que el usuario existe y está activo
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId, activo: true },
    });
    if (!usuario) throw new Error("Usuario no autorizado");

    // Validar tipo de combustible
    const tipoCombustible = await prisma.tipoCombustible.findUnique({
      where: { id: data.tipoCombustibleId, activo: true },
    });
    if (!tipoCombustible) throw new Error("Tipo de combustible no válido");

    // Validar que los puntos de ruta tengan entidades territoriales válidas
    for (const punto of data.puntosRuta) {
      const [cp, circ, zona, cdr] = await Promise.all([
        prisma.consejoPopular.findUnique({
          where: { id: punto.consejoPopularId, activo: true },
        }),
        prisma.circunscripcion.findUnique({
          where: { id: punto.circunscripcionId, activo: true },
        }),
        prisma.zona.findUnique({ where: { id: punto.zonaId, activo: true } }),
        prisma.cDR.findUnique({ where: { id: punto.cdrId, activo: true } }),
      ]);

      if (!cp)
        throw new Error(`Consejo Popular no válido en punto ${punto.orden}`);
      if (!circ)
        throw new Error(`Circunscripción no válida en punto ${punto.orden}`);
      if (!zona) throw new Error(`Zona no válida en punto ${punto.orden}`);
      if (!cdr) throw new Error(`CDR no válido en punto ${punto.orden}`);
    }

    // Generar código único
    const codigo = await generateSolicitudCode();

    return await prisma.$transaction(async (tx) => {
      // 1. Crear Ruta con datos EXACTOS del frontend
      const ruta = await tx.ruta.create({
        data: {
          nombre: `Ruta ${codigo}`,
          descripcion: data.descripcion,
          distanciaTotal: numberToDecimal(data.distanciaTotal), // ← Viene del frontend
          tiempoEstimado: data.tiempoEstimado, // ← Viene del frontend
          activa: true,
        },
      });

      // 2. Crear Puntos de Ruta
      for (const punto of data.puntosRuta) {
        await tx.puntoRuta.create({
          data: {
            orden: punto.orden,
            tipo:
              punto.tipo ||
              (punto.orden === 0
                ? "INICIO"
                : punto.orden === data.puntosRuta.length - 1
                  ? "DESTINO"
                  : "INTERMEDIO"),
            nombre: punto.nombre,
            direccion: punto.direccion,
            rutaId: ruta.id,
            consejoPopularId: punto.consejoPopularId,
            circunscripcionId: punto.circunscripcionId,
            zonaId: punto.zonaId,
            cdrId: punto.cdrId,
          },
        });
      }

      // 3. Crear Solicitud vinculada a la ruta (SIN consejoPopularId/circunscripcionId)
      const solicitud = await tx.solicitud.create({
        data: {
          codigo,
          descripcion: data.descripcion,
          actividad: data.actividad,
          tipoSolicitud: data.tipoSolicitud || "GENERAL",
          fechaRequerida: data.fechaRequerida,
          cantidadLitros: numberToDecimal(data.cantidadLitros),
          estado: "PENDIENTE",
          observaciones: data.observaciones || "",
          usuarioId,
          tipoCombustibleId: data.tipoCombustibleId,
          rutaId: ruta.id,
          // ← consejoPopularId y circunscripcionId ELIMINADO
        },
        include: {
          usuario: { select: { id: true, nombre: true, rol: true } },
          tipoCombustible: { select: { id: true, nombre: true } },
          ruta: { select: { id: true, nombre: true } },
        },
      });

      return {
        ...solicitud,
        cantidadLitros: decimalToNumber(solicitud.cantidadLitros),
      };
    });
  },

  // 🔹 APROBAR: valida inventario, crea Asignacion + Movimiento, actualiza saldo
  async approve(id: string, data: ApproveInput, aprobadorId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Obtener solicitud con validaciones
      const solicitud = await tx.solicitud.findUnique({
        where: { id },
        include: {
          ruta: { include: { puntos: { orderBy: { orden: "asc" } } } },
          tipoCombustible: true,
          usuario: { select: { id: true, nombre: true, rol: true } },
        },
      });

      if (!solicitud) throw new Error("Solicitud no encontrada");
      if (solicitud.estado !== "PENDIENTE") {
        throw new Error(
          `Solo se pueden aprobar solicitudes PENDIENTE (actual: ${solicitud.estado})`,
        );
      }

      // 2. Validar saldo en inventario
      const inventario = await validateInventoryBalance(
        solicitud.tipoCombustibleId,
        Number(solicitud.cantidadLitros),
      );

      // 3. Generar código de asignación
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const asignacionCount = await tx.asignacion.count({
        where: {
          createdAt: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lt: new Date(today.setHours(23, 59, 59, 999)),
          },
        },
      });
      const asignacionCodigo = `ASN-${dateStr}-${String(asignacionCount + 1).padStart(3, "0")}`;

      // 4. Seleccionar vehículo disponible del mismo tipo de combustible
      const vehiculo = await tx.vehiculo.findFirst({
        where: {
          tipoCombustibleId: solicitud.tipoCombustibleId,
          estado: "DISPONIBLE",
          activo: true,
        },
        orderBy: { kilometraje: "asc" },
      });
      if (!vehiculo) {
        throw new Error(
          "No hay vehículos disponibles para este tipo de combustible",
        );
      }

      // 5. Obtener asamblea por defecto (primera activa)
      const asamblea = await tx.asambleaMunicipal.findFirst({
        where: { activo: true },
      });
      if (!asamblea) throw new Error("No hay Asamblea Municipal configurada");

      // 6. Crear Movimiento de Combustible (descuento de inventario)
      const saldoAnterior = inventario.saldoActual;
      const cantidad = solicitud.cantidadLitros;
      const saldoNuevo = saldoAnterior.sub(cantidad);

      const movimiento = await tx.movimientoCombustible.create({
        data: {
          tipo: "ASIGNACION_SOLICITUD",
          cantidad,
          saldoAnterior,
          saldoNuevo,
          observaciones: `Asignación para ${solicitud.codigo}: ${solicitud.actividad}`,
          asambleaId: asamblea.id,
          tipoCombustibleId: solicitud.tipoCombustibleId,
          usuarioId: aprobadorId,
          inventarioCombustibleId: inventario.id,
        },
      });

      // 7. Crear Asignación
      await tx.asignacion.create({
        data: {
          codigo: asignacionCodigo,
          cantidadLitros: solicitud.cantidadLitros,
          odometroInicial: vehiculo.kilometraje,
          estado: "ASIGNADO",
          observaciones: solicitud.observaciones,
          solicitudId: solicitud.id,
          vehiculoId: vehiculo.id,
          tipoCombustibleId: solicitud.tipoCombustibleId,
          rutaId: solicitud.rutaId,
          asambleaId: asamblea.id,
          responsableId: aprobadorId,
          choferId: vehiculo.choferId,
          movimientoId: movimiento.id,
        },
      });

      // 8. Actualizar inventario
      await tx.inventarioCombustible.update({
        where: { id: inventario.id },
        data: {
          saldoActual: saldoNuevo,
          fechaUltimaActualizacion: new Date(),
        },
      });

      // 9. Actualizar estado de solicitud y vehículo
      await Promise.all([
        tx.solicitud.update({
          where: { id },
          data: {
            estado: "APROBADA",
            observaciones:
              solicitud.observaciones + ` | Aprobado: ${data.observaciones}`,
          },
        }),
        tx.vehiculo.update({
          where: { id: vehiculo.id },
          data: { estado: "EN_USO" },
        }),
      ]);

      // 10. Retornar solicitud con asignación creada
      const updated = await tx.solicitud.findUnique({
        where: { id },
        include: {
          asignacion: {
            include: {
              vehiculo: { select: { placa: true, marca: true } },
              movimiento: { select: { id: true, tipo: true, cantidad: true } },
            },
          },
        },
      });

      return {
        ...updated!,
        cantidadLitros: decimalToNumber(updated!.cantidadLitros),
      };
    });
  },

  // 🔹 RECHAZAR: solo cambia estado + registra motivo
  async reject(id: string, data: RejectInput, revisorId: string) {
    const solicitud = await prisma.solicitud.findUnique({ where: { id } });
    if (!solicitud) throw new Error("Solicitud no encontrada");
    if (solicitud.estado !== "PENDIENTE") {
      throw new Error(
        `Solo se pueden rechazar solicitudes PENDIENTE (actual: ${solicitud.estado})`,
      );
    }

    return await prisma.solicitud.update({
      where: { id },
      data: {
        estado: "RECHAZADA",
        observaciones: `${solicitud.observaciones} | Rechazado: ${data.motivo}`,
      },
      include: { usuario: { select: { nombre: true, correo: true } } },
    });
  },

  // 🔹 CANCELAR: solo el propietario puede cancelar solicitudes PENDIENTE
  async cancel(id: string, data: CancelInput, usuarioId: string) {
    const solicitud = await prisma.solicitud.findUnique({ where: { id } });
    if (!solicitud) throw new Error("Solicitud no encontrada");
    if (solicitud.usuarioId !== usuarioId) {
      throw new Error("Solo el solicitante puede cancelar esta solicitud");
    }
    if (solicitud.estado !== "PENDIENTE") {
      throw new Error(
        `Solo se pueden cancelar solicitudes PENDIENTE (actual: ${solicitud.estado})`,
      );
    }

    return await prisma.solicitud.update({
      where: { id },
      data: {
        estado: "CANCELADA",
        observaciones: `${solicitud.observaciones} | Cancelado por usuario: ${data.motivo}`,
      },
    });
  },

  // 🔹 MÉTODOS ADICIONALES PARA FLUJO OPERATIVO
  async markInProcess(id: string, operadorId: string) {
    const solicitud = await prisma.solicitud.findUnique({ where: { id } });
    if (!solicitud || solicitud.estado !== "APROBADA") {
      throw new Error("Solo solicitudes APROBADAS pueden pasar a EN_PROCESO");
    }
    return await prisma.solicitud.update({
      where: { id },
      data: { estado: "EN_PROCESO" },
    });
  },

  async markCompleted(id: string, operadorId: string) {
    const solicitud = await prisma.solicitud.findUnique({ where: { id } });
    if (!solicitud || solicitud.estado !== "EN_PROCESO") {
      throw new Error(
        "Solo solicitudes EN_PROCESO pueden marcarse como COMPLETADA",
      );
    }
    return await prisma.solicitud.update({
      where: { id },
      data: { estado: "COMPLETADA" },
    });
  },
};
