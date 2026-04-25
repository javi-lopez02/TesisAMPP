// src/store/auth.store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { isAxiosError } from "axios";
import type { AuthState } from "./types";
import {
  LoginRequest,
  LogoutRequest,
  me,
  RegisterRequest,
} from "../services/auth.service";

// ── Helper: extrae mensaje de error de forma tipada ─────────────────────────
// MEJORA: usar isAxiosError() de axios en lugar de duck-typing manual
const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      "Email o contraseña incorrectos"
    );
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Error inesperado. Intente nuevamente.";
};

// ── Store ───────────────────────────────────────────────────────────────────
// MEJORA: devtools() permite inspeccionar el store en Redux DevTools
export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,

      // 🔹 LOGIN
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await LoginRequest({
            correo: email,
            contrasenia: password,
          });

          // MEJORA: validar con optional chaining y nullish coalescing
          if (!data?.success || !data?.data) {
            throw new Error(data?.error ?? "Respuesta inválida del servidor");
          }

          set({
            isAuthenticated: data.data.activo,
            user: data.data,
            isLoading: false,
          });
          return data;
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          // MEJORA: no re-lanzar en producción para evitar unhandled rejections
          // El componente lee el error desde el store
          if (import.meta.env.DEV) console.error("❌ Error en login:", error);
        }
      },

      // 🔹 REGISTER
      register: async (name, lastName, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await RegisterRequest({
            nombre: name,
            apellidos: lastName,
            correo: email,
            contrasenia: password,
          });

          if (!data?.success || !data?.data) {
            throw new Error(data?.error ?? "Respuesta inválida del servidor");
          }

          set({
            isAuthenticated: data.data.activo,
            user: data.data,
            isLoading: false,
          });
          return data;
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          if (import.meta.env.DEV)
            console.error("❌ Error en registro:", error);
        }
      },

      // 🔹 LOGOUT
      logout: async () => {
        // MEJORA: limpiar el estado optimistamente antes de la petición
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        });
        try {
          await LogoutRequest();
        } catch (error) {
          // El logout falla silenciosamente en cliente; la sesión ya está limpia
          if (import.meta.env.DEV) console.error("❌ Error en logout:", error);
        }
      },

      // 🔹 ME - CORRECCIÓN: faltaba guardar el user en el estado
      me: async () => {
        set({ isLoading: true });
        try {
          const { data } = await me();

          if (!data?.success) {
            throw new Error(data?.error ?? "Respuesta inválida del servidor");
          }

          // BUG FIX: se estaba seteando user: null en lugar de data.data
          set({
            isAuthenticated: data.data.activo,
            user: data.data,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false, user: null });
          if (import.meta.env.DEV) console.error("❌ Error en me:", error);
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "AuthStore" }, // nombre visible en Redux DevTools
  ),
);
