import { Request, Response, NextFunction } from "express";
import { RutaService } from "./ruta.service";
import { createRutaSchema, updateRutaSchema } from "./ruta.dto";

export const RutaController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rutas = await RutaService.findAll();
      res.json({ success: true, rutas });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ruta = await RutaService.findById(req.params.id as string);
      res.json({ success: true, ruta });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createRutaSchema.parse(req.body);
      const ruta = await RutaService.create(data);
      res.status(201).json({ success: true, message: "Ruta creada", ruta });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateRutaSchema.parse(req.body);
      const ruta = await RutaService.update(req.params.id as string, data);
      res.json({ success: true, message: "Ruta actualizada", ruta });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await RutaService.softDelete(req.params.id as string);
      res.json({ success: true, message: "Ruta desactivada" });
    } catch (error) {
      next(error);
    }
  },
};
