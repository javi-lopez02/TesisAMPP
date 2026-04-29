import { prisma } from "../../config/prisma";
import { numberToDecimal, decimalToNumber } from "../../utils/decimal";
import {
  CreateTipoCombustibleInput,
  UpdateTipoCombustibleInput,
} from "./tipo-combustible.dto";

export const TipoCombustibleService = {
  async findAll() {
    const tipos = await prisma.tipoCombustible.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: {
            vehiculos: { where: { activo: true } },
            inventarioCombustibles: true,
            movimientoCombustibles: true,
            solicituds: true,
            asignacions: true,
          },
        },
      },
    });

    return tipos.map((t) => ({
      ...t,
      precioPorLitro: decimalToNumber(t.precioPorLitro),
    }));
  },

  async findById(id: string) {
    const tipo = await prisma.tipoCombustible.findUnique({
      where: { id, activo: true },
      include: {
        vehiculos: {
          where: { activo: true },
          select: { id: true, placa: true, marca: true, estado: true },
        },
        inventarioCombustibles: {
          include: {
            asamblea: { select: { id: true, nombre: true, codigo: true } },
          },
        },
      },
    });
    if (!tipo) throw new Error("Tipo de combustible no encontrado o eliminado");

    return {
      ...tipo,
      precioPorLitro: decimalToNumber(tipo.precioPorLitro),
    };
  },

  async create(data: CreateTipoCombustibleInput) {
    try {
      const tipo = await prisma.tipoCombustible.create({
        data: {
          ...data,
          precioPorLitro: numberToDecimal(data.precioPorLitro),
        },
      });
      return { ...tipo, precioPorLitro: decimalToNumber(tipo.precioPorLitro) };
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El nombre o código ya existe");
      throw error;
    }
  },

  async update(id: string, data: UpdateTipoCombustibleInput) {
    try {
      const updateData: any = { ...data };
      if (data.precioPorLitro !== undefined) {
        updateData.precioPorLitro = numberToDecimal(data.precioPorLitro);
      }

      const tipo = await prisma.tipoCombustible.update({
        where: { id, activo: true },
        data: updateData,
      });
      return { ...tipo, precioPorLitro: decimalToNumber(tipo.precioPorLitro) };
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El nombre o código ya está en uso");
      if (error.code === "P2025")
        throw new Error("Tipo de combustible no encontrado o eliminado");
      throw error;
    }
  },

  async softDelete(id: string) {
    // Validar relaciones activas antes de permitir la eliminación lógica
    const [vehiculosActivos, inventarios, solicitudesActivas] =
      await Promise.all([
        prisma.vehiculo.count({
          where: { tipoCombustibleId: id, activo: true },
        }),
        prisma.inventarioCombustible.count({
          where: { tipoCombustibleId: id },
        }),
        prisma.solicitud.count({
          where: {
            tipoCombustibleId: id,
            estado: { in: ["PENDIENTE", "APROBADA", "EN_PROCESO"] },
          },
        }),
      ]);

    if (vehiculosActivos > 0)
      throw new Error(
        `No se puede eliminar: tiene ${vehiculosActivos} vehículos activos asignados`,
      );
    if (inventarios > 0)
      throw new Error(
        `No se puede eliminar: tiene ${inventarios} registros de inventario vinculados`,
      );
    if (solicitudesActivas > 0)
      throw new Error(
        `No se puede eliminar: tiene ${solicitudesActivas} solicitudes en proceso`,
      );

    return await prisma.tipoCombustible.update({
      where: { id },
      data: { activo: false },
    });
  },
};
