import { defineConfig } from '@medusajs/framework/utils'
console.log("DATABASE_URL =", process.env.DATABASE_URL)
console.log("REDIS_URL =", process.env.REDIS_URL)

export default defineConfig({ // Use 'export default' for v2
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
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@tsc_tech/medusa-plugin-razorpay-payment/providers/razorpay",
            id: "razorpay",
            options: {
              key_id: process.env.RAZORPAY_ID,
key_secret: process.env.RAZORPAY_SECRET,
              razorpay_account:
                  process?.env?.RAZORPAY_TEST_ACCOUNT ??
                  process?.env?.RAZORPAY_ACCOUNT,
              automatic_expiry_period: 30 /* any value between 12minuts and 30 days expressed in minutes*/,
              manual_expiry_period: 20,
              refund_speed: "normal",
              webhook_secret:
                  process?.env?.RAZORPAY_TEST_WEBHOOK_SECRET ??
                  process?.env?.RAZORPAY_WEBHOOK_SECRET
          }
          },
        ],
      },
    },
  ],
})