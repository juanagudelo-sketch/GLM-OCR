import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Factura from "./Factura.js";

const ItemFactura = sequelize.define(
  "ItemFactura",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    factura_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Factura,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    product_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    bar_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "items_factura",
    timestamps: false,
  }
);

// Relaciones
Factura.hasMany(ItemFactura, {
  foreignKey: "factura_id",
  as: "items",
  onDelete: "CASCADE",
});

ItemFactura.belongsTo(Factura, {
  foreignKey: "factura_id",
  as: "factura",
});

export default ItemFactura;
