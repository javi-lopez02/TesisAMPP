import { prisma } from "../../config/prisma";
import { CreatePuntoRutaInput, UpdatePuntoRutaInput } from "./punto-ruta.dto";

export const PuntoRutaService = {
  async findByRuta(rutaId: string) {
    const ruta = await prisma.ruta.findUnique({
      where: { id: rutaId, activa: true },
      select: { id: true, activa: true },
    });
    if (!ruta) throw new Error("Ruta no encontrada o desactivada");

    const puntos = await prisma.puntoRuta.findMany({
      where: { rutaId },
      orderBy: { orden: "asc" },
      include: {
        consejoPopular: { select: { id: true, nombre: true } },
        circunscripcion: { select: { id: true, nombre: true } },
        zona: { select: { id: true, nombre: true } },
        cdr: { select: { id: true, numero: true, direccion: true } },
      },
    });

    return puntos.map((p) => ({
      ...p,
      coordenadasLat: p.coordenadasLat ?? null,
      coordenadasLng: p.coordenadasLng ?? null,
    }));
  },

  async findById(id: string) {
    const punto = await prisma.puntoRuta.findUnique({
      where: { id },
      include: {
        ruta: { select: { id: true, nombre: true, activa: true } },
        consejoPopular: { select: { id: true, nombre: true } },
        circunscripcion: { select: { id: true, nombre: true } },
        zona: { select: { id: true, nombre: true } },
        cdr: { select: { id: true, numero: true } },
      },
    });
    if (!punto) throw new Error("Punto de ruta no encontrado");
    return {
      ...punto,
      coordenadasLat: punto.coordenadasLat ?? null,
      coordenadasLng: punto.coordenadasLng ?? null,
    };
  },

  async create(data: CreatePuntoRutaInput) {
    // Validar que la ruta existe y está activa
    const ruta = await prisma.ruta.findUnique({
      where: { id: data.rutaId, activa: true },
    });
    if (!ruta) throw new Error("Ruta no encontrada o desactivada");

    try {
      return await prisma.puntoRuta.create({ data });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("Ya existe un punto con ese orden en esta ruta");
      if (error.code === "P2003")
        throw new Error("Referencia territorial o ruta inválida");
      throw error;
    }
  },

  async update(id: string, data: UpdatePuntoRutaInput) {
    try {
      return await prisma.puntoRuta.update({
        where: { id },
        data,
        include: { ruta: { select: { id: true, nombre: true } } },
      });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("Ya existe un punto con ese orden en esta ruta");
      if (error.code === "P2025")
        throw new Error("Punto de ruta no encontrado");
      throw error;
    }
  },

  async delete(id: string) {
    // PuntoRuta no tiene campo activo en el schema, se usa hard delete
    const exists = await prisma.puntoRuta.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new Error("Punto de ruta no encontrado");
    return await prisma.puntoRuta.delete({ where: { id } });
  },
};
