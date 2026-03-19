import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Factura = sequelize.define(
  "Factura",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    vendor_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    vendor_address_recipient: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    customer_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customer_address_recipient: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    invoice_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    invoice_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    invoice_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    purchase_order: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    billing_address_recipient: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shipping_address_recipient: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    archivo_origen: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    creado_en: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "creado_en",
    },
  },
  {
    tableName: "facturas",
    timestamps: false,
  }
);

export default Factura;
