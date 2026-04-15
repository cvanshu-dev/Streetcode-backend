/**
 * Razorpay Webhook Handler
 * Handles incoming webhooks from Razorpay payment service
 * Validates webhook signatures and processes payment events
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, MedusaErrorTypes } from "@medusajs/utils"
import crypto from "crypto"

/**
 * Verify Razorpay webhook signature
 * Ensures the webhook came from Razorpay and not tampered with
 */
async function verifyRazorpayWebhookSignature(
  req: MedusaRequest,
  webhookSecret: string
): Promise<boolean> {
  const logger = req.scope.resolve("logger") as any

  try {
    const signature = req.get("X-Razorpay-Signature") || ""
    const body = JSON.stringify(req.body)

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex")

    const isValid = signature === expectedSignature

    if (!isValid) {
      logger.warn("Razorpay webhook signature verification failed")
    }

    return isValid
  } catch (error) {
    logger.error(
      `Error verifying Razorpay webhook signature: ${error instanceof Error ? error.message : "Unknown error"}`
    )
    return false
  }
}

/**
 * Process payment authorized webhook
 */
async function handlePaymentAuthorized(
  payload: any,
  req: MedusaRequest
): Promise<void> {
  const logger = req.scope.resolve("logger") as any
  const paymentService = req.scope.resolve("paymentService") as any

  logger.info(
    `Processing Razorpay payment.authorized webhook for ${payload.payment.id}`
  )

  try {
    // Update payment session status to AUTHORIZED
    const session = await paymentService.retrievePaymentSession({
      provider_id: "razorpay",
      data: {
        razorpay_payment_id: payload.payment.id,
      },
    })

    if (session) {
      await paymentService.updatePaymentSession(session.id, {
        status: "authorized",
        data: {
          ...session.data,
          razorpay_payment_id: payload.payment.id,
          razorpay_order_id: payload.payment.order_id,
          authorized_at: new Date(),
        },
      })
      logger.info(`Payment authorized: ${payload.payment.id}`)
    }
  } catch (error) {
    logger.error(
      `Error processing payment.authorized webhook: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Process payment captured webhook
 */
async function handlePaymentCaptured(
  payload: any,
  req: MedusaRequest
): Promise<void> {
  const logger = req.scope.resolve("logger") as any
  const paymentService = req.scope.resolve("paymentService") as any

  logger.info(
    `Processing Razorpay payment.captured webhook for ${payload.payment.id}`
  )

  try {
    // Update payment session status to CAPTURED
    const session = await paymentService.retrievePaymentSession({
      provider_id: "razorpay",
      data: {
        razorpay_payment_id: payload.payment.id,
      },
    })

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
      })
      logger.info(`Payment captured: ${payload.payment.id}`)
    }
  } catch (error) {
    logger.error(
      `Error processing payment.captured webhook: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Process payment failed webhook
 */
async function handlePaymentFailed(
  payload: any,
  req: MedusaRequest
): Promise<void> {
  const logger = req.scope.resolve("logger") as any
  const paymentService = req.scope.resolve("paymentService") as any

  logger.warn(
    `Processing Razorpay payment.failed webhook for ${payload.payment.id}`
  )

  try {
    // Update payment session status to ERROR
    const session = await paymentService.retrievePaymentSession({
      provider_id: "razorpay",
      data: {
        razorpay_payment_id: payload.payment.id,
      },
    })

    if (session) {
      await paymentService.updatePaymentSession(session.id, {
        status: "error",
        data: {
          ...session.data,
          razorpay_payment_id: payload.payment.id,
          error_reason: payload.payment.error?.reason || "Unknown error",
          error_description:
            payload.payment.error?.description || "Payment processing failed",
          failed_at: new Date(),
        },
      })
      logger.warn(`Payment failed: ${payload.payment.id}`)
    }
  } catch (error) {
    logger.error(
      `Error processing payment.failed webhook: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Process refund created webhook
 */
async function handleRefundCreated(
  payload: any,
  req: MedusaRequest
): Promise<void> {
  const logger = req.scope.resolve("logger") as any

  logger.info(
    `Processing Razorpay refund.created webhook for ${payload.refund.id}`
  )

  try {
    // Record refund in system
    logger.info(
      `Refund created: ${payload.refund.id} for payment ${payload.refund.payment_id}`
    )
  } catch (error) {
    logger.error(
      `Error processing refund.created webhook: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Main webhook handler
 * GET /store/razorpay/webhooks
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger") as any
  const payload = req.body as any

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!webhookSecret) {
      logger.warn("Razorpay webhook secret not configured")
      return res.status(400).json({
        error: "Webhook not configured",
        message: "RAZORPAY_WEBHOOK_SECRET environment variable is not set",
      })
    }

    // Verify webhook signature
    const isValid = await verifyRazorpayWebhookSignature(
      req,
      webhookSecret
    )

    if (!isValid) {
      logger.error("Razorpay webhook signature validation failed")
      return res.status(401).json({
        error: "Invalid signature",
        message: "Webhook signature verification failed",
      })
    }

    const payload = req.body as any
    const eventType = payload.event

    logger.info(`Received Razorpay webhook event: ${eventType}`)

    // Route to appropriate handler based on event type
    switch (eventType) {
      case "payment.authorized":
        await handlePaymentAuthorized(payload, req)
        break

      case "payment.captured":
        await handlePaymentCaptured(payload, req)
        break

      case "payment.failed":
        await handlePaymentFailed(payload, req)
        break

      case "refund.created":
        await handleRefundCreated(payload, req)
        break

      default:
        logger.debug(`Unhandled webhook event type: ${eventType}`)
    }

    return res.json({
      received: true,
      event: eventType,
    })
  } catch (error) {
    logger.error(
      `Error processing Razorpay webhook: ${error instanceof Error ? error.message : "Unknown error"}`
    )

    return res.status(500).json({
      error: "Internal server error",
      message:
        error instanceof Error ? error.message : "Failed to process webhook",
    })
  }
}

/**
 * Health check endpoint
 * GET /store/razorpay/webhooks
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.json({
    status: "ok",
    message: "Razorpay webhook endpoint is active",
  })
}
