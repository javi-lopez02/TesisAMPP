import { z } from "zod";
import { Rol } from "../../generated/prisma/enums";

export const createUsuarioSchema = z.object({
  correo: z.string().email("Correo electrónico inválido"),
  contrasenia: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  nombre: z.string().min(2, "Nombre muy corto"),
  apellidos: z.string().min(2, "Apellidos muy cortos"),
  rol: z.nativeEnum(Rol, { message: "Rol inválido" }),
});

export const updateUsuarioSchema = z.object({
  correo: z.string().email().optional(),
  contrasenia: z.string().min(8).optional(),
  nombre: z.string().min(2).optional(),
  apellidos: z.string().min(2).optional(),
  rol: z.nativeEnum(Rol).optional(),
  activo: z.coerce.boolean().optional(),
});

export const listUsuariosSchema = z.object({
  rol: z.nativeEnum(Rol).optional(),
  activo: z.coerce.boolean().optional(),
  busqueda: z.string().optional(), // Filtra por nombre, apellidos o correo
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
export type ListUsuariosInput = z.infer<typeof listUsuariosSchema>;