import { Clock } from "lucide-react";

export const FooterSection = () => {
  return (
    <footer className="flex flex-col items-center justify-between gap-3 border-t border-[#dce3f0] pt-6 text-center sm:flex-row sm:text-left dark:border-white/10">
      <div className="flex items-center gap-2">
        <div
          aria-hidden="true"
          className="h-5 w-5 bg-[#CC1A2E]"
          style={{
            clipPath:
              "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
          }}
        />
        <p className="text-[11px] text-[#7a8ab0]">
          Asamblea Municipal del Poder Popular — Sistema de Gestión de
          Combustible
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock size={11} className="text-[#b0bcd0]" aria-hidden="true" />
        <p className="text-[11px] text-[#b0bcd0]">
          {new Date().toLocaleDateString("es-CU", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </footer>
  );
};