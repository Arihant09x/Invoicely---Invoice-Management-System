import dotenv from "dotenv";

dotenv.config();

function mustGet(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),

  DATABASE_URL: mustGet("DATABASE_URL"),

  JWT_ACCESS_SECRET: mustGet("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "1d",

  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",

  ADMIN_SEED_EMAIL: process.env.ADMIN_SEED_EMAIL ?? "admin@example.com",
  ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD ?? "Admin@12345",
  USER_SEED_EMAIL: process.env.USER_SEED_EMAIL ?? "user@example.com",
  USER_SEED_PASSWORD: process.env.USER_SEED_PASSWORD ?? "User@12345",
};
