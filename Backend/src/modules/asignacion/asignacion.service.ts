import { prisma } from "../../config/prisma";
import { decimalToNumber } from "../../utils/decimal";
import { GetAsignacionesInput } from "./asignacion.dto";

export const AsignacionService = {
  /**
   * Listar asignaciones con filtros opcionales
   */
  async findAll(filters: GetAsignacionesInput) {
    const where: any = {};
    if (filters.estado) where.estado = filters.estado;
    if (filters.vehiculoId) where.vehiculoId = filters.vehiculoId;
    if (filters.responsableId) where.responsableId = filters.responsableId;
    if (filters.solicitudId) where.solicitudId = filters.solicitudId;

    if (filters.desde || filters.hasta) {
      where.fechaAsignacion = {
        ...(filters.desde && { gte: filters.desde }),
        ...(filters.hasta && { lte: filters.hasta }),
      };
    }

    const asignaciones = await prisma.asignacion.findMany({
      where,
      orderBy: { fechaAsignacion: "desc" },
      take: 100, // Límite por defecto para rendimiento
      include: {
        solicitud: true,
        vehiculo: true,
        tipoCombustible: true,
        responsable: true,
        ruta: true,
        movimiento: true,
        reporteConsumo: true,
      },
    });

    // Convertir Decimals a números para JSON seguro
    return asignaciones.map((a) => ({
      ...a,
      cantidadLitros: decimalToNumber(a.cantidadLitros),
      odometroInicial: decimalToNumber(a.odometroInicial),
      odometroFinal: a.odometroFinal ? decimalToNumber(a.odometroFinal) : null,
      ruta: a.ruta
        ? { ...a.ruta, distanciaTotal: decimalToNumber(a.ruta.distanciaTotal) }
        : null,
      movimiento: a.movimiento
        ? { ...a.movimiento, cantidad: decimalToNumber(a.movimiento.cantidad) }
        : null,
      reporteConsumo: a.reporteConsumo
        ? {
            ...a.reporteConsumo,
            rendimiento: decimalToNumber(a.reporteConsumo.rendimiento),
          }
        : null,
    }));
  },

  /**
   * Obtener una asignación específica con TODA la trazabilidad
   */
  async findById(id: string) {
    const asignacion = await prisma.asignacion.findUnique({
      where: { id },
      include: {
        solicitud: {
          select: {
            id: true,
            codigo: true,
            descripcion: true,
            actividad: true,
            estado: true,
          },
        },
        vehiculo: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
            estado: true,
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
        responsable: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            correo: true,
            rol: true,
          },
        },
        chofer: {
          select: { id: true, nombre: true, apellidos: true, correo: true },
        },
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
        movimiento: {
          select: {
            id: true,
            tipo: true,
            cantidad: true,
            saldoAnterior: true,
            saldoNuevo: true,
            observaciones: true,
            createdAt: true,
          },
        },
        reporteConsumo: {
          select: {
            id: true,
            codigo: true,
            consumoReal: true,
            kilometrajeRecorrido: true,
            rendimiento: true,
            observaciones: true,
            fechaReporte: true,
          },
        },
      },
    });

    if (!asignacion) throw new Error("Asignación no encontrada");

    return {
      ...asignacion,
      cantidadLitros: decimalToNumber(asignacion.cantidadLitros),
      odometroInicial: decimalToNumber(asignacion.odometroInicial),
      odometroFinal: asignacion.odometroFinal
        ? decimalToNumber(asignacion.odometroFinal)
        : null,
      ruta: asignacion.ruta
        ? {
            ...asignacion.ruta,
            distanciaTotal: decimalToNumber(asignacion.ruta.distanciaTotal),
            puntos: asignacion.ruta.puntos.map((p) => ({
              ...p,
            })),
          }
        : null,
      movimiento: asignacion.movimiento
        ? {
            ...asignacion.movimiento,
            cantidad: decimalToNumber(asignacion.movimiento.cantidad),
            saldoAnterior: decimalToNumber(asignacion.movimiento.saldoAnterior),
            saldoNuevo: decimalToNumber(asignacion.movimiento.saldoNuevo),
          }
        : null,
      reporteConsumo: asignacion.reporteConsumo
        ? {
            ...asignacion.reporteConsumo,
            consumoReal: decimalToNumber(asignacion.reporteConsumo.consumoReal),
            kilometrajeRecorrido: decimalToNumber(
              asignacion.reporteConsumo.kilometrajeRecorrido,
            ),
            rendimiento: decimalToNumber(asignacion.reporteConsumo.rendimiento),
          }
        : null,
    };
  },
};
