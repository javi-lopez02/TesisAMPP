// src/hooks/useCdrs.ts
import { useState, useCallback } from "react";
import type { createCdr, updateCdr, getCdrs } from "../types/cdrs.types";
import {
  createCdrRequest,
  getCdrRequest,
  updateCdrRequest,
  deleteCdrRequest,
} from "../services/cdr.service";
import axios, { AxiosError } from "axios";
import { toastError, toastSuccess } from "../components/globalComponents/Toast";

export const useCdr = () => {
  const [cdrs, setCdrs] = useState<getCdrs[] | null>(null);
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

  const create = useCallback(async (cdr: createCdr) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createCdrRequest(cdr);
      setCdrs((prev) => {
        const newData = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];
        return prev ? [...prev, ...newData] : newData;
      });
      toastSuccess(
        "CDR Creado Exitosamente",
        `CDR ${res.data.data.nombre} ha sido creado`,
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

  const update = useCallback(async (cdr: updateCdr, id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateCdrRequest(cdr, id);
      setCdrs((prev) => {
        if (!prev) return [res.data.data];
        return prev.map((c) => (c.id === id ? { ...c, ...res.data.data } : c));
      });
      toastSuccess(
        "CDR Actualizado Exitosamente",
        `CDR ${res.data.data.nombre} actualizado`,
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
  }, []);

  const getAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCdrRequest();
      setCdrs(res.data.data);
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

  const softDelete = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCdrRequest(id);
      setCdrs((prev) => (prev ? prev.filter((c) => c.id !== id) : null));
toastSuccess(
        "CDR Eliminado Exitosamente",
        "CDR pasó a estar inactiva",
      );      return { success: true, data: id };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError("Fallo al Borrar", "Verifique que no existan rutas asociadas");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { cdrs, loading, error, create, update, getAll, softDelete };
};
