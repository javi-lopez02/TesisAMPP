import { useState, useCallback } from "react";
import { toast } from "sonner";
import type {
  createConsejo,
  updateConsejo,
  getConsejo,
} from "../types/consejo.types";
import {
  createConsejoRequest,
  deleteConsejoRequest,
  getConsejoRequest,
  updateConsejoRequest,
} from "../services/consejo-popular.service";
import axios, { AxiosError } from "axios";

export const useConsejoPopular = () => {
  const [consejosPopulares, setConsejosPopulares] = useState<getConsejo[] | null>(null);
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

  const create = useCallback(async (consejo: createConsejo) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await createConsejoRequest(consejo);
      setConsejosPopulares(prev => {
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

  const update = useCallback(async (consejo: updateConsejo, id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await updateConsejoRequest(consejo, id);
      setConsejosPopulares(prev => {
        if (!prev) return [res.data.data];
        return prev.map(c => c.id === id ? { ...c, ...res.data.data } : c);
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
  }, []);

  const getAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await getConsejoRequest();
      setConsejosPopulares(res.data.data);
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
//       setConsejosPopulares(prev => {
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
      await deleteConsejoRequest(id);
      
      // Remover el consejo de la lista local
      setConsejosPopulares(prev => {
        if (!prev) return null;
        return prev.filter(c => c.id !== id);
      });
      
      toast.success("Consejo eliminado exitosamente");
      return { success: true,  id };
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
    consejosPopulares,
    loading,
    error,
    create,
    update,
    getAll,
    // getById,      // ⬅️ Nuevo
    softDelete,
  };
};