import { Request, Response, NextFunction } from "express";
import { ZonaService } from "./zona.service";
import { createZonaSchema, updateZonaSchema } from "./zona.dto";

export const ZonaController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const zonas = await ZonaService.findAll(
        req.query.circunscripcionId as string,
      );
      res.json({ success: true, zonas });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const zona = await ZonaService.findById(req.params.id as string);
      res.json({ success: true, zona });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createZonaSchema.parse(req.body);
      const zona = await ZonaService.create(data);
      res.status(201).json({ success: true, message: "Zona creada", zona });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateZonaSchema.parse(req.body);
      const zona = await ZonaService.update(req.params.id as string, data);
      res.json({ success: true, message: "Zona actualizada", zona });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ZonaService.softDelete(req.params.id as string);
      res.json({ success: true, message: "Zona eliminada lógicamente" });
    } catch (error) {
      next(error);
    }
  },
};
