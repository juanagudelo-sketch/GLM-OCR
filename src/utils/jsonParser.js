/**
 * Extrae y parsea el JSON de la respuesta del modelo.
 * Gemini a veces envuelve el JSON en bloques ```json ... ```
 */
export function parseJsonResponse(rawText) {
  const cleaned = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
}
