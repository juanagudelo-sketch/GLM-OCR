import fs from "fs";
import path from "path";
import { extraerTextoOCR } from "./services/ocrService.js";
import { extraerDatosFactura } from "./services/facturaService.js";
import { validarCoherencia } from "./services/coherenceValidator.js";

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

  console.log("\n" + "=".repeat(60));
  console.log(`📄 Procesando: ${filePath}`);
  console.log("=".repeat(60));

  console.log("\n[1/3] 🔍 Extrayendo texto con GLM-OCR...");
  const textoOCR = await extraerTextoOCR(filePath);
  console.log(`✓ Texto extraído: ${textoOCR.length} caracteres\n`);

  console.log("[2/3] 🤖 Estructurando datos con Gemini...");
  const resultado = await extraerDatosFactura(textoOCR);
  console.log(`✓ Estructura obtenida: ${resultado.invoices?.length || 0} factura(s)\n`);

  console.log("[3/3] 🔍 Validando coherencia OCR vs Gemini...");
  const coherencia = validarCoherencia(textoOCR, resultado);
  
  if (!coherencia.coherente) {
    console.log("❌ Errores de coherencia:");
    coherencia.errores.forEach((err) => console.log(`   - ${err}`));
  }
  
  if (coherencia.advertencias.length > 0) {
    console.log("⚠️  Advertencias:");
    coherencia.advertencias.forEach((adv) => console.log(`   - ${adv}`));
  }
  
  if (coherencia.coherente) {
    console.log(`✓ Coherencia validada: ${coherencia.advertencias.length} advertencia(s)`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESULTADO FINAL");
  console.log("=".repeat(60));
  console.log(JSON.stringify(resultado, null, 2));
  console.log("=".repeat(60) + "\n");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
