import { useState, useCallback } from "react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import type {
  createCircunscripcion,
  getCircunscripcion,
  updateCircunscripcion,
} from "../types/circunscripcion.types";
import {
  createCircunscripcionRequest,
  deleteCircunscripcionRequest,
  getCircunscripcionRequest,
  updateCircunscripcionRequest,
} from "../services/circunscripciones.service";

export const useCircunscripciones = () => {
  const [circunscripciones, setCircunscripciones] = useState<
    getCircunscripcion[] | null
  >(null);
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

  const create = useCallback(async (circunscripcion: createCircunscripcion) => {
    setLoading(true);
    setError(null);

    try {
      const res = await createCircunscripcionRequest(circunscripcion);
      setCircunscripciones((prev) => {
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

  const update = useCallback(
    async (circunscripcion: updateCircunscripcion, id: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await updateCircunscripcionRequest(circunscripcion, id);
        setCircunscripciones((prev) => {
          if (!prev) return [res.data.data];
          return prev.map((c) =>
            c.id === id ? { ...c, ...res.data.data } : c,
          );
        });
        toast.success("Consejo actualizado exitosamente");
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
      const res = await getCircunscripcionRequest();
      setCircunscripciones(res.data.data);
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
  //       setCircunscripciones(prev => {
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
      await deleteCircunscripcionRequest(id);

      // Remover el consejo de la lista local
      setCircunscripciones((prev) => {
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
    circunscripciones,
    loading,
    error,
    create,
    update,
    getAll,
    // getById,      // ⬅️ Nuevo
    softDelete,
  };
};
