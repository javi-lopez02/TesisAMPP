import { Request, Response, NextFunction } from "express";
import { MovimientoCombustibleService } from "./movimiento-combustible.service";
import { createMovimientoCombustibleSchema } from "./movimiento-combustible.dto";

export const MovimientoCombustibleController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { asambleaId, tipoCombustibleId, tipo, desde, hasta } = req.query;
      const movimientos = await MovimientoCombustibleService.findAll({
        asambleaId: asambleaId as string,
        tipoCombustibleId: tipoCombustibleId as string,
        tipo: tipo as any,
        desde: desde ? new Date(desde as string) : undefined,
        hasta: hasta ? new Date(hasta as string) : undefined,
      });
      res.json({ success: true,  movimientos });
    } catch (error) { next(error); }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const movimiento = await MovimientoCombustibleService.findById(req.params.id as string);
      res.json({ success: true,  movimiento });
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }
      const data = createMovimientoCombustibleSchema.parse(req.body);
      const movimiento = await MovimientoCombustibleService.create(data, req.usuario.id);
      res.status(201).json({ success: true, message: "Movimiento registrado exitosamente",  movimiento });
    } catch (error) { next(error); }
  },
};