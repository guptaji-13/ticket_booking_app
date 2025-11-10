import app from "./app.js";
import http from "http";
import { pool } from "./db/drizzle/index.js";

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
	console.log(`✅ HTTP server running at http://localhost:${PORT}`);
});

process.on("SIGTERM", async () => {
	await pool.end();
	httpServer.close(() => console.log("🛑 Server stopped gracefully"));
});
