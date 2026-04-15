"use strict";
/**
 * Razorpay Admin Health Check Endpoint
 * Provides diagnostic information about Razorpay payment provider setup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
/**
 * Health check endpoint for Razorpay provider
 * GET /admin/razorpay/health
 */
async function GET(req, res) {
    const logger = req.scope.resolve("logger");
    const result = {
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
            hasRazorpayAccount: !!process.env.RAZORPAY_ACCOUNT ||
                !!process.env.RAZORPAY_TEST_ACCOUNT,
        },
        status: "unknown",
        message: "",
        timestamp: new Date().toISOString(),
    };
    try {
        // Check required configuration
        const missingConfig = [];
        if (!result.configuration.hasKeyId) {
            missingConfig.push("RAZORPAY_ID");
        }
        if (!result.configuration.hasKeySecret) {
            missingConfig.push("RAZORPAY_SECRET");
        }
        if (missingConfig.length > 0) {
            result.healthy = false;
            result.status = "unconfigured";
            result.message = `Missing required environment variables: ${missingConfig.join(", ")}`;
            logger.warn(result.message);
        }
        else {
            result.status = "configured";
            result.message = "Razorpay payment provider is properly configured";
            logger.info(result.message);
        }
        // Optional: Try to verify the provider loads
        try {
            require("@tsc_tech/medusa-plugin-razorpay-payment/providers/razorpay");
            result.status = "ready";
            result.message = "All systems nominal";
        }
        catch (error) {
            logger.warn("Could not verify Razorpay plugin load");
            // This is not critical for the health check
        }
        res.json(result);
    }
    catch (error) {
        result.healthy = false;
        result.status = "error";
        result.message =
            error instanceof Error ? error.message : "Unknown error";
        logger.error("Razorpay health check failed:", error);
        res.status(500).json(result);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Jhem9ycGF5L2hlYWx0aC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOztBQTBCSCxrQkFzRUM7QUExRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFRLENBQUE7SUFFakQsTUFBTSxNQUFNLEdBQXNCO1FBQ2hDLE9BQU8sRUFBRSxJQUFJO1FBQ2IsUUFBUSxFQUFFLFVBQVU7UUFDcEIsT0FBTyxFQUFFO1lBQ1AsTUFBTSxFQUFFLFFBQVE7WUFDaEIsU0FBUyxFQUFFLFFBQVE7U0FDcEI7UUFDRCxhQUFhLEVBQUU7WUFDYixRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVztZQUNuQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZTtZQUMzQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUI7WUFDdkQsa0JBQWtCLEVBQ2hCLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtnQkFDOUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCO1NBQ3RDO1FBQ0QsTUFBTSxFQUFFLFNBQVM7UUFDakIsT0FBTyxFQUFFLEVBQUU7UUFDWCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7S0FDcEMsQ0FBQTtJQUVELElBQUksQ0FBQztRQUNILCtCQUErQjtRQUMvQixNQUFNLGFBQWEsR0FBYSxFQUFFLENBQUE7UUFFbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUNuQyxDQUFDO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdkMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO1FBQ3ZDLENBQUM7UUFFRCxJQUFJLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7WUFDdEIsTUFBTSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUE7WUFDOUIsTUFBTSxDQUFDLE9BQU8sR0FBRywyQ0FBMkMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFBO1lBQ3RGLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzdCLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUE7WUFDNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrREFBa0QsQ0FBQTtZQUNuRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUM3QixDQUFDO1FBRUQsNkNBQTZDO1FBQzdDLElBQUksQ0FBQztZQUNILE9BQU8sQ0FBQyw2REFBNkQsQ0FBQyxDQUFBO1lBQ3RFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFBO1lBQ3ZCLE1BQU0sQ0FBQyxPQUFPLEdBQUcscUJBQXFCLENBQUE7UUFDeEMsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUE7WUFDcEQsNENBQTRDO1FBQzlDLENBQUM7UUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2xCLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7UUFDdEIsTUFBTSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUE7UUFDdkIsTUFBTSxDQUFDLE9BQU87WUFDWixLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUE7UUFFMUQsTUFBTSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUVwRCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUM5QixDQUFDO0FBQ0gsQ0FBQyJ9