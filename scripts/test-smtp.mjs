/**
 * Prueba el envío de email de los leads con la configuración del .env.
 * Uso en el servidor:  cd /opt/fincax/app && node --env-file=.env scripts/test-smtp.mjs
 * Comprueba la conexión y el usuario/contraseña con Gmail (u otro SMTP) y
 * envía un email de prueba a LEAD_TO. No muestra la contraseña.
 */
import { createTransport } from "nodemailer";

const { LEAD_SMTP_HOST: host, LEAD_SMTP_USER: user, LEAD_SMTP_PASS: pass } =
  process.env;
if (!host || !user || !pass) {
  console.error("Faltan LEAD_SMTP_HOST, LEAD_SMTP_USER o LEAD_SMTP_PASS en el .env");
  process.exit(1);
}
const port = Number(process.env.LEAD_SMTP_PORT ?? 587);
const secure = process.env.LEAD_SMTP_SECURE === "true";
const to = process.env.LEAD_TO ?? "fincaxsevilla@gmail.com";
console.log(`Conectando a ${host}:${port} (secure=${secure}) como ${user}…`);

const transport = createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  connectionTimeout: 8_000,
  greetingTimeout: 8_000,
  socketTimeout: 10_000,
});

try {
  await transport.verify();
  console.log("OK: conexión y credenciales correctas.");
  await transport.sendMail({
    from: process.env.LEAD_FROM ?? user,
    to,
    subject: "Prueba — Calculadora de Plusvalía",
    text: "Si recibes este email, el envío de contactos de la calculadora funciona.",
  });
  console.log(`OK: email de prueba enviado a ${to}.`);
} catch (err) {
  console.error(`FALLO: ${err.code ?? ""} ${err.message}`);
  process.exit(1);
}
