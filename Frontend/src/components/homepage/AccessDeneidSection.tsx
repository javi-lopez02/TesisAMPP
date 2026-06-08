import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const AccessDeniedSection = () => {
  return (
    <section className="rounded-2xl border border-[#dce3f0] bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#0e1a35]">
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B3D8F]/10 dark:bg-[#1B3D8F]/20"
        aria-hidden="true"
      >
        <ShieldCheck size={22} className="text-[#1B3D8F]" />
      </div>
      <h2 className="mb-2 text-[16px] font-bold text-[#0e1f4d] dark:text-white">
        Acceso restringido
      </h2>
      <p className="mb-5 text-[13px] text-[#7a8ab0]">
        Necesitas iniciar sesión con tus credenciales institucionales
        <br />
        para acceder a los módulos del sistema.
      </p>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 rounded-lg bg-[#1B3D8F] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[#1e48b0]"
      >
        Ir al inicio de sesión
        <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true" />
      </Link>
    </section>
  );
};