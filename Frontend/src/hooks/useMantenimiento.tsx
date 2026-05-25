// src/hooks/useMantenimiento.ts
import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import type {
  createMantenimiento,
  getMantenimiento,
  updateMantenimiento,
} from "../types/mantenimiento.types";

import { toastError, toastSuccess } from "../components/globalComponents/Toast";
import {
  createMantenimientoRequest,
  getMantenimientosRequest,
  updateMantenimientoRequest,
  type GetMantenimientosParams,
} from "../services/mantenimiento.service";

export const useMantenimiento = () => {
  const [mantenimientos, setMantenimientos] = useState<
    getMantenimiento[] | null
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
      if (axiosError.request) return ["No se recibió respuesta del servidor"];
      return [axiosError.message || "Error en la petición"];
    }
    return ["Error desconocido en el servidor"];
  };

  const create = useCallback(async (mantenimiento: createMantenimiento) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createMantenimientoRequest(mantenimiento);
      setMantenimientos((prev) => {
        const newMantenimiento = res.data.data;
        return prev ? [...prev, newMantenimiento] : [newMantenimiento];
      });
      toastSuccess(
        "Mantenimiento Creado",
        `Registrado para ${res.data.data.vehiculo.placa}`,
      );
      return { success: true, data: res.data.data };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError("Fallo en la Creación", "Verifique los datos");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (mantenimiento: updateMantenimiento, id: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await updateMantenimientoRequest(mantenimiento, id);
        setMantenimientos((prev) => {
          if (!prev) return [res.data.data];
          return prev.map((m) =>
            m.id === id ? { ...m, ...res.data.data } : m,
          );
        });
        toastSuccess("Mantenimiento Actualizado", `ID: ${id}`);
        return { success: true, data: res.data.data };
      } catch (err) {
        const messages = handleAxiosError(err);
        setError(messages);
        toastError("Fallo en la Actualización", "Verifique los datos");
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getAll = useCallback(async (params?: GetMantenimientosParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMantenimientosRequest(params);
      setMantenimientos(res.data.data);
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

  return {
    mantenimientos,
    loading,
    error,
    create,
    update,
    getAll,
  };
};
