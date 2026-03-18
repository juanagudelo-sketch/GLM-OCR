import fs from "fs";
import path from "path";
import { ZHIPU_API_KEY, ZHIPU_OCR_URL, ZHIPU_OCR_MODEL } from "../config/zhipu.js";

/**
 * Convierte un archivo a data URI base64.
 */
function toDataUri(filePath) {
  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  const mimeMap = { jpg: "jpeg", jpeg: "jpeg", png: "png", webp: "webp", bmp: "bmp", pdf: "pdf" };
  const mime = ext === "pdf" ? "application/pdf" : `image/${mimeMap[ext] || "jpeg"}`;
  const base64 = fs.readFileSync(filePath).toString("base64");
  return `data:${mime};base64,${base64}`;
}

/**
 * Extrae texto de un archivo usando el endpoint oficial GLM-OCR (layout_parsing).
 * Soporta imágenes y PDFs directamente, sin necesidad de slices.
 * @param {string} filePath - Ruta al archivo
 * @returns {Promise<string>} Texto en Markdown extraído por GLM-OCR
 */
export async function extraerTextoOCR(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const dataUri = toDataUri(filePath);

  console.log(`  Enviando a GLM-OCR: ${path.basename(filePath)}`);

  const response = await fetch(ZHIPU_OCR_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ZHIPU_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ZHIPU_OCR_MODEL,
      file: dataUri,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GLM-OCR error ${response.status}: ${err}`);
  }

  const data = await response.json();

  // El endpoint devuelve md_results con el Markdown completo del documento
  if (data.md_results) {
    return data.md_results;
  }

  // Fallback: concatenar contenido de layout_details si no hay md_results
  if (data.layout_details) {
    return data.layout_details
      .flat()
      .map((item) => item.content || "")
      .filter(Boolean)
      .join("\n");
  }

  throw new Error("GLM-OCR no devolvió contenido reconocible");
}
