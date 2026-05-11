// src/schemas/validation.schema.ts
import { z } from "zod";

// ── Constantes reutilizables ────────────────────────────────────────────────
const INSTITUTIONAL_EMAIL_REGEX = /^[^\s@]+@ampp\.gob\.cu$/;

const emailField = z
  .string()
  .min(1, "El correo es obligatorio")
  .email("Formato de correo inválido")
  .regex(INSTITUTIONAL_EMAIL_REGEX, "Debe ser un correo institucional (@ampp.gob.cu)");

const passwordField = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres"); // BUG FIX: el mensaje decía 6 pero el mínimo era 8

// ── Schemas ────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "Nombre demasiado largo")
      .trim(),
    lastName: z
      .string()
      .min(2, "Los apellidos deben tener al menos 2 caracteres")
      .max(100, "Apellidos demasiado largos")
      .trim(),
    email: emailField,
    password: passwordField
      .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
      .regex(/[0-9]/, "Debe incluir al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// ── Tipos inferidos ────────────────────────────────────────────────────────
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;