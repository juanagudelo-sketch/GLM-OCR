import fs from "fs";
import path from "path";

const LOGS_DIR = "logs";

// Asegurar que el directorio de logs existe
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

let currentLogFile = null;
let logBuffer = [];

/**
 * Inicia una nueva sesión de log
 */
export function iniciarLog(nombreArchivo) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  currentLogFile = path.join(LOGS_DIR, `${timestamp}_${nombreArchivo}.log`);
  logBuffer = [];
  logBuffer.push(`=== Inicio de procesamiento: ${new Date().toISOString()} ===\n`);
}

/**
 * Agrega una línea al log actual
 */
export function log(mensaje) {
  if (currentLogFile) {
    logBuffer.push(`${mensaje}\n`);
  }
}

/**
 * Guarda el log en archivo
 */
export function guardarLog() {
  if (currentLogFile && logBuffer.length > 0) {
    logBuffer.push(`\n=== Fin de procesamiento: ${new Date().toISOString()} ===`);
    fs.writeFileSync(currentLogFile, logBuffer.join(""), "utf-8");
    return currentLogFile;
  }
  return null;
}

/**
 * Guarda un archivo de log específico (para OCR, Gemini, etc.)
 */
export function guardarLogEspecifico(nombre, contenido) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(LOGS_DIR, `${timestamp}_${nombre}.txt`);
  fs.writeFileSync(filePath, contenido, "utf-8");
  return filePath;
}
