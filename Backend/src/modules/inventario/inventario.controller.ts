import { Request, Response, NextFunction } from "express";
import { InventarioService } from "./inventario.service";
import {
  createInventarioSchema,
  updateInventarioSchema,
} from "./inventario.dto";

export const InventarioController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { asambleaId, tipoCombustibleId } = req.query;
      const inventarios = await InventarioService.findAll(
        asambleaId as string,
        tipoCombustibleId as string,
      );
      res.json({ success: true, inventarios });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inventario = await InventarioService.findById(
        req.params.id as string,
      );
      res.json({ success: true, inventario });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createInventarioSchema.parse(req.body);
      const inventario = await InventarioService.create(data);
      res.status(201).json({
        success: true,
        message: "Inventario creado exitosamente",
        inventario,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateInventarioSchema.parse(req.body);
      const inventario = await InventarioService.update(
        req.params.id as string,
        data,
      );
      res.json({
        success: true,
        message: "Inventario actualizado exitosamente",
        inventario,
      });
    } catch (error) {
      next(error);
    }
  },

  // ⚠️ No hay softDelete para inventario: se maneja por unicidad Asamblea+TipoCombustible
  // Si necesitas "eliminar", usa update para poner saldoActual: 0 y registrar como histórico

  // Endpoint crítico: ajustar saldo con trazabilidad
  ajustarSaldo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const { tipo, cantidad, observaciones } = req.body;
      const { inventarioId } = req.params;

      if (!["ENTRADA", "SALIDA"].includes(tipo)) {
        return res
          .status(400)
          .json({ error: "Tipo debe ser 'ENTRADA' o 'SALIDA'" });
      }

      const resultado = await InventarioService.actualizarSaldo(
        inventarioId as string,
        Number(cantidad),
        tipo as "ENTRADA" | "SALIDA",
        observaciones,
      );

      res.json({
        success: true,
        message: `Saldo actualizado (${tipo})`,
        resultado,
      });
    } catch (error) {
      next(error);
    }
  },

  // Endpoint útil: historial de movimientos de un inventario
  historialMovimientos: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { desde, hasta } = req.query;
      const movimientos = await InventarioService.getHistorialMovimientos(
        req.params.inventarioId as string,
        desde ? new Date(desde as string) : undefined,
        hasta ? new Date(hasta as string) : undefined,
      );
      res.json({ success: true, movimientos });
    } catch (error) {
      next(error);
    }
  },
};
