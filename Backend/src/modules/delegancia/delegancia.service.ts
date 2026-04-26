import { prisma } from "../../config/prisma";
import { CreateDelegaciaInput, UpdateDelegaciaInput } from "./delegancia.dto";

export const DelegaciaService = {
  async findAll() {
    return await prisma.delegacia.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: {
        consejoPopular: {
          select: { id: true, nombre: true, codigo: true },
        },
      },
    });
  },

  async findById(id: string) {
    const delegacia = await prisma.delegacia.findUnique({
      where: { id, activo: true },
      include: {
        consejoPopular: {
          select: { id: true, nombre: true, codigo: true, activo: true },
        },
      },
    });
    if (!delegacia) throw new Error("Delegacia no encontrada o eliminada");
    return delegacia;
  },

  async create(data: CreateDelegaciaInput) {
    // 1. Validar que el Consejo Popular existe y está activo
    const consejo = await prisma.consejoPopular.findUnique({
      where: { id: data.consejoPopularId, activo: true },
    });

    if (!consejo) {
      throw new Error(
        "El Consejo Popular especificado no existe o está inactivo",
      );
    }

    // 2. Crear la delegacia
    try {
      return await prisma.delegacia.create({
        data,
        include: {
          consejoPopular: { select: { id: true, nombre: true, codigo: true } },
        },
      });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El código ya está registrado");
      if (error.code === "P2003") throw new Error("Consejo Popular no existe");
      throw error;
    }
  },

  async update(id: string, data: UpdateDelegaciaInput) {
    // 1. Si se intenta cambiar el consejoPopularId, validar el nuevo
    if (data.consejoPopularId) {
      const consejo = await prisma.consejoPopular.findUnique({
        where: { id: data.consejoPopularId, activo: true },
      });
      if (!consejo) {
        throw new Error(
          "El Consejo Popular especificado no existe o está inactivo",
        );
      }
    }

    // 2. Actualizar
    try {
      return await prisma.delegacia.update({
        where: { id, activo: true },
        data: data, // ← Sintaxis explícita para evitar errores
        include: {
          consejoPopular: { select: { id: true, nombre: true, codigo: true } },
        },
      });
    } catch (error: any) {
      if (error.code === "P2002") throw new Error("El código ya está en uso");
      if (error.code === "P2025")
        throw new Error("Delegacia no encontrada o eliminada");
      if (error.code === "P2003") throw new Error("Consejo Popular no existe");
      throw error;
    }
  },

  async softDelete(id: string) {
    // Opcional: validar que no tenga usuarios activos asignados
    const delegacia = await prisma.delegacia.findUnique({
      where: { id, activo: true },
      include: { usuario: { where: { activo: true } } },
    });

    if (!delegacia) {
      throw new Error("Delegacia no encontrada o ya eliminada");
    }

    // Advertencia si tiene usuarios activos (no bloquea, solo informa)
    if (delegacia.usuario.length > 0) {
      console.warn(
        `⚠️ Delegacia '${delegacia.nombre}' tiene ${delegacia.usuario.length} usuarios activos`,
      );
    }

    return await prisma.delegacia.update({
      where: { id },
      data: { activo: false },
    });
  },

  // Método útil: listar delegacias por consejo popular
  async findByConsejoPopular(consejoPopularId: string) {
    // Validar que el consejo existe y está activo
    const consejo = await prisma.consejoPopular.findUnique({
      where: { id: consejoPopularId, activo: true },
    });
    if (!consejo) throw new Error("Consejo Popular no encontrado o inactivo");

    return await prisma.delegacia.findMany({
      where: { consejoPopularId, activo: true },
      orderBy: { nombre: "asc" },
    });
  },
};
