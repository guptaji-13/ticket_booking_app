import app from "./app.js";
import http from "http";
import { pool } from "./db/drizzle/index.js";
import { initSnowflake, releaseWorkerId } from "./utils/snowflake.util.js";

const PORT = process.env.PORT || 3000;

(async () => {
	try {
		console.log("🚀 Starting service...");

		// 1️⃣ Init Snowflake BEFORE starting server
		await initSnowflake();
		console.log("❄️ Snowflake initialized");

		// 2️⃣ Create and start HTTP server
		const httpServer = http.createServer(app);
		httpServer.listen(PORT, () => {
			console.log(`✅ Server running on http://localhost:${PORT}`);
		});

		// 3️⃣ Graceful shutdown handlers
		const shutdown = async () => {
			console.log("⚠️ Shutting down gracefully...");
			await releaseWorkerId();
			await pool.end();
			httpServer.close(() => console.log("🛑 Server stopped"));
		};

		process.on("SIGTERM", shutdown);
		process.on("SIGINT", shutdown);
	} catch (err) {
		console.error("❌ Startup failed:", err);
		process.exit(1);
	}
})();
