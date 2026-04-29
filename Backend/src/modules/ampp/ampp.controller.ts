import { Request, Response, NextFunction } from "express";
import { AsambleaService } from "./ampp.service";
import { createAsambleaSchema, updateAsambleaSchema } from "./ampp.dto";

export const AsambleaController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asambleas = await AsambleaService.findAll();
      res.json({ success: true, asambleas });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asamblea = await AsambleaService.findById(req.params.id as string);
      res.json({ success: true, asamblea });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createAsambleaSchema.parse(req.body);
      const asamblea = await AsambleaService.create(data);
      res
        .status(201)
        .json({ success: true, message: "Asamblea creada", asamblea });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateAsambleaSchema.parse(req.body);
      const asamblea = await AsambleaService.update(
        req.params.id as string,
        data,
      );
      res.json({ success: true, message: "Asamblea actualizada", asamblea });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AsambleaService.softDelete(req.params.id as string);
      res.json({ success: true, message: "Asamblea eliminada lógicamente" });
    } catch (error) {
      next(error);
    }
  },
};
