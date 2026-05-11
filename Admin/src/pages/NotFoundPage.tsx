// src/pages/NotFoundPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ChevronLeft } from "lucide-react";

const REDIRECT_SECONDS = 10;

export const NotFoundPage = () => {
  const navigate        = useNavigate();
  const [count, setCount] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (count <= 0) { navigate("/dashboard"); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1220] px-4 font-['Sora',sans-serif]">

      {/* Patrón de puntos */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(27,61,143,0.18) 1px, transparent 1px)",
          backgroundSize:  "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Resplandor central */}
      <div
        className="pointer-events-none absolute h-140 w-140 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(27,61,143,0.2) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Contenido */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">

        {/* Logo estrella */}
        <div
          className="mb-6 h-11 w-11 bg-[#CC1A2E]"
          style={{ clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" }}
          aria-hidden="true"
        />

        {/* Chip */}
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-[#CC1A2E]/25 bg-[#CC1A2E]/10 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#CC1A2E]" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F09595]">
            Error de navegación
          </span>
        </div>

        {/* 404 */}
        <p
          className="select-none text-[clamp(96px,18vw,148px)] font-extrabold leading-none tracking-tight text-transparent"
          style={{ WebkitTextStroke: "2px rgba(27,61,143,0.55)" }}
          aria-label="Error 404"
        >
          404
        </p>

        {/* Línea decorativa */}
        <div className="mt-4 h-0.5 w-10 rounded-full bg-linear-to-r from-[#CC1A2E] to-transparent" aria-hidden="true" />

        {/* Texto */}
        <h1 className="mt-4 text-[18px] font-bold text-white">
          Página no encontrada
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-white/40">
          La ruta que intentas acceder no existe o fue movida.
          Serás redirigido al panel principal automáticamente.
        </p>

        {/* Cuenta regresiva */}
        <div className="mt-6 w-full max-w-xs">
          <p className="mb-2 text-[11px] font-semibold text-white/25">
            Redirigiendo en{" "}
            <span className="font-bold text-white">{count}s</span>
          </p>
          <div className="h-0.75 w-full overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#1B3D8F] to-[#CC1A2E] transition-[width] duration-1000 ease-linear"
              style={{ width: `${(count / REDIRECT_SECONDS) * 100}%` }}
              role="progressbar"
              aria-valuenow={count}
              aria-valuemin={0}
              aria-valuemax={REDIRECT_SECONDS}
              aria-label={`Redirigiendo en ${count} segundos`}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-lg bg-[#1B3D8F] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#163272] hover:shadow-[0_0_18px_rgba(27,61,143,0.45)]"
          >
            <Home size={13} strokeWidth={2.5} aria-hidden="true" />
            Ir al Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-[13px] font-semibold text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={13} strokeWidth={2.5} aria-hidden="true" />
            Volver atrás
          </button>
        </div>

        {/* Firma */}
        <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/15">
          Asamblea Municipal del Poder Popular
        </p>
      </div>
    </div>
  );
};