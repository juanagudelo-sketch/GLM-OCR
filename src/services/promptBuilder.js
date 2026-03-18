/**
 * Construye el prompt para extracción de datos de factura.
 * @param {string} textoOCR - Texto crudo extraído por OCR
 * @returns {string} Prompt listo para enviar al modelo
 */
export function buildFacturaPrompt(textoOCR) {
  return `Analiza el siguiente texto extraído de una factura o documento comercial y extrae la información en el formato JSON indicado. Devuelve SÓLO el objeto JSON, sin ningún texto adicional ni bloques de código Markdown.

REGLAS IMPORTANTES: SI HAY ITEM O EAN REPETIDOS NO LOS ELIMINES DEBES COLCOARLOS LAS VECES Q ESTEN-- SI SE PERMITE TENER EAN REPETIDOS
- VendorName y VendorAddress corresponden al PROVEEDOR (quien vende o despacha la mercancía).
- CustomerName y CustomerAddress corresponden al CLIENTE o COMPRADOR (quien emite la orden de compra o recibe la mercancía).
- En documentos tipo "ORDEN DE COMPRA": el emisor de la orden es el CLIENTE, y el PROVEEDOR es quien debe entregar.
- CustomerAddress debe contener SOLO la dirección (calle, número). El nombre del almacén o sucursal va en CustomerAddressRecipient.
- VendorAddress debe contener  la dirección.
- Si un campo no se encuentra, déjalo como null.
- El campo barCode puede no estar presente; en ese caso usa el mismo valor de ProductCode.
- ProductCode en algunos documentos aparece como "item" o "EAN".
- Si el documento contiene múltiples facturas, inclúyelas todas en el array 'invoices'.
- Si el mismo ProductCode aparece más de una vez en el documento, inclúyelo tantas veces como aparezca. NO elimines duplicados.

{
    "invoices": [
        {
            "VendorName": "nombre del vendedor",
            "VendorAddress": "dirección del vendedor",
            "VendorAddressRecipient": "destinatario de la dirección del vendedor",
            "CustomerName": "nombre del cliente",
            "CustomerId": "id del cliente",
            "CustomerAddress": "dirección del cliente",
            "CustomerAddressRecipient": "destinatario de la dirección del cliente",
            "InvoiceId": "id de la factura o orden de compra",
            "InvoiceDate": "fecha de la factura (YYYY-MM-DD)",
            "InvoiceTotal": "total de la factura (formato $X.XX)",
            "DueDate": "fecha de vencimiento (YYYY-MM-DD)",
            "PurchaseOrder": "orden de compra o id de la factura",
            "BillingAddress": "dirección de facturación",
            "BillingAddressRecipient": "destinatario de la dirección de facturación",
            "ShippingAddress": "dirección de envío",
            "ShippingAddressRecipient": "destinatario de la dirección de envío",
            "Items": [
                {
                    "ProductCode": "código del producto o item",
                    "Description": "descripción del ítem",
                    "UnitPrice": "precio unitario (formato $X.XX)",
                    "Quantity": "cantidad",
                    "Unit": "unidad de medida del producto",
                    "barCode": "Codigo de barras"
                }
            ]
        }
    ]
}

TEXTO OCR:
"""
${textoOCR}
"""`;
}
