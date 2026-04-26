// src/utils/decimal.ts

import { Decimal } from "@prisma/client/runtime/client";

/**
 * Convierte Decimal de Prisma a number para JSON
 */
export const decimalToNumber = (value: Decimal | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  if (value instanceof Decimal) return value.toNumber();
  return Number(value);
};

/**
 * Convierte number a Decimal de Prisma
 */
export const numberToDecimal = (value: number | string): Decimal => {
  return new Decimal(value);
};

/**
 * Valida que un movimiento no exceda la capacidad del tanque
 */
export const validateTankMovement = (
  capacidadActual: Decimal,
  capacidadTotal: Decimal,
  cantidad: Decimal,
  tipo: "ENTRADA" | "SALIDA" | "AJUSTE" | "MERMA",
  nuevoSaldo?: Decimal
): { valid: boolean; error?: string; nuevoSaldo: Decimal } => {
  let resultado: Decimal;

  if (tipo === "ENTRADA") {
    resultado = capacidadActual.add(cantidad);
    if (resultado.gt(capacidadTotal)) {
      return { 
        valid: false, 
        error: `La entrada de ${cantidad.toString()}L excede la capacidad disponible`,
        nuevoSaldo: resultado 
      };
    }
  } else if (tipo === "SALIDA" || tipo === "MERMA") {
    if (cantidad.gt(capacidadActual)) {
      return { 
        valid: false, 
        error: `No hay suficiente combustible para ${tipo.toLowerCase()}: ${cantidad.toString()}L`,
        nuevoSaldo: capacidadActual.sub(cantidad)
      };
    }
    resultado = capacidadActual.sub(cantidad);
  } else if (tipo === "AJUSTE") {
    if (!nuevoSaldo) {
      return { valid: false, error: "El ajuste requiere un saldoNuevo explícito", nuevoSaldo: capacidadActual };
    }
    if (nuevoSaldo.lt(0) || nuevoSaldo.gt(capacidadTotal)) {
      return { valid: false, error: "El saldo ajustado está fuera de rango válido", nuevoSaldo: nuevoSaldo };
    }
    resultado = nuevoSaldo;
  } else {
    return { valid: false, error: `Tipo de movimiento no soportado: ${tipo}`, nuevoSaldo: capacidadActual };
  }

  return { valid: true, nuevoSaldo: resultado };
};