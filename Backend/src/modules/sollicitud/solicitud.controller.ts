import { Request, Response, NextFunction } from "express";
import { SolicitudService } from "./solicitud.service";
import {
  createSolicitudSchema,
  approveSolicitudSchema,
  rejectSolicitudSchema,
  cancelSolicitudSchema,
} from "./solicitud.dto";
import { EstadoSolicitud } from "../../generated/prisma/enums";

export const SolicitudController = {
  // ── LISTAR ────────────────────────────────────────────────────
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { estado, usuarioId, tipoCombustibleId, desde, hasta } = req.query;
      const solicitudes = await SolicitudService.findAll({
        estado: estado as EstadoSolicitud,
        usuarioId: usuarioId as string,
        tipoCombustibleId: tipoCombustibleId as string,
        fechaDesde: desde ? new Date(desde as string) : undefined,
        fechaHasta: hasta ? new Date(hasta as string) : undefined,
      });
      res.json({ success: true, data: solicitudes });
    } catch (error) {
      next(error);
    }
  },

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

  // ── CREAR ─────────────────────────────────────────────────────
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

  // ── APROBAR (crea asignación automática) ──────────────────────
  approve: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id)
        return res.status(401).json({ error: "No autenticado" });
      const data = approveSolicitudSchema.parse(req.body);
      const result = await SolicitudService.approve(
        req.params.id as string,
        data,
        req.usuario.id,
      );
      res.json({
        success: true,
        message: "Solicitud aprobada y asignación creada",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── RECHAZAR ──────────────────────────────────────────────────
  reject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id)
        return res.status(401).json({ error: "No autenticado" });
      const data = rejectSolicitudSchema.parse(req.body);
      const result = await SolicitudService.reject(
        req.params.id as string,
        data,
        req.usuario.id,
      );
      res.json({ success: true, message: "Solicitud rechazada", data: result });
    } catch (error) {
      next(error);
    }
  },

  // ── CANCELAR ──────────────────────────────────────────────────
  cancel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario?.id || !req.usuario?.rol) {
        return res.status(401).json({ error: "No autenticado" });
      }
      const data = cancelSolicitudSchema.parse(req.body);
      const result = await SolicitudService.cancel(
        req.params.id as string,
        data,
        req.usuario.id,
        req.usuario.rol,
      );
      res.json({ success: true, message: "Solicitud cancelada", data: result });
    } catch (error) {
      next(error);
    }
  },

  // ── UTILIDADES ────────────────────────────────────────────────

  // Obtener transiciones permitidas para una solicitud
  getTransitions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const solicitud = await SolicitudService.findById(
        req.params.id as string,
      );
      if (!req.usuario?.id || !req.usuario?.rol) {
        return res.status(401).json({ error: "No autenticado" });
      }
      const transitions = SolicitudService.getAvailableTransitions(
        solicitud.estado,
        req.usuario.id,
        solicitud.usuarioId,
        req.usuario.rol,
      );
      res.json({
        success: true,
        data: transitions,
        estadoActual: solicitud.estado,
      });
    } catch (error) {
      next(error);
    }
  },

  // Listar solicitudes de un usuario
  getByUsuario: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { estados } = req.query;
      const estadosArray = estados
        ? ((estados as string).split(",") as EstadoSolicitud[])
        : undefined;
      const solicitudes = await SolicitudService.getByUsuario(
        req.params.usuarioId as string,
        estadosArray,
      );
      res.json({ success: true, data: solicitudes });
    } catch (error) {
      next(error);
    }
  },
};
