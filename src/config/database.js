import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false, // Desactiva logs SQL en consola
});

// Test de conexión y sincronización (sin logs en consola)
sequelize
  .authenticate()
  .then(() => {
    return sequelize.sync({ alter: true });
  })
  .catch((err) => {
    console.error("Error al conectar/sincronizar base de datos:", err);
  });

export default sequelize;
