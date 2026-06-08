import { AlertTriangle } from "lucide-react";

interface Props {
  count: number;
}

export const AlertBanner = ({ count }: Props) => {
  if (count <= 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#F09595] bg-[#FCEBEB] px-4 py-2.5">
      <AlertTriangle size={14} className="shrink-0 text-[#CC1A2E]" />
      <p className="text-[12px] font-medium text-[#791F1F]">
        <span className="font-bold">{count} solicitudes</span> llevan más de 48h
        en estado PENDIENTE sin gestión — requieren atención inmediata
      </p>
    </div>
  );
};