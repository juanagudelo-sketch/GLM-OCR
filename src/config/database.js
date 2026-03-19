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

// Test de conexión y sincronización
sequelize
  .authenticate()
  .then(() => {
    console.log("✓ Conectado a Neon Postgres");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("✓ Base de datos sincronizada correctamente");
  })
  .catch((err) => {
    console.error("Error al sincronizar la base de datos:", err);
  });

export default sequelize;
