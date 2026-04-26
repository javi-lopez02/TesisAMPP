import { Request, Response, NextFunction } from "express";
import { TipoCombustibleService } from "./tipo-combustible.service";
import {
  createTipoCombustibleSchema,
  updateTipoCombustibleSchema,
} from "./tipo-combustible.dto";

export const TipoCombustibleController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tipos = await TipoCombustibleService.findAll();
      res.json({ success: true, tipos });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tipo = await TipoCombustibleService.findById(
        req.params.id as string,
      );
      res.json({ success: true, tipo });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createTipoCombustibleSchema.parse(req.body);
      const tipo = await TipoCombustibleService.create(data);
      res
        .status(201)
        .json({ success: true, message: "Tipo de combustible creado", tipo });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateTipoCombustibleSchema.parse(req.body);
      const tipo = await TipoCombustibleService.update(
        req.params.id as string,
        data,
      );
      res.json({ success: true, message: "Actualizado", tipo });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await TipoCombustibleService.softDelete(req.params.id as string);
      res.json({ success: true, message: "Eliminado lógicamente" });
    } catch (error) {
      next(error);
    }
  },
};
