import app from "./app.js";
import http from "http";
import { ShowsDAO } from "./dao/shows.dao.js";
import { showsIndexMapping } from "./db/index/mappings.js";
import { runEventCdcConsumer } from "./kafka/consumers/eventCdc.consumer.js";

const PORT = process.env.PORT || 3002;

async function init() {
	await ShowsDAO.ensureIndex(showsIndexMapping);
}

const main = async () => {
	try {
		await init();
		const httpServer = http.createServer(app);

		httpServer.listen(PORT, () => {
			console.log(`✅ HTTP server running at http://localhost:${PORT}`);
			runEventCdcConsumer().catch((error) => console.log(error));
		});
	} catch (error) {
		console.log("Search service broke");
		console.error(error);
		process.exit(1);
	}
};

main();
