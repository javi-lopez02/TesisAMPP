import type {
  getUsuario,
  FormState,
  createUsuario,
  updateUsuario,
  RolUsuario,
} from "../../types/usuarios.types";

export const ROLES = [
  {
    value: "ADMINISTRADOR",
    label: "Administrador",
    desc: "Acceso completo al sistema",
  },
  {
    value: "SUPERVISOR",
    label: "Supervisor",
    desc: "Supervisión y auditoría de operaciones",
  },
  {
    value: "PRESIDENTE_CONSEJO",
    label: "Presidente de Consejo",
    desc: "Gestión de un consejo popular",
  },
  {
    value: "DELEGADO",
    label: "Delegado",
    desc: "Representante de circunscripción",
  },
  { value: "CHOFER", label: "Chofer", desc: "Registro de transporte y rutas" },
] as const;

// ── Constantes y Tipos ───────────────────────────────────────────────────────
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 6;

// Mapeo de etiquetas para roles
export const ROL_LABELS: Record<RolUsuario, string> = {
  ADMINISTRADOR: "Administrador",
  DELEGADO: "Delegado de Circunscripción",
  SUPERVISOR: "Supervisor",
  PRESIDENTE_CONSEJO: "Presidente de Consejo",
  CHOFER: "Chofer",
};

// Estilos visuales para badges de roles
export const ROL_COLORS: Record<RolUsuario, string> = {
  ADMINISTRADOR:
    "bg-[#1B3D8F]/10 text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]",
  SUPERVISOR:
    "bg-[#8B5CF6]/10 text-[#8B5CF6] dark:bg-[#8B5CF6]/20 dark:text-[#C4B5FD]",
  PRESIDENTE_CONSEJO:
    "bg-[#3B6D11]/10 text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#9FD97A]",
  DELEGADO:
    "bg-[#B77C1B]/10 text-[#B77C1B] dark:bg-[#B77C1B]/20 dark:text-[#E8C57A]",
  CHOFER: "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40",
};

// ── Helpers de formato para UI ───────────────────────────────────────────────
export const getRolLabel = (rol: RolUsuario): string => ROL_LABELS[rol];
export const getRolColor = (rol: RolUsuario): string => ROL_COLORS[rol];

export const formatearFechaCorta = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-CU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatearIniciales = (
  nombre: string,
  apellidos: string,
): string => {
  const n = nombre?.trim()?.[0]?.toUpperCase() ?? "";
  const a = apellidos?.trim()?.[0]?.toUpperCase() ?? "";
  return `${n}${a}`;
};

// ── Filtros ──────────────────────────────────────────────────────────────────
export interface FiltrosUsuarios {
  search: string;
  filterRol: "todos" | RolUsuario;
  filterActivo: "todos" | "activo" | "inactivo";
}

export const aplicarFiltrosUsuarios = (
  usuarios: getUsuario[] | null,
  filtros: FiltrosUsuarios,
): getUsuario[] => {
  const { search, filterRol, filterActivo } = filtros;
  const lista = usuarios ?? [];
  const q = search.toLowerCase();

  return lista.filter((u) => {
    // Búsqueda por texto (nombre, apellidos, correo)
    const matchSearch =
      u.nombre.toLowerCase().includes(q) ||
      u.apellidos.toLowerCase().includes(q) ||
      u.correo.toLowerCase().includes(q);

    // Filtro por rol
    const matchRol = filterRol === "todos" ? true : u.rol === filterRol;

    // Filtro por estado
    const matchActivo =
      filterActivo === "todos"
        ? true
        : filterActivo === "activo"
          ? u.activo
          : !u.activo;

    return matchSearch && matchRol && matchActivo;
  });
};

// ── Validación de formulario ─────────────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
}

export const validarFormUsuario = (
  form: FormState,
  existingUsuarios: getUsuario[] | null,
  editingId?: string | null,
  mode: "crear" | "editar" = "crear",
): ValidationResult => {
  const errs: Partial<Record<keyof FormState, string>> = {};

  // Nombre: obligatorio
  if (!form.nombre.trim()) {
    errs.nombre = "El nombre es obligatorio";
  }

  // Apellidos: obligatorio
  if (!form.apellidos.trim()) {
    errs.apellidos = "Los apellidos son obligatorios";
  }

  // Correo: obligatorio y formato válido
  if (!form.correo.trim()) {
    errs.correo = "El correo es obligatorio";
  } else if (!EMAIL_REGEX.test(form.correo)) {
    errs.correo = "Formato de correo inválido";
  }

  // Contraseña: obligatoria solo en creación, mínimo 6 caracteres
  if (mode === "crear" && !form.contrasenia) {
    errs.contrasenia = "La contraseña es obligatoria";
  } else if (
    form.contrasenia &&
    form.contrasenia.length < PASSWORD_MIN_LENGTH
  ) {
    errs.contrasenia = `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`;
  }

  // Rol: siempre obligatorio (viene con valor por defecto, pero validamos por seguridad)
  if (!form.rol) {
    errs.rol = "Selecciona un rol";
  }

  if (
    existingUsuarios?.some(
      (u) =>
        u.correo.toLowerCase() === form.correo.toLowerCase() &&
        u.id !== editingId,
    )
  ) {
    errs.correo = "Ya existe un usuario con este correo";
  }

  return {
    isValid: Object.keys(errs).length === 0,
    errors: errs,
  };
};

// ── Métricas calculadas ──────────────────────────────────────────────────────
export interface MetricasUsuarios {
  total: number;
  activos: number;
  inactivos: number;
  porRol: Record<RolUsuario, number>;
  conConsejo: number;
  conCircunscripcion: number;
}

export const calcularMetricasUsuarios = (
  usuarios: getUsuario[] | null,
): MetricasUsuarios => {
  const lista = usuarios ?? [];

  const activos = lista.filter((u) => u.activo).length;
  const inactivos = lista.length - activos;

  const porRol = lista.reduce(
    (acc, u) => {
      acc[u.rol] = (acc[u.rol] ?? 0) + 1;
      return acc;
    },
    {} as Record<RolUsuario, number>,
  );

  // Asegurar que todos los roles estén presentes aunque sea 0
  (Object.keys(ROL_LABELS) as RolUsuario[]).forEach((rol) => {
    if (!(rol in porRol)) porRol[rol] = 0;
  });

  const conConsejo = lista.filter((u) => u.consejoPopularPresidente).length;
  const conCircunscripcion = lista.filter(
    (u) => u.circunscripcionDelegado,
  ).length;

  return {
    total: lista.length,
    activos,
    inactivos,
    porRol,
    conConsejo,
    conCircunscripcion,
  };
};

// ── Helpers para payload de API ─────────────────────────────────────────────
export const prepararPayloadUsuario = (
  form: FormState,
  mode: "crear" | "editar",
): Partial<createUsuario | updateUsuario> => {
  const { contrasenia, ...basePayload } = form;

  // En edición, solo incluir contraseña si se está cambiando
  const payload: Partial<createUsuario | updateUsuario> = basePayload;

  if (mode === "crear" || (contrasenia && contrasenia.trim())) {
    payload.contrasenia = contrasenia?.trim();
  }

  return payload;
};
