import { redirect } from "next/navigation";

/**
 * La raíz lleva directamente a la calculadora. La redirección permanente
 * (308) se declara en next.config.ts; esto es solo un respaldo.
 */
export default function HomePage() {
  redirect("/calculadora-plusvalia");
}
