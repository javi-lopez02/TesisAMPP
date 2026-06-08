import { useState, useCallback } from "react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";

import type {
  createInventario,
  getInventario,
  GetMovimientosParams,
  updateInventario,
} from "../types/inventario.types";
import {
  createInventarioRequest,
  getInventarioMovimientosRequest,
  getInventarioRequest,
  updateInventarioRequest,
} from "../services/inventario.service";
import type { getMovimientoCombustible } from "../types/movimiento.types";

export const useInventario = () => {
  const [inventario, setInventario] = useState<getInventario[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string[] | null>(null);
  const [movimientos, setMovimientos] = useState<
    getMovimientoCombustible[] | null
  >(null);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [errorMovimientos, setErrorMovimientos] = useState<string[] | null>(
    null,
  );

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

  const create = useCallback(async (inventario: createInventario) => {
    setLoading(true);
    setError(null);

    try {
      const res = await createInventarioRequest(inventario);
      setInventario((prev) => {
        const newData = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];
        return prev ? [...prev, ...newData] : newData;
      });
      toast.success("Inventario creado exitosamente");
      return { success: true, data: res.data.data };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toast.error(messages.join(", "));
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (inventario: updateInventario, id: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await updateInventarioRequest(inventario, id);
        setInventario((prev) => {
          if (!prev) return [res.data.data];
          return prev.map((c) =>
            c.id === id ? { ...c, ...res.data.data } : c,
          );
        });
        toast.success("Inventario actualizado exitosamente");
        return { success: true, data: res.data.data };
      } catch (err) {
        const messages = handleAxiosError(err);
        setError(messages);
        toast.error(messages.join(", "));
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getInventarioRequest();
      setInventario(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toast.error(messages.join(", "));
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  //   // 🔹 GET BY ID - Obtiene un consejo específico sin afectar la lista general
  //   const getById = useCallback(async (id: string) => {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const res = await getConsejoByIdRequest(id);
  //       const consejo = res.data.data;

  //       // Opcional: si quieres agregarlo a la lista local si no existe
  //       setInventario(prev => {
  //         if (!prev) return [consejo];
  //         const exists = prev.some(c => c.id === id);
  //         return exists
  //           ? prev.map(c => c.id === id ? { ...c, ...consejo } : c)
  //           : [...prev, consejo];
  //       });

  //       return { success: true,  consejo };
  //     } catch (err) {
  //       const messages = handleAxiosError(err);
  //       setError(messages);
  //       toast.error(messages.join(", "));
  //       return { success: false, error: err };
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, []);

  const getInventarioMovimientos = useCallback(
    async (inventarioId: string, params?: GetMovimientosParams) => {
      setLoadingMovimientos(true);
      setErrorMovimientos(null);

      try {
        const res = await getInventarioMovimientosRequest(inventarioId, params);
        setMovimientos(res.data.data);
        toast.success(`Se cargaron ${res.data.data.length} movimientos`);

        return {
          success: true,
          data: res.data.data,
          meta: {
            total: res.data.data.length,
            desde: params?.desde,
            hasta: params?.hasta,
          },
        };
      } catch (err) {
        const messages = handleAxiosError(err);
        setErrorMovimientos(messages);
        toast.error("Error al cargar movimientos: " + messages.join(", "));

        return {
          success: false,
          error: err,
          data: null,
        };
      } finally {
        setLoadingMovimientos(false);
      }
    },
    [],
  );
  return {
    inventario,
    loading,
    error,
    create,
    update,
    getAll,
    movimientos,
    loadingMovimientos,
    errorMovimientos,
    getInventarioMovimientos,
    // getById,      // ⬅️ Nuevo
  };
};
