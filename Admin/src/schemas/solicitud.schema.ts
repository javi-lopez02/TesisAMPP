import { z } from "zod";
import type { FormState, FormPuntoRuta } from "../types/solicitud.types";

export const TIPOS_SOLICITUD = [
  "FISCALIZACION",
  "DISTRIBUCION",
  "EMERGENCIA",
  "OTRO",
] as const;
export const TIPOS_PUNTO = ["INICIO", "INTERMEDIO", "DESTINO"] as const;

// Schema para un punto de ruta individual
export const puntoRutaSchema = z.object({
  orden: z.coerce
    .number()
    .int()
    .nonnegative("El orden debe ser un número entero no negativo"),
  tipo: z.enum(TIPOS_PUNTO, { message: "Tipo de punto inválido" }),
  nombre: z.string().min(2, "El nombre del punto es obligatorio"),
  direccion: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  consejoPopularId: z.string().uuid("ID de Consejo Popular inválido"),
  circunscripcionId: z.string().uuid("ID de Circunscripción inválido"),
  zonaId: z.string().uuid("ID de Zona inválido"),
  cdrId: z.string().uuid("ID de CDR inválido"),
});

// Schema principal de la solicitud (ACTUALIZADO)
export const solicitudFormSchema = z.object({
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  actividad: z.string().min(2, "La actividad es obligatoria"),
  tipoSolicitud: z.enum(TIPOS_SOLICITUD, {
    message: "Tipo de solicitud inválido",
  }),
  fechaRequerida: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})?$/,
      "Fecha y hora inválidas",
    )
    .refine(
      (val) => {
        if (!val) return false;
        try {
          const fechaRequerida = new Date(val);
          const hoy = new Date();
          hoy.setSeconds(0, 0); // Comparar sin segundos para evitar falsos positivos
          return fechaRequerida >= hoy;
        } catch {
          return false;
        }
      },
      { message: "La fecha requerida debe ser futura" },
    ),
  cantidadLitros: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  tipoCombustibleId: z.string().uuid("ID de Tipo de Combustible inválido"),
  observaciones: z.string().optional(),

  // 🔹 Nuevos campos validados
  distanciaTotal: z.coerce
    .number()
    .min(0, "La distancia no puede ser negativa")
    .max(999999.99, "Distancia excede el límite"),
  tiempoEstimado: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "El tiempo no puede ser negativo")
    .max(1440, "Tiempo excede 24 horas"), // 24h * 60min

  puntosRuta: z
    .array(puntoRutaSchema)
    .min(1, "Debe haber al menos un punto de ruta"),
});

export type SolicitudFormInput = z.infer<typeof solicitudFormSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>> & {
    puntosRuta?: Record<number, Partial<Record<keyof FormPuntoRuta, string>>>;
  };
}

export const validateSolicitudForm = (data: unknown): ValidationResult => {
  const result = solicitudFormSchema.safeParse(data);

  if (!result.success) {
    const errors: ValidationResult["errors"] = {};

    // Errores de campos principales
    result.error.issues.forEach((err) => {
      const field = err.path[0] as keyof FormState;
      if (field && field !== "puntosRuta" && !errors[field]) {
        errors[field] = err.message;
      }
    });

    // Errores de puntos de ruta (agrupados por índice)
    const puntoErrors: Record<
      number,
      Partial<Record<keyof FormPuntoRuta, string>>
    > = {};
    result.error.issues.forEach((err) => {
      if (err.path[0] === "puntosRuta" && typeof err.path[1] === "number") {
        const index = err.path[1] as number;
        const field = err.path[2] as keyof FormPuntoRuta;
        if (field && !puntoErrors[index]) {
          puntoErrors[index] = { [field]: err.message };
        } else if (field) {
          puntoErrors[index] = { ...puntoErrors[index], [field]: err.message };
        }
      }
    });

    if (Object.keys(puntoErrors).length > 0) {
      errors.puntosRuta = puntoErrors as string;
    }

    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
};

export const resetSolicitudForm = (): FormState => ({
  descripcion: "",
  actividad: "",
  tipoSolicitud: "FISCALIZACION",
  fechaRequerida: "",
  cantidadLitros: "",
  tipoCombustibleId: "",
  observaciones: "",

  // 🔹 Nuevos campos inicializados
  distanciaTotal: "",
  tiempoEstimado: "",

  puntosRuta: [],
});

export const resetPuntoRuta = (): FormPuntoRuta => ({
  orden: "",
  tipo: "INTERMEDIO",
  nombre: "",
  direccion: "",
  consejoPopularId: "",
  circunscripcionId: "",
  zonaId: "",
  cdrId: "",
});

// Helpers de formato
export const formatLitros = (litros: number | string) => {
  const num = typeof litros === "string" ? Number(litros) : litros;
  return isNaN(num) ? "0 L" : `${num.toLocaleString("es-CU")} L`;
};

export const formatDistance = (km: number | string) => {
  const num = typeof km === "string" ? Number(km) : km;
  return isNaN(num) ? "0 km" : `${num.toFixed(2)} km`;
};

export const formatTime = (minutes: number | string) => {
  const num = typeof minutes === "string" ? Number(minutes) : minutes;
  if (isNaN(num)) return "0m";
  const h = Math.floor(num / 60);
  const m = num % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const validateFechaFutura = (fecha: string): string | undefined => {
  if (!fecha) return "La fecha es obligatoria";

  try {
    const fechaRequerida = new Date(fecha);
    const hoy = new Date();

    // Redondear hoy al minuto actual para comparación justa
    hoy.setSeconds(0, 0);

    if (fechaRequerida < hoy) {
      return "La fecha requerida debe ser futura";
    }

    // Opcional: validar que no sea demasiado lejana (ej: máximo 1 año)
    const maxFecha = new Date();
    maxFecha.setFullYear(maxFecha.getFullYear() + 1);
    if (fechaRequerida > maxFecha) {
      return "La fecha no puede ser mayor a 1 año";
    }

    return undefined;
  } catch {
    return "Formato de fecha inválido";
  }
};
