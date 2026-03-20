/**
 * Valida que los datos estructurados por Gemini coincidan con el texto OCR original.
 * @param {string} textoOCR - Texto extraído por OCR
 * @param {object} resultado - Resultado estructurado de Gemini
 * @returns {{ coherente: boolean, errores: string[], advertencias: string[] }}
 */
export function validarCoherencia(textoOCR, resultado) {
  const errores = [];
  const advertencias = [];

  if (!resultado?.invoices || resultado.invoices.length === 0) {
    errores.push("No hay facturas en el resultado de Gemini");
    return { coherente: false, errores, advertencias };
  }

  const textoNormalizado = textoOCR.toLowerCase().replace(/\s+/g, " ");

  resultado.invoices.forEach((factura, index) => {
    const prefijo = resultado.invoices.length > 1 ? `Factura ${index}: ` : "";

    // Validar VendorName
    if (factura.VendorName && factura.VendorName.length > 3) {
      const vendorNormalizado = factura.VendorName.toLowerCase().replace(/\s+/g, " ");
      if (!textoNormalizado.includes(vendorNormalizado)) {
        advertencias.push(`${prefijo}VendorName "${factura.VendorName}" no encontrado en OCR`);
      }
    }

    // Validar CustomerName
    if (factura.CustomerName && factura.CustomerName.length > 3) {
      const customerNormalizado = factura.CustomerName.toLowerCase().replace(/\s+/g, " ");
      if (!textoNormalizado.includes(customerNormalizado)) {
        advertencias.push(`${prefijo}CustomerName "${factura.CustomerName}" no encontrado en OCR`);
      }
    }

    // Validar InvoiceId
    if (factura.InvoiceId) {
      const invoiceIdLimpio = String(factura.InvoiceId).replace(/\s+/g, "");
      if (!textoOCR.includes(invoiceIdLimpio)) {
        advertencias.push(`${prefijo}InvoiceId "${factura.InvoiceId}" no encontrado en OCR`);
      }
    }

    // Validar InvoiceTotal
    if (factura.InvoiceTotal) {
      const totalLimpio = String(factura.InvoiceTotal).replace(/[^0-9]/g, "");
      const ocrLimpio = textoOCR.replace(/[^0-9]/g, "");
      if (totalLimpio.length > 3 && !ocrLimpio.includes(totalLimpio)) {
        advertencias.push(`${prefijo}InvoiceTotal "${factura.InvoiceTotal}" no encontrado en OCR`);
      }
    }

    // Validar Items
    if (factura.Items && factura.Items.length > 0) {
      let itemsEncontrados = 0;
      
      factura.Items.forEach((item, itemIndex) => {
        let itemEncontrado = false;

        // Validar ProductCode/EAN
        if (item.ProductCode) {
          const codeLimpio = String(item.ProductCode).replace(/\s+/g, "");
          if (textoOCR.includes(codeLimpio)) {
            itemEncontrado = true;
          }
        }

        // Validar barCode
        if (!itemEncontrado && item.barCode && item.barCode !== item.ProductCode) {
          const barCodeLimpio = String(item.barCode).replace(/\s+/g, "");
          if (textoOCR.includes(barCodeLimpio)) {
            itemEncontrado = true;
          }
        }

        // Validar Description (al menos 5 caracteres)
        if (!itemEncontrado && item.Description && item.Description.length > 5) {
          const descNormalizada = item.Description.toLowerCase().replace(/\s+/g, " ");
          if (textoNormalizado.includes(descNormalizada)) {
            itemEncontrado = true;
          }
        }

        if (itemEncontrado) {
          itemsEncontrados++;
        } else {
          advertencias.push(
            `${prefijo}Item ${itemIndex} (${item.ProductCode || item.Description || "sin identificador"}) no encontrado en OCR`
          );
        }
      });

      // Si menos del 50% de los items se encuentran, es un error crítico
      const porcentajeEncontrado = (itemsEncontrados / factura.Items.length) * 100;
      if (porcentajeEncontrado < 50) {
        errores.push(
          `${prefijo}Solo ${itemsEncontrados}/${factura.Items.length} items (${porcentajeEncontrado.toFixed(0)}%) encontrados en OCR. Posible alucinación de Gemini`
        );
      }
    }
  });

  return {
    coherente: errores.length === 0,
    errores,
    advertencias,
  };
}
