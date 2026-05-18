// src/hooks/useMovimientoCombustible.ts
import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import type {
  createMovimiento,
  getMovimientoCombustible,
} from "../types/movimiento.types";
import {
  createMovimientoCombustibleRequest,
  getMovimientosRequest,
} from "../services/movimientos.service";
import { toastError, toastSuccess } from "../components/globalComponents/Toast";

export interface GetMovimientosParams {
  inventarioId?: string;
  asambleaId?: string;
  tipoCombustibleId?: string;
  desde?: string;
  hasta?: string;
  limite?: number;
}

export const useMovimientoCombustible = () => {
  const [movimientos, setMovimientos] = useState<
    getMovimientoCombustible[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string[] | null>(null);

  const handleAxiosError = (err: unknown): string[] => {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      if (axiosError.response?.data) {
        const data = axiosError.response.data;
        return Array.isArray(data) ? data : [String(data)];
      }
      if (axiosError.request) {
        return ["No se recibió respuesta del servidor"];
      }
      return [axiosError.message || "Error en la petición"];
    }
    return ["Error desconocido en el servidor"];
  };

  const create = useCallback(async (movimiento: createMovimiento) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createMovimientoCombustibleRequest(movimiento);
      setMovimientos((prev) => {
        const newData = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];
        return prev ? [...prev, ...newData] : newData;
      });
      toastSuccess("Movimiento de Combustible Registrado Exitosamente");
      return { success: true, data: res.data.data };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError("Fallo en el Registro", "Verifique los datos");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAll = useCallback(async (params?: GetMovimientosParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMovimientosRequest(params);
      setMovimientos(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError("Fallo en la Carga", "Pronto recibirá atención");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { movimientos, loading, error, create, getAll };
};
