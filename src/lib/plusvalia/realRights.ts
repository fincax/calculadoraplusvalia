import { PlusvaliaInputError } from "./errors";
import type { RealRightInput } from "./types";

/**
 * Valoración de derechos reales de goce limitativos del dominio.
 *
 * El art. 107.2.b) TRLHL remite a las normas del Impuesto sobre
 * Transmisiones Patrimoniales y AJD (art. 10.2 TRLITPAJD):
 *  - Usufructo vitalicio: 70 % del valor si el usufructuario tiene menos
 *    de 20 años, minorando un 1 % por cada año que exceda de 19,
 *    con un mínimo del 10 % (regla práctica: 89 − edad, entre 10 y 70).
 *  - Usufructo temporal: 2 % por cada año de duración, máximo 70 %.
 *  - Nuda propiedad: diferencia hasta el 100 % del valor del usufructo.
 */

export interface RealRightValuation {
  /** Porcentaje del valor del pleno dominio que representa el derecho (0–100). */
  percentage: number;
  note: string;
}

export function valuateRealRight(right?: RealRightInput): RealRightValuation {
  if (!right || right.kind === "pleno_dominio") {
    return { percentage: 100, note: "Pleno dominio: 100 % del valor." };
  }

  switch (right.kind) {
    case "usufructo_vitalicio": {
      const age = requireAge(right.usufructuaryAge);
      const pct = lifeUsufructPercentage(age);
      return {
        percentage: pct,
        note: `Usufructo vitalicio (usufructuario de ${age} años): ${pct} % del valor (regla 89 − edad, mín. 10 %, máx. 70 %; art. 10.2 TRLITPAJD).`,
      };
    }
    case "usufructo_temporal": {
      const years = requireDuration(right.usufructDurationYears);
      const pct = temporalUsufructPercentage(years);
      return {
        percentage: pct,
        note: `Usufructo temporal de ${years} años: ${pct} % del valor (2 % por año, máx. 70 %; art. 10.2 TRLITPAJD).`,
      };
    }
    case "nuda_propiedad": {
      let usufructPct: number;
      if (right.underlyingUsufruct === "temporal") {
        const years = requireDuration(right.usufructDurationYears);
        usufructPct = temporalUsufructPercentage(years);
      } else {
        const age = requireAge(right.usufructuaryAge);
        usufructPct = lifeUsufructPercentage(age);
      }
      const pct = round2(100 - usufructPct);
      return {
        percentage: pct,
        note: `Nuda propiedad: ${pct} % del valor (100 % menos el ${usufructPct} % del usufructo que la grava; art. 10.2 TRLITPAJD).`,
      };
    }
  }
}

export function lifeUsufructPercentage(age: number): number {
  return clamp(89 - age, 10, 70);
}

export function temporalUsufructPercentage(years: number): number {
  return clamp(Math.ceil(years) * 2, 2, 70);
}

function requireAge(age?: number): number {
  if (age === undefined || !Number.isFinite(age) || age < 0 || age > 130) {
    throw new PlusvaliaInputError(
      "Para valorar un usufructo vitalicio se necesita la edad del usufructuario."
    );
  }
  return Math.floor(age);
}

function requireDuration(years?: number): number {
  if (years === undefined || !Number.isFinite(years) || years <= 0) {
    throw new PlusvaliaInputError(
      "Para valorar un usufructo temporal se necesita su duración en años."
    );
  }
  return years;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
