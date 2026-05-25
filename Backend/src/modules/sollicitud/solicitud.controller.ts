import { Request, Response, NextFunction } from "express";
import { SolicitudService } from "./solicitud.service";
import {
  createSolicitudSchema,
  approveSolicitudSchema,
  rejectSolicitudSchema,
  cancelSolicitudSchema,
  getSolicitudesSchema,
} from "./solicitud.dto";

export const SolicitudController = {
  // 🔹 LISTAR
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = getSolicitudesSchema.parse(req.query);
      const solicitudes = await SolicitudService.findAll(filters);
      res.json({ success: true, data: solicitudes });
    } catch (error) {
      next(error);
    }
  },

  // 🔹 CONSULTAR POR ID
  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const solicitud = await SolicitudService.findById(
        req.params.id as string,
      );
      res.json({ success: true, data: solicitud });
    } catch (error) {
      next(error);
    }
  },

  // 🔹 CREAR (con ruta y puntos)
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id)
        return res.status(401).json({ error: "No autenticado" });
      const data = createSolicitudSchema.parse(req.body);
      const solicitud = await SolicitudService.create(data, req.usuario.id);
      res
        .status(201)
        .json({ success: true, message: "Solicitud creada", data: solicitud });
    } catch (error) {
      next(error);
    }
  },

  // 🔹 APROBAR (crea Asignación automáticamente)
  approve: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id)
        return res.status(401).json({ error: "No autenticado" });
      const data = approveSolicitudSchema.parse(req.body);
      const solicitud = await SolicitudService.approve(
        req.params.id as string,
        data,
        req.usuario.id,
      );
      res.json({
        success: true,
        message: "Solicitud aprobada y asignación creada",
        data: solicitud,
      });
    } catch (error) {
      next(error);
    }
  },

  // 🔹 RECHAZAR
  reject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id)
        return res.status(401).json({ error: "No autenticado" });
      const data = rejectSolicitudSchema.parse(req.body);
      const solicitud = await SolicitudService.reject(
        req.params.id as string,
        data,
        req.usuario.id,
      );
      res.json({ success: true, message: "Solicitud rechazada", data: solicitud });
    } catch (error) {
      next(error);
    }
  },

  // 🔹 CANCELAR (solo por el solicitante)
  cancel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id)
        return res.status(401).json({ error: "No autenticado" });
      const data = cancelSolicitudSchema.parse(req.body);
      const solicitud = await SolicitudService.cancel(
        req.params.id as string,
        data,
        req.usuario.id,
      );
      res.json({ success: true, message: "Solicitud cancelada", data: solicitud });
    } catch (error) {
      next(error);
    }
  },
};
