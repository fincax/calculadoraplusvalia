/**
 * Smoke test E2E con Chromium (playwright-core):
 * rellena la calculadora con un caso conocido y comprueba la cuota.
 *
 * Uso: npm run build && npm start &  (servidor en :3000)
 *      node scripts/smoke-e2e.mjs [ruta-ejecutable-chromium]
 */
import { chromium } from "playwright-core";

const executablePath =
  process.argv[2] ?? process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({ executablePath });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/calculadora-plusvalia`, { waitUntil: "networkidle" });

  // Caso de referencia (mismo que en engine.test.ts): herencia en Sevilla,
  // vivienda habitual, VCS 9.000 € → cuota esperada 47,75 €.
  await page.selectOption("#municipio", "sevilla");
  await page.getByText("Herencia", { exact: true }).click();
  await page.fill("#fecha-adquisicion", "2000-05-10");
  await page.fill("#fecha-transmision", "2024-03-01");
  await page.fill("#valor-adquisicion", "40.000");
  await page.fill("#valor-transmision", "120.000");
  await page.fill("#catastral-total", "50.000");
  await page.fill("#catastral-suelo", "9.000");
  await page.check("#vivienda-habitual");
  await page.check("#parentesco");
  await page.click("button[type=submit]");
  await page.waitForSelector("#titulo-resultado");

  const cuota = (
    await page.textContent("section[aria-labelledby=titulo-resultado] .text-4xl")
  )?.trim();
  if (!cuota?.includes("47,75")) {
    throw new Error(`Cuota inesperada: "${cuota}" (se esperaba 47,75 €)`);
  }
  console.log(`OK — cuota mostrada: ${cuota}`);
} finally {
  await browser.close();
}
