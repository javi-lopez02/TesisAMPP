import { Request, Response, NextFunction } from "express";
import { MovimientoTanqueService } from "./movimiento-tanque.service";
import { createMovimientoSchema, updateMovimientoSchema } from "./movimiento-tanque.dto";

export const MovimientoTanqueController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tanqueId, desde, hasta } = req.query;
      const movimientos = await MovimientoTanqueService.findAll(
        tanqueId as string,
        desde ? new Date(desde as string) : undefined,
        hasta ? new Date(hasta as string) : undefined
      );
      res.json({ success: true,  movimientos });
    } catch (error) { next(error); }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const movimiento = await MovimientoTanqueService.findById(req.params.id as string);
      res.json({ success: true,  movimiento });
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }
      const data = createMovimientoSchema.parse(req.body);
      const movimiento = await MovimientoTanqueService.create(data, req.usuario.id);
      res.status(201).json({ success: true, message: "Movimiento registrado",  movimiento });
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data  = updateMovimientoSchema.parse(req.body);
      const movimiento = await MovimientoTanqueService.update(req.params.id as string, data);
      res.json({ success: true, message: "Movimiento actualizado",  movimiento });
    } catch (error) { next(error); }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await MovimientoTanqueService.softDelete(req.params.id as string);
      res.json({ success: true, message: "Movimiento eliminado" });
    } catch (error) { next(error); }
  },

  findByTanque: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const movimientos = await MovimientoTanqueService.findByTanque(req.params.tanqueId as string, limit);
      res.json({ success: true,  movimientos });
    } catch (error) { next(error); }
  },
};