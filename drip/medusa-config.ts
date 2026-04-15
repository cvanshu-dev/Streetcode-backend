import { defineConfig } from '@medusajs/framework/utils'

console.log("DATABASE_URL =", process.env.DATABASE_URL)
console.log("REDIS_URL =", process.env.REDIS_URL)

/**
 * Razorpay Payment Provider Configuration
 * Uses compatibility wrapper for v2.7.1 plugin with v2.13.1 framework
 */

// Helper to safely parse env variables
const getEnvVariable = (key: string, defaultValue?: string): string | undefined => {
  const value = process.env[key]
  return value || defaultValue
}

// Razorpay provider configuration with fallback handling
const razorpayConfig = {
  resolve: "./src/modules/payment/providers/razorpay-compatibility",
  id: "razorpay",
  options: {
    key_id: getEnvVariable("RAZORPAY_ID"),
    key_secret: getEnvVariable("RAZORPAY_SECRET"),
    razorpay_account: getEnvVariable(
      "RAZORPAY_TEST_ACCOUNT",
      getEnvVariable("RAZORPAY_ACCOUNT")
    ),
    automatic_expiry_period: 30, // 12 minutes to 30 days in minutes
    manual_expiry_period: 20,
    refund_speed: "normal",
    webhook_secret: getEnvVariable(
      "RAZORPAY_TEST_WEBHOOK_SECRET",
      getEnvVariable("RAZORPAY_WEBHOOK_SECRET")
    ),
  },
}

// Validate Razorpay configuration
const razorpayEnabled =
  razorpayConfig.options.key_id && razorpayConfig.options.key_secret

if (!razorpayEnabled) {
  console.warn(
    "⚠️  Razorpay payment provider not fully configured. " +
      "Set RAZORPAY_ID and RAZORPAY_SECRET environment variables to enable payments."
  )
}

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL || "postgres://localhost/placeholder",
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server" ?? "shared",

    http: {
      storeCors: process.env.STORE_CORS || "*",
      adminCors: process.env.ADMIN_CORS || "*",
      authCors: process.env.AUTH_CORS || "*",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: razorpayEnabled
          ? [razorpayConfig]
          : [], // Empty providers list if Razorpay not configured
      },
    },
  ],
})