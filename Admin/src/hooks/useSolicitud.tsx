import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import type { createSolicitud } from "../types/solicitud.types";
import { toastError, toastSuccess } from "../components/globalComponents/Toast";

export const useSolicitudes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string[] | null>(null);

  const handleAxiosError = (err: unknown): string[] => {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      if (axiosError.response?.data) {
        const data = axiosError.response.data;
        return Array.isArray(data) ? data : [String(data)];
      }
      return [axiosError.message || "Error en la petición"];
    }
    return ["Error desconocido"];
  };

  const create = useCallback(async (solicitud: createSolicitud) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("http://localhost:4000/api/solicitudes", solicitud, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // Para enviar cookies con el token
      });
      toastSuccess("Solicitud Creada", `ID: ${res.data.data?.id?.slice(0, 8)}...`);
      return { success: true, data: res.data.data };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError("Fallo en la Creación", messages[0]);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};