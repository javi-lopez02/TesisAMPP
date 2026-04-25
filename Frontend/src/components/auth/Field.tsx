// src/components/auth/Field.tsx
import { useState, useId } from "react";
import type { ElementType } from "react";

// ── Tipos ───────────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  LabelIcon: ElementType;
  FieldIcon: ElementType;
  hint?: string;
  errorMessage?: string; // MEJORA: recibe el mensaje de error en lugar de solo un booleano
  required?: boolean;
  minLength?: number;
  // MEJORA: `id` eliminado — se genera internamente con useId() para garantizar unicidad
}

// ── Componente ───────────────────────────────────────────────────────────────
export const Field = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  LabelIcon,
  FieldIcon,
  hint,
  errorMessage,
  required,
  minLength,
}: FieldProps) => {
  // MEJORA: useId() garantiza IDs únicos y accesibles aunque el componente se monte varias veces
  const id = useId();
  const errorId = `${id}-error`;
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorMessage);

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#3a4a7a]"
      >
        <LabelIcon size={11} strokeWidth={2.5} aria-hidden="true" />
        {label}
      </label>

      <div className="relative">
        <span
          aria-hidden="true"
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
            hasError
              ? "text-[#CC1A2E]"
              : focused
                ? "text-[#1B3D8F]"
                : "text-[#7a8ab0]"
          }`}
        >
          <FieldIcon size={15} strokeWidth={2} />
        </span>

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          minLength={minLength}
          // MEJORA: atributos ARIA para accesibilidad
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorId : hint ? `${id}-hint` : undefined
          }
          className={`
            w-full rounded-lg border-[1.5px] bg-[#f8f7f5]
            py-[0.65rem] pl-9 pr-3 font-['Sora'] text-sm text-[#0e1f4d]
            outline-none placeholder:text-[13px] placeholder:text-[#b0bcd0]
            transition-all duration-200
            ${
              hasError
                ? "border-[#CC1A2E] bg-[#fffafa] focus:shadow-[0_0_0_3px_rgba(204,26,46,0.1)]"
                : focused
                  ? "border-[#1B3D8F] bg-white shadow-[0_0_0_3px_rgba(27,61,143,0.1)]"
                  : "border-[#dce3f0] hover:border-[#b0c0e0]"
            }
          `}
        />
      </div>

      {/* MEJORA: mensaje de error inline por campo, no solo global */}
      {hasError && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 pl-0.5 text-[11px] text-[#CC1A2E]"
        >
          {errorMessage}
        </p>
      )}

      {hint && !hasError && (
        <p id={`${id}-hint`} className="mt-1 pl-0.5 text-[11px] text-[#7a8ab0]">
          {hint}
        </p>
      )}
    </div>
  );
};
