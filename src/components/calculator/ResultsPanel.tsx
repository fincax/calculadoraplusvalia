"use client";

import type {
  CalculationResult,
  CalculationStep,
  MethodResult,
} from "@/lib/plusvalia/types";
import {
  formatDateES,
  formatEUR,
  formatNumber,
  formatPct,
} from "@/lib/plusvalia/format";
import LeadCapture from "./LeadCapture";

function StepList({ steps }: { steps: CalculationStep[] }) {
  return (
    <dl className="mt-3 space-y-2 text-sm">
      {steps.map((s, i) => (
        <div key={i} className="flex items-baseline justify-between gap-4">
          <div>
            <dt className="font-medium text-ink-900">{s.label}</dt>
            <dd className="text-xs text-ink-500">{s.detail}</dd>
          </div>
          {s.amount !== undefined && (
            <dd className="whitespace-nowrap font-semibold tabular-nums text-ink-900">
              {s.kind === "money"
                ? formatEUR(s.amount)
                : s.kind === "years"
                  ? `${s.amount} años`
                  : formatNumber(s.amount, 4)}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}

function MethodCard({
  title,
  legalBasis,
  method,
  chosen,
}: {
  title: string;
  legalBasis: string;
  method: MethodResult;
  chosen: boolean;
}) {
  return (
    <article
      className={`rounded-xl border p-5 ${
        chosen
          ? "border-brand-600 bg-brand-50 ring-2 ring-brand-200"
          : "border-ink-300 bg-white"
      }`}
      aria-label={`${title}${chosen ? " (método aplicado)" : ""}`}
    >
      <header className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-brand-900">{title}</h4>
        {chosen && (
          <span className="rounded-full bg-brand-700 px-2.5 py-0.5 text-xs font-semibold text-white">
            Aplicado
          </span>
        )}
      </header>
      <p className="mt-0.5 text-xs text-ink-500">{legalBasis}</p>
      <StepList steps={method.steps} />
      <p className="mt-4 border-t border-ink-300 pt-3 text-right text-lg font-bold tabular-nums text-brand-900">
        {formatEUR(method.grossTax)}
      </p>
    </article>
  );
}

export default function ResultsPanel({ result }: { result: CalculationResult }) {
  const r = result;
  const isNotSubject = r.outcome === "not_subject_no_gain";
  const isExempt = r.outcome === "possibly_exempt";

  return (
    <section
      aria-labelledby="titulo-resultado"
      className="print-report mt-10 rounded-2xl border border-ink-300 bg-white p-6 shadow-sm sm:p-8"
    >
      {/* Cabecera solo para impresión */}
      <div className="print-only mb-6 border-b border-ink-300 pb-4">
        <p className="text-lg font-bold">
          FINCAX — Informe orientativo de Plusvalía Municipal (IIVTNU)
        </p>
        <p className="text-sm text-ink-500">
          {r.rules.municipalityName} · transmisión del{" "}
          {formatDateES(r.input.transferDate)} · generado el{" "}
          {formatDateES(new Date().toISOString().slice(0, 10))}
        </p>
      </div>

      <header>
        <h2 id="titulo-resultado" className="text-2xl font-bold text-brand-900">
          Resultado de tu cálculo
        </h2>

        {isNotSubject ? (
          <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-5">
            <p className="text-xl font-bold text-green-900">
              Operación no sujeta: no habría que pagar plusvalía
            </p>
            <p className="mt-2 text-sm leading-relaxed text-green-900">
              No existe incremento de valor del suelo entre la adquisición y la
              transmisión ({formatEUR(r.realGainOnLand)}), por lo que la
              operación no está sujeta al impuesto (art. 104.5 TRLHL).
            </p>
          </div>
        ) : isExempt ? (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-5">
            <p className="text-xl font-bold text-amber-900">
              Posible exención: cuota estimada 0 €
            </p>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              La dación en pago o ejecución hipotecaria de la vivienda habitual
              puede estar exenta (art. 105.1.c TRLHL). Sin la exención, la cuota
              sería de {formatEUR(r.grossTax)}.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-brand-900 p-6 text-white">
            <p className="text-sm uppercase tracking-wide text-brand-200">
              Cuota estimada en {r.rules.municipalityName}
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums">
              {formatEUR(r.finalTax)}
            </p>
            <p className="mt-2 text-sm text-brand-100">
              Método aplicado:{" "}
              <strong>
                {r.chosenMethod === "objective"
                  ? "objetivo (valor catastral × coeficiente)"
                  : "real (ganancia efectiva del suelo)"}
              </strong>
              {r.savingsVsOtherMethod > 0 && (
                <>
                  {" "}
                  · Te ahorras {formatEUR(r.savingsVsOtherMethod)} frente al otro
                  método
                </>
              )}
              {r.totalBonusAmount > 0 && (
                <>
                  {" "}
                  · Bonificaciones aplicadas: −{formatEUR(r.totalBonusAmount)}
                </>
              )}
            </p>
          </div>
        )}
      </header>

      {r.warnings.length > 0 && (
        <div
          className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4"
          role="note"
          aria-label="Avisos importantes"
        >
          <p className="text-sm font-semibold text-amber-900">
            Ten en cuenta:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {r.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-brand-900">
          Comparación de los dos métodos de cálculo
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          La ley permite tributar por la base más baja (art. 107.5 TRLHL). Tipo
          de gravamen de {r.rules.municipalityName}:{" "}
          <strong>{formatPct(r.rules.taxRate)}</strong>
          {!r.rules.verified && " (máximo legal, ordenanza sin verificar)"}.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <MethodCard
            title="Método objetivo"
            legalBasis="Art. 107 TRLHL: valor catastral del suelo × coeficiente por años de tenencia"
            method={r.objectiveMethod}
            chosen={!isNotSubject && r.chosenMethod === "objective"}
          />
          <MethodCard
            title="Método real (estimación directa)"
            legalBasis="Arts. 104.5 y 107.5 TRLHL: ganancia real imputable al suelo"
            method={r.realMethod}
            chosen={isNotSubject || r.chosenMethod === "real"}
          />
        </div>
        {r.realRightValuationNote && (
          <p className="mt-3 text-sm text-ink-700">
            <strong>Derecho real:</strong> {r.realRightValuationNote}
          </p>
        )}
      </div>

      {r.bonusesApplied.length > 0 && (
        <div className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <h3 className="text-lg font-semibold text-brand-900">
            Bonificaciones aplicadas
          </h3>
          {r.bonusesApplied.map((b) => (
            <div key={b.rule.id} className="mt-3">
              <p className="text-sm font-medium text-ink-900">
                {b.rule.label}:{" "}
                <strong>
                  −{formatPct(b.percentage)} ({formatEUR(b.amount)})
                </strong>
              </p>
              {b.conditional && (
                <>
                  <p className="mt-1 text-xs font-semibold text-amber-800">
                    Sujeta a estos requisitos (verifícalos antes de contar con
                    ella):
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-xs text-ink-700">
                    {b.rule.conditions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {r.rules.additionalBonusNotes && r.rules.additionalBonusNotes.length > 0 && (
        <div className="mt-4 text-sm text-ink-700">
          {r.rules.additionalBonusNotes.map((n, i) => (
            <p key={i}>ℹ️ {n}</p>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-ink-300 p-5">
          <h3 className="font-semibold text-brand-900">Plazo de presentación</h3>
          <p className="mt-2 text-sm text-ink-700">{r.deadline.description}</p>
          {r.deadline.estimatedDeadline && (
            <p className="mt-2 text-sm">
              Fecha límite estimada:{" "}
              <strong>{formatDateES(r.deadline.estimatedDeadline)}</strong>
            </p>
          )}
          <p className="mt-2 text-xs text-ink-500">{r.deadline.legalBasis}</p>
          {r.rules.administrationMode === "self_assessment" && (
            <p className="mt-2 text-xs text-ink-500">
              En {r.rules.municipalityName} el impuesto se gestiona por
              autoliquidación: debes calcular e ingresar la cuota tú mismo en
              plazo.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-ink-300 p-5">
          <h3 className="font-semibold text-brand-900">
            ¿Quién paga el impuesto?
          </h3>
          <p className="mt-2 text-sm text-ink-700">{r.taxpayerNote}</p>
        </div>
      </div>

      {r.surcharge && (
        <div
          className={`mt-4 rounded-xl border p-5 ${
            r.surcharge.applicable
              ? "border-red-300 bg-red-50"
              : "border-green-300 bg-green-50"
          }`}
        >
          <h3
            className={`font-semibold ${
              r.surcharge.applicable ? "text-red-900" : "text-green-900"
            }`}
          >
            Recargo por presentación fuera de plazo
          </h3>
          <p className="mt-2 text-sm text-ink-900">{r.surcharge.description}</p>
          {r.surcharge.applicable && r.surcharge.surchargeAmount !== undefined && (
            <p className="mt-2 text-sm">
              Recargo estimado:{" "}
              <strong>{formatEUR(r.surcharge.surchargeAmount)}</strong> → total
              con recargo:{" "}
              <strong>
                {formatEUR(r.finalTax + r.surcharge.surchargeAmount)}
              </strong>
            </p>
          )}
          {r.surcharge.interestNote && (
            <p className="mt-1 text-xs text-ink-700">{r.surcharge.interestNote}</p>
          )}
          <p className="mt-2 text-xs text-ink-500">{r.surcharge.legalBasis}</p>
        </div>
      )}

      {r.exemptionNotices.length > 0 && (
        <details className="mt-6 rounded-xl border border-ink-300 p-5">
          <summary className="cursor-pointer font-semibold text-brand-900">
            Otras exenciones y supuestos de no sujeción que conviene conocer
          </summary>
          <ul className="mt-3 space-y-3">
            {r.exemptionNotices.map((e) => (
              <li key={e.id} className="text-sm">
                <p className="font-medium text-ink-900">{e.label}</p>
                <p className="text-ink-700">{e.description}</p>
                <p className="text-xs text-ink-500">{e.legalBasis}</p>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="mt-8 border-t border-ink-300 pt-5">
        <h3 className="text-sm font-semibold text-ink-900">
          Fuentes normativas utilizadas
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-ink-500">
          {r.sources.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
          <li>
            Datos municipales revisados por última vez el{" "}
            {formatDateES(r.rules.lastVerifiedAt)}.
          </li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-ink-500">
          Este resultado es una estimación orientativa y no constituye
          asesoramiento fiscal. La cuota definitiva depende de la ordenanza
          fiscal aplicable y de la comprobación administrativa.
        </p>
      </div>

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-brand-700 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Imprimir o guardar en PDF
        </button>
      </div>

      <LeadCapture result={r} />
    </section>
  );
}
