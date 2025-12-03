import { Kafka, logLevel } from "kafkajs";
import type { EachMessagePayload } from "kafkajs";
import { Client } from "@elastic/elasticsearch";

const kafka = new Kafka({
	clientId: "search-service",
	brokers: ["kafka:9092"], // docker-compose service name
	logLevel: logLevel.WARN,
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const consumer = kafka.consumer({ groupId: "search-service-group" });

const esClient = new Client({ node: "http://elasticsearch:9200" });

export const runEventCdcConsumer = async () => {
	let connected = false;
	while (!connected) {
		try {
			await consumer.connect();
			connected = true;
		} catch (err) {
			console.error("Kafka not ready yet, retrying in 5s...");
			await delay(5000);
		}
	}
	await consumer.subscribe({ topic: "cassandra_events.shows", fromBeginning: true });

	console.log("✅ Kafka consumer connected to topic: cassandra_events.shows");

	await consumer.run({
		eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
			try {
				const value = message?.value?.toString() ?? null;
				if (!value) return;
				const record = JSON.parse(value);
				console.log("📦 Received CDC Event:", record);

				// Basic example - adapt this to your actual schema
				const {
					show_id,
					show_status,
					event_title,
					event_description,
					available_seat_count,
				} = record;
				// Index (or update) document in Elasticsearch
				await esClient.index({
					index: "shows_search",
					id: show_id,
					document: {
						show_id,
						show_status,
						event_title,
						event_description,
						available_seat_count,
					},
				});
			} catch (err) {
				console.error("❌ Error processing message:", err);
			}
		},
	});
};
