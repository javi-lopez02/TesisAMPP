export const generateCodigo = (nombre: string): string =>
  nombre
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .map((w) => w.slice(0, 3))
    .join("")
    .slice(0, 6);

// src/components/tipo-combustible/HelpersTipoComb.ts
import type { FormState, getTipoCombustible } from "../../types/tipo-combustible.types";

// ── Constantes y Regex ───────────────────────────────────────────────────────
export const CODIGO_REGEX = /^[A-Z0-9]{1,8}$/;

export const PRECIO_MINIMO = 0.01;
export const PRECIO_MAXIMO = 999999.99;

// ── Filtros ──────────────────────────────────────────────────────────────────
export interface FiltrosTipoCombustible {
  search: string;
  filterActivo: "todos" | "activo" | "inactivo";
}

export const aplicarFiltrosTipo = (
  tipos: getTipoCombustible[] | null,
  filtros: FiltrosTipoCombustible,
): getTipoCombustible[] => {
  const { search, filterActivo } = filtros;
  const lista = tipos ?? [];
  const q = search.toLowerCase();

  return lista.filter((t) => {
    // Búsqueda por texto
    const matchSearch =
      t.nombre.toLowerCase().includes(q) || 
      t.codigo.toLowerCase().includes(q);

    // Filtro por estado
    const matchActivo =
      filterActivo === "todos"
        ? true
        : filterActivo === "activo"
          ? t.activo
          : !t.activo;

    return matchSearch && matchActivo;
  });
};

// ── Validación de formulario ─────────────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
}

export const validarFormTipoCombustible = (
  form: FormState,
  existingTipos: getTipoCombustible[] | null,
  editingId?: string | null,
  mode: "crear" | "editar" = "crear",
): ValidationResult => {
  const errs: Partial<Record<keyof FormState, string>> = {};

  // Nombre: obligatorio y único
  if (!form.nombre.trim()) {
    errs.nombre = "El nombre es obligatorio";
  } else {
    const duplicado = existingTipos?.find(
      (t) =>
        t.nombre.toLowerCase() === form.nombre.trim().toLowerCase() &&
        t.id !== editingId,
    );
    if (duplicado) {
      errs.nombre = "Ya existe un tipo con ese nombre";
    }
  }

  // Código: obligatorio, formato y único (opcional según negocio)
  if (!form.codigo.trim()) {
    errs.codigo = "El código es obligatorio";
  } else if (!CODIGO_REGEX.test(form.codigo)) {
    errs.codigo = "Solo letras mayúsculas y números, máx. 8 caracteres";
  }

  // Precio: obligatorio, numérico y en rango válido
  const precio = Number(form.precioPorLitro);
  if (!form.precioPorLitro.trim()) {
    errs.precioPorLitro = "El precio es obligatorio";
  } else if (isNaN(precio) || precio < PRECIO_MINIMO || precio > PRECIO_MAXIMO) {
    errs.precioPorLitro = `Debe ser entre $${PRECIO_MINIMO} y $${PRECIO_MAXIMO}`;
  }

  // Activo: solo validar en edición (en creación siempre es true por defecto)
  if (mode === "editar" && typeof form.activo !== "boolean") {
    errs.activo = "El estado debe ser verdadero o falso";
  }

  return {
    isValid: Object.keys(errs).length === 0,
    errors: errs,
  };
};

// ── Helpers de cálculo para métricas ─────────────────────────────────────────
export interface MetricasTipoCombustible {
  total: number;
  activos: number;
  inactivos: number;
  precioPromedio: number;
  totalVehiculos: number;
  totalSolicitudes: number;
}

export const calcularMetricasTipo = (
  tipos: getTipoCombustible[] | null,
): MetricasTipoCombustible => {
  const lista = tipos ?? [];

  const activos = lista.filter((t) => t.activo).length;
  const inactivos = lista.length - activos;

  const precioPromedio = lista.length
    ? lista.reduce((acc, t) => acc + Number(t.precioPorLitro), 0) / lista.length
    : 0;

  const totalVehiculos = lista.reduce(
    (acc, t) => acc + (t._count?.vehiculos ?? 0),
    0,
  );

  const totalSolicitudes = lista.reduce(
    (acc, t) => acc + (t._count?.solicituds ?? 0),
    0,
  );

  return {
    total: lista.length,
    activos,
    inactivos,
    precioPromedio,
    totalVehiculos,
    totalSolicitudes,
  };
};

// ── Helpers de formato para UI ───────────────────────────────────────────────
export const formatearPrecio = (precio: number | string, moneda = "$"): string => {
  const num = typeof precio === "string" ? Number(precio) : precio;
  return `${moneda}${num.toLocaleString("es-CU", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

export const formatearCodigo = (codigo: string): string => {
  return codigo.toUpperCase().trim();
};
