import { prisma } from "../../config/prisma";
import { hashPassword } from "../../utils/password";
import { CreateUsuarioInput, UpdateUsuarioInput, ListUsuariosInput } from "./usuario.dto";

// Helper para excluir contraseña de respuestas
const excludePassword = (usuario: any) => {
  const { contrasenia, ...rest } = usuario;
  return rest;
};

export const UsuarioService = {
  async findAll(filters: ListUsuariosInput) {
    const where: any = {};
    if (filters.rol) where.rol = filters.rol;
    if (filters.activo !== undefined) where.activo = filters.activo;
    
    if (filters.busqueda) {
      where.OR = [
        { nombre: { contains: filters.busqueda, mode: "insensitive" } },
        { apellidos: { contains: filters.busqueda, mode: "insensitive" } },
        { correo: { contains: filters.busqueda, mode: "insensitive" } },
      ];
    }

    return await prisma.usuario.findMany({
      where,
      orderBy: { nombre: "asc" },
      select: {
        id: true, correo: true, nombre: true, apellidos: true,
        rol: true, activo: true, createdAt: true, updatedAt: true,
        consejoPopularPresidente: { select: { id: true, nombre: true } },
        circunscripcionDelegado: { select: { id: true, nombre: true } },
      },
    });
  },

  async findById(id: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        consejoPopularPresidente: { select: { id: true, nombre: true, codigo: true } },
        circunscripcionDelegado: { select: { id: true, nombre: true, codigo: true } },
      },
    });
    if (!usuario) throw new Error("Usuario no encontrado");
    return excludePassword(usuario);
  },

  async create( data: CreateUsuarioInput) {
    const existing = await prisma.usuario.findUnique({ where: { correo: data.correo } });
    if (existing) throw new Error("El correo ya está registrado");

    const contraseniaHash = await hashPassword(data.contrasenia);
    return await prisma.usuario.create({
       data: { ...data, contrasenia: contraseniaHash },
      select: { id: true, correo: true, nombre: true, apellidos: true, rol: true, activo: true, createdAt: true },
    });
  },

  async update(id: string, data: UpdateUsuarioInput) {
    const updateData: any = { ...data };
    if (data.contrasenia) {
      updateData.contrasenia = await hashPassword(data.contrasenia);
    }

    try {
      const updated = await prisma.usuario.update({
        where: { id },
        data: updateData,
        select: { id: true, correo: true, nombre: true, apellidos: true, rol: true, activo: true, updatedAt: true },
      });
      return updated;
    } catch (error: any) {
      if (error.code === "P2002") throw new Error("El correo ya está en uso");
      if (error.code === "P2025") throw new Error("Usuario no encontrado");
      throw error;
    }
  },

  async softDelete(id: string, currentUserId?: string) {
    if (currentUserId === id) {
      throw new Error("No puedes desactivar tu propio usuario");
    }
    return await prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: { id: true, activo: true },
    });
  },
};