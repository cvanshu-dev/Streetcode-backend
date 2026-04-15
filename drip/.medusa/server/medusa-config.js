"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
console.log("DATABASE_URL =", process.env.DATABASE_URL);
console.log("REDIS_URL =", process.env.REDIS_URL);
/**
 * Razorpay Payment Provider Configuration
 * Uses compatibility wrapper for v2.7.1 plugin with v2.13.1 framework
 */
// Helper to safely parse env variables
const getEnvVariable = (key, defaultValue) => {
    const value = process.env[key];
    return value || defaultValue;
};
// Razorpay provider configuration with fallback handling
const razorpayConfig = {
    resolve: "./src/modules/payment/providers/razorpay-compatibility",
    id: "razorpay",
    options: {
        key_id: getEnvVariable("RAZORPAY_ID"),
        key_secret: getEnvVariable("RAZORPAY_SECRET"),
        razorpay_account: getEnvVariable("RAZORPAY_TEST_ACCOUNT", getEnvVariable("RAZORPAY_ACCOUNT")),
        automatic_expiry_period: 30, // 12 minutes to 30 days in minutes
        manual_expiry_period: 20,
        refund_speed: "normal",
        webhook_secret: getEnvVariable("RAZORPAY_TEST_WEBHOOK_SECRET", getEnvVariable("RAZORPAY_WEBHOOK_SECRET")),
    },
};
// Validate Razorpay configuration
const razorpayEnabled = razorpayConfig.options.key_id && razorpayConfig.options.key_secret;
if (!razorpayEnabled) {
    console.warn("⚠️  Razorpay payment provider not fully configured. " +
        "Set RAZORPAY_ID and RAZORPAY_SECRET environment variables to enable payments.");
}
exports.default = (0, utils_1.defineConfig)({
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL || "postgres://localhost/placeholder",
        redisUrl: process.env.REDIS_URL,
        workerMode: process.env.MEDUSA_WORKER_MODE ?? "shared",
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBd0Q7QUFFeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7QUFFakQ7OztHQUdHO0FBRUgsdUNBQXVDO0FBQ3ZDLE1BQU0sY0FBYyxHQUFHLENBQUMsR0FBVyxFQUFFLFlBQXFCLEVBQXNCLEVBQUU7SUFDaEYsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUM5QixPQUFPLEtBQUssSUFBSSxZQUFZLENBQUE7QUFDOUIsQ0FBQyxDQUFBO0FBRUQseURBQXlEO0FBQ3pELE1BQU0sY0FBYyxHQUFHO0lBQ3JCLE9BQU8sRUFBRSx3REFBd0Q7SUFDakUsRUFBRSxFQUFFLFVBQVU7SUFDZCxPQUFPLEVBQUU7UUFDUCxNQUFNLEVBQUUsY0FBYyxDQUFDLGFBQWEsQ0FBQztRQUNyQyxVQUFVLEVBQUUsY0FBYyxDQUFDLGlCQUFpQixDQUFDO1FBQzdDLGdCQUFnQixFQUFFLGNBQWMsQ0FDOUIsdUJBQXVCLEVBQ3ZCLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUNuQztRQUNELHVCQUF1QixFQUFFLEVBQUUsRUFBRSxtQ0FBbUM7UUFDaEUsb0JBQW9CLEVBQUUsRUFBRTtRQUN4QixZQUFZLEVBQUUsUUFBUTtRQUN0QixjQUFjLEVBQUUsY0FBYyxDQUM1Qiw4QkFBOEIsRUFDOUIsY0FBYyxDQUFDLHlCQUF5QixDQUFDLENBQzFDO0tBQ0Y7Q0FDRixDQUFBO0FBRUQsa0NBQWtDO0FBQ2xDLE1BQU0sZUFBZSxHQUNuQixjQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQTtBQUVwRSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDckIsT0FBTyxDQUFDLElBQUksQ0FDVixzREFBc0Q7UUFDcEQsK0VBQStFLENBQ2xGLENBQUE7QUFDSCxDQUFDO0FBRUQsa0JBQWUsSUFBQSxvQkFBWSxFQUFDO0lBQzFCLGFBQWEsRUFBRTtRQUNiLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxrQ0FBa0M7UUFDM0UsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUztRQUMvQixVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBb0QsSUFBSSxRQUFRO1FBRXhGLElBQUksRUFBRTtZQUNKLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHO1lBQ3hDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHO1lBQ3hDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxHQUFHO1lBQ3RDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxhQUFhO1lBQ2xELFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhO1NBQ3pEO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUDtZQUNFLE9BQU8sRUFBRSwwQkFBMEI7WUFDbkMsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRSxlQUFlO29CQUN4QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7b0JBQ2xCLENBQUMsQ0FBQyxFQUFFLEVBQUUsa0RBQWtEO2FBQzNEO1NBQ0Y7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9