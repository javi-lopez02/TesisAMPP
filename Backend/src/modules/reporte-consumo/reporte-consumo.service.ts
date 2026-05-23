import { prisma } from "../../config/prisma";
import { numberToDecimal, decimalToNumber } from "../../utils/decimal";
import { CreateReporteInput, UpdateReporteInput } from "./reporte-consumo.dto";

// Generador de código único: RPT-YYYYMMDD-XXX
const generateReportCode = async (): Promise<string> => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  // Contar reportes creados hoy para el consecutivo
  const count = await prisma.reporteConsumo.count({
    where: {
      createdAt: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    },
  });

  const consecutive = String(count + 1).padStart(3, "0");
  return `RPT-${dateStr}-${consecutive}`;
};

export const ReporteConsumoService = {
  async findAll(filters?: {
    asignacionId?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }) {
    const where: any = {};
    if (filters?.asignacionId) where.asignacionId = filters.asignacionId;
    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.fechaReporte = {
        ...(filters.fechaDesde && { gte: filters.fechaDesde }),
        ...(filters.fechaHasta && { lte: filters.fechaHasta }),
      };
    }

    const reportes = await prisma.reporteConsumo.findMany({
      where,
      orderBy: { fechaReporte: "desc" },
      include: {
        asignacion: {
          select: {
            id: true,
            codigo: true,
            estado: true,
            vehiculo: { select: { id: true, placa: true, marca: true } },
            responsable: {
              select: { id: true, nombre: true, apellidos: true },
            },
          },
        },
        usuario: { select: { id: true, nombre: true, rol: true } },
      },
    });

    return reportes.map((r) => ({
      ...r,
      consumoReal: decimalToNumber(r.consumoReal),
      kilometrajeRecorrido: decimalToNumber(r.kilometrajeRecorrido),
      rendimiento: decimalToNumber(r.rendimiento),
    }));
  },

  async findById(id: string) {
    const reporte = await prisma.reporteConsumo.findUnique({
      where: { id },
      include: {
        asignacion: {
          select: {
            id: true,
            codigo: true,
            estado: true,
            cantidadLitros: true,
            odometroInicial: true,
            odometroFinal: true,
            vehiculo: {
              select: {
                id: true,
                placa: true,
                marca: true,
                tipoCombustibleId: true,
              },
            },
            responsable: { select: { id: true, nombre: true, correo: true } },
            tipoCombustible: {
              select: { id: true, nombre: true, codigo: true },
            },
          },
        },
        usuario: {
          select: { id: true, nombre: true, apellidos: true, rol: true },
        },
      },
    });

    if (!reporte) throw new Error("Reporte de consumo no encontrado");

    return {
      ...reporte,
      consumoReal: decimalToNumber(reporte.consumoReal),
      kilometrajeRecorrido: decimalToNumber(reporte.kilometrajeRecorrido),
      rendimiento: decimalToNumber(reporte.rendimiento),
      asignacion: {
        ...reporte.asignacion,
        cantidadLitros: decimalToNumber(reporte.asignacion.cantidadLitros),
        odometroInicial: decimalToNumber(reporte.asignacion.odometroInicial),
        odometroFinal: reporte.asignacion.odometroFinal
          ? decimalToNumber(reporte.asignacion.odometroFinal)
          : null,
      },
    };
  },

  async create(data: CreateReporteInput, usuarioId: string) {
    // 1. Validar que la asignación existe y está en estado válido para reportar
    const asignacion = await prisma.asignacion.findUnique({
      where: { id: data.asignacionId },
      include: {
        vehiculo: { select: { id: true, estado: true } },
        reporteConsumo: true, // Verificar si ya tiene reporte
      },
    });

    if (!asignacion) throw new Error("Asignación no encontrada");
    if (asignacion.reporteConsumo) {
      throw new Error(
        "Esta asignación ya tiene un reporte de consumo registrado",
      );
    }
    if (!["EN_USO", "DEVUELTO"].includes(asignacion.estado)) {
      throw new Error(
        `No se puede reportar: la asignación está en estado "${asignacion.estado}"`,
      );
    }

    // 2. Calcular rendimiento si no se proporciona (km / litros)
    let rendimiento = data.rendimiento;
    if (rendimiento === undefined && data.consumoReal > 0) {
      rendimiento = data.kilometrajeRecorrido / data.consumoReal;
    }
    if (rendimiento === undefined) {
      throw new Error(
        "No se pudo calcular el rendimiento. Verifique los datos.",
      );
    }

    // 3. Generar código único
    const codigo = await generateReportCode();

    // 4. Crear reporte y actualizar asignación en transacción
    return await prisma.$transaction(async (tx) => {
      // Crear reporte
      const reporte = await tx.reporteConsumo.create({
        data: {
          codigo,
          consumoReal: numberToDecimal(data.consumoReal),
          kilometrajeRecorrido: numberToDecimal(data.kilometrajeRecorrido),
          rendimiento: numberToDecimal(rendimiento),
          observaciones: data.observaciones,
          asignacionId: data.asignacionId,
          usuarioId,
        },
        include: {
          asignacion: { select: { id: true, codigo: true } },
          usuario: { select: { id: true, nombre: true } },
        },
      });

      // Actualizar asignación: marcar como DEVUELTO y guardar odómetro final
      await tx.asignacion.update({
        where: { id: data.asignacionId },
        data: {
          estado: "DEVUELTO",
          fechaDevolucion: new Date(),
          odometroFinal: numberToDecimal(
            Number(asignacion.odometroInicial) + data.kilometrajeRecorrido,
          ),
        },
      });

      // Actualizar vehículo: actualizar kilometraje total si el nuevo es mayor
      const nuevoKilometraje =
        Number(asignacion.odometroInicial) + data.kilometrajeRecorrido;
      await tx.vehiculo.update({
        where: { id: asignacion.vehiculo.id },
        data: { kilometraje: numberToDecimal(nuevoKilometraje) },
      });

      return {
        ...reporte,
        consumoReal: decimalToNumber(reporte.consumoReal),
        kilometrajeRecorrido: decimalToNumber(reporte.kilometrajeRecorrido),
        rendimiento: decimalToNumber(reporte.rendimiento),
      };
    });
  },

  async update(id: string, data: UpdateReporteInput, usuarioId?: string) {
    // Validar que el reporte existe
    const existing = await prisma.reporteConsumo.findUnique({ where: { id } });
    if (!existing) throw new Error("Reporte no encontrado");

    // Opcional: solo permitir editar en las primeras 24h o por ADMIN
    if (usuarioId) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
      });
      const horasTranscurridas =
        (Date.now() - existing.createdAt.getTime()) / (1000 * 60 * 60);
      if (horasTranscurridas > 24 && usuario?.rol !== "ADMINISTRADOR") {
        throw new Error(
          "Solo se pueden editar reportes de las últimas 24 horas (o ser ADMIN)",
        );
      }
    }

    // Recalcular rendimiento si cambian consumo o kilometraje
    let updateData: any = { ...data };
    if (
      data.consumoReal !== undefined ||
      data.kilometrajeRecorrido !== undefined
    ) {
      const reporteActual = await prisma.reporteConsumo.findUnique({
        where: { id },
      });
      const consumo =
        data.consumoReal ?? decimalToNumber(reporteActual!.consumoReal);
      const km =
        data.kilometrajeRecorrido ??
        decimalToNumber(reporteActual!.kilometrajeRecorrido);
      if (consumo && km && consumo > 0) {
        updateData.rendimiento = numberToDecimal(km / consumo);
      }
    }
    if (data.consumoReal !== undefined)
      updateData.consumoReal = numberToDecimal(data.consumoReal);
    if (data.kilometrajeRecorrido !== undefined)
      updateData.kilometrajeRecorrido = numberToDecimal(
        data.kilometrajeRecorrido,
      );
    if (data.rendimiento !== undefined)
      updateData.rendimiento = numberToDecimal(data.rendimiento);

    const updated = await prisma.reporteConsumo.update({
      where: { id },
      data: updateData,
      include: {
        asignacion: { select: { id: true, codigo: true } },
        usuario: { select: { id: true, nombre: true } },
      },
    });

    return {
      ...updated,
      consumoReal: decimalToNumber(updated.consumoReal),
      kilometrajeRecorrido: decimalToNumber(updated.kilometrajeRecorrido),
      rendimiento: decimalToNumber(updated.rendimiento),
    };
  },

  // ⚠️ No hay softDelete: los reportes son registros históricos inmutables
  // Si se requiere anular, se puede crear un endpoint de "anulación" que genere un ajuste contable

  // 🔍 Métricas y reportes analíticos
  async getKpisByVehiculo(
    vehiculoId: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { asignacion: { vehiculoId } };
    if (fechaDesde || fechaHasta) {
      where.fechaReporte = {
        ...(fechaDesde && { gte: fechaDesde }),
        ...(fechaHasta && { lte: fechaHasta }),
      };
    }

    const reportes = await prisma.reporteConsumo.findMany({
      where,
      select: {
        rendimiento: true,
        consumoReal: true,
        kilometrajeRecorrido: true,
        fechaReporte: true,
      },
    });

    if (reportes.length === 0) return null;

    const avgRendimiento =
      reportes.reduce((sum, r) => sum + Number(r.rendimiento), 0) /
      reportes.length;
    const totalConsumo = reportes.reduce(
      (sum, r) => sum + Number(r.consumoReal),
      0,
    );
    const totalKm = reportes.reduce(
      (sum, r) => sum + Number(r.kilometrajeRecorrido),
      0,
    );

    return {
      vehiculoId,
      totalReportes: reportes.length,
      rendimientoPromedio: Number(avgRendimiento.toFixed(2)),
      consumoTotal: Number(totalConsumo.toFixed(2)),
      kilometrajeTotal: Number(totalKm.toFixed(2)),
      ultimoReporte: reportes[0].fechaReporte,
    };
  },
};
