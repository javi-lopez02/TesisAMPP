import { prisma } from "../../config/prisma";
import { CreateConsejoInput, UpdateConsejoInput } from "./consejo-popular.dto";

export const ConsejoPopularService = {
  async findAll() {
    return await prisma.consejoPopular.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
  },

  async findById(id: string) {
    const consejo = await prisma.consejoPopular.findUnique({
      where: { id, activo: true },
    });
    if (!consejo) throw new Error("Consejo Popular no encontrado o eliminado");
    return consejo;
  },

  async create(data: CreateConsejoInput) {
    try {
      return await prisma.consejoPopular.create({ data });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El nombre o código ya existe");
      throw error;
    }
  },

  async update(id: string, data: UpdateConsejoInput) {
    try {
      return await prisma.consejoPopular.update({
        where: { id, activo: true },
        data,
      });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El nombre o código ya está en uso");
      if (error.code === "P2025")
        throw new Error("Consejo Popular no encontrado o eliminado");
      throw error;
    }
  },

  async softDelete(id: string) {
    try {
      return await prisma.consejoPopular.update({
        where: { id, activo: true },
        data: { activo: false },
      });
    } catch (error: any) {
      if (error.code === "P2025")
        throw new Error("Consejo Popular no encontrado o ya eliminado");
      throw error;
    }
  },
};
