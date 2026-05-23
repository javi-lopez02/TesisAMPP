import { Request, Response, NextFunction } from "express";
import { AsignacionService } from "./asignacion.service";
import { getAsignacionesSchema } from "./asignacion.dto";

export const AsignacionController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = getAsignacionesSchema.parse(req.query);
      const asignaciones = await AsignacionService.findAll(filters);
      res.json({ success: true, data: asignaciones });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asignacion = await AsignacionService.findById(
        req.params.id as string,
      );
      res.json({ success: true, data: asignacion });
    } catch (error) {
      next(error);
    }
  },
};
