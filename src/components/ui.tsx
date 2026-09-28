"use client";

import type { ReactNode } from "react";

/** Primitivas de formulario accesibles y coherentes con el diseño FINCAX. */

export function Fieldset({
  legend,
  description,
  children,
}: {
  legend: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="min-w-0 border-t border-slate-200 pt-7 first-of-type:border-t-0 first-of-type:pt-0">
      {/* float + clear: el legend se comporta como un título normal y no
          se monta sobre la línea separadora del fieldset. */}
      <legend className="float-left w-full text-lg font-extrabold text-navy-900">
        {legend}
      </legend>
      {description && (
        <p className="clear-both mt-1 text-sm text-ink-500">{description}</p>
      )}
      <div className="clear-both grid gap-5 pt-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function Field({
  id,
  label,
  help,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-navy-900">
        {label}
      </label>
      {children}
      {help && !error && (
        <p id={`${id}-help`} className="mt-1 text-xs leading-relaxed text-ink-500">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 transition-colors focus:border-fincax-600";

export function CheckboxRow({
  id,
  label,
  help,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  help?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 sm:col-span-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-fincax-700"
        aria-describedby={help ? `${id}-help` : undefined}
      />
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-navy-900">
          {label}
        </label>
        {help && (
          <p id={`${id}-help`} className="text-xs leading-relaxed text-ink-500">
            {help}
          </p>
        )}
      </div>
    </div>
  );
}
