import { useState, useRef, useEffect } from "react";
import { Calendar, X, Check, ChevronDown, AlertCircle } from "lucide-react";

interface DateRangeFilterProps {
  onApply:           (desde: string | undefined, hasta: string | undefined) => void;
  onClear:           () => void;
  initialDesde?:     string;
  initialHasta?:     string;
  placeholderDesde?: string;
  placeholderHasta?: string;
  disabled?:         boolean;
}

export const DateRangeFilter = ({
  onApply,
  onClear,
  initialDesde,
  initialHasta,
  placeholderDesde = "Fecha inicial",
  placeholderHasta = "Fecha final",
  disabled = false,
}: DateRangeFilterProps) => {
  const [desde,  setDesde]  = useState<string>(initialDesde ?? "");
  const [hasta,  setHasta]  = useState<string>(initialHasta ?? "");
  const [error,  setError]  = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const validateDates = (): boolean => {
    if (!desde && !hasta) { setError(""); return true; }
    if (desde && hasta && new Date(desde) > new Date(hasta)) {
      setError("La fecha inicial no puede ser mayor que la final");
      return false;
    }
    setError("");
    return true;
  };

  const handleApply = () => {
    if (!validateDates()) return;

    const desdeISO = desde ? new Date(`${desde}T00:00:00`).toISOString() : undefined;
    const hastaISO = hasta ? new Date(`${hasta}T23:59:59`).toISOString()  : undefined;

    onApply(desdeISO, hastaISO);
    setIsOpen(false);
  };

  const handleClear = () => {
    setDesde("");
    setHasta("");
    setError("");
    onClear();
    setIsOpen(false);
  };

  const handleQuickSelect = (days: number) => {
    const end   = new Date();
    const start = new Date();
    if (days > 0) start.setDate(end.getDate() - days);

    setDesde(start.toISOString().split("T")[0]);
    setHasta(end.toISOString().split("T")[0]);
    setError("");
  };

  const hayFiltro = !!(desde || hasta);

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Botón principal */}
      <button
        onClick={() => !disabled && setIsOpen((v) => !v)}
        disabled={disabled}
        className={`flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-[13px] font-semibold transition-all ${
          disabled
            ? "cursor-not-allowed border-black/5 bg-gray-50 text-gray-300 dark:border-white/5 dark:bg-white/5 dark:text-white/20"
            : "border-black/[0.08] bg-white text-[#0e1f4d] hover:border-[#1B3D8F] hover:bg-[#f8f9fc] dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:border-[#85B7EB] dark:hover:bg-white/[0.05]"
        } ${isOpen ? "border-[#1B3D8F] ring-2 ring-[#1B3D8F]/20 dark:border-[#85B7EB] dark:ring-[#85B7EB]/20" : ""}`}
      >
        <Calendar size={14} className="text-[#1B3D8F] dark:text-[#85B7EB]" />
        <span>Filtrar por fecha</span>
        {hayFiltro && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#3B6D11] text-[9px] font-bold text-white">
            ✓
          </span>
        )}
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-black/[0.07] bg-white p-4 shadow-xl dark:border-white/[0.07] dark:bg-[#0e1a35]"
          role="dialog"
          aria-labelledby="date-filter-title"
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <h3 id="date-filter-title" className="text-[13px] font-bold text-[#0e1f4d] dark:text-white">
              Rango de fechas
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          {/* Acceso rápido */}
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40">
              Acceso rápido
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Hoy",     days: 0  },
                { label: "7 días",  days: 7  },
                { label: "15 días", days: 15 },
                { label: "30 días", days: 30 },
              ].map(({ label, days }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickSelect(days)}
                  className="rounded-md border border-black/[0.08] bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-500 transition hover:border-[#1B3D8F] hover:text-[#1B3D8F] dark:border-white/10 dark:bg-white/5 dark:text-white/40 dark:hover:border-[#85B7EB] dark:hover:text-[#85B7EB]"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            {[
              { id: "fecha-desde", label: "Desde", value: desde, setter: setDesde, placeholder: placeholderDesde },
              { id: "fecha-hasta", label: "Hasta",  value: hasta, setter: setHasta, placeholder: placeholderHasta },
            ].map(({ id, label, value, setter, placeholder }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-white/40"
                >
                  {label}
                </label>
                <input
                  id={id}
                  type="date"
                  value={value}
                  placeholder={placeholder}
                  disabled={disabled}
                  onChange={(e) => {
                    setter(e.target.value);
                    if (error) setError("");
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#0e1f4d] outline-none transition
                    dark:text-white dark:[color-scheme:dark]
                    focus:border-[#1B3D8F] dark:focus:border-[#85B7EB]
                    disabled:cursor-not-allowed disabled:opacity-50
                    ${error
                      ? "border-[#CC1A2E] bg-[#FCEBEB] dark:bg-[#CC1A2E]/10"
                      : "border-black/[0.10] bg-white dark:border-white/10 dark:bg-white/[0.03]"
                    }`}
                />
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#FCEBEB] px-3 py-2 text-[11px] text-[#CC1A2E] dark:bg-[#CC1A2E]/10">
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Resumen */}
          {hayFiltro && !error && (
            <div className="mt-3 rounded-lg bg-[#EAF3DE] px-3 py-2 text-[11px] text-[#3B6D11] dark:bg-[#3B6D11]/20 dark:text-[#9FD97A]">
              <p className="font-semibold">Rango seleccionado:</p>
              <p>
                {desde && `Desde: ${new Date(`${desde}T00:00:00`).toLocaleDateString("es-CU")}`}
                {desde && hasta && " · "}
                {hasta && `Hasta: ${new Date(`${hasta}T23:59:59`).toLocaleDateString("es-CU")}`}
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled || !hayFiltro}
              className="flex-1 rounded-lg border border-black/[0.08] bg-white px-4 py-2.5 text-[12px] font-semibold text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={disabled || !!error}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1B3D8F] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#163272] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={12} />
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};