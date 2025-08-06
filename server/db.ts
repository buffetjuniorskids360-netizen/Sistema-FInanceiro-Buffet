import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Guard: fail fast if DATABASE_URL missing
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL not set. Place it in server/.env or .env. Example: postgresql://user:pass@host/db?sslmode=require");
}

// Create Pool with explicit connectionString
export const pool = new Pool({ connectionString: url });

// Drizzle client with schema
export const db = drizzle({ client: pool, schema });
