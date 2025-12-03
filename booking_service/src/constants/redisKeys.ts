export const RedisKeys = {
	// Seat locking
	seatLock: (showId: string, seatId: string) => `seatlock:${showId}:${seatId}`,
	seatLockPatternByShow: (showId: string) => `seatlock:${showId}:*`,

	// Bookings
	booking: (bookingId: string) => `booking:${bookingId}`,
	bookingPattern: (bookingId: string) => `booking:${bookingId}*`,

	// Payments
	payment: (paymentId: string) => `payment:${paymentId}`,
	paymentPattern: (paymentId: string) => `payment:${paymentId}*`,

	// Events
	event: (eventId: string) => `event:${eventId}`,
	eventPattern: (eventId: string) => `event:${eventId}*`,
	eventPatternByCityAndCategory: (city: string, category: string) =>
		`events:${city}:${category}*`,
	eventPatternByCity: (city: string) => `events:${city}*`,

	// Venues
	venue: (venueId: string) => `venue:${venueId}`,
	venuePattern: (venueId: string) => `venue:${venueId}*`,

	// Shows
	show: (showId: string) => `show:${showId}`,
	showPattern: (showId: string) => `show:${showId}*`,
};
