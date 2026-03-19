import { Factura, ItemFactura } from "../models/index.js";
import sequelize from "../config/database.js";

/**
 * Normaliza fechas y montos para la BD
 */
function normalizarDatos(factura) {
  return {
    vendor_name: factura.VendorName ?? null,
    vendor_address: factura.VendorAddress ?? null,
    vendor_address_recipient: factura.VendorAddressRecipient ?? null,
    customer_name: factura.CustomerName ?? null,
    customer_id: factura.CustomerId ?? null,
    customer_address: factura.CustomerAddress ?? null,
    customer_address_recipient: factura.CustomerAddressRecipient ?? null,
    invoice_id: factura.InvoiceId ?? null,
    invoice_date: factura.InvoiceDate ?? null,
    invoice_total: parseMonto(factura.InvoiceTotal),
    due_date: factura.DueDate ?? null,
    purchase_order: factura.PurchaseOrder ?? null,
    billing_address: factura.BillingAddress ?? null,
    billing_address_recipient: factura.BillingAddressRecipient ?? null,
    shipping_address: factura.ShippingAddress ?? null,
    shipping_address_recipient: factura.ShippingAddressRecipient ?? null,
  };
}

function parseMonto(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val;
  const limpio = String(val).replace(/[^0-9.,]/g, "");
  const normalizado = limpio.includes(",") && limpio.lastIndexOf(",") > limpio.lastIndexOf(".")
    ? limpio.replace(/\./g, "").replace(",", ".")
    : limpio.replace(/,/g, "");
  const num = parseFloat(normalizado);
  return isNaN(num) ? null : num;
}

/**
 * Guarda una factura y sus ítems usando modelos Sequelize.
 * @param {object} factura - Factura de Gemini
 * @param {string} archivoOrigen - Nombre del archivo original
 * @returns {Promise<number>} ID de la factura insertada
 */
export async function guardarFactura(factura, archivoOrigen = null) {
  const transaction = await sequelize.transaction();

  try {
    const datosFactura = {
      ...normalizarDatos(factura),
      archivo_origen: archivoOrigen,
    };

    // Crear factura
    const facturaCreada = await Factura.create(datosFactura, { transaction });

    // Crear items
    if (factura.Items?.length) {
      const items = factura.Items.map((item) => ({
        factura_id: facturaCreada.id,
        product_code: item.ProductCode ?? null,
        description: item.Description ?? null,
        unit_price: parseMonto(item.UnitPrice),
        quantity: item.Quantity !== null && item.Quantity !== undefined ? parseFloat(item.Quantity) || null : null,
        unit: item.Unit ?? null,
        bar_code: item.barCode || item.ProductCode || null,
      }));

      await ItemFactura.bulkCreate(items, { transaction });
    }

    await transaction.commit();
    return facturaCreada.id;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

/**
 * Guarda múltiples facturas.
 * @returns {Promise<{ guardadas: number[], errores: { indice: number, error: string }[] }>}
 */
export async function guardarFacturas(facturas, archivoOrigen = null) {
  const guardadas = [];
  const errores = [];

  for (let i = 0; i < facturas.length; i++) {
    try {
      const id = await guardarFactura(facturas[i], archivoOrigen);
      guardadas.push(id);
    } catch (err) {
      errores.push({ indice: i, error: err.message });
    }
  }

  return { guardadas, errores };
}
