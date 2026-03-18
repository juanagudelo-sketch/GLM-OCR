import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { extraerTextoOCR } from "./services/ocrService.js";
import { extraerDatosFactura } from "./services/facturaService.js";

const app = express();
const upload = multer({ dest: "uploads/" });

const FORMATOS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

// ─── Swagger UI (sin dependencias) ───────────────────────────────────────────
const swaggerSpec = {
  openapi: "3.0.0",
  info: { title: "Factura OCR API", version: "1.0.0", description: "Extrae datos estructurados de facturas usando GLM-OCR + Gemini" },
  paths: {
    "/extraer-factura": {
      post: {
        summary: "Extrae datos de una factura",
        description: "Sube una imagen (jpg, png, webp) o PDF y devuelve los datos estructurados en JSON",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  archivo: { type: "string", format: "binary", description: "Imagen o PDF de la factura" }
                },
                required: ["archivo"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Datos extraídos correctamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    invoices: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          VendorName: { type: "string" },
                          VendorAddress: { type: "string" },
                          VendorAddressRecipient: { type: "string", nullable: true },
                          CustomerName: { type: "string" },
                          CustomerId: { type: "string" },
                          CustomerAddress: { type: "string" },
                          CustomerAddressRecipient: { type: "string", nullable: true },
                          InvoiceId: { type: "string", nullable: true },
                          InvoiceDate: { type: "string", example: "2023-03-07" },
                          InvoiceTotal: { type: "string", example: "$17203019.00" },
                          DueDate: { type: "string", nullable: true },
                          PurchaseOrder: { type: "string" },
                          BillingAddress: { type: "string", nullable: true },
                          BillingAddressRecipient: { type: "string", nullable: true },
                          ShippingAddress: { type: "string", nullable: true },
                          ShippingAddressRecipient: { type: "string", nullable: true },
                          Items: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                ProductCode: { type: "string" },
                                Description: { type: "string" },
                                UnitPrice: { type: "string", example: "$302.00" },
                                Quantity: { type: "number" },
                                Unit: { type: "string", nullable: true },
                                barCode: { type: "string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: "Archivo no enviado o formato no soportado" },
          500: { description: "Error interno del servidor" }
        }
      }
    }
  }
};

const swaggerHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Factura OCR API</title>
  <meta charset="utf-8"/>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"/>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: "/swagger.json", dom_id: "#swagger-ui", presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset] });
  </script>
</body>
</html>`;

app.get("/docs", (_, res) => res.send(swaggerHtml));
app.get("/swagger.json", (_, res) => res.json(swaggerSpec));

// ─── Endpoint principal ───────────────────────────────────────────────────────
app.post("/extraer-factura", upload.single("archivo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se envió ningún archivo" });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (!FORMATOS.includes(ext)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: `Formato no soportado. Use: ${FORMATOS.join(", ")}` });
  }

  // Renombrar con extensión correcta para que GLM-OCR lo detecte bien
  const filePath = `${req.file.path}${ext}`;
  fs.renameSync(req.file.path, filePath);

  try {
    console.log(`[1/2] OCR: ${req.file.originalname}`);
    const textoOCR = await extraerTextoOCR(filePath);

    console.log("[2/2] Estructurando con Gemini...");
    const factura = await extraerDatosFactura(textoOCR);

    res.json(factura);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    fs.existsSync(filePath) && fs.unlinkSync(filePath);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Swagger UI:          http://localhost:${PORT}/docs`);
});
