import { pathToFileURL } from "node:url";
import { register } from "node:module";
import "dotenv/config";

register("ts-node/esm", pathToFileURL("./src/server.ts"));

(async () => {
	try {
		await import("./src/server.ts");
		console.log("✅ Server started successfully");
	} catch (err) {
		console.error("❌ Server failed to start:", err);
		process.exit(1);
	}
})();
