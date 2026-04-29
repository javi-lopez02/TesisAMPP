import { Request, Response, NextFunction } from "express";
import { PuntoRutaService } from "./punto-ruta.service";
import { createPuntoRutaSchema, updatePuntoRutaSchema } from "./punto-ruta.dto";

export const PuntoRutaController = {
  findByRuta: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const puntos = await PuntoRutaService.findByRuta(
        req.params.rutaId as string,
      );
      res.json({ success: true, puntos });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const punto = await PuntoRutaService.findById(req.params.id as string);
      res.json({ success: true, punto });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createPuntoRutaSchema.parse(req.body);
      const punto = await PuntoRutaService.create(data);
      res.status(201).json({ success: true, message: "Punto creado", punto });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updatePuntoRutaSchema.parse(req.body);
      const punto = await PuntoRutaService.update(
        req.params.id as string,
        data,
      );
      res.json({ success: true, message: "Punto actualizado", punto });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PuntoRutaService.delete(req.params.id as string);
      res.json({ success: true, message: "Punto eliminado" });
    } catch (error) {
      next(error);
    }
  },
};
