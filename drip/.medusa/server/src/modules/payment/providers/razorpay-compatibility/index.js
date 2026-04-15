"use strict";
/**
 * Razorpay Payment Provider Compatibility Module for Medusa v2.13.1
 * Provides a wrapper around @tsc_tech/medusa-plugin-razorpay-payment (v0.0.11)
 * built for v2.7.1 to work with v2.13.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayProviderAdapter = exports.RazorpayServiceWrapper = void 0;
exports.validateRazorpaySetup = validateRazorpaySetup;
exports.getRazorpayProviderID = getRazorpayProviderID;
const utils_1 = require("@medusajs/framework/utils");
const service_wrapper_1 = require("./service-wrapper");
/**
 * Get compatibility wrapper provider export
 * This is called by Medusa's module system during initialization
 */
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.PAYMENT, {
    services: [service_wrapper_1.RazorpayServiceWrapper],
});
var service_wrapper_2 = require("./service-wrapper");
Object.defineProperty(exports, "RazorpayServiceWrapper", { enumerable: true, get: function () { return service_wrapper_2.RazorpayServiceWrapper; } });
var adapter_1 = require("./adapter");
Object.defineProperty(exports, "RazorpayProviderAdapter", { enumerable: true, get: function () { return adapter_1.RazorpayProviderAdapter; } });
/**
 * Helper to validate plugin setup
 */
async function validateRazorpaySetup(container, options) {
    const logger = container.logger;
    const errors = [];
    const warnings = [];
    try {
        // Check for required configuration
        if (!options.key_id) {
            errors.push("Missing required configuration: key_id");
        }
        if (!options.key_secret) {
            errors.push("Missing required configuration: key_secret");
        }
        // Check if @tsc_tech plugin is installed
        try {
            require("@tsc_tech/medusa-plugin-razorpay-payment/providers/razorpay");
        }
        catch (err) {
            errors.push("@tsc_tech/medusa-plugin-razorpay-payment is not installed or not found");
        }
        // Check for optional webhook secret in production
        if (process.env.NODE_ENV === "production" && !options.webhook_secret) {
            warnings.push("webhook_secret not configured; webhook validation will be skipped in production");
        }
        if (errors.length > 0) {
            logger.error("Razorpay configuration validation failed", errors);
        }
        if (warnings.length > 0) {
            logger.warn("Razorpay configuration warnings", warnings);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    catch (error) {
        logger.error("Error validating Razorpay setup", error);
        return {
            valid: false,
            errors: [error instanceof Error ? error.message : "Unknown validation error"],
            warnings,
        };
    }
}
/**
 * Get provider identifier
 */
function getRazorpayProviderID() {
    return "razorpay";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9wYXltZW50L3Byb3ZpZGVycy9yYXpvcnBheS1jb21wYXRpYmlsaXR5L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztHQUlHOzs7QUF3Qkgsc0RBMkRDO0FBS0Qsc0RBRUM7QUF4RkQscURBQW1FO0FBQ25FLHVEQUEwRDtBQUcxRDs7O0dBR0c7QUFDSCxrQkFBZSxJQUFBLHNCQUFjLEVBQUMsZUFBTyxDQUFDLE9BQU8sRUFBRTtJQUM3QyxRQUFRLEVBQUUsQ0FBQyx3Q0FBc0IsQ0FBQztDQUNuQyxDQUFDLENBQUE7QUFNRixxREFBMEQ7QUFBakQseUhBQUEsc0JBQXNCLE9BQUE7QUFDL0IscUNBQW1EO0FBQTFDLGtIQUFBLHVCQUF1QixPQUFBO0FBRWhDOztHQUVHO0FBQ0ksS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxTQUFjLEVBQ2QsT0FBb0M7SUFNcEMsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQWEsQ0FBQTtJQUN0QyxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUE7SUFDM0IsTUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFBO0lBRTdCLElBQUksQ0FBQztRQUNILG1DQUFtQztRQUNuQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQTtRQUN2RCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLENBQUE7UUFDM0QsQ0FBQztRQUVELHlDQUF5QztRQUN6QyxJQUFJLENBQUM7WUFDSCxPQUFPLENBQUMsNkRBQTZELENBQUMsQ0FBQTtRQUN4RSxDQUFDO1FBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNiLE1BQU0sQ0FBQyxJQUFJLENBQ1Qsd0VBQXdFLENBQ3pFLENBQUE7UUFDSCxDQUFDO1FBRUQsa0RBQWtEO1FBQ2xELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3JFLFFBQVEsQ0FBQyxJQUFJLENBQ1gsaUZBQWlGLENBQ2xGLENBQUE7UUFDSCxDQUFDO1FBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxLQUFLLENBQUMsMENBQTBDLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDbEUsQ0FBQztRQUVELElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQzFELENBQUM7UUFFRCxPQUFPO1lBQ0wsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUMxQixNQUFNO1lBQ04sUUFBUTtTQUNULENBQUE7SUFDSCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDdEQsT0FBTztZQUNMLEtBQUssRUFBRSxLQUFLO1lBQ1osTUFBTSxFQUFFLENBQUMsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUM7WUFDN0UsUUFBUTtTQUNULENBQUE7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IscUJBQXFCO0lBQ25DLE9BQU8sVUFBVSxDQUFBO0FBQ25CLENBQUMifQ==