import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const JWT_SECRET = process.env.JWT_SECRET || 'fufa-secure-payment-gateway-jwt-secret-key-2026';

const sslConfig = process.env.DB_SSL
  ? {
    rejectUnauthorized: false,
    ca: process.env.DB_SSL,
  }
  : process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false'
    ? { rejectUnauthorized: false }
    : undefined;

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '11052', 10),
  database: process.env.DB_NAME,
  ssl: sslConfig,
});
