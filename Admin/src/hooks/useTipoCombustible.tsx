import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import type {
  createTipoCombustible,
  getTipoCombustible,
  updateTipoCombustible,
} from "../types/tipo-combustible.types";
import {
  createTipoCombustibleRequest,
  deleteTipoCombustibleRequest,
  getTipoCombustibleRequest,
  updateTipoCombustibleRequest,
} from "../services/tipo-combustible.service";
import { toastError, toastSuccess } from "../components/globalComponents/Toast";

export const useTipoCombustible = () => {
  const [tipoCombustible, setTipoCombustible] = useState<
    getTipoCombustible[] | null
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

  const create = useCallback(async (tipoCombustible: createTipoCombustible) => {
    setLoading(true);
    setError(null);

    try {
      const res = await createTipoCombustibleRequest(tipoCombustible);
      setTipoCombustible((prev) => {
        const newData = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];
        return prev ? [...prev, ...newData] : newData;
      });
      toastSuccess(
        "Tipo de Combustible Creado Exitosamente",
        `Combustible ${res.data.data.nombre} registrado`,
      );
      return { success: true, data: res.data.data };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError("Fallo en la Creacion", "Verifique los datos");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (tipoCombustible: updateTipoCombustible, id: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await updateTipoCombustibleRequest(tipoCombustible, id);
        setTipoCombustible((prev) => {
          if (!prev) return [res.data.data];
          return prev.map((c) =>
            c.id === id ? { ...c, ...res.data.data } : c,
          );
        });
        toastSuccess(
          "Tipo de Combustible Actualizado Exitosamente",
          `Combustible ${res.data.data.nombre} actualizado`,
        );
        return { success: true, data: res.data.data };
      } catch (err) {
        const messages = handleAxiosError(err);
        setError(messages);
        toastError("Fallo en la Actualizacion", "Verifique los datos");
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
      const res = await getTipoCombustibleRequest();
      setTipoCombustible(res.data.data);
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

  //   // 🔹 GET BY ID - Obtiene un consejo específico sin afectar la lista general
  //   const getById = useCallback(async (id: string) => {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const res = await getConsejoByIdRequest(id);
  //       const consejo = res.data.data;

  //       // Opcional: si quieres agregarlo a la lista local si no existe
  //       setTipoCombustible(prev => {
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
      await deleteTipoCombustibleRequest(id);

      // Remover el consejo de la lista local
      setTipoCombustible((prev) => {
        if (!prev) return null;
        return prev.filter((c) => c.id !== id);
      });

      toastSuccess(
        "Tipo de Combustible Eliminado Exitosamente",
        "Combustible pasó a estar inactivo",
      );
      return { success: true, id };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError(
        "Fallo al Borrar",
        "Verifique que no existan inventarios asociadas",
      );
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tipoCombustible,
    loading,
    error,
    create,
    update,
    getAll,
    // getById,      // ⬅️ Nuevo
    softDelete,
  };
};
