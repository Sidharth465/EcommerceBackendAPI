import { Sequelize } from "sequelize";
import config from "./index";

const createSequelize = (): Sequelize => {
  if (config.databaseUrl && config.databaseUrl.length > 0) {
    return new Sequelize(config.databaseUrl, {
      dialect: "postgres",
      logging: false,
      dialectOptions: config.isProd
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : undefined,
    });
  }

  const { database, user, password, host, port } = config.db;
  if (!database || !user) {
    throw new Error(
      "Database config missing. Set DATABASE_URL or PG* env vars."
    );
  }

  return new Sequelize(database, user, password, {
    host,
    port,
    dialect: "postgres",
    logging: false,
  });
};

export const sequelize = createSequelize();
