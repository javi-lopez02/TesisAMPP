import { Request, Response, NextFunction } from "express";
import { DelegaciaService } from "./delegancia.service";
import { createDelegaciaSchema, updateDelegaciaSchema } from "./delegancia.dto";

export const DelegaciaController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const delegacias = await DelegaciaService.findAll();
      res.json({ success: true, delegacias });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const delegacia = await DelegaciaService.findById(req.params.id as string);
      res.json({ success: true, delegacia });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createDelegaciaSchema.parse(req.body);
      const delegacia = await DelegaciaService.create(data);
      res.status(201).json({
        success: true,
        message: "Delegacia creada exitosamente",
        delegacia,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateDelegaciaSchema.parse(req.body);
      const delegacia = await DelegaciaService.update(req.params.id as string, data);
      res.json({
        success: true,
        message: "Delegacia actualizada exitosamente",
        delegacia,
      });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await DelegaciaService.softDelete(req.params.id as string);
      res.json({ success: true, message: "Delegacia eliminada lógicamente" });
    } catch (error) {
      next(error);
    }
  },

  // Endpoint adicional: listar por consejo popular
  findByConsejoPopular: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const delegacias = await DelegaciaService.findByConsejoPopular(
        req.params.consejoPopularId as string,
      );
      res.json({ success: true, delegacias });
    } catch (error) {
      next(error);
    }
  },
};
