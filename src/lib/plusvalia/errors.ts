/**
 * Error de datos de entrada del motor de cálculo. Se extrae a su propio
 * módulo para que las capas inferiores (coeficientes, derechos reales) puedan
 * lanzarlo sin crear una dependencia circular con `engine.ts`, y para que la
 * interfaz muestre siempre el mensaje concreto (no un genérico).
 */
export class PlusvaliaInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlusvaliaInputError";
  }
}
