import { z } from "zod";

export const loginSchema = z.object({
  correo: z.string().email("Correo electrónico inválido"),
  contrasenia: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const registerSchema = z.object({
  correo: z.string().email("Correo electrónico inválido"),
  contrasenia: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir una mayúscula")
    .regex(/[0-9]/, "Debe incluir un número"),
  nombre: z.string().min(2, "Nombre muy corto"),
  apellidos: z.string().min(2, "Apellidos muy cortos"),
  rol: z
    .enum([
      "ADMINISTRADOR",
      "DELEGADO",
      "PRESIDENTE_CONSEJO",
      "CHOFER",
      "SUPERVISOR",
    ])
    .optional(),
  delegaciaId: z.string().uuid().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
