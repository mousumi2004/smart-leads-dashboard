import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export function Select({ className = "", error, id, label, options, ...props }: SelectProps) {
  const selectId = id ?? props.name ?? label;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-stone-700" htmlFor={selectId}>
      <span>{label}</span>
      <select
        id={selectId}
        className={`h-11 rounded-md border bg-white px-3 text-stone-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 ${
          error ? "border-red-400" : "border-stone-300"
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
