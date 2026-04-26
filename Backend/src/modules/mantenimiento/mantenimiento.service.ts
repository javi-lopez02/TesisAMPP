import { prisma } from "../../config/prisma";
import { numberToDecimal } from "../../utils/decimal";
import {
  CreateMantenimientoInput,
  UpdateMantenimientoInput,
} from "./mantenimiento.dto";

export const MantenimientoService = {
  async findAll(vehiculoId?: string) {
    const where: any = { activo: true };
    if (vehiculoId) where.vehiculoId = vehiculoId;

    const mantenimientos = await prisma.mantenimiento.findMany({
      where,
      orderBy: { fecha: "desc" },
      include: {
        vehiculo: {
          select: { id: true, placa: true, marca: true, kilometraje: true },
        },
      },
    });

    return mantenimientos.map((m) => ({
      ...m,
      costo: m.costo.toNumber(),
      kilometraje: m.kilometraje.toNumber(),
      vehiculo: {
        ...m.vehiculo,
        kilometraje: m.vehiculo.kilometraje.toNumber(),
      },
    }));
  },

  async findById(id: string) {
    const mantenimiento = await prisma.mantenimiento.findUnique({
      where: { id, activo: true },
      include: {
        vehiculo: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
            estado: true,
          },
        },
      },
    });
    if (!mantenimiento)
      throw new Error("Mantenimiento no encontrado o eliminado");

    return {
      ...mantenimiento,
      costo: mantenimiento.costo.toNumber(),
      kilometraje: mantenimiento.kilometraje.toNumber(),
    };
  },

  async create(data: CreateMantenimientoInput) {
    // 1. Validar vehículo
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: data.vehiculoId, activo: true },
      select: { id: true, kilometraje: true },
    });
    if (!vehiculo) throw new Error("Vehículo no encontrado o inactivo");

    // 2. Validar lógica de negocio (fecha no futura)
    if (data.fecha > new Date()) {
      throw new Error("La fecha del mantenimiento no puede ser futura");
    }

    try {
      const mantenimiento = await prisma.mantenimiento.create({
        data: {
          ...data,
          costo: numberToDecimal(data.costo),
          kilometraje: numberToDecimal(data.kilometraje),
        },
        include: { vehiculo: { select: { id: true, placa: true } } },
      });

      // 3. Opcional: Actualizar kilometraje del vehículo si el registro es mayor
      if (data.kilometraje > vehiculo.kilometraje.toNumber()) {
        await prisma.vehiculo.update({
          where: { id: data.vehiculoId },
          data: { kilometraje: numberToDecimal(data.kilometraje) },
        });
      }

      return {
        ...mantenimiento,
        costo: mantenimiento.costo.toNumber(),
        kilometraje: mantenimiento.kilometraje.toNumber(),
      };
    } catch (error: any) {
      if (error.code === "P2003") throw new Error("Vehículo no válido");
      throw error;
    }
  },

  async update(id: string, data: UpdateMantenimientoInput) {
    // Validar fecha si se cambia
    if (data.fecha && data.fecha > new Date()) {
      throw new Error("La fecha no puede ser futura");
    }

    try {
      const updateData: any = { ...data };
      if (data.costo !== undefined)
        updateData.costo = numberToDecimal(data.costo);
      if (data.kilometraje !== undefined)
        updateData.kilometraje = numberToDecimal(data.kilometraje);

      const mantenimiento = await prisma.mantenimiento.update({
        where: { id, activo: true },
        data: updateData,
        include: { vehiculo: { select: { id: true, placa: true } } },
      });

      return {
        ...mantenimiento,
        costo: mantenimiento.costo.toNumber(),
        kilometraje: mantenimiento.kilometraje.toNumber(),
      };
    } catch (error: any) {
      if (error.code === "P2025")
        throw new Error("Mantenimiento no encontrado o eliminado");
      throw error;
    }
  },

  async softDelete(id: string) {
    return await prisma.mantenimiento.update({
      where: { id },
      data: { activo: false },
    });
  },

  async findByVehiculo(vehiculoId: string) {
    const mantenimientos = await prisma.mantenimiento.findMany({
      where: { vehiculoId, activo: true },
      orderBy: { fecha: "desc" },
      include: { vehiculo: { select: { id: true, placa: true } } },
    });

    return mantenimientos.map((m) => ({
      ...m,
      costo: m.costo.toNumber(),
      kilometraje: m.kilometraje.toNumber(),
    }));
  },
};
