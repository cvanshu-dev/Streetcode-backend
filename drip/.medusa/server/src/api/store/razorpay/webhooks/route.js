"use strict";
/**
 * Razorpay Webhook Handler
 * Handles incoming webhooks from Razorpay payment service
 * Validates webhook signatures and processes payment events
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Verify Razorpay webhook signature
 * Ensures the webhook came from Razorpay and not tampered with
 */
async function verifyRazorpayWebhookSignature(req, webhookSecret) {
    const logger = req.scope.resolve("logger");
    try {
        const signature = req.get("X-Razorpay-Signature") || "";
        const body = JSON.stringify(req.body);
        // Generate expected signature
        const expectedSignature = crypto_1.default
            .createHmac("sha256", webhookSecret)
            .update(body)
            .digest("hex");
        const isValid = signature === expectedSignature;
        if (!isValid) {
            logger.warn("Razorpay webhook signature verification failed");
        }
        return isValid;
    }
    catch (error) {
        logger.error(`Error verifying Razorpay webhook signature: ${error instanceof Error ? error.message : "Unknown error"}`);
        return false;
    }
}
/**
 * Process payment authorized webhook
 */
async function handlePaymentAuthorized(payload, req) {
    const logger = req.scope.resolve("logger");
    const paymentService = req.scope.resolve("paymentService");
    logger.info(`Processing Razorpay payment.authorized webhook for ${payload.payment.id}`);
    try {
        // Update payment session status to AUTHORIZED
        const session = await paymentService.retrievePaymentSession({
            provider_id: "razorpay",
            data: {
                razorpay_payment_id: payload.payment.id,
            },
        });
        if (session) {
            await paymentService.updatePaymentSession(session.id, {
                status: "authorized",
                data: {
                    ...session.data,
                    razorpay_payment_id: payload.payment.id,
                    razorpay_order_id: payload.payment.order_id,
                    authorized_at: new Date(),
                },
            });
            logger.info(`Payment authorized: ${payload.payment.id}`);
        }
    }
    catch (error) {
        logger.error(`Error processing payment.authorized webhook: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
/**
 * Process payment captured webhook
 */
async function handlePaymentCaptured(payload, req) {
    const logger = req.scope.resolve("logger");
    const paymentService = req.scope.resolve("paymentService");
    logger.info(`Processing Razorpay payment.captured webhook for ${payload.payment.id}`);
    try {
        // Update payment session status to CAPTURED
        const session = await paymentService.retrievePaymentSession({
            provider_id: "razorpay",
            data: {
                razorpay_payment_id: payload.payment.id,
            },
        });
        if (session) {
            await paymentService.updatePaymentSession(session.id, {
                status: "captured",
                data: {
                    ...session.data,
                    razorpay_payment_id: payload.payment.id,
                    razorpay_order_id: payload.payment.order_id,
                    captured_at: new Date(),
                    amount_captured: payload.payment.amount,
                },
            });
            logger.info(`Payment captured: ${payload.payment.id}`);
        }
    }
    catch (error) {
        logger.error(`Error processing payment.captured webhook: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
/**
 * Process payment failed webhook
 */
async function handlePaymentFailed(payload, req) {
    const logger = req.scope.resolve("logger");
    const paymentService = req.scope.resolve("paymentService");
    logger.warn(`Processing Razorpay payment.failed webhook for ${payload.payment.id}`);
    try {
        // Update payment session status to ERROR
        const session = await paymentService.retrievePaymentSession({
            provider_id: "razorpay",
            data: {
                razorpay_payment_id: payload.payment.id,
            },
        });
        if (session) {
            await paymentService.updatePaymentSession(session.id, {
                status: "error",
                data: {
                    ...session.data,
                    razorpay_payment_id: payload.payment.id,
                    error_reason: payload.payment.error?.reason || "Unknown error",
                    error_description: payload.payment.error?.description || "Payment processing failed",
                    failed_at: new Date(),
                },
            });
            logger.warn(`Payment failed: ${payload.payment.id}`);
        }
    }
    catch (error) {
        logger.error(`Error processing payment.failed webhook: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
/**
 * Process refund created webhook
 */
async function handleRefundCreated(payload, req) {
    const logger = req.scope.resolve("logger");
    logger.info(`Processing Razorpay refund.created webhook for ${payload.refund.id}`);
    try {
        // Record refund in system
        logger.info(`Refund created: ${payload.refund.id} for payment ${payload.refund.payment_id}`);
    }
    catch (error) {
        logger.error(`Error processing refund.created webhook: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
/**
 * Main webhook handler
 * GET /store/razorpay/webhooks
 */
async function POST(req, res) {
    const logger = req.scope.resolve("logger");
    const payload = req.body;
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            logger.warn("Razorpay webhook secret not configured");
            return res.status(400).json({
                error: "Webhook not configured",
                message: "RAZORPAY_WEBHOOK_SECRET environment variable is not set",
            });
        }
        // Verify webhook signature
        const isValid = await verifyRazorpayWebhookSignature(req, webhookSecret);
        if (!isValid) {
            logger.error("Razorpay webhook signature validation failed");
            return res.status(401).json({
                error: "Invalid signature",
                message: "Webhook signature verification failed",
            });
        }
        const payload = req.body;
        const eventType = payload.event;
        logger.info(`Received Razorpay webhook event: ${eventType}`);
        // Route to appropriate handler based on event type
        switch (eventType) {
            case "payment.authorized":
                await handlePaymentAuthorized(payload, req);
                break;
            case "payment.captured":
                await handlePaymentCaptured(payload, req);
                break;
            case "payment.failed":
                await handlePaymentFailed(payload, req);
                break;
            case "refund.created":
                await handleRefundCreated(payload, req);
                break;
            default:
                logger.debug(`Unhandled webhook event type: ${eventType}`);
        }
        return res.json({
            received: true,
            event: eventType,
        });
    }
    catch (error) {
        logger.error(`Error processing Razorpay webhook: ${error instanceof Error ? error.message : "Unknown error"}`);
        return res.status(500).json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Failed to process webhook",
        });
    }
}
/**
 * Health check endpoint
 * GET /store/razorpay/webhooks
 */
async function GET(req, res) {
    return res.json({
        status: "ok",
        message: "Razorpay webhook endpoint is active",
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3Jhem9ycGF5L3dlYmhvb2tzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztHQUlHOzs7OztBQXVNSCxvQkF1RUM7QUFNRCxrQkFLQztBQXJSRCxvREFBMkI7QUFFM0I7OztHQUdHO0FBQ0gsS0FBSyxVQUFVLDhCQUE4QixDQUMzQyxHQUFrQixFQUNsQixhQUFxQjtJQUVyQixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQVEsQ0FBQTtJQUVqRCxJQUFJLENBQUM7UUFDSCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRSxDQUFBO1FBQ3ZELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRXJDLDhCQUE4QjtRQUM5QixNQUFNLGlCQUFpQixHQUFHLGdCQUFNO2FBQzdCLFVBQVUsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDO2FBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUM7YUFDWixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7UUFFaEIsTUFBTSxPQUFPLEdBQUcsU0FBUyxLQUFLLGlCQUFpQixDQUFBO1FBRS9DLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNiLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0RBQWdELENBQUMsQ0FBQTtRQUMvRCxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUE7SUFDaEIsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixNQUFNLENBQUMsS0FBSyxDQUNWLCtDQUErQyxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FDMUcsQ0FBQTtRQUNELE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILEtBQUssVUFBVSx1QkFBdUIsQ0FDcEMsT0FBWSxFQUNaLEdBQWtCO0lBRWxCLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBUSxDQUFBO0lBQ2pELE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFRLENBQUE7SUFFakUsTUFBTSxDQUFDLElBQUksQ0FDVCxzREFBc0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FDM0UsQ0FBQTtJQUVELElBQUksQ0FBQztRQUNILDhDQUE4QztRQUM5QyxNQUFNLE9BQU8sR0FBRyxNQUFNLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQztZQUMxRCxXQUFXLEVBQUUsVUFBVTtZQUN2QixJQUFJLEVBQUU7Z0JBQ0osbUJBQW1CLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2FBQ3hDO1NBQ0YsQ0FBQyxDQUFBO1FBRUYsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLE1BQU0sY0FBYyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BELE1BQU0sRUFBRSxZQUFZO2dCQUNwQixJQUFJLEVBQUU7b0JBQ0osR0FBRyxPQUFPLENBQUMsSUFBSTtvQkFDZixtQkFBbUIsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3ZDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUTtvQkFDM0MsYUFBYSxFQUFFLElBQUksSUFBSSxFQUFFO2lCQUMxQjthQUNGLENBQUMsQ0FBQTtZQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUMxRCxDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixNQUFNLENBQUMsS0FBSyxDQUNWLGdEQUFnRCxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FDM0csQ0FBQTtJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxLQUFLLFVBQVUscUJBQXFCLENBQ2xDLE9BQVksRUFDWixHQUFrQjtJQUVsQixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQVEsQ0FBQTtJQUNqRCxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBUSxDQUFBO0lBRWpFLE1BQU0sQ0FBQyxJQUFJLENBQ1Qsb0RBQW9ELE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQ3pFLENBQUE7SUFFRCxJQUFJLENBQUM7UUFDSCw0Q0FBNEM7UUFDNUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxjQUFjLENBQUMsc0JBQXNCLENBQUM7WUFDMUQsV0FBVyxFQUFFLFVBQVU7WUFDdkIsSUFBSSxFQUFFO2dCQUNKLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTthQUN4QztTQUNGLENBQUMsQ0FBQTtRQUVGLElBQUksT0FBTyxFQUFFLENBQUM7WUFDWixNQUFNLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFO2dCQUNwRCxNQUFNLEVBQUUsVUFBVTtnQkFDbEIsSUFBSSxFQUFFO29CQUNKLEdBQUcsT0FBTyxDQUFDLElBQUk7b0JBQ2YsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUN2QyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVE7b0JBQzNDLFdBQVcsRUFBRSxJQUFJLElBQUksRUFBRTtvQkFDdkIsZUFBZSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTTtpQkFDeEM7YUFDRixDQUFDLENBQUE7WUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDeEQsQ0FBQztJQUNILENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsTUFBTSxDQUFDLEtBQUssQ0FDViw4Q0FBOEMsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQ3pHLENBQUE7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsS0FBSyxVQUFVLG1CQUFtQixDQUNoQyxPQUFZLEVBQ1osR0FBa0I7SUFFbEIsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFRLENBQUE7SUFDakQsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQVEsQ0FBQTtJQUVqRSxNQUFNLENBQUMsSUFBSSxDQUNULGtEQUFrRCxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUN2RSxDQUFBO0lBRUQsSUFBSSxDQUFDO1FBQ0gseUNBQXlDO1FBQ3pDLE1BQU0sT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDLHNCQUFzQixDQUFDO1lBQzFELFdBQVcsRUFBRSxVQUFVO1lBQ3ZCLElBQUksRUFBRTtnQkFDSixtQkFBbUIsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7YUFDeEM7U0FDRixDQUFDLENBQUE7UUFFRixJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ1osTUFBTSxjQUFjLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtnQkFDcEQsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsSUFBSSxFQUFFO29CQUNKLEdBQUcsT0FBTyxDQUFDLElBQUk7b0JBQ2YsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUN2QyxZQUFZLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxJQUFJLGVBQWU7b0JBQzlELGlCQUFpQixFQUNmLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFdBQVcsSUFBSSwyQkFBMkI7b0JBQ25FLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtpQkFDdEI7YUFDRixDQUFDLENBQUE7WUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDdEQsQ0FBQztJQUNILENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsTUFBTSxDQUFDLEtBQUssQ0FDViw0Q0FBNEMsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQ3ZHLENBQUE7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsS0FBSyxVQUFVLG1CQUFtQixDQUNoQyxPQUFZLEVBQ1osR0FBa0I7SUFFbEIsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFRLENBQUE7SUFFakQsTUFBTSxDQUFDLElBQUksQ0FDVCxrREFBa0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FDdEUsQ0FBQTtJQUVELElBQUksQ0FBQztRQUNILDBCQUEwQjtRQUMxQixNQUFNLENBQUMsSUFBSSxDQUNULG1CQUFtQixPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsZ0JBQWdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQ2hGLENBQUE7SUFDSCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxLQUFLLENBQ1YsNENBQTRDLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUN2RyxDQUFBO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDaEUsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFRLENBQUE7SUFDakQsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQVcsQ0FBQTtJQUUvQixJQUFJLENBQUM7UUFDSCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFBO1FBRXpELElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUE7WUFDckQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDMUIsS0FBSyxFQUFFLHdCQUF3QjtnQkFDL0IsT0FBTyxFQUFFLHlEQUF5RDthQUNuRSxDQUFDLENBQUE7UUFDSixDQUFDO1FBRUQsMkJBQTJCO1FBQzNCLE1BQU0sT0FBTyxHQUFHLE1BQU0sOEJBQThCLENBQ2xELEdBQUcsRUFDSCxhQUFhLENBQ2QsQ0FBQTtRQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNiLE1BQU0sQ0FBQyxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQTtZQUM1RCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMxQixLQUFLLEVBQUUsbUJBQW1CO2dCQUMxQixPQUFPLEVBQUUsdUNBQXVDO2FBQ2pELENBQUMsQ0FBQTtRQUNKLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBVyxDQUFBO1FBQy9CLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUE7UUFFL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsU0FBUyxFQUFFLENBQUMsQ0FBQTtRQUU1RCxtREFBbUQ7UUFDbkQsUUFBUSxTQUFTLEVBQUUsQ0FBQztZQUNsQixLQUFLLG9CQUFvQjtnQkFDdkIsTUFBTSx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQzNDLE1BQUs7WUFFUCxLQUFLLGtCQUFrQjtnQkFDckIsTUFBTSxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQ3pDLE1BQUs7WUFFUCxLQUFLLGdCQUFnQjtnQkFDbkIsTUFBTSxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQ3ZDLE1BQUs7WUFFUCxLQUFLLGdCQUFnQjtnQkFDbkIsTUFBTSxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQ3ZDLE1BQUs7WUFFUDtnQkFDRSxNQUFNLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO1FBQzlELENBQUM7UUFFRCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDZCxRQUFRLEVBQUUsSUFBSTtZQUNkLEtBQUssRUFBRSxTQUFTO1NBQ2pCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsTUFBTSxDQUFDLEtBQUssQ0FDVixzQ0FBc0MsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQ2pHLENBQUE7UUFFRCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFCLEtBQUssRUFBRSx1QkFBdUI7WUFDOUIsT0FBTyxFQUNMLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLDJCQUEyQjtTQUN2RSxDQUFDLENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNJLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDZCxNQUFNLEVBQUUsSUFBSTtRQUNaLE9BQU8sRUFBRSxxQ0FBcUM7S0FDL0MsQ0FBQyxDQUFBO0FBQ0osQ0FBQyJ9