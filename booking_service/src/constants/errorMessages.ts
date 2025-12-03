const HttpStatus = {
	// 2xx Success
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,

	// 3xx Redirect
	NOT_MODIFIED: 304,

	// 4xx Client Errors
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENT_REQUIRED: 402,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	GONE: 410,
	TOO_MANY_REQUESTS: 429,

	// 5xx Server Errors
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
};

export const ErrorCatalog = {
	// Generic
	INTERNAL_ERROR: {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		message: "Internal server error",
	},
	BAD_REQUEST: {
		status: HttpStatus.BAD_REQUEST,
		message: "Invalid request",
	},
	UNAUTHORIZED: {
		status: HttpStatus.UNAUTHORIZED,
		message: "Unauthorized access",
	},
	FORBIDDEN: {
		status: HttpStatus.FORBIDDEN,
		message: "Forbidden",
	},
	NOT_FOUND: {
		status: HttpStatus.NOT_FOUND,
		message: "Resource not found",
	},
	RATE_LIMITED: {
		status: HttpStatus.TOO_MANY_REQUESTS,
		message: "Too many requests, please try again later",
	},

	// Auth
	AUTH_INVALID_TOKEN: {
		status: HttpStatus.UNAUTHORIZED,
		message: "Invalid or expired token",
	},
	AUTH_REQUIRED: {
		status: HttpStatus.UNAUTHORIZED,
		message: "Authentication required",
	},

	// Booking
	BOOKING_NOT_FOUND: {
		status: HttpStatus.NOT_FOUND,
		message: "Booking not found",
	},
	BOOKING_ALREADY_CONFIRMED: {
		status: HttpStatus.CONFLICT,
		message: "Booking already confirmed",
	},
	BOOKING_EXPIRED: {
		status: HttpStatus.GONE,
		message: "Booking session has expired",
	},
	BOOKING_IN_PROGRESS: {
		status: HttpStatus.CONFLICT,
		message: "Booking is still in progress",
	},

	// Payment
	PAYMENT_NOT_FOUND: {
		status: HttpStatus.NOT_FOUND,
		message: "Payment session not found",
	},
	PAYMENT_FAILED: {
		status: HttpStatus.PAYMENT_REQUIRED,
		message: "Payment failed",
	},
	PAYMENT_ALREADY_PROCESSED: {
		status: HttpStatus.CONFLICT,
		message: "Payment already processed",
	},
	PAYMENT_CREATION_FAILED: {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		message: "Failed to create payment session",
	},
	PAYMENT_INITIATION_FAILED: {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		message: "Failed to initiate payment with provider",
	},

	// Seats
	SEAT_NOT_AVAILABLE: {
		status: HttpStatus.CONFLICT,
		message: "One or more seats are not available",
	},
	SEAT_LOCK_EXPIRED: {
		status: HttpStatus.GONE,
		message: "Seat lock has expired, please reselect seats",
	},
	SEAT_LOCK_FAILED: {
		status: HttpStatus.CONFLICT,
		message: "Failed to lock one or more seats",
	},
	SEAT_CONFIRMATION_FAILED: {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		message: "Failed to confirm seat bookings",
	},
	SEAT_NOT_FOUND: {
		status: HttpStatus.NOT_FOUND,
		message: "One or more seats not found",
	},

	// Events
	EVENT_NOT_FOUND: {
		status: HttpStatus.NOT_FOUND,
		message: "Event not found",
	},

	// Shows
	SHOW_NOT_FOUND: {
		status: HttpStatus.NOT_FOUND,
		message: "Show not found",
	},
	PRICE_MISSING_FOR_SECTION: {
		status: HttpStatus.BAD_REQUEST,
		message: "Price missing for section",
	},

	// Venues
	VENUE_NOT_FOUND: {
		status: HttpStatus.NOT_FOUND,
		message: "Venue not found",
	},

	// Screens
	SCREEN_NOT_FOUND: {
		status: HttpStatus.NOT_FOUND,
		message: "Screen not found",
	},
} as const;

export type ErrorCode = keyof typeof ErrorCatalog;
