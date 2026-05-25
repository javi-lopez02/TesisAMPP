import { useState, useCallback } from "react";
import type { getRuta } from "../types/rutas.types";
import { toastError } from "../components/globalComponents/Toast";
import axios, { AxiosError } from "axios";
import { getRutasRequest } from "../services/rutas.service";
// import { getRutasRequest } from "../services/ruta.service";

export const useRutas = () => {
  const [rutas, setRutas] = useState<getRuta[] | null>(null);
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

  const getAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRutasRequest();
      setRutas(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError("Fallo en la Carga", "Pronto recibirá atención");
    } finally {
      setLoading(false);
    }
  }, []);

  return { rutas, loading, error, getAll };
};
