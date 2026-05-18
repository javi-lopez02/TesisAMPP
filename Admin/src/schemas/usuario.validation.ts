// src/validations/usuario.validations.ts
import { z } from "zod";
import type { getUsuario, FormState } from "../types/usuarios.types";

// ── Constantes compartidas ──────────────────────────────────────────────────
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

// ── Schema base compartido con backend ───────────────────────────────────────
// Define las reglas que deben cumplirse SIEMPRE (frontend + backend)
export const usuarioBaseSchema = z.object({
  correo: z.string().email({ message: "Correo electrónico inválido" }),
  contrasenia: z.string().min(PASSWORD_MIN_LENGTH, {
    message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
  }),
  nombre: z.string().min(2, { message: "Nombre muy corto" }),
  apellidos: z.string().min(2, { message: "Apellidos muy cortos" }),
  rol: z.enum(
    ["DELEGADO", "SUPERVISOR", "PRESIDENTE_CONSEJO", "CHOFER", "ADMINISTRADOR"],
    { message: "Rol inválido" },
  ),
  activo: z.boolean().optional(),
});

// ── Schema específico para frontend (con validaciones adicionales) ───────────
// Extiende el base con reglas que solo aplican en la UI
export const usuarioFormSchema = usuarioBaseSchema.extend({
  // En frontend, la contraseña es opcional en edición
  contrasenia: usuarioBaseSchema.shape.contrasenia.optional(),
});

// ── Schema para edición (campos opcionales) ──────────────────────────────────
export const usuarioEditSchema = usuarioBaseSchema.partial().extend({
  contrasenia: usuarioBaseSchema.shape.contrasenia.optional().nullable(),
  correo: usuarioBaseSchema.shape.correo.optional(),
  rol: usuarioBaseSchema.shape.rol.optional(),
  activo: z.boolean().optional(),
});

// ── Tipos inferidos ──────────────────────────────────────────────────────────
export type UsuarioFormInput = z.infer<typeof usuarioFormSchema>;
export type UsuarioEditInput = z.infer<typeof usuarioEditSchema>;

// ── Helper para validar formulario ───────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
  data?: UsuarioFormInput;
}

/**
 * Valida un formulario de Usuario usando Zod
 * @param data - Los datos del formulario a validar
 * @param mode - 'crear' o 'editar' para usar el schema adecuado
 * @returns Resultado de validación con errores formateados
 */
export const validateUsuarioForm = (
  data: unknown,
  mode: "crear" | "editar" = "crear",
): ValidationResult => {
  const schema = mode === "crear" ? usuarioFormSchema : usuarioEditSchema;
  const result = schema.safeParse(data);

  if (!result.success) {
    // Convertir errores de Zod a formato amigable para el formulario
    const errors: Partial<Record<keyof FormState, string>> = {};

    result.error.issues.forEach((err) => {
      const field = err.path[0] as keyof FormState;
      if (field && !errors[field]) {
        errors[field] = err.message;
      }
    });

    return { isValid: false, errors };
  }

  return { isValid: true, data: result.data as UsuarioFormInput, errors: {} };
};

// ── Validación de duplicados (lógica de negocio que requiere datos externos) ─
/**
 * Verifica si existe un Usuario duplicado por correo
 * Esta validación NO puede hacerse con Zod porque requiere acceso a la lista de usuarios
 * @param correo - Correo del usuario a validar
 * @param existingUsuarios - Lista de usuarios existentes desde el backend
 * @param editingId - ID del registro que se está editando (para excluirlo de la validación)
 * @returns Mensaje de error si hay duplicado, undefined si está OK
 */
export const validateUsuarioDuplicate = (
  correo: string,
  existingUsuarios: getUsuario[] | null,
  editingId?: string | null,
): string | undefined => {
  if (!existingUsuarios || !correo.trim()) return undefined;

  const duplicado = existingUsuarios.some(
    (u) =>
      u.correo.toLowerCase() === correo.trim().toLowerCase() &&
      u.id !== editingId,
  );

  return duplicado ? "Ya existe un usuario con este correo" : undefined;
};

// ── Validación condicional de contraseña ─────────────────────────────────────
/**
 * Valida la contraseña según el modo (crear/editar)
 * En creación: obligatoria
 * En edición: opcional, pero si se proporciona debe cumplir requisitos
 */
export const validatePasswordConditional = (
  contrasenia: string | undefined,
  mode: "crear" | "editar",
): string | undefined => {
  if (mode === "crear" && !contrasenia) {
    return "La contraseña es obligatoria";
  }

  if (contrasenia && contrasenia.length < PASSWORD_MIN_LENGTH) {
    return `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`;
  }

  return undefined;
};

// ── Utilidades para UI ───────────────────────────────────────────────────────
/**
 * Formatea errores de Zod para mostrar en inputs individuales
 * Útil para validación en tiempo real (onChange)
 */
export const getFieldError = (
  error: z.ZodError | null,
  field: keyof FormState,
): string | undefined => {
  if (!error) return undefined;

  const fieldError = error.issues.find((err) => err.path[0] === field);
  return fieldError?.message;
};

/**
 * Resetear valores del formulario a estado inicial
 */
export const resetUsuarioForm = (): FormState => ({
  correo: "",
  contrasenia: "",
  nombre: "",
  apellidos: "",
  rol: "DELEGADO",
  activo: true,
});

/**
 * Validar formato de email en tiempo real (para feedback mientras escribe)
 */
export const validateEmailFormat = (email: string): string | undefined => {
  if (!email) return undefined; // Vacío se valida como obligatorio en otro lado
  return EMAIL_REGEX.test(email) ? undefined : "Formato de correo inválido";
};

/**
 * Validar formato de contraseña en tiempo real (para feedback mientras escribe)
 */
export const validatePasswordFormat = (
  password: string,
): string | undefined => {
  if (!password) return undefined;
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`;
  }
  return undefined;
};
