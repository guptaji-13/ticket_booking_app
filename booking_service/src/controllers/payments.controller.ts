import { PaymentsService } from "../services/index.service.js";

export class PaymentsController {
	static async initiatePayment(req: any, res: any) {
		try {
			const userId = req.user.id;
			const { bookingId, provider } = req.body;
			const payment = await PaymentsService.initiatePayment({ bookingId, provider }, userId);
			return res.status(201).json(payment);
		} catch (error) {
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	static async checkPaymentStatus(req: any, res: any) {
		try {
			const paymentId = req.query.paymentId;
			const payment = await PaymentsService.checkPaymentStatus(paymentId);
			return res.json(payment);
		} catch (error) {
			return res.status(500).json({ message: "Internal server error" });
		}
	}
}
