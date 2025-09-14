// src/config/sequelize-cli-config.js
require("dotenv").config({ path: `.env.${process.env.NODE_ENV || "local"}` });

const common = {
  dialect: "postgres",
  logging: false,
};

module.exports = {
  uat: {
    ...common,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  },
  production: {
    ...common,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  },
};
