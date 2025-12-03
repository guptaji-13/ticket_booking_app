import { PaymentsService } from "../services/index.service.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { ServiceError } from "../utils/error.util.js";

export class PaymentsController {
	static async initiatePayment(req: any, res: any) {
		try {
			const userId = req.user.id;
			const { bookingId, provider } = req.body;
			const payment = await PaymentsService.initiatePayment({ bookingId, provider }, userId);
			return ApiResponse.success(res, payment);
		} catch (error) {
			console.error("Error in initiatePayment:", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Failed to initiate payment", error);
		}
	}

	static async checkPaymentStatus(req: any, res: any) {
		try {
			const paymentId = req.query.paymentId;
			const payment = await PaymentsService.checkPaymentStatus(paymentId);

			return ApiResponse.success(res, payment);
		} catch (error) {
			console.error("Error in checkPaymentStatus:", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Failed to check payment status", error);
		}
	}
}
