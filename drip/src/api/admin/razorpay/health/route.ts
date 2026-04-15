/**
 * Razorpay Admin Health Check Endpoint
 * Provides diagnostic information about Razorpay payment provider setup
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

interface HealthCheckResult {
  healthy: boolean
  provider: "razorpay"
  version: {
    plugin: string
    framework: string
  }
  configuration: {
    hasKeyId: boolean
    hasKeySecret: boolean
    hasWebhookSecret: boolean
    hasRazorpayAccount: boolean
  }
  status: string
  message: string
  timestamp: string
}

/**
 * Health check endpoint for Razorpay provider
 * GET /admin/razorpay/health
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger") as any

  const result: HealthCheckResult = {
    healthy: true,
    provider: "razorpay",
    version: {
      plugin: "0.0.11",
      framework: "2.13.1",
    },
    configuration: {
      hasKeyId: !!process.env.RAZORPAY_ID,
      hasKeySecret: !!process.env.RAZORPAY_SECRET,
      hasWebhookSecret: !!process.env.RAZORPAY_WEBHOOK_SECRET,
      hasRazorpayAccount:
        !!process.env.RAZORPAY_ACCOUNT ||
        !!process.env.RAZORPAY_TEST_ACCOUNT,
    },
    status: "unknown",
    message: "",
    timestamp: new Date().toISOString(),
  }

  try {
    // Check required configuration
    const missingConfig: string[] = []

    if (!result.configuration.hasKeyId) {
      missingConfig.push("RAZORPAY_ID")
    }

    if (!result.configuration.hasKeySecret) {
      missingConfig.push("RAZORPAY_SECRET")
    }

    if (missingConfig.length > 0) {
      result.healthy = false
      result.status = "unconfigured"
      result.message = `Missing required environment variables: ${missingConfig.join(", ")}`
      logger.warn(result.message)
    } else {
      result.status = "configured"
      result.message = "Razorpay payment provider is properly configured"
      logger.info(result.message)
    }

    // Optional: Try to verify the provider loads
    try {
      require("@tsc_tech/medusa-plugin-razorpay-payment/providers/razorpay")
      result.status = "ready"
      result.message = "All systems nominal"
    } catch (error) {
      logger.warn("Could not verify Razorpay plugin load")
      // This is not critical for the health check
    }

    res.json(result)
  } catch (error) {
    result.healthy = false
    result.status = "error"
    result.message =
      error instanceof Error ? error.message : "Unknown error"

    logger.error("Razorpay health check failed:", error)

    res.status(500).json(result)
  }
}
