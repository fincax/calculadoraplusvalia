"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { calculatePlusvalia, PlusvaliaInputError } from "@/lib/plusvalia/engine";
import { listMunicipalities } from "@/lib/plusvalia/data/municipalities";
import { parseAmount } from "@/lib/plusvalia/parse";
import {
  decodeShareParams,
  encodeShareParams,
  type ShareState,
} from "@/lib/plusvalia/share";
import type {
  CalculationInput,
  CalculationResult,
  RightKind,
  TransferType,
} from "@/lib/plusvalia/types";
import { CheckboxRow, Field, Fieldset, inputClass } from "@/components/ui";
import ResultsPanel from "./ResultsPanel";

/** Fecha mínima admitida (entrada en vigor del sistema actual, RD-ley 26/2021). */
const MIN_TRANSFER_DATE = "2021-11-10";

// El estado del formulario coincide con los campos serializables del enlace
// compartible (src/lib/plusvalia/share.ts).
type FormState = ShareState;

const initialState: FormState = {
  municipalityCode: "sevilla",
  transferType: "compraventa",
  acquisitionDate: "",
  transferDate: "",
  acquisitionValue: "",
  transferValue: "",
  cadastralValueTotal: "",
  cadastralValueLand: "",
  ownershipPercentage: "100",
  rightKind: "pleno_dominio",
  usufructuaryAge: "",
  usufructDurationYears: "",
  underlyingUsufruct: "vitalicio",
  isPrimaryResidenceOfDeceased: false,
  isCloseRelative: false,
  isDacionEnPago: false,
  showLateFiling: false,
  filingDate: "",
};

const transferTypeLabels: Record<TransferType, { label: string; hint: string }> =
  {
    compraventa: {
      label: "Compraventa",
      hint: "Venta u otra transmisión con precio. Paga quien vende.",
    },
    herencia: {
      label: "Herencia",
      hint: "Transmisión por fallecimiento. Paga quien hereda.",
    },
    donacion: {
      label: "Donación",
      hint: "Transmisión gratuita en vida. Paga quien recibe.",
    },
  };

export default function PlusvaliaCalculator({
  initialMunicipalityCode,
}: {
  /** Preselecciona el municipio (páginas por municipio para SEO local). */
  initialMunicipalityCode?: string;
}) {
  const [form, setForm] = useState<FormState>({
    ...initialState,
    municipalityCode: initialMunicipalityCode ?? initialState.municipalityCode,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const municipalities = useMemo(() => listMunicipalities(), []);

  // Prefill desde la URL (enlace compartible). Se ejecuta solo en cliente,
  // tras la hidratación, para no provocar desajustes de renderizado.
  useEffect(() => {
    const decoded = decodeShareParams(window.location.search);
    if (Object.keys(decoded).length > 0) {
      setForm((f) => ({ ...f, ...decoded }));
    }
  }, []);

  function currentShareUrl(): string {
    const qs = encodeShareParams(form);
    const base = window.location.origin + window.location.pathname;
    return qs ? `${base}?${qs}` : base;
  }

  async function copyShareLink() {
    try {
      const url = currentShareUrl();
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  function resetForm() {
    setForm({
      ...initialState,
      municipalityCode: initialMunicipalityCode ?? initialState.municipalityCode,
    });
    setErrors({});
    setGlobalError(null);
    setResult(null);
    setCopied(false);
    window.history.replaceState(null, "", window.location.pathname);
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    const today = new Date().toISOString().slice(0, 10);

    if (!form.acquisitionDate) e.acquisitionDate = "Indica la fecha de adquisición.";
    if (!form.transferDate) e.transferDate = "Indica la fecha de transmisión.";
    if (
      form.acquisitionDate &&
      form.transferDate &&
      form.transferDate <= form.acquisitionDate
    ) {
      e.transferDate = "Debe ser posterior a la fecha de adquisición.";
    }
    if (form.transferDate && form.transferDate < "2021-11-10") {
      e.transferDate =
        "Esta calculadora cubre transmisiones desde el 10/11/2021 (sistema vigente). Para fechas anteriores, consúltanos.";
    }

    const amounts: Array<[keyof FormState, string]> = [
      ["acquisitionValue", "Indica el valor de adquisición."],
      ["transferValue", "Indica el valor de transmisión."],
      ["cadastralValueTotal", "Indica el valor catastral total."],
      ["cadastralValueLand", "Indica el valor catastral del suelo."],
    ];
    for (const [key, msg] of amounts) {
      const raw = form[key] as string;
      if (!raw.trim()) {
        e[key] = msg;
      } else if (!Number.isFinite(parseAmount(raw)) || parseAmount(raw) < 0) {
        e[key] = "Introduce un importe válido (p. ej. 120.000).";
      }
    }
    if (
      !e.cadastralValueLand &&
      !e.cadastralValueTotal &&
      parseAmount(form.cadastralValueLand) > parseAmount(form.cadastralValueTotal)
    ) {
      e.cadastralValueLand =
        "El valor del suelo no puede superar el valor catastral total.";
    }

    const ownership = parseAmount(form.ownershipPercentage);
    if (!Number.isFinite(ownership) || ownership <= 0 || ownership > 100) {
      e.ownershipPercentage = "Porcentaje entre 0 y 100.";
    }

    if (
      (form.rightKind === "usufructo_vitalicio" ||
        (form.rightKind === "nuda_propiedad" &&
          form.underlyingUsufruct === "vitalicio")) &&
      (!form.usufructuaryAge.trim() ||
        !Number.isFinite(Number(form.usufructuaryAge)) ||
        Number(form.usufructuaryAge) < 0 ||
        Number(form.usufructuaryAge) > 130)
    ) {
      e.usufructuaryAge = "Edad del usufructuario (0–130).";
    }
    if (
      (form.rightKind === "usufructo_temporal" ||
        (form.rightKind === "nuda_propiedad" &&
          form.underlyingUsufruct === "temporal")) &&
      (!form.usufructDurationYears.trim() ||
        !Number.isFinite(Number(form.usufructDurationYears)) ||
        Number(form.usufructDurationYears) <= 0)
    ) {
      e.usufructDurationYears = "Duración del usufructo en años.";
    }

    if (form.showLateFiling && form.filingDate && form.transferDate && form.filingDate < form.transferDate) {
      e.filingDate = "La fecha de presentación no puede ser anterior a la transmisión.";
    }
    if (form.transferDate && form.transferDate > today) {
      // Permitido (simulación de venta futura), pero sin error: solo se avisa en resultados.
    }
    return e;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setGlobalError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setResult(null);
      return;
    }

    const input: CalculationInput = {
      municipalityCode: form.municipalityCode,
      transferType: form.transferType,
      acquisitionDate: form.acquisitionDate,
      transferDate: form.transferDate,
      acquisitionValue: parseAmount(form.acquisitionValue),
      transferValue: parseAmount(form.transferValue),
      cadastralValueTotal: parseAmount(form.cadastralValueTotal),
      cadastralValueLand: parseAmount(form.cadastralValueLand),
      ownershipPercentage: parseAmount(form.ownershipPercentage),
      realRight:
        form.rightKind === "pleno_dominio"
          ? undefined
          : {
              kind: form.rightKind,
              usufructuaryAge: form.usufructuaryAge
                ? Number(form.usufructuaryAge)
                : undefined,
              usufructDurationYears: form.usufructDurationYears
                ? Number(form.usufructDurationYears)
                : undefined,
              underlyingUsufruct:
                form.rightKind === "nuda_propiedad"
                  ? form.underlyingUsufruct
                  : undefined,
            },
      isPrimaryResidenceOfDeceased: form.isPrimaryResidenceOfDeceased,
      isCloseRelative: form.isCloseRelative,
      isDacionEnPago: form.isDacionEnPago,
      filingDate:
        form.showLateFiling && form.filingDate ? form.filingDate : undefined,
    };

    try {
      const r = calculatePlusvalia(input);
      setResult(r);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        resultsRef.current?.focus({ preventScroll: true });
      });
    } catch (err) {
      setResult(null);
      setGlobalError(
        err instanceof PlusvaliaInputError
          ? err.message
          : "No se ha podido completar el cálculo. Revisa los datos introducidos."
      );
    }
  }

  const needsAge =
    form.rightKind === "usufructo_vitalicio" ||
    (form.rightKind === "nuda_propiedad" &&
      form.underlyingUsufruct === "vitalicio");
  const needsDuration =
    form.rightKind === "usufructo_temporal" ||
    (form.rightKind === "nuda_propiedad" &&
      form.underlyingUsufruct === "temporal");

  const selectedMunicipality = municipalities.find(
    (m) => m.code === form.municipalityCode
  );

  return (
    <>
      <form
        onSubmit={onSubmit}
        noValidate
        className="no-print mt-8 space-y-6"
        aria-label="Formulario de cálculo de la plusvalía municipal"
      >
        <Fieldset
          legend="1. La operación"
          description="Dónde está el inmueble y cómo se transmite."
        >
          <Field
            id="municipio"
            label="Municipio del inmueble"
            help={
              selectedMunicipality && !selectedMunicipality.verified
                ? "Ordenanza pendiente de verificar: se estimará con los máximos legales (la cuota real puede ser menor)."
                : "Datos contrastados con la ordenanza fiscal municipal."
            }
          >
            <select
              id="municipio"
              className={inputClass}
              value={form.municipalityCode}
              onChange={(e) => set("municipalityCode", e.target.value)}
              aria-describedby="municipio-help"
            >
              {municipalities.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name}
                  {m.verified ? "" : " (estimación por máximos)"}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <span className="block text-sm font-medium text-ink-900">
              Tipo de transmisión
            </span>
            <div
              role="radiogroup"
              aria-label="Tipo de transmisión"
              className="mt-1 grid grid-cols-3 gap-2"
            >
              {(Object.keys(transferTypeLabels) as TransferType[]).map((t) => (
                <label
                  key={t}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 has-[:focus-visible]:ring-offset-1 ${
                    form.transferType === t
                      ? "border-accent-600 bg-brand-50 text-brand-900"
                      : "border-ink-300 bg-white text-ink-700 hover:border-brand-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="transferType"
                    value={t}
                    checked={form.transferType === t}
                    onChange={() => set("transferType", t)}
                    className="sr-only"
                  />
                  {transferTypeLabels[t].label}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-ink-500">
              {transferTypeLabels[form.transferType].hint}
            </p>
          </div>

          <Field
            id="fecha-adquisicion"
            label="Fecha de adquisición"
            help="Cuando compraste, heredaste o recibiste el inmueble (fecha de la escritura o del fallecimiento)."
            error={errors.acquisitionDate}
          >
            <input
              id="fecha-adquisicion"
              type="date"
              className={inputClass}
              value={form.acquisitionDate}
              onChange={(e) => set("acquisitionDate", e.target.value)}
              aria-invalid={!!errors.acquisitionDate}
              aria-describedby={
                errors.acquisitionDate
                  ? "fecha-adquisicion-error"
                  : "fecha-adquisicion-help"
              }
            />
          </Field>

          <Field
            id="fecha-transmision"
            label="Fecha de transmisión (devengo)"
            help="Fecha de la venta, del fallecimiento o de la donación. Puede ser futura si estás simulando."
            error={errors.transferDate}
          >
            <input
              id="fecha-transmision"
              type="date"
              min={MIN_TRANSFER_DATE}
              className={inputClass}
              value={form.transferDate}
              onChange={(e) => set("transferDate", e.target.value)}
              aria-invalid={!!errors.transferDate}
              aria-describedby={
                errors.transferDate
                  ? "fecha-transmision-error"
                  : "fecha-transmision-help"
              }
            />
          </Field>
        </Fieldset>

        <Fieldset
          legend="2. Valores del inmueble"
          description="Los valores catastrales aparecen en el recibo del IBI o en la Sede Electrónica del Catastro."
        >
          <Field
            id="valor-adquisicion"
            label="Valor de adquisición (€)"
            help="El que consta en la escritura de compra o el declarado en su día en herencia/donación. Sin sumar gastos ni impuestos."
            error={errors.acquisitionValue}
          >
            <input
              id="valor-adquisicion"
              inputMode="decimal"
              placeholder="Ej.: 120.000"
              className={inputClass}
              value={form.acquisitionValue}
              onChange={(e) => set("acquisitionValue", e.target.value)}
              aria-invalid={!!errors.acquisitionValue}
              aria-describedby={
                errors.acquisitionValue
                  ? "valor-adquisicion-error"
                  : "valor-adquisicion-help"
              }
            />
          </Field>

          <Field
            id="valor-transmision"
            label="Valor de transmisión (€)"
            help="Precio de venta o valor declarado de la herencia o donación."
            error={errors.transferValue}
          >
            <input
              id="valor-transmision"
              inputMode="decimal"
              placeholder="Ej.: 180.000"
              className={inputClass}
              value={form.transferValue}
              onChange={(e) => set("transferValue", e.target.value)}
              aria-invalid={!!errors.transferValue}
              aria-describedby={
                errors.transferValue
                  ? "valor-transmision-error"
                  : "valor-transmision-help"
              }
            />
          </Field>

          <Field
            id="catastral-total"
            label="Valor catastral total (€)"
            help="Del año de la transmisión. Figura en el recibo del IBI."
            error={errors.cadastralValueTotal}
          >
            <input
              id="catastral-total"
              inputMode="decimal"
              placeholder="Ej.: 60.000"
              className={inputClass}
              value={form.cadastralValueTotal}
              onChange={(e) => set("cadastralValueTotal", e.target.value)}
              aria-invalid={!!errors.cadastralValueTotal}
              aria-describedby={
                errors.cadastralValueTotal
                  ? "catastral-total-error"
                  : "catastral-total-help"
              }
            />
          </Field>

          <Field
            id="catastral-suelo"
            label="Valor catastral del suelo (€)"
            help="La parte de 'valor del suelo' del recibo del IBI. Es la base del impuesto: solo se grava el suelo."
            error={errors.cadastralValueLand}
          >
            <input
              id="catastral-suelo"
              inputMode="decimal"
              placeholder="Ej.: 25.000"
              className={inputClass}
              value={form.cadastralValueLand}
              onChange={(e) => set("cadastralValueLand", e.target.value)}
              aria-invalid={!!errors.cadastralValueLand}
              aria-describedby={
                errors.cadastralValueLand
                  ? "catastral-suelo-error"
                  : "catastral-suelo-help"
              }
            />
          </Field>
        </Fieldset>

        <Fieldset
          legend="3. Titularidad y derecho transmitido"
          description="Si solo transmites una parte o un derecho (usufructo, nuda propiedad), ajustamos el cálculo."
        >
          <Field
            id="titularidad"
            label="Porcentaje de titularidad transmitido (%)"
            help="100 si transmites el inmueble entero. 50 si vendes tu mitad, etc."
            error={errors.ownershipPercentage}
          >
            <input
              id="titularidad"
              inputMode="decimal"
              className={inputClass}
              value={form.ownershipPercentage}
              onChange={(e) => set("ownershipPercentage", e.target.value)}
              aria-invalid={!!errors.ownershipPercentage}
              aria-describedby={
                errors.ownershipPercentage
                  ? "titularidad-error"
                  : "titularidad-help"
              }
            />
          </Field>

          <Field
            id="derecho"
            label="Derecho transmitido"
            help="El usufructo y la nuda propiedad se valoran según la edad del usufructuario o la duración del derecho."
          >
            <select
              id="derecho"
              className={inputClass}
              value={form.rightKind}
              onChange={(e) => set("rightKind", e.target.value as RightKind)}
              aria-describedby="derecho-help"
            >
              <option value="pleno_dominio">Pleno dominio (lo habitual)</option>
              <option value="usufructo_vitalicio">Usufructo vitalicio</option>
              <option value="usufructo_temporal">Usufructo temporal</option>
              <option value="nuda_propiedad">Nuda propiedad</option>
            </select>
          </Field>

          {form.rightKind === "nuda_propiedad" && (
            <Field
              id="usufructo-subyacente"
              label="El usufructo que la grava es…"
            >
              <select
                id="usufructo-subyacente"
                className={inputClass}
                value={form.underlyingUsufruct}
                onChange={(e) =>
                  set(
                    "underlyingUsufruct",
                    e.target.value as "vitalicio" | "temporal"
                  )
                }
              >
                <option value="vitalicio">Vitalicio</option>
                <option value="temporal">Temporal</option>
              </select>
            </Field>
          )}

          {needsAge && (
            <Field
              id="edad-usufructuario"
              label="Edad del usufructuario (años)"
              help="En la fecha de la transmisión."
              error={errors.usufructuaryAge}
            >
              <input
                id="edad-usufructuario"
                inputMode="numeric"
                className={inputClass}
                value={form.usufructuaryAge}
                onChange={(e) => set("usufructuaryAge", e.target.value)}
                aria-invalid={!!errors.usufructuaryAge}
              />
            </Field>
          )}

          {needsDuration && (
            <Field
              id="duracion-usufructo"
              label="Duración del usufructo (años)"
              error={errors.usufructDurationYears}
            >
              <input
                id="duracion-usufructo"
                inputMode="numeric"
                className={inputClass}
                value={form.usufructDurationYears}
                onChange={(e) => set("usufructDurationYears", e.target.value)}
                aria-invalid={!!errors.usufructDurationYears}
              />
            </Field>
          )}
        </Fieldset>

        <Fieldset
          legend="4. Situaciones especiales"
          description="Marcar lo que corresponda ayuda a detectar bonificaciones y exenciones."
        >
          {form.transferType === "herencia" && (
            <>
              <CheckboxRow
                id="vivienda-habitual"
                label="El inmueble era la vivienda habitual de la persona fallecida"
                help="Necesario para la bonificación municipal por herencia de la vivienda habitual, donde exista."
                checked={form.isPrimaryResidenceOfDeceased}
                onChange={(v) => set("isPrimaryResidenceOfDeceased", v)}
              />
              <CheckboxRow
                id="parentesco"
                label="Quien hereda es cónyuge, descendiente o ascendiente"
                checked={form.isCloseRelative}
                onChange={(v) => set("isCloseRelative", v)}
              />
            </>
          )}
          <CheckboxRow
            id="dacion"
            label="Es una dación en pago o ejecución hipotecaria de la vivienda habitual"
            help="Puede estar exenta si el deudor no dispone de otros bienes para cubrir la deuda (art. 105.1.c TRLHL)."
            checked={form.isDacionEnPago}
            onChange={(v) => set("isDacionEnPago", v)}
          />
          <CheckboxRow
            id="fuera-plazo"
            label="Voy a presentar (o presenté) fuera de plazo"
            help="Calcularemos el recargo por presentación extemporánea sin requerimiento previo (art. 27 LGT)."
            checked={form.showLateFiling}
            onChange={(v) => set("showLateFiling", v)}
          />
          {form.showLateFiling && (
            <Field
              id="fecha-presentacion"
              label="Fecha real o prevista de presentación"
              error={errors.filingDate}
            >
              <input
                id="fecha-presentacion"
                type="date"
                className={inputClass}
                value={form.filingDate}
                onChange={(e) => set("filingDate", e.target.value)}
                aria-invalid={!!errors.filingDate}
              />
            </Field>
          )}
        </Fieldset>

        {globalError && (
          <div
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {globalError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-brand-900 px-8 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-brand-800"
          >
            Calcular la plusvalía
          </button>
          <button
            type="button"
            onClick={copyShareLink}
            className="rounded-lg border border-brand-700 px-5 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            {copied ? "¡Enlace copiado!" : "Copiar enlace al cálculo"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg px-4 py-3 text-sm font-medium text-ink-500 underline underline-offset-2 transition-colors hover:text-brand-700"
          >
            Limpiar
          </button>
        </div>
        <p className="text-xs text-ink-500">
          El cálculo se hace en tu navegador: no enviamos ni guardamos tus datos.
          El enlace guarda los datos que introduces en la propia dirección web,
          para que puedas volver a tu simulación o compartirla.
        </p>
      </form>

      <div
        ref={resultsRef}
        tabIndex={-1}
        aria-live="polite"
        className="scroll-mt-6 outline-none"
      >
        {result && <ResultsPanel result={result} />}
      </div>
    </>
  );
}
