export class ServiceError extends Error {
	statusCode: number;

	constructor(message: string, statusCode = 400) {
		super(message);
		this.statusCode = statusCode;
	}
}

export function throwIf(condition: boolean, message: string, code = 400) {
	if (condition) throw new ServiceError(message, code);
}
