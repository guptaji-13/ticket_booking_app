// src/kafka/producer.ts
import { Kafka } from "kafkajs";

const kafka = new Kafka({
	clientId: "booking-service",
	brokers: process.env.KAFKA_BROKERS?.split(",") ?? [], // e.g. "kafka:9092"
});

export const kafkaProducer = kafka.producer();

export async function initKafkaProducer() {
	await kafkaProducer.connect();
	console.log("🚀 Kafka Producer connected");
}

export async function publishEvent(topic: string, key: string, message: any) {
	await kafkaProducer.send({
		topic,
		messages: [
			{
				key,
				value: JSON.stringify(message),
			},
		],
	});
}
