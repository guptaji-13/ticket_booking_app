import { ErrorCatalog, type ErrorCode } from "../constants/errorMessages.js";

export class ApiResponse {
	// PRIVATE helper — used only internally
	private static _send(
		res: any,
		status: number,
		body: {
			success: boolean;
			message: string;
			data?: any;
			error?: any;
		}
	) {
		return res.status(status).json(body);
	}

	// SUCCESS response
	static success(res: any, data: any, message = "Success") {
		return this._send(res, 200, {
			success: true,
			message,
			data,
		});
	}

	// ERROR via ErrorCode
	static errorFromCode(res: any, code: ErrorCode, error?: any) {
		const catalog = ErrorCatalog[code];

		return this._send(res, catalog.status, {
			success: false,
			message: catalog.message,
			error,
		});
	}

	// Generic ERROR (no ErrorCode)
	static error(res: any, message: string, error?: any, status = 500) {
		return this._send(res, status, {
			success: false,
			message,
			error,
		});
	}
}
