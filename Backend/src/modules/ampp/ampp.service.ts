import { prisma } from "../../config/prisma";
import { CreateAsambleaInput, UpdateAsambleaInput } from "./ampp.dto";

export const AsambleaService = {
  async findAll() {
    return await prisma.asambleaMunicipal.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: {
        _count: { select: { inventarios: true, movimientosCombustible: true } },
      },
    });
  },

  async findById(id: string) {
    const asamblea = await prisma.asambleaMunicipal.findUnique({
      where: { id, activo: true },
      include: {
        inventarios: {
          include: {
            tipoCombustible: {
              select: { id: true, nombre: true, codigo: true },
            },
          },
        },
        _count: { select: { asignacions: true } },
      },
    });
    if (!asamblea)
      throw new Error("Asamblea Municipal no encontrada o inactiva");
    return asamblea;
  },

  async create(data: CreateAsambleaInput) {
    try {
      return await prisma.asambleaMunicipal.create({ data });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El código ya está registrado");
      throw error;
    }
  },

  async update(id: string, data: UpdateAsambleaInput) {
    try {
      return await prisma.asambleaMunicipal.update({
        where: { id, activo: true },
        data,
      });
    } catch (error: any) {
      if (error.code === "P2002") throw new Error("El código ya está en uso");
      if (error.code === "P2025")
        throw new Error("Asamblea Municipal no encontrada o inactiva");
      throw error;
    }
  },

  async softDelete(id: string) {
    const inventarios = await prisma.inventarioCombustible.count({
      where: { asambleaId: id },
    });
    if (inventarios > 0) {
      throw new Error(
        `No se puede eliminar: tiene ${inventarios} inventarios vinculados`,
      );
    }

    return await prisma.asambleaMunicipal.update({
      where: { id },
      data: { activo: false },
    });
  },
};
