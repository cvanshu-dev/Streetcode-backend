"use strict";
/**
 * Razorpay Payment Configuration Helper
 * Provides utility functions for Razorpay payment provider setup and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAZORPAY_PAYMENT_STATUS_LABELS = void 0;
exports.validateRazorpayConfig = validateRazorpayConfig;
exports.getRazorpayConfigFromEnv = getRazorpayConfigFromEnv;
exports.isRazorpayTestMode = isRazorpayTestMode;
exports.getRazorpayMode = getRazorpayMode;
exports.formatAmountForRazorpay = formatAmountForRazorpay;
exports.formatAmountFromRazorpay = formatAmountFromRazorpay;
exports.validateRazorpayWebhookSignature = validateRazorpayWebhookSignature;
exports.getRazorpayErrorMessage = getRazorpayErrorMessage;
exports.createRazorpayWebhookUrl = createRazorpayWebhookUrl;
exports.getRequiredRazorpayEnvVars = getRequiredRazorpayEnvVars;
exports.generateRazorpayConfigReport = generateRazorpayConfigReport;
/**
 * Validate Razorpay configuration
 * Returns validation result with detailed error messages
 */
function validateRazorpayConfig(config) {
    const errors = [];
    const warnings = [];
    // Check required fields
    if (!config.key_id) {
        errors.push("Missing required: key_id");
    }
    if (!config.key_secret) {
        errors.push("Missing required: key_secret");
    }
    // Validate key format (Razorpay keys have specific patterns)
    if (config.key_id && !config.key_id.startsWith("rzp_")) {
        warnings.push("key_id should start with 'rzp_' (test: 'rzp_test_', live: 'rzp_live_')");
    }
    // Check optional fields
    if (!config.webhook_secret && process.env.NODE_ENV === "production") {
        warnings.push("webhook_secret not set; webhook validation will be disabled in production");
    }
    // Validate expiry periods if set
    if (config.automatic_expiry_period !== undefined) {
        if (config.automatic_expiry_period < 12) {
            errors.push("automatic_expiry_period must be at least 12 minutes");
        }
        if (config.automatic_expiry_period > 43200) {
            // 30 days in minutes
            errors.push("automatic_expiry_period cannot exceed 30 days (43200 minutes)");
        }
    }
    if (config.manual_expiry_period !== undefined) {
        if (config.manual_expiry_period < 1) {
            errors.push("manual_expiry_period must be at least 1 minute");
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Get Razorpay configuration from environment variables
 */
function getRazorpayConfigFromEnv() {
    return {
        key_id: process.env.RAZORPAY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
        razorpay_account: process.env.RAZORPAY_TEST_ACCOUNT || process.env.RAZORPAY_ACCOUNT,
        automatic_expiry_period: parseInt(process.env.RAZORPAY_EXPIRY_PERIOD || "30"),
        manual_expiry_period: parseInt(process.env.RAZORPAY_MANUAL_EXPIRY || "20"),
        refund_speed: process.env.RAZORPAY_REFUND_SPEED || "normal",
        webhook_secret: process.env.RAZORPAY_TEST_WEBHOOK_SECRET ||
            process.env.RAZORPAY_WEBHOOK_SECRET,
    };
}
/**
 * Check if Razorpay is in test mode (sandbox)
 */
function isRazorpayTestMode() {
    const keyId = process.env.RAZORPAY_ID || "";
    return keyId.startsWith("rzp_test_");
}
/**
 * Get Razorpay mode as string
 */
function getRazorpayMode() {
    if (isRazorpayTestMode()) {
        return "test (sandbox)";
    }
    return "live";
}
/**
 * Format amount to Razorpay format (paise - smallest unit)
 * Razorpay expects amounts in paise (1 rupee = 100 paise)
 */
function formatAmountForRazorpay(amountInCurrency) {
    // Multiply by 100 to convert to paise
    return Math.round(amountInCurrency * 100);
}
/**
 * Format amount from Razorpay format (paise) to currency
 */
function formatAmountFromRazorpay(amountInPaise) {
    // Divide by 100 to convert from paise
    return Math.round(amountInPaise / 100);
}
/**
 * Validate Razorpay signature for webhooks
 * Used to verify that webhooks came from Razorpay
 */
function validateRazorpayWebhookSignature(body, signature, secret) {
    if (!secret) {
        console.warn("Webhook secret not configured - skipping signature validation");
        return true;
    }
    const crypto = require("crypto");
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
    return signature === expectedSignature;
}
/**
 * Get Razorpay payment status labels for UI
 */
exports.RAZORPAY_PAYMENT_STATUS_LABELS = {
    pending: "Payment Pending",
    authorized: "Payment Authorized",
    captured: "Payment Captured",
    canceled: "Payment Canceled",
    failed: "Payment Failed",
    error: "Payment Error",
    success: "Payment Successful",
    requires_more: "Requires Additional Information",
};
/**
 * Get Razorpay error message from error code
 */
function getRazorpayErrorMessage(errorCode) {
    const errorMessages = {
        BAD_REQUEST_ERROR: "Invalid payment request",
        GATEWAY_ERROR: "Payment gateway error",
        INVALID_ARGUMENT: "Invalid payment argument",
        RESOURCE_NOT_FOUND: "Payment resource not found",
        BAD_REQUEST: "Bad payment request",
        TIMEOUT: "Payment processing timeout",
        NETWORK_ERROR: "Network connection error",
        SERVER_ERROR: "Server error while processing payment",
    };
    return errorMessages[errorCode] || "Payment processing failed";
}
/**
 * Create Razorpay webhook URL for this deployment
 */
function createRazorpayWebhookUrl(baseUrl) {
    return `${baseUrl}/store/razorpay/webhooks`;
}
/**
 * Get all required environment variables for Razorpay
 */
function getRequiredRazorpayEnvVars() {
    return [
        {
            name: "RAZORPAY_ID",
            required: true,
            description: "Razorpay API Key ID (from dashboard)",
        },
        {
            name: "RAZORPAY_SECRET",
            required: true,
            description: "Razorpay API Key Secret (from dashboard)",
        },
        {
            name: "RAZORPAY_ACCOUNT",
            required: false,
            description: "Razorpay Account ID for multi-account setup",
        },
        {
            name: "RAZORPAY_TEST_ACCOUNT",
            required: false,
            description: "Razorpay Test Account ID",
        },
        {
            name: "RAZORPAY_WEBHOOK_SECRET",
            required: false,
            description: "Webhook signature secret for production",
        },
        {
            name: "RAZORPAY_TEST_WEBHOOK_SECRET",
            required: false,
            description: "Webhook signature secret for testing",
        },
    ];
}
/**
 * Generate comprehensive Razorpay configuration report
 */
function generateRazorpayConfigReport() {
    const config = getRazorpayConfigFromEnv();
    const validation = validateRazorpayConfig(config);
    return {
        timestamp: new Date().toISOString(),
        mode: getRazorpayMode(),
        isTestMode: isRazorpayTestMode(),
        configured: validation.valid,
        configStatus: {
            hasKeyId: !!config.key_id,
            hasKeySecret: !!config.key_secret,
            hasRazorpayAccount: !!config.razorpay_account,
            hasWebhookSecret: !!config.webhook_secret,
            expiryPeriod: String(config.automatic_expiry_period || 30),
        },
        validation,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF6b3JwYXktY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvcGF5bWVudC9yYXpvcnBheS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7O0FBbUJILHdEQXFEQztBQUtELDREQWtCQztBQUtELGdEQUdDO0FBS0QsMENBS0M7QUFNRCwwREFHQztBQUtELDREQUdDO0FBTUQsNEVBa0JDO0FBbUJELDBEQWFDO0FBS0QsNERBRUM7QUFLRCxnRUFxQ0M7QUFLRCxvRUErQkM7QUFoUUQ7OztHQUdHO0FBQ0gsU0FBZ0Isc0JBQXNCLENBQ3BDLE1BQXNDO0lBTXRDLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQTtJQUMzQixNQUFNLFFBQVEsR0FBYSxFQUFFLENBQUE7SUFFN0Isd0JBQXdCO0lBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO0lBQ3pDLENBQUM7SUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0lBRUQsNkRBQTZEO0lBQzdELElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDdkQsUUFBUSxDQUFDLElBQUksQ0FBQyx3RUFBd0UsQ0FBQyxDQUFBO0lBQ3pGLENBQUM7SUFFRCx3QkFBd0I7SUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWSxFQUFFLENBQUM7UUFDcEUsUUFBUSxDQUFDLElBQUksQ0FDWCwyRUFBMkUsQ0FDNUUsQ0FBQTtJQUNILENBQUM7SUFF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