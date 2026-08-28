import { STATE_COEFFICIENT_TABLES } from "@/lib/plusvalia/coefficients";

const BRACKET_LABELS: Array<[string, string]> = [
  ["lt1", "Inferior a 1 año"],
  ["1", "1 año"],
  ["2", "2 años"],
  ["3", "3 años"],
  ["4", "4 años"],
  ["5", "5 años"],
  ["6", "6 años"],
  ["7", "7 años"],
  ["8", "8 años"],
  ["9", "9 años"],
  ["10", "10 años"],
  ["11", "11 años"],
  ["12", "12 años"],
  ["13", "13 años"],
  ["14", "14 años"],
  ["15", "15 años"],
  ["16", "16 años"],
  ["17", "17 años"],
  ["18", "18 años"],
  ["19", "19 años"],
  ["gte20", "20 años o más"],
];

/**
 * Tabla de coeficientes máximos estatales vigente (art. 107.4 TRLHL),
 * renderizada desde la misma fuente de datos que usa el motor de cálculo.
 */
export default function CoefficientTable() {
  const current = STATE_COEFFICIENT_TABLES[STATE_COEFFICIENT_TABLES.length - 1];
  const half = Math.ceil(BRACKET_LABELS.length / 2);
  const columns = [BRACKET_LABELS.slice(0, half), BRACKET_LABELS.slice(half)];

  return (
    <div>
      <div className="grid gap-x-8 sm:grid-cols-2">
        {columns.map((rows, i) => (
          <div key={i} className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-300 text-left text-xs uppercase tracking-wide text-ink-500">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Periodo de generación
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Coeficiente
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([key, label]) => (
                  <tr key={key} className="border-b border-ink-100">
                    <td className="py-1.5 pr-4 text-ink-700">{label}</td>
                    <td className="py-1.5 text-right font-semibold tabular-nums text-ink-900">
                      {current.values[key].toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-500">
        Coeficientes máximos vigentes según la fecha de devengo ({current.label}
        ). Para transmisiones de 2021–2023 la calculadora aplica automáticamente
        la tabla vigente en aquel momento. En periodos inferiores a un año, el
        coeficiente se prorratea por meses completos.
      </p>
    </div>
  );
}
