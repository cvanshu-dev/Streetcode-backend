"use strict";
/**
 * Razorpay Payment Service Wrapper
 * Wraps the @tsc_tech plugin service to ensure v2.13.1 compatibility
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayServiceWrapper = void 0;
const utils_1 = require("@medusajs/utils");
const adapter_1 = require("./adapter");
/**
 * Wrapper service that ensures compatibility with both v2.7.1 plugin and v2.13.1 framework
 */
class RazorpayServiceWrapper extends utils_1.AbstractPaymentProvider {
    constructor(container, options) {
        super(container, options);
        this.logger = container.logger || console;
        this.containerRef = container;
        this.optionsRef = options;
        try {
            this.wrappedProvider = this.initializePluginProvider(container, options);
            this.adapter = new adapter_1.RazorpayProviderAdapter(this.wrappedProvider, this.logger);
            if (this.logger?.info) {
                this.logger.info("Razorpay provider wrapper initialized");
            }
        }
        catch (error) {
            const msg = error?.message || String(error);
            if (this.logger?.error) {
                this.logger.error(`Failed to initialize Razorpay provider: ${msg}`);
            }
            throw error;
        }
    }
    initializePluginProvider(container, options) {
        try {
            const RazorpayServiceModule = require("@tsc_tech/medusa-plugin-razorpay-payment/providers/razorpay");
            const RazorpayService = RazorpayServiceModule.default || RazorpayServiceModule;
            if (!RazorpayService) {
                throw new Error("Could not load RazorpayService from plugin");
            }
            return new RazorpayService(container, options);
        }
        catch (error) {
            throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_ARGUMENT, `Failed to load Razorpay payment provider: ${error?.message || "Unknown error"}`);
        }
    }
    async healthCheck() {
        try {
            if (typeof this.wrappedProvider.validateOptions === "function") {
                ;
                this.wrappedProvider.validateOptions(this.optionsRef);
            }
            return true;
        }
        catch {
            return false;
        }
    }
    async initializePayment(input) {
        try {
            const result = await this.adapter.callProviderMethod("initializePayment", [input], async () => ({}));
            return result;
        }
        catch (error) {
            throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_ARGUMENT, `Failed to initialize payment: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async authorizePayment(input) {
        try {
            const result = await this.adapter.callProviderMethod("authorizePaymentSession", [input]);
            return {
                status: result?.status || utils_1.PaymentSessionStatus.PENDING,
                ...result,
            };
        }
        catch (error) {
            throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_ARGUMENT, `Failed to authorize payment: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async capturePayment(input) {
        try {
            const result = await this.adapter.callProviderMethod("capturePaymentSession", [input]);
            return {
                status: result?.status || utils_1.PaymentSessionStatus.PENDING,
                ...result,
            };
        }
        catch (error) {
            throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_ARGUMENT, `Failed to capture payment: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async refundPayment(input) {
        try {
            const result = await this.adapter.callProviderMethod("refundPaymentSession", [input]);
            return {
                status: result?.status || utils_1.PaymentSessionStatus.PENDING,
                ...result,
            };
        }
        catch (error) {
            throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_ARGUMENT, `Failed to refund payment: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async cancelPayment(input) {
        try {
            await this.adapter.callProviderMethod("deletePaymentSession", [input]);
            return {};
        }
        catch (error) {
            throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_ARGUMENT, `Failed to cancel payment: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async updatePayment(input) {
        try {
            const result = await this.adapter.callProviderMethod("updatePaymentSession", [input]);
            return result;
        }
        catch (error) {
            throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_ARGUMENT, `Failed to update payment: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async validateHook(input) {
        return true;
    }
    async getPaymentStatus(input) {
        try {
            const result = await this.adapter.callProviderMethod("getPaymentStatus", [input]);
            if (result?.status) {
                return {
                    status: result.status,
                };
            }
            return {
                status: utils_1.PaymentSessionStatus.PENDING,
            };
        }
        catch {
            return {
                status: utils_1.PaymentSessionStatus.PENDING,
            };
        }
    }
    async handleWebhook(payload) {
        try {
            const result = await this.adapter.callProviderMethod("handleWebhook", [payload]);
            return result;
        }
        catch (error) {
            if (this.logger?.error) {
                this.logger.error(`Webhook handling error: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
            return { success: false };
        }
    }
    async createPaymentSession(input) {
        try {
            const result = await this.adapter.callProviderMethod("createPaymentSession", [input]);
            return result;
        }
        catch (error) {
            throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_ARGUMENT, `Failed to create payment session: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async updatePaymentSession(input) {
        return this.updatePayment(input);
    }
    async retrievePaymentSession(input) {
        try {
            const result = await this.adapter.callProviderMethod("retrievePaymentSession", [input]);
            return result;
        }
        catch (error) {
            throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_ARGUMENT, `Failed to retrieve payment session: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async deletePaymentSession(input) {
        try {
            await this.adapter.callProviderMethod("deletePaymentSession", [input]);
        }
        catch (error) {
            throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_ARGUMENT, `Failed to delete payment session: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async initiatePayment(input) {
        try {
            const result = await this.adapter.callProviderMethod("initiatePayment", [input], async () => ({ id: input?.session_id || "razorpay_session", redirect_url: "", data: {} }));
            return {
                id: result?.id || input?.session_id || "razorpay_session",
                ...result,
            };
        }
        catch (error) {
            // initiatePayment may not be available, return minimal response
            return {
                id: input?.session_id || "razorpay_session",
                redirect_url: "",
                data: {},
            };
        }
    }
    async deletePayment(input) {
        return this.deletePaymentSession(input);
    }
    async retrievePayment(input) {
        return this.retrievePaymentSession(input);
    }
    async getWebhookActionAndData(input) {
        try {
            const payload = input.data ? JSON.parse(input.data) : input;
            const event = payload.event || "payment.unknown";
            // Map Razorpay events to PaymentActions
            const actionMap = {
                "payment.authorized": "authorized",
                "payment.captured": "captured",
                "payment.failed": "failed",
                "payment.refunded": "refunded",
                "order.paid": "captured",
            };
            const action = actionMap[event] || "authorized";
            return {
                action,
                data: payload,
            };
        }
        catch {
            return {
                action: "authorized",
                data: input,
            };
        }
    }
}
exports.RazorpayServiceWrapper = RazorpayServiceWrapper;
RazorpayServiceWrapper.identifier = "razorpay";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS13cmFwcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvcGF5bWVudC9wcm92aWRlcnMvcmF6b3JwYXktY29tcGF0aWJpbGl0eS9zZXJ2aWNlLXdyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7O0FBRUgsMkNBS3dCO0FBRXhCLHVDQUFtRDtBQUVuRDs7R0FFRztBQUNILE1BQWEsc0JBQXVCLFNBQVEsK0JBQXVCO0lBU2pFLFlBQVksU0FBYyxFQUFFLE9BQVk7UUFDdEMsS0FBSyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUV6QixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFBO1FBQ3pDLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFBO1FBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFBO1FBRXpCLElBQUksQ0FBQztZQUNILElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQTtZQUN4RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksaUNBQXVCLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7WUFFN0UsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFBO1lBQzNELENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztZQUNwQixNQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUUsT0FBTyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUMzQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7Z0JB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