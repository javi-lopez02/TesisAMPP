import { prisma } from "../../config/prisma";
import {
  CreateCircunscripcionInput,
  UpdateCircunscripcionInput,
} from "./circunscripcion.dto";

export const CircunscripcionService = {
  async findAll(consejoPopularId?: string) {
    const where: any = { activo: true };
    if (consejoPopularId) where.consejoPopularId = consejoPopularId;

    return await prisma.circunscripcion.findMany({
      where,
      orderBy: { codigo: "asc" },
      include: {
        consejoPopular: { select: { id: true, nombre: true, codigo: true } },
        delegado: {
          select: { id: true, nombre: true, apellidos: true, correo: true },
        },
        _count: { select: { zonas: true, solicituds: true } },
      },
    });
  },

  async findById(id: string) {
    const circ = await prisma.circunscripcion.findUnique({
      where: { id, activo: true },
      include: {
        consejoPopular: { select: { id: true, nombre: true } },
        delegado: { select: { id: true, nombre: true, rol: true } },
        zonas: {
          where: { activo: true },
          select: { id: true, nombre: true, codigo: true },
        },
      },
    });
    if (!circ) throw new Error("Circunscripción no encontrada o eliminada");
    return circ;
  },

  async create(data: CreateCircunscripcionInput) {
    // Validar Consejo Popular
    const consejo = await prisma.consejoPopular.findUnique({
      where: { id: data.consejoPopularId, activo: true },
    });
    if (!consejo) throw new Error("Consejo Popular no encontrado o inactivo");

    // Validar que el delegado exista y tenga rol DELEGADO si se asigna
    if (data.delegadoId) {
      const delegado = await prisma.usuario.findUnique({
        where: { id: data.delegadoId, activo: true, rol: "DELEGADO" },
      });
      if (!delegado)
        throw new Error(
          "El delegado asignado no existe, no está activo o no tiene rol DELEGADO",
        );
    }

    try {
      return await prisma.circunscripcion.create({ data });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El código ya está registrado");
      if (error.code === "P2003")
        throw new Error("Referencia a Consejo Popular o Delegado inválida");
      throw error;
    }
  },

  async update(id: string, data: UpdateCircunscripcionInput) {
    if (data.delegadoId) {
      const delegado = await prisma.usuario.findUnique({
        where: { id: data.delegadoId, activo: true, rol: "DELEGADO" },
      });
      if (!delegado) throw new Error("El delegado asignado no es válido");
    }

    try {
      return await prisma.circunscripcion.update({
        where: { id, activo: true },
        data: data,
      });
    } catch (error: any) {
      if (error.code === "P2002") throw new Error("El código ya está en uso");
      if (error.code === "P2025")
        throw new Error("Circunscripción no encontrada");
      throw error;
    }
  },

  async softDelete(id: string) {
    // Validar que no tenga zonas activas
    const zonasActivas = await prisma.zona.count({
      where: { circunscripcionId: id, activo: true },
    });
    if (zonasActivas > 0) {
      throw new Error(
        `No se puede eliminar: tiene ${zonasActivas} zonas activas`,
      );
    }
    return await prisma.circunscripcion.update({
      where: { id },
      data: { activo: false },
    });
  },
};
