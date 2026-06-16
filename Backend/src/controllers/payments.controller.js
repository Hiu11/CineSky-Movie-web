import {
  confirmMockPaymentSession,
  createMockPaymentSession,
  getMockPaymentSession,
} from "../services/mockPayment.service.js";

const paymentsController = {
  async createMockSession(req, res, next) {
    try {
      const userId = req.authUser?._id?.toString?.() || req.authUser?.id || "";
      const session = await createMockPaymentSession({ ...req.body, userId });

      return res.status(201).send({
        success: true,
        message: "Payment session created",
        data: session,
      });
    } catch (error) {
      return next(error);
    }
  },

  async getMockSession(req, res, next) {
    try {
      const session = await getMockPaymentSession(req.params.sessionId);

      return res.status(200).send({
        success: true,
        message: "Payment session fetched",
        data: session,
      });
    } catch (error) {
      return next(error);
    }
  },

  async confirmMockSession(req, res, next) {
    try {
      const session = await confirmMockPaymentSession(req.params.sessionId);

      return res.status(200).send({
        success: true,
        message: "Payment confirmed",
        data: session,
      });
    } catch (error) {
      return next(error);
    }
  },
};

export default paymentsController;
