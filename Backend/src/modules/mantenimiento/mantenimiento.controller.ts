import { Request, Response, NextFunction } from "express";
import { MantenimientoService } from "./mantenimiento.service";
import {
  createMantenimientoSchema,
  updateMantenimientoSchema,
} from "./mantenimiento.dto";

export const MantenimientoController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { vehiculoId } = req.query;
      const mantenimientos = await MantenimientoService.findAll(
        vehiculoId as string,
      );
      res.json({ success: true, mantenimientos });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mantenimiento = await MantenimientoService.findById(
        req.params.id as string,
      );
      res.json({ success: true, mantenimiento });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createMantenimientoSchema.parse(req.body);
      const mantenimiento = await MantenimientoService.create(data);
      res
        .status(201)
        .json({
          success: true,
          message: "Mantenimiento registrado",
          mantenimiento,
        });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateMantenimientoSchema.parse(req.body);
      const mantenimiento = await MantenimientoService.update(
        req.params.id as string,
        data,
      );
      res.json({
        success: true,
        message: "Mantenimiento actualizado",
        mantenimiento,
      });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await MantenimientoService.softDelete(req.params.id as string);
      res.json({
        success: true,
        message: "Mantenimiento eliminado lógicamente",
      });
    } catch (error) {
      next(error);
    }
  },

  findByVehiculo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mantenimientos = await MantenimientoService.findByVehiculo(
        req.params.vehiculoId as string,
      );
      res.json({ success: true, mantenimientos });
    } catch (error) {
      next(error);
    }
  },
};
