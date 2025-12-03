// src/workers/paymentOutboxWorker.ts

import { OutboxDAO } from "../dao/outbox.dao.js";
import { publishEvent } from "../kafka/producers/payment.producer.js";

const TOPIC = "payment_events";
const MAX_RETRY = 5;

export async function processPaymentOutbox() {
	try {
		const events = await OutboxDAO.getPendingEvents(50);

		if (events.length === 0) return;

		console.log(`📦 Found ${events.length} payment outbox events to process`);

		for (const event of events) {
			try {
				// Publish to Kafka
				await publishEvent(
					TOPIC,
					event.aggregateId, // key for partitioning/idempotency
					{
						eventType: event.eventType,
						aggregateId: event.aggregateId,
						payload: event.payload,
						timestamp: Date.now(),
					}
				);

				// Mark outbox as processed
				await OutboxDAO.markProcessed(event.id);

				console.log(`✅ Outbox ${event.id} → Published & Marked Processed`);
			} catch (err) {
				console.error(`❌ Failed to publish event ${event.id}`, err);

				await OutboxDAO.incrementRetry(event.id);

				const updated = await OutboxDAO.getEventById(event.id);

				if (updated?.retryCount ?? 0 >= MAX_RETRY) {
					console.error(`🔴 Outbox ${event.id} exceeded max retries`);
					// TODO: move to a DLQ table
				}
			}
		}
	} catch (err) {
		console.error("💥 PaymentOutboxWorker crashed:", err);
	}
}
