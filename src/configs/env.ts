import dotenv from 'dotenv';

export type NodeEnv = 'uat' | 'production';
const nodeEnv: NodeEnv = (process.env.NODE_ENV as NodeEnv) || 'uat';

dotenv.config({ path: `.env.${nodeEnv}` });

const toNumber = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const env = {
  nodeEnv,
  port: toNumber(process.env.PORT, 3000),
  coarsAllowOrigin: (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  logLevel: process.env.LOG_LEVEL || 'info',
  databaseUrl: process.env.DATABASE_URL,
  dbSsl: (process.env.DB_SSL || 'false') === 'true',

  pg: {
    host: process.env.PGHOST || '127.0.0.1',
    port: toNumber(process.env.PGPORT, 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || '',
  },
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
