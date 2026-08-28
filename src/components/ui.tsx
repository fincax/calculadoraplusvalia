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
    <fieldset className="rounded-xl border border-ink-300 bg-white p-5 sm:p-6">
      <legend className="px-1 text-base font-semibold text-brand-900">
        {legend}
      </legend>
      {description && (
        <p className="mb-4 mt-1 text-sm text-ink-500">{description}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
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
      <label htmlFor={id} className="block text-sm font-medium text-ink-900">
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
  "mt-1 block w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm placeholder:text-ink-300 focus:border-brand-500";

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
        className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-accent-600"
        aria-describedby={help ? `${id}-help` : undefined}
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink-900">
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
