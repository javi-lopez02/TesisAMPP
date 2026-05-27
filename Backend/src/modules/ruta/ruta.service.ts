import { prisma } from "../../config/prisma";
import { numberToDecimal, decimalToNumber } from "../../utils/decimal";
import { CreateRutaInput, UpdateRutaInput } from "./ruta.dto";

export const RutaService = {
  async findAll() {
    return await prisma.ruta.findMany({
      where: { activa: true },
      orderBy: { nombre: "asc" },
      include: {
        _count: { select: { puntos: true, solicitudes: true } },
        puntos: {
          include: {
            consejoPopular: true,
            circunscripcion: true,
            zona: true,
            cdr: true,
          },
        },
      },
    });
  },

  async findById(id: string) {
    const ruta = await prisma.ruta.findUnique({
      where: { id, activa: true },
      include: {
        puntos: { orderBy: { orden: "asc" } },
        _count: { select: { asignaciones: true } },
      },
    });
    if (!ruta) throw new Error("Ruta no encontrada o desactivada");

    return {
      ...ruta,
      distanciaTotal: decimalToNumber(ruta.distanciaTotal),
      puntos: ruta.puntos.map((p) => ({
        ...p,
      })),
    };
  },

  async create(data: CreateRutaInput) {
    try {
      const ruta = await prisma.ruta.create({
        data: {
          ...data,
          distanciaTotal: numberToDecimal(data.distanciaTotal),
        },
      });
      return { ...ruta, distanciaTotal: decimalToNumber(ruta.distanciaTotal) };
    } catch (error) {
      throw error;
    }
  },

  async update(id: string, data: UpdateRutaInput) {
    try {
      const updateData: any = { ...data };
      if (data.distanciaTotal !== undefined) {
        updateData.distanciaTotal = numberToDecimal(data.distanciaTotal);
      }

      const ruta = await prisma.ruta.update({
        where: { id, activa: true },
        data: updateData,
      });
      return { ...ruta, distanciaTotal: decimalToNumber(ruta.distanciaTotal) };
    } catch (error: any) {
      if (error.code === "P2025")
        throw new Error("Ruta no encontrada o desactivada");
      throw error;
    }
  },
};
