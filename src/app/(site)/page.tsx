import { redirect } from "next/navigation";

/**
 * Esta aplicación es una herramienta de la sección «Herramientas
 * profesionales» de fincax.es, no una web paralela: la raíz redirige
 * directamente a la calculadora.
 */
export default function HomePage() {
  redirect("/calculadora-plusvalia");
}
