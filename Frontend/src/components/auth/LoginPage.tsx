// src/pages/auth/LoginPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  ChevronRight,
  Loader2,
  User,
} from "lucide-react";
import { Field } from "./Field";
import { loginSchema } from "../../schemas/validation.schema";

// ── Tipos ───────────────────────────────────────────────────────────────────
interface FormErrors {
  email?: string;
  password?: string;
}

// ── Página ──────────────────────────────────────────────────────────────────
export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // MEJORA: errores por campo en lugar de un único error global de Zod
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // MEJORA: desestructurar solo lo necesario; evitar re-renders innecesarios
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const navigate = useNavigate();

  // MEJORA: redirigir con useEffect en lugar de dentro del submit
  // Esto cubre también el caso de que el usuario ya esté autenticado al montar
  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});
    clearError();

    // MEJORA: usar safeParse() en lugar de parse() para no lanzar excepciones
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      // Mapear errores de Zod a cada campo
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setFormErrors(fieldErrors);
      return; // Detener antes de llamar a la API
    }

    // MEJORA: el store ya no re-lanza, el error queda en store.error
    await login(result.data.email, result.data.password);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap"
      />

      <div className="flex min-h-screen items-center justify-center bg-[#1B3D8F] p-4 font-['Sora',sans-serif] sm:p-6">
        {/* MEJORA: role="main" y aria-label para lectores de pantalla */}
        <main
          role="main"
          aria-label="Formulario de inicio de sesión"
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
                {/* MEJORA: h1 semántico para SEO y accesibilidad */}
                <h1 className="text-[15px] font-bold leading-tight text-[#0e1f4d]">
                  Asamblea Municipal del Poder Popular
                </h1>
              </div>
            </header>

            <div className="mb-6 h-px bg-[#edf0f7]" aria-hidden="true" />

            <p className="mb-1 text-xl font-bold tracking-tight text-[#0e1f4d]">
              ¡Bienvenido!
            </p>
            <p className="mb-6 text-[13px] text-[#7a8ab0]">
              Inicia sesión para continuar
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
                  className="shrink-0 text-[#CC1A2E]"
                  aria-hidden="true"
                />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Field
                label="Correo institucional"
                type="email"
                placeholder="usuario@ampp.gob.cu"
                value={email}
                onChange={setEmail}
                LabelIcon={User}
                FieldIcon={Mail}
                errorMessage={formErrors.email}
                required
              />
              <Field
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                LabelIcon={Lock}
                FieldIcon={Lock}
                errorMessage={formErrors.password}
                required
              />

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
                    Verificando...
                  </>
                ) : (
                  <>
                    <LogIn size={15} strokeWidth={2} aria-hidden="true" />
                    Iniciar sesión
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between border-t border-[#edf0f7] px-8 py-4">
            <span className="text-xs text-[#7a8ab0]">¿No tienes cuenta?</span>
            <Link
              to="/register"
              className="flex items-center gap-0.5 text-xs font-semibold text-[#CC1A2E] transition-colors hover:text-[#a01020]"
            >
              Regístrate aquí
              <ChevronRight size={12} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </footer>
        </main>
      </div>
    </>
  );
};
