/**
 * Lee una variable de entorno tratando el valor vacío como «no definida».
 *
 * La plantilla `.env.example` deja muchas claves en blanco (`LEAD_LOG_FILE=`);
 * al copiarla, esas variables EXISTEN con valor "" y `process.env.X ?? def`
 * no aplica el valor por defecto. Con un fichero de ruta "" el lead no se
 * guardaba (ENOENT) — este helper evita esa trampa en todas las lecturas.
 */
export function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}
