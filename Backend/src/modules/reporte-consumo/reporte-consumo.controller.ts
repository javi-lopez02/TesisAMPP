import { Request, Response, NextFunction } from "express";
import { ReporteConsumoService } from "./reporte-consumo.service";
import {
  createReporteSchema,
  updateReporteSchema,
} from "./reporte-consumo.dto";

export const ReporteConsumoController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { asignacionId, desde, hasta } = req.query;
      const reportes = await ReporteConsumoService.findAll({
        asignacionId: asignacionId as string,
        fechaDesde: desde ? new Date(desde as string) : undefined,
        fechaHasta: hasta ? new Date(hasta as string) : undefined,
      });
      res.json({ success: true, data: reportes });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reporte = await ReporteConsumoService.findById(
        req.params.id as string,
      );
      res.json({ success: true, data: reporte });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }
      const data = createReporteSchema.parse(req.body);
      const reporte = await ReporteConsumoService.create(data, req.usuario.id);
      res
        .status(201)
        .json({
          success: true,
          message: "Reporte registrado exitosamente",
          data: reporte,
        });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }
      const data = updateReporteSchema.parse(req.body);
      const reporte = await ReporteConsumoService.update(
        req.params.id as string,
        data,
        req.usuario.id,
      );
      res.json({ success: true, message: "Reporte actualizado", data: reporte });
    } catch (error) {
      next(error);
    }
  },

  // Endpoint analítico: KPIs por vehículo
  getKpisByVehiculo: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { desde, hasta } = req.query;
      const kpis = await ReporteConsumoService.getKpisByVehiculo(
        req.params.vehiculoId as string,
        desde ? new Date(desde as string) : undefined,
        hasta ? new Date(hasta as string) : undefined,
      );
      if (!kpis) {
        return res
          .status(404)
          .json({
            success: false,
            error: "No hay reportes para este vehículo",
          });
      }
      res.json({ success: true, data: kpis });
    } catch (error) {
      next(error);
    }
  },
};
