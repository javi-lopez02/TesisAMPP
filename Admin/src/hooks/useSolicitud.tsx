import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import type { createSolicitud, getSolicitud } from "../types/solicitud.types";
import { toastError, toastSuccess } from "../components/globalComponents/Toast";
import {
  aprobarSolicitudRequest,
  createSolicitudRequest,
  getSolicitudRequest,
  rechazarSolicitudRequest,
} from "../services/solicitud.service";

export const useSolicitudes = () => {
  const [solicitud, setSolicitud] = useState<getSolicitud[] | null>(null);
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
      const res = await createSolicitudRequest(solicitud);
      setSolicitud((prev) => {
        const newData = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];
        return prev ? [...prev, ...newData] : newData;
      });
      toastSuccess(
        "Solicitud Creada",
        `ID: ${res.data.data?.id?.slice(0, 8)}...`,
      );
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

  const getAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getSolicitudRequest();
      setSolicitud(res.data.data);
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

  // 🔹 APROBAR
  const aprobarSolicitud = useCallback(
    async (id: string, observaciones?: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await aprobarSolicitudRequest(id, observaciones);

        // Actualiza la solicitud en el estado local
        setSolicitud((prev) => {
          if (!prev) return [res.data.data];
          return prev.map((s) =>
            s.id === id ? { ...s, ...res.data.data } : s,
          );
        });

        toastSuccess(
          "Solicitud Aprobada",
          "El estado se actualizó correctamente",
        );
        return { success: true, data: res.data.data };
      } catch (err) {
        const messages = handleAxiosError(err);
        setError(messages);
        toastError("Error al aprobar", messages[0]);
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 🔹 RECHAZAR
  const rechazarSolicitud = useCallback(async (id: string, motivo: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await rechazarSolicitudRequest(id, motivo);

      // Actualiza la solicitud en el estado local
      setSolicitud((prev) => {
        if (!prev) return [res.data.data];
        return prev.map((s) => (s.id === id ? { ...s, ...res.data.data } : s));
      });

      toastSuccess(
        "Solicitud Rechazada",
        "El estado se actualizó correctamente",
      );
      return { success: true, data: res.data.data };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError("Error al rechazar", messages[0]);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    solicitud,
    loading,
    error,
    create, // ✅ Nuevo método
    getAll,
    aprobarSolicitud,
    rechazarSolicitud,
  };
};
