import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ className = "", error, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name ?? label;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-stone-700" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        className={`h-11 rounded-md border bg-white px-3 text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 ${
          error ? "border-red-400" : "border-stone-300"
        } ${className}`}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
