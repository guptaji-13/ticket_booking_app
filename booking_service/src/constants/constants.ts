export const AppConstants = {
	// Booking flow
	BOOKING_TTL_SECONDS: 10 * 60, // 10 min
	PAYMENT_TTL_SECONDS: 10 * 60, // 10 min
	SEAT_LOCK_TTL_SECONDS: 10 * 60, // 10 min

	// Popular events cache TTL
	POPULAR_EVENTS_TTL: 15 * 60, // 15 min

	// Pagination defaults
	DEFAULT_PAGE_LIMIT: 20,
	MAX_PAGE_LIMIT: 100,

	// Rate limits
	RATE_LIMIT_MAX_BOOKING_ATTEMPTS: 10,
	RATE_LIMIT_WINDOW_MINUTES: 1,
} as const;

export type ConstantKey = keyof typeof AppConstants;
