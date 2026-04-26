import { prisma } from "../../config/prisma";
import {
  numberToDecimal,
  decimalToNumber,
  validateTankMovement,
} from "../../utils/decimal";
import {
  CreateMovimientoInput,
  UpdateMovimientoInput,
} from "./movimiento-tanque.dto";
import { TipoMovimiento } from "../../generated/prisma";

export const MovimientoTanqueService = {
  async findAll(tanqueId?: string, fechaDesde?: Date, fechaHasta?: Date) {
    const where: any = { activo: true }; // si agregas campo activo al modelo
    if (tanqueId) where.tanqueId = tanqueId;
    if (fechaDesde || fechaHasta) {
      where.createdAt = {
        ...(fechaDesde && { gte: fechaDesde }),
        ...(fechaHasta && { lte: fechaHasta }),
      };
    }

    const movimientos = await prisma.movimientoTanque.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tanque: { select: { id: true, nombre: true, tipoCombustibleId: true } },
        usuario: {
          select: { id: true, nombre: true, correo: true, rol: true },
        },
      },
      take: 100,
    });

    return movimientos.map((m) => ({
      ...m,
      cantidad: m.cantidad.toNumber(),
      saldoAnterior: m.saldoAnterior.toNumber(),
      saldoNuevo: m.saldoNuevo.toNumber(),
    }));
  },

  async findById(id: string) {
    const movimiento = await prisma.movimientoTanque.findUnique({
      where: { id },
      include: {
        tanque: {
          select: {
            id: true,
            nombre: true,
            capacidadTotal: true,
            capacidadActual: true,
          },
          include: {
            tipoCombustible: { select: { nombre: true, codigo: true } },
          },
        },
        usuario: { select: { id: true, nombre: true, correo: true } },
        asignacion: { select: { id: true, codigo: true, estado: true } },
      },
    });
    if (!movimiento) throw new Error("Movimiento no encontrado");

    return {
      ...movimiento,
      cantidad: movimiento.cantidad.toNumber(),
      saldoAnterior: movimiento.saldoAnterior.toNumber(),
      saldoNuevo: movimiento.saldoNuevo.toNumber(),
      tanque: {
        ...movimiento.tanque,
        capacidadTotal: movimiento.tanque.capacidadTotal.toNumber(),
        capacidadActual: movimiento.tanque.capacidadActual.toNumber(),
      },
    };
  },

  async create(data: CreateMovimientoInput, usuarioId: string) {
    // 1. Obtener el tanque con datos actuales
    const tanque = await prisma.tanqueCombustible.findUnique({
      where: { id: data.tanqueId, activo: true },
      select: {
        id: true,
        capacidadActual: true,
        capacidadTotal: true,
        tipoCombustibleId: true,
      },
    });
    if (!tanque) throw new Error("Tanque no encontrado o inactivo");

    // 2. Validar el movimiento según reglas de negocio
    const cantidad = numberToDecimal(data.cantidad);
    const saldoNuevoParam = data.saldoNuevo
      ? numberToDecimal(data.saldoNuevo)
      : undefined;

    const validacion = validateTankMovement(
      tanque.capacidadActual,
      tanque.capacidadTotal,
      cantidad,
      data.tipo as TipoMovimiento,
      saldoNuevoParam,
    );

    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    // 3. Crear el movimiento y actualizar el tanque en transacción
    return await prisma.$transaction(async (tx) => {
      // Crear registro de movimiento
      const movimiento = await tx.movimientoTanque.create({
        data: {
          tipo: data.tipo,
          cantidad: numberToDecimal(data.cantidad),
          saldoAnterior: tanque.capacidadActual,
          saldoNuevo: validacion.nuevoSaldo,
          observaciones: data.observaciones,
          tanqueId: data.tanqueId,
          usuarioId: usuarioId, // del usuario autenticado
        },
        include: {
          tanque: { select: { id: true, nombre: true } },
          usuario: { select: { id: true, nombre: true } },
        },
      });

      // Actualizar capacidad del tanque
      await tx.tanqueCombustible.update({
        where: { id: data.tanqueId },
        data: { capacidadActual: validacion.nuevoSaldo },
      });

      return {
        ...movimiento,
        cantidad: movimiento.cantidad.toNumber(),
        saldoAnterior: movimiento.saldoAnterior.toNumber(),
        saldoNuevo: movimiento.saldoNuevo.toNumber(),
      };
    });
  },

  async update(id: string, data: UpdateMovimientoInput) {
    // Solo permitir actualizar observaciones en movimientos recientes (< 24h)
    const movimiento = await prisma.movimientoTanque.findUnique({
      where: { id },
      include: {
        tanque: { select: { capacidadActual: true, capacidadTotal: true } },
      },
    });

    if (!movimiento) throw new Error("Movimiento no encontrado");

    // Validar tiempo para edición (24 horas)
    const horasTranscurridas =
      (Date.now() - movimiento.createdAt.getTime()) / (1000 * 60 * 60);
    if (horasTranscurridas > 24) {
      throw new Error(
        "Solo se pueden editar movimientos de las últimas 24 horas",
      );
    }

    return await prisma.movimientoTanque.update({
      where: { id },
      data: { observaciones: data.observaciones },
      include: {
        tanque: { select: { id: true, nombre: true } },
        usuario: { select: { id: true, nombre: true } },
      },
    });
  },

  async softDelete(id: string) {
    // Solo ADMINISTRADOR puede eliminar movimientos, y solo si no tiene asignaciones
    const movimiento = await prisma.movimientoTanque.findUnique({
      where: { id },
      include: { asignacion: true },
    });

    if (!movimiento) throw new Error("Movimiento no encontrado");
    if (movimiento.asignacion.length > 0) {
      throw new Error("No se puede eliminar: está vinculado a una asignación");
    }

    // Validar tiempo (solo eliminar si es muy reciente < 1 hora)
    const minutosTranscurridos =
      (Date.now() - movimiento.createdAt.getTime()) / (1000 * 60);
    if (minutosTranscurridos > 60) {
      throw new Error(
        "Solo se pueden eliminar movimientos creados en la última hora",
      );
    }

    // Revertir el saldo del tanque en transacción
    return await prisma.$transaction(async (tx) => {
      // Restaurar saldo anterior en el tanque
      await tx.tanqueCombustible.update({
        where: { id: movimiento.tanqueId },
        data: { capacidadActual: movimiento.saldoAnterior },
      });

      // "Eliminar" el movimiento (soft delete si agregas campo activo, o hard delete)
      return await tx.movimientoTanque.delete({ where: { id } });
    });
  },

  // Método útil: movimientos por tanque con paginación simple
  async findByTanque(tanqueId: string, limit: number = 50) {
    const movimientos = await prisma.movimientoTanque.findMany({
      where: { tanqueId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        usuario: { select: { id: true, nombre: true, rol: true } },
      },
    });

    return movimientos.map((m) => ({
      ...m,
      cantidad: m.cantidad.toNumber(),
      saldoAnterior: m.saldoAnterior.toNumber(),
      saldoNuevo: m.saldoNuevo.toNumber(),
    }));
  },
};
