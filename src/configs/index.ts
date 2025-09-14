import { env, NodeEnv } from "./env";

export type AppConfig = {
  nodeEnv: NodeEnv;

  isUat: boolean;
  isProd: boolean;
  port: number;
  corsAllowedOrigins: string[];
  logLevel: string;
  databaseUrl?: string;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  dbSsl: boolean;
};

export const config: AppConfig = {
  nodeEnv: env.nodeEnv,

  isUat: env.nodeEnv === "uat",
  isProd: env.nodeEnv === "production",
  port: env.port,
  corsAllowedOrigins: env.coarsAllowOrigin,
  logLevel: env.logLevel,
  databaseUrl: env.databaseUrl,
  db: env.pg,
  dbSsl: env.dbSsl,
};

export default config;
