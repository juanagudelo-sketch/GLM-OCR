import fs from "fs";
import path from "path";
import { model } from "../config/gemini.js";
import { buildFacturaPrompt } from "./promptBuilder.js";
import { parseJsonResponse } from "../utils/jsonParser.js";

const LOGS_DIR = "logs";

function guardarLog(nombre, contenido) {
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(LOGS_DIR, `${timestamp}_${nombre}.txt`);
  fs.writeFileSync(filePath, contenido, "utf-8");
  console.log(`  [LOG] Guardado: ${filePath}`);
}

export async function extraerDatosFactura(textoOCR) {
  const prompt = buildFacturaPrompt(textoOCR);

  // Log de lo que se le envía a Gemini
  guardarLog("ocr_output", textoOCR);
  guardarLog("gemini_input", prompt);

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  // Log de lo que responde Gemini
  guardarLog("gemini_output", rawText);

  return parseJsonResponse(rawText);
}
