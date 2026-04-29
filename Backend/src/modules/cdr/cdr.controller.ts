import { Request, Response, NextFunction } from "express";
import { CDRService } from "./cdr.service";
import { createCdrSchema, updateCdrSchema } from "./cdr.dto";

export const CDRController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cdrs = await CDRService.findAll(req.query.zonaId as string);
      res.json({ success: true, cdrs });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cdr = await CDRService.findById(req.params.id as string);
      res.json({ success: true, cdr });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createCdrSchema.parse(req.body);
      const cdr = await CDRService.create(data);
      res.status(201).json({ success: true, message: "CDR creado", cdr });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateCdrSchema.parse(req.body);
      const cdr = await CDRService.update(req.params.id as string, data);
      res.json({ success: true, message: "CDR actualizado", cdr });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await CDRService.softDelete(req.params.id as string);
      res.json({ success: true, message: "CDR eliminado lógicamente" });
    } catch (error) {
      next(error);
    }
  },
};
