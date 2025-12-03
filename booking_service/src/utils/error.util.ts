import { ErrorCatalog, type ErrorCode } from "../constants/errorMessages.js";

export class ServiceError extends Error {
	status: number;
	code: ErrorCode;
	cause?: any;

	constructor(code: ErrorCode, options?: { cause?: any }) {
		super(ErrorCatalog[code].message);

		this.name = "ServiceError";
		this.code = code;
		this.status = ErrorCatalog[code].status;
		this.cause = options?.cause;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ServiceError);
		}
	}
}
