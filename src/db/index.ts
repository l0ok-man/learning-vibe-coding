import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionUri = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/learning_vibe";

export const connectionPool = mysql.createPool(connectionUri);
export const db = drizzle(connectionPool, { schema, mode: "default" });
