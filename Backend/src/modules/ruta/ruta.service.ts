import { prisma } from "../../config/prisma";
import { numberToDecimal, decimalToNumber } from "../../utils/decimal";
import { CreateRutaInput, UpdateRutaInput } from "./ruta.dto";

export const RutaService = {
  async findAll() {
    return await prisma.ruta.findMany({
      where: { activa: true },
      orderBy: { nombre: "asc" },
      include: { _count: { select: { puntos: true, solicituds: true } } },
    });
  },

  async findById(id: string) {
    const ruta = await prisma.ruta.findUnique({
      where: { id, activa: true },
      include: {
        puntos: { orderBy: { orden: "asc" } },
        _count: { select: { asignacions: true } },
      },
    });
    if (!ruta) throw new Error("Ruta no encontrada o desactivada");

    return {
      ...ruta,
      distanciaTotal: decimalToNumber(ruta.distanciaTotal),
      puntos: ruta.puntos.map((p) => ({
        ...p,
        coordenadasLat: p.coordenadasLat ?? null,
        coordenadasLng: p.coordenadasLng ?? null,
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

  async softDelete(id: string) {
    // Validar que no tenga solicitudes en proceso o asignaciones activas
    const [solicitudesActivas, asignacionesActivas] = await Promise.all([
      prisma.solicitud.count({
        where: { rutaId: id, estado: { in: ["APROBADA", "EN_PROCESO"] } },
      }),
      prisma.asignacion.count({
        where: { rutaId: id, estado: { in: ["ASIGNADO", "EN_USO"] } },
      }),
    ]);

    if (solicitudesActivas > 0 || asignacionesActivas > 0) {
      throw new Error(
        "No se puede desactivar: tiene solicitudes o asignaciones en curso",
      );
    }

    return await prisma.ruta.update({ where: { id }, data: { activa: false } });
  },
};
