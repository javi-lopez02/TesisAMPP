import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getGreeting, formatRol } from "./HelpersHomePage";

interface Props {
  isAuthenticated: boolean;
  user?: {
    nombre: string;
    apellidos: string;
    rol?: string;
  } | null;
}

export const HeroSection = ({ isAuthenticated, user }: Props) => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#1B3D8F] px-6 py-8 shadow-[0_8px_32px_rgba(27,61,143,0.35)] sm:px-8 sm:py-10">
      {/* Decoración institucional */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -right-10 -top-10 h-64 w-64 opacity-5"
          style={{
            background: "white",
            clipPath:
              "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
          }}
        />
        <div className="absolute right-0 top-0 h-full w-1 bg-[#CC1A2E]" />
      </div>

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {isAuthenticated && user ? (
            <>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                {getGreeting()}, {formatRol(user.rol)}
              </p>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                {user.nombre} {user.apellidos}
              </h1>
              <p className="mt-2 max-w-md text-[12px] leading-relaxed text-white/60">
                Panel de control del sistema de gestión de combustible
                institucional.
              </p>
            </>
          ) : (
            <>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                República de Cuba
              </p>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Asamblea Municipal del Poder Popular
              </h1>
              <p className="mt-2 max-w-md text-[12px] leading-relaxed text-white/60">
                Sistema de gestión y control de combustible. Inicia sesión para
                acceder.
              </p>
            </>
          )}
        </div>

        {!isAuthenticated ? (
          <Link
            to="/login"
            className="flex w-fit items-center gap-2 rounded-xl bg-[#CC1A2E] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(204,26,46,0.4)] transition-all hover:bg-[#a8151f]"
          >
            Iniciar sesión
            <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <ShieldCheck
              size={18}
              className="text-[#CC1A2E]"
              aria-hidden="true"
            />
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Sesión activa
              </p>
              <p className="text-[12px] font-bold text-white">
                {formatRol(user?.rol)}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
