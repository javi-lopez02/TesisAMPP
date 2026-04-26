import { Request, Response, NextFunction } from "express";
import { TanqueCombustibleService } from "./tanque-combustible.service";
import {
  createTanqueSchema,
  updateTanqueSchema,
} from "./tanque-combustible.dto";

export const TanqueCombustibleController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tanques = await TanqueCombustibleService.findAll();
      res.json({ success: true, tanques });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tanque = await TanqueCombustibleService.findById(
        req.params.id as string,
      );
      res.json({ success: true, tanque });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createTanqueSchema.parse(req.body);
      const tanque = await TanqueCombustibleService.create(data);
      res.status(201).json({ success: true, message: "Tanque creado", tanque });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateTanqueSchema.parse(req.body);
      const tanque = await TanqueCombustibleService.update(req.params.id as string, data);
      res.json({ success: true, message: "Tanque actualizado", tanque });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await TanqueCombustibleService.softDelete(req.params.id as string);
      res.json({ success: true, message: "Tanque eliminado lógicamente" });
    } catch (error) {
      next(error);
    }
  },

  findByTipo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tanques = await TanqueCombustibleService.findByTipoCombustible(
        req.params.tipoCombustibleId as string,
      );
      res.json({ success: true, tanques });
    } catch (error) {
      next(error);
    }
  },
};
