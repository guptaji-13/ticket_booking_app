import { Kafka } from "kafkajs";
import { BookingsService } from "../../services/bookings.service.js";
import { SeatsService } from "../../services/seats.service.js";
import { PaymentsService } from "../../services/payments.service.js";

const TOPIC = "payment_events";
const GROUP_ID = "booking-payment-consumer";

type PaymentEventPayload = {
	paymentId: string;
	bookingId: string;
	userId: string;
	amount: number;
	provider: string;
	timestamp: number;
};

type PaymentEventMessage = {
	eventType: "payment_confirmed" | "payment_failed" | string;
	aggregateId: string;
	payload: PaymentEventPayload;
	timestamp: number;
};

const kafka = new Kafka({
	clientId: "booking-service",
	brokers: process.env.KAFKA_BROKERS?.split(",") ?? [], // e.g. "kafka:9092"
});

const consumer = kafka.consumer({ groupId: GROUP_ID });

export const startPaymentEventsConsumer = async () => {
	await consumer.connect();
	await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

	console.log(`🚀 PaymentEventsConsumer subscribed to topic "${TOPIC}"`);

	await consumer.run({
		eachMessage: async ({ topic, partition, message }) => {
			try {
				if (!message.value) return;

				const raw = message.value.toString();
				const event: PaymentEventMessage = JSON.parse(raw);

				console.log(
					`📩 Received event: ${event.eventType} aggId=${event.aggregateId} partition=${partition} offset=${message.offset}`
				);

				await handlePaymentEvent(event);
			} catch (err) {
				console.error("❌ Error handling payment event:", err);
				// Let Kafka re-deliver (at-least-once); idempotency must be in your services.
				// You can add DLQ logic later if needed.
			}
		},
	});
};

async function handlePaymentEvent(event: PaymentEventMessage) {
	const { eventType, payload } = event;

	switch (eventType) {
		case "payment_confirmed":
			return handlePaymentConfirmed(payload);

		case "payment_failed":
			return handlePaymentFailed(payload);

		default:
			console.log(`⚠️ Unknown payment eventType: ${eventType}`);
	}
}

/**
 * payment_confirmed → confirm booking, confirm seats, update search/ES, etc.
 * MUST be idempotent since Kafka is at-least-once.
 */
async function handlePaymentConfirmed(payload: PaymentEventPayload) {
	const { bookingId, paymentId, userId, amount } = payload;

	console.log(`✅ Handling payment_confirmed for booking=${bookingId} payment=${paymentId}`);

	// OPTIONAL: sanity check against DB
	// const payment = await PaymentsService.getPaymentById(paymentId);
	// if (!payment || payment.status !== "success") {
	//   console.log(`Payment ${paymentId} not in success state, skipping confirm`);
	//   return;
	// }

	// 1) Confirm booking & seats in a single transactional service
	//    This service should be IDEMPOTENT:
	//    - If booking already CONFIRMED → no-op
	//    - If seats already taken by same booking → no-op
	//    - If conflict → log & handle as per your business rules
	await BookingsService.confirmBookingAndSeats({
		bookingId,
		paymentId,
		userId,
		amount,
	});

	// 2) Optionally update Cassandra / Search / ES etc. from inside the service
	//    or call specific sub-services like:
	// await SeatsService.syncSeatsToCassandra(bookingId);
	// await BookingsService.syncBookingToSearch(bookingId);

	console.log(`🎟️ Booking & seats confirmed for booking=${bookingId} payment=${paymentId}`);
}

/**
 * payment_failed → release seats, update booking status, etc.
 * Also MUST be idempotent.
 */
async function handlePaymentFailed(payload: PaymentEventPayload) {
	const { bookingId, paymentId, userId } = payload;

	console.log(`⛔ Handling payment_failed for booking=${bookingId} payment=${paymentId}`);

	// This service should also be idempotent:
	// - If booking already CANCELLED → no-op
	// - If seats already released → no-op
	await BookingsService.handlePaymentFailure({
		bookingId,
		paymentId,
		userId,
	});

	console.log(`🧹 Payment failure handled, booking/seats released for booking=${bookingId}`);
}
