import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

export default defineConfig({
	out: "./drizzle/migrations",
	schema: "./src/db/drizzle/schema",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.POSTGRES_URL!,
	},
});
