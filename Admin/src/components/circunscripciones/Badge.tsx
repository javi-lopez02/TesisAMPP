export const Badge = ({ activo }: { activo: boolean }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
      activo ? "bg-[#EAF3DE] text-[#3B6D11]" : "bg-[#F1EFE8] text-[#5F5E5A]"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${activo ? "bg-[#3B6D11]" : "bg-[#888780]"}`}
    />
    {activo ? "Activo" : "Inactivo"}
  </span>
);
