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
        asamblea: true,
        tipoCombustible: true,
        usuario: true,
        inventarioCombustible: true,
        asignacions: true,
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
        asamblea: true,
        tipoCombustible: true,
        usuario: true,
        inventarioCombustible: true,
        asignacions: true,
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
      const { tipo, cantidad, observaciones, asambleaId, tipoCombustibleId } =
        data;

      // 🔹 1. Validar que tipoCombustible existe
      const tipoCombustible = await tx.tipoCombustible.findUnique({
        where: { id: tipoCombustibleId },
      });
      if (!tipoCombustible) {
        throw new Error("Tipo de combustible no encontrado");
      }

      // 🔹 2. Buscar inventario existente para esta combinación asamblea + tipoCombustible
      let inventario = await tx.inventarioCombustible.findFirst({
        where: {
          asambleaId,
          tipoCombustibleId,
        },
      });

      let saldoAnterior = 0;
      let saldoNuevo = 0;
      let inventarioId: string | null = null;

      // 🔹 3. Lógica según tipo de movimiento
      if (tipo === "ASIGNACION_INICIAL") {
        if (!inventario) {
          // ➕ CREAR nuevo inventario con saldo inicial
          inventario = await tx.inventarioCombustible.create({
            data: {
              asambleaId,
              tipoCombustibleId,
              cantidadAsignada: numberToDecimal(cantidad),
              saldoActual: numberToDecimal(cantidad),
              fechaUltimaActualizacion: new Date(),
            },
          });
          saldoAnterior = 0;
          saldoNuevo = cantidad;
        } else {
          // ➕ SUMAR al inventario existente
          saldoAnterior = decimalToNumber(inventario.saldoActual) || 0;
          saldoNuevo = saldoAnterior + cantidad;

          inventario = await tx.inventarioCombustible.update({
            where: { id: inventario.id },
            data: {
              cantidadAsignada: { increment: numberToDecimal(cantidad) },
              saldoActual: numberToDecimal(saldoNuevo),
              fechaUltimaActualizacion: new Date(),
            },
          });
        }
        inventarioId = inventario.id;
      } else {
        // 🔹 Para DEVOLUCION, AJUSTE, MERMA, ASIGNACION_SOLICITUD: el inventario DEBE existir
        if (!inventario) {
          throw new Error(
            `No se puede registrar "${tipo}": No existe inventario para este tipo de combustible en esta asamblea. ` +
              `Primero debe crear una "Asignación Inicial".`,
          );
        }

        saldoAnterior = decimalToNumber(inventario.saldoActual) || 0;
        inventarioId = inventario.id;

        // 🔹 Calcular nuevo saldo según tipo
        let delta = 0;
        switch (tipo) {
          case "DEVOLUCION":
            delta = cantidad; // Devolución suma al saldo
            break;
          case "AJUSTE":
            delta = cantidad; // Ajuste respeta el signo de cantidad (positivo o negativo)
            break;
          case "MERMA":
          case "ASIGNACION_SOLICITUD":
            delta = -cantidad; // Restan del saldo
            break;
        }

        saldoNuevo = saldoAnterior + delta;

        // Validar que no haya saldo negativo
        if (saldoNuevo < 0) {
          throw new Error(
            `Saldo insuficiente: ${saldoAnterior}L - ${Math.abs(delta)}L = ${saldoNuevo}L. ` +
              `No se puede realizar esta operación.`,
          );
        }

        // Actualizar inventario
        inventario = await tx.inventarioCombustible.update({
          where: { id: inventario.id },
          data: {
            saldoActual: numberToDecimal(saldoNuevo),
            fechaUltimaActualizacion: new Date(),
            // Opcional: actualizar cantidadAsignada solo para ciertos tipos
            // cantidadAsignada: tipo === "ASIGNACION_SOLICITUD" ? { increment: numberToDecimal(cantidad) } : undefined
          },
        });
      }

      // 🔹 4. Crear registro del movimiento (auditoría)
      const movimiento = await tx.movimientoCombustible.create({
        data: {
          tipo,
          cantidad: numberToDecimal(cantidad),
          saldoAnterior: numberToDecimal(saldoAnterior),
          saldoNuevo: numberToDecimal(saldoNuevo),
          observaciones,
          asambleaId,
          tipoCombustibleId,
          usuarioId,
          inventarioCombustibleId: inventarioId,
        },
        include: {
          asamblea: true,
          tipoCombustible: true,
          usuario: true,
          inventarioCombustible: true,
          asignacions: true,
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
