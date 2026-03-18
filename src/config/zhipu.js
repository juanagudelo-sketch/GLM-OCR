import "dotenv/config";

if (!process.env.ZHIPU_API_KEY) {
  throw new Error("Falta ZHIPU_API_KEY en el archivo .env");
}

export const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;

// Endpoint dedicado de GLM-OCR (layout_parsing)
export const ZHIPU_OCR_URL = "https://open.bigmodel.cn/api/paas/v4/layout_parsing";
export const ZHIPU_OCR_MODEL = "glm-ocr";
