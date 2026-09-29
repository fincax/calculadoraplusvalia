/**
 * Layout de la versión embebible: marca el documento para que su fondo sea
 * transparente (ver `.embed-root` en globals.css). Así, dentro del iframe,
 * la tarjeta de la calculadora se funde con la web anfitriona, también
 * cuando se superpone a una banda de color (como en fincax.es).
 */
export default function EmbedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="embed-root">{children}</div>;
}
