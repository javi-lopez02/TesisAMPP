import { prisma } from "../../config/prisma";
import { TipoMovimientoCombustible } from "../../generated/prisma/enums";
import { decimalToNumber, numberToDecimal } from "../../utils/decimal";
import { CreateMovimientoCombustibleInput } from "./movimiento-combustible.dto";

export const MovimientoCombustibleService = {
  async findAll(
    filters: {
      asambleaId?: string;
      tipoCombustibleId?: string;
      tipo?: TipoMovimientoCombustible;
      desde?: Date;
      hasta?: Date;
    } = {},
  ) {
    const where: any = {};
    if (filters.asambleaId) where.asambleaId = filters.asambleaId;
    if (filters.tipoCombustibleId)
      where.tipoCombustibleId = filters.tipoCombustibleId;
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.desde || filters.hasta) {
      where.createdAt = {
        ...(filters.desde && { gte: filters.desde }),
        ...(filters.hasta && { lte: filters.hasta }),
      };
    }

    const movimientos = await prisma.movimientoCombustible.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        asamblea: { select: { id: true, nombre: true, codigo: true } },
        tipoCombustible: { select: { id: true, nombre: true, codigo: true } },
        usuario: {
          select: { id: true, nombre: true, apellidos: true, rol: true },
        },
      },
    });

    return movimientos.map((m) => ({
      ...m,
      cantidad: decimalToNumber(m.cantidad),
      saldoAnterior: decimalToNumber(m.saldoAnterior),
      saldoNuevo: decimalToNumber(m.saldoNuevo),
    }));
  },

  async findById(id: string) {
    const movimiento = await prisma.movimientoCombustible.findUnique({
      where: { id },
      include: {
        asamblea: {
          select: { id: true, nombre: true, servicentroNombre: true },
        },
        tipoCombustible: {
          select: { id: true, nombre: true, precioPorLitro: true },
        },
        usuario: {
          select: { id: true, nombre: true, correo: true, rol: true },
        },
        inventarioCombustible: { select: { id: true, saldoActual: true } },
        asignacions: { select: { id: true, codigo: true, estado: true } },
      },
    });
    if (!movimiento) throw new Error("Movimiento no encontrado");

    return {
      ...movimiento,
      cantidad: decimalToNumber(movimiento.cantidad),
      saldoAnterior: decimalToNumber(movimiento.saldoAnterior),
      saldoNuevo: decimalToNumber(movimiento.saldoNuevo),
      tipoCombustible: {
        ...movimiento.tipoCombustible,
        precioPorLitro: decimalToNumber(
          movimiento.tipoCombustible.precioPorLitro,
        ),
      },
      inventarioCombustible: movimiento.inventarioCombustible
        ? {
            ...movimiento.inventarioCombustible,
            saldoActual: decimalToNumber(
              movimiento.inventarioCombustible.saldoActual,
            ),
          }
        : null,
    };
  },

  async create(data: CreateMovimientoCombustibleInput, usuarioId: string) {
    return await prisma.$transaction(async (tx) => {
      let saldoAnterior = 0;
      let saldoNuevo = 0;
      let inventarioId: string | null = null;

      // 1. Si hay inventario asociado, validar y calcular saldos
      if (data.inventarioCombustibleId) {
        const inventario = await tx.inventarioCombustible.findUnique({
          where: { id: data.inventarioCombustibleId },
        });
        if (!inventario) throw new Error("Inventario no encontrado");
        if (
          inventario.asambleaId !== data.asambleaId ||
          inventario.tipoCombustibleId !== data.tipoCombustibleId
        ) {
          throw new Error(
            "El inventario no coincide con la Asamblea y Tipo de Combustible seleccionados",
          );
        }

        saldoAnterior = Number(inventario.saldoActual);
        inventarioId = inventario.id;

        // Determinar signo según tipo de movimiento
        let delta = data.cantidad;
        if (["ASIGNACION_SOLICITUD", "MERMA"].includes(data.tipo)) {
          delta = -delta; // Restan al inventario
        }
        // ASIGNACION_INICIAL, DEVOLUCION, AJUSTE -> suman (AJUSTE respeta signo de cantidad)

        saldoNuevo = saldoAnterior + delta;
        if (saldoNuevo < 0) {
          throw new Error(
            "Saldo insuficiente en inventario para esta operación",
          );
        }

        // Actualizar inventario atómicamente
        await tx.inventarioCombustible.update({
          where: { id: inventarioId },
          data: {
            saldoActual: numberToDecimal(saldoNuevo),
            fechaUltimaActualizacion: new Date(),
          },
        });
      } else {
        // Movimiento sin control de inventario (ej. registro histórico puro)
        saldoAnterior = 0;
        saldoNuevo = data.cantidad;
      }

      // 2. Crear registro del movimiento
      const movimiento = await tx.movimientoCombustible.create({
        data: {
          tipo: data.tipo,
          cantidad: numberToDecimal(data.cantidad),
          saldoAnterior: numberToDecimal(saldoAnterior),
          saldoNuevo: numberToDecimal(saldoNuevo),
          observaciones: data.observaciones,
          asambleaId: data.asambleaId,
          tipoCombustibleId: data.tipoCombustibleId,
          usuarioId,
          inventarioCombustibleId: inventarioId,
        },
        include: {
          asamblea: { select: { id: true, nombre: true } },
          tipoCombustible: { select: { id: true, nombre: true } },
          usuario: { select: { id: true, nombre: true } },
        },
      });

      return {
        ...movimiento,
        cantidad: decimalToNumber(movimiento.cantidad),
        saldoAnterior: decimalToNumber(movimiento.saldoAnterior),
        saldoNuevo: decimalToNumber(movimiento.saldoNuevo),
      };
    });
  },

  // ⚠️ NOTA: Los movimientos de combustible son registros históricos inmutables.
  // Se recomienda NO implementar update/softDelete para mantener trazabilidad contable.
  // Si es estrictamente necesario, se puede crear un endpoint de "anulación" que genere un movimiento inverso.
};
