import { prisma } from "../../config/prisma";
import { numberToDecimal, decimalToNumber } from "../../utils/decimal";
import { CreateTanqueInput, UpdateTanqueInput } from "./tanque-combustible.dto";

export const TanqueCombustibleService = {
  async findAll() {
    const tanques = await prisma.tanqueCombustible.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: {
        tipoCombustible: { select: { id: true, nombre: true, codigo: true } },
        _count: { select: { movimientos: true } },
      },
    });

    return tanques.map((t) => ({
      ...t,
      capacidadTotal: t.capacidadTotal.toNumber(),
      capacidadActual: t.capacidadActual.toNumber(),
    }));
  },

  async findById(id: string) {
    const tanque = await prisma.tanqueCombustible.findUnique({
      where: { id, activo: true },
      include: {
        tipoCombustible: {
          select: { id: true, nombre: true, precioPorLitro: true },
        },
        movimientos: {
          where: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          }, // últimos 7 días
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            usuario: { select: { id: true, nombre: true, correo: true } },
          },
        },
      },
    });
    if (!tanque) throw new Error("Tanque no encontrado");

    return {
      ...tanque,
      capacidadTotal: tanque.capacidadTotal.toNumber(),
      capacidadActual: tanque.capacidadActual.toNumber(),
      tipoCombustible: {
        ...tanque.tipoCombustible,
        precioPorLitro: tanque.tipoCombustible.precioPorLitro.toNumber(),
      },
      movimientos: tanque.movimientos.map((m) => ({
        ...m,
        cantidad: m.cantidad.toNumber(),
        saldoAnterior: m.saldoAnterior.toNumber(),
        saldoNuevo: m.saldoNuevo.toNumber(),
      })),
    };
  },

  async create(data: CreateTanqueInput) {
    // Validar que capacidadActual <= capacidadTotal
    if (data.capacidadActual > data.capacidadTotal) {
      throw new Error(
        "La capacidad actual no puede exceder la capacidad total",
      );
    }

    // Validar que el tipo de combustible existe
    const tipo = await prisma.tipoCombustible.findUnique({
      where: { id: data.tipoCombustibleId, activo: true },
    });
    if (!tipo) throw new Error("Tipo de combustible no encontrado o inactivo");

    try {
      return await prisma.tanqueCombustible.create({
        data: {
          ...data,
          capacidadTotal: numberToDecimal(data.capacidadTotal),
          capacidadActual: numberToDecimal(data.capacidadActual),
        },
        include: { tipoCombustible: { select: { id: true, nombre: true } } },
      });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("Ya existe un tanque con este nombre");
      if (error.code === "P2003")
        throw new Error("Tipo de combustible no existe");
      throw error;
    }
  },

  async update(id: string, data: UpdateTanqueInput) {
    // Validar nueva capacidad si se cambia
    if (
      data.capacidadTotal !== undefined &&
      data.capacidadActual !== undefined
    ) {
      if (data.capacidadActual > data.capacidadTotal) {
        throw new Error(
          "La capacidad actual no puede exceder la capacidad total",
        );
      }
    }

    // Validar tipoCombustible si se cambia
    if (data.tipoCombustibleId) {
      const tipo = await prisma.tipoCombustible.findUnique({
        where: { id: data.tipoCombustibleId, activo: true },
      });
      if (!tipo) throw new Error("Tipo de combustible no encontrado");
    }

    try {
      const updateData: any = { ...data };
      if (data.capacidadTotal !== undefined)
        updateData.capacidadTotal = numberToDecimal(data.capacidadTotal);
      if (data.capacidadActual !== undefined)
        updateData.capacidadActual = numberToDecimal(data.capacidadActual);

      return await prisma.tanqueCombustible.update({
        where: { id, activo: true },
        data: updateData,
        include: { tipoCombustible: { select: { id: true, nombre: true } } },
      });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("Ya existe un tanque con este nombre");
      if (error.code === "P2025") throw new Error("Tanque no encontrado");
      if (error.code === "P2003")
        throw new Error("Tipo de combustible no existe");
      throw error;
    }
  },

  async softDelete(id: string) {
    // Validar que no tenga movimientos recientes o asignaciones activas
    const movimientos = await prisma.movimientoTanque.count({
      where: { tanqueId: id },
    });
    if (movimientos > 0) {
      throw new Error(
        `No se puede eliminar: tiene ${movimientos} movimientos registrados`,
      );
    }

    return await prisma.tanqueCombustible.update({
      where: { id },
      data: { activo: false },
    });
  },

  // Método útil: obtener tanques por tipo de combustible
  async findByTipoCombustible(tipoCombustibleId: string) {
    const tanques = await prisma.tanqueCombustible.findMany({
      where: { tipoCombustibleId, activo: true },
      orderBy: { nombre: "asc" },
      include: { tipoCombustible: { select: { id: true, nombre: true } } },
    });

    return tanques.map((t) => ({
      ...t,
      capacidadTotal: t.capacidadTotal.toNumber(),
      capacidadActual: t.capacidadActual.toNumber(),
    }));
  },
};
