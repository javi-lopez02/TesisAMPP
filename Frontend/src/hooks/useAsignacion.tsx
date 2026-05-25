// src/hooks/useAsignacion.ts
import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import type { getAsignacion, GetAsignacionesParams } from "../types/asignacion.types";
import { toastError } from "../components/globalComponents/Toast";
import { getAsignacionesRequest, getAsignacionByIdRequest } from "../services/asignacion.service";

export const useAsignacion = () => {
  const [asignaciones, setAsignaciones] = useState<getAsignacion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string[] | null>(null);

  const handleAxiosError = (err: unknown): string[] => {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      if (axiosError.response?.data) {
        const data = axiosError.response.data;
        return Array.isArray(data) ? data : [String(data)];
      }
      if (axiosError.request) return ["No se recibió respuesta del servidor"];
      return [axiosError.message || "Error en la petición"];
    }
    return ["Error desconocido en el servidor"];
  };

  const getAll = useCallback(async (params?: GetAsignacionesParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAsignacionesRequest(params);
      setAsignaciones(res.data.data);
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

  /**
   * Obtiene una asignación específica por ID
   */
  const getById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAsignacionByIdRequest(id);
      return { success: true, data: res.data.data };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError("Fallo al cargar detalle", "Verifique el ID");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    asignaciones,
    loading,
    error,
    getAll,
    getById,
  };
};