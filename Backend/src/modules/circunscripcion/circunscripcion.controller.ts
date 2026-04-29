import { Request, Response, NextFunction } from "express";
import { CircunscripcionService } from "./circunscripcion.service";
import { createCircunscripcionSchema, updateCircunscripcionSchema } from "./circunscripcion.dto";

export const CircunscripcionController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { consejoPopularId } = req.query;
      const circunscripciones = await CircunscripcionService.findAll(consejoPopularId as string);
      res.json({ success: true,  circunscripciones });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const circunscripcion = await CircunscripcionService.findById(req.params.id as string);
      res.json({ success: true,  circunscripcion });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createCircunscripcionSchema.parse(req.body);
      const circunscripcion = await CircunscripcionService.create(data);
      res.status(201).json({ 
        success: true, 
        message: "Circunscripción creada exitosamente", 
         circunscripcion 
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateCircunscripcionSchema.parse(req.body);
      const circunscripcion = await CircunscripcionService.update(req.params.id as string, data);
      res.json({ 
        success: true, 
        message: "Circunscripción actualizada exitosamente", 
         circunscripcion 
      });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await CircunscripcionService.softDelete(req.params.id as string);
      res.json({ success: true, message: "Circunscripción eliminada lógicamente" });
    } catch (error) {
      next(error);
    }
  },

  // Endpoint adicional: listar por Consejo Popular
  findByConsejoPopular: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const circunscripciones = await CircunscripcionService.findAll(req.params.consejoPopularId as string);
      res.json({ success: true,  circunscripciones });
    } catch (error) {
      next(error);
    }
  },
};