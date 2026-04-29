import { prisma } from "../../config/prisma";
import { decimalToNumber, numberToDecimal } from "../../utils/decimal";
import { CreateInventarioInput, UpdateInventarioInput } from "./inventario.dto";

export const InventarioService = {
  /**
   * Listar inventarios con filtros opcionales
   * @param asambleaId - Filtrar por Asamblea Municipal
   * @param tipoCombustibleId - Filtrar por Tipo de Combustible
   */
  async findAll(asambleaId?: string, tipoCombustibleId?: string) {
    const where: any = {};
    if (asambleaId) where.asambleaId = asambleaId;
    if (tipoCombustibleId) where.tipoCombustibleId = tipoCombustibleId;

    const inventarios = await prisma.inventarioCombustible.findMany({
      where,
      orderBy: { fechaUltimaActualizacion: "desc" },
      include: {
        asamblea: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            servicentroNombre: true,
          },
        },
        tipoCombustible: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            precioPorLitro: true,
          },
        },
        _count: {
          select: {
            movimientos: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // últimos 30 días
                },
              },
            },
          },
        },
      },
    });

    // Convertir Decimals a números para respuestas JSON seguras
    return inventarios.map((inv) => ({
      ...inv,
      cantidadAsignada: decimalToNumber(inv.cantidadAsignada),
      saldoActual: decimalToNumber(inv.saldoActual),
      tipoCombustible: {
        ...inv.tipoCombustible,
        precioPorLitro: decimalToNumber(inv.tipoCombustible.precioPorLitro),
      },
      // Incluir métrica derivada útil para el frontend
      porcentajeDisponible: inv.cantidadAsignada.gt(0)
        ? Number(inv.saldoActual.div(inv.cantidadAsignada).mul(100).toFixed(2))
        : 0,
    }));
  },

  /**
   * Obtener un inventario específico con detalles completos
   * @param id - UUID del inventario
   */
  async findById(id: string) {
    const inventario = await prisma.inventarioCombustible.findUnique({
      where: { id },
      include: {
        asamblea: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            servicentroNombre: true,
            servicentroDireccion: true,
            activo: true,
          },
        },
        tipoCombustible: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            precioPorLitro: true,
            activo: true,
          },
        },
        movimientos: {
          orderBy: { createdAt: "desc" },
          take: 10, // Últimos 10 movimientos para vista rápida
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellidos: true,
                rol: true,
              },
            },
            asignacions: {
              select: {
                id: true,
                codigo: true,
                estado: true,
                vehiculo: { select: { placa: true, marca: true } },
              },
            },
          },
        },
      },
    });

    if (!inventario) {
      throw new Error("Inventario de combustible no encontrado");
    }

    // Validar que las relaciones principales estén activas
    if (!inventario.asamblea.activo) {
      throw new Error("La Asamblea Municipal asociada está inactiva");
    }
    if (!inventario.tipoCombustible.activo) {
      throw new Error("El Tipo de Combustible asociado está inactivo");
    }

    // Transformar respuesta: Decimals → Numbers + métricas derivadas
    return {
      ...inventario,
      cantidadAsignada: decimalToNumber(inventario.cantidadAsignada),
      saldoActual: decimalToNumber(inventario.saldoActual),
      tipoCombustible: {
        ...inventario.tipoCombustible,
        precioPorLitro: decimalToNumber(
          inventario.tipoCombustible.precioPorLitro,
        ),
      },
      // Métricas útiles para dashboards
      consumoTotal: decimalToNumber(
        inventario.cantidadAsignada.sub(inventario.saldoActual),
      ),
      porcentajeDisponible: inventario.cantidadAsignada.gt(0)
        ? Number(
            inventario.saldoActual
              .div(inventario.cantidadAsignada)
              .mul(100)
              .toFixed(2),
          )
        : 0,
      // Transformar movimientos anidados
      movimientos: inventario.movimientos.map((mov) => ({
        ...mov,
        cantidad: decimalToNumber(mov.cantidad),
        saldoAnterior: decimalToNumber(mov.saldoAnterior),
        saldoNuevo: decimalToNumber(mov.saldoNuevo),
      })),
    };
  },

  async create(data: CreateInventarioInput) {
    // Validar unicidad: una asamblea solo puede tener un inventario por tipo de combustible
    const existing = await prisma.inventarioCombustible.findUnique({
      where: {
        asambleaId_tipoCombustibleId: {
          asambleaId: data.asambleaId,
          tipoCombustibleId: data.tipoCombustibleId,
        },
      },
    });
    if (existing)
      throw new Error(
        "Ya existe un inventario para esta combinación Asamblea + TipoCombustible",
      );

    // Validar referencias
    const [asamblea, tipo] = await Promise.all([
      prisma.asambleaMunicipal.findUnique({
        where: { id: data.asambleaId, activo: true },
      }),
      prisma.tipoCombustible.findUnique({
        where: { id: data.tipoCombustibleId, activo: true },
      }),
    ]);
    if (!asamblea || !tipo)
      throw new Error("Asamblea o Tipo de Combustible no encontrados");

    return await prisma.inventarioCombustible.create({
      data: {
        ...data,
        cantidadAsignada: numberToDecimal(data.cantidadAsignada),
        saldoActual: numberToDecimal(data.saldoActual),
      },
      include: {
        tipoCombustible: { select: { id: true, nombre: true, codigo: true } },
      },
    });
  },

  // Método crítico: actualizar saldo con validación de movimiento
  async actualizarSaldo(
    inventarioId: string,
    cantidad: number,
    tipo: "ENTRADA" | "SALIDA",
    movimientoId?: string,
  ) {
    return await prisma.$transaction(async (tx) => {
      const inventario = await tx.inventarioCombustible.findUnique({
        where: { id: inventarioId },
      });
      if (!inventario) throw new Error("Inventario no encontrado");

      const nuevoSaldo =
        tipo === "ENTRADA"
          ? inventario.saldoActual.add(numberToDecimal(cantidad))
          : inventario.saldoActual.sub(numberToDecimal(cantidad));

      if (nuevoSaldo.lt(0))
        throw new Error("Saldo insuficiente para esta operación");

      const actualizado = await tx.inventarioCombustible.update({
        where: { id: inventarioId },
        data: {
          saldoActual: nuevoSaldo,
          fechaUltimaActualizacion: new Date(),
          ...(movimientoId && {
            movimientos: { connect: { id: movimientoId } },
          }),
        },
      });

      return {
        ...actualizado,
        cantidadAsignada: actualizado.cantidadAsignada.toNumber(),
        saldoActual: actualizado.saldoActual.toNumber(),
      };
    });
  },

  async update(id: string, data: UpdateInventarioInput) {
    // 1. Verificar existencia
    const existing = await prisma.inventarioCombustible.findUnique({
      where: { id },
      select: { id: true, asambleaId: true, tipoCombustibleId: true },
    });
    if (!existing) throw new Error("Inventario no encontrado");

    // 2. Preparar payload convirtiendo números → Decimal
    const updateData: any = { ...data };
    if (data.cantidadAsignada !== undefined) {
      updateData.cantidadAsignada = numberToDecimal(data.cantidadAsignada);
    }
    if (data.saldoActual !== undefined) {
      updateData.saldoActual = numberToDecimal(data.saldoActual);
    }

    // 3. Ejecutar actualización
    try {
      const updated = await prisma.inventarioCombustible.update({
        where: { id },
        data: updateData,
        include: {
          asamblea: { select: { id: true, nombre: true, codigo: true } },
          tipoCombustible: { select: { id: true, nombre: true, codigo: true } },
        },
      });

      // 4. Retornar con Decimals convertidos a number
      return {
        ...updated,
        cantidadAsignada: decimalToNumber(updated.cantidadAsignada),
        saldoActual: decimalToNumber(updated.saldoActual),
        fechaUltimaActualizacion: updated.fechaUltimaActualizacion,
      };
    } catch (error: any) {
      if (error.code === "P2025") throw new Error("Inventario no encontrado");
      if (error.code === "P2002")
        throw new Error(
          "Ya existe un inventario para esta combinación Asamblea + Tipo de Combustible",
        );
      throw error;
    }
  },

  async getHistorialMovimientos(
    inventarioId: string,
    desde?: Date,
    hasta?: Date,
    limite: number = 50,
  ) {
    // 1. Validar que el inventario existe
    const exists = await prisma.inventarioCombustible.findUnique({
      where: { id: inventarioId },
      select: { id: true },
    });
    if (!exists) throw new Error("Inventario no encontrado");

    // 2. Construir filtros de fecha
    const where: any = { inventarioCombustibleId: inventarioId };
    if (desde || hasta) {
      where.createdAt = {
        ...(desde && { gte: desde }),
        ...(hasta && { lte: hasta }),
      };
    }

    // 3. Consultar movimientos
    const movimientos = await prisma.movimientoCombustible.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limite,
      include: {
        usuario: {
          select: { id: true, nombre: true, apellidos: true, rol: true },
        },
        tipoCombustible: { select: { id: true, nombre: true, codigo: true } },
      },
    });

    // 4. Transformar Decimals a números para JSON
    return movimientos.map((m) => ({
      id: m.id,
      tipo: m.tipo,
      cantidad: decimalToNumber(m.cantidad),
      saldoAnterior: decimalToNumber(m.saldoAnterior),
      saldoNuevo: decimalToNumber(m.saldoNuevo),
      observaciones: m.observaciones,
      createdAt: m.createdAt,
      usuario: m.usuario,
      tipoCombustible: m.tipoCombustible,
    }));
  },
};
