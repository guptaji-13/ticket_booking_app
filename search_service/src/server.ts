import app from "./app.js";
import http from "http";
import { ShowsDAO } from "./dao/shows.dao.js";
import { showsIndexMapping } from "./db/index/mappings.js";

const PORT = process.env.PORT || 3001;

async function init() {
	await ShowsDAO.ensureIndex(showsIndexMapping);
}

const main = async () => {
	try {
		await init();
		const httpServer = http.createServer(app);

		httpServer.listen(PORT, () => {
			console.log(`✅ HTTP server running at http://localhost:${PORT}`);
		});
	} catch (error) {
		console.log("Search service broke");
		console.error(error);
		process.exit(1);
	}
};

main();
