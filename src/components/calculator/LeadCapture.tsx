"use client";

import { useState } from "react";
import type { CalculationResult } from "@/lib/plusvalia/types";
import { formatDateES, formatEUR } from "@/lib/plusvalia/format";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER; // p. ej. "34600000000"

function summaryText(r: CalculationResult): string {
  const outcome =
    r.outcome === "not_subject_no_gain"
      ? "posible no sujeción (sin incremento de valor)"
      : r.outcome === "possibly_exempt"
        ? "posible exención"
        : `cuota estimada ${formatEUR(r.finalTax)}`;
  return (
    `Hola FINCAX, he usado vuestra calculadora de plusvalía municipal. ` +
    `Municipio: ${r.rules.municipalityName}. Transmisión: ${r.input.transferType} ` +
    `con fecha ${formatDateES(r.input.transferDate)}. Resultado: ${outcome}. ` +
    `Me gustaría que me ayudarais con mi caso.`
  );
}

export default function LeadCapture({ result }: { result: CalculationResult }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "sending" | "ok" | "error" | "invalid"
  >("idle");

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!name.trim() || !contact.trim() || !consent) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          consent: true,
          summary: {
            municipality: result.rules.municipalityName,
            transferType: result.input.transferType,
            transferDate: result.input.transferDate,
            outcome: result.outcome,
            finalTax: result.finalTax,
          },
        }),
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  const whatsappHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summaryText(result))}`
    : undefined;
  const mailtoHref = `mailto:fincaxsevilla@gmail.com?subject=${encodeURIComponent(
    "Consulta plusvalía municipal — " + result.rules.municipalityName
  )}&body=${encodeURIComponent(summaryText(result))}`;

  return (
    <aside
      aria-labelledby="titulo-lead"
      className="no-print mt-8 rounded-xl bg-brand-50 p-6 ring-1 ring-brand-200"
    >
      <h3 id="titulo-lead" className="text-lg font-bold text-brand-900">
        ¿Quieres pagar lo justo y sin errores?
      </h3>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-700">
        En FINCAX revisamos tu caso, preparamos la autoliquidación con el método
        más favorable y, si vas a vender, te acompañamos en toda la operación.
        La primera consulta es gratuita y sin compromiso.
      </p>

      {status === "ok" ? (
        <p
          role="status"
          className="mt-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-900"
        >
          ¡Gracias! Hemos recibido tu solicitud y te contactaremos muy pronto.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2" noValidate>
          <div>
            <label
              htmlFor="lead-nombre"
              className="block text-sm font-medium text-ink-900"
            >
              Tu nombre
            </label>
            <input
              id="lead-nombre"
              autoComplete="name"
              className="mt-1 block w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="lead-contacto"
              className="block text-sm font-medium text-ink-900"
            >
              Teléfono o email
            </label>
            <input
              id="lead-contacto"
              autoComplete="tel"
              className="mt-1 block w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          <div className="flex items-start gap-2 sm:col-span-2">
            <input
              id="lead-consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-600"
              required
            />
            <label htmlFor="lead-consent" className="text-xs text-ink-700">
              Acepto que FINCAX use estos datos únicamente para responder a mi
              consulta, conforme a la{" "}
              <a href="/politica-privacidad" className="underline">
                política de privacidad
              </a>
              .
            </label>
          </div>
          {status === "invalid" && (
            <p role="alert" className="text-xs font-medium text-red-700 sm:col-span-2">
              Completa tu nombre, un medio de contacto y acepta la política de
              privacidad.
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="text-xs font-medium text-red-700 sm:col-span-2">
              No se pudo enviar. Inténtalo de nuevo o escríbenos directamente a
              fincaxsevilla@gmail.com.
            </p>
          )}
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-lg bg-accent-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-500 disabled:opacity-60"
            >
              {status === "sending" ? "Enviando…" : "Quiero que me llaméis"}
            </button>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Escribir por WhatsApp
              </a>
            )}
            <a
              href={mailtoHref}
              className="rounded-lg border border-brand-700 px-6 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-white"
            >
              Enviar email
            </a>
          </div>
        </form>
      )}
    </aside>
  );
}
