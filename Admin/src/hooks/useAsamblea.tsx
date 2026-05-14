// src/hooks/useAsamblea.ts
import { useState, useCallback } from "react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import {
  createAsambleaRequest,
  deleteAsambleaRequest,
  getAsambleaRequest,
  updateAsambleaRequest,
} from "../services/asamblea.service";
import type {
  createAsamblea,
  getAsamblea,
  updateAsamblea,
} from "../types/asamblea.types";

export const useAsamblea = () => {
  const [asamblea, setAsamblea] = useState<getAsamblea[] | null>(null);
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

  const create = useCallback(async (asamblea: createAsamblea) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createAsambleaRequest(asamblea);
      setAsamblea((prev) => {
        const newData = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];
        return prev ? [...prev, ...newData] : newData;
      });
      toast.success("Asamblea creada exitosamente");
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

  const update = useCallback(async (asamblea: updateAsamblea, id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateAsambleaRequest(asamblea, id);
      setAsamblea((prev) => {
        if (!prev) return [res.data.data];
        return prev.map((c) => (c.id === id ? { ...c, ...res.data.data } : c));
      });
      toast.success("Asamblea actualizado exitosamente");
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
      const res = await getAsambleaRequest();
      setAsamblea(res.data.data);
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

  const softDelete = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteAsambleaRequest(id);
      setAsamblea((prev) => (prev ? prev.filter((c) => c.id !== id) : null));
      toast.success("Asamblea eliminado exitosamente");
      return { success: true, data: id };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toast.error(messages.join(", "));
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { asamblea, loading, error, create, update, getAll, softDelete };
};
