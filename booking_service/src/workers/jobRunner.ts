import cron from "node-cron";
import { initKafkaProducer } from "../kafka/producers/payment.producer.js";
import { startPaymentEventsConsumer } from "../kafka/consumers/payment.consumer.js";
import { processPaymentOutbox } from "./paymentOutbox.worker.js";

export async function startWorkers() {
	console.log("🔧 Initializing workers...");

	// 1️⃣ Init Kafka Producer (shared instance)
	await initKafkaProducer();

	// 2️⃣ Start Kafka Consumer
	startPaymentEventsConsumer();

	// 3️⃣ Schedule Outbox Poller (every 2 seconds)
	cron.schedule("*/2 * * * * *", async () => {
		await processPaymentOutbox();
	});

	// 🚀 You can add more workers later:
	// cron.schedule("0 */1 * * * *", runSeatUnlockLogic);
	// cron.schedule("*/10 * * * * *", retryDLQEvents);

	console.log("🚀 Worker service started");
}
