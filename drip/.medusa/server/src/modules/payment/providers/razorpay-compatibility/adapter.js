"use strict";
/**
 * API Adapter: Bridges Medusa v2.7.1 plugin with v2.13.1 application
 * Handles interface and method signature changes between versions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayProviderAdapter = void 0;
const utils_1 = require("@medusajs/utils");
/**
 * Adapter to make v2.7.1 payment provider work with v2.13.1
 * Intercepts method calls and adapts signatures when needed
 */
class RazorpayProviderAdapter {
    constructor(provider, logger) {
        this.originalProvider = provider;
        this.logger = logger;
    }
    /**
     * Safely call provider methods with version detection
     */
    async callProviderMethod(methodName, args, fallback) {
        try {
            const method = this.originalProvider[methodName];
            if (typeof method !== "function") {
                this.logger.warn(`Method ${methodName} not found on provider, using fallback`);
                if (fallback) {
                    return await fallback(...args);
                }
                throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.NOT_FOUND, `Method ${methodName} not available on payment provider`);
            }
            return await method.apply(this.originalProvider, args);
        }
        catch (error) {
            this.logger.error(`Error calling provider method ${methodName}: ${error.message}`);
            throw this.normalizeError(error);
        }
    }
    /**
     * Normalize errors from different Medusa versions
     */
    normalizeError(error) {
        // If error already has the right structure, return it
        if (error instanceof utils_1.MedusaError) {
            return error;
        }
        // Handle v2.7.1 error format
        if (error?.code || error?.detail) {
            return new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_DATA, error.detail || error.message || "Payment processing error");
        }
        // Default error handling
        return new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_DATA, error?.message || "Unknown payment provider error");
    }
    /**
     * Adapt input parameters between versions
     * v2.7.1 might have different field names or structures
     */
    adaptInput(version, methodName, input) {
        if (version === "2.7.1") {
            // Apply v2.7.1 specific input transformations
            switch (methodName) {
                case "createPaymentSession":
                case "updatePaymentSession":
                case "authorizePaymentSession":
                    // Ensure required fields exist
                    if (input && !input.currency) {
                        input.currency = input.currency_code || "USD";
                    }
                    break;
            }
        }
        return input;
    }
    /**
     * Adapt output between versions
     * v2.7.1 might return different field names or structures
     */
    adaptOutput(version, methodName, output) {
        if (version === "2.7.1") {
            // Apply v2.7.1 specific output transformations
            switch (methodName) {
                case "retrievePaymentSession":
                    // Ensure status field uses new enum names if needed
                    if (output?.status) {
                        output.status = this.mapPaymentStatus(output.status);
                    }
                    break;
            }
        }
        return output;
    }
    /**
     * Map payment status between versions
     */
    mapPaymentStatus(status) {
        const statusMap = {
            pending: utils_1.PaymentSessionStatus.PENDING,
            authorized: utils_1.PaymentSessionStatus.AUTHORIZED,
            captured: utils_1.PaymentSessionStatus.CAPTURED,
            canceled: utils_1.PaymentSessionStatus.CANCELED,
            requires_more: utils_1.PaymentSessionStatus.REQUIRES_MORE,
            error: utils_1.PaymentSessionStatus.ERROR,
        };
        return statusMap[status?.toLowerCase()] || utils_1.PaymentSessionStatus.PENDING;
    }
}
exports.RazorpayProviderAdapter = RazorpayProviderAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3BheW1lbnQvcHJvdmlkZXJzL3Jhem9ycGF5LWNvbXBhdGliaWxpdHkvYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7QUFFSCwyQ0FBcUY7QUFFckY7OztHQUdHO0FBQ0gsTUFBYSx1QkFBdUI7SUFJbEMsWUFDRSxRQUFhLEVBQ2IsTUFBVztRQUVYLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUE7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGtCQUFrQixDQUN0QixVQUFrQixFQUNsQixJQUFXLEVBQ1gsUUFBMkM7UUFFM0MsSUFBSSxDQUFDO1lBQ0gsTUFBTSxNQUFNLEdBQUksSUFBSSxDQUFDLGdCQUF3QixDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBRXpELElBQUksT0FBTyxNQUFNLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLFVBQVUsVUFBVSx3Q0FBd0MsQ0FDN0QsQ0FBQTtnQkFDRCxJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUNiLE9BQU8sTUFBTSxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtnQkFDaEMsQ0FBQztnQkFDRCxNQUFNLElBQUksbUJBQVcsQ0FDbkIsd0JBQWdCLENBQUMsU0FBUyxFQUMxQixVQUFVLFVBQVUsb0NBQW9DLENBQ3pELENBQUE7WUFDSCxDQUFDO1lBRUQsT0FBTyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFBO1FBQ3hELENBQUM7UUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNm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