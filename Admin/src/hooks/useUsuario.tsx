import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import type {
  createUsuario,
  getUsuario,
  updateUsuario,
} from "../types/usuarios.types";
import {
  createUsuarioRequest,
  deleteUsuarioRequest,
  getUsuariosRequest,
  updateUsuarioRequest,
} from "../services/usuario.service";
import { toastError, toastSuccess } from "../components/globalComponents/Toast";

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<getUsuario[] | null>(null);

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

  // 🔹 CREATE
  const create = useCallback(async (usuario: createUsuario) => {
    setLoading(true);
    setError(null);

    try {
      const res = await createUsuarioRequest(usuario);
      setUsuarios((prev) => {
        const newUsuario = res.data.data;
        return prev ? [...prev, newUsuario] : [newUsuario];
      });
      toastSuccess(
        "Usuario Creado Exitosamente",
        `Usuario ${res.data.data.nombre} registrado`,
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

  // 🔹 UPDATE
  const update = useCallback(async (usuario: updateUsuario, id: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await updateUsuarioRequest(usuario, id);
      setUsuarios((prev) => {
        if (!prev) return [res.data.data];
        return prev.map((u) => (u.id === id ? { ...u, ...res.data.data } : u));
      });
      toastSuccess(
        "Usuario Actualizado Exitosamente",
        `Usuario ${res.data.data.nombre} actualizado`,
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

  // 🔹 GET ALL (con filtros opcionales)
  const getAll = useCallback(
    async (filters?: { rol?: string; activo?: boolean; busqueda?: string }) => {
      setLoading(true);
      setError(null);

      try {
        const res = await getUsuariosRequest(filters);
        setUsuarios(res.data.data);
        return { success: true, data: res.data.data };
      } catch (err) {
        const messages = handleAxiosError(err);
        setError(messages);
        toastError("Fallo en la Carga", "Pronto recibirá atención");
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  //   // 🔹 GET BY ID
  //   const getById = useCallback(async (id: string) => {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const res = await getUsuarioByIdRequest(id);
  //       const usuario = res.data.data;

  //       // Actualizar lista local si existe
  //       setUsuarios((prev) => {
  //         if (!prev) return [usuario];
  //         const exists = prev.some((u) => u.id === id);
  //         return exists
  //           ? prev.map((u) => (u.id === id ? { ...u, ...usuario } : u))
  //           : [...prev, usuario];
  //       });

  //       return { success: true, data: usuario };
  //     } catch (err) {
  //       const messages = handleAxiosError(err);
  //       setError(messages);
  //       toast.error(messages.join(", "));
  //       return { success: false, error: err };
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, []);

  // 🔹 SOFT DELETE
  const softDelete = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await deleteUsuarioRequest(id);

      // Remover usuario de la lista local
      setUsuarios((prev) => {
        if (!prev) return null;
        return prev.filter((u) => u.id !== id);
      });

      toastSuccess(
        "Usuario Eliminado Exitosamente",
        "Usuario pasó a estar inactivo",
      );
      return { success: true, id };
    } catch (err) {
      const messages = handleAxiosError(err);
      setError(messages);
      toastError(
        "Fallo al Borrar",
        "Verifique que no existan solicitudes asociadas",
      );
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    usuarios,
    loading,
    error,
    create,
    update,
    getAll,
    // getById,
    softDelete,
  };
};
