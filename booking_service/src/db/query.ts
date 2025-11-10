import { pool } from "./drizzle/index.js";

export const query = (text: string, params?: any[]) => pool.query(text, params);
