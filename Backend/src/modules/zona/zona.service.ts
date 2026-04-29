import { prisma } from "../../config/prisma";
import { CreateZonaInput, UpdateZonaInput } from "./zona.dto";

export const ZonaService = {
  async findAll(circunscripcionId?: string) {
    const where: any = { activo: true };
    if (circunscripcionId) where.circunscripcionId = circunscripcionId;

    return await prisma.zona.findMany({
      where,
      orderBy: { nombre: "asc" },
      include: {
        circunscripcion: { select: { id: true, nombre: true, codigo: true } },
        _count: { select: { cdrs: true, puntoRutas: true } },
      },
    });
  },

  async findById(id: string) {
    const zona = await prisma.zona.findUnique({
      where: { id, activo: true },
      include: {
        circunscripcion: { select: { id: true, nombre: true, codigo: true } },
        cdrs: {
          where: { activo: true },
          select: { id: true, numero: true, direccion: true },
        },
      },
    });
    if (!zona) throw new Error("Zona no encontrada o eliminada");
    return zona;
  },

  async create(data: CreateZonaInput) {
    const circ = await prisma.circunscripcion.findUnique({
      where: { id: data.circunscripcionId, activo: true },
      select: { id: true },
    });
    if (!circ) throw new Error("Circunscripción no encontrada o inactiva");

    try {
      return await prisma.zona.create({ data });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El código ya está registrado");
      if (error.code === "P2003") throw new Error("Circunscripción inválida");
      throw error;
    }
  },

  async update(id: string, data: UpdateZonaInput) {
    try {
      return await prisma.zona.update({
        where: { id, activo: true },
        data: data,
        include: { circunscripcion: { select: { id: true, nombre: true } } },
      });
    } catch (error: any) {
      if (error.code === "P2002") throw new Error("El código ya está en uso");
      if (error.code === "P2025")
        throw new Error("Zona no encontrada o eliminada");
      throw error;
    }
  },

  async softDelete(id: string) {
    const cdrsActivos = await prisma.cDR.count({
      where: { zonaId: id, activo: true },
    });
    if (cdrsActivos > 0)
      throw new Error(
        `No se puede eliminar: tiene ${cdrsActivos} CDRs activos`,
      );

    return await prisma.zona.update({ where: { id }, data: { activo: false } });
  },
};
