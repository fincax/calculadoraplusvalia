import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo trata FINCAX los datos personales: la calculadora funciona sin cookies ni registro y solo tratamos datos si nos los envías voluntariamente.",
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 leading-relaxed text-ink-700">
      <h1 className="text-3xl font-bold text-brand-900">
        Política de privacidad
      </h1>

      <h2 className="mt-8 text-xl font-semibold text-brand-900">
        La calculadora no envía tus datos
      </h2>
      <p className="mt-2">
        Todos los cálculos de la Calculadora de Plusvalía Municipal se realizan
        localmente en tu navegador. Los importes, fechas y valores catastrales
        que introduces <strong>no se envían ni se almacenan</strong> en nuestros
        servidores. Este sitio no utiliza cookies de seguimiento ni analítica de
        terceros, por lo que no necesita banner de cookies.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-brand-900">
        Datos que sí tratamos: los que tú nos envías
      </h2>
      <p className="mt-2">
        Si decides usar el formulario de contacto («Quiero que me llaméis»), el
        botón de WhatsApp o el email, trataremos los datos que nos facilites
        (nombre y medio de contacto, junto con el resumen del cálculo que
        aceptes compartir) con la única finalidad de responder a tu consulta y,
        en su caso, prestarte el servicio solicitado.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        <li>
          <strong>Responsable:</strong> FINCAX (Sevilla) ·
          fincaxsevilla@gmail.com
        </li>
        <li>
          <strong>Base jurídica:</strong> tu consentimiento expreso (art. 6.1.a
          RGPD), que puedes retirar en cualquier momento.
        </li>
        <li>
          <strong>Conservación:</strong> el tiempo necesario para atender tu
          consulta y las obligaciones legales aplicables.
        </li>
        <li>
          <strong>Destinatarios:</strong> no cedemos tus datos a terceros salvo
          obligación legal. Si contactas por WhatsApp, aplican las condiciones
          de WhatsApp (Meta).
        </li>
        <li>
          <strong>Derechos:</strong> puedes ejercer el acceso, rectificación,
          supresión, oposición, limitación y portabilidad escribiendo a
          fincaxsevilla@gmail.com. También puedes reclamar ante la AEPD
          (aepd.es).
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-brand-900">
        Medición de uso de la calculadora embebida
      </h2>
      <p className="mt-2">
        Cuando la calculadora se integra en la web de un tercero, FINCAX realiza
        una medición propia y agregada de su uso, <strong>sin cookies</strong> y
        sin recoger datos personales ni los importes que introduces. Solo se
        registra el tipo de evento (una vista o un cálculo), el municipio
        seleccionado y el dominio de la web que la integra, con el fin de conocer
        el uso del servicio por parte de los sitios colaboradores. Estos datos no
        permiten identificarte y no se ceden a terceros.
      </p>
    </div>
  );
}
