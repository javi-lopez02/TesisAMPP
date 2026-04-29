import { prisma } from "../../config/prisma";
import { CreateCdrInput, UpdateCdrInput } from "./cdr.dto";

export const CDRService = {
  async findAll(zonaId?: string) {
    const where: any = { activo: true };
    if (zonaId) where.zonaId = zonaId;

    return await prisma.cDR.findMany({
      where,
      orderBy: { numero: "asc" },
      include: {
        zona: { select: { id: true, nombre: true, codigo: true } },
        _count: { select: { puntoRutas: true } },
      },
    });
  },

  async findById(id: string) {
    const cdr = await prisma.cDR.findUnique({
      where: { id, activo: true },
      include: {
        zona: { select: { id: true, nombre: true, codigo: true } },
      },
    });
    if (!cdr) throw new Error("CDR no encontrado o eliminado");
    return cdr;
  },

  async create(data: CreateCdrInput) {
    const zona = await prisma.zona.findUnique({
      where: { id: data.zonaId, activo: true },
      select: { id: true },
    });
    if (!zona) throw new Error("Zona no encontrada o inactiva");

    try {
      return await prisma.cDR.create({ data });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El número de CDR ya está registrado");
      if (error.code === "P2003") throw new Error("Zona inválida");
      throw error;
    }
  },

  async update(id: string, data: UpdateCdrInput) {
    try {
      return await prisma.cDR.update({
        where: { id, activo: true },
        data: data,
        include: { zona: { select: { id: true, nombre: true } } },
      });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El número de CDR ya está en uso");
      if (error.code === "P2025")
        throw new Error("CDR no encontrado o eliminado");
      throw error;
    }
  },

  async softDelete(id: string) {
    const puntosActivos = await prisma.puntoRuta.count({
      where: { cdrId: id },
    });
    if (puntosActivos > 0)
      throw new Error(
        `No se puede eliminar: está vinculado a ${puntosActivos} puntos de ruta`,
      );

    return await prisma.cDR.update({ where: { id }, data: { activo: false } });
  },
};
