import { prisma } from "../../config/prisma";
import { CreateVehiculoInput, UpdateVehiculoInput } from "./vehiculo.dto";

export const VehiculoService = {
  async findAll() {
    return await prisma.vehiculo.findMany({
      where: { activo: true },
      orderBy: { placa: "asc" },
      include: {
        tipoCombustible: { select: { id: true, nombre: true } },
        chofer: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
  },

  async findById(id: string) {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id, activo: true },
      include: {
        tipoCombustible: { select: { id: true, nombre: true, codigo: true } },
        chofer: {
          select: { id: true, nombre: true, apellidos: true, correo: true },
        },
      },
    });
    if (!vehiculo) throw new Error("Vehículo no encontrado o eliminado");
    return vehiculo;
  },

  async create(data: CreateVehiculoInput) {
    try {
      return await prisma.vehiculo.create({ data });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("La placa ya está registrada");
      if (error.code === "P2003")
        throw new Error("Tipo de combustible o chofer no existen");
      throw error;
    }
  },

  async update(id: string, data: UpdateVehiculoInput) {
    try {
      return await prisma.vehiculo.update({
        where: { id, activo: true },
        data: data, 
      });
    } catch (error: any) {
      if (error.code === "P2002") throw new Error("La placa ya está en uso");
      if (error.code === "P2025")
        throw new Error("Vehículo no encontrado o eliminado");
      if (error.code === "P2003")
        throw new Error("Tipo de combustible o chofer no existen");
      throw error;
    }
  },

  async softDelete(id: string) {
    try {
      return await prisma.vehiculo.update({
        where: { id, activo: true },
        data: { activo: false }, 
      });
    } catch (error: any) {
      if (error.code === "P2025")
        throw new Error("Vehículo no encontrado o ya eliminado");
      throw error;
    }
  },
};
