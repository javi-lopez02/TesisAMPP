import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import type {
  createReporte,
  getReporte,
  updateReporte,
} from "../types/reporte-consumo.types";
import { toastError, toastSuccess } from "../components/globalComponents/Toast";
import {
  createReporteConsumoRequest,
  getReporteConsumoRequest,
  updateReporteConsumoRequest,
} from "../services/reporte-consumo.service";

export const useReporteConsumo = () => {
  const [reportes, setReportes] = useState<getReporte[] | null>(null);
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

  const create = useCallback(async (reporte: createReporte) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createReporteConsumoRequest(reporte);
      setReportes((prev) =>
        prev ? [...prev, res.data.data] : [res.data.data],
      );
      toastSuccess("Reporte Creado", `Consumo registrado`);
      return { success: true };
    } catch (err) {
      setError(handleAxiosError(err));
      toastError("Fallo en la Creación", "Verifique los datos");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (reporte: updateReporte, id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateReporteConsumoRequest(reporte, id);
      setReportes(
        (prev) =>
          prev?.map((r) => (r.id === id ? { ...r, ...res.data.data } : r)) ??
          null,
      );
      toastSuccess("Reporte Actualizado", `ID: ${id}`);
      return { success: true };
    } catch (err) {
      setError(handleAxiosError(err));
      toastError("Fallo en la Actualización", "Verifique los datos");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReporteConsumoRequest();
      setReportes(res.data.data);
      return { success: true };
    } catch (err) {
      setError(handleAxiosError(err));
      toastError("Fallo en la Carga", "Pronto recibirá atención");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { reportes, loading, error, create, update, getAll };
};
