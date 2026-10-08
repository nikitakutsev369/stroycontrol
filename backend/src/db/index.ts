import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import { env } from "./env";

const pool = mysql.createPool(env.databaseUrl);

export const db = drizzle(pool, { schema, mode: "default" });
