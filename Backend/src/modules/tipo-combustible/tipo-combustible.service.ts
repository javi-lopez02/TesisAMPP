import { prisma } from "../../config/prisma";
import { numberToDecimal } from "../../utils/decimal";
import {
  CreateTipoCombustibleInput,
  UpdateTipoCombustibleInput,
} from "./tipo-combustible.dto";

export const TipoCombustibleService = {
  async findAll() {
    const tipos = await prisma.tipoCombustible.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: {
        tanques: {
          where: { activo: true },
          select: {
            id: true,
            nombre: true,
            capacidadActual: true,
            capacidadTotal: true,
          },
        },
        vehiculos: {
          where: { activo: true },
          select: { id: true, placa: true, marca: true },
        },
      },
    });

    // Convertir Decimals a números para JSON
    return tipos.map((t) => ({
      ...t,
      precioPorLitro: t.precioPorLitro.toNumber(),
      tanques: t.tanques.map((tk) => ({
        ...tk,
        capacidadActual: tk.capacidadActual.toNumber(),
        capacidadTotal: tk.capacidadTotal.toNumber(),
      })),
    }));
  },

  async findById(id: string) {
    const tipo = await prisma.tipoCombustible.findUnique({
      where: { id, activo: true },
      include: {
        tanques: { where: { activo: true } },
        vehiculos: {
          where: { activo: true },
          select: { id: true, placa: true },
        },
      },
    });
    if (!tipo) throw new Error("Tipo de combustible no encontrado");

    return {
      ...tipo,
      precioPorLitro: tipo.precioPorLitro.toNumber(),
      tanques: tipo.tanques.map((tk) => ({
        ...tk,
        capacidadActual: tk.capacidadActual.toNumber(),
        capacidadTotal: tk.capacidadTotal.toNumber(),
      })),
    };
  },

  async create(data: CreateTipoCombustibleInput) {
    try {
      return await prisma.tipoCombustible.create({
        data: {
          ...data,
          precioPorLitro: numberToDecimal(data.precioPorLitro),
        },
      });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El nombre o código ya existe");
      throw error;
    }
  },

  async update(id: string, data: UpdateTipoCombustibleInput) {
    try {
      const updateData: any = { ...data };
      if (data.precioPorLitro !== undefined) {
        updateData.precioPorLitro = numberToDecimal(data.precioPorLitro);
      }

      return await prisma.tipoCombustible.update({
        where: { id, activo: true },
        data: updateData,
      });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new Error("El nombre o código ya está en uso");
      if (error.code === "P2025")
        throw new Error("Tipo de combustible no encontrado");
      throw error;
    }
  },

  async softDelete(id: string) {
    // Validar que no tenga tanques activos
    const tanquesActivos = await prisma.tanqueCombustible.count({
      where: { tipoCombustibleId: id, activo: true },
    });
    if (tanquesActivos > 0) {
      throw new Error(
        `No se puede eliminar: tiene ${tanquesActivos} tanques activos asignados`,
      );
    }

    return await prisma.tipoCombustible.update({
      where: { id },
      data: { activo: false },
    });
  },
};
