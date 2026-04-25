// src/pages/auth/RegisterPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  AlertCircle,
  ChevronRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Field } from "./Field";
import { registerSchema } from "../../schemas/validation.schema";

// ── Tipos ───────────────────────────────────────────────────────────────────
interface FormErrors {
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// ── Página de registro ──────────────────────────────────────────────────────
export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // MEJORA: un solo objeto de errores por campo, igual que LoginPage
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // MEJORA: selectores granulares para evitar re-renders innecesarios
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const navigate = useNavigate();

  // MEJORA: redirigir al montar si ya está autenticado, igual que LoginPage
  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});
    clearError();

    // MEJORA: safeParse() — sin excepciones, errores mapeados campo a campo.
    // Zod ya valida confirmPassword con el .refine(), no hay que hacerlo manualmente.
    const result = registerSchema.safeParse({
      name,
      lastName,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    await register(
      result.data.name,
      result.data.lastName,
      result.data.email,
      result.data.password,
    );
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap"
      />

      <div className="flex min-h-screen items-center justify-center bg-[#1B3D8F] p-4 font-['Sora',sans-serif] sm:p-6">
        <main
          role="main"
          aria-label="Formulario de registro"
          className="w-full max-w-120 overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        >
          {/* Barra tricolor */}
          <div className="flex h-1.5" aria-hidden="true">
            <span className="flex-1 bg-[#CC1A2E]" />
            <span className="w-0.75 bg-white" />
            <span className="flex-1 bg-[#1B3D8F]" />
          </div>

          <div className="px-8 pb-6 pt-8">
            {/* Encabezado institucional */}
            <header className="mb-6 flex items-center gap-3">
              <div
                aria-hidden="true"
                className="h-9 w-9 shrink-0 bg-[#CC1A2E]"
                style={{
                  clipPath:
                    "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
                }}
              />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a8ab0]">
                  República de Cuba
                </p>
                <h1 className="text-[15px] font-bold leading-tight text-[#0e1f4d]">
                  Asamblea Municipal del Poder Popular
                </h1>
              </div>
            </header>

            <div className="mb-6 h-px bg-[#edf0f7]" aria-hidden="true" />

            <p className="mb-1 text-xl font-bold tracking-tight text-[#0e1f4d]">
              Crear cuenta
            </p>
            <p className="mb-6 text-[13px] text-[#7a8ab0]">
              Completa los datos para registrarte
            </p>

            {/* Error del servidor (desde el store) */}
            {error && (
              <div
                role="alert"
                className="mb-4 flex items-center gap-2 rounded-lg border border-[#CC1A2E]/20 border-l-[3px] border-l-[#CC1A2E] bg-[#fdecea] px-3 py-2.5 text-[13px] text-[#7a0a14]"
              >
                <AlertCircle
                  size={14}
                  strokeWidth={2.5}
                  aria-hidden="true"
                  className="shrink-0 text-[#CC1A2E]"
                />
                {error}
              </div>
            )}

            {/* MEJORA: noValidate desactiva la validación nativa del browser */}
            <form onSubmit={handleSubmit} noValidate>
              <Field
                label="Correo institucional"
                type="email"
                placeholder="usuario@ampp.gob.cu"
                value={email}
                onChange={setEmail}
                LabelIcon={Mail}
                FieldIcon={Mail}
                errorMessage={formErrors.email}
                required
              />

              <div className="flex gap-4">
                <Field
                  label="Nombre"
                  type="text"
                  placeholder="Juan"
                  value={name}
                  onChange={setName}
                  LabelIcon={User}
                  FieldIcon={User}
                  errorMessage={formErrors.name}
                  required
                />
                <Field
                  label="Apellidos"
                  type="text"
                  placeholder="Pérez Rodríguez"
                  value={lastName}
                  onChange={setLastName}
                  LabelIcon={User}
                  FieldIcon={User}
                  errorMessage={formErrors.lastName}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Field
                  label="Contraseña"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={setPassword}
                  LabelIcon={Lock}
                  FieldIcon={Lock}
                  // MEJORA: hint solo se muestra si no hay error en ese campo
                  hint={
                    !formErrors.password
                      ? "Mayúscula y número requeridos"
                      : undefined
                  }
                  errorMessage={formErrors.password}
                  required
                  minLength={8}
                />
                <Field
                  label="Confirmar contraseña"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  LabelIcon={ShieldCheck}
                  FieldIcon={Lock}
                  errorMessage={formErrors.confirmPassword}
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="
                  relative mt-2 flex w-full items-center justify-center gap-2
                  overflow-hidden rounded-lg bg-[#1B3D8F] py-3
                  text-sm font-semibold tracking-wide text-white
                  shadow-[0_4px_14px_rgba(27,61,143,0.3)]
                  transition-all duration-200
                  hover:bg-[#1e48b0] hover:shadow-[0_6px_18px_rgba(27,61,143,0.4)]
                  active:scale-[0.985] disabled:cursor-wait disabled:opacity-70
                "
              >
                <span
                  className="absolute left-0 top-0 h-full w-1 bg-[#CC1A2E]"
                  aria-hidden="true"
                />
                {isLoading ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    Registrando...
                  </>
                ) : (
                  <>
                    <UserPlus size={15} strokeWidth={2} aria-hidden="true" />
                    Registrarse
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between border-t border-[#edf0f7] px-8 py-4">
            <span className="text-xs text-[#7a8ab0]">¿Ya tienes cuenta?</span>
            <Link
              to="/login"
              className="flex items-center gap-0.5 text-xs font-semibold text-[#CC1A2E] transition-colors hover:text-[#a01020]"
            >
              Inicia sesión
              <ChevronRight size={12} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </footer>
        </main>
      </div>
    </>
  );
};
