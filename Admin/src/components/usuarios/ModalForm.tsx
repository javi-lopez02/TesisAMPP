// src/components/usuarios/ModalForm.tsx
import { useEffect } from "react";
import {
  Check,
  Loader2,
  Pencil,
  Plus,
  ToggleLeft,
  ToggleRight,
  X,
  User,
  Mail,
  Key,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import type { FormState } from "../../types/usuarios.types";
import type { FormMode } from "../../types/globalTypes";
import { inputClass } from "../../helpers/helpers";
import { ROLES } from "./HelpersUsers";

interface ModalFormProps {
  mode: FormMode;
  form: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  loading: boolean;
  showPassword: boolean;
  onChange: (partial: Partial<FormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
  onTogglePassword: () => void;
  helpers?: {
    validateEmailFormat: (email: string) => string | undefined;
    validatePasswordFormat: (password: string) => string | undefined;
    PASSWORD_MIN_LENGTH: number;
  };
}

export const ModalForm = ({
  mode,
  form,
  errors,
  loading,
  showPassword,
  onChange,
  onSubmit,
  onClose,
  onTogglePassword,
  helpers,
}: ModalFormProps) => {
  const isEditar = mode === "editar";

  // 🔹 Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // 🔹 Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    // 🔹 Backdrop con animación de fade-in
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        // Cerrar si se hace clic fuera del modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 🔹 Modal con animación de entrada */}
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-2xl border border-black/[0.07] bg-white shadow-xl dark:border-white/[0.07] dark:bg-[#0e1a35]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-4 dark:border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${isEditar ? "bg-[#E6F1FB]" : "bg-[#EAF3DE]"}`}
            >
              {isEditar ? (
                <Pencil size={14} className="text-[#185FA5]" />
              ) : (
                <Plus size={14} className="text-[#3B6D11]" />
              )}
            </div>
            <h2 className="text-[15px] font-bold text-[#0e1f4d] dark:text-white">
              {isEditar ? "Editar usuario" : "Nuevo usuario"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Formulario con scroll interno */}
        <div className="max-h-[70vh] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-5">
          <div className="flex flex-col gap-4">
            {/* Nombre */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                <User size={11} /> Nombre{" "}
                <span className="text-[#CC1A2E]">*</span>
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => onChange({ nombre: e.target.value })}
                placeholder="Ej: María"
                className={inputClass(!!errors.nombre)}
                autoFocus
              />
              {errors.nombre && (
                <p className="mt-1 text-[11px] text-[#CC1A2E]">
                  {errors.nombre}
                </p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                <User size={11} /> Apellidos{" "}
                <span className="text-[#CC1A2E]">*</span>
              </label>
              <input
                type="text"
                value={form.apellidos}
                onChange={(e) => onChange({ apellidos: e.target.value })}
                placeholder="Ej: Pérez García"
                className={inputClass(!!errors.apellidos)}
              />
              {errors.apellidos && (
                <p className="mt-1 text-[11px] text-[#CC1A2E]">
                  {errors.apellidos}
                </p>
              )}
            </div>

            {/* Correo */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                <Mail size={11} /> Correo{" "}
                <span className="text-[#CC1A2E]">*</span>
              </label>
              <input
                type="email"
                value={form.correo}
                onChange={(e) => {
                  onChange({ correo: e.target.value });
                  if (helpers?.validateEmailFormat && e.target.value) {
                    helpers.validateEmailFormat(e.target.value);
                  }
                }}
                placeholder="usuario@ejemplo.com"
                className={inputClass(!!errors.correo)}
              />
              {errors.correo ? (
                <p className="mt-1 text-[11px] text-[#CC1A2E]">
                  {errors.correo}
                </p>
              ) : form.correo && helpers?.validateEmailFormat(form.correo) ? (
                <p className="mt-1 text-[11px] text-[#BA7517]">
                  {helpers.validateEmailFormat(form.correo)}
                </p>
              ) : null}
            </div>

            {/* Contraseña */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                <Key size={11} /> Contraseña{" "}
                {isEditar && (
                  <span className="text-gray-300 dark:text-white/30">
                    (opcional)
                  </span>
                )}{" "}
                {!isEditar && <span className="text-[#CC1A2E]">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.contrasenia}
                  onChange={(e) => {
                    onChange({ contrasenia: e.target.value });
                    if (helpers?.validatePasswordFormat && e.target.value) {
                      helpers.validatePasswordFormat(e.target.value);
                    }
                  }}
                  placeholder="••••••••"
                  className={inputClass(!!errors.contrasenia)}
                />
                <button
                  type="button"
                  onClick={onTogglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 dark:text-white/20 dark:hover:text-white/40"
                  title={showPassword ? "Ocultar" : "Mostrar"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.contrasenia ? (
                <p className="mt-1 text-[11px] text-[#CC1A2E]">
                  {errors.contrasenia}
                </p>
              ) : form.contrasenia &&
                helpers?.validatePasswordFormat(form.contrasenia) ? (
                <p className="mt-1 text-[11px] text-[#BA7517]">
                  {helpers.validatePasswordFormat(form.contrasenia)}
                </p>
              ) : mode === "crear" ? (
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
                  Mínimo {helpers?.PASSWORD_MIN_LENGTH ?? 8} caracteres
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
                  Dejar vacío para mantener la contraseña actual
                </p>
              )}
              {isEditar && !form.contrasenia && (
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
                  Deja vacío para mantener la contraseña actual
                </p>
              )}
            </div>

            {/* Rol */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                <Shield size={11} /> Rol{" "}
                <span className="text-[#CC1A2E]">*</span>
              </label>
              <select
                value={form.rol}
                onChange={(e) =>
                  onChange({ rol: e.target.value as FormState["rol"] })
                }
                className={`${inputClass(!!errors.rol)} cursor-pointer appearance-none`}
              >
                {ROLES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-400 dark:text-white/30">
                {ROLES.find((o) => o.value === form.rol)?.desc}
              </p>
            </div>

            {/* Estado (solo en edición) */}
            {isEditar && (
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
                  Estado
                </label>
                <button
                  type="button"
                  onClick={() => onChange({ activo: !form.activo })}
                  className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 transition ${
                    form.activo
                      ? "border-[#C0DD97] bg-[#EAF3DE] dark:border-[#3B6D11]/40 dark:bg-[#3B6D11]/10"
                      : "border-black/8 bg-white dark:border-white/10 dark:bg-white/3"
                  }`}
                >
                  <span
                    className={`text-[13px] font-semibold ${form.activo ? "text-[#3B6D11] dark:text-[#8BC34A]" : "text-gray-400 dark:text-white/40"}`}
                  >
                    {form.activo ? "Activo" : "Inactivo"}
                  </span>
                  {form.activo ? (
                    <ToggleRight
                      size={20}
                      className="text-[#3B6D11] dark:text-[#8BC34A]"
                    />
                  ) : (
                    <ToggleLeft
                      size={20}
                      className="text-gray-300 dark:text-white/20"
                    />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="border-t border-black/[0.07] bg-[#f8f9fc] px-5 py-4 dark:border-white/[0.07] dark:bg-white/3">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-black/8 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold text-white transition disabled:opacity-70 ${
                isEditar
                  ? "bg-[#1B3D8F] hover:bg-[#163272]"
                  : "bg-[#3B6D11] hover:bg-[#2d5509]"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Guardando...
                </>
              ) : isEditar ? (
                <>
                  <Check size={14} /> Guardar cambios
                </>
              ) : (
                <>
                  <Plus size={14} /> Crear usuario
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
