import { Request, Response, NextFunction } from "express";
import { ConsejoPopularService } from "./consejo-popular.service";
import { createConsejoSchema, updateConsejoSchema } from "./consejo-popular.dto";

export const ConsejoPopularController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const consejos = await ConsejoPopularService.findAll();
      res.json({ success: true,  consejos });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const consejo = await ConsejoPopularService.findById(req.params.id as string);
      res.json({ success: true,  consejo });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data  = createConsejoSchema.parse(req.body);
      const consejo = await ConsejoPopularService.create(data);
      res.status(201).json({ success: true, message: "Creado exitosamente",  consejo });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data  = updateConsejoSchema.parse(req.body);
      const consejo = await ConsejoPopularService.update(req.params.id as string, data);
      res.json({ success: true, message: "Actualizado exitosamente",  consejo });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ConsejoPopularService.softDelete(req.params.id as string);
      res.json({ success: true, message: "Eliminado lógicamente" });
    } catch (error) {
      next(error);
    }
  },
};