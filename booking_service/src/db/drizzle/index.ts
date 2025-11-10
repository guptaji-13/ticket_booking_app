import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
	connectionString: process.env.POSTGRES_URL,
	max: 10,
});

export const db = drizzle(pool, { logger: true });

// Optional: export pool for raw SQL usage (hybrid)
export { pool };

export { bookingsTable } from "./schema/bookings.js";
export { paymentsTable } from "./schema/payments.js";
export { usersTable } from "./schema/users.js";
export { refreshTokensTable } from "./schema/refreshTokens.js";
