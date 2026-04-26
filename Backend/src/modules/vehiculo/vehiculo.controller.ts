import { Request, Response, NextFunction } from "express";
import { VehiculoService } from "./vehiculo.service";
import { createVehiculoSchema, updateVehiculoSchema } from "./vehiculo.dto";

export const VehiculoController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vehiculos = await VehiculoService.findAll();
      res.json({ success: true, vehiculos });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vehiculo = await VehiculoService.findById(req.params.id as string);
      res.json({ success: true, vehiculo });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createVehiculoSchema.parse(req.body);
      const vehiculo = await VehiculoService.create(data);
      res
        .status(201)
        .json({ success: true, message: "Vehículo creado", vehiculo });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateVehiculoSchema.parse(req.body);
      const vehiculo = await VehiculoService.update(
        req.params.id as string,
        data,
      );
      res.json({ success: true, message: "Vehículo actualizado", vehiculo });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await VehiculoService.softDelete(req.params.id as string);
      res.json({ success: true, message: "Vehículo eliminado lógicamente" });
    } catch (error) {
      next(error);
    }
  },
};
