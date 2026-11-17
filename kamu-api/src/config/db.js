import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL belum diisi di file .env");
}

export const sql = neon(process.env.DATABASE_URL);
