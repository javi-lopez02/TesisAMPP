import { useState, useCallback } from "react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import type { createZona, getZonas, updateZona } from "../types/zonas.types";
import {
  createZonaRequest,
  deleteZonaRequest,
  getZonaRequest,
  updateZonaRequest,
} from "../services/zonas.service";

export const useZonas = () => {
  const [zonas, setZonas] = useState<getZonas[] | null>(null);
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

  const create = useCallback(async (zona: createZona) => {
    setLoading(true);
    setError(null);

    try {
      const res = await createZonaRequest(zona);
      setZonas((prev) => {
        const newData = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];
        return prev ? [...prev, ...newData] : newData;
      });
      toast.success("Consejo creado exitosamente");
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

  const update = useCallback(async (zona: updateZona, id: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await updateZonaRequest(zona, id);
      setZonas((prev) => {
        if (!prev) return [res.data.data];
        return prev.map((c) => (c.id === id ? { ...c, ...res.data.data } : c));
      });
      toast.success("Zona actualizada exitosamente");
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

  const getAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getZonaRequest();
      setZonas(res.data.data);
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
  //       setZonas(prev => {
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

  const softDelete = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await deleteZonaRequest(id);

      // Remover el consejo de la lista local
      setZonas((prev) => {
        if (!prev) return null;
        return prev.filter((c) => c.id !== id);
      });

      toast.success("Consejo eliminado exitosamente");
      return { success: true, id };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toast.error(messages.join(", "));
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    zonas,
    loading,
    error,
    create,
    update,
    getAll,
    // getById,      // ⬅️ Nuevo
    softDelete,
  };
};
