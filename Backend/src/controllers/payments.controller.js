import {
  confirmMockPaymentSession,
  createMockPaymentSession,
  getMockPaymentSession,
} from "../services/mockPayment.service.js";

const paymentsController = {
  createMockSession(req, res, next) {
    try {
      const userId = req.authUser?._id?.toString?.() || req.authUser?.id || "";
      const session = createMockPaymentSession({ ...req.body, userId });

      return res.status(201).send({
        success: true,
        message: "Payment session created",
        data: session,
      });
    } catch (error) {
      return next(error);
    }
  },

  getMockSession(req, res, next) {
    try {
      const session = getMockPaymentSession(req.params.sessionId);

      return res.status(200).send({
        success: true,
        message: "Payment session fetched",
        data: session,
      });
    } catch (error) {
      return next(error);
    }
  },

  confirmMockSession(req, res, next) {
    try {
      const session = confirmMockPaymentSession(req.params.sessionId);

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
