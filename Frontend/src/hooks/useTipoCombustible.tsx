import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import type { getTipoCombustible } from "../types/tipo-combustible.types";
import { getTipoCombustibleRequest } from "../services/tipo-combustible.service";
import { toastError } from "../components/globalComponents/Toast";

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

  return {
    tipoCombustible,
    loading,
    error,
    getAll,
  };
};
