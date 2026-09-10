import { jsPDF } from "jspdf";
import type { CalculationResult } from "@/lib/plusvalia/types";
import { formatDateES, formatEUR, formatPct } from "@/lib/plusvalia/format";

/**
 * Genera y descarga un informe PDF del cálculo, en el navegador (sin enviar
 * datos al servidor). Se construye con texto vectorial (jsPDF), no como
 * captura de imagen, para que quede nítido y ligero. Marca FINCAX.
 *
 * Es un diferenciador: los competidores no ofrecen informe descargable.
 */

const BRAND = { r: 0x23, g: 0x1f, b: 0x20 };
const RED = { r: 0xee, g: 0x26, b: 0x29 };
const GRAY = { r: 0x7b, g: 0x79, b: 0x79 };

export function downloadPdfReport(result: CalculationResult): void {
  const r = result;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 18; // margen
  const maxW = pageW - M * 2;
  let y = M;

  const setColor = (c: { r: number; g: number; b: number }) =>
    doc.setTextColor(c.r, c.g, c.b);

  function ensure(space: number) {
    if (y + space > pageH - M) {
      doc.addPage();
      y = M;
    }
  }

  function heading(text: string) {
    ensure(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setColor(BRAND);
    doc.text(text, M, y);
    y += 2;
    doc.setDrawColor(0xd3, 0xd2, 0xd2);
    doc.line(M, y, pageW - M, y);
    y += 5;
  }

  function paragraph(text: string, opts: { size?: number; color?: typeof BRAND; bold?: boolean } = {}) {
    const size = opts.size ?? 10;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    setColor(opts.color ?? BRAND);
    const lines = doc.splitTextToSize(text, maxW) as string[];
    for (const line of lines) {
      ensure(size * 0.42 + 1.5);
      doc.text(line, M, y);
      y += size * 0.42 + 1.5;
    }
  }

  function keyValue(label: string, value: string) {
    ensure(6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor(GRAY);
    doc.text(label, M, y);
    setColor(BRAND);
    doc.setFont("helvetica", "bold");
    doc.text(value, pageW - M, y, { align: "right" });
    y += 5.5;
  }

  // ── Cabecera: wordmark + título ──────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setColor(BRAND);
  doc.text("finca", M, y + 4);
  const fincaW = doc.getTextWidth("finca");
  setColor(RED);
  doc.text("x", M + fincaW, y + 4);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  setColor(GRAY);
  doc.text("Informe orientativo de Plusvalía Municipal (IIVTNU)", pageW - M, y, {
    align: "right",
  });
  doc.text(
    `${r.rules.municipalityName} · generado el ${formatDateES(
      new Date().toISOString().slice(0, 10)
    )}`,
    pageW - M,
    y + 4.5,
    { align: "right" }
  );
  y += 12;
  doc.setDrawColor(BRAND.r, BRAND.g, BRAND.b);
  doc.setLineWidth(0.5);
  doc.line(M, y, pageW - M, y);
  doc.setLineWidth(0.2);
  y += 8;

  // ── Resultado principal ──────────────────────────────────────────────
  const outcomeText =
    r.outcome === "not_subject_no_gain"
      ? "Operación NO sujeta: no habría que pagar plusvalía"
      : r.outcome === "possibly_exempt"
        ? "Posible exención: cuota estimada 0 €"
        : `Cuota estimada: ${formatEUR(r.finalTax)}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setColor(r.outcome === "taxable" ? BRAND : { r: 0x1a, g: 0x7f, b: 0x37 });
  ensure(10);
  doc.text(outcomeText, M, y);
  y += 8;

  paragraph(
    `Datos de la operación: ${transferLabel(r.input.transferType)} con fecha de ` +
      `devengo ${formatDateES(r.input.transferDate)}, adquirido el ` +
      `${formatDateES(r.input.acquisitionDate)}. Municipio: ${r.rules.municipalityName}` +
      `${r.rules.verified ? " (ordenanza verificada)" : " (estimación por máximos legales)"}.`,
    { color: GRAY }
  );
  y += 2;

  // ── Comparación de métodos ───────────────────────────────────────────
  heading("Comparación de los dos métodos de cálculo");
  paragraph(
    `Tipo de gravamen aplicado: ${formatPct(r.rules.taxRate)}` +
      `${r.rules.verified ? "" : " (máximo legal)"}. La ley permite tributar por la base más baja (art. 107.5 TRLHL).`,
    { color: GRAY, size: 9 }
  );
  y += 1;
  keyValue(
    `Método objetivo (base ${formatEUR(r.objectiveMethod.taxableBase)})` +
      (r.chosenMethod === "objective" && r.outcome === "taxable" ? " — APLICADO" : ""),
    formatEUR(r.objectiveMethod.grossTax)
  );
  keyValue(
    `Método real (base ${formatEUR(r.realMethod.taxableBase)})` +
      ((r.chosenMethod === "real" || r.outcome === "not_subject_no_gain") ? " — APLICADO" : ""),
    formatEUR(r.realMethod.grossTax)
  );
  if (r.outcome === "taxable" && r.savingsVsOtherMethod > 0) {
    paragraph(
      `Ahorro por elegir el método más favorable: ${formatEUR(r.savingsVsOtherMethod)}.`,
      { size: 9, color: GRAY }
    );
  }
  if (r.realRightValuationNote) {
    y += 1;
    paragraph(`Derecho real: ${r.realRightValuationNote}`, { size: 9, color: GRAY });
  }
  y += 3;

  // ── Bonificaciones ───────────────────────────────────────────────────
  if (r.bonusesApplied.length > 0) {
    heading("Bonificaciones aplicadas");
    for (const b of r.bonusesApplied) {
      paragraph(
        `${b.rule.label}: −${formatPct(b.percentage)} (${formatEUR(b.amount)}).`,
        { bold: true, size: 10 }
      );
      if (b.conditional) {
        for (const c of b.rule.conditions) {
          paragraph(`• ${c}`, { size: 8.5, color: GRAY });
        }
      }
      y += 1;
    }
  }

  // ── Plazos, sujeto pasivo y recargo ──────────────────────────────────
  heading("Plazos y pago");
  paragraph(r.deadline.description, { size: 9 });
  if (r.deadline.estimatedDeadline) {
    keyValue("Fecha límite estimada", formatDateES(r.deadline.estimatedDeadline));
  }
  paragraph(`¿Quién paga? ${r.taxpayerNote}`, { size: 9, color: GRAY });
  if (r.surcharge?.applicable && r.surcharge.surchargeAmount !== undefined) {
    y += 1;
    paragraph(
      `Presentación fuera de plazo: recargo de ${formatEUR(r.surcharge.surchargeAmount)}` +
        (r.surcharge.reducedSurchargeAmount !== undefined
          ? ` (con la reducción del 25 % del art. 27.5 LGT: ${formatEUR(
              r.surcharge.reducedSurchargeAmount
            )})`
          : "") +
        (r.surcharge.interestAmount
          ? ` más intereses de demora ≈ ${formatEUR(r.surcharge.interestAmount)}`
          : "") +
        ".",
      { size: 9 }
    );
  }
  y += 3;

  // ── Fuentes ──────────────────────────────────────────────────────────
  heading("Fuentes normativas");
  for (const s of r.sources) {
    paragraph(`• ${s}`, { size: 8, color: GRAY });
  }
  paragraph(
    `• Datos municipales revisados por última vez el ${formatDateES(r.rules.lastVerifiedAt)}.`,
    { size: 8, color: GRAY }
  );
  y += 3;

  // ── Aviso legal + pie ────────────────────────────────────────────────
  paragraph(
    "Este informe es una estimación orientativa y no constituye asesoramiento fiscal. " +
      "La cuota definitiva la determina la administración competente conforme a la ordenanza fiscal vigente.",
    { size: 8, color: GRAY }
  );

  // Pie de página en todas las páginas.
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(GRAY);
    doc.text(
      "FINCAX · Sevilla · fincax.es · fincaxsevilla@gmail.com",
      M,
      pageH - 8
    );
    doc.text(`${p} / ${pages}`, pageW - M, pageH - 8, { align: "right" });
  }

  const slug = r.rules.municipalityName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  doc.save(`informe-plusvalia-${slug}-${r.input.transferDate}.pdf`);
}

function transferLabel(t: CalculationResult["input"]["transferType"]): string {
  return t === "compraventa" ? "compraventa" : t === "herencia" ? "herencia" : "donación";
}
