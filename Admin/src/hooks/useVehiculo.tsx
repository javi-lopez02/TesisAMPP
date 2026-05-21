// src/hooks/useVehiculo.ts
import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import type {
  createVehiculo,
  getVehiculo,
  updateVehiculo,
} from "../types/vehiculo.types";

import { toastError, toastSuccess } from "../components/globalComponents/Toast";
import {
  createVehiculoRequest,
  deleteVehiculoRequest,
  getVehiculosRequest,
  updateVehiculoRequest,
  type GetVehiculosParams,
} from "../services/vehiculo.service";

export const useVehiculo = () => {
  const [vehiculos, setVehiculos] = useState<getVehiculo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string[] | null>(null);

  // 🔹 Helper para manejo de errores Axios
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

  // 🔹 CREATE
  const create = useCallback(async (vehiculo: createVehiculo) => {
    setLoading(true);
    setError(null);

    try {
      const res = await createVehiculoRequest(vehiculo);
      setVehiculos((prev) => {
        const newVehiculo = res.data.data;
        return prev ? [...prev, newVehiculo] : [newVehiculo];
      });
      toastSuccess(
        "Vehículo Creado Exitosamente",
        `Placa ${res.data.data.placa} registrada`,
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

  // 🔹 UPDATE
  const update = useCallback(async (vehiculo: updateVehiculo, id: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await updateVehiculoRequest(vehiculo, id);
      setVehiculos((prev) => {
        if (!prev) return [res.data.data];
        return prev.map((v) => (v.id === id ? { ...v, ...res.data.data } : v));
      });
      toastSuccess(
        "Vehículo Actualizado Exitosamente",
        `Placa ${res.data.data.placa} actualizada`,
      );
      return { success: true, data: res.data.data };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError("Fallo en la Actualización", "Verifique los datos");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 GET ALL (con filtros opcionales)
  const getAll = useCallback(async (params?: GetVehiculosParams) => {
    setLoading(true);
    setError(null);

    try {
      const res = await getVehiculosRequest(params);
      setVehiculos(res.data.data);
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

  // 🔹 SOFT DELETE
  const softDelete = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await deleteVehiculoRequest(id);

      setVehiculos((prev) => {
        if (!prev) return null;
        return prev.filter((v) => v.id !== id);
      });

      toastSuccess(
        "Vehículo Eliminado Exitosamente",
        "Vehículo pasó a estar inactivo",
      );
      return { success: true, id };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError(
        "Fallo al Borrar",
        "Verifique que no existan asignaciones activas",
      );
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vehiculos,
    loading,
    error,
    create,
    update,
    getAll,
    softDelete,
  };
};
