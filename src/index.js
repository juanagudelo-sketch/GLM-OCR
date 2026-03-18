import fs from "fs";
import path from "path";
import { extraerTextoOCR } from "./services/ocrService.js";
import { extraerDatosFactura } from "./services/facturaService.js";

const FORMATOS_SOPORTADOS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

// Uso: node src/index.js <ruta-archivo>
const filePath = process.argv[2];

async function main() {
  if (!filePath) {
    console.error("Uso: node src/index.js <ruta-imagen-o-pdf>");
    console.error("Formatos soportados: jpg, jpeg, png, webp, pdf");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Archivo no encontrado: ${filePath}`);
    process.exit(1);
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!FORMATOS_SOPORTADOS.includes(ext)) {
    console.error(`Formato no soportado: ${ext}`);
    console.error(`Soportados: ${FORMATOS_SOPORTADOS.join(", ")}`);
    process.exit(1);
  }

  console.log(`[1/2] Extrayendo texto con GLM-OCR: ${filePath}`);
  const textoOCR = await extraerTextoOCR(filePath);
  console.log("\nTexto extraído:");
  console.log(textoOCR);

  console.log("\n[2/2] Estructurando datos con Gemini...");
  const factura = await extraerDatosFactura(textoOCR);

  console.log("\nFactura estructurada:");
  console.log(JSON.stringify(factura, null, 2));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
