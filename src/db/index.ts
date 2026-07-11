import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionConfig = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL 
  : {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "belajar_vibe_coding",
      port: parseInt(process.env.DB_PORT || "3306"),
    };

export const connectionPool = mysql.createPool(connectionConfig);
export const db = drizzle(connectionPool, { schema, mode: "default" });
