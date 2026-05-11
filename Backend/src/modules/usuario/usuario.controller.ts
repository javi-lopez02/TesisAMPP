import { Request, Response, NextFunction } from "express";
import { UsuarioService } from "./usuario.service";
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  listUsuariosSchema,
} from "./usuario.dto";

export const UsuarioController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = listUsuariosSchema.parse(req.query);
      const usuarios = await UsuarioService.findAll(filters);
      res.json({ success: true, data: usuarios });
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuario = await UsuarioService.findById(req.params.id as string);
      res.json({ success: true, data: usuario });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createUsuarioSchema.parse(req.body);
      const usuario = await UsuarioService.create(data);
      res
        .status(201)
        .json({
          success: true,
          message: "Usuario creado exitosamente",
          data: usuario,
        });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateUsuarioSchema.parse(req.body);
      const usuario = await UsuarioService.update(
        req.params.id as string,
        data,
      );
      res.json({
        success: true,
        message: "Usuario actualizado exitosamente",
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UsuarioService.softDelete(req.params.id as string, req.usuario?.id);
      res.json({ success: true, message: "Usuario desactivado correctamente" });
    } catch (error) {
      next(error);
    }
  },
};
